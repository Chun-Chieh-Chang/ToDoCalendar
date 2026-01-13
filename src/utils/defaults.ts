import { SettingsState, FilterState } from '../types';

export const defaultSettings: SettingsState = {
  theme: 'light',
  language: 'zh-TW',
  dateFormat: 'YYYY-MM-DD',
  defaultPriority: 'medium',
  itemsPerPage: 10,
  userName: '',
  userAvatar: ''
};

export const defaultFilter: FilterState = {
  priority: undefined,
  category: undefined,
  status: 'all',
  search: ''
};