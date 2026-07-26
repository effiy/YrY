/**
 * AICR UI store — layout state: sidebar/panel widths, collapse, view mode.
 */
import { defineStore } from "pinia";
import { ref } from "vue";

export type AicrViewMode = "tree" | "cards" | "graph";

export const useAicrUiStore = defineStore("yivad-aicr-ui", () => {
  const sidebarCollapsed = ref(false);
  const sidebarWidth = ref(320);
  const chatPanelCollapsed = ref(false);
  const chatPanelWidth = ref(420);
  const viewMode = ref<AicrViewMode>("tree");

  function loadWidths() {
    try {
      const sw = localStorage.getItem("aicr_sidebar_width");
      if (sw) sidebarWidth.value = parseInt(sw, 10) || 320;
      const cw = localStorage.getItem("aicr_chat_panel_width");
      if (cw) chatPanelWidth.value = parseInt(cw, 10) || 420;
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

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function toggleChatPanel() {
    chatPanelCollapsed.value = !chatPanelCollapsed.value;
  }

  function setViewMode(mode: AicrViewMode) {
    viewMode.value = mode;
  }

  return {
    sidebarCollapsed,
    sidebarWidth,
    chatPanelCollapsed,
    chatPanelWidth,
    viewMode,
    loadWidths,
    saveWidths,
    toggleSidebar,
    toggleChatPanel,
    setViewMode
  };
});
