/**
 * Pet state persistence — chrome.storage.local helpers for
 * saving and restoring pet visibility, size, role, and color
 * across page reloads.
 *
 * Implementation delegates to the unified KV wrapper (`@/shared/storage/kv`)
 * which centralises error isolation, so each exported helper below focuses on
 * its domain logic instead of try/catch boilerplate.
 */

import {
  readKV,
  readNumberKV,
  readStringKV,
  readMapEntry,
  writeMapEntry,
} from '@/shared/storage/kv';

const PET_URL_STATE_KEY = 'pet_state_by_url';
const ROLE_STORAGE_KEY = 'petRole';
const COLOR_THEME_KEY = 'petColorTheme';

/** In-extension-context guard — public helpers degrade to noop outside Chrome. */
function inExtensionContext(): boolean {
  try {
    return !!(typeof chrome !== 'undefined' && chrome?.runtime?.id);
  } catch {
    return false;
  }
}

/** Derive a stable URL key from the current page (origin + pathname, ignoring hash/query). */
export function getPageUrlKey(): string {
  return window.location.origin + window.location.pathname;
}

/** Persist current pet state to chrome.storage.local (keyed by page URL). */
export function persistPetState(state: {
  visible: boolean;
  size: number;
  role: string;
  color: number;
  customColor?: string;
}): void {
  if (!inExtensionContext()) return;
  const urlKey = getPageUrlKey();
  writeMapEntry(PET_URL_STATE_KEY, urlKey, { ...state }).catch((err: Error) => {
    console.warn('[YiPet] Failed to persist pet state:', err.message);
  });
}

export interface RestoredState {
  visible: boolean;
  size: number;
  role: string;
  color: number;
  customColor?: string;
}

export type StateChangeHandler = (type: string, detail: Record<string, unknown>) => void;

/**
 * Restore saved pet state from chrome.storage.local on content script init.
 * Calls `onChange` for each restored property that differs from current values.
 * Also syncs role with MAIN world after restoration.
 */
export function restorePetState(
  current: RestoredState,
  onChange: StateChangeHandler,
  onRoleSync?: (role: string, systemPrompt: string) => void,
): void {
  const urlKey = getPageUrlKey();

  readMapEntry<Partial<RestoredState> | undefined>(PET_URL_STATE_KEY, urlKey, undefined)
    .then((urlState) => {
      if (urlState && typeof urlState === 'object') {
        if (typeof urlState.visible === 'boolean' && urlState.visible !== current.visible) {
          onChange('visibilityChanged', { visible: urlState.visible });
        }
        if (typeof urlState.size === 'number' && urlState.size !== current.size) {
          onChange('sizeChanged', { size: urlState.size });
        }
        if (typeof urlState.color === 'number' && urlState.color !== current.color) {
          onChange('colorChanged', { color: urlState.color });
        }
        if (typeof urlState.customColor === 'string' && urlState.customColor !== (current.customColor || '')) {
          onChange('customColorChanged', { customColor: urlState.customColor });
        }
      }
    })
    .then(() => {
      // Always sync role with MAIN world — corrects any stale state
      if (onRoleSync) {
        onRoleSync(current.role, '');
      }
    })
    .catch((err: Error) => {
      console.warn('[YiPet] Failed to restore pet state:', err.message);
    });
}

/** Load saved color theme from chrome.storage. */
export async function loadColorTheme(): Promise<number> {
  const saved = await readNumberKV(COLOR_THEME_KEY, null);
  return saved ?? 0;
}

/** Load per-page saved visual state when available. */
export async function loadSavedPetStateForPage(): Promise<Partial<RestoredState>> {
  const urlKey = getPageUrlKey();
  const urlState = await readMapEntry<Partial<RestoredState> | undefined>(
    PET_URL_STATE_KEY,
    urlKey,
    undefined,
  );
  if (urlState && typeof urlState === 'object') {
    return urlState as Partial<RestoredState>;
  }
  return {};
}

/** Load saved role from chrome.storage (global preference, then per-URL). */
export async function loadSavedRole(currentRole: string): Promise<string> {
  // Check global preference first
  const globalRole = await readStringKV(ROLE_STORAGE_KEY, null);
  if (globalRole) return globalRole;

  // Check per-URL state
  const urlKey = getPageUrlKey();
  const urlState = await readKV<{ role?: string } | undefined>(PET_URL_STATE_KEY);
  if (urlState && typeof urlState === 'object') {
    const entry = (urlState as Record<string, { role?: string }>)[urlKey];
    if (entry?.role && typeof entry.role === 'string') {
      return entry.role;
    }
  }

  return currentRole;
}
