import React from 'react';
import { Task, TaskStatus } from '../../types';
import TaskCard from '../TaskCard/TaskCard';
import './KanbanBoard.css';

interface KanbanBoardProps {
    tasks: Task[];
    onToggleComplete: (id: string) => void;
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
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, status: TaskStatus, targetTaskId?: string) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (!taskId) return;

        const columnTasks = sortedTasks.filter(t => getTaskStatus(t) === status);
        const movedTask = tasks.find(t => t.id === taskId);
        if (!movedTask) return;

        // If status changed
        if (getTaskStatus(movedTask) !== status) {
            onStatusChange(taskId, status);
            return;
        }

        // Intra-column reordering
        if (targetTaskId && taskId !== targetTaskId) {
            const oldIndex = columnTasks.findIndex(t => t.id === taskId);
            const newIndex = columnTasks.findIndex(t => t.id === targetTaskId);

            const newOrder = [...columnTasks];
            newOrder.splice(oldIndex, 1);
            newOrder.splice(newIndex, 0, movedTask);

            const updatedTasks = newOrder.map((task, idx) => ({
                ...task,
                order: idx,
                updatedAt: new Date().toISOString()
            }));

            onReorder(updatedTasks);
        }
    };

    return (
        <div className="kanban-board">
            {columns.map(column => (
                <div
                    key={column.id}
                    className="kanban-column"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                >
                    <div className="column-header">
                        <h3>{column.title}</h3>
                        <span className="task-count">
                            {tasks.filter(t => getTaskStatus(t) === column.id).length}
                        </span>
                    </div>
                    <div className="column-content">
                        {sortedTasks
                            .filter(task => getTaskStatus(task) === column.id)
                            .map(task => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                    onDrop={(e) => {
                                        e.stopPropagation();
                                        handleDrop(e, column.id, task.id);
                                    }}
                                    className="draggable-task"
                                >
                                    <TaskCard
                                        task={task}
                                        onToggleComplete={onToggleComplete}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                    />
                                </div>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KanbanBoard;
