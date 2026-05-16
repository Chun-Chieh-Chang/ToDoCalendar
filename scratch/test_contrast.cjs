
function linearizeSrgb(value) {
  const normalized = value / 255;
  if (normalized <= 0.04045) return normalized / 12.92;
  return Math.pow((normalized + 0.055) / 1.055, 2.4);
}

function calculateLuminance(color) {
  const r = linearizeSrgb(color.r);
  const g = linearizeSrgb(color.g);
  const b = linearizeSrgb(color.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function calculateContrastRatio(color1, color2) {
  const l1 = calculateLuminance(color1);
  const l2 = calculateLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseHex(hex) {
  let cleanHex = hex.replace(/^#/, '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
  }
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return { r, g, b };
}

function calculateEffectiveColor(color, background = { r: 255, g: 255, b: 255 }, alpha = 1) {
  return {
    r: Math.round(color.r * alpha + background.r * (1 - alpha)),
    g: Math.round(color.g * alpha + background.g * (1 - alpha)),
    b: Math.round(color.b * alpha + background.b * (1 - alpha)),
  };
}

const categoryColor = parseHex('#3B82F6');
const baseBg = parseHex('#1E293B');
const darkColor = parseHex('#111827');
const lightColor = parseHex('#F1F5F9');

const blended = calculateEffectiveColor(categoryColor, baseBg, 0.2);
console.log('Blended:', blended);

const contrastWithDark = calculateContrastRatio(blended, darkColor);
const contrastWithLight = calculateContrastRatio(blended, lightColor);

console.log('Contrast with Dark:', contrastWithDark);
console.log('Contrast with Light:', contrastWithLight);

const result = contrastWithDark >= contrastWithLight ? '#111827' : '#F1F5F9';
console.log('Result:', result);
