/**
 * Bug management — the **source of truth** is now the YiKnowledge markdown tree
 * at ``projects/{project}/bugs/{date}/{type}/{key}.md``.
 *
 * - Listing (``getBugList``) and single-document reads (``getBug``) pull from
 *   disk via the knowledge REST endpoints. Frontmatter provides every field
 *   previously stored in the MongoDB ``bugs`` collection, so callers see the
 *   same ``BugDocument`` shape.
 * - Create / Update / Delete still **dual-write** to MongoDB for backwards
 *   compatibility with the search indexer and other consumers that directly
 *   query the ``bugs`` collection. The markdown file is always written first,
 *   and its relative ``contentPath`` is copied onto the MongoDB doc.
 *
 * This mirrors the RSS pattern (see YiAi's ``domain/rss/feed.py`` +
 * ``domain/knowledge/writer.py``): the DB doc stays lean for cheap queries,
 * while the long-form body lives on disk as structured markdown so it's
 * searchable by YiKnowledge's scanner and editable as files.
 *
 * Legacy migration note: bugs that only exist in MongoDB (no markdown file)
 * are transparently surfaced by the ``getBugList`` fallback branch so the
 * transition is zero-downtime.
 */
import { callService, queryDocuments, createDocument, updateDocument, deleteDocument } from "./dataService";
import { readKnowledgeFile, listKnowledgeBugs, readKnowledgeBug } from "./knowledgeService";
import type { YiAiEnvelope, QueryDocumentsData } from "@/api/interface/yiweb";

const CNAME = "bugs";

/** Map BugType enum values to the directory names used in the project bugs tree. */
const BUG_TYPE_DIR: Record<string, string> = {
  functional: "logic",
  performance: "performance",
  ui: "style",
  security: "security",
  compatibility: "compatibility",
  regression: "regression",
  data: "data",
  other: "other"
};

/** Build the content path for a bug under YiKnowledge/projects/{project}/bugs/{date}/{type}/{key}.md */
function contentPathFor(projectKey: string, date: string, type: string, key: string): string {
  const typeDir = BUG_TYPE_DIR[type] || "other";
  return `projects/${projectKey}/bugs/${date}/${typeDir}/${key}.md`;
}

/** Normalize a bug's contentPath to the canonical ``projects/{project_key}/bugs/...`` layout.
 *
 * Legacy MongoDB documents written before the disk-as-truth migration stored paths
 * without the ``projects/<project_key>/`` prefix. Reading those raw strings through
 * :func:`readKnowledgeFile` would look for a file under a non-existent ``YiKnowledge/bugs/``
 * subtree and fail with DATA_NOT_FOUND. Here we reconstruct the correct path using
 * the bug's own ``project_key`` / ``type`` / ``createdAt`` fields so the read
 * transparently succeeds even when the DB doc carries the legacy shape.
 */
function normalizeContentPath(bug: Partial<BugDocument> & Pick<BugDocument, "key">, raw: string): string {
  const p = String(raw || "").trim();
  if (!p) return p;
  if (p.startsWith("projects/")) return p;
  const projectKey = (bug.project_key || "unknown").toLowerCase();
  const type = (bug.type || "other") as string;
  const date = new Date((bug as BugDocument).createdAt || Date.now()).toISOString().slice(0, 10);
  if (p.startsWith("bugs/")) {
    // legacy: bugs/{date}/{typeDir}/{key}.md
    const tail = p.slice("bugs/".length);
    return `projects/${projectKey}/bugs/${tail}`;
  }
  return contentPathFor(projectKey, date, type, bug.key || String(raw));
}

// ── Types ──

export type BugSeverity = "critical" | "major" | "minor" | "trivial";
export type BugPriority = "p0" | "p1" | "p2" | "p3";
export type BugStatus = "open" | "in_progress" | "resolved" | "closed" | "rejected" | "reopened";
export type BugType =
  | "functional"
  | "performance"
  | "ui"
  | "security"
  | "compatibility"
  | "regression"
  | "data"
  | "other";
export type BugFrequency = "always" | "sometimes" | "rarely" | "once" | "unable";

import type { IssuePriority, IssueStatus, IssueType, TagType } from "@/api/modules/issueService";

export const BUG_STATUS_MAP: Record<BugStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
  rejected: "Rejected",
  reopened: "Reopened"
};

export const BUG_SEVERITY_MAP: Record<BugSeverity, string> = {
  critical: "Critical",
  major: "Major",
  minor: "Minor",
  trivial: "Trivial"
};

export const BUG_PRIORITY_MAP: Record<BugPriority, string> = {
  p0: "P0",
  p1: "P1",
  p2: "P2",
  p3: "P3"
};

export const BUG_TYPE_MAP: Record<BugType, string> = {
  functional: "Functional",
  performance: "Performance",
  ui: "UI",
  security: "Security",
  compatibility: "Compatibility",
  regression: "Regression",
  data: "Data",
  other: "Other"
};

export const BUG_STATUS_TO_ISSUE_STATUS: Record<BugStatus, IssueStatus> = {
  open: "todo",
  in_progress: "in_progress",
  resolved: "in_review",
  closed: "done",
  rejected: "cancelled",
  reopened: "todo"
};

export const ISSUE_STATUS_TO_BUG_STATUS: Partial<Record<IssueStatus, BugStatus>> = {
  backlog: "open",
  todo: "open",
  in_progress: "in_progress",
  in_review: "resolved",
  done: "closed",
  cancelled: "rejected"
};

export const BUG_PRIORITY_TO_ISSUE_PRIORITY: Record<BugPriority, IssuePriority> = {
  p0: "urgent",
  p1: "high",
  p2: "medium",
  p3: "low"
};

export const ISSUE_PRIORITY_TO_BUG_PRIORITY: Record<IssuePriority, BugPriority> = {
  urgent: "p0",
  high: "p1",
  medium: "p2",
  low: "p3",
  none: "p3"
};

export const BUG_SEVERITY_TAG_MAP: Record<BugSeverity, TagType> = {
  critical: "danger",
  major: "warning",
  minor: "info",
  trivial: "info"
};

export const BUG_TYPE_TAG_MAP: Record<BugType, TagType> = {
  functional: "danger",
  performance: "warning",
  ui: "primary",
  security: "danger",
  compatibility: "warning",
  regression: "warning",
  data: "info",
  other: "info"
};

export const BUG_STATUS_TAG_MAP: Record<BugStatus, TagType> = {
  open: "primary",
  in_progress: "warning",
  resolved: "success",
  closed: "info",
  rejected: "danger",
  reopened: "warning"
};

/**
 * Metadata — persisted in MongoDB `bugs` collection. Long-form fields
 * (description, stepsToReproduce, expectedResult, actualResult, causeProblem,
 * solution) live in the markdown body at `contentPath`.
 *
 * `iteration`, `defectUrl`, `causeProblem`, `solution` mirror the agile
 * platform's defect shape so bugs synced from /bug-fix round-
 * trip without field loss.
 */
export interface BugDocument {
  key: string;
  // Identification
  title: string;
  /** Free-text project name — legacy field, kept for bugs synced without a key. */
  project: string;
  /** Project key (foreign key to the `projects` collection). Added to join the
   *  bug → project closed loop; legacy bugs may only carry `project`. */
  project_key?: string;
  /** Issue key (foreign key to the `issues` collection). The issue this bug is
   *  reported against / fixed by — completes the bug → issue → project loop.
   *  Optional; legacy bugs may not carry it. */
  issue_key?: string;
  module: string;
  // Iteration / defect link — sourced from agile platform when synced
  iteration?: string;
  defectUrl?: string;
  // Classification
  severity: BugSeverity;
  priority: BugPriority;
  status: BugStatus;
  type: BugType;
  frequency: BugFrequency;
  // Ownership
  assignee: string;
  reporter: string;
  // Environment & version tracking
  environment: string;
  affectedVersion: string;
  fixedVersion: string;
  // Metadata
  tags: string[];
  dueDate: number | null;
  /** Loaded from markdown content at display time. */
  description?: string;
  /** Relative path under YiKnowledge, e.g. "projects/yivad/bugs/2026-08-21/logic/bug_x.md". */
  contentPath: string;
  // Lifecycle timestamps
  createdAt: number;
  updatedAt: number;
  resolvedAt: number | null;
  closedAt: number | null;
}

/** Long-form body — persisted in the markdown file, parsed back by section. */
export interface BugContent {
  description: string;
  stepsToReproduce: string[];
  expectedResult: string;
  actualResult: string;
  // Resolution closure — filled when status moves to resolved / rejected /
  // reopened. causeProblem is the technical root cause; solution is the
  // change applied. Mirrors the agile platform `edit-defect` payload.
  causeProblem?: string;
  solution?: string;
}

export interface BugListParams {
  search?: string;
  title?: string;
  project?: string;
  project_key?: string;
  issue_key?: string;
  module?: string;
  iteration?: string;
  severity?: BugSeverity;
  priority?: BugPriority;
  status?: BugStatus;
  type?: BugType;
  assignee?: string;
  reporter?: string;
  createdAtStart?: number;
  createdAtEnd?: number;
  pageNum?: number;
  pageSize?: number;
}

// ── Markdown (de)serialization ──

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Build the YAML frontmatter dict for the markdown file. */
function buildFrontmatter(bug: BugDocument, contentPath: string): Record<string, any> {
  const date = new Date(bug.createdAt).toISOString().slice(0, 10);
  return {
    title: bug.title,
    key: bug.key,
    tags: bug.tags,
    category: contentPath.replace(/\.md$/, ""),
    created: date,
    updated: new Date(bug.updatedAt).toISOString().slice(0, 10),
    source: "internal",
    type: "bug",
    status: bug.status,
    severity: bug.severity,
    priority: bug.priority,
    project: bug.project,
    project_key: bug.project_key ?? "",
    issue_key: bug.issue_key ?? "",
    module: bug.module,
    iteration: bug.iteration ?? "",
    defectUrl: bug.defectUrl ?? "",
    assignee: bug.assignee,
    reporter: bug.reporter,
    environment: bug.environment,
    affectedVersion: bug.affectedVersion,
    fixedVersion: bug.fixedVersion,
    frequency: bug.frequency
  };
}

/** Build the markdown body (everything after the frontmatter). */
function buildMarkdownBody(content: BugContent): string {
  const steps = content.stepsToReproduce.length
    ? content.stepsToReproduce.map((s, i) => `${i + 1}. ${s}`).join("\n")
    : "_No steps recorded._";
  const cause = content.causeProblem?.trim() || "_Root cause not yet recorded._";
  const solution = content.solution?.trim() || "_Solution not yet recorded._";
  return [
    "## Description",
    content.description?.trim() || "_No description provided._",
    "",
    "## Steps to Reproduce",
    steps,
    "",
    "## Expected Result",
    content.expectedResult?.trim() || "_Not specified._",
    "",
    "## Actual Result",
    content.actualResult?.trim() || "_Not specified._",
    "",
    "## Cause",
    cause,
    "",
    "## Solution",
    solution,
    ""
  ].join("\n");
}

/** Placeholder strings `buildMarkdownBody` writes when a section is empty.
 *  Stripped on parse-back so the drawer doesn't re-open with placeholder text
 *  in its input fields (which would then be saved as the actual content). */
const PLACEHOLDERS = new Set([
  "_No description provided._",
  "_No steps recorded._",
  "_Not specified._",
  "_Root cause not yet recorded._",
  "_Solution not yet recorded._"
]);

function stripPlaceholder(s: string): string {
  return PLACEHOLDERS.has(s.trim()) ? "" : s;
}

/** Parse the markdown body back into structured content by splitting on
 *  `## ` section headers. A line-based split avoids the regex `m`-flag trap
 *  where `$` matches end-of-line and truncates multi-line descriptions. */
function parseMarkdownBody(body: string): BugContent {
  const sections: Record<string, string> = {};
  const lines = body.split("\n");
  let current: string | null = null;
  const buf: string[] = [];
  for (const line of lines) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) {
      if (current) sections[current] = buf.join("\n").trim();
      current = m[1].trim();
      buf.length = 0;
    } else if (current) {
      buf.push(line);
    }
  }
  if (current) sections[current] = buf.join("\n").trim();
  return {
    description: stripPlaceholder(sections["Description"] || ""),
    stepsToReproduce: (sections["Steps to Reproduce"] || "")
      .split("\n")
      .map(l => l.replace(/^\s*\d+\.\s*/, "").trim())
      .filter(Boolean),
    expectedResult: stripPlaceholder(sections["Expected Result"] || ""),
    actualResult: stripPlaceholder(sections["Actual Result"] || ""),
    causeProblem: stripPlaceholder(sections["Cause"] || ""),
    solution: stripPlaceholder(sections["Solution"] || "")
  };
}

// ── Content file I/O (writes go via generic RPC; reads via /knowledge-read) ──

/** Write the markdown body + frontmatter under projects/{project}/bugs/{date}/{type}/{key}.md */
async function writeBugContent(key: string, bug: BugDocument, content: BugContent): Promise<string> {
  const date = new Date(bug.createdAt).toISOString().slice(0, 10);
  const projectKey = bug.project_key || "unknown";
  const relPath = contentPathFor(projectKey, date, bug.type, key);
  const body = buildMarkdownBody(content);
  await callService("services.knowledge.knowledge_service", "write_entry_markdown", {
    rel_path: relPath,
    content: body,
    meta: buildFrontmatter(bug, relPath)
  });
  return relPath;
}

/** Read the markdown body and parse it back into structured content.
 *
 * Accepts either the raw bug document (preferred — used to normalize legacy
 * contentPath that lacks the ``projects/<project_key>/`` prefix) or a plain
 * content-path string (for backwards compatibility with callers that haven't
 * been updated to pass the full doc yet).
 */
export async function readBugContent(input: BugDocument | string): Promise<BugContent> {
  let cp: string;
  if (typeof input === "string") {
    cp = input;
    if (cp && !cp.startsWith("projects/")) {
      // Best-effort guess when no bug-context is available. Legacy path lives
      // under yivad by default because that project was the first to seed bugs.
      cp = cp.startsWith("bugs/") ? `projects/yivad/${cp}` : contentPathFor("yivad", new Date().toISOString().slice(0, 10), "other", cp);
    }
  } else {
    cp = normalizeContentPath(input, input.contentPath || "");
  }
  try {
    const file = await readKnowledgeFile(cp);
    return parseMarkdownBody(file.content || "");
  } catch {
    return { description: "", stepsToReproduce: [], expectedResult: "", actualResult: "" };
  }
}

/** Delete the markdown body file (best-effort). */
async function deleteBugContent(bugOrPath: BugDocument | { key: string; contentPath?: string; project_key?: string; type?: BugType; createdAt?: number } | string): Promise<void> {
  let cp: string;
  if (typeof bugOrPath === "string") {
    cp = bugOrPath;
    if (cp && !cp.startsWith("projects/")) {
      cp = cp.startsWith("bugs/") ? `projects/yivad/${cp}` : cp;
    }
  } else {
    cp = normalizeContentPath(bugOrPath as BugDocument, bugOrPath.contentPath || "");
  }
  if (!cp) return;
  try {
    await callService("services.knowledge.knowledge_service", "delete_entry_markdown", {
      rel_path: cp
    });
  } catch {
    // best-effort
  }
}

// ── API ──

/** In-memory filter over a disk-sourced bug list — mirrors the MongoDB filters
 *  previously applied on the YiAi side. Keeps the ProTable + sidebar filters
 *  working without changing the view/store layer. */
function applyBugFilters(list: BugDocument[], params: BugListParams): BugDocument[] {
  const search = (params.search ?? params.title ?? "").toString().trim().toLowerCase();
  return list.filter(b => {
    if (search) {
      const haystack = `${b.title ?? ""} ${b.module ?? ""}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (params.project && b.project !== params.project) return false;
    if (params.project_key && b.project_key !== params.project_key) return false;
    if (params.issue_key && b.issue_key !== params.issue_key) return false;
    if (params.module && !(b.module || "").toLowerCase().includes(params.module.toLowerCase())) return false;
    if (params.iteration && !(b.iteration || "").toLowerCase().includes(params.iteration.toLowerCase())) return false;
    if (params.severity && b.severity !== params.severity) return false;
    if (params.priority && b.priority !== params.priority) return false;
    if (params.status && b.status !== params.status) return false;
    if (params.type && b.type !== params.type) return false;
    if (params.assignee && !(b.assignee || "").toLowerCase().includes(params.assignee.toLowerCase())) return false;
    if (params.reporter && !(b.reporter || "").toLowerCase().includes(params.reporter.toLowerCase())) return false;
    if ((params as any).stale !== undefined) {
      const cutoff = Date.now() - ((params as any).stale as number) * 86400000;
      if (!b.updatedAt || b.updatedAt >= cutoff) return false;
      if (b.status === "closed" || b.status === "resolved") return false;
    }
    if (params.createdAtStart !== undefined || params.createdAtEnd !== undefined) {
      const c = b.createdAt ?? 0;
      if (params.createdAtStart !== undefined && c < params.createdAtStart) return false;
      if (params.createdAtEnd !== undefined && c > params.createdAtEnd) return false;
    }
    return true;
  });
}

export async function getBugList(
  params: BugListParams = {}
): Promise<YiAiEnvelope<QueryDocumentsData<BugDocument> & { pageNum: number; pageSize: number }>> {
  const pageNum = params.pageNum ?? 1;
  const pageSize = params.pageSize ?? 10;

  // 1) Primary path: scan disk markdown files via the /knowledge-bugs endpoint
  let diskList: BugDocument[] = [];
  try {
    const diskRes = await listKnowledgeBugs(params.project_key || undefined);
    diskList = ((diskRes?.bugs as unknown as BugDocument[]) || []).slice();
  } catch (e) {
    // Best-effort — fall back silently to MongoDB below
  }

  // 2) MongoDB fallback — keeps legacy bugs visible until they're migrated to
  //    the disk tree, and acts as a safety net if the disk scanner errors.
  let mongoList: BugDocument[] = [];
  try {
    const mongoFilter: Record<string, any> = {};
    const search = params.search ?? params.title;
    if (search) {
      const rx = { $regex: search, $options: "i" };
      mongoFilter.$or = [{ title: rx }, { module: rx }];
    }
    if (params.project) mongoFilter.project = params.project;
    if (params.project_key) mongoFilter.project_key = params.project_key;
    if (params.issue_key) mongoFilter.issue_key = params.issue_key;
    if (params.module) mongoFilter.module = { $regex: params.module, $options: "i" };
    if (params.iteration) mongoFilter.iteration = { $regex: params.iteration, $options: "i" };
    if (params.severity) mongoFilter.severity = params.severity;
    if (params.priority) mongoFilter.priority = params.priority;
    if (params.status) mongoFilter.status = params.status;
    if (params.type) mongoFilter.type = params.type;
    if (params.assignee) mongoFilter.assignee = { $regex: params.assignee, $options: "i" };
    if (params.reporter) mongoFilter.reporter = { $regex: params.reporter, $options: "i" };
    if (params.createdAtStart !== undefined || params.createdAtEnd !== undefined) {
      const created: Record<string, number> = {};
      if (params.createdAtStart !== undefined) created.$gte = params.createdAtStart;
      if (params.createdAtEnd !== undefined) created.$lte = params.createdAtEnd;
      mongoFilter.createdAt = created;
    }
    const mongoRes = await queryDocuments<BugDocument>({
      cname: CNAME,
      filter: Object.keys(mongoFilter).length > 0 ? mongoFilter : undefined,
      pageNum: 1,
      pageSize: 10000,
      orderBy: "updatedAt",
      orderType: "desc"
    });
    if (mongoRes.code === 0) mongoList = (mongoRes.data?.list ?? []) as BugDocument[];
  } catch { /* use disk only */ }

  // 3) Merge — disk wins on conflict (key-deduplicated). Mongo legacy docs have
  //    their contentPath normalized first so the rest of the pipeline can pass
  //    the doc to readBugContent() without DATA_NOT_FOUND errors.
  const byKey = new Map<string, BugDocument>();
  for (const b of mongoList) {
    const fixed: BugDocument = {
      ...b,
      contentPath: normalizeContentPath(b, b.contentPath || "")
    };
    byKey.set(b.key, fixed);
  }
  for (const b of diskList) byKey.set(b.key, b);
  const merged = Array.from(byKey.values());
  merged.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));

  // 4) Apply the rest of the filters + slice the current page. The disk list
  //    is already filtered by project above; the rest is universal.
  const filtered = applyBugFilters(merged, params);
  const total = filtered.length;
  const start = Math.max(0, (pageNum - 1) * pageSize);
  const page = filtered.slice(start, start + pageSize);

  return {
    code: 0,
    message: "",
    data: {
      list: page,
      total,
      pageNum,
      pageSize
    } as any
  };
}

export async function getBug(key: string): Promise<BugDocument | null> {
  // Try disk first — scan all bugs to find the key (the contentPath alone isn't
  // derivable from the bug key alone; the scanner walks it for us).
  try {
    const all = await listKnowledgeBugs();
    const match = (all?.bugs as unknown as BugDocument[] ?? []).find(b => b.key === key);
    if (match) return match;
  } catch { /* fall through */ }
  const res = await queryDocuments<BugDocument>({ cname: CNAME, filter: { key }, limit: 1 });
  if (res.code !== 0) throw new Error(res.message || "Failed to load bug");
  const doc = res.data?.list?.[0] ?? null;
  if (doc) doc.contentPath = normalizeContentPath(doc, doc.contentPath || "");
  return doc;
}

export async function createBug(
  meta: Omit<BugDocument, "contentPath" | "createdAt" | "updatedAt" | "resolvedAt" | "closedAt">,
  content: BugContent
): Promise<{ envelope: YiAiEnvelope; contentPath: string }> {
  const now = Date.now();
  const doc: Omit<BugDocument, "createdAt" | "updatedAt"> = {
    ...meta,
    contentPath: "", // patched below after write
    resolvedAt: meta.status === "resolved" ? now : null,
    closedAt: meta.status === "closed" ? now : null
  } as any;
  const bug = { ...(doc as any), createdAt: now, updatedAt: now } as BugDocument;
  const contentPath = await writeBugContent(meta.key, bug, content);
  const envelope = await createDocument(CNAME, {
    ...doc,
    contentPath,
    createdAt: now,
    updatedAt: now
  });
  return { envelope, contentPath };
}

export async function updateBug(
  key: string,
  meta: Partial<BugDocument>,
  content?: BugContent
): Promise<YiAiEnvelope> {
  const now = Date.now();
  const payload: Partial<BugDocument> & { updatedAt: number; key: string } = {
    ...meta,
    key,
    updatedAt: now
  } as any;
  if (meta.status === "resolved" && !meta.resolvedAt) (payload as any).resolvedAt = now;
  if (meta.status === "closed" && !meta.closedAt) (payload as any).closedAt = now;
  if (meta.status === "reopened") {
    (payload as any).resolvedAt = null;
    (payload as any).closedAt = null;
  }
  {
    const current = await getBug(key);
    if (current) {
      const merged = { ...current, ...meta, updatedAt: now } as BugDocument;
      const body = content ?? await readBugContent(current);
      const newPath = await writeBugContent(key, merged, body);
      payload.contentPath = newPath;
    }
  }
  return updateDocument(CNAME, key, payload as any);
}

export async function deleteBug(key: string): Promise<YiAiEnvelope> {
  try {
    const bug = await getBug(key);
    if (bug) await deleteBugContent(bug);
  } catch {
    // best-effort: backend delete_document also cleans up the markdown file
    // via the double-write logic, so a failure here must not abort the DB delete.
  }
  return deleteDocument(CNAME, key);
}
