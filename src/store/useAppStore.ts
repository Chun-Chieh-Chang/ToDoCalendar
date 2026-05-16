import { create } from 'zustand';
import { AppState, Task } from '../types';
import { defaultSettings, defaultFilter } from '../constants/defaults';
import { dateUtils } from '../shared/utils/dateUtils';
import { storageService } from '../services/storage';
import { getTranslation } from '../utils/i18n';

interface AppStore extends AppState {
  isLoaded: boolean;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  setSelectedDate: (date: string) => void;
  setFilter: (filter: Partial<AppState['filter']>) => void;
  setSettings: (settings: Partial<AppState['settings']>) => void;
  reorderTasks: (tasks: Task[]) => void;
  resetState: () => void;
  loadData: () => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  tasks: [],
  selectedDate: dateUtils.dateToString(new Date()),
  filter: { ...defaultFilter },
  settings: { ...defaultSettings },
  isLoaded: false,

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),

  updateTask: (task) => set((state) => ({
    tasks: state.tasks.map(t => t.id === task.id ? task : t)
  })),

  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),

  toggleTaskCompletion: (id) => set((state) => {
    const taskToToggle = state.tasks.find(t => t.id === id);
    if (!taskToToggle) return state;

    const newCompletedStatus = !taskToToggle.completed;
    const updatedTaskList = state.tasks.map(task =>
      task.id === id
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
        recurrence: taskToToggle.recurrence
      };

      updatedTaskList.push(nextTask);
    }

    return { tasks: updatedTaskList };
  }),

  setSelectedDate: (date) => set({ selectedDate: date }),

  setFilter: (filterUpdate) => set((state) => ({
    filter: { ...state.filter, ...filterUpdate }
  })),

  setSettings: (settingsUpdate) => set((state) => ({
    settings: { ...state.settings, ...settingsUpdate }
  })),

  reorderTasks: (updatedTasks) => set((state) => {
    const updatedTaskMap = new Map(state.tasks.map(t => [t.id, t]));
    updatedTasks.forEach(task => updatedTaskMap.set(task.id, task));
    return { tasks: Array.from(updatedTaskMap.values()) };
  }),

  resetState: () => set((state) => ({
    tasks: [],
    selectedDate: dateUtils.dateToString(new Date()),
    filter: { ...defaultFilter },
    settings: state.settings // Keep settings
  })),

  loadData: async () => {
    try {
      const savedData = await storageService.loadAllData();
      const savedTasks = savedData.tasks || [];
      const savedSettings = savedData.settings || {};
      const savedSelectedDate = savedData.selectedDate;
      const savedFilter = savedData.filter || {};

      const isActuallyNewStart = savedTasks.length === 0 && Object.keys(savedSettings).length === 0;

      let newTasks = savedTasks;
      if (isActuallyNewStart) {
        const lang = savedSettings.language || 'zh-TW';
        newTasks = [{
          id: '1',
          title: getTranslation(lang, 'welcomeTaskTitle'),
          description: getTranslation(lang, 'welcomeTaskDesc'),
          date: dateUtils.dateToString(new Date()),
          priority: 'high',
          category: 'work',
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notes: getTranslation(lang, 'welcomeTaskNotes')
        }];
      }

      let newSettings = { ...defaultSettings };
      if (Object.keys(savedSettings).length > 0) {
        const migratedSettings = { ...savedSettings };
        if (migratedSettings.categories && Array.isArray(migratedSettings.categories) && migratedSettings.theme === 'dark') {
          migratedSettings.categories = migratedSettings.categories.map((category: any) => {
            if (category.id === 'work' && (category.color === '#3B82F6' || category.color === '#FEF3C7')) {
              return { ...category, color: '#60A5FA' };
            }
            return category;
          });
        }
        newSettings = { ...defaultSettings, ...migratedSettings };
      }

      set({
        tasks: newTasks,
        settings: newSettings,
        selectedDate: savedSelectedDate || dateUtils.dateToString(new Date()),
        filter: Object.keys(savedFilter).length > 0 ? savedFilter : defaultFilter,
        isLoaded: true
      });
    } catch (e) {
      console.error('Error loading data', e);
      set({ isLoaded: true });
    }
  }
}));

// Subscribe to store changes to save automatically
useAppStore.subscribe((state, prevState) => {
  if (state.isLoaded) {
    // Basic optimization: only save if tasks, settings, filter, or selectedDate changed
    if (state.tasks !== prevState.tasks || state.settings !== prevState.settings || state.filter !== prevState.filter || state.selectedDate !== prevState.selectedDate) {
      storageService.saveAllData({
        tasks: state.tasks,
        settings: state.settings,
        filter: state.filter,
        selectedDate: state.selectedDate
      }).catch(err => console.error('Auto-save failed:', err));
    }
  }
});
