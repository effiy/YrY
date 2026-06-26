/**
 * report-sections/trend — Trend chart, forecast panel.
 *
 *   - buildScoreTrend             SVG sparkline of historical scores
 *   - buildForecastPanel          composite+per-dim forecast with chart
 */

import { GRADE_COLOR, GRADE_BAR_OPACITY, GRADE_CSS_VAR, COLOR_PASS, COLOR_FAIL, COLOR_WARN_ORANGE, escapeHtml } from "../report-styles.mjs";

// ── Historical score trend (SVG sparkline) ───────────────────────

/**
 * Build score trend chart showing historical scores.
 *
 * @param {any[]} trend - Historical entries { composite, grade, timestamp }
 * @returns {string} HTML
 */
export function buildScoreTrend(/** @type {any[]} */ trend) {
  if (!trend || trend.length < 2) return "";

  const W = 800, H = 200, padL = 40, padR = 20, padT = 10, padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const scores = trend.map((t) => t.composite || 0);
  const maxScore = Math.max(100, ...scores);
  const minScore = Math.min(0, ...scores);
  const scoreRange = Math.max(1, maxScore - minScore);
  const xs = trend.map((_, i) => padL + (trend.length === 1 ? 0 : (i / (trend.length - 1)) * innerW));
  const ys = scores.map((s) => padT + innerH - ((s - minScore) / scoreRange) * innerH);
  const polyline = xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const areaPath = `M${xs[0].toFixed(1)},${(padT + innerH).toFixed(1)} L${polyline.replace(/,/g, " ").split(" ").reduce((acc, val, idx) => {
    if (idx % 2 === 0) return acc + " L" + val;
    return acc + "," + val;
  }, "").trim()} L${xs[xs.length - 1].toFixed(1)},${(padT + innerH).toFixed(1)} Z`;

  const first = trend[0];
  const last = trend[trend.length - 1];
  const firstDate = (first.timestamp || "").slice(0, 10);
  const lastDate = (last.timestamp || "").slice(0, 10);
  const diff = (last.composite || 0) - (first.composite || 0);
  const dirIcon = diff > 0 ? "📈" : diff < 0 ? "📉" : "➡️";
  const dirWord = diff > 0 ? "上升" : diff < 0 ? "下降" : "持平";

  const dots = trend.map((t, i) => {
    const fill = GRADE_COLOR[t.grade] || COLOR_PASS;
    const opacity = GRADE_BAR_OPACITY[t.grade] ?? 1;
    return `<circle cx="${xs[i].toFixed(1)}" cy="${ys[i].toFixed(1)}" r="3.5" fill="${fill}" opacity="${opacity}" stroke="var(--bg-canvas)" stroke-width="1.5"><title>${(t.timestamp || "").slice(0, 10)} · ${t.composite} · ${escapeHtml(t.grade || "")}</title></circle>`;
  }).join("");

  const yTicks = [0, 25, 50, 75, 100].map((v) => {
    const y = padT + innerH - ((v - minScore) / scoreRange) * innerH;
    const colorVar = GRADE_CSS_VAR[v >= 90 ? "A" : v >= 75 ? "B" : v >= 60 ? "C" : "D"];
    return `<line x1="${padL}" y1="${y}" x2="${padL + innerW}" y2="${y}" stroke="var(--border-faint)" stroke-width="0.3" stroke-dasharray="2,2" />
<text x="${padL - 5}" y="${y}" fill="${colorVar}" font-size="9" text-anchor="end" dominant-baseline="central">${v}</text>`;
  }).join("");

  const xLabels = trend.map((t, i) => {
    const x = xs[i];
    const date = (t.timestamp || "").slice(5, 10);
    return `<text x="${x}" y="${padT + innerH + 15}" fill="var(--yry-text-tertiary)" font-size="9" text-anchor="middle">${escapeHtml(date)}</text>`;
  }).join("");

  return `<div class="h-section">
    <h2>📈 评分趋势 <span class="h-section-sub-inline">${dirIcon} ${dirWord} ${diff > 0 ? "+" : ""}${diff} 分 · ${trend.length} 个数据点</span></h2>
    <div class="h-rs-trend-stats">
      <span>📅 时间范围: <b>${escapeHtml(firstDate)} → ${escapeHtml(lastDate)}</b></span>
      <span>🎯 起点: <b>${first.composite}</b> 分 (${escapeHtml(first.grade)})</span>
      <span>🎯 终点: <b>${last.composite}</b> 分 (${escapeHtml(last.grade)})</span>
    </div>
    <svg viewBox="0 0 ${W} ${H}" class="h-trend-svg" preserveAspectRatio="xMidYMid meet">
${yTicks}
<path d="${areaPath}" fill="${COLOR_PASS}" fill-opacity="0.08" />
<polyline points="${polyline}" fill="none" stroke="${COLOR_PASS}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
${dots}
${xLabels}
</svg>
    <div class="h-rs-meta h-rs-mt8">数据点 ≤20 个 (按时间排序) · 圆点 = 检查 · 颜色对应等级</div>
  </div>`;
}

// ── Forecast panel (7d + 30d projection + confidence) ───────────

/**
 * Build forecast panel HTML.
 *
 * @param {object} enhancedTrend - { forecast, trend, velocity, distribution }
 * @param {object} hr - Current health result
 * @returns {string} HTML
 */
export function buildForecastPanel(/** @type {any} */ enhancedTrend, /** @type {any} */ hr) {
  if (!enhancedTrend || !enhancedTrend.forecast) return "";

  const { forecast, trend, velocity, distribution } = enhancedTrend;

  const forecastColor = trend.direction === "rising" ? COLOR_PASS
    : trend.direction === "falling" ? "var(--yry-fail)" : COLOR_WARN_ORANGE;
  const forecastIcon = trend.direction === "rising" ? "📈"
    : trend.direction === "falling" ? "📉" : "📊";

  const day7Value = forecast.forecast || hr.composite;
  const day7Range = forecast.range || [day7Value - 5, day7Value + 5];
  const day7Change = day7Value - hr.composite;

  const day30Value = Math.max(0, Math.min(100, Math.round(day7Value + (trend.slopePerWeek || 0) * 3)));
  const day30Change = day30Value - hr.composite;

  const confidenceLabel = trend.confidence === "high" ? "高置信度"
    : trend.confidence === "medium" ? "中等置信度" : "低置信度";
  const confidenceColor = trend.confidence === "high" ? COLOR_PASS
    : trend.confidence === "medium" ? COLOR_WARN_ORANGE : COLOR_FAIL;
  const confidenceNote = trend.confidence === "high"
    ? "数据充足，预测可靠，可作为决策依据"
    : trend.confidence === "medium"
    ? "数据量适中，预测方向可信，具体数值仅供参考"
    : "数据不足，预测仅供参考，建议积累更多数据后重新评估";

  const risks = [];
  if (trend.direction === "falling") {
    risks.push("评分持续下降，若不干预可能触发更多诊断告警");
  }
  if (velocity && velocity.accelerating && velocity.recent < 0) {
    risks.push("下降趋势正在加速，需立即采取纠正措施");
  }
  if (distribution && distribution.stddev > 10) {
    risks.push(`评分波动较大(σ=${distribution.stddev})，预测不确定性较高`);
  }
  if (trend.r2 < 0.5) {
    risks.push(`趋势拟合度低(R²=${trend.r2})，评分变化缺乏明确方向性`);
  }

  const changeColor7 = day7Change > 0 ? COLOR_PASS : day7Change < 0 ? COLOR_FAIL : "var(--yry-text-secondary)";
  const changeColor30 = day30Change > 0 ? COLOR_PASS : day30Change < 0 ? COLOR_FAIL : "var(--yry-text-secondary)";

  const directionWord = trend.direction === "rising" ? "上升" : trend.direction === "falling" ? "下降" : "稳定";
  const slopeSign = trend.slopePerWeek > 0 ? "+" : "";
  const day7ChangeSign = day7Change > 0 ? "+" : "";
  const day30ChangeSign = day30Change > 0 ? "+" : "";
  const day30Color = day30Change > 0 ? COLOR_PASS : COLOR_FAIL;

  return `<div class="h-section">
<h2>🔮 健康预测与投影 <span class="h-section-sub-inline">Forecast & Projection</span></h2>
<div class="h-rs-grid-fit">
<div class="h-rs-fc-card">
<div class="h-rs-fc-icon">${forecastIcon}</div>
<div class="h-rs-card-lbl-sm">趋势方向</div>
<div class="h-rs-fc-val-sm" style="--fc-color:${forecastColor}">${directionWord} (${slopeSign}${trend.slopePerWeek}/周)</div>
</div>
<div class="h-rs-fc-card">
<div class="h-rs-card-lbl-sm">7 天预测</div>
<div class="h-rs-fc-val" style="--fc-color:${forecastColor}">${day7Value} 分</div>
<div class="h-rs-fc-delta" style="--fc-delta-color:${changeColor7}">${day7ChangeSign}${day7Change} 分</div>
<div class="h-rs-note-mt4">区间: ${day7Range[0]}–${day7Range[1]} 分</div>
</div>
<div class="h-rs-fc-card">
<div class="h-rs-card-lbl-sm">30 天投影</div>
<div class="h-rs-fc-val" style="--fc-color:${day30Color}">${day30Value} 分</div>
<div class="h-rs-fc-delta" style="--fc-delta-color:${changeColor30}">${day30ChangeSign}${day30Change} 分</div>
<div class="h-rs-note-mt4">基于当前趋势外推</div>
</div>
<div class="h-rs-fc-card">
<div class="h-rs-card-lbl-sm">预测置信度</div>
<div class="h-rs-fc-val-sm" style="--fc-color:${confidenceColor}">${confidenceLabel}</div>
<div class="h-rs-fc-foot">R² = ${trend.r2}</div>
<div class="h-rs-fc-sub">${confidenceNote}</div>
</div>
</div>
${risks.length > 0 ? `<div class="h-rs-notice-risk-warn h-rs-mb8">
<div class="h-rs-risk-warn-title">⚠️ 预测风险提示</div>
${risks.map((r) => `<div class="h-rs-corr-insight">• ${escapeHtml(r)}</div>`).join("")}
</div>` : ''}
<div class="h-rs-note-center">预测基于历史健康趋势数据的线性回归模型 · 30天投影 = 7天预测 + 趋势外推 · 实际结果受代码变更、配置调整等因素影响</div>
</div>`;
}
