export type Priority = 'high' | 'medium' | 'low';
export type Status = 'all' | 'completed' | 'pending';

export interface CategoryConfig {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  description: string;
  date?: string; // YYYY-MM-DD format (optional for pending tasks)
  time?: string; // HH:mm format
  priority: Priority;
  category: string; // Changed from Category union to string for customization
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  subtasks?: Subtask[];
  status?: TaskStatus;
  order?: number;
  // Recurring Task Properties
  recurrence?: RecurrenceType;
  parentId?: string; // If this is an instance of a recurring task
}

export interface FilterState {
  priority?: Priority;
  category?: string;
  status?: Status;
  search?: string;
}

export interface SettingsState {
  theme: 'light' | 'dark';
  language: 'zh-TW' | 'en';
  dateFormat: 'yyyy-MM-dd' | 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY'; // Support both new and legacy formats for type safety
  defaultPriority: Priority;
  itemsPerPage: number;
  userName?: string;
  userAvatar?: string;
  categories: CategoryConfig[]; // Custom categories store here
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