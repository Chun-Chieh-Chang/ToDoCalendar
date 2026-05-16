import React from 'react';
import { Task, TaskStatus } from '../../../../types';
import TaskCard from '../../../tasks/components/TaskCard/TaskCard';
import './KanbanBoard.css';
import { motion, AnimatePresence } from 'framer-motion';

interface KanbanBoardProps {
    tasks: Task[];
    onToggleComplete: (id: string, completed: boolean) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
    onReorder: (tasks: Task[]) => void;
    t: (key: string) => string;
}

const KanbanBoard = ({
    tasks,
    onToggleComplete,
    onEdit,
    onDelete,
    onStatusChange,
    onReorder,
    t
}: KanbanBoardProps) => {
    const columns: { id: TaskStatus; title: string }[] = [
        { id: 'todo', title: t('todo') },
        { id: 'in_progress', title: t('inProgress') },
        { id: 'done', title: t('done') }
    ];

    const getTaskStatus = (task: Task): TaskStatus => {
        if (task.completed) return 'done';
        return task.status || 'todo';
    };

    const sortedTasks = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData('taskId', taskId);
        e.dataTransfer.effectAllowed = 'move';
        
        // Add a class for visual styling during drag
        const target = e.currentTarget as HTMLElement;
        target.classList.add('is-dragging');
        
        // Ensure the task card itself handles the preview
        setTimeout(() => {
            target.style.opacity = '0.4';
        }, 0);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        const target = e.currentTarget as HTMLElement;
        target.classList.remove('is-dragging');
        target.style.opacity = '1';
        
        // Cleanup all drag-over classes
        document.querySelectorAll('.kanban-column').forEach(el => {
            el.classList.remove('drag-over');
        });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const column = e.currentTarget as HTMLElement;
        if (!column.classList.contains('drag-over')) {
            column.classList.add('drag-over');
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        const column = e.currentTarget as HTMLElement;
        column.classList.remove('drag-over');
    };

    const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
        e.preventDefault();
        const column = e.currentTarget as HTMLElement;
        column.classList.remove('drag-over');
        
        const taskId = e.dataTransfer.getData('taskId');
        if (!taskId) return;

        const movedTask = tasks.find(t => t.id === taskId);
        if (!movedTask) return;

        if (getTaskStatus(movedTask) !== status) {
            onStatusChange(taskId, status);
        }
    };

    return (
        <div className="kanban-board">
            {columns.map(column => (
                <div
                    key={column.id}
                    className="kanban-column"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.id)}
                >
                    <div className="column-header">
                        <h3>{column.title}</h3>
                        <span className="task-count">
                            {tasks.filter(t => getTaskStatus(t) === column.id).length}
                        </span>
                    </div>
                    
                    <div className="column-content">
                        <AnimatePresence mode="popLayout">
                            {sortedTasks
                                .filter(task => getTaskStatus(task) === column.id)
                                .map(task => (
                                    <motion.div
                                        key={task.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                        transition={{ 
                                            type: "spring", 
                                            stiffness: 400, 
                                            damping: 30,
                                            layout: { duration: 0.3 }
                                        }}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                        onDragEnd={handleDragEnd}
                                        className="draggable-task-container"
                                    >
                                        <TaskCard
                                            task={task}
                                            onToggleComplete={onToggleComplete}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                        />
                                    </motion.div>
                                ))}
                        </AnimatePresence>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KanbanBoard;
