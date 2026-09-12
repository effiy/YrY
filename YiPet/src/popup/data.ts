/**
 * Popup configuration — constants and helpers.
 */

import { NONE_PALETTE, THEME_PALETTES } from '@/shared/theme';

// ── Color Labels ────────────────────────────────────────────────────────

const COLOR_LABELS = [
  'Quantum Violet',
  'Indigo Violet',
  'Quantum Ocean',
  'Quantum Forest',
  'Quantum Sunset',
];

export interface ColorOption {
  value: number;
  label: string;
  /** CSS gradient shown on the swatch (mirrors the theme's primary gradient). */
  gradient: string;
}

export const COLOR_OPTIONS: ColorOption[] = [
  { value: -1, label: 'None', gradient: NONE_PALETTE.primaryGradient },
  ...THEME_PALETTES.map((p, i) => ({
    value: i,
    label: COLOR_LABELS[i] || `Theme ${i + 1}`,
    gradient: p.primaryGradient,
  })),
];

// ── Roles ────────────────────────────────────────────────────────────────

export const ROLE_NAMES = ['Teacher', 'Doctor', 'Pastry Chef', 'Police Officer'] as const;

/**
 * Resolve the pet image URL for a role name.
 * Role image files live under `assets/images/<slug>/icon.png` (web-accessible).
 */
export function roleImageUrl(role: string): string {
  const slug = role.toLowerCase().replace(/\s+/g, '-');
  if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
    return chrome.runtime.getURL(`assets/images/${slug}/icon.png`);
  }
  return `assets/images/${slug}/icon.png`;
}

// ── Models ───────────────────────────────────────────────────────────────

export const MODELS = ['qwen3.5:4b', 'qwen3.5-think', 'qwen3-coder'] as const;

// ── Popup Config ─────────────────────────────────────────────────────────

export const POPUP_CONFIG = {
  SIZE: {
    MIN: 80,
    MAX: 400,
    STEP: 20,
    MARKS: {
      80: 'Mini',
      120: 'Default',
      200: 'Medium',
      280: 'Large',
      400: 'XL',
    } as Record<number, string>,
  },
  STORAGE_KEY: 'pet_global_state',
  DEFAULTS: {
    VISIBLE: false,
    SIZE: 120,
    ROLE: 'Teacher',
    COLOR: 0,
    MODEL: 'qwen3.5:4b',
    VERSION: '1.2.0',
  },
};

/**
 * Create a popup config from an app config.
 * Provides the canonical shape expected by test suites and consumers.
 */
export function createPopupConfig(_appConfig: { env: string; apiBase: string }) {
  return {
    ROLES: [...ROLE_NAMES],
    COLORS: COLOR_OPTIONS,
    SIZE: { MIN: 80, MAX: 400, STEP: 20 },
    STORAGE_KEY: 'pet_global_state',
    TIMING: {
      NOTIFICATION_DURATION: 3000,
      CONNECT_RETRY_MAX: 3,
      CONNECT_RETRY_BASE_MS: 500,
    },
    STATUS_DOT: {
      ACTIVE: '#22c55e',
      INACTIVE: '#f59e0b',
    },
    MSG: {
      CONNECTING: 'Connecting…',
      READY: 'Ready',
      READY_OFFLINE: 'Ready (Offline)',
      ACTIVE: 'Active',
      HIDDEN: 'Hidden',
      SHOWN: 'Shown',
      OP_FAILED: 'Operation failed',
    },
    DEFAULTS: {
      VISIBLE: true,
      SIZE: 120,
      ROLE: 'Teacher',
      COLOR: 0,
      MODEL: 'qwen3.5:4b',
      VERSION: '1.2.0',
    },
  };
}