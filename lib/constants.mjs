/**
 * Shared project constants.
 *
 * Each constant that was previously re-defined across multiple files lives here
 * so there is a single source of truth. When a script needs a value different
 * from the default, import and override locally — but the canonical default
 * must be in this file.
 */

// ── CLI ─────────────────────────────────────────────────────────────

/** Offset to skip `node <script>` in process.argv */
export const NODE_ARGV_OFFSET = 2;

// ── Network ─────────────────────────────────────────────────────────

export const HTTP_TIMEOUT_MS = 30_000;
export const HTTP_TIMEOUT_SHORT_MS = 10_000;
export const GIT_TIMEOUT_MS = 5_000;

// ── Default API ─────────────────────────────────────────────────────

export const DEFAULT_API_URL = "https://api.effiy.cn";
export const SESSION_QUERY_LIMIT = 10_000;

// ── File I/O ────────────────────────────────────────────────────────

export const ERROR_MSG_MAX_LEN = 500;
export const MAX_MSG_LENGTH = 2_000;

// ── Story panel ─────────────────────────────────────────────────────

export const STORY_PANEL_DIR = "docs/故事任务面板";

// ── Memory files ────────────────────────────────────────────────────

export const MEMORY_DIR = ".memory";
export const PROPOSALS_DIR = ".improvement";
export const EXEC_MEMORY_FILE = ".memory/execution-memory.jsonl";
export const TOOL_AUDIT_FILE = ".memory/tool-audit.jsonl";
export const DELIVERY_TRACK_FILE = ".memory/delivery-tracking.jsonl";
export const RUI_STATE_FILE = ".memory/rui-state.json";
export const STATUS_HISTORY_FILE = ".memory/status-history.jsonl";
export const PROPOSALS_FILE = ".improvement/proposals.jsonl";
export const COMPRESSED_MEMORY_FILE = ".memory/compressed-memory.json";

// ── Retry ───────────────────────────────────────────────────────────

export const MAX_RETRIES = 3;
export const RETRY_DELAY_MS = 1_000;

// ── Concurrency ─────────────────────────────────────────────────────

export const CONCURRENCY = 4;

// ── Diagnostic ──────────────────────────────────────────────────────

export const BLOCK_RATE_THRESHOLD = 0.20;
export const T3_PROPORTION_THRESHOLD = 0.30;
export const TOOL_ERROR_RATE_THRESHOLD = 0.30;
export const GATE_B_MAX_ROUNDS = 2;
export const PROPOSAL_CLOSURE_MIN_RATE = 0.50;

// ── Diagnostic labels, routing, and baselines ───────────────────────

/** D0-D8 diagnostic labels (shared: diagnostics.mjs, materialize.mjs, selfimprove-generator.mjs) */
export const DIAGNOSTIC_LABELS = {
  D0: "基线偏离",
  D1: "效率退化",
  D2: "质量退化",
  D3: "复杂度增长",
  D4: "流程退化",
  D5: "依赖退化",
  D6: "文档过时",
  D7: "配置漂移",
  D8: "架构退化",
};

/** Diagnostic → proposal type routing (from skills/rui-yry/rules/self-improve.md) */
export const DIAGNOSTIC_PROPOSAL_TYPE = {
  D0: "process",
  D1: "refactor",
  D2: "quality",
  D3: "security",
  D4: "quality",
  D5: "refactor",
  D6: "process",
  D7: "process",
  D8: "refactor",
};

/** Diagnostic → baseline file reference */
export const DIAGNOSTIC_BASELINES = {
  D0: "CLAUDE.md · skills/rui/AGENT.md",
  D1: "code-pipeline.md",
  D2: "doc-generation.md",
  D3: "skills/rui/pm.md（故事拆分）",
  D4: "code-pipeline.md",
  D5: "skills/rui/AGENT.md",
  D6: "CLAUDE.md",
  D7: "skills/rui-yry/rules/self-improve.md",
  D8: "skills/rui/rules/architecture-principles.md · skills/rui/rules/design-principles.md",
};

/** Minimum execution memories required to trigger each diagnostic */
export const DIAGNOSTIC_MIN_CONFIDENCE = {
  D0: 1,
  D1: 5,
  D2: 3,
  D3: 3,
  D4: 2,
  D5: 3,
  D6: 2,
  D7: 5,
  D8: 1,
};

/** Minimum execution memories for full diagnostics (vs degraded observation) */
export const MIN_EXEC_MEMORIES = 3;

/** Upgrade thresholds for experience→skill: type → story count */
export const UPGRADE_THRESHOLDS = {
  process: 3,
  quality: 3,
  refactor: 3,
  security: 1,
  skill: 2,
};

/** Upgrade targets: proposal type → target file */
export const UPGRADE_TARGETS = {
  process: "skills/rui-code/rules/code-pipeline.md",
  quality: "skills/rui/tester.md 或 skills/rui/coder.md",
  refactor: "skills/rui-code/rules/code-pipeline.md §深度模块",
  security: "skills/rui/security.md P0 约束",
  skill: "skills/ 新条目",
};

/** Materialization */
export const IMPROVE_STORY_PREFIX = "improve";
export const DEFAULT_MIN_PRIORITY = "P2";
export const PRIORITY_ORDER = { P0: 0, P1: 1, P2: 2, P3: 3 };

// ── Display ─────────────────────────────────────────────────────────

export const LEFT_COLUMN_WIDTH = 56;
export const COLUMN_MIN_PADDING = 2;
export const INDENT = "  ";
export const SUB_INDENT = "    ";

// ── Health dimensions ────────────────────────────────────────────────

/**
 * Canonical health scoring dimensions — SINGLE SOURCE OF TRUTH.
 *
 * All health scoring, reporting, and trend modules MUST import from here.
 * When adding a dimension, update this definition and re-run
 * `node skills/rui-bot/send.mjs health --html` to regenerate reports.
 *
 * Weight design rationale:
 *   Core (9 dims, Σ=80) — operational health, most critical for system function
 *   Structural (2 dims, Σ=16) — file/dependency health, early warning signals
 *   Engineering (7 dims, Σ=56) — development maturity, long-term sustainability
 *   Quality (1 dim, Σ=8) — component-level health aggregation
 *   Total weight pool = 160, normalized per dim as weight/Σweights
 *
 * Composite score = Σ(score[dim] × weight[dim]) / Σ(weight[dim])
 * Grade thresholds: A ≥ 90 · B ≥ 75 · C ≥ 60 · D < 60
 */
export const HEALTH_SCORING_DIMENSIONS = {
  // ── Core operational (9) ──────────────────────────────────────────
  token:        { label: "Token 凭据",    weight: 12, icon: "🔑", category: "core" },
  config:       { label: "配置文件",      weight: 8,  icon: "⚙️", category: "core" },
  robots:       { label: "机器人配置",    weight: 8,  icon: "🤖", category: "core" },
  api:          { label: "API 可达性",    weight: 12, icon: "🌐", category: "core" },
  reports:      { label: "自循环报告",    weight: 8,  icon: "📊", category: "core" },
  format:       { label: "消息格式合规",  weight: 8,  icon: "📋", category: "core" },
  diagnostics:  { label: "D0-D7 诊断",   weight: 8,  icon: "🔬", category: "core" },
  git:          { label: "Git 仓库状态",  weight: 8,  icon: "📦", category: "core" },
  security:     { label: "安全扫描",      weight: 8,  icon: "🛡️", category: "core" },
  notify:       { label: "通知投递质量",  weight: 8,  icon: "📨", category: "core" },
  // ── Extended structural (2) ───────────────────────────────────────
  file_size:    { label: "文件体积",      weight: 8,  icon: "📏", category: "structural" },
  dep_analysis: { label: "依赖分析",      weight: 8,  icon: "🔗", category: "structural" },
  // ── Engineering maturity (7) ──────────────────────────────────────
  em_testing:   { label: "测试体系",      weight: 10, icon: "🧪", category: "engineering" },
  em_types:     { label: "类型安全",      weight: 8,  icon: "🔷", category: "engineering" },
  em_linting:   { label: "代码规范",      weight: 8,  icon: "📏", category: "engineering" },
  em_cicd:      { label: "CI/CD",         weight: 8,  icon: "🔄", category: "engineering" },
  em_docs:      { label: "文档完整性",    weight: 8,  icon: "📚", category: "engineering" },
  em_deps:      { label: "依赖管理",      weight: 6,  icon: "📦", category: "engineering" },
  em_git:       { label: "Git 纪律",      weight: 6,  icon: "🌿", category: "engineering" },
  // ── Component quality (1) ─────────────────────────────────────────
  comp_qual:    { label: "组件质量",      weight: 8,  icon: "🧩", category: "quality" },
};

// ── Derived flat maps (for backward compat and convenience) ─────────

/** Flat weight map: dimKey → weight (for composite calculation) */
export const HEALTH_DIM_WEIGHTS = Object.fromEntries(
  Object.entries(HEALTH_SCORING_DIMENSIONS).map(([k, v]) => [k, v.weight])
);

/** Flat label map: dimKey → display label */
export const HEALTH_DIM_LABELS = Object.fromEntries(
  Object.entries(HEALTH_SCORING_DIMENSIONS).map(([k, v]) => [k, v.label])
);

/** Flat icon map: dimKey → emoji icon */
export const HEALTH_DIM_ICONS = Object.fromEntries(
  Object.entries(HEALTH_SCORING_DIMENSIONS).map(([k, v]) => [k, v.icon])
);

/** Flat category map: dimKey → category */
export const HEALTH_DIM_CATEGORIES = Object.fromEntries(
  Object.entries(HEALTH_SCORING_DIMENSIONS).map(([k, v]) => [k, v.category])
);

// ── Grade thresholds ────────────────────────────────────────────────

/** Health grade thresholds (checked top-down, first match wins) */
export const HEALTH_GRADE_THRESHOLDS = [
  { min: 90, grade: "A", label: "优秀",  color: "#22c55e", ansi: "\x1b[32m" },
  { min: 75, grade: "B", label: "良好",  color: "#f59e0b", ansi: "\x1b[33m" },
  { min: 60, grade: "C", label: "一般",  color: "#f59e0b", ansi: "\x1b[33m" },
  { min: 0,  grade: "D", label: "需关注", color: "#ef4444", ansi: "\x1b[31m" },
];

/** Grade display styles (for HTML/CSS) */
export const GRADE_STYLE = {
  A: { color: "#22c55e", bg: "rgba(34,197,94,.12)" },
  B: { color: "#f59e0b", bg: "rgba(245,158,11,.12)" },
  C: { color: "#f59e0b", bg: "rgba(245,158,11,.08)" },
  D: { color: "#ef4444", bg: "rgba(239,68,68,.12)" },
};

// ── Backward compatibility alias ────────────────────────────────────

/**
 * @deprecated Use HEALTH_SCORING_DIMENSIONS directly.
 *             Kept for modules still using the old {label, weight} shape.
 */
export { HEALTH_SCORING_DIMENSIONS as HEALTH_DIMENSIONS };

// ── Health SLO thresholds ──────────────────────────────────────

/**
 * Service Level Objective thresholds for health scoring.
 *
 * Three severity levels with escalating response expectations:
 *   WARNING  — 需关注，计划性改进即可
 *   CRITICAL — 需处理，本周内应有行动
 *   BREACH   — 需立即干预，SLO 违约
 *
 * Each level defines a composite score threshold and per-dimension minimum.
 */
export const HEALTH_SLO = {
  composite: {
    warning:  75,  // < 75 → WARNING
    critical: 60,  // < 60 → CRITICAL
    breach:   40,  // < 40 → BREACH
  },
  /** Per-dimension minimum thresholds (dim must be >= value) */
  dimensionMin: {
    warning:  70,
    critical: 50,
    breach:   30,
  },
  /** Maximum allowed consecutive declining checks before WARNING */
  maxDecliningStreak: 3,
  /** Labels and icons for each level */
  levels: {
    ok:       { label: "健康",    icon: "✅", color: "#22c55e", ansi: "\x1b[32m" },
    warning:  { label: "需关注",  icon: "⚠️", color: "#f59e0b", ansi: "\x1b[33m" },
    critical: { label: "需处理",  icon: "🔶", color: "#f97316", ansi: "\x1b[33m" },
    breach:   { label: "SLO违约", icon: "🚨", color: "#ef4444", ansi: "\x1b[31m" },
  },
};

/**
 * Determine SLO status from composite score and optional context.
 *
 * @param {number} composite - Composite health score (0-100)
 * @param {object} [opts] - { decliningStreak }
 * @returns {{ level: string, label: string, icon: string, color: string }}
 */
export function getSLOStatus(composite, opts = {}) {
  const { composite: thresholds, levels } = HEALTH_SLO;

  let level = "ok";
  if (composite < thresholds.breach) level = "breach";
  else if (composite < thresholds.critical) level = "critical";
  else if (composite < thresholds.warning) level = "warning";

  // Escalate if declining streak exceeds max
  if (opts.decliningStreak >= HEALTH_SLO.maxDecliningStreak && level === "ok") {
    level = "warning";
  }

  return { level, ...levels[level] };
}

// ── Architecture health dimensions ────────────────────────────────────

/**
 * Architecture compliance health dimensions.
 *
 * These extend the core 9 + em 7 dimensions to verify architecture-level
 * principles defined in skills/rui/rules/architecture-principles.md.
 */
export const ARCH_HEALTH_DIM_LABELS = {
  arch_kernel:     "内核体积",
  arch_srp:        "SRP 合规",
  arch_imports:    "导入规范",
  arch_extensions: "扩展隔离",
  arch_isp:        "ISP 合规",
  arch_frontmatter:"配置完整性",
  arch_paradigm:   "范式合规",
  arch_docs:       "文档新鲜度",
  arch_healthcheck:"原则可验证",
};

// ── Architecture constraints (from architecture-principles.md) ─────────

/** Maximum number of lib/ files (kernel size constraint) */
export const KERNEL_LIB_MAX_FILES = 20;

/** Maximum number of core rule files (kernel size constraint) */
export const KERNEL_RULES_MAX_FILES = 8;

/** Maximum lines for the rui orchestrator SKILL.md */
export const KERNEL_ORCHESTRATOR_MAX_LINES = 500;

/** Core rule files considered part of the kernel */
export const KERNEL_RULE_FILES = [
  "code-pipeline.md",
  "design-principles.md",
  "architecture-principles.md",
  "security-guardrails.md",
  "delivery-gate.md",
  "doc-generation.md",
  "self-improve.md",
  "agent-handoff.md",
];

// ── Design principle verification thresholds ───────────────────────────

/**
 * Thresholds for automated verification of each design principle.
 * See skills/rui/rules/design-principles.md §可健康检测 for the verification matrix.
 */
export const DESIGN_PRINCIPLE_THRESHOLDS = {
  /** Max "和/与/也" count in skill descriptions (SRP) */
  SRP_CONJUNCTION_MAX: 0,
  /** Max number of skills a single story change touches (high cohesion) */
  COHESION_MAX_SKILLS: 1,
  /** Max number of lib files a single story change touches (high cohesion) */
  COHESION_MAX_LIB: 1,
  /** Allowable direct skill-to-skill imports (low coupling) */
  COUPLING_MAX_DIRECT_IMPORTS: 0,
  /** Allowable agent-to-skill imports (DIP) */
  DIP_MAX_AGENT_SKILL_IMPORT: 0,
  /** Min call sites per lib export (YAGNI) */
  YAGNI_MIN_CALL_SITES: 2,
  /** Max duplicate definitions across files (DRY) */
  DRY_MAX_DUPLICATES: 1,
  /** Allowable class/extends instances (composition over inheritance) */
  COMPOSITION_MAX_CLASS: 0,
  /** Allowable export default instances */
  PARADIGM_MAX_DEFAULT_EXPORT: 0,
};
