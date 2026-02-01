import React, { useState, useEffect } from 'react';
import Modal from '../Modal/Modal';
import { Task, Subtask, RecurrenceType } from '../../types';
import { useAppContext } from '../../store/AppContext';
import { parseTaskTitle } from '../../utils/nlpUtils';
import './TaskForm.css';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  initialTask?: Task;
  selectedDate: string;
}

const TaskForm = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  selectedDate
}: TaskFormProps) => {
  const { state } = useAppContext();
  const [formData, setFormData] = useState<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>>({
    title: '',
    description: '',
    date: selectedDate,
    time: '',
    priority: 'medium',
    category: state.settings.categories[0]?.id || 'other',
    notes: '',
    subtasks: [],
    status: 'todo',
    recurrence: 'none'
  });

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialTask) {
      setFormData({
        title: initialTask.title || '',
        description: initialTask.description || '',
        date: initialTask.date !== undefined ? initialTask.date : selectedDate,
        time: initialTask.time || '',
        priority: initialTask.priority || 'medium',
        category: initialTask.category || (state.settings.categories[0]?.id || 'other'),
        notes: initialTask.notes || '',
        subtasks: initialTask.subtasks || [],
        status: initialTask.status || (initialTask.completed ? 'done' : 'todo'),
        recurrence: initialTask.recurrence || 'none'
      });
    } else {
      setFormData(prev => ({
        ...prev,
        date: selectedDate,
        time: '',
        subtasks: [],
        status: 'todo'
      }));
    }
    setErrors({});
  }, [initialTask, selectedDate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const applyMagicParsing = () => {
    const parsed = parseTaskTitle(formData.title);
    setFormData(prev => ({
      ...prev,
      title: parsed.title,
      priority: parsed.priority || prev.priority,
      category: parsed.category || prev.category,
      time: parsed.time || prev.time,
      date: parsed.date || prev.date
    }));
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSubtask: Subtask = {
      id: Date.now().toString(),
      title: newSubtaskTitle.trim(),
      completed: false
    };
    setFormData(prev => ({
      ...prev,
      subtasks: [...(prev.subtasks || []), newSubtask]
    }));
    setNewSubtaskTitle('');
  };

  const toggleSubtask = (id: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks?.map(st =>
        st.id === id ? { ...st, completed: !st.completed } : st
      )
    }));
  };

  const removeSubtask = (id: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks?.filter(st => st.id !== id)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '請輸入任務標題';
    } else if (formData.title.length > 100) {
      newErrors.title = '標題不能超過100個字符';
    }

    // Date is now optional for pending tasks
    // if (!formData.date) {
    //   newErrors.date = '請選擇日期';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const taskData: Task = {
      ...formData,
      id: initialTask?.id || '',
      completed: initialTask?.completed || false,
      createdAt: initialTask?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(taskData);
    onClose();
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const priorityOptions = [
    { value: 'high', label: '高', color: '#e74c3c' },
    { value: 'medium', label: '中', color: '#f39c12' },
    { value: 'low', label: '低', color: '#27ae60' }
  ];

  const categoryOptions = [
    { value: 'work', label: '工作' },
    { value: 'study', label: '學習' },
    { value: 'life', label: '生活' },
    { value: 'other', label: '其他' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={initialTask ? '編輯任務' : '新增任務'}>
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="title">任務標題 *</label>
          <div className="title-input-wrapper">
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={errors.title ? 'error' : ''}
              placeholder="請輸入任務標題 (可用 !high #work @14:00 ^today 解析)"
              maxLength={100}
            />
            <button
              type="button"
              className="magic-btn"
              onClick={applyMagicParsing}
              title="智慧解析標籤"
            >
              🪄
            </button>
          </div>
          {errors.title && <span className="error-message">{errors.title}</span>}
          <div className="char-count">{formData.title.length}/100</div>
        </div>

        <div className="form-group">
          <label htmlFor="description">詳細描述</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="請描述任務的詳細內容"
            rows={3}
            maxLength={500}
          />
          <div className="char-count">{formData.description.length}/500</div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">日期</label>
            <div className="date-input-wrapper">
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={errors.date ? 'error' : ''}
                disabled={!formData.date}
              />
              <div className="pending-checkbox">
                <input
                  type="checkbox"
                  id="pending"
                  checked={!formData.date}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({ ...prev, date: '' }));
                    } else {
                      setFormData(prev => ({ ...prev, date: selectedDate || new Date().toISOString().split('T')[0] }));
                    }
                  }}
                />
                <label htmlFor="pending">待辦清單 (無日期)</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="time">時間</label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              disabled={!formData.date}
            />
          </div>

          <div className="form-group">
            <label htmlFor="priority">優先級 *</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">分類 *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              {state.settings.categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="recurrence">重複頻率</label>
            <select
              id="recurrence"
              name="recurrence"
              value={formData.recurrence || 'none'}
              onChange={handleInputChange}
            >
              <option value="none">不重複</option>
              <option value="daily">每日</option>
              <option value="weekly">每週</option>
              <option value="monthly">每月</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>子任務</label>
          <div className="subtask-input-row">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="新增子任務..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
            />
            <button type="button" onClick={handleAddSubtask} className="btn-add-subtask">新增</button>
          </div>
          <div className="subtasks-list">
            {formData.subtasks?.map(st => (
              <div key={st.id} className="subtask-item">
                <input
                  type="checkbox"
                  checked={st.completed}
                  onChange={() => toggleSubtask(st.id)}
                />
                <span className={st.completed ? 'completed' : ''}>{st.title}</span>
                <button type="button" onClick={() => removeSubtask(st.id)} className="btn-remove-subtask">×</button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">記事</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleInputChange}
            placeholder="在這裡記錄相關的記事或備忘"
            rows={4}
            maxLength={1000}
          />
          <div className="char-count">{(formData.notes || '').length}/1000</div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleClose} className="btn-cancel">
            取消
          </button>
          <button type="submit" className="btn-submit">
            {initialTask ? '儲存變更' : '新增任務'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;