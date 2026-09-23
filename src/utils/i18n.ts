// 國際化語言檔案 - Last Updated: 2026-03-20T03:00:00Z
export const translations = {
  'zh-TW': {
    // 工具列
    today: '今天',
    settings: '設定',
    guide: '使用說明',
    myTasks: '我的任務',
    calendarView: '月曆視圖',
    pendingList: '靈感待辦',
    kanbanBoard: '看板視圖',
    insights: '數據洞察',
    
    // Tooltips
    guideTooltip: '了解工具的核心功能與頁面關聯',
    myTasksTooltip: '查看系統中的所有任務 (包含待辦與已排程)',
    calendarViewTooltip: '顯示月曆主視圖，查看整體排程與每日任務分布',
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
    editTask: '編輯任務',
    deleteTask: '刪除任務',

    // 任務表單
    taskTitle: '任務標題',
    taskDate: '日期',
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

    // 按鈕
    cancel: '取消',
    close: '關閉',

    // 提示與提醒
    hint: '提示：雙擊日期可查看該日任務詳情',
    tasksOnThisDay: '此日有 {count} 個任務',
    doubleClickToTaskList: '雙擊查看任務列表',
    reminderTitle: '任務提醒',
    reminderComplete: '完成任務',

    // 過濾與搜尋
    search: '搜尋',
    filter: '過濾',

    // 資料管理
    dataPathManagement: '儲存路徑管理',
    pathLoading: '正在讀取...',
    changePath: '更換存儲目錄',
    dataPathUpdated: '儲存路徑已更新！新路徑將於下次存檔時生效。',
    backupNow: '立即備份數據',
    restoreNow: '還原備份檔案',
    exportSuccess: '數據已成功匯出至',
    importConfirm: '匯入數據將會覆蓋目前的任務與設定，確定要繼續嗎？',
    importSuccess: '匯入成功！頁面將重新載入以應用變更。',
    importFailed: '匯入失敗，請檢查檔案格式。',
    exportDone: '數據匯出成功！',
    exportFailed: '匯出失敗',
    backupRestore: '數據備份與還原',
    tabGeneral: '常規',
    tabData: '數據',
    finish: '完成',

    // 主畫面與系統訊息
    addTaskTooltip: '隨時隨地快速建立新任務 (N)',
    taskCenterTitle: '📋 任務管理中心',
    inProgressTasks: '進行中任務',
    notifyTaskLine: '任務: {title}',
    notifyTimeLine: '時間: {time}',
    exitAutoClose: '程式將自動關閉。',
    closeTabManually: '請手動關閉此分頁。',
    exportAndExit: '匯出數據並退出',
    saveFailed: '保存失敗',
    dismissError: '關閉錯誤提示',

    // 篩選
    allPriorities: '全部優先級',
    allCategories: '全部分類',
    allStatuses: '全部狀態',
    incomplete: '未完成',
    statusLabel: '狀態',
    searchPlaceholder: '搜尋任務標題、描述或記事...',
    clearAllFilters: '清除所有篩選條件',
    clearFilters: '清除篩選',
    appliedFilters: '已套用篩選：',

    // 任務清單
    totalCount: '總計：{count}',
    pendingCount: '待處理：{count}',
    incompleteCount: '未完成：{count}',
    completedCount: '已完成：{count}',
    clearCompleted: '清除已完成',
    tabAll: '全部',
    tabScheduled: '已排程',
    quickAddTagsPlaceholder: '快速新增任務... (可使用 !high #work @14:00 等標籤)',
    quickAddEnterPlaceholder: '快速新增任務... (Enter)',
    quickAdd: '快速新增',
    openFullForm: '開啟完整表單',
    taskListTitle: '📋 任務列表',
    emptyPendingTitle: '目前沒有靈感任務',
    emptyScheduledTitle: '尚未排定任何日程',
    emptyAllTitle: '目前沒有任務',
    emptyStartHint: '開始規劃您的第一項任務吧！',
    emptyDateTitle: '這個日期還沒有任務',
    emptyDateHint: '利用上方欄位快速新增，或點擊右側按鈕開啟詳細排程。',
    emptyBacklogTitle: '目前沒有待辦事項',
    emptyBacklogHint: '點擊上方按鈕開始添加您的第一個待辦吧！',

    // 提醒
    gotIt: '我知道了',

    // 任務表單
    titleRequired: '請輸入任務標題',
    titleTooLong: '標題不能超過 {max} 個字元',
    titlePlaceholder: '請輸入任務標題 (可用 !high #work @14:00 ^today 解析)',
    magicParse: '智慧解析標籤',
    detailDescription: '詳細描述',
    descriptionPlaceholder: '請描述任務的詳細內容',
    pendingNoDate: '待辦清單 (無日期)',
    time24h: '時間 (24H)',
    recurrence: '重複頻率',
    recurNone: '不重複',
    recurDaily: '每日',
    recurWeekly: '每週',
    recurMonthly: '每月',
    subtasks: '子任務',
    subtaskPlaceholder: '新增子任務...',
    add: '新增',
    notes: '記事',
    notesPlaceholder: '在這裡記錄相關的記事或備忘',
    saveChanges: '儲存變更',

    // 數據洞察
    dashboardTitle: '數據洞察中心',
    dashboardSubtitle: '您的任務趨勢與執行效率分析',
    statCompletion: '完成率',
    statTotal: '總任務',
    weeklyTrend: '生產力趨勢 (近七日)',
    categoryDistribution: '任務領域分布',
    priorityDistribution: '優先級分佈',

    // 使用說明
    guideTitle: '使用手冊與功能說明',
    guideSubtitle: '探索 ToDoCalendar 的核心概念與操作流暢度',
    guidePagesTitle: '頁面功能詳細說明',
    guideCalendarTitle: '月曆視圖 (Calendar)',
    guideCalendarDesc: '這是您的時間地圖。雙擊日期可快速新增當日任務，單擊可查看當日摘要。適合規劃具有明確截止日期的項目。',
    guideKanbanTitle: '看板視圖 (Kanban)',
    guideKanbanDesc: '專注於「流程管理」。將任務分為「待處理」、「進行中」與「已完成」。透過拖拽卡片，您可以視覺化地掌握工作流程的瓶頸。',
    guideTaskListTitle: '我的任務 (Task List)',
    guideTaskListDesc: '條列式清單視圖，匯整了所有「已排定日期」的任務。提供最強大的過濾功能，幫助您在海量任務中快速定位目標。',
    guidePendingTitle: '靈感待辦 (Pending)',
    guidePendingDesc: '這是一個非線性的創意空間。所有「未安排日期」的任務都會出現在這裡，適合存放突如其來的靈感或隨手記下的待辦事項。',
    guideInsightsTitle: '數據洞察 (Insights)',
    guideInsightsDesc: '視覺化您的生產力。透過圖表分析任務完成趨勢、類別分佈與優先級比例，助您優化時間分配。',
    guideFlowTitle: '頁面與任務的關聯邏輯',
    guideFlowStep1Title: '靈感捕捉',
    guideFlowStep1Desc: '在「我的任務」切換至「靈感待辦」分頁，隨手新增不限日期的靈感。',
    guideFlowStep2Title: '時間分配',
    guideFlowStep2Desc: '編輯任務並賦予其「日期」，任務將自動移動至「月曆」與「我的任務」的「已排程」分頁。',
    guideFlowStep3Title: '進度管理',
    guideFlowStep3Desc: '在「看板視圖」中切換狀態，並在「數據洞察」中檢視您的成長軌跡。',
    guideShortcutsTitle: '全域快捷鍵 (Keyboard Shortcuts)',
    shortcutSwitchView: '快速切換視圖',
    shortcutNewTask: '新增任務',
    shortcutSearch: '聚焦搜尋框',
    shortcutToday: '回今日 (月曆)',
    shortcutClose: '關閉彈窗 / 取消',
    guideTipsTitle: '進階操作小撇步',
    tipQuickAddTitle: '快速新增：',
    tipQuickAddDesc: '在月曆上連按兩下，系統會自動填入該日期的預設值。快捷鍵「N」可隨時喚起表單。',
    tipNlpTitle: 'NLP 智慧：',
    tipNlpDesc: '在標題中使用 `!h` (高優先)、`#work` (類別)、`@14:00` (時間) 即可快速解析任務屬性。',
    tipAutoSaveTitle: '自動存檔：',
    tipAutoSaveDesc: '您的每一筆異動都會即時同步到本地 IndexedDB，無需手動點擊，保證效能與數據安全。',
    tipDataTitle: '數據主權：',
    tipDataDesc: '本工具採 100% 本地存儲，您的資料絕不流向雲端，保障隱私安全。',
    guideCtaTitle: '準備好開始規劃了嗎？',
    guideCtaDesc: '現在就回到月曆，開啟您高效的一天！',
    guideCtaButton: '立即開始使用',

    // 設定、側邊欄與頁尾
    interfaceSettings: '介面設定',
    themeLabel: '主題模式',
    languageLabel: '顯示語言',
    deviceIdLabel: '裝置 ID',
    userNameLabel: '使用者名稱',
    systemAdmin: '系統管理員',
    enterDisplayName: '輸入顯示名稱',
    userProfile: '使用者個人資料',
    settingsDesc: '調整應用程式外觀、語言及其他個人偏好設定',
    exitSystem: '退出系統',
    exitModalDesc: '您即將退出系統。為了資料安全，建議您在離開前匯出最新的備份檔案存檔。',

    // 任務卡片文字
    scheduledToToday: '📅 排到今日',
    scheduledToTomorrow: '⏭️ 明天',
    createdAt: '建立時間',
    updatedAt: '更新時間',
    lastMonth: '上個月',
    nextMonth: '下個月',
    savingTask: '正在保存任務',

    // 其他
    developer: 'Developed by Wesley Chang @ Mouldex, 2026.',
    kanban: '看板視圖',
    todo: '待處理',
    inProgress: '進行中',
    done: '已完成',
    closeLabel: '關閉',
    welcomeTaskTitle: '✨ 歡迎使用 ToDoCalendar',
    welcomeTaskDesc: '您的所有紀錄都會自動儲存在本地電腦中。您可以點擊左側導覽列開始規劃任務。',
    welcomeTaskNotes: '您可以點擊右側的鉛筆圖示編輯此地標。',
    
    // View Titles
    completionRate: '本月完成率',
    confirmClearCompleted: '確定要清除這 {count} 項已完成的任務嗎？'
  },

  'en': {
    // Toolbar
    today: 'Today',
    settings: 'Settings',
    guide: 'Guide',
    myTasks: 'My Tasks',
    calendarView: 'Calendar',
    pendingList: 'Pending',
    kanbanBoard: 'Kanban',
    insights: 'Insights',

    // Tooltips
    guideTooltip: 'Learn core features and page relationships',
    myTasksTooltip: 'View all tasks (including backlog and scheduled)',
    calendarViewTooltip: 'View calendar to see overall schedule and task distribution',
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
    editTask: 'Edit Task',
    deleteTask: 'Delete Task',

    // Task form
    taskTitle: 'Task Title',
    taskDate: 'Date',
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

    // Buttons
    cancel: 'Cancel',
    close: 'Close',

    // Hints
    hint: 'Tip: Double-click on a date to view tasks for that day',
    tasksOnThisDay: '{count} tasks on this day',
    doubleClickToTaskList: 'Double-click to view task list',
    reminderTitle: 'Task Reminder',
    reminderComplete: 'Complete Task',

    // Filter
    search: 'Search',
    filter: 'Filter',

    // Data Management
    dataPathManagement: 'Storage Path Management',
    pathLoading: 'Loading...',
    changePath: 'Change Directory',
    dataPathUpdated: 'Storage path updated! Changes will take effect on next save.',
    backupNow: 'Backup Now',
    restoreNow: 'Restore Backup',
    exportSuccess: 'Data exported successfully to',
    importConfirm: 'Importing will overwrite all current data. Continue?',
    importSuccess: 'Import successful! Reloading page to apply changes.',
    importFailed: 'Import failed. Please check the file format.',
    exportDone: 'Data exported successfully!',
    exportFailed: 'Export failed',
    backupRestore: 'Backup & Restore',
    tabGeneral: 'General',
    tabData: 'Data',
    finish: 'Done',

    // Main screen & system messages
    addTaskTooltip: 'Quickly create a new task anytime (N)',
    taskCenterTitle: '📋 Task Center',
    inProgressTasks: 'In progress',
    notifyTaskLine: 'Task: {title}',
    notifyTimeLine: 'Time: {time}',
    exitAutoClose: 'The app will now close.',
    closeTabManually: 'Please close this tab manually.',
    exportAndExit: 'Export Data & Exit',
    saveFailed: 'Failed to save',
    dismissError: 'Dismiss error',

    // Filters
    allPriorities: 'All priorities',
    allCategories: 'All categories',
    allStatuses: 'All statuses',
    incomplete: 'Incomplete',
    statusLabel: 'Status',
    searchPlaceholder: 'Search titles, descriptions or notes...',
    clearAllFilters: 'Clear all filters',
    clearFilters: 'Clear filters',
    appliedFilters: 'Active filters:',

    // Task lists
    totalCount: 'Total: {count}',
    pendingCount: 'Pending: {count}',
    incompleteCount: 'Incomplete: {count}',
    completedCount: 'Completed: {count}',
    clearCompleted: 'Clear completed',
    tabAll: 'All',
    tabScheduled: 'Scheduled',
    quickAddTagsPlaceholder: 'Quick add a task... (supports tags like !high #work @14:00)',
    quickAddEnterPlaceholder: 'Quick add a task... (Enter)',
    quickAdd: 'Quick add',
    openFullForm: 'Open full form',
    taskListTitle: '📋 Task List',
    emptyPendingTitle: 'No ideas yet',
    emptyScheduledTitle: 'Nothing scheduled yet',
    emptyAllTitle: 'No tasks yet',
    emptyStartHint: 'Start planning your first task!',
    emptyDateTitle: 'No tasks on this date yet',
    emptyDateHint: 'Use the field above to quick add, or the button on the right to open the full form.',
    emptyBacklogTitle: 'No pending items',
    emptyBacklogHint: 'Use the button above to add your first item!',

    // Reminder
    gotIt: 'Got it',

    // Task form
    titleRequired: 'Please enter a task title',
    titleTooLong: 'Title cannot exceed {max} characters',
    titlePlaceholder: 'Enter a task title (supports !high #work @14:00 ^today)',
    magicParse: 'Parse smart tags',
    detailDescription: 'Description',
    descriptionPlaceholder: 'Describe the task in detail',
    pendingNoDate: 'Backlog (no date)',
    time24h: 'Time (24H)',
    recurrence: 'Repeat',
    recurNone: 'Does not repeat',
    recurDaily: 'Daily',
    recurWeekly: 'Weekly',
    recurMonthly: 'Monthly',
    subtasks: 'Subtasks',
    subtaskPlaceholder: 'Add a subtask...',
    add: 'Add',
    notes: 'Notes',
    notesPlaceholder: 'Write related notes or reminders here',
    saveChanges: 'Save Changes',

    // Insights
    dashboardTitle: 'Productivity Dashboard',
    dashboardSubtitle: 'Track your task trends and distribution',
    statCompletion: 'Completion',
    statTotal: 'Total',
    weeklyTrend: 'Weekly Productivity Trend',
    categoryDistribution: 'Category Distribution',
    priorityDistribution: 'Priority Distribution',

    // Guide
    guideTitle: 'User Guide & Features',
    guideSubtitle: 'Explore the core concepts and workflow of ToDoCalendar',
    guidePagesTitle: 'Pages in Detail',
    guideCalendarTitle: 'Calendar',
    guideCalendarDesc: 'Your map of time. Double-click a date to add a task for that day, single-click to see its summary. Best for work with clear deadlines.',
    guideKanbanTitle: 'Kanban',
    guideKanbanDesc: 'Focused on workflow. Tasks are split into To Do, In Progress and Done. Drag cards between columns to spot bottlenecks at a glance.',
    guideTaskListTitle: 'My Tasks',
    guideTaskListDesc: 'A list view of every scheduled task, with the most powerful filters to find what you need among many tasks.',
    guidePendingTitle: 'Ideas (Pending)',
    guidePendingDesc: 'A free-form space for ideas. Every task without a date appears here, perfect for sudden inspiration or quick to-dos.',
    guideInsightsTitle: 'Insights',
    guideInsightsDesc: 'Visualize your productivity. Charts show completion trends, category and priority breakdowns to help you plan your time.',
    guideFlowTitle: 'How Pages and Tasks Connect',
    guideFlowStep1Title: 'Capture ideas',
    guideFlowStep1Desc: 'In My Tasks, switch to the Ideas tab and jot down ideas without a date.',
    guideFlowStep2Title: 'Schedule',
    guideFlowStep2Desc: 'Edit a task and give it a date; it moves to the Calendar and to the Scheduled tab of My Tasks.',
    guideFlowStep3Title: 'Track progress',
    guideFlowStep3Desc: 'Change status in Kanban and review your progress in Insights.',
    guideShortcutsTitle: 'Keyboard Shortcuts',
    shortcutSwitchView: 'Switch views',
    shortcutNewTask: 'New task',
    shortcutSearch: 'Focus search',
    shortcutToday: 'Go to today (Calendar)',
    shortcutClose: 'Close dialog / Cancel',
    guideTipsTitle: 'Pro Tips',
    tipQuickAddTitle: 'Quick add:',
    tipQuickAddDesc: 'Double-click a date on the calendar to pre-fill that date. Press "N" anytime to open the form.',
    tipNlpTitle: 'Smart parsing:',
    tipNlpDesc: 'Use `!h` (high priority), `#work` (category) and `@14:00` (time) in the title to set task properties instantly.',
    tipAutoSaveTitle: 'Auto-save:',
    tipAutoSaveDesc: 'Every change is saved to local IndexedDB immediately, with no save button needed.',
    tipDataTitle: 'Your data, your device:',
    tipDataDesc: 'Everything is stored 100% locally and never sent to the cloud, keeping your data private.',
    guideCtaTitle: 'Ready to start planning?',
    guideCtaDesc: 'Head back to the calendar and make today productive!',
    guideCtaButton: 'Get Started',

    // Settings & Sidebar
    interfaceSettings: 'Interface Settings',
    themeLabel: 'Theme',
    languageLabel: 'Language',
    deviceIdLabel: 'Device ID',
    userNameLabel: 'Username',
    systemAdmin: 'System Administrator',
    enterDisplayName: 'Enter display name',
    userProfile: 'User Profile',
    settingsDesc: 'Adjust appearance, language, and personal preferences.',
    exitSystem: 'Exit System',
    exitModalDesc: 'You are about to exit. For security, we recommend exporting a backup before leaving.',

    // Task Card
    scheduledToToday: '📅 Today',
    scheduledToTomorrow: '⏭️ Tomorrow',
    createdAt: 'Created',
    updatedAt: 'Updated',
    lastMonth: 'Last Month',
    nextMonth: 'Next Month',
    savingTask: 'Saving Task',

    // Others
    developer: 'Developed by Wesley Chang @ Mouldex, 2026.',
    kanban: 'Kanban View',
    todo: 'To Do',
    inProgress: 'In Progress',
    done: 'Done',
    closeLabel: 'Close',
    welcomeTaskTitle: '✨ Welcome to ToDoCalendar',
    welcomeTaskDesc: 'All your records are automatically saved locally. Click the sidebar to start planning tasks.',
    welcomeTaskNotes: 'You can click the pencil icon on the right to edit this task.',

    // View Titles
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

  // 少數鍵（如 weekdays）的值為字串陣列；陣列消費端需在使用處自行斷言型別
  return (typeof value === 'string' || Array.isArray(value)) ? (value as string) : key;
};

// 創建一個hook來使用翻譯
export const useTranslation = (language: 'zh-TW' | 'en') => {
  return (key: string) => getTranslation(language, key);
};
