/**
 * Bug management — metadata in MongoDB (bugs collection), long-form body in
 * a markdown file under YiKnowledge/projects/{project}/bugs/{date}/{type}/{key}.md.
 *
 * Split mirrors the RSS pattern (see YiAi's domain/rss/feed.py + domain/
 * knowledge/writer.py): the DB doc stays lean for cheap queries, while the
 * description / steps / expected / actual live on disk as structured markdown
 * so they're searchable by YiKnowledge's scanner and editable as files.
 */
import { callService, queryDocuments, createDocument, updateDocument, deleteDocument } from "./dataService";
import { readKnowledgeFile } from "./knowledgeService";
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

/** Read the markdown body and parse it back into structured content. */
export async function readBugContent(contentPath: string): Promise<BugContent> {
  try {
    const file = await readKnowledgeFile(contentPath);
    return parseMarkdownBody(file.content || "");
  } catch {
    return { description: "", stepsToReproduce: [], expectedResult: "", actualResult: "" };
  }
}

/** Delete the markdown body file (best-effort). */
async function deleteBugContent(contentPath: string): Promise<void> {
  if (!contentPath) return;
  try {
    await callService("services.knowledge.knowledge_service", "delete_entry_markdown", {
      rel_path: contentPath
    });
  } catch {
    // best-effort
  }
}

// ── API ──

export async function getBugList(
  params: BugListParams = {}
): Promise<YiAiEnvelope<QueryDocumentsData<BugDocument> & { pageNum: number; pageSize: number }>> {
  const filter: Record<string, any> = {};
  const search = params.search ?? params.title;
  if (search) {
    const rx = { $regex: search, $options: "i" };
    filter.$or = [{ title: rx }, { module: rx }];
  }
  if (params.project) filter.project = params.project;
  if (params.project_key) filter.project_key = params.project_key;
  if (params.issue_key) filter.issue_key = params.issue_key;
  if (params.module) filter.module = { $regex: params.module, $options: "i" };
  if (params.iteration) filter.iteration = { $regex: params.iteration, $options: "i" };
  if (params.severity) filter.severity = params.severity;
  if (params.priority) filter.priority = params.priority;
  if (params.status) filter.status = params.status;
  if (params.type) filter.type = params.type;
  if (params.assignee) filter.assignee = { $regex: params.assignee, $options: "i" };
  if (params.reporter) filter.reporter = { $regex: params.reporter, $options: "i" };
  if (params.createdAtStart !== undefined || params.createdAtEnd !== undefined) {
    const created: Record<string, number> = {};
    if (params.createdAtStart !== undefined) created.$gte = params.createdAtStart;
    if (params.createdAtEnd !== undefined) created.$lte = params.createdAtEnd;
    filter.createdAt = created;
  }

  const pageNum = params.pageNum ?? 1;
  const pageSize = params.pageSize ?? 10;

  const res = await queryDocuments<BugDocument>({
    cname: CNAME,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    pageNum,
    pageSize,
    orderBy: "updatedAt",
    orderType: "desc"
  });
  if (res.code !== 0) throw new Error(res.message || "Failed to load bugs");
  return {
    ...res,
    data: {
      ...(res.data as QueryDocumentsData<BugDocument>),
      pageNum,
      pageSize
    } as any
  };
}

export async function getBug(key: string): Promise<BugDocument | null> {
  const res = await queryDocuments<BugDocument>({ cname: CNAME, filter: { key }, limit: 1 });
  if (res.code !== 0) throw new Error(res.message || "Failed to load bug");
  return res.data?.list?.[0] ?? null;
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
      const body = content ?? await readBugContent(current.contentPath);
      const newPath = await writeBugContent(key, merged, body);
      payload.contentPath = newPath;
    }
  }
  return updateDocument(CNAME, key, payload as any);
}

export async function deleteBug(key: string): Promise<YiAiEnvelope> {
  // Fetch metadata first so we know which markdown file to remove
  const bug = await getBug(key);
  if (bug?.contentPath) await deleteBugContent(bug.contentPath);
  return deleteDocument(CNAME, key);
}
