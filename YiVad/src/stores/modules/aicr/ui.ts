/**
 * AICR UI store — layout state: sidebar/panel widths, collapse, view mode.
 */
import { defineStore } from "pinia";
import { ref } from "vue";

export type AicrViewMode = "tree" | "cards";
export type CardDensity = "compact" | "comfortable" | "spacious";
export type CardSortBy = "updated" | "name" | "messages";

export const useAicrUiStore = defineStore("yivad-aicr-ui", () => {
  const sidebarCollapsed = ref(false);
  const sidebarWidth = ref(320);
  const chatPanelCollapsed = ref(false);
  const chatPanelWidth = ref(420);
  const centerCollapsed = ref(false);
  const viewMode = ref<AicrViewMode>("tree");

  const cardDensity = ref<CardDensity>("comfortable");
  const cardSortBy = ref<CardSortBy>("updated");
  const collapsedGroups = ref<Set<string>>(new Set());

  function loadWidths() {
    try {
      const sw = localStorage.getItem("aicr_sidebar_width");
      if (sw) sidebarWidth.value = parseInt(sw, 10) || 320;
      const cw = localStorage.getItem("aicr_chat_panel_width");
      if (cw) chatPanelWidth.value = parseInt(cw, 10) || 420;
      const cd = localStorage.getItem("aicr_card_density");
      if (cd === "compact" || cd === "comfortable" || cd === "spacious") cardDensity.value = cd;
      const cs = localStorage.getItem("aicr_card_sort");
      if (cs === "updated" || cs === "name" || cs === "messages") cardSortBy.value = cs;
    } catch {
      /* ignore */
    }
  }

  function saveWidths() {
    try {
      localStorage.setItem("aicr_sidebar_width", String(sidebarWidth.value));
      localStorage.setItem("aicr_chat_panel_width", String(chatPanelWidth.value));
    } catch {
      /* ignore */
    }
  }

  function persistCardPrefs() {
    try {
      localStorage.setItem("aicr_card_density", cardDensity.value);
      localStorage.setItem("aicr_card_sort", cardSortBy.value);
    } catch {
      /* ignore */
    }
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function toggleChatPanel() {
    chatPanelCollapsed.value = !chatPanelCollapsed.value;
  }

  function toggleCenter() {
    centerCollapsed.value = !centerCollapsed.value;
  }

  function setViewMode(mode: AicrViewMode) {
    viewMode.value = mode;
  }

  function setCardDensity(d: CardDensity) {
    cardDensity.value = d;
    persistCardPrefs();
  }

  function setCardSortBy(s: CardSortBy) {
    cardSortBy.value = s;
    persistCardPrefs();
  }

  function toggleGroup(name: string) {
    const s = new Set(collapsedGroups.value);
    if (s.has(name)) s.delete(name);
    else s.add(name);
    collapsedGroups.value = s;
  }

  function collapseAllGroups(names: string[]) {
    collapsedGroups.value = new Set(names);
  }

  function expandAllGroups() {
    collapsedGroups.value = new Set();
  }

  return {
    sidebarCollapsed,
    sidebarWidth,
    chatPanelCollapsed,
    chatPanelWidth,
    centerCollapsed,
    viewMode,
    cardDensity,
    cardSortBy,
    collapsedGroups,
    loadWidths,
    saveWidths,
    toggleSidebar,
    toggleChatPanel,
    toggleCenter,
    setViewMode,
    setCardDensity,
    setCardSortBy,
    toggleGroup,
    collapseAllGroups,
    expandAllGroups
  };
});
