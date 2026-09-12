export interface SyncQueueItem {
  id: string;
  type: "create" | "update" | "delete";
  moduleName: string;
  methodName: string;
  parameters: Record<string, any>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: "pending" | "syncing" | "failed";
  lastError?: string;
}

const DB_NAME = "yivad-offline";
const STORE_NAME = "sync-queue";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function addToQueue(item: Omit<SyncQueueItem, "id" | "timestamp" | "retryCount" | "maxRetries" | "status">): Promise<string> {
  const queueItem: SyncQueueItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    retryCount: 0,
    maxRetries: 3,
    status: "pending",
  };

  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  await new Promise<void>((resolve, reject) => {
    const request = tx.objectStore(STORE_NAME).add(queueItem);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

  return queueItem.id;
}

export async function getAllQueueItems(): Promise<SyncQueueItem[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  return new Promise((resolve, reject) => {
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => {
      const items = request.result as SyncQueueItem[];
      resolve(items.sort((a, b) => a.timestamp - b.timestamp));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function updateQueueItem(item: SyncQueueItem): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  await new Promise<void>((resolve, reject) => {
    const request = tx.objectStore(STORE_NAME).put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function removeQueueItem(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  await new Promise<void>((resolve, reject) => {
    const request = tx.objectStore(STORE_NAME).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearQueue(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  await new Promise<void>((resolve, reject) => {
    const request = tx.objectStore(STORE_NAME).clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getQueueLength(): Promise<number> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  return new Promise((resolve, reject) => {
    const request = tx.objectStore(STORE_NAME).count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}