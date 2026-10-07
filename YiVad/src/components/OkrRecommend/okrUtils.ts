// ═══════════════════════════════════════════════════════════════════
// OKR 推荐任务 — 工具函数（评分 / 序列化 / 知识库持久化）
// ═══════════════════════════════════════════════════════════════════
import dayjs from "dayjs";
import { applyOrchestration } from "./okrOrchestration";
import type {
  GoalItem,
  MetricItem,
  DailyRoleData,
  WeeklyRoleData,
  RoleMeta,
  OkrMetadataContext,
  OkrListType,
  OkrPriority,
  OkrLevel,
  OkrTaskItem,
  OkrActionItem,
  ApiExampleTask
} from "./okrTypes";
import { LIST_TYPES, VALID_EFFORT, VALID_LEVEL, VALID_PRIORITY } from "./okrTypes";

// ── Metadata accessors ───────────────────────────

export function rd(ctx?: OkrMetadataContext) {
  return ctx?.rolesData ?? ({} as Record<string, RoleMeta>);
}
export function gd(ctx?: OkrMetadataContext) {
  return ctx?.goalsData ?? ({} as Record<string, GoalItem[]>);
}
export function md(ctx?: OkrMetadataContext) {
  return ctx?.metricsData ?? ({} as Record<string, MetricItem[]>);
}
export function amm(ctx?: OkrMetadataContext) {
  return ctx?.allMetricsMap ?? ({} as Record<string, MetricItem>);
}
export function gmm(ctx?: OkrMetadataContext) {
  return ctx?.goalMetricMap ?? ({} as Record<string, string[]>);
}
export function rdd(ctx?: OkrMetadataContext) {
  return ctx?.roleDailyDataMap ?? ({} as Record<string, DailyRoleData>);
}
export function rwd(ctx?: OkrMetadataContext) {
  return ctx?.roleWeeklyDataMap ?? ({} as Record<string, WeeklyRoleData>);
}

export function getGoalMetrics(goalId: string, ctx?: OkrMetadataContext): MetricItem[] {
  const map = ctx?.goalMetricMap ?? {};
  const metrics = ctx?.allMetricsMap ?? {};
  return (map[goalId] || []).map((id: string) => metrics[id]).filter(Boolean);
}

// ── 优先级评分（WSJF：价值 × 紧迫度 ÷ 难度）──────────

const LEVEL_WEIGHT: Record<OkrLevel, number> = { high: 3, medium: 2, low: 1 };

export function clampLevel(v: unknown): OkrLevel {
  const s = String(v ?? "").toLowerCase();
  return (VALID_LEVEL as readonly string[]).includes(s) ? (s as OkrLevel) : "medium";
}

/** 由截止时间推导紧迫度（逾期/今天/明天 = high，3 天内 = medium，其余 low）。 */
export function urgencyFromDue(dueDate: string, today = dayjs()): OkrLevel {
  if (!dueDate) return "medium";
  const d = dayjs(dueDate);
  if (!d.isValid()) return "medium";
  const diffDays = d.diff(today.startOf("day"), "day");
  if (diffDays <= 1) return "high";
  if (diffDays <= 3) return "medium";
  return "low";
}

/** WSJF 综合评分（0-100）。 */
export function scoreTask(roi: OkrLevel, difficulty: OkrLevel, urgency: OkrLevel): number {
  const v = LEVEL_WEIGHT[roi];
  const u = LEVEL_WEIGHT[urgency];
  const d = LEVEL_WEIGHT[difficulty];
  return Math.round(((v * u) / d / 9) * 100);
}

/** 评分 → 优先级（P0 ≥ 60，P1 ≥ 35，P2 ≥ 15，其余 P3）。 */
export function priorityFromScore(score: number): OkrPriority {
  if (score >= 60) return "P0";
  if (score >= 35) return "P1";
  if (score >= 15) return "P2";
  return "P3";
}

/** 读取存储的优先级（非法值回退 P2）。 */
export function clampPriority(v: unknown): OkrPriority {
  const s = String(v ?? "");
  return (VALID_PRIORITY as readonly string[]).includes(s) ? (s as OkrPriority) : "P2";
}

export function clampEffort(v: unknown): OkrTaskItem["effort"] {
  const s = String(v ?? "").toUpperCase();
  return (VALID_EFFORT as readonly string[]).includes(s) ? (s as OkrTaskItem["effort"]) : "M";
}

/** 解析任务的指标数据：优先 metricId，其次 goalId 关联的首指标，最后回退到角色首指标。 */
export function resolveMetric(roleId: string, metricId: string, goalId: string, ctx?: OkrMetadataContext): MetricItem | null {
  const am = amm(ctx);
  if (metricId && am[metricId]) return am[metricId];
  if (goalId) {
    const fromGoal = getGoalMetrics(goalId, ctx);
    if (fromGoal.length) return fromGoal[0];
  }
  return (md(ctx)[roleId] || [])[0] ?? null;
}

export function roleMeta(roleId: string, ctx?: OkrMetadataContext) {
  const meta = rd(ctx)[roleId];
  return meta ? { roleName: meta.name, roleIcon: meta.icon } : { roleName: roleId, roleIcon: "👤" };
}

// ── 指标数据 ⇄ 扁平 frontmatter ───────────────

/** 指标 → 扁平 frontmatter 字段。 */
export function metricToMeta(metric: MetricItem): Record<string, unknown> {
  return {
    metricId: metric.id,
    metricIcon: metric.icon,
    metricName: metric.name,
    metricCategory: metric.category,
    metricFramework: metric.framework,
    metricDescription: metric.description,
    metricCurrent: metric.current,
    metricTarget: metric.target,
    metricBaseline: metric.baseline,
    metricUnit: metric.unit,
    metricTrend: metric.trend,
    metricProgress: metric.progress
  };
}

export function toNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** 从扁平 frontmatter 重建指标；缺失时回退 resolveMetric。 */
export function metricFromMeta(
  meta: Record<string, unknown>,
  roleId: string,
  metricId: string,
  goalId: string,
  ctx?: OkrMetadataContext
): MetricItem | null {
  const name = typeof meta.metricName === "string" ? meta.metricName : "";
  if (!name) return resolveMetric(roleId, metricId, goalId, ctx);
  return {
    id: typeof meta.metricId === "string" ? meta.metricId : metricId,
    icon: typeof meta.metricIcon === "string" ? meta.metricIcon : "📊",
    name,
    category: typeof meta.metricCategory === "string" ? meta.metricCategory : "",
    framework: typeof meta.metricFramework === "string" ? meta.metricFramework : "",
    description: typeof meta.metricDescription === "string" ? meta.metricDescription : "",
    current: toNumber(meta.metricCurrent),
    target: toNumber(meta.metricTarget),
    baseline: toNumber(meta.metricBaseline),
    unit: typeof meta.metricUnit === "string" ? meta.metricUnit : "",
    trend: typeof meta.metricTrend === "string" ? meta.metricTrend : "",
    progress: toNumber(meta.metricProgress)
  };
}

// ── 知识库序列化（任务 ⇄ 扁平 frontmatter）─────────

export function taskToMeta(item: OkrTaskItem, source: "ai" | "fallback"): Record<string, unknown> {
  const meta: Record<string, unknown> = {
    title: item.title,
    role: item.role,
    goalId: item.goalId,
    effort: item.effort,
    dueDate: item.dueDate,
    reason: item.reason,
    priority: item.priority,
    score: item.score,
    roi: item.roi,
    difficulty: item.difficulty,
    urgency: item.urgency,
    skill: item.skill,
    agent: item.agent,
    mcp: item.mcp,
    source
  };
  if (item.metric) Object.assign(meta, metricToMeta(item.metric));
  else if (item.metricId) meta.metricId = item.metricId;
  return meta;
}

/** 从 frontmatter 重建任务；无 title 视为无效返回 null。 */
export function taskFromMeta(meta: Record<string, unknown>, fallbackId: string, ctx?: OkrMetadataContext): OkrTaskItem | null {
  const title = typeof meta.title === "string" ? meta.title : "";
  if (!title) return null;
  const role = typeof meta.role === "string" ? meta.role : "executive";
  const { roleName, roleIcon } = roleMeta(role, ctx);
  const goalId = typeof meta.goalId === "string" ? meta.goalId : "";
  const metricId = typeof meta.metricId === "string" ? meta.metricId : "";
  const metric = metricFromMeta(meta, role, metricId, goalId, ctx);
  return {
    id: typeof meta.id === "string" ? meta.id : fallbackId,
    title,
    role,
    roleName,
    roleIcon,
    priority: clampPriority(meta.priority),
    goalId,
    metricId: metric?.id ?? metricId,
    metric,
    effort: clampEffort(meta.effort),
    dueDate: typeof meta.dueDate === "string" ? meta.dueDate : "",
    reason: typeof meta.reason === "string" ? meta.reason : "",
    roi: clampLevel(meta.roi),
    difficulty: clampLevel(meta.difficulty),
    urgency: clampLevel(meta.urgency),
    score: toNumber(meta.score),
    ...applyOrchestration({ role, skill: meta.skill, agent: meta.agent, mcp: meta.mcp })
  };
}

// ── Action Item（okr-action）→ 表格行 ───────────────

/** 从 okr-action 的 frontmatter 重建表格行；无 title 视为无效返回 null。 */
export function actionItemFromMeta(
  meta: Record<string, unknown>,
  fallbackId: string,
  ctx?: OkrMetadataContext
): OkrActionItem | null {
  const title = typeof meta.title === "string" ? meta.title : "";
  if (!title) return null;
  const role = typeof meta.role === "string" ? meta.role : "";
  const { roleName, roleIcon } = roleMeta(role, ctx);
  const goalId = typeof meta.goal === "string" ? meta.goal : typeof meta.goalId === "string" ? meta.goalId : "";
  const deadline = typeof meta.deadline === "string" ? meta.deadline : "";
  const status = typeof meta.status === "string" ? meta.status : "Planned";
  const progress = toNumber(meta.progress);
  const priority = clampPriority(meta.priority);
  const metricId = typeof meta.metricId === "string" ? meta.metricId : "";
  const reason = typeof meta.reason === "string" ? meta.reason : "";
  const listType: OkrListType = LIST_TYPES.some(l => l.key === meta.listType) ? (meta.listType as OkrListType) : "daily";
  return {
    id: typeof meta.id === "string" ? meta.id : fallbackId,
    title,
    role,
    roleName,
    roleIcon,
    priority,
    goalId,
    metricId,
    metric: resolveMetric(role, metricId, goalId, ctx),
    effort: "M",
    dueDate: deadline,
    reason,
    roi: priority === "P0" ? "high" : priority === "P1" ? "medium" : "low",
    difficulty: "medium",
    urgency: urgencyFromDue(deadline),
    score: progress,
    skill: typeof meta.skill === "string" ? meta.skill : "",
    agent: typeof meta.agent === "string" ? meta.agent : "",
    mcp: (typeof meta.mcp === "string" ? meta.mcp : "") as import("./okrOrchestration").OkrMcp,
    kind: "action",
    listType,
    status,
    progress,
    owner: typeof meta.owner === "string" ? meta.owner : "",
    subtaskCount: toNumber(meta.subtaskCount),
    filePath: ""
  };
}

// ── API Example Task → 表格行 ─────────────────────

/** 将 API 示例任务转为表格行（OkrActionItem）。 */
export function exampleTaskToActionItem(raw: ApiExampleTask, ctx?: OkrMetadataContext): OkrActionItem | null {
  const title = raw.title?.trim();
  if (!title) return null;
  const role = raw.role || "";
  const { roleName, roleIcon } = roleMeta(role, ctx);
  const goalId = raw.goalId || "";
  const deadline = raw.deadline || "";
  const listType: OkrListType = LIST_TYPES.some(l => l.key === raw.listType) ? (raw.listType as OkrListType) : "daily";
  const priority = clampPriority(raw.priority);
  const status = raw.status || "Planned";
  const progress = typeof raw.progress === "number" ? raw.progress : 0;
  const reason = raw.description || "";
  const metricId = "";
  return {
    id: raw.key,
    title,
    role,
    roleName: roleName || raw.roleName || role,
    roleIcon: roleIcon || raw.roleIcon || "👤",
    priority,
    goalId,
    metricId,
    metric: resolveMetric(role, metricId, goalId, ctx),
    effort: "M",
    dueDate: deadline,
    reason,
    roi: priority === "P0" ? "high" : priority === "P1" ? "medium" : "low",
    difficulty: "medium",
    urgency: urgencyFromDue(deadline),
    score: progress,
    skill: raw.skill || "",
    agent: raw.agent || "",
    mcp: (raw.mcp || "") as import("./okrOrchestration").OkrMcp,
    kind: "action",
    listType,
    status,
    progress,
    owner: raw.owner || "",
    subtaskCount: raw.subtasks?.length ?? 0,
    filePath: ""
  };
}