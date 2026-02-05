import { AppState, Task } from '../types';

const STORAGE_KEYS = {
  TASKS: 'todo_tasks',
  SETTINGS: 'todo_settings',
  SELECTED_DATE: 'todo_selected_date',
  FILTER: 'todo_filter'
};

export const storageService = {
  // Tasks
  getTasks(): Task[] {
    try {
      const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.error('Failed to load tasks:', error);
      return [];
    }
  },

  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  },

  // Settings
  getSettings(): Partial<AppState['settings']> {
    try {
      const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.error('Failed to load settings:', error);
      return {};
    }
  },

  saveSettings(settings: AppState['settings']): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },

  // Selected Date
  getSelectedDate(): string | null {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_DATE);
  },

  saveSelectedDate(date: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_DATE, date);
    } catch (error) {
      console.error('Failed to save selected date:', error);
    }
  },

  // Filter
  getFilter(): Partial<AppState['filter']> {
    try {
      const filter = localStorage.getItem(STORAGE_KEYS.FILTER);
      return filter ? JSON.parse(filter) : {};
    } catch (error) {
      console.error('Failed to load filter:', error);
      return {};
    }
  },

  saveFilter(filter: AppState['filter']): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FILTER, JSON.stringify(filter));
    } catch (error) {
      console.error('Failed to save filter:', error);
    }
  },

  // Clear all data
  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.TASKS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_DATE);
      localStorage.removeItem(STORAGE_KEYS.FILTER);
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  },

  // Export Data
  exportData(): string {
    const data = {
      tasks: this.getTasks(),
      settings: this.getSettings(),
      selectedDate: this.getSelectedDate(),
      filter: this.getFilter(),
      version: '1.1.0',
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  },

  // Import Data
  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);

      // Basic validation
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format');
      }

      // Validate tasks structure
      if (data.tasks && Array.isArray(data.tasks)) {
        const validTasks = data.tasks.filter((task: any) =>
          task && typeof task === 'object' && task.id && task.title
        );
        if (validTasks.length !== data.tasks.length) {
          console.warn('Some tasks were invalid and skipped during import');
        }
        this.saveTasks(validTasks);
      }

      if (data.settings) this.saveSettings(data.settings);
      if (data.selectedDate) this.saveSelectedDate(data.selectedDate);
      if (data.filter) this.saveFilter(data.filter);

      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  },

  // Async Persistence for Electron
  async loadAllData(): Promise<any> {
    const isElectron = typeof (window as any).electronAPI !== 'undefined';

    if (isElectron) {
      try {
        const result = await (window as any).electronAPI.loadData();
        if (result.success && result.data) {
          console.log('Loaded data from file system');
          // Sync to localStorage
          if (result.data.tasks) this.saveTasks(result.data.tasks);
          if (result.data.settings) this.saveSettings(result.data.settings);
          if (result.data.filter) this.saveFilter(result.data.filter);
          if (result.data.selectedDate) this.saveSelectedDate(result.data.selectedDate);

          return result.data;
        }
      } catch (error) {
        console.error('Error loading from file system:', error);
      }
    }

    // Fallback to localStorage
    return {
      tasks: this.getTasks(),
      settings: this.getSettings(),
      filter: this.getFilter(),
      selectedDate: this.getSelectedDate()
    };
  },

  async saveAllData(data: { tasks?: Task[], settings?: any, filter?: any, selectedDate?: string }): Promise<void> {
    // 1. Save to localStorage (Sync) - Always do this first as a reliable backup
    if (data.tasks !== undefined) this.saveTasks(data.tasks);
    if (data.settings !== undefined) this.saveSettings(data.settings);
    if (data.filter !== undefined) this.saveFilter(data.filter);
    if (data.selectedDate !== undefined) this.saveSelectedDate(data.selectedDate);

    // 2. Save to File System (Async, Electron only)
    const isElectron = typeof (window as any).electronAPI !== 'undefined';
    if (isElectron) {
      try {
        // Use provided data or fall back to what's currently in localStorage to ensure all data is persisted
        const fullData = {
          tasks: data.tasks !== undefined ? data.tasks : this.getTasks(),
          settings: data.settings !== undefined ? data.settings : this.getSettings(),
          filter: data.filter !== undefined ? data.filter : this.getFilter(),
          selectedDate: data.selectedDate !== undefined ? data.selectedDate : this.getSelectedDate()
        };
        const result = await (window as any).electronAPI.saveData(fullData);
        if (!result.success) {
          console.error('Electron save failed:', result.error);
        }
      } catch (error) {
        console.error('Error saving to file system:', error);
      }
    }
  }
};