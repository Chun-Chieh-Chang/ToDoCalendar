export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Subtask {
    id: string;
    title: string;
    completed: boolean;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    date?: string;
    time?: string;
    priority: Priority;
    category: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
    notes?: string;
    subtasks?: Subtask[];
    status?: TaskStatus;
    order?: number;
    recurrence?: RecurrenceType;
    parentId?: string;
}

export interface CategoryConfig {
    id: string;
    name: string;
    color: string;
    icon?: string;
}

export interface SettingsState {
    theme: 'light' | 'dark' | 'system';
    language: 'zh-TW' | 'en';
    dateFormat: 'yyyy-MM-dd' | 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
    defaultPriority: Priority;
    itemsPerPage: number;
    userName?: string;
    userAvatar?: string;
    deviceId?: string;
    categories: CategoryConfig[];
}

export type Status = 'all' | 'completed' | 'pending';

export interface FilterState {
    priority?: Priority;
    category?: string;
    status?: Status;
    search?: string;
}

export interface AppState {
    tasks: Task[];
    selectedDate: string;
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