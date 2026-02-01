import { SettingsState, FilterState } from '../types';

export const defaultSettings: SettingsState = {
  theme: 'light',
  language: 'zh-TW',
  dateFormat: 'YYYY-MM-DD',
  defaultPriority: 'medium',
  itemsPerPage: 10,
  userName: '',
  userAvatar: '',
  categories: [
    { id: 'work', name: '工作', color: '#3B82F6' },
    { id: 'study', name: '學習', color: '#10B981' },
    { id: 'life', name: '生活', color: '#F59E0B' },
    { id: 'other', name: '其他', color: '#6D28D9' }
  ]
};

export const defaultFilter: FilterState = {
  priority: undefined,
  category: undefined,
  status: 'all',
  search: ''
};