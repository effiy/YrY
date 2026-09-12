import { defineStore } from "pinia";
import { ref } from "vue";

export interface SavedTableState {
  tableId: string;
  pageNum: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  filters: Record<string, any>;
  columns?: Record<string, { visible: boolean; width?: number; order: number }>;
}

export const useTableStateStore = defineStore("tableState", () => {
  const states = ref<SavedTableState[]>(load());

  function load(): SavedTableState[] {
    try { return JSON.parse(localStorage.getItem("yivad-table-states") ?? "[]"); } catch { return []; }
  }
  function persist() { localStorage.setItem("yivad-table-states", JSON.stringify(states.value)); }

  const getState = (tableId: string) => states.value.find((s) => s.tableId === tableId);
  const saveState = (state: SavedTableState) => {
    const idx = states.value.findIndex((s) => s.tableId === state.tableId);
    if (idx >= 0) states.value[idx] = state;
    else states.value.push(state);
    persist();
  };
  const removeState = (tableId: string) => {
    states.value = states.value.filter((s) => s.tableId !== tableId);
    persist();
  };

  return { states, getState, saveState, removeState };
});