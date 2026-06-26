/**
 * report-sections/overview — High-level overview & narrative sections.
 *
 *   - buildExecutiveBriefing       narrative summary ("the story behind the numbers")
 *   - buildSummaryCard             compact score summary grid
 *   - buildScoreBreakdown          weighted contribution of each dimension
 *   - buildRecommendationsSection  list of priority actions
 *   - buildKeyMetricsDashboard     executive-level KPI cards
 *   - buildExecutiveSummaryHTML    exec-data → HTML block
 *   - buildCrossReportSection      Unified Project Health Index (UPHI)
 *   - buildScoreReportSummaryHTML  compact structured report summary
 */

import { DIM_LABELS, DIM_WEIGHTS } from "../report-constants.mjs";
import { scoreColor, avgScore } from "../bot-health-analysis.mjs";
import {
  COLOR_PASS, COLOR_FAIL, COLOR_WARN_ORANGE,
  escapeHtml, gradeInfo,
} from "../report-styles.mjs";
import { recItem, kpiCard } from "../report-templates.mjs";

// ── Executive briefing (the narrative summary) ───────────────────

/**
 * Build a comprehensive Executive Briefing narrative that synthesizes
 * all health dimensions into a professional, readable summary.
 *
 * @param {any} hr - Health result
 * @param {any} prev - Previous health entry
 * @param {any[]} recommendations - Improvement recommendations
 * @returns {string} HTML
 */
export function buildExecutiveBriefing(/** @type {any} */ hr, /** @type {any} */ prev, /** @type {any[]} */ recommendations) {
  const scores = hr.scores || {};
  const grade = hr.grade || "C";
  const composite = hr.composite || 0;

  /** @type {any[]} */
  const critical = [];
  /** @type {any[]} */
  const warning = [];
  /** @type {any[]} */
  const healthy = [];
  for (const [dim, score] of Object.entries(scores)) {
    const label = DIM_LABELS[dim] || dim;
    if (score < 60) critical.push({ dim, label, score });
    else if (score < 80) warning.push({ dim, label, score });
    else healthy.push({ dim, label, score });
  }

  /** @type {Record<string, string>} */
  const gradeNarrative = {
    A: "项目处于卓越健康状态，所有核心维度均达标，架构合规，工程实践成熟。建议保持当前节奏，关注趋势变化以防退化。",
    B: "项目整体健康良好，多数维度达标，但存在个别需关注领域。建议优先处理告警维度，防止降级为严重问题。",
    C: "项目存在明显健康风险，多个维度未达标。需立即制定改进计划，优先修复关键维度，避免进一步恶化。",
    D: "项目健康严重告警，核心维度大面积不达标。需启动紧急响应机制，逐项排查根因并立即修复。",
  };

  const narrative = gradeNarrative[grade] || gradeNarrative.C;

  let trendNarrative = "";
  if (prev && prev.score) {
    const diff = composite - prev.score;
    if (diff > 5) trendNarrative = `较上次检查提升 ${diff} 分，改进趋势明显。`;
    else if (diff < -5) trendNarrative = `较上次检查下降 ${Math.abs(diff)} 分，需关注退化趋势。`;
    else trendNarrative = "较上次检查基本持平，状态稳定。";
  }

  let criticalNarrative;
  if (critical.length > 0) {
    criticalNarrative = `当前 <b class='h-b-fail'>${critical.length} 个维度处于严重告警状态</b>：${critical.map(c => `${escapeHtml(c.label)}(${c.score}分)`).join("、")}。这些维度直接影响项目核心功能，建议立即处理。`;
  } else {
    criticalNarrative = "当前<b class='h-b-pass'>无严重告警维度</b>，所有核心指标均在安全线以上。";
  }

  let warningNarrative = "";
  if (warning.length > 0) {
    warningNarrative = `${warning.length} 个维度处于需关注状态：${warning.slice(0, 5).map(w => `${escapeHtml(w.label)}(${w.score}分)`).join("、")}${warning.length > 5 ? " 等" : ""}。建议在下一维护窗口内处理。`;
  }

  const sorted = Object.entries(scores).sort((/** @type {any} */ a, /** @type {any} */ b) => b[1] - a[1]);
  const top3 = sorted.slice(0, 3);
  const strengthsNarrative = `表现最佳维度：${top3.map(s => `<b class='h-b-pass'>${escapeHtml(DIM_LABELS[s[0]] || s[0])} ${s[1]}分</b>`).join("、")}。`;

  let recNarrative = "";
  if (recommendations.length > 0) {
    const highRecs = recommendations.filter(r => r.priority === "high");
    if (highRecs.length > 0) {
      recNarrative = `已生成 <b>${recommendations.length} 项改进建议</b>，其中 <b class='h-b-fail'>${highRecs.length} 项为高优先级</b>，建议优先执行。`;
    } else {
      recNarrative = `已生成 <b>${recommendations.length} 项改进建议</b>，可按计划逐步执行。`;
    }
  }

  let diagNarrative;
  const diagCount = (hr.diagnostics && hr.diagnostics.triggered && hr.diagnostics.triggered.length) || 0;
  if (diagCount > 0) {
    diagNarrative = `诊断引擎触发 <b class='h-b-warn'>${diagCount} 项诊断</b>，建议查看诊断详情面板了解具体问题和修复建议。`;
  } else {
    diagNarrative = "诊断引擎<b class='h-b-pass'>未触发任何诊断</b>，系统运行正常。";
  }

  return `<div class="h-section feat-accent">
<h2>📋 执行简报 <span class="h-section-sub-inline">Executive Briefing</span></h2>
<div class="h-eb-narrative">
<p class="h-eb-para"><b class="h-b-accent">综合评估：</b>${narrative} ${trendNarrative}</p>
<p class="h-eb-para"><b class="h-b-accent">关键发现：</b>${criticalNarrative}</p>
${warningNarrative ? `<p class="h-eb-para"><b class="h-b-accent">需关注：</b>${warningNarrative}</p>` : ''}
<p class="h-eb-para"><b class="h-b-accent">优势领域：</b>${strengthsNarrative}</p>
<p class="h-eb-para"><b class="h-b-accent">改进建议：</b>${recNarrative}</p>
<p class="h-eb-para last"><b class="h-b-accent">诊断状态：</b>${diagNarrative}</p>
</div>
<div class="h-eb-chips">
<span class="h-chip pass">✅ ${healthy.length} 项健康</span>
${warning.length > 0 ? `<span class="h-chip warn">⚠️ ${warning.length} 项需关注</span>` : ''}
${critical.length > 0 ? `<span class="h-chip fail">🚫 ${critical.length} 项严重</span>` : ''}
<span class="h-chip info">🔬 ${diagCount} 项诊断触发</span>
<span class="h-chip accent">💡 ${recommendations.length} 项建议</span>
</div>
</div>`;
}

// ── Compact summary card ─────────────────────────────────────────

/**
 * Build a compact summary card for the top of the overview panel.
 *
 * @param {any} hr
 * @param {any} prev
 * @param {any[]} recommendations
 */
export function buildSummaryCard(/** @type {any} */ hr, /** @type {any} */ prev, /** @type {any[]} */ recommendations) {
  const overallIcon = hr.grade === "A" || hr.grade === "B" ? "✅" : hr.grade === "C" ? "⚠️" : "🚫";
  const overallLabel = hr.grade === "A" ? "优秀" : hr.grade === "B" ? "良好" : hr.grade === "C" ? "需关注" : "告警";

  const sortedDims = Object.entries(hr.scores || {})
    .sort(([, a], [, b]) => a - b);
  const weakest = sortedDims[0];
  const weakLabel = weakest ? `${DIM_LABELS[weakest[0]] || weakest[0]} ${weakest[1]}分` : "—";
  const strongest = sortedDims[sortedDims.length - 1];
  const strongLabel = strongest ? `${DIM_LABELS[strongest[0]] || strongest[0]} ${strongest[1]}分` : "—";

  let trendText = "";
  if (prev) {
    const diff = hr.composite - prev.score;
    trendText = diff > 3 ? `↑${diff}` : diff < -3 ? `↓${Math.abs(diff)}` : "→0";
  }

  let dimPass = 0, dimWarn = 0, dimFail = 0;
  for (const s of Object.values(hr.scores || {})) {
    if (s >= 80) dimPass++;
    else if (s >= 60) dimWarn++;
    else dimFail++;
  }

  const topRec = recommendations.length > 0 ? recommendations[0].text : "";

  return `<div class="h-summary-card">
    <div class="h-summary-row">
      <div class="h-summary-item">
        <div class="h-summary-val">${overallIcon} ${overallLabel}</div>
        <div class="h-summary-lbl">综合评估</div>
      </div>
      <div class="h-summary-item">
        <div class="h-summary-val">${hr.diagnostics?.triggered?.length ?? 0}/8</div>
        <div class="h-summary-lbl">诊断触发${hr.diagnostics?.bootstrapped ? ' (引导)' : ''}</div>
      </div>
      <div class="h-summary-item">
        <div class="h-summary-val"><span class="h-b-pass">${dimPass}</span> <span class="h-b-warn">${dimWarn}</span> <span class="h-b-fail">${dimFail}</span></div>
        <div class="h-summary-lbl">维度过关/告警/失败</div>
      </div>
      <div class="h-summary-item">
        <div class="h-summary-val">${escapeHtml(weakLabel)}${trendText ? ` ${trendText}` : ""}</div>
        <div class="h-summary-lbl">最弱维度${trendText ? ' · 趋势' : ''}</div>
      </div>
    </div>
    <div class="h-summary-row h-rs-mt8">
      <div class="h-summary-item">
        <div class="h-summary-val pass">${escapeHtml(strongLabel)}</div>
        <div class="h-summary-lbl">最强维度</div>
      </div>
      <div class="h-summary-item">
        <div class="h-summary-val">${recommendations.length} 项</div>
        <div class="h-summary-lbl">改进建议</div>
      </div>
      <div class="h-summary-item h-rs-flex-2">
        <div class="h-summary-val h-rs-val-sm-left">${topRec ? '💡 '+escapeHtml(topRec.slice(0,50)+(topRec.length>50?'…':'')) : '—'}</div>
        <div class="h-summary-lbl">首项建议</div>
      </div>
    </div>
  </div>`;
}

// ── Score breakdown (weighted contribution) ──────────────────────

/**
 * Build the weighted score breakdown section.
 *
 * @param {any} hr
 */
export function buildScoreBreakdown(/** @type {any} */ hr) {
  /** @type {any[]} */
  const entries = [];
  for (const [dim, score] of Object.entries(hr.scores || {})) {
    const label = DIM_LABELS[dim] || dim;
    const weight = DIM_WEIGHTS[dim] || 0;
    const contribution = Math.round(score * weight / 100);
    entries.push({ dim, label, score, weight, contribution });
  }
  entries.sort((/** @type {any} */ a, /** @type {any} */ b) => b.contribution - a.contribution);

  const totalContribution = entries.reduce((s, e) => s + e.contribution, 0);

  const bars = entries.map((/** @type {any} */ e, /** @type {number} */ i) => {
    const barColor = scoreColor(e.score);
    const barPct = ((e.contribution / Math.max(1, totalContribution)) * 100).toFixed(0);
    return `<div class="h-comp-row">
      <span class="h-comp-rank">${i + 1}</span>
      <span class="h-comp-label">${escapeHtml(e.label)}</span>
      <span class="h-comp-score" style="--color:${barColor}">${e.score}分 × ${e.weight}%</span>
      <div class="h-comp-bar-wrap"><div class="h-comp-bar-inner" style="--w:${barPct}%;--color:${barColor}"></div></div>
      <span class="h-comp-val">${e.contribution}</span>
    </div>`;
  }).join("");

  return `<div class="h-section">
    <h2>🔢 评分构成 <span class="h-section-sub-inline">加权分解 · 合计 ${totalContribution} 分</span></h2>
    <div class="h-comp-list">${bars}</div>
    <div class="h-rs-meta h-rs-mt10">计算公式: 综合评分 = Σ(维度得分 × 权重%) / Σ权重% · 按贡献值降序排列</div>
  </div>`;
}

// ── Recommendations list ─────────────────────────────────────────

/**
 * Build the recommendations section.
 *
 * @param {any[]} recs
 */
export function buildRecommendationsSection(/** @type {any[]} */ recs) {
  const items = recs.map((/** @type {any} */ r) => recItem({
    source: r.source,
    text: r.text,
    priority: r.priority,
  })).join("\n");

  return `<div class="h-section">
    <h2>💡 改进建议 <span class="h-section-sub-inline">${recs.length} 项</span></h2>
    <div class="h-rec-list">${items}</div>
  </div>`;
}

// ── Key Metrics Dashboard ────────────────────────────────────────

/**
 * Build a Key Metrics Dashboard with executive-level KPIs.
 *
 * @param {object} hr - Health result
 * @param {object} prev - Previous health entry
 * @param {object} _healthTrend - Full health trend data (unused, kept for API stability)
 * @returns {string} HTML
 */
export function buildKeyMetricsDashboard(/** @type {any} */ hr, /** @type {any} */ prev, /** @type {any} */ _healthTrend) {
  const scores = hr.scores || {};

  const availabilityScore = Math.round(
    ((scores.api || 0) * 0.4 + (scores.robots || 0) * 0.3 + (scores.config || 0) * 0.3)
  );

  const codeHealthScore = Math.round(
    ((scores.file_size || 0) * 0.35 + (scores.dep_analysis || 0) * 0.35 + ((hr.structInfo && hr.structInfo.score) || 0) * 0.3)
  );

  const securityScore = Math.round(
    ((scores.security || 0) * 0.5 + (scores.token || 0) * 0.5)
  );

  const opsMaturity = Math.round(
    ((scores.reports || 0) * 0.25 + (scores.diagnostics || 0) * 0.25 + (scores.git || 0) * 0.25 + (scores.format || 0) * 0.25)
  );

  const emDims = ["em_testing", "em_types", "em_linting", "em_cicd", "em_docs", "em_deps", "em_git"];
  const emScores = emDims.map(d => scores[d]).filter(s => typeof s === "number");
  const engMaturity = emScores.length > 0 ? Math.round(emScores.reduce((a, b) => a + b, 0) / emScores.length) : null;

  let trendIndicators = "";
  if (prev && prev.scores) {
    const prevAvail = Math.round(((prev.scores.api || 0) * 0.4 + (prev.scores.robots || 0) * 0.3 + (prev.scores.config || 0) * 0.3));
    const prevCode = Math.round(((prev.scores.file_size || 0) * 0.35 + (prev.scores.dep_analysis || 0) * 0.35 + ((prev.structScore) || 0) * 0.3));
    const prevSec = Math.round(((prev.scores.security || 0) * 0.5 + (prev.scores.token || 0) * 0.5));
    const prevOps = Math.round(((prev.scores.reports || 0) * 0.25 + (prev.scores.diagnostics || 0) * 0.25 + (prev.scores.git || 0) * 0.25 + (prev.scores.format || 0) * 0.25));

    const changes = [
      { label: "可用性", curr: availabilityScore, prev: prevAvail },
      { label: "代码健康", curr: codeHealthScore, prev: prevCode },
      { label: "安全态势", curr: securityScore, prev: prevSec },
      { label: "运维成熟度", curr: opsMaturity, prev: prevOps },
    ];

    trendIndicators = `<div class="h-rs-kpi-trend">${changes.map(ch => {
      const d = ch.curr - ch.prev;
      const icon = d > 2 ? "↑" : d < -2 ? "↓" : "→";
      const color = d > 2 ? COLOR_PASS : d < -2 ? COLOR_FAIL : "var(--yry-text-tertiary)";
      return `<span class="h-rs-change-cur" style="--change-color:${color}">${escapeHtml(ch.label)} ${icon}${Math.abs(d)}</span>`;
    }).join(' · ')}</div>`;
  }

  return `<div class="h-section">
<h2>📊 关键绩效指标 (KPI) <span class="h-section-sub-inline">Executive Dashboard</span></h2>
<div class="h-rs-kpi-row">
${kpiCard({ label: "系统可用性", value: availabilityScore, icon: "🟢", subtitle: "API+机器人+配置" })}
${kpiCard({ label: "代码健康度", value: codeHealthScore, icon: "📐", subtitle: "结构+依赖+体积" })}
${kpiCard({ label: "安全态势", value: securityScore, icon: "🛡️", subtitle: "Token+扫描" })}
${kpiCard({ label: "运维成熟度", value: opsMaturity, icon: "⚙️", subtitle: "报告+诊断+Git" })}
${engMaturity !== null ? kpiCard({ label: "工程成熟度", value: engMaturity, icon: "🏗️", subtitle: "7项工程实践" }) : ""}
</div>
${trendIndicators}
<div class="h-rs-kpi-foot h-rs-mt8">KPI 基于加权维度聚合计算 · 趋势对比上周期 · A≥90 B≥75 C≥60 D&lt;60</div>
</div>`;
}

// ── Executive summary (from generateExecutiveSummary) ────────────

/**
 * Build executive summary HTML for the report.
 *
 * @param {object} execData - From generateExecutiveSummary()
 * @param {number} composite - Composite score
 * @param {string} grade - Grade letter
 * @returns {string} HTML
 */
export function buildExecutiveSummaryHTML(/** @type {any} */ execData, /** @type {number} */ composite, /** @type {string} */ grade) {
  if (!execData) return "";

  const gradeColor = grade === 'A' ? COLOR_PASS : grade === 'B' ? COLOR_PASS : grade === 'C' ? COLOR_WARN_ORANGE : COLOR_FAIL;
  const gradeBg = grade === 'A' ? 'rgba(34,197,94,.08)' : grade === 'B' ? 'rgba(34,197,94,.06)' : grade === 'C' ? 'rgba(245,158,11,.08)' : 'rgba(239,68,68,.08)';

  let highlightsHTML = '';
  if (execData.highlights && execData.highlights.length > 0) {
    highlightsHTML = `<div class="h-rs-highlight-row">${execData.highlights.map((/** @type {string} */ h) => {
      const isWarning = h.indexOf('⚠️') >= 0;
      const bg = isWarning ? 'rgba(239,68,68,.08)' : 'rgba(34,197,94,.06)';
      const border = isWarning ? 'rgba(239,68,68,.25)' : 'rgba(34,197,94,.2)';
      return `<span class="h-rs-highlight" style="--hl-bg:${bg};--hl-border:${border}">${escapeHtml(h)}</span>`;
    }).join('')}</div>`;
  }

  let risksHTML = '';
  if (execData.risks && execData.risks.length > 0) {
    risksHTML = `<div class="h-rs-notice-risk-fail h-rs-mt8">
<div class="h-rs-risk-fail-title">⚠️ 风险提示</div>
${execData.risks.map((/** @type {string} */ r) => `<div class="h-rs-risk-item">• ${escapeHtml(r)}</div>`).join('')}
</div>`;
  }

  return `<div class="h-section feat-grade" style="--feat-color:${gradeColor};--feat-bg:${gradeBg}">
<h2>📋 执行摘要 <span class="h-section-sub-inline">Executive Summary</span></h2>
<div class="h-rs-exec-narrative">${execData.summary}</div>
${highlightsHTML}
${risksHTML}
</div>`;
}

// ── Cross-report UPHI (Unified Project Health Index) ─────────────

/**
 * Build cross-report correlation section.
 * Combines health, component, diagnostic, and architecture scores
 * into a Unified Project Health Index (UPHI).
 */
export function buildCrossReportSection(/** @type {any} */ hr, /** @type {any} */ archResult, /** @type {any} */ compScores) {
  const healthScore = hr.composite || 0;

  const compAll = compScores
    ? (compScores.skills || []).concat(compScores.agents || [], compScores.rules || [], compScores.scripts || [])
    : [];
  const compAvg = compAll.length > 0 ? avgScore(compAll) : null;

  const diagTriggered = (hr.diagnostics && hr.diagnostics.triggered && hr.diagnostics.triggered.length) || 0;
  const diagScore = Math.max(0, 100 - diagTriggered * 15);

  const archScore = (archResult && archResult.archComposite != null) ? archResult.archComposite
    : (archResult && archResult.composite != null) ? archResult.composite : null;

  const indices = [{ label: "运营健康", score: healthScore, weight: 0.4 }];
  if (compAvg !== null) indices.push({ label: "组件质量", score: compAvg, weight: 0.25 });
  indices.push({ label: "诊断健康", score: diagScore, weight: 0.2 });
  if (archScore !== null) indices.push({ label: "架构合规", score: archScore, weight: 0.15 });

  const totalWeight = indices.reduce((s, i) => s + i.weight, 0);
  const unifiedIndex = indices.length > 0
    ? Math.round(indices.reduce((s, i) => s + i.score * i.weight, 0) / totalWeight)
    : healthScore;

  const { letter: unifiedGrade, label: gradeWord, color: gradeColor } = gradeInfo(unifiedIndex);

  const indexCards = indices.map((i) => {
    const color = i.score >= 90 ? COLOR_PASS : i.score >= 75 ? COLOR_PASS : i.score >= 60 ? COLOR_WARN_ORANGE : COLOR_FAIL;
    return `<div class="h-rs-card-center-flex">
<div class="h-rs-uphi-val" style="--uphi-color:${color};font-size:1.6rem">${i.score}</div>
<div class="h-rs-uphi-grade-sm">${escapeHtml(i.label)}</div>
<div class="h-rs-uphi-lbl">权重 ${Math.round(i.weight * 100)}%</div>
</div>`;
  }).join("");

  const notes = [];
  if (compAvg !== null && Math.abs(healthScore - compAvg) > 20) {
    notes.push(`运营健康 (${healthScore}) 与组件质量 (${compAvg}) 偏差 ${Math.abs(healthScore - compAvg)} 分，需关注评分口径差异`);
  }
  if (diagTriggered >= 3) {
    notes.push(`${diagTriggered} 个诊断被触发，诊断健康度偏低 (${diagScore})，建议优先处理诊断告警`);
  }

  return `<div class="h-section">
<h2>🔗 综合项目健康指数 (UPHI) <span class="h-section-sub-inline">跨维度统一评分</span></h2>
<div class="h-rs-uphi-hero">
<div class="h-rs-uphi-lbl">统一项目健康指数</div>
<div class="h-rs-uphi-val" style="--uphi-color:${gradeColor}">${unifiedIndex}</div>
<div class="h-rs-uphi-grade">${unifiedGrade} 级 · ${gradeWord}</div>
</div>
<div class="h-rs-flex-gap8">${indexCards}</div>
${notes.length > 0 ? `<div class="h-rs-notice-warn">${notes.map((n) => `<div class="h-rs-uphi-note">🔍 ${escapeHtml(n)}</div>`).join("")}</div>` : ""}
<div class="h-rs-meta h-rs-mt8">UPHI = 运营健康×40% + 组件质量×25% + 诊断健康×20% + 架构合规×15%</div>
</div>`;
}

// ── Structured score report summary (moved from health-report.mjs)

/**
 * Build a compact HTML summary block from the structured score report.
 *
 * @param {object} sr - Output of generateScoreReport()
 * @returns {string} HTML
 */
export function buildScoreReportSummaryHTML(/** @type {any} */ sr) {
  if (!sr) return "";
  const recsHtml = (sr.recommendations || []).slice(0, 3).map((/** @type {any} */ r) =>
    `<span class="h-tag ${r.priority === 'P0' ? 'h-tag-fail' : r.priority === 'P1' ? 'h-tag-warn' : ''}">${escapeHtml(r.priority)} ${escapeHtml(r.dim)}</span>`
  ).join(" ");

  const trendIcon = sr.trend
    ? (sr.trend.direction === "rising" ? "📈" : sr.trend.direction === "falling" ? "📉" : "➡️")
    : "";
  const trendText = sr.trend
    ? `${trendIcon} ${sr.trend.direction === "rising" ? "上升" : sr.trend.direction === "falling" ? "下降" : "稳定"} (${sr.trend.slopePerWeek > 0 ? "+" : ""}${sr.trend.slopePerWeek}/周${sr.trend.confidence === "high" ? "·高置信" : ""})`
    : "";

  const forecastText = sr.forecast
    ? `📡 7天预测: <strong>${sr.forecast.value}</strong> 分 (${sr.forecast.range[0]}–${sr.forecast.range[1]})`
    : "";

  const reliabilityText = sr.reliability
    ? `🎯 可靠性: <strong>${Math.round(sr.reliability.score * 100)}%</strong> (${sr.reliability.volatility === "low" ? "低波动" : sr.reliability.volatility === "moderate" ? "中等" : "高"}波动)`
    : "";

  const breakdownRows = (sr.breakdown || []).slice(0, 5).map((/** @type {any} */ b) => {
    const barTier = b.score >= 90 ? "pass" : b.score >= 75 ? "accent" : b.score >= 60 ? "warn" : "fail";
    const statusLabel = b.status === "critical" ? "🔴" : b.status === "warn" ? "🟡" : "🟢";
    return `<div class="h-bl-row">
      <span class="h-bl-label">${statusLabel} ${escapeHtml(b.label)}</span>
      <div class="h-bl-track">
        <div class="h-bl-fill ${barTier}" style="--w:${b.score}%"></div>
      </div>
      <span class="h-bl-score">${b.score}</span>
      <span class="h-bl-trend">${b.trend === "↑ 上升" ? "↑" : b.trend === "↓ 下降" ? "↓" : "→"}</span>
    </div>`;
  }).join("");

  const comparisonHtml = sr.comparison && sr.comparison.compositeDelta !== undefined
    ? `<div class="h-comp-delta ${sr.comparison.compositeDelta > 0 ? 'up' : sr.comparison.compositeDelta < 0 ? 'down' : 'flat'}">📊 对比上周期: <strong>${sr.comparison.compositeDelta > 0 ? '+' : ''}${sr.comparison.compositeDelta}</strong> 分 · 🟢 ${sr.comparison.improvedCount || 0} 改善 · 🔴 ${sr.comparison.declinedCount || 0} 退化</div>`
    : "";

  return `<div class="h-section">
    <h2>📋 结构化评分报告</h2>
    <div class="h-sr-grid">
      <div class="h-stat-card"><div class="h-sc-label">趋势</div><div class="h-sc-val compact">${trendText || "数据不足"}</div></div>
      <div class="h-stat-card"><div class="h-sc-label">预测</div><div class="h-sc-val compact">${forecastText || "数据不足"}</div></div>
      <div class="h-stat-card"><div class="h-sc-label">可靠性</div><div class="h-sc-val compact">${reliabilityText || "数据不足"}</div></div>
      <div class="h-stat-card"><div class="h-sc-label">诊断</div><div class="h-sc-val compact">🔬 ${sr.diagnostics?.triggered || 0}/${sr.diagnostics?.total || 8} 触发</div></div>
    </div>
    ${comparisonHtml}
    ${breakdownRows ? `<div class="h-sr-breakdown"><div class="h-sr-breakdown-title">📐 维度拆解 (Top 5 待改进)</div>${breakdownRows}</div>` : ""}
    ${recsHtml ? `<div class="h-sr-recs"><span class="h-sr-recs-label">💡 优先行动: </span>${recsHtml}</div>` : ""}
  </div>`;
}
