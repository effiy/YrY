import { ref, watch } from "vue";

export type ViewType = "table" | "card" | "kanban" | "calendar" | "gallery" | "map";

export function useTableView(storageKey: string, defaultView: ViewType = "table") {
  const currentView = ref<ViewType>(load());

  function load(): ViewType {
    try {
      const saved = localStorage.getItem(`yivad-view-${storageKey}`);
      return (saved as ViewType) ?? defaultView;
    } catch { return defaultView; }
  }

  const switchView = (view: ViewType) => {
    currentView.value = view;
    localStorage.setItem(`yivad-view-${storageKey}`, view);
  };

  return { currentView, switchView };
}