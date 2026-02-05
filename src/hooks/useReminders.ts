import { useState, useEffect } from 'react';
import { Task } from '../types';
import { dateUtils } from '../utils/dateUtils';

interface ReminderOptions {
    tasks: Task[];
    onTrigger?: (task: Task) => void;
    isElectron: boolean;
    electronAPI?: any;
}

export const useReminders = ({ tasks, onTrigger, isElectron, electronAPI }: ReminderOptions) => {
    const [reminderQueue, setReminderQueue] = useState<Task[]>([]);
    const [remindedKeys] = useState(() => new Set<string>());

    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();
            const currentDate = dateUtils.dateToString(now);

            const newReminders: Task[] = [];
            tasks.forEach(task => {
                if (task.completed || !task.time) return;

                if (task.date === currentDate) {
                    const taskDateTime = new Date(`${task.date}T${task.time}`);
                    const reminderTime = new Date(taskDateTime.getTime() - 10 * 60 * 1000);

                    if (now >= reminderTime && now < taskDateTime) {
                        const key = `${task.id}-${task.time}`;
                        if (!remindedKeys.has(key)) {
                            newReminders.push(task);
                            remindedKeys.add(key);

                            if (isElectron && electronAPI) {
                                electronAPI.sendNotification({
                                    title: '任務提醒',
                                    body: `任務: ${task.title}${task.time ? `\n時間: ${task.time}` : ''}`
                                });
                                electronAPI.restoreWindow();
                            } else if ('Notification' in window && Notification.permission === 'granted') {
                                new Notification('任務提醒', {
                                    body: `任務: ${task.title}${task.time ? `\n時間: ${task.time}` : ''}`
                                });
                            }
                        }
                    }
                }
            });

            if (newReminders.length > 0) {
                setReminderQueue(prev => [...prev, ...newReminders]);
                newReminders.forEach(task => onTrigger?.(task));
            }
        };

        const intervalId = setInterval(checkReminders, 120000);
        checkReminders();
        return () => clearInterval(intervalId);
    }, [tasks, remindedKeys, isElectron, electronAPI, onTrigger]);

    useEffect(() => {
        if (reminderQueue.length > 0) {
            document.title = `(${reminderQueue.length}) ToDoCalendar`;
            const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
            if (favicon) {
                favicon.href = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>❗</text></svg>';
            }
        } else {
            document.title = 'ToDoCalendar';
            const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
            if (favicon) {
                favicon.href = '/vite.svg';
            }
        }
    }, [reminderQueue.length]);

    const dismissReminder = () => {
        setReminderQueue(prev => prev.slice(1));
    };

    return {
        reminderQueue,
        dismissReminder
    };
};
