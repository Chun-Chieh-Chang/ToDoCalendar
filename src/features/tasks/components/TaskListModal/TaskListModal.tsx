import React from 'react';
import TaskCard from '../TaskCard/TaskCard';
import Filter from '../Filter/Filter';
import Modal from '../../../../shared/components/Modal/Modal';
import { Task } from '../../../../types';
import { taskUtils } from '../../utils/taskUtils';
import { useAppStore } from '../../../../store/useAppStore';
import { useTranslation } from '../../../../utils/i18n';
import './TaskListModal.css';
import { AnimatePresence } from 'framer-motion';

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
    const language = useAppStore(state => state.settings.language);
    const t = useTranslation(language);
    const [quickAddTitle, setQuickAddTitle] = (React as any).useState('');

    const handleQuickAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickAddTitle.trim()) return;
        onAddTask(quickAddTitle);
        setQuickAddTitle('');
    };

    const handleAddButtonClick = () => {
        if (!quickAddTitle.trim()) {
            onAddTask();
        } else {
            onAddTask(quickAddTitle);
            setQuickAddTitle('');
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString(language === 'en' ? 'en-US' : 'zh-TW', {
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
            <h2>{title || t('taskListTitle')}</h2>
            {!title && <span className="task-modal-date">{formatDate(selectedDate)}</span>}
        </div>
    );

    const headerActions = (
        <div className="task-modal-header-actions">
            {onClearCompleted && tasks.some(t => t.completed) && (
                <button
                    className="task-modal-clear-btn"
                    onClick={onClearCompleted}
                    title={t('clearCompleted')}
                >
                    <i className="ri-delete-bin-line"></i> {t('clearCompleted')}
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
                    <i className="ri-flashlight-line"></i>
                    <input
                        type="text"
                        placeholder={t('quickAddEnterPlaceholder')}
                        value={quickAddTitle}
                        onChange={(e) => setQuickAddTitle(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={handleAddButtonClick}
                        title={quickAddTitle.trim() ? t('quickAdd') : t('openFullForm')}
                        className="quick-add-submit-btn"
                    >
                        <i className={quickAddTitle.trim() ? "ri-add-fill" : "ri-file-add-line"}></i>
                    </button>
                </form>

                <div className="task-modal-stats">
                    <span className="stat-item">{t('totalCount').replace('{count}', String(tasks.length))}</span>
                    <span className="stat-item">{t('incompleteCount').replace('{count}', String(tasks.filter(task => !task.completed).length))}</span>
                    <span className="stat-item">{t('completedCount').replace('{count}', String(tasks.filter(task => task.completed).length))}</span>
                </div>

                {tasks.length === 0 ? (
                    <div className="task-modal-empty">
                        <div className="empty-icon">📝</div>
                        <h3>{selectedDate ? t('emptyDateTitle') : t('emptyBacklogTitle')}</h3>
                        <p>{selectedDate ? t('emptyDateHint') : t('emptyBacklogHint')}</p>
                    </div>
                ) : (
                    <div className={`task-modal-items ${viewMode === 'sticky' ? 'sticky-wall' : ''}`}>
                        <AnimatePresence mode="popLayout">
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
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default TaskListModal;
