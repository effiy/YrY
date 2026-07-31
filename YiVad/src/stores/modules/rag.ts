/**
 * RAG store — index status, one-shot query, streaming chat playground state.
 *
 * Wraps `ragService.ts` so the `/rag` visualization page can drive status /
 * rebuild / query / chat from a single reactive source.
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import { ragBuild, ragQuery, ragStatus, streamRagChat } from "@/api/modules/ragService";
import { streamChat } from "@/api/modules/chatService";
import type { RagSource, RagStatusResponse } from "@/api/interface/rag";

export const useRagStore = defineStore("yivad-rag", () => {
  const status = ref<RagStatusResponse>({ built: false, num_docs: 0 });
  const statusLoading = ref(false);
  const rebuilding = ref(false);

  // Query playground
  const question = ref("");
  const topK = ref(4);
  const scope = ref<string>("");
  const querying = ref(false);
  const lastSources = ref<RagSource[]>([]);
  const lastError = ref<string | null>(null);

  interface QueryHistoryEntry {
    question: string;
    scope: string;
    topK: number;
    sources: RagSource[];
    timestamp: number;
  }
  const queryHistory = ref<QueryHistoryEntry[]>([]);

  // Chat playground
  const chatMessages = ref<Array<{ role: "user" | "assistant"; content: string; sources?: RagSource[]; streaming?: boolean }>>([]);
  const chatInput = ref("");
  const chatSending = ref(false);
  const chatScope = ref<string>("");
  let chatAbort: (() => void) | null = null;

  // Compare playground — RAG vs plain Ollama, same question, parallel streams.
  const compareInput = ref("");
  const compareScope = ref<string>("");
  const compareRunning = ref(false);
  const compareRagAnswer = ref("");
  const comparePlainAnswer = ref("");
  const compareRagSources = ref<RagSource[]>([]);
  const compareRagStreaming = ref(false);
  const comparePlainStreaming = ref(false);
  const compareRagError = ref<string | null>(null);
  const comparePlainError = ref<string | null>(null);
  let compareRagAbort: (() => void) | null = null;
  let comparePlainAbort: (() => void) | null = null;

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
      lastError.value = e?.message || String(e);
    } finally {
      rebuilding.value = false;
    }
  }

  async function runQuery() {
    const q = question.value.trim();
    if (!q || querying.value) return;
    querying.value = true;
    lastError.value = null;
    lastSources.value = [];
    try {
      const res = await ragQuery({
        question: q,
        top_k: topK.value,
        scope: scope.value || undefined
      });
      lastSources.value = res.sources ?? [];
      queryHistory.value = [
        { question: q, scope: scope.value, topK: topK.value, sources: lastSources.value, timestamp: Date.now() },
        ...queryHistory.value
      ].slice(0, 20);
    } catch (e: any) {
      lastError.value = e?.message || String(e);
    } finally {
      querying.value = false;
    }
  }

  function rerunQuery(idx: number) {
    const entry = queryHistory.value[idx];
    if (!entry || querying.value) return;
    question.value = entry.question;
    scope.value = entry.scope;
    topK.value = entry.topK;
    runQuery();
  }

  function clearQueryHistory() {
    queryHistory.value = [];
  }

  async function sendChat() {
    const q = chatInput.value.trim();
    if (!q || chatSending.value) return;
    const history = [...chatMessages.value, { role: "user" as const, content: q }];
    const assistantTurn = { role: "assistant" as const, content: "", sources: [] as RagSource[], streaming: true };
    chatMessages.value = [...history, assistantTurn];
    chatInput.value = "";
    chatSending.value = true;

    const messages = history
      .filter(m => (m.content || "").trim().length > 0)
      .map(m => ({ role: m.role, content: m.content }));

    const { abort } = streamRagChat(
      { messages, scope: chatScope.value || undefined },
      {
        onChunk: (text: string) => {
          const last = chatMessages.value[chatMessages.value.length - 1];
          if (last && last.role === "assistant") last.content += text;
        },
        onSources: (sources: RagSource[]) => {
          const last = chatMessages.value[chatMessages.value.length - 1];
          if (last && last.role === "assistant") last.sources = sources;
        },
        onDone: () => {
          chatSending.value = false;
          chatAbort = null;
          const last = chatMessages.value[chatMessages.value.length - 1];
          if (last && last.role === "assistant") last.streaming = false;
        },
        onError: (err: Error) => {
          chatSending.value = false;
          chatAbort = null;
          const last = chatMessages.value[chatMessages.value.length - 1];
          if (last && last.role === "assistant") {
            last.streaming = false;
            last.content = last.content || `Error: ${err.message}`;
          }
        }
      }
    );
    chatAbort = abort;
  }

  function stopChat() {
    chatAbort?.();
    chatAbort = null;
    chatSending.value = false;
    const last = chatMessages.value[chatMessages.value.length - 1];
    if (last && last.role === "assistant" && last.streaming) {
      last.streaming = false;
      last.content = last.content || "Stopped";
    }
  }

  function clearChat() {
    stopChat();
    chatMessages.value = [];
  }

  async function runCompare() {
    const q = compareInput.value.trim();
    if (!q || compareRunning.value) return;
    compareRunning.value = true;
    compareRagAnswer.value = "";
    comparePlainAnswer.value = "";
    compareRagSources.value = [];
    compareRagError.value = null;
    comparePlainError.value = null;
    compareRagStreaming.value = true;
    comparePlainStreaming.value = true;

    const ollamaMessages = [{ role: "user" as const, content: q }];
    const chatShape = [{ type: "user" as const, message: q, timestamp: Date.now() }];

    compareRagAbort = streamRagChat(
      { messages: ollamaMessages, scope: compareScope.value || undefined },
      {
        onChunk: (text: string) => {
          compareRagAnswer.value += text;
        },
        onSources: (sources: RagSource[]) => {
          compareRagSources.value = sources;
        },
        onDone: () => {
          compareRagStreaming.value = false;
          compareRagAbort = null;
          if (comparePlainStreaming.value === false) compareRunning.value = false;
        },
        onError: (err: Error) => {
          compareRagStreaming.value = false;
          compareRagError.value = err.message;
          compareRagAbort = null;
          if (comparePlainStreaming.value === false) compareRunning.value = false;
        }
      }
    ).abort;

    comparePlainAbort = streamChat(
      { messages: chatShape },
      (text: string) => {
        comparePlainAnswer.value += text;
      },
      () => {
        comparePlainStreaming.value = false;
        comparePlainAbort = null;
        if (compareRagStreaming.value === false) compareRunning.value = false;
      },
      (err: Error) => {
        comparePlainStreaming.value = false;
        comparePlainError.value = err.message;
        comparePlainAbort = null;
        if (compareRagStreaming.value === false) compareRunning.value = false;
      }
    ).abort;
  }

  function stopCompare() {
    compareRagAbort?.();
    comparePlainAbort?.();
    compareRagAbort = null;
    comparePlainAbort = null;
    compareRagStreaming.value = false;
    comparePlainStreaming.value = false;
    compareRunning.value = false;
  }

  function clearCompare() {
    stopCompare();
    compareRagAnswer.value = "";
    comparePlainAnswer.value = "";
    compareRagSources.value = [];
    compareRagError.value = null;
    comparePlainError.value = null;
    compareInput.value = "";
  }

  return {
    status,
    statusLoading,
    rebuilding,
    question,
    topK,
    scope,
    querying,
    lastSources,
    lastError,
    queryHistory,
    chatMessages,
    chatInput,
    chatSending,
    chatScope,
    refreshStatus,
    rebuild,
    runQuery,
    rerunQuery,
    clearQueryHistory,
    sendChat,
    stopChat,
    clearChat,
    compareInput,
    compareScope,
    compareRunning,
    compareRagAnswer,
    comparePlainAnswer,
    compareRagSources,
    compareRagStreaming,
    comparePlainStreaming,
    compareRagError,
    comparePlainError,
    runCompare,
    stopCompare,
    clearCompare
  };
});
