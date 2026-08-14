/**
 * Chat / Prompt API service — streaming (SSE) and one-shot prompts
 * via YiAi's execution module (services.ai.chat_service).
 */

import type { ApiClient, ApiResponse, StreamChunk } from '../client';
import { EXECUTION } from '../endpoints';
import type { ChatParams, ChatResponse } from '../types';

const CHAT_MODULE = 'services.ai.chat_service';
const CHAT_METHOD = 'chat';

/**
 * Pick streaming text content from a YiAi SSE chunk.
 * Mirrors YiWeb's pickTextFromResponse (crud.js) — tries multiple nested shapes
 * the backend may emit across model versions.
 */
function pickTextFromResponse(obj: unknown): string | undefined {
  const asText = (v: unknown): string | undefined => {
    if (v === null || v === undefined) return undefined;
    if (typeof v === 'string') return v;
    if (Array.isArray(v)) {
      const joined = v
        .map((x) => {
          if (typeof x === 'string') return x;
          if (
            x &&
            typeof x === 'object' &&
            typeof (x as { content?: unknown }).content === 'string'
          ) {
            return (x as { content: string }).content;
          }
          return '';
        })
        .join('');
      return joined || undefined;
    }
    if (typeof v === 'object' && typeof (v as { content?: unknown }).content === 'string') {
      return (v as { content: string }).content;
    }
    return undefined;
  };

  if (!obj || typeof obj !== 'object') return undefined;
  const o = obj as Record<string, unknown>;
  const data = o.data as Record<string, unknown> | undefined;
  const result = o.result as Record<string, unknown> | undefined;

  const candidates: unknown[] = [
    data?.message,
    data?.content,
    data?.response,
    o.data,
    result?.message,
    result?.content,
    o.message,
    o.content,
    o.response,
    o.text,
  ];

  for (const c of candidates) {
    const text = asText(c);
    if (typeof text === 'string' && text !== '') return text;
  }
  return undefined;
}

export class ChatService {
  constructor(private client: ApiClient) {}

  /** Send a one-shot prompt and get the full response. */
  async prompt(params: ChatParams): Promise<ApiResponse<ChatResponse>> {
    return this.client.rpc<ChatResponse>(CHAT_MODULE, CHAT_METHOD, {
      ...params,
      stream: false,
    });
  }

  /** Send a prompt and consume the SSE stream via the execution module. */
  stream(params: ChatParams, signal?: AbortSignal): AsyncGenerator<StreamChunk> {
    return this.client.stream(
      EXECUTION.ROOT,
      {
        module_name: CHAT_MODULE,
        method_name: CHAT_METHOD,
        parameters: { ...params, stream: true },
      },
      signal,
    );
  }

  /**
   * Convenience: consume the SSE stream with a per-token callback.
   * Returns the full concatenated response text.
   */
  async streamWithCallback(
    params: ChatParams,
    onToken: (token: string) => void,
    signal?: AbortSignal,
  ): Promise<string> {
    let fullText = '';
    for await (const chunk of this.stream(params, signal)) {
      if (chunk.error) throw new Error(chunk.error);
      if (chunk.done) break;
      const token = pickTextFromResponse(chunk.data) ?? '';
      if (token) {
        fullText += token;
        onToken(token);
      }
    }
    return fullText;
  }
}
