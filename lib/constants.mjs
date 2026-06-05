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

// ── Default API ─────────────────────────────────────────────────────

export const DEFAULT_API_URL = "https://api.effiy.cn";

// ── File I/O ────────────────────────────────────────────────────────

export const ERROR_MSG_MAX_LEN = 500;
export const MAX_MSG_LENGTH = 2_000;

// ── Story panel ─────────────────────────────────────────────────────

export const STORY_PANEL_DIR = "docs/故事任务面板";

// ── Memory files ────────────────────────────────────────────────────

export const EXEC_MEMORY_FILE = ".memory/execution-memory.jsonl";
export const TOOL_AUDIT_FILE = ".memory/tool-audit.jsonl";
export const DELIVERY_TRACK_FILE = ".memory/delivery-tracking.jsonl";
export const RUI_STATE_FILE = ".memory/rui-state.json";
export const STATUS_HISTORY_FILE = ".memory/status-history.jsonl";
export const PROPOSALS_FILE = ".improvement/proposals.jsonl";

// ── Retry ───────────────────────────────────────────────────────────

export const MAX_RETRIES = 3;
export const RETRY_DELAY_MS = 1_000;

// ── Concurrency ─────────────────────────────────────────────────────

export const CONCURRENCY = 4;

// ── Diagnostic ──────────────────────────────────────────────────────

export const BLOCK_RATE_THRESHOLD = 0.20;
export const P0_DENSITY_MULTIPLIER = 2.0;
export const T3_PROPORTION_THRESHOLD = 0.30;
export const STAGE_DURATION_MULTIPLIER = 3.0;

// ── Display ─────────────────────────────────────────────────────────

export const LEFT_COLUMN_WIDTH = 56;
export const COLUMN_MIN_PADDING = 2;
export const INDENT = "  ";
export const SUB_INDENT = "    ";
