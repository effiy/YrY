/**
 * report-styles — Centralized style tokens & scoring helpers for health reports.
 *
 * Single source of truth for:
 *   - Score-tier color hex constants (used by inline `style="--color:..."` attrs)
 *   - CSS variable name strings (used by helper functions returning `var(--…)`)
 *   - Magic threshold numbers (file size, lines, fan-in/out, influence, etc.)
 *   - `escapeHtml()` for safe string interpolation in templates
 *   - Score-to-tier mapping that complements bot-health-analysis.mjs
 *
 * Why a separate module:
 *   - Two parallel color systems previously coexisted (hex literals + CSS vars)
 *   - The same `score >= 80 ? '#22c55e' : …` ternary was duplicated ~30 times
 *   - Magic numbers (巨型 ≥1000 行, 上帝模块 ≥10 依赖, etc.) were scattered
 *     across health-report.mjs and report-sections.mjs
 */

import { PASS_THRESHOLD, WARN_THRESHOLD } from "./bot-health-analysis.mjs";

// ── Hex color palette (used for inline style attrs that need raw color) ──

/** Green — pass / healthy / rising / improved */
export const COLOR_PASS = "#22c55e";
/** Lighter green — good tier (used in heat-map ≥80) */
export const COLOR_PASS_LIGHT = "#4ade80";
/** Yellow — warning (≥70 heatmap) */
export const COLOR_WARN = "#facc15";
/** Orange — warn tier (60-79) */
export const COLOR_WARN_ORANGE = "#f59e0b";
/** Light red — fair (≥40 heatmap) */
export const COLOR_FAIL_LIGHT = "#f87171";
/** Red — fail / critical / falling */
export const COLOR_FAIL = "#ef4444";
/** Orange (priority high / impact high) */
export const COLOR_PRIORITY_HIGH = "#f97316";
/** Blue (priority low / low risk) */
export const COLOR_PRIORITY_LOW = "#3b82f6";
/** Cyan (file size distribution bars) */
export const COLOR_CYAN = "var(--yry-cyan)";

/** Score-tier → hex color (for SVG attrs and inline `--color` overrides) */
export function scoreHex(/** @type {number} */ score) {
  if (score >= PASS_THRESHOLD) return COLOR_PASS;
  if (score >= WARN_THRESHOLD) return COLOR_WARN_ORANGE;
  return COLOR_FAIL;
}

/** Score-tier → heatmap hex (6-tier scale used in buildHeatMap) */
export function heatHex(/** @type {number} */ score) {
  if (score >= 90) return COLOR_PASS;
  if (score >= 80) return COLOR_PASS_LIGHT;
  if (score >= 70) return COLOR_WARN;
  if (score >= 60) return COLOR_WARN_ORANGE;
  if (score >= 40) return COLOR_FAIL_LIGHT;
  return COLOR_FAIL;
}

/** Score-tier → heatmap background rgba (with alpha for cell fill) */
export function heatBgHex(/** @type {number} */ score) {
  if (score >= 90) return "rgba(34,197,94,0.25)";
  if (score >= 80) return "rgba(74,222,128,0.2)";
  if (score >= 70) return "rgba(250,204,21,0.2)";
  if (score >= 60) return "rgba(245,158,11,0.18)";
  if (score >= 40) return "rgba(248,113,113,0.18)";
  return "rgba(239,68,68,0.2)";
}

// ── Risk / priority level colors (used by risk matrix & roadmap) ──

/** @typedef {"critical"|"high"|"medium"|"low"} ImpactLevel */
/** @typedef {"high"|"medium"|"low"} ProbabilityLevel */

/** @returns {{ level: string, label: string, color: string, bg: string }} */
export function riskLevel(/** @type {ProbabilityLevel} */ prob, /** @type {ImpactLevel} */ imp) {
  if (imp === "critical" && prob === "high") {
    return { level: "P0", label: "严重", color: COLOR_FAIL, bg: "rgba(239,68,68,.12)" };
  }
  if (imp === "critical" || (imp === "high" && prob === "high")) {
    return { level: "P1", label: "高", color: COLOR_PRIORITY_HIGH, bg: "rgba(249,115,22,.12)" };
  }
  if (imp === "high" || (imp === "medium" && prob === "high")) {
    return { level: "P2", label: "中", color: COLOR_WARN_ORANGE, bg: "rgba(245,158,11,.12)" };
  }
  return { level: "P3", label: "低", color: COLOR_PRIORITY_LOW, bg: "rgba(59,130,246,.12)" };
}

/** Compact priority color for rec pills / phase headers */
export function priorityColor(/** @type {"high"|"medium"|"low"} */ priority) {
  return priority === "high" ? COLOR_FAIL : priority === "medium" ? COLOR_PRIORITY_HIGH : COLOR_PRIORITY_LOW;
}

// ── Grade (A/B/C/D) → color ──────────────────────────────────────

/** @returns {{ letter: string, label: string, color: string }} */
export function gradeInfo(/** @type {number} */ score) {
  if (score >= 90) return { letter: "A", label: "优秀", color: COLOR_PASS };
  if (score >= 75) return { letter: "B", label: "良好", color: COLOR_PASS };
  if (score >= 60) return { letter: "C", label: "一般", color: COLOR_WARN_ORANGE };
  return { letter: "D", label: "需关注", color: COLOR_FAIL };
}

/** @type {Record<string, string>} — grade → color hex */
export const GRADE_COLOR = { A: COLOR_PASS, B: COLOR_PASS, C: COLOR_WARN_ORANGE, D: COLOR_FAIL };
/** @type {Record<string, number>} — grade → fill opacity for trend bars */
export const GRADE_BAR_OPACITY = { A: 1, B: 0.6, C: 0.6, D: 0.6 };
/** @type {Record<string, string>} — grade → CSS var color */
export const GRADE_CSS_VAR = { A: "var(--yry-pass)", B: "var(--yry-pass)", C: "var(--yry-warn)", D: "var(--yry-fail)" };

// ── Threshold constants (was scattered across report-sections.mjs) ──

/** Lines-of-code thresholds for "巨型"/"大型" classification in structure analysis */
export const STRUCTURE_THRESHOLDS = {
  GIANT_LINES: 1000,   // 巨型
  LARGE_LINES: 500,    // 大型
  HOT_MODULE_LINES: 3000,
  HOT_MODULE_FILES: 30,
};

/** File-byte thresholds (used in buildFileSizeSection) */
export const FILE_SIZE_THRESHOLDS = {
  GIANT_BYTES: 500 * 1024,  // 500 KB
  LARGE_BYTES: 100 * 1024,  // 100 KB
};

/** Dependency graph thresholds (buildDependencySection) */
export const DEP_THRESHOLDS = {
  GOD_MODULE_FANOUT: 10,  // 上帝模块 ≥10 依赖
  HIGH_FANOUT: 8,
  CORE_FANIN: 8,          // 核心模块 ≥8 被引用
};

/** Influence ranking thresholds (buildInfluenceRankingSection) */
export const INFLUENCE_THRESHOLDS = {
  CRITICAL: 20,
  WARN: 12,
  HIGH_RANK: 15,
};

// ── Safe HTML interpolation ──────────────────────────────────────

/**
 * Escape user-controllable strings before interpolation into HTML templates.
 * Use for: file paths, dimension labels from data, recommendation text, etc.
 * Safe to leave out for: literal Chinese copy and trusted constants.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(/** @type {unknown} */ value) {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
