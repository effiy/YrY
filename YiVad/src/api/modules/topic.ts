/**
 * Generic per-topic CRUD.
 *
 * Each tech-leadership / code-review topic lives in its own Mongo collection
 * (e.g. `tech_roadmap_review`, `cr_summary`). YiAi creates the collection on
 * first insert — no schema migration needed. Entries are short
 * (prompt + filled answer), so the whole document stays in Mongo (no
 * on-disk markdown split, unlike `bug.ts`).
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument } from "./dataService";
import type { YiAiEnvelope, QueryDocumentsData } from "@/api/interface/yiweb";

export type TopicTree = "tech-leadership" | "code-review";

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
  pageNum?: number;
  pageSize?: number;
}

/** Convention: tech-leadership topics → `tech_<value>`; code-review → `cr_<value>`. */
export function cnameFor(tree: TopicTree, topic: string): string {
  return tree === "tech-leadership" ? `tech_${topic}` : `cr_${topic}`;
}

function makeKey(tree: TopicTree, topic: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  const prefix = tree === "tech-leadership" ? "tl" : "cr";
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
  return res.data?.list?.[0] ?? null;
}

export async function createTopicEntry(
  tree: TopicTree,
  topic: string,
  payload: { title: string; content: string; tags?: string[]; meta?: Record<string, any> }
): Promise<YiAiEnvelope> {
  const now = Date.now();
  const doc = {
    key: makeKey(tree, topic),
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
  return updateDocument(cnameFor(tree, topic), key, { ...patch, updatedAt: Date.now() });
}

export async function deleteTopicEntry(tree: TopicTree, topic: string, key: string): Promise<YiAiEnvelope> {
  return deleteDocument(cnameFor(tree, topic), key);
}
