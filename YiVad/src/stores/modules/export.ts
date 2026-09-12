import { defineStore } from "pinia";
import { ref } from "vue";
import type { ExportTemplate, ExportHistoryItem } from "@/utils/export/types";

export const useExportStore = defineStore("export", () => {
  const templates = ref<ExportTemplate[]>(loadTemplates());
  const history = ref<ExportHistoryItem[]>(loadHistory());

  function loadTemplates(): ExportTemplate[] {
    try { return JSON.parse(localStorage.getItem("yivad-export-templates") ?? "[]"); } catch { return []; }
  }
  function loadHistory(): ExportHistoryItem[] {
    try { return JSON.parse(localStorage.getItem("yivad-export-history") ?? "[]"); } catch { return []; }
  }

  function persistTemplates() { localStorage.setItem("yivad-export-templates", JSON.stringify(templates.value)); }
  function persistHistory() { localStorage.setItem("yivad-export-history", JSON.stringify(history.value.slice(0, 10))); }

  const addTemplate = (tpl: ExportTemplate) => { templates.value.push(tpl); persistTemplates(); };
  const removeTemplate = (id: string) => { templates.value = templates.value.filter((t) => t.id !== id); persistTemplates(); };

  const addHistory = (item: Omit<ExportHistoryItem, "id" | "expired">) => {
    history.value.unshift({ ...item, id: `exp-${Date.now()}`, expired: false });
    if (history.value.length > 10) history.value.length = 10;
    persistHistory();
  };

  return { templates, history, addTemplate, removeTemplate, addHistory };
});