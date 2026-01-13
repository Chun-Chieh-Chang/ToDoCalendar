import * as React from 'react';
import './Modal.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: React.ReactNode;
    children: any;
    className?: string; // For customized modal content styling
    headerActions?: React.ReactNode; // For extra buttons in header
}

const Modal = ({ isOpen, onClose, title, children, className = '', headerActions }: ModalProps) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e: any) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div
            className="modal-overlay"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
        >
            <div className={`modal-content ${className}`} role="dialog" aria-modal="true">
                <div className="modal-header">
                    <div className="modal-title-wrapper">
                        {typeof title === 'string' ? <h2>{title}</h2> : title}
                    </div>
                    <div className="modal-actions">
                        {headerActions}
                        <button
                            className="modal-close"
                            onClick={onClose}
                            aria-label="關閉"
                        >
                            ✕
                        </button>
                    </div>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
