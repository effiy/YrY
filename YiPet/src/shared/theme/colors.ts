/**
 * Color Theme Palettes — complete design-token overrides for all 5 YiPet themes.
 *
 * Each palette defines every color-related CSS custom property from variables.css:
 * primary family, backgrounds, accents, borders, text, shadows.  Apply via
 * `applyThemeColors()` which sets them on `document.documentElement.style` —
 * no file loading, no cache, immediate update.
 *
 * Theme index → popup color dropdown order:
 *   0 = Quantum Violet  1 = Indigo Violet  2 = Quantum Ocean
 *   3 = Quantum Forest   4 = Quantum Sunset
 */

/* eslint-disable max-len */

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
  /* ── Shadow ───────────────────────────────────────────── */
  shadowPrimary: string;
}

/** CSS variable names injected by applyThemeColors (must stay in sync). */
export const THEME_VAR_KEYS = [
  '--primary', '--primary-hover', '--primary-light',
  '--primary-gradient', '--primary-gradient-hover',
  '--primary-rgb', '--primary-alpha',
  '--bg-primary', '--bg-secondary', '--bg-tertiary',
  '--bg-elevated', '--bg-gradient',
  '--accent', '--accent-rgb', '--accent-gradient',
  '--border-secondary', '--border-focus',
  '--text-primary', '--text-secondary', '--text-accent',
  '--link-color', '--placeholder-color',
  '--button-bg', '--button-hover', '--button-text',
  '--input-bg', '--input-border',
  '--selection-bg',
  '--shadow-primary',
  '--green',
] as const;

/** All 5 theme palettes, index-aligned with the popup color dropdown. */
export const THEME_PALETTES: ThemePalette[] = [
  /* ── 0: Quantum Violet — purple/amethyst ─────────────── */
  {
    primary: '#667eea', primaryHover: '#5a67d8', primaryLight: '#818cf8',
    primaryGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 50%, #d946ef 100%)',
    primaryRgb: '102, 126, 234', primaryAlpha: 'rgba(102, 126, 234, 0.1)',
    bgPrimary: '#13122a', bgSecondary: '#1e1a3b', bgTertiary: '#312d55',
    bgElevated: 'rgba(30, 26, 59, 0.9)',
    bgGradient: 'linear-gradient(135deg, #13122a 0%, #1e1a3b 25%, #312d55 50%, #3d3870 75%, #5b5290 100%)',
    accent: '#a78bfa', accentRgb: '167, 139, 250', accentGradient: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)',
    borderSecondary: 'rgba(167, 139, 250, 0.3)', borderFocus: '#a78bfa',
    textPrimary: '#f5f3ff', textSecondary: '#d4d0e8', textAccent: '#c4b5fd', linkColor: '#c4b5fd', placeholderColor: 'rgba(212,208,232,0.5)',
    buttonBg: '#667eea', buttonHover: '#5a67d8', buttonText: '#ffffff',
    inputBg: '#1a1835', inputBorder: 'rgba(167, 139, 250, 0.2)',
    selectionBg: 'rgba(102, 126, 234, 0.3)',
    shadowPrimary: '0 4px 20px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
  },
  /* ── 1: Indigo Violet — deeper indigo/purple ────────── */
  {
    primary: '#6366f1', primaryHover: '#4f46e5', primaryLight: '#818cf8',
    primaryGradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)',
    primaryRgb: '99, 102, 241', primaryAlpha: 'rgba(99, 102, 241, 0.1)',
    bgPrimary: '#11132b', bgSecondary: '#1a1c3d', bgTertiary: '#2a2d5c',
    bgElevated: 'rgba(26, 28, 61, 0.9)',
    bgGradient: 'linear-gradient(135deg, #11132b 0%, #1a1c3d 25%, #2a2d5c 50%, #3b3e78 75%, #4f52a0 100%)',
    accent: '#818cf8', accentRgb: '129, 140, 248', accentGradient: 'linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)',
    borderSecondary: 'rgba(129, 140, 248, 0.3)', borderFocus: '#818cf8',
    textPrimary: '#f3f2ff', textSecondary: '#d2d0e8', textAccent: '#a5b4fc', linkColor: '#a5b4fc', placeholderColor: 'rgba(210,208,232,0.5)',
    buttonBg: '#6366f1', buttonHover: '#4f46e5', buttonText: '#ffffff',
    inputBg: '#181730', inputBorder: 'rgba(129, 140, 248, 0.2)',
    selectionBg: 'rgba(99, 102, 241, 0.3)',
    shadowPrimary: '0 4px 20px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
  },
  /* ── 2: Quantum Ocean — cyan/blue depths ────────────── */
  {
    primary: '#06b6d4', primaryHover: '#0891b2', primaryLight: '#22d3ee',
    primaryGradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #0891b2 0%, #2563eb 50%, #4f46e5 100%)',
    primaryRgb: '6, 182, 212', primaryAlpha: 'rgba(6, 182, 212, 0.1)',
    bgPrimary: '#0a1a22', bgSecondary: '#0e2430', bgTertiary: '#143848',
    bgElevated: 'rgba(14, 36, 48, 0.9)',
    bgGradient: 'linear-gradient(135deg, #0a1a22 0%, #0e2430 25%, #143848 50%, #1a4d63 75%, #226b8a 100%)',
    accent: '#22d3ee', accentRgb: '34, 211, 238', accentGradient: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 50%, #0891b2 100%)',
    borderSecondary: 'rgba(34, 211, 238, 0.3)', borderFocus: '#22d3ee',
    textPrimary: '#f0f9fb', textSecondary: '#c8e4ea', textAccent: '#67e8f9', linkColor: '#67e8f9', placeholderColor: 'rgba(200,228,234,0.5)',
    buttonBg: '#06b6d4', buttonHover: '#0891b2', buttonText: '#ffffff',
    inputBg: '#0f1e28', inputBorder: 'rgba(34, 211, 238, 0.2)',
    selectionBg: 'rgba(6, 182, 212, 0.3)',
    shadowPrimary: '0 4px 20px rgba(6, 182, 212, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
  },
  /* ── 3: Quantum Forest — emerald green ──────────────── */
  {
    primary: '#22c55e', primaryHover: '#16a34a', primaryLight: '#4ade80',
    primaryGradient: 'linear-gradient(135deg, #22c55e 0%, #10b981 50%, #059669 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #16a34a 0%, #059669 50%, #047857 100%)',
    primaryRgb: '34, 197, 94', primaryAlpha: 'rgba(34, 197, 94, 0.1)',
    bgPrimary: '#0a1a12', bgSecondary: '#0e2418', bgTertiary: '#143824',
    bgElevated: 'rgba(14, 36, 24, 0.9)',
    bgGradient: 'linear-gradient(135deg, #0a1a12 0%, #0e2418 25%, #143824 50%, #1a4d30 75%, #226b42 100%)',
    accent: '#34d399', accentRgb: '52, 211, 153', accentGradient: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
    borderSecondary: 'rgba(52, 211, 153, 0.3)', borderFocus: '#34d399',
    textPrimary: '#f0faf3', textSecondary: '#c8e8d0', textAccent: '#6ee7b7', linkColor: '#6ee7b7', placeholderColor: 'rgba(200,232,208,0.5)',
    buttonBg: '#22c55e', buttonHover: '#16a34a', buttonText: '#ffffff',
    inputBg: '#0f1e16', inputBorder: 'rgba(52, 211, 153, 0.2)',
    selectionBg: 'rgba(34, 197, 94, 0.3)',
    shadowPrimary: '0 4px 20px rgba(34, 197, 94, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
  },
  /* ── 4: Quantum Sunset — warm amber/pink ────────────── */
  {
    primary: '#f59e0b', primaryHover: '#d97706', primaryLight: '#fbbf24',
    primaryGradient: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)',
    primaryGradientHover: 'linear-gradient(135deg, #d97706 0%, #db2777 50%, #9333ea 100%)',
    primaryRgb: '245, 158, 11', primaryAlpha: 'rgba(245, 158, 11, 0.1)',
    bgPrimary: '#1a140a', bgSecondary: '#281e0e', bgTertiary: '#3d2e14',
    bgElevated: 'rgba(40, 30, 14, 0.9)',
    bgGradient: 'linear-gradient(135deg, #1a140a 0%, #281e0e 25%, #3d2e14 50%, #5c401a 75%, #855e22 100%)',
    accent: '#fbbf24', accentRgb: '251, 191, 36', accentGradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
    borderSecondary: 'rgba(251, 191, 36, 0.3)', borderFocus: '#fbbf24',
    textPrimary: '#fdf8f0', textSecondary: '#e8dcc8', textAccent: '#fcd34d', linkColor: '#fcd34d', placeholderColor: 'rgba(232,220,200,0.5)',
    buttonBg: '#f59e0b', buttonHover: '#d97706', buttonText: '#1a140a',
    inputBg: '#1f180e', inputBorder: 'rgba(251, 191, 36, 0.2)',
    selectionBg: 'rgba(245, 158, 11, 0.3)',
    shadowPrimary: '0 4px 20px rgba(245, 158, 11, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
  },
];

/**
 * Inject a complete theme palette onto a root element's inline style.
 * Sets ALL color variables — primary, backgrounds, accents, borders, text, shadows.
 * Pass idx = -1 to clear all injected variables (None / no theme).
 */
export function applyThemeColors(root: HTMLElement, idx: number): void {
  if (idx < 0) { clearThemeColors(root); return; }
  const safe = (idx >= 0 && idx < THEME_PALETTES.length) ? idx : 0;
  const p = THEME_PALETTES[safe];
  const s = root.style;
  s.setProperty('--primary', p.primary);
  s.setProperty('--primary-hover', p.primaryHover);
  s.setProperty('--primary-light', p.primaryLight);
  s.setProperty('--primary-gradient', p.primaryGradient);
  s.setProperty('--primary-gradient-hover', p.primaryGradientHover);
  s.setProperty('--primary-rgb', p.primaryRgb);
  s.setProperty('--primary-alpha', p.primaryAlpha);
  s.setProperty('--bg-primary', p.bgPrimary);
  s.setProperty('--bg-secondary', p.bgSecondary);
  s.setProperty('--bg-tertiary', p.bgTertiary);
  s.setProperty('--bg-elevated', p.bgElevated);
  s.setProperty('--bg-gradient', p.bgGradient);
  s.setProperty('--accent', p.accent);
  s.setProperty('--accent-rgb', p.accentRgb);
  s.setProperty('--accent-gradient', p.accentGradient);
  s.setProperty('--border-secondary', p.borderSecondary);
  s.setProperty('--border-focus', p.borderFocus);
  s.setProperty('--text-primary', p.textPrimary);
  s.setProperty('--text-secondary', p.textSecondary);
  s.setProperty('--text-accent', p.textAccent);
  s.setProperty('--link-color', p.linkColor);
  s.setProperty('--placeholder-color', p.placeholderColor);
  s.setProperty('--button-bg', p.buttonBg);
  s.setProperty('--button-hover', p.buttonHover);
  s.setProperty('--button-text', p.buttonText);
  s.setProperty('--input-bg', p.inputBg);
  s.setProperty('--input-border', p.inputBorder);
  s.setProperty('--selection-bg', p.selectionBg);
  s.setProperty('--shadow-primary', p.shadowPrimary);
  s.setProperty('--green', p.primary);
}

/** Remove all theme-injected CSS custom properties, restoring variables.css defaults. */
export function clearThemeColors(root: HTMLElement): void {
  for (const name of THEME_VAR_KEYS) {
    root.style.removeProperty(name);
  }
}

/** Look up a theme's primary CSS gradient (for pet background-image).
 *  Pass idx < 0 to clear the gradient (None). */
export function getGradientByIndex(idx: number): string {
  if (idx < 0) return 'none';
  const safe = (idx >= 0 && idx < THEME_PALETTES.length) ? idx : 0;
  return THEME_PALETTES[safe].primaryGradient;
}
