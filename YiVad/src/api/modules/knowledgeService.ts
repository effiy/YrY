/**
 * Knowledge base service — wraps the YiAi knowledge endpoints.
 *
 * YiAi scans ``~/YiKnowledge`` (markdown + YAML frontmatter) and returns
 * metadata for the code review sidebar, plus story.md and bug.md content for
 * the detail drawers. All endpoints are direct REST (not the RPC envelope) to
 * mirror fileService.
 */
import { buildYiAiUrl, yiAiAuthHeaders } from "@/config/yiAi";
import type {
  KnowledgeReadResponse,
  KnowledgeScanResponse,
  KnowledgeStoriesResponse,
  KnowledgeBugsResponse,
  KnowledgeBugReadResponse,
  KnowledgeFilesResponse,
  YiAiEnvelope
} from "@/api/interface/yiAi";

async function postJson<T>(path: string, body: Record<string, unknown>, timeoutMs = 30_000): Promise<T> {
  const url = buildYiAiUrl(path);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: yiAiAuthHeaders(),
      body: JSON.stringify(body),
      signal: controller.signal
    });
    if (!resp.ok) {
      throw new Error(`Knowledge request failed: ${path} HTTP ${resp.status}`);
    }
    const data = (await resp.json()) as YiAiEnvelope<T>;
    if (data.code !== 0) {
      throw new Error(data.message || `Knowledge request failed: ${path}`);
    }
    return data.data;
  } finally {
    clearTimeout(timer);
  }
}

/** Read metadata from the DB mirror (no disk scan). Much faster than scanKnowledge
 *  when the watcher has populated the knowledge_files collection. */
export function listKnowledgeFiles(category?: string): Promise<KnowledgeFilesResponse> {
  return postJson<KnowledgeFilesResponse>("/knowledge-files", { category }, 10_000);
}

/** Scan the full knowledge tree, or one top-level category if `category` is set.
 *  This is a disk scan and may be slow for large knowledge repos. */
export function scanKnowledge(category?: string): Promise<KnowledgeScanResponse> {
  return postJson<KnowledgeScanResponse>("/knowledge-scan", { category }, 15_000);
}

/** Read a single knowledge markdown file (path + parsed frontmatter + body). */
export function readKnowledgeFile(targetFile: string): Promise<KnowledgeReadResponse> {
  return postJson<KnowledgeReadResponse>("/knowledge-read", { target_file: targetFile }, 10_000);
}

/** List story.md entries under engineer/learn/projects/{project}/ — pass project to filter. */
export function listKnowledgeStories(project?: string): Promise<KnowledgeStoriesResponse> {
  return postJson<KnowledgeStoriesResponse>("/knowledge-stories", { project }, 10_000);
}

/** Read a specific story's story.md. */
export function readKnowledgeStory(project: string, storyName: string): Promise<KnowledgeReadResponse> {
  return postJson<KnowledgeReadResponse>("/knowledge-story-read", { project, story_name: storyName }, 10_000);
}

/** List bug markdowns under projects/{project}/bugs/{date}/{type}/ — pass project to filter.
 *
 *  The YiAi scanner walks the YiKnowledge tree and parses each file's YAML frontmatter,
 *  returning the same BugDocument shape the MongoDB collection used. So callers get a
 *  drop-in replacement for `getBugList` without touching the store/view layer.
 */
export function listKnowledgeBugs(project?: string): Promise<KnowledgeBugsResponse> {
  return postJson<KnowledgeBugsResponse>("/knowledge-bugs", { project }, 10_000);
}

/** Read a single bug file → { bug: BugDocument, content: BugContent } via its contentPath.
 *
 *  Drop-in replacement for the previous two-step dance of `getBug(key)` +
 *  `readBugContent(contentPath)` — now one round-trip and purely disk-backed.
 */
export function readKnowledgeBug(contentPath: string): Promise<KnowledgeBugReadResponse> {
  return postJson<KnowledgeBugReadResponse>("/knowledge-bug-read", { content_path: contentPath }, 10_000);
}

export interface KnowledgeSyncResponse {
  synced: number;
  deleted: number;
  rag?: { status?: string; error?: string; [key: string]: unknown };
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

export interface KnowledgeDeleteResponse {
  deleted: boolean;
}

/** Delete a knowledge markdown file from disk. Returns { deleted: true } if the
 *  file existed and was removed, { deleted: false } if it didn't exist. */
export function deleteKnowledgeFile(targetFile: string): Promise<KnowledgeDeleteResponse> {
  return postJson<KnowledgeDeleteResponse>("/knowledge-delete", { target_file: targetFile });
}

/** Export a knowledge directory as a zip archive and trigger browser download. */
export async function exportKnowledgeDir(targetDir: string): Promise<void> {
  const url = buildYiAiUrl("/knowledge-export");
  const resp = await fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify({ target_dir: targetDir })
  });
  if (!resp.ok) {
    throw new Error(`Export failed: HTTP ${resp.status}`);
  }
  const blob = await resp.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = (targetDir.split("/").pop() || "export") + ".zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}

export interface KnowledgeIssueListItem {
  key: string;
  project_key: string;
  sequence_id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  issue_type: string;
  assignee: string;
  labels: string[];
  estimate_points: number | null;
  story_points: number | null;
  start_date: string;
  due_date: string;
  source: string;
  review_status: string;
  goal_id: string;
  kb_file_path: string;
  severity: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeIssuesResponse {
  list: KnowledgeIssueListItem[];
  total: number;
  pageNum: number;
  pageSize: number;
  totalPages: number;
}

export interface KnowledgeIssuesParams {
  project?: string;
  issue_type?: string;
  status?: string;
  priority?: string;
  search?: string;
  pageNum?: number;
  pageSize?: number;
}

/** List YiKnowledge project files as unified Issue records. */
export function getKnowledgeIssues(params: KnowledgeIssuesParams): Promise<KnowledgeIssuesResponse> {
  return postJson<KnowledgeIssuesResponse>("/knowledge-issues", params as Record<string, unknown>);
}

export interface KnowledgeIssuesStats {
  stats: {
    total: number;
    todo: number;
    in_progress: number;
    in_review: number;
    done: number;
    backlog: number;
    cancelled: number;
  };
  statusDist: Record<string, number>;
  priorityDist: Record<string, number>;
  typeDist: Record<string, number>;
  assigneeDist: Record<string, number>;
  createdByDay: Record<string, number>;
  completeness: Array<{
    key: string;
    label: string;
    filled: number;
    pct: number;
    missing: number;
  }>;
  attention: {
    overdue: number;
    unassigned: number;
    blocked: number;
  };
}

export interface KnowledgeIssuesStatsParams {
  project?: string;
  issue_type?: string;
  status?: string;
  priority?: string;
  search?: string;
}

/** Server-side pre-aggregated issue stats — avoids fetching all records. */
export function getKnowledgeIssueStats(params: KnowledgeIssuesStatsParams): Promise<KnowledgeIssuesStats> {
  return postJson<KnowledgeIssuesStats>("/knowledge-issues-stats", params as Record<string, unknown>);
}

export interface OrphanedIssue {
  key: string;
  title: string;
  kb_file_path: string;
  reason: "no_kb_file_path" | "file_not_found";
}

export interface OrphanedIssuesResponse {
  orphaned: OrphanedIssue[];
  count: number;
}

/** Detect issues in MongoDB without corresponding YiKnowledge files. */
export function getOrphanedIssues(): Promise<OrphanedIssuesResponse> {
  return postJson<OrphanedIssuesResponse>("/knowledge-orphaned-issues", {});
}

export interface KnowledgeProjectsStats {
  projects: Record<string, Record<string, number>>;
}

export interface KnowledgeProjectsStatsParams {
  project?: string;
}

/** Count .md files per project under YiKnowledge/projects/. */
export function getKnowledgeProjectsStats(params?: KnowledgeProjectsStatsParams): Promise<KnowledgeProjectsStats> {
  return postJson<KnowledgeProjectsStats>("/knowledge-projects-stats", (params ?? {}) as Record<string, unknown>);
}

export interface OrphanedCleanupResponse {
  deleted: number;
}

/** Delete orphaned issues from MongoDB. */
export function cleanupOrphanedIssues(): Promise<OrphanedCleanupResponse> {
  return postJson<OrphanedCleanupResponse>("/knowledge-cleanup-orphaned", {});
}
