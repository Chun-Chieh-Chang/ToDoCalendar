import { describe, it, expect } from 'vitest';
import { taskUtils } from './taskUtils';
import { Task } from '../../../types';

const task = (overrides: Partial<Task>): Task => taskUtils.createDefaultTask(overrides);

const tasks: Task[] = [
  task({ id: '1', title: 'Write report', description: 'quarterly', priority: 'low', category: 'work', completed: false }),
  task({ id: '2', title: 'Read book', description: '', notes: 'chapter 3', priority: 'high', category: 'study', completed: true }),
  task({ id: '3', title: 'Groceries', description: 'milk', priority: 'high', category: 'life', completed: false }),
  task({ id: '4', title: 'Misc', description: '', priority: 'medium', category: 'other', completed: false }),
];

describe('taskUtils.filterTasks', () => {
  it('returns everything with an empty filter', () => {
    expect(taskUtils.filterTasks(tasks, { status: 'all' })).toHaveLength(4);
  });

  it('filters by priority, category and status', () => {
    expect(taskUtils.filterTasks(tasks, { priority: 'high' }).map(t => t.id)).toEqual(['2', '3']);
    expect(taskUtils.filterTasks(tasks, { category: 'study' }).map(t => t.id)).toEqual(['2']);
    expect(taskUtils.filterTasks(tasks, { status: 'completed' }).map(t => t.id)).toEqual(['2']);
    expect(taskUtils.filterTasks(tasks, { status: 'pending' }).map(t => t.id)).toEqual(['1', '3', '4']);
  });

  it('searches title, description and notes case-insensitively', () => {
    expect(taskUtils.filterTasks(tasks, { search: 'REPORT' }).map(t => t.id)).toEqual(['1']);
    expect(taskUtils.filterTasks(tasks, { search: 'milk' }).map(t => t.id)).toEqual(['3']);
    expect(taskUtils.filterTasks(tasks, { search: 'chapter' }).map(t => t.id)).toEqual(['2']);
  });

  it('combines criteria', () => {
    expect(taskUtils.filterTasks(tasks, { priority: 'high', status: 'pending' }).map(t => t.id)).toEqual(['3']);
  });
});

describe('taskUtils.sortTasks', () => {
  it('puts incomplete first, then orders by priority, without mutating input', () => {
    const input = [...tasks];
    expect(taskUtils.sortTasks(input).map(t => t.id)).toEqual(['3', '4', '1', '2']);
    expect(input.map(t => t.id)).toEqual(['1', '2', '3', '4']);
  });
});

describe('taskUtils.getCategoryLabel', () => {
  const t = (key: string) => `T(${key})`;
  it('translates built-in categories', () => {
    expect(taskUtils.getCategoryLabel({ id: 'work', name: '工作' }, t)).toBe('T(work)');
  });
  it('keeps custom category names', () => {
    expect(taskUtils.getCategoryLabel({ id: 'gym', name: 'Gym' }, t)).toBe('Gym');
  });
});

describe('taskUtils.createDefaultTask', () => {
  it('fills defaults and applies overrides', () => {
    const t = task({ title: 'X' });
    expect(t).toMatchObject({ title: 'X', priority: 'medium', category: 'work', completed: false, status: 'todo' });
    expect(t.id).toBeTruthy();
  });
});
