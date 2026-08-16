/**
 * Bug management — metadata in MongoDB (bugs collection), long-form body in
 * a markdown file under ~/YiKnowledge/engineer/learn/lessons/bugs/<key>.md.
 *
 * Split mirrors the RSS pattern (see YiAi's domain/rss/feed.py + domain/
 * knowledge/writer.py): the DB doc stays lean for cheap queries, while the
 * description / steps / expected / actual live on disk as structured markdown
 * so they're searchable by YiKnowledge's scanner and editable as files.
 *
 * Legacy bugs written before the 2026-08 restructure have contentPath under
 * "lessons/failures/bugs/..." (KB root) or "engineer/lessons/failures/bugs/...".
 * normalizeBugContentPath() transparently rewrites those to the current
 * "engineer/learn/lessons/bugs/..." on read/write/delete, so no one-time data
 * migration is needed.
 */
import { callService, queryDocuments, createDocument, updateDocument, deleteDocument } from "./dataService";
import { readKnowledgeFile } from "./knowledgeService";
import type { YiAiEnvelope, QueryDocumentsData } from "@/api/interface/yiweb";

const CNAME = "bugs";
const CONTENT_CATEGORY = "engineer/learn/lessons/bugs";

// Legacy bugs were written under lessons/failures/bugs/ at the YiKnowledge
// root, then under engineer/lessons/failures/bugs/ after the first migration.
// The current layout makes bugs a sibling of wins/failures/gotchas under
// engineer/learn/lessons/bugs/. Normalize any legacy contentPath stored in
// MongoDB so reads/writes/deletes all hit the current location without a
// one-time data migration.
function normalizeBugContentPath(p: string): string {
  if (!p) return p;
  const marker = "lessons/failures/bugs/";
  const i = p.indexOf(marker);
  if (i >= 0) return `engineer/learn/lessons/bugs/${p.slice(i + marker.length)}`;
  return p;
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
  project: string;
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
  /** Relative path under ~/YiKnowledge, e.g. "engineer/learn/lessons/bugs/bug_x.md". */
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
function buildFrontmatter(bug: BugDocument): Record<string, any> {
  return {
    title: bug.title,
    key: bug.key,
    tags: bug.tags,
    category: CONTENT_CATEGORY,
    created: new Date(bug.createdAt).toISOString().slice(0, 10),
    updated: new Date(bug.updatedAt).toISOString().slice(0, 10),
    source: "internal",
    type: "bug",
    status: bug.status,
    severity: bug.severity,
    priority: bug.priority,
    project: bug.project,
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

function contentPathFor(key: string): string {
  return `${CONTENT_CATEGORY}/${key}.md`;
}

/** Write the markdown body + frontmatter via the generic RPC executor
 *  (services.knowledge.knowledge_service.write_entry_markdown). The
 *  executor passes a single positional dict, so we must target a service-
 *  layer wrapper rather than the positional-arg domain function. */
async function writeBugContent(key: string, bug: BugDocument, content: BugContent): Promise<string> {
  const relPath = contentPathFor(key);
  const body = buildMarkdownBody(content);
  await callService("services.knowledge.knowledge_service", "write_entry_markdown", {
    rel_path: relPath,
    content: body,
    meta: buildFrontmatter(bug)
  });
  return relPath;
}

/** Read the markdown body and parse it back into structured content. */
export async function readBugContent(contentPath: string): Promise<BugContent> {
  try {
    const file = await readKnowledgeFile(normalizeBugContentPath(contentPath));
    return parseMarkdownBody(file.content || "");
  } catch {
    // File missing / unreadable — return empty content rather than throwing
    // so the detail page still renders the metadata.
    return { description: "", stepsToReproduce: [], expectedResult: "", actualResult: "" };
  }
}

/** Delete the markdown body file (best-effort). */
async function deleteBugContent(contentPath: string): Promise<void> {
  if (!contentPath) return;
  try {
    await callService("services.knowledge.knowledge_service", "delete_entry_markdown", {
      rel_path: normalizeBugContentPath(contentPath)
    });
  } catch {
    // best-effort — metadata delete should still succeed
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
    contentPath: contentPathFor(meta.key),
    resolvedAt: meta.status === "resolved" ? now : null,
    closedAt: meta.status === "closed" ? now : null
  } as any;
  // Write the markdown file first so the metadata's contentPath resolves
  // even on the very first read.
  const contentPath = await writeBugContent(meta.key, { ...(doc as any), createdAt: now, updatedAt: now } as BugDocument, content);
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
  // backend update_document reads the query key from `data.key` (not the
  // top-level `key` param), so the payload must include it.
  const payload: Partial<BugDocument> & { updatedAt: number; key: string } = {
    ...meta,
    key,
    updatedAt: now
  } as any;
  // Resolution workflow timestamps
  if (meta.status === "resolved" && !meta.resolvedAt) (payload as any).resolvedAt = now;
  if (meta.status === "closed" && !meta.closedAt) (payload as any).closedAt = now;
  if (meta.status === "reopened") {
    (payload as any).resolvedAt = null;
    (payload as any).closedAt = null;
  }
  // Rewrite the markdown to keep the YAML frontmatter in sync with MongoDB.
  // When only meta changed (no content), read the existing markdown body.
  {
    const current = await getBug(key);
    if (current) {
      const merged = { ...current, ...meta, updatedAt: now } as BugDocument;
      const body = content ?? await readBugContent(current.contentPath || contentPathFor(key));
      await writeBugContent(key, merged, body);
      payload.contentPath = current.contentPath || contentPathFor(key);
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
