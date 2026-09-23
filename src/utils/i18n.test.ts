import { describe, it, expect } from 'vitest';
import { translations, getTranslation } from './i18n';

describe('i18n', () => {
  const zhKeys = Object.keys(translations['zh-TW']).sort();
  const enKeys = Object.keys(translations['en']).sort();

  it('has identical key sets in zh-TW and en', () => {
    expect(enKeys).toEqual(zhKeys);
  });

  it('has no empty translations', () => {
    for (const lang of ['zh-TW', 'en'] as const) {
      for (const [key, value] of Object.entries(translations[lang])) {
        expect(value, `${lang}.${key}`).toBeTruthy();
      }
    }
  });

  it('has 12 months and 7 weekdays in each language', () => {
    for (const lang of ['zh-TW', 'en'] as const) {
      expect(translations[lang].months).toHaveLength(12);
      expect(translations[lang].weekdays).toHaveLength(7);
    }
  });

  it('keeps {placeholders} consistent between languages', () => {
    const placeholders = (s: unknown) => (typeof s === 'string' ? (s.match(/\{\w+\}/g) || []).sort() : []);
    for (const key of zhKeys) {
      const zh = (translations['zh-TW'] as Record<string, unknown>)[key];
      const en = (translations['en'] as Record<string, unknown>)[key];
      expect(placeholders(en), key).toEqual(placeholders(zh));
    }
  });

  it('resolves keys per language', () => {
    expect(getTranslation('en', 'settings')).toBe('Settings');
    expect(getTranslation('zh-TW', 'settings')).toBe('設定');
  });

  it('falls back to zh-TW for unknown languages and returns the key when missing', () => {
    expect(getTranslation('fr', 'settings')).toBe('設定');
    expect(getTranslation('en', 'no_such_key')).toBe('no_such_key');
  });
});
