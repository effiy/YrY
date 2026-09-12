import { ref, onUnmounted, computed } from "vue";
import { CommandManager } from "@/utils/undo/CommandManager";
import type { CommandManagerConfig } from "@/utils/undo/types";

export function useUndoRedo(config: Partial<CommandManagerConfig> = {}) {
  const manager = new CommandManager(config);
  const canUndo = ref(false);
  const canRedo = ref(false);
  const lastAction = ref("");

  const unsubscribe = manager.onHistoryChange(() => {
    canUndo.value = manager.canUndo();
    canRedo.value = manager.canRedo();
  });

  async function execute(command: Parameters<CommandManager["execute"]>[0]): Promise<void> {
    await manager.execute(command);
    lastAction.value = command.context.description;
  }

  async function undo(): Promise<void> {
    const success = await manager.undo();
    if (success) lastAction.value = "撤销操作";
  }

  async function redo(): Promise<void> {
    const success = await manager.redo();
    if (success) lastAction.value = "重做操作";
  }

  function beginTransaction(description: string): void {
    manager.beginTransaction(description);
  }

  async function commitTransaction(): Promise<void> {
    await manager.commitTransaction();
    canUndo.value = manager.canUndo();
    canRedo.value = manager.canRedo();
  }

  function rollbackTransaction(): void {
    manager.rollbackTransaction();
  }

  function getHistory() {
    return manager.getHistory();
  }

  function clearHistory(): void {
    manager.clear();
    canUndo.value = false;
    canRedo.value = false;
  }

  onUnmounted(() => {
    unsubscribe();
    manager.destroy();
  });

  return {
    canUndo: computed(() => canUndo.value),
    canRedo: computed(() => canRedo.value),
    lastAction: computed(() => lastAction.value),
    execute,
    undo,
    redo,
    beginTransaction,
    commitTransaction,
    rollbackTransaction,
    getHistory,
    clearHistory,
  };
}