import { useState, useEffect } from 'react';
import { useAppContext } from './store/AppContext';
import { Task } from './types';
import { dateUtils } from './utils/dateUtils';
import { taskUtils } from './utils/taskUtils';
import { useTranslation, translations } from './utils/i18n';
import Calendar from './components/Calendar/Calendar';
import TaskForm from './components/TaskForm/TaskForm';
import Settings from './components/Settings/Settings';
import TaskListModal from './components/TaskListModal/TaskListModal';
import ReminderModal from './components/ReminderModal/ReminderModal';
import KanbanBoard from './components/KanbanBoard/KanbanBoard';
import TaskListView from './components/TaskListView/TaskListView';
import AppGuide from './components/AppGuide/AppGuide';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';

const App = () => {
  const { state, dispatch } = useAppContext();
  const translate = useTranslation(state.settings.language);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeView, setActiveView] = useState<'calendar' | 'kanban' | 'tasks' | 'pending' | 'guide' | 'dashboard'>('calendar');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTaskList, setShowTaskList] = useState(false);

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
  const handleAddTask = () => {
    setEditingTask(undefined);
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



  return (
    <div className="app" data-theme={state.settings.theme}>
      {/* 左側導航欄 */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo">
            <i className="ri-calendar-todo-fill"></i>
            <span>ToDoCalendar</span>
          </div>

          <nav className="nav-menu">
            <div
              className={`nav-item ${activeView === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveView('calendar')}
              title="顯示月曆視圖"
            >
              <div className="tooltip">
                <i className="ri-calendar-2-line"></i>
                <span>月曆</span>
                <span className="tooltip-text">顯示月曆主視圖，查看整體排程與每日任務分布</span>
              </div>
            </div>
            <div
              className={`nav-item ${activeView === 'kanban' ? 'active' : ''}`}
              onClick={() => setActiveView('kanban')}
              title="顯示看板視圖"
            >
              <div className="tooltip">
                <i className="ri-layout-column-line"></i>
                <span>看板</span>
                <span className="tooltip-text">透過看板管理任務進度，支援拖拉更換狀態</span>
              </div>
            </div>
            <div
              className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('dashboard')}
              title="查看數據統計"
            >
              <div className="tooltip">
                <i className="ri-bar-chart-fill"></i>
                <span>數據洞察</span>
                <span className="tooltip-text">了解任務完成趨勢與分配情況</span>
              </div>
            </div>
            <div
              className={`nav-item ${activeView === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveView('tasks')}
              title="查看所有任務"
            >
              <div className="tooltip">
                <i className="ri-list-check"></i>
                <span>我的任務</span>
                <span className="tooltip-text">查看所有已規劃的任務，包括今日及未來任務</span>
              </div>
            </div>
            <div
              className={`nav-item ${activeView === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveView('pending')}
              title="查看待辦事項"
            >
              <div className="tooltip">
                <i className="ri-inbox-line"></i>
                <span>待辦清單</span>
                <span className="tooltip-text">查看尚未排入日程的待辦事項，可隨時安排執行時間</span>
              </div>
            </div>
            <div
              className={`nav-item ${activeView === 'guide' ? 'active' : ''}`}
              onClick={() => setActiveView('guide')}
              title="使用說明"
            >
              <div className="tooltip">
                <i className="ri-book-open-line"></i>
                <span>使用說明</span>
                <span className="tooltip-text">了解工具的核心功能與頁面關聯</span>
              </div>
            </div>
            <div className="nav-item">
              <div className="tooltip" onClick={handleOpenSettings} title="應用程式設定">
                <i className="ri-settings-4-line"></i>
                <span>設定</span>
                <span className="tooltip-text">調整應用程式外觀、語言及其他個人偏好設定</span>
              </div>
            </div>
          </nav>
        </div>

        <div className="sidebar-footer" onClick={() => setShowSettings(true)}>
          <div className="user-profile">
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
                  {translations[state.settings.language].months.map((month: string, index: number) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
              </div>
              <div className="nav-arrows">
                <button
                  className="nav-btn"
                  onClick={() => handleMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  title="上個月"
                >
                  <i className="ri-arrow-left-s-line"></i>
                </button>
                <button
                  className="nav-btn"
                  onClick={() => handleMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  title="下個月"
                >
                  <i className="ri-arrow-right-s-line"></i>
                </button>
              </div>
            </div>

            <div className="header-actions">
              <button className="action-btn btn-today" onClick={handleTodayClick}>
                <i className="ri-focus-3-line"></i> {translate('today')}
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
              onMonthChange={handleMonthChange}
              tasks={state.tasks}
              categories={state.settings.categories}
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
              t={translate}
            />
          )}
          {activeView === 'tasks' && (
            <TaskListView
              title="📅 我的任務日程"
              tasks={filteredAllPlannedTasks}
              filter={state.filter}
              onFilterChange={handleFilterChange}
              onClearFilter={handleClearFilter}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onAddTask={handleAddTask}
            />
          )}
          {activeView === 'pending' && (
            <TaskListView
              title="📝 靈感待辦牆"
              tasks={filteredPendingTasks}
              filter={state.filter}
              onFilterChange={handleFilterChange}
              onClearFilter={handleClearFilter}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onAddTask={() => {
                setEditingTask(taskUtils.createDefaultTask({
                  priority: state.settings.defaultPriority || 'medium',
                  category: 'work'
                }));
                setShowTaskForm(true);
              }}
              viewMode="sticky"
            />
          )}
          {activeView === 'guide' && <AppGuide />}
          {activeView === 'dashboard' && <Dashboard />}
        </div>

        {/* 底部提示 */}
        {activeView === 'calendar' && (
          <div className="bottom-hint">
            <span className="hint-dot"></span>
            <span>{translate('hint')}</span>
          </div>
        )}

        {/* 底部狀態欄 (淺色主題) */}
        <footer className="status-bar">
          <div className="status-item">
            <span className="status-dot dot-blue"></span>
            進行中任務 ({state.tasks.filter(t => !t.completed && t.date).length})
          </div>
          <div className="status-item">
            <span className="status-dot dot-green"></span>
            已完成 ({state.tasks.filter(t => t.completed).length})
          </div>
          <div className="status-item">
            <span className="status-dot dot-yellow"></span>
            待處理 ({state.tasks.filter(t => !t.date).length})
          </div>

          <div className="progress-wrapper">
            <span className="progress-label">
              本月完成率 {state.tasks.length > 0 ? Math.round((state.tasks.filter(t => t.completed).length / state.tasks.length) * 100) : 0}%
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

      {/* 加載狀態 */}
      {isLoading && (
        <div className="loading-overlay" role="status" aria-label="正在保存任務">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <div className="text">正在保存任務...</div>
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