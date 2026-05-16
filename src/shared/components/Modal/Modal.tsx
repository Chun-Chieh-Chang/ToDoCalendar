import * as React from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { useTranslation } from '../../../utils/i18n';
import './Modal.css';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: React.ReactNode;
    children: any;
    className?: string; // For customized modal content styling
    headerActions?: React.ReactNode; // For extra buttons in header
}

const Modal = ({ isOpen, onClose, title, children, className = '', headerActions }: ModalProps) => {
    const language = useAppStore(state => state.settings.language);
    const t = useTranslation(language);

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
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-overlay"
                    onClick={handleBackdropClick}
                    onKeyDown={handleKeyDown}
                    tabIndex={-1}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div 
                        className={`modal-content ${className}`} 
                        role="dialog" 
                        aria-modal="true"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <div className="modal-header">
                            <div className="modal-title-wrapper">
                                {typeof title === 'string' ? <h2>{title}</h2> : title}
                            </div>
                            <div className="modal-actions">
                                {headerActions}
                                <button
                                    className="modal-close"
                                    onClick={onClose}
                                    aria-label={t('closeLabel') || 'Close'}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="modal-body">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
