import React from 'react';
import TaskCard from '../TaskCard/TaskCard';
import Filter from '../Filter/Filter';
import Modal from '../Modal/Modal';
import { Task } from '../../types';
import { taskUtils } from '../../utils/taskUtils';
import './TaskListModal.css';

interface TaskListModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: string;
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
    title?: string;
    viewMode?: 'list' | 'sticky';
}

const TaskListModal = ({
    isOpen,
    onClose,
    selectedDate,
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
}: TaskListModalProps) => {
    const [quickAddTitle, setQuickAddTitle] = (React as any).useState('');

    const handleQuickAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickAddTitle.trim()) return;
        onAddTask(quickAddTitle);
        setQuickAddTitle('');
    };
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    };

    const sortedTasks = (React as any).useMemo(() => {
        return taskUtils.sortTasks(tasks);
    }, [tasks]);

    const modalTitle = (
        <div className="task-modal-title-section">
            <h2>{title || '📋 任務列表'}</h2>
            {!title && <span className="task-modal-date">{formatDate(selectedDate)}</span>}
        </div>
    );

    const headerActions = (
        <div className="task-modal-header-actions">
            {onClearCompleted && tasks.some(t => t.completed) && (
                <button
                    className="task-modal-clear-btn"
                    onClick={onClearCompleted}
                    title="清除已完成"
                >
                    🗑️ 清除已完成
                </button>
            )}
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            headerActions={headerActions}
            className="task-list-modal"
        >
            <div className="task-modal-filter">
                <Filter
                    filter={filter}
                    onFilterChange={onFilterChange}
                    onClearFilter={onClearFilter}
                />
            </div>

            <div className="task-modal-body-content">
                <form className="task-modal-quick-add" onSubmit={handleQuickAdd}>
                    <input
                        type="text"
                        placeholder="在此日期快速新增任務..."
                        value={quickAddTitle}
                        onChange={(e) => setQuickAddTitle(e.target.value)}
                    />
                    <button type="submit" disabled={!quickAddTitle.trim()}>
                        ➕
                    </button>
                </form>

                <div className="task-modal-stats">
                    <span className="stat-item">總計：{tasks.length} 項</span>
                    <span className="stat-item">未完成：{tasks.filter(t => !t.completed).length} 項</span>
                    <span className="stat-item">已完成：{tasks.filter(t => t.completed).length} 項</span>
                </div>

                {tasks.length === 0 ? (
                    <div className="task-modal-empty">
                        <div className="empty-icon">📝</div>
                        <h3>{selectedDate ? '這個日期還沒有任務' : '目前沒有待辦事項'}</h3>
                        <p>{selectedDate ? '點擊「新增當日任務」來開始添加您的第一個任務吧！' : '點擊「新增待辦」開始添加您的第一個待辦吧！'}</p>
                    </div>
                ) : (
                    <div className={`task-modal-items ${viewMode === 'sticky' ? 'sticky-wall' : ''}`}>
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
        </Modal>
    );
};

export default TaskListModal;
