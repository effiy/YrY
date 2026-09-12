/**
 * Generic per-topic CRUD.
 *
 * Each leader / code-review topic lives in its own Mongo collection
 * (e.g. `tech_roadmap_review`, `cr_summary`). YiAi creates the collection on
 * first insert — no schema migration needed.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument } from "./dataService";
import type { YiAiEnvelope, QueryDocumentsData } from "@/api/interface/yiAi";

export type TopicTree = "leader" | "code-review" | "engineer" | "producter" | "aier" | "srer" | "executiver" | "curator";

export interface TopicEntryDocument {
  key: string;
  topic: string;
  title: string;
  content: string;
  tags?: string[];
  /** Topic-specific structured fields (e.g. severity, status, file_path). */
  meta?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface TopicListParams {
  title?: string;
  tags?: string;
  /** Cross-domain join key — matches `meta.project` (substring, case-insensitive). */
  project?: string;
  pageNum?: number;
  pageSize?: number;
}

/** Convention: leader → `tech_<value>`; code-review → `cr_<value>`; other roles → `<role>_<value>`. */
export function cnameFor(tree: TopicTree, topic: string): string {
  if (tree === "leader") return `tech_${topic}`;
  if (tree === "code-review") return `cr_${topic}`;
  return `${tree}_${topic}`;
}

export function makeKey(tree: TopicTree, topic: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  const prefixMap: Record<TopicTree, string> = {
    "leader": "leader",
    "code-review": "cr",
    engineer: "eng",
    producter: "pm",
    aier: "ai",
    srer: "sre",
    executiver: "exec",
    curator: "cur"
  };
  const prefix = prefixMap[tree];
  return `${prefix}_${topic}_${stamp}${rand}`;
}

export async function getTopicList<T extends TopicEntryDocument = TopicEntryDocument>(
  tree: TopicTree,
  topic: string,
  params: TopicListParams = {}
): Promise<YiAiEnvelope<QueryDocumentsData<T> & { pageNum: number; pageSize: number }>> {
  const filter: Record<string, any> = {};
  if (params.title) filter.title = { $regex: params.title, $options: "i" };
  if (params.tags) filter.tags = { $regex: params.tags, $options: "i" };
  if (params.project) filter["meta.project"] = { $regex: params.project, $options: "i" };

  const pageNum = params.pageNum ?? 1;
  const pageSize = params.pageSize ?? 10;

  const res = await queryDocuments<T>({
    cname: cnameFor(tree, topic),
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    pageNum,
    pageSize,
    orderBy: "updatedAt",
    orderType: "desc"
  });
  if (res.code !== 0) throw new Error(res.message || "Failed to load topic entries");
  return {
    ...res,
    data: {
      ...(res.data as QueryDocumentsData<T>),
      pageNum,
      pageSize
    } as any
  };
}

export async function getTopicEntry<T extends TopicEntryDocument = TopicEntryDocument>(
  tree: TopicTree,
  topic: string,
  key: string
): Promise<T | null> {
  const res = await queryDocuments<T>({ cname: cnameFor(tree, topic), filter: { key }, limit: 1 });
  if (res.code !== 0) throw new Error(res.message || "Failed to load topic entry");
  const doc = res.data?.list?.[0] ?? null;
  if (!doc) return null;

  return doc;
}

export async function createTopicEntry(
  tree: TopicTree,
  topic: string,
  payload: { title: string; content: string; tags?: string[]; meta?: Record<string, any> },
  key?: string
): Promise<YiAiEnvelope> {
  const now = Date.now();
  const finalKey = key ?? makeKey(tree, topic);

  const doc: Record<string, any> = {
    key: finalKey,
    topic,
    title: payload.title,
    content: payload.content,
    tags: payload.tags ?? [],
    meta: payload.meta ?? {},
    createdAt: now,
    updatedAt: now
  };
  return createDocument(cnameFor(tree, topic), doc);
}

export async function updateTopicEntry(
  tree: TopicTree,
  topic: string,
  key: string,
  patch: Partial<{ title: string; content: string; tags: string[]; meta: Record<string, any> }>
): Promise<YiAiEnvelope> {
  const mongoPatch: Record<string, any> = { updatedAt: Date.now() };
  if (patch.title !== undefined) mongoPatch.title = patch.title;
  if (patch.tags !== undefined) mongoPatch.tags = patch.tags;
  if (patch.meta !== undefined) mongoPatch.meta = patch.meta;
  if (patch.content !== undefined) mongoPatch.content = patch.content;

  return updateDocument(cnameFor(tree, topic), key, mongoPatch);
}

export async function deleteTopicEntry(tree: TopicTree, topic: string, key: string): Promise<YiAiEnvelope> {
  return deleteDocument(cnameFor(tree, topic), key);
}
