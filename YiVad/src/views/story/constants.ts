/**
 * Story board — shared constants, enums, options, and display helpers.
 *
 * Centralises status/priority/frequency definitions, tag-type mappers,
 * and formatting utilities consumed by the story list, detail, and form
 * components.
 */
import type { StoryStatus, ScenarioPriority, MilestoneStatus } from "@/api/modules/story";

// ── Status ──────────────────────────────────────────────────────────────────

export const STORY_STATUS_ORDER: StoryStatus[] = [
  "planning",
  "design",
  "develop",
  "testing",
  "operations",
  "archived"
];

export const STORY_STATUS_LABELS: Record<StoryStatus, string> = {
  planning: "Planning",
  design: "Design",
  develop: "Develop",
  testing: "Testing",
  operations: "Operations",
  archived: "Archived"
};

// ── Priority ────────────────────────────────────────────────────────────────

export const PRIORITY_OPTIONS: { label: string; value: ScenarioPriority }[] = [
  { label: "P0 — Critical", value: "p0" },
  { label: "P1 — High", value: "p1" },
  { label: "P2 — Medium", value: "p2" },
  { label: "P3 — Low", value: "p3" }
];

export const PRIORITY_COLORS: Record<ScenarioPriority, string> = {
  p0: "danger",
  p1: "warning",
  p2: "info",
  p3: "info"
};

// ── Milestone status ────────────────────────────────────────────────────────

export const MILESTONE_STATUS_OPTIONS: { label: string; value: MilestoneStatus }[] = [
  { label: "Pending Review", value: "pending_review" },
  { label: "Not Started", value: "not_started" },
  { label: "In Progress", value: "in_progress" },
  { label: "Done", value: "done" }
];

export function milestoneStatusType(s: MilestoneStatus): "success" | "warning" | "info" | "primary" | "danger" {
  const m: Record<string, "success" | "warning" | "info" | "primary" | "danger"> = {
    pending_review: "warning",
    not_started: "info",
    in_progress: "primary",
    done: "success"
  };
  return m[s] || "info";
}

// ── Frequency ───────────────────────────────────────────────────────────────

export const FREQUENCY_OPTIONS = ["daily", "weekly", "monthly", "on_demand"] as const;
export type UsageFrequency = (typeof FREQUENCY_OPTIONS)[number];

export function frequencyTagType(freq: string): "success" | "warning" | "info" | "primary" | "danger" {
  const m: Record<string, "success" | "warning" | "info" | "primary" | "danger"> = { daily: "info", weekly: "info", monthly: "warning", on_demand: "success" };
  return m[freq] || "info";
}

export function frequencyLabel(freq: string): string {
  const m: Record<string, string> = { daily: "Daily", weekly: "Weekly", monthly: "Monthly", on_demand: "OnDemand" };
  return m[freq] || "Daily";
}

// ── Rule / AC priority ─────────────────────────────────────────────────────

export const RULE_PRIORITY_OPTIONS = ["must", "should", "could"] as const;
export type RulePriority = (typeof RULE_PRIORITY_OPTIONS)[number];

export function rulePriorityType(p: string): "success" | "warning" | "info" | "primary" | "danger" {
  const m: Record<string, "success" | "warning" | "info" | "primary" | "danger"> = { must: "danger", should: "warning", could: "info" };
  return m[p] || "info";
}

export function rulePriorityLabel(p: string): string {
  const m: Record<string, string> = { must: "Must", should: "Should", could: "Could" };
  return m[p] || "Must";
}

// ── Approval ────────────────────────────────────────────────────────────────

export const APPROVAL_RESULT_OPTIONS = [
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" }
] as const;

export function approvalResultType(r: string): "success" | "danger" {
  return r === "approved" ? "success" : "danger";
}

export const APPROVAL_ROLE_LABELS: Record<string, string> = {
  business_owner: "Business Owner",
  eu_hub_itbp: "EU HUB ITBP",
  rsc_business: "RSC Business",
  hq_counterpart: "HQ Counterpart"
};

// ── Scope ───────────────────────────────────────────────────────────────────

export function scopeLabel(s: string): string {
  return s === "all" ? "All" : "Partial";
}

export function scopeType(s: string): string {
  return s === "all" ? "info" : "warning";
}

// ── Step actions ────────────────────────────────────────────────────────────

export const STEP_ACTIONS = ["Given", "When", "Then", "And"] as const;
export type StepAction = (typeof STEP_ACTIONS)[number];

// ── Time range filter ───────────────────────────────────────────────────────

export type TimeRange = "all" | "week" | "month" | "quarter" | "custom";

export const TIME_RANGE_OPTIONS: { label: string; value: TimeRange }[] = [
  { label: "All", value: "all" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Quarter", value: "quarter" },
  { label: "Custom", value: "custom" }
];

// ── Formatting ──────────────────────────────────────────────────────────────

/** Timestamp (ms) → YYYY-MM-DD string. */
export function fmtDate(ts: number | null | undefined): string {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Format file size in bytes to human-readable string. */
export function formatSize(bytes: number | undefined): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
