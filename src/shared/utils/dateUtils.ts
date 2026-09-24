import { format } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';

export const dateUtils = {
  // Format date based on user preference
  formatDate(date: Date, formatStr: string, locale: 'zh-TW' | 'en'): string {
    const localeObj = locale === 'zh-TW' ? zhTW : enUS;
    // Fix common format mistakes: DD -> dd, YYYY -> yyyy
    const safeFormat = formatStr.replace(/DD/g, 'dd').replace(/YYYY/g, 'yyyy');
    return format(date, safeFormat, { locale: localeObj });
  },

  // Date string conversion
  dateToString(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }
};
