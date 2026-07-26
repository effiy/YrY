/**
 * Chat / Prompt API service — prompt streaming (SSE) and one-shot prompts.
 */

import type { ApiClient, ApiResponse, StreamChunk } from '../client';
import { CHAT } from '../endpoints';
import type { PromptRequest, PromptResponse } from '../types';

export class ChatService {
  constructor(private client: ApiClient) {}

  /** Send a one-shot prompt and get the full response. */
  async prompt(req: PromptRequest): Promise<ApiResponse<PromptResponse>> {
    return this.client.post<PromptResponse>(CHAT.PROMPT, { ...req, stream: false });
  }

  /** Send a prompt and consume the SSE stream chunk by chunk. */
  async *stream(req: PromptRequest, signal?: AbortSignal): AsyncGenerator<StreamChunk> {
    for await (const chunk of this.client.stream(CHAT.STREAM, { ...req, stream: true }, signal)) {
      yield chunk;
    }
  }

  /** Convenience: collect all streamed tokens into a single response. */
  async collectStream(req: PromptRequest, signal?: AbortSignal): Promise<string> {
    let result = '';
    for await (const chunk of this.stream(req, signal)) {
      if (chunk.error) throw new Error(chunk.error);
      if (chunk.done) break;
      const token = (chunk.data as Record<string, string> | undefined)?.token || '';
      result += token;
    }
    return result;
  }
}
