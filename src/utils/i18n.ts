// 國際化語言檔案
export const translations = {
  'zh-TW': {
    // 應用標題
    appTitle: 'ToDoCalendar',
    appSubtitle: '月曆任務管理',

    // 工具列
    today: '今天',
    backlog: '待辦清單',
    settings: '設定',

    // 月曆
    months: [
      '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'
    ],
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],

    // 日期
    selectedDate: '選擇日期：',

    // 任務管理
    addTask: '新增任務',
    addDailyTask: '新增當日任務',
    addBacklogTask: '新增待辦',
    editTask: '編輯任務',
    deleteTask: '刪除任務',
    completeTask: '完成任務',

    // 任務表單
    taskTitle: '任務標題',
    taskDescription: '任務描述',
    taskDate: '日期',
    taskTime: '時間',
    taskPriority: '優先級',
    taskCategory: '分類',
    taskNotes: '備註',

    // 優先級
    high: '高',
    medium: '中',
    low: '低',

    // 分類
    work: '工作',
    study: '學習',
    life: '生活',
    other: '其他',

    // 狀態
    all: '全部',
    completed: '已完成',
    pending: '待完成',

    // 設定
    settingsTitle: '設定',
    interfaceSettings: '介面設定',
    theme: '主題',
    language: '語言',
    dateFormat: '日期格式',
    taskSettings: '任務設定',
    defaultPriority: '預設優先級',
    itemsPerPage: '每頁顯示任務數量',
    dataManagement: '數據管理',
    exportData: '匯出數據 (JSON)',
    importData: '匯入數據 (JSON)',

    // 主題
    lightTheme: '淺色主題',
    darkTheme: '深色主題',

    // 語言
    traditionalChinese: '中文（繁體）',
    english: 'English',

    // 按鈕
    save: '儲存',
    cancel: '取消',
    close: '關閉',
    confirm: '確認',

    // 提示
    hint: '提示：雙擊日期可查看該日任務詳情',
    noTasks: '暫無任務',

    // 提醒
    reminderTitle: '任務提醒',
    reminderComplete: '完成任務',
    reminderClose: '稍後提醒',

    // 過濾
    search: '搜尋',
    filter: '過濾',
    clearFilter: '清除過濾',

    // 待辦清單
    backlogTitle: '待辦事項清單',
    noBacklogTasks: '暫無待辦事項',

    // 其他
    developer: 'Developed by Wesley Chang, 2025.',
    items: '項',
    kanban: '看板視圖',
    todo: '待處理',
    inProgress: '進行中',
    done: '已完成'
  },

  'en': {
    // App title
    appTitle: 'ToDoCalendar',
    appSubtitle: 'Calendar Task Manager',

    // Toolbar
    today: 'Today',
    backlog: 'Backlog',
    settings: 'Settings',

    // Calendar
    months: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

    // Date
    selectedDate: 'Selected Date:',

    // Task management
    addTask: 'Add Task',
    addDailyTask: 'Add Daily Task',
    addBacklogTask: 'Add Backlog',
    editTask: 'Edit Task',
    deleteTask: 'Delete Task',
    completeTask: 'Complete Task',

    // Task form
    taskTitle: 'Task Title',
    taskDescription: 'Task Description',
    taskDate: 'Date',
    taskTime: 'Time',
    taskPriority: 'Priority',
    taskCategory: 'Category',
    taskNotes: 'Notes',

    // Priority
    high: 'High',
    medium: 'Medium',
    low: 'Low',

    // Category
    work: 'Work',
    study: 'Study',
    life: 'Life',
    other: 'Other',

    // Status
    all: 'All',
    completed: 'Completed',
    pending: 'Pending',

    // Settings
    settingsTitle: 'Settings',
    interfaceSettings: 'Interface Settings',
    theme: 'Theme',
    language: 'Language',
    dateFormat: 'Date Format',
    taskSettings: 'Task Settings',
    defaultPriority: 'Default Priority',
    itemsPerPage: 'Items Per Page',
    dataManagement: 'Data Management',
    exportData: 'Export Data (JSON)',
    importData: 'Import Data (JSON)',

    // Theme
    lightTheme: 'Light Theme',
    darkTheme: 'Dark Theme',

    // Language
    traditionalChinese: '中文（繁體）',
    english: 'English',

    // Buttons
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    confirm: 'Confirm',

    // Hints
    hint: 'Tip: Double-click on a date to view tasks for that day',
    noTasks: 'No tasks',

    // Reminder
    reminderTitle: 'Task Reminder',
    reminderComplete: 'Complete Task',
    reminderClose: 'Remind Later',

    // Filter
    search: 'Search',
    filter: 'Filter',
    clearFilter: 'Clear Filter',

    // Backlog
    backlogTitle: 'Backlog Tasks',
    noBacklogTasks: 'No backlog tasks',

    // Others
    developer: 'Developed by Wesley Chang, 2025.',
    items: 'items',
    kanban: 'Kanban View',
    todo: 'To Do',
    inProgress: 'In Progress',
    done: 'Done'
  }
};

// 獲取翻譯文字的函數
export const getTranslation = (language: 'zh-TW' | 'en', key: string): string => {
  const keys = key.split('.');
  let value: any = translations[language];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // 如果找不到翻譯，回退到中文
      value = translations['zh-TW'];
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // 如果連中文都找不到，返回原始key
        }
      }
      break;
    }
  }

  return typeof value === 'string' ? value : key;
};

// 創建一個hook來使用翻譯
export const useTranslation = (language: 'zh-TW' | 'en') => {
  return (key: string) => getTranslation(language, key);
};