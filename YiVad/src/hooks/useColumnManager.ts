import { ref, computed } from "vue";

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  width?: number;
  minWidth?: number;
  order: number;
  fixed?: "left" | "right";
  sortable?: boolean;
}

export function useColumnManager(storageKey: string, defaultColumns: ColumnConfig[]) {
  const columns = ref<ColumnConfig[]>(loadColumns());

  function loadColumns(): ColumnConfig[] {
    try {
      const saved = localStorage.getItem(`yivad-columns-${storageKey}`);
      if (!saved) return [...defaultColumns];
      const parsed: ColumnConfig[] = JSON.parse(saved);
      const map = new Map(parsed.map((c) => [c.key, c]));
      return defaultColumns.map((d) => ({ ...d, ...map.get(d.key) }));
    } catch {
      return [...defaultColumns];
    }
  }

  function persist() {
    const minimal = columns.value.map(({ key, visible, width, order, fixed, sortable }) => ({
      key, visible, width, order, fixed, sortable,
    }));
    localStorage.setItem(`yivad-columns-${storageKey}`, JSON.stringify(minimal));
  }

  const visibleColumns = computed(() => columns.value.filter((c) => c.visible).sort((a, b) => a.order - b.order));

  const toggleColumn = (key: string) => {
    const col = columns.value.find((c) => c.key === key);
    if (col) { col.visible = !col.visible; persist(); }
  };

  const resizeColumn = (key: string, width: number) => {
    const col = columns.value.find((c) => c.key === key);
    if (col) { col.width = Math.max(width, col.minWidth ?? 50); persist(); }
  };

  const reorderColumns = (from: number, to: number) => {
    const arr = [...columns.value];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    arr.forEach((c, i) => (c.order = i));
    columns.value = arr;
    persist();
  };

  const freezeColumn = (key: string, fixed?: "left" | "right") => {
    const col = columns.value.find((c) => c.key === key);
    if (col) { col.fixed = fixed; persist(); }
  };

  const resetToDefault = () => {
    columns.value = [...defaultColumns];
    localStorage.removeItem(`yivad-columns-${storageKey}`);
  };

  const showAll = () => {
    columns.value.forEach((c) => (c.visible = true));
    persist();
  };

  const hideAll = () => {
    columns.value.forEach((c) => (c.visible = false));
    persist();
  };

  return { columns, visibleColumns, toggleColumn, resizeColumn, reorderColumns, freezeColumn, resetToDefault, showAll, hideAll };
}