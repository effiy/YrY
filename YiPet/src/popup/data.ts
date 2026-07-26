/**
 * Popup configuration adapter.
 * Projects AppConfig into the shape the popup expects.
 * Layer 3 of the config layering pattern.
 */

import type { AppConfig } from '../config/config';
import { PET_CONFIG } from '../config/config';

// ── Helpers ─────────────────────────────────────────────────────────────

function pick<T>(obj: unknown, path: string, fallback: T): T {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null) return fallback;
    cur = (cur as Record<string, unknown>)[part];
  }
  return (cur !== undefined && cur !== null ? cur : fallback) as T;
}

// ── Color Labels ────────────────────────────────────────────────────────

const COLOR_LABELS = [
  'Quantum Violet', 'Indigo Violet', 'Quantum Ocean', 'Quantum Forest', 'Quantum Sunset',
];

function buildColors(gradients: string[]): { value: number; label: string }[] {
  const result: { value: number; label: string }[] = [];
  for (let i = 0; i < gradients.length; i++) {
    result.push({ value: i, label: COLOR_LABELS[i] || `Theme ${i + 1}` });
  }
  return result;
}

// ── Message Table ───────────────────────────────────────────────────────

interface MessageEntry { path: string; def: string }

function buildMessages(table: Record<string, MessageEntry>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of Object.keys(table)) {
    const entry = table[key];
    out[key] = pick(PET_CONFIG.constants, entry.path, entry.def);
  }
  return out;
}

// ── Popup Config Interface ──────────────────────────────────────────────

export interface PopupConfig {
  ROLES: string[];
  COLORS: { value: number; label: string }[];
  SIZE: { MIN: number; MAX: number; STEP: number };
  STORAGE_KEY: string;
  TIMING: {
    NOTIFICATION_DURATION: number;
    CONNECT_RETRY_MAX: number;
    CONNECT_RETRY_BASE_MS: number;
  };
  STATUS_DOT: { ACTIVE: string; INACTIVE: string };
  MSG: Record<string, string>;
  DEFAULTS: {
    VISIBLE: boolean;
    SIZE: number;
    ROLE: string;
    COLOR: number;
    MODEL: string | null;
    VERSION: string;
  };
}

// ── Factory ─────────────────────────────────────────────────────────────

export function createPopupConfig(cfg: AppConfig): PopupConfig {
  const C = cfg.constants;
  const P = cfg.pet;

  return {
    ROLES: ['Teacher', 'Doctor', 'Pastry Chef', 'Police Officer'],

    COLORS: buildColors(P.colors || []),

    SIZE: {
      MIN: pick(P, 'sizeLimits.min', 80),
      MAX: pick(P, 'sizeLimits.max', 400),
      STEP: 10,
    },

    STORAGE_KEY: pick(C, 'storageKeys.globalState', 'pet_global_state'),

    TIMING: {
      NOTIFICATION_DURATION: pick(C, 'TIMING.NOTIFICATION_DURATION', 3000),
      CONNECT_RETRY_MAX: pick(C, 'RETRY.MAX_RETRIES', 3),
      CONNECT_RETRY_BASE_MS: pick(C, 'RETRY.INITIAL_DELAY', 500),
    },

    STATUS_DOT: {
      ACTIVE: pick(C, 'UI.STATUS_DOT_ACTIVE', '#22c55e'),
      INACTIVE: pick(C, 'UI.STATUS_DOT_INACTIVE', '#f59e0b'),
    },

    MSG: buildMessages({
      CONNECTING:     { path: 'none',                         def: 'Connecting…' },
      READY:          { path: 'none',                         def: 'Ready' },
      READY_OFFLINE:  { path: 'none',                         def: 'Ready (Offline)' },
      ACTIVE:         { path: 'none',                         def: 'Active' },
      HIDDEN:         { path: 'none',                         def: 'Hidden' },
      SHOWN:          { path: 'SUCCESS_MESSAGES.SHOWN',       def: 'Shown' },
      SIZE_UPDATED:   { path: 'SUCCESS_MESSAGES.SIZE_UPDATED',def: 'Size Updated' },
      ROLE_CHANGED:   { path: 'SUCCESS_MESSAGES.ROLE_CHANGED',def: 'Role Changed' },
      COLOR_SET:      { path: 'SUCCESS_MESSAGES.COLOR_SET',   def: 'Color Theme Set' },
      OP_FAILED:      { path: 'ERROR_MESSAGES.OPERATION_FAILED', def: 'Operation Failed' },
      TAB_NOT_FOUND:  { path: 'ERROR_MESSAGES.TAB_NOT_FOUND', def: 'Cannot Get Current Tab' },
      INIT_FAILED:    { path: 'ERROR_MESSAGES.INIT_FAILED',   def: 'Initialization Failed' },
      CS_NOT_READY:   { path: 'none',                         def: 'Content Script Not Ready' },
    }),

    DEFAULTS: {
      VISIBLE: pick(P, 'defaultVisible', false),
      SIZE: pick(P, 'defaultSize', 260),
      ROLE: pick(C, 'DEFAULTS.PET_ROLE', 'Teacher'),
      COLOR: pick(P, 'defaultColorIndex', 0),
      MODEL: null,
      VERSION: pick(C, 'DEFAULTS.VERSION', '1.1.2'),
    },
  };
}

export const POPUP_CONFIG = createPopupConfig(PET_CONFIG);
