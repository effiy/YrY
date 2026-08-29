/**
 * chrome.storage read/write helpers.
 *
 * Components share state through chrome.storage — never through
 * module-level variables (service workers only live ~30s).
 */

import type { PetGlobalState, UserPrefs } from '@/shared/ipc/messages';

const GLOBAL_STATE_KEY = 'pet_global_state';
const PREFS_KEY = 'prefs';

// ── Per-Tab State ─────────────────────────────────────────────────────────

export type TabStateMap = Record<number, PetGlobalState>;

export async function getTabState(tabId: number): Promise<PetGlobalState> {
  const result = await chrome.storage.local.get(GLOBAL_STATE_KEY);
  const map = (result[GLOBAL_STATE_KEY] as TabStateMap) || {};
  return map[tabId] || {};
}

export async function setTabState(
  tabId: number,
  patch: Partial<PetGlobalState>,
): Promise<PetGlobalState> {
  const result = await chrome.storage.local.get(GLOBAL_STATE_KEY);
  const map = (result[GLOBAL_STATE_KEY] as TabStateMap) || {};
  const current = map[tabId] || {};
  const updated = { ...current, ...patch };
  map[tabId] = updated;
  await chrome.storage.local.set({ [GLOBAL_STATE_KEY]: map });
  return updated;
}

// ── User Prefs ──────────────────────────────────────────────────────────

const DEFAULT_PREFS: UserPrefs = {
  theme: 'auto',
  fontSize: 14,
  features: {},
};

export async function getPrefs(): Promise<UserPrefs> {
  const result = await chrome.storage.local.get(PREFS_KEY);
  return { ...DEFAULT_PREFS, ...((result[PREFS_KEY] as UserPrefs) || {}) };
}

export async function setPrefs(patch: Partial<UserPrefs>): Promise<UserPrefs> {
  const current = await getPrefs();
  const updated = { ...current, ...patch };
  await chrome.storage.local.set({ [PREFS_KEY]: updated });
  return updated;
}
