import Dexie, { Table } from 'dexie';
import { Task, AppState } from '../types';

export class AppDatabase extends Dexie {
  tasks!: Table<Task, string>; // Primary key is 'id' of type string
  appData!: Table<{ id: string; data: any }, string>;

  constructor() {
    super('ToDoCalendarDB');
    this.version(1).stores({
      tasks: 'id, parentId, date, status, category, completed', // Indexes for quick querying
      appData: 'id' // For settings, filter, selectedDate
    });
  }
}

export const db = new AppDatabase();
