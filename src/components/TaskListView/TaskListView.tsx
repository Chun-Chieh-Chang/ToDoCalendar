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
    onAddTask: () => void;
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
    title,
    viewMode = 'list'
}: TaskListViewProps) => {
    const sortedTasks = (React as any).useMemo(() => {
        return taskUtils.sortTasks(tasks);
    }, [tasks]);

    return (
        <div className="task-page-container">
            <header className="page-header">
                <div className="header-info">
                    <h1>{title}</h1>
                    <div className="page-stats">
                        <span className="stat-pill">總計：{tasks.length}</span>
                        <span className="stat-pill">待處理：{tasks.filter(t => !t.completed).length}</span>
                    </div>
                </div>
                <button className="add-task-btn" onClick={onAddTask}>
                    <i className="ri-add-line"></i> 新增任務
                </button>
            </header>

            <div className="page-filters">
                <Filter
                    filter={filter}
                    onFilterChange={onFilterChange}
                    onClearFilter={onClearFilter}
                />
            </div>

            <div className="page-content">
                {tasks.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-illustration">📝</div>
                        <h3>目前沒有任務</h3>
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
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskListView;
