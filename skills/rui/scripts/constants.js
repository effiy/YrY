// Semantic constants — single source of truth for all thresholds, weights, and limits.
// Import: const C = require('./constants.js');

// ── Content validation ───────────────────────────────────────────

const MIN_AGENT_CONTENT_LENGTH = 100;
const MIN_TEMPLATE_CONTENT_LENGTH = 100;
const MIN_PHILOSOPHY_DESC_LENGTH = 2;

// ── Project type detection ───────────────────────────────────────

const MAX_FILE_COUNT_FOR_SCORING = 20;          // Cap per-extension file count to avoid skew
const FRONTEND_EXTENSION_WEIGHTS = {             // Weight per extension type
  '.vue': 3, '.jsx': 2, '.tsx': 2,
  '.svelte': 3, '.scss': 1, '.less': 1,
};
const BACKEND_EXTENSION_WEIGHTS = {
  '.go': 3, '.py': 2, '.java': 2,
  '.rs': 2, '.sql': 1, '.proto': 2,
};
const FRAMEWORK_DEPENDENCY_WEIGHT = 3;           // Weight for framework in package.json
const API_PATTERN_WEIGHT = 2;                    // Weight for API route pattern detection
const API_PATTERN_SCAN_MAX_FILES = 20;           // Max files to scan for API patterns
const API_PATTERN_SCAN_CONTENT_BYTES = 2000;     // First N bytes to read per file

// ── Code analysis ────────────────────────────────────────────────

const LARGE_FILE_LINE_THRESHOLD = 300;            // Files >= this many lines are cohesion risks
const LARGE_FILES_TOP_N = 15;                     // How many large files to report
const GIT_HEATMAP_TOP_N = 20;                     // How many files in git heatmap
const DEPENDENCY_SCAN_MAX_FILES = 50;             // Max files to grep for dependency scanning
const DEPENDENCY_ANALYSIS_MAX_FILES = 30;         // Max files to read for dependency analysis
const DEPENDENCY_HOTSPOTS_TOP_N = 10;             // How many hotspots to report

// ── Diagnosis thresholds ─────────────────────────────────────────

const BLOCKED_RATE_HIGH = 0.20;                   // D1: 阻断率 > 20%
const P0_DENSITY_HIGH_MULTIPLIER = 2;             // D2: P0 密度 > 平均值 2x
const T3_CHANGE_RATIO_HIGH = 0.30;                // D3: T3 变更占比 > 30%
const GATE_B_MAX_ROUNDS = 2;                      // D4: Gate B > 2 轮
const PHASE_DURATION_HIGH_MULTIPLIER = 3;         // D5: 阶段耗时 > 平均值 3x
const CONSECUTIVE_DEGRADING_WINDOWS = 2;          // D6: 连续 N 窗口退化
const PROPOSAL_BACKLOG_RATIO = 2;                 // D7: 开放提案 > 已完成 N 倍
const PROPOSAL_BACKLOG_MIN_TOTAL = 5;             // D7: 且提案总量 > N

// ── Effect evaluation ────────────────────────────────────────────

const EVAL_WINDOW_DAYS = 28;                      // Before/after window for proposal evaluation
const HIGH_CONFIDENCE_MIN_RECORDS = 5;             // ≥ N per period for high confidence
const MEDIUM_CONFIDENCE_MIN_RECORDS = 3;            // ≥ N per period for medium confidence

// ── Health scoring ───────────────────────────────────────────────

const HEALTH_STABILITY_BENCHMARK = 0.70;           // Target 70% T1 ratio for full stability score
const HEALTH_P0_PENALTY_FACTOR = 200;              // Each 1% P0 rate costs N points
const HEALTH_BLOCKED_PENALTY_FACTOR = 200;         // Each 1% blocked rate costs N points
const HEALTH_COHESION_PENALTY_PER_FILE = 15;       // Each large file costs N points
const HEALTH_WEIGHTS = {                           // Dimension weights for composite score
  stability: 0.20,
  quality: 0.25,
  blocked: 0.20,
  closure: 0.20,
  cohesion: 0.15,
};
const HEALTH_DIM_LOW_THRESHOLD = 70;               // Dimension score below this needs attention

// ── Retro & trends ───────────────────────────────────────────────

const DEFAULT_RETRO_WEEKS = 8;                     // Default retro/tend analysis window
const RETRO_WINDOW_SIZE_DAYS = 14;                 // Days per retro sliding window
const CLOSURE_RATE_LOW_THRESHOLD = 0.50;           // Below 50% closure rate needs attention

// ── Recommendation limits ────────────────────────────────────────

const DEFAULT_RECOMMENDATION_LIMIT = 10;           // Default --limit for recommend.js
const MAX_OPEN_P0_RECS = 3;                         // Max P0 proposal items in recommendations
const MAX_OPEN_P1_RECS = 3;                         // Max P1 proposal items in recommendations
const MAX_DEGRADING_SIGNAL_RECS = 2;               // Max degrading signal items
const MAX_LARGE_FILE_RECS = 2;                      // Max large file items in recommendations
const MAX_LOW_HEALTH_DIM_RECS = 2;                  // Max low health dimension items
const PROPOSAL_BACKLOG_MIN_ACTIVE = 3;              // Min active proposals to check for backlog

module.exports = {
  // Content validation
  MIN_AGENT_CONTENT_LENGTH,
  MIN_TEMPLATE_CONTENT_LENGTH,
  MIN_PHILOSOPHY_DESC_LENGTH,

  // Project type detection
  MAX_FILE_COUNT_FOR_SCORING,
  FRONTEND_EXTENSION_WEIGHTS,
  BACKEND_EXTENSION_WEIGHTS,
  FRAMEWORK_DEPENDENCY_WEIGHT,
  API_PATTERN_WEIGHT,
  API_PATTERN_SCAN_MAX_FILES,
  API_PATTERN_SCAN_CONTENT_BYTES,

  // Code analysis
  LARGE_FILE_LINE_THRESHOLD,
  LARGE_FILES_TOP_N,
  GIT_HEATMAP_TOP_N,
  DEPENDENCY_SCAN_MAX_FILES,
  DEPENDENCY_ANALYSIS_MAX_FILES,
  DEPENDENCY_HOTSPOTS_TOP_N,

  // Diagnosis thresholds
  BLOCKED_RATE_HIGH,
  P0_DENSITY_HIGH_MULTIPLIER,
  T3_CHANGE_RATIO_HIGH,
  GATE_B_MAX_ROUNDS,
  PHASE_DURATION_HIGH_MULTIPLIER,
  CONSECUTIVE_DEGRADING_WINDOWS,
  PROPOSAL_BACKLOG_RATIO,
  PROPOSAL_BACKLOG_MIN_TOTAL,

  // Effect evaluation
  EVAL_WINDOW_DAYS,
  HIGH_CONFIDENCE_MIN_RECORDS,
  MEDIUM_CONFIDENCE_MIN_RECORDS,

  // Health scoring
  HEALTH_STABILITY_BENCHMARK,
  HEALTH_P0_PENALTY_FACTOR,
  HEALTH_BLOCKED_PENALTY_FACTOR,
  HEALTH_COHESION_PENALTY_PER_FILE,
  HEALTH_WEIGHTS,
  HEALTH_DIM_LOW_THRESHOLD,

  // Retro & trends
  DEFAULT_RETRO_WEEKS,
  RETRO_WINDOW_SIZE_DAYS,
  CLOSURE_RATE_LOW_THRESHOLD,

  // Recommendation limits
  DEFAULT_RECOMMENDATION_LIMIT,
  MAX_OPEN_P0_RECS,
  MAX_OPEN_P1_RECS,
  MAX_DEGRADING_SIGNAL_RECS,
  MAX_LARGE_FILE_RECS,
  MAX_LOW_HEALTH_DIM_RECS,
  PROPOSAL_BACKLOG_MIN_ACTIVE,
};
