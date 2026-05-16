import { useEffect } from 'react';

interface ShortcutConfig {
    onNewTask: () => void;
    onSwitchView: (view: string) => void;
    onSearchFocus: () => void;
    onCloseModal: () => void;
    onGoToToday: () => void;
}

export const useKeyboardShortcuts = ({
    onNewTask,
    onSwitchView,
    onSearchFocus,
    onCloseModal,
    onGoToToday
}: ShortcutConfig) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // 1. 檢查是否正在輸入框中，若是則跳過快捷鍵
            const activeElement = document.activeElement;
            const isTyping = 
                activeElement instanceof HTMLInputElement || 
                activeElement instanceof HTMLTextAreaElement ||
                (activeElement as HTMLElement)?.isContentEditable;

            if (isTyping) {
                // 特殊情況：在輸入框中按 Esc 應取消焦點
                if (event.key === 'Escape') {
                    (activeElement as HTMLElement).blur();
                    onCloseModal();
                }
                return;
            }

            const key = event.key.toLowerCase();
            const isCmdOrCtrl = event.metaKey || event.ctrlKey;

            // 2. 指令映射
            switch (key) {
                case 'n':
                    event.preventDefault();
                    onNewTask();
                    break;
                case '1':
                    onSwitchView('calendar');
                    break;
                case '2':
                    onSwitchView('tasks');
                    break;
                case '3':
                    onSwitchView('kanban');
                    break;
                case '4':
                    onSwitchView('dashboard');
                    break;
                case 'g':
                    onSwitchView('guide');
                    break;
                case 't':
                    if (!isCmdOrCtrl) onGoToToday();
                    break;
                case '/':
                    event.preventDefault();
                    onSearchFocus();
                    break;
                case 'k':
                    if (isCmdOrCtrl) {
                        event.preventDefault();
                        onSearchFocus();
                    }
                    break;
                case 'escape':
                    onCloseModal();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onNewTask, onSwitchView, onSearchFocus, onCloseModal, onGoToToday]);
};
