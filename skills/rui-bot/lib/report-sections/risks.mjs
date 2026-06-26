/**
 * report-sections/risks — Risk analysis, improvement roadmap, technical debt.
 *
 *   - buildRiskMatrix             cross-table of probability × impact + cards
 *   - buildImprovementRoadmap     phased action plan
 *   - buildTechnicalDebtAnalysis  ranked debt items + payoff score
 */

import { DIM_LABELS, DIM_WEIGHTS } from "../report-constants.mjs";
import { scoreColor } from "../bot-health-analysis.mjs";
import {
  COLOR_FAIL, COLOR_WARN_ORANGE, COLOR_PASS, COLOR_PRIORITY_HIGH, COLOR_PRIORITY_LOW,
  escapeHtml, riskLevel,
} from "../report-styles.mjs";
import { riskCard, phasePill } from "../report-templates.mjs";

// ── Risk matrix (P0–P3 with prob × impact cells) ─────────────────

/**
 * Build risk matrix section.
 *
 * @param {object} hr
 */
export function buildRiskMatrix(/** @type {any} */ hr) {
  const risks = hr.risks || [];
  if (risks.length === 0) return "";

  const probLabels = { high: "高", medium: "中", low: "低" };
  const impactLabels = { critical: "严重", high: "高", medium: "中", low: "低" };
  const probColors = { high: COLOR_FAIL, medium: COLOR_WARN_ORANGE, low: COLOR_PASS };
  const impColors = { critical: COLOR_FAIL, high: COLOR_PRIORITY_HIGH, medium: COLOR_WARN_ORANGE, low: COLOR_PRIORITY_LOW };

  /** @type {Record<string, any[]>} */
  const matrix = {
    P0: [], P1: [], P2: [], P3: [],
  };
  risks.forEach((/** @type {any} */ r) => {
    const info = riskLevel(r.probability, r.impact);
    matrix[info.level].push({ ...r, ...info });
  });

  const order = ["P0", "P1", "P2", "P3"];
  const cards = order
    .filter(level => matrix[level].length > 0)
    .map((level) => {
      const items = matrix[level];
      const card = items[0];
      return items.map((/** @type {any} */ r) => riskCard({
        level: r.level,
        label: r.label,
        category: r.category,
        probability: r.probability,
        impact: r.impact,
        probLabel: probLabels[r.probability] || r.probability,
        impLabel: impactLabels[r.impact] || r.impact,
        probColor: probColors[r.probability] || COLOR_PASS,
        impColor: impColors[r.impact] || COLOR_PASS,
        detail: r.detail,
        mitigation: r.mitigation,
        color: r.color,
        bg: r.bg,
      })).join("\n");
    }).join("\n");

  return `<div class="h-section">
<h2>🎯 风险矩阵 <span class="h-section-sub-inline">概率 × 影响 = 风险等级</span></h2>
<div class="h-rm-grid">
<div class="h-rm-col" style="--col-bg:rgba(239,68,68,.06)">
<div class="h-rm-col-title">P0 严重 · 立即处理</div>
<div class="h-rs-flex-col-gap8">${matrix.P0.map((/** @type {any} */ r) =>
  `<div class="h-rs-pill fail"><span>${escapeHtml(r.label)}</span><span class="h-rs-meta-sm">${escapeHtml(r.category)}</span></div>`).join("")}</div>
</div>
<div class="h-rm-col" style="--col-bg:rgba(249,115,22,.06)">
<div class="h-rm-col-title">P1 高 · 本周处理</div>
<div class="h-rs-flex-col-gap8">${matrix.P1.map((/** @type {any} */ r) =>
  `<div class="h-rs-pill warn"><span>${escapeHtml(r.label)}</span><span class="h-rs-meta-sm">${escapeHtml(r.category)}</span></div>`).join("")}</div>
</div>
<div class="h-rm-col" style="--col-bg:rgba(245,158,11,.06)">
<div class="h-rm-col-title">P2 中 · 本月处理</div>
<div class="h-rs-flex-col-gap8">${matrix.P2.map((/** @type {any} */ r) =>
  `<div class="h-rs-pill"><span>${escapeHtml(r.label)}</span><span class="h-rs-meta-sm">${escapeHtml(r.category)}</span></div>`).join("")}</div>
</div>
<div class="h-rm-col" style="--col-bg:rgba(59,130,246,.06)">
<div class="h-rm-col-title">P3 低 · 关注跟踪</div>
<div class="h-rs-flex-col-gap8">${matrix.P3.map((/** @type {any} */ r) =>
  `<div class="h-rs-pill info"><span>${escapeHtml(r.label)}</span><span class="h-rs-meta-sm">${escapeHtml(r.category)}</span></div>`).join("")}</div>
</div>
</div>
<div class="h-rs-flex-col-gap8 h-rs-mt8">${cards}</div>
<div class="h-rs-meta h-rs-mt8">风险等级 = f(概率, 影响) · P0 立即处理 · P1 本周处理 · P2 本月处理 · P3 持续关注</div>
</div>`;
}

// ── Phased improvement roadmap ───────────────────────────────────

/**
 * Build improvement roadmap section.
 *
 * @param {any} hr
 * @param {any[]} recommendations - List of recommendation objects
 * @returns {string} HTML
 */
export function buildImprovementRoadmap(/** @type {any} */ hr, /** @type {any[]} */ recommendations) {
  const recs = recommendations || hr.recommendations || [];
  if (recs.length === 0) {
    return `<div class="h-section">
<h2>🗺️ 改进路线图 <span class="h-section-sub-inline">Improvement Roadmap</span></h2>
<div class="h-placeholder">✅ 当前无改进项 — 所有维度健康</div>
</div>`;
  }
  const phases = [
    { id: "immediate", label: "立即", icon: "🚨", timeline: "1-3天", color: COLOR_FAIL, filter: (/** @type {any} */ r) => r.priority === "high" },
    { id: "short", label: "短期", icon: "📋", timeline: "1-2周", color: COLOR_WARN_ORANGE, filter: (/** @type {any} */ r) => r.priority === "medium" },
    { id: "medium", label: "中期", icon: "🔧", timeline: "1-2月", color: COLOR_PRIORITY_HIGH, filter: (/** @type {any} */ r) => r.priority === "low" && /架构|设计|重构|模块/.test(r.text) },
    { id: "long", label: "长期", icon: "🎯", timeline: "3月+", color: COLOR_PASS, filter: (/** @type {any} */ r) => r.priority === "low" && !/架构|设计|重构|模块/.test(r.text) },
  ];

  const phaseBlocks = phases.map((p) => {
    const phaseRecs = recs.filter(p.filter);
    if (phaseRecs.length === 0) return '';
    const items = phaseRecs.map((/** @type {any} */ r) =>
      `<li><b>${escapeHtml(r.source)}:</b> ${escapeHtml(r.text)}</li>`
    ).join("");
    return phasePill({
      icon: p.icon,
      label: p.label,
      color: p.color,
      timeline: p.timeline,
      count: phaseRecs.length,
    }) + `<ul class="h-rs-list-tight">${items}</ul>`;
  }).join("");

  return `<div class="h-section">
<h2>🗺️ 改进路线图 <span class="h-section-sub-inline">分阶段行动计划 · ${recs.length} 项建议</span></h2>
<div class="h-rs-flex-col-gap8">${phaseBlocks}</div>
<div class="h-rs-meta h-rs-mt8">时间安排仅供参考 · 优先级根据业务影响和实施成本综合确定</div>
</div>`;
}

// ── Technical debt analysis ──────────────────────────────────────

/**
 * Build technical debt analysis section.
 *
 * @param {object} hr
 */
export function buildTechnicalDebtAnalysis(/** @type {any} */ hr) {
  const debt = hr.technicalDebt;
  if (!debt) return "";

  const dimScores = hr.scores || {};
  /** @type {any[]} */
  const debtItems = [];
  for (const [dim, score] of Object.entries(dimScores)) {
    if (score < 80) {
      const weight = DIM_WEIGHTS[dim] || 0;
      const gap = 100 - score;
      debtItems.push({
        dim,
        label: DIM_LABELS[dim] || dim,
        score,
        gap,
        weight,
        effort: Math.round(gap * 0.5),
        payoff: Math.round(weight * gap / 5),
      });
    }
  }

  debtItems.sort((/** @type {any} */ a, /** @type {any} */ b) => b.payoff - a.payoff);

  const totalEffort = debtItems.reduce((s, i) => s + i.effort, 0);
  const totalPayoff = debtItems.reduce((s, i) => s + i.payoff, 0);

  const rows = debtItems.slice(0, 10).map((/** @type {any} */ item, /** @type {number} */ i) => {
    const barColor = scoreColor(item.score);
    const effortColor = item.effort > 30 ? COLOR_FAIL : item.effort > 15 ? COLOR_WARN_ORANGE : COLOR_PASS;
    return `<tr>
      <td class="h-struct-rank">${i + 1}</td>
      <td class="h-struct-path"><strong>${escapeHtml(item.label)}</strong></td>
      <td class="h-struct-lines h-rs-mono" style="--color:${barColor}">${item.score}</td>
      <td class="h-struct-lines">${item.weight}%</td>
      <td class="h-struct-lines">${item.gap}</td>
      <td class="h-struct-lines h-rs-mono" style="--color:${effortColor}">${item.effort}h</td>
      <td class="h-struct-lines"><strong>${item.payoff}</strong></td>
      <td class="h-struct-bar-cell"><div class="h-struct-bar"><div class="h-struct-bar-fill" style="--w:${Math.min(100, item.payoff)}%;--color:${COLOR_PASS}"></div></div></td>
    </tr>`;
  }).join("");

  return `<div class="h-section">
<h2>💳 技术债务分析 <span class="h-section-sub-inline">${debtItems.length} 项 · 总工作量 ${totalEffort}h · 总回报 ${totalPayoff}</span></h2>
<div class="h-rs-notice-warn h-rs-mt8">
<span class="h-rs-label-strong">⚠️ 技术债务评级: ${debtItems.length > 10 ? '高' : debtItems.length > 5 ? '中' : '低'}</span>
<span class="h-rs-meta">${debtItems.length} 个低于 80 分的维度累计 ${totalEffort} 小时工作量可清除</span>
</div>
<table class="h-struct-table">
<thead><tr><th>#</th><th>维度</th><th>当前分</th><th>权重</th><th>缺口</th><th>工作量</th><th>回报</th><th>回报分布</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<div class="h-rs-meta h-rs-mt8">回报 = 权重 × 缺口 / 5 · 工作量 = 缺口 × 0.5 小时 · 按回报从高到低排列 · 建议从回报最高的维度开始</div>
</div>`;
}
