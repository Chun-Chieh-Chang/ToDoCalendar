import React, { useEffect } from 'react';
import Modal from '../Modal/Modal';
import { Task } from '../../types';
import './ReminderModal.css';

interface ReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    onComplete: (taskId: string) => void;
}

const ReminderModal = ({ isOpen, onClose, task, onComplete }: ReminderModalProps) => {
    if (!task) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="reminder-title-wrapper">
                    <span className="reminder-icon">⏰</span>
                    <span>任務提醒</span>
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
                        我知道了
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            onComplete(task.id);
                            onClose();
                        }}
                    >
                        完成任務
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ReminderModal;
