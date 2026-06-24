/**
 * report-trend — Time utilities and health trend/history functions.
 * Extracted from health-report.mjs for module decomposition.
 *
 * Enhanced with professional trend analysis: moving averages, trend detection,
 * anomaly detection, and score forecasting from lib/scoring.mjs.
 */

import { existsSync, readdirSync, readFileSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";

import { REPORT_DIR, DIM_LABELS } from "./report-constants.mjs";
import { nowDate } from "../../../lib/fs.mjs";
import { PASS_THRESHOLD, WARN_THRESHOLD, scoreColor } from "./bot-health-analysis.mjs";
import {
  movingAverage,
  detectTrend,
  forecastScore,
  detectAnomalies,
  scoreDistribution,
  scoreVelocity,
  getGrade,
  classifyScore,
} from "../../../lib/scoring.mjs";

function exponentialMA(history, alpha = 0.3) {
  if (history.length === 0) return [];
  const result = [history[0]];
  for (let i = 1; i < history.length; i++) {
    result.push(Math.round(alpha * history[i] + (1 - alpha) * result[i - 1]));
  }
  return result;
}

function pearsonCorrelation(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return 0;

  const xMean = xs.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const yMean = ys.slice(0, n).reduce((a, b) => a + b, 0) / n;

  let ssXY = 0, ssXX = 0, ssYY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - xMean;
    const dy = ys[i] - yMean;
    ssXY += dx * dy;
    ssXX += dx * dx;
    ssYY += dy * dy;
  }

  const denom = Math.sqrt(ssXX * ssYY);
  return denom !== 0 ? Math.round(ssXY / denom * 100) / 100 : 0;
}

export { nowDate };

export function nowChinese() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}年${p(d.getMonth() + 1)}月${p(d.getDate())}日 ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function extractReportMeta(filename) {
  const match = filename.match(/^health-(\d{4}-\d{2}-\d{2})(?:-(\d{6}))?\.html$/);
  if (!match) return null;
  const [, date, timeRaw = ""] = match;
  const time = timeRaw
    ? `${timeRaw.slice(0, 2)}:${timeRaw.slice(2, 4)}:${timeRaw.slice(4, 6)}`
    : "—";
  return { file: filename, date, time, timeRaw };
}

export function compareReportMeta(a, b) {
  if (!a) return -1;
  if (!b) return 1;
  if (!a.timeRaw && b.timeRaw) return 1;
  if (a.timeRaw && !b.timeRaw) return -1;
  if (a.date !== b.date) return a.date.localeCompare(b.date);
  return a.timeRaw.localeCompare(b.timeRaw);
}

export function listReportFiles() {
  if (!existsSync(REPORT_DIR)) return [];
  return readdirSync(REPORT_DIR)
    .filter((f) => f.endsWith(".html") && f !== "index.html")
    .map((file) => {
      const meta = extractReportMeta(file);
      if (!meta) return null;
      let mtimeMs = 0;
      try {
        mtimeMs = statSync(join(REPORT_DIR, file)).mtimeMs;
      } catch { /* ignore unreadable files */ }
      return { ...meta, mtimeMs };
    })
    .filter(Boolean);
}

export function pickLatestReportsByDate(files) {
  const latestByDate = new Map();
  for (const file of files) {
    const existing = latestByDate.get(file.date);
    if (!existing || compareReportMeta(file, existing) > 0 || (compareReportMeta(file, existing) === 0 && file.mtimeMs > existing.mtimeMs)) {
      latestByDate.set(file.date, file);
    }
  }
  return [...latestByDate.values()].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.mtimeMs - a.mtimeMs;
  });
}

export function removeReportsForDate(date, keepFile = "") {
  for (const report of listReportFiles()) {
    if (report.date === date && report.file !== keepFile) {
      try {
        unlinkSync(join(REPORT_DIR, report.file));
      } catch { /* best effort cleanup */ }
    }
  }
}

export function getPreviousScore() {
  const today = nowDate();
  try {
    const files = pickLatestReportsByDate(listReportFiles())
      .filter((f) => f.date !== today);
    if (files.length === 0) return null;

    const content = readFileSync(join(REPORT_DIR, files[0].file), "utf-8");
    const scoreMatch = content.match(/h-score-num[^>]*>(\d+)</);
    const gradeMatch = content.match(/h-score-grade[^>]*>([ABCD]) 级</);
    if (scoreMatch) {
      return { score: parseInt(scoreMatch[1], 10), grade: gradeMatch ? gradeMatch[1] : null, date: files[0].date };
    }
    return null;
  } catch {
    return null;
  }
}

export function getHealthTrend() {
  const trendPath = ".memory/health-trend.jsonl";
  if (!existsSync(trendPath)) return [];
  try {
    return readFileSync(trendPath, "utf-8").trim().split("\n").filter(Boolean).map((l) => {
      try { return JSON.parse(l); } catch { return null; }
    }).filter(Boolean);
  } catch {
    return [];
  }
}

export function buildGradeSparkline(history) {
  if (history.length < 2) return "";

  const gradeColors = { A: "#22c55e", B: "#22c55e", C: "#f59e0b", D: "#ef4444" };
  const sampled = history.length <= 20 ? history : history.filter((_, i) => i % Math.ceil(history.length / 20) === 0 || i === history.length - 1);
  const dots = sampled.map((h, i) => {
    const color = gradeColors[h.grade] || "#666";
    const last = i === sampled.length - 1;
    const size = last ? "10px" : "6px";
    return `<span class="h-grade-dot" style="background:${color};width:${size};height:${size}" title="${h.grade} 级 · ${h.composite} 分 · ${h.timestamp?.slice(0,10) || ""}"></span>`;
  }).join("");

  return `<div class="h-grade-spark">${dots}</div>`;
}

export function getDimensionHistory() {
  const history = {};

  const trendPath = ".memory/health-trend.jsonl";
  if (existsSync(trendPath)) {
    try {
      const lines = readFileSync(trendPath, "utf-8").trim().split("\n").filter(Boolean);
      for (const line of lines) {
        const entry = JSON.parse(line);
        const date = entry.timestamp?.slice(0, 10) || "";
        if (entry.scores) {
          for (const [dim, score] of Object.entries(entry.scores)) {
            const label = DIM_LABELS[dim] || dim;
            if (!history[label]) history[label] = [];
            history[label].push({ date, score });
          }
        }
      }
      if (Object.keys(history).length > 0) return history;
    } catch { /* fall back to HTML parsing */ }
  }

  if (!existsSync(REPORT_DIR)) return history;

  try {
    const files = readdirSync(REPORT_DIR)
      .filter((f) => f.endsWith(".html") && f !== "index.html")
      .sort();

    for (const f of files) {
      const dateMatch = f.match(/health-(\d{4}-\d{2}-\d{2})-/);
      const date = dateMatch ? dateMatch[1] : "";
      const content = readFileSync(join(REPORT_DIR, f), "utf-8");

      const dimRegex = /<span class="h-dim-label">([^<]+)<\/span>\s*<span class="h-dim-score"[^>]*>(\d+) 分<\/span>/g;
      let match;
      while ((match = dimRegex.exec(content)) !== null) {
        const label = match[1];
        const score = parseInt(match[2], 10);
        if (!history[label]) history[label] = [];
        const existing = history[label].find((e) => e.date === date);
        if (!existing) {
          history[label].push({ date, score });
        }
      }
    }
  } catch { /* skip */ }

  return history;
}

export function dimTrendIcon(dimLabel, currentScore, history) {
  const dimHistory = history[dimLabel] || [];
  if (dimHistory.length < 2) return "";

  const prev = dimHistory[dimHistory.length - 2];
  if (!prev || prev.score === undefined) return "";

  const diff = currentScore - prev.score;
  if (diff > 5) return `<span class="h-trend up" title="提升 ${diff} 分">↑${diff}</span>`;
  if (diff < -5) return `<span class="h-trend down" title="下降 ${Math.abs(diff)} 分">↓${Math.abs(diff)}</span>`;
  return '<span class="h-trend stable" title="持平">→</span>';
}

export function dimSparkline(dimLabel, history) {
  const dimHistory = history[dimLabel] || [];
  if (dimHistory.length < 2) return "";

  const scores = dimHistory.map((h) => h.score);
  const max = Math.max(...scores, 100);
  const bars = scores.map((s) => {
    const h = Math.max(2, Math.round((s / max) * 16));
    const color = scoreColor(s);
    return `<span class="h-spark-bar" style="height:${h}px;background:${color}" title="${s} 分"></span>`;
  }).join("");

  return `<div class="h-sparkline">${bars}</div>`;
}

// ── Enhanced trend analysis (powered by lib/scoring.mjs) ─────────

/**
 * Build enhanced trend analysis from health history.
 * Returns professional-grade statistics for the report.
 *
 * @param {object[]} history - Health trend entries
 * @returns {object} Enhanced analysis data for HTML rendering
 */
export function buildEnhancedTrendAnalysis(history) {
  if (!history || history.length < 2) return null;

  const composites = history.map(h => h.composite).filter(s => typeof s === "number");
  if (composites.length < 2) return null;

  // Core statistics
  const dist = scoreDistribution(composites);
  const trend = detectTrend(composites);
  const velocity = scoreVelocity(composites);
  const forecast = forecastScore(composites);
  const sma7 = movingAverage(composites, Math.min(7, composites.length));
  const ema = exponentialMA(composites, 0.3);
  const anomalies = detectAnomalies(composites);

  // Grade distribution over time
  const gradeCounts = { A: 0, B: 0, C: 0, D: 0 };
  for (const h of history) {
    const g = getGrade(h.composite || 0);
    if (gradeCounts[g.grade] !== undefined) gradeCounts[g.grade]++;
  }

  // Dimension-level trends
  const dimTrends = {};
  const dimHistory = getDimensionHistory();
  for (const [label, points] of Object.entries(dimHistory)) {
    if (points.length >= 3) {
      const scores = points.map(p => p.score);
      dimTrends[label] = {
        trend: detectTrend(scores),
        current: scores[scores.length - 1],
        prev: scores[scores.length - 2] || scores[scores.length - 1],
        dist: scoreDistribution(scores),
      };
    }
  }

  // Identify regressing and improving dimensions
  const regressing = [];
  const improving = [];
  for (const [label, data] of Object.entries(dimTrends)) {
    if (data.trend.direction === "falling" && data.trend.confidence !== "low") {
      regressing.push({ label, slope: data.trend.slopePerWeek, current: data.current });
    }
    if (data.trend.direction === "rising" && data.trend.confidence !== "low") {
      improving.push({ label, slope: data.trend.slopePerWeek, current: data.current });
    }
  }
  regressing.sort((a, b) => a.slope - b.slope); // worst first
  improving.sort((a, b) => b.slope - a.slope);   // best first

  return {
    composites,
    distribution: dist,
    trend,
    velocity,
    forecast,
    sma7: sma7.filter(v => v !== null),
    ema,
    anomalies: anomalies.map(i => ({
      index: i,
      value: composites[i],
      date: history[i]?.timestamp?.slice(0, 10) || "",
    })),
    gradeDistribution: gradeCounts,
    totalEntries: history.length,
    regressingDimensions: regressing.slice(0, 5),
    improvingDimensions: improving.slice(0, 5),
    dimTrends,
  };
}

/**
 * Build a trend summary card HTML for the enhanced report.
 *
 * @param {object} analysis - From buildEnhancedTrendAnalysis()
 * @returns {string} HTML
 */
export function buildTrendSummaryHTML(analysis) {
  if (!analysis) return "";

  const { trend, distribution, velocity, forecast, gradeDistribution } = analysis;

  const trendIcon = trend.direction === "rising" ? "📈"
    : trend.direction === "falling" ? "📉" : "📊";
  const trendLabel = trend.direction === "rising" ? "上升趋势"
    : trend.direction === "falling" ? "下降趋势" : "保持稳定";
  const trendColor = trend.direction === "rising" ? "#22c55e"
    : trend.direction === "falling" ? "#ef4444" : "#f59e0b";

  const velIcon = velocity.recent > 0 ? "↗" : velocity.recent < 0 ? "↘" : "→";
  const accelNote = velocity.accelerating
    ? `<span style="color:#f59e0b">⚠ 趋势正在加速</span>`
    : "";

  return `
  <div class="h-trend-summary" style="margin:16px 0;padding:16px;background:var(--bg2);border-radius:8px;border:1px solid var(--border2)">
    <div style="font-size:16px;font-weight:600;margin-bottom:12px">📊 趋势分析摘要</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">
      <div class="h-trend-card" style="text-align:center;padding:12px;background:var(--bg1);border-radius:6px">
        <div style="font-size:24px;margin-bottom:4px">${trendIcon}</div>
        <div style="font-weight:600;color:${trendColor}">${trendLabel}</div>
        <div style="font-size:12px;color:var(--text3)">斜率: ${trend.slopePerWeek > 0 ? "+" : ""}${trend.slopePerWeek} 分/周</div>
        <div style="font-size:12px;color:var(--text3)">置信度: ${trend.confidence === "high" ? "高" : trend.confidence === "medium" ? "中" : "低"} (R²=${trend.r2})</div>
      </div>
      <div class="h-trend-card" style="text-align:center;padding:12px;background:var(--bg1);border-radius:6px">
        <div style="font-size:24px;margin-bottom:4px">${velIcon}</div>
        <div style="font-weight:600">近期变化: ${velocity.recent > 0 ? "+" : ""}${velocity.recent} 分</div>
        <div style="font-size:12px;color:var(--text3)">周均变化: ${velocity.weekly > 0 ? "+" : ""}${velocity.weekly} 分</div>
        ${accelNote}
      </div>
      <div class="h-trend-card" style="text-align:center;padding:12px;background:var(--bg1);border-radius:6px">
        <div style="font-size:24px;margin-bottom:4px">🔮</div>
        <div style="font-weight:600">预测: ${forecast.forecast} 分</div>
        <div style="font-size:12px;color:var(--text3)">区间: ${forecast.range[0]}–${forecast.range[1]} 分</div>
        <div style="font-size:12px;color:var(--text3)">7天后预测值</div>
      </div>
      <div class="h-trend-card" style="text-align:center;padding:12px;background:var(--bg1);border-radius:6px">
        <div style="font-weight:600;margin-bottom:4px">评级分布</div>
        <div style="display:flex;justify-content:center;gap:8px">
          ${Object.entries(gradeDistribution).map(([g, c]) =>
            `<span style="padding:2px 8px;border-radius:4px;background:${g === "A" ? "rgba(34,197,94,.2)" : g === "B" ? "rgba(34,197,94,.15)" : g === "C" ? "rgba(245,158,11,.15)" : "rgba(239,68,68,.15)"};color:${g === "D" ? "#ef4444" : g === "C" ? "#f59e0b" : "#22c55e"}">${g}: ${c}</span>`
          ).join("")}
        </div>
        <div style="font-size:12px;color:var(--text3);margin-top:4px">历史 ${analysis.totalEntries} 次检查</div>
      </div>
    </div>
    ${analysis.regressingDimensions.length > 0 ? `
    <div style="margin-top:12px;padding:10px;background:rgba(239,68,68,.08);border-radius:6px;border:1px solid rgba(239,68,68,.2)">
      <span style="color:#ef4444;font-weight:600">⚠ 退化维度:</span>
      ${analysis.regressingDimensions.map(d =>
        `<span style="margin-left:8px;color:var(--text2)">${d.label} <span style="color:#ef4444">${d.slope > 0 ? "+" : ""}${d.slope}/周</span></span>`
      ).join("")}
    </div>` : ""}
    ${analysis.improvingDimensions.length > 0 ? `
    <div style="margin-top:8px;padding:10px;background:rgba(34,197,94,.08);border-radius:6px;border:1px solid rgba(34,197,94,.2)">
      <span style="color:#22c55e;font-weight:600">✅ 改善维度:</span>
      ${analysis.improvingDimensions.map(d =>
        `<span style="margin-left:8px;color:var(--text2)">${d.label} <span style="color:#22c55e">+${d.slope}/周</span></span>`
      ).join("")}
    </div>` : ""}
  </div>`;
}

/**
 * Build anomaly alert HTML for the enhanced report.
 *
 * @param {object} analysis - From buildEnhancedTrendAnalysis()
 * @returns {string} HTML
 */
export function buildAnomalyAlertHTML(analysis) {
  if (!analysis || !analysis.anomalies || analysis.anomalies.length === 0) return "";

  return `
  <div style="margin:8px 0;padding:12px;background:rgba(245,158,11,.1);border-radius:6px;border:1px solid rgba(245,158,11,.25)">
    <span style="color:#f59e0b;font-weight:600">🔍 检测到 ${analysis.anomalies.length} 个异常评分点:</span>
    ${analysis.anomalies.slice(0, 5).map(a =>
      `<span style="margin-left:8px;font-size:13px">${a.date || "—"}: <b>${a.value}</b> 分</span>`
    ).join("")}
    <span style="font-size:12px;color:var(--text3);margin-left:8px">(偏离典型值超过 3.5× 中位绝对偏差)</span>
  </div>`;
}

// ── Dimension correlation matrix ────────────────────────────────

/**
 * Build a correlation matrix between health dimensions using historical data.
 * Uses Pearson correlation on per-dimension score histories.
 *
 * @param {object} dimHistory - From getDimensionHistory() — { label: [{date, score}] }
 * @param {string[]} [focusDims] - Optional subset of dimension labels to include
 * @returns {{ matrix: number[][], labels: string[], insights: string[] }}
 */
export function buildCorrelationMatrix(dimHistory, focusDims) {
  // Collect labels that have enough data points
  var candidates = Object.entries(dimHistory)
    .filter(function(e) { return e[1].length >= 3; })
    .map(function(e) { return e[0]; });

  if (focusDims && focusDims.length > 0) {
    candidates = candidates.filter(function(l) { return focusDims.indexOf(l) >= 0; });
  }

  if (candidates.length < 3) return null;

  // Align scores by date
  var dateMap = {};
  for (var _a = 0; _a < candidates.length; _a++) {
    var label = candidates[_a];
    var points = dimHistory[label] || [];
    for (var _b = 0; _b < points.length; _b++) {
      var p = points[_b];
      if (!dateMap[p.date]) dateMap[p.date] = {};
      dateMap[p.date][label] = p.score;
    }
  }

  // Build aligned score arrays
  var dates = Object.keys(dateMap).sort();
  var scoreArrays = {};
  for (var _c = 0; _c < candidates.length; _c++) {
    scoreArrays[candidates[_c]] = [];
  }

  for (var _d = 0; _d < dates.length; _d++) {
    var row = dateMap[dates[_d]];
    for (var _e = 0; _e < candidates.length; _e++) {
      var lbl = candidates[_e];
      scoreArrays[lbl].push(row[lbl] !== undefined ? row[lbl] : null);
    }
  }

  // Compute correlation matrix
  var n = candidates.length;
  var matrix = [];
  for (var i = 0; i < n; i++) {
    matrix[i] = [];
    for (var j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1.0;
      } else if (j < i) {
        matrix[i][j] = matrix[j][i]; // symmetric
      } else {
        var xs = [], ys = [];
        var arrI = scoreArrays[candidates[i]];
        var arrJ = scoreArrays[candidates[j]];
        for (var k = 0; k < arrI.length; k++) {
          if (arrI[k] !== null && arrJ[k] !== null) {
            xs.push(arrI[k]);
            ys.push(arrJ[k]);
          }
        }
        matrix[i][j] = xs.length >= 3 ? pearsonCorrelation(xs, ys) : 0;
      }
    }
  }

  // Generate insights
  var insights = [];
  var strongPairs = [];
  for (var _f = 0; _f < n; _f++) {
    for (var _g = _f + 1; _g < n; _g++) {
      var r = matrix[_f][_g];
      if (Math.abs(r) >= 0.7) {
        strongPairs.push({
          a: candidates[_f], b: candidates[_g], r: r,
          direction: r > 0 ? '正相关' : '负相关',
        });
      }
    }
  }
  strongPairs.sort(function(a, b) { return Math.abs(b.r) - Math.abs(a.r); });

  var _h = 0;
  for (; _h < strongPairs.length && _h < 5; _h++) {
    var sp = strongPairs[_h];
    var strength = Math.abs(sp.r) >= 0.85 ? '强' : '显著';
    if (sp.r > 0) {
      insights.push(sp.a + ' ↔ ' + sp.b + ': ' + strength + '正相关 (r=' + sp.r.toFixed(2) + ') — 改善一方可带动另一方');
    } else {
      insights.push(sp.a + ' ↔ ' + sp.b + ': ' + strength + '负相关 (r=' + sp.r.toFixed(2) + ') — 存在权衡关系');
    }
  }

  return { matrix: matrix, labels: candidates, insights: insights };
}

// ── Historical benchmarking ──────────────────────────────────────

/**
 * Compute historical benchmarks from trend data.
 * Compares current score against best, worst, and average periods.
 *
 * @param {object[]} history - Health trend entries
 * @param {number} currentComposite - Current composite score
 * @returns {{ best: object, worst: object, avg: number, percentile: number, periodLabel: string }}
 */
export function buildHistoricalBenchmarks(history, currentComposite) {
  if (!history || history.length < 2) return null;

  var composites = history.map(function(h) { return h.composite; }).filter(function(s) { return typeof s === "number"; });
  if (composites.length < 2) return null;

  var best = null, worst = null;
  var sum = 0;
  for (var i = 0; i < history.length; i++) {
    var h = history[i];
    var s = h.composite;
    if (typeof s !== "number") continue;
    sum += s;
    if (!best || s > best.score) best = { score: s, date: (h.timestamp || "").slice(0, 10), grade: h.grade || "" };
    if (!worst || s < worst.score) worst = { score: s, date: (h.timestamp || "").slice(0, 10), grade: h.grade || "" };
  }

  var avg = Math.round(sum / composites.length);

  // Percentile rank: what % of historical scores are below current
  var below = 0;
  for (var _a = 0; _a < composites.length; _a++) {
    if (composites[_a] < currentComposite) below++;
  }
  var percentile = Math.round((below / composites.length) * 100);

  // Period labels
  var days = history.length; // approximate data points as daily
  var periodLabel = days <= 7 ? "近7天" : days <= 30 ? "近30天" : days <= 90 ? "近90天" : "全部历史";

  // Best/average gap
  var bestGap = currentComposite - (best ? best.score : currentComposite);
  var avgGap = currentComposite - avg;

  return {
    best: best,
    worst: worst,
    avg: avg,
    percentile: percentile,
    bestGap: bestGap,
    avgGap: avgGap,
    totalSamples: composites.length,
    periodLabel: periodLabel,
  };
}

/**
 * Build benchmarking HTML for the report.
 *
 * @param {object} benchmarks - From buildHistoricalBenchmarks()
 * @returns {string} HTML
 */
export function buildBenchmarkHTML(benchmarks) {
  if (!benchmarks || benchmarks.totalSamples < 2) return "";

  var bm = benchmarks;
  var vsBest = bm.bestGap >= 0 ? '达到历史最佳' : '距最佳差 ' + Math.abs(bm.bestGap) + ' 分';
  var vsBestColor = bm.bestGap >= 0 ? '#22c55e' : bm.bestGap >= -5 ? '#f59e0b' : '#ef4444';
  var vsAvgColor = bm.avgGap >= 0 ? '#22c55e' : '#ef4444';
  var percentileColor = bm.percentile >= 75 ? '#22c55e' : bm.percentile >= 50 ? '#f59e0b' : '#ef4444';

  return '<div class="h-section">' +
    '<h2>📊 历史基准对比 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">' + bm.periodLabel + ' · ' + bm.totalSamples + ' 次检查</span></h2>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:8px">' +
    '<div style="text-align:center;padding:12px;background:var(--bg1);border-radius:6px">' +
    '<div style="font-size:.7rem;color:var(--yry-text3);margin-bottom:4px">历史最佳</div>' +
    '<div style="font-size:1.4rem;font-weight:700;color:#22c55e">' + bm.best.score + '</div>' +
    '<div style="font-size:.62rem;color:var(--yry-text3)">' + bm.best.date + ' · ' + bm.best.grade + '级</div>' +
    '</div>' +
    '<div style="text-align:center;padding:12px;background:var(--bg1);border-radius:6px">' +
    '<div style="font-size:.7rem;color:var(--yry-text3);margin-bottom:4px">历史平均</div>' +
    '<div style="font-size:1.4rem;font-weight:700;color:var(--yry-text2)">' + bm.avg + '</div>' +
    '<div style="font-size:.62rem;color:var(--yry-text3)">' + bm.totalSamples + ' 次均值</div>' +
    '</div>' +
    '<div style="text-align:center;padding:12px;background:var(--bg1);border-radius:6px">' +
    '<div style="font-size:.7rem;color:var(--yry-text3);margin-bottom:4px">历史最差</div>' +
    '<div style="font-size:1.4rem;font-weight:700;color:#ef4444">' + bm.worst.score + '</div>' +
    '<div style="font-size:.62rem;color:var(--yry-text3)">' + bm.worst.date + ' · ' + bm.worst.grade + '级</div>' +
    '</div>' +
    '<div style="text-align:center;padding:12px;background:var(--bg1);border-radius:6px">' +
    '<div style="font-size:.7rem;color:var(--yry-text3);margin-bottom:4px">百分位</div>' +
    '<div style="font-size:1.4rem;font-weight:700;color:' + percentileColor + '">P' + bm.percentile + '</div>' +
    '<div style="font-size:.62rem;color:var(--yry-text3)">超越 ' + bm.percentile + '% 历史记录</div>' +
    '</div>' +
    '</div>' +
    '<div style="padding:8px;background:rgba(245,158,11,.06);border-radius:6px;font-size:.7rem;color:var(--yry-text2);text-align:center">' +
    '📊 对比最佳: <span style="color:' + vsBestColor + ';font-weight:600">' + vsBest + '</span> · ' +
    '对比均值: <span style="color:' + vsAvgColor + ';font-weight:600">' + (bm.avgGap >= 0 ? '+' : '') + bm.avgGap + ' 分</span>' +
    '</div>' +
    '</div>';
}

/**
 * Build a weekly digest summarizing key changes, regressions, and improvements
 * over the past 7 days. Designed for executive-level consumption.
 *
 * @param {object} enhancedTrend - From buildEnhancedTrendAnalysis()
 * @param {Array} healthTrend - Full health trend history
 * @param {number} currentScore - Current composite score
 * @returns {string} HTML
 */
export function buildWeeklyDigest(enhancedTrend, healthTrend, currentScore) {
  if (!enhancedTrend || !healthTrend || healthTrend.length < 2) return "";

  var regressing = enhancedTrend.regressingDimensions || [];
  var improving = enhancedTrend.improvingDimensions || [];
  var anomalies = enhancedTrend.anomalies || [];
  var trend = enhancedTrend.trend || {};
  var gradeDist = enhancedTrend.gradeDistribution || {};

  // Calculate week-over-week changes
  var recentEntries = healthTrend.slice(-7);
  var weekChange = 0;
  if (recentEntries.length >= 2) {
    weekChange = currentScore - (recentEntries[0].composite || currentScore);
  }

  // Build digest items
  var digestItems = [];

  // Overall direction
  var directionIcon = trend.direction === "rising" ? "📈" : trend.direction === "falling" ? "📉" : "📊";
  var directionLabel = trend.direction === "rising" ? "持续改善" : trend.direction === "falling" ? "持续退化" : "保持稳定";
  var directionColor = trend.direction === "rising" ? "#22c55e" : trend.direction === "falling" ? "#ef4444" : "var(--yry-text2)";
  digestItems.push({
    icon: directionIcon,
    text: "整体趋势：<b style='color:" + directionColor + "'>" + directionLabel + "</b>，" +
      "周变化 <b style='color:" + (weekChange >= 0 ? "#22c55e" : "#ef4444") + "'>" + (weekChange >= 0 ? "+" : "") + weekChange + " 分</b>，" +
      "斜率 " + (trend.slopePerWeek > 0 ? "+" : "") + (trend.slopePerWeek || 0) + "/周",
  });

  // Grade distribution
  var gradeSummary = [];
  for (var _g = 0, _a = ["A", "B", "C", "D"]; _g < _a.length; _g++) {
    var g = _a[_g];
    if (gradeDist[g] > 0) gradeSummary.push(g + "级 " + gradeDist[g] + " 次");
  }
  if (gradeSummary.length > 0) {
    digestItems.push({
      icon: "📊",
      text: "等级分布：" + gradeSummary.join(" · ") + "（共 " + enhancedTrend.totalEntries + " 次检查）",
    });
  }

  // Regressing dimensions
  if (regressing.length > 0) {
    var regressText = regressing.slice(0, 3).map(function(r) {
      return r.label + "(" + r.slope + "/周)";
    }).join("、");
    digestItems.push({
      icon: "🔴",
      text: "退化维度：<b style='color:#ef4444'>" + regressing.length + " 个</b> — " + regressText + (regressing.length > 3 ? " 等" : ""),
    });
  } else {
    digestItems.push({
      icon: "🟢",
      text: "退化维度：<b style='color:#22c55e'>0 个</b>，所有维度保持稳定或改善",
    });
  }

  // Improving dimensions
  if (improving.length > 0) {
    var improveText = improving.slice(0, 3).map(function(r) {
      return r.label + "(+" + r.slope + "/周)";
    }).join("、");
    digestItems.push({
      icon: "🟢",
      text: "改善维度：<b style='color:#22c55e'>" + improving.length + " 个</b> — " + improveText + (improving.length > 3 ? " 等" : ""),
    });
  }

  // Anomalies
  if (anomalies.length > 0) {
    digestItems.push({
      icon: "⚠️",
      text: "异常检测：<b style='color:#f59e0b'>" + anomalies.length + " 个异常点</b>，建议查看异常告警面板了解详情",
    });
  }

  // Forecast
  if (enhancedTrend.forecast) {
    var fc = enhancedTrend.forecast;
    var fcDir = fc.forecast > currentScore ? "上升" : fc.forecast < currentScore ? "下降" : "持平";
    var fcColor = fc.forecast > currentScore ? "#22c55e" : fc.forecast < currentScore ? "#ef4444" : "var(--yry-text2)";
    digestItems.push({
      icon: "🔮",
      text: "7 天预测：<b style='color:" + fcColor + "'>" + fc.forecast + " 分</b>（" + fcDir + " " + Math.abs(fc.forecast - currentScore) + " 分），置信度 " + (trend.confidence || "low"),
    });
  }

  var digestHtml = digestItems.map(function(item) {
    return '<div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04)">' +
      '<span style="font-size:1rem;flex-shrink:0">' + item.icon + '</span>' +
      '<span style="font-size:.82rem;color:var(--yry-text2);line-height:1.6">' + item.text + '</span>' +
      '</div>';
  }).join("");

  return '<div class="h-section">' +
    '<h2>📋 周度摘要 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">Weekly Digest · 近 7 天关键变化</span></h2>' +
    '<div style="padding:8px 0">' + digestHtml + '</div>' +
    '<div style="margin-top:8px;font-size:.68rem;color:var(--yry-text3);text-align:center">' +
    '基于 ' + enhancedTrend.totalEntries + ' 次历史检查数据分析 · 数据来源: .memory/health-trend.jsonl' +
    '</div>' +
    '</div>';
}
