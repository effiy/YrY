/**
 * Knowledge base service — wraps the four YiAi knowledge endpoints.
 *
 * YiAi scans ``~/YiKnowledge`` (markdown + YAML frontmatter) and returns
 * metadata for the aicr sidebar, plus story.md content for the story detail
 * drawer. All endpoints are direct REST (not the RPC envelope) to mirror
 * fileService.
 */
import { buildYiAiUrl, yiAiAuthHeaders } from "@/config/yiweb";
import type {
  KnowledgeReadResponse,
  KnowledgeScanResponse,
  KnowledgeStoriesResponse,
  YiAiEnvelope
} from "@/api/interface/yiweb";

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const url = buildYiAiUrl(path);
  const resp = await fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    throw new Error(`Knowledge request failed: ${path} HTTP ${resp.status}`);
  }
  const data = (await resp.json()) as YiAiEnvelope<T>;
  if (data.code !== 0) {
    throw new Error(data.message || `Knowledge request failed: ${path}`);
  }
  return data.data;
}

/** Scan the full knowledge tree, or one top-level category if `category` is set. */
export function scanKnowledge(category?: string): Promise<KnowledgeScanResponse> {
  return postJson<KnowledgeScanResponse>("/knowledge-scan", { category });
}

/** Read a single knowledge markdown file (path + parsed frontmatter + body). */
export function readKnowledgeFile(targetFile: string): Promise<KnowledgeReadResponse> {
  return postJson<KnowledgeReadResponse>("/knowledge-read", { target_file: targetFile });
}

/** List story.md entries under projects/{project}/ — pass project to filter. */
export function listKnowledgeStories(project?: string): Promise<KnowledgeStoriesResponse> {
  return postJson<KnowledgeStoriesResponse>("/knowledge-stories", { project });
}

/** Read a specific story's story.md. */
export function readKnowledgeStory(project: string, storyName: string): Promise<KnowledgeReadResponse> {
  return postJson<KnowledgeReadResponse>("/knowledge-story-read", { project, story_name: storyName });
}

export interface KnowledgeSyncResponse {
  synced: number;
  deleted: number;
}

/** Trigger a full disk → MongoDB reconciliation for ~/YiKnowledge. */
export function syncKnowledge(): Promise<KnowledgeSyncResponse> {
  return postJson<KnowledgeSyncResponse>("/knowledge-sync", {});
}

export interface KnowledgeWriteResponse {
  path: string;
}

/**
 * Write a markdown file to the YiKnowledge directory.
 * Creates a YAML frontmatter from metadata and writes the content body.
 * Idempotent — overwrites if the file already exists.
 *
 * @param targetFile Relative path under YiKnowledge, e.g. "reports/q3-sales.md"
 * @param content     Markdown body content (written after frontmatter)
 * @param metadata    Optional YAML frontmatter key-value pairs (title, tags, category, etc.)
 */
export function writeKnowledgeFile(
  targetFile: string,
  content: string,
  metadata?: Record<string, unknown>
): Promise<KnowledgeWriteResponse> {
  return postJson<KnowledgeWriteResponse>("/knowledge-write", {
    target_file: targetFile,
    content,
    metadata
  });
}
