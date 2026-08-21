/**
 * Issue/Task management API service.
 * Issues are stored in the YiAi `issues` collection via the data service RPC.
 */
import { queryDocuments, createDocument, updateDocument, deleteDocument } from "@/api/modules/dataService";

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

export function issueStatusLabel(s: IssueStatus) { return ISSUE_STATUS_MAP[s] || s; }
export function issueStatusTag(s: IssueStatus): TagType { return ISSUE_STATUS_TAG_MAP[s] || "info"; }
export function typeLabel(t: IssueType) { return ISSUE_TYPE_MAP[t] || t; }
export function issueTypeTag(t: IssueType): TagType { return ISSUE_TYPE_TAG_MAP[t] || "info"; }

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
  estimate_points?: number;
  time_estimate?: number;
  time_spent?: number;
  blocked_by?: string[];
  blocks?: string[];
  related?: string[];
  source?: IssueSource;
  acceptance_criteria?: string;
  review_status?: ReviewStatus;
  cycle_key?: string;
  release_key?: string;
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
  assignee?: string;
  search?: string;
  orderBy?: string;
  orderType?: "asc" | "desc";
}

export function getIssueList(params: IssueQueryParams) {
  const { pageNum = 1, pageSize = 20, project_key, status, priority, issue_type, assignee, search, orderBy = "updated_at", orderType = "desc" } = params;
  const filter: Record<string, any> = {};
  if (project_key) filter.project_key = project_key;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (issue_type) filter.issue_type = issue_type;
  if (assignee) filter.assignee = assignee;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }
  return queryDocuments<Issue>({
    cname: COLLECTION,
    filter,
    pageNum,
    pageSize,
    orderBy,
    orderType
  });
}

export function getIssue(key: string) {
  return queryDocuments<Issue>({
    cname: COLLECTION,
    filter: { key },
    pageSize: 1
  });
}

export function createIssue(data: Omit<Issue, "created_at" | "updated_at">) {
  return createDocument<Issue>(COLLECTION, {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

export function updateIssue(key: string, data: Partial<Issue>) {
  return updateDocument<Issue>(COLLECTION, key, {
    ...data,
    updated_at: new Date().toISOString()
  });
}

export function deleteIssue(key: string) {
  return deleteDocument(COLLECTION, key);
}