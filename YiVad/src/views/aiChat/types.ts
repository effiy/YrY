import type { ChatMessage } from "@/api/interface/yiweb";

export type { ChatMessage };

export type AiChatFeedbackRating = "like" | "dislike" | null;

export interface AiChatFeedback {
  rating: AiChatFeedbackRating;
  content?: string;
}

export type AiChatStreamingType = "" | "send" | "regenerate" | "resend";
