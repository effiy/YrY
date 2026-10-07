/**
 * Chat / Prompt API service — streaming (SSE) and one-shot prompts
 * via YiAi's execution module (services.ai.chat_service).
 */

import type { ApiClient, ApiResponse, StreamChunk } from '../client';
import { EXECUTION } from '../endpoints';
import { pickTextFromResponse } from '../sse';
import type { ChatParams, ChatResponse } from '../types';

const CHAT_MODULE = 'services.ai.chat_service';
const CHAT_METHOD = 'chat';

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

  /**
   * Send a prompt with full conversation history (messages array).
   * Preferred over `streamWithCallback` for multi-turn conversations.
   */
  async chatWithHistory(
    params: {
      messages: Array<{ role: string; content: string }>;
      system?: string;
      model?: string;
      images?: string[];
    },
    onToken: (token: string) => void,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.streamWithCallback(
      {
        messages: params.messages,
        system: params.system,
        model: params.model,
        images: params.images,
      },
      onToken,
      signal,
    );
  }

  /** Fetch available Ollama models from the backend. */
  async listModels(): Promise<string[]> {
    const res = await this.client.rpc<{ models?: Array<{ name?: string; model?: string }> }>(
      CHAT_MODULE,
      'list_ollama_models',
      {},
    );
    if (res.ok && res.data?.models) {
      return res.data.models.map((m) => m.name || m.model || '').filter(Boolean);
    }
    return [];
  }
}
