import { Priority, TaskStatus, RecurrenceType } from './task';

export interface CategoryConfig {
    id: string;
    name: string;
    color: string;
    icon?: string;
}

export interface SettingsState {
    theme: 'light' | 'dark';
    language: 'zh-TW' | 'en';
    dateFormat: 'yyyy-MM-dd' | 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
    defaultPriority: Priority;
    itemsPerPage: number;
    userName?: string;
    userAvatar?: string;
    categories: CategoryConfig[];
}
