/**
 * Shared RAG query composable — one-shot semantic search + history recording.
 *
 * Used by retrieval.vue and QuickQueryCard.vue to eliminate duplicated
 * fetch/error/history logic. The store's `recordQuery()` keeps query history
 * in sync across pages.
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

      ragStore.recordQuery(q, topK, scope || "", sources.value);
    } catch (e: any) {
      lastError.value = e.message ?? "Retrieval failed";
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
