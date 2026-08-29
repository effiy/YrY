/**
 * Agent service — multi-turn tool-calling loop via YiAi `/agent/*` routes.
 *
 * `stream` consumes the agent SSE stream (structured events + content deltas).
 * The side-channel actions (confirm / steer / followUp / answer) drive the
 * running loop: confirmation gates, mid-run steering, deferred follow-ups, and
 * ask_user answers all reuse the backend's in-memory stores keyed by session.
 */

import type { ApiClient, StreamChunk } from '../client';
import { AGENT } from '../endpoints';
import type { AgentChatPayload, AgentToolsResponse } from '../types';

export class AgentService {
  constructor(private client: ApiClient) {}

  /** Stream an agent chat via `/agent/chat` (SSE). */
  stream(payload: AgentChatPayload, signal?: AbortSignal): AsyncGenerator<StreamChunk> {
    return this.client.stream(AGENT.CHAT, payload, signal);
  }

  /** Fetch the browsable server-side tool + skill catalog from `/agent/tools`. */
  async listTools(): Promise<AgentToolsResponse> {
    const res = await this.client.post<AgentToolsResponse>(AGENT.TOOLS, {});
    return res.data ?? { tools: [], skills: [] };
  }

  /** Approve or reject a tool call awaiting confirmation. */
  async confirm(sessionId: string, confirmationId: string, approve: boolean): Promise<void> {
    await this.client.post(AGENT.CONFIRM, {
      session_id: sessionId,
      confirmation_id: confirmationId,
      approve,
    });
  }

  /** Steer a running agent mid-turn. */
  async steer(sessionId: string, message: string): Promise<void> {
    await this.client.post(AGENT.STEER, { session_id: sessionId, message });
  }

  /** Queue a follow-up message that runs after the agent would otherwise stop. */
  async followUp(sessionId: string, message: string): Promise<void> {
    await this.client.post(AGENT.FOLLOW_UP, { session_id: sessionId, message });
  }

  /** Answer an `ask_user` question the agent posed mid-run. */
  async answer(questionId: string, answer: string): Promise<void> {
    await this.client.post(AGENT.ANSWER, { question_id: questionId, answer });
  }
}
