/**
 * Chat / Prompt API service — streaming (SSE) and one-shot prompts
 * via YiAi's execution module (services.ai.chat_service).
 */

import type { ApiClient, ApiResponse, StreamChunk } from '../client';
import { EXECUTION } from '../endpoints';
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
  stream(
    params: ChatParams,
    signal?: AbortSignal,
  ): AsyncGenerator<StreamChunk> {
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
      // YiAi's SSE token format: {data: {message: "token"}}
      const data = chunk.data as Record<string, unknown> | undefined;
      const token = (data?.message as string) || (data?.content as string) || '';
      if (token) {
        fullText += token;
        onToken(token);
      }
    }
    return fullText;
  }
}
