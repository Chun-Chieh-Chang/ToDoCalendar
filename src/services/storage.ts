import { AppState, Task } from '../types';
import { supabase } from './supabase';
import { db } from './db';

const STORAGE_KEYS = {
  TASKS: 'todo_tasks',
  SETTINGS: 'todo_settings',
  SELECTED_DATE: 'todo_selected_date',
  FILTER: 'todo_filter'
};

export const storageService = {
  // --- Migration Logic ---
  async migrateFromLocalStorage(): Promise<void> {
    try {
      const tasksCount = await db.tasks.count();
      if (tasksCount > 0) return; // Already migrated or has data

      console.log('Migrating data from LocalStorage to IndexedDB (Dexie)...');
      const lsTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (lsTasks) {
        const parsed = JSON.parse(lsTasks);
        if (Array.isArray(parsed) && parsed.length > 0) {
          await db.tasks.bulkPut(parsed);
        }
      }

      const lsSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (lsSettings) await db.appData.put({ id: 'settings', data: JSON.parse(lsSettings) });

      const lsDate = localStorage.getItem(STORAGE_KEYS.SELECTED_DATE);
      if (lsDate) await db.appData.put({ id: 'selectedDate', data: lsDate });

      const lsFilter = localStorage.getItem(STORAGE_KEYS.FILTER);
      if (lsFilter) await db.appData.put({ id: 'filter', data: JSON.parse(lsFilter) });

      // Clean up localStorage after successful migration
      localStorage.removeItem(STORAGE_KEYS.TASKS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_DATE);
      localStorage.removeItem(STORAGE_KEYS.FILTER);
    } catch (e) {
      console.error('Migration from LocalStorage failed:', e);
    }
  },

  // --- IndexedDB Sync Logic ---
  async getLocalData() {
    const tasks = await db.tasks.toArray();
    const settingsObj = await db.appData.get('settings');
    const filterObj = await db.appData.get('filter');
    const dateObj = await db.appData.get('selectedDate');

    return {
      tasks: tasks || [],
      settings: settingsObj ? settingsObj.data : {},
      filter: filterObj ? filterObj.data : {},
      selectedDate: dateObj ? dateObj.data : null
    };
  },

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      await db.tasks.clear();
      await db.appData.clear();
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  },

  // Export/Import
  async exportData(): Promise<string> {
    const data = await this.getLocalData();
    const exportData = {
      ...data,
      version: '1.3.0',
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(exportData, null, 2);
  },

  async importData(jsonString: string): Promise<any> {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') throw new Error('Invalid format');
      
      await this.saveAllData({
        tasks: data.tasks,
        settings: data.settings,
        filter: data.filter,
        selectedDate: data.selectedDate
      });

      return data;
    } catch (error) {
      console.error('Import failed:', error);
      return null;
    }
  },

  // --- Main Sync Logic ---

  async loadAllData(): Promise<any> {
    await this.migrateFromLocalStorage();
    const localData = await this.getLocalData();

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
          await db.tasks.bulkPut(finalTasks);
        }

        let finalSettings = localData.settings;
        if (cloudSettings.data) {
          finalSettings = { ...localData.settings, ...cloudSettings.data };
          await db.appData.put({ id: 'settings', data: finalSettings });
        }

        return { ...localData, tasks: finalTasks, settings: finalSettings };
      } catch (error) {
        console.error('Cloud sync failed, using local:', error);
      }
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
    // 1. Always save to Dexie immediately
    try {
      if (data.tasks !== undefined) {
        // Replace all tasks for full sync or use bulkPut for merge
        // Since `data.tasks` represents the full state from Zustand, we overwrite
        await db.transaction('rw', db.tasks, async () => {
          await db.tasks.clear();
          await db.tasks.bulkAdd(data.tasks!);
        });
      }
      if (data.settings !== undefined) await db.appData.put({ id: 'settings', data: data.settings });
      if (data.filter !== undefined) await db.appData.put({ id: 'filter', data: data.filter });
      if (data.selectedDate !== undefined) await db.appData.put({ id: 'selectedDate', data: data.selectedDate });
    } catch (err) {
      console.error('Failed to save to IndexedDB', err);
    }

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
      const localData = await this.getLocalData();
      const fullData = {
        tasks: data.tasks || localData.tasks,
        settings: data.settings || localData.settings,
        filter: data.filter || localData.filter,
        selectedDate: data.selectedDate || localData.selectedDate
      };
      await (window as any).electronAPI.saveData(fullData);
    }
  }
};