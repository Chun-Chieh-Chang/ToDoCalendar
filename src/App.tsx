import { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

import { storageService } from './services/storage';
import { Task } from './types';
import { dateUtils } from './shared/utils/dateUtils';
import { taskUtils } from './features/tasks/utils/taskUtils';
import { useTranslation, getTranslation, translations } from './utils/i18n';
import { parseTaskTitle } from './utils/nlpUtils';
import { notificationUtils } from './shared/utils/notificationUtils';
import Calendar from './features/calendar/components/Calendar/Calendar';
import TaskForm from './features/tasks/components/TaskForm/TaskForm';
import Settings from './features/settings/components/Settings/Settings';
import Modal from './shared/components/Modal/Modal';
import TaskListModal from './features/tasks/components/TaskListModal/TaskListModal';
import ReminderModal from './features/tasks/components/ReminderModal/ReminderModal';
import KanbanBoard from './features/kanban/components/KanbanBoard/KanbanBoard';
import TaskListView from './features/tasks/components/TaskListView/TaskListView';
import AppGuide from './features/guide/components/AppGuide/AppGuide';
import Dashboard from './features/dashboard/components/Dashboard/Dashboard';
import { exportDataWithDialog } from './features/settings/utils/exportUtils';
import './App.css';

const App = () => {
  const state = useAppStore();
  const dispatch = (action: any) => {
    switch(action.type) {
      case "SET_TASKS": state.setTasks(action.payload); break;
      case "ADD_TASK": state.addTask(action.payload); break;
      case "UPDATE_TASK": state.updateTask(action.payload); break;
      case "DELETE_TASK": state.deleteTask(action.payload); break;
      case "TOGGLE_TASK_COMPLETION": state.toggleTaskCompletion(action.payload); break;
      case "SET_SELECTED_DATE": state.setSelectedDate(action.payload); break;
      case "SET_FILTER": state.setFilter(action.payload); break;
      case "SET_SETTINGS": state.setSettings(action.payload); break;
      case "REORDER_TASKS": state.reorderTasks(action.payload); break;
      case "RESET_STATE": state.resetState(); break;
    }
  };
  const translate = useTranslation(state.settings.language);
  useEffect(() => {
    state.loadData();
  }, []);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeView, setActiveView] = useState<'calendar' | 'kanban' | 'tasks' | 'pending' | 'guide' | 'dashboard' | 'all_tasks'>('calendar');
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [reminderQueue, setReminderQueue] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remindedKeys] = useState(() => new Set<string>());

  // 檢查提醒
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentDate = dateUtils.dateToString(now);

      const newReminders: Task[] = [];
      state.tasks.forEach(task => {
        if (task.completed || !task.time) return;

        if (task.date === currentDate) {
          const taskDateTime = new Date(`${task.date}T${task.time}`);
          const reminderTime = new Date(taskDateTime.getTime() - 10 * 60 * 1000); 

          if (now >= reminderTime && now < taskDateTime) {
            const key = `${task.id}-${task.time}`;
            if (!remindedKeys.has(key)) {
              newReminders.push(task);
              remindedKeys.add(key);

              // 發送系統通知
              const lang = state.settings.language;
              const timeLine = task.time ? `\n${getTranslation(lang, 'notifyTimeLine').replace('{time}', task.time)}` : '';
              notificationUtils.send(getTranslation(lang, 'reminderTitle'), {
                body: getTranslation(lang, 'notifyTaskLine').replace('{title}', task.title) + timeLine,
                tag: task.id
              });
            }
          }
        }
      });

      if (newReminders.length > 0) {
        setReminderQueue(prev => [...prev, ...newReminders]);
      }
    };

    const intervalId = setInterval(checkReminders, 60000);
    checkReminders();
    return () => clearInterval(intervalId);
  }, [state.tasks, remindedKeys, state.settings.language]);


  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTaskList, setShowTaskList] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  // 註冊全域快捷鍵
  useKeyboardShortcuts({
    onNewTask: () => setShowTaskForm(true),
    onSwitchView: (view: any) => {
      setActiveView(view);
      if (view === 'tasks') {
        setShowTaskList(false);
      }
    },
    onSearchFocus: () => {
      setActiveView('tasks');
      window.dispatchEvent(new CustomEvent('focus-search'));
    },
    onCloseModal: () => {
      setShowTaskForm(false);
      setShowSettings(false);
      setShowTaskList(false);
      setShowExitModal(false);
    },
    onGoToToday: () => {
      setCurrentMonth(new Date());
      state.setSelectedDate(new Date().toISOString());
      setActiveView('calendar');
    }
  });

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
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  // 清除已完成任務
  const handleClearCompleted = (targetTasks: Task[]) => {
    const completedTasks = targetTasks.filter(t => t.completed);
    if (completedTasks.length === 0) return;
    if (confirm(translate('confirmClearCompleted').replace('{count}', String(completedTasks.length)))) {
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
          alert(`${translate('exportSuccess')}: ${result.filePath}\n${translate('exitAutoClose')}`);
        } else if (result.method !== 'download') {
          alert(`${translate('exportDone')}\n${translate('exitAutoClose')}`);
        }
        setShowExitModal(false);
        if (typeof (window as any).electronAPI !== 'undefined') {
          (window as any).electronAPI.quitApp();
        } else {
          window.close();
          if (!window.closed) alert(translate('closeTabManually'));
        }
      }
    } catch (err) {
      alert(`${translate('exportFailed')}: ${err.message}`);
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
      if (!taskData.title?.trim()) throw new Error(translate('titleRequired'));
      if (editingTask && editingTask.id) {
        dispatch({
          type: 'UPDATE_TASK',
          payload: { ...editingTask, ...taskData, updatedAt: new Date().toISOString() }
        });
      } else {
        const newTask = {
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
      setError(err instanceof Error ? err.message : translate('saveFailed'));
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
      payload: { ...task, status: newStatus, completed: isDone, updatedAt: new Date().toISOString() }
    });
  };

  // 處理重新排序
  const handleReorderTasks = (updatedTasks: Task[]) => {
    dispatch({ type: 'REORDER_TASKS', payload: updatedTasks });
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
  const filteredAllTasks = taskUtils.filterTasks(state.tasks, state.filter);



  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 監聽從 AppGuide「立即開始使用」按鈕發送的視圖切換事件
  useEffect(() => {
    const handleChangeView = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setActiveView(customEvent.detail);
      }
    };
    window.addEventListener('changeView', handleChangeView);
    return () => window.removeEventListener('changeView', handleChangeView);
  }, []);

  return (
    <div className="app" data-theme={state.settings.theme}>
      {/* 左側導航欄 - 僅在非手機版顯示 */}
      {!isMobile && (
        <aside className="sidebar">
          <div className="sidebar-top">
            <div className="logo">
              <i className="ri-calendar-todo-fill"></i>
              <span>ToDoCalendar</span>
            </div>

            <nav className="nav-menu">
              {/* 1. 新增任務 (Primary Action) */}
              <div
                className="nav-item btn-add-global"
                onClick={() => setShowTaskForm(true)}
                title={translate('addTask')}
              >
                <div className="tooltip">
                  <i className="ri-add-circle-fill"></i>
                  <span>{translate('addTask')}</span>
                  <span className="tooltip-text">{translate('addTaskTooltip')}</span>
                </div>
              </div>

              <div className="nav-divider"></div>

              {/* 2. 月曆視圖 */}
              <div
                className={'nav-item ' + (activeView === 'calendar' ? 'active' : '')}
                onClick={() => setActiveView('calendar')}
                title={translate('calendarView')}
              >
                <div className="tooltip">
                  <i className="ri-calendar-event-line"></i>
                  <span>{translate('calendarView')}</span>
                  <span className="tooltip-text">{translate('calendarViewTooltip')}</span>
                </div>
              </div>

              {/* 3. 我的任務 */}
              <div
                className={'nav-item ' + (['tasks', 'pending', 'all_tasks'].includes(activeView) ? 'active' : '')}
                onClick={() => setActiveView('tasks')}
                title={translate('myTasks')}
              >
                <div className="tooltip">
                  <i className="ri-list-check"></i>
                  <span>{translate('myTasks')}</span>
                  <span className="tooltip-text">{translate('myTasksTooltip')}</span>
                </div>
              </div>

              {/* 4. 看板視圖 */}
              <div
                className={'nav-item ' + (activeView === 'kanban' ? 'active' : '')}
                onClick={() => setActiveView('kanban')}
                title={translate('kanbanBoard')}
              >
                <div className="tooltip">
                  <i className="ri-layout-column-line"></i>
                  <span>{translate('kanbanBoard')}</span>
                  <span className="tooltip-text">{translate('kanbanBoardTooltip')}</span>
                </div>
              </div>

              {/* 5. 數據洞察 */}
              <div
                className={'nav-item ' + (activeView === 'dashboard' ? 'active' : '')}
                onClick={() => setActiveView('dashboard')}
                title={translate('insights')}
              >
                <div className="tooltip">
                  <i className="ri-bar-chart-fill"></i>
                  <span>{translate('insights')}</span>
                  <span className="tooltip-text">{translate('insightsTooltip')}</span>
                </div>
              </div>

              <div className="nav-divider"></div>

              {/* 6. 使用說明 */}
              <div
                className={'nav-item ' + (activeView === 'guide' ? 'active' : '')}
                onClick={() => setActiveView('guide')}
                title={translate('guide')}
              >
                <div className="tooltip">
                  <i className="ri-book-open-line"></i>
                  <span>{translate('guide')}</span>
                  <span className="tooltip-text">{translate('guideTooltip')}</span>
                </div>
              </div>

              {/* 7. 系統設定 */}
              <div className="nav-item">
                <div className="tooltip" onClick={handleOpenSettings} title={translate('settings')}>
                  <i className="ri-settings-4-line"></i>
                  <span>{translate('settings')}</span>
                  <span className="tooltip-text">{translate('settingsDesc')}</span>
                </div>
              </div>

              <div className="nav-divider"></div>

              {/* 8. 安全退出 */}
              <div className="nav-item exit-item" onClick={handleExit}>
                <div className="tooltip" title={translate('exitSystem')}>
                  <i className="ri-logout-box-r-line"></i>
                  <span>{translate('exitSystem')}</span>
                  <span className="tooltip-text">{translate('exitTooltip')}</span>
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
            <div className="sidebar-credit">
              Developed by Wesley Chang @ Mouldex, 2026.
            </div>
          </div>
        </aside>
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
                  {translations[state.settings.language].months.map((month: string, index: number) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
              </div>
              <div className="nav-arrows">
                <button
                  className="nav-btn"
                  onClick={() => handleMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  title={translate('lastMonth')}
                >
                  <i className="ri-arrow-left-s-line"></i>
                </button>
                <button
                  className="nav-btn"
                  onClick={() => handleMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  title={translate('nextMonth')}
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
              t={translate}
              currentMonth={currentMonth}
              selectedDate={state.selectedDate}
              onDateSelect={handleDateSelect}
              onDateDoubleClick={handleDateDoubleClick}
              onMonthChange={handleMonthChange}
              tasks={state.tasks}
              categories={state.settings.categories}
              theme={state.settings.theme}
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
          {['tasks', 'pending', 'all_tasks'].includes(activeView) && (
            <TaskListView
              title={translate('taskCenterTitle')}
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
            {translate('inProgressTasks')} ({state.tasks.filter(t => !t.completed && t.date).length})
          </div>
          <div className="status-item">
            <span className="status-dot dot-green"></span>
            {translate('completed')} ({state.tasks.filter(t => t.completed).length})
          </div>
          <div className="status-item">
            <span className="status-dot dot-yellow"></span>
            {translate('todo')} ({state.tasks.filter(t => !t.date).length})
          </div>

          <div className="progress-wrapper">
            <span className="progress-label">
              {translate('completionRate')} {state.tasks.length > 0 ? Math.round((state.tasks.filter(t => t.completed).length / state.tasks.length) * 100) : 0}%
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
        title={translate('exitSystem')}
        className="exit-modal"
      >
        <div className="exit-modal-content">
          <div className="exit-icon">🚪</div>
          <p>{translate('exitModalDesc')}</p>
          <div className="exit-actions">
            <button className="btn btn-danger" onClick={confirmExitWithBackup}>
              <i className="ri-download-2-line"></i> {translate('exportAndExit')}
            </button>
            <button className="btn btn-secondary" onClick={() => setShowExitModal(false)}>
              {translate('cancel')}
            </button>
          </div>
        </div>
      </Modal>

      {/* 加載狀態 */}
      {isLoading && (
        <div className="loading-overlay" role="status" aria-label={translate('savingTask')}>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <div className="text">{translate('savingTask')}...</div>
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
            aria-label={translate('dismissError')}
          >
            ✕
          </button>
        </div>
      )}

      {/* 提醒彈窗 (使用 Queue 避免同時多個提醒被覆蓋) */}

      {/* 手機版底部導航欄 */}
      {isMobile && (
        <nav className="mobile-nav">
          <div 
            className={'mobile-nav-item ' + (activeView === 'calendar' ? 'active' : '')} 
            onClick={() => setActiveView('calendar')}
          >
            <i className="ri-calendar-event-line"></i>
            <span>{translate('calendarView')}</span>
          </div>
          <div 
            className={'mobile-nav-item ' + (['tasks', 'pending', 'all_tasks'].includes(activeView) ? 'active' : '')} 
            onClick={() => setActiveView('tasks')}
          >
            <i className="ri-list-check"></i>
            <span>{translate('myTasks')}</span>
          </div>
          <div 
            className="mobile-nav-item" 
            onClick={() => setShowTaskForm(true)}
          >
            <i className="ri-add-circle-fill" style={{ fontSize: '32px', color: 'var(--primary-color)' }}></i>
          </div>
          <div 
            className={'mobile-nav-item ' + (activeView === 'kanban' ? 'active' : '')} 
            onClick={() => setActiveView('kanban')}
          >
            <i className="ri-layout-column-line"></i>
            <span>{translate('kanbanBoard')}</span>
          </div>
          <div 
            className={'mobile-nav-item ' + (activeView === 'dashboard' ? 'active' : '')} 
            onClick={() => setActiveView('dashboard')}
          >
            <i className="ri-bar-chart-fill"></i>
            <span>{translate('insights')}</span>
          </div>
        </nav>
      )}
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