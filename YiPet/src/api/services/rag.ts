/**
 * RAG Service — llama_index retrieval-augmented generation over YiKnowledge.
 *
 * Wraps YiAi's /rag-* REST endpoints. SSE streaming reuses client.stream().
 */

import type { ApiClient, ApiResponse } from '../client';
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

  /** SSE streaming RAG chat. Calls onSources when rag_sources event arrives. */
  async streamChat(
    params: RagChatPayload,
    onToken: (token: string) => void,
    onSources?: (sources: RagSource[]) => void,
    onMeta?: (meta: Record<string, unknown>) => void,
    signal?: AbortSignal,
  ): Promise<string> {
    let fullText = '';
    for await (const chunk of this.client.stream(RAG.CHAT, params, signal)) {
      if (chunk.error) throw new Error(chunk.error);
      if (chunk.done) break;
      const obj = chunk.data as Record<string, unknown> | undefined;
      if (!obj) continue;
      // YiAi envelope wraps responses in {data: {...}}, but some events
      // may place metadata at the top level.
      const inner = (obj.data as Record<string, unknown> | undefined) ?? obj;
      // Detect sources event from the backend (key: "sources")
      if (inner.sources && onSources) {
        onSources(inner.sources as RagSource[]);
      }
      // Also check top-level for unwrapped events
      if (obj.sources && obj !== inner && onSources) {
        onSources(obj.sources as RagSource[]);
      }
      // Detect rag_meta event — retrieval metadata (grade, chat_mode, etc.)
      if (inner.rag_meta && onMeta) {
        onMeta(inner.rag_meta as Record<string, unknown>);
      }
      if (obj.rag_meta && obj !== inner && onMeta) {
        onMeta(obj.rag_meta as Record<string, unknown>);
      }
      // Try outer envelope first, then fall back to unwrapped inner data.
      // Some backends wrap the text delta in {data: {message: "..."}} while
      // others place it directly in the inner object as {message: "..."}.
      const token = pickTextFromResponse(chunk.data) ?? pickTextFromResponse(inner) ?? '';
      if (token) {
        fullText += token;
        onToken(token);
      }
    }
    return fullText;
  }

  /** SSE streaming file-level RAG chat. */
  async streamFileChat(
    params: RagFileChatPayload,
    onToken: (token: string) => void,
    signal?: AbortSignal,
  ): Promise<string> {
    let fullText = '';
    for await (const chunk of this.client.stream(RAG.FILE_CHAT, params, signal)) {
      if (chunk.error) throw new Error(chunk.error);
      if (chunk.done) break;
      const obj = chunk.data as Record<string, unknown> | undefined;
      if (!obj) continue;
      const inner = (obj.data as Record<string, unknown> | undefined) ?? obj;
      const token = pickTextFromResponse(chunk.data) ?? pickTextFromResponse(inner) ?? '';
      if (token) {
        fullText += token;
        onToken(token);
      }
    }
    return fullText;
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