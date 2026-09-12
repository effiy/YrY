import { ref, watch, onBeforeUnmount, type Ref } from "vue";
import { useFormDraftStore, type FormDraft } from "@/stores/modules/formDraft";

interface UseAutoSaveOptions {
  formId: string;
  formName: string;
  formData: Ref<Record<string, any>>;
  totalFields: number;
  currentStep?: Ref<number | undefined>;
  /** Auto-save debounce in ms (default 2000) */
  debounceMs?: number;
  /** Whether auto-save is enabled */
  enabled?: boolean;
}

export const useAutoSave = (options: UseAutoSaveOptions) => {
  const { formId, formName, formData, totalFields, currentStep, debounceMs = 2000, enabled = true } = options;

  const draftStore = useFormDraftStore();
  const saveStatus = ref<"saved" | "saving" | "unsaved" | "idle">("idle");
  const lastSavedAt = ref<string>("");
  const isDirty = ref(false);
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  let draftId: string | null = null;

  function formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  async function persist() {
    if (!enabled || !isDirty.value) return;

    saveStatus.value = "saving";
    try {
      const data = { ...formData.value };
      const draft: FormDraft = draftStore.createDraft(formId, formName, data, totalFields, currentStep?.value);
      await draftStore.saveDraft(draft);
      draftId = draft.id;
      lastSavedAt.value = formatTime(Date.now());
      saveStatus.value = "saved";
      isDirty.value = false;
    } catch {
      saveStatus.value = "unsaved";
    }
  }

  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    isDirty.value = true;
    saveStatus.value = "unsaved";
    saveTimer = setTimeout(persist, debounceMs);
  }

  // Watch form data changes
  if (enabled) {
    watch(
      () => formData.value,
      () => {
        scheduleSave();
      },
      { deep: true }
    );
  }

  /** Check for existing drafts on mount */
  async function checkForDrafts(): Promise<FormDraft[]> {
    return draftStore.getDraftsByForm(formId);
  }

  /** Restore from a specific draft */
  async function restoreDraft(draft: FormDraft): Promise<void> {
    Object.assign(formData.value, draft.data);
    draftId = draft.id;
    isDirty.value = false;
    saveStatus.value = "saved";
  }

  /** Discard the current draft */
  async function discardDraft(): Promise<void> {
    if (draftId) {
      await draftStore.deleteDraft(draftId);
      draftId = null;
    }
    isDirty.value = false;
    saveStatus.value = "idle";
  }

  /** Manual save */
  async function saveNow(): Promise<void> {
    isDirty.value = true;
    if (saveTimer) clearTimeout(saveTimer);
    await persist();
  }

  // Save on page unload
  function handleBeforeUnload() {
    if (isDirty.value) {
      const data = { ...formData.value };
      const draft: FormDraft = draftStore.createDraft(formId, formName, data, totalFields, currentStep?.value);
      const dbRequest = indexedDB.open("yivad-form-drafts", 1);
      dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const tx = db.transaction("drafts", "readwrite");
        const store = tx.objectStore("drafts");
        store.put(draft);
      };
    }
  }

  onBeforeUnmount(() => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  });

  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", handleBeforeUnload);
  }

  return {
    saveStatus,
    lastSavedAt,
    isDirty,
    checkForDrafts,
    restoreDraft,
    discardDraft,
    saveNow,
  };
};