import { reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

export interface TableState {
  pageNum: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  filters: Record<string, any>;
  columns?: Record<string, { visible: boolean; width?: number; order: number }>;
}

export function useTableState(storageKey: string, defaults: Partial<TableState> = {}) {
  const route = useRoute();
  const router = useRouter();

  const state = reactive<TableState>({
    pageNum: defaults.pageNum ?? 1,
    pageSize: defaults.pageSize ?? 50,
    sortField: defaults.sortField,
    sortOrder: defaults.sortOrder,
    filters: defaults.filters ?? {},
  });

  function loadFromUrl(): Partial<TableState> {
    const q = route.query;
    const fromUrl: Partial<TableState> = {};
    if (q.page) fromUrl.pageNum = Number(q.page);
    if (q.pageSize) fromUrl.pageSize = Number(q.pageSize);
    if (q.sortField) fromUrl.sortField = q.sortField as string;
    if (q.sortOrder) fromUrl.sortOrder = q.sortOrder as "asc" | "desc";
    return fromUrl;
  }

  function loadFromStorage(): Partial<TableState> {
    try {
      const saved = localStorage.getItem(`yivad-state-${storageKey}`);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  }

  function persist() {
    const { pageNum, pageSize, sortField, sortOrder, filters } = state;
    localStorage.setItem(`yivad-state-${storageKey}`, JSON.stringify({ pageNum, pageSize, sortField, sortOrder, filters }));
  }

  const restore = () => {
    const fromStorage = loadFromStorage();
    const fromUrl = loadFromUrl();
    Object.assign(state, defaults, fromStorage, fromUrl);
  };

  // Sync to URL on change
  watch(
    () => ({ pageNum: state.pageNum, pageSize: state.pageSize, sortField: state.sortField, sortOrder: state.sortOrder }),
    (val) => {
      const q: Record<string, string> = { ...route.query as Record<string, string> };
      if (val.pageNum > 1) q.page = String(val.pageNum); else delete q.page;
      if (val.sortField) { q.sortField = val.sortField; q.sortOrder = val.sortOrder ?? "asc"; }
      else { delete q.sortField; delete q.sortOrder; }
      router.replace({ query: q }).catch(() => {});
    },
    { deep: true }
  );

  const updateState = (patch: Partial<TableState>) => {
    Object.assign(state, patch);
    persist();
  };

  const resetState = () => {
    Object.assign(state, defaults);
    localStorage.removeItem(`yivad-state-${storageKey}`);
  };

  return { state, updateState, resetState, restore, persist };
}