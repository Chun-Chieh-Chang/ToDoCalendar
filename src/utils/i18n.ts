// 國際化語言檔案 - Last Updated: 2026-03-20T03:00:00Z
export const translations = {
  'zh-TW': {
    // 應用標題
    appTitle: 'ToDoCalendar',
    appSubtitle: '月曆任務管理',

    // 工具列
    today: '今天',
    backlog: '待辦清單',
    settings: '設定',
    guide: '使用說明',
    myTasks: '我的任務',
    calendarView: '月曆視圖',
    pendingList: '待辦清單',
    scheduledList: '已排程清單',
    kanbanBoard: '看板管理',
    insights: '數據洞察',
    
    // Tooltips
    guideTooltip: '了解工具的核心功能與頁面關聯',
    myTasksTooltip: '查看系統中的所有任務 (包含待辦與已排程)',
    calendarViewTooltip: '顯示月曆主視圖，查看整體排程與每日任務分布',
    pendingListTooltip: '查看尚未排入日程的待辦事項，可隨時安排執行時間',
    scheduledListTooltip: '查看所有已規劃的任務日程表',
    kanbanBoardTooltip: '透過看板管理任務進度，支援拖拉更換狀態',
    insightsTooltip: '了解任務完成趨勢與分配情況',
    exitTooltip: '安全離開系統並提醒備份數據',

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

    // 主題
    lightTheme: '淺色主題',
    darkTheme: '深色主題',
    systemTheme: '跟隨系統',

    // 語言
    traditionalChinese: '中文（繁體）',
    english: 'English',

    // 按鈕
    save: '儲存',
    cancel: '取消',
    close: '關閉',
    confirm: '確認',
    saveAndClose: '儲存並關閉',

    // 提示與提醒
    hint: '提示：雙擊日期可查看該日任務詳情',
    noTasks: '暫無任務',
    tasksOnThisDay: '此日有 {count} 個任務',
    doubleClickToView: '雙擊查看詳情',
    doubleClickToTaskList: '雙擊查看任務列表',
    reminderTitle: '任務提醒',
    reminderComplete: '完成任務',
    reminderClose: '稍後提醒',

    // 過濾與搜尋
    search: '搜尋',
    filter: '過濾',
    clearFilter: '清除過濾',

    // 待辦清單
    backlogTitle: '待辦事項清單',
    noBacklogTasks: '暫無待辦事項',

    // 資料管理
    dataManagement: '數據管理',
    dataManagementDesc: '管理您的任務數據、備份與儲存路徑',
    dataPathManagement: '儲存路徑管理',
    dataPathDesc: '自定義您的數據檔案儲存位置，方便雲端同步或手動備份。',
    pathLoading: '正在讀取...',
    changePath: '更換存儲目錄',
    dataPathUpdated: '儲存路徑已更新！新路徑將於下次存檔時生效。',
    dataPathUpdateFailed: '更換失敗',
    webStorageHintTitle: '網頁版儲存說明',
    webStorageHintDesc: '您目前使用的是網頁版，資料安全地儲存在瀏覽器的 LocalStorage 中。若需跨設備同步，建議定期執行「匯出數據」。',
    backupNow: '立即備份數據',
    restoreNow: '還原備份檔案',
    exportData: '匯出數據 (JSON)',
    importData: '匯入數據 (JSON)',
    exportSuccess: '數據已成功匯出至',
    importConfirm: '匯入數據將會覆蓋目前的任務與設定，確定要繼續嗎？',
    importSuccess: '匯入成功！頁面將重新載入以應用變更。',
    importFailed: '匯入失敗，請檢查檔案格式。',

    // 設定、側邊欄與頁尾
    settingsTitle: '設定',
    interfaceSettings: '介面設定',
    taskSettings: '任務設定',
    defaultPriority: '預設優先級',
    itemsPerPage: '每頁顯示任務數量',
    themeLabel: '主題模式',
    languageLabel: '顯示語言',
    dateFormatLabel: '日期顯示格式',
    versionInfo: '版本: {version} | ToDoCalendar Desktop',
    deviceIdLabel: '裝置 ID',
    userNameLabel: '使用者名稱',
    systemAdmin: '系統管理員',
    enterDisplayName: '輸入顯示名稱',
    userProfile: '使用者個人資料',
    systemSettings: '系統設定',
    settingsDesc: '調整應用程式外觀、語言及其他個人偏好設定',
    exitSystem: '退出系統',
    exitSystemDesc: '安全離開系統並提醒備份數據',
    exitModalDesc: '您即將退出系統。為了資料安全，建議您在離開前匯出最新的備份檔案存檔。',

    // 任務卡片文字
    scheduledToToday: '📅 排到今日',
    scheduledToTomorrow: '⏭️ 明天',
    notesLabel: '記事：',
    createdAt: '建立時間',
    updatedAt: '更新時間',
    lastMonth: '上個月',
    nextMonth: '下個月',
    savingTask: '正在保存任務',

    // 其他
    developer: 'Developed by Wesley Chang, 2025.',
    items: '項',
    kanban: '看板視圖',
    todo: '待處理',
    inProgress: '進行中',
    done: '已完成',
    closeLabel: '關閉',
    welcomeTaskTitle: '✨ 歡迎使用 ToDoCalendar',
    welcomeTaskDesc: '您的所有紀錄都會自動儲存在本地電腦中。您可以點擊左側導覽列開始規劃任務。',
    welcomeTaskNotes: '您可以點擊右側的鉛筆圖示編輯此地標。',
    
    // View Titles
    scheduledListTitle: '已排程清單',
    pendingWallTitle: '靈感待辦牆',
    myTasksTitle: '我的任務 (總覽)',
    completionRate: '本月完成率',
    confirmClearCompleted: '確定要清除這 {count} 項已完成的任務嗎？'
  },

  'en': {
    // App title
    appTitle: 'ToDoCalendar',
    appSubtitle: 'Calendar Task Manager',

    // Toolbar
    today: 'Today',
    backlog: 'Backlog',
    settings: 'Settings',
    guide: 'Guide',
    myTasks: 'My Tasks',
    calendarView: 'Calendar',
    pendingList: 'Pending',
    scheduledList: 'Scheduled',
    kanbanBoard: 'Kanban',
    insights: 'Insights',

    // Tooltips
    guideTooltip: 'Learn core features and page relationships',
    myTasksTooltip: 'View all tasks (including backlog and scheduled)',
    calendarViewTooltip: 'View calendar to see overall schedule and task distribution',
    pendingListTooltip: 'View unscheduled tasks, assign dates anytime',
    scheduledListTooltip: 'View all planned task schedules',
    kanbanBoardTooltip: 'Manage progress via Kanban with drag-and-drop',
    insightsTooltip: 'Understand task completion trends and distribution',
    exitTooltip: 'Safely exit and backup your data',

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

    // Theme
    lightTheme: 'Light Theme',
    darkTheme: 'Dark Theme',
    systemTheme: 'Follow System',

    // Language
    traditionalChinese: '中文（繁體）',
    english: 'English',

    // Buttons
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    confirm: 'Confirm',
    saveAndClose: 'Save & Close',

    // Hints
    hint: 'Tip: Double-click on a date to view tasks for that day',
    noTasks: 'No tasks',
    tasksOnThisDay: '{count} tasks on this day',
    doubleClickToView: 'Double-click to view details',
    doubleClickToTaskList: 'Double-click to view task list',
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

    // Data Management
    dataManagement: 'Data Management',
    dataManagementDesc: 'Manage your task data, backups, and storage paths.',
    dataPathManagement: 'Storage Path Management',
    dataPathDesc: 'Customize where your data files are stored for cloud sync or manual backup.',
    pathLoading: 'Loading...',
    changePath: 'Change Directory',
    dataPathUpdated: 'Storage path updated! Changes will take effect on next save.',
    dataPathUpdateFailed: 'Failed to update path',
    webStorageHintTitle: 'Web Storage Info',
    webStorageHintDesc: 'You are using the web version. Data is stored securely in LocalStorage. For cross-device sync, use "Export Data" regularly.',
    backupNow: 'Backup Now',
    restoreNow: 'Restore Backup',
    exportData: 'Export Data (JSON)',
    importData: 'Import Data (JSON)',
    exportSuccess: 'Data exported successfully to',
    importConfirm: 'Importing will overwrite all current data. Continue?',
    importSuccess: 'Import successful! Reloading page to apply changes.',
    importFailed: 'Import failed. Please check the file format.',

    // Settings & Sidebar
    settingsTitle: 'Settings',
    interfaceSettings: 'Interface Settings',
    taskSettings: 'Task Settings',
    defaultPriority: 'Default Priority',
    itemsPerPage: 'Items Per Page',
    themeLabel: 'Theme',
    languageLabel: 'Language',
    dateFormatLabel: 'Date Format',
    versionInfo: 'Version: {version} | ToDoCalendar Desktop',
    deviceIdLabel: 'Device ID',
    userNameLabel: 'Username',
    systemAdmin: 'System Administrator',
    enterDisplayName: 'Enter display name',
    userProfile: 'User Profile',
    systemSettings: 'System Settings',
    settingsDesc: 'Adjust appearance, language, and personal preferences.',
    exitSystem: 'Exit System',
    exitSystemDesc: 'Safely exit and backup your data.',
    exitModalDesc: 'You are about to exit. For security, we recommend exporting a backup before leaving.',

    // Task Card
    scheduledToToday: '📅 Today',
    scheduledToTomorrow: '⏭️ Tomorrow',
    notesLabel: 'Notes:',
    createdAt: 'Created',
    updatedAt: 'Updated',
    lastMonth: 'Last Month',
    nextMonth: 'Next Month',
    savingTask: 'Saving Task',

    // Others
    developer: 'Developed by Wesley Chang, 2025.',
    items: 'items',
    kanban: 'Kanban View',
    todo: 'To Do',
    inProgress: 'In Progress',
    done: 'Done',
    closeLabel: 'Close',
    welcomeTaskTitle: '✨ Welcome to ToDoCalendar',
    welcomeTaskDesc: 'All your records are automatically saved locally. Click the sidebar to start planning tasks.',
    welcomeTaskNotes: 'You can click the pencil icon on the right to edit this task.',

    // View Titles
    scheduledListTitle: 'Scheduled List',
    pendingWallTitle: 'Ideation Wall',
    myTasksTitle: 'My Tasks (Overview)',
    completionRate: 'Completion Rate',
    confirmClearCompleted: 'Are you sure you want to clear these {count} completed tasks?'
  }
};

// 獲取翻譯文字的函數
export const getTranslation = (language: 'zh-TW' | 'en' | string, key: string): string => {
  const keys = key.split('.');
  
  // 檢查語言是否存在，若不存在則回退至中文
  const targetLanguage = translations[language as keyof typeof translations] ? language : 'zh-TW';
  let value: any = translations[targetLanguage as keyof typeof translations];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // 如果在此語言中找不到翻譯，且目前不是中文，則嘗試回退到中文
      if (targetLanguage !== 'zh-TW') {
        let fallbackValue: any = translations['zh-TW'];
        for (const fallbackKey of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fallbackKey in fallbackValue) {
            fallbackValue = fallbackValue[fallbackKey];
          } else {
            return key; // 連中文都找不到，返回原始 key
          }
        }
        return typeof fallbackValue === 'string' ? fallbackValue : key;
      }
      return key; // 如果已經是中文且找不到，則返回 key
    }
  }

  return (typeof value === 'string' || Array.isArray(value)) ? value : key;
};

// 創建一個hook來使用翻譯
export const useTranslation = (language: 'zh-TW' | 'en') => {
  return (key: string) => getTranslation(language, key);
};
