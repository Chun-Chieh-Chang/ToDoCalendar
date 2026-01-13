import * as React from 'react';
import { AppState, Task } from '../types';
import { storageService } from '../services/storage';
import { defaultSettings, defaultFilter } from '../utils/defaults';
import { dateUtils } from '../utils/dateUtils';
import { useTranslation } from '../utils/i18n';

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
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
            : task
        )
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
  dispatch: React.Dispatch<AppAction>;
  t: (key: string) => string;
}

// 創建一個默認的context值，避免TypeScript錯誤
const defaultContextValue: AppContextType = {
  state: initialState,
  dispatch: () => { },
  t: (key: string) => key
};

const AppContext = (React as any).createContext(defaultContextValue);

// Provider
interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = (React as any).useReducer(appReducer, initialState);
  const t = useTranslation(state.settings.language);

  // Load data from localStorage on mount
  (React as any).useEffect(() => {
    const savedTasks = storageService.getTasks();
    const savedSettings = storageService.getSettings();
    const savedSelectedDate = storageService.getSelectedDate();
    const savedFilter = storageService.getFilter();

    if (savedTasks.length > 0) {
      dispatch({ type: 'SET_TASKS', payload: savedTasks });
    } else {
      // 添加示例數據
      const sampleTasks = [
        {
          id: '1',
          title: '完成項目報告',
          description: '準備下週的項目進度報告',
          date: dateUtils.dateToString(new Date()),
          priority: 'high' as const,
          category: 'work' as const,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notes: '需要包含Q1數據分析'
        },
        {
          id: '2',
          title: '學習React Hooks',
          description: '深入理解useContext和useReducer',
          date: dateUtils.dateToString(new Date()),
          priority: 'medium' as const,
          category: 'study' as const,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notes: '觀看官方文檔和教程'
        },
        {
          id: '3',
          title: '購買生活用品',
          description: '超市購物清單',
          date: dateUtils.dateToString(new Date()),
          priority: 'low' as const,
          category: 'life' as const,
          completed: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notes: '牛奶、麵包、雞蛋'
        }
      ];
      dispatch({ type: 'SET_TASKS', payload: sampleTasks });
      storageService.saveTasks(sampleTasks);
    }

    if (Object.keys(savedSettings).length > 0) {
      dispatch({ type: 'SET_SETTINGS', payload: savedSettings });
    } else {
      dispatch({ type: 'SET_SETTINGS', payload: defaultSettings });
      storageService.saveSettings(defaultSettings);
    }

    if (savedSelectedDate) {
      dispatch({ type: 'SET_SELECTED_DATE', payload: savedSelectedDate });
    }

    if (Object.keys(savedFilter).length > 0) {
      dispatch({ type: 'SET_FILTER', payload: savedFilter });
    } else {
      dispatch({ type: 'SET_FILTER', payload: defaultFilter });
      storageService.saveFilter(defaultFilter);
    }
  }, []);

  // Save to localStorage when state changes
  (React as any).useEffect(() => {
    storageService.saveTasks(state.tasks);
  }, [state.tasks]);

  (React as any).useEffect(() => {
    storageService.saveSelectedDate(state.selectedDate);
  }, [state.selectedDate]);

  (React as any).useEffect(() => {
    storageService.saveFilter(state.filter);
  }, [state.filter]);

  (React as any).useEffect(() => {
    storageService.saveSettings(state.settings);
  }, [state.settings]);

  const value = { state, dispatch, t };

  return (React as any).createElement(
    AppContext.Provider,
    { value },
    children
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