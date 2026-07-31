/**
 * Shared RAG query execution logic.
 *
 * Used by the Retrieval Explorer and Quick Query card to run one-shot
 * semantic searches and record results in the store's query history.
 */
import { ref } from "vue";
import { ragQuery } from "@/api/modules/ragService";
import { useRagStore } from "@/stores/modules/rag";
import type { RagSource } from "@/api/interface/rag";

export function useRagQuery() {
  const ragStore = useRagStore();

  const querying = ref(false);
  const sources = ref<RagSource[]>([]);
  const lastError = ref("");
  const lastLatency = ref(0);

  async function execute(question: string, topK: number = 4, scope?: string) {
    const q = question.trim();
    if (!q || querying.value) return;

    querying.value = true;
    sources.value = [];
    lastError.value = "";
    lastLatency.value = 0;

    const t0 = performance.now();
    try {
      const res = await ragQuery({ question: q, top_k: topK, scope: scope || undefined });
      sources.value = (res.sources ?? []).map((s) => ({
        ...s,
        metadata: {
          ...s.metadata,
          char_count: s.metadata?.char_count ?? (s.text?.length || 0),
          token_estimate: s.metadata?.token_estimate ?? Math.round((s.text?.length || 0) / 4),
        },
      }));

      // Record in store history
      ragStore.question = q;
      ragStore.topK = topK;
      ragStore.scope = scope || "";
      ragStore.lastSources = sources.value;
      ragStore.lastError = null;
      ragStore.queryHistory = [
        { question: q, scope, topK, sources: sources.value, timestamp: Date.now() },
        ...ragStore.queryHistory,
      ].slice(0, 20);
    } catch (e: any) {
      lastError.value = e.message ?? "Retrieval failed";
      ragStore.lastError = lastError.value;
    } finally {
      querying.value = false;
      lastLatency.value = Math.round(performance.now() - t0);
    }
  }

  function clear() {
    sources.value = [];
    lastError.value = "";
  }

  return {
    querying,
    sources,
    lastError,
    lastLatency,
    execute,
    clear,
  };
}
