import http from "@/api/index";
import type { AxiosProgressEvent, GenericAbortSignal } from "axios";

/* =========================================================
 * Type definitions — shared contract
 * =======================================================*/

/** 8 大知识维度，顺序严格对照 v3.2 SSOT §1.2。 */
export type ReadingDimension =
  | "strategy"
  | "management"
  | "engineering"
  | "frontend"
  | "sre"
  | "ai"
  | "product"
  | "cognition";

/** 9 角色矩阵（Q4 起新增 CFO / Head-of-People）。 */
export type ReadingRole =
  | "ceo"
  | "cfo"
  | "cpo"
  | "vp-eng"
  | "cto"
  | "head-of-people"
  | "sre-lead"
  | "qa-lead"
  | "sec-lead";

/** 资源类型：书籍 / 论文 / 文章，命名不使用数字。 */
export type ReadingType = "book" | "paper" | "article";

/** 优先级：high / medium / low。 */
export type ReadingPriority = "high" | "medium" | "low";

/** 蒸馏 7 状态机 — 与 §6 Queued→Archived 严格对齐。 */
export type ReadingStatus =
  | "queued"
  | "reading"
  | "noted"
  | "actionized"
  | "distilled"
  | "reviewed"
  | "archived";

/** RICE 四要素（0-100 归一化），最终分数会在服务端按公式重算。 */
export interface RICEScore {
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  /** 0–100 最终分；空时由服务端或前端 fallback 计算。 */
  final?: number;
}

/** RICE Tier，命名完全语义化，不包含数字。 */
export type RICETier = "elite" | "strong" | "fair" | "weak";

/** 统一的 9 字段阅读条目（v3.2 契约 §0.1）。 */
export interface ReadingItem {
  /** 业务主键，如 H-03；兜底映射到 _id。 */
  key?: string;
  _id?: string;
  title: string;
  subtitle?: string;
  author?: string;
  type: ReadingType;
  dimension: ReadingDimension;
  /** 主要负责角色（主视角）；可多角色辅助。 */
  ownerRole: ReadingRole;
  supportingRoles?: ReadingRole[];
  priority: ReadingPriority;
  status: ReadingStatus;
  /** 0–100（精读 0–100；泛读一般不超过 30）。 */
  progress?: number;
  rice?: RICEScore;
  /** 关联的 OKR id，如 exec-002-03。 */
  okrId?: string;
  /** 计划阅读月，YYYY-MM。 */
  scheduledMonth?: string;
  deadline?: string;
  /** 知识库笔记相对路径，用于生成路由跳转。 */
  noteKey?: string;
  /** 外链（外部文章/PDF）。 */
  externalUrl?: string;
  tags?: string[];
  summary?: string;
  /** 可证伪的「不学清单」条目数（至少 ≥ 正文章节 50%）。 */
  antiSubjectSize?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface ReadingListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: ReadingStatus | "all";
  type?: ReadingType | "all";
  priority?: ReadingPriority | "all";
  dimension?: ReadingDimension | "all";
  role?: ReadingRole | "all";
  /** 按月份过滤，格式 YYYY-MM。 */
  scheduledMonth?: string;
  sortBy?: "rice" | "priority" | "deadline" | "updatedAt";
  order?: "asc" | "desc";
}

export interface ReadingListPage {
  list: ReadingItem[];
  total: number;
  page: number;
  pageSize: number;
}

/** 维度 → 条目数（8 维全覆盖）。 */
export type DimensionBreakdown = Record<ReadingDimension, number>;
/** 角色 → 条目数。 */
export type RoleBreakdown = Record<ReadingRole, number>;
/** 月份 → 条目数。 */
export type ScheduleBreakdown = Record<string, number>;
/** 状态漏斗。 */
export type StatusBreakdown = Record<ReadingStatus, number>;
/** 优先级分布。 */
export type PriorityBreakdown = Record<ReadingPriority, number>;
/** 资源类型分布。 */
export type TypeBreakdown = Record<ReadingType, number>;

export interface ReadingAggregateStats {
  total: number;
  completedCount: number;
  inProgressCount: number;
  queuedCount: number;
  /** 0–100；所有条目 progress 的平均。 */
  averageProgress: number;
  /** 0–100。 */
  averageRice: number;
  riceTier: RICETier;
  /** 8 大维度里已非零的维度数 / 8。 */
  dimensionCoverage: number;
  dimensions: DimensionBreakdown;
  roles: RoleBreakdown;
  schedule: ScheduleBreakdown;
  statusFunnel: StatusBreakdown;
  priorities: PriorityBreakdown;
  types: TypeBreakdown;
  /** RICE 按 Tier 的计数。 */
  riceByTier: Record<RICETier, number>;
}

/** 读取维度与角色常量元数据 — 前端可直接使用，避免在组件里手写 9 个对象数组。 */
export interface ReadingMeta {
  dimensions: Array<{
    id: ReadingDimension;
    label: string;
    en: string;
    icon: string;
    color: string; /* CSS var or literal */
  }>;
  roles: Array<{
    id: ReadingRole;
    label: string;
    en: string;
    icon: string;
    color: string;
  }>;
  types: Array<{ id: ReadingType; label: string; en: string; icon: string }>;
  priorities: Array<{ id: ReadingPriority; label: string; en: string }>;
  statuses: Array<{ id: ReadingStatus; label: string; en: string }>;
  riceTiers: Array<{ id: RICETier; label: string; en: string; min: number }>;
}

/* =========================================================
 * Helpers — pure & deterministic（便于单测）
 * =======================================================*/

const DIMENSION_ORDER: ReadingDimension[] = [
  "strategy",
  "management",
  "engineering",
  "frontend",
  "sre",
  "ai",
  "product",
  "cognition"
];

const ROLE_ORDER: ReadingRole[] = [
  "ceo",
  "cfo",
  "cpo",
  "vp-eng",
  "cto",
  "head-of-people",
  "sre-lead",
  "qa-lead",
  "sec-lead"
];

const STATUS_ORDER: ReadingStatus[] = [
  "queued",
  "reading",
  "noted",
  "actionized",
  "distilled",
  "reviewed",
  "archived"
];

const PRIORITY_ORDER: ReadingPriority[] = ["high", "medium", "low"];
const TYPE_ORDER: ReadingType[] = ["article", "book", "paper"];

/** 计算 RICE final（0–100）；任何一项缺失回落到 mid。 */
export function computeRiceFinal(r?: RICEScore): number {
  if (!r) return 0;
  if (typeof r.final === "number" && Number.isFinite(r.final)) {
    return Math.max(0, Math.min(100, Math.round(r.final)));
  }
  const reach = Number.isFinite(r.reach) ? r.reach : 50;
  const impact = Number.isFinite(r.impact) ? r.impact : 50;
  const confidence = Number.isFinite(r.confidence) ? r.confidence : 50;
  const effort = Number.isFinite(r.effort) && r.effort > 0 ? r.effort : 50;
  const raw = (reach * impact * confidence) / (effort * 100);
  const normalized = Math.min(100, Math.max(0, Math.round(raw)));
  return normalized;
}

/** final 分 → 语义化 Tier（无数字命名）。 */
export function riceTierOf(finalScore: number): RICETier {
  if (finalScore >= 80) return "elite";
  if (finalScore >= 60) return "strong";
  if (finalScore >= 40) return "fair";
  return "weak";
}

/** 给条目分配稳定 key：优先 key，其次 _id，再是 title+author。 */
export function readingKey(item: ReadingItem): string {
  return item.key ?? item._id ?? `${item.title}-${item.author ?? "anon"}`;
}

/* =========================================================
 * Meta constants（SSOT — 组件内禁止再手写）
 * =======================================================*/

export const READING_META: ReadingMeta = {
  dimensions: [
    { id: "strategy", label: "战略", en: "Strategy", icon: "🏛", color: "var(--rl-dim-strategy)" },
    { id: "management", label: "管理", en: "Management", icon: "🧑‍💼", color: "var(--rl-dim-management)" },
    { id: "engineering", label: "工程", en: "Engineering", icon: "⚙️", color: "var(--rl-dim-engineering)" },
    { id: "frontend", label: "前端", en: "Frontend", icon: "🎨", color: "var(--rl-dim-frontend)" },
    { id: "sre", label: "SRE 运维", en: "SRE", icon: "🛰", color: "var(--rl-dim-sre)" },
    { id: "ai", label: "AI 智能", en: "AI", icon: "🤖", color: "var(--rl-dim-ai)" },
    { id: "product", label: "产品", en: "Product", icon: "📋", color: "var(--rl-dim-product)" },
    { id: "cognition", label: "认知", en: "Cognition", icon: "🧠", color: "var(--rl-dim-cognition)" }
  ],
  roles: [
    { id: "ceo", label: "CEO 经营决策", en: "CEO", icon: "👔", color: "var(--rl-role-ceo)" },
    { id: "cfo", label: "CFO 资本 / ROI", en: "CFO", icon: "💹", color: "var(--rl-role-cfo)" },
    { id: "cpo", label: "CPO 产品战略", en: "CPO", icon: "🧭", color: "var(--rl-role-cpo)" },
    { id: "vp-eng", label: "VP Eng 工程管理", en: "VP Eng", icon: "🧑‍💻", color: "var(--rl-role-vp-eng)" },
    { id: "cto", label: "CTO 技术路线", en: "CTO", icon: "⚛️", color: "var(--rl-role-cto)" },
    { id: "head-of-people", label: "HoP 组织人才", en: "Head of People", icon: "🧑‍🤝‍🧑", color: "var(--rl-role-hop)" },
    { id: "sre-lead", label: "SRE Lead 可靠性", en: "SRE Lead", icon: "🛰", color: "var(--rl-role-sre)" },
    { id: "qa-lead", label: "QA Lead 质量", en: "QA Lead", icon: "🧪", color: "var(--rl-role-qa)" },
    { id: "sec-lead", label: "Sec Lead 安全", en: "Sec Lead", icon: "🛡", color: "var(--rl-role-sec)" }
  ],
  types: [
    { id: "article", label: "文章", en: "Article", icon: "📄" },
    { id: "book", label: "书籍", en: "Book", icon: "📘" },
    { id: "paper", label: "论文", en: "Paper", icon: "📃" }
  ],
  priorities: [
    { id: "high", label: "高优先", en: "High" },
    { id: "medium", label: "中优先", en: "Medium" },
    { id: "low", label: "低优先", en: "Low" }
  ],
  statuses: [
    { id: "queued", label: "Queued 待读", en: "Queued" },
    { id: "reading", label: "Reading 阅读中", en: "Reading" },
    { id: "noted", label: "Noted 已记笔记", en: "Noted" },
    { id: "actionized", label: "Actionized 行动中", en: "Actionized" },
    { id: "distilled", label: "Distilled 已蒸馏", en: "Distilled" },
    { id: "reviewed", label: "Reviewed 已评审", en: "Reviewed" },
    { id: "archived", label: "Archived 已归档", en: "Archived" }
  ],
  riceTiers: [
    { id: "elite", label: "Elite 核心 · 必推", en: "Elite ≥80", min: 80 },
    { id: "strong", label: "Strong 稳健 · 必读", en: "Strong 60–79", min: 60 },
    { id: "fair", label: "Fair 观察 · 选读", en: "Fair 40–59", min: 40 },
    { id: "weak", label: "Weak 候选 · 备份", en: "Weak <40", min: 0 }
  ]
};

export const DIMENSION_LABEL_BY_ID: Record<ReadingDimension, string> =
  READING_META.dimensions.reduce<Record<string, string>>((acc, d) => {
    acc[d.id] = `${d.label} ${d.en}`;
    return acc;
  }, {}) as Record<ReadingDimension, string>;

export const ROLE_LABEL_BY_ID: Record<ReadingRole, string> = READING_META.roles.reduce<
  Record<string, string>
>((acc, r) => {
  acc[r.id] = `${r.label}`;
  return acc;
}, {}) as Record<ReadingRole, string>;

/* =========================================================
 * Aggregation — 纯函数，便于单测 & 服务端/前端复用
 * =======================================================*/

/** 把一整份清单折叠成仪表盘需要的聚合统计。 */
export function aggregateReadingStats(list: ReadingItem[]): ReadingAggregateStats {
  const safe = Array.isArray(list) ? list : [];
  const total = safe.length;

  const dimensions: DimensionBreakdown = DIMENSION_ORDER.reduce<DimensionBreakdown>((acc, k) => {
    acc[k] = 0;
    return acc;
  }, {} as DimensionBreakdown);
  const roles: RoleBreakdown = ROLE_ORDER.reduce<RoleBreakdown>((acc, k) => {
    acc[k] = 0;
    return acc;
  }, {} as RoleBreakdown);
  const statusFunnel: StatusBreakdown = STATUS_ORDER.reduce<StatusBreakdown>((acc, k) => {
    acc[k] = 0;
    return acc;
  }, {} as StatusBreakdown);
  const priorities: PriorityBreakdown = PRIORITY_ORDER.reduce<PriorityBreakdown>((acc, k) => {
    acc[k] = 0;
    return acc;
  }, {} as PriorityBreakdown);
  const types: TypeBreakdown = TYPE_ORDER.reduce<TypeBreakdown>((acc, k) => {
    acc[k] = 0;
    return acc;
  }, {} as TypeBreakdown);
  const riceByTier: Record<RICETier, number> = { elite: 0, strong: 0, fair: 0, weak: 0 };
  const schedule: ScheduleBreakdown = {};

  let progressSum = 0;
  let riceSum = 0;
  let completed = 0;
  let inProgress = 0;
  let queued = 0;
  let progressEntries = 0;
  let riceEntries = 0;
  let dimNonZero = 0;

  for (const it of safe) {
    if (it.dimension && dimensions[it.dimension] !== undefined) {
      dimensions[it.dimension] += 1;
    }
    if (it.ownerRole && roles[it.ownerRole] !== undefined) {
      roles[it.ownerRole] += 1;
    }
    if (it.status && statusFunnel[it.status] !== undefined) {
      statusFunnel[it.status] += 1;
      if (it.status === "queued") queued += 1;
      else if (it.status === "reading") inProgress += 1;
      else if (it.status === "reviewed" || it.status === "archived" || it.status === "distilled") {
        completed += 1;
      }
    }
    if (it.priority && priorities[it.priority] !== undefined) {
      priorities[it.priority] += 1;
    }
    if (it.type && types[it.type] !== undefined) {
      types[it.type] += 1;
    }
    if (it.scheduledMonth) {
      schedule[it.scheduledMonth] = (schedule[it.scheduledMonth] ?? 0) + 1;
    }
    if (typeof it.progress === "number" && Number.isFinite(it.progress)) {
      progressSum += it.progress;
      progressEntries += 1;
    }
    const r = computeRiceFinal(it.rice);
    if (r > 0) {
      riceSum += r;
      riceEntries += 1;
    }
    riceByTier[riceTierOf(r)] += 1;
  }

  for (const k of DIMENSION_ORDER) if (dimensions[k] > 0) dimNonZero += 1;

  const averageProgress = progressEntries > 0 ? Math.round(progressSum / progressEntries) : 0;
  const averageRice = riceEntries > 0 ? Math.round(riceSum / riceEntries) : 0;
  const dimensionCoverage = DIMENSION_ORDER.length > 0 ? Math.round((dimNonZero / DIMENSION_ORDER.length) * 100) : 0;

  return {
    total,
    completedCount: completed,
    inProgressCount: inProgress,
    queuedCount: queued,
    averageProgress,
    averageRice,
    riceTier: riceTierOf(averageRice),
    dimensionCoverage,
    dimensions,
    roles,
    schedule,
    statusFunnel,
    priorities,
    types,
    riceByTier
  };
}

/* =========================================================
 * HTTP API wrappers — 严格透传 {timeout, signal}
 * =======================================================*/

export function getReadingList(
  params: ReadingListQuery & { timeout?: number; signal?: GenericAbortSignal } = {}
) {
  const { timeout, signal, ...rest } = params;
  return http.get<ReadingListPage>("/reading-list", rest, { timeout, signal });
}

export function getReadingDetail(
  _id: string,
  opts: { timeout?: number; signal?: GenericAbortSignal } = {}
) {
  return http.get<ReadingItem>(`/reading-list/${_id}`, undefined, {
    timeout: opts.timeout,
    signal: opts.signal
  });
}

export function createReadingItem(
  data: Partial<ReadingItem> & { title: string; type: ReadingType; dimension: ReadingDimension },
  opts: { timeout?: number; signal?: GenericAbortSignal } = {}
) {
  return http.post<ReadingItem>("/reading-list", data, {
    timeout: opts.timeout,
    signal: opts.signal
  });
}

export function updateReadingItem(
  _id: string,
  data: Partial<ReadingItem>,
  opts: { timeout?: number; signal?: GenericAbortSignal } = {}
) {
  return http.put<ReadingItem>(`/reading-list/${_id}`, data, {
    timeout: opts.timeout,
    signal: opts.signal
  });
}

export function deleteReadingItem(
  _id: string,
  opts: { timeout?: number; signal?: GenericAbortSignal } = {}
) {
  return http.delete<{ ok: boolean }>(
    `/reading-list/${_id}`,
    undefined,
    { timeout: opts.timeout, signal: opts.signal }
  );
}

export function getReadingListCounts(opts: { timeout?: number; signal?: GenericAbortSignal } = {}) {
  return http.get<ReadingAggregateStats>("/reading-list/counts", undefined, {
    timeout: opts.timeout,
    signal: opts.signal
  });
}

/** 按 ownerRole 聚合；后端可能没有，失败时前端 fallback 用 aggregateReadingStats。 */
export function getReadingListByRole(opts: { timeout?: number; signal?: GenericAbortSignal } = {}) {
  return http.get<RoleBreakdown>("/reading-list/by-role", undefined, {
    timeout: opts.timeout,
    signal: opts.signal
  });
}

/** 按 scheduledMonth 聚合。 */
export function getReadingListByScheduledMonth(
  opts: { timeout?: number; signal?: GenericAbortSignal } = {}
) {
  return http.get<ScheduleBreakdown>("/reading-list/by-scheduled-month", undefined, {
    timeout: opts.timeout,
    signal: opts.signal
  });
}

/** 文件上传（导入种子/清单）。 */
export function uploadReadingListFile(
  formData: FormData,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
  opts: { timeout?: number; signal?: GenericAbortSignal } = {}
) {
  return http.post<{ insertedIds: string[] }>("/reading-list/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
    timeout: opts.timeout,
    signal: opts.signal
  });
}
