/**
 * Issue/Task management API service.
 * Issues are stored in the YiAi `issues` collection via the data service RPC.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument } from "@/api/modules/dataService";
import { getKnowledgeIssues } from "@/api/modules/knowledgeService";

const COLLECTION = "issues";

export type IssueStatus = "backlog" | "todo" | "in_progress" | "in_review" | "done" | "cancelled";
export type IssuePriority = "urgent" | "high" | "medium" | "low" | "none";
export type IssueType = "bug" | "task" | "feature" | "improvement" | "requirement";
export type IssueSource = "customer" | "internal" | "market" | "compliance" | "other";
export type ReviewStatus = "pending" | "approved" | "rejected" | "in_review";

export const ISSUE_STATUS_MAP: Record<IssueStatus, string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
  cancelled: "Cancelled"
};

export const ISSUE_PRIORITY_MAP: Record<IssuePriority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "None"
};

export const ISSUE_TYPE_MAP: Record<IssueType, string> = {
  bug: "Bug",
  task: "Task",
  feature: "Feature",
  improvement: "Improvement",
  requirement: "Requirement"
};

export const ISSUE_SOURCE_MAP: Record<IssueSource, string> = {
  customer: "Customer",
  internal: "Internal",
  market: "Market",
  compliance: "Compliance",
  other: "Other"
};

export const REVIEW_STATUS_MAP: Record<ReviewStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  in_review: "In Review"
};

export type TagType = "success" | "warning" | "info" | "primary" | "danger";

export const ISSUE_STATUS_TAG_MAP: Record<IssueStatus, TagType> = {
  backlog: "info",
  todo: "info",
  in_progress: "primary",
  in_review: "warning",
  done: "success",
  cancelled: "danger"
};

export const ISSUE_TYPE_TAG_MAP: Record<IssueType, TagType> = {
  bug: "danger",
  task: "primary",
  feature: "success",
  improvement: "warning",
  requirement: "info"
};

export function issueStatusLabel(s: IssueStatus) {
  return ISSUE_STATUS_MAP[s] || s;
}
export function issueStatusTag(s: IssueStatus): TagType {
  return ISSUE_STATUS_TAG_MAP[s] || "info";
}
export function typeLabel(t: IssueType) {
  return ISSUE_TYPE_MAP[t] || t;
}
export function issueTypeTag(t: IssueType): TagType {
  return ISSUE_TYPE_TAG_MAP[t] || "info";
}

export interface Issue {
  key: string;
  project_key: string;
  sequence_id: number;
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  issue_type: IssueType;
  assignee?: string;
  labels: string[];
  parent_key?: string;
  start_date?: string;
  due_date?: string;
  end_date?: string;
  dependencies?: string[];
  story_points?: number;
  sprint_id?: string;
  custom_fields?: Record<string, any>;
  estimate_points?: number;
  time_estimate?: number;
  time_spent?: number;
  blocked_by?: string[];
  blocks?: string[];
  related?: string[];
  source?: IssueSource;
  acceptance_criteria?: string;
  review_status?: ReviewStatus;
  goal_id?: string;
  kb_file_path?: string;
  attachments?: Array<{ name: string; url: string; size: number; uploaded_at: string }>;
  created_at: string;
  updated_at: string;
}

export interface IssueQueryParams {
  pageNum?: number;
  pageSize?: number;
  project_key?: string;
  status?: string;
  priority?: string;
  issue_type?: string;
  exclude_issue_type?: string;
  assignee?: string;
  labels?: string;
  goal_id?: string;
  search?: string;
  orderBy?: string;
  orderType?: "asc" | "desc";
  updated_at_start?: string;
  updated_at_end?: string;
  due_date?: string;
  due_date_start?: string;
  due_date_end?: string;
}

export function getIssueList(
  params: IssueQueryParams,
  opts: { timeoutMs?: number; signal?: AbortSignal } = {}
) {
  const {
    pageNum = 1,
    pageSize = 20,
    project_key,
    status,
    priority,
    issue_type,
    search,
  } = params;

  return getKnowledgeIssues({
    project: project_key || undefined,
    issue_type: issue_type || undefined,
    status: status || undefined,
    priority: priority || undefined,
    search: search || undefined,
    pageNum,
    pageSize,
  }, opts).then((res) => ({
    data: {
      list: res.list,
      total: res.total,
      pageNum: res.pageNum,
      pageSize: res.pageSize,
      totalPages: res.totalPages,
    },
  }));
}

export function getIssue(key: string, opts: { timeout?: number; signal?: AbortSignal } = {}) {
  return queryDocuments<Issue>({
    cname: COLLECTION,
    filter: { key },
    pageSize: 1
  }, opts);
}

export function createIssue(data: Omit<Issue, "created_at" | "updated_at">, opts: { timeout?: number; signal?: AbortSignal } = {}) {
  return createDocument<Issue>(COLLECTION, {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }, opts);
}

export function updateIssue(key: string, data: Partial<Issue>, opts: { timeout?: number; signal?: AbortSignal } = {}) {
  return updateDocument<Issue>(COLLECTION, key, {
    ...data,
    updated_at: new Date().toISOString()
  }, opts);
}

export function deleteIssue(key: string, opts: { timeout?: number; signal?: AbortSignal } = {}) {
  return deleteDocument(COLLECTION, key, opts);
}

/**
 * Derive the knowledge-file path for an issue.
 * Prefers kb_file_path if stored, otherwise derives from key date + title.
 * The path is relative to the YiKnowledge root.
 */
export function getIssueFilePath(issue: {
  key: string;
  project_key: string;
  title: string;
  issue_type: IssueType;
  kb_file_path?: string;
  due_date?: string;
  start_date?: string;
  created_at?: string;
}): string {
  if (issue.kb_file_path) return issue.kb_file_path;

  const keyDate = issue.key.match(/(\d{4}-\d{2})/)?.[1];
  const date = keyDate || issue.due_date || issue.start_date || issue.created_at || new Date().toISOString();
  const yearMonth = date.slice(0, 7);

  if (issue.issue_type === "requirement") {
    return `projects/${issue.project_key}/requires/${yearMonth}/需求文档.md`;
  }

  const fileName = issue.title
    .replace(/[→+(),]/g, "")
    .replace(/[^a-zA-Z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `projects/${issue.project_key}/requires/${yearMonth}/${fileName}.md`;
}

/** Known status variants from external imports mapped to canonical lowercase. */
const STATUS_NORM: Record<string, string> = {
  Done: "done",
  Cancelled: "cancelled",
  Backlog: "backlog",
  "To Do": "todo",
  "In Progress": "in_progress",
  "In Review": "in_review",
  Review: "in_review",
};

function norm(s: string): string {
  if (!s) return "";
  return STATUS_NORM[s] || s.toLowerCase().replace(/\s+/g, "_");
}

/**
 * Normalize externally-imported issue fields to canonical lowercase values.
 *
 * Handles schema mismatches from external imports:
 *  - `type`→`issue_type` (field name difference)
 *  - `updatedTime`→`updated_at` / `createdAt`→`created_at` (date field naming)
 *  - Title Case status values (Done→done, In Progress→in_progress, etc.)
 *  - Missing priority defaults to "medium"
 */
export function normalizeIssue(raw: Record<string, unknown>): Issue {
  const status = typeof raw.status === "string" ? norm(raw.status) : (raw.status ?? "");

  // Imported issues use `type` for what the frontend calls `issue_type`.
  const rawType = raw.issue_type ?? raw.type;
  const issueType = typeof rawType === "string" ? norm(rawType) : "task";

  const rawPrio = raw.priority;
  const priority = typeof rawPrio === "string" && rawPrio
    ? norm(rawPrio)
    : "medium";

  const assignee = typeof raw.assignee === "string" ? raw.assignee : "";

  // Imported issues use camelCase date fields; map to snake_case expected by frontend.
  const updated_at = (raw.updated_at ?? raw.updatedTime ?? raw.updatedAt) || undefined;
  const created_at = (raw.created_at ?? raw.createdAt ?? raw.createdTime) || undefined;

  return { ...raw, status, priority, issue_type: issueType, assignee, updated_at, created_at } as unknown as Issue;
}
