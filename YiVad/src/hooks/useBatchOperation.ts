import { ref, computed } from "vue";
import { getErrorMessage } from "@/utils/errorHandler";

export type BatchOperationType = "delete" | "move" | "copy" | "tag" | "edit" | "mail" | "import";

export interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  failedItems: { id: string; reason: string }[];
  status: "idle" | "processing" | "completed" | "cancelled";
}

export function useBatchOperation() {
  const progress = ref<BatchProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    failedItems: [],
    status: "idle",
  });

  const isProcessing = computed(() => progress.value.status === "processing");
  const progressPercent = computed(() =>
    progress.value.total > 0 ? Math.round((progress.value.completed / progress.value.total) * 100) : 0,
  );

  const resetProgress = () => {
    progress.value = { total: 0, completed: 0, failed: 0, failedItems: [], status: "idle" };
  };

  const executeBatch = async <T>(
    items: T[],
    operation: (item: T) => Promise<void>,
    getItemId: (item: T) => string,
  ): Promise<BatchProgress> => {
    progress.value = { total: items.length, completed: 0, failed: 0, failedItems: [], status: "processing" };

    for (const item of items) {
      if (progress.value.status === "cancelled") break;
      try {
        await operation(item);
        progress.value.completed++;
      } catch (e) {
        progress.value.failed++;
        progress.value.failedItems.push({ id: getItemId(item), reason: getErrorMessage(e) });
      }
    }

    progress.value.status = progress.value.status === "cancelled" ? "cancelled" : "completed";
    return { ...progress.value };
  };

  const cancel = () => {
    if (progress.value.status === "processing") {
      progress.value.status = "cancelled";
    }
  };

  return { progress, isProcessing, progressPercent, executeBatch, cancel, resetProgress };
}