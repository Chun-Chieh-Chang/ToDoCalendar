import React from 'react';
import { Task } from '../../types';
import { useAppContext } from '../../store/AppContext';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string | number) => void;
  onSchedule?: (id: string, date: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onSchedule
}) => {
  const { t } = useAppContext();

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          backgroundColor: 'var(--priority-high-bg)',
          color: 'var(--priority-high-text)',
          borderColor: 'var(--priority-high-border)'
        };
      case 'medium':
        return {
          backgroundColor: 'var(--priority-medium-bg)',
          color: 'var(--priority-medium-text)',
          borderColor: 'var(--priority-medium-border)'
        };
      case 'low':
        return {
          backgroundColor: 'var(--priority-low-bg)',
          color: 'var(--priority-low-text)',
          borderColor: 'var(--priority-low-border)'
        };
      default:
        return {};
    }
  };

  return (
    <div className={`task-card ${task.completed ? 'completed' : ''}`}>
      <div className="task-card-header">
        <div className="task-checkbox">
          <input
            type="checkbox"
            id={`task-${task.id}`}
            checked={task.completed}
            onChange={() => onToggleComplete(task.id, !task.completed)}
          />
          <label htmlFor={`task-${task.id}`} className="checkbox-label">
            {task.completed && <div className="checkmark"></div>}
          </label>
        </div>

        <span className="task-priority" style={getPriorityStyle(task.priority)}>
          {t(task.priority)}
        </span>

        {task.category && (
          <span className="task-category">
            {t(task.category.toLowerCase()) || task.category}
          </span>
        )}

        <div className="task-actions">
          <button className="action-btn edit-btn" onClick={() => onEdit(task)} title={t('editTask')}>
            <i className="ri-pencil-line"></i>
          </button>
          <button className="action-btn delete-btn" onClick={() => onDelete(task.id)} title={t('deleteTask')}>
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>

      {!task.date && onSchedule && (
        <div className="task-quick-schedule">
          <button onClick={() => onSchedule(task.id, new Date().toISOString().split('T')[0])}>
            {t('scheduledToToday')}
          </button>
          <button onClick={() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            onSchedule(task.id, tomorrow.toISOString().split('T')[0]);
          }}>
            {t('scheduledToTomorrow')}
          </button>
        </div>
      )}

      <div className="task-content">
        <div className="task-title-row">
          <h3 className="task-title">{task.title}</h3>
          {task.subtasks && task.subtasks.length > 0 && (
            <span className="subtask-badge">
              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
            </span>
          )}
        </div>
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
        {task.notes && (
          <div className="task-notes">
            <h4>{t('taskNotes')}</h4>
            <p>{task.notes}</p>
          </div>
        )}
      </div>

      <div className="task-footer">
        <span className="task-time">
          {task.time ? `⏰ ${task.time}` : ''}
          {task.date ? ` 📅 ${task.date}` : ''}
        </span>
        <span className="task-date-info">
          {t('createdAt')}: {new Date(task.createdAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;