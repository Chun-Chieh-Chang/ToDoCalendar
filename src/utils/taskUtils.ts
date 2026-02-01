import { Task } from '../types';

export const taskUtils = {
    /**
     * 標準化的任務過濾邏輯
     */
    filterTasks(tasks: Task[], filter: any): Task[] {
        return tasks.filter(task => {
            if (filter.priority && task.priority !== filter.priority) return false;
            if (filter.category && task.category !== filter.category) return false;
            if (filter.status && filter.status !== 'all') {
                if (filter.status === 'completed' && !task.completed) return false;
                if (filter.status === 'pending' && task.completed) return false;
            }
            if (filter.search) {
                const search = filter.search.toLowerCase();
                const matchesTitle = task.title.toLowerCase().includes(search);
                const matchesDescription = task.description.toLowerCase().includes(search);
                const matchesNotes = task.notes?.toLowerCase().includes(search) || false;
                if (!matchesTitle && !matchesDescription && !matchesNotes) return false;
            }
            return true;
        });
    },

    /**
     * 標準化的任務排序邏輯 (未完成在前, 優先級高在前)
     */
    sortTasks(tasks: Task[]): Task[] {
        const priorityOrder: { [key: string]: number } = { high: 0, medium: 1, low: 2 };

        return [...tasks].sort((a, b) => {
            // 首先按完成狀態排序
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            // 然後按優先級排序
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    },

    /**
     * 創建默認任務對象
     */
    createDefaultTask(overrides: Partial<Task> = {}): Task {
        return {
            id: Date.now().toString(),
            title: '',
            description: '',
            date: '',
            time: '',
            priority: 'medium',
            category: 'work' as any,
            notes: '',
            status: 'todo' as any,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            order: 0,
            ...overrides
        } as Task;
    }
};
