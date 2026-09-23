import { describe, it, expect } from 'vitest';
import { dateUtils } from './dateUtils';

describe('dateUtils', () => {
  const date = new Date(2026, 8, 5); // 2026-09-05 local

  it('dateToString formats as yyyy-MM-dd in local time', () => {
    expect(dateUtils.dateToString(date)).toBe('2026-09-05');
  });

  it('formatDate normalises YYYY/DD tokens', () => {
    expect(dateUtils.formatDate(date, 'YYYY-MM-DD', 'en')).toBe('2026-09-05');
    expect(dateUtils.formatDate(date, 'MM/dd', 'zh-TW')).toBe('09/05');
  });

  it('formatDate respects the locale', () => {
    expect(dateUtils.formatDate(date, 'MMMM', 'en')).toBe('September');
    expect(dateUtils.formatDate(date, 'MMMM', 'zh-TW')).toBe('九月');
  });
});
