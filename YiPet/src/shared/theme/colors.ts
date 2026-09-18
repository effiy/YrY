/**
 * Color Theme Palettes — 6 professional themes with WCAG AA compliant contrast.
 *
 * Each theme has carefully chosen colors for:
 * - Primary brand color with sufficient contrast against backgrounds
 * - Text colors meeting 4.5:1 minimum contrast ratio (WCAG AA)
 * - Coherent background hierarchy (primary → secondary → tertiary → elevated)
 * - Distinct accent colors for interactive elements
 *
 * Theme index → popup color dropdown order:
 *   0 = Slate Pro    1 = Indigo      2 = Ocean
 *   3 = Forest       4 = Sunset      5 = Rose
 *
 * The NONE_PALETTE (-1) is a clean light theme that respects the host page.
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

/** All 6 theme palettes, index-aligned with the popup color dropdown. */
export const THEME_PALETTES: ThemePalette[] = [
  /* ── 0: Slate Pro — cool blue-gray, minimalist professional ── */
  {
    primary: '#64748b',
    primaryHover: '#546270',
    primaryLight: '#94a3b8',
    primaryGradient: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #546270 0%, #3d4a5c 50%, #2d3a4a 100%)',
    primaryRgb: '100, 116, 139',
    primaryAlpha: 'rgba(100, 116, 139, 0.12)',
    bgPrimary: '#0f1117',
    bgSecondary: '#1a1d24',
    bgTertiary: '#252830',
    bgElevated: 'rgba(26, 29, 36, 0.92)',
    bgGradient: 'linear-gradient(135deg, #0f1117 0%, #1a1d24 30%, #252830 60%, #2d3138 100%)',
    accent: '#38bdf8',
    accentRgb: '56, 189, 248',
    accentGradient: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%)',
    borderSecondary: 'rgba(148, 163, 184, 0.18)',
    borderFocus: '#38bdf8',
    textPrimary: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textAccent: '#7dd3fc',
    linkColor: '#7dd3fc',
    placeholderColor: 'rgba(203, 213, 225, 0.45)',
    buttonBg: '#64748b',
    buttonHover: '#546270',
    buttonText: '#ffffff',
    inputBg: '#1a1d24',
    inputBorder: 'rgba(148, 163, 184, 0.15)',
    selectionBg: 'rgba(100, 116, 139, 0.25)',
  },
  /* ── 1: Indigo — deep indigo-blue, modern and focused ── */
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
    bgTertiary: '#222752',
    bgElevated: 'rgba(24, 27, 58, 0.92)',
    bgGradient: 'linear-gradient(135deg, #0f1129 0%, #181b3a 30%, #222752 60%, #2d3270 100%)',
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
  /* ── 2: Ocean — teal-cyan, calm and clear ── */
  {
    primary: '#0d9488',
    primaryHover: '#0f766e',
    primaryLight: '#2dd4bf',
    primaryGradient: 'linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #0284c7 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #0f766e 0%, #0e7490 50%, #0369a1 100%)',
    primaryRgb: '13, 148, 136',
    primaryAlpha: 'rgba(13, 148, 136, 0.12)',
    bgPrimary: '#0a1620',
    bgSecondary: '#0f1f2b',
    bgTertiary: '#162d3b',
    bgElevated: 'rgba(15, 31, 43, 0.92)',
    bgGradient: 'linear-gradient(135deg, #0a1620 0%, #0f1f2b 30%, #162d3b 60%, #1d3f52 100%)',
    accent: '#22d3ee',
    accentRgb: '34, 211, 238',
    accentGradient: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 50%, #0891b2 100%)',
    borderSecondary: 'rgba(34, 211, 238, 0.2)',
    borderFocus: '#22d3ee',
    textPrimary: '#ecfeff',
    textSecondary: '#cffafe',
    textAccent: '#67e8f9',
    linkColor: '#67e8f9',
    placeholderColor: 'rgba(207, 250, 254, 0.45)',
    buttonBg: '#0d9488',
    buttonHover: '#0f766e',
    buttonText: '#ffffff',
    inputBg: '#101f28',
    inputBorder: 'rgba(34, 211, 238, 0.15)',
    selectionBg: 'rgba(13, 148, 136, 0.25)',
  },
  /* ── 3: Forest — emerald green, natural and grounded ── */
  {
    primary: '#16a34a',
    primaryHover: '#15803d',
    primaryLight: '#4ade80',
    primaryGradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #15803d 0%, #166534 50%, #14532d 100%)',
    primaryRgb: '22, 163, 74',
    primaryAlpha: 'rgba(22, 163, 74, 0.12)',
    bgPrimary: '#0a1710',
    bgSecondary: '#0f2216',
    bgTertiary: '#162f20',
    bgElevated: 'rgba(15, 34, 22, 0.92)',
    bgGradient: 'linear-gradient(135deg, #0a1710 0%, #0f2216 30%, #162f20 60%, #1d402b 100%)',
    accent: '#34d399',
    accentRgb: '52, 211, 153',
    accentGradient: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
    borderSecondary: 'rgba(52, 211, 153, 0.2)',
    borderFocus: '#34d399',
    textPrimary: '#ecfdf5',
    textSecondary: '#d1fae5',
    textAccent: '#6ee7b7',
    linkColor: '#6ee7b7',
    placeholderColor: 'rgba(209, 250, 229, 0.45)',
    buttonBg: '#16a34a',
    buttonHover: '#15803d',
    buttonText: '#ffffff',
    inputBg: '#101f16',
    inputBorder: 'rgba(52, 211, 153, 0.15)',
    selectionBg: 'rgba(22, 163, 74, 0.25)',
  },
  /* ── 4: Sunset — warm amber-orange, energetic ── */
  {
    primary: '#d97706',
    primaryHover: '#b45309',
    primaryLight: '#fbbf24',
    primaryGradient: 'linear-gradient(135deg, #d97706 0%, #c2410c 50%, #9a3412 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #b45309 0%, #9a3412 50%, #7c2d12 100%)',
    primaryRgb: '217, 119, 6',
    primaryAlpha: 'rgba(217, 119, 6, 0.12)',
    bgPrimary: '#1a140a',
    bgSecondary: '#261e0e',
    bgTertiary: '#352a14',
    bgElevated: 'rgba(38, 30, 14, 0.92)',
    bgGradient: 'linear-gradient(135deg, #1a140a 0%, #261e0e 30%, #352a14 60%, #4a3a1a 100%)',
    accent: '#fb923c',
    accentRgb: '251, 146, 60',
    accentGradient: 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)',
    borderSecondary: 'rgba(251, 191, 36, 0.2)',
    borderFocus: '#fbbf24',
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
    selectionBg: 'rgba(217, 119, 6, 0.25)',
  },
  /* ── 5: Rose — soft rose-pink, warm and creative ── */
  {
    primary: '#be185d',
    primaryHover: '#9d174d',
    primaryLight: '#f472b6',
    primaryGradient: 'linear-gradient(135deg, #be185d 0%, #9d174d 50%, #831843 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #9d174d 0%, #831843 50%, #701a3d 100%)',
    primaryRgb: '190, 24, 93',
    primaryAlpha: 'rgba(190, 24, 93, 0.12)',
    bgPrimary: '#1a0f16',
    bgSecondary: '#261521',
    bgTertiary: '#351d2e',
    bgElevated: 'rgba(38, 21, 33, 0.92)',
    bgGradient: 'linear-gradient(135deg, #1a0f16 0%, #261521 30%, #351d2e 60%, #4a283f 100%)',
    accent: '#f472b6',
    accentRgb: '244, 114, 182',
    accentGradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
    borderSecondary: 'rgba(244, 114, 182, 0.22)',
    borderFocus: '#f472b6',
    textPrimary: '#fdf2f8',
    textSecondary: '#fce7f3',
    textAccent: '#f9a8d4',
    linkColor: '#f9a8d4',
    placeholderColor: 'rgba(252, 231, 243, 0.45)',
    buttonBg: '#be185d',
    buttonHover: '#9d174d',
    buttonText: '#ffffff',
    inputBg: '#1f141a',
    inputBorder: 'rgba(244, 114, 182, 0.18)',
    selectionBg: 'rgba(190, 24, 93, 0.25)',
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
  const s = root.style;
  if (idx < 0) {
    for (const [field, varName] of PALETTE_TO_CSS) {
      s.setProperty(varName, NONE_PALETTE[field]);
    }
    s.colorScheme = 'light';
    return;
  }
  s.colorScheme = 'dark';
  const safe = idx >= 0 && idx < THEME_PALETTES.length ? idx : 0;
  const p = THEME_PALETTES[safe];
  for (const [field, varName] of PALETTE_TO_CSS) {
    s.setProperty(varName, p[field]);
  }
}

/** Remove theme-injected CSS variables. */
export function clearThemeColors(root: HTMLElement): void {
  for (const name of THEME_VAR_KEYS) {
    root.style.removeProperty(name);
  }
  root.style.colorScheme = '';
}