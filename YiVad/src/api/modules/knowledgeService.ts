/**
 * Knowledge base service — wraps the YiAi knowledge endpoints.
 *
 * YiAi scans ``~/YiKnowledge`` (markdown + YAML frontmatter) and returns
 * metadata for the code review sidebar, plus story.md and bug.md content for
 * the detail drawers. All endpoints are direct REST (not the RPC envelope) to
 * mirror fileService.
 */
import { buildYiAiStreamUrl, buildYiAiUrl, yiAiAuthHeaders } from "@/config/yiAi";
import type {
  KnowledgeReadResponse,
  KnowledgeScanResponse,
  KnowledgeStoriesResponse,
  KnowledgeBugsResponse,
  KnowledgeBugReadResponse,
  KnowledgeFilesResponse,
  YiAiEnvelope
} from "@/api/interface/yiAi";

async function postJson<T>(
  path: string,
  body: Record<string, unknown>,
  opts: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<T> {
  const { timeoutMs = 30_000, signal } = opts;
  const url = buildYiAiUrl(path);
  const ctrl = new AbortController();
  let timer: ReturnType<typeof setTimeout> | null = null;
  let unsub: (() => void) | null = null;

  function cleanup() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (unsub) { unsub(); unsub = null; }
  }

  try {
    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        if (!ctrl.signal.aborted) ctrl.abort(new DOMException(`Timeout after ${timeoutMs}ms: ${path}`, "AbortError"));
      }, timeoutMs);
    }
    if (signal) {
      if (signal.aborted) {
        ctrl.abort(signal.reason);
      } else {
        const handler = () => { ctrl.abort(signal.reason); };
        signal.addEventListener("abort", handler, { once: true });
        unsub = () => signal.removeEventListener("abort", handler);
      }
    }
    const resp = await fetch(url, {
      method: "POST",
      headers: yiAiAuthHeaders(),
      body: JSON.stringify(body),
      signal: ctrl.signal
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
    cleanup();
  }
}

/** Read metadata from the DB mirror (no disk scan). Much faster than scanKnowledge
 *  when the watcher has populated the knowledge_files collection. */
export function listKnowledgeFiles(
  category?: string,
  opts: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<KnowledgeFilesResponse> {
  return postJson<KnowledgeFilesResponse>(
    "/knowledge-files",
    { category },
    { timeoutMs: 10_000, ...opts }
  );
}

export function scanKnowledge(
  category?: string,
  opts: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<KnowledgeScanResponse> {
  return postJson<KnowledgeScanResponse>(
    "/knowledge-scan",
    { category },
    { timeoutMs: 15_000, ...opts }
  );
}

export function readKnowledgeFile(
  targetFile: string,
  opts: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<KnowledgeReadResponse> {
  return postJson<KnowledgeReadResponse>(
    "/knowledge-read",
    { target_file: targetFile },
    { timeoutMs: 10_000, ...opts }
  );
}

export function listKnowledgeStories(
  project?: string,
  opts: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<KnowledgeStoriesResponse> {
  return postJson<KnowledgeStoriesResponse>(
    "/knowledge-stories",
    { project },
    { timeoutMs: 10_000, ...opts }
  );
}

export function readKnowledgeStory(
  project: string,
  storyName: string,
  opts: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<KnowledgeReadResponse> {
  return postJson<KnowledgeReadResponse>(
    "/knowledge-story-read",
    { project, story_name: storyName },
    { timeoutMs: 10_000, ...opts }
  );
}

export function listKnowledgeBugs(
  project?: string,
  opts: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<KnowledgeBugsResponse> {
  return postJson<KnowledgeBugsResponse>(
    "/knowledge-bugs",
    { project },
    { timeoutMs: 10_000, ...opts }
  );
}

export function readKnowledgeBug(
  contentPath: string,
  opts: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<KnowledgeBugReadResponse> {
  return postJson<KnowledgeBugReadResponse>(
    "/knowledge-bug-read",
    { content_path: contentPath },
    { timeoutMs: 10_000, ...opts }
  );
}

export interface KnowledgeSyncResponse {
  synced: number;
  deleted: number;
  rag?: { status?: string; error?: string; [key: string]: unknown };
}

export function syncKnowledge(
  opts: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<KnowledgeSyncResponse> {
  const startedAt = Date.now();
  const { timeoutMs = 60_000, signal } = opts;
  const url = buildYiAiStreamUrl("/knowledge-sync");
  const ctrl = new AbortController();
  let timer: ReturnType<typeof setTimeout> | null = null;
  let unsub: (() => void) | null = null;
  const cleanup = () => {
    if (timer) { clearTimeout(timer); timer = null; }
    if (unsub) { unsub(); unsub = null; }
  };
  if (timeoutMs > 0) {
    timer = setTimeout(() => {
      if (!ctrl.signal.aborted) ctrl.abort(new DOMException(`Timeout after ${timeoutMs}ms: /knowledge-sync`, "AbortError"));
    }, timeoutMs);
  }
  if (signal) {
    if (signal.aborted) {
      ctrl.abort(signal.reason);
    } else {
      const handler = () => { ctrl.abort(signal.reason); };
      signal.addEventListener("abort", handler, { once: true });
      unsub = () => signal.removeEventListener("abort", handler);
    }
  }
  return fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify({}),
    signal: ctrl.signal
  })
    .then(async (resp) => {
      if (!resp.ok) {
        throw new Error(`Knowledge request failed: /knowledge-sync HTTP ${resp.status}`);
      }
      const data = (await resp.json()) as YiAiEnvelope<KnowledgeSyncResponse>;
      if (data.code !== 0) {
        throw new Error(data.message || "Knowledge request failed: /knowledge-sync");
      }
      return data.data;
    })
    .then((result) => {
      return result;
    })
    .catch((error: unknown) => {
      throw error;
    })
    .finally(() => {
      cleanup();
    });
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
export function getKnowledgeIssues(
  params: KnowledgeIssuesParams,
  opts: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<KnowledgeIssuesResponse> {
  return postJson<KnowledgeIssuesResponse>(
    "/knowledge-issues",
    params as Record<string, unknown>,
    { timeoutMs: 12_000, ...opts }
  );
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

export function getKnowledgeIssueStats(
  params: KnowledgeIssuesStatsParams,
  opts: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<KnowledgeIssuesStats> {
  return postJson<KnowledgeIssuesStats>(
    "/knowledge-issues-stats",
    params as Record<string, unknown>,
    { timeoutMs: 10_000, ...opts }
  );
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

export function getOrphanedIssues(
  opts: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<OrphanedIssuesResponse> {
  return postJson<OrphanedIssuesResponse>(
    "/knowledge-orphaned-issues",
    {},
    { timeoutMs: 10_000, ...opts }
  );
}

export interface KnowledgeProjectsStats {
  projects: Record<string, Record<string, number>>;
}

export interface KnowledgeProjectsStatsParams {
  project?: string;
}

export function getKnowledgeProjectsStats(
  params?: KnowledgeProjectsStatsParams,
  opts: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<KnowledgeProjectsStats> {
  return postJson<KnowledgeProjectsStats>(
    "/knowledge-projects-stats",
    (params ?? {}) as Record<string, unknown>,
    { timeoutMs: 10_000, ...opts }
  );
}

export interface OrphanedCleanupResponse {
  deleted: number;
}

export function cleanupOrphanedIssues(
  opts: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<OrphanedCleanupResponse> {
  return postJson<OrphanedCleanupResponse>(
    "/knowledge-cleanup-orphaned",
    {},
    { timeoutMs: 15_000, ...opts }
  );
}
