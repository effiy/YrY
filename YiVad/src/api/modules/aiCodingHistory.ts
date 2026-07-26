/**
 * AI Coding History CRUD — calls YiAi data-service RPC for the "ai_coding_history" collection.
 *
 * Each document records a single AI-generated coding prompt tied to a story scenario.
 * History is stored in its own collection (not embedded in the story document) so it
 * can be queried, paginated, and updated independently.
 */
import { queryDocuments, createDocument, deleteDocument } from "./dataService";
import type { AiCodingHistoryDocument } from "@/api/interface/yiweb";

const CNAME = "ai_coding_history";

// ── Types ──

export type { AiCodingHistoryDocument };

export interface AiCodingHistoryListParams {
  storyKey?: string;
  scenarioKey?: string;
  type?: "ai_coding" | "analysis_files";
  pageNum?: number;
  pageSize?: number;
}

// ── API ──

/** Fetch history entries, optionally filtered by story or scenario. */
export async function getHistoryList(params: AiCodingHistoryListParams = {}) {
  const filter: Record<string, unknown> = {};
  if (params.storyKey) filter.storyKey = params.storyKey;
  if (params.scenarioKey) filter.scenarioKey = params.scenarioKey;
  if (params.type) filter.type = params.type;

  const res = await queryDocuments<AiCodingHistoryDocument>({
    cname: CNAME,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    pageNum: params.pageNum ?? 1,
    pageSize: params.pageSize ?? 200,
    orderBy: "generatedAt",
    orderType: "desc"
  });
  if (res.code !== 0) throw new Error(res.message || "Failed to load AI coding history");
  return { list: res.data?.list ?? [], total: res.data?.total ?? 0 };
}

/** Create a new history entry. Returns the auto-generated key. */
export async function createHistoryEntry(data: {
  storyKey: string;
  scenarioKey: string;
  scenarioName: string;
  prompt: string;
  generatedAt: number;
  type?: "ai_coding" | "analysis_files";
}) {
  const res = await createDocument(CNAME, {
    ...data,
    type: data.type ?? "ai_coding",
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  if (res.code !== 0) throw new Error(res.message || "Failed to save AI coding history");
  return res.data;
}

/** Delete a history entry by key. */
export async function deleteHistoryEntry(key: string) {
  const res = await deleteDocument(CNAME, key);
  if (res.code !== 0) throw new Error(res.message || "Failed to delete AI coding history");
  return res.data;
}
