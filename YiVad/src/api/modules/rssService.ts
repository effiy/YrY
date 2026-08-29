/**
 * RSS service — wraps YiAi's RSS backend.
 *
 * Two collections live in MongoDB:
 *   - `rss`   — per-entry metadata (title, link, source_name, source_url,
 *               published, published_parsed, category_path, file_path,
 *               createdTime, updatedTime, author, tags). Article body is
 *               NOT stored — it lives as markdown under ~/YiKnowledge/rss/
 *               at `file_path` (read via knowledgeService.readKnowledgeFile).
 *   - `seeds` — feed source configs (url, name, enabled, category, interval,
 *               tags, createdAt, updatedAt). The scheduler pulls enabled
 *               seeds on each tick.
 *
 * Scheduler ops live in services.rss.rss_scheduler (RPC envelope):
 *   parse_all_enabled_rss_sources, start_rss_scheduler, stop_rss_scheduler,
 *   set_scheduler_config, get_scheduler_status_info.
 *
 * One-shot parse lives in services.rss.feed_service.parse_feed.
 */
import { callService, queryDocuments, createDocument, updateDocument, deleteDocument } from "./dataService";
import type { YiAiEnvelope, QueryDocumentsData } from "@/api/interface/yiweb";

export const RSS_COLLECTION = "rss";
export const SEEDS_COLLECTION = "seeds";

const RSS_SCHEDULER_SERVICE = "services.rss.rss_scheduler";
const RSS_FEED_SERVICE = "services.rss.feed_service";

// ── Types ──

/** RSS entry metadata — stored in MongoDB `rss` collection. */
export interface RssItemDocument {
  key?: string;
  title: string;
  link: string;
  tags?: string[];
  source_name: string;
  source_url: string;
  published?: string;
  /** Auto-classification, e.g. "executiver/industry" or "aier/methodology". */
  category_path?: string;
  /** Relative path under ~/YiKnowledge, e.g. "rss/foo-bar-1a2b3c.md". */
  file_path?: string;
  /** Epoch-ms timestamp of the entry's published date. */
  published_parsed?: number | string;
  author?: string;
  /** RSS description/summary (max 500 chars, may contain HTML). */
  summary?: string;
  /** True when ``file_path`` resolves to no markdown file on disk (metadata-only). */
  body_missing?: boolean;
  createdTime?: string;
  updatedTime?: string;
}

/** Feed source config — stored in MongoDB `seeds` collection. */
export interface RssSeedDocument {
  key?: string;
  url: string;
  name?: string;
  enabled?: boolean;
  /** Optional category override, e.g. "aier/methodology". */
  category?: string;
  interval?: number;
  tags?: string[];
  createdAt?: number;
  updatedAt?: number;
}

export interface RssListParams {
  search?: string;
  source_name?: string | string[];
  source_url?: string;
  category_path?: string;
  /** Prefix match for category_path, e.g. "executiver" matches "executiver/industry". */
  categoryPrefix?: string;
  tags?: string[];
  publishedStart?: number;
  publishedEnd?: number;
  pageNum?: number;
  pageSize?: number;
  orderBy?: string;
  orderType?: "asc" | "desc";
}

/** Result envelope for parse_feed / parse_all_enabled_rss_sources. */
export interface RssParseResult {
  url?: string;
  source?: string;
  source_name?: string;
  success: boolean;
  saved_count?: number;
  updated_count?: number;
  total_items?: number;
  files_written?: number;
  error?: string;
  results?: RssParseResult[];
  total_sources?: number;
  success_count?: number;
  failed_count?: number;
}

export interface RssSchedulerStatus {
  enabled: boolean;
  type: "interval" | "cron";
  interval?: number;
  cron?: Record<string, number | null>;
}

// ── Item queries ──

export async function getRssList(
  params: RssListParams = {}
): Promise<YiAiEnvelope<QueryDocumentsData<RssItemDocument> & { pageNum: number; pageSize: number }>> {
  const filter: Record<string, any> = {};
  const search = params.search;
  if (search) {
    const rx = { $regex: search, $options: "i" };
    filter.$or = [{ title: rx }, { link: rx }, { author: rx }];
  }
  if (params.source_name) {
    filter.source_name = Array.isArray(params.source_name)
      ? { $in: params.source_name }
      : params.source_name;
  }
  if (params.source_url) filter.source_url = params.source_url;
  if (params.category_path) filter.category_path = params.category_path;
  if (params.categoryPrefix) filter.category_path = { $regex: `^${params.categoryPrefix}(/|$)`, $options: "i" };
  if (params.tags?.length) filter.tags = { $in: params.tags };
  if (params.publishedStart !== undefined || params.publishedEnd !== undefined) {
    const pub: Record<string, number> = {};
    if (params.publishedStart !== undefined) pub.$gte = params.publishedStart;
    if (params.publishedEnd !== undefined) pub.$lte = params.publishedEnd;
    filter.published_parsed = pub;
  }
  const pageNum = params.pageNum ?? 1;
  const pageSize = params.pageSize ?? 10;
  const res = await queryDocuments<RssItemDocument>({
    cname: RSS_COLLECTION,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    pageNum,
    pageSize,
    orderBy: params.orderBy || "updatedTime",
    orderType: params.orderType || "desc"
  });
  if (res.code !== 0) throw new Error(res.message || "Failed to load RSS items");
  return {
    ...res,
    data: {
      ...(res.data as QueryDocumentsData<RssItemDocument>),
      pageNum,
      pageSize
    } as any
  };
}

export async function getRssItem(key: string): Promise<RssItemDocument | null> {
  const res = await queryDocuments<RssItemDocument>({ cname: RSS_COLLECTION, filter: { key }, limit: 1 });
  if (res.code !== 0) throw new Error(res.message || "Failed to load RSS item");
  return res.data?.list?.[0] ?? null;
}

// ── Seed queries ──

export async function getSeedList(
  params: { search?: string; enabled?: boolean; pageNum?: number; pageSize?: number } = {}
): Promise<YiAiEnvelope<QueryDocumentsData<RssSeedDocument> & { pageNum: number; pageSize: number }>> {
  const filter: Record<string, any> = {};
  if (params.search) {
    const rx = { $regex: params.search, $options: "i" };
    filter.$or = [{ url: rx }, { name: rx }];
  }
  if (typeof params.enabled === "boolean") filter.enabled = params.enabled;
  const pageNum = params.pageNum ?? 1;
  const pageSize = params.pageSize ?? 50;
  const res = await queryDocuments<RssSeedDocument>({
    cname: SEEDS_COLLECTION,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    pageNum,
    pageSize,
    orderBy: "updatedAt",
    orderType: "desc"
  });
  if (res.code !== 0) throw new Error(res.message || "Failed to load RSS seeds");
  return {
    ...res,
    data: {
      ...(res.data as QueryDocumentsData<RssSeedDocument>),
      pageNum,
      pageSize
    } as any
  };
}

export async function getSeed(key: string): Promise<RssSeedDocument | null> {
  const res = await queryDocuments<RssSeedDocument>({ cname: SEEDS_COLLECTION, filter: { key }, limit: 1 });
  if (res.code !== 0) throw new Error(res.message || "Failed to load RSS seed");
  return res.data?.list?.[0] ?? null;
}

export async function getSeedByUrl(url: string): Promise<RssSeedDocument | null> {
  const res = await queryDocuments<RssSeedDocument>({ cname: SEEDS_COLLECTION, filter: { url }, limit: 1 });
  if (res.code !== 0) return null;
  return res.data?.list?.[0] ?? null;
}

export async function createSeed(
  seed: Omit<RssSeedDocument, "createdAt" | "updatedAt"> & { key: string }
): Promise<YiAiEnvelope> {
  const now = Date.now();
  return createDocument(SEEDS_COLLECTION, { ...seed, createdAt: now, updatedAt: now });
}

export async function updateSeed(key: string, patch: Partial<RssSeedDocument>): Promise<YiAiEnvelope> {
  return updateDocument(SEEDS_COLLECTION, key, { ...patch, updatedAt: Date.now() });
}

export async function deleteSeed(key: string): Promise<YiAiEnvelope> {
  return deleteDocument(SEEDS_COLLECTION, key);
}

// ── Item mutations ──

export async function deleteRssItem(key: string): Promise<YiAiEnvelope> {
  return deleteDocument(RSS_COLLECTION, key);
}

export async function updateRssItem(key: string, patch: Partial<RssItemDocument>): Promise<YiAiEnvelope> {
  return updateDocument(RSS_COLLECTION, key, { ...patch, updatedTime: new Date().toISOString() });
}

// ── Scheduler + parse ops (RPC envelope) ──

export function parseFeed(url: string, name?: string): Promise<YiAiEnvelope<RssParseResult>> {
  return callService<RssParseResult>(RSS_FEED_SERVICE, "parse_feed", { url, name });
}

export function parseAllEnabledFeeds(): Promise<YiAiEnvelope<RssParseResult>> {
  return callService<RssParseResult>(RSS_SCHEDULER_SERVICE, "parse_all_enabled_rss_sources", {});
}

export function startRssScheduler(): Promise<YiAiEnvelope> {
  return callService(RSS_SCHEDULER_SERVICE, "start_rss_scheduler", {});
}

export function stopRssScheduler(): Promise<YiAiEnvelope> {
  return callService(RSS_SCHEDULER_SERVICE, "stop_rss_scheduler", {});
}

export function setRssSchedulerConfig(config: Record<string, any>): Promise<YiAiEnvelope> {
  return callService(RSS_SCHEDULER_SERVICE, "set_scheduler_config", { config });
}

export function getRssSchedulerStatus(): Promise<YiAiEnvelope<RssSchedulerStatus>> {
  return callService<RssSchedulerStatus>(RSS_SCHEDULER_SERVICE, "get_scheduler_status_info", {});
}

// ── Shared prompt constants ──

export type RssQuickAction = "summarize" | "translate" | "critique";

export const RSS_QUICK_ACTION_PROMPTS: Record<RssQuickAction, string> = {
  summarize:
    "You are an RSS article summarizer. Read the ingested article and produce a ≤200-word summary in the user's language covering: thesis, key evidence, conclusions. Quote no more than one sentence verbatim.",
  translate:
    "You are a professional translator. Translate the ingested RSS article into the user's language, preserving structure (headings, lists, paragraphs). Do not summarize. Keep proper nouns and source URLs as-is.",
  critique:
    "You are a critical reviewer. Read the ingested RSS article and evaluate: methodology, evidence quality, potential biases, gaps. Reply in the user's language with bulleted observations, ending with a 1-sentence verdict."
};
