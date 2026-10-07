// ═══════════════════════════════════════════════════════════════════
// OKR 推荐任务 — 类型定义（纯类型，无运行时依赖）
// ═══════════════════════════════════════════════════════════════════
import type { OkrMcp } from "./okrOrchestration";

// ── In-memory metadata types (API data shapes after transformation) ──

export interface KeyResult {
  text: string;
  progress: number;
  file?: string;
}

export interface GoalItem {
  id: string;
  icon: string;
  title: string;
  status: string;
  description: string;
  period: string;
  owner: string;
  project: string;
  keyResults: KeyResult[];
}

export interface MetricItem {
  id: string;
  icon: string;
  name: string;
  category: string;
  framework: string;
  description: string;
  current: number;
  target: number;
  baseline: number;
  unit: string;
  trend: string;
  progress: number;
}

export interface DailyRoleData {
  yesterday: string[];
  today: string[];
  blocker: string;
  mood: string;
  moodType: string;
}

export interface WeeklyItem {
  text: string;
  file?: string;
}

export interface WeeklyRoleData {
  status: string;
  statusType: string;
  done: WeeklyItem[];
  blockers: WeeklyItem[];
  nextWeek: WeeklyItem[];
  decisions: WeeklyItem[];
}

export interface RoleMeta {
  id: string;
  name: string;
  icon: string;
  dir: string;
  description: string;
  projects: string[];
  categories: string[];
}

/** Metadata context — when provided from API, overrides static imports. */
export interface OkrMetadataContext {
  rolesData: Record<string, RoleMeta>;
  goalsData: Record<string, GoalItem[]>;
  metricsData: Record<string, MetricItem[]>;
  allMetricsMap: Record<string, MetricItem>;
  goalMetricMap: Record<string, string[]>;
  roleDailyDataMap: Record<string, DailyRoleData>;
  roleWeeklyDataMap: Record<string, WeeklyRoleData>;
}

// ── 推荐任务类型 ────────────────────────────────────────

export type OkrListType = "daily" | "weekly" | "risk";
export type OkrScope = "all" | string; // "all" 或具体角色 id

export type OkrPriority = "P0" | "P1" | "P2" | "P3";
export type OkrLevel = "high" | "medium" | "low";

export interface OkrTaskItem {
  id: string;
  title: string;
  role: string; // 角色 id（executive / product / …）
  roleName: string;
  roleIcon: string;
  priority: OkrPriority; // 由综合评分 score 推导（不再由模型直接拍定）
  goalId: string; // 关联目标 id，可为空字符串
  metricId: string; // 关联指标 id，可为空字符串
  metric: MetricItem | null; // 任务自身的指标数据（由 metricId 解析，缺失时回退到目标/角色首指标）
  effort: "S" | "M" | "L";
  dueDate: string; // YYYY-MM-DD
  reason: string; // 推荐理由
  roi: OkrLevel; // ROI / 价值
  difficulty: OkrLevel; // MVP 实现难度
  urgency: OkrLevel; // 紧迫度
  score: number; // 综合优先级评分 0-100（WSJF：价值 × 紧迫度 ÷ 难度）
  skill: string; // 实现该任务最合适的 skill（id 取自 skills/constants.ts）
  agent: string; // 负责该任务的 agent persona（如 "Engineer Agent"）
  mcp: OkrMcp; // 需要的 MCP 服务器：github | yiai | ""（无需）
  filePath?: string; // 落盘路径（加载 / 持久化后回填，供文件预览弹框打开正文）
}

export interface OkrRecommendResult {
  items: OkrTaskItem[];
  source: "ai" | "fallback";
}

/** 清单元数据：面板渲染的多个「推荐清单」。 */
export interface OkrListMeta {
  key: OkrListType;
  icon: string;
}

export const LIST_TYPES: OkrListMeta[] = [
  { key: "daily", icon: "📅" },
  { key: "weekly", icon: "🗓" },
  { key: "risk", icon: "🚨" }
];

export const VALID_EFFORT = ["S", "M", "L"] as const;
export const VALID_LEVEL = ["high", "medium", "low"] as const;
export const VALID_PRIORITY = ["P0", "P1", "P2", "P3"] as const;

// ── Action Item 类型 ───────────────────────────────

export interface OkrActionItem extends OkrTaskItem {
  kind: "action";
  /** Action Item 也归属某个清单（daily/weekly/risk），随 frontmatter 落盘。 */
  listType: OkrListType;
  status: string;
  progress: number;
  owner: string;
  subtaskCount: number;
  filePath: string;
}

/** API 返回的示例任务形状（最小输入类型，与 okrService 的 OkrExampleTask 对齐）。 */
export interface ApiExampleTask {
  key: string;
  title: string;
  role: string;
  roleIcon: string;
  roleName: string;
  goalId: string;
  skill: string;
  agent: string;
  mcp: string;
  listType: string;
  priority: string;
  status: string;
  owner: string;
  deadline: string;
  progress: number;
  description: string;
  subtasks?: { id: string; title: string; detail: string; acceptance: string }[];
}