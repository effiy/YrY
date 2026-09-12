import { ref, onMounted, onBeforeUnmount, type Ref } from "vue";

interface OfflineQueueItem {
  id: string;
  type: "create" | "update" | "delete";
  moduleName: string;
  methodName: string;
  parameters: Record<string, any>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: "pending" | "syncing" | "failed";
}

interface UseFormOfflineOptions {
  rpcCall: (moduleName: string, methodName: string, parameters: Record<string, any>) => Promise<any>;
}

const QUEUE_DB = "yivad-offline-queue";
const QUEUE_STORE = "sync-queue";

export const useFormOffline = (options: UseFormOfflineOptions) => {
  const { rpcCall } = options;

  const isOnline = ref(navigator.onLine);
  const isSyncing = ref(false);
  const queueLength = ref(0);
  const syncError = ref<string | null>(null);

  async function openQueueDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(QUEUE_DB, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(QUEUE_STORE)) {
          request.result.createObjectStore(QUEUE_STORE, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function enqueue(item: Omit<OfflineQueueItem, "id" | "timestamp" | "retryCount" | "maxRetries" | "status">): Promise<void> {
    const queueItem: OfflineQueueItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3,
      status: "pending",
    };

    const db = await openQueueDB();
    const tx = db.transaction(QUEUE_STORE, "readwrite");
    await new Promise<void>((resolve, reject) => {
      const request = tx.objectStore(QUEUE_STORE).add(queueItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    queueLength.value++;
  }

  async function getQueue(): Promise<OfflineQueueItem[]> {
    const db = await openQueueDB();
    const tx = db.transaction(QUEUE_STORE, "readonly");
    return new Promise((resolve, reject) => {
      const request = tx.objectStore(QUEUE_STORE).getAll();
      request.onsuccess = () => {
        const items = request.result as OfflineQueueItem[];
        resolve(items.sort((a, b) => a.timestamp - b.timestamp));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async function removeFromQueue(id: string): Promise<void> {
    const db = await openQueueDB();
    const tx = db.transaction(QUEUE_STORE, "readwrite");
    await new Promise<void>((resolve, reject) => {
      const request = tx.objectStore(QUEUE_STORE).delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async function syncQueue(): Promise<void> {
    if (!isOnline.value || isSyncing.value) return;

    isSyncing.value = true;
    syncError.value = null;

    try {
      const queue = await getQueue();
      queueLength.value = queue.length;

      for (const item of queue) {
        item.status = "syncing";

        try {
          await rpcCall(item.moduleName, item.methodName, item.parameters);
          await removeFromQueue(item.id);
        } catch (error) {
          item.retryCount++;
          const status = (error as any)?.response?.status;

          if (status && status >= 400 && status < 500) {
            // Business error — don't retry
            item.status = "failed";
            await updateQueueItem(item);
          } else if (item.retryCount >= item.maxRetries) {
            item.status = "failed";
            await updateQueueItem(item);
            syncError.value = `${queueLength.value} 条同步失败`;
          } else {
            // Keep pending for next retry
            await updateQueueItem(item);
          }
        }
      }
    } finally {
      isSyncing.value = false;
      const remaining = await getQueue();
      queueLength.value = remaining.length;
    }
  }

  async function updateQueueItem(item: OfflineQueueItem): Promise<void> {
    const db = await openQueueDB();
    const tx = db.transaction(QUEUE_STORE, "readwrite");
    await new Promise<void>((resolve, reject) => {
      const request = tx.objectStore(QUEUE_STORE).put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async function clearQueue(): Promise<void> {
    const db = await openQueueDB();
    const tx = db.transaction(QUEUE_STORE, "readwrite");
    await new Promise<void>((resolve, reject) => {
      const request = tx.objectStore(QUEUE_STORE).clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    queueLength.value = 0;
  }

  function handleOnline() {
    isOnline.value = true;
    syncQueue();
  }

  function handleOffline() {
    isOnline.value = false;
  }

  onMounted(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    getQueue().then((q) => (queueLength.value = q.length));
  });

  onBeforeUnmount(() => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  });

  return {
    isOnline,
    isSyncing,
    queueLength,
    syncError,
    enqueue,
    syncQueue,
    clearQueue,
  };
};