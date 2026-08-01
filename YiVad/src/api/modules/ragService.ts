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
import { buildYiAiUrl, yiAiAuthHeaders } from "@/config/yiweb";
import type {
  RagBuildResponse,
  RagChatPayload,
  RagFileChatPayload,
  RagQueryResponse,
  RagSource,
  RagStatusResponse,
  RagStreamHandlers
} from "@/api/interface/rag";
import type { YiAiEnvelope } from "@/api/interface/yiweb";

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const url = buildYiAiUrl(path);
  const resp = await fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    throw new Error(`RAG request failed: ${path} HTTP ${resp.status}`);
  }
  const data = (await resp.json()) as YiAiEnvelope<T>;
  if (data.code !== 0) {
    throw new Error(data.message || `RAG request failed: ${path}`);
  }
  return data.data;
}

/** One-shot retrieval — returns ranked source dicts, no LLM call. */
export function ragQuery(params: { question: string; top_k?: number; scope?: string }): Promise<RagQueryResponse> {
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

function extractDelta(parsed: any): string {
  if (!parsed || typeof parsed !== "object") return "";
  return parsed?.data?.message ?? parsed?.message?.content ?? parsed?.choices?.[0]?.delta?.content ?? parsed?.content ?? "";
}

function extractSources(parsed: any): RagSource[] | null {
  if (!parsed || typeof parsed !== "object") return null;
  const sources = parsed?.data?.sources ?? parsed?.sources;
  return Array.isArray(sources) && sources.length ? (sources as RagSource[]) : null;
}

function runStream(
  url: string,
  body: Record<string, unknown>,
  handlers: RagStreamHandlers
): { abort: () => void } {
  const controller = new AbortController();

  fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify(body),
    signal: controller.signal
  })
    .then(async response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No readable stream in response");
      }
      const decoder = new TextDecoder();
      let buffer = "";
      let sourcesSent = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") {
            onDoneSafe();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed?.error) {
              handlers.onError(new Error(String(parsed.error)));
              return;
            }
            if (parsed?.done === true) {
              onDoneSafe();
              return;
            }
            const sources = extractSources(parsed);
            if (sources && !sourcesSent) {
              sourcesSent = true;
              handlers.onSources(sources);
              continue;
            }
            const content = extractDelta(parsed);
            if (content) handlers.onChunk(content);
          } catch {
            if (data && data !== "[DONE]") handlers.onChunk(data);
          }
        }
      }
      // Flush trailing buffer
      const tail = buffer.trim();
      if (tail.startsWith("data: ")) {
        const data = tail.slice(6);
        if (data && data !== "[DONE]") {
          try {
            const parsed = JSON.parse(data);
            if (parsed?.error) {
              handlers.onError(new Error(String(parsed.error)));
              return;
            }
            if (parsed?.done !== true) {
              const sources = extractSources(parsed);
              if (sources && !sourcesSent) handlers.onSources(sources);
              const content = extractDelta(parsed);
              if (content) handlers.onChunk(content);
            }
          } catch {
            handlers.onChunk(data);
          }
        }
      }
      onDoneSafe();
    })
    .catch(err => {
      if (err.name === "AbortError") {
        handlers.onDone();
      } else {
        handlers.onError(err instanceof Error ? err : new Error(String(err)));
      }
    });

  let done = false;
  function onDoneSafe() {
    if (done) return;
    done = true;
    handlers.onDone();
  }

  return {
    abort: () => controller.abort()
  };
}

/** SSE-streaming RAG chat over the YiKnowledge index. */
export function streamRagChat(payload: RagChatPayload, handlers: RagStreamHandlers): { abort: () => void } {
  const url = buildYiAiUrl("/rag-chat");
  const body: Record<string, unknown> = {
    messages: payload.messages,
    stream: true,
    ...(payload.scope ? { scope: payload.scope } : {})
  };
  return runStream(url, body, handlers);
}

/** SSE-streaming RAG chat grounded in a single file's index. */
export function streamRagFileChat(payload: RagFileChatPayload, handlers: RagStreamHandlers): { abort: () => void } {
  const url = buildYiAiUrl("/rag-file-chat");
  const body: Record<string, unknown> = {
    target_file: payload.target_file,
    question: payload.question,
    stream: true
  };
  return runStream(url, body, handlers);
}
