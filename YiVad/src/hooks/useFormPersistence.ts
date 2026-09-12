import { ref, onMounted, onBeforeUnmount, type Ref } from "vue";

interface UseFormPersistenceOptions {
  formId: string;
  formData: Ref<Record<string, any>>;
  /** Throttle in ms for crash recovery writes (default 1000) */
  throttleMs?: number;
}

const RECOVERY_PREFIX = "form-recovery-";

/**
 * 表单数据持久化 — 崩溃恢复 + 多标签同步
 */
export const useFormPersistence = (options: UseFormPersistenceOptions) => {
  const { formId, formData, throttleMs = 1000 } = options;

  const recoveryKey = `${RECOVERY_PREFIX}${formId}`;
  const hasRecovery = ref(false);
  let throttleTimer: ReturnType<typeof setTimeout> | null = null;
  let channel: BroadcastChannel | null = null;

  // --- Crash Recovery ---

  function saveRecoveryData() {
    try {
      const payload = {
        data: { ...formData.value },
        timestamp: Date.now(),
      };
      localStorage.setItem(recoveryKey, JSON.stringify(payload));
    } catch {
      // localStorage full — silently fail
    }
  }

  function throttledSave() {
    if (throttleTimer) clearTimeout(throttleTimer);
    throttleTimer = setTimeout(saveRecoveryData, throttleMs);
  }

  function checkRecovery(): { data: Record<string, any>; timestamp: number } | null {
    try {
      const raw = localStorage.getItem(recoveryKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function clearRecovery() {
    localStorage.removeItem(recoveryKey);
    hasRecovery.value = false;
  }

  // --- Multi-tab Sync via BroadcastChannel ---

  function setupBroadcast() {
    try {
      channel = new BroadcastChannel(`form-${formId}`);
      channel.onmessage = (event) => {
        const { type, data } = event.data;
        if (type === "FIELD_CHANGE") {
          // Another tab changed data — could merge or notify
          console.debug(`[FormPersistence] Field change from another tab:`, data);
        } else if (type === "FORM_SUBMITTED") {
          clearRecovery();
        }
      };
    } catch {
      // BroadcastChannel not supported
    }
  }

  function broadcastFieldChange(field: string, value: any) {
    channel?.postMessage({ type: "FIELD_CHANGE", data: { field, value }, timestamp: Date.now() });
  }

  function broadcastSubmit() {
    channel?.postMessage({ type: "FORM_SUBMITTED", timestamp: Date.now() });
  }

  // --- Lifecycle ---

  onMounted(() => {
    const recovery = checkRecovery();
    hasRecovery.value = !!recovery;
    setupBroadcast();
  });

  onBeforeUnmount(() => {
    saveRecoveryData();
    channel?.close();
  });

  return {
    hasRecovery,
    checkRecovery,
    clearRecovery,
    saveRecoveryData: throttledSave,
    broadcastFieldChange,
    broadcastSubmit,
  };
};