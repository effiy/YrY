/**
 * Generic per-topic CRUD.
 *
 * Each tech-leadership / code-review topic lives in its own Mongo collection
 * (e.g. `tech_roadmap_review`, `cr_summary`). YiAi creates the collection on
 * first insert — no schema migration needed.
 *
 * BRD topics use **split storage**: metadata (title, tags, meta) lives in
 * MongoDB, while the markdown content lives in YiKnowledge files under
 * `brd/{topic}/{key}.md`. This mirrors the bug.ts pattern — the DB doc stays
 * lean for cheap queries, and long-form markdown is searchable by
 * YiKnowledge's scanner and editable in aicr.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument, callService } from "./dataService";
import { readKnowledgeFile } from "./knowledgeService";
import type { YiAiEnvelope, QueryDocumentsData } from "@/api/interface/yiweb";

export type TopicTree = "tech-leadership" | "code-review" | "brd";

export interface TopicEntryDocument {
  key: string;
  topic: string;
  title: string;
  content: string;
  /** Relative path under ~/YiKnowledge for BRD split-storage entries, e.g. "brd/brd-documents/brd_brd-documents_xxx.md". */
  contentPath?: string;
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

/** Convention: tech-leadership → `tech_<value>`; code-review → `cr_<value>`; brd → `brd_<value>`. */
export function cnameFor(tree: TopicTree, topic: string): string {
  if (tree === "tech-leadership") return `tech_${topic}`;
  if (tree === "brd") return `brd_${topic}`;
  return `cr_${topic}`;
}

/** YiKnowledge content path for BRD split-storage entries, e.g. "brd/brd-documents/brd_xxx.md". */
export function contentPathFor(tree: TopicTree, topic: string, key: string): string {
  return `${tree}/${topic}/${key}.md`;
}

export function makeKey(tree: TopicTree, topic: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  const prefix = tree === "tech-leadership" ? "tl" : tree === "brd" ? "brd" : "cr";
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
  const doc = res.data?.list?.[0] ?? null;
  if (!doc) return null;

  // BRD: read content from YiKnowledge file
  if (tree === "brd" && (doc as TopicEntryDocument).contentPath) {
    try {
      const file = await readKnowledgeFile((doc as TopicEntryDocument).contentPath!);
      (doc as TopicEntryDocument).content = file.content || "";
    } catch {
      // File missing — leave content empty; the detail page still renders metadata
      (doc as TopicEntryDocument).content = "";
    }
  }
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
  const isBrd = tree === "brd";
  const cpath = isBrd ? contentPathFor(tree, topic, finalKey) : undefined;

  // BRD: write content to YiKnowledge file first
  if (isBrd && payload.content) {
    await callService("services.knowledge.knowledge_service", "write_entry_markdown", {
      rel_path: cpath,
      content: payload.content,
      meta: { title: payload.title, key: finalKey, tags: payload.tags ?? [], ...(payload.meta ?? {}) }
    });
  }

  const doc: Record<string, any> = {
    key: finalKey,
    topic,
    title: payload.title,
    tags: payload.tags ?? [],
    meta: payload.meta ?? {},
    createdAt: now,
    updatedAt: now
  };
  if (isBrd) {
    doc.contentPath = cpath;
    doc.content = "";
  } else {
    doc.content = payload.content;
  }
  return createDocument(cnameFor(tree, topic), doc);
}

export async function updateTopicEntry(
  tree: TopicTree,
  topic: string,
  key: string,
  patch: Partial<{ title: string; content: string; tags: string[]; meta: Record<string, any> }>
): Promise<YiAiEnvelope> {
  const isBrd = tree === "brd";
  if (isBrd && patch.content !== undefined) {
    const cpath = contentPathFor(tree, topic, key);
    await callService("services.knowledge.knowledge_service", "write_entry_markdown", {
      rel_path: cpath,
      content: patch.content,
      meta: { title: patch.title, key, tags: patch.tags ?? [] }
    });
  }

  const mongoPatch: Record<string, any> = { updatedAt: Date.now() };
  if (patch.title !== undefined) mongoPatch.title = patch.title;
  if (patch.tags !== undefined) mongoPatch.tags = patch.tags;
  if (patch.meta !== undefined) mongoPatch.meta = patch.meta;
  // BRD: content lives on disk, don't store it in Mongo
  if (!isBrd && patch.content !== undefined) mongoPatch.content = patch.content;

  return updateDocument(cnameFor(tree, topic), key, mongoPatch);
}

export async function deleteTopicEntry(tree: TopicTree, topic: string, key: string): Promise<YiAiEnvelope> {
  // BRD: delete YiKnowledge file first (best-effort)
  if (tree === "brd") {
    const cpath = contentPathFor(tree, topic, key);
    try {
      await callService("services.knowledge.knowledge_service", "delete_entry_markdown", {
        rel_path: cpath
      });
    } catch {
      // best-effort — metadata delete should still succeed
    }
  }
  return deleteDocument(cnameFor(tree, topic), key);
}
