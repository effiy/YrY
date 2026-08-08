/**
 * Agent chat service — streaming agent chat with tool calling and observability.
 *
 * Uses the YiAi /agent/chat endpoint which emits structured SSE events:
 *   - agent_start / agent_end — lifecycle
 *   - turn_start / turn_end — per-turn with tool results
 *   - thinking — streaming deltas
 *   - error — error events
 *
 * Pattern adapted from Pi's agent event stream in @earendil-works/pi-agent-core.
 */
import { buildYiAiUrl, yiAiAuthHeaders } from "@/config/yiweb";

/** Default timeout for streaming agent requests (10 minutes). */
const STREAM_TIMEOUT_MS = 600_000;

export interface AgentStreamEvent {
  type: string;
  timestamp: number;
  message?: { role: string; content: string };
  turn_index?: number;
  tool_results?: Array<{
    name: string;
    content: string;
    error?: string;
    duration_ms: number;
    terminate?: boolean;
  }>;
  tool?: {
    name: string;
    label: string;
    args?: Record<string, unknown>;
    content?: string;
    error?: string;
    duration_ms: number;
  };
  phase?: string;
  delta?: string;
  error?: string;
  usage?: Record<string, unknown>;
  stop_reason?: string;
  messages?: Array<{ role: string; content: string }>;
  // Compaction event fields
  before_count?: number;
  after_count?: number;
  saved_tokens?: number;
  // Confirmation event fields
  tool_name?: string;
  tool_args?: Record<string, unknown>;
  confirmation_id?: string;
  // Tool execution update fields (Pi: partial progress)
  tool_call_id?: string;
  partial_result?: Record<string, unknown>;
  is_error?: boolean;
  terminate?: boolean;
}

/** @deprecated Use AgentStreamEvent instead. */
export type AgentEvent = AgentStreamEvent;

export interface AgentChatPayload {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  system_prompt?: string;
  max_turns?: number;
  images?: string[];
  session_id?: string;
  model_rotation?: string[];
}

export interface AgentStreamHandlers {
  onDelta: (text: string) => void;
  onEvent: (event: AgentEvent) => void;
  onDone: () => void;
  onError: (err: Error) => void;
}

/**
 * Stream an agent chat completion via SSE.
 * Returns an abort function. Yields both content deltas and agent events.
 */
export function streamAgentChat(
  payload: AgentChatPayload,
  handlers: AgentStreamHandlers
): { abort: () => void } {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, STREAM_TIMEOUT_MS);

  const url = buildYiAiUrl("/agent/chat");

  fetch(url, {
    method: "POST",
    headers: {
      ...yiAiAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: payload.messages,
      model: payload.model ?? "qwen3.5",
      system_prompt: payload.system_prompt ?? "",
      max_turns: payload.max_turns ?? 10,
      ...(payload.images?.length ? { images: payload.images } : {}),
      ...(payload.session_id ? { session_id: payload.session_id } : {}),
      ...(payload.model_rotation?.length ? { model_rotation: payload.model_rotation } : {}),
    }),
    signal: controller.signal,
  })
    .then(async (response) => {
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No readable stream in response");
      }

      const decoder = new TextDecoder();
      let buffer = "";

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

          try {
            const parsed = JSON.parse(data);

            if (parsed?.error) {
              handlers.onError(new Error(String(parsed.error)));
              return;
            }

            if (parsed?.done === true) {
              handlers.onDone();
              return;
            }

            // Agent event (has type field)
            if (parsed?.type) {
              handlers.onEvent(parsed as AgentEvent);
              continue;
            }

            // Content delta (has data.message)
            const delta =
              parsed?.data?.message ??
              parsed?.message?.content ??
              parsed?.choices?.[0]?.delta?.content ??
              "";
            if (delta) {
              handlers.onDelta(String(delta));
            }
          } catch {
            // Plain text fallback
            if (data && data !== "[DONE]") {
              handlers.onDelta(data);
            }
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
            if (parsed?.type) {
              handlers.onEvent(parsed as AgentEvent);
            }
          } catch {
            /* ignore */
          }
        }
      }
      handlers.onDone();
    })
    .catch((err) => {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        if (timedOut) {
          handlers.onError(new Error(`Agent request timed out after ${STREAM_TIMEOUT_MS / 1000}s. The AI model may be processing a large request — try with shorter text or retry.`));
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

/**
 * Approve or reject a tool call that requires user confirmation.
 * The agent loop pauses after emitting `confirmation_required` and waits
 * for this decision before executing a destructive tool (e.g. menu CRUD).
 */
export async function confirmAgentTool(
  sessionId: string,
  confirmationId: string,
  approve: boolean
): Promise<boolean> {
  const url = buildYiAiUrl("/agent/confirm");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        ...yiAiAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session_id: sessionId, confirmation_id: confirmationId, approve }),
    });
    const data = await res.json();
    return data?.code === 0;
  } catch {
    return false;
  }
}

/**
 * Send a steering message to a running agent session.
 * Steering messages interrupt the agent mid-run, injecting the message
 * as a system prompt at the next turn boundary.
 */
export async function steerAgent(
  sessionId: string,
  message: string
): Promise<boolean> {
  const url = buildYiAiUrl("/agent/steer");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        ...yiAiAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session_id: sessionId, message }),
    });
    const data = await res.json();
    return data?.code === 0;
  } catch {
    return false;
  }
}

/**
 * Send a follow-up message to a running agent session.
 * Follow-up messages wait until the agent finishes its current reasoning,
 * then trigger a new turn — unlike steering which interrupts mid-run.
 */
export async function followUpAgent(
  sessionId: string,
  message: string
): Promise<boolean> {
  const url = buildYiAiUrl("/agent/follow-up");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        ...yiAiAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session_id: sessionId, message }),
    });
    const data = await res.json();
    return data?.code === 0;
  } catch {
    return false;
  }
}