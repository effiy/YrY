import { watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTabWorkspaceStore } from "@/stores/modules/tabWorkspace";

export function useTabWorkspace() {
  const route = useRoute();
  const router = useRouter();
  const store = useTabWorkspaceStore();

  function syncRouteToTab() {
    const path = route.fullPath;
    const title = (route.meta?.title as string) || path;
    store.openTab({
      id: path,
      title,
      path,
      createdAt: Date.now(),
      closable: path !== "/",
    });
  }

  watch(() => route.fullPath, syncRouteToTab);

  onMounted(() => syncRouteToTab());

  function switchTo(tabId: string) {
    store.activeId = tabId;
    router.push(tabId);
  }

  return {
    tabs: store.tabs,
    activeId: store.activeId,
    pinnedIds: store.pinnedIds,
    switchTo,
    closeTab: (id: string) => store.closeTab(id),
    closeOtherTabs: (id: string) => store.closeOtherTabs(id),
    closeRightTabs: (id: string) => store.closeRightTabs(id),
    closeAllTabs: () => store.closeAllTabs(),
    pinTab: (id: string) => store.pinTab(id),
    unpinTab: (id: string) => store.unpinTab(id),
    reorderTabs: (order: string[]) => store.reorderTabs(order),
  };
}