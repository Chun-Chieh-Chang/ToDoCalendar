import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay, addMonths, subMonths, addDays } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';

export const dateUtils = {
  // Format date based on user preference
  formatDate(date: Date, formatStr: string, locale: 'zh-TW' | 'en'): string {
    const localeObj = locale === 'zh-TW' ? zhTW : enUS;
    // Fix common format mistakes: DD -> dd, YYYY -> yyyy
    const safeFormat = formatStr.replace(/DD/g, 'dd').replace(/YYYY/g, 'yyyy');
    return format(date, safeFormat, { locale: localeObj });
  },

  // Get month name
  getMonthName(date: Date, locale: 'zh-TW' | 'en'): string {
    const localeObj = locale === 'zh-TW' ? zhTW : enUS;
    return format(date, 'MMMM yyyy', { locale: localeObj });
  },

  // Get day name
  getDayName(date: Date, locale: 'zh-TW' | 'en'): string {
    const localeObj = locale === 'zh-TW' ? zhTW : enUS;
    return format(date, 'EEE', { locale: localeObj });
  },

  // Get days for calendar grid
  getCalendarDays(currentDate: Date): Date[] {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);

    const calendarStart = startOfWeek(start, { weekStartsOn: 1 }); // Monday
    const calendarEnd = endOfWeek(end, { weekStartsOn: 1 }); // Monday

    const days: Date[] = [];
    let current = calendarStart;

    while (current <= calendarEnd) {
      days.push(current);
      current = addDays(current, 1);
    }

    return days;
  },

  // Navigation
  getNextMonth(date: Date): Date {
    return addMonths(date, 1);
  },

  getPrevMonth(date: Date): Date {
    return subMonths(date, 1);
  },

  // Date comparison
  isSameMonth(date1: Date, date2: Date): boolean {
    return isSameMonth(date1, date2);
  },

  isToday(date: Date): boolean {
    return isToday(date);
  },

  isSameDay(date1: Date, date2: Date): boolean {
    return isSameDay(date1, date2);
  },

  addDays(date: Date, days: number): Date {
    return addDays(date, days);
  },

  addWeeks(date: Date, weeks: number): Date {
    return addDays(date, weeks * 7);
  },

  addMonths(date: Date, months: number): Date {
    return addMonths(date, months);
  },

  // Date string conversion
  dateToString(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  },

  stringToDate(dateStr: string): Date {
    return new Date(dateStr);
  }
};