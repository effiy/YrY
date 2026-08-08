import type { ChatMessage } from "@/api/interface/yiweb";

export type { ChatMessage };

export type AiChatFeedbackRating = "like" | "dislike" | null;

export interface AiChatFeedback {
  rating: AiChatFeedbackRating;
  content?: string;
}

export type AiChatStreamingType = "" | "send" | "regenerate" | "resend";

// ── Agent observability types (Pi-inspired) ──────────────────────────

/** Streaming phase: finer-grained than the legacy AiChatStreamingType. */
export type AgentStreamingPhase =
  | "idle"
  | "fetching"
  | "thinking"
  | "retrieving"
  | "streaming"
  | "done";

/** A single tool call in the per-message tool timeline. */
export interface ToolCallEntry {
  name: string;
  label: string;
  args?: Record<string, unknown>;
  content?: string;
  error?: string;
  durationMs?: number;
}

/** Agent event from the SSE stream. */
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
  // Confirmation event fields (tool requires user approval)
  tool_name?: string;
  tool_args?: Record<string, unknown>;
  confirmation_id?: string;
}

/** Per-turn summary for the agent timeline UI. */
export interface AgentTurnSummary {
  turnIndex: number;
  toolCalls: ToolCallEntry[];
  startTime: number;
  endTime?: number;
  stopReason?: string;
  /** Thinking/reasoning text streamed during this turn (before tool calls). */
  thinkingText?: string;
  /** Token usage for this turn. */
  usage?: { turnTokens: number; totalTokens: number; turns: number };
}
