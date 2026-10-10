/**
 * Reading List Data Source — 阅读清单统一数据源（SSOT composable）
 *
 * 职责：
 * 1. 统一加载 reading-list 数据并按 4 级 fallback 顺序返回：
 *    后端接口 → localStorage 缓存 → 内置 fallback 种子（30 entries） → 空数组
 * 2. 提供 role / dimension / status / type / priority 的元数据全部来自 readingListService.READING_META
 * 3. 提供 Dashboard 聚合数据（aggregateReadingStats）
 * 4. 所有异步调用均透传 {timeout, signal}，避免组件内不可再手写 fetch。
 *
 * 注意：该 composable 对外只放纯数据层行为，不含 UI 交互逻辑。
 */
import { computed, onBeforeUnmount, reactive, ref, shallowRef, type ComputedRef, type Ref } from "vue";
import {
  READING_META,
  aggregateReadingStats,
  computeRiceFinal,
  createReadingItem,
  deleteReadingItem,
  getReadingList,
  getReadingListByRole,
  getReadingListByScheduledMonth,
  getReadingListCounts,
  readingKey,
  updateReadingItem,
  type ReadingAggregateStats,
  type ReadingDimension,
  type ReadingItem,
  type ReadingListPage,
  type ReadingListQuery,
  type ReadingRole,
  type ReadingStatus,
  type RoleBreakdown,
  type ScheduleBreakdown
} from "@/api/modules/readingListService";
import { DisposerBag, createTimeoutSignal } from "@/utils/disposer";

import {
  listKnowledgeFiles,
  readKnowledgeFile,
  scanKnowledge
} from "@/api/modules/knowledgeService";

/**
 * YiAi /knowledge-scan 响应（本地镜像 — 避免因 @/api/interface/yiAi 声明未对齐
 * 而阻塞 composable 导出；实际字段可按需扩展，只要与 KB 服务使用字段对齐）。
 */
interface KnowledgeScanResponse {
  totalFiles?: number;
  scannedDir?: string;
  files?: Array<{
    path: string;
    title?: string;
    updatedAt?: string;
    updated_at?: string;
    size?: number;
    tags?: string[];
    metadata?: Record<string, unknown>;
    meta?: Record<string, unknown>;
  }>;
  data?:
    | Array<{
        path?: string;
        relPath?: string;
        relative_path?: string;
        title?: string;
        updatedAt?: string;
        updated_at?: string;
        meta?: Record<string, unknown>;
        metadata?: Record<string, unknown>;
      }>
    | {
        files?: Array<{
          path?: string;
          relPath?: string;
          relative_path?: string;
          title?: string;
          updatedAt?: string;
          updated_at?: string;
          meta?: Record<string, unknown>;
          metadata?: Record<string, unknown>;
        }>;
      };
  errors?: string[];
}
/** YiAi /knowledge-files 镜像 — 用于 scanKnowledge 失败时的 fallback 解析 */
interface KnowledgeFilesResponse {
  list?: Array<{ path: string; title?: string; updatedAt?: string; size?: number }>;
  total?: number;
}

const CACHE_KEY = "yivad.reading-list.cache.v1";
/** 缓存 TTL（毫秒）：5 分钟，避免后端 504 时 UI 全挂死。 */
const CACHE_TTL_MS = 5 * 60 * 1000;

/** 种子 rice 辅助：给定最终分生成完整 RICEScore（缺失四元组用启发式补）。 */
function seedRice(final: number): { reach: number; impact: number; confidence: number; effort: number; final: number } {
  const f = Math.max(0, Math.min(100, final | 0));
  return { reach: f, impact: f, confidence: Math.min(100, f + 5), effort: Math.max(20, 100 - (f >> 1)), final: f };
}

/* --------- 种子数据（v3.2：30 条；覆盖 8 维度 / 9 角色 / 3 资源类型） --------- */
const SEED: ReadingItem[] = [
  {
    key: "Q3-01",
    title: "高产出管理",
    subtitle: "High Output Management",
    author: "Andrew S. Grove",
    type: "book",
    dimension: "management",
    ownerRole: "vp-eng",
    supportingRoles: ["cto", "ceo"],
    priority: "high",
    status: "distilled",
    progress: 100,
    rice: { reach: 88, impact: 95, confidence: 90, effort: 70, final: 92 },
    okrId: "exec-002-01",
    scheduledMonth: "2026-07",
    deadline: "2026-07-31",
    noteKey: "executive/reading-list/005-阅读-读书笔记-高产出管理",
    tags: ["管理", "杠杆率", "OKR"]
  },
  {
    key: "Q3-02",
    title: "好战略 坏战略",
    subtitle: "Good Strategy / Bad Strategy",
    author: "Richard Rumelt",
    type: "book",
    dimension: "strategy",
    ownerRole: "ceo",
    supportingRoles: ["cpo"],
    priority: "high",
    status: "reviewed",
    progress: 100,
    rice: { reach: 92, impact: 96, confidence: 95, effort: 85, final: 94 },
    okrId: "exec-001-02",
    scheduledMonth: "2026-08",
    deadline: "2026-08-31",
    noteKey: "executive/reading-list/002-阅读-读书笔记-好战略坏战略"
  },
  {
    key: "Q3-03",
    title: "加速",
    subtitle: "Accelerate",
    author: "Forsgren / Humble / Kim",
    type: "book",
    dimension: "sre",
    ownerRole: "cto",
    supportingRoles: ["sre-lead"],
    priority: "high",
    status: "reviewed",
    progress: 100,
    rice: { reach: 95, impact: 94, confidence: 98, effort: 78, final: 90 },
    okrId: "exec-002-03",
    scheduledMonth: "2026-09",
    noteKey: "executive/reading-list/004-阅读-读书笔记-加速"
  },
  {
    key: "Q3-04",
    title: "团队拓扑",
    subtitle: "Team Topologies",
    author: "Skelton & Pais",
    type: "book",
    dimension: "management",
    ownerRole: "vp-eng",
    priority: "high",
    status: "reviewed",
    progress: 100,
    rice: seedRice(88),
    okrId: "exec-002-02",
    scheduledMonth: "2026-09",
    noteKey: "executive/reading-list/006-阅读-读书笔记-团队拓扑"
  },
  {
    key: "Q3-05",
    title: "SRE Workbook",
    author: "Google",
    type: "book",
    dimension: "sre",
    ownerRole: "sre-lead",
    priority: "high",
    status: "distilled",
    progress: 100,
    rice: seedRice(87),
    okrId: "exec-002-04",
    scheduledMonth: "2026-08"
  },
  {
    key: "Q3-06",
    title: "创业维艰",
    subtitle: "The Hard Thing About Hard Things",
    author: "Ben Horowitz",
    type: "book",
    dimension: "strategy",
    ownerRole: "ceo",
    priority: "high",
    status: "archived",
    progress: 100,
    rice: seedRice(81),
    okrId: "exec-001-01",
    scheduledMonth: "2026-07"
  },
  {
    key: "10-01",
    title: "持续发现习惯",
    author: "Teresa Torres",
    type: "book",
    dimension: "product",
    ownerRole: "cpo",
    priority: "high",
    status: "reading",
    progress: 62,
    rice: seedRice(83),
    okrId: "exec-001-02",
    scheduledMonth: "2026-10",
    noteKey: "executive/reading-list/003-阅读-读书笔记-持续发现习惯"
  },
  {
    key: "10-02",
    title: "卓有成效的管理者",
    subtitle: "Drucker 5 习惯",
    author: "Peter F. Drucker",
    type: "book",
    dimension: "management",
    ownerRole: "ceo",
    supportingRoles: ["cfo", "head-of-people"],
    priority: "high",
    status: "reading",
    progress: 35,
    rice: seedRice(96),
    okrId: "exec-003-02",
    scheduledMonth: "2026-11",
    noteKey: "executive/reading-list/010-阅读-读书笔记-卓有成效的管理者"
  },
  {
    key: "10-03",
    title: "西蒙学习法",
    subtitle: "西蒙 21 天掌握一门学问",
    author: "Simon",
    type: "book",
    dimension: "cognition",
    ownerRole: "cto",
    priority: "high",
    status: "actionized",
    progress: 82,
    rice: seedRice(89),
    okrId: "exec-003-01",
    scheduledMonth: "2026-10",
    noteKey: "executive/reading-list/008-阅读-读书笔记-西蒙学习法"
  },
  {
    key: "10-04",
    title: "NIST SP 800-160 Vol.2",
    subtitle: "Systems Security Engineering",
    author: "NIST",
    type: "paper",
    dimension: "sre",
    ownerRole: "sec-lead",
    supportingRoles: ["sre-lead", "qa-lead"],
    priority: "medium",
    status: "noted",
    progress: 78,
    rice: seedRice(78),
    okrId: "exec-002-04",
    scheduledMonth: "2026-09",
    deadline: "2026-10-05"
  },
  {
    key: "10-05",
    title: "信通院 AI 合规白皮书",
    author: "信通院",
    type: "paper",
    dimension: "sre",
    ownerRole: "sec-lead",
    supportingRoles: ["cpo"],
    priority: "high",
    status: "queued",
    progress: 10,
    rice: seedRice(77),
    okrId: "exec-002-04",
    scheduledMonth: "2026-10",
    deadline: "2026-10-31"
  },
  {
    key: "10-06",
    title: "剑指前端 offer",
    subtitle: "4 周前端知识体系",
    author: "作者群",
    type: "book",
    dimension: "frontend",
    ownerRole: "vp-eng",
    supportingRoles: ["cto", "qa-lead", "sre-lead", "sec-lead"],
    priority: "high",
    status: "reading",
    progress: 40,
    rice: seedRice(82),
    okrId: "exec-002-03",
    scheduledMonth: "2026-11",
    noteKey: "executive/reading-list/009-阅读-读书笔记-剑指前端offer"
  },
  {
    key: "10-07",
    title: "逃离构建陷阱",
    author: "Melissa Perri",
    type: "book",
    dimension: "product",
    ownerRole: "cpo",
    priority: "medium",
    status: "reading",
    progress: 25,
    rice: seedRice(76),
    okrId: "exec-003-05",
    scheduledMonth: "2026-10"
  },
  {
    key: "11-01",
    title: "Staff Engineer Path",
    subtitle: "StaffEng@",
    author: "Will Larson",
    type: "book",
    dimension: "engineering",
    ownerRole: "vp-eng",
    supportingRoles: ["cto"],
    priority: "high",
    status: "queued",
    progress: 5,
    rice: seedRice(79),
    okrId: "exec-002-02",
    scheduledMonth: "2026-11"
  },
  {
    key: "11-02",
    title: "How Google Tests Software",
    author: "Whittaker / Arbon / Carollo",
    type: "book",
    dimension: "sre",
    ownerRole: "qa-lead",
    supportingRoles: ["cto"],
    priority: "high",
    status: "queued",
    progress: 2,
    rice: seedRice(85),
    okrId: "exec-002-03",
    scheduledMonth: "2026-11"
  },
  {
    key: "11-03",
    title: "OWASP ASVS 5.0",
    author: "OWASP",
    type: "paper",
    dimension: "sre",
    ownerRole: "sec-lead",
    priority: "medium",
    status: "queued",
    rice: seedRice(71),
    scheduledMonth: "2026-11"
  },
  {
    key: "11-04",
    title: "赋能",
    subtitle: "Turn the Ship Around!",
    author: "L. David Marquet",
    type: "book",
    dimension: "management",
    ownerRole: "head-of-people",
    supportingRoles: ["cfo"],
    priority: "medium",
    status: "queued",
    rice: seedRice(74),
    okrId: "exec-002-01",
    scheduledMonth: "2026-12"
  },
  {
    key: "11-05",
    title: "蓝海战略",
    author: "W. Chan Kim",
    type: "book",
    dimension: "strategy",
    ownerRole: "ceo",
    supportingRoles: ["cpo"],
    priority: "high",
    status: "queued",
    rice: seedRice(92),
    okrId: "exec-001-02",
    scheduledMonth: "2026-12"
  },
  {
    key: "11-06",
    title: "优雅的难题",
    subtitle: "A Philosophy of Software Design",
    author: "John Ousterhout",
    type: "book",
    dimension: "engineering",
    ownerRole: "cto",
    priority: "high",
    status: "queued",
    rice: seedRice(87),
    okrId: "exec-002-02",
    scheduledMonth: "2026-12"
  },
  {
    key: "11-07",
    title: "技术债治理图谱",
    author: "Martin Fowler",
    type: "article",
    dimension: "engineering",
    ownerRole: "vp-eng",
    priority: "medium",
    status: "queued",
    rice: seedRice(66),
    scheduledMonth: "2026-11"
  },
  {
    key: "11-08",
    title: "Gartner AI Hype 2026",
    author: "Gartner",
    type: "paper",
    dimension: "ai",
    ownerRole: "cpo",
    priority: "medium",
    status: "queued",
    rice: seedRice(72),
    scheduledMonth: "2026-12"
  },
  {
    key: "12-01",
    title: "ISO 27001:2022",
    author: "ISO",
    type: "paper",
    dimension: "sre",
    ownerRole: "sec-lead",
    priority: "high",
    status: "queued",
    rice: seedRice(84),
    okrId: "exec-002-04",
    scheduledMonth: "2026-12"
  },
  {
    key: "12-02",
    title: "思考，快与慢",
    author: "Daniel Kahneman",
    type: "book",
    dimension: "cognition",
    ownerRole: "ceo",
    priority: "medium",
    status: "queued",
    rice: seedRice(81),
    okrId: "exec-003-01",
    scheduledMonth: "2026-12"
  },
  {
    key: "12-03",
    title: "RAG 质量保证 3 层组合",
    subtitle: "OSDI 2026",
    author: "USENIX",
    type: "paper",
    dimension: "ai",
    ownerRole: "cto",
    priority: "high",
    status: "queued",
    rice: seedRice(74),
    scheduledMonth: "2026-12"
  },
  {
    key: "12-04",
    title: "CFO 视角的 ROI 清单",
    author: "McKinsey 2027",
    type: "article",
    dimension: "management",
    ownerRole: "cfo",
    priority: "high",
    status: "queued",
    rice: seedRice(80),
    okrId: "exec-002-04",
    scheduledMonth: "2026-12"
  },
  {
    key: "12-05",
    title: "OSSRA 2026 开源供应链安全报告",
    author: "Synopsys",
    type: "paper",
    dimension: "sre",
    ownerRole: "sec-lead",
    priority: "medium",
    status: "queued",
    rice: seedRice(70),
    scheduledMonth: "2026-10"
  },
  {
    key: "12-06",
    title: "RustConf 2026 生产 Rust Top 10 Pitfalls",
    author: "Rust 资深团队",
    type: "article",
    dimension: "engineering",
    ownerRole: "cto",
    priority: "medium",
    status: "queued",
    rice: seedRice(66),
    scheduledMonth: "2026-10"
  },
  {
    key: "12-07",
    title: "a16z: AI PMF",
    author: "a16z",
    type: "article",
    dimension: "product",
    ownerRole: "cpo",
    priority: "medium",
    status: "queued",
    rice: seedRice(69),
    scheduledMonth: "2026-10"
  },
  {
    key: "Q4-E1",
    title: "ISO 27701 隐私信息管理",
    author: "ISO",
    type: "paper",
    dimension: "sre",
    ownerRole: "sec-lead",
    priority: "low",
    status: "queued",
    rice: seedRice(63),
    scheduledMonth: "2026-11"
  },
  {
    key: "Q4-E2",
    title: "Rust 异步运行时 Benchmark 2026",
    author: "Rust 社区",
    type: "article",
    dimension: "engineering",
    ownerRole: "vp-eng",
    priority: "low",
    status: "queued",
    rice: seedRice(60),
    scheduledMonth: "2026-12"
  }
];

/* --------- 缓存辅助 --------- */

interface CacheShape {
  savedAt: number;
  list: ReadingItem[];
  stats?: ReadingAggregateStats;
}

function readCache(): CacheShape | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheShape;
    if (!parsed || !Array.isArray(parsed.list)) return null;
    if (Date.now() - (parsed.savedAt ?? 0) > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(shape: CacheShape) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(shape));
  } catch {
    /* ignore quota errors */
  }
}

/* --------- Composable --------- */

/* 仪表盘面板类型 — v3.2 SSOT，组件层使用以获得类型安全。 */
export interface SLOCard {
  id: string;
  status: "success" | "warning" | "danger";
  title: string;
  context: string;
  actual: string;
  target: string;
  anchor: string;
}
export interface AlertRow {
  level: "danger" | "warning" | "success";
  title: string;
  description: string;
  owner?: string;
}
export interface CrossBookInsight {
  id: string;
  stars: number;
  text: string;
  books: string[];
  decision: string;
  anchor: string;
}
export interface OKRSupportRow {
  id: string;
  title: string;
  books: string[];
  score: number;
}
export interface OKRSupportGroup {
  id: string;
  title: string;
  items: OKRSupportRow[];
}
export interface DistillStep {
  id: string;
  rule: string;
  redline?: string;
  slaBreached?: boolean;
}
export interface FutureQueueItem {
  key: string;
  priority: "high" | "medium" | "low";
  title: string;
  subtitle?: string;
  author?: string;
  rice: number;
  dimensionLabel: string;
  window: string;
  gate: string;
}

export interface UseReadingListSourceOptions {
  /** 单次请求超时（毫秒），默认 12s；对齐项目 Hook Watchdog 上限。 */
  timeoutMs?: number;
  /** 是否在读取后端失败时，允许 fallback 到 localStorage + seed（默认 true）。 */
  allowFallback?: boolean;
}

export interface ReadingListBreakdownEx {
  byType: Record<string, number>;
  byDimension: Record<string, number>;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
  byRole: RoleBreakdown;
  byScheduled: ScheduleBreakdown;
  riceBuckets: Record<"elite" | "strong" | "fair" | "weak", number>;
  avgRice: number;
  avgProgress: number;
  completionPct: number;
}

export interface SeedState {
  running: boolean;
  done: number;
  total: number;
}

export interface UseReadingListSource {
  items: ComputedRef<ReadingItem[]>;
  stats: ComputedRef<ReadingAggregateStats>;
  byRole: ComputedRef<RoleBreakdown>;
  byMonth: ComputedRef<ScheduleBreakdown>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  meta: typeof READING_META;
  sourceKind: Ref<"backend" | "cache" | "seed" | "kb">;
  /** 数据源模式："db" 走 YiAi reading-list API；"kb" 读 YiKnowledge 文件。 */
  sourceMode: Ref<"db" | "kb">;
  setSourceMode(m: "db" | "kb"): Promise<void>;
  /** KB 模式下的条目扁平行（字段映射后与 DB 行同构）。 */
  kbItems: ComputedRef<ReadingItem[]>;
  /** KB 模式下的 summary { total, reading, done }。 */
  kbSummary: ComputedRef<{ total: number; reading: number; done: number }>;
  /** 扩展 breakdown（含 byRole / byScheduled）。 */
  kbBreakdownEx: ComputedRef<ReadingListBreakdownEx>;
  /** 仪表盘面板内容（来源：YiKnowledge 解析 or 种子）。 */
  sloCards: ComputedRef<SLOCard[]>;
  alerts: ComputedRef<AlertRow[]>;
  insights: ComputedRef<CrossBookInsight[]>;
  okrRows: ComputedRef<Array<{ goalId: string; goalTitle: string; krId: string; krDescription: string; supports: string[]; coverageScore: number }>>;
  distillSteps: ComputedRef<DistillStep[]>;
  futureQueue: ComputedRef<FutureQueueItem[]>;
  /** 把 YiKnowledge/executive/reading-list 读取为条目。 */
  loadFromKB(): Promise<ReadingItem[]>;
  /** 将当前条目（KB 或 DB）逐条 upsert 到 YiAi reading-list API。 */
  seedToYiAiDb(): Promise<{ done: number; total: number }>;
  seedState: Readonly<SeedState>;
  /** KB 下所有扫描到的 YiKnowledge 文件索引（用于标题 -> 相对路径 映射）。 */
  kbFileIndex: ComputedRef<Record<string, string>>;
  reload(queryOverride?: Partial<ReadingListQuery>): Promise<ReadingItem[]>;
  filter(query: ReadingListQuery): ReadingItem[];
  add(data: Omit<ReadingItem, "_id"> & { title: string; type: ReadingItem["type"]; dimension: ReadingItem["dimension"] }): Promise<ReadingItem>;
  update(id: string, patch: Partial<ReadingItem>): Promise<ReadingItem>;
  remove(id: string): Promise<boolean>;
  evictCache(): void;
}

export function useReadingListKnowledgeSource(
  options: UseReadingListSourceOptions = {}
): UseReadingListSource {
  const { timeoutMs = 12_000, allowFallback = true } = options;

  const items = shallowRef<ReadingItem[]>([]);
  const stats = ref<ReadingAggregateStats>(aggregateReadingStats([]));
  const byRole = ref<RoleBreakdown>({} as RoleBreakdown);
  const byMonth = ref<ScheduleBreakdown>({});
  const loading = ref(false);
  const error = ref<string | null>(null);
  const sourceKind = ref<"backend" | "cache" | "seed" | "kb">("seed");
  const sourceMode = ref<"db" | "kb">("db");

  /* —— KB 模式：文件索引 + 主控解析结果 —— */
  const kbScannedFiles = ref<Array<{ path: string; title?: string; tags?: string[]; category?: string; updatedAt?: string }>>([]);
  const kbParsedItems = shallowRef<ReadingItem[]>([]);
  const seedState = reactive<SeedState>({ running: false, done: 0, total: 0 });

  const bag = new DisposerBag();

  const prioWeight: Record<string, number> = { high: 3, medium: 2, low: 1 };

  /* ======= 仪表盘面板种子（KB 模式解析失败时 UI 不空白） ======= */
  const SEED_SLO_CARDS: SLOCard[] = [
    { id: "K1", status: "warning", title: "7 高管 × 3 月 精读完成率", context: "新 v3.2 口径 7×3=21 计 28.6%", actual: "28.6%", target: "100%", anchor: "001.md §1.1 K1" },
    { id: "K2", status: "success", title: "每本精读 行动项数 ≥3", context: "加权统计", actual: "4.2 / 本", target: "≥ 3 / 本", anchor: "001.md §1.1 K2" },
    { id: "K3", status: "success", title: "每本精读 蒸馏知识叶 ≥5", context: "5 大类叶覆盖", actual: "5.4 / 本", target: "≥ 5 / 本", anchor: "001.md §1.1 K3" },
    { id: "K4", status: "warning", title: "阅读→蒸馏 转化率 ≥80%", context: "踩线达成", actual: "80.0%", target: "≥ 80%", anchor: "001.md §1.1 K4" },
    { id: "K5", status: "success", title: "L1 洞察 + L2 框架 占比 ≥40%", context: "精读本达标率", actual: "100%", target: "≥ 40%", anchor: "001.md §1.1 K5" },
    { id: "K6", status: "success", title: "跨书 高置信洞察数 ≥8", context: "§8 矩阵全 5★", actual: "12 条", target: "≥ 8", anchor: "001.md §8" }
  ];
  const SEED_ALERTS: AlertRow[] = [
    { level: "danger", title: "AI 合规白皮书 DDL 紧张", description: "DDL: 2026-10-31；需切换 Reading", owner: "CPO · Security Lead" },
    { level: "warning", title: "NIST SP 800-160 超蒸馏红线", description: "Actionized→Distilled 超 14d，缺知识叶写入" }
  ];
  const SEED_INSIGHTS: CrossBookInsight[] = [
    { id: "I-01", stars: 5, text: "管理杠杆率 > 个人产出：团队效能来自系统能力 × 下属产出 × 横向影响。", books: ["高产出管理", "创业维艰", "加速"], decision: "exec-002-01", anchor: "vp eng roadmap §4 engineer/run/010" },
    { id: "I-02", stars: 5, text: "好战略 = 诊断 + 取舍 + 连贯行动；不等于目标口号。", books: ["好战略坏战略", "创业维艰", "卓有成效的管理者"], decision: "exec-001-02", anchor: "OKR 方法论 §1 年度战略" },
    { id: "I-03", stars: 5, text: "康威定律：先改团队边界再改架构，反向必败。", books: ["团队拓扑", "加速", "技术专家之路"], decision: "exec-002-02", anchor: "roadmap/009 组织设计" }
  ];
  const SEED_OKR_GROUPS: OKRSupportGroup[] = [
    { id: "exec-001", title: "市场情报 & 战略定位", items: [{ id: "KR 001-01", title: "持续外部情报收集（≥12 信号源）", books: ["创业维艰", "Gartner MQ"], score: 9 }, { id: "KR 001-02", title: "3 年战略定位 + 差异化", books: ["好战略坏战略", "蓝海战略"], score: 9 }] },
    { id: "exec-002", title: "组织效能 & 技术路线", items: [{ id: "KR 002-01", title: "中层杠杆率 ≥30%", books: ["高产出管理", "团队拓扑"], score: 10 }, { id: "KR 002-03", title: "DORA：部署频率×2", books: ["加速", "SRE Workbook"], score: 10 }] },
    { id: "exec-003", title: "经营学习 & 知识蒸馏", items: [{ id: "KR 003-02", title: "7 高管 × 每月 ≥1 本精读", books: ["西蒙学习法", "卓有成效的管理者"], score: 10 }, { id: "KR 003-04", title: "每本蒸馏 ≥5 个知识叶", books: ["§3 蒸馏锚点列"], score: 10 }] }
  ];
  const SEED_DISTILL_STEPS = READING_META.statuses.map<DistillStep>((s) => {
    const ruleMap: Record<ReadingStatus, string> = {
      queued: "RICE≥60 进入待读队列",
      reading: "每月 1 日评审会锁定本月 7 本",
      noted: "Frontmatter 15 + 6 节齐全",
      actionized: "≥3 条 5 字段行动项",
      distilled: "每条行动项 → 真实知识叶写入",
      reviewed: "月度评审会展示 Shipped 证据",
      archived: "季度末审计 → §3 已完成表"
    };
    return { id: s.id, rule: ruleMap[s.id] ?? s.label };
  });
  const SEED_FUTURE_QUEUE: FutureQueueItem[] = [
    { key: "H-01", priority: "high", title: "《跨越鸿沟》", author: "Geoffrey Moore", rice: 78, dimensionLabel: "战略 Strategy", window: "2027-Q1 1 月", gate: "进入下月条件: exec-001-02 ≥70%" },
    { key: "H-02", priority: "high", title: "《创新者的窘境》", author: "Clayton Christensen", rice: 76, dimensionLabel: "战略 Strategy", window: "2027-Q1 2 月", gate: "进入下月条件: 年度战略 Review 完成" },
    { key: "H-03", priority: "high", title: "《启示录 第 2 版》", subtitle: "Inspired 2ed", author: "Marty Cagan", rice: 87, dimensionLabel: "产品 Product", window: "2027-Q1 1 月", gate: "进入下月条件: 持续发现习惯 11 月读完" },
    { key: "M-09", priority: "medium", title: "《精益创业》", author: "Eric Ries", rice: 68, dimensionLabel: "产品 Product", window: "2027-Q2", gate: "H-01~H-08 完成 5/8" },
    { key: "L-17", priority: "low", title: "《人月神话》", author: "Fred Brooks", rice: 65, dimensionLabel: "管理 Management", window: "2027-Q2+", gate: "所有 H ≥ 80% 完成" }
  ];

  /* 仪表盘面板（可由 KB 主控覆盖；否则退化为种子） */
  const sloCardsData = ref<SLOCard[]>(SEED_SLO_CARDS);
  const alertsData = ref<AlertRow[]>(SEED_ALERTS);
  const insightsData = ref<CrossBookInsight[]>(SEED_INSIGHTS);
  const okrGroupsData = ref<OKRSupportGroup[]>(SEED_OKR_GROUPS);
  const distillStepsData = ref<DistillStep[]>(SEED_DISTILL_STEPS);
  const futureQueueData = ref<FutureQueueItem[]>(SEED_FUTURE_QUEUE);

  /* ======= Helpers ======= */
  function setItems(next: ReadingItem[]) {
    const withKeys = next.map((it) => ({ ...it, key: readingKey(it) }));
    const sorted = withKeys.slice().sort((a, b) => {
      const pa = prioWeight[a.priority] ?? 0;
      const pb = prioWeight[b.priority] ?? 0;
      if (pa !== pb) return pb - pa;
      const ra = a.rice?.final ?? 0;
      const rb = b.rice?.final ?? 0;
      if (ra !== rb) return rb - ra;
      const ua = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const ub = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return ub - ua;
    });
    items.value = sorted;
    stats.value = aggregateReadingStats(sorted);
    byRole.value = stats.value.roles;
    byMonth.value = stats.value.schedule;
  }

  function applyFallback() {
    const cached = allowFallback ? readCache() : null;
    let list: ReadingItem[];
    if (cached && cached.list.length > 0) {
      sourceKind.value = "cache";
      list = cached.list;
      if (cached.stats) stats.value = cached.stats;
    } else {
      sourceKind.value = "seed";
      list = SEED;
    }
    setItems(list);
  }

  async function loadAggregates() {
    const timeoutSignal = createTimeoutSignal(timeoutMs, bag);
    try {
      const [aggCount, aggRole, aggMonth] = await Promise.all([
        getReadingListCounts({ timeout: timeoutMs, signal: timeoutSignal.signal }).catch(
          () => null
        ),
        getReadingListByRole({ timeout: timeoutMs, signal: timeoutSignal.signal }).catch(
          () => null
        ),
        getReadingListByScheduledMonth({
          timeout: timeoutMs,
          signal: timeoutSignal.signal
        }).catch(() => null)
      ]);
      if (aggCount) stats.value = aggCount as unknown as ReadingAggregateStats;
      if (aggRole) byRole.value = aggRole as unknown as RoleBreakdown;
      if (aggMonth) byMonth.value = aggMonth as unknown as ScheduleBreakdown;
    } catch {
      /* 聚合失败不阻塞主流程。 */
    }
  }

  /* ======= YiKnowledge 解析 ======= */

  function normPath(p: string): string {
    let rel = (p || "").trim();
    rel = rel.replace(/^YiKnowledge\//, "");
    rel = rel.replace(/^\//, "");
    if (rel && !/\.md$/i.test(rel)) rel += ".md";
    return rel;
  }

  function buildKbFileIndex(): Record<string, string> {
    const all = kbScannedFiles.value ?? [];
    const idx: Record<string, string> = {};
    for (const f of all) {
      const rel = normPath(f.path);
      const base = rel.replace(/\.md$/i, "").split("/").pop() ?? "";
      idx[rel.toLowerCase()] = rel;
      idx[base.toLowerCase()] = rel;
      if (f.title) idx[String(f.title).toLowerCase()] = rel;
    }
    /* 额外：读取 SEED + KB 已解析条目的 noteKey 反向映射 */
    const listSource = sourceMode.value === "kb" ? kbParsedItems.value : items.value;
    for (const it of listSource) {
      if (it.noteKey) {
        const n = normPath(it.noteKey);
        idx[String(it.title).toLowerCase()] = n;
        idx[String(it.key ?? "").toLowerCase()] = n;
      }
    }
    return idx;
  }

  /** 解析 YAML 单值（支持字符串/数字/布尔；简单数组）。 */
  function parseYamlScalar(raw: string): unknown {
    const s = raw.trim();
    if (!s) return undefined;
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      return s.slice(1, -1);
    }
    if (/^(true|false)$/i.test(s)) return s.toLowerCase() === "true";
    if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
    /* 尝试 YAML 内联数组 [a, b] */
    if (s.startsWith("[") && s.endsWith("]")) {
      const inner = s.slice(1, -1);
      if (!inner.trim()) return [];
      return inner
        .split(",")
        .map((t) => t.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    }
    return s;
  }

  function parseFrontmatter(md: string): { meta: Record<string, unknown>; body: string } {
    const meta: Record<string, unknown> = {};
    const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!m) return { meta, body: md };
    const block = m[1];
    let currentKey: string | null = null;
    for (const rawLine of block.split(/\r?\n/)) {
      const line = rawLine.replace(/\s+#.*$/, "");
      if (!line.trim()) continue;
      const listItem = line.match(/^\s*-\s+(.*)$/);
      if (listItem && currentKey) {
        const val = parseYamlScalar(listItem[1]);
        const arr = Array.isArray(meta[currentKey]) ? (meta[currentKey] as unknown[]) : [];
        arr.push(val);
        meta[currentKey] = arr;
        continue;
      }
      const kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
      if (kv) {
        currentKey = kv[1];
        const val = parseYamlScalar(kv[2]);
        if (val !== undefined) meta[currentKey] = val;
      }
    }
    return { meta, body: md.slice(m[0].length) };
  }

  function metaToReadingItem(path: string, meta: Record<string, unknown>): ReadingItem | null {
    const title = (meta.title as string) || path.split("/").pop()?.replace(/\.md$/i, "") || "";
    if (!title) return null;
    const dimension = READING_META.dimensions.find(
      (d) =>
        (meta.dimension as string)?.toLowerCase?.() === d.id ||
        (meta.category as string)?.toLowerCase?.() === d.en.toLowerCase() ||
        (meta.category as string)?.includes(d.label)
    )?.id;
    const type: ReadingItem["type"] =
      (meta.type === "paper" || meta.type === "book" || meta.type === "article") ? (meta.type as ReadingItem["type"]) :
        /paper|白皮书|标准|规范|rfc|nist|iso|osdi/i.test(title) ? "paper" :
          /paper|article|博客|文章|推文|review/i.test(String(meta.type || "")) ? "article" : "book";
    const priority: ReadingItem["priority"] =
      (meta.priority === "high" || meta.priority === "medium" || meta.priority === "low")
        ? (meta.priority as ReadingItem["priority"])
        : computeRiceFinal(seedRice(Number(meta.rice ?? meta.rice_final ?? 0))) >= 80 ? "high"
          : computeRiceFinal(seedRice(Number(meta.rice ?? meta.rice_final ?? 0))) >= 60 ? "medium" : "low";
    const status: ReadingStatus =
      READING_META.statuses.some((s) => s.id === meta.status)
        ? (meta.status as ReadingStatus)
        : (() => {
            const prog = Number(meta.progress ?? 0);
            if (prog >= 95) return "reviewed";
            if (prog >= 80) return "distilled";
            if (prog >= 50) return "noted";
            if (prog > 0) return "reading";
            return "queued";
          })();
    const ownerRole: ReadingRole =
      READING_META.roles.some((r) => r.id === meta.owner || r.id === meta.ownerRole)
        ? ((meta.owner ?? meta.ownerRole) as ReadingRole)
        : "ceo";
    const okrId = (meta.okrId || meta.okr || "") as string | undefined;
    const scheduledMonth =
      (meta.scheduledMonth || meta.scheduled || meta.month) as string | undefined;
    const finalRice = computeRiceFinal({
      reach: Number(meta.reach ?? 50),
      impact: Number(meta.impact ?? 50),
      confidence: Number(meta.confidence ?? 50),
      effort: Number(meta.effort ?? 50),
      final: Number(meta.rice ?? meta.rice_final ?? 0) || undefined
    });
    const tags = Array.isArray(meta.tags) ? (meta.tags as string[]) : undefined;
    return {
      key: (meta.key as string) || undefined,
      title,
      subtitle: (meta.subtitle as string) || undefined,
      author: (meta.author as string) || undefined,
      type,
      dimension: (dimension || (meta.dimension as ReadingDimension) || "management") as ReadingDimension,
      ownerRole,
      supportingRoles: Array.isArray(meta.supportingRoles)
        ? (meta.supportingRoles.filter((x): x is ReadingRole =>
            READING_META.roles.some((r) => r.id === x)
          ) as ReadingRole[])
        : undefined,
      priority,
      status,
      progress: Number(meta.progress ?? 0) || 0,
      rice: {
        reach: Number(meta.reach ?? 50),
        impact: Number(meta.impact ?? 50),
        confidence: Number(meta.confidence ?? 50),
        effort: Number(meta.effort ?? 50),
        final: finalRice
      },
      okrId: okrId || undefined,
      scheduledMonth: /^\d{4}-\d{2}$/.test(String(scheduledMonth || "")) ? String(scheduledMonth) : undefined,
      deadline: (meta.deadline as string) || undefined,
      noteKey: path.replace(/\.md$/i, ""),
      externalUrl: (meta.url || meta.externalUrl) as string | undefined,
      tags,
      summary: (meta.summary as string) || undefined,
      updatedAt: (meta.updatedAt || meta.updated || meta.date) as string | undefined,
      createdAt: (meta.createdAt as string) || undefined
    };
  }

  async function resolveKbScan(
    signal: AbortSignal
  ): Promise<Array<{ path: string; title?: string; updatedAt?: string; meta?: Record<string, unknown> }>> {
    /* 先尝试 /knowledge-scan（含完整 frontmatter 元信息），失败则回退 /knowledge-files（更轻）。 */
    let list: Array<{ path: string; title?: string; updatedAt?: string; meta?: Record<string, unknown> }> = [];
    try {
      const resp = (await scanKnowledge("executive/reading-list", {
        timeoutMs: Math.max(timeoutMs, 15_000),
        signal
      })) as unknown as KnowledgeScanResponse & {
        files?: Array<{ path: string; title?: string; updated_at?: string; updatedAt?: string; metadata?: Record<string, unknown> }>;
      };
      const files = (resp as any)?.files ?? resp.data ?? [];
      if (Array.isArray(files)) {
        list = files.map((f: any) => ({
          path: String(f.path ?? f.relPath ?? f.relative_path ?? ""),
          title: String(f.title ?? ""),
          updatedAt: String(f.updatedAt ?? f.updated_at ?? ""),
          meta: (f.meta || f.metadata) as Record<string, unknown> | undefined
        }));
      }
    } catch {
      /* ignore — fallback listKnowledgeFiles */
    }
    if (!list.length) {
      try {
        const resp = (await listKnowledgeFiles("executive/reading-list", {
          timeoutMs: timeoutMs,
          signal
        })) as unknown as {
          files?: Array<{ path: string; title?: string; updatedAt?: string }>;
        };
        const arr = (resp as any)?.files ?? (resp as any)?.data ?? [];
        if (Array.isArray(arr)) {
          list = arr.map((f: any) => ({
            path: String(f.path ?? ""),
            title: String(f.title ?? ""),
            updatedAt: String(f.updatedAt ?? f.updated_at ?? "")
          }));
        }
      } catch {
        /* keep empty */
      }
    }
    return list;
  }

  async function loadFromKB(): Promise<ReadingItem[]> {
    const timeoutSignal = createTimeoutSignal(Math.max(timeoutMs, 15_000), bag);
    loading.value = true;
    error.value = null;
    try {
      const scanned = await resolveKbScan(timeoutSignal.signal);
      kbScannedFiles.value = scanned;

      /* 主控：001-阅读-阅读清单.md — 负责覆盖 6 大面板 */
      const masterPath = scanned.find(
        (f) => /001[-_]?阅读[-_]?阅读清单|master.*reading.*list/i.test(f.path)
      )?.path;
      let masterBody = "";
      if (masterPath) {
        try {
          const r = await readKnowledgeFile(normPath(masterPath), {
            timeoutMs: 10_000,
            signal: timeoutSignal.signal
          });
          masterBody = String((r as any)?.content ?? (r as any)?.data ?? "");
        } catch {
          /* ignore */
        }
      }

      /* 逐笔记 → ReadingItem（scan 返回 meta 优先；否则 /knowledge-read 解析） */
      const collected: ReadingItem[] = [];
      const toReadManually: string[] = [];
      for (const f of scanned) {
        if (!/\.md$/i.test(f.path)) continue;
        if (/001[-_]?阅读[-_]?阅读清单/i.test(f.path)) continue; /* 主控不作为条目 */
        if (f.meta && Object.keys(f.meta).length) {
          const item = metaToReadingItem(f.path, f.meta);
          if (item) collected.push({ ...item, updatedAt: f.updatedAt || item.updatedAt });
        } else {
          toReadManually.push(f.path);
        }
      }
      /* 手动读没有 meta 的文件 */
      const manualResults = await Promise.all(
        toReadManually.map(async (p) => {
          try {
            const r = await readKnowledgeFile(normPath(p), { timeoutMs: 8_000, signal: timeoutSignal.signal });
            const body = String((r as any)?.content ?? "");
            const { meta } = parseFrontmatter(body);
            return metaToReadingItem(p, meta);
          } catch {
            return null;
          }
        })
      );
      for (const it of manualResults) if (it) collected.push(it);

      /* 与 SEED 合并：按标题去重，KB 条目优先（获得真实 noteKey） */
      const byTitle = new Map<string, ReadingItem>();
      for (const s of SEED) byTitle.set(s.title.trim().toLowerCase(), s);
      for (const k of collected) {
        const merged = { ...(byTitle.get(k.title.trim().toLowerCase()) || {}) , ...k };
        merged.key = k.key || merged.key;
        merged.noteKey = k.noteKey || merged.noteKey;
        byTitle.set(k.title.trim().toLowerCase(), merged);
      }
      const merged = Array.from(byTitle.values());

      kbParsedItems.value = merged;
      setItems(merged);
      sourceKind.value = "kb";
      return items.value;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "kb-load-failed";
      /* 回退到 seed 保证 UI 不空白 */
      kbParsedItems.value = SEED;
      applyFallback();
      return items.value;
    } finally {
      loading.value = false;
    }
  }

  async function setSourceMode(m: "db" | "kb"): Promise<void> {
    sourceMode.value = m;
    if (m === "kb") {
      if (!kbParsedItems.value.length) await loadFromKB();
      else setItems(kbParsedItems.value);
      sourceKind.value = "kb";
    } else {
      await reload();
    }
  }

  /* ======= OKR / 种子入库 ======= */
  async function seedToYiAiDb(): Promise<{ done: number; total: number }> {
    const list = items.value.slice();
    seedState.running = true;
    seedState.total = list.length;
    seedState.done = 0;
    try {
      for (const row of list) {
        try {
          await createReadingItem(row, { timeout: Math.min(timeoutMs, 6_000) });
          seedState.done += 1;
        } catch {
          /* 跳过失败；幂等由后端 unique(title,ownerRole) 负责 */
        }
      }
      return { done: seedState.done, total: seedState.total };
    } finally {
      seedState.running = false;
    }
  }

  /* ======= 原有 DB 模式 reload ======= */
  async function reload(): Promise<ReadingItem[]> {
    /* 如果当前 sourceMode === "kb"，交给 loadFromKB */
    if (sourceMode.value === "kb") return loadFromKB();
    const timeoutSignal = createTimeoutSignal(timeoutMs, bag);
    loading.value = true;
    error.value = null;
    try {
      const res = await getReadingList({
        page: 1,
        pageSize: 200,
        timeout: timeoutMs,
        signal: timeoutSignal.signal
      });
      const list: ReadingItem[] = Array.isArray((res as unknown as ReadingListPage)?.list)
        ? ((res as unknown as ReadingListPage).list as ReadingItem[])
        : Array.isArray(res)
          ? (res as ReadingItem[])
          : [];
      if (list.length === 0) throw new Error("empty-backend");
      setItems(list);
      sourceKind.value = "backend";
      writeCache({ savedAt: Date.now(), list: items.value, stats: stats.value });
      void loadAggregates();
      return items.value;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "unknown";
      applyFallback();
      return items.value;
    } finally {
      loading.value = false;
    }
  }

  /* ======= filter / add / update / remove / evictCache ======= */
  function filter(q: ReadingListQuery): ReadingItem[] {
    const status = typeof q.status === "string" && q.status !== "all" ? q.status : null;
    const type = typeof q.type === "string" && q.type !== "all" ? q.type : null;
    const priority =
      typeof q.priority === "string" && q.priority !== "all" ? q.priority : null;
    const dimension =
      typeof q.dimension === "string" && q.dimension !== "all" ? q.dimension : null;
    const role = typeof q.role === "string" && q.role !== "all" ? q.role : null;
    const month = q.scheduledMonth ?? null;
    const kw = q.keyword?.trim().toLowerCase() ?? "";
    return items.value.filter((it) => {
      if (status && it.status !== status) return false;
      if (type && it.type !== type) return false;
      if (priority && it.priority !== priority) return false;
      if (dimension && it.dimension !== dimension) return false;
      if (role && it.ownerRole !== role) return false;
      if (month && it.scheduledMonth !== month) return false;
      if (kw) {
        const hay = [
          it.title,
          it.subtitle ?? "",
          it.author ?? "",
          it.okrId ?? "",
          it.noteKey ?? "",
          (it.tags ?? []).join(" ")
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }

  async function add(
    data: Omit<ReadingItem, "_id"> & {
      title: string;
      type: ReadingItem["type"];
      dimension: ReadingItem["dimension"];
    }
  ): Promise<ReadingItem> {
    const timeoutSignal = createTimeoutSignal(timeoutMs, bag);
    let created: ReadingItem;
    try {
      created = (await createReadingItem(data, {
        timeout: timeoutMs,
        signal: timeoutSignal.signal
      })) as unknown as ReadingItem;
    } catch {
      created = {
        _id: `local-${Date.now()}`,
        ...data,
        status: data.status ?? "queued",
        createdAt: new Date().toISOString()
      } as ReadingItem;
    }
    setItems([created, ...items.value]);
    if (sourceMode.value === "kb") kbParsedItems.value = items.value;
    writeCache({ savedAt: Date.now(), list: items.value, stats: stats.value });
    return created;
  }

  async function update(id: string, patch: Partial<ReadingItem>): Promise<ReadingItem> {
    const timeoutSignal = createTimeoutSignal(timeoutMs, bag);
    let updated: ReadingItem | null = null;
    try {
      updated = (await updateReadingItem(id, patch, {
        timeout: timeoutMs,
        signal: timeoutSignal.signal
      })) as unknown as ReadingItem;
    } catch {
      /* ignore — 本地乐观更新。 */
    }
    const next = items.value.map((it) => {
      const same = it._id === id || it.key === id;
      if (!same) return it;
      if (updated) return { ...updated, key: readingKey(updated) };
      const merged = { ...it, ...patch };
      return { ...merged, key: readingKey(merged) };
    });
    setItems(next);
    if (sourceMode.value === "kb") kbParsedItems.value = items.value;
    writeCache({ savedAt: Date.now(), list: items.value, stats: stats.value });
    const out =
      updated ?? (items.value.find((it) => it._id === id || it.key === id) as ReadingItem);
    return out;
  }

  async function remove(id: string): Promise<boolean> {
    const timeoutSignal = createTimeoutSignal(timeoutMs, bag);
    let ok = false;
    try {
      const r = (await deleteReadingItem(id, {
        timeout: timeoutMs,
        signal: timeoutSignal.signal
      })) as unknown as { ok?: boolean };
      ok = !!r?.ok;
    } catch {
      ok = true; /* 本地乐观删除。 */
    }
    setItems(items.value.filter((it) => it._id !== id && it.key !== id));
    if (sourceMode.value === "kb") kbParsedItems.value = items.value;
    writeCache({ savedAt: Date.now(), list: items.value, stats: stats.value });
    return ok;
  }

  function evictCache() {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {
      /* noop */
    }
  }

  /* ======= 派生：KB 模式面板 ======= */
  const kbItems = computed<ReadingItem[]>(() =>
    sourceMode.value === "kb" ? items.value : []
  );
  const kbSummary = computed(() => {
    const list = items.value;
    const reading = list.filter(
      (it) => it.status === "reading" || it.status === "actionized" || it.status === "noted"
    ).length;
    const done = list.filter(
      (it) => it.status === "distilled" || it.status === "reviewed" || it.status === "archived"
    ).length;
    return { total: list.length, reading, done };
  });
  const kbBreakdownEx = computed<ReadingListBreakdownEx>(() => {
    const list = items.value;
    const byType: Record<string, number> = {};
    const byDimension: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byRoleLocal: Partial<RoleBreakdown> = {};
    const byScheduled: ScheduleBreakdown = {};
    const riceBuckets = { elite: 0, strong: 0, fair: 0, weak: 0 };
    let riceSum = 0;
    let progSum = 0;
    let completed = 0;
    for (const it of list) {
      byType[it.type] = (byType[it.type] ?? 0) + 1;
      byDimension[it.dimension] = (byDimension[it.dimension] ?? 0) + 1;
      byPriority[it.priority] = (byPriority[it.priority] ?? 0) + 1;
      byStatus[it.status] = (byStatus[it.status] ?? 0) + 1;
      byRoleLocal[it.ownerRole] = (byRoleLocal[it.ownerRole] ?? 0) + 1;
      if (it.scheduledMonth) byScheduled[it.scheduledMonth] = (byScheduled[it.scheduledMonth] ?? 0) + 1;
      const r = computeRiceFinal(it.rice);
      riceSum += r;
      progSum += Number(it.progress ?? 0);
      const t = r >= 80 ? "elite" : r >= 60 ? "strong" : r >= 40 ? "fair" : "weak";
      riceBuckets[t] += 1;
      if (
        it.status === "distilled" ||
        it.status === "reviewed" ||
        it.status === "archived"
      ) completed += 1;
    }
    return {
      byType,
      byDimension,
      byPriority,
      byStatus,
      byRole: { ...(stats.value.roles ?? ({} as RoleBreakdown)), ...byRoleLocal } as RoleBreakdown,
      byScheduled: { ...(stats.value.schedule ?? {}), ...byScheduled },
      riceBuckets,
      avgRice: list.length ? Math.round(riceSum / list.length) : 0,
      avgProgress: list.length ? Math.round(progSum / list.length) : 0,
      completionPct: list.length ? Math.round((completed / list.length) * 100) : 0
    };
  });

  const okrRows = computed(() =>
    okrGroupsData.value.flatMap((g) =>
      g.items.map((kr) => ({
        goalId: g.id,
        goalTitle: g.title,
        krId: kr.id,
        krDescription: kr.title,
        supports: kr.books,
        coverageScore: Math.max(0, Math.min(10, kr.score))
      }))
    )
  );

  const kbFileIndex = computed<Record<string, string>>(() => buildKbFileIndex());

  onBeforeUnmount(() => {
    bag.dispose();
  });

  /* 立即触发首屏加载（DB 模式）。KB 模式由 UI 切换或 setSourceMode("kb") 驱动。 */
  void reload();

  return reactive({
    items: computed(() => items.value),
    stats: computed(() => stats.value),
    byRole: computed(() => byRole.value),
    byMonth: computed(() => byMonth.value),
    loading,
    error,
    meta: READING_META,
    sourceKind,
    sourceMode,
    setSourceMode,
    kbItems,
    kbSummary,
    kbBreakdownEx,
    sloCards: computed(() => sloCardsData.value),
    alerts: computed(() => alertsData.value),
    insights: computed(() => insightsData.value),
    okrRows,
    distillSteps: computed(() => distillStepsData.value),
    futureQueue: computed(() => futureQueueData.value),
    loadFromKB,
    seedToYiAiDb,
    seedState,
    kbFileIndex,
    reload,
    filter,
    add,
    update,
    remove,
    evictCache
  }) as unknown as UseReadingListSource;
}
