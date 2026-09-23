import { describe, it, expect } from 'vitest';
import {
  parseHexColor,
  parseColor,
  rgbToHex,
  calculateLuminance,
  calculateContrastRatio,
  calculateEffectiveColor,
  getBestContrastColor,
  getBestContrastForOverlay,
} from './contrastUtils';

describe('contrastUtils', () => {
  describe('parseHexColor', () => {
    it('parses 6-digit hex with or without #', () => {
      expect(parseHexColor('#112233')).toEqual({ r: 17, g: 34, b: 51 });
      expect(parseHexColor('112233')).toEqual({ r: 17, g: 34, b: 51 });
    });

    it('expands 3-digit hex shorthand', () => {
      expect(parseHexColor('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('parses 8-digit hex (alpha channel is currently ignored)', () => {
      expect(parseHexColor('#11223380')).toEqual({ r: 17, g: 34, b: 51 });
    });

    it('returns null for invalid hex', () => {
      expect(parseHexColor('#12')).toBeNull();
      expect(parseHexColor('not-a-color')).toBeNull();
    });
  });

  describe('parseColor', () => {
    it('parses named colors', () => {
      expect(parseColor('red')?.rgb).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('parses rgb() strings', () => {
      expect(parseColor('rgb(10, 20, 30)')?.rgb).toEqual({ r: 10, g: 20, b: 30, alpha: 1 });
    });

    it('parses hsl() strings', () => {
      // hsl(0, 100%, 50%) is pure red
      expect(parseColor('hsl(0, 100%, 50%)')?.rgb).toEqual({ r: 255, g: 0, b: 0, alpha: 1 });
    });

    it('returns null for empty input', () => {
      expect(parseColor('')).toBeNull();
    });
  });

  describe('rgbToHex', () => {
    it('round-trips with parseHexColor', () => {
      const parsed = parseHexColor('#3b82f6');
      expect(parsed).not.toBeNull();
      expect(rgbToHex(parsed!)).toBe('#3b82f6');
    });
  });

  describe('calculateLuminance / calculateContrastRatio', () => {
    it('white has luminance 1 and black has luminance 0', () => {
      expect(calculateLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5);
      expect(calculateLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
    });

    it('black on white yields the maximum 21:1 ratio', () => {
      const ratio = calculateContrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
      expect(ratio).toBeCloseTo(21, 1);
    });

    it('identical colors yield the minimum 1:1 ratio', () => {
      const ratio = calculateContrastRatio({ r: 128, g: 128, b: 128 }, { r: 128, g: 128, b: 128 });
      expect(ratio).toBe(1);
    });
  });

  describe('calculateEffectiveColor', () => {
    it('blends a semi-transparent color over the background', () => {
      // 50% black over white = mid gray
      const blended = calculateEffectiveColor({ r: 0, g: 0, b: 0, alpha: 0.5 }, { r: 255, g: 255, b: 255 });
      expect(blended.r).toBe(128);
      expect(blended.g).toBe(128);
      expect(blended.b).toBe(128);
    });
  });

  describe('getBestContrastColor', () => {
    it('picks dark text on light backgrounds', () => {
      expect(getBestContrastColor('#FFFFFF')).toBe('#111827');
    });

    it('picks light text on dark backgrounds', () => {
      expect(getBestContrastColor('#000000')).toBe('#F1F5F9');
    });

    it('falls back to the dark color for unparseable input', () => {
      expect(getBestContrastColor('not-a-color')).toBe('#111827');
    });
  });

  describe('getBestContrastForOverlay (Calendar category-pill usage)', () => {
    it('picks dark text for a tinted pill over the light theme surface', () => {
      // Mirrors Calendar.tsx: category color at 20% over --surface-color (light)
      expect(getBestContrastForOverlay('#3b82f6', '#ECF0F5', 0.2, '#111827', '#F1F5F9')).toBe('#111827');
    });

    it('picks light text for a tinted pill over the dark theme surface', () => {
      // Mirrors Calendar.tsx: category color at 20% over --surface-color (dark)
      expect(getBestContrastForOverlay('#3b82f6', '#1E2636', 0.2, '#111827', '#F1F5F9')).toBe('#F1F5F9');
    });

    it('falls back to the dark color when either color is unparseable', () => {
      expect(getBestContrastForOverlay('bad', '#ECF0F5')).toBe('#111827');
      expect(getBestContrastForOverlay('#3b82f6', 'bad')).toBe('#111827');
    });
  });
});
