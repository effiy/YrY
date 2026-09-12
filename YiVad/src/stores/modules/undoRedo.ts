import { defineStore } from "pinia";
import { ref } from "vue";
import { CommandManager } from "@/utils/undo/CommandManager";
import type { UndoRedoScope } from "@/utils/undo/types";

export const useUndoRedoStore = defineStore("undoRedo", () => {
  const managers = ref<Map<string, CommandManager>>(new Map());
  const activeScope = ref<UndoRedoScope>("page");
  const activeScopeId = ref<string>("default");

  function registerManager(
    scope: UndoRedoScope,
    scopeId: string = "default",
    config: Partial<{ maxDepth: number }> = {}
  ): CommandManager {
    const key = `${scope}_${scopeId}`;
    if (managers.value.has(key)) {
      return managers.value.get(key)!;
    }
    const manager = new CommandManager({ scope, scopeId, ...config });
    managers.value.set(key, manager);
    return manager;
  }

  function unregisterManager(scope: UndoRedoScope, scopeId: string = "default"): void {
    const key = `${scope}_${scopeId}`;
    const manager = managers.value.get(key);
    if (manager) {
      manager.destroy();
      managers.value.delete(key);
    }
  }

  function setActiveScope(scope: UndoRedoScope, scopeId: string = "default"): void {
    activeScope.value = scope;
    activeScopeId.value = scopeId;
  }

  function getActiveManager(): CommandManager | null {
    const key = `${activeScope.value}_${activeScopeId.value}`;
    return managers.value.get(key) || null;
  }

  async function undoCurrentScope(): Promise<void> {
    const manager = getActiveManager();
    if (manager) await manager.undo();
  }

  async function redoCurrentScope(): Promise<void> {
    const manager = getActiveManager();
    if (manager) await manager.redo();
  }

  return {
    managers,
    activeScope,
    activeScopeId,
    registerManager,
    unregisterManager,
    setActiveScope,
    getActiveManager,
    undoCurrentScope,
    redoCurrentScope,
  };
});