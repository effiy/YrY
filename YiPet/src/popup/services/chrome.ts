/**
 * Popup service factory for chrome.tabs and chrome.storage wrappers.
 */

export interface TabRef { current: chrome.tabs.Tab | null }

export interface ChromeService {
  getActiveTab(): Promise<chrome.tabs.Tab | null>;
  sendMessage(msg: unknown): Promise<unknown>;
  loadState(): Promise<Record<string, unknown> | null>;
  saveState(state: Record<string, unknown>): Promise<void>;
  saveRolePreference(role: string): Promise<void>;
  loadRolePreference(): Promise<string | null>;
}

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
      try {
        const tabId = tabRef.current?.id;
        const result = await chrome.storage.local.get(storageKey);
        const map = (result && result[storageKey]) || {};
        if (tabId != null && map[tabId]) return map[tabId];
        return null;
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
        const result = await chrome.storage.local.get(storageKey);
        const map = (result && result[storageKey]) || {};
        map[tabId] = {
          visible: state.visible,
          size: state.size,
          role: state.role,
          color: state.color,
          model: state.model,
        };
        await chrome.storage.local.set({ [storageKey]: map });

        // Also persist by page URL so content script can restore on page refresh
        if (tabUrl) {
          const urlKey = new URL(tabUrl).origin + new URL(tabUrl).pathname;
          const urlResult = await chrome.storage.local.get('pet_state_by_url');
          const urlMap = (urlResult && urlResult['pet_state_by_url']) || {};
          urlMap[urlKey] = {
            visible: state.visible,
            size: state.size,
            role: state.role,
            color: state.color,
          };
          await chrome.storage.local.set({ pet_state_by_url: urlMap });
        }
      } catch (err) {
        console.warn('[YiPet Popup] saveState failed:', (err as Error).message);
      }
    },

    async saveRolePreference(role: string) {
      try {
        await chrome.storage.local.set({ petRole: role });
      } catch (err) {
        console.warn('[YiPet Popup] saveRolePreference failed:', (err as Error).message);
      }
    },

    async loadRolePreference() {
      try {
        const result = await chrome.storage.local.get('petRole');
        return (result && result.petRole) || null;
      } catch (err) {
        console.warn('[YiPet Popup] loadRolePreference failed:', (err as Error).message);
        return null;
      }
    },
  };
}
