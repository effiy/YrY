import { ref, computed } from "vue";

/**
 * Row selection management for ProTable.
 * Supports single, multiple, and shift-range selection.
 * State managed via Set<string> to survive DOM recycling in virtual scroll.
 */
export const useRowSelection = (rowKey: string = "id") => {
  const selectedIds = ref<Set<string>>(new Set());
  const lastClickedIndex = ref<number | null>(null);
  const selectionMode = ref<"single" | "multiple" | "none">("multiple");

  const isSelected = computed(() => selectedIds.value.size > 0);
  const selectedCount = computed(() => selectedIds.value.size);

  const selectedList = ref<Record<string, any>[]>([]);
  const selectedListIds = computed((): string[] => Array.from(selectedIds.value));

  const toggleRow = (id: string, row?: Record<string, any>) => {
    const ids = selectedIds.value;
    const clone = new Set(ids);
    if (clone.has(id)) {
      clone.delete(id);
      if (row) {
        selectedList.value = selectedList.value.filter((r) => r[rowKey] !== id);
      }
    } else {
      if (selectionMode.value === "single") clone.clear();
      clone.add(id);
      if (row) selectedList.value.push(row);
    }
    selectedIds.value = clone;
  };

  const selectRange = (ids: string[], rows: Record<string, any>[]) => {
    const clone = new Set(selectedIds.value);
    ids.forEach((id) => clone.add(id));
    selectedIds.value = clone;

    const existingIds = new Set(selectedList.value.map((r) => r[rowKey]));
    rows.forEach((row) => {
      if (!existingIds.has(row[rowKey])) {
        selectedList.value.push(row);
      }
    });
  };

  const selectAll = (ids: string[], rows: Record<string, any>[]) => {
    selectedIds.value = new Set(ids);
    selectedList.value = [...rows];
  };

  const clearSelection = () => {
    selectedIds.value = new Set();
    selectedList.value = [];
    lastClickedIndex.value = null;
  };

  const selectionChange = (rowArr: Record<string, any>[]) => {
    selectedList.value = rowArr;
    selectedIds.value = new Set(rowArr.map((r) => r[rowKey]));
  };

  const isIndeterminate = computed(() => selectedIds.value.size > 0);

  return {
    isSelected,
    selectedCount,
    selectedList,
    selectedListIds,
    selectedIds,
    selectionMode,
    toggleRow,
    selectRange,
    selectAll,
    clearSelection,
    selectionChange,
    isIndeterminate,
  };
};