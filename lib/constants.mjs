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

/** Diagnostic → proposal type routing (from rules/self-improve.md) */
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
  D0: "CLAUDE.md · agents/",
  D1: "code-pipeline.md",
  D2: "doc-generation.md",
  D3: "pm.md（故事拆分）",
  D4: "code-pipeline.md",
  D5: "agents/",
  D6: "CLAUDE.md",
  D7: "rules/self-improve.md",
  D8: "rules/architecture-principles.md · rules/design-principles.md",
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
  process: "rules/code-pipeline.md",
  quality: "agents/tester.md 或 agents/coder.md",
  refactor: "rules/code-pipeline.md §深度模块",
  security: "agents/security.md P0 约束",
  skill: "skills/ 或 rules/ 新条目",
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
 * Canonical health dimension weights — single source of truth.
 *
 * send.mjs and health-report.mjs MUST import from here rather than
 * maintaining independent copies. When adding a dimension, update this
 * definition and re-run `node skills/rui-bot/send.mjs health --html` to
 * regenerate reports with updated weights.
 *
 * Note: send.mjs has 9 core dims + 7 engineering maturity dims = 16 total.
 * Weights sum to 100 (core) + 100 (em) = 200 for the composite score;
 * core and em are normalized to 50/50 in the compound calculation.
 */
export const HEALTH_DIM_WEIGHTS = {
  // Core dimensions (9)
  token:       15,
  config:      10,
  robots:      10,
  api:         15,
  reports:     10,
  format:      10,
  diagnostics: 10,
  git:         10,
  security:    10,
  // Engineering maturity (7)
  em_testing:  10,
  em_types:    15,
  em_linting:  15,
  em_cicd:     15,
  em_docs:     15,
  em_deps:     10,
  em_git:      10,
};

/** Health dimension display labels */
export const HEALTH_DIM_LABELS = {
  token:       "Token 凭据",
  config:      "配置文件",
  robots:      "企微机器人",
  api:         "API 可达性",
  reports:     "报告新鲜度",
  format:      "消息格式",
  diagnostics: "诊断引擎",
  git:         "Git 状态",
  security:    "安全扫描",
  em_testing:  "测试体系",
  em_types:    "类型系统",
  em_linting:  "代码规范",
  em_cicd:     "CI/CD",
  em_docs:     "文档完整性",
  em_deps:     "依赖管理",
  em_git:      "Git 纪律",
};

// ── Architecture health dimensions ────────────────────────────────────

/**
 * Architecture compliance health dimensions.
 *
 * These extend the core 9 + em 7 dimensions to verify architecture-level
 * principles defined in rules/architecture-principles.md.
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
 * See rules/design-principles.md §可健康检测 for the verification matrix.
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
