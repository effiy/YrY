// ═══════════════════════════════════════════════════════════════════
// OKR 推荐任务 — AI 交互（提示语构建 + 模型输出解析）
// ═══════════════════════════════════════════════════════════════════
import dayjs from "dayjs";
import { skills as SKILLS } from "@/views/knowledge/skills/constants";
import { applyOrchestration } from "./okrOrchestration";
import { rd, gd, md, clampLevel, clampEffort, clampPriority, urgencyFromDue, scoreTask, priorityFromScore, resolveMetric, roleMeta } from "./okrUtils";
import type { OkrMetadataContext, OkrListType, OkrScope, OkrTaskItem } from "./okrTypes";
import { LIST_TYPES } from "./okrTypes";

// ── 供 system prompt 使用的技能 id 清单 ─────────────

const SKILL_ID_LIST = SKILLS.map(s => s.id).join(", ");

// ── 提示语（System Prompt）───────────────────────

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
  "role": "角色 id：executive | product | leader | engineer | sre | aier | curator",
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

function krAvg(goal: import("./okrTypes").GoalItem): number {
  if (!goal.keyResults.length) return 0;
  return Math.round(goal.keyResults.reduce((s, kr) => s + kr.progress, 0) / goal.keyResults.length);
}

function metricProgress(m: import("./okrTypes").MetricItem): number {
  return typeof m.progress === "number" ? m.progress : 0;
}

/** 序列化单个角色的目标（按进度升序，滞后优先）。 */
function formatGoals(roleId: string, ctx?: OkrMetadataContext, limit = 6): string {
  const goals = gd(ctx)[roleId] || [];
  const sorted = [...goals].sort((a, b) => krAvg(a) - krAvg(b)).slice(0, limit);
  return sorted
    .map(g => {
      const krs = g.keyResults.map(kr => `  - [${kr.progress}%] ${kr.text}`).join("\n");
      return `  ${g.id} ${g.title}（${g.status} · ${g.period}）\n${krs}`;
    })
    .join("\n");
}

/** 序列化单个角色的指标（按进度升序，滞后优先）。 */
function formatMetrics(roleId: string, ctx?: OkrMetadataContext, limit = 8): string {
  const metrics = md(ctx)[roleId] || [];
  const sorted = [...metrics].sort((a, b) => metricProgress(a) - metricProgress(b)).slice(0, limit);
  return sorted
    .map(m => `  ${m.id} ${m.name}：当前 ${m.current}${m.unit} / 目标 ${m.target}${m.unit}（${metricProgress(m)}%）`)
    .join("\n");
}

/** 单个角色详细上下文（今日 / 本周推荐时用）。 */
function formatRoleDetail(roleId: string, ctx?: OkrMetadataContext): string {
  const meta = rd(ctx)[roleId];
  const daily = ctx?.roleDailyDataMap?.[roleId];
  const weekly = ctx?.roleWeeklyDataMap?.[roleId];
  if (!meta) return "";

  const lines: string[] = [];
  lines.push(`【${meta.icon} ${meta.name} · ${roleId}】${meta.description}`);
  if (weekly) {
    lines.push(`状态：${weekly.status}`);
    if (weekly.blockers.length) lines.push(`阻塞：${weekly.blockers.map(b => b.text).join("；")}`);
    if (weekly.nextWeek.length) lines.push(`本周关键：${weekly.nextWeek.map(n => n.text).join("；")}`);
  }
  if (daily?.today?.length) lines.push(`今日 Top3：${daily.today.map((t, i) => `${i + 1}. ${t}`).join("；")}`);
  if (daily?.blocker) lines.push(`今日阻塞：${daily.blocker}`);
  lines.push("目标（按进度升序，滞后优先）：");
  lines.push(formatGoals(roleId, ctx));
  lines.push("指标（按进度升序，滞后优先）：");
  lines.push(formatMetrics(roleId, ctx));
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
export function buildSingleItemPrompt(
  listType: OkrListType,
  roleId: string,
  excludeTitle: string,
  history?: OkrTaskItem[],
  ctx?: OkrMetadataContext
): string {
  const ctx2 = formatRoleDetail(roleId, ctx);
  const label = rd(ctx)[roleId]?.name ?? roleId;
  const today = dayjs().format("YYYY-MM-DD");
  const weekStart = dayjs().startOf("week").add(1, "day").format("YYYY-MM-DD");
  const weekEnd = dayjs().startOf("week").add(5, "day").format("YYYY-MM-DD");

  const focus =
    listType === "risk"
      ? "聚焦该角色的 blockers / blocked 目标，给出「解除阻塞」的下一步动作"
      : listType === "weekly"
        ? "聚焦本周关键里程碑（nextWeek）与滞后目标"
        : "聚焦逾期/临期 Action Item、今日 Top3、进度 < 40% 的 Key Result 推进动作";
  const due = listType === "daily" ? `dueDate 取今天（${today}）或明天` : `dueDate 落在本周（${weekStart} ~ ${weekEnd}）`;

  let prompt = `请基于以下 OKR 上下文，为「${label}」重新推荐一条任务（仅 1 条）：
- 该任务用于替代已失效的任务「${excludeTitle}」，请给出一个与之不同的、当前最该做的新任务。
- ${focus}。
- ${due}。

OKR 上下文：
${ctx2}`;

  const hist = formatHistory(history);
  if (hist) {
    prompt += `\n\n历史任务（借鉴以前的任务内容，避免重复、延续上下文）：\n${hist}`;
  }
  return prompt;
}

/** 为 Action Item 重新生成更聚焦的标题 + 优先级 + 关联目标（保留既有 deadline / owner / role）。 */
export function buildActionItemPrompt(roleId: string, currentTitle: string, deadline: string, ctx?: OkrMetadataContext): string {
  const detail = formatRoleDetail(roleId, ctx);
  const label = rd(ctx)[roleId]?.name ?? roleId;
  return `请基于以下 OKR 上下文，为「${label}」优化一条 Action Item（仅 1 条）：
- 现有 Action Item：${currentTitle}${deadline ? `（截止 ${deadline}）` : ""}。
- 请给出一个更具体、可验收、含动作动词的新标题（≤30 字），并重新评估其优先级与关联目标（goalId）。
- 截止日期保持 ${deadline || "未设"} 不变，只需优化标题、优先级、关联目标。

OKR 上下文：
${detail}`;
}

/** 为某清单整体生成推荐任务：scope="all" 覆盖全部角色，否则仅指定角色。 */
export function buildListPrompt(
  listType: OkrListType,
  scope: OkrScope,
  countPerRole = 2,
  history?: OkrTaskItem[],
  ctx?: OkrMetadataContext
): string {
  const roles = scope === "all" ? Object.keys(rd(ctx)) : [scope];
  const label = scope === "all" ? "各角色" : (rd(ctx)[scope]?.name ?? scope);
  const icon = LIST_TYPES.find(l => l.key === listType)?.icon ?? "";
  const today = dayjs().format("YYYY-MM-DD");
  const weekStart = dayjs().startOf("week").add(1, "day").format("YYYY-MM-DD");
  const weekEnd = dayjs().startOf("week").add(5, "day").format("YYYY-MM-DD");

  const focus =
    listType === "risk"
      ? "聚焦各角色的 blockers / blocked 目标，给出「解除阻塞」的下一步动作"
      : listType === "weekly"
        ? "聚焦本周关键里程碑（nextWeek）与滞后目标"
        : "聚焦逾期/临期 Action Item、今日 Top3、进度 < 40% 的 Key Result 推进动作";
  const due = listType === "daily" ? `dueDate 取今天（${today}）或明天` : `dueDate 落在本周（${weekStart} ~ ${weekEnd}）`;

  const detail = roles
    .map(r => formatRoleDetail(r, ctx))
    .filter(Boolean)
    .join("\n\n");

  let prompt = `请基于以下 OKR 上下文，为「${label}」推荐${icon}清单（每角色 ${countPerRole} 条）：
- ${focus}。
- ${due}。

OKR 上下文：
${detail}`;

  const hist = formatHistory(history);
  if (hist) {
    prompt += `\n\n历史任务（借鉴以前的任务内容，避免重复、延续上下文）：\n${hist}`;
  }
  return prompt;
}

// ── 解析模型返回（容错）─────────────────────────

/** 把模型返回的原始对象规整成 OkrTaskItem。 */
function normalizeItem(
  raw: unknown,
  scope: OkrScope,
  index: number,
  listType?: OkrListType,
  ctx?: OkrMetadataContext
): OkrTaskItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const title = String(o.title ?? "").trim();
  if (!title) return null;

  const role = String(o.role ?? "").trim();
  const validRole = rd(ctx)[role] ? role : scope !== "all" ? scope : "executive";
  const { roleName, roleIcon } = roleMeta(validRole, ctx);

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
export function parseRecommendation(
  raw: string,
  scope: OkrScope,
  listType?: OkrListType,
  ctx?: OkrMetadataContext
): OkrTaskItem[] {
  const arr = extractJsonArray(raw);
  if (!arr) return [];
  return arr
    .map((item, i) => normalizeItem(item, scope, i, listType, ctx))
    .filter((x): x is OkrTaskItem => x !== null)
    .sort((a, b) => b.score - a.score); // 综合评分降序，快速见效项排最前
}

/** 解析模型对单条 Action Item 的优化响应（buildActionItemPrompt 的输出）。 */
export function parseActionItem(raw: string): { title: string; priority: import("./okrTypes").OkrPriority; goalId: string } | null {
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