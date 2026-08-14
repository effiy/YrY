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
