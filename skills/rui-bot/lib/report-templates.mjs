/**
 * report-templates — Reusable HTML fragments for health report generation.
 *
 * These replace ~150 occurrences of duplicated template strings in
 * health-report.mjs and report-sections.mjs. Every template:
 *   - Returns a string of safe HTML (caller must escape untrusted data)
 *   - Has a single, focused responsibility
 *   - Uses centralized colors from report-styles.mjs
 *
 * Conventions:
 *   - Functions are named after the CSS class they emit (bar, chip, item, card)
 *   - `opts` carries variant-specific tweaks (label, prefix, aria)
 *   - Score/tier colors use the helpers from report-styles.mjs, never raw hex
 */

import {
  COLOR_FAIL, COLOR_WARN_ORANGE, COLOR_PRIORITY_LOW,
  scoreHex, heatHex, heatBgHex, gradeInfo, escapeHtml,
} from "./report-styles.mjs";
import { scoreStatus } from "./bot-health-analysis.mjs";

// ── Progress bar (most common template — used 30+ times) ────────

/**
 * Long-form progress bar used in score breakdown / contribution gap.
 * Renders the wrap + inner div pair with `--w` and `--color` custom props.
 *
 * @param {number} percent  - bar fill width (0-100)
 * @param {string} color    - CSS color (hex or var(--…))
 * @param {{ extra?: string }} [opts]
 * @returns {string} HTML
 */
export function bar(/** @type {number} */ percent, /** @type {string} */ color, /** @type {{ extra?: string }} */ opts = {}) {
  const w = Math.max(0, Math.min(100, percent));
  return `<div class="h-comp-bar-wrap"><div class="h-comp-bar-inner" style="--w:${w}%;--color:${color}${opts.extra ? `;${opts.extra}` : ''}"></div></div>`;
}

/**
 * Short progress bar — a single bar fill div used in many sections.
 *
 * @param {number} percent
 * @param {string} color
 * @param {{ minWidth?: number, opacity?: number, extra?: string }} [opts]
 * @returns {string} HTML
 */
export function barFill(/** @type {number} */ percent, /** @type {string} */ color, /** @type {{ minWidth?: number, opacity?: number, extra?: string }} */ opts = {}) {
  const w = Math.max(opts.minWidth ?? 2, percent);
  const opacity = opts.opacity !== undefined ? `;opacity:${opts.opacity}` : '';
  return `<div class="h-rs-bar-fill" style="--w:${w}%;--color:${color}${opacity}${opts.extra ? `;${opts.extra}` : ''}"></div>`;
}

// ── Status chips ─────────────────────────────────────────────────

/**
 * Generic status chip with tier-based color.
 * Used by structure legend, dimension cards, rec items, etc.
 *
 * @param {string} label
 * @param {"pass"|"warn"|"fail"|"accent"|"info"} tier
 * @param {{ cls?: string }} [opts] - extra CSS class (e.g. "h-struct-chip" or "h-comp-chip")
 * @returns {string} HTML
 */
export function chip(/** @type {string} */ label, /** @type {"pass"|"warn"|"fail"|"accent"|"info"} */ tier, /** @type {{ cls?: string }} */ opts = {}) {
  const cls = opts.cls || "h-comp-chip";
  return `<span class="${cls} ${tier}">${escapeHtml(label)}</span>`;
}

/**
 * Colored tag with text, used in inline recs/tags.
 *
 * @param {string} label
 * @param {string} color
 * @param {{ extra?: string }} [opts]
 */
export function tag(/** @type {string} */ label, /** @type {string} */ color, /** @type {{ extra?: string }} */ opts = {}) {
  const extra = opts.extra ? `;${opts.extra}` : '';
  return `<span class="h-tag" style="--tag-color:${color}${extra}">${escapeHtml(label)}</span>`;
}

// ── List items (rec / detail / orphan) ───────────────────────────

/**
 * Recommendation item — used in buildRecommendationsSection,
 * buildImprovementRoadmap, buildRiskMatrix.
 *
 * @param {{ source: string, text: string, priority?: "high"|"medium"|"low", icon?: string }} p
 * @returns {string} HTML
 */
export function recItem(/** @type {{ source: string, text: string, priority?: "high"|"medium"|"low", icon?: string }} */ p) {
  const priorityColor = p.priority === "high" ? COLOR_FAIL : p.priority === "medium" ? COLOR_WARN_ORANGE : COLOR_PRIORITY_LOW;
  const icon = p.icon || (p.priority === "high" ? "🔴" : p.priority === "medium" ? "🟡" : "🔵");
  return `<div class="h-rec-item">
  <span class="h-rec-prio" style="--color:${priorityColor}">${icon}</span>
  <div class="h-rec-body">
    <div class="h-rec-source">${escapeHtml(p.source)}</div>
    <div class="h-rec-text">${escapeHtml(p.text)}</div>
  </div>
</div>`;
}

/**
 * Detail list item with status icon.
 *
 * @param {string} icon - emoji
 * @param {string} text
 * @param {{ mono?: boolean }} [opts] - apply mono font + small text class
 * @returns {string} HTML
 */
export function detailItem(/** @type {string} */ icon, /** @type {string} */ text, /** @type {{ mono?: boolean }} */ opts = {}) {
  const textCls = opts.mono ? "h-detail-text h-rs-mono h-rs-detail-text" : "h-detail-text";
  return `<div class="h-detail-item">
  <span class="h-detail-icon">${icon}</span>
  <span class="${textCls}">${escapeHtml(text)}</span>
</div>`;
}

// ── Dimension card (used in score panel + tab panels) ────────────

/**
 * Single dimension card. Used by the "scores" tab grid (buildDimCard
 * inside generateHealthReport) and conceptually similar to the
 * detail-panel cards. Centralizing prevents the duplicate ternaries
 * that previously existed in two places.
 *
 * @param {{
 *   label: string,
 *   icon: string,
 *   score: number,
 *   weight?: number,
 *   prevScore?: number,
 *   trendHtml?: string,
 *   dimHistory?: any,
 *   deltaWarnThreshold?: number,
 * }} p
 * @returns {string} HTML
 */
export function dimCard(/** @type {any} */ p) {
  const { label, icon, score, weight = 0, prevScore, trendHtml = "" } = p;
  const statusTier = scoreStatus(score);
  const color = scoreHex(score);
  const contribution = Math.round(score * weight / 100);
  const delta = prevScore !== undefined ? score - prevScore : null;
  const deltaIcon = delta !== null ? (delta > 0 ? "↑" : delta < 0 ? "↓" : "→") : "";
  const deltaCls = delta !== null ? (delta > 0 ? "up" : delta < 0 ? "down" : "flat") : "";
  const statusLabel = score >= 80 ? "优秀" : score >= 60 ? "一般" : "告警";
  const showWarnChip = delta !== null && delta < -(p.deltaWarnThreshold ?? 5);

  return `<div class="h-dim-card ${statusTier}" style="--dc-color:${color}">
  <div class="h-dim-top">
    <span class="h-dim-icon">${icon}</span>
    <span class="h-dim-label">${escapeHtml(label)}</span>
    ${showWarnChip ? '<span class="h-dim-warn-chip">⚡ 恶化</span>' : ''}
    ${trendHtml}
    <span class="h-dim-score ${statusTier}">${score}<span class="h-dim-score-sm">分</span></span>
    ${delta !== null ? `<span class="h-dim-delta-badge ${deltaCls}">${deltaIcon}${Math.abs(delta)}</span>` : ''}
  </div>
  <div class="h-dim-bar-row">
    <div class="h-dim-bar"><div class="h-dim-bar-fill ${statusTier}" style="--w:${score}%"></div></div>
  </div>
  <div class="h-dim-foot">
    <span class="h-dim-chip ${statusTier}">${statusLabel}</span>
    <span class="h-dim-note">权重 ${weight}%</span>
    <span class="h-dim-note">贡献 ${contribution} 分</span>
    ${prevScore !== undefined ? `<span class="h-dim-note">上次 ${prevScore} 分</span>` : ''}
  </div>
</div>`;
}

// ── KPI card (used in buildKeyMetricsDashboard) ──────────────────

/**
 * @param {{ label: string, value: number, icon: string, color?: string, subtitle?: string }} p
 */
export function kpiCard(/** @type {any} */ p) {
  const { label, value, icon, color, subtitle = "" } = p;
  if (value === null || value === undefined) return "";
  const c = color || scoreHex(value);
  const { letter: grade } = gradeInfo(value);
  return `<div class="h-rs-kpi-card">
  <div class="h-rs-kpi-icon">${icon}</div>
  <div class="h-rs-kpi-val" style="--kpi-color:${c}">${value}</div>
  <div class="h-rs-kpi-lbl">${escapeHtml(label)}</div>
  <div class="h-rs-kpi-sub">${grade} 级${subtitle ? ` · ${escapeHtml(subtitle)}` : ''}</div>
</div>`;
}

// ── Risk card (used in buildRiskMatrix) ──────────────────────────

/**
 * @param {{ level: string, label: string, category: string, probability: string, impact: string, probLabel: string, impLabel: string, probColor: string, impColor: string, detail: string, mitigation: string }} p
 */
export function riskCard(/** @type {any} */ p) {
  return `<div class="h-rs-card-rel" style="--card-color:${p.color}">
  <div class="h-rs-flex-between-6">
    <div class="h-rs-flex-row-sm">
      <span class="h-rs-badge" style="--badge-bg:${p.bg};--badge-color:${p.color}">${escapeHtml(p.level)} ${escapeHtml(p.label)}</span>
      <span class="h-rs-label-strong">${escapeHtml(p.label)}</span>
      <span class="h-rs-tag-sm">${escapeHtml(p.category)}</span>
    </div>
    <div class="h-rs-flex-gap8-sm">
      <span class="h-rs-text3">概率: <b class="h-rs-badge" style="--badge-color:${p.probColor}">${escapeHtml(p.probLabel)}</b></span>
      <span class="h-rs-text3">影响: <b class="h-rs-badge" style="--badge-color:${p.impColor}">${escapeHtml(p.impLabel)}</b></span>
    </div>
  </div>
  <div class="h-rs-detail-line">${escapeHtml(p.detail)}</div>
  <div class="h-rs-notice-mit">💡 缓解措施: ${escapeHtml(p.mitigation)}</div>
</div>`;
}

// ── Histogram column (used in buildScoreDistributionSection) ──────

/**
 * @param {{ count: number, range: string, color: string, maxCount: number }} p
 */
export function histColumn(/** @type {any} */ p) {
  const h = Math.max(2, Math.round((p.count / p.maxCount) * 60));
  return `<div class="h-rs-hist-col">
  <span class="h-rs-hist-count">${p.count}</span>
  <div class="h-rs-hist-bar" style="--h:${h}px;--color:${p.color}" title="${escapeHtml(p.range)}: ${p.count} dimensions"></div>
  <span class="h-rs-hist-range">${escapeHtml(p.range)}</span>
</div>`;
}

// ── Improvement roadmap phase pill ───────────────────────────────

/**
 * @param {{ icon: string, label: string, color: string, timeline: string, count: number }} p
 */
export function phasePill(/** @type {any} */ p) {
  // Convert hex like "#ef4444" into "rgba(239,68,68,.12)" for pill background
  const r = parseInt(p.color.slice(1, 3), 16);
  const g = parseInt(p.color.slice(3, 5), 16);
  const b = parseInt(p.color.slice(5, 7), 16);
  const pillBg = `rgba(${r},${g},${b},.12)`;
  return `<div class="h-rs-flex-row">
  <span class="h-rs-pill" style="--pill-bg:${pillBg};--pill-color:${p.color}">${p.icon} ${escapeHtml(p.label)}</span>
  <span class="h-rs-meta-sm">⏱️ ${escapeHtml(p.timeline)} · ${p.count} 项</span>
</div>`;
}

// ── Score traceability expandable entry ──────────────────────────

/**
 * @param {{ label: string, score: number, formula: string, source: string, checks: string[] }} p
 */
export function traceDetails(/** @type {any} */ p) {
  const color = scoreHex(p.score);
  const checksText = (p.checks || []).join(" · ");
  return `<details class="h-rs-trace-details">
  <summary class="h-rs-trace-summary">
    <span class="h-rs-trace-label">${escapeHtml(p.label)}</span>
    <span class="h-rs-trace-score" style="--trace-color:${color}">${p.score}</span>
    <span class="h-rs-trace-bar-track">
      <span class="h-rs-trace-bar-fill" style="--w:${Math.max(4, p.score)}%;--trace-color:${color}"></span>
    </span>
  </summary>
  <div class="h-rs-trace-body h-rs-mt8">
    <div class="h-rs-trace-line"><span class="h-rs-text3">📐 公式: </span><span class="h-rs-text2">${escapeHtml(p.formula)}</span></div>
    <div class="h-rs-trace-line"><span class="h-rs-text3">📂 数据源: </span><span class="h-rs-text2">${escapeHtml(p.source)}</span></div>
    <div><span class="h-rs-text3">✅ 检查项: </span><span class="h-rs-text2">${escapeHtml(checksText)}</span></div>
  </div>
</details>`;
}

// ── Heat-map cell (used in buildHeatMap) ─────────────────────────

/**
 * @param {{ label: string, score: number }} p
 */
export function heatmapCell(/** @type {any} */ p) {
  const bg = heatBgHex(p.score);
  const color = heatHex(p.score);
  return `<div class="h-rs-heat-cell" style="--heat-bg:${bg}" title="${escapeHtml(p.label)}: ${p.score} 分">
  <div class="h-rs-heat-label">${escapeHtml(p.label)}</div>
  <div class="h-rs-heat-val" style="--heat-color:${color}">${p.score}</div>
</div>`;
}

// ── Section header (used by every build* function) ───────────────

/**
 * Standard `<h2>` section header with optional subtitle.
 *
 * @param {string} title
 * @param {string} [subtitle]
 * @returns {string} HTML
 */
export function sectionHeader(/** @type {string} */ title, /** @type {string} */ subtitle = "") {
  return `<h2>${escapeHtml(title)}${subtitle ? ` <span class="h-section-sub-inline">${escapeHtml(subtitle)}</span>` : ''}</h2>`;
}

// ── Placeholder / empty state ───────────────────────────────────

/**
 * @param {string} text
 */
export function placeholder(/** @type {string} */ text) {
  return `<div class="h-placeholder">${escapeHtml(text)}</div>`;
}
