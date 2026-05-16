import React from 'react';
import TaskCard from '../TaskCard/TaskCard';
import Filter from '../Filter/Filter';
import { Task } from '../../types';
import { taskUtils } from '../../utils/taskUtils';
import './TaskListView.css';

interface TaskListViewProps {
    tasks: Task[];
    filter: any;
    onFilterChange: (filter: any) => void;
    onClearFilter: () => void;
    onToggleComplete: (id: string) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onAddTask: (task?: any) => void;
    onClearCompleted?: () => void;
    onSchedule?: (id: string, date: string) => void;
    title: string;
    viewMode?: 'list' | 'sticky';
}

const TaskListView = ({
    tasks,
    filter,
    onFilterChange,
    onClearFilter,
    onToggleComplete,
    onEdit,
    onDelete,
    onAddTask,
    onClearCompleted,
    onSchedule,
    title,
    viewMode = 'list'
}: TaskListViewProps) => {
    const [quickAddTitle, setQuickAddTitle] = (React as any).useState('');
    const [subTab, setSubTab] = (React as any).useState<'all' | 'scheduled' | 'pending'>('all');

    // 根據子標籤進行內部二次過濾
    const subFilteredTasks = (React as any).useMemo(() => {
        if (subTab === 'scheduled') return tasks.filter(t => t.date);
        if (subTab === 'pending') return tasks.filter(t => !t.date);
        return tasks;
    }, [tasks, subTab]);

    const handleQuickAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickAddTitle.trim()) return;
        onAddTask(quickAddTitle);
        setQuickAddTitle('');
    };

    const sortedTasks = (React as any).useMemo(() => {
        return taskUtils.sortTasks(subFilteredTasks);
    }, [subFilteredTasks]);

    return (
        <div className="task-page-container">
            <header className="page-header">
                <div className="header-info">
                    <h1>{title}</h1>
                    <div className="page-stats">
                        <span className="stat-pill">總計：{subFilteredTasks.length}</span>
                        <span className="stat-pill">待處理：{subFilteredTasks.filter(t => !t.completed).length}</span>
                    </div>
                </div>
                <div className="header-actions">
                    {onClearCompleted && subFilteredTasks.some(t => t.completed) && (
                        <button className="clear-completed-btn" onClick={onClearCompleted}>
                            <i className="ri-delete-bin-line"></i> 清除已完成
                        </button>
                    )}
                </div>
            </header>

            {/* 子分頁切換器 */}
            <div className="view-switcher-tabs">
                <button 
                    className={`subtab-btn ${subTab === 'all' ? 'active' : ''}`}
                    onClick={() => setSubTab('all')}
                >
                    <i className="ri-stack-line"></i> 全部
                </button>
                <button 
                    className={`subtab-btn ${subTab === 'scheduled' ? 'active' : ''}`}
                    onClick={() => setSubTab('scheduled')}
                >
                    <i className="ri-calendar-todo-line"></i> 已排程
                </button>
                <button 
                    className={`subtab-btn ${subTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setSubTab('pending')}
                >
                    <i className="ri-lightbulb-line"></i> 靈感待辦
                </button>
            </div>

            <div className="page-filters">
                <Filter
                    filter={filter}
                    onFilterChange={onFilterChange}
                    onClearFilter={onClearFilter}
                />
            </div>

            <div className="page-content">
                <form className="quick-add-form" onSubmit={handleQuickAdd}>
                    <input
                        type="text"
                        placeholder="快速新增任務... (可使用 !high #work @14:00 等標籤)"
                        value={quickAddTitle}
                        onChange={(e) => setQuickAddTitle(e.target.value)}
                    />
                    <button type="submit" disabled={!quickAddTitle.trim()}>
                        <i className="ri-send-plane-fill"></i>
                    </button>
                </form>

                {subFilteredTasks.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-illustration">
                            {subTab === 'pending' ? '💡' : subTab === 'scheduled' ? '📅' : '📝'}
                        </div>
                        <h3>
                            {subTab === 'pending' ? '目前沒有靈感任務' : 
                             subTab === 'scheduled' ? '尚未排定任何日程' : '目前沒有任務'}
                        </h3>
                        <p>開始規劃您的第一項任務吧！</p>
                    </div>
                ) : (
                    <div className={`task-grid ${viewMode === 'sticky' ? 'sticky-wall' : 'list-view'}`}>
                        {sortedTasks.map((task: Task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onToggleComplete={onToggleComplete}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onSchedule={onSchedule}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskListView;
