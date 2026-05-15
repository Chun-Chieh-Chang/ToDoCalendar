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

  // --- Core Logic Hooks ---
  useEffect(() => {
    if (isLoaded) {
      const isElectron = typeof (window as any).electronAPI !== 'undefined';
      const isActuallyEmpty = state.tasks.length === 1 && state.tasks[0].id === '1';
      if (!isElectron && isActuallyEmpty && !sessionStorage.getItem('import_prompted')) {
        sessionStorage.setItem('import_prompted', 'true');
        setTimeout(() => {
          const shouldImport = window.confirm('✨ 歡迎使用 ToDoCalendar！\n\n偵測到您目前尚無個人資料，是否要從電腦匯入備份檔案 (.json)？');
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
                    if (importedData.tasks) dispatch({ type: 'SET_TASKS', payload: importedData.tasks });
                    if (importedData.settings) dispatch({ type: 'SET_SETTINGS', payload: importedData.settings });
                    alert('匯入成功！');
                    setTimeout(() => window.location.reload(), 500);
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
  }, [isLoaded, state.tasks, dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key.toLowerCase() === 'n') setShowTaskForm(true);
      else if (e.key.toLowerCase() === 'c') setActiveView('calendar');
      else if (e.key.toLowerCase() === 'k') setActiveView('kanban');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [reminderQueue, setReminderQueue] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remindedKeys] = useState(() => new Set<string>());

  const [systemTheme, setSystemTheme] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const activeTheme = state.settings.theme === 'system' ? systemTheme : state.settings.theme;

  // --- Derived Data ---
  const filteredDateTasks = taskUtils.filterTasks(state.tasks.filter(t => t.date === state.selectedDate), state.filter);
  const filteredAllPlannedTasks = taskUtils.filterTasks(state.tasks.filter(t => t.date), state.filter);
  const filteredPendingTasks = taskUtils.filterTasks(state.tasks.filter(t => !t.date), state.filter);
  const filteredAllTasks = taskUtils.filterTasks(state.tasks, state.filter);

  // --- Handlers ---
  const handleAddTask = (titleOrTask?: any) => {
    if (typeof titleOrTask === 'string') {
      const parsed = parseTaskTitle(titleOrTask);
      handleSaveTask(taskUtils.createDefaultTask({ ...parsed, date: activeView === 'pending' ? '' : (parsed.date || state.selectedDate) }));
      return;
    }
    setEditingTask(titleOrTask);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: any) => { setEditingTask(task); setShowTaskForm(true); };
  const handleDeleteTask = (taskId: string) => dispatch({ type: 'DELETE_TASK', payload: taskId });
  const handleToggleComplete = (taskId: string) => dispatch({ type: 'TOGGLE_TASK_COMPLETION', payload: taskId });
  const handleStatusChange = (taskId: string, newStatus: any) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) dispatch({ type: 'UPDATE_TASK', payload: { ...task, status: newStatus, completed: newStatus === 'done', updatedAt: new Date().toISOString() } });
  };
  const handleReorderTasks = (updatedTasks: Task[]) => dispatch({ type: 'REORDER_TASKS', payload: updatedTasks });
  const handleDateSelect = (date: Date) => dispatch({ type: 'SET_SELECTED_DATE', payload: dateUtils.dateToString(date) });
  const handleDateDoubleClick = (date: Date) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: dateUtils.dateToString(date) });
    setShowTaskList(true);
  };
  const handleMonthChange = (date: Date) => setCurrentMonth(date);
  const handleTodayClick = () => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: dateUtils.dateToString(new Date()) });
    setCurrentMonth(new Date());
  };
  const handleYearChange = (e: any) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth()));
  const handleMonthSelectChange = (e: any) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value)));
  const handleOpenSettings = () => setShowSettings(true);
  const handleCloseSettings = () => setShowSettings(false);
  const handleSettingsChange = (newSettings: any) => dispatch({ type: 'SET_SETTINGS', payload: newSettings });
  const handleFilterChange = (newFilter: any) => dispatch({ type: 'SET_FILTER', payload: newFilter });
  const handleClearFilter = () => dispatch({ type: 'SET_FILTER', payload: { priority: undefined, category: undefined, status: 'all', search: '' } });
  const handleExit = () => setShowExitModal(true);
  const handleScheduleTask = (taskId: string, date: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) dispatch({ type: 'UPDATE_TASK', payload: { ...task, date, updatedAt: new Date().toISOString() } });
  };
  const handleClearCompleted = (targetTasks: Task[]) => {
    const completed = targetTasks.filter(t => t.completed);
    if (completed.length > 0 && confirm(t('confirmClearCompleted').replace('{count}', completed.length.toString()))) {
      completed.forEach(task => dispatch({ type: 'DELETE_TASK', payload: task.id }));
    }
  };

  const confirmExitWithBackup = async () => {
    const result = await exportDataWithDialog();
    if (result.success) window.close();
  };

  const handleSaveTask = async (taskData: any) => {
    if (!taskData.title?.trim()) return;
    if (editingTask?.id) {
      dispatch({ type: 'UPDATE_TASK', payload: { ...editingTask, ...taskData, updatedAt: new Date().toISOString() } });
    } else {
      dispatch({ type: 'ADD_TASK', payload: { ...taskData, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), completed: false } });
    }
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  const generateYearOptions = () => {
    const year = new Date().getFullYear();
    return Array.from({ length: 21 }, (_, i) => year - 10 + i);
  };

  return (
    <div className="app" data-theme={activeTheme}>
      {/* Sidebar - SkillsBuilder Style */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo">
            <i className="ri-calendar-todo-fill"></i>
            <span>ToDoCalendar</span>
          </div>
          <nav className="nav-menu">
            <div className={`nav-item ${activeView === 'calendar' ? 'active' : ''}`} onClick={() => setActiveView('calendar')}>
              <i className="ri-dashboard-3-line"></i><span>{t('calendarView')}</span>
            </div>
            <div className={`nav-item ${activeView === 'all_tasks' ? 'active' : ''}`} onClick={() => setActiveView('all_tasks')}>
              <i className="ri-task-line"></i><span>{t('myTasks')}</span>
            </div>
            <div className={`nav-item ${activeView === 'pending' ? 'active' : ''}`} onClick={() => setActiveView('pending')}>
              <i className="ri-inbox-line"></i><span>{t('pendingList')}</span>
            </div>
            <div className={`nav-item ${activeView === 'kanban' ? 'active' : ''}`} onClick={() => setActiveView('kanban')}>
              <i className="ri-layout-masonry-line"></i><span>{t('kanbanBoard')}</span>
            </div>
            <div className="nav-divider"></div>
            <div className={`nav-item ${activeView === 'data' ? 'active' : ''}`} onClick={() => setActiveView('data')}>
              <i className="ri-database-2-line"></i><span>{t('dataManagement')}</span>
            </div>
            <div className="nav-item" onClick={handleOpenSettings}>
              <i className="ri-settings-4-line"></i><span>{t('settingsTitle')}</span>
            </div>
            <div className="nav-item exit-item" onClick={handleExit}>
              <i className="ri-logout-circle-r-line"></i><span>{t('exitSystem')}</span>
            </div>
          </nav>
        </div>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">W</div>
            <div className="user-info">
              <h4>Wesley Chang</h4>
              <p>v1.3.0 Flagship</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content - Horizontal Flow */}
      <main className="main-content">
        <header className="calendar-header">
          <div className="month-selector">
            <div className="date-dropdowns">
              <select className="year-select" value={currentMonth.getFullYear()} onChange={handleYearChange}>
                {generateYearOptions().map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select className="month-select" value={currentMonth.getMonth()} onChange={handleMonthSelectChange}>
                {(translations[state.settings.language as keyof typeof translations]?.months || []).map((m: string, i: number) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
            </div>
            <div className="nav-arrows">
              <button className="nav-btn" onClick={() => handleMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}><i className="ri-arrow-left-s-line"></i></button>
              <button className="nav-btn" onClick={() => handleMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}><i className="ri-arrow-right-s-line"></i></button>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={handleTodayClick}><i className="ri-focus-3-line"></i> {t('today')}</button>
            <button className="btn btn-primary" onClick={() => handleAddTask()}><i className="ri-add-line"></i> {t('addTask')}</button>
          </div>
        </header>

        <div className="calendar-wrapper">
          <div className="view-panel">
            {activeView === 'calendar' && <Calendar currentMonth={currentMonth} selectedDate={state.selectedDate} onDateSelect={handleDateSelect} onDateDoubleClick={handleDateDoubleClick} tasks={state.tasks} categories={state.settings.categories} theme={activeTheme as 'light' | 'dark'} t={t} />}
            {activeView === 'kanban' && <KanbanBoard tasks={state.tasks} onToggleComplete={handleToggleComplete} onEdit={handleEditTask} onDelete={handleDeleteTask} onStatusChange={handleStatusChange} onReorder={handleReorderTasks} t={t} />}
            {activeView === 'tasks' && <TaskListView title={t('scheduledListTitle')} tasks={filteredAllPlannedTasks} filter={state.filter} onFilterChange={handleFilterChange} onClearFilter={handleClearFilter} onToggleComplete={handleToggleComplete} onEdit={handleEditTask} onDelete={handleDeleteTask} onAddTask={handleAddTask} onClearCompleted={() => handleClearCompleted(filteredAllPlannedTasks)} onSchedule={handleScheduleTask} />}
            {activeView === 'pending' && <TaskListView title={t('pendingWallTitle')} tasks={filteredPendingTasks} filter={state.filter} onFilterChange={handleFilterChange} onClearFilter={handleClearFilter} onToggleComplete={handleToggleComplete} onEdit={handleEditTask} onDelete={handleDeleteTask} onAddTask={handleAddTask} onClearCompleted={() => handleClearCompleted(filteredPendingTasks)} onSchedule={handleScheduleTask} viewMode="sticky" />}
            {activeView === 'all_tasks' && <TaskListView title={t('myTasksTitle')} tasks={filteredAllTasks} filter={state.filter} onFilterChange={handleFilterChange} onClearFilter={handleClearFilter} onToggleComplete={handleToggleComplete} onEdit={handleEditTask} onDelete={handleDeleteTask} onAddTask={handleAddTask} onClearCompleted={() => handleClearCompleted(filteredAllTasks)} onSchedule={handleScheduleTask} />}
            {activeView === 'data' && <DataManagementView />}
          </div>
        </div>

        <footer className="status-bar">
          <div className="status-item"><span className="status-dot dot-blue"></span>{t('inProgress')} ({state.tasks.filter(t => !t.completed && t.date).length})</div>
          <div className="status-item"><span className="status-dot dot-green"></span>{t('done')} ({state.tasks.filter(t => t.completed).length})</div>
          <div className="status-item"><span className="status-dot dot-yellow"></span>{t('pending')} ({state.tasks.filter(t => !t.date).length})</div>
          <div className="progress-wrapper">
            <span className="progress-label">{t('completionRate')} {state.tasks.length > 0 ? Math.round((state.tasks.filter(t => t.completed).length / state.tasks.length) * 100) : 0}%</span>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${state.tasks.length > 0 ? Math.round((state.tasks.filter(t => t.completed).length / state.tasks.length) * 100) : 0}%` }}></div></div>
          </div>
        </footer>
      </main>

      {/* Modals */}
      <TaskListModal isOpen={showTaskList} onClose={() => setShowTaskList(false)} selectedDate={state.selectedDate} tasks={filteredDateTasks} filter={state.filter} onFilterChange={handleFilterChange} onClearFilter={handleClearFilter} onToggleComplete={handleToggleComplete} onEdit={handleEditTask} onDelete={handleDeleteTask} onAddTask={handleAddTask} onClearCompleted={() => handleClearCompleted(filteredDateTasks)} onSchedule={handleScheduleTask} />
      <TaskForm isOpen={showTaskForm} onClose={() => setShowTaskForm(false)} onSave={handleSaveTask} initialTask={editingTask} selectedDate={state.selectedDate} />
      <Settings isOpen={showSettings} onClose={handleCloseSettings} settings={state.settings} onSettingsChange={handleSettingsChange} />
      <Modal isOpen={showExitModal} onClose={() => setShowExitModal(false)} title={t('exitSystem')} className="exit-modal">
        <div className="exit-modal-content"><p>{t('exitModalDesc')}</p>
          <div className="exit-actions"><button className="btn btn-danger" onClick={confirmExitWithBackup}><i className="ri-download-2-line"></i> {t('backupNow')}</button><button className="btn btn-secondary" onClick={() => setShowExitModal(false)}>{t('cancel')}</button></div>
        </div>
      </Modal>
      {isLoading && <div className="loading-overlay"><div className="loading-spinner"><div className="spinner"></div><div className="text">{t('savingTask')}</div></div></div>}
      {error && <div className="error-toast"><span>⚠️</span><span>{error}</span><button onClick={() => setError(null)}>✕</button></div>}
      <ReminderModal isOpen={reminderQueue.length > 0} onClose={() => setReminderQueue(prev => prev.slice(1))} task={reminderQueue[0] || null} onComplete={handleToggleComplete} />
    </div>
  );
};

export default App;