import type { PersistenceOptions } from "pinia-plugin-persistedstate";

/**
 * @description Pinia persistence parameter configuration
 * @param {String} key Name for persisted storage
 * @param {Array} paths State names to persist
 * @return persist
 * */
const piniaPersistConfig = (key: string, paths?: string[]) => {
  const persist: PersistenceOptions = {
    key,
    storage: localStorage,
    // storage: sessionStorage,
    pick: paths
  };
  return persist;
};

/** Known persistence keys used by Pinia stores — cleared on logout. */
const _PERSISTED_KEYS = [
  "yivad-user",
  "yivad-global",
  "yivad-tabs",
  "yivad-export-templates",
  "yivad-export-history",
  "yivad-notification-preferences",
  "yivad-table-states",
  "yivad-tags",
  "aiChat.activeKey"
];

/** Clear all persisted Pinia store data (call on logout). */
export function clearPersistedState(): void {
  for (const key of _PERSISTED_KEYS) {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  }
}

export default piniaPersistConfig;
