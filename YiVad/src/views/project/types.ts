import type { Component } from "vue";
import type { IssueStatus } from "@/api/modules/issueService";

/** One KPI tile in the dashboard header strip. */
export interface StatTile {
  key: string;
  value: number;
  /** Rendered straight after the value, e.g. "%". */
  suffix?: string;
  label: string;
  sub?: string;
  /** Tooltip explaining what clicking the tile does. */
  hint?: string;
  icon: Component;
  /** Drives the gradient chip: `pst-tile--<variant>`. */
  variant: string;
  clickable?: boolean;
  active?: boolean;
}

// ── Risk types ──────────────────────────────────────────────────────────────

export type RiskKey = "overdue" | "stale" | "unassigned" | "no_members" | "no_description";
export type HealthLevel = "good" | "warn" | "poor";

// ── Stats types ─────────────────────────────────────────────────────────────

export interface ProjectStats {
  issues: number;
  done: number;
  open: number;
  overdue: number;
  unassigned: number;
  cycles: number;
  activeCycles: number;
  /** Total bugs across all statuses. */
  totalBugs: number;
  /** Total modules linked to this project. */
  totalModules: number;
  /** Latest touch across the project record and all of its issues. */
  lastActivity: string;
  statuses: Record<string, number>;
  /** Priorities of OPEN issues only — closed work is not actionable. */
  openPriorities: Record<string, number>;
  types: Record<string, number>;
}

// ── Filter types ────────────────────────────────────────────────────────────

export interface FilterPill {
  key: string;
  val: string;
  label: string;
  display: string;
  color: string;
}

export type FilterState = Record<string, string>;

// ── Constants ───────────────────────────────────────────────────────────────

/** A project untouched for this long is flagged stale. */
export const STALE_DAYS = 14;
/** Trailing window for the activity sparkline. */
export const ACTIVITY_DAYS = 30;
/** Undo depth for the filter stack. */
export const MAX_HISTORY = 20;

export const CLOSED_STATUSES: ReadonlySet<string> = new Set<IssueStatus>(["done", "cancelled"]);

export const EMPTY_STATS: ProjectStats = {
  issues: 0,
  done: 0,
  open: 0,
  overdue: 0,
  unassigned: 0,
  cycles: 0,
  activeCycles: 0,
  totalBugs: 0,
  totalModules: 0,
  lastActivity: "",
  statuses: {},
  openPriorities: {},
  types: {}
};

export const RISK_META: Record<RiskKey, { label: string; hint: string; color: string }> = {
  overdue: { label: "Overdue work", hint: "Has open issues past their due date", color: "#ee6666" },
  stale: { label: "Stale", hint: `No activity in ${STALE_DAYS}+ days`, color: "#e6a23c" },
  unassigned: { label: "Unassigned", hint: "Has open issues with nobody on them", color: "#fc8452" },
  no_members: { label: "No members", hint: "Nobody is on the project", color: "#5470c6" },
  no_description: { label: "No description", hint: "Project has no description", color: "#909399" }
};

/** Order matters — this is the render order of the attention strip. */
export const RISK_ORDER: RiskKey[] = ["overdue", "stale", "unassigned", "no_members", "no_description"];

export const FILTER_LABEL_MAP: Record<string, string> = {
  status: "Status",
  issueStatus: "Issue status",
  priority: "Priority",
  issueType: "Issue type",
  risk: "Risk",
  health: "Health",
  flagged: "Flagged",
  project: "Project"
};

export const FILTER_DIMENSION_COLORS: Record<string, string> = {
  status: "#5470c6",
  issueStatus: "#73c0de",
  priority: "#fc8452",
  issueType: "#9a60b4",
  risk: "#ee6666",
  health: "#91cc75",
  flagged: "#e6a23c",
  project: "#3ba272"
};

// ── Utility functions ───────────────────────────────────────────────────────

export function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function daysSince(iso: string | undefined): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - then) / 86_400_000);
}

// ── Detail page types ────────────────────────────────────────────────────────

export type DetailTab = "overview" | "requirements" | "issues" | "modules" | "docs" | "bugs" | "members";

export const TAB_NAMES: DetailTab[] = ["overview", "requirements", "issues", "modules", "docs", "bugs", "members"];

export interface OverviewStats {
  totalIssues: number;
  inProgressIssues: number;
  overdueIssues: number;
  totalModules: number;
  totalRequirements: number;
  totalBugs: number;
  totalDocs: number;
}

export interface ModuleSummary {
  id: string;
  name: string;
  kind: string;
  kindLabel: string;
  statusLabel: string;
  status: string;
  color: string;
  dates: string;
  link: string;
  done: number;
  total: number;
  pct: number;
  issueKeys: string[];
}

export interface ActivityItem {
  id: string;
  type: string;
  action: string;
  target: string;
  timeAgo: string;
  updatedAt: string;
  link: string;
  filePath?: string;
}

export interface DocItem {
  title: string;
  path: string;
  tag: string;
  updatedAt?: string;
  isSpecial?: boolean;
}

export interface RequireItem {
  title: string;
  path: string;
  status: string;
  priority: string;
  assignee: string;
  estimate_frontend: number;
  issue_type: string;
  prd_month: string;
  prd_task_id: string;
}

// ── Doc tag constants ─────────────────────────────────────────────────────────

export const TAG_COLORS: Record<string, string> = {
  "getting-started": "#67c23a",
  architecture: "#409eff",
  deployment: "#e6a23c",
  conventions: "#9b59b6",
  dependencies: "#f56c6c",
  "core-code": "#20c997",
  "ai-guide": "#ff6b6b",
  unknown: "#909399"
};

export const TAG_LABELS: Record<string, string> = {
  "getting-started": "入门",
  architecture: "架构",
  deployment: "部署",
  conventions: "规范",
  dependencies: "依赖",
  "core-code": "核心",
  "ai-guide": "AI 指南",
  unknown: "其他"
};
