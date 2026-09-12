/**
 * IndexedDB wrapper for offline storage.
 */

const DB_NAME = "yivad-offline";
const DB_VERSION = 1;

export function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("form-data")) {
        db.createObjectStore("form-data", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("sync-queue")) {
        db.createObjectStore("sync-queue", { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeOfflineData(id: string, data: any): Promise<void> {
  const db = await openOfflineDB();
  const tx = db.transaction("form-data", "readwrite");
  await new Promise<void>((resolve, reject) => {
    const request = tx.objectStore("form-data").put({ id, data, timestamp: Date.now() });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getOfflineData(id: string): Promise<any | null> {
  const db = await openOfflineDB();
  const tx = db.transaction("form-data", "readonly");
  return new Promise((resolve, reject) => {
    const request = tx.objectStore("form-data").get(id);
    request.onsuccess = () => resolve(request.result?.data || null);
    request.onerror = () => reject(request.error);
  });
}

export async function clearOfflineData(): Promise<void> {
  const db = await openOfflineDB();
  const tx = db.transaction("form-data", "readwrite");
  await new Promise<void>((resolve, reject) => {
    const request = tx.objectStore("form-data").clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getStorageEstimate(): Promise<{ usage: number; quota: number }> {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
    };
  }
  return { usage: 0, quota: 0 };
}