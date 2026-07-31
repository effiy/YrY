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

export default piniaPersistConfig;
