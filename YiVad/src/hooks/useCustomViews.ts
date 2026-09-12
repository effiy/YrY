import { ref } from "vue";

export interface CustomView {
  id: string;
  name: string;
  entityType: string;
  filters: Record<string, any>;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  columns?: Record<string, { visible: boolean; width?: number; order: number }>;
  isDefault: boolean;
  createdAt: string;
}

export function useCustomViews(entityType: string) {
  const views = ref<CustomView[]>(load());
  const activeViewId = ref<string | null>(null);

  function load(): CustomView[] {
    try {
      const saved = localStorage.getItem(`yivad-views-${entityType}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  }

  function persist() {
    localStorage.setItem(`yivad-views-${entityType}`, JSON.stringify(views.value));
  }

  const saveView = (name: string, config: Partial<CustomView>) => {
    const view: CustomView = {
      id: `view-${Date.now()}`,
      name,
      entityType,
      filters: config.filters ?? {},
      sortField: config.sortField,
      sortOrder: config.sortOrder,
      columns: config.columns,
      isDefault: views.value.length === 0,
      createdAt: new Date().toISOString(),
    };
    views.value.push(view);
    persist();
    return view;
  };

  const deleteView = (id: string) => {
    views.value = views.value.filter((v) => v.id !== id);
    persist();
  };

  const setDefaultView = (id: string) => {
    views.value.forEach((v) => (v.isDefault = v.id === id));
    persist();
  };

  const activateView = (id: string) => {
    activeViewId.value = id;
  };

  const getShareUrl = (id: string): string => {
    const view = views.value.find((v) => v.id === id);
    if (!view) return "";
    const params = new URLSearchParams();
    params.set("view", id);
    if (view.sortField) { params.set("sortField", view.sortField); params.set("sortOrder", view.sortOrder ?? "asc"); }
    for (const [k, v] of Object.entries(view.filters)) { if (v !== undefined && v !== null && v !== "") params.set(k, String(v)); }
    return `${window.location.pathname}?${params.toString()}`;
  };

  return { views, activeViewId, saveView, deleteView, setDefaultView, activateView, getShareUrl };
}