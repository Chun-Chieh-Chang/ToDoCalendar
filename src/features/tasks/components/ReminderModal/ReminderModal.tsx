import React from 'react';
import Modal from '../../../../shared/components/Modal/Modal';
import { Task } from '../../../../types';
import { useAppStore } from '../../../../store/useAppStore';
import { useTranslation } from '../../../../utils/i18n';
import './ReminderModal.css';

interface ReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    onComplete: (taskId: string) => void;
}

const ReminderModal = ({ isOpen, onClose, task, onComplete }: ReminderModalProps) => {
    const language = useAppStore(state => state.settings.language);
    const t = useTranslation(language);

    if (!task) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="reminder-title-wrapper">
                    <span className="reminder-icon">⏰</span>
                    <span>{t('reminderTitle')}</span>
                </div>
            }
            className="reminder-modal"
        >
            <div className="reminder-content">
                <h3 className="reminder-task-title">{task.title}</h3>
                {task.time && <div className="reminder-time">{task.time}</div>}
                {task.description && <p className="reminder-description">{task.description}</p>}

                <div className="reminder-actions">
                    <button className="btn btn-secondary" onClick={onClose}>
                        {t('gotIt')}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            onComplete(task.id);
                            onClose();
                        }}
                    >
                        {t('reminderComplete')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ReminderModal;
