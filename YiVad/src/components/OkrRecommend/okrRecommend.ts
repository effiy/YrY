// ═══════════════════════════════════════════════════════════════════
// AI 自主推荐 OKR 任务清单 — 核心逻辑（纯函数，无 Vue 依赖）
//
// 参考 deepseek-harness 的「todo/」能力（Pi/dsh parity）：
//   - 能力即插件：把各角色的 OKR 上下文（目标 / 关键结果 / 指标 / 阻塞）
//     拼装成模型可见的 prompt，让模型自主推导「现在最该做什么」。
//
// 职责：
//   1. 定义推荐任务的数据结构 OkrTaskItem
//   2. 拼装 system prompt + user prompt（提示语）
//   3. 从 OKR 静态数据构建模型可见的上下文
//   4. 解析模型返回的 JSON（容错）
// ═══════════════════════════════════════════════════════════════════
import dayjs from "dayjs";
import {
  rolesData,
  goalsData,
  metricsData,
  allMetricsMap,
  getGoalMetrics,
  roleDailyDataMap,
  roleWeeklyDataMap
} from "@/views/knowledge/executiver/okrData";
import type { GoalItem, MetricItem } from "@/views/knowledge/executiver/okrData";
import { skills as SKILLS } from "@/views/knowledge/skills/constants";
import { applyOrchestration, type OkrMcp } from "./okrOrchestration";

/** 供 system prompt 使用的技能 id 清单（AI 从中选择 skill）。 */
const SKILL_ID_LIST = SKILLS.map(s => s.id).join(", ");

// ── 类型 ────────────────────────────────────────

export type OkrListType = "daily" | "weekly" | "risk" | "sprint";
export type OkrScope = "all" | string; // "all" 或具体角色 id

export type OkrPriority = "P0" | "P1" | "P2" | "P3";
export type OkrLevel = "high" | "medium" | "low";

export interface OkrTaskItem {
  id: string;
  title: string;
  role: string; // 角色 id（executiver / producter / …）
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
  { key: "risk", icon: "🚨" },
  { key: "sprint", icon: "🎯" }
];

const VALID_EFFORT = ["S", "M", "L"] as const;
const VALID_LEVEL = ["high", "medium", "low"] as const;

// ── 优先级评分（WSJF：价值 × 紧迫度 ÷ 难度）──────────
//
// 用三个维度衡量优先级，而不是让模型凭感觉给 P0/P1：
//   roi        价值 / 投资回报率（高价值 → 越优先）
//   urgency    紧迫度（逾期 / 今日必做 → 越优先，可由 dueDate 推导）
//   difficulty MVP 实现难度（越难 → 越靠后，快速见效项优先）
//
//   score = (roi 权重 × urgency 权重) ÷ difficulty 权重
//   权重 high=3 / medium=2 / low=1；归一化到 0-100（最大值 3×3/1=9 → 100），
//   再映射回 P0-P3。这样「优先级」始终由维度可解释，而非拍脑袋。

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

const VALID_PRIORITY = ["P0", "P1", "P2", "P3"] as const;

/** 读取存储的优先级（非法值回退 P2）。 */
function clampPriority(v: unknown): OkrPriority {
  const s = String(v ?? "");
  return (VALID_PRIORITY as readonly string[]).includes(s) ? (s as OkrPriority) : "P2";
}

/** 解析任务的指标数据：优先 metricId，其次 goalId 关联的首指标，最后回退到角色首指标。
 *  保证「每个任务都有自己的指标数据」。 */
export function resolveMetric(roleId: string, metricId: string, goalId: string): MetricItem | null {
  if (metricId && allMetricsMap[metricId]) return allMetricsMap[metricId];
  if (goalId) {
    const fromGoal = getGoalMetrics(goalId);
    if (fromGoal.length) return fromGoal[0];
  }
  return (metricsData[roleId] || [])[0] ?? null;
}

// ── 指标数据 ⇄ 扁平 frontmatter ───────────────
//
// 后端 writer 会丢弃空字符串、把嵌套 dict 强转成字符串，因此任务的指标数据
// 必须拍平成 metric* 前缀的标量字段才能完整落盘、原样读回。

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

function toNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** 从扁平 frontmatter 重建指标；缺失时回退 resolveMetric。 */
export function metricFromMeta(
  meta: Record<string, unknown>,
  roleId: string,
  metricId: string,
  goalId: string
): MetricItem | null {
  const name = typeof meta.metricName === "string" ? meta.metricName : "";
  if (!name) return resolveMetric(roleId, metricId, goalId);
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

// ── 提示语（System Prompt）───────────────────────
//
// 这是「AI 自主推荐」能力的核心提示语。它把模型塑造成一名 OKR 规划助手，
// 并用严格的 JSON 约束保证输出可被解析成列表 / 表格 / 卡片三种视图。

export const OKR_SYSTEM_PROMPT = `你是「Yi 系统」的 OKR 智能规划助手，负责为 Yi 家族（YiAi / YiVad / YiPet / YiKnowledge）各角色自主推荐可执行的每日、每周任务清单。

你的职责：
1. 基于给定角色的目标（Objective）、关键结果（Key Result）、指标进度、昨日完成、今日/本周阻塞，推导出「现在最该做什么」。
2. 每个任务必须具体、可验收、含动作动词，并尽量对齐某个 goalId / metricId（对应给定的目标/指标 id）。
3. 用三个维度衡量优先级（你只需给出维度，综合评分与优先级由系统按 WSJF 公式自动计算）：
   - roi：任务带来的价值 / 投资回报率（high / medium / low）
   - difficulty：实现 MVP（最小可行版本）的难度（high / medium / low）
   - urgency：紧迫度（high / medium / low），逾期或今日必做 = high
   综合评分 = (roi 权重 × urgency 权重) ÷ difficulty 权重，归一化到 0-100；「高价值 × 高紧迫 × 低难度」的快速见效项最优先。
4. 工作量 effort：S = <2 小时，M = 半天，L = 1 天以上。
5. 推荐理由 reason 一句话说清：为什么现在做、对齐哪个目标、不做的代价。
6. 为每个任务指定实现它的三要素（编排）：
   - skill：从可用技能 id（${SKILL_ID_LIST}）中选一个最贴切的。
   - agent：负责执行的 agent persona（如 "Engineer Agent"、"Executive Agent"）。
   - mcp：需要的外部 MCP 服务器（"github" | "yiai" | "" 表示无需）。

输出要求（严格遵守）：
- 只输出一个 JSON 数组，不要 markdown 代码块、不要任何解释文字、不要前后缀。
- 数组每个元素字段如下：
{
  "title": "任务标题（中文，含动词，≤30 字）",
  "role": "角色 id：executiver | producter | leader | engineer | srer | aier | curator",
  "goalId": "关联目标 id（如 exec-001；无则空字符串）",
  "metricId": "关联指标 id（如 exec-m01；无则空字符串）",
  "effort": "S | M | L",
  "dueDate": "YYYY-MM-DD",
  "roi": "high | medium | low",
  "difficulty": "high | medium | low",
  "urgency": "high | medium | low",
  "reason": "推荐理由（一句话）",
  "skill": "技能 id（从上面可用技能中选择一个）",
  "agent": "agent persona（如 Engineer Agent）",
  "mcp": "github | yiai | ""
}`;

// ── 上下文构建 ──────────────────────────────────

function krAvg(goal: GoalItem): number {
  if (!goal.keyResults.length) return 0;
  return Math.round(goal.keyResults.reduce((s, kr) => s + kr.progress, 0) / goal.keyResults.length);
}

function metricProgress(m: MetricItem): number {
  return typeof m.progress === "number" ? m.progress : 0;
}

/** 序列化单个角色的目标（按进度升序，滞后优先）。 */
function formatGoals(roleId: string, limit = 6): string {
  const goals = goalsData[roleId] || [];
  const sorted = [...goals].sort((a, b) => krAvg(a) - krAvg(b)).slice(0, limit);
  return sorted
    .map(g => {
      const krs = g.keyResults.map(kr => `  - [${kr.progress}%] ${kr.text}`).join("\n");
      return `  ${g.id} ${g.title}（${g.status} · ${g.period}）\n${krs}`;
    })
    .join("\n");
}

/** 序列化单个角色的指标（按进度升序，滞后优先）。 */
function formatMetrics(roleId: string, limit = 8): string {
  const metrics = metricsData[roleId] || [];
  const sorted = [...metrics].sort((a, b) => metricProgress(a) - metricProgress(b)).slice(0, limit);
  return sorted
    .map(m => `  ${m.id} ${m.name}：当前 ${m.current}${m.unit} / 目标 ${m.target}${m.unit}（${metricProgress(m)}%）`)
    .join("\n");
}

/** 单个角色详细上下文（今日 / 本周推荐时用）。 */
function formatRoleDetail(roleId: string): string {
  const meta = rolesData[roleId];
  const daily = roleDailyDataMap[roleId];
  const weekly = roleWeeklyDataMap[roleId];
  if (!meta) return "";

  const lines: string[] = [];
  lines.push(`【${meta.icon} ${meta.name} · ${roleId}】${meta.description}`);
  lines.push(`状态：${weekly.status}`);
  if (weekly.blockers.length) lines.push(`阻塞：${weekly.blockers.join("；")}`);
  if (daily?.today?.length) lines.push(`今日 Top3：${daily.today.map((t, i) => `${i + 1}. ${t}`).join("；")}`);
  if (weekly.nextWeek.length) lines.push(`本周关键：${weekly.nextWeek.join("；")}`);
  if (daily?.blocker) lines.push(`今日阻塞：${daily.blocker}`);
  lines.push("目标（按进度升序，滞后优先）：");
  lines.push(formatGoals(roleId));
  lines.push("指标（按进度升序，滞后优先）：");
  lines.push(formatMetrics(roleId));
  return lines.join("\n");
}

// ── 提示语（User Prompt）────────────────────────

/** 序列化历史任务（借鉴以前的任务内容，最多 15 条）。 */
function formatHistory(history?: OkrTaskItem[]): string {
  if (!history || !history.length) return "";
  return history
    .slice(-15)
    .map((it, i) => `${i + 1}. [${it.roleName}] ${it.title}（skill=${it.skill} · agent=${it.agent} · mcp=${it.mcp || "—"}）`)
    .join("\n");
}

/** 单条重生成提示语：为指定角色重新推荐一条任务（替代已失效的旧任务，要求与之不同）。 */
export function buildSingleItemPrompt(listType: OkrListType, roleId: string, excludeTitle: string, history?: OkrTaskItem[]): string {
  const ctx = formatRoleDetail(roleId);
  const label = rolesData[roleId]?.name ?? roleId;
  const today = dayjs().format("YYYY-MM-DD");
  const weekStart = dayjs().startOf("week").add(1, "day").format("YYYY-MM-DD");
  const weekEnd = dayjs().startOf("week").add(5, "day").format("YYYY-MM-DD");

  const focus =
    listType === "risk"
      ? "聚焦该角色的 blockers / blocked 目标，给出「解除阻塞」的下一步动作"
      : listType === "sprint"
        ? "聚焦进度最低（< 40%）的 Key Result / 指标，给出本周可完成的推进任务"
        : listType === "weekly"
          ? "聚焦本周关键里程碑（nextWeek）与滞后目标"
          : "聚焦逾期/临期 Action Item、今日 Top3、进度 < 40% 的 Key Result 推进动作";
  const due = listType === "daily" ? `dueDate 取今天（${today}）或明天` : `dueDate 落在本周（${weekStart} ~ ${weekEnd}）`;

  let prompt = `请基于以下 OKR 上下文，为「${label}」重新推荐一条任务（仅 1 条）：
- 该任务用于替代已失效的任务「${excludeTitle}」，请给出一个与之不同的、当前最该做的新任务。
- ${focus}。
- ${due}。

OKR 上下文：
${ctx}`;

  const hist = formatHistory(history);
  if (hist) {
    prompt += `\n\n历史任务（借鉴以前的任务内容，避免重复、延续上下文）：\n${hist}`;
  }
  return prompt;
}

/** 为 Action Item 重新生成更聚焦的标题 + 优先级 + 关联目标（保留既有 deadline / owner / role）。
 *  与任务清单不同：Action Item 有既定截止日期与责任人，AI 只应优化「做什么」与「多优先」。 */
export function buildActionItemPrompt(roleId: string, currentTitle: string, deadline: string): string {
  const ctx = formatRoleDetail(roleId);
  const label = rolesData[roleId]?.name ?? roleId;
  return `请基于以下 OKR 上下文，为「${label}」优化一条 Action Item（仅 1 条）：
- 现有 Action Item：${currentTitle}${deadline ? `（截止 ${deadline}）` : ""}。
- 请给出一个更具体、可验收、含动作动词的新标题（≤30 字），并重新评估其优先级与关联目标（goalId）。
- 截止日期保持 ${deadline || "未设"} 不变，只需优化标题、优先级、关联目标。

OKR 上下文：
${ctx}`;
}

/** 为某清单整体生成推荐任务：scope="all" 覆盖全部角色，否则仅指定角色。
 *  与 buildSingleItemPrompt 的 focus/due 口径一致，仅多角色 + 多条数。 */
export function buildListPrompt(listType: OkrListType, scope: OkrScope, countPerRole = 2, history?: OkrTaskItem[]): string {
  const roles = scope === "all" ? Object.keys(rolesData) : [scope];
  const label = scope === "all" ? "各角色" : rolesData[scope]?.name ?? scope;
  const icon = LIST_TYPES.find(l => l.key === listType)?.icon ?? "";
  const today = dayjs().format("YYYY-MM-DD");
  const weekStart = dayjs().startOf("week").add(1, "day").format("YYYY-MM-DD");
  const weekEnd = dayjs().startOf("week").add(5, "day").format("YYYY-MM-DD");

  const focus =
    listType === "risk"
      ? "聚焦各角色的 blockers / blocked 目标，给出「解除阻塞」的下一步动作"
      : listType === "sprint"
        ? "聚焦进度最低（< 40%）的 Key Result / 指标，给出本周可完成的推进任务"
        : listType === "weekly"
          ? "聚焦本周关键里程碑（nextWeek）与滞后目标"
          : "聚焦逾期/临期 Action Item、今日 Top3、进度 < 40% 的 Key Result 推进动作";
  const due = listType === "daily" ? `dueDate 取今天（${today}）或明天` : `dueDate 落在本周（${weekStart} ~ ${weekEnd}）`;

  const ctx = roles.map(r => formatRoleDetail(r)).filter(Boolean).join("\n\n");

  let prompt = `请基于以下 OKR 上下文，为「${label}」推荐${icon}清单（每角色 ${countPerRole} 条）：
- ${focus}。
- ${due}。

OKR 上下文：
${ctx}`;

  const hist = formatHistory(history);
  if (hist) {
    prompt += `\n\n历史任务（借鉴以前的任务内容，避免重复、延续上下文）：\n${hist}`;
  }
  return prompt;
}

// ── 解析模型返回（容错）─────────────────────────

function clampEffort(v: unknown): OkrTaskItem["effort"] {
  const s = String(v ?? "").toUpperCase();
  return (VALID_EFFORT as readonly string[]).includes(s) ? (s as OkrTaskItem["effort"]) : "M";
}

function roleMeta(roleId: string) {
  const meta = rolesData[roleId];
  return meta ? { roleName: meta.name, roleIcon: meta.icon } : { roleName: roleId, roleIcon: "👤" };
}

/** 把模型返回的原始对象规整成 OkrTaskItem。 */
function normalizeItem(raw: unknown, scope: OkrScope, index: number, listType?: OkrListType): OkrTaskItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const title = String(o.title ?? "").trim();
  if (!title) return null;

  const role = String(o.role ?? "").trim();
  const validRole = rolesData[role] ? role : scope !== "all" ? scope : "executiver";
  const { roleName, roleIcon } = roleMeta(validRole);

  const dueDate = String(o.dueDate ?? "").trim();
  const goalId = String(o.goalId ?? "").trim();
  const metricId = String(o.metricId ?? "").trim();
  const roi = clampLevel(o.roi);
  const difficulty = clampLevel(o.difficulty);
  // 优先用模型给出的紧迫度，缺失时由截止时间推导
  const urgency = o.urgency != null && String(o.urgency).trim() !== "" ? clampLevel(o.urgency) : urgencyFromDue(dueDate);
  const score = scoreTask(roi, difficulty, urgency);
  const metric = resolveMetric(validRole, metricId, goalId);
  const orchestration = applyOrchestration({ role: validRole, listType, skill: o.skill, agent: o.agent, mcp: o.mcp });

  return {
    id: `okr-${scope}-${index}`,
    title,
    role: validRole,
    roleName,
    roleIcon,
    priority: priorityFromScore(score),
    goalId,
    metricId,
    metric,
    effort: clampEffort(o.effort),
    dueDate,
    reason: String(o.reason ?? "").trim(),
    roi,
    difficulty,
    urgency,
    score,
    ...orchestration
  };
}

/** 从模型输出中提取第一个 JSON 数组（容忍 markdown 围栏 / 前后缀）。 */
function extractJsonArray(text: string): unknown[] | null {
  const trimmed = text.trim();
  // 1) 直接解析整个文本
  try {
    const v = JSON.parse(trimmed);
    if (Array.isArray(v)) return v;
    if (v && Array.isArray(v.items)) return v.items;
  } catch {
    /* fallthrough */
  }
  // 2) 定位第一个 [ 与最后一个 ]
  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");
  if (start !== -1 && end > start) {
    try {
      const v = JSON.parse(trimmed.slice(start, end + 1));
      if (Array.isArray(v)) return v;
    } catch {
      /* fallthrough */
    }
  }
  return null;
}

/** 解析模型返回的推荐结果；解析失败返回空数组。 */
export function parseRecommendation(raw: string, scope: OkrScope, listType?: OkrListType): OkrTaskItem[] {
  const arr = extractJsonArray(raw);
  if (!arr) return [];
  return arr
    .map((item, i) => normalizeItem(item, scope, i, listType))
    .filter((x): x is OkrTaskItem => x !== null)
    .sort((a, b) => b.score - a.score); // 综合评分降序，快速见效项排最前
}

/** 解析模型对单条 Action Item 的优化响应（buildActionItemPrompt 的输出）：
 *  提取新标题 + 优先级 + 关联目标，既有 deadline / owner / role 由调用方保留合并。 */
export function parseActionItem(raw: string): { title: string; priority: OkrPriority; goalId: string } | null {
  const arr = extractJsonArray(raw);
  if (!arr) return null;
  const o = (arr[0] ?? {}) as Record<string, unknown>;
  const title = String(o.title ?? o.action ?? "").trim();
  if (!title) return null;
  return {
    title,
    priority: clampPriority(o.priority),
    goalId: String(o.goalId ?? o.goal ?? "").trim()
  };
}

// ── 知识库序列化（任务 ⇄ 扁平 frontmatter）─────────
//
// OkrRecommendPanel 把推荐任务落盘到 YiKnowledge/okr/，每个任务以扁平字段
// 携带自身指标数据（metric* 前缀），读回时原样重建、不再依赖静态 id 解析。

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
export function taskFromMeta(meta: Record<string, unknown>, fallbackId: string): OkrTaskItem | null {
  const title = typeof meta.title === "string" ? meta.title : "";
  if (!title) return null;
  const role = typeof meta.role === "string" ? meta.role : "executiver";
  const { roleName, roleIcon } = roleMeta(role);
  const goalId = typeof meta.goalId === "string" ? meta.goalId : "";
  const metricId = typeof meta.metricId === "string" ? meta.metricId : "";
  const metric = metricFromMeta(meta, role, metricId, goalId);
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
//
// 与推荐任务（okr-task）合并进同一张表：Action Item 是「已承诺的执行项」，
// 有既定的状态（status）与进度（progress）。映射到统一行时用 progress 填充
// score 栏、status 填充 reason 栏，并保留自身字段供表格差异化渲染。

export interface OkrActionItem extends OkrTaskItem {
  kind: "action";
  /** Action Item 也归属某个清单（daily/weekly/risk/sprint），随 frontmatter 落盘。 */
  listType: OkrListType;
  status: string;
  progress: number;
  owner: string;
  subtaskCount: number;
  filePath: string;
}

/** 从 okr-action 的 frontmatter 重建表格行；无 title 视为无效返回 null。 */
export function actionItemFromMeta(meta: Record<string, unknown>, fallbackId: string): OkrActionItem | null {
  const title = typeof meta.title === "string" ? meta.title : "";
  if (!title) return null;
  const role = typeof meta.role === "string" ? meta.role : "";
  const { roleName, roleIcon } = roleMeta(role);
  const goalId = typeof meta.goal === "string" ? meta.goal : typeof meta.goalId === "string" ? meta.goalId : "";
  const deadline = typeof meta.deadline === "string" ? meta.deadline : "";
  const status = typeof meta.status === "string" ? meta.status : "Planned";
  const progress = toNumber(meta.progress);
  const priority = clampPriority(meta.priority);
  const metricId = typeof meta.metricId === "string" ? meta.metricId : "";
  const reason = typeof meta.reason === "string" ? meta.reason : "";
  const listType: OkrListType = LIST_TYPES.some(l => l.key === meta.listType) ? (meta.listType as OkrListType) : "sprint";
  return {
    id: typeof meta.id === "string" ? meta.id : fallbackId,
    title,
    role,
    roleName,
    roleIcon,
    priority,
    goalId,
    metricId,
    metric: resolveMetric(role, metricId, goalId),
    effort: "M",
    dueDate: deadline,
    reason,
    roi: priority === "P0" ? "high" : priority === "P1" ? "medium" : "low",
    difficulty: "medium",
    urgency: urgencyFromDue(deadline),
    score: progress,
    skill: typeof meta.skill === "string" ? meta.skill : "",
    agent: typeof meta.agent === "string" ? meta.agent : "",
    mcp: (typeof meta.mcp === "string" ? meta.mcp : "") as OkrMcp,
    kind: "action",
    listType,
    status,
    progress,
    owner: typeof meta.owner === "string" ? meta.owner : "",
    subtaskCount: toNumber(meta.subtaskCount),
    filePath: ""
  };
}
