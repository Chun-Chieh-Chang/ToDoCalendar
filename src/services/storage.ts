import { AppState, Task } from '../types';
import { supabase } from './supabase';

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

  // Export/Import (Keep for manual backup)
  exportData(): string {
    const data = {
      tasks: this.getTasks(),
      settings: this.getSettings(),
      selectedDate: this.getSelectedDate(),
      filter: this.getFilter(),
      version: '1.3.0',
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  },

  importData(jsonString: string): any {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') throw new Error('Invalid format');
      
      if (data.tasks) this.saveTasks(data.tasks);
      if (data.settings) this.saveSettings(data.settings);
      if (data.selectedDate) this.saveSelectedDate(data.selectedDate);
      if (data.filter) this.saveFilter(data.filter);

      return data;
    } catch (error) {
      console.error('Import failed:', error);
      return null;
    }
  },

  // --- Cloud Sync Logic (Supabase) ---

  async loadAllData(): Promise<any> {
    const localData = {
      tasks: this.getTasks(),
      settings: this.getSettings(),
      filter: this.getFilter(),
      selectedDate: this.getSelectedDate()
    };

    // Check if user is logged in AND is the authorized admin
    if (!supabase) return localData;

    const { data: { session } } = await supabase.auth.getSession();
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    
    if (session?.user && session.user.email === adminEmail) {
      try {
        console.log('Admin detected. Syncing with Cloud...');
        
        // Parallel fetch from Cloud
        const [cloudTasks, cloudSettings] = await Promise.all([
          supabase.from('tasks').select('*').eq('user_id', session.user.id),
          supabase.from('user_settings').select('*').eq('user_id', session.user.id).single()
        ]);

        // Merge Logic: Cloud wins if newer, or if local is empty
        let finalTasks = localData.tasks;
        if (cloudTasks.data && cloudTasks.data.length > 0) {
          const cloudMap = new Map(cloudTasks.data.map(t => [t.id, t]));
          const localMap = new Map(localData.tasks.map(t => [t.id, t]));
          
          cloudMap.forEach((task, id) => localMap.set(id, task));
          finalTasks = Array.from(localMap.values());
          this.saveTasks(finalTasks);
        }

        let finalSettings = localData.settings;
        if (cloudSettings.data) {
          finalSettings = { ...localData.settings, ...cloudSettings.data };
          this.saveSettings(finalSettings as any);
        }

        return { ...localData, tasks: finalTasks, settings: finalSettings };
      } catch (error) {
        console.error('Cloud sync failed, using local:', error);
      }
    } else if (session?.user) {
      console.warn('Authorized Admin only. Cloud sync disabled for this account.');
    }

    // Fallback for Electron
    const isElectron = typeof (window as any).electronAPI !== 'undefined';
    if (isElectron) {
      const result = await (window as any).electronAPI.loadData();
      if (result.success && result.data) return result.data;
    }

    return localData;
  },

  async saveAllData(data: { tasks?: Task[], settings?: any, filter?: any, selectedDate?: string }): Promise<void> {
    // 1. Always save to localStorage immediately
    if (data.tasks !== undefined) this.saveTasks(data.tasks);
    if (data.settings !== undefined) this.saveSettings(data.settings);
    if (data.filter !== undefined) this.saveFilter(data.filter);
    if (data.selectedDate !== undefined) this.saveSelectedDate(data.selectedDate);

    // 2. Async Sync to Cloud (ADMIN ONLY)
    if (!supabase) return;

    const { data: { session } } = await supabase.auth.getSession();
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

    if (session?.user && session.user.email === adminEmail) {
      const userId = session.user.id;
      
      try {
        if (data.tasks) {
          const tasksToUpsert = data.tasks.map(t => ({ ...t, user_id: userId }));
          await supabase.from('tasks').upsert(tasksToUpsert);
        }

        if (data.settings) {
          await supabase.from('user_settings').upsert({
            user_id: userId,
            theme: data.settings.theme,
            language: data.settings.language,
            user_name: data.settings.userName,
            categories: data.settings.categories
          });
        }
      } catch (error) {
        console.error('Cloud push failed:', error);
      }
    }

    // 3. Sync to File System (Electron only)
    const isElectron = typeof (window as any).electronAPI !== 'undefined';
    if (isElectron) {
      const fullData = {
        tasks: data.tasks || this.getTasks(),
        settings: data.settings || this.getSettings(),
        filter: data.filter || this.getFilter(),
        selectedDate: data.selectedDate || this.getSelectedDate()
      };
      await (window as any).electronAPI.saveData(fullData);
    }
  }
};