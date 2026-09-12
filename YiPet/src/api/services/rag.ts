/**
 * RAG service — wraps YiAi's /rag-* endpoints (llama_index-backed).
 *
 * Mirrors YiVad's ragService: simple REST for query/status/build/categories,
 * SSE streaming for /rag-chat. Uses the shared ApiClient so auth, SSE parsing,
 * and envelope unwrapping flow through the existing path.
 *
 * YiAi contract:
 *   POST /rag-query    { question, top_k?, scope?, ... }   → RagQueryResponse
 *   POST /rag-status                                     → RagStatusResponse
 *   POST /rag-build                                      → RagBuildResponse
 *   POST /rag-categories                                 → RagCategoriesResponse
 *   POST /rag-chat     { messages, scope?, stream: true } → SSE
 *     data: {"data":{"message": delta}}\n\n
 *     data: {"data":{"sources": [...]}}\n\n
 *     data: {"done": true}\n\n
 *   POST /rag-file-query  { target_file, question, top_k? } → RagFileQueryResponse
 *   POST /rag-file-chat   { target_file, question, stream: true } → SSE (same frame shape)
 */
import type { ApiClient, ApiResponse, StreamChunk } from '../client';
import { RAG } from '../endpoints';
import type {
  RagBuildResponse,
  RagCategoriesResponse,
  RagChatPayload,
  RagDecomposeResponse,
  RagFileChatPayload,
  RagFileQueryResponse,
  RagQueryResponse,
  RagSource,
  RagStatusResponse,
} from '../types';

interface RagStreamHandlers {
  onChunk: (token: string) => void;
  onSources?: (sources: RagSource[]) => void;
  onDone?: () => void;
  onError?: (err: Error) => void;
}

function pickDelta(chunk: StreamChunk): string {
  const data = chunk.data as Record<string, unknown> | undefined;
  if (!data) return '';

  // Try multiple nested shapes — mirrors ChatService.pickTextFromResponse
  const asText = (v: unknown): string | undefined => {
    if (v === null || v === undefined) return undefined;
    if (typeof v === 'string') return v;
    if (Array.isArray(v)) {
      return v
        .map((x) => {
          if (typeof x === 'string') return x;
          if (x && typeof x === 'object' && typeof (x as { content?: unknown }).content === 'string') {
            return (x as { content: string }).content;
          }
          return '';
        })
        .join('') || undefined;
    }
    if (typeof v === 'object' && typeof (v as { content?: unknown }).content === 'string') {
      return (v as { content: string }).content;
    }
    return undefined;
  };

  const candidates: unknown[] = [
    data.message,
    data.content,
    data.response,
    data.text,
    data.delta,
    data.data,
    (data as Record<string, unknown>).result,
  ];

  for (const c of candidates) {
    const text = asText(c);
    if (typeof text === 'string' && text !== '') return text;
  }
  return '';
}

function pickSources(chunk: StreamChunk): RagSource[] | null {
  const data = chunk.data as Record<string, unknown> | undefined;
  if (!data) return null;
  const sources = data.sources;
  return Array.isArray(sources) && sources.length ? (sources as RagSource[]) : null;
}

export class RagService {
  constructor(private client: ApiClient) {}

  /** One-shot retrieval — returns ranked source dicts, no LLM call. */
  query(params: {
    question: string;
    top_k?: number;
    scope?: string;
    hybrid?: boolean;
    rerank?: boolean;
    citations?: boolean;
    num_queries?: number;
    category?: string;
    tags?: string[];
  }): Promise<ApiResponse<RagQueryResponse>> {
    return this.client.post<RagQueryResponse>(RAG.QUERY, params as Record<string, unknown>);
  }

  /** Index build status — `{ built, num_docs, last_built_at }`. */
  status(): Promise<ApiResponse<RagStatusResponse>> {
    return this.client.post<RagStatusResponse>(RAG.STATUS, {});
  }

  /** Trigger a rebuild (runs in a thread on the backend). */
  build(): Promise<ApiResponse<RagBuildResponse>> {
    return this.client.post<RagBuildResponse>(RAG.BUILD, {});
  }

  /** Knowledge base metadata for filter dropdowns — categories + tag counts. */
  categories(): Promise<ApiResponse<RagCategoriesResponse>> {
    return this.client.post<RagCategoriesResponse>(RAG.CATEGORIES, {});
  }

  /**
   * Sub-question decomposition — llama_index SubQuestionQueryEngine.
   * Synchronous (non-streaming) since the engine composes multiple LLM
   * calls internally. Returns the original question, synthesis, and per-
   * sub-question answers + sources.
   */
  decompose(params: {
    question: string;
    scope?: string;
    sub_q_top_k?: number;
    category?: string;
    tags?: string[];
  }): Promise<ApiResponse<RagDecomposeResponse>> {
    return this.client.post<RagDecomposeResponse>(RAG.DECOMPOSE, params as Record<string, unknown>);
  }

  /** One-shot retrieval grounded in a single file's index. */
  fileQuery(params: {
    target_file: string;
    question: string;
    top_k?: number;
  }): Promise<ApiResponse<RagFileQueryResponse>> {
    return this.client.post<RagFileQueryResponse>(RAG.FILE_QUERY, params);
  }

  /**
   * SSE-streaming RAG chat over the YiKnowledge index.
   * Returns the full concatenated response text. `handlers.onSources` is
   * called once if the backend emits a sources frame before chunks.
   */
  async streamChat(
    payload: RagChatPayload,
    handlers: RagStreamHandlers,
    signal?: AbortSignal,
  ): Promise<string> {
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
    };

    let fullText = '';
    let sourcesSent = false;
    try {
      for await (const chunk of this.client.stream(RAG.CHAT, body, signal)) {
        if (chunk.error) {
          handlers.onError?.(new Error(chunk.error));
          return fullText;
        }
        if (chunk.done) {
          handlers.onDone?.();
          return fullText;
        }
        if (!sourcesSent) {
          const sources = pickSources(chunk);
          if (sources) {
            sourcesSent = true;
            handlers.onSources?.(sources);
            continue;
          }
        }
        const token = pickDelta(chunk);
        if (token) {
          fullText += token;
          handlers.onChunk(token);
        }
      }
      handlers.onDone?.();
      return fullText;
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') {
        handlers.onDone?.();
        return fullText;
      }
      handlers.onError?.(err instanceof Error ? err : new Error(String(err)));
      return fullText;
    }
  }

  /**
   * Convenience: consume the SSE stream with a per-token callback.
   * Returns the full concatenated response text. Mirrors ChatService.streamWithCallback.
   */
  async streamChatWithCallback(
    payload: RagChatPayload,
    onToken: (token: string) => void,
    onSources?: (sources: RagSource[]) => void,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.streamChat(payload, {
      onChunk: onToken,
      onSources,
      onError: (err) => { throw err; },
    }, signal);
  }

  /**
   * Convenience: consume the SSE file-chat stream with a per-token callback.
   */
  async streamFileChatWithCallback(
    payload: RagFileChatPayload,
    onToken: (token: string) => void,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.streamFileChat(payload, {
      onChunk: onToken,
      onError: (err) => { throw err; },
    }, signal);
  }
  /** SSE-streaming RAG chat grounded in a single file's index. */
  async streamFileChat(
    payload: RagFileChatPayload,
    handlers: RagStreamHandlers,
    signal?: AbortSignal,
  ): Promise<string> {
    const body = { target_file: payload.target_file, question: payload.question, stream: true };
    let fullText = '';
    try {
      for await (const chunk of this.client.stream(RAG.FILE_CHAT, body, signal)) {
        if (chunk.error) {
          handlers.onError?.(new Error(chunk.error));
          return fullText;
        }
        if (chunk.done) {
          handlers.onDone?.();
          return fullText;
        }
        const token = pickDelta(chunk);
        if (token) {
          fullText += token;
          handlers.onChunk(token);
        }
      }
      handlers.onDone?.();
      return fullText;
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') {
        handlers.onDone?.();
        return fullText;
      }
      handlers.onError?.(err instanceof Error ? err : new Error(String(err)));
      return fullText;
    }
  }
}
