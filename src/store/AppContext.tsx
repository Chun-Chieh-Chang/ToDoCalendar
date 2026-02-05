import React from 'react';
import { AppState, Task } from '../types';
import { storageService } from '../services/storage';
import { defaultSettings, defaultFilter } from '../constants/defaults';
import { dateUtils } from '../utils/dateUtils';
import { useTranslation } from '../utils/i18n';

// Helpers for broken types in environment
type Dispatch<A> = (value: A) => void;
type ReactNode = any;

// Action types
type AppAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK_COMPLETION'; payload: string }
  | { type: 'SET_SELECTED_DATE'; payload: string }
  | { type: 'SET_FILTER'; payload: Partial<AppState['filter']> }
  | { type: 'SET_SETTINGS'; payload: Partial<AppState['settings']> }
  | { type: 'REORDER_TASKS'; payload: Task[] }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: AppState = {
  tasks: [],
  selectedDate: dateUtils.dateToString(new Date()),
  filter: { ...defaultFilter },
  settings: { ...defaultSettings }
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };

    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload]
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        )
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };

    case 'TOGGLE_TASK_COMPLETION':
      const taskToToggle = state.tasks.find(t => t.id === action.payload);
      if (!taskToToggle) return state;

      const newCompletedStatus = !taskToToggle.completed;
      const updatedTaskList = state.tasks.map(task =>
        task.id === action.payload
          ? { ...task, completed: newCompletedStatus, updatedAt: new Date().toISOString() }
          : task
      );

      // Handle Recurrence spawning
      if (newCompletedStatus && taskToToggle.recurrence && taskToToggle.recurrence !== 'none' && taskToToggle.date) {
        const currentDate = new Date(taskToToggle.date);
        let nextDate = new Date(currentDate);

        if (taskToToggle.recurrence === 'daily') {
          nextDate.setDate(currentDate.getDate() + 1);
        } else if (taskToToggle.recurrence === 'weekly') {
          nextDate.setDate(currentDate.getDate() + 7);
        } else if (taskToToggle.recurrence === 'monthly') {
          nextDate.setMonth(currentDate.getMonth() + 1);
        }

        const nextTask: Task = {
          ...taskToToggle,
          id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          date: nextDate.toISOString().split('T')[0],
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          parentId: taskToToggle.parentId || taskToToggle.id,
          recurrence: taskToToggle.recurrence // Keep the recurrence for the next one too
        };

        updatedTaskList.push(nextTask);
      }

      return {
        ...state,
        tasks: updatedTaskList
      };

    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };

    case 'SET_FILTER':
      return {
        ...state,
        filter: { ...state.filter, ...action.payload }
      };

    case 'SET_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };

    case 'REORDER_TASKS':
      // Update the entire task list or just the affected ones
      // Since payload is the new list for a specific group, we merge it
      const updatedTaskMap = new Map(state.tasks.map(t => [t.id, t]));
      action.payload.forEach(task => updatedTaskMap.set(task.id, task));
      return {
        ...state,
        tasks: Array.from(updatedTaskMap.values())
      };

    case 'RESET_STATE':
      return {
        ...initialState,
        settings: state.settings
      };

    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  t: (key: string) => string;
  isLoaded: boolean;
}

// 創建一個默認的context值，避免TypeScript錯誤
const defaultContextValue: AppContextType = {
  state: initialState,
  dispatch: () => { },
  t: (key: string) => key,
  isLoaded: false
};

const AppContext = (React as any).createContext(defaultContextValue);

// Provider
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = (React as any).useReducer(appReducer, initialState);
  const t = useTranslation(state.settings.language);

  const [isLoaded, setIsLoaded] = (React as any).useState(false);

  // Load data from storage (FileSystem or LocalStorage) on mount
  (React as any).useEffect(() => {
    const loadData = async () => {
      const savedData = await storageService.loadAllData();

      const savedTasks = savedData.tasks || [];
      const savedSettings = savedData.settings || {};
      const savedSelectedDate = savedData.selectedDate;
      const savedFilter = savedData.filter || {};

      // 判斷是否為「全新啟動」：既沒有任務也沒有任何設定紀錄
      const isActuallyNewStart = savedTasks.length === 0 && Object.keys(savedSettings).length === 0;

      if (savedTasks.length > 0) {
        dispatch({ type: 'SET_TASKS', payload: savedTasks });
      } else if (isActuallyNewStart) {
        // 只有在全新啟動時才注入歡迎範例
        const sampleTasks = [
          {
            id: '1',
            title: '✨ 歡迎使用 ToDoCalendar',
            description: '您的所有紀錄都會自動儲存在本地電腦中。您可以點擊左側導覽列開始規劃任務。',
            date: dateUtils.dateToString(new Date()),
            priority: 'high' as const,
            category: 'work' as const,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            notes: '您可以點擊右側的鉛筆圖示編輯此地標。'
          }
        ];
        dispatch({ type: 'SET_TASKS', payload: sampleTasks });
      }

      if (Object.keys(savedSettings).length > 0) {
        dispatch({ type: 'SET_SETTINGS', payload: { ...defaultSettings, ...savedSettings } });
      } else {
        dispatch({ type: 'SET_SETTINGS', payload: defaultSettings });
      }

      if (savedSelectedDate) {
        dispatch({ type: 'SET_SELECTED_DATE', payload: savedSelectedDate });
      }

      if (Object.keys(savedFilter).length > 0) {
        dispatch({ type: 'SET_FILTER', payload: savedFilter });
      } else {
        dispatch({ type: 'SET_FILTER', payload: defaultFilter });
      }

      setIsLoaded(true);
    };

    loadData();
  }, []);

  // Save to storage when state changes
  // Only save if data has been fully loaded to avoid overwriting with initial empty state
  (React as any).useEffect(() => {
    if (isLoaded) {
      const persistData = async () => {
        try {
          await storageService.saveAllData({
            tasks: state.tasks,
            settings: state.settings,
            filter: state.filter,
            selectedDate: state.selectedDate
          });
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      };
      persistData();
    }
  }, [state, isLoaded]);

  const value = { state, dispatch, t, isLoaded };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useAppContext(): AppContextType {
  const context = (React as any).useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context as AppContextType;
}