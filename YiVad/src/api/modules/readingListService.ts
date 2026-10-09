/**
 * Reading List service — wraps YiAi's generic data service.
 *
 * A single MongoDB collection `reading_list` stores curated reading items
 * (articles, books, papers) for the executive role — see
 * YiKnowledge/executive/reading-list/README.md. Each item tracks title,
 * type, link, author, reading status, priority and notes.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument, countDocuments, type QueryDocumentsOpts } from "./dataService";
import type { YiAiEnvelope, QueryDocumentsData } from "@/api/interface/yiAi";

export const READING_LIST_COLLECTION = "reading_list";

// ── Types ──

export type ReadingItemType = "article" | "book" | "paper";
export type ReadingItemStatus = "to-read" | "reading" | "done";
export type ReadingItemPriority = "high" | "medium" | "low";

/** Semantic dimension — aligns with reading-list v3.2 matrix. */
export type ReadingDimension =
  | "strategy"
  | "management"
  | "engineering"
  | "frontend"
  | "sre"
  | "ai"
  | "product"
  | "cognition";

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
  /** RICE score 0–100 — Reach×Impact×Confidence/Effort normalized */
  rice?: number;
  /** Semantic knowledge dimension */
  dimension?: ReadingDimension;
  /** Knowledge-domain category, e.g. 架构 / 管理 / 认知 */
  category?: string;
  /** Linked OKR goal id (matches okrData.ts) */
  okrId?: string;
  /** Reading progress percentage 0–100 */
  progress?: number;
  /** Target date / scheduled month, e.g. "2026-11" */
  scheduled?: string;
  createdTime?: string;
  updatedTime?: string;
}

export interface ReadingListParams {
  search?: string;
  type?: ReadingItemType;
  status?: ReadingItemStatus;
  priority?: ReadingItemPriority;
  role?: string;
  dimension?: ReadingDimension;
  riceMin?: number;
  riceMax?: number;
  pageNum?: number;
  pageSize?: number;
  orderBy?: string;
  orderType?: "asc" | "desc";
}

/** Aggregated breakdown used by the dashboard visual layer. */
export interface ReadingListBreakdown {
  byType: Record<ReadingItemType, number>;
  byDimension: Record<ReadingDimension, number>;
  byPriority: Record<ReadingItemPriority, number>;
  byStatus: Record<ReadingItemStatus, number>;
  riceBuckets: Record<"tier1" | "tier2" | "tier3" | "tier4", number>;
  avgRice: number;
  avgProgress: number;
  completionPct: number;
}

// ── Queries ──

export async function getReadingList(
  params: ReadingListParams = {}
): Promise<YiAiEnvelope<QueryDocumentsData<ReadingItem> & { pageNum: number; pageSize: number }>> {
  const filter: Record<string, any> = {};
  if (params.search) {
    const rx = { $regex: params.search, $options: "i" };
    filter.$or = [{ title: rx }, { author: rx }, { notes: rx }, { category: rx }];
  }
  if (params.type) filter.type = params.type;
  if (params.status) filter.status = params.status;
  if (params.priority) filter.priority = params.priority;
  if (params.role) filter.role = params.role;
  if (params.dimension) filter.dimension = params.dimension;
  if (typeof params.riceMin === "number" || typeof params.riceMax === "number") {
    const rice: Record<string, number> = {};
    if (typeof params.riceMin === "number") rice.$gte = params.riceMin;
    if (typeof params.riceMax === "number") rice.$lte = params.riceMax;
    filter.rice = rice;
  }
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

/** Compute dashboard-level breakdown across all (or role-filtered) items. */
export async function getReadingListBreakdown(role = ""): Promise<ReadingListBreakdown> {
  const res = await getReadingList({ role, pageNum: 1, pageSize: 500, orderBy: "updatedTime", orderType: "desc" });
  const list: ReadingItem[] = (res.data as QueryDocumentsData<ReadingItem>)?.list ?? [];
  const breakdown: ReadingListBreakdown = {
    byType: { article: 0, book: 0, paper: 0 },
    byDimension: { strategy: 0, management: 0, engineering: 0, frontend: 0, sre: 0, ai: 0, product: 0, cognition: 0 },
    byPriority: { high: 0, medium: 0, low: 0 },
    byStatus: { "to-read": 0, reading: 0, done: 0 },
    riceBuckets: { tier1: 0, tier2: 0, tier3: 0, tier4: 0 },
    avgRice: 0,
    avgProgress: 0,
    completionPct: 0
  };
  let riceSum = 0;
  let riceCount = 0;
  let progressSum = 0;
  let progressCount = 0;
  for (const it of list) {
    if (it.type) breakdown.byType[it.type] = (breakdown.byType[it.type] ?? 0) + 1;
    if (it.dimension) breakdown.byDimension[it.dimension] = (breakdown.byDimension[it.dimension] ?? 0) + 1;
    if (it.priority) breakdown.byPriority[it.priority] = (breakdown.byPriority[it.priority] ?? 0) + 1;
    if (it.status) breakdown.byStatus[it.status] = (breakdown.byStatus[it.status] ?? 0) + 1;
    if (typeof it.rice === "number") {
      riceSum += it.rice;
      riceCount += 1;
      if (it.rice >= 80) breakdown.riceBuckets.tier1 += 1;
      else if (it.rice >= 60) breakdown.riceBuckets.tier2 += 1;
      else if (it.rice >= 40) breakdown.riceBuckets.tier3 += 1;
      else breakdown.riceBuckets.tier4 += 1;
    }
    if (typeof it.progress === "number") {
      progressSum += it.progress;
      progressCount += 1;
    } else if (it.status === "done") {
      progressSum += 100;
      progressCount += 1;
    } else if (it.status === "reading") {
      progressSum += 50;
      progressCount += 1;
    }
  }
  const total = list.length;
  breakdown.avgRice = riceCount ? Math.round((riceSum / riceCount) * 10) / 10 : 0;
  breakdown.avgProgress = progressCount ? Math.round(progressSum / progressCount) : 0;
  breakdown.completionPct = total ? Math.round(((breakdown.byStatus.done ?? 0) / total) * 100) : 0;
  return breakdown;
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
export async function getReadingListCounts(
  role: string,
  opts: QueryDocumentsOpts = {}
): Promise<{ total: number; reading: number; done: number }> {
  const res = await countDocuments(
    READING_LIST_COLLECTION,
    role ? { role } : {},
    "status",
    { timeout: opts.timeout ?? 10_000, signal: opts.signal }
  );
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
