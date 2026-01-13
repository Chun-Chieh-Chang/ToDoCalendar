import React, { useMemo } from 'react';
import TaskCard from '../TaskCard/TaskCard';
import Filter from '../Filter/Filter';
import Modal from '../Modal/Modal';
import { Task } from '../../types';
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
    onAddTask: () => void;
    title?: string;
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
    title
}: TaskListModalProps) => {
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

    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => {
            // 首先按完成狀態排序（未完成的在前）
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            // 然後按優先級排序（高->中->低）
            const priorityOrder: { [key: string]: number } = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }, [tasks]);

    const modalTitle = (
        <div className="task-modal-title-section">
            <h2>{title || '📋 任務列表'}</h2>
            {!title && <span className="task-modal-date">{formatDate(selectedDate)}</span>}
        </div>
    );

    const headerActions = (
        <button
            className="task-modal-add-btn"
            onClick={onAddTask}
            title={selectedDate ? '新增當日任務' : '新增待辦'}
        >
            {selectedDate ? '➕ 新增當日任務' : '➕ 新增待辦'}
        </button>
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
                    <div className="task-modal-items">
                        {sortedTasks.map(task => (
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
        </Modal>
    );
};

export default TaskListModal;
