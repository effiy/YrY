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

// eslint-disable-next-line max-len
const THEMES: ThemeRecord[] = [
  {
    /* 0: Quantum Violet */
    '--primary': '#667eea',
    '--primary-hover': '#5a67d8',
    '--primary-light': '#818cf8',
    '--primary-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    '--primary-gradient-hover': 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 50%, #d946ef 100%)',
    '--primary-rgb': '102,126,234',
    '--primary-alpha': 'rgba(102,126,234,0.1)',
    '--bg-primary': '#13122a',
    '--bg-secondary': '#1e1a3b',
    '--bg-tertiary': '#312d55',
    '--bg-elevated': 'rgba(30,26,59,0.9)',
    '--bg-gradient':
      'linear-gradient(135deg, #13122a 0%, #1e1a3b 25%, #312d55 50%, #3d3870 75%, #5b5290 100%)',
    '--accent': '#a78bfa',
    '--accent-rgb': '167,139,250',
    '--accent-gradient': 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)',
    '--border-secondary': 'rgba(167,139,250,0.3)',
    '--border-focus': '#a78bfa',
    '--text-primary': '#f5f3ff',
    '--text-secondary': '#d4d0e8',
    '--text-accent': '#c4b5fd',
    '--link-color': '#c4b5fd',
    '--placeholder-color': 'rgba(212,208,232,0.5)',
    '--button-bg': '#667eea',
    '--button-hover': '#5a67d8',
    '--button-text': '#ffffff',
    '--input-bg': '#1a1835',
    '--input-border': 'rgba(167,139,250,0.2)',
    '--selection-bg': 'rgba(102,126,234,0.3)',
    '--shadow-primary': '0 4px 20px rgba(102,126,234,0.4),0 0 0 1px rgba(255,255,255,0.1) inset',
    '--green': '#667eea',
  },
  {
    /* 1: Indigo Violet */
    '--primary': '#6366f1',
    '--primary-hover': '#4f46e5',
    '--primary-light': '#818cf8',
    '--primary-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
    '--primary-gradient-hover': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)',
    '--primary-rgb': '99,102,241',
    '--primary-alpha': 'rgba(99,102,241,0.1)',
    '--bg-primary': '#11132b',
    '--bg-secondary': '#1a1c3d',
    '--bg-tertiary': '#2a2d5c',
    '--bg-elevated': 'rgba(26,28,61,0.9)',
    '--bg-gradient':
      'linear-gradient(135deg, #11132b 0%, #1a1c3d 25%, #2a2d5c 50%, #3b3e78 75%, #4f52a0 100%)',
    '--accent': '#818cf8',
    '--accent-rgb': '129,140,248',
    '--accent-gradient': 'linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)',
    '--border-secondary': 'rgba(129,140,248,0.3)',
    '--border-focus': '#818cf8',
    '--text-primary': '#f3f2ff',
    '--text-secondary': '#d2d0e8',
    '--text-accent': '#a5b4fc',
    '--link-color': '#a5b4fc',
    '--placeholder-color': 'rgba(210,208,232,0.5)',
    '--button-bg': '#6366f1',
    '--button-hover': '#4f46e5',
    '--button-text': '#ffffff',
    '--input-bg': '#181730',
    '--input-border': 'rgba(129,140,248,0.2)',
    '--selection-bg': 'rgba(99,102,241,0.3)',
    '--shadow-primary': '0 4px 20px rgba(99,102,241,0.4),0 0 0 1px rgba(255,255,255,0.1) inset',
    '--green': '#6366f1',
  },
  {
    /* 2: Quantum Ocean */
    '--primary': '#06b6d4',
    '--primary-hover': '#0891b2',
    '--primary-light': '#22d3ee',
    '--primary-gradient': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)',
    '--primary-gradient-hover': 'linear-gradient(135deg, #0891b2 0%, #2563eb 50%, #4f46e5 100%)',
    '--primary-rgb': '6,182,212',
    '--primary-alpha': 'rgba(6,182,212,0.1)',
    '--bg-primary': '#0a1a22',
    '--bg-secondary': '#0e2430',
    '--bg-tertiary': '#143848',
    '--bg-elevated': 'rgba(14,36,48,0.9)',
    '--bg-gradient':
      'linear-gradient(135deg, #0a1a22 0%, #0e2430 25%, #143848 50%, #1a4d63 75%, #226b8a 100%)',
    '--accent': '#22d3ee',
    '--accent-rgb': '34,211,238',
    '--accent-gradient': 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 50%, #0891b2 100%)',
    '--border-secondary': 'rgba(34,211,238,0.3)',
    '--border-focus': '#22d3ee',
    '--text-primary': '#f0f9fb',
    '--text-secondary': '#c8e4ea',
    '--text-accent': '#67e8f9',
    '--link-color': '#67e8f9',
    '--placeholder-color': 'rgba(200,228,234,0.5)',
    '--button-bg': '#06b6d4',
    '--button-hover': '#0891b2',
    '--button-text': '#ffffff',
    '--input-bg': '#0f1e28',
    '--input-border': 'rgba(34,211,238,0.2)',
    '--selection-bg': 'rgba(6,182,212,0.3)',
    '--shadow-primary': '0 4px 20px rgba(6,182,212,0.4),0 0 0 1px rgba(255,255,255,0.1) inset',
    '--green': '#06b6d4',
  },
  {
    /* 3: Quantum Forest */
    '--primary': '#22c55e',
    '--primary-hover': '#16a34a',
    '--primary-light': '#4ade80',
    '--primary-gradient': 'linear-gradient(135deg, #22c55e 0%, #10b981 50%, #059669 100%)',
    '--primary-gradient-hover': 'linear-gradient(135deg, #16a34a 0%, #059669 50%, #047857 100%)',
    '--primary-rgb': '34,197,94',
    '--primary-alpha': 'rgba(34,197,94,0.1)',
    '--bg-primary': '#0a1a12',
    '--bg-secondary': '#0e2418',
    '--bg-tertiary': '#143824',
    '--bg-elevated': 'rgba(14,36,24,0.9)',
    '--bg-gradient':
      'linear-gradient(135deg, #0a1a12 0%, #0e2418 25%, #143824 50%, #1a4d30 75%, #226b42 100%)',
    '--accent': '#34d399',
    '--accent-rgb': '52,211,153',
    '--accent-gradient': 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
    '--border-secondary': 'rgba(52,211,153,0.3)',
    '--border-focus': '#34d399',
    '--text-primary': '#f0faf3',
    '--text-secondary': '#c8e8d0',
    '--text-accent': '#6ee7b7',
    '--link-color': '#6ee7b7',
    '--placeholder-color': 'rgba(200,232,208,0.5)',
    '--button-bg': '#22c55e',
    '--button-hover': '#16a34a',
    '--button-text': '#ffffff',
    '--input-bg': '#0f1e16',
    '--input-border': 'rgba(52,211,153,0.2)',
    '--selection-bg': 'rgba(34,197,94,0.3)',
    '--shadow-primary': '0 4px 20px rgba(34,197,94,0.4),0 0 0 1px rgba(255,255,255,0.1) inset',
    '--green': '#22c55e',
  },
  {
    /* 4: Quantum Sunset */
    '--primary': '#f59e0b',
    '--primary-hover': '#d97706',
    '--primary-light': '#fbbf24',
    '--primary-gradient': 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)',
    '--primary-gradient-hover': 'linear-gradient(135deg, #d97706 0%, #db2777 50%, #9333ea 100%)',
    '--primary-rgb': '245,158,11',
    '--primary-alpha': 'rgba(245,158,11,0.1)',
    '--bg-primary': '#1a140a',
    '--bg-secondary': '#281e0e',
    '--bg-tertiary': '#3d2e14',
    '--bg-elevated': 'rgba(40,30,14,0.9)',
    '--bg-gradient':
      'linear-gradient(135deg, #1a140a 0%, #281e0e 25%, #3d2e14 50%, #5c401a 75%, #855e22 100%)',
    '--accent': '#fbbf24',
    '--accent-rgb': '251,191,36',
    '--accent-gradient': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
    '--border-secondary': 'rgba(251,191,36,0.3)',
    '--border-focus': '#fbbf24',
    '--text-primary': '#fdf8f0',
    '--text-secondary': '#e8dcc8',
    '--text-accent': '#fcd34d',
    '--link-color': '#fcd34d',
    '--placeholder-color': 'rgba(232,220,200,0.5)',
    '--button-bg': '#f59e0b',
    '--button-hover': '#d97706',
    '--button-text': '#1a140a',
    '--input-bg': '#1f180e',
    '--input-border': 'rgba(251,191,36,0.2)',
    '--selection-bg': 'rgba(245,158,11,0.3)',
    '--shadow-primary': '0 4px 20px rgba(245,158,11,0.4),0 0 0 1px rgba(255,255,255,0.1) inset',
    '--green': '#f59e0b',
  },
];

export const THEME_COUNT = THEMES.length;

export function getGradientByIndex(idx: number): string {
  if (idx < 0) return 'none';
  const safe = idx >= 0 && idx < THEME_COUNT ? idx : 0;
  return THEMES[safe]['--primary-gradient'] || 'none';
}

export function applyThemeColors(root: HTMLElement, idx: number): void {
  if (idx < 0) {
    for (const k of Object.keys(THEMES[0])) root.style.removeProperty(k);
    return;
  }
  const safe = idx >= 0 && idx < THEME_COUNT ? idx : 0;
  const vars = THEMES[safe];
  const s = root.style;
  for (const key of Object.keys(vars)) s.setProperty(key, vars[key]);
}
