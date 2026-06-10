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
export const BLOCK_RATE_P0 = 0.20;
export const P0_DENSITY_MULTIPLIER = 2.0;
export const T3_PROPORTION_THRESHOLD = 0.30;
export const STAGE_DURATION_MULTIPLIER = 3.0;
export const TOOL_ERROR_RATE_THRESHOLD = 0.30;
export const GATE_B_MAX_ROUNDS = 2;
export const PROPOSAL_CLOSURE_MIN_RATE = 0.50;

// ── Diagnostic labels, routing, and baselines ───────────────────────

/** D0-D7 diagnostic labels (shared: proposals.mjs, collect.mjs) */
export const DIAGNOSTIC_LABELS = {
  D0: "基线偏离",
  D1: "效率退化",
  D2: "质量退化",
  D3: "复杂度增长",
  D4: "流程退化",
  D5: "依赖退化",
  D6: "文档过时",
  D7: "配置漂移",
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
};

/** Valid proposal types */
export const PROPOSAL_TYPES = ["process", "quality", "refactor", "security", "skill"];

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
