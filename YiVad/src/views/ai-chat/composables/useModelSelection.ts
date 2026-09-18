import { ref, watch } from "vue";
import { loadStr, saveStr } from "@/utils/storage";
import { DEFAULT_MODEL } from "@/views/ai-chat/constants";

const MODELS_CACHE_KEY = "aiChat.availableModels";
const MODELS_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export function useModelSelection() {
  const selectedModel = ref(loadStr("aiChat.selectedModel", DEFAULT_MODEL));
  const availableModels = ref<string[]>([]);
  const modelsLoading = ref(false);

  watch(selectedModel, v => saveStr("aiChat.selectedModel", v));

  async function fetchModels() {
    if (modelsLoading.value) return;

    // Stale-while-revalidate: use cached models immediately
    try {
      const raw = localStorage.getItem(MODELS_CACHE_KEY);
      if (raw) {
        const { ts, models } = JSON.parse(raw);
        if (Date.now() - ts < MODELS_CACHE_TTL && models?.length) {
          availableModels.value = models;
        }
      }
    } catch {
      /* ignore */
    }

    modelsLoading.value = true;
    try {
      const { buildYiAiUrl } = await import("@/config/yiAi");
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8_000);
      const res = await fetch(buildYiAiUrl("/v1/models"), { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const models: string[] = [];
        // OpenAI-compatible: { object: "list", data: [{ id: "model1", ... }, ...] }
        if (Array.isArray(data?.data)) {
          models.push(...data.data.map((m: any) => m.id || m.name || m.model || String(m)));
        } else if (data?.data?.models) {
          models.push(...data.data.models.map((m: any) => m.name || m.model || m));
        } else if (Array.isArray(data?.models)) {
          models.push(...data.models.map((m: any) => m.name || m.model || m));
        }
        if (models.length) {
          availableModels.value = models;
          try {
            localStorage.setItem(MODELS_CACHE_KEY, JSON.stringify({ ts: Date.now(), models }));
          } catch {
            /* ignore */
          }
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
