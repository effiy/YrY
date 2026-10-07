/**
 * Frontend status constants — mirrors YiAi shared/status.py.
 *
 * Single source of truth for status values used in MongoDB queries.
 * Includes normalize_status_list() for legacy mixed-case compatibility.
 */
export const Status = {
  DONE: "done",
  IN_PROGRESS: "in_progress",
  TODO: "todo",
  BACKLOG: "backlog",
  IN_REVIEW: "in_review",
  CANCELLED: "cancelled",
  BLOCKED: "blocked",
  OPEN: "open",
  REOPENED: "reopened",
  RESOLVED: "resolved",
  CLOSED: "closed",
  REJECTED: "rejected",
  // Display-only (not used in DB queries):
  PLANNED: "planned",
} as const;

const LEGACY_VARIANTS: Record<string, string> = {
  Done: Status.DONE,
  "In Progress": Status.IN_PROGRESS,
  "To Do": Status.TODO,
  Backlog: Status.BACKLOG,
  Review: Status.IN_REVIEW,
  Cancelled: Status.CANCELLED,
  Blocked: Status.BLOCKED,
  Closed: Status.CLOSED,
  Resolved: Status.RESOLVED,
  Open: Status.OPEN,
  Reopened: Status.REOPENED,
  Completed: Status.DONE,
  completed: Status.DONE,
  Rejected: Status.REJECTED,
};

export function normalizeStatus(status: string): string {
  return LEGACY_VARIANTS[status] || status.toLowerCase();
}

/** Return array suitable for MongoDB $in queries covering both canonical and legacy variants. */
export function normalizeStatusList(statuses: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const s of statuses) {
    const canonical = normalizeStatus(s);
    if (!seen.has(canonical)) { seen.add(canonical); result.push(canonical); }
    for (const [legacy, canon] of Object.entries(LEGACY_VARIANTS)) {
      if (canon === canonical && !seen.has(legacy)) {
        seen.add(legacy); result.push(legacy);
      }
    }
  }
  return result;
}

// Pre-computed status groups (matches YiAi shared/status.py)
export const CLOSED_STATUSES = [Status.DONE, Status.CLOSED, Status.RESOLVED, Status.CANCELLED] as const;
export const ACTIVE_STATUSES = [Status.TODO, Status.IN_PROGRESS, Status.IN_REVIEW] as const;
export const NOT_DONE = [...CLOSED_STATUSES, Status.BACKLOG] as const;
export const DONE = [Status.DONE] as const;
export const OPEN_BUGS = [Status.OPEN, Status.REOPENED] as const;

// Pre-computed normalized lists for $in queries
export const DONE_QUERY = normalizeStatusList(DONE);
export const NOT_DONE_QUERY = normalizeStatusList(NOT_DONE);
export const ACTIVE_QUERY = normalizeStatusList(ACTIVE_STATUSES);
export const OPEN_BUGS_QUERY = normalizeStatusList(OPEN_BUGS);