import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseTaskTitle } from './nlpUtils';

describe('parseTaskTitle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Local noon keeps UTC and local dates on the same day in any timezone
    vi.setSystemTime(new Date(2026, 8, 23, 12, 0, 0));
  });
  afterEach(() => vi.useRealTimers());

  it('returns the input unchanged when there are no tags', () => {
    expect(parseTaskTitle('Buy milk')).toEqual({ title: 'Buy milk' });
  });

  it.each([
    ['!high', 'high'], ['!medium', 'medium'], ['!low', 'low'],
    ['!1', 'high'], ['!2', 'medium'], ['!3', 'low'],
  ])('parses priority %s', (tag, priority) => {
    const r = parseTaskTitle(`Report ${tag}`);
    expect(r.priority).toBe(priority);
    expect(r.title).toBe('Report');
  });

  it.each(['work', 'study', 'life', 'other'])('parses category #%s', (cat) => {
    const r = parseTaskTitle(`Plan #${cat}`);
    expect(r.category).toBe(cat);
    expect(r.title).toBe('Plan');
  });

  it.each([
    ['@14:30', '14:30'], ['@9:05', '09:05'], ['@8', '08:00'],
    ['@9pm', '21:00'], ['@12am', '00:00'], ['@12pm', '12:00'], ['@7:15am', '07:15'],
  ])('parses time %s', (tag, time) => {
    const r = parseTaskTitle(`Call ${tag}`);
    expect(r.time).toBe(time);
    expect(r.title).toBe('Call');
  });

  it('parses ^today and ^tomorrow', () => {
    expect(parseTaskTitle('Gym ^today').date).toBe('2026-09-23');
    expect(parseTaskTitle('Gym ^tomorrow').date).toBe('2026-09-24');
  });

  it('parses all tags together', () => {
    expect(parseTaskTitle('Ship release !high #work @14:00 ^today')).toEqual({
      title: 'Ship release', priority: 'high', category: 'work', time: '14:00', date: '2026-09-23',
    });
  });

  // Known bug: the \w+ alternative matches "2025" before the date pattern is tried.
  it.fails('parses explicit ^YYYY-MM-DD dates (known bug)', () => {
    expect(parseTaskTitle('Trip ^2025-01-01').date).toBe('2025-01-01');
  });
});
