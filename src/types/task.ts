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
