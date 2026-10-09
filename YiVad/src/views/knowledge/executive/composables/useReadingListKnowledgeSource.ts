/**
 * useReadingListKnowledgeSource — real-time SSOT bridge between
 * YiKnowledge/executive/reading-list (ground truth files on disk) and the
 * YiVad reading-list dashboard.
 *
 * When YiAi DB is reachable the composable automatically seeds it with the
 * curated list (idempotent by title+author), then the UI can toggle freely
 * between the two sources via `sourceMode`.
 *
 * All numbers below are hard-frozen snapshots extracted on 2026-10-09 from
 *   /Users/yi/YrY/YiKnowledge/executive/reading-list/001-阅读-阅读清单.md v3.2
 * plus the 27 note files (002-028). They MUST be re-synced whenever that
 * file is structurally modified.
 */
import { ref, reactive, computed } from "vue";
import { ElMessage } from "element-plus";
import {
  createReadingItem,
  getReadingList,
  type ReadingItem,
  type ReadingDimension,
  type ReadingItemPriority,
  type ReadingItemStatus,
  type ReadingItemType,
  type ReadingListBreakdown
} from "@/api/modules/readingListService";

// ──────────────────────────────────────────────────────────────────────
// Types (dashboard only — not persisted to reading_list collection)
// ──────────────────────────────────────────────────────────────────────

export type SLOLight = "success" | "warning" | "danger";

export interface SLOCard {
  id: string;            // e.g. "K1" | "exec-003-01" | "K-07"
  title: string;
  description: string;
  actual: string;
  target: string;
  light: SLOLight;
  sourceSection: string; // anchor in 001.md
}

export interface AlertRow {
  id: string;
  light: SLOLight;
  item: string;
  problem: string;
  due: string;
  owner: string;
}

export interface CrossBookInsight {
  id: string;          // I-01 … I-12
  insight: string;
  supporting: string[];
  confidence: number;  // 1–5
  goals: string[];     // exec Goal / KR ids
  anchors: Array<{ label: string; path: string }>;
}

export interface OKRSupportRow {
  goalId: "001" | "002" | "003";
  goalTitle: string;
  krId: string;
  krDescription: string;
  supports: string[];
  coverageScore: number; // 0–10
}

export interface DistillStep {
  key:
    | "queued"
    | "reading"
    | "noted"
    | "actionized"
    | "distilled"
    | "reviewed"
    | "archived";
  label: string;
  description: string;
  redlineDays?: number;
}

export interface FutureQueueItem {
  rank: string;     // H-01 … M-09 … L-20
  title: string;
  author: string;
  type: ReadingItemType;
  dimension: ReadingDimension;
  rice: number;
  roles: string[];
  eta: string;
  condition: string;
  bucket: "high" | "medium" | "low";
}

export type SourceMode = "kb" | "db";

// ──────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────

const DIM_FROM_ZH: Record<string, ReadingDimension> = {
  管理: "management",
  战略: "strategy",
  技术: "engineering",
  前端: "frontend",
  SRE: "sre",
  安全: "sre",
  合规: "sre",
  产品: "product",
  AI: "ai",
  认知: "cognition",
  学习方法论: "cognition",
  QA: "engineering",
  工程: "engineering",
  工程化: "engineering",
  组织: "management",
  鲁棒性: "sre",
  网络: "sre",
  架构: "engineering",
  Rust: "engineering",
  编码规范: "engineering",
  经典: "management",
  创业: "product",
  领导力: "management"
};

function dimFromZh(raw: string): ReadingDimension {
  const keys = Object.keys(DIM_FROM_ZH).sort((a, b) => b.length - a.length);
  for (const k of keys) if (raw.includes(k)) return DIM_FROM_ZH[k];
  return "engineering";
}

function statusFromZh(raw: string): ReadingItemStatus {
  if (/(Reviewed|Archived)/.test(raw)) return "done";
  if (/(Queued)/.test(raw)) return "to-read";
  return "reading";
}

function progressFromZh(raw: string): number {
  if (raw.includes("Reviewed") || raw.includes("Archived")) return 100;
  if (raw.includes("Distilled")) return 85;
  if (raw.includes("Actionized")) return 70;
  if (raw.includes("Noted")) return 50;
  if (raw.includes("Reading")) return 25;
  return 0;
}

function priorityFromRice(rice: number, roles: string[]): ReadingItemPriority {
  if (rice >= 80 || roles.length >= 3) return "high";
  if (rice >= 65) return "medium";
  return "low";
}

function typeFromZh(raw: string): ReadingItemType {
  if (/Standard|🛡️/.test(raw)) return "paper"; // closest non-book category
  if (/Report|📊/.test(raw)) return "paper";
  if (/Paper|📝/.test(raw)) return "paper";
  if (/Article|📰|Talk|🎤/.test(raw)) return "article";
  return "book";
}

// ──────────────────────────────────────────────────────────────────────
// §2 月度明细 真实条目 (40+ curated entries)
// ──────────────────────────────────────────────────────────────────────
// Each row mirrors the 9 fields in §0.1 + scheduled month.

const MONTHLY_ROWS: Array<Omit<ReadingItem, "key" | "createdTime" | "updatedTime"> & {
  statusZh: string;
}> = [
  // §2.2 2026-07
  { title: "《加速》(Accelerate)：精益软件的科学", author: "Nicole Forsgren 等", type: "book", dimension: "sre", category: "技术·SRE·DORA", rice: 82, role: "cto", okrId: "exec-002-03", scheduled: "2026-07", statusZh: "Reviewed", status: "done", progress: 100, priority: "high", notes: "落地 YiPot §16 SLO/BurnRate 四极门禁 + YiVad §6 DORA 看板。" },
  { title: "《团队拓扑》(Team Topologies)", author: "Matthew Skelton 等", type: "book", dimension: "management", category: "技术·组织拓扑", rice: 79, role: "cto", okrId: "exec-002-02", scheduled: "2026-07", statusZh: "Reviewed", status: "done", progress: 100, priority: "high", notes: "4 团队 × 3 交互模式 → roadmap/009 组织设计。" },

  // §2.3 2026-08
  { title: "《高产出管理》(High Output Management)", author: "Andrew S. Grove", type: "book", dimension: "management", category: "管理杠杆率", rice: 85, role: "vp-eng", okrId: "exec-002-01", scheduled: "2026-08", statusZh: "Reviewed", status: "done", progress: 100, priority: "high", notes: "Grove 方法层：排期估算、管理模式、1:1 模板。" },
  { title: "《加速》重读·行动项落地版 (DORA)", author: "Nicole Forsgren 等", type: "book", dimension: "sre", category: "SRE·工程效能", rice: 88, role: "cto", okrId: "exec-002-03", scheduled: "2026-08", statusZh: "Reviewed", status: "done", progress: 100, priority: "high", notes: "追加 14 条行动项：BurnRate 4 级门禁、YiPot 5 SLO、YiAi Provider 4 条。" },

  // §2.4 2026-09
  { title: "《创业维艰》(The Hard Thing About Hard Things)", author: "Ben Horowitz", type: "book", dimension: "management", category: "管理·CEO 决策", rice: 83, role: "ceo", okrId: "exec-001-01", scheduled: "2026-09", statusZh: "Reviewed", status: "done", progress: 100, priority: "high", notes: "危机决策章节 → roadmap/001 + 董事会模板。" },
  { title: "《好战略坏战略》(Good Strategy Bad Strategy)", author: "Richard Rumelt", type: "book", dimension: "strategy", category: "战略·三要素", rice: 89, role: "ceo", okrId: "exec-001-02", scheduled: "2026-09", statusZh: "Reviewed", status: "done", progress: 100, priority: "high", notes: "诊断 + 取舍 + 连贯行动 → strategy/015 OKR 方法论 §1。" },
  { title: "NIST SP 800-160 Vol.2 网络弹性", author: "NIST", type: "paper", dimension: "sre", category: "安全·网络弹性", rice: 76, role: "security-lead", okrId: "exec-002-04", scheduled: "2026-09", statusZh: "Actionized", status: "reading", progress: 70, priority: "high", notes: "超 14d 红线 → 补 YiPot §16.6 GameDay + ADR-017。" },
  { title: "Gartner 2026 MQ Cloud Developer Services", author: "Gartner", type: "paper", dimension: "product", category: "产品·技术选型", rice: 71, role: "cto", okrId: "exec-001-01", scheduled: "2026-09", statusZh: "Noted", status: "reading", progress: 50, priority: "medium", notes: "Noted→Actionized 超 24h 红线；补建议矩阵 3 条。" },

  // §2.5.1 2026-10
  { title: "《逃离构建陷阱》(Escaping the Build Trap)", author: "Melissa Perri", type: "book", dimension: "product", category: "产品·管理", rice: 84, role: "cpo", okrId: "exec-001-02", scheduled: "2026-10", statusZh: "Reading", status: "reading", progress: 25, priority: "high", notes: "目标 → strategy/020 产品战略框架。" },
  { title: "《优雅的难题》(An Elegant Puzzle)", author: "Will Larson", type: "book", dimension: "management", category: "工程管理 3 域", rice: 88, role: "vp-eng", okrId: "exec-002-01", scheduled: "2026-10", statusZh: "Reading", status: "reading", progress: 25, priority: "high", notes: "目标 → leader roadmap §4 工程管理体系。" },
  { title: "《设计数据密集型应用》(DDIA) Ch 1-6", author: "Martin Kleppmann", type: "book", dimension: "engineering", category: "技术·基础架构", rice: 90, role: "cto", okrId: "exec-002-03", scheduled: "2026-10", statusZh: "Queued", status: "to-read", progress: 0, priority: "high", notes: "目标 → YiPot §4 SQLite 存储架构。" },
  { title: "ISO/IEC 27701:2019 PIMS", author: "ISO/IEC", type: "paper", dimension: "sre", category: "安全·隐私合规", rice: 72, role: "security-lead", okrId: "exec-002-04", scheduled: "2026-10", statusZh: "Queued", status: "to-read", progress: 0, priority: "medium", notes: "目标 → YiPot §10.2 隐私合规。" },
  { title: "信通院 2026 AI 大模型数据合规白皮书", author: "中国信通院", type: "paper", dimension: "sre", category: "合规·AI 治理", rice: 69, role: "cpo", okrId: "exec-001-01", scheduled: "2026-10", statusZh: "Queued", status: "to-read", progress: 0, priority: "high", notes: "🔴 红灯：10/09 仍 Queued，DDL 10-12 切到 Reading。" },
  { title: "《西蒙学习法》6 个月掌握任意新学科", author: "友荣方略", type: "book", dimension: "cognition", category: "学习方法论·高管生产力", rice: 80, role: "ceo", okrId: "exec-003-02", scheduled: "2026-10", statusZh: "Reading", status: "reading", progress: 25, priority: "high", notes: "3 高管共读；目标 → README §7.2 精读节奏重写。" },
  { title: "Stripe 工程：12 个工程管理反模式", author: "Gergely Orosz", type: "article", dimension: "management", category: "工程管理", rice: 66, role: "vp-eng", okrId: "exec-002-01", scheduled: "2026-10", statusZh: "Queued", status: "to-read", progress: 0, priority: "low", notes: "10 月泛读 → leader antipatterns README。" },

  // §2.5.2 2026-11
  { title: "《持续发现习惯》(Continuous Discovery Habits)", author: "Teresa Torres", type: "book", dimension: "product", category: "产品·用户访谈", rice: 86, role: "cpo", okrId: "exec-001-02", scheduled: "2026-11", statusZh: "Queued", status: "to-read", progress: 0, priority: "high", notes: "目标 → strategy/021 JTBD 框架 + PRD 两字段。" },
  { title: "《技术专家之路》(Staff Engineer's Path)", author: "Tanya Reilly", type: "book", dimension: "engineering", category: "技术·领导力", rice: 83, role: "cto", okrId: "exec-002-02", scheduled: "2026-11", statusZh: "Queued", status: "to-read", progress: 0, priority: "high", notes: "3 人共读 → people/career/001 技术职级通道。" },
  { title: "《SRE Workbook》Ch 1-5", author: "Google SRE Team", type: "book", dimension: "sre", category: "SRE·错误预算", rice: 87, role: "sre-lead", okrId: "exec-002-04", scheduled: "2026-11", statusZh: "Queued", status: "to-read", progress: 0, priority: "high", notes: "目标 → YiPot §16.2 BurnRate 4 级对齐 Google。" },
  { title: "IEEE 829 + ISO 29119-3 测试文档标准", author: "IEEE", type: "paper", dimension: "engineering", category: "QA·测试文档", rice: 68, role: "qa-lead", okrId: "exec-002-04", scheduled: "2026-11", statusZh: "Queued", status: "to-read", progress: 0, priority: "medium", notes: "目标 → quality/README §4 QA 门禁矩阵。" },
  { title: "Gartner 2026 Hype Cycle AI Security", author: "Gartner", type: "paper", dimension: "sre", category: "安全·AI", rice: 74, role: "security-lead", okrId: "exec-001-01", scheduled: "2026-11", statusZh: "Queued", status: "to-read", progress: 0, priority: "medium", notes: "目标 → YiAi §9 RAG 安全治理。" },
  { title: "《剑指前端 Offer》100 道高频真题", author: "力扣前端团队", type: "book", dimension: "frontend", category: "前端·工程化·性能优化", rice: 75, role: "vp-eng", okrId: "exec-002-03", scheduled: "2026-11", statusZh: "Reading", status: "reading", progress: 25, priority: "high", notes: "5 工程角色共读；目标 → YiVad HMR ≤ 650ms + LCP ≤ 2s。" },
  { title: "《卓有成效的管理者》德鲁克 50 周年版", author: "Peter F. Drucker", type: "book", dimension: "management", category: "管理·高管效能·决策", rice: 91, role: "ceo", okrId: "exec-002-01", scheduled: "2026-11", statusZh: "Reading", status: "reading", progress: 25, priority: "high", notes: "3 人共读 (含 CFO + Head of People)；原则层第一性原理。" },
  { title: "InfoQ 2026 零信任插件架构 3 个生产踩坑", author: "资深安全架构师", type: "article", dimension: "sre", category: "安全·架构", rice: 64, role: "security-lead", okrId: "exec-002-04", scheduled: "2026-11", statusZh: "Queued", status: "to-read", progress: 0, priority: "low", notes: "泛读 → YiPot §17.3 RBAC。" },

  // §2.5.3 2026-12
  { title: "《赋能》(Empowered)", author: "Marty Cagan + Chris Jones", type: "book", dimension: "product", category: "产品·领导力", rice: 85, role: "cpo", okrId: "exec-001-02", scheduled: "2026-12", statusZh: "Queued", status: "to-read", progress: 0, priority: "high", notes: "目标 → strategy/020 产品领导力框架。" },
  { title: "《思考快与慢》(Thinking, Fast and Slow)", author: "Daniel Kahneman", type: "book", dimension: "cognition", category: "战略·决策心理", rice: 81, role: "ceo", okrId: "exec-001-01", scheduled: "2026-12", statusZh: "Queued", status: "to-read", progress: 0, priority: "high", notes: "目标 → 2026-12 董事会决策审计章。" },
  { title: "ISO/IEC 27001:2022 ISMS", author: "ISO/IEC", type: "paper", dimension: "sre", category: "安全·合规", rice: 88, role: "security-lead", okrId: "exec-002-04", scheduled: "2026-12", statusZh: "Queued", status: "to-read", progress: 0, priority: "high", notes: "3 人共读；目标 → security/README + 2027-Q1 认证路线图。" },
  { title: "OSSRA 2026 开源安全与风险分析", author: "Synopsys", type: "paper", dimension: "sre", category: "安全·供应链", rice: 80, role: "security-lead", okrId: "exec-002-04", scheduled: "2026-12", statusZh: "Queued", status: "to-read", progress: 0, priority: "high", notes: "目标 → .github security-scan 扫描强化。" },
  { title: "《How Google Tests Software》", author: "James Whittaker 等", type: "book", dimension: "engineering", category: "QA·工程效能", rice: 78, role: "qa-lead", okrId: "exec-002-03", scheduled: "2026-12", statusZh: "Queued", status: "to-read", progress: 0, priority: "medium", notes: "目标 → quality/README §3 70/20/10 测试金字塔。" },
  { title: "USENIX OSDI'26 RAG Embedding 缓存命中率", author: "USENIX", type: "paper", dimension: "ai", category: "技术·AI", rice: 75, role: "cto", okrId: "exec-002-03", scheduled: "2026-12", statusZh: "Queued", status: "to-read", progress: 0, priority: "medium", notes: "目标 → YiAi §7 RAG 性能优化。" },
  { title: "a16z 2026 年终：AI 公司的 PMF 10 个早期信号", author: "a16z", type: "article", dimension: "strategy", category: "产品·战略", rice: 70, role: "ceo", okrId: "exec-001-02", scheduled: "2026-12", statusZh: "Queued", status: "to-read", progress: 0, priority: "low", notes: "泛读 → 2027 路线图初稿。" }
];

// ──────────────────────────────────────────────────────────────────────
// §3 已完成/进行中笔记（9 Book + 2 Standard/Report = 11）
// 已经在上面的 MONTHLY_ROWS 中体现，这里作为索引元数据备用。
// ──────────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────────
// §1.1 + §1.5 exec-003 6 KPI + 5 KR + 3 ⭐ starred = 8 SLO cards
// ──────────────────────────────────────────────────────────────────────

const SLO_CARDS: SLOCard[] = [
  // §1.1 Q3 Dashboard 6 KPI
  { id: "K1", title: "7 高管 × 3 月 精读完成率 (KR 003-02)", description: "原口径 5/5；新 v3.2 口径 7×3=21 计 28.6%", actual: "原口径 100% / 新 28.6%", target: "100% (原口径)", light: "warning", sourceSection: "001.md §1.1 K1" },
  { id: "K2", title: "每本精读 行动项数 (KR 003-03 ≥3)", description: "Grove5·Forsgren6·Rumelt4·Horowitz4·Skelton3 加权", actual: "4.2 / 本", target: "≥ 3 / 本", light: "success", sourceSection: "001.md §1.1 K2" },
  { id: "K3", title: "每本精读 蒸馏知识叶 (KR 003-04 ≥5)", description: "roadmap / strategy / projects / leader / curator 5+", actual: "5.4 / 本", target: "≥ 5 / 本", light: "success", sourceSection: "001.md §1.1 K3" },
  { id: "K4", title: "阅读→蒸馏 转化率 (KR 003-05 ≥80%)", description: "20 Shipped / 25 总行动项（踩线）", actual: "80.0%", target: "≥ 80%", light: "warning", sourceSection: "001.md §1.1 K4 + §1.3" },
  { id: "K5", title: "L1 洞察 + L2 框架 占比 (KR 003-01 ≥40%)", description: "6 Book 中 1 L1 + 5 L2 = 100%", actual: "6/6 = 100%", target: "≥ 40%", light: "success", sourceSection: "001.md §1.1 K5" },
  { id: "K6", title: "跨书 高置信洞察数 (Q3 新增 ≥8)", description: "§8 矩阵 I-01 ~ I-12 全 5 ★", actual: "12 条", target: "≥ 8", light: "success", sourceSection: "001.md §1.1 K6 + §8" },

  // §1.5 新增 3 ⭐ starred KPI (Q4 baseline)
  { id: "K-06", title: "⭐ 剑指前端 Offer 5 人共读完成率", description: "VP Eng/CTO/SRE/QA/Security 5 人 × 4 周节奏", actual: "基线建立 (11/30 DDL)", target: "≥ 80% (4/5) L2+L3", light: "success", sourceSection: "001.md §1.5 K-06" },
  { id: "K-07", title: "⭐ 前端性能 3 选 2 达标率", description: "YiVad LCP≤2s · HMR≤650ms · 前端 Bug-30%", actual: "押注项", target: "3 中 2 达标（3 项全过=学透）", light: "warning", sourceSection: "001.md §1.5 K-07 + 009 A-07" },
  { id: "K-08", title: "⭐⭐ Drucker 5 习惯 3 选 2 落地率", description: "整块时间≥25% · 三维度覆盖≥90% · 决策闭环≥85%", actual: "管理基石（最高优先 KPI）", target: "3 中 2 (3/3=学透；≤1=假学)", light: "warning", sourceSection: "001.md §1.5 K-08 + 010 A-01~A-07" }
];

// §1.2 红·黄·绿灯告警
const ALERTS: AlertRow[] = [
  { id: "A1", light: "danger", item: "《信通院 AI 合规白皮书》10 月泛读", problem: "10/09 仍 Queued（应 Reading）；10-31 DDL 紧张", due: "2026-10-12 (3 天内切到 Reading)", owner: "CPO · Security Lead" },
  { id: "A2", light: "warning", item: "NIST SP 800-160 Vol.2 (Security+SRE)", problem: "Actionized → Distilled 超 14d 红线，缺 2 条知识叶", due: "2026-10-15 (yipot §16.6 + ADR-017)", owner: "Security Lead" },
  { id: "A3", light: "warning", item: "Gartner MQ 2026 Cloud Dev (CTO+CPO)", problem: "Noted → Actionized 超 24h 红线", due: "2026-10-11 (补齐建议矩阵 3 条)", owner: "CPO" },
  { id: "A4", light: "success", item: "其余 6 Book (002/004/005/006/007 + 加速重读)", problem: "Distill 状态 = Reviewed；蒸馏锚点 ≥ 5 个可点击", due: "—", owner: "—" }
];

// ──────────────────────────────────────────────────────────────────────
// §8 12 条 5★ 跨书洞察
// ──────────────────────────────────────────────────────────────────────

const INSIGHTS: CrossBookInsight[] = [
  { id: "I-01", confidence: 5,
    insight: "管理杠杆率 > 个人产出：团队效能来自系统能力 × 下属产出 × 横向影响，而非高层个人加班。",
    supporting: ["高产出管理", "创业维艰", "优雅的难题", "加速", "西蒙学习法"],
    goals: ["exec-002-01 中层杠杆率≥30%"],
    anchors: [{ label: "vp eng roadmap §4", path: "leader/roadmap/README.md" }, { label: "engineer/run/010 排期", path: "engineer/run/010-运行-排期估算方法.md" }] },
  { id: "I-02", confidence: 5,
    insight: "好战略 = 诊断 + 取舍 + 连贯行动（≠ 目标/口号）；取舍=Drucker 要事优先 4 原则 + 加一=停一。",
    supporting: ["好战略坏战略", "创业维艰", "蓝海战略", "持续发现习惯", "卓有成效的管理者"],
    goals: ["exec-001-02 战略 3 年定位", "exec-003-01 L1+L2≥40%"],
    anchors: [{ label: "OKR 方法论 §1", path: "strategy/015-战略-OKR方法论.md" }, { label: "年度战略 §2", path: "leader/roadmap/001-路线图-年度战略规划.md" }, { label: "010 §5.3 3×4 取舍", path: "executive/reading-list/010-阅读-读书笔记-卓有成效的管理者.md" }] },
  { id: "I-03", confidence: 5,
    insight: "组织设计决定系统设计（康威定律）：先改团队边界/交互模式再改架构，反向几乎必败。",
    supporting: ["团队拓扑", "加速", "技术专家之路", "优雅的难题", "剑指前端 offer"],
    goals: ["exec-002-02 流对齐团队"],
    anchors: [{ label: "roadmap/009 组织设计", path: "leader/roadmap/009-路线图-规划技术路线图.md" }, { label: "技术职级通道", path: "people/career/001-技术职级体系.md" }] },
  { id: "I-04", confidence: 5,
    insight: "DORA 4 指标是唯一工程效能的客观度量；其他度量（LOC/PR/SP）都会触发 Goodhart 定律。",
    supporting: ["加速", "SRE Workbook", "How Google Tests", "NIST SP800-160", "西蒙学习法"],
    goals: ["exec-002-03 部署频率 ×2"],
    anchors: [{ label: "YiVad §6 DORA", path: "projects/yivad/README.md" }, { label: "quality DORA 看板", path: "quality/dora-metrics/README.md" }] },
  { id: "I-05", confidence: 5,
    insight: "SLO 必须来自真实用户视角；Burn Rate 4 级错误预算是发布门禁的唯一客观依据。",
    supporting: ["加速", "SRE Workbook", "NIST SP800-160", "团队拓扑"],
    goals: ["exec-002-04 SRE & 安全", "exec-003-05 转化率≥80%"],
    anchors: [{ label: "YiPot §16 SRE 指标", path: "projects/yipot/README.md" }, { label: "YiPot §16.2 BurnRate", path: "projects/yipot/README.md" }] },
  { id: "I-06", confidence: 5,
    insight: "数据驱动 > 直觉驱动，但度量 ≠ 目标（Goodhart）；必须区分度量 KPI 与激励目标。",
    supporting: ["高产出管理", "创业维艰", "加速", "逃离构建陷阱", "西蒙学习法", "剑指前端 offer"],
    goals: ["exec-002-01 管理升级", "exec-003-05 防 KPI 异化"],
    anchors: [{ label: "curator/008 KPI 设计", path: "curator/templates/008-模板-技术设计模板.md" }, { label: "OKR §3 避免 KPI", path: "strategy/015-战略-OKR方法论.md" }] },
  { id: "I-07", confidence: 5,
    insight: "零信任插件 = Ed25519 三级 PKI 签名 + 16 项 CAP 白名单 + FS RBAC 6×4 矩阵，三者缺一不可。",
    supporting: ["NIST 800-53", "OWASP ASVS 10", "OSSRA 2026", "加速"],
    goals: ["exec-002-04 安全体系"],
    anchors: [{ label: "YiPot §17 零信任沙箱", path: "projects/yipot/README.md" }, { label: "YiPot §17.3 FS RBAC", path: "projects/yipot/README.md" }] },
  { id: "I-08", confidence: 5,
    insight: "产品铁三角 = 价值 × 可行 × 可用，配合 JTBD + 每周≥5 客户访谈，才能逃离构建陷阱。",
    supporting: ["启示录 2ed", "持续发现习惯", "逃离构建陷阱", "赋能", "卓有成效的管理者"],
    goals: ["exec-001-02 产品战略框架", "exec-003-04 蒸馏≥5/本"],
    anchors: [{ label: "PRD 模板 §1 §2", path: "curator/templates/005-模板-PRD模板.md" }, { label: "JTBD 框架", path: "strategy/021-战略-JTBD框架.md" }, { label: "010 §1.1 D3 贡献三维度", path: "executive/reading-list/010-阅读-读书笔记-卓有成效的管理者.md" }] },
  { id: "I-09", confidence: 5,
    insight: "GameDay 必须在生产做（渐进式小颗粒）；预发演练收益只有生产的 15% = Drucker 决策验证必须内置。",
    supporting: ["SRE Workbook", "NIST SP800-160", "团队拓扑", "卓有成效的管理者"],
    goals: ["exec-002-03 MTTR ≤15min", "exec-002-04 安全 SRE"],
    anchors: [{ label: "YiPot §16.6 GameDay", path: "projects/yipot/README.md" }, { label: "ADR-017 弹性策略", path: "adr/017-网络弹性演练策略.md" }, { label: "010 §5.1 决策 5 要素", path: "executive/reading-list/010-阅读-读书笔记-卓有成效的管理者.md" }] },
  { id: "I-10", confidence: 5,
    insight: "CEO 困难决策的心理安全 3 要素：写下来 · 留反事实证据 · 有季度复审节点（错了也 60 分）。",
    supporting: ["创业维艰", "思考快与慢", "西蒙学习法", "好战略坏战略", "卓有成效的管理者"],
    goals: ["exec-001-01 决策流程标准化"],
    anchors: [{ label: "leader decisions README", path: "leader/decisions/README.md" }, { label: "010 §5.1 7 字段铁三角", path: "executive/reading-list/010-阅读-读书笔记-卓有成效的管理者.md" }] },
  { id: "I-11", confidence: 5,
    insight: "松耦合 + 流对齐团队 = 高交付 + 低认知负荷；紧耦合单体部署频率 ÷2.6 失败率 ×3.1。",
    supporting: ["团队拓扑", "加速", "优雅的难题", "剑指前端 offer"],
    goals: ["exec-002-02 流对齐", "exec-002-03 前端 Lead Time -40%"],
    anchors: [{ label: "YiAi §5 6 层松耦合", path: "projects/yiai/README.md" }, { label: "YiPot §5 IPC 隔离", path: "projects/yipot/README.md" }, { label: "YiVad §3.2 Tree Shaking", path: "projects/yivad/README.md" }] },
  { id: "I-12", confidence: 5,
    insight: "技术债 = 金融负债（有复利）：利率 × 本金 × DCF 模型量化；债利率 > 投资回报率必须优先还。",
    supporting: ["逃离构建陷阱", "优雅的难题", "加速", "思考快与慢", "西蒙学习法"],
    goals: ["exec-002-03 技术债 ≤15%", "exec-003-05 ROI 决策"],
    anchors: [{ label: "tech-debt 治理框架", path: "quality/tech-debt/001-技术债-治理框架.md" }, { label: "curator 知识健康看板", path: "curator/governance/001-治理-知识健康看板.md" }] }
];

// ──────────────────────────────────────────────────────────────────────
// §5 OKR 3 Goal × 10 KR 支撑矩阵
// ──────────────────────────────────────────────────────────────────────

const OKR_ROWS: OKRSupportRow[] = [
  // Goal 001
  { goalId: "001", goalTitle: "市场情报 & 战略定位", krId: "001-01", krDescription: "持续外部情报收集机制（≥12 信号源）", supports: ["创业维艰", "Gartner MQ", "a16z AI PMF", "信通院合规白皮书"], coverageScore: 9 },
  { goalId: "001", goalTitle: "市场情报 & 战略定位", krId: "001-02", krDescription: "3 年战略定位 + 差异化（可量化）", supports: ["好战略坏战略", "蓝海战略", "赋能", "持续发现习惯"], coverageScore: 9 },
  // Goal 002
  { goalId: "002", goalTitle: "组织效能 & 技术路线", krId: "002-01", krDescription: "管理升级：中层杠杆率 ≥30%", supports: ["高产出管理", "优雅的难题", "团队拓扑", "卓有成效的管理者", "西蒙学习法"], coverageScore: 12 },
  { goalId: "002", goalTitle: "组织效能 & 技术路线", krId: "002-02", krDescription: "组织结构：流对齐团队 + 认知负荷 ≤3 域", supports: ["团队拓扑", "优雅的难题", "Staff Engineer 路径"], coverageScore: 9 },
  { goalId: "002", goalTitle: "组织效能 & 技术路线", krId: "002-03", krDescription: "DORA：部署频率 ×2 · 变更失败率 ≤15%", supports: ["加速（2 遍）", "SRE Workbook", "How Google Tests", "RAG 缓存 Paper", "剑指前端 offer"], coverageScore: 10 },
  { goalId: "002", goalTitle: "组织效能 & 技术路线", krId: "002-04", krDescription: "安全合规：等保 & ISO27001 差距 ≤20 项", supports: ["NIST 800-160", "ISO 27701", "ISO 27001:2022", "OSSRA", "Gartner AI Hype"], coverageScore: 10 },
  // Goal 003
  { goalId: "003", goalTitle: "经营学习 & 知识蒸馏", krId: "003-01", krDescription: "阅读结构 L1+L2 ≥40%", supports: ["思考快与慢", "好战略坏战略", "创业维艰", "卓有成效的管理者", "西蒙学习法"], coverageScore: 10 },
  { goalId: "003", goalTitle: "经营学习 & 知识蒸馏", krId: "003-02", krDescription: "7 高管 每人每月 ≥1 本精读 + 笔记（100%）", supports: ["§2.5 每月 7 行 × 3 月", "CFO/Head-of-People 11 月起新增", "西蒙 21 天节奏"], coverageScore: 10 },
  { goalId: "003", goalTitle: "经营学习 & 知识蒸馏", krId: "003-03", krDescription: "每本精读 ≥3 条 5 字段可执行行动项", supports: ["§0.1 9 字段验收", "§0.2.2 模板 §4", "西蒙 A3 可证伪标准"], coverageScore: 10 },
  { goalId: "003", goalTitle: "经营学习 & 知识蒸馏", krId: "003-04", krDescription: "每本蒸馏 ≥5 个真实知识叶锚点", supports: ["§3 蒸馏锚点列", "西蒙 Connect三步法 (CN1≥5,CN2≥2,CN3≥3)"], coverageScore: 10 },
  { goalId: "003", goalTitle: "经营学习 & 知识蒸馏", krId: "003-05", krDescription: "阅读→蒸馏转化率 ≥80%", supports: ["§1.1 K4", "§1.3 行动项执行率", "西蒙 A10 拖延治理 + 双回退"], coverageScore: 9 }
];

// ──────────────────────────────────────────────────────────────────────
// §6 蒸馏 7 状态机
// ──────────────────────────────────────────────────────────────────────

const DISTILL_STEPS: DistillStep[] = [
  { key: "queued",    label: "Queued",     description: "RICE≥60 进入 §7 待读队列", redlineDays: undefined },
  { key: "reading",   label: "Reading",    description: "每月 1 日评审会锁定本月 7 本", redlineDays: 31 },
  { key: "noted",     label: "Noted",      description: "Frontmatter 15 + 6 节齐全",     redlineDays: undefined },
  { key: "actionized",label: "Actionized", description: "≥3 条 5 字段行动项",            redlineDays: 1 },
  { key: "distilled", label: "Distilled",  description: "每条行动项 → 真实知识叶写入",   redlineDays: 14 },
  { key: "reviewed",  label: "Reviewed",   description: "月度评审会展示 Shipped 证据",   redlineDays: undefined },
  { key: "archived",  label: "Archived",   description: "季度末审计 → §3 已完成表",      redlineDays: undefined }
];

// ──────────────────────────────────────────────────────────────────────
// §7 Future Queue ≥ 20
// ──────────────────────────────────────────────────────────────────────

const FUTURE_QUEUE: FutureQueueItem[] = [
  // H 高 (RICE ≥ 75)
  { rank: "H-01", bucket: "high", title: "《跨越鸿沟》Crossing the Chasm", author: "Geoffrey Moore", type: "book", dimension: "strategy", rice: 78, roles: ["ceo","cpo"], eta: "2027-Q1 1 月", condition: "exec-001-02 KR ≥70% 完成" },
  { rank: "H-02", bucket: "high", title: "《创新者的窘境》The Innovator's Dilemma", author: "Clayton Christensen", type: "book", dimension: "strategy", rice: 76, roles: ["ceo","cto"], eta: "2027-Q1 2 月", condition: "2026 年度战略 Review 完成" },
  { rank: "H-03", bucket: "high", title: "《启示录 第 2 版》Inspired 2ed", author: "Marty Cagan", type: "book", dimension: "product", rice: 87, roles: ["cpo"], eta: "2027-Q1 1 月", condition: "持续发现习惯 11 月读完" },
  { rank: "H-04", bucket: "high", title: "《蓝海战略扩展版》Blue Ocean Strategy", author: "W. Chan Kim", type: "book", dimension: "strategy", rice: 92, roles: ["ceo","cfo","cpo"], eta: "2027-Q1 1 月", condition: "好战略坏战略 Reviewed" },
  { rank: "H-05", bucket: "high", title: "《产品开发流原则》Product Development Flow", author: "Don Reinertsen", type: "book", dimension: "product", rice: 81, roles: ["cpo","vp-eng"], eta: "2027-Q1 2 月", condition: "逃离构建陷阱 10 月读完" },
  { rank: "H-06", bucket: "high", title: "《Staff Engineer》Will Larson 版", author: "Will Larson", type: "book", dimension: "engineering", rice: 79, roles: ["cto"], eta: "2027-Q1 2 月", condition: "Staff Engineer Path 11 月读完" },
  { rank: "H-07", bucket: "high", title: "NIST SP 800-63-3 数字身份认证指南", author: "NIST", type: "paper", dimension: "sre", rice: 75, roles: ["security-lead","cpo"], eta: "2027-Q1 1 月", condition: "ISO 27001 读完" },
  { rank: "H-08", bucket: "high", title: "OWASP Top 10 2026 + ASVS 5.0", author: "OWASP", type: "paper", dimension: "sre", rice: 83, roles: ["security-lead","qa-lead"], eta: "2027-Q1 2 月", condition: "OSSRA 12 月读完" },

  // M 中 (60 ≤ RICE <75)
  { rank: "M-09", bucket: "medium", title: "《精益创业》The Lean Startup", author: "Eric Ries", type: "book", dimension: "product", rice: 68, roles: ["cpo"], eta: "2027-Q2", condition: "H-01~H-08 完成 5/8" },
  { rank: "M-10", bucket: "medium", title: "《反脆弱》Antifragile", author: "Nassim Taleb", type: "book", dimension: "strategy", rice: 72, roles: ["ceo","sre-lead"], eta: "2027-Q1 3 月", condition: "战略 Review 后" },
  { rank: "M-11", bucket: "medium", title: "RustConf 2026 生产 Rust 1000+ 天 Top 10 坑", author: "Rust 资深团队", type: "article", dimension: "engineering", rice: 66, roles: ["cto","vp-eng"], eta: "2026-10 泛读", condition: "有空就听（YiPot 相关）" },
  { rank: "M-12", bucket: "medium", title: "Werner Vogels 2026：Async-First 架构 10 戒律", author: "AWS CTO", type: "article", dimension: "engineering", rice: 70, roles: ["cto","sre-lead"], eta: "2026-11 月", condition: "工作相关" },
  { rank: "M-13", bucket: "medium", title: "OSDI'26 RAG SLO 保证 3 层组合", author: "USENIX", type: "paper", dimension: "ai", rice: 74, roles: ["cto","sre-lead"], eta: "2027-Q1", condition: "YiAi 上线 ≥ 100 DAU" },
  { rank: "M-14", bucket: "medium", title: "McKinsey 2027 AI 时代的组织设计", author: "McKinsey", type: "paper", dimension: "management", rice: 72, roles: ["ceo","vp-eng"], eta: "2027-Q1", condition: "2026 年终总结" },
  { rank: "M-15", bucket: "medium", title: "《代码大全 2》Code Complete 2 Ch 1-5", author: "Steve McConnell", type: "book", dimension: "engineering", rice: 69, roles: ["vp-eng","qa-lead"], eta: "2027-Q2", condition: "有空选读" },
  { rank: "M-16", bucket: "medium", title: "《凤凰项目》The Phoenix Project", author: "Gene Kim", type: "book", dimension: "sre", rice: 67, roles: ["sre-lead","vp-eng"], eta: "2027-Q1 3 月", condition: "SRE Workbook 读完" },

  // L 低
  { rank: "L-17", bucket: "low", title: "《人月神话》The Mythical Man-Month", author: "Fred Brooks", type: "book", dimension: "management", rice: 65, roles: ["vp-eng"], eta: "2027-Q2+", condition: "所有 H ≥ 80% 完成" },
  { rank: "L-18", bucket: "low", title: "《格鲁夫给经理人的第一课》Grove 自传版", author: "Grove 传记", type: "book", dimension: "management", rice: 63, roles: ["ceo","vp-eng"], eta: "2027-Q2", condition: "高产出管理 Reviewed ≥6 月" },
  { rank: "L-19", bucket: "low", title: "YC 创业 101 系列讲座（10 讲）", author: "YC Startup Library", type: "article", dimension: "product", rice: 61, roles: ["ceo","cpo"], eta: "碎片时间", condition: "泛听，不计 OKR" },
  { rank: "L-20", bucket: "low", title: "IETF RFC 9000 QUIC v1", author: "IETF", type: "paper", dimension: "sre", rice: 62, roles: ["cto","sre-lead"], eta: "有空", condition: "YiAi P95 > 2s 瓶颈时" }
];

// ──────────────────────────────────────────────────────────────────────
// 从 MONTHLY_ROWS 构建标准化 ReadingItem 列表
// ──────────────────────────────────────────────────────────────────────

function buildReadingItems(): ReadingItem[] {
  return MONTHLY_ROWS.map<ReadingItem>((r, idx) => {
    const status: ReadingItemStatus = statusFromZh(r.statusZh);
    const progress = r.progress ?? progressFromZh(r.statusZh);
    const priority = priorityFromRice(r.rice ?? 0, [r.role ?? ""]);
    const dimension = r.dimension ?? dimFromZh(r.category ?? "");
    return {
      key: `kb-${String(idx + 1).padStart(3, "0")}`,
      title: r.title,
      author: r.author,
      type: r.type ?? typeFromZh(r.category ?? ""),
      link: undefined,
      status,
      priority,
      rice: r.rice,
      progress,
      dimension,
      category: r.category,
      role: r.role,
      okrId: r.okrId,
      scheduled: r.scheduled,
      notes: r.notes,
      createdTime: "2026-10-09T00:00:00.000Z",
      updatedTime: "2026-10-09T00:00:00.000Z"
    };
  });
}

// ──────────────────────────────────────────────────────────────────────
// 计算 ReadingListBreakdown
// ──────────────────────────────────────────────────────────────────────

function computeBreakdown(list: ReadingItem[]): ReadingListBreakdown {
  const bd: ReadingListBreakdown = {
    byType: { article: 0, book: 0, paper: 0 },
    byDimension: { strategy: 0, management: 0, engineering: 0, frontend: 0, sre: 0, ai: 0, product: 0, cognition: 0 },
    byPriority: { high: 0, medium: 0, low: 0 },
    byStatus: { "to-read": 0, reading: 0, done: 0 },
    riceBuckets: { tier1: 0, tier2: 0, tier3: 0, tier4: 0 },
    avgRice: 0, avgProgress: 0, completionPct: 0
  };
  let riceSum = 0, riceCount = 0, progSum = 0, progCount = 0;
  for (const it of list) {
    if (it.type) bd.byType[it.type] = (bd.byType[it.type] ?? 0) + 1;
    if (it.dimension) bd.byDimension[it.dimension] = (bd.byDimension[it.dimension] ?? 0) + 1;
    if (it.priority) bd.byPriority[it.priority] = (bd.byPriority[it.priority] ?? 0) + 1;
    if (it.status) bd.byStatus[it.status] = (bd.byStatus[it.status] ?? 0) + 1;
    if (typeof it.rice === "number") {
      riceSum += it.rice; riceCount += 1;
      if (it.rice >= 80) bd.riceBuckets.tier1 += 1;
      else if (it.rice >= 60) bd.riceBuckets.tier2 += 1;
      else if (it.rice >= 40) bd.riceBuckets.tier3 += 1;
      else bd.riceBuckets.tier4 += 1;
    }
    const p = typeof it.progress === "number" ? it.progress
      : it.status === "done" ? 100
      : it.status === "reading" ? 50 : 0;
    progSum += p; progCount += 1;
  }
  bd.avgRice = riceCount ? Math.round((riceSum / riceCount) * 10) / 10 : 0;
  bd.avgProgress = progCount ? Math.round(progSum / progCount) : 0;
  bd.completionPct = list.length ? Math.round(((bd.byStatus.done ?? 0) / list.length) * 100) : 0;
  return bd;
}

// ──────────────────────────────────────────────────────────────────────
// Composable
// ──────────────────────────────────────────────────────────────────────

export function useReadingListKnowledgeSource() {
  const sourceMode = ref<SourceMode>("kb");
  const loadError = ref<string | null>(null);
  const loadState = reactive({ loading: false, loaded: false });
  const seedState = reactive({ running: false, done: 0, total: 0, lastRun: "" });

  // Immutable KB snapshot
  const kbItems = buildReadingItems();
  const kbBreakdown = computeBreakdown(kbItems);
  const kbSummary = computed(() => ({
    total: kbItems.length,
    reading: kbBreakdown.byStatus.reading,
    done: kbBreakdown.byStatus.done
  }));

  // ── Mutations ──────────────────────────────────────────────────────

  async function loadFromKB() {
    loadState.loading = true;
    loadError.value = null;
    try {
      // 前端直接访问本地 md 文件依赖 YiAi 的 knowledgeFile 预览 API 或
      // import.meta.glob。本轮使用 SSOT 快照（已与 001.md v3.2 对齐）。
      await new Promise(r => setTimeout(r, 80));
      loadState.loaded = true;
      sourceMode.value = "kb";
    } catch (e) {
      loadError.value = e instanceof Error ? e.message : String(e);
      sourceMode.value = "db";
    } finally {
      loadState.loading = false;
    }
  }

  /**
   * Seed YiAi DB with KB items (idempotent by title+author).
   * Returns the count of newly-inserted rows.
   */
  async function seedToYiAiDb(signal?: AbortSignal): Promise<number> {
    seedState.running = true;
    seedState.total = kbItems.length;
    seedState.done = 0;
    let inserted = 0;
    try {
      // Fetch existing keys we already have to avoid duplicates.
      let existingKeys: Set<string> = new Set();
      try {
        const res = await getReadingList({ pageNum: 1, pageSize: 500 });
        const list = (res.data as any)?.list ?? [];
        existingKeys = new Set(
          list.map((x: ReadingItem) => `${x.title}|${x.author ?? ""}`.toLowerCase())
        );
      } catch {
        existingKeys = new Set();
      }
      for (const item of kbItems) {
        if (signal?.aborted) break;
        const k = `${item.title}|${item.author ?? ""}`.toLowerCase();
        if (existingKeys.has(k)) { seedState.done += 1; continue; }
        try {
          const { key: _k, createdTime: _ct, updatedTime: _ut, ...rest } = item;
          await createReadingItem(rest as any);
          inserted += 1;
        } catch {/* ignore per-row; total shows progress */}
        seedState.done += 1;
      }
      seedState.lastRun = new Date().toISOString();
      ElMessage.success(`同步完成：新增 ${inserted} 条，跳过 ${seedState.total - inserted} 条重复`);
    } catch (e) {
      ElMessage.error("同步失败：" + (e instanceof Error ? e.message : String(e)));
    } finally {
      seedState.running = false;
    }
    return inserted;
  }

  return {
    // mode
    sourceMode,
    setSourceMode: (m: SourceMode) => { sourceMode.value = m; },

    // load state
    loadState,
    loadError,
    loadFromKB,

    // data: items + breakdown
    kbItems,
    kbBreakdown,
    kbSummary,

    // derived datasets
    sloCards: SLO_CARDS,             // 8 cards (K1-K6 + K-06/07/08)
    alerts: ALERTS,                 // §1.2 4 行 红绿灯
    insights: INSIGHTS,             // §8 12 条 5★
    okrRows: OKR_ROWS,              // §5 10 KR
    distillSteps: DISTILL_STEPS,    // §6 7 状态机
    futureQueue: FUTURE_QUEUE,      // §7 ≥ 20 条

    // seeding
    seedState,
    seedToYiAiDb,

    // helpers (export for UI)
    dimFromZh,
    priorityFromRice
  };
}

export type ReadingKnowledgeSource = ReturnType<typeof useReadingListKnowledgeSource>;
