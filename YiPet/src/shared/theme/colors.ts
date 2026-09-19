import { generatePalette } from './color-generator';

/**
 * Color Theme Palettes — 小清新专业主题合集。
 *
 * 每个主题都精心挑选了：
 * - 主品牌色，确保与背景有足够对比度
 * - 文本颜色符合 WCAG AA 标准（4.5:1 最小对比度）
 * - 背景层次分明（primary → secondary → tertiary → elevated）
 * - 交互元素有明显的强调色
 *
 * Theme index → popup color dropdown order:
 *   0 = Lavender    1 = Mint       2 = Sky
 *   3 = Peach      4 = Sakura     5 = Ocean
 *   6 = Forest     7 = Indigo     8 = Sunset
 *
 * NONE_PALETTE (-1) 是纯净浅色主题，尊重宿主页面样式。
 */

export interface ThemePalette {
  /* ── Primary family ───────────────────────────────────── */
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryGradient: string;
  primaryGradientHover: string;
  primaryRgb: string;
  primaryAlpha: string;
  /* ── Backgrounds ──────────────────────────────────────── */
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgElevated: string;
  bgGradient: string;
  /* ── Accent ───────────────────────────────────────────── */
  accent: string;
  accentRgb: string;
  accentGradient: string;
  /* ── Borders ──────────────────────────────────────────── */
  borderSecondary: string;
  borderFocus: string;
  /* ── Text ─────────────────────────────────────────────── */
  textPrimary: string;
  textSecondary: string;
  textAccent: string;
  linkColor: string;
  placeholderColor: string;
  /* ── Interactive elements ──────────────────────────────── */
  buttonBg: string;
  buttonHover: string;
  buttonText: string;
  inputBg: string;
  inputBorder: string;
  selectionBg: string;
}

/** CSS variable names injected by applyThemeColors. */
export const THEME_VAR_KEYS = [
  '--primary',
  '--primary-hover',
  '--primary-light',
  '--primary-gradient',
  '--primary-gradient-hover',
  '--primary-rgb',
  '--primary-alpha',
  '--bg-primary',
  '--bg-secondary',
  '--bg-tertiary',
  '--bg-elevated',
  '--bg-gradient',
  '--accent',
  '--accent-rgb',
  '--accent-gradient',
  '--border-secondary',
  '--border-focus',
  '--text-primary',
  '--text-secondary',
  '--text-accent',
  '--link-color',
  '--placeholder-color',
  '--button-bg',
  '--button-hover',
  '--button-text',
  '--input-bg',
  '--input-border',
  '--selection-bg',
] as const;

/** ThemePalette field → CSS variable name mapping. */
const PALETTE_TO_CSS: ReadonlyArray<readonly [keyof ThemePalette, string]> = [
  ['primary', '--primary'],
  ['primaryHover', '--primary-hover'],
  ['primaryLight', '--primary-light'],
  ['primaryGradient', '--primary-gradient'],
  ['primaryGradientHover', '--primary-gradient-hover'],
  ['primaryRgb', '--primary-rgb'],
  ['primaryAlpha', '--primary-alpha'],
  ['bgPrimary', '--bg-primary'],
  ['bgSecondary', '--bg-secondary'],
  ['bgTertiary', '--bg-tertiary'],
  ['bgElevated', '--bg-elevated'],
  ['bgGradient', '--bg-gradient'],
  ['accent', '--accent'],
  ['accentRgb', '--accent-rgb'],
  ['accentGradient', '--accent-gradient'],
  ['borderSecondary', '--border-secondary'],
  ['borderFocus', '--border-focus'],
  ['textPrimary', '--text-primary'],
  ['textSecondary', '--text-secondary'],
  ['textAccent', '--text-accent'],
  ['linkColor', '--link-color'],
  ['placeholderColor', '--placeholder-color'],
  ['buttonBg', '--button-bg'],
  ['buttonHover', '--button-hover'],
  ['buttonText', '--button-text'],
  ['inputBg', '--input-bg'],
  ['inputBorder', '--input-border'],
  ['selectionBg', '--selection-bg'],
];

function applyPalette(root: HTMLElement, palette: ThemePalette, scheme: 'light' | 'dark'): void {
  const s = root.style;
  for (const [field, varName] of PALETTE_TO_CSS) {
    s.setProperty(varName, palette[field]);
  }
  s.colorScheme = scheme;
}

/** All 9 theme palettes, index-aligned with the popup color dropdown. */
export const THEME_PALETTES: ThemePalette[] = [
  /* ── 0: Lavender — 薰衣草紫，优雅浪漫 ── */
  {
    primary: '#a78bfa',
    primaryHover: '#8b5cf6',
    primaryLight: '#c4b5fd',
    primaryGradient: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
    primaryRgb: '167, 139, 250',
    primaryAlpha: 'rgba(167, 139, 250, 0.15)',
    bgPrimary: '#13111a',
    bgSecondary: '#1c1926',
    bgTertiary: '#262333',
    bgElevated: 'rgba(28, 25, 38, 0.92)',
    bgGradient: 'linear-gradient(135deg, #13111a 0%, #1c1926 30%, #262333 60%, #302e40 100%)',
    accent: '#c4b5fd',
    accentRgb: '196, 181, 253',
    accentGradient: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #8b5cf6 100%)',
    borderSecondary: 'rgba(196, 181, 253, 0.2)',
    borderFocus: '#a78bfa',
    textPrimary: '#f5f3ff',
    textSecondary: '#e9e5f5',
    textAccent: '#ddd6fe',
    linkColor: '#c4b5fd',
    placeholderColor: 'rgba(233, 229, 245, 0.45)',
    buttonBg: '#8b5cf6',
    buttonHover: '#7c3aed',
    buttonText: '#ffffff',
    inputBg: '#1c1926',
    inputBorder: 'rgba(196, 181, 253, 0.18)',
    selectionBg: 'rgba(167, 139, 250, 0.25)',
  },
  /* ── 1: Mint — 薄荷绿，清新自然 ── */
  {
    primary: '#34d399',
    primaryHover: '#10b981',
    primaryLight: '#6ee7b7',
    primaryGradient: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
    primaryRgb: '52, 211, 153',
    primaryAlpha: 'rgba(52, 211, 153, 0.12)',
    bgPrimary: '#0a1512',
    bgSecondary: '#0f2119',
    bgTertiary: '#162e24',
    bgElevated: 'rgba(15, 33, 25, 0.92)',
    bgGradient: 'linear-gradient(135deg, #0a1512 0%, #0f2119 30%, #162e24 60%, #1d3a2e 100%)',
    accent: '#6ee7b7',
    accentRgb: '110, 231, 183',
    accentGradient: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 50%, #10b981 100%)',
    borderSecondary: 'rgba(110, 231, 183, 0.2)',
    borderFocus: '#34d399',
    textPrimary: '#ecfdf5',
    textSecondary: '#d1fae5',
    textAccent: '#a7f3d0',
    linkColor: '#6ee7b7',
    placeholderColor: 'rgba(209, 250, 229, 0.45)',
    buttonBg: '#10b981',
    buttonHover: '#059669',
    buttonText: '#ffffff',
    inputBg: '#0f2119',
    inputBorder: 'rgba(110, 231, 183, 0.15)',
    selectionBg: 'rgba(52, 211, 153, 0.25)',
  },
  /* ── 2: Sky — 天空蓝，通透宁静 ── */
  {
    primary: '#38bdf8',
    primaryHover: '#0ea5e9',
    primaryLight: '#7dd3fc',
    primaryGradient: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
    primaryRgb: '56, 189, 248',
    primaryAlpha: 'rgba(56, 189, 248, 0.12)',
    bgPrimary: '#0a1318',
    bgSecondary: '#0f1f28',
    bgTertiary: '#162b38',
    bgElevated: 'rgba(15, 31, 40, 0.92)',
    bgGradient: 'linear-gradient(135deg, #0a1318 0%, #0f1f28 30%, #162b38 60%, #1d3848 100%)',
    accent: '#7dd3fc',
    accentRgb: '125, 211, 252',
    accentGradient: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 50%, #0ea5e9 100%)',
    borderSecondary: 'rgba(125, 211, 252, 0.2)',
    borderFocus: '#38bdf8',
    textPrimary: '#f0f9ff',
    textSecondary: '#e0f2fe',
    textAccent: '#bae6fd',
    linkColor: '#7dd3fc',
    placeholderColor: 'rgba(224, 242, 254, 0.45)',
    buttonBg: '#0ea5e9',
    buttonHover: '#0284c7',
    buttonText: '#ffffff',
    inputBg: '#0f1f28',
    inputBorder: 'rgba(125, 211, 252, 0.15)',
    selectionBg: 'rgba(56, 189, 248, 0.25)',
  },
  /* ── 3: Peach — 蜜桃粉，温柔甜美 ── */
  {
    primary: '#fb923c',
    primaryHover: '#f97316',
    primaryLight: '#fdba74',
    primaryGradient: 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
    primaryRgb: '251, 146, 60',
    primaryAlpha: 'rgba(251, 146, 60, 0.12)',
    bgPrimary: '#18110a',
    bgSecondary: '#261b0f',
    bgTertiary: '#352816',
    bgElevated: 'rgba(38, 27, 15, 0.92)',
    bgGradient: 'linear-gradient(135deg, #18110a 0%, #261b0f 30%, #352816 60%, #4a381f 100%)',
    accent: '#fdba74',
    accentRgb: '253, 186, 116',
    accentGradient: 'linear-gradient(135deg, #fdba74 0%, #fb923c 50%, #f97316 100%)',
    borderSecondary: 'rgba(253, 186, 116, 0.2)',
    borderFocus: '#fb923c',
    textPrimary: '#fffbeb',
    textSecondary: '#fef3c7',
    textAccent: '#fde68a',
    linkColor: '#fde68a',
    placeholderColor: 'rgba(254, 243, 199, 0.45)',
    buttonBg: '#f97316',
    buttonHover: '#ea580c',
    buttonText: '#ffffff',
    inputBg: '#1f150c',
    inputBorder: 'rgba(253, 186, 116, 0.15)',
    selectionBg: 'rgba(251, 146, 60, 0.25)',
  },
  /* ── 4: Sakura — 樱花粉，浪漫柔和 ── */
  {
    primary: '#f472b6',
    primaryHover: '#ec4899',
    primaryLight: '#f9a8d4',
    primaryGradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #ec4899 0%, #db2777 50%, #be185d 100%)',
    primaryRgb: '244, 114, 182',
    primaryAlpha: 'rgba(244, 114, 182, 0.12)',
    bgPrimary: '#18111a',
    bgSecondary: '#251b26',
    bgTertiary: '#332532',
    bgElevated: 'rgba(37, 27, 38, 0.92)',
    bgGradient: 'linear-gradient(135deg, #18111a 0%, #251b26 30%, #332532 60%, #4a2840 100%)',
    accent: '#f9a8d4',
    accentRgb: '249, 168, 212',
    accentGradient: 'linear-gradient(135deg, #f9a8d4 0%, #f472b6 50%, #ec4899 100%)',
    borderSecondary: 'rgba(249, 168, 212, 0.22)',
    borderFocus: '#f472b6',
    textPrimary: '#fdf2f8',
    textSecondary: '#fce7f3',
    textAccent: '#fbcfe8',
    linkColor: '#fbcfe8',
    placeholderColor: 'rgba(252, 231, 243, 0.45)',
    buttonBg: '#ec4899',
    buttonHover: '#db2777',
    buttonText: '#ffffff',
    inputBg: '#251b26',
    inputBorder: 'rgba(249, 168, 212, 0.18)',
    selectionBg: 'rgba(244, 114, 182, 0.25)',
  },
  /* ── 5: Ocean — 深海蓝，沉稳专业 ── */
  {
    primary: '#0ea5e9',
    primaryHover: '#0284c7',
    primaryLight: '#38bdf8',
    primaryGradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%)',
    primaryRgb: '14, 165, 233',
    primaryAlpha: 'rgba(14, 165, 233, 0.12)',
    bgPrimary: '#0a1520',
    bgSecondary: '#0f1f2e',
    bgTertiary: '#162a3f',
    bgElevated: 'rgba(15, 31, 46, 0.92)',
    bgGradient: 'linear-gradient(135deg, #0a1520 0%, #0f1f2e 30%, #162a3f 60%, #1d3852 100%)',
    accent: '#38bdf8',
    accentRgb: '56, 189, 248',
    accentGradient: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%)',
    borderSecondary: 'rgba(56, 189, 248, 0.2)',
    borderFocus: '#38bdf8',
    textPrimary: '#f0f9ff',
    textSecondary: '#e0f2fe',
    textAccent: '#7dd3fc',
    linkColor: '#7dd3fc',
    placeholderColor: 'rgba(224, 242, 254, 0.45)',
    buttonBg: '#0284c7',
    buttonHover: '#0369a1',
    buttonText: '#ffffff',
    inputBg: '#0f1f2e',
    inputBorder: 'rgba(56, 189, 248, 0.15)',
    selectionBg: 'rgba(14, 165, 233, 0.25)',
  },
  /* ── 6: Forest — 翠竹林，自然健康 ── */
  {
    primary: '#22c55e',
    primaryHover: '#16a34a',
    primaryLight: '#4ade80',
    primaryGradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)',
    primaryRgb: '34, 197, 94',
    primaryAlpha: 'rgba(34, 197, 94, 0.12)',
    bgPrimary: '#0a1510',
    bgSecondary: '#0f2216',
    bgTertiary: '#163020',
    bgElevated: 'rgba(15, 34, 22, 0.92)',
    bgGradient: 'linear-gradient(135deg, #0a1510 0%, #0f2216 30%, #163020 60%, #1d4028 100%)',
    accent: '#4ade80',
    accentRgb: '74, 222, 128',
    accentGradient: 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)',
    borderSecondary: 'rgba(74, 222, 128, 0.2)',
    borderFocus: '#22c55e',
    textPrimary: '#ecfdf5',
    textSecondary: '#d1fae5',
    textAccent: '#86efac',
    linkColor: '#86efac',
    placeholderColor: 'rgba(209, 250, 229, 0.45)',
    buttonBg: '#16a34a',
    buttonHover: '#15803d',
    buttonText: '#ffffff',
    inputBg: '#0f2216',
    inputBorder: 'rgba(74, 222, 128, 0.15)',
    selectionBg: 'rgba(34, 197, 94, 0.25)',
  },
  /* ── 7: Indigo — 靛蓝，专业专注 ── */
  {
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    primaryLight: '#818cf8',
    primaryGradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 50%, #3730a3 100%)',
    primaryRgb: '99, 102, 241',
    primaryAlpha: 'rgba(99, 102, 241, 0.12)',
    bgPrimary: '#0f1129',
    bgSecondary: '#181b3a',
    bgTertiary: '#222552',
    bgElevated: 'rgba(24, 27, 58, 0.92)',
    bgGradient: 'linear-gradient(135deg, #0f1129 0%, #181b3a 30%, #222552 60%, #2d3270 100%)',
    accent: '#818cf8',
    accentRgb: '129, 140, 248',
    accentGradient: 'linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)',
    borderSecondary: 'rgba(129, 140, 248, 0.22)',
    borderFocus: '#818cf8',
    textPrimary: '#eef2ff',
    textSecondary: '#c7d2fe',
    textAccent: '#a5b4fc',
    linkColor: '#a5b4fc',
    placeholderColor: 'rgba(199, 210, 254, 0.45)',
    buttonBg: '#6366f1',
    buttonHover: '#4f46e5',
    buttonText: '#ffffff',
    inputBg: '#1a1d3a',
    inputBorder: 'rgba(129, 140, 248, 0.18)',
    selectionBg: 'rgba(99, 102, 241, 0.25)',
  },
  /* ── 8: Sunset — 落日橙，活力温暖 ── */
  {
    primary: '#f59e0b',
    primaryHover: '#d97706',
    primaryLight: '#fbbf24',
    primaryGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #92400e 100%)',
    primaryRgb: '245, 158, 11',
    primaryAlpha: 'rgba(245, 158, 11, 0.12)',
    bgPrimary: '#18120a',
    bgSecondary: '#261e0e',
    bgTertiary: '#352a14',
    bgElevated: 'rgba(38, 30, 14, 0.92)',
    bgGradient: 'linear-gradient(135deg, #18120a 0%, #261e0e 30%, #352a14 60%, #4a3a1a 100%)',
    accent: '#fbbf24',
    accentRgb: '251, 191, 36',
    accentGradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
    borderSecondary: 'rgba(251, 191, 36, 0.2)',
    borderFocus: '#f59e0b',
    textPrimary: '#fffbeb',
    textSecondary: '#fef3c7',
    textAccent: '#fcd34d',
    linkColor: '#fcd34d',
    placeholderColor: 'rgba(254, 243, 199, 0.45)',
    buttonBg: '#d97706',
    buttonHover: '#b45309',
    buttonText: '#ffffff',
    inputBg: '#1f180e',
    inputBorder: 'rgba(251, 191, 36, 0.15)',
    selectionBg: 'rgba(245, 158, 11, 0.25)',
  },
];

/**
 * None palette — clean light theme (idx = -1).
 * Uses neutral grays that don't interfere with host page styling.
 * When applied to YiPet containers, provides a professional light appearance.
 */
export const NONE_PALETTE: ThemePalette = {
  primary: '#6366f1',
  primaryHover: '#4f46e5',
  primaryLight: '#818cf8',
  primaryGradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
  primaryGradientHover: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 50%, #3730a3 100%)',
  primaryRgb: '99, 102, 241',
  primaryAlpha: 'rgba(99, 102, 241, 0.08)',
  bgPrimary: '#ffffff',
  bgSecondary: '#f8fafc',
  bgTertiary: '#f1f5f9',
  bgElevated: '#ffffff',
  bgGradient: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
  accent: '#6366f1',
  accentRgb: '99, 102, 241',
  accentGradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
  borderSecondary: 'rgba(0, 0, 0, 0.1)',
  borderFocus: '#6366f1',
  textPrimary: '#1e293b',
  textSecondary: '#475569',
  textAccent: '#4f46e5',
  linkColor: '#4f46e5',
  placeholderColor: 'rgba(71, 85, 105, 0.45)',
  buttonBg: '#6366f1',
  buttonHover: '#4f46e5',
  buttonText: '#ffffff',
  inputBg: '#ffffff',
  inputBorder: 'rgba(0, 0, 0, 0.12)',
  selectionBg: 'rgba(99, 102, 241, 0.15)',
};

/**
 * Apply theme palette CSS variables to a root element.
 * Pass idx = -1 for the None (light) palette.
 * Target should be a YiPet container element, NOT document.documentElement,
 * to avoid overriding host page styles.
 */
export function applyThemeColors(root: HTMLElement, idx: number): void {
  if (idx < 0) {
    applyPalette(root, NONE_PALETTE, 'light');
    return;
  }
  const safe = idx >= 0 && idx < THEME_PALETTES.length ? idx : 0;
  applyPalette(root, THEME_PALETTES[safe], 'dark');
}

/** Apply a generated theme from a custom hex color. Returns false for invalid hex. */
export function applyThemeHex(root: HTMLElement, hex: string): boolean {
  const palette = generatePalette(hex);
  if (!palette) return false;
  applyPalette(root, palette, 'dark');
  return true;
}

/** Remove theme-injected CSS variables. */
export function clearThemeColors(root: HTMLElement): void {
  for (const name of THEME_VAR_KEYS) {
    root.style.removeProperty(name);
  }
  root.style.colorScheme = '';
}
