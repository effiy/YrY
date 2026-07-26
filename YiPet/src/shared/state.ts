/**
 * chrome.storage read/write helpers.
 *
 * Components share state through chrome.storage — never through
 * module-level variables (service workers only live ~30s).
 */

import type { PetGlobalState, UserPrefs } from './messages';

const GLOBAL_STATE_KEY = 'pet_global_state';
const PREFS_KEY = 'prefs';

// ── Pet Global State ────────────────────────────────────────────────────

export async function getGlobalState(): Promise<PetGlobalState> {
  const result = await chrome.storage.local.get(GLOBAL_STATE_KEY);
  return (result[GLOBAL_STATE_KEY] as PetGlobalState) || {};
}

export async function setGlobalState(patch: Partial<PetGlobalState>): Promise<PetGlobalState> {
  const current = await getGlobalState();
  const updated = { ...current, ...patch };
  await chrome.storage.local.set({ [GLOBAL_STATE_KEY]: updated });
  return updated;
}

export function onGlobalStateChanged(
  cb: (state: PetGlobalState) => void,
): () => void {
  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    area: string,
  ) => {
    if (area === 'local' && changes[GLOBAL_STATE_KEY]) {
      cb(changes[GLOBAL_STATE_KEY].newValue as PetGlobalState);
    }
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}

// ── User Prefs ──────────────────────────────────────────────────────────

const DEFAULT_PREFS: UserPrefs = {
  theme: 'auto',
  fontSize: 14,
  features: {},
};

export async function getPrefs(): Promise<UserPrefs> {
  const result = await chrome.storage.local.get(PREFS_KEY);
  return { ...DEFAULT_PREFS, ...(result[PREFS_KEY] as UserPrefs || {}) };
}

export async function setPrefs(patch: Partial<UserPrefs>): Promise<UserPrefs> {
  const current = await getPrefs();
  const updated = { ...current, ...patch };
  await chrome.storage.local.set({ [PREFS_KEY]: updated });
  return updated;
}
