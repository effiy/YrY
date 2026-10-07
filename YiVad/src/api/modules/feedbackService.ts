/**
 * User feedback API module — submit and retrieve message ratings.
 * Stores feedback via the generic data_service RPC (feedback collection).
 *
 * Note: YiAi's `services.ai.feedback_service` module does not exist yet.
 * Feedback is persisted through `data_service` → MongoDB `feedback` collection
 * until the dedicated service module is implemented.
 */
import { queryDocuments, createDocument } from "./dataService";

export interface FeedbackPayload {
  sessionKey: string;
  messageTimestamp: number;
  rating: "up" | "down";
  accuracy?: number;   // 1-5
  helpfulness?: number; // 1-5
  safety?: number;      // 1-5
  comment?: string;
}

export interface FeedbackRecord {
  sessionKey: string;
  messageTimestamp: number;
  rating: "up" | "down";
  accuracy?: number;
  helpfulness?: number;
  safety?: number;
  comment?: string;
  createdAt: number;
}

/** Submit feedback for a specific AI response. */
export async function submitFeedback(payload: FeedbackPayload): Promise<{ code: number; message: string }> {
  return createDocument("feedback", {
    ...payload,
    createdAt: Date.now()
  });
}

/** Get all feedback for a session. */
export async function getSessionFeedback(sessionKey: string): Promise<FeedbackRecord[]> {
  const res = await queryDocuments<FeedbackRecord>({
    cname: "feedback",
    filter: { sessionKey },
    pageSize: 100,
    orderBy: "createdAt",
    orderType: "desc"
  });
  return (res.data?.list ?? []) as FeedbackRecord[];
}

/** Get user's feedback stats summary. */
export async function getFeedbackStats(): Promise<{
  totalUp: number;
  totalDown: number;
  avgAccuracy: number;
  avgHelpfulness: number;
  avgSafety: number;
}> {
  const res = await queryDocuments<FeedbackRecord>({ cname: "feedback", pageSize: 1000 });
  const list = (res.data?.list ?? []) as FeedbackRecord[];
  const up = list.filter(f => f.rating === "up");
  const down = list.filter(f => f.rating === "down");
  return {
    totalUp: up.length,
    totalDown: down.length,
    avgAccuracy: down.length ? down.reduce((s, f) => s + (f.accuracy ?? 3), 0) / down.length : 0,
    avgHelpfulness: down.length ? down.reduce((s, f) => s + (f.helpfulness ?? 3), 0) / down.length : 0,
    avgSafety: down.length ? down.reduce((s, f) => s + (f.safety ?? 3), 0) / down.length : 0,
  };
}