import { Task, Priority } from './task';
import { SettingsState } from './settings';

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
