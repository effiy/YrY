/** Severity levels for bug reports */
export enum BugSeverity {
  Critical = "critical",
  Major = "major",
  Minor = "minor",
  Trivial = "trivial"
}

/** Bug priority */
export enum BugPriority {
  Urgent = "urgent",
  High = "high",
  Medium = "medium",
  Low = "low"
}

/** Bug status */
export enum BugStatus {
  Open = "open",
  InProgress = "in_progress",
  Resolved = "resolved",
  Closed = "closed",
  Reopened = "reopened"
}

/** Environment modes */
export enum EnvMode {
  Development = "development",
  Staging = "staging",
  Production = "production"
}

/** Chat sidebar views */
export enum SidebarView {
  Sessions = "sessions",
  Knowledge = "knowledge",
  Stories = "stories",
  Bugs = "bugs"
}