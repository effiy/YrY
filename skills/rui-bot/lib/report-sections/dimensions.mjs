/**
 * report-sections/dimensions — Per-dimension analysis sections.
 *
 * Sections that drill into individual dimensions:
 *   - buildDimensionDetailPanel     fix-guidance per dim
 *   - buildContributionGapSection   drag-down contribution
 *   - buildScoreDistributionSection stats summary + histogram
 *   - buildScoreDiffSection         change attribution vs prev period
 *   - buildScoreTraceabilityPanel   score formula / source / checks
 *   - buildInfluenceRankingSection  weight × variance × gap ranking
 */

import { DIM_LABELS, DIM_WEIGHTS } from "../report-constants.mjs";
import { scoreColor } from "../bot-health-analysis.mjs";
import { contributionAnalysis, scoreDistribution, classifyScore } from "../../../../lib/scoring.mjs";
import {
  COLOR_FAIL, COLOR_PASS, COLOR_WARN_ORANGE,
  scoreHex, escapeHtml, INFLUENCE_THRESHOLDS,
} from "../report-styles.mjs";
import { traceDetails, histColumn } from "../report-templates.mjs";
import { DIM_FIX_GUIDANCE, SCORE_METHODOLOGY } from "./dimensions-data.mjs";

// ── Fix guidance detail panel ────────────────────────────────────

/**
 * Build dimension detail panel for the HTML report.
 * Shows each dimension with its score, status, fix guidance, and trend.
 *
 * @param {object} hr - Health result
 * @param {object} dimHistory - From getDimensionHistory()
 * @returns {string} HTML
 */
export function buildDimensionDetailPanel(/** @type {any} */ hr, /** @type {Record<string, any[]>} */ dimHistory) {
  const scores = hr.scores || {};

  const entries = Object.entries(scores).map(([dim, score]) => {
    const label = DIM_LABELS[dim] || dim;
    const guidance = DIM_FIX_GUIDANCE[dim] || null;
    const status = score >= 80 ? "pass" : score >= 60 ? "warn" : "fail";
    const statusIcon = score >= 80 ? "✅" : score >= 60 ? "⚠️" : "❌";
    const statusColor = scoreHex(score);
    const statusBg = score >= 80 ? "rgba(34,197,94,.12)" : score >= 60 ? "rgba(245,158,11,.12)" : "rgba(239,68,68,.12)";

    let trendHtml = "";
    if (dimHistory) {
      /** @type {any[]} */
      const dh = dimHistory[label] || [];
      if (dh.length >= 2) {
        const prev = dh[dh.length - 2];
        if (prev && prev.score !== undefined) {
          const diff = score - prev.score;
          if (diff > 5) trendHtml = `<span class="h-rs-trend-icon up" title="上升 ${diff} 分">↑${diff}</span>`;
          else if (diff < -5) trendHtml = `<span class="h-rs-trend-icon down" title="下降 ${Math.abs(diff)} 分">↓${Math.abs(diff)}</span>`;
          else trendHtml = '<span class="h-rs-trend-icon">→</span>';
        }
      }
    }

    return {
      dim, label, score, status,
      icon: statusIcon, color: statusColor, bg: statusBg,
      trendHtml, guidance,
    };
  });

  entries.sort((/** @type {any} */ a, /** @type {any} */ b) => a.score - b.score);

  const rows = entries.map((e) => {
    let guidanceHtml = "";
    if (e.guidance && e.score < 90) {
      guidanceHtml = `<div class="h-rs-entry-guidance" style="--entry-bg:${e.bg}">
<div><span class="h-rs-text3">🔍 检查: </span><span class="h-rs-text2">${escapeHtml(e.guidance.check)}</span></div>
<div><span class="h-rs-text3">🔧 修复: </span><span class="h-rs-text2">${escapeHtml(e.guidance.fix)}</span></div>
<div><span class="h-rs-text3">⚡ 影响: </span><span class="h-b-warn">${escapeHtml(e.guidance.impact)}</span></div>
</div>`;
    } else if (e.score >= 90) {
      guidanceHtml = '<div class="h-rs-entry-ok">✅ 该维度健康，无需处理</div>';
    }

    const barW = Math.max(4, e.score);
    return `<div class="h-rs-card-rel" style="--card-color:${e.color}">
<div class="h-rs-entry-head">
<span class="h-rs-entry-label">${e.icon} ${escapeHtml(e.label)}</span>
<span class="h-rs-entry-meta">${e.trendHtml || ''}<span class="h-rs-entry-score" style="--entry-color:${e.color}">${e.score} 分</span></span>
</div>
<div class="h-rs-bar-track-4">
<div class="h-rs-bar-fill" style="--w:${barW}%;--color:${e.color}"></div>
</div>
${guidanceHtml}
</div>`;
  }).join("");

  return `<div class="h-section">
<h2>🔍 维度诊断与修复指引 <span class="h-section-sub-inline">${entries.length} 项 · 按评分升序</span></h2>
<div class="h-rs-flex-col-gap8">${rows}</div>
</div>`;
}

// ── Contribution gap (which dims drag the score down most) ───────

/**
 * Build contribution gap analysis section.
 * Identifies which dimensions drag down the composite score the most,
 * and quantifies the potential improvement if fixed.
 */
export function buildContributionGapSection(/** @type {any} */ hr) {
  const analysis = contributionAnalysis(hr.scores || {}, DIM_WEIGHTS);
  if (!analysis || analysis.topDrag.length === 0) return "";

  const totalGap = analysis.dragTotal;
  const potentialScore = Math.min(100, hr.composite + Math.round(totalGap));

  const rows = analysis.topDrag.map((/** @type {any} */ e, /** @type {number} */ i) => {
    const barColor = scoreColor(e.score);
    const gapPct = Math.min(100, Math.round((e.gap / (analysis.topDrag[0]?.gap || 1)) * 100));
    return `<div class="h-comp-row">
<span class="h-comp-rank">${i + 1}</span>
<span class="h-comp-label">${escapeHtml(DIM_LABELS[e.dim] || e.dim)}</span>
<span class="h-comp-score" style="--color:${barColor}">${e.score} 分</span>
<span class="h-rs-gap-score">−${Math.round(e.gap * 10) / 10} 分</span>
<div class="h-comp-bar-wrap"><div class="h-comp-bar-inner" style="--w:${gapPct}%;--color:${COLOR_FAIL};opacity:.6"></div></div>
</div>`;
  }).join("");

  return `<div class="h-section">
<h2>🎯 加分潜力分析 <span class="h-section-sub-inline">拖分维度 Top ${analysis.topDrag.length}</span></h2>
<div class="h-rs-notice warn">
<span class="h-rs-label-strong">📊 当前综合评分: ${hr.composite} 分</span>
<span class="h-rs-potential-pass">修复所有拖分项可达: <b>${potentialScore} 分</b></span>
<span class="h-rs-potential-meta">(${analysis.topDrag.length} 个维度共拖低 ${Math.round(totalGap * 10) / 10} 分)</span>
</div>
<div class="h-comp-list">${rows}</div>
<div class="h-rs-meta h-rs-mt8">💡 拖分值 = (100 − 维度得分) × 维度权重 / 总权重 · 按拖分从高到低排列</div>
</div>`;
}

// ── Score distribution histogram + tier counts ───────────────────

/**
 * Build dimension health distribution section with histogram and stats.
 */
export function buildScoreDistributionSection(/** @type {any} */ hr) {
  const scores = Object.values(hr.scores || {}).filter((/** @type {any} */ s) => typeof s === "number");
  if (scores.length === 0) return "";

  const dist = scoreDistribution(scores);
  const tiers = { excellent: 0, good: 0, fair: 0, poor: 0 };
  scores.forEach((s) => { tiers[classifyScore(s)]++; });

  const buckets = [
    { range: "0–20", lo: 0, hi: 20 },
    { range: "20–40", lo: 20, hi: 40 },
    { range: "40–60", lo: 40, hi: 60 },
    { range: "60–80", lo: 60, hi: 80 },
    { range: "80–100", lo: 80, hi: 101 },
  ];
  const histogram = buckets.map((b) => ({
    range: b.range,
    count: scores.filter((/** @type {any} */ s) => s >= b.lo && s < b.hi).length,
  }));

  const maxCount = Math.max(1, ...histogram.map((h) => h.count));
  const bars = histogram.map((h) => {
    const color = h.range.startsWith("80") ? COLOR_PASS : h.range.startsWith("60") ? COLOR_WARN_ORANGE : COLOR_FAIL;
    return histColumn({ count: h.count, range: h.range, color, maxCount });
  }).join("");

  return `<div class="h-section">
<h2>📊 评分分布分析</h2>
<div class="h-rs-grid-2-tight">
<div class="h-rs-card">
<div class="h-rs-card-title">统计摘要</div>
<div class="h-rs-dist-grid">
<div>均值: <b>${dist.mean}</b></div>
<div>中位数: <b>${dist.median}</b></div>
<div>标准差: <b>${dist.stddev}</b></div>
<div>范围: <b>${dist.min}–${dist.max}</b></div>
<div>P25: <b>${dist.p25}</b></div>
<div>P75: <b>${dist.p75}</b></div>
</div></div>
<div class="h-rs-card">
<div class="h-rs-card-title">等级分布</div>
<div class="h-rs-grade-dist-row">
<div class="h-rs-grade-cell"><div class="h-rs-grade-val pass">${tiers.excellent}</div><div class="h-rs-grade-sub">优秀≥90</div></div>
<div class="h-rs-grade-cell"><div class="h-rs-grade-val pass">${tiers.good}</div><div class="h-rs-grade-sub">良好≥75</div></div>
<div class="h-rs-grade-cell"><div class="h-rs-grade-val warn">${tiers.fair}</div><div class="h-rs-grade-sub">一般≥60</div></div>
<div class="h-rs-grade-cell"><div class="h-rs-grade-val fail">${tiers.poor}</div><div class="h-rs-grade-sub">需关注&lt;60</div></div>
</div></div>
</div>
<div class="h-rs-card">
<div class="h-rs-card-title">分值分布直方图</div>
<div class="h-rs-flex-end">${bars}</div>
</div>
</div>`;
}

// ── Score change attribution vs prev period ──────────────────────

/**
 * Build score change attribution section comparing current vs previous.
 *
 * @param {object} hr - Current health result
 * @param {object|null} prev - Previous health entry from trend
 * @returns {string} HTML
 */
export function buildScoreDiffSection(/** @type {any} */ hr, /** @type {any} */ prev) {
  if (!prev || !prev.scores) return "";

  const currentScores = hr.scores || {};
  const prevScores = prev.scores || {};
  const currentComposite = hr.composite || 0;
  const prevComposite = prev.composite || 0;
  const diff = currentComposite - prevComposite;

  const diffIcon = diff > 2 ? '📈' : diff < -2 ? '📉' : '➡️';
  const diffColor = diff > 2 ? COLOR_PASS : diff < -2 ? COLOR_FAIL : 'var(--yry-text-secondary)';
  const diffSign = diff > 0 ? '+' : '';

  const allDims = new Set([...Object.keys(currentScores), ...Object.keys(prevScores)]);
  const changes = [...allDims].flatMap((dim) => {
    const curr = currentScores[dim];
    const prevVal = prevScores[dim];
    return (curr !== undefined && prevVal !== undefined && curr !== prevVal)
      ? [{ dim, label: DIM_LABELS[dim] || dim, prev: prevVal, curr, diff: curr - prevVal }]
      : [];
  });
  changes.sort((/** @type {any} */ a, /** @type {any} */ b) => Math.abs(b.diff) - Math.abs(a.diff));

  const improved = changes.filter((c) => c.diff > 0);
  const declined = changes.filter((c) => c.diff < 0);

  const changeRows = changes.slice(0, 8).map((/** @type {any} */ c) => {
    const arrow = c.diff > 0 ? '↑' : '↓';
    const color = c.diff > 0 ? COLOR_PASS : COLOR_FAIL;
    return `<div class="h-rs-change-row">
<span class="h-rs-change-label">${escapeHtml(c.label)}</span>
<span class="h-rs-text3">${c.prev}</span>
<span class="h-rs-change-val" style="--change-color:${color}">${arrow}${Math.abs(c.diff)}</span>
<span class="h-rs-change-cur" style="--change-color:${color}">${c.curr}</span>
<div class="h-rs-bar-track">
<div class="h-rs-bar-fill" style="--w:${Math.max(4, Math.abs(c.diff))}%;--color:${color}"></div>
</div>
</div>`;
  }).join("");

  return `<div class="h-section">
<h2>${diffIcon} 评分变化归因</h2>
<div class="h-rs-delta-banner">
<div class="h-rs-center">
<div class="h-rs-delta-big" style="--delta-color:${diffColor}">${diffSign}${diff}</div>
<div class="h-rs-meta">综合变化</div>
</div>
<div class="h-rs-center">
<div class="h-rs-delta-mid pass">${improved.length}</div>
<div class="h-rs-meta">改善维度</div>
</div>
<div class="h-rs-center">
<div class="h-rs-delta-mid fail">${declined.length}</div>
<div class="h-rs-meta">退化维度</div>
</div>
<div class="h-rs-center">
<div class="h-rs-delta-trans">${prevComposite} → ${currentComposite}</div>
<div class="h-rs-meta">上次 → 本次</div>
</div>
${changeRows ? `<div class="h-rs-pad-8">${changeRows}</div>` : ''}
${changes.length > 8 ? `<div class="h-rs-note-center">还有 ${changes.length - 8} 项变化未列出</div>` : ''}
</div>`;
}

// ── Score traceability / methodology ─────────────────────────────

/**
 * Build score traceability panel HTML.
 *
 * @param {object} scores - { dimKey: score }
 * @returns {string} HTML
 */
export function buildScoreTraceabilityPanel(/** @type {Record<string, number>} */ scores) {
  const entries = Object.entries(scores || {})
    .filter(([dim]) => SCORE_METHODOLOGY[dim] !== undefined)
    .sort((/** @type {any} */ a, /** @type {any} */ b) => a[1] - b[1]);

  if (entries.length === 0) return '';

  const rows = entries.map((e) => {
    const [dim, score] = e;
    const method = SCORE_METHODOLOGY[dim];
    return traceDetails({
      label: DIM_LABELS[dim] || dim,
      score,
      formula: method.formula,
      source: method.source,
      checks: method.checks || [],
    });
  }).join("");

  return `<div class="h-section">
<h2>🔬 评分溯源 <span class="h-section-sub-inline">Score Traceability · ${entries.length} 维度</span></h2>
<div class="h-rs-note-sm h-rs-mb8">点击展开查看每个维度的评分公式、数据源和检查项详情</div>
${rows}
<div class="h-rs-note-top">评分溯源按得分升序排列 · 所有评分均可通过数据源复现验证</div>
</div>`;
}

// ── Dimension influence ranking ──────────────────────────────────

/**
 * Build dimension influence ranking HTML section.
 *
 * @param {any[]} influence - From rankDimensionInfluence()
 * @returns {string} HTML
 */
export function buildInfluenceRankingSection(/** @type {any} */ influence) {
  if (!influence || influence.length < 3) return "";

  /** @type {Record<string, string>} */
  const CAT_ICONS = { core: '⚙️', structural: '📏', engineering: '🔧', quality: '🧩' };
  /** @type {Record<string, string>} */
  const CAT_LABELS = { core: '核心运营', structural: '结构健康', engineering: '工程成熟度', quality: '组件质量' };
  const topInfl = influence[0]?.influence || 1;

  const rows = influence.slice(0, 10).map((/** @type {any} */ e, /** @type {number} */ i) => {
    const barW = Math.min(100, Math.round((e.influence / topInfl) * 100));
    const catIcon = CAT_ICONS[e.category] || '📌';
    const influenceColor = e.influence >= INFLUENCE_THRESHOLDS.CRITICAL ? COLOR_FAIL
      : e.influence >= INFLUENCE_THRESHOLDS.WARN ? COLOR_WARN_ORANGE : COLOR_PASS;
    return `<div class="h-rs-infl-row">
<span class="h-rs-infl-rank">${i + 1}</span>
<span class="h-rs-infl-icon">${catIcon}</span>
<span class="h-rs-infl-label">${escapeHtml(e.label)}</span>
<span class="h-rs-infl-val" style="--infl-color:${influenceColor}">${e.influence.toFixed(1)}</span>
<div class="h-rs-infl-bar-track">
<div class="h-rs-bar-fill" style="--w:${barW}%;--color:${influenceColor}"></div>
</div>
<span class="h-rs-infl-weight">权重${e.weight}%</span>
<span class="h-rs-infl-score">${e.currentScore}分</span>
</div>`;
  }).join("");

  const topCategory = influence[0]?.category || '';
  const catLabel = CAT_LABELS[topCategory] || topCategory;
  const highInflCount = influence.filter((/** @type {any} */ e) => e.influence >= INFLUENCE_THRESHOLDS.HIGH_RANK).length;

  return `<div class="h-section">
<h2>📐 维度影响力排名 <span class="h-section-sub-inline">Top ${Math.min(10, influence.length)} · 综合权重+方差+缺口</span></h2>
<div class="h-rs-infl-banner">
💡 影响力 = 权重(40%) + 历史方差(30%) + 当前缺口(30%) · 排名靠前的维度对综合评分影响最大，改进优先级最高
</div>
<div class="h-rs-pad-4">${rows}</div>
<div class="h-rs-infl-foot h-rs-mt8">
影响力最高类别: ${escapeHtml(catLabel)} · ${highInflCount} 个高影响力维度 (≥15)
</div>
</div>`;
}
