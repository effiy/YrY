/**
 * Pet state persistence — chrome.storage.local helpers for
 * saving and restoring pet visibility, size, role, and color
 * across page reloads.
 */

const PET_URL_STATE_KEY = 'pet_state_by_url';
const ROLE_STORAGE_KEY = 'petRole';

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
}): void {
  const urlKey = getPageUrlKey();
  chrome.storage.local
    .get(PET_URL_STATE_KEY)
    .then((result) => {
      const map = result?.[PET_URL_STATE_KEY] || {};
      map[urlKey] = { ...state };
      chrome.storage.local.set({ [PET_URL_STATE_KEY]: map }).catch(() => {});
    })
    .catch(() => {});
}

export interface RestoredState {
  visible: boolean;
  size: number;
  role: string;
  color: number;
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

  chrome.storage.local
    .get(PET_URL_STATE_KEY)
    .then((stateResult: any) => {
      const map = stateResult?.[PET_URL_STATE_KEY] || {};
      const urlState = map[urlKey];
      if (urlState) {
        if (typeof urlState.visible === 'boolean' && urlState.visible !== current.visible) {
          onChange('visibilityChanged', { visible: urlState.visible });
        }
        if (typeof urlState.size === 'number' && urlState.size !== current.size) {
          onChange('sizeChanged', { size: urlState.size });
        }
        if (typeof urlState.color === 'number' && urlState.color !== current.color) {
          onChange('colorChanged', { color: urlState.color });
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
  try {
    const result = await chrome.storage.local.get('petColorTheme');
    const saved = result?.petColorTheme;
    if (typeof saved === 'number') return saved;
  } catch {
    /* use default */
  }
  return 0;
}

/** Load saved role from chrome.storage (global preference, then per-URL). */
export async function loadSavedRole(currentRole: string): Promise<string> {
  // Check global preference first
  try {
    const result = await chrome.storage.local.get(ROLE_STORAGE_KEY);
    const saved = result?.[ROLE_STORAGE_KEY];
    if (saved && typeof saved === 'string') return saved;
  } catch {
    /* ignore */
  }

  // Check per-URL state
  try {
    const urlKey = getPageUrlKey();
    const stateResult = await chrome.storage.local.get(PET_URL_STATE_KEY);
    const map = stateResult?.[PET_URL_STATE_KEY] || {};
    const urlState = map[urlKey];
    if (urlState?.role && typeof urlState.role === 'string') {
      return urlState.role;
    }
  } catch {
    /* use global role */
  }

  return currentRole;
}
