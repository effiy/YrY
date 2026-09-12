import type { Component, InjectionKey, Ref, ComputedRef } from "vue";
import { inject } from "vue";
import type { IssueStatus, Issue } from "@/api/modules/issueService";
import type { Module } from "@/api/modules/moduleService";
import type { BugDocument } from "@/api/modules/bug";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";
import type { Project } from "@/api/modules/projectService";
import type KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";

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

// ── Detail page injection keys ────────────────────────────────────────────────

export interface OkrSummary {
  totalGoals: number;
  avgProgress: number;
  completedCount: number;
}

/** 项目详情页共享数据，由 detail.vue provide，子组件 inject */
export interface ProjectDetailContext {
  project: Ref<Project | null>;
  knowledgeFiles: Ref<KnowledgeFileEntry[]>;
  allIssues: Ref<Issue[]>;
  allModules: Ref<Module[]>;
  allBugs: Ref<BugDocument[]>;
  filterDate: Ref<Date | null>;
  filterDateStr: ComputedRef<string>;
  clearFilterDate: () => void;
  navigateTab: (name: string) => void;
  refreshData: () => Promise<void>;
  lastUpdated: Ref<number>;
  loading: Ref<boolean>;
  retry: () => Promise<void>;
  startPolling: (intervalMs?: number) => void;
  stopPolling: () => void;
  /** OKR summary populated by DetailOkr, read by DetailOverview */
  okrSummary: Ref<OkrSummary>;
}

export const PROJECT_DETAIL_KEY: InjectionKey<ProjectDetailContext> = Symbol("projectDetail");
export const PREVIEW_DLG_KEY: InjectionKey<Ref<InstanceType<typeof KnowledgePreviewDialog> | null>> = Symbol("previewDlg");

export interface OverviewStats {
  totalIssues: number;
  inProgressIssues: number;
  overdueIssues: number;
  totalBugs: number;
  totalDocs: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  action: string;
  target: string;
  timeAgo: string;
  updatedAt: string;
  link?: string;
  filePath?: string;
}

export interface DocItem {
  title: string;
  path: string;
  tag: string;
  updatedAt?: string;
  isSpecial?: boolean;
}

// ── Doc tag constants ─────────────────────────────────────────────────────────

export const TAG_COLORS: Record<string, string> = {
  architecture: "#409eff",
  guides: "#67c23a",
  patterns: "#9b59b6",
  workflows: "#e6a23c",
  requirements: "#f56c6c",
  "ai-guide": "#ff6b6b",
  unknown: "#909399"
};

export const TAG_LABELS: Record<string, string> = {
  architecture: "架构",
  guides: "指南",
  patterns: "模式",
  workflows: "工作流",
  requirements: "需求",
  "ai-guide": "AI 指南",
  unknown: "其他"
};

/** Safe inject wrapper — throws a descriptive error instead of crashing with undefined. */
export function useProjectDetail(): ProjectDetailContext {
  const ctx = inject(PROJECT_DETAIL_KEY);
  if (!ctx) throw new Error("useProjectDetail() must be used within a <ProjectDetail> provider");
  return ctx;
}
