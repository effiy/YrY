import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { TabPage, TabGroup } from "@/components/tab-bar/types";

export const useTabWorkspaceStore = defineStore("tabWorkspace", () => {
  const tabs = ref<TabPage[]>([]);
  const activeId = ref<string | null>(null);
  const pinnedIds = ref<Set<string>>(new Set());

  const activeTab = computed(() => tabs.value.find((t) => t.id === activeId.value) || null);

  function openTab(tab: TabPage) {
    const existing = tabs.value.find((t) => t.id === tab.id);
    if (existing) {
      activeId.value = tab.id;
      return;
    }
    tabs.value.push({ ...tab, createdAt: Date.now() });
    activeId.value = tab.id;
    if (tabs.value.length > 20) {
      const unpinned = tabs.value.filter((t) => !pinnedIds.value.has(t.id));
      if (unpinned.length > 0) {
        const idx = tabs.value.indexOf(unpinned[0]);
        tabs.value.splice(idx, 1);
      }
    }
  }

  function closeTab(id: string) {
    const idx = tabs.value.findIndex((t) => t.id === id);
    if (idx === -1) return;
    tabs.value.splice(idx, 1);
    if (activeId.value === id) {
      activeId.value = tabs.value[Math.min(idx, tabs.value.length - 1)]?.id || null;
    }
  }

  function closeOtherTabs(id: string) {
    tabs.value = tabs.value.filter((t) => t.id === id || pinnedIds.value.has(t.id));
    activeId.value = id;
  }

  function closeRightTabs(id: string) {
    const idx = tabs.value.findIndex((t) => t.id === id);
    if (idx === -1) return;
    tabs.value = tabs.value.filter((t, i) =>
      i <= idx || pinnedIds.value.has(t.id)
    );
    activeId.value = id;
  }

  function closeAllTabs() {
    tabs.value = tabs.value.filter((t) => pinnedIds.value.has(t.id));
    activeId.value = tabs.value[0]?.id || null;
  }

  function pinTab(id: string) {
    pinnedIds.value = new Set([...pinnedIds.value, id]);
  }

  function unpinTab(id: string) {
    const next = new Set(pinnedIds.value);
    next.delete(id);
    pinnedIds.value = next;
  }

  function reorderTabs(newOrder: string[]) {
    const map = new Map(tabs.value.map((t) => [t.id, t]));
    tabs.value = newOrder.map((id) => map.get(id)!).filter(Boolean);
  }

  return {
    tabs,
    activeId,
    pinnedIds,
    activeTab,
    openTab,
    closeTab,
    closeOtherTabs,
    closeRightTabs,
    closeAllTabs,
    pinTab,
    unpinTab,
    reorderTabs,
  };
});