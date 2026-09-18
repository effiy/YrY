/**
 * Theme configuration — local copy for content script self-containment.
 * Must stay in sync with src/shared/theme/colors.ts.
 *
 * Content script entries (bootstrap.js, content.js) are IIFE-wrapped
 * and cannot use ES module imports at runtime. Shared data is duplicated
 * here to avoid cross-entry code splitting.
 *
 * @keep-in-sync src/shared/theme/colors.ts
 */

type ThemeRecord = Record<string, string>;

const THEMES: ThemeRecord[] = [
  {
    /* 0: Slate Pro — cool blue-gray, minimalist professional */
    '--primary': '#64748b',
    '--primary-hover': '#546270',
    '--primary-light': '#94a3b8',
    '--primary-gradient': 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
    '--primary-gradient-hover': 'linear-gradient(135deg, #546270 0%, #3d4a5c 50%, #2d3a4a 100%)',
    '--primary-rgb': '100,116,139',
    '--primary-alpha': 'rgba(100,116,139,0.12)',
    '--bg-primary': '#0f1117',
    '--bg-secondary': '#1a1d24',
    '--bg-tertiary': '#252830',
    '--bg-elevated': 'rgba(26,29,36,0.92)',
    '--bg-gradient': 'linear-gradient(135deg, #0f1117 0%, #1a1d24 30%, #252830 60%, #2d3138 100%)',
    '--accent': '#38bdf8',
    '--accent-rgb': '56,189,248',
    '--accent-gradient': 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%)',
    '--border-secondary': 'rgba(148,163,184,0.18)',
    '--border-focus': '#38bdf8',
    '--text-primary': '#f1f5f9',
    '--text-secondary': '#cbd5e1',
    '--text-accent': '#7dd3fc',
    '--link-color': '#7dd3fc',
    '--placeholder-color': 'rgba(203,213,225,0.45)',
    '--button-bg': '#64748b',
    '--button-hover': '#546270',
    '--button-text': '#ffffff',
    '--input-bg': '#1a1d24',
    '--input-border': 'rgba(148,163,184,0.15)',
    '--selection-bg': 'rgba(100,116,139,0.25)',
    '--green': '#64748b',
  },
  {
    /* 1: Indigo — deep indigo-blue, modern and focused */
    '--primary': '#6366f1',
    '--primary-hover': '#4f46e5',
    '--primary-light': '#818cf8',
    '--primary-gradient': 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
    '--primary-gradient-hover': 'linear-gradient(135deg, #4f46e5 0%, #4338ca 50%, #3730a3 100%)',
    '--primary-rgb': '99,102,241',
    '--primary-alpha': 'rgba(99,102,241,0.12)',
    '--bg-primary': '#0f1129',
    '--bg-secondary': '#181b3a',
    '--bg-tertiary': '#222752',
    '--bg-elevated': 'rgba(24,27,58,0.92)',
    '--bg-gradient': 'linear-gradient(135deg, #0f1129 0%, #181b3a 30%, #222752 60%, #2d3270 100%)',
    '--accent': '#818cf8',
    '--accent-rgb': '129,140,248',
    '--accent-gradient': 'linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)',
    '--border-secondary': 'rgba(129,140,248,0.22)',
    '--border-focus': '#818cf8',
    '--text-primary': '#eef2ff',
    '--text-secondary': '#c7d2fe',
    '--text-accent': '#a5b4fc',
    '--link-color': '#a5b4fc',
    '--placeholder-color': 'rgba(199,210,254,0.45)',
    '--button-bg': '#6366f1',
    '--button-hover': '#4f46e5',
    '--button-text': '#ffffff',
    '--input-bg': '#1a1d3a',
    '--input-border': 'rgba(129,140,248,0.18)',
    '--selection-bg': 'rgba(99,102,241,0.25)',
    '--green': '#6366f1',
  },
  {
    /* 2: Ocean — teal-cyan, calm and clear */
    '--primary': '#0d9488',
    '--primary-hover': '#0f766e',
    '--primary-light': '#2dd4bf',
    '--primary-gradient': 'linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #0284c7 100%)',
    '--primary-gradient-hover': 'linear-gradient(135deg, #0f766e 0%, #0e7490 50%, #0369a1 100%)',
    '--primary-rgb': '13,148,136',
    '--primary-alpha': 'rgba(13,148,136,0.12)',
    '--bg-primary': '#0a1620',
    '--bg-secondary': '#0f1f2b',
    '--bg-tertiary': '#162d3b',
    '--bg-elevated': 'rgba(15,31,43,0.92)',
    '--bg-gradient': 'linear-gradient(135deg, #0a1620 0%, #0f1f2b 30%, #162d3b 60%, #1d3f52 100%)',
    '--accent': '#22d3ee',
    '--accent-rgb': '34,211,238',
    '--accent-gradient': 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 50%, #0891b2 100%)',
    '--border-secondary': 'rgba(34,211,238,0.2)',
    '--border-focus': '#22d3ee',
    '--text-primary': '#ecfeff',
    '--text-secondary': '#cffafe',
    '--text-accent': '#67e8f9',
    '--link-color': '#67e8f9',
    '--placeholder-color': 'rgba(207,250,254,0.45)',
    '--button-bg': '#0d9488',
    '--button-hover': '#0f766e',
    '--button-text': '#ffffff',
    '--input-bg': '#101f28',
    '--input-border': 'rgba(34,211,238,0.15)',
    '--selection-bg': 'rgba(13,148,136,0.25)',
    '--green': '#0d9488',
  },
  {
    /* 3: Forest — emerald green, natural and grounded */
    '--primary': '#16a34a',
    '--primary-hover': '#15803d',
    '--primary-light': '#4ade80',
    '--primary-gradient': 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)',
    '--primary-gradient-hover': 'linear-gradient(135deg, #15803d 0%, #166534 50%, #14532d 100%)',
    '--primary-rgb': '22,163,74',
    '--primary-alpha': 'rgba(22,163,74,0.12)',
    '--bg-primary': '#0a1710',
    '--bg-secondary': '#0f2216',
    '--bg-tertiary': '#162f20',
    '--bg-elevated': 'rgba(15,34,22,0.92)',
    '--bg-gradient': 'linear-gradient(135deg, #0a1710 0%, #0f2216 30%, #162f20 60%, #1d402b 100%)',
    '--accent': '#34d399',
    '--accent-rgb': '52,211,153',
    '--accent-gradient': 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
    '--border-secondary': 'rgba(52,211,153,0.2)',
    '--border-focus': '#34d399',
    '--text-primary': '#ecfdf5',
    '--text-secondary': '#d1fae5',
    '--text-accent': '#6ee7b7',
    '--link-color': '#6ee7b7',
    '--placeholder-color': 'rgba(209,250,229,0.45)',
    '--button-bg': '#16a34a',
    '--button-hover': '#15803d',
    '--button-text': '#ffffff',
    '--input-bg': '#101f16',
    '--input-border': 'rgba(52,211,153,0.15)',
    '--selection-bg': 'rgba(22,163,74,0.25)',
    '--green': '#16a34a',
  },
  {
    /* 4: Sunset — warm amber-orange, energetic */
    '--primary': '#d97706',
    '--primary-hover': '#b45309',
    '--primary-light': '#fbbf24',
    '--primary-gradient': 'linear-gradient(135deg, #d97706 0%, #c2410c 50%, #9a3412 100%)',
    '--primary-gradient-hover': 'linear-gradient(135deg, #b45309 0%, #9a3412 50%, #7c2d12 100%)',
    '--primary-rgb': '217,119,6',
    '--primary-alpha': 'rgba(217,119,6,0.12)',
    '--bg-primary': '#1a140a',
    '--bg-secondary': '#261e0e',
    '--bg-tertiary': '#352a14',
    '--bg-elevated': 'rgba(38,30,14,0.92)',
    '--bg-gradient': 'linear-gradient(135deg, #1a140a 0%, #261e0e 30%, #352a14 60%, #4a3a1a 100%)',
    '--accent': '#fb923c',
    '--accent-rgb': '251,146,60',
    '--accent-gradient': 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)',
    '--border-secondary': 'rgba(251,191,36,0.2)',
    '--border-focus': '#fbbf24',
    '--text-primary': '#fffbeb',
    '--text-secondary': '#fef3c7',
    '--text-accent': '#fcd34d',
    '--link-color': '#fcd34d',
    '--placeholder-color': 'rgba(254,243,199,0.45)',
    '--button-bg': '#d97706',
    '--button-hover': '#b45309',
    '--button-text': '#ffffff',
    '--input-bg': '#1f180e',
    '--input-border': 'rgba(251,191,36,0.15)',
    '--selection-bg': 'rgba(217,119,6,0.25)',
    '--green': '#d97706',
  },
  {
    /* 5: Rose — soft rose-pink, warm and creative */
    '--primary': '#be185d',
    '--primary-hover': '#9d174d',
    '--primary-light': '#f472b6',
    '--primary-gradient': 'linear-gradient(135deg, #be185d 0%, #9d174d 50%, #831843 100%)',
    '--primary-gradient-hover': 'linear-gradient(135deg, #9d174d 0%, #831843 50%, #701a3d 100%)',
    '--primary-rgb': '190,24,93',
    '--primary-alpha': 'rgba(190,24,93,0.12)',
    '--bg-primary': '#1a0f16',
    '--bg-secondary': '#261521',
    '--bg-tertiary': '#351d2e',
    '--bg-elevated': 'rgba(38,21,33,0.92)',
    '--bg-gradient': 'linear-gradient(135deg, #1a0f16 0%, #261521 30%, #351d2e 60%, #4a283f 100%)',
    '--accent': '#f472b6',
    '--accent-rgb': '244,114,182',
    '--accent-gradient': 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
    '--border-secondary': 'rgba(244,114,182,0.22)',
    '--border-focus': '#f472b6',
    '--text-primary': '#fdf2f8',
    '--text-secondary': '#fce7f3',
    '--text-accent': '#f9a8d4',
    '--link-color': '#f9a8d4',
    '--placeholder-color': 'rgba(252,231,243,0.45)',
    '--button-bg': '#be185d',
    '--button-hover': '#9d174d',
    '--button-text': '#ffffff',
    '--input-bg': '#1f141a',
    '--input-border': 'rgba(244,114,182,0.18)',
    '--selection-bg': 'rgba(190,24,93,0.25)',
    '--green': '#be185d',
  },
];

export const THEME_COUNT = THEMES.length;

/**
 * None palette — clean light theme applied when idx < 0 (Color Theme = None).
 * Neutral grays that don't interfere with host page styling.
 */
const NONE_THEME: ThemeRecord = {
  '--primary': '#6366f1',
  '--primary-hover': '#4f46e5',
  '--primary-light': '#818cf8',
  '--primary-gradient': 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
  '--primary-gradient-hover': 'linear-gradient(135deg, #4f46e5 0%, #4338ca 50%, #3730a3 100%)',
  '--primary-rgb': '99,102,241',
  '--primary-alpha': 'rgba(99,102,241,0.08)',
  '--bg-primary': '#ffffff',
  '--bg-secondary': '#f8fafc',
  '--bg-tertiary': '#f1f5f9',
  '--bg-elevated': '#ffffff',
  '--bg-gradient': 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
  '--accent': '#6366f1',
  '--accent-rgb': '99,102,241',
  '--accent-gradient': 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
  '--border-secondary': 'rgba(0,0,0,0.1)',
  '--border-focus': '#6366f1',
  '--text-primary': '#1e293b',
  '--text-secondary': '#475569',
  '--text-accent': '#4f46e5',
  '--link-color': '#4f46e5',
  '--placeholder-color': 'rgba(71,85,105,0.45)',
  '--button-bg': '#6366f1',
  '--button-hover': '#4f46e5',
  '--button-text': '#ffffff',
  '--input-bg': '#ffffff',
  '--input-border': 'rgba(0,0,0,0.12)',
  '--selection-bg': 'rgba(99,102,241,0.15)',
  '--green': '#6366f1',
};

/**
 * Inject the active theme's palette onto a root element's inline style.
 * Pass idx = -1 to apply the None palette (light theme).
 * IMPORTANT: Target should be a YiPet container (#yipet-chat-root, #yipet-overlay),
 * NOT document.documentElement, to avoid overriding host page styles.
 */
export function applyThemeColors(root: HTMLElement, idx: number): void {
  const s = root.style;
  if (idx < 0) {
    for (const [k, v] of Object.entries(NONE_THEME)) {
      s.setProperty(k, v);
    }
    s.colorScheme = 'light';
    return;
  }
  s.colorScheme = 'dark';
  const safe = idx >= 0 && idx < THEME_COUNT ? idx : 0;
  const vars = THEMES[safe];
  for (const [k, v] of Object.entries(vars)) {
    s.setProperty(k, v);
  }
}