import { describe, it, expect, beforeEach, vi } from 'vitest';

const storage = vi.hoisted(() => ({
  loadAllData: vi.fn(),
  saveAllData: vi.fn(() => Promise.resolve()),
}));
vi.mock('../services/storage', () => ({ storageService: storage }));

import { useAppStore } from './useAppStore';
import { defaultSettings, defaultFilter } from '../constants/defaults';
import { Task } from '../types';

const baseTask = (overrides: Partial<Task> = {}): Task => ({
  id: 't1', title: 'Task', description: '', date: '2026-09-23', time: '', priority: 'medium',
  category: 'work', completed: false, createdAt: '', updatedAt: '', ...overrides,
} as Task);

beforeEach(() => {
  useAppStore.setState({ tasks: [], settings: { ...defaultSettings }, filter: { ...defaultFilter }, isLoaded: false });
  storage.loadAllData.mockReset();
  storage.saveAllData.mockClear();
});

describe('task actions', () => {
  it('adds, updates and deletes tasks', () => {
    const s = useAppStore.getState();
    s.addTask(baseTask());
    s.updateTask(baseTask({ title: 'Renamed' }));
    expect(useAppStore.getState().tasks.map(t => t.title)).toEqual(['Renamed']);
    s.deleteTask('t1');
    expect(useAppStore.getState().tasks).toEqual([]);
  });

  it('toggles completion both ways', () => {
    useAppStore.getState().addTask(baseTask());
    useAppStore.getState().toggleTaskCompletion('t1');
    expect(useAppStore.getState().tasks[0].completed).toBe(true);
    useAppStore.getState().toggleTaskCompletion('t1');
    expect(useAppStore.getState().tasks[0].completed).toBe(false);
  });

  it.each([
    ['daily', '2026-09-24'],
    ['weekly', '2026-09-30'],
    ['monthly', '2026-10-23'],
  ])('spawns the next %s occurrence when completing a recurring task', (recurrence, nextDate) => {
    useAppStore.getState().addTask(baseTask({ recurrence: recurrence as Task['recurrence'] }));
    useAppStore.getState().toggleTaskCompletion('t1');
    const [done, next] = useAppStore.getState().tasks;
    expect(done.completed).toBe(true);
    expect(next).toMatchObject({ date: nextDate, completed: false, parentId: 't1', recurrence });
  });

  it('does not spawn for non-recurring or undated tasks', () => {
    useAppStore.getState().addTask(baseTask({ recurrence: 'none' }));
    useAppStore.getState().addTask(baseTask({ id: 't2', recurrence: 'daily', date: '' }));
    useAppStore.getState().toggleTaskCompletion('t1');
    useAppStore.getState().toggleTaskCompletion('t2');
    expect(useAppStore.getState().tasks).toHaveLength(2);
  });

  it('reorders by merging updated tasks', () => {
    useAppStore.getState().addTask(baseTask());
    useAppStore.getState().reorderTasks([baseTask({ order: 5 })]);
    expect(useAppStore.getState().tasks[0].order).toBe(5);
  });

  it('merges filter and settings updates', () => {
    useAppStore.getState().setFilter({ search: 'x' });
    useAppStore.getState().setSettings({ theme: 'dark' });
    expect(useAppStore.getState().filter).toMatchObject({ search: 'x', status: 'all' });
    expect(useAppStore.getState().settings).toMatchObject({ theme: 'dark', language: 'zh-TW' });
  });
});

describe('loadData', () => {
  it('creates a welcome task on a fresh start', async () => {
    storage.loadAllData.mockResolvedValue({ tasks: [], settings: {}, filter: {}, selectedDate: null });
    await useAppStore.getState().loadData();
    const s = useAppStore.getState();
    expect(s.isLoaded).toBe(true);
    expect(s.tasks).toHaveLength(1);
    expect(s.settings).toEqual(defaultSettings);
  });

  it('migrates legacy en-US and drops removed glass settings', async () => {
    storage.loadAllData.mockResolvedValue({
      tasks: [baseTask()],
      settings: { language: 'en-US', theme: 'dark', glassOpacity: 0.3, glassBlur: 10, borderOpacity: 0.5 },
      filter: {}, selectedDate: '2026-09-01',
    });
    await useAppStore.getState().loadData();
    const s = useAppStore.getState();
    expect(s.settings.language).toBe('en');
    expect(s.settings.theme).toBe('dark');
    expect(s.settings).not.toHaveProperty('glassOpacity');
    expect(s.settings).not.toHaveProperty('glassBlur');
    expect(s.settings).not.toHaveProperty('borderOpacity');
    expect(s.selectedDate).toBe('2026-09-01');
    expect(s.tasks).toHaveLength(1);
  });

  it('still marks the store loaded when storage fails', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    storage.loadAllData.mockRejectedValue(new Error('boom'));
    await useAppStore.getState().loadData();
    expect(useAppStore.getState().isLoaded).toBe(true);
    err.mockRestore();
  });
});

describe('auto-save', () => {
  it('saves only after data is loaded', () => {
    useAppStore.getState().addTask(baseTask());
    expect(storage.saveAllData).not.toHaveBeenCalled();
    useAppStore.setState({ isLoaded: true });
    useAppStore.getState().addTask(baseTask({ id: 't2' }));
    expect(storage.saveAllData).toHaveBeenCalled();
  });
});
