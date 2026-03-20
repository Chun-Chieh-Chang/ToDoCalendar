/**
 * CSS File Scanner for Contrast Specification System
 * Scans CSS files to extract color definitions and text elements
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse, walk } from 'css-tree';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Represents a parsed CSS rule with color information
 */
export interface CssRule {
  selector: string;
  colors: ColorProperty[];
  backgroundColors: ColorProperty[];
  textColors: ColorProperty[];
  hasDisplayNone: boolean;
  hasVisibilityHidden: boolean;
  sourceFile: string;
  lineNumber: number;
}

/**
 * Represents a color property with its value and location
 */
export interface ColorProperty {
  property: string;
  value: string;
  parsedColor?: ParsedColor;
  lineNumber: number;
}

/**
 * Represents a parsed color with its format and RGB values
 */
export interface ParsedColor {
  format: 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'named';
  original: string;
  rgb: { r: number; g: number; b: number };
  alpha: number;
}

/**
 * Result of CSS scanning
 */
export interface ScanResult {
  filesScanned: number;
  rulesFound: number;
  rulesWithColors: number;
  rulesWithColorsAndBackgrounds: number;
  rulesSkipped: number;
  rules: CssRule[];
}

// ============================================================================
// Color Parsing Utilities
// ============================================================================

/**
 * Parse a hex color string to RGB
 */
function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  let cleanHex = hex.trim().replace(/^#/, '');
  
  if (cleanHex.length === 8) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }
  
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
 */
function parseRgbColor(rgbStr: string): { r: number; g: number; b: number } | null {
  const match = rgbStr.trim().match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/i);
  
  if (!match) return null;
  
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) return null;
  
  return { r, g, b };
}

/**
 * Parse an HSL/HSLA color string to RGB
 */
function parseHslColor(hslStr: string): { r: number; g: number; b: number } | null {
  const match = hslStr.trim().match(/hsla?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+))?\s*\)/i);
  
  if (!match) return null;
  
  const h = parseFloat(match[1]) / 360;
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;
  
  if (h < 0 || h > 1 || s < 0 || s > 1 || l < 0 || l > 1) return null;
  
  return hslToRgb(h, s, l);
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
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
  };
}

/**
 * Parse a named color to RGB
 */
function parseNamedColor(name: string): { r: number; g: number; b: number } | null {
  const NAMED_COLORS: Record<string, string> = {
    aliceblue: '#f0f8ff', antiquewhite: '#faebd7', aqua: '#00ffff',
    aquamarine: '#7fffd4', azure: '#f0ffff', beige: '#f5f5dc',
    bisque: '#ffe4c4', black: '#000000', blanchedalmond: '#ffebcd',
    blue: '#0000ff', blueviolet: '#8a2be2', brown: '#a52a2a',
    burlywood: '#deb887', cadetblue: '#5f9ea0', chartreuse: '#7fff00',
    chocolate: '#d2691e', coral: '#ff7f50', cornflowerblue: '#6495ed',
    cornsilk: '#fff8dc', crimson: '#dc143c', cyan: '#00ffff',
    darkblue: '#00008b', darkcyan: '#008b8b', darkgoldenrod: '#b8860b',
    darkgray: '#a9a9a9', darkgreen: '#006400', darkgrey: '#a9a9a9',
    darkkhaki: '#bdb76b', darkmagenta: '#8b008b', darkolivegreen: '#556b2f',
    darkorange: '#ff8c00', darkorchid: '#9932cc', darkred: '#8b0000',
    darksalmon: '#e9967a', darkseagreen: '#8fbc8f', darkslateblue: '#483d8b',
    darkslategray: '#2f4f4f', darkslategrey: '#2f4f4f', darkturquoise: '#00ced1',
    darkviolet: '#9400d3', deeppink: '#ff1493', deepskyblue: '#00bfff',
    dimgray: '#696969', dimgrey: '#696969', dodgerblue: '#1e90ff',
    firebrick: '#b22222', floralwhite: '#fffaf0', forestgreen: '#228b22',
    fuchsia: '#ff00ff', gainsboro: '#dcdcdc', ghostwhite: '#f8f8ff',
    gold: '#ffd700', goldenrod: '#daa520', gray: '#808080',
    green: '#008000', greenyellow: '#adff2f', grey: '#808080',
    honeydew: '#f0fff0', hotpink: '#ff69b4', indianred: '#cd5c5c',
    indigo: '#4b0082', ivory: '#fffff0', khaki: '#f0e68c',
    lavender: '#e6e6fa', lavenderblush: '#fff0f5', lawngreen: '#7cfc00',
    lemonchiffon: '#fffacd', lightblue: '#add8e6', lightcoral: '#f08080',
    lightcyan: '#e0ffff', lightgoldenrodyellow: '#fafad2', lightgray: '#d3d3d3',
    lightgreen: '#90ee90', lightgrey: '#d3d3d3', lightpink: '#ffb6c1',
    lightsalmon: '#ffa07a', lightseagreen: '#20b2aa', lightskyblue: '#87cefa',
    lightslategray: '#778899', lightslategrey: '#778899', lightsteelblue: '#b0c4de',
    lightyellow: '#ffffe0', lime: '#00ff00', limegreen: '#32cd32',
    linen: '#faf0e6', magenta: '#ff00ff', maroon: '#800000',
    mediumaquamarine: '#66cdaa', mediumblue: '#0000cd', mediumorchid: '#ba55d3',
    mediumpurple: '#9370db', mediumseagreen: '#3cb371', mediumslateblue: '#7b68ee',
    mediumspringgreen: '#00fa9a', mediumturquoise: '#48d1cc', mediumvioletred: '#c71585',
    midnightblue: '#191970', mintcream: '#f5fffa', mistyrose: '#ffe4e1',
    moccasin: '#ffe4b5', navajowhite: '#ffdead', navy: '#000080',
    oldlace: '#fdf5e6', olive: '#808000', olivedrab: '#6b8e23',
    orange: '#ffa500', orangered: '#ff4500', orchid: '#da70d6',
    palegoldenrod: '#eee8aa', palegreen: '#98fb98', paleturquoise: '#afeeee',
    palevioletred: '#db7093', papayawhip: '#ffefd5', peachpuff: '#ffdab9',
    peru: '#cd853f', pink: '#ffc0cb', plum: '#dda0dd',
    powderblue: '#b0e0e6', purple: '#800080', rebeccapurple: '#663399',
    red: '#ff0000', rosybrown: '#bc8f8f', royalblue: '#4169e1',
    saddlebrown: '#8b4513', salmon: '#fa8072', sandybrown: '#f4a460',
    seagreen: '#2e8b57', seashell: '#fff5ee', sienna: '#a0522d',
    silver: '#c0c0c0', skyblue: '#87ceeb', slateblue: '#6a5acd',
    slategray: '#708090', slategrey: '#708090', snow: '#fffafa',
    springgreen: '#00ff7f', steelblue: '#4682b4', tan: '#d2b48c',
    teal: '#008080', thistle: '#d8bfd8', tomato: '#ff6347',
    turquoise: '#40e0d0', violet: '#ee82ee', wheat: '#f5deb3',
    white: '#ffffff', whitesmoke: '#f5f5f5', yellow: '#ffff00',
    yellowgreen: '#9acd32',
  };
  
  const hex = NAMED_COLORS[name.toLowerCase()];
  if (hex) {
    return parseHexColor(hex);
  }
  return null;
}

/**
 * Parse any color string to ParsedColor
 */
function parseColor(color: string): ParsedColor | null {
  const trimmed = color.trim();
  
  // Skip special values
  if (['transparent', 'inherit', 'initial', 'unset', 'currentcolor'].includes(trimmed.toLowerCase())) {
    return null;
  }
  
  // Try hex
  if (trimmed.startsWith('#')) {
    const rgb = parseHexColor(trimmed);
    if (rgb) {
      return {
        format: 'hex',
        original: trimmed,
        rgb,
        alpha: 1,
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
        alpha: 1,
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
        alpha: 1,
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
      alpha: 1,
    };
  }
  
  return null;
}

// ============================================================================
// CSS Scanning Functions
// ============================================================================

/**
 * Get all CSS files in src/components/ and src/*.css
 */
function getCssFiles(): string[] {
  const cssFiles: string[] = [];
  
  // Scan src/components/ for CSS files
  const componentsDir = path.join(process.cwd(), 'src', 'components');
  if (fs.existsSync(componentsDir)) {
    scanDirectory(componentsDir, cssFiles);
  }
  
  // Scan root-level CSS files in src/
  const srcDir = path.join(process.cwd(), 'src');
  if (fs.existsSync(srcDir)) {
    const files = fs.readdirSync(srcDir);
    for (const file of files) {
      if (file.endsWith('.css')) {
        cssFiles.push(path.join(srcDir, file));
      }
    }
  }
  
  return cssFiles;
}

/**
 * Recursively scan a directory for CSS files
 */
function scanDirectory(dir: string, cssFiles: string[]): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      scanDirectory(fullPath, cssFiles);
    } else if (entry.isFile() && entry.name.endsWith('.css')) {
      cssFiles.push(fullPath);
    }
  }
}

/**
 * Parse CSS file and extract rules with color information
 */
function parseCssFile(filePath: string): CssRule[] {
  const rules: CssRule[] = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const ast = parse(content);
    
    walk(ast, (node: any) => {
      if (node.type === 'Rule') {
        const rule = parseCssRule(node, filePath);
        if (rule) {
          rules.push(rule);
        }
      }
    });
  } catch (error) {
    console.error(`Error parsing CSS file ${filePath}:`, error);
  }
  
  return rules;
}

/**
 * Parse a single CSS rule
 */
function parseCssRule(node: any, sourceFile: string): CssRule | null {
  const colors: ColorProperty[] = [];
  const backgroundColors: ColorProperty[] = [];
  const textColors: ColorProperty[] = [];
  
  let hasDisplayNone = false;
  let hasVisibilityHidden = false;
  
  // Check for display:none or visibility:hidden
  if (node.block) {
    node.block.children.forEach((declaration: any) => {
      if (declaration.type === 'Declaration') {
        const property = declaration.property.toLowerCase();
        const value = declaration.value?.children?.[0]?.value || '';
        
        if (property === 'display' && value.toLowerCase() === 'none') {
          hasDisplayNone = true;
        }
        if (property === 'visibility' && value.toLowerCase() === 'hidden') {
          hasVisibilityHidden = true;
        }
      }
    });
  }
  
  // Skip rules with display:none or visibility:hidden
  if (hasDisplayNone || hasVisibilityHidden) {
    return null;
  }
  
  // Extract color properties
  if (node.block) {
    node.block.children.forEach((declaration: any) => {
      if (declaration.type === 'Declaration') {
        const property = declaration.property.toLowerCase();
        const value = declaration.value?.children?.[0]?.value || '';
        
        // Skip !important declarations
        if (declaration.important) {
          return;
        }
        
        // Parse color values
        const parsedColor = parseColor(value);
        
        const colorProp: ColorProperty = {
          property,
          value,
          parsedColor: parsedColor || undefined,
          lineNumber: node.loc?.start?.line || 0,
        };
        
        colors.push(colorProp);
        
        // Categorize by property type
        if (property === 'background-color' || property === 'background') {
          backgroundColors.push(colorProp);
        } else if (property === 'color') {
          textColors.push(colorProp);
        } else if (property === 'border-color' || property === 'border-top-color' ||
                   property === 'border-right-color' || property === 'border-bottom-color' ||
                   property === 'border-left-color') {
          colors.push(colorProp);
        }
      }
    });
  }
  
  return {
    selector: node.selector?.value || '',
    colors,
    backgroundColors,
    textColors,
    hasDisplayNone,
    hasVisibilityHidden,
    sourceFile,
    lineNumber: node.loc?.start?.line || 0,
  };
}

/**
 * Scan all CSS files and return results
 */
export function scanCssFiles(): ScanResult {
  const cssFiles = getCssFiles();
  const allRules: CssRule[] = [];
  const variableMap: Record<string, string> = {};
  let filesScanned = 0;
  let rulesSkipped = 0;
  
  // Pass 1: Collect variable definitions
  for (const filePath of cssFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const ast = parse(content);
      walk(ast, (node: any) => {
        if (node.type === 'Declaration' && node.property.startsWith('--')) {
          const value = node.value?.children?.[0]?.value || '';
          if (value) {
            variableMap[node.property] = value;
          }
        }
      });
    } catch (error) {
      console.error(`Error in Pass 1 for ${filePath}:`, error);
    }
  }

  // Pass 2: Parse rules and resolve variables
  for (const filePath of cssFiles) {
    const rules = parseCssFile(filePath);
    filesScanned++;
    
    for (const rule of rules) {
      if (rule.hasDisplayNone || rule.hasVisibilityHidden) {
        rulesSkipped++;
      } else {
        // Resolve variables in this rule
        resolveVariablesInRule(rule, variableMap);
        allRules.push(rule);
      }
    }
  }
  
  // Calculate statistics
  const rulesWithColors = allRules.filter(r => r.colors.length > 0).length;
  const rulesWithColorsAndBackgrounds = allRules.filter(
    r => r.textColors.length > 0 && r.backgroundColors.length > 0
  ).length;
  
  return {
    filesScanned,
    rulesFound: allRules.length,
    rulesWithColors,
    rulesWithColorsAndBackgrounds,
    rulesSkipped,
    rules: allRules,
  };
}

/**
 * Resolve CSS variables in a rule's properties
 */
function resolveVariablesInRule(rule: CssRule, variableMap: Record<string, string>): void {
  const resolve = (value: string): string => {
    const varMatch = value.match(/var\((--[^,)]+)(?:,\s*([^)]+))?\)/);
    if (varMatch) {
      const varName = varMatch[1].trim();
      const defaultValue = varMatch[2]?.trim();
      const resolvedValue = variableMap[varName] || defaultValue || '';
      if (resolvedValue) {
        // Recursively resolve if the value itself is a variable
        return resolve(value.replace(varMatch[0], resolvedValue));
      }
    }
    return value;
  };

  rule.colors.forEach(prop => {
    if (prop.value.includes('var(')) {
      prop.value = resolve(prop.value);
      prop.parsedColor = parseColor(prop.value) || undefined;
    }
  });

  rule.backgroundColors.forEach(prop => {
    if (prop.value.includes('var(')) {
      prop.value = resolve(prop.value);
      prop.parsedColor = parseColor(prop.value) || undefined;
    }
  });

  rule.textColors.forEach(prop => {
    if (prop.value.includes('var(')) {
      prop.value = resolve(prop.value);
      prop.parsedColor = parseColor(prop.value) || undefined;
    }
  });
}

// ============================================================================
// Export
// ============================================================================

export {
  parseColor,
  parseHexColor,
  parseRgbColor,
  parseHslColor,
  parseNamedColor,
  getCssFiles,
  parseCssFile,
  parseCssRule,
};
