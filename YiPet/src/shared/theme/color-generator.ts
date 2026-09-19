/**
 * Color Palette Generator — derive a full ThemePalette from a single primary hex.
 *
 * 算法概述：
 * 1. 将 hex 解析为 RGB，再转为 HSL；
 * 2. 固定 S/L，按主色 hue 生成 4 层 surface（base / sunken / raised / overlay）；
 * 3. accent 取主色 hue 偏移 +30°，保持视觉多样性；
 * 4. text 使用同 hue 的高 L（90+），保证暗背景下对比度 ≥ 4.5:1；
 * 5. primary 的 hover/active 通过 L 阶跃计算，soft/faint 通过 alpha 控制。
 *
 * 所有函数为纯函数，无副作用；不调用任何 UI / 全局状态。
 */

import type { RgbTuple, ThemePalette } from './colors';

// ── 颜色转换原语 ─────────────────────────────────────────────────────────

export function hexToRgb(hex: string): RgbTuple | null {
  const m = /^\s*#?([a-f\d]{3}|[a-f\d]{6})\s*$/i.exec(hex);
  if (!m) return null;
  let body = m[1]!;
  if (body.length === 3) body = body.split('').map((c) => c + c).join('');
  return {
    r: parseInt(body.slice(0, 2), 16),
    g: parseInt(body.slice(2, 4), 16),
    b: parseInt(body.slice(4, 6), 16),
  };
}

interface HslTuple {
  h: number;
  s: number;
  l: number;
}

export function rgbToHsl(r: number, g: number, b: number): HslTuple {
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;
  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: l * 100 };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === nr) h = ((ng - nb) / d + (ng < nb ? 6 : 0)) / 6;
  else if (max === ng) h = ((nb - nr) / d + 2) / 6;
  else h = ((nr - ng) / d + 4) / 6;

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToHex(h: number, s: number, l: number): string {
  const nh = ((h % 360) + 360) % 360;
  const ns = Math.max(0, Math.min(100, s)) / 100;
  const nl = Math.max(0, Math.min(100, l)) / 100;
  const a = ns * Math.min(nl, 1 - nl);
  const f = (n: number) => {
    const k = (n + nh / 30) % 12;
    const c = nl - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(Math.max(0, Math.min(1, c)) * 255).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function rgba(rgb: RgbTuple, alpha: number): string {
  const sa = Math.max(0, Math.min(1, alpha));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${sa})`;
}

function rgbToTupleString(rgb: RgbTuple): string {
  return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
}

// ── WCAG 对比度与无障碍工具 ─────────────────────────────────────────────

function srgbToLinear(c: number): number {
  const nc = c / 255;
  return nc <= 0.03928 ? nc / 12.92 : Math.pow((nc + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(rgb: RgbTuple): number {
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: RgbTuple, b: RgbTuple): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [lighter, darker] = la >= lb ? [la, lb] : [lb, la];
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAG(r: RgbTuple, bg: RgbTuple, level: 'AA' | 'AAA' = 'AA', large = false): boolean {
  const ratio = contrastRatio(r, bg);
  const threshold = level === 'AAA' ? (large ? 4.5 : 7) : (large ? 3 : 4.5);
  return ratio >= threshold;
}

export function findReadableText(bgHex: string, baseHue: number, sat = 14, minRatio = 4.5): string {
  const bg = hexToRgb(bgHex) ?? { r: 0, g: 0, b: 0 };
  for (let light = 94; light >= 40; light -= 3) {
    const candidate = hexToRgb(hslToHex(baseHue, sat, light));
    if (candidate && contrastRatio(candidate, bg) >= minRatio) {
      return hslToHex(baseHue, sat, light);
    }
  }
  return relativeLuminance(bg) > 0.4 ? '#1e293b' : '#f8fafc';
}

// ── HSL 步进工具（用于 primary/hover/active 阶跃） ────────────────────────

export function lightenHex(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return hslToHex(h, s, Math.max(0, Math.min(100, l + amount)));
}

export function darkenHex(hex: string, amount: number): string {
  return lightenHex(hex, -amount);
}

export function saturateHex(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return hslToHex(h, Math.max(0, Math.min(100, s + amount)), l);
}

// ── 调色板生成 ───────────────────────────────────────────────────────────

/**
 * 通过单个主色 hex 生成完整的 ThemePalette。
 * 返回 null 表示 hex 非法。
 *
 * 设计要点：
 * - 主色保留用户输入的 hue，但亮度 S 提升到 50-65% 以保证视觉鲜艳度
 * - Surface 4 层使用同 hue、极低 S（8-12%）、递增 L（6% → 22%）
 * - Accent 偏移主色 hue +30° 形成视觉对比
 * - Text 三档：primary L=92、secondary L=82、muted L=72 + alpha 0.55
 */
export function generatePalette(primaryHex: string): ThemePalette | null {
  const rgb = hexToRgb(primaryHex);
  if (!rgb) return null;

  const { h, s: inputS } = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const primaryS = Math.max(inputS, 52);
  const primaryL = 56;
  const primary = hslToHex(h, primaryS, primaryL);
  const primaryRgb = hexToRgb(primary) ?? rgb;

  const hoverDelta = inputS < 55 ? 14 : 16;
  const activeDelta = inputS < 55 ? 24 : 26;
  const primaryHover = hslToHex(h, Math.min(primaryS + 4, 78), Math.max(primaryL - hoverDelta, 22));
  const primaryActive = hslToHex(h, Math.min(primaryS + 6, 82), Math.max(primaryL - activeDelta, 14));
  const primarySoft = rgba(primaryRgb, 0.18);
  const primaryFaint = rgba(primaryRgb, 0.08);
  const primaryAlpha = rgba(primaryRgb, 0.12);

  const surfaceBase = hslToHex(h, 8, 6);
  const surfaceSunken = hslToHex(h, 10, 10);
  const surfaceRaised = hslToHex(h, 12, 15);
  const surfaceSunkenRgb = hexToRgb(surfaceSunken) ?? { r: 30, g: 27, b: 44 };
  const surfaceBaseRgb = hexToRgb(surfaceBase) ?? { r: 10, g: 12, b: 20 };
  const surfaceOverlay = rgba(surfaceSunkenRgb, 0.92);
  const surfaceGradient = `linear-gradient(135deg, ${surfaceBase} 0%, ${surfaceSunken} 30%, ${surfaceRaised} 60%, ${hslToHex(h, 10, 22)} 100%)`;

  const accentHueShift = (h >= 0 && h < 40) ? 180 :
                         (h >= 40 && h < 180) ? 190 :
                         (h >= 180 && h < 280) ? 210 : 200;
  const accentH = (h + accentHueShift) % 360;
  const accentL = 64;
  const accent = hslToHex(accentH, 72, accentL);
  const accentRgb = hexToRgb(accent) ?? primaryRgb;
  const accentGradient =
    `linear-gradient(135deg, ${accent} 0%, ` +
    `${hslToHex(accentH, 62, accentL - 10)} 50%, ` +
    `${hslToHex(accentH, 52, accentL - 20)} 100%)`;

  const textBaseSat = h < 30 || h > 330 ? 10 : 12;
  const textPrimary = findReadableText(surfaceBase, h, textBaseSat, 6.2);
  const textSecondary = findReadableText(surfaceSunken, h, Math.max(textBaseSat - 2, 6), 4.8);
  const textMutedBase = hslToHex(h, 8, 70);
  const textMutedRgb = hexToRgb(textMutedBase) ?? { r: 180, g: 180, b: 200 };
  const textMuted = rgba(textMutedRgb, 0.55);
  const textAccentRaw = hslToHex(accentH, 42, 76);
  const textAccent = findReadableText(surfaceSunken, accentH, 38, 4.5);
  void textAccentRaw;

  const borderSubtle = rgba(accentRgb, 0.20);
  const borderStrong = rgba(accentRgb, 0.38);
  const borderFocus = accent;

  const primaryGradient =
    `linear-gradient(135deg, ${primary} 0%, ` +
    `${hslToHex(h, primaryS, primaryL - 12)} 50%, ` +
    `${hslToHex(h, Math.min(primaryS + 4, 82), primaryL - 22)} 100%)`;
  const primaryGradientHover =
    `linear-gradient(135deg, ${primaryHover} 0%, ` +
    `${hslToHex(h, primaryS, primaryL - 18)} 50%, ` +
    `${hslToHex(h, Math.min(primaryS + 6, 82), primaryL - 28)} 100%)`;

  const headerBg = rgba(surfaceBaseRgb, 0.86);
  const headerBgGradient =
    `linear-gradient(180deg, ${rgba(primaryRgb, 0.21)} 0%, ` +
    `${headerBg} 55%, ${surfaceOverlay} 100%)`;
  const headerBorder = rgba(accentRgb, 0.27);
  const headerTextPrimary = findReadableText(surfaceBase, h, textBaseSat, 7);
  const headerTextSecondaryRaw = rgba(textMutedRgb, 0.75);
  const headerTextSecondary = headerTextSecondaryRaw;
  const headerAccent = findReadableText(surfaceSunken, accentH, 40, 4.5);
  const headerGlow =
    `0 0 40px ${rgba(primaryRgb, 0.11)}, ` +
    `0 1px 0 rgba(255, 255, 255, 0.07) inset`;

  return {
    primary,
    primaryHover,
    primaryActive,
    primarySoft,
    primaryFaint,
    primaryGradient,
    primaryGradientHover,
    primaryRgb: rgbToTupleString(primaryRgb),
    primaryAlpha,
    surfaceBase,
    surfaceSunken,
    surfaceRaised,
    surfaceOverlay,
    surfaceGradient,
    accent,
    accentRgb: rgbToTupleString(accentRgb),
    accentGradient,
    borderSubtle,
    borderFocus,
    borderStrong,
    textPrimary,
    textSecondary,
    textMuted,
    textAccent,
    linkColor: textAccent,
    placeholderColor: rgba(textMutedRgb, 0.55),
    buttonBg: primary,
    buttonHover: primaryHover,
    buttonText: '#ffffff',
    inputBg: surfaceSunken,
    inputBorder: rgba(primaryRgb, 0.18),
    selectionBg: rgba(primaryRgb, 0.25),
    headerBg,
    headerBgGradient,
    headerBorder,
    headerTextPrimary,
    headerTextSecondary,
    headerAccent,
    headerGlow,
  };
}