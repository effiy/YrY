// ═══════════════════════════════════════════════════════════════════
// AI 自主推荐 OKR 任务清单 — 核心逻辑（纯函数，无 Vue 依赖）
//
// 参考 deepseek-harness 的「todo/」能力（Pi/dsh parity）：
//   - 能力即插件：把各角色的 OKR 上下文（目标 / 关键结果 / 指标 / 阻塞）
//     拼装成模型可见的 prompt，让模型自主推导「现在最该做什么」。
//   - 模型可见 ⟺ 可重放：推荐结果回落到确定性的 fallback，保证在没有
//     LLM 可用时也能生成一份可复现的任务清单（session log 精神）。
//
// 职责：
//   1. 定义推荐任务的数据结构 OkrTaskItem
//   2. 拼装 system prompt + user prompt（提示语）
//   3. 从 OKR 静态数据构建模型可见的上下文
//   4. 解析模型返回的 JSON（容错）
//   5. 生成确定性的 fallback 推荐（LLM 不可用 / 超时时兜底）
// ═══════════════════════════════════════════════════════════════════
import dayjs from "dayjs";
import {
  rolesData,
  goalsData,
  metricsData,
  roleDailyDataMap,
  roleWeeklyDataMap,
  ROLE_IDS
} from "@/views/knowledge/executiver/okrData";
import type { GoalItem, MetricItem } from "@/views/knowledge/executiver/okrData";

// ── 类型 ────────────────────────────────────────

export type OkrHorizon = "daily" | "weekly";
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
  effort: "S" | "M" | "L";
  dueDate: string; // YYYY-MM-DD
  reason: string; // 推荐理由
  roi: OkrLevel; // ROI / 价值
  difficulty: OkrLevel; // MVP 实现难度
  urgency: OkrLevel; // 紧迫度
  score: number; // 综合优先级评分 0-100（WSJF：价值 × 紧迫度 ÷ 难度）
}

export interface OkrRecommendResult {
  items: OkrTaskItem[];
  source: "ai" | "fallback";
}

/** 清单元数据：面板渲染的多个「推荐清单」。 */
export interface OkrListMeta {
  key: OkrListType;
  icon: string;
  horizon: OkrHorizon;
  count: number;
}

export const LIST_TYPES: OkrListMeta[] = [
  { key: "daily", icon: "📅", horizon: "daily", count: 6 },
  { key: "weekly", icon: "🗓", horizon: "weekly", count: 6 },
  { key: "risk", icon: "🚨", horizon: "daily", count: 5 },
  { key: "sprint", icon: "🎯", horizon: "weekly", count: 5 }
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
  "reason": "推荐理由（一句话）"
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

/** 全角色精简上下文（scope = all 时用，避免 prompt 过长）。 */
function formatRoleCompact(roleId: string): string {
  const meta = rolesData[roleId];
  const weekly = roleWeeklyDataMap[roleId];
  if (!meta) return "";

  const goals = (goalsData[roleId] || []).sort((a, b) => krAvg(a) - krAvg(b));
  const laggingGoals = goals.filter(g => krAvg(g) < 50).slice(0, 2);
  const laggingMetrics = (metricsData[roleId] || [])
    .sort((a, b) => metricProgress(a) - metricProgress(b))
    .filter(m => metricProgress(m) < 50)
    .slice(0, 2);

  const lines: string[] = [];
  lines.push(`【${meta.icon} ${meta.name} · ${roleId}】状态：${weekly.status}`);
  if (weekly.blockers.length) lines.push(`  阻塞：${weekly.blockers.join("；")}`);
  if (weekly.nextWeek.length) lines.push(`  本周关键：${weekly.nextWeek.join("；")}`);
  if (laggingGoals.length) lines.push(`  滞后目标：${laggingGoals.map(g => `${g.id} ${g.title}（${krAvg(g)}%）`).join("；")}`);
  if (laggingMetrics.length) lines.push(`  滞后指标：${laggingMetrics.map(m => `${m.name} ${m.current}${m.unit}→${m.target}${m.unit}`).join("；")}`);
  return lines.join("\n");
}

/** 构建模型可见的 OKR 上下文。 */
export function buildOkrContext(scope: OkrScope): string {
  const roles = scope === "all" ? [...ROLE_IDS] : [scope];
  const formatter = scope === "all" ? formatRoleCompact : formatRoleDetail;
  return roles.map(formatter).filter(Boolean).join("\n\n");
}

// ── 提示语（User Prompt）────────────────────────

function scopeLabel(scope: OkrScope): string {
  if (scope === "all") return "全部角色";
  return rolesData[scope]?.name ?? scope;
}

export function buildUserPrompt(listType: OkrListType, scope: OkrScope): string {
  const ctx = buildOkrContext(scope);
  const today = dayjs().format("YYYY-MM-DD");
  const weekStart = dayjs().startOf("week").add(1, "day").format("YYYY-MM-DD"); // 周一
  const weekEnd = dayjs().startOf("week").add(5, "day").format("YYYY-MM-DD"); // 周五
  const label = scopeLabel(scope);

  switch (listType) {
    case "daily":
      return `请基于以下 OKR 上下文，为「${label}」自主推荐今日任务清单（6 条）：
- 优先处理：逾期/临期的 Action Item、今日 Top3、阻塞项的下一步动作、进度 < 40% 的 Key Result 推进动作。
- dueDate 一律取今天（${today}）或明天。

OKR 上下文：
${ctx}`;
    case "weekly":
      return `请基于以下 OKR 上下文，为「${label}」自主推荐本周任务清单（6 条）：
- 优先处理：本周关键里程碑（nextWeek）、进度最滞后的 Objective/Key Result、需要跨角色协作的事项、本周到期的 Action Item。
- dueDate 落在本周（${weekStart} ~ ${weekEnd}）。

OKR 上下文：
${ctx}`;
    case "risk":
      return `请基于以下 OKR 上下文，为「${label}」自主推荐「风险与阻塞」处理清单（5 条）：
- 聚焦：各角色 blockers、状态为 blocked / At Risk 的目标、逾期未完成的 Action Item。
- 每个任务给出「解除阻塞」的下一步可执行动作。
- dueDate 优先今天（${today}）或本周。

OKR 上下文：
${ctx}`;
    case "sprint":
      return `请基于以下 OKR 上下文，为「${label}」自主推荐「目标冲刺」清单（5 条）：
- 聚焦：进度最低（progress < 40%）的 Key Result 与指标。
- 每个滞后项给出一个本周内能完成的推进任务。
- dueDate 落在本周（${weekStart} ~ ${weekEnd}）。

OKR 上下文：
${ctx}`;
    default:
      return ctx;
  }
}

/** 单条重生成提示语：为指定角色重新推荐一条任务（替代已失效的旧任务，要求与之不同）。 */
export function buildSingleItemPrompt(listType: OkrListType, roleId: string, excludeTitle: string): string {
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

  return `请基于以下 OKR 上下文，为「${label}」重新推荐一条任务（仅 1 条）：
- 该任务用于替代已失效的任务「${excludeTitle}」，请给出一个与之不同的、当前最该做的新任务。
- ${focus}。
- ${due}。

OKR 上下文：
${ctx}`;
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
function normalizeItem(raw: unknown, scope: OkrScope, index: number): OkrTaskItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const title = String(o.title ?? "").trim();
  if (!title) return null;

  const role = String(o.role ?? "").trim();
  const validRole = rolesData[role] ? role : scope !== "all" ? scope : "executiver";
  const { roleName, roleIcon } = roleMeta(validRole);

  const dueDate = String(o.dueDate ?? "").trim();
  const roi = clampLevel(o.roi);
  const difficulty = clampLevel(o.difficulty);
  // 优先用模型给出的紧迫度，缺失时由截止时间推导
  const urgency = o.urgency != null && String(o.urgency).trim() !== "" ? clampLevel(o.urgency) : urgencyFromDue(dueDate);
  const score = scoreTask(roi, difficulty, urgency);

  return {
    id: `okr-${scope}-${index}`,
    title,
    role: validRole,
    roleName,
    roleIcon,
    priority: priorityFromScore(score),
    goalId: String(o.goalId ?? "").trim(),
    metricId: String(o.metricId ?? "").trim(),
    effort: clampEffort(o.effort),
    dueDate,
    reason: String(o.reason ?? "").trim(),
    roi,
    difficulty,
    urgency,
    score
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
export function parseRecommendation(raw: string, scope: OkrScope): OkrTaskItem[] {
  const arr = extractJsonArray(raw);
  if (!arr) return [];
  return arr
    .map((item, i) => normalizeItem(item, scope, i))
    .filter((x): x is OkrTaskItem => x !== null)
    .sort((a, b) => b.score - a.score); // 综合评分降序，快速见效项排最前
}

// ── 确定性 fallback（LLM 不可用 / 超时）─────────
//
// 与 AI 输出同构，直接从静态 OKR 数据推导，保证「刷新推荐」永远有结果。

function fallbackItem(
  partial: Partial<OkrTaskItem> & { title: string; role: string },
  index: number
): OkrTaskItem {
  const { roleName, roleIcon } = roleMeta(partial.role);
  const dueDate = partial.dueDate ?? dayjs().format("YYYY-MM-DD");
  const roi = partial.roi ?? "medium";
  const difficulty = partial.difficulty ?? "medium";
  const urgency = partial.urgency ?? urgencyFromDue(dueDate);
  const score = scoreTask(roi, difficulty, urgency);
  return {
    id: `okr-fb-${index}`,
    title: partial.title,
    role: partial.role,
    roleName,
    roleIcon,
    priority: priorityFromScore(score),
    goalId: partial.goalId ?? "",
    metricId: partial.metricId ?? "",
    effort: partial.effort ?? "M",
    dueDate,
    reason: partial.reason ?? "",
    roi,
    difficulty,
    urgency,
    score
  };
}

export function fallbackRecommendation(listType: OkrListType, scope: OkrScope): OkrTaskItem[] {
  const roles = scope === "all" ? [...ROLE_IDS] : [scope];
  const items: OkrTaskItem[] = [];
  const today = dayjs().format("YYYY-MM-DD");
  const weekEnd = dayjs().startOf("week").add(5, "day").format("YYYY-MM-DD"); // 周五
  let idx = 0;

  for (const roleId of roles) {
    const daily = roleDailyDataMap[roleId];
    const weekly = roleWeeklyDataMap[roleId];
    const meta = rolesData[roleId];
    if (!meta) continue;

    const firstActiveGoal = (goalsData[roleId] || []).find(g => g.status === "active");
    const goalId = firstActiveGoal?.id ?? "";

    switch (listType) {
      case "daily": {
        (daily?.today ?? []).slice(0, 3).forEach((t, i) => {
          items.push(fallbackItem({
            title: t,
            role: roleId,
            goalId,
            effort: "M",
            dueDate: today,
            roi: i === 0 ? "high" : "medium",
            difficulty: "low",
            urgency: "high"
          }, idx++));
        });
        if (daily?.blocker) {
          items.push(fallbackItem({
            title: `解除阻塞：${daily.blocker}`,
            role: roleId,
            goalId,
            effort: "S",
            dueDate: today,
            roi: "high",
            difficulty: "low",
            urgency: "high",
            reason: "今日阻塞项，需优先推进"
          }, idx++));
        }
        break;
      }
      case "weekly": {
        (weekly.nextWeek ?? []).slice(0, 3).forEach(t => {
          items.push(fallbackItem({
            title: t,
            role: roleId,
            goalId,
            effort: "L",
            dueDate: weekEnd,
            roi: "medium",
            difficulty: "low",
            urgency: "medium"
          }, idx++));
        });
        break;
      }
      case "risk": {
        (weekly.blockers ?? []).forEach(b => {
          items.push(fallbackItem({
            title: `解除阻塞：${b}`,
            role: roleId,
            goalId,
            effort: "S",
            dueDate: today,
            roi: "high",
            difficulty: "low",
            urgency: "high",
            reason: "阻塞项，需解除"
          }, idx++));
        });
        // blocked 目标 → 处理动作
        (goalsData[roleId] || []).filter(g => g.status === "blocked").forEach(g => {
          items.push(fallbackItem({
            title: `推进被阻塞目标：${g.title}`,
            role: roleId,
            goalId: g.id,
            effort: "M",
            dueDate: weekEnd,
            roi: "high",
            difficulty: "high",
            urgency: "high",
            reason: "目标处于 blocked 状态"
          }, idx++));
        });
        break;
      }
      case "sprint": {
        (goalsData[roleId] || [])
          .sort((a, b) => krAvg(a) - krAvg(b))
          .filter(g => krAvg(g) < 40)
          .slice(0, 2)
          .forEach(g => {
            const laggingKr = g.keyResults.find(kr => kr.progress < 40);
            items.push(fallbackItem({
              title: laggingKr ? `冲刺 ${g.id}：${laggingKr.text}` : `冲刺目标：${g.title}`,
              role: roleId,
              goalId: g.id,
              effort: "L",
              dueDate: weekEnd,
              roi: "high",
              difficulty: "high",
              urgency: "medium",
              reason: `目标整体进度 ${krAvg(g)}%，滞后`
            }, idx++));
          });
        break;
      }
    }
  }

  return items
    .sort((a, b) => b.score - a.score)
    .slice(0, LIST_TYPES.find(l => l.key === listType)?.count ?? 6);
}
