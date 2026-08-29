/**
 * Issue change history API.
 * Stored in YiAi `issue_history` collection.
 */
import { queryDocuments, createDocument } from "@/api/modules/dataService";

const COLLECTION = "issue_history";

export interface IssueChange {
  key: string;
  issue_key: string;
  field: string;
  from: string;
  to: string;
  changed_by: string;
  changed_at: string;
}

export function getIssueHistory(issue_key: string) {
  return queryDocuments<IssueChange>({
    cname: COLLECTION,
    filter: { issue_key },
    pageSize: 200,
    orderBy: "changed_at",
    orderType: "desc"
  });
}

export function recordChange(data: Omit<IssueChange, "key">) {
  return createDocument<IssueChange>(COLLECTION, {
    key: `HIST-${Date.now().toString(36).toUpperCase()}`,
    ...data
  });
}

export function fieldLabel(field: string): string {
  const labels: Record<string, string> = {
    title: "Title", status: "Status", priority: "Priority",
    issue_type: "Type", assignee: "Assignee", description: "Description",
    due_date: "Due Date", estimate_points: "Estimate", time_estimate: "Time Estimate"
  };
  return labels[field] || field;
}