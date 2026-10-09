/**
 * chrome.storage read/write helpers.
 *
 * Components share state through chrome.storage — never through
 * module-level variables (service workers only live ~30s).
 *
 * Implementation delegates to the unified KV wrapper (`kv.ts`) which
 * centralises error isolation and map-keyed operations.
 */

import type { PetGlobalState, UserPrefs } from '@/shared/ipc/messages';
import {
  readMapEntry,
  patchMapEntry,
  readObjectKV,
  writeKV,
} from './kv';

const GLOBAL_STATE_KEY = 'pet_global_state';
const PREFS_KEY = 'prefs';

// ── Per-Tab State ─────────────────────────────────────────────────────────

export type TabStateMap = Record<number, PetGlobalState>;

const EMPTY_TAB_STATE: PetGlobalState = {} as PetGlobalState;

export async function getTabState(tabId: number): Promise<PetGlobalState> {
  return readMapEntry<PetGlobalState>(GLOBAL_STATE_KEY, tabId, EMPTY_TAB_STATE);
}

export async function setTabState(
  tabId: number,
  patch: Partial<PetGlobalState>,
): Promise<PetGlobalState> {
  return patchMapEntry<PetGlobalState>(GLOBAL_STATE_KEY, tabId, patch, EMPTY_TAB_STATE);
}

// ── User Prefs ──────────────────────────────────────────────────────────

const DEFAULT_PREFS: UserPrefs = {
  theme: 'auto',
  fontSize: 14,
  features: {},
};

export async function getPrefs(): Promise<UserPrefs> {
  return readObjectKV<UserPrefs>(PREFS_KEY, DEFAULT_PREFS);
}

export async function setPrefs(patch: Partial<UserPrefs>): Promise<UserPrefs> {
  const updated = await readObjectKV<UserPrefs>(PREFS_KEY, DEFAULT_PREFS).then(
    (current) => ({ ...current, ...patch }),
  );
  await writeKV<UserPrefs>(PREFS_KEY, updated);
  return updated;
}
