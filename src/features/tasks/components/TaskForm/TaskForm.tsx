import React, { useState, useEffect } from 'react';
import Modal from '../../../../shared/components/Modal/Modal';
import { Task, Subtask } from '../../../../types';
import { useAppStore } from '../../../../store/useAppStore';
import { useTranslation } from '../../../../utils/i18n';
import { parseTaskTitle } from '../../../../utils/nlpUtils';
import { taskUtils } from '../../utils/taskUtils';
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
  const state = useAppStore();
  const t = useTranslation(state.settings.language);
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
      newErrors.title = t('titleRequired');
    } else if (formData.title.length > 100) {
      newErrors.title = t('titleTooLong').replace('{max}', '100');
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
    { value: 'high', label: t('high') },
    { value: 'medium', label: t('medium') },
    { value: 'low', label: t('low') }
  ];



  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={initialTask ? t('editTask') : t('addTask')}>
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="title">{t('taskTitle')} *</label>
          <div className="title-input-wrapper">
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={errors.title ? 'error' : ''}
              placeholder={t('titlePlaceholder')}
              maxLength={100}
            />
            <button
              type="button"
              className="magic-btn"
              onClick={applyMagicParsing}
              title={t('magicParse')}
            >
              🪄
            </button>
          </div>
          {errors.title && <span className="error-message">{errors.title}</span>}
          <div className="char-count">{formData.title.length}/100</div>
        </div>

        <div className="form-group">
          <label htmlFor="description">{t('detailDescription')}</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder={t('descriptionPlaceholder')}
            rows={3}
            maxLength={500}
          />
          <div className="char-count">{formData.description.length}/500</div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">{t('taskDate')}</label>
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
                <label htmlFor="pending">{t('pendingNoDate')}</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="time">{t('time24h')}</label>
            <div className="time-select-group">
              <select
                name="hour"
                value={formData.time?.split(':')[0] || '00'}
                onChange={(e) => {
                  const hour = e.target.value;
                  const minute = formData.time?.split(':')[1] || '00';
                  setFormData(prev => ({ ...prev, time: `${hour}:${minute}` }));
                }}
                disabled={!formData.date}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i.toString().padStart(2, '0')}>
                    {i.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              <span className="time-separator">:</span>
              <select
                name="minute"
                value={formData.time?.split(':')[1] || '00'}
                onChange={(e) => {
                  const minute = e.target.value;
                  const hour = formData.time?.split(':')[0] || '00';
                  setFormData(prev => ({ ...prev, time: `${hour}:${minute}` }));
                }}
                disabled={!formData.date}
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i.toString().padStart(2, '0')}>
                    {i.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priority">{t('taskPriority')} *</label>
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
            <label htmlFor="category">{t('taskCategory')} *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              {state.settings.categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {taskUtils.getCategoryLabel(cat, t)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="recurrence">{t('recurrence')}</label>
            <select
              id="recurrence"
              name="recurrence"
              value={formData.recurrence || 'none'}
              onChange={handleInputChange}
            >
              <option value="none">{t('recurNone')}</option>
              <option value="daily">{t('recurDaily')}</option>
              <option value="weekly">{t('recurWeekly')}</option>
              <option value="monthly">{t('recurMonthly')}</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>{t('subtasks')}</label>
          <div className="subtask-input-row">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder={t('subtaskPlaceholder')}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
            />
            <button type="button" onClick={handleAddSubtask} className="btn-add-subtask">{t('add')}</button>
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
          <label htmlFor="notes">{t('notes')}</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleInputChange}
            placeholder={t('notesPlaceholder')}
            rows={4}
            maxLength={1000}
          />
          <div className="char-count">{(formData.notes || '').length}/1000</div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleClose} className="btn-cancel">
            {t('cancel')}
          </button>
          <button type="submit" className="btn-submit">
            {initialTask ? t('saveChanges') : t('addTask')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;