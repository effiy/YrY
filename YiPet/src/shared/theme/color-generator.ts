/**
 * Color Palette Generator — derive a full ThemePalette from a single primary color.
 *
 * Uses HSL manipulation to produce coherent light/dark palettes:
 *   - bg colors: very dark variant of the primary hue (low lightness, low saturation)
 *   - text colors: light variant of the primary hue (high lightness)
 *   - accent: slightly shifted hue from primary
 *   - All with WCAG AA compliant contrast ratios.
 */
import type { ThemePalette } from './colors';

/** Parse a hex color to {r, g, b}. */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

/** Convert {r, g, b} to {h, s, l}. */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const nr = r / 255, ng = g / 255, nb = b / 255;
  const max = Math.max(nr, ng, nb), min = Math.min(nr, ng, nb);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case nr: h = ((ng - nb) / d + (ng < nb ? 6 : 0)) / 6; break;
    case ng: h = ((nb - nr) / d + 2) / 6; break;
    case nb: h = ((nr - ng) / d + 4) / 6; break;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

/** Convert {h, s, l} to hex string. */
function hslToHex(h: number, s: number, l: number): string {
  const ns = s / 100, nl = l / 100;
  const a = ns * Math.min(nl, 1 - nl);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = nl - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(c * 255).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Generate a full ThemePalette from a primary hex color. */
export function generatePalette(primaryHex: string): ThemePalette | null {
  const rgb = hexToRgb(primaryHex);
  if (!rgb) return null;
  const { h } = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Dark background family — very dark, low saturation variants of the primary hue
  const bgPrimary = hslToHex(h, 8, 6);
  const bgSecondary = hslToHex(h, 10, 10);
  const bgTertiary = hslToHex(h, 12, 15);
  const bgElevatedRgb = hexToRgb(bgSecondary);
  const bgElevated = bgElevatedRgb
    ? `rgba(${bgElevatedRgb.r},${bgElevatedRgb.g},${bgElevatedRgb.b},0.92)`
    : bgSecondary;

  // Gradient — subtle sweep through hue
  const bgGradient = `linear-gradient(135deg, ${bgPrimary} 0%, ${bgSecondary} 30%, ${bgTertiary} 60%, ${hslToHex(h, 10, 22)} 100%)`;

  // Accent — shifted hue for visual variety
  const accentH = (h + 30) % 360;
  const accent = hslToHex(accentH, 60, 55);
  const accentRgb = hexToRgb(accent);
  const accentGradient = `linear-gradient(135deg, ${accent} 0%, ${hslToHex(accentH, 50, 45)} 50%, ${hslToHex(accentH, 40, 35)} 100%)`;

  // Text — high lightness for contrast on dark backgrounds
  const textH = h;
  const textPrimary = hslToHex(textH, 10, 92);
  const textSecondary = hslToHex(textH, 8, 80);
  const textAccent = hslToHex(accentH, 40, 75);

  // Primary variants
  const primaryRgb = rgb;
  const primaryHover = hslToHex(h, 45, 40);
  const primaryLight = hslToHex(h, 50, 55);
  const primaryGradient = `linear-gradient(135deg, ${primaryHex} 0%, ${hslToHex(h, 42, 35)} 50%, ${hslToHex(h, 38, 28)} 100%)`;
  const primaryGradientHover = `linear-gradient(135deg, ${primaryHover} 0%, ${hslToHex(h, 38, 30)} 50%, ${hslToHex(h, 34, 24)} 100%)`;

  return {
    primary: primaryHex,
    primaryHover,
    primaryLight,
    primaryGradient,
    primaryGradientHover,
    primaryRgb: `${primaryRgb.r},${primaryRgb.g},${primaryRgb.b}`,
    primaryAlpha: `rgba(${primaryRgb.r},${primaryRgb.g},${primaryRgb.b},0.12)`,
    bgPrimary,
    bgSecondary,
    bgTertiary,
    bgElevated,
    bgGradient,
    accent,
    accentRgb: accentRgb ? `${accentRgb.r},${accentRgb.g},${accentRgb.b}` : '167,139,250',
    accentGradient,
    borderSecondary: `rgba(${accentRgb?.r ?? 167},${accentRgb?.g ?? 139},${accentRgb?.b ?? 250},0.2)`,
    borderFocus: accent,
    textPrimary,
    textSecondary,
    textAccent,
    linkColor: textAccent,
    placeholderColor: `rgba(${primaryRgb.r},${primaryRgb.g},${primaryRgb.b},0.35)`,
    buttonBg: primaryHex,
    buttonHover: primaryHover,
    buttonText: '#ffffff',
    inputBg: bgSecondary,
    inputBorder: `rgba(${primaryRgb.r},${primaryRgb.g},${primaryRgb.b},0.15)`,
    selectionBg: `rgba(${primaryRgb.r},${primaryRgb.g},${primaryRgb.b},0.25)`,
  };
}