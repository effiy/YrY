import { ref, watch } from "vue";
import { loadStr, saveStr } from "@/utils/storage";
import { DEFAULT_MODEL } from "@/views/aiChat/constants";

export function useModelSelection() {
  const selectedModel = ref(loadStr("aiChat.selectedModel", DEFAULT_MODEL));
  const availableModels = ref<string[]>([]);
  const modelsLoading = ref(false);

  watch(selectedModel, (v) => saveStr("aiChat.selectedModel", v));

  async function fetchModels() {
    if (modelsLoading.value) return;
    modelsLoading.value = true;
    try {
      const { buildYiAiUrl } = await import("@/config/yiAi");
      const res = await fetch(buildYiAiUrl("/models"));
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.models) {
          availableModels.value = data.data.models.map((m: any) => m.name || m.model || m);
        } else if (data?.models) {
          availableModels.value = data.models.map((m: any) => m.name || m.model || m);
        }
      }
    } catch {
      // Keep current list; models are best-effort
    } finally {
      modelsLoading.value = false;
    }
  }

  return { selectedModel, availableModels, modelsLoading, fetchModels };
}