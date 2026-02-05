import { useEffect } from 'react';

interface ShortcutOptions {
    onNewTask: () => void;
    onViewChange: (view: any) => void;
}

export const useKeyboardShortcuts = ({ onNewTask, onViewChange }: ShortcutOptions) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
                return;
            }

            const key = e.key.toLowerCase();
            switch (key) {
                case 'n':
                    onNewTask();
                    break;
                case 'c':
                    onViewChange('calendar');
                    break;
                case 'k':
                    onViewChange('kanban');
                    break;
                case 't':
                    onViewChange('tasks');
                    break;
                case 'p':
                    onViewChange('pending');
                    break;
                case 'd':
                    onViewChange('dashboard');
                    break;
                case '/':
                    e.preventDefault();
                    console.log('Search focused');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onNewTask, onViewChange]);
};
