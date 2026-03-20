import { useState, useEffect } from 'react';
import { useAppContext } from './store/AppContext';
import { storageService } from './services/storage';
import { Task } from './types';
import { dateUtils } from './utils/dateUtils';
import { taskUtils } from './utils/taskUtils';
import { useTranslation, translations } from './utils/i18n';
import { parseTaskTitle } from './utils/nlpUtils';
import Calendar from './components/Calendar/Calendar';
import TaskForm from './components/TaskForm/TaskForm';
import Settings from './components/Settings/Settings';
import Modal from './components/Modal/Modal';
import TaskListModal from './components/TaskListModal/TaskListModal';
import ReminderModal from './components/ReminderModal/ReminderModal';
import KanbanBoard from './components/KanbanBoard/KanbanBoard';
import TaskListView from './components/TaskListView/TaskListView';
import AppGuide from './components/AppGuide/AppGuide';
import Dashboard from './components/Dashboard/Dashboard';
import DataManagementView from './components/DataManagement/DataManagementView';
import { exportDataWithDialog } from './utils/exportUtils';
import './App.css';

const App = () => {
  const { state, dispatch, isLoaded } = useAppContext();
  const t = useTranslation(state.settings.language);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeView, setActiveView] = useState<'calendar' | 'kanban' | 'tasks' | 'pending' | 'guide' | 'dashboard' | 'all_tasks' | 'data'>('calendar');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTaskList, setShowTaskList] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // 網頁版啟動時詢問匯入
  useEffect(() => {
    if (isLoaded) {
      const isElectron = typeof (window as any).electronAPI !== 'undefined';
      // 判斷是否為「全新狀態」（只有預設的歡迎任務）
      const isActuallyEmpty = state.tasks.length === 1 && state.tasks[0].id === '1';

      if (!isElectron && isActuallyEmpty && !sessionStorage.getItem('import_prompted')) {
        sessionStorage.setItem('import_prompted', 'true');

        // 延遲一下待畫面渲染完成再彈窗
        setTimeout(() => {
          const shouldImport = window.confirm('✨ 歡迎使用 ToDoCalendar 網頁版！\n\n偵測到您目前尚無個人資料，是否要從電腦匯入先前的備份檔案 (.json)？');

          if (shouldImport) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';
            input.onchange = (e: any) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (event) => {
                if (event.target?.result) {
                  const importedData = storageService.importData(event.target.result as string);
                  if (importedData) {
                    // 同步更新本地狀態，確保自動存檔邏輯不會用舊資料覆寫 localStorage
                    if (importedData.tasks) dispatch({ type: 'SET_TASKS', payload: importedData.tasks });
                    if (importedData.settings) dispatch({ type: 'SET_SETTINGS', payload: importedData.settings });
                    if (importedData.filter) dispatch({ type: 'SET_FILTER', payload: importedData.filter });
                    if (importedData.selectedDate) dispatch({ type: 'SET_SELECTED_DATE', payload: importedData.selectedDate });

                    alert('匯入成功！系統將即時套用您的資料。');
                    // 稍微延遲後重載以確保狀態已變動且穩定
                    setTimeout(() => {
                      window.location.reload();
                    }, 500);
                  } else {
                    alert('匯入失敗，請檢查檔案格式是否正確。');
                  }
                }
              };
              reader.readAsText(file);
            };
            input.click();
          }
        }, 800);
      }
    }
  }, [isLoaded, state.tasks]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key.toLowerCase() === 'n') {
        setShowTaskForm(true);
      } else if (e.key.toLowerCase() === 'c') {
        setActiveView('calendar');
      } else if (e.key.toLowerCase() === 'k') {
        setActiveView('kanban');
      } else if (e.key.toLowerCase() === 't') {
        setActiveView('tasks');
      } else if (e.key.toLowerCase() === 'p') {
        setActiveView('pending');
      } else if (e.key.toLowerCase() === 'd') {
        setActiveView('dashboard');
      } else if (e.key === '/') {
        e.preventDefault();
        // We'll need a search ref later, for now just a log
        console.log('Search focused');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleViewChange = (e: any) => {
      if (e.detail) setActiveView(e.detail);
    };
    window.addEventListener('changeView', handleViewChange);
    return () => window.removeEventListener('changeView', handleViewChange);
  }, []);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [reminderQueue, setReminderQueue] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Use useState for stable mutable object Reference to avoid useRef import issues
  const [remindedKeys] = useState(() => new Set<string>());

  // Request notification permission on app start
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // 初始化時設置當前月份
  useEffect(() => {
    setCurrentMonth(dateUtils.stringToDate(state.selectedDate));
  }, [state.selectedDate]);

  // 檢查提醒 - 使用 useMemo 優化性能
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentDate = dateUtils.dateToString(now);

      const newReminders: Task[] = [];
      state.tasks.forEach(task => {
        if (task.completed || !task.time) return;

        // 檢查日期和時間是否在提醒範圍內（提前10分鐘到時間已過）
        if (task.date === currentDate) {
          // 將時間轉換為可比較的格式
          const taskDateTime = new Date(`${task.date}T${task.time}`);

          // 計算提醒時間（提前10分鐘）
          const reminderTime = new Date(taskDateTime.getTime() - 10 * 60 * 1000); // 提前10分鐘

          // 檢查是否應該觸發提醒（在提醒時間點或之後，但在任務時間點之後不再提醒）
          if (now >= reminderTime && now < taskDateTime) {
            const key = `${task.id}-${task.time}`;
            if (!remindedKeys.has(key)) {
              newReminders.push(task);
              remindedKeys.add(key);

              // 發送桌面通知
              if (typeof (window as any).electronAPI !== 'undefined') {
                (window as any).electronAPI.sendNotification({
                  title: '任務提醒',
                  body: `任務: ${task.title}${task.time ? `\n時間: ${task.time}` : ''}`
                });

                // Restore window when reminder is triggered
                (window as any).electronAPI.restoreWindow();
              }
              // 網頁通知作為備用
              else if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('任務提醒', {
                  body: `任務: ${task.title}${task.time ? `\n時間: ${task.time}` : ''}`
                });
              }
            }
          }
        }
      });

      if (newReminders.length > 0) {
        setReminderQueue(prev => [...prev, ...newReminders]);
      }
    };

    // 每2分鐘檢查一次
    const intervalId = setInterval(checkReminders, 120000);

    // 立即檢查一次
    checkReminders();

    return () => clearInterval(intervalId);
  }, [state.tasks, remindedKeys]);

  // Update document title when there are reminders
  useEffect(() => {
    if (reminderQueue.length > 0) {
      document.title = `(${reminderQueue.length}) ToDoCalendar`;

      // Change favicon to indicate reminders
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>❗</text></svg>';
      }
    } else {
      document.title = 'ToDoCalendar';
      // Reset favicon
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = '/vite.svg';
      }
    }
  }, [reminderQueue.length]);


  // 添加任務
  const handleAddTask = (titleOrTask?: any) => {
    if (typeof titleOrTask === 'string') {
      const parsed = parseTaskTitle(titleOrTask);
      const newTask = taskUtils.createDefaultTask({
        ...parsed,
        date: activeView === 'pending' ? '' : (parsed.date || state.selectedDate)
      });
      handleSaveTask(newTask);
      return;
    }
    setEditingTask(titleOrTask);
    setShowTaskForm(true);
  };

  // 編輯任務
  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  // 刪除任務
  const handleDeleteTask = (taskId: string) => {
    // 直接刪除任務（未來可以考慮加入自訂確認彈窗）
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  // 清除已完成任務
  const handleClearCompleted = (targetTasks: Task[]) => {
    const completedTasks = targetTasks.filter(t => t.completed);
    if (completedTasks.length === 0) return;

    if (confirm(t('confirmClearCompleted').replace('{count}', completedTasks.length.toString()))) {
      completedTasks.forEach(task => {
        dispatch({ type: 'DELETE_TASK', payload: task.id });
      });
    }
  };

  // 快速安排日期
  const handleScheduleTask = (taskId: string, date: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    dispatch({
      type: 'UPDATE_TASK',
      payload: { ...task, date, updatedAt: new Date().toISOString() }
    });
  };

  // 退出系統與備份
  const handleExit = () => {
    setShowExitModal(true);
  };

  const confirmExitWithBackup = async () => {
    try {
      const result = await exportDataWithDialog();
      if (result.success) {
        if (result.filePath) {
          alert(`數據已成功匯出至: ${result.filePath}\n程式將自動關閉。`);
        } else if (result.method !== 'download') {
          alert('數據匯出完成！程式將自動關閉。');
        }
        setShowExitModal(false);

        // 自動退出
        if (typeof (window as any).electronAPI !== 'undefined') {
          (window as any).electronAPI.quitApp();
        } else {
          // 網頁版無法直接關閉，提示關閉分頁
          window.close(); // 嘗試關閉
          if (!window.closed) {
            alert('請手動關閉此分頁。');
          }
        }
      }
    } catch (err: any) {
      alert(`匯出失敗: ${err.message}`);
    }
  };

  // 更新過濾條件
  const handleFilterChange = (newFilter: any) => {
    dispatch({ type: 'SET_FILTER', payload: newFilter });
  };

  // 清除過濾條件
  const handleClearFilter = () => {
    dispatch({ type: 'SET_FILTER', payload: { priority: undefined, category: undefined, status: 'all', search: '' } });
  };

  // 打開設定
  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  // 關閉設定
  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  // 更新設定
  const handleSettingsChange = (newSettings: any) => {
    dispatch({ type: 'SET_SETTINGS', payload: newSettings });
  };

  // 保存任務
  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      setError(null);

      // 驗證必填字段
      if (!taskData.title?.trim()) {
        throw new Error('任務標題不能為空');
      }

      // 只有當 editingTask 存在且有 id 時才是真正的「編輯」
      // 如果 editingTask 只是用來傳遞預設值（如 { date: '' }），則視為新增
      if (editingTask && editingTask.id) {
        dispatch({
          type: 'UPDATE_TASK',
          payload: {
            ...editingTask,
            ...taskData,
            updatedAt: new Date().toISOString()
          }
        });
      } else {
        const newTask: Task = {
          ...taskData,
          id: Date.now().toString(),
          order: state.tasks.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completed: false
        };
        dispatch({ type: 'ADD_TASK', payload: newTask });
      }

      setShowTaskForm(false);
      setEditingTask(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  // 切換任務完成狀態
  const handleToggleComplete = (taskId: string) => {
    dispatch({ type: 'TOGGLE_TASK_COMPLETION', payload: taskId });
  };

  // 處理狀態變更 (看板拖拽)
  const handleStatusChange = (taskId: string, newStatus: any) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const isDone = newStatus === 'done';
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        ...task,
        status: newStatus,
        completed: isDone,
        updatedAt: new Date().toISOString()
      }
    });
  };

  // 處理重新排序
  const handleReorderTasks = (updatedTasks: Task[]) => {
    dispatch({ type: 'REORDER_TASKS', payload: updatedTasks });
  };

  // 選擇日期
  const handleDateSelect = (date: Date) => {
    const dateStr = dateUtils.dateToString(date);
    dispatch({ type: 'SET_SELECTED_DATE', payload: dateStr });
  };

  // 雙擊日期 - 打開任務列表彈窗
  const handleDateDoubleClick = (date: Date) => {
    const dateStr = dateUtils.dateToString(date);
    dispatch({ type: 'SET_SELECTED_DATE', payload: dateStr });
    // 自動清除過濾條件，避免使用者因為之前的搜尋字詞而看不到任務
    dispatch({ type: 'SET_FILTER', payload: { priority: undefined, category: undefined, status: 'all', search: '' } });
    setShowTaskList(true);
  };

  // 切換月份
  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
  };

  // 跳轉到今天
  const handleTodayClick = () => {
    const todayStr = dateUtils.dateToString(new Date());
    dispatch({ type: 'SET_SELECTED_DATE', payload: todayStr });
    setCurrentMonth(new Date());
  };

  // 處理年份變更
  const handleYearChange = (e: any) => {
    const year = parseInt(e.target.value);
    const newDate = new Date(year, currentMonth.getMonth());
    setCurrentMonth(newDate);
  };

  // 處理月份變更
  const handleMonthSelectChange = (e: any) => {
    const month = parseInt(e.target.value);
    const newDate = new Date(currentMonth.getFullYear(), month);
    setCurrentMonth(newDate);
  };

  // 生成年份選項 (從當前年份前後各10年)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  const filteredDateTasks = taskUtils.filterTasks(state.tasks.filter(t => t.date === state.selectedDate), state.filter);
  const filteredAllPlannedTasks = taskUtils.filterTasks(state.tasks.filter(t => t.date), state.filter);
  const filteredPendingTasks = taskUtils.filterTasks(state.tasks.filter(t => !t.date), state.filter);
  const filteredAllTasks = taskUtils.filterTasks(state.tasks, state.filter);



  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Handle system theme changes
  const [systemTheme, setSystemTheme] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const activeTheme = state.settings.theme === 'system' ? systemTheme : state.settings.theme;

  return (
    <div className="app" data-theme={activeTheme}>
      {/* 左側導航欄 - 僅在非手機版顯示 */}
      {!isMobile && (
        <aside className="sidebar">
          <div className="sidebar-top">
            <div className="logo">
              <i className="ri-calendar-todo-fill"></i>
              <span>ToDoCalendar</span>
            </div>

            <nav className="nav-menu">
              {/* 1. 使用說明 */}
                <div className={`nav-item ${activeView === 'guide' ? 'active' : ''}`}
                onClick={() => setActiveView('guide')}
                title={t('guide')}
              >
                <div className="tooltip">
                  <i className="ri-book-open-line"></i>
                  <span>{t('guide')}</span>
                  <span className="tooltip-text">{t('guideTooltip')}</span>
                </div>
              </div>

              {/* 2. 我的任務 (所有任務) */}
              <div
                className={`nav-item ${activeView === 'all_tasks' ? 'active' : ''}`}
                onClick={() => setActiveView('all_tasks')}
                title={t('myTasks')}
              >
                <div className="tooltip">
                  <i className="ri-task-line"></i>
                  <span>{t('myTasks')}</span>
                  <span className="tooltip-text">{t('myTasksTooltip')}</span>
                </div>
              </div>

              {/* 3. 月曆視圖 */}
              <div
                className={`nav-item ${activeView === 'calendar' ? 'active' : ''}`}
                onClick={() => setActiveView('calendar')}
                title={t('calendarView')}
              >
                <div className="tooltip">
                  <i className="ri-calendar-2-line"></i>
                  <span>{t('calendarView')}</span>
                  <span className="tooltip-text">{t('calendarViewTooltip')}</span>
                </div>
              </div>

              {/* 4. 待辦清單 (Pending) */}
              <div
                className={`nav-item ${activeView === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveView('pending')}
                title={t('pendingList')}
              >
                <div className="tooltip">
                  <i className="ri-inbox-line"></i>
                  <span>{t('pendingList')}</span>
                  <span className="tooltip-text">{t('pendingListTooltip')}</span>
                </div>
              </div>

              {/* 5. 已排程清單 (Scheduled Tasks) */}
              <div
                className={`nav-item ${activeView === 'tasks' ? 'active' : ''}`}
                onClick={() => setActiveView('tasks')}
                title={t('scheduledList')}
              >
                <div className="tooltip">
                  <i className="ri-list-check"></i>
                  <span>{t('scheduledList')}</span>
                  <span className="tooltip-text">{t('scheduledListTooltip')}</span>
                </div>
              </div>

              {/* 6. 看板管理 */}
              <div
                className={`nav-item ${activeView === 'kanban' ? 'active' : ''}`}
                onClick={() => setActiveView('kanban')}
                title={t('kanbanBoard')}
              >
                <div className="tooltip">
                  <i className="ri-layout-column-line"></i>
                  <span>{t('kanbanBoard')}</span>
                  <span className="tooltip-text">{t('kanbanBoardTooltip')}</span>
                </div>
              </div>

              {/* 7. 數據洞察 */}
              <div
                className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveView('dashboard')}
                title={t('insights')}
              >
                <div className="tooltip">
                  <i className="ri-bar-chart-fill"></i>
                  <span>{t('insights')}</span>
                  <span className="tooltip-text">{t('insightsTooltip')}</span>
                </div>
              </div>

               {/* 8. 數據管理 */}
              <div
                className={`nav-item ${activeView === 'data' ? 'active' : ''}`}
                onClick={() => setActiveView('data')}
                title={t('dataManagement')}
              >
                <div className="tooltip">
                  <i className="ri-database-2-line"></i>
                  <span>{t('dataManagement')}</span>
                  <span className="tooltip-text">{t('dataManagementDesc')}</span>
                </div>
              </div>

              {/* 9. 系統設定 */}
              <div className="nav-item">
                <div className="tooltip" onClick={handleOpenSettings} title={t('settingsTitle')}>
                  <i className="ri-settings-4-line"></i>
                  <span>{t('settingsTitle')}</span>
                  <span className="tooltip-text">{t('settingsDesc')}</span>
                </div>
              </div>

              <div className="nav-divider"></div>

              {/* 8. 安全退出 */}
              <div className="nav-item exit-item" onClick={handleExit}>
                <div className="tooltip" title={t('exitSystem')}>
                  <i className="ri-logout-box-r-line"></i>
                  <span>{t('exitSystem')}</span>
                  <span className="tooltip-text">{t('exitSystemDesc')}</span>
                </div>
              </div>
            </nav>
          </div>

          <div className="sidebar-footer">
            <div className="user-profile" onClick={() => setShowSettings(true)}>
              {state.settings.userAvatar ? (
                <img src={state.settings.userAvatar} alt="User Avatar" className="avatar" />
              ) : (
                <div className="avatar">{state.settings.userName ? state.settings.userName.charAt(0).toUpperCase() : 'U'}</div>
              )}
              <div className="user-info">
                <h4>{state.settings.userName || 'User Name'}</h4>
                <p>v1.3.0 Professional</p>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* 手機版底部導航欄 */}
      {isMobile && (
        <nav className="mobile-nav">
          <div className={`mobile-nav-item ${activeView === 'guide' ? 'active' : ''}`} onClick={() => setActiveView('guide')}>
            <i className="ri-book-open-line"></i>
          </div>
          <div className={`mobile-nav-item ${activeView === 'all_tasks' ? 'active' : ''}`} onClick={() => setActiveView('all_tasks')}>
            <i className="ri-task-line"></i>
          </div>
          <div className={`mobile-nav-item ${activeView === 'calendar' ? 'active' : ''}`} onClick={() => setActiveView('calendar')}>
            <i className="ri-calendar-2-line"></i>
          </div>
          <div className={`mobile-nav-item ${activeView === 'pending' ? 'active' : ''}`} onClick={() => setActiveView('pending')}>
            <i className="ri-inbox-line"></i>
          </div>
          <div className={`mobile-nav-item ${activeView === 'tasks' ? 'active' : ''}`} onClick={() => setActiveView('tasks')}>
            <i className="ri-list-check"></i>
          </div>
          <div className={`mobile-nav-item ${activeView === 'kanban' ? 'active' : ''}`} onClick={() => setActiveView('kanban')}>
            <i className="ri-layout-column-line"></i>
          </div>
          <div className={`mobile-nav-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>
            <i className="ri-bar-chart-fill"></i>
          </div>
          <div className={`mobile-nav-item ${activeView === 'data' ? 'active' : ''}`} onClick={() => setActiveView('data')} title={t('dataManagement')}>
            <i className="ri-database-2-line"></i>
          </div>
          <div className="mobile-nav-item" onClick={handleOpenSettings} title={t('settingsTitle')}>
            <i className="ri-settings-4-line"></i>
          </div>
        </nav>
      )}

      {/* 主內容區域 */}
      <main className="main-content">
        {/* 月曆標題列 - 僅在月曆/看板視圖顯示 */}
        {(activeView === 'calendar' || activeView === 'kanban') && (
          <header className="calendar-header">
            <div className="month-selector">
              <div className="date-dropdowns">
                {/* 年份下拉選單 */}
                <select
                  className="year-select"
                  value={currentMonth.getFullYear()}
                  onChange={handleYearChange}
                >
                  {generateYearOptions().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>

                {/* 月份下拉選單 */}
                <select
                  className="month-select"
                  value={currentMonth.getMonth()}
                  onChange={handleMonthSelectChange}
                >
                  {(translations[(state?.settings?.language || 'zh-TW') as keyof typeof translations]?.months || translations['zh-TW']?.months || []).map((month: string, index: number) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
              </div>
              <div className="nav-arrows">
                <button
                  className="nav-btn"
                  onClick={() => handleMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  title={t('lastMonth') || '上個月'}
                >
                  <i className="ri-arrow-left-s-line"></i>
                </button>
                <button
                  className="nav-btn"
                  onClick={() => handleMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  title={t('nextMonth') || '下個月'}
                >
                  <i className="ri-arrow-right-s-line"></i>
                </button>
              </div>
            </div>

            <div className="header-actions">
              <button className="action-btn btn-today" onClick={handleTodayClick}>
                <i className="ri-focus-3-line"></i> {t('today')}
              </button>
            </div>
          </header>
        )}

        {/* 主內容區域容器 */}
        <div className="calendar-wrapper">
          {activeView === 'calendar' && (
            <Calendar
              currentMonth={currentMonth}
              selectedDate={state.selectedDate}
              onDateSelect={handleDateSelect}
              onDateDoubleClick={handleDateDoubleClick}
              tasks={state.tasks}
              categories={state.settings.categories}
              theme={activeTheme as 'light' | 'dark'}
              t={t}
            />
          )}
          {activeView === 'kanban' && (
            <KanbanBoard
              tasks={state.tasks}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
              onReorder={handleReorderTasks}
              t={t}
            />
          )}
          {activeView === 'tasks' && (
            <TaskListView
              title={t('scheduledListTitle')}
              tasks={filteredAllPlannedTasks}
              filter={state.filter}
              onFilterChange={handleFilterChange}
              onClearFilter={handleClearFilter}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onAddTask={handleAddTask}
              onClearCompleted={() => handleClearCompleted(filteredAllPlannedTasks)}
              onSchedule={handleScheduleTask}
            />
          )}
          {activeView === 'pending' && (
            <TaskListView
              title={t('pendingWallTitle')}
              tasks={filteredPendingTasks}
              filter={state.filter}
              onFilterChange={handleFilterChange}
              onClearFilter={handleClearFilter}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onAddTask={handleAddTask}
              onClearCompleted={() => handleClearCompleted(filteredPendingTasks)}
              onSchedule={handleScheduleTask}
              viewMode="sticky"
            />
          )}
          {activeView === 'all_tasks' && (
            <TaskListView
              title={t('myTasksTitle')}
              tasks={filteredAllTasks}
              filter={state.filter}
              onFilterChange={handleFilterChange}
              onClearFilter={handleClearFilter}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onAddTask={handleAddTask}
              onClearCompleted={() => handleClearCompleted(filteredAllTasks)}
              onSchedule={handleScheduleTask}
            />
          )}
          {activeView === 'guide' && <AppGuide />}
          {activeView === 'dashboard' && <Dashboard />}
          {activeView === 'data' && <DataManagementView />}
        </div>

        {/* 底部提示 */}
        {activeView === 'calendar' && (
          <div className="bottom-hint">
            <span className="hint-dot"></span>
            <span>{t('hint')}</span>
          </div>
        )}

        {/* 底部狀態欄 (淺色主題) */}
        <footer className="status-bar">
          <div className="status-item">
            <span className="status-dot dot-blue"></span>
            {t('inProgress')} ({state.tasks.filter(t => !t.completed && t.date).length})
          </div>
          <div className="status-item">
            <span className="status-dot dot-green"></span>
            {t('done')} ({state.tasks.filter(t => t.completed).length})
          </div>
          <div className="status-item">
            <span className="status-dot dot-yellow"></span>
            {t('pending')} ({state.tasks.filter(t => !t.date).length})
          </div>

          <div className="progress-wrapper">
            <span className="progress-label">
              {t('completionRate')} {state.tasks.length > 0 ? Math.round((state.tasks.filter(t => t.completed).length / state.tasks.length) * 100) : 0}%
            </span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${state.tasks.length > 0 ? Math.round((state.tasks.filter(t => t.completed).length / state.tasks.length) * 100) : 0}%`
                }}
              ></div>
            </div>
          </div>
        </footer>
      </main>

      {/* 任務列表彈窗 (所選日期) */}
      <TaskListModal
        isOpen={showTaskList}
        onClose={() => setShowTaskList(false)}
        selectedDate={state.selectedDate}
        tasks={filteredDateTasks}
        filter={state.filter}
        onFilterChange={handleFilterChange}
        onClearFilter={handleClearFilter}
        onToggleComplete={handleToggleComplete}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onAddTask={handleAddTask}
        onClearCompleted={() => handleClearCompleted(filteredDateTasks)}
        onSchedule={handleScheduleTask}
      />

      <TaskForm
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
        selectedDate={state.selectedDate}
      />

      <Settings
        isOpen={showSettings}
        onClose={handleCloseSettings}
        settings={state.settings}
        onSettingsChange={handleSettingsChange}
      />

      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title={t('exitSystem')}
        className="exit-modal"
      >
        <div className="exit-modal-content">
          <div className="exit-icon">🚪</div>
          <p>{t('exitModalDesc')}</p>
          <div className="exit-actions">
            <button className="btn btn-danger" onClick={confirmExitWithBackup}>
              <i className="ri-download-2-line"></i> {t('backupNow')}
            </button>
            <button className="btn btn-secondary" onClick={() => setShowExitModal(false)}>
              {t('cancel')}
            </button>
          </div>
        </div>
      </Modal>

      {/* 加載狀態 */}
      {isLoading && (
        <div className="loading-overlay" role="status" aria-label={t('savingTask') || '正在保存任務'}>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <div className="text">{t('savingTask') || '正在保存任務...'}</div>
          </div>
        </div>
      )}

      {/* 錯誤提示 */}
      {error && (
        <div className="error-toast" role="alert" aria-live="polite">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
          <button
            className="error-close"
            onClick={() => setError(null)}
            aria-label="關閉錯誤提示"
          >
            ✕
          </button>
        </div>
      )}

      {/* 提醒彈窗 (使用 Queue 避免同時多個提醒被覆蓋) */}
      <ReminderModal
        isOpen={reminderQueue.length > 0}
        onClose={() => setReminderQueue(prev => prev.slice(1))}
        task={reminderQueue[0] || null}
        onComplete={(taskId) => {
          handleToggleComplete(taskId);
          // 不需要在這裡移除 queue，因為 ReminderModal 會在調用 onComplete 後緊接著調用 onClose
        }}
      />
    </div>
  );
};

export default App;