import { Task } from '../../types';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onSchedule?: (id: string, date: string) => void;
}

const TaskCard = ({ task, onToggleComplete, onEdit, onDelete, onSchedule }: TaskCardProps) => {
  const priorityColors: { [key: string]: { bg: string; text: string; border: string } } = {
    high: { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' },
    medium: { bg: '#fef3c7', text: '#d97706', border: '#fde68a' },
    low: { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' }
  };

  const categoryLabels: { [key: string]: string } = {
    work: '工作',
    study: '學習',
    life: '生活',
    other: '其他'
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div
      className={`task-card ${task.completed ? 'completed' : ''}`}
      data-priority={task.priority}
    >
      <div className="task-card-header">
        <div className="task-checkbox">
          <input
            type="checkbox"
            id={`task-${task.id}`}
            checked={task.completed}
            onChange={() => onToggleComplete(task.id)}
            aria-label={`標記${task.title}為${task.completed ? '未完成' : '已完成'}`}
          />
          <label htmlFor={`task-${task.id}`} className="checkbox-label">
            <span className="checkmark"></span>
          </label>
        </div>

        <div className="task-priority" style={{
          backgroundColor: priorityColors[task.priority].bg,
          color: priorityColors[task.priority].text,
          borderColor: priorityColors[task.priority].border
        }}>
          {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
        </div>

        <div className="task-category">
          {categoryLabels[task.category]}
        </div>

        <div className="task-actions">
          <button
            className="action-btn edit-btn"
            onClick={() => onEdit(task)}
            aria-label={`編輯${task.title}`}
            title="編輯任務"
          >
            ✏️
          </button>
          <button
            className="action-btn delete-btn"
            onClick={() => onDelete(task.id)}
            aria-label={`刪除${task.title}`}
            title="刪除任務"
          >
            🗑️
          </button>
        </div>
      </div>

      {!task.date && onSchedule && (
        <div className="task-quick-schedule">
          <button onClick={() => onSchedule(task.id, new Date().toISOString().split('T')[0])}>
            📅 排到今日
          </button>
          <button onClick={() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            onSchedule(task.id, tomorrow.toISOString().split('T')[0]);
          }}>
            ⏭️ 明天
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
            <h4>記事：</h4>
            <p>{task.notes}</p>
          </div>
        )}
      </div>

      <div className="task-footer">
        <span className="task-date">📅 {task.date ? formatDate(task.date) : '無日期'}</span>
        <span className="task-time">
          建立時間：{new Date(task.createdAt).toLocaleString('zh-TW')}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;