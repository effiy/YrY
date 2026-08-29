/**
 * Reading List service — wraps YiAi's generic data service.
 *
 * A single MongoDB collection `reading_list` stores curated reading items
 * (articles, books, papers) for the executiver role — see
 * YiKnowledge/executiver/reading-list/README.md. Each item tracks title,
 * type, link, author, reading status, priority and notes.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument, countDocuments } from "./dataService";
import type { YiAiEnvelope, QueryDocumentsData } from "@/api/interface/yiweb";

export const READING_LIST_COLLECTION = "reading_list";

// ── Types ──

export type ReadingItemType = "article" | "book" | "paper";
export type ReadingItemStatus = "to-read" | "reading" | "done";
export type ReadingItemPriority = "high" | "medium" | "low";

/** Reading-list entry — stored in MongoDB `reading_list` collection. */
export interface ReadingItem {
  key?: string;
  title: string;
  type: ReadingItemType;
  link?: string;
  author?: string;
  status: ReadingItemStatus;
  priority?: ReadingItemPriority;
  notes?: string;
  role?: string;
  createdTime?: string;
  updatedTime?: string;
}

export interface ReadingListParams {
  search?: string;
  type?: ReadingItemType;
  status?: ReadingItemStatus;
  priority?: ReadingItemPriority;
  role?: string;
  pageNum?: number;
  pageSize?: number;
  orderBy?: string;
  orderType?: "asc" | "desc";
}

// ── Queries ──

export async function getReadingList(
  params: ReadingListParams = {}
): Promise<YiAiEnvelope<QueryDocumentsData<ReadingItem> & { pageNum: number; pageSize: number }>> {
  const filter: Record<string, any> = {};
  if (params.search) {
    const rx = { $regex: params.search, $options: "i" };
    filter.$or = [{ title: rx }, { author: rx }, { notes: rx }];
  }
  if (params.type) filter.type = params.type;
  if (params.status) filter.status = params.status;
  if (params.priority) filter.priority = params.priority;
  if (params.role) filter.role = params.role;
  const pageNum = params.pageNum ?? 1;
  const pageSize = params.pageSize ?? 20;
  const res = await queryDocuments<ReadingItem>({
    cname: READING_LIST_COLLECTION,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    pageNum,
    pageSize,
    orderBy: params.orderBy || "updatedTime",
    orderType: params.orderType || "desc"
  });
  if (res.code !== 0) throw new Error(res.message || "Failed to load reading list");
  return {
    ...res,
    data: {
      ...(res.data as QueryDocumentsData<ReadingItem>),
      pageNum,
      pageSize
    } as any
  };
}

// ── Mutations ──

export async function createReadingItem(item: Omit<ReadingItem, "key" | "createdTime" | "updatedTime">): Promise<YiAiEnvelope> {
  return createDocument(READING_LIST_COLLECTION, { ...item });
}

export async function updateReadingItem(key: string, patch: Partial<ReadingItem>): Promise<YiAiEnvelope> {
  return updateDocument(READING_LIST_COLLECTION, key, { ...patch, updatedTime: new Date().toISOString() });
}

export async function deleteReadingItem(key: string): Promise<YiAiEnvelope> {
  return deleteDocument(READING_LIST_COLLECTION, key);
}

/** Fetch role-wide counts (total, reading, done) in a single API call. */
export async function getReadingListCounts(role: string): Promise<{ total: number; reading: number; done: number }> {
  const res = await countDocuments(READING_LIST_COLLECTION, role ? { role } : {}, "status");
  if (res.code !== 0) throw new Error(res.message || "Failed to load counts");
  const groups = res.data?.groups || [];
  const map: Record<string, number> = {};
  for (const g of groups) {
    if (g.value) map[g.value] = g.count;
  }
  return {
    total: res.data?.total ?? 0,
    reading: map.reading ?? 0,
    done: map.done ?? 0
  };
}
