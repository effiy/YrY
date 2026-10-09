/**
 * RAG Service — llama_index retrieval-augmented generation over YiKnowledge.
 *
 * Wraps YiAi's /rag-* REST endpoints. SSE streaming reuses client.stream().
 *
 * The two SSE helpers (`streamChat` / `streamFileChat`) share a single
 * internal `_streamTokens` implementation — the only difference is the
 * endpoint and whether `onSources`/`onMeta` callbacks are enabled.
 */

import type { ApiClient, ApiResponse, StreamChunk } from '../client';
import { RAG } from '../endpoints';
import { pickTextFromResponse } from '../sse';
import type {
  RagStatusResponse,
  RagQueryResponse,
  RagDecomposeResponse,
  RagHistoryRecord,
  RagChatTurnRecord,
  RagAnalyticsResponse,
  RagChatPayload,
  RagFileChatPayload,
  RagSource,
} from '../types';

export class RagService {
  constructor(private client: ApiClient) {}

  /** Get RAG index status. */
  async status(): Promise<RagStatusResponse> {
    const res = await this.client.post<RagStatusResponse>(RAG.STATUS, {});
    return res.ok && res.data ? res.data : { built: false, num_docs: 0, error: res.error };
  }

  /** Run a single-turn RAG query (no LLM). */
  async query(params: {
    question: string;
    scope?: string;
    category?: string;
  }): Promise<ApiResponse<RagQueryResponse>> {
    return this.client.post<RagQueryResponse>(RAG.QUERY, params);
  }

  /** Decompose a question into sub-questions via RAG. */
  async decompose(params: {
    question: string;
    scope?: string;
    category?: string;
  }): Promise<ApiResponse<RagDecomposeResponse>> {
    return this.client.post<RagDecomposeResponse>(RAG.DECOMPOSE, params);
  }

  /* ── SSE streaming (shared implementation) ──────────────────────────── */

  /**
   * Shared SSE token-streaming implementation.
   *
   * Handles:
   *   - Error / done frame dispatch
   *   - Double-envelope unwrap (`obj.data → inner` fallback)
   *   - Optional `sources` / `rag_meta` event callbacks (both envelope levels)
   *   - Token extraction + accumulation
   */
  private async _streamTokens<P>(
    endpoint: string,
    params: P,
    onToken: (token: string) => void,
    signal?: AbortSignal,
    callbacks?: {
      onSources?: (sources: RagSource[]) => void;
      onMeta?: (meta: Record<string, unknown>) => void;
    },
  ): Promise<string> {
    let fullText = '';
    const onSources = callbacks?.onSources;
    const onMeta = callbacks?.onMeta;

    for await (const chunk of this.client.stream(endpoint, params, signal)) {
      if (chunk.error) throw new Error(chunk.error);
      if (chunk.done) break;

      const obj = chunk.data as Record<string, unknown> | undefined;
      if (!obj) continue;

      // YiAi envelope wraps responses in {data: {...}}; some events place
      // metadata at the top level, so check both.
      const inner = (obj.data as Record<string, unknown> | undefined) ?? obj;

      // Sources event — both levels (envelope-wrapped & flat)
      if (onSources) {
        if (inner.sources) onSources(inner.sources as RagSource[]);
        if (obj.sources && obj !== inner) onSources(obj.sources as RagSource[]);
      }

      // Rag_meta event — retrieval metadata (grade, chat_mode, etc.)
      if (onMeta) {
        if (inner.rag_meta) onMeta(inner.rag_meta as Record<string, unknown>);
        if (obj.rag_meta && obj !== inner) onMeta(obj.rag_meta as Record<string, unknown>);
      }

      // Text delta — try the outer envelope first, then the unwrapped inner
      const token = pickTextFromResponse(chunk.data) ?? pickTextFromResponse(inner) ?? '';
      if (token) {
        fullText += token;
        onToken(token);
      }
    }
    return fullText;
  }

  /** SSE streaming RAG chat. Calls onSources when rag_sources event arrives. */
  async streamChat(
    params: RagChatPayload,
    onToken: (token: string) => void,
    onSources?: (sources: RagSource[]) => void,
    onMeta?: (meta: Record<string, unknown>) => void,
    signal?: AbortSignal,
  ): Promise<string> {
    return this._streamTokens<RagChatPayload>(RAG.CHAT, params, onToken, signal, {
      onSources,
      onMeta,
    });
  }

  /** SSE streaming file-level RAG chat. */
  async streamFileChat(
    params: RagFileChatPayload,
    onToken: (token: string) => void,
    signal?: AbortSignal,
  ): Promise<string> {
    return this._streamTokens<RagFileChatPayload>(RAG.FILE_CHAT, params, onToken, signal);
  }

  /** Query RAG history records. */
  async history(params?: {
    scope?: string;
    limit?: number;
  }): Promise<ApiResponse<{ records: RagHistoryRecord[] }>> {
    return this.client.post(RAG.HISTORY, params ?? {});
  }

  /** Query RAG chat turn history. */
  async chatHistory(params?: {
    scope?: string;
    limit?: number;
  }): Promise<ApiResponse<{ records: RagChatTurnRecord[] }>> {
    return this.client.post(RAG.CHAT_HISTORY, params ?? {});
  }

  /** Get RAG analytics. */
  async analytics(params?: { scope?: string }): Promise<ApiResponse<RagAnalyticsResponse>> {
    return this.client.post(RAG.ANALYTICS, params ?? {});
  }

  /** Trigger a RAG index rebuild. */
  async build(): Promise<ApiResponse<{ message?: string }>> {
    return this.client.post(RAG.BUILD, {});
  }
}