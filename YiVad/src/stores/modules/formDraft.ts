import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface FormDraft {
  id: string;
  formId: string;
  formName: string;
  data: Record<string, any>;
  currentStep?: number;
  metadata: {
    createdAt: number;
    updatedAt: number;
    expiresAt: number;
    fieldCount: number;
    totalFields: number;
  };
  version: number;
}

const DB_NAME = "yivad-form-drafts";
const DB_VERSION = 1;
const STORE_NAME = "drafts";
const DRAFT_EXPIRY_DAYS = 30;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const useFormDraftStore = defineStore("formDraft", () => {
  const drafts = ref<FormDraft[]>([]);
  const loading = ref(false);

  const draftCount = computed(() => drafts.value.length);

  async function loadDrafts(): Promise<void> {
    loading.value = true;
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const all = await new Promise<FormDraft[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const now = Date.now();
      drafts.value = all.filter((d) => d.metadata.expiresAt > now);
    } catch {
      drafts.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function saveDraft(draft: FormDraft): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    draft.metadata.updatedAt = Date.now();
    draft.version = (draft.version || 0) + 1;
    await new Promise<void>((resolve, reject) => {
      const request = store.put(draft);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    const idx = drafts.value.findIndex((d) => d.id === draft.id);
    if (idx >= 0) {
      drafts.value[idx] = { ...draft };
    } else {
      drafts.value.push({ ...draft });
    }
  }

  async function deleteDraft(id: string): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    drafts.value = drafts.value.filter((d) => d.id !== id);
  }

  async function getDraft(id: string): Promise<FormDraft | undefined> {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    return new Promise<FormDraft | undefined>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function getDraftsByForm(formId: string): Promise<FormDraft[]> {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const all = await new Promise<FormDraft[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return all.filter((d) => d.formId === formId);
  }

  async function cleanExpiredDrafts(): Promise<void> {
    const now = Date.now();
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const all = await new Promise<FormDraft[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    for (const draft of all) {
      if (draft.metadata.expiresAt <= now) {
        store.delete(draft.id);
      }
    }
    await new Promise<void>((resolve) => {
      tx.oncomplete = () => resolve();
    });
    drafts.value = drafts.value.filter((d) => d.metadata.expiresAt > now);
  }

  function createDraft(formId: string, formName: string, data: Record<string, any>, totalFields: number, currentStep?: number): FormDraft {
    const now = Date.now();
    const filledFields = Object.values(data).filter((v) => v !== null && v !== undefined && v !== "").length;
    return {
      id: `${formId}-${now}`,
      formId,
      formName,
      data: { ...data },
      currentStep,
      metadata: {
        createdAt: now,
        updatedAt: now,
        expiresAt: now + DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
        fieldCount: filledFields,
        totalFields,
      },
      version: 1,
    };
  }

  return {
    drafts,
    loading,
    draftCount,
    loadDrafts,
    saveDraft,
    deleteDraft,
    getDraft,
    getDraftsByForm,
    cleanExpiredDrafts,
    createDraft,
  };
});