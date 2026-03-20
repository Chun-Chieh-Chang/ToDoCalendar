/**
 * Contrast calculation utilities for WCAG compliance
 * Provides luminance calculation, contrast ratio calculation,
 * color parsing, and color adjustment functions.
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Represents an RGB color with values in the range 0-255
 */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
  alpha?: number;
}

/**
 * Represents an HSL color with values in the range 0-1 for H, S, L
 * and 0-1 for alpha (optional)
 */
export interface HSLColor {
  h: number;
  s: number;
  l: number;
  alpha?: number;
}

/**
 * Represents a parsed color with its original format and parsed values
 */
export interface ParsedColor {
  format: 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'named';
  original: string;
  rgb: RGBColor;
  alpha: number;
}

/**
 * Configuration for opacity calculations
 */
export interface OpacityConfig {
  background?: string; // Background color for opacity blending (default: white)
}

/**
 * Contrast ratio result with compliance information
 */
export interface ContrastResult {
  ratio: number;
  passesNormalText: boolean; // 4.5:1 for normal text
  passesLargeText: boolean; // 3:1 for large text
  severity?: 'critical' | 'warning' | 'minor' | 'pass';
}

// ============================================================================
// Named Colors Map (CSS standard colors)
// ============================================================================

const NAMED_COLORS: Record<string, string> = {
  aliceblue: '#f0f8ff',
  antiquewhite: '#faebd7',
  aqua: '#00ffff',
  aquamarine: '#7fffd4',
  azure: '#f0ffff',
  beige: '#f5f5dc',
  bisque: '#ffe4c4',
  black: '#000000',
  blanchedalmond: '#ffebcd',
  blue: '#0000ff',
  blueviolet: '#8a2be2',
  brown: '#a52a2a',
  burlywood: '#deb887',
  cadetblue: '#5f9ea0',
  chartreuse: '#7fff00',
  chocolate: '#d2691e',
  coral: '#ff7f50',
  cornflowerblue: '#6495ed',
  cornsilk: '#fff8dc',
  crimson: '#dc143c',
  cyan: '#00ffff',
  darkblue: '#00008b',
  darkcyan: '#008b8b',
  darkgoldenrod: '#b8860b',
  darkgray: '#a9a9a9',
  darkgreen: '#006400',
  darkgrey: '#a9a9a9',
  darkkhaki: '#bdb76b',
  darkmagenta: '#8b008b',
  darkolivegreen: '#556b2f',
  darkorange: '#ff8c00',
  darkorchid: '#9932cc',
  darkred: '#8b0000',
  darksalmon: '#e9967a',
  darkseagreen: '#8fbc8f',
  darkslateblue: '#483d8b',
  darkslategray: '#2f4f4f',
  darkslategrey: '#2f4f4f',
  darkturquoise: '#00ced1',
  darkviolet: '#9400d3',
  deeppink: '#ff1493',
  deepskyblue: '#00bfff',
  dimgray: '#696969',
  dimgrey: '#696969',
  dodgerblue: '#1e90ff',
  firebrick: '#b22222',
  floralwhite: '#fffaf0',
  forestgreen: '#228b22',
  fuchsia: '#ff00ff',
  gainsboro: '#dcdcdc',
  ghostwhite: '#f8f8ff',
  gold: '#ffd700',
  goldenrod: '#daa520',
  gray: '#808080',
  green: '#008000',
  greenyellow: '#adff2f',
  grey: '#808080',
  honeydew: '#f0fff0',
  hotpink: '#ff69b4',
  indianred: '#cd5c5c',
  indigo: '#4b0082',
  ivory: '#fffff0',
  khaki: '#f0e68c',
  lavender: '#e6e6fa',
  lavenderblush: '#fff0f5',
  lawngreen: '#7cfc00',
  lemonchiffon: '#fffacd',
  lightblue: '#add8e6',
  lightcoral: '#f08080',
  lightcyan: '#e0ffff',
  lightgoldenrodyellow: '#fafad2',
  lightgray: '#d3d3d3',
  lightgreen: '#90ee90',
  lightgrey: '#d3d3d3',
  lightpink: '#ffb6c1',
  lightsalmon: '#ffa07a',
  lightseagreen: '#20b2aa',
  lightskyblue: '#87cefa',
  lightslategray: '#778899',
  lightslategrey: '#778899',
  lightsteelblue: '#b0c4de',
  lightyellow: '#ffffe0',
  lime: '#00ff00',
  limegreen: '#32cd32',
  linen: '#faf0e6',
  magenta: '#ff00ff',
  maroon: '#800000',
  mediumaquamarine: '#66cdaa',
  mediumblue: '#0000cd',
  mediumorchid: '#ba55d3',
  mediumpurple: '#9370db',
  mediumseagreen: '#3cb371',
  mediumslateblue: '#7b68ee',
  mediumspringgreen: '#00fa9a',
  mediumturquoise: '#48d1cc',
  mediumvioletred: '#c71585',
  midnightblue: '#191970',
  mintcream: '#f5fffa',
  mistyrose: '#ffe4e1',
  moccasin: '#ffe4b5',
  navajowhite: '#ffdead',
  navy: '#000080',
  oldlace: '#fdf5e6',
  olive: '#808000',
  olivedrab: '#6b8e23',
  orange: '#ffa500',
  orangered: '#ff4500',
  orchid: '#da70d6',
  palegoldenrod: '#eee8aa',
  palegreen: '#98fb98',
  paleturquoise: '#afeeee',
  palevioletred: '#db7093',
  papayawhip: '#ffefd5',
  peachpuff: '#ffdab9',
  peru: '#cd853f',
  pink: '#ffc0cb',
  plum: '#dda0dd',
  powderblue: '#b0e0e6',
  purple: '#800080',
  rebeccapurple: '#663399',
  red: '#ff0000',
  rosybrown: '#bc8f8f',
  royalblue: '#4169e1',
  saddlebrown: '#8b4513',
  salmon: '#fa8072',
  sandybrown: '#f4a460',
  seagreen: '#2e8b57',
  seashell: '#fff5ee',
  sienna: '#a0522d',
  silver: '#c0c0c0',
  skyblue: '#87ceeb',
  slateblue: '#6a5acd',
  slategray: '#708090',
  slategrey: '#708090',
  snow: '#fffafa',
  springgreen: '#00ff7f',
  steelblue: '#4682b4',
  tan: '#d2b48c',
  teal: '#008080',
  thistle: '#d8bfd8',
  tomato: '#ff6347',
  turquoise: '#40e0d0',
  violet: '#ee82ee',
  wheat: '#f5deb3',
  white: '#ffffff',
  whitesmoke: '#f5f5f5',
  yellow: '#ffff00',
  yellowgreen: '#9acd32',
};

// ============================================================================
// Color Parsing Utilities
// ============================================================================

/**
 * Parse a hex color string to RGB
 * @param hex - Hex color string (e.g., '#FF5733', '#F53', '#FF5733FF')
 * @returns RGBColor object or null if invalid
 */
export function parseHexColor(hex: string): RGBColor | null {
  // Remove # prefix
  let cleanHex = hex.trim().replace(/^#/, '');
  
  // Handle hex with alpha (8 digits: RRGGBBAA)
  if (cleanHex.length === 8) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }
  
  // Handle standard hex (3 or 6 digits)
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex.charAt(0) + cleanHex.charAt(0), 16);
    const g = parseInt(cleanHex.charAt(1) + cleanHex.charAt(1), 16);
    const b = parseInt(cleanHex.charAt(2) + cleanHex.charAt(2), 16);
    return { r, g, b };
  }
  
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }
  
  return null;
}

/**
 * Parse an RGB/RGBA color string to RGB
 * @param rgbStr - RGB color string (e.g., 'rgb(255, 87, 51)', 'rgba(255, 87, 51, 0.5)')
 * @returns RGBColor object or null if invalid
 */
export function parseRgbColor(rgbStr: string): RGBColor | null {
  const match = rgbStr.trim().match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/i);
  
  if (!match) return null;
  
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  const alpha = match[4] !== undefined ? parseFloat(match[4]) : 1;
  
  // Validate ranges
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) return null;
  
  return { r, g, b, alpha };
}

/**
 * Parse an HSL/HSLA color string to RGB
 * @param hslStr - HSL color string (e.g., 'hsl(120, 100%, 50%)', 'hsla(120, 100%, 50%, 0.5)')
 * @returns RGBColor object or null if invalid
 */
export function parseHslColor(hslStr: string): RGBColor | null {
  const match = hslStr.trim().match(/hsla?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+))?\s*\)/i);
  
  if (!match) return null;
  
  const h = parseFloat(match[1]) / 360;
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;
  const alpha = match[4] !== undefined ? parseFloat(match[4]) : 1;
  
  // Validate ranges
  if (h < 0 || h > 1 || s < 0 || s > 1 || l < 0 || l > 1) return null;
  
  return hslToRgb(h, s, l, alpha);
}

/**
 * Convert HSL to RGB
 * @param h - Hue (0-1)
 * @param s - Saturation (0-1)
 * @param l - Lightness (0-1)
 * @param alpha - Alpha (0-1)
 * @returns RGBColor object
 */
function hslToRgb(h: number, s: number, l: number, alpha: number = 1): RGBColor {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    alpha,
  };
}

/**
 * Parse a named color to RGB
 * @param name - Named color (e.g., 'red', 'blue', 'darkgreen')
 * @returns RGBColor object or null if invalid
 */
export function parseNamedColor(name: string): RGBColor | null {
  const hex = NAMED_COLORS[name.toLowerCase()];
  if (hex) {
    return parseHexColor(hex);
  }
  return null;
}

/**
 * Parse any color string to ParsedColor
 * @param color - Color string in any format
 * @returns ParsedColor object or null if invalid
 */
export function parseColor(color: string): ParsedColor | null {
  const trimmed = color.trim();
  
  // Try hex
  if (trimmed.startsWith('#')) {
    const rgb = parseHexColor(trimmed);
    if (rgb) {
      return {
        format: 'hex',
        original: trimmed,
        rgb,
        alpha: rgb.alpha ?? 1,
      };
    }
  }
  
  // Try rgb/rgba
  if (trimmed.toLowerCase().startsWith('rgb')) {
    const rgb = parseRgbColor(trimmed);
    if (rgb) {
      return {
        format: trimmed.toLowerCase().includes('rgba') ? 'rgba' : 'rgb',
        original: trimmed,
        rgb,
        alpha: rgb.alpha ?? 1,
      };
    }
  }
  
  // Try hsl/hsla
  if (trimmed.toLowerCase().startsWith('hsl')) {
    const rgb = parseHslColor(trimmed);
    if (rgb) {
      return {
        format: trimmed.toLowerCase().includes('hsla') ? 'hsla' : 'hsl',
        original: trimmed,
        rgb,
        alpha: rgb.alpha ?? 1,
      };
    }
  }
  
  // Try named color
  const rgb = parseNamedColor(trimmed);
  if (rgb) {
    return {
      format: 'named',
      original: trimmed,
      rgb,
      alpha: rgb.alpha ?? 1,
    };
  }
  
  return null;
}

// ============================================================================
// Color Adjustment Utilities
// ============================================================================

/**
 * Linearize an sRGB value for luminance calculation
 * @param value - sRGB value (0-255)
 * @returns Linearized value (0-1)
 */
export function linearizeSrgb(value: number): number {
  const normalized = value / 255;
  if (normalized <= 0.04045) {
    return normalized / 12.92;
  }
  return Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/**
 * Convert linearized value back to sRGB
 * @param value - Linearized value (0-1)
 * @returns sRGB value (0-255)
 */
export function delinearizeSrgb(value: number): number {
  if (value <= 0.0031308) {
    return Math.round(value * 12.92 * 255);
  }
  return Math.round((1.055 * Math.pow(value, 1 / 2.4) - 0.055) * 255);
}

/**
 * Calculate relative luminance using WCAG formula
 * L = 0.2126*R + 0.7152*G + 0.0722*B (where R, G, B are linearized sRGB values)
 * @param color - RGB color
 * @returns Luminance value (0-1)
 */
export function calculateLuminance(color: RGBColor): number {
  const r = linearizeSrgb(color.r);
  const g = linearizeSrgb(color.g);
  const b = linearizeSrgb(color.b);
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * Formula: (L1 + 0.05) / (L2 + 0.05) where L1 is lighter and L2 is darker
 * @param color1 - First RGB color
 * @param color2 - Second RGB color
 * @returns Contrast ratio (1-21)
 */
export function calculateContrastRatio(color1: RGBColor, color2: RGBColor): number {
  const l1 = calculateLuminance(color1);
  const l2 = calculateLuminance(color2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  const ratio = (lighter + 0.05) / (darker + 0.05);
  
  // Round to two decimal places
  return Math.round(ratio * 100) / 100;
}

/**
 * Calculate effective color after applying opacity over a background
 * @param color - Foreground color with alpha
 * @param background - Background color (default: white)
 * @returns RGBColor with blended values
 */
export function calculateEffectiveColor(color: RGBColor, background: RGBColor = { r: 255, g: 255, b: 255 }): RGBColor {
  const alpha = color.alpha ?? 1;
  
  return {
    r: Math.round(color.r * alpha + background.r * (1 - alpha)),
    g: Math.round(color.g * alpha + background.g * (1 - alpha)),
    b: Math.round(color.b * alpha + background.b * (1 - alpha)),
  };
}

/**
 * Darken a color by a percentage
 * @param color - RGB color
 * @param percent - Percentage to darken (0-100)
 * @returns Darkened RGB color
 */
export function darkenColor(color: RGBColor, percent: number): RGBColor {
  const factor = 1 - percent / 100;
  
  return {
    r: Math.max(0, Math.round(color.r * factor)),
    g: Math.max(0, Math.round(color.g * factor)),
    b: Math.max(0, Math.round(color.b * factor)),
    alpha: color.alpha,
  };
}

/**
 * Lighten a color by a percentage
 * @param color - RGB color
 * @param percent - Percentage to lighten (0-100)
 * @returns Lightened RGB color
 */
export function lightenColor(color: RGBColor, percent: number): RGBColor {
  const factor = percent / 100;
  
  return {
    r: Math.min(255, Math.round(color.r + (255 - color.r) * factor)),
    g: Math.min(255, Math.round(color.g + (255 - color.g) * factor)),
    b: Math.min(255, Math.round(color.b + (255 - color.b) * factor)),
    alpha: color.alpha,
  };
}

/**
 * Adjust color brightness by a percentage
 * Positive values lighten, negative values darken
 * @param color - RGB color
 * @param percent - Percentage to adjust (-100 to 100)
 * @returns Adjusted RGB color
 */
export function adjustColorBrightness(color: RGBColor, percent: number): RGBColor {
  if (percent > 0) {
    return lightenColor(color, percent);
  } else {
    return darkenColor(color, Math.abs(percent));
  }
}

// ============================================================================
// Contrast Compliance Utilities
// ============================================================================

/**
 * Check if a contrast ratio meets WCAG 2.1 AA requirements
 * @param ratio - Contrast ratio
 * @returns ContrastResult with compliance information
 */
export function checkContrastCompliance(ratio: number): ContrastResult {
  const passesNormalText = ratio >= 4.5;
  const passesLargeText = ratio >= 3;
  
  let severity: ContrastResult['severity'];
  
  if (ratio < 2) {
    severity = 'critical';
  } else if (ratio < 4.5) {
    severity = 'warning';
  } else if (ratio < 4.5) {
    severity = 'minor';
  } else {
    severity = 'pass';
  }
  
  return {
    ratio,
    passesNormalText,
    passesLargeText,
    severity,
  };
}

/**
 * Get minimum contrast ratio needed for a given text size and weight
 * @param fontSizePx - Font size in pixels
 * @param isBold - Whether text is bold
 * @returns Required contrast ratio
 */
export function getRequiredContrastRatio(fontSizePx: number, isBold: boolean): number {
  // Large text: 18pt (24px) or larger, OR bold text 14pt (18.67px) or larger
  const isLargeText = fontSizePx >= 24 || (isBold && fontSizePx >= 18.67);
  return isLargeText ? 3 : 4.5;
}

/**
 * Calculate contrast ratio for a color pair with opacity support
 * @param foreground - Foreground color (text)
 * @param background - Background color
 * @param config - Opacity configuration
 * @returns Contrast ratio
 */
export function calculateContrastWithOpacity(
  foreground: RGBColor,
  background: RGBColor,
  config: OpacityConfig = {}
): number {
  // Calculate effective colors with opacity
  const effectiveForeground = calculateEffectiveColor(foreground, background);
  const effectiveBackground = calculateEffectiveColor(background, config.background ? parseHexColor(config.background)?.rgb ?? { r: 255, g: 255, b: 255 } : { r: 255, g: 255, b: 255 });
  
  return calculateContrastRatio(effectiveForeground, effectiveBackground);
}

// ============================================================================
// Color Conversion Utilities
// ============================================================================

/**
 * Convert RGB to hex string
 * @param color - RGB color
 * @returns Hex string
 */
export function rgbToHex(color: RGBColor): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, n)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

/**
 * Convert RGB to HSL
 * @param color - RGB color
 * @returns HSLColor object
 */
export function rgbToHsl(color: RGBColor): HSLColor {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    alpha: color.alpha ?? 1,
  };
}

/**
 * Format a color as a CSS string
 * @param color - RGB color
 * @returns CSS color string
 */
export function formatColorForCss(color: RGBColor): string {
  if (color.alpha !== undefined && color.alpha < 1) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.alpha})`;
  }
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
}
