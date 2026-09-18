/**
 * RAG service — wraps YiAi's /rag-* endpoints (llama_index-backed).
 *
 * Mirrors `knowledgeService.ts`'s postJson pattern for the simple REST
 * routes, and `chatService.ts`'s streaming pattern for the SSE chat route.
 *
 * YiAi contract:
 *   POST /rag-query   { question, top_k?, scope? }       → { sources: RagSource[] }
 *   POST /rag-status                                     → RagStatusResponse
 *   POST /rag-build                                      → RagStatusResponse
 *   POST /rag-chat    { messages, scope?, stream: true } → SSE
 *     data: {"data":{"message": delta}}\n\n
 *     data: {"data":{"sources": [...]}}\n\n
 *     data: {"done": true}\n\n
 *   POST /rag-file-query  { target_file, question, top_k? }
 *   POST /rag-file-chat   { target_file, question, stream: true } → SSE (same frame shape)
 */
import { buildYiAiUrl, buildYiAiStreamUrl, yiAiAuthHeaders } from "@/config/yiAi";
import { readSSEStream } from "@/utils/sse";
import type {
  RagBuildResponse,
  RagChatPayload,
  RagChatTurnRecord,
  RagDecomposeResponse,
  RagFileChatPayload,
  RagQueryRecord,
  RagQueryResponse,
  RagSource,
  RagStatusResponse,
  RagStreamHandlers
} from "@/api/interface/rag";
import type { YiAiEnvelope } from "@/api/interface/yiAi";

/** Default timeout for streaming RAG requests (10 minutes). */
const STREAM_TIMEOUT_MS = 600_000;

/** Default timeout for non-streaming RAG requests (120 seconds). */
const RAG_HTTP_TIMEOUT_MS = 120_000;

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const url = buildYiAiUrl(path);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RAG_HTTP_TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: yiAiAuthHeaders(),
      body: JSON.stringify(body),
      signal: controller.signal
    });
    if (!resp.ok) {
      throw new Error(`RAG request failed: ${path} HTTP ${resp.status}`);
    }
    const data = (await resp.json()) as YiAiEnvelope<T>;
    if (data.code !== 0) {
      throw new Error(data.message || `RAG request failed: ${path}`);
    }
    return data.data;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** One-shot retrieval — returns ranked source dicts, no LLM call. */
export function ragQuery(params: {
  question: string;
  top_k?: number;
  scope?: string;
  hybrid?: boolean;
  rerank?: boolean;
  citations?: boolean;
  num_queries?: number;
  category?: string;
  tags?: string[];
}): Promise<RagQueryResponse> {
  return postJson<RagQueryResponse>("/rag-query", params as Record<string, unknown>);
}

/** Index build status — `{ built, num_docs, last_built_at }`. */
export function ragStatus(): Promise<RagStatusResponse> {
  return postJson<RagStatusResponse>("/rag-status", {});
}

/** Trigger a rebuild (runs in a thread on the backend). */
export function ragBuild(): Promise<RagBuildResponse> {
  return postJson<RagBuildResponse>("/rag-build", {});
}

/** Knowledge base metadata for filter dropdowns — categories + tag counts. */
export interface RagCategories {
  categories: Array<{ name: string; file_count: number }>;
  tags: Record<string, number>;
  total_files: number;
}

export function ragCategories(): Promise<RagCategories> {
  return postJson<RagCategories>("/rag-categories", {});
}

/** In-memory recent retrieval history — newest-first, max 20 entries. */
export function ragHistory(): Promise<{ records: RagQueryRecord[]; max: number }> {
  return postJson<{ records: RagQueryRecord[]; max: number }>("/rag-history", {});
}

export function ragHistoryClear(): Promise<{ records: never[]; max: number }> {
  return postJson<{ records: never[]; max: number }>("/rag-history-clear", {});
}

/** In-memory recent RAG chat turns — newest-first, max 20. Mirrors ragHistory
 *  but for streamed chat (vs one-shot retrieval). */
export function ragChatHistory(): Promise<{ records: RagChatTurnRecord[]; max: number }> {
  return postJson<{ records: RagChatTurnRecord[]; max: number }>("/rag-chat-history", {});
}

export function ragChatHistoryClear(): Promise<{ records: never[]; max: number }> {
  return postJson<{ records: never[]; max: number }>("/rag-chat-history-clear", {});
}

/** Sub-question decomposition — llama_index SubQuestionQueryEngine.
 *  Synchronous (non-streaming) since the engine composes multiple LLM
 *  calls internally. */
export function ragDecompose(params: {
  question: string;
  scope?: string;
  sub_q_top_k?: number;
  category?: string;
  tags?: string[];
}): Promise<RagDecomposeResponse> {
  return postJson<RagDecomposeResponse>("/rag-decompose", params as Record<string, unknown>);
}

function runStream(url: string, body: Record<string, unknown>, handlers: RagStreamHandlers): { abort: () => void } {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, STREAM_TIMEOUT_MS);

  fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify(body),
    signal: controller.signal
  })
    .then(async response => {
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No readable stream in response");
      }

      await readSSEStream(reader, {
        onDelta: handlers.onChunk,
        onDone: handlers.onDone,
        onError: handlers.onError,
        onSources: handlers.onSources,
        onPhase: handlers.onPhase
      });
    })
    .catch(err => {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        if (timedOut) {
          handlers.onError(
            new Error(
              `RAG request timed out after ${STREAM_TIMEOUT_MS / 1000}s. The AI model may be processing a large request — try with shorter text or retry.`
            )
          );
        } else {
          handlers.onDone();
        }
      } else {
        handlers.onError(err instanceof Error ? err : new Error(String(err)));
      }
    });

  return {
    abort: () => {
      clearTimeout(timeoutId);
      controller.abort();
    }
  };
}

/** SSE-streaming RAG chat over the YiKnowledge index. */
export function streamRagChat(payload: RagChatPayload, handlers: RagStreamHandlers): { abort: () => void } {
  const url = buildYiAiStreamUrl("/rag-chat");
  const body: Record<string, unknown> = {
    messages: payload.messages,
    stream: true,
    ...(payload.scope ? { scope: payload.scope } : {}),
    ...(payload.top_k != null ? { top_k: payload.top_k } : {}),
    ...(payload.hybrid != null ? { hybrid: payload.hybrid } : {}),
    ...(payload.rerank != null ? { rerank: payload.rerank } : {}),
    ...(payload.citations != null ? { citations: payload.citations } : {}),
    ...(payload.num_queries != null ? { num_queries: payload.num_queries } : {}),
    ...(payload.chat_mode ? { chat_mode: payload.chat_mode } : {}),
    ...(payload.category ? { category: payload.category } : {}),
    ...(payload.tags?.length ? { tags: payload.tags } : {}),
    ...(payload.hyde_enabled != null ? { hyde: payload.hyde_enabled } : {})
  };
  return runStream(url, body, handlers);
}

/** SSE-streaming RAG chat grounded in a single file's index. */
export function streamRagFileChat(payload: RagFileChatPayload, handlers: RagStreamHandlers): { abort: () => void } {
  const url = buildYiAiStreamUrl("/rag-file-chat");
  const body: Record<string, unknown> = {
    target_file: payload.target_file,
    question: payload.question,
    stream: true
  };
  return runStream(url, body, handlers);
}
