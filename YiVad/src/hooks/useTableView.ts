import { useStorage } from "@vueuse/core";

export type ViewType = "table" | "card" | "kanban" | "calendar" | "gallery" | "map";

/** Persisted view-type toggle — backed by @vueuse/core useStorage. */
export function useTableView(storageKey: string, defaultView: ViewType = "table") {
  const currentView = useStorage<ViewType>(`yivad-view-${storageKey}`, defaultView);
  const switchView = (view: ViewType) => {
    currentView.value = view;
  };
  return { currentView, switchView };
}