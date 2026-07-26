/**
 * Popup service factory for chrome.tabs and chrome.storage wrappers.
 */

export interface TabRef { current: chrome.tabs.Tab | null }

export interface ChromeService {
  getActiveTab(): Promise<chrome.tabs.Tab | null>;
  sendMessage(msg: unknown): Promise<unknown>;
  loadState(): Promise<Record<string, unknown> | null>;
  saveState(state: Record<string, unknown>): Promise<void>;
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
        const result = await chrome.storage.local.get(storageKey);
        return (result && result[storageKey]) || null;
      } catch (err) {
        console.warn('[YiPet Popup] loadState failed:', (err as Error).message);
        return null;
      }
    },

    async saveState(state: Record<string, unknown>) {
      try {
        const payload: Record<string, unknown> = {};
        payload[storageKey] = {
          visible: state.visible,
          size: state.size,
          role: state.role,
          color: state.color,
          model: state.model,
        };
        await chrome.storage.local.set(payload);
      } catch (err) {
        console.warn('[YiPet Popup] saveState failed:', (err as Error).message);
      }
    },
  };
}
