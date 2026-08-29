/**
 * RAG store — cross-page shared state (query history, index status).
 *
 * Single-page UI state (chat messages, compare panels, query inputs) belongs
 * in each page's local `ref`s, NOT here. The store is the shared cache layer
 * between retrieval / history / dashboard pages.
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import { ragBuild, ragQuery, ragStatus } from "@/api/modules/ragService";
import type { RagSource, RagStatusResponse } from "@/api/interface/rag";

interface QueryHistoryEntry {
  question: string;
  scope: string;
  topK: number;
  sources: RagSource[];
  timestamp: number;
}

export const useRagStore = defineStore("yivad-rag", () => {
  // ── Index status (shared: dashboard) ──────────────────────────────────
  const status = ref<RagStatusResponse>({ built: false, num_docs: 0 });
  const statusLoading = ref(false);
  const rebuilding = ref(false);

  async function refreshStatus() {
    statusLoading.value = true;
    try {
      status.value = await ragStatus();
    } catch (e: any) {
      status.value = { built: false, num_docs: 0, error: e?.message || String(e) };
    } finally {
      statusLoading.value = false;
    }
  }

  async function rebuild() {
    rebuilding.value = true;
    try {
      status.value = await ragBuild();
    } catch (e: any) {
      // keep last status on error
    } finally {
      rebuilding.value = false;
    }
  }

  // ── Query history (shared: retrieval → history → dashboard) ────────────
  const queryHistory = ref<QueryHistoryEntry[]>([]);

  /** Last query params — pre-filled when navigating back to retrieval. */
  const lastQuestion = ref("");
  const lastTopK = ref(4);
  const lastScope = ref("");

  function recordQuery(q: string, topK: number, scope: string, sources: RagSource[]) {
    lastQuestion.value = q;
    lastTopK.value = topK;
    lastScope.value = scope;
    queryHistory.value = [
      { question: q, scope, topK, sources, timestamp: Date.now() },
      ...queryHistory.value,
    ].slice(0, 20);
  }

  function rerunQuery(idx: number) {
    const entry = queryHistory.value[idx];
    if (!entry) return;
    lastQuestion.value = entry.question;
    lastScope.value = entry.scope;
    lastTopK.value = entry.topK;
  }

  function clearQueryHistory() {
    queryHistory.value = [];
  }

  return {
    // status
    status,
    statusLoading,
    rebuilding,
    refreshStatus,
    rebuild,
    // history
    queryHistory,
    lastQuestion,
    lastTopK,
    lastScope,
    recordQuery,
    rerunQuery,
    clearQueryHistory,
  };
});
