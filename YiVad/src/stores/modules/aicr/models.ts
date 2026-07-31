/**
 * AICR Models store — available AI models.
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import { fetchModelList } from "@/api/modules/chatService";
import type { OllamaModel } from "@/api/interface/yiweb";

export const useAicrModelStore = defineStore("yivad-aicr-models", () => {
  const availableModels = ref<OllamaModel[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchModels() {
    loading.value = true;
    error.value = null;
    try {
      availableModels.value = await fetchModelList();
    } catch (e: any) {
      error.value = e?.message || "Failed to fetch models";
    } finally {
      loading.value = false;
    }
  }

  return { availableModels, loading, error, fetchModels };
});
