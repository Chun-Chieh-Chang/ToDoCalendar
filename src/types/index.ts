export type Priority = 'high' | 'medium' | 'low';
export type Category = 'work' | 'study' | 'life' | 'other';
export type Status = 'all' | 'completed' | 'pending';

export interface Task {
  id: string;
  title: string;
  description: string;
  date?: string; // YYYY-MM-DD format (optional for pending tasks)
  time?: string; // HH:mm format
  priority: Priority;
  category: Category;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface FilterState {
  priority?: Priority;
  category?: Category;
  status?: Status;
  search?: string;
}

export interface SettingsState {
  theme: 'light' | 'dark';
  language: 'zh-TW' | 'en';
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
  defaultPriority: Priority;
  itemsPerPage: number;
  userName?: string;
  userAvatar?: string;
}

export interface AppState {
  tasks: Task[];
  selectedDate: string; // YYYY-MM-DD format
  filter: FilterState;
  settings: SettingsState;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasTasks: boolean;
  taskCount: number;
}