import { describe, it, expect } from 'vitest';
import { getTWHoliday, getHolidayDisplayName } from './twHolidays';

describe('twHolidays', () => {
  it('looks up holidays by date', () => {
    expect(getTWHoliday('2026-09-25')).toEqual({ name: '中秋節', type: 'lunar' });
    expect(getTWHoliday('2026-09-24')).toBeNull();
  });

  it('keeps Chinese names for zh-TW', () => {
    expect(getHolidayDisplayName(getTWHoliday('2026-04-06')!, 'zh-TW')).toBe('清明節補假');
  });

  it.each([
    ['2026-01-01', "New Year's Day"],
    ['2026-02-16', "Lunar New Year's Eve"],
    ['2026-04-04', "Children's Day / Tomb Sweeping Day"],
    ['2026-04-06', 'Tomb Sweeping Day (Observed)'],
    ['2026-03-02', 'Peace Memorial Day (Observed)'],
    ['2027-10-11', 'National Day (Observed)'],
  ])('translates %s to "%s"', (date, name) => {
    expect(getHolidayDisplayName(getTWHoliday(date)!, 'en')).toBe(name);
  });

  it('has an English name for every holiday in the table', () => {
    for (let y = 2024; y <= 2027; y++) {
      for (let d = new Date(y, 0, 1); d.getFullYear() === y; d.setDate(d.getDate() + 1)) {
        const key = `${y}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const h = getTWHoliday(key);
        if (h) expect(getHolidayDisplayName(h, 'en'), key).not.toMatch(/[一-鿿]/);
      }
    }
  });
});
