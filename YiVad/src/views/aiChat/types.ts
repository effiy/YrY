import type { ChatMessage } from "@/api/interface/yiAi";

export type { ChatMessage };

export type AiChatFeedbackRating = "like" | "dislike" | null;

export interface AiChatFeedback {
  rating: AiChatFeedbackRating;
  content?: string;
}

export type AiChatStreamingType = "" | "send" | "regenerate" | "resend";
