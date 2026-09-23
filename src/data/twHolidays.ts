// Taiwan National Holidays (台灣國定假日) - 2024–2027
// Source: 行政院人事行政總處 (DGPA)
// Update annually by referencing https://www.dgpa.gov.tw/

export interface TaiwanHoliday {
  name: string;
  type: 'national' | 'lunar' | 'compensation';
}

const TW_HOLIDAYS: Record<string, TaiwanHoliday> = {
  // ── 2024 ──────────────────────────────────────────────────────────────────
  '2024-01-01': { name: '開國紀念日',    type: 'national'     },
  '2024-02-08': { name: '農曆除夕補假',  type: 'compensation' },
  '2024-02-09': { name: '農曆除夕',      type: 'lunar'        },
  '2024-02-10': { name: '春節',          type: 'lunar'        },
  '2024-02-11': { name: '春節',          type: 'lunar'        },
  '2024-02-12': { name: '春節',          type: 'lunar'        },
  '2024-02-13': { name: '春節補假',      type: 'compensation' },
  '2024-02-14': { name: '春節補假',      type: 'compensation' },
  '2024-02-28': { name: '和平紀念日',    type: 'national'     },
  '2024-04-04': { name: '兒童節',        type: 'national'     },
  '2024-04-05': { name: '清明節',        type: 'national'     },
  '2024-05-01': { name: '勞動節',        type: 'national'     },
  '2024-06-10': { name: '端午節',        type: 'lunar'        },
  '2024-09-17': { name: '中秋節',        type: 'lunar'        },
  '2024-10-10': { name: '國慶日',        type: 'national'     },

  // ── 2025 ──────────────────────────────────────────────────────────────────
  '2025-01-01': { name: '開國紀念日',    type: 'national'     },
  '2025-01-27': { name: '農曆除夕補假',  type: 'compensation' },
  '2025-01-28': { name: '農曆除夕',      type: 'lunar'        },
  '2025-01-29': { name: '春節',          type: 'lunar'        },
  '2025-01-30': { name: '春節',          type: 'lunar'        },
  '2025-01-31': { name: '春節',          type: 'lunar'        },
  '2025-02-28': { name: '和平紀念日',    type: 'national'     },
  '2025-04-03': { name: '兒童節補假',    type: 'compensation' },
  '2025-04-04': { name: '兒童節',        type: 'national'     },
  '2025-04-07': { name: '清明節補假',    type: 'compensation' },
  '2025-05-01': { name: '勞動節',        type: 'national'     },
  '2025-05-31': { name: '端午節',        type: 'lunar'        },
  '2025-06-02': { name: '端午節補假',    type: 'compensation' },
  '2025-10-06': { name: '中秋節',        type: 'lunar'        },
  '2025-10-10': { name: '國慶日',        type: 'national'     },

  // ── 2026 ──────────────────────────────────────────────────────────────────
  '2026-01-01': { name: '開國紀念日',    type: 'national'     },
  '2026-02-16': { name: '農曆除夕',      type: 'lunar'        },
  '2026-02-17': { name: '春節',          type: 'lunar'        },
  '2026-02-18': { name: '春節',          type: 'lunar'        },
  '2026-02-19': { name: '春節',          type: 'lunar'        },
  '2026-02-20': { name: '春節補假',      type: 'compensation' },
  '2026-02-28': { name: '和平紀念日',    type: 'national'     },
  '2026-03-02': { name: '和平紀念日補假',type: 'compensation' },
  '2026-04-03': { name: '兒童節補假',    type: 'compensation' },
  '2026-04-04': { name: '兒童節・清明節',type: 'national'     },
  '2026-04-06': { name: '清明節補假',    type: 'compensation' },
  '2026-05-01': { name: '勞動節',        type: 'national'     },
  '2026-06-19': { name: '端午節',        type: 'lunar'        },
  '2026-09-25': { name: '中秋節',        type: 'lunar'        },
  '2026-10-09': { name: '國慶日補假',    type: 'compensation' },
  '2026-10-10': { name: '國慶日',        type: 'national'     },

  // ── 2027 ──────────────────────────────────────────────────────────────────
  '2027-01-01': { name: '開國紀念日',    type: 'national'     },
  '2027-02-05': { name: '農曆除夕',      type: 'lunar'        },
  '2027-02-06': { name: '春節',          type: 'lunar'        },
  '2027-02-07': { name: '春節',          type: 'lunar'        },
  '2027-02-08': { name: '春節補假',      type: 'compensation' },
  '2027-02-09': { name: '春節補假',      type: 'compensation' },
  '2027-02-28': { name: '和平紀念日',    type: 'national'     },
  '2027-03-01': { name: '和平紀念日補假',type: 'compensation' },
  '2027-04-04': { name: '兒童節・清明節',type: 'national'     },
  '2027-04-05': { name: '清明節',        type: 'national'     },
  '2027-04-06': { name: '清明節補假',    type: 'compensation' },
  '2027-05-01': { name: '勞動節',        type: 'national'     },
  '2027-05-03': { name: '勞動節補假',    type: 'compensation' },
  '2027-06-09': { name: '端午節',        type: 'lunar'        },
  '2027-09-15': { name: '中秋節',        type: 'lunar'        },
  '2027-10-10': { name: '國慶日',        type: 'national'     },
  '2027-10-11': { name: '國慶日補假',    type: 'compensation' },
};

export function getTWHoliday(dateStr: string): TaiwanHoliday | null {
  return TW_HOLIDAYS[dateStr] ?? null;
}

// English names for the base holidays; combined ("A・B") and observed ("…補假")
// names are derived from these, so each holiday is listed only once.
const HOLIDAY_NAMES_EN: Record<string, string> = {
  '開國紀念日': "New Year's Day",
  '農曆除夕': "Lunar New Year's Eve",
  '春節': 'Lunar New Year',
  '和平紀念日': 'Peace Memorial Day',
  '兒童節': "Children's Day",
  '清明節': 'Tomb Sweeping Day',
  '勞動節': 'Labor Day',
  '端午節': 'Dragon Boat Festival',
  '中秋節': 'Mid-Autumn Festival',
  '國慶日': 'National Day',
};

const OBSERVED_SUFFIX = '補假';

export function getHolidayDisplayName(holiday: TaiwanHoliday, language: string): string {
  if (language !== 'en') return holiday.name;

  const isObserved = holiday.name.endsWith(OBSERVED_SUFFIX);
  const baseName = isObserved ? holiday.name.slice(0, -OBSERVED_SUFFIX.length) : holiday.name;
  const english = baseName
    .split('・')
    .map(part => HOLIDAY_NAMES_EN[part] ?? part)
    .join(' / ');
  return isObserved ? `${english} (Observed)` : english;
}
