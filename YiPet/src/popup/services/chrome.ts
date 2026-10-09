/**
 * Popup service factory for chrome.tabs and chrome.storage wrappers.
 *
 * Storage access delegates to the unified KV helpers
 * (`readMapEntry`, `writeMapEntry`, `readStringKV`, `writeKV`) so this file
 * no longer calls `chrome.storage.local.*` directly — exceptions are caught
 * inside the helper and surfaced via return values.
 */
import {
  readMapEntry,
  writeMapEntry,
  readStringKV,
  writeKV,
} from '@/shared/storage/kv';

export interface TabRef {
  current: chrome.tabs.Tab | null;
}

export interface ChromeService {
  getActiveTab(): Promise<chrome.tabs.Tab | null>;
  sendMessage(msg: unknown): Promise<unknown>;
  loadState(): Promise<Record<string, unknown> | null>;
  saveState(state: Record<string, unknown>): Promise<void>;
  saveRolePreference(role: string): Promise<void>;
  loadRolePreference(): Promise<string | null>;
}

/** Fields persisted under the per-tab map key. */
interface PerTabState {
  visible: unknown;
  size: unknown;
  role: unknown;
  color: unknown;
  model: unknown;
  pageTheme: unknown;
  customColor: unknown;
}

/** Fields persisted under the per-URL map (content-script side). */
interface PerUrlState {
  visible: unknown;
  size: unknown;
  role: unknown;
  color: unknown;
  customColor: unknown;
}

const PET_URL_STATE_KEY = 'pet_state_by_url';

export function createChromeService(tabRef: TabRef, storageKey: string): ChromeService {
  return {
    async getActiveTab() {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        tabRef.current = tab ?? null;
        return tab ?? null;
      } catch (err) {
        console.warn('[YiPet Popup] getActiveTab failed:', (err as Error).message);
        return null;
      }
    },

    sendMessage(msg: unknown) {
      if (!tabRef.current?.id) return Promise.resolve(null);
      return chrome.tabs.sendMessage(tabRef.current.id, msg).catch((err: Error) => {
        console.warn('[YiPet Popup] sendMessage failed:', err.message);
        return null;
      });
    },

    async loadState() {
      const tabId = tabRef.current?.id;
      if (tabId == null) return null;
      try {
        // readMapEntry returns fallback (null) if the key is absent
        const loaded = await readMapEntry<Record<string, unknown> | null>(
          storageKey,
          tabId,
          null,
        );
        return loaded;
      } catch (err) {
        console.warn('[YiPet Popup] loadState failed:', (err as Error).message);
        return null;
      }
    },

    async saveState(state: Record<string, unknown>) {
      try {
        const tabId = tabRef.current?.id;
        const tabUrl = tabRef.current?.url;
        if (tabId == null) return;

        // Persist per-tab (existing mechanism — popup reads this on open)
        const tabSlice: PerTabState = {
          visible: state.visible,
          size: state.size,
          role: state.role,
          color: state.color,
          model: state.model,
          pageTheme: state.pageTheme,
          customColor: state.customColor,
        };
        await writeMapEntry<PerTabState>(storageKey, tabId, tabSlice);

        // Also persist by page URL so content script can restore on page refresh
        if (tabUrl) {
          const url = new URL(tabUrl);
          const urlKey = url.origin + url.pathname;
          const urlSlice: PerUrlState = {
            visible: state.visible,
            size: state.size,
            role: state.role,
            color: state.color,
            customColor: state.customColor,
          };
          await writeMapEntry<PerUrlState>(PET_URL_STATE_KEY, urlKey, urlSlice);
        }
      } catch (err) {
        console.warn('[YiPet Popup] saveState failed:', (err as Error).message);
      }
    },

    async saveRolePreference(role: string) {
      try {
        await writeKV<string>('petRole', role);
      } catch (err) {
        console.warn('[YiPet Popup] saveRolePreference failed:', (err as Error).message);
      }
    },

    async loadRolePreference() {
      try {
        return await readStringKV('petRole', null);
      } catch (err) {
        console.warn('[YiPet Popup] loadRolePreference failed:', (err as Error).message);
        return null;
      }
    },
  };
}
