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
import { scoreColor } from "./bot-health-analysis.mjs";
import {
  movingAverage,
  detectTrend,
  forecastScore,
  detectAnomalies,
  scoreDistribution,
  scoreVelocity,
  getGrade,
} from "../../../lib/scoring.mjs";

function exponentialMA(/** @type {number[]} */ history, /** @type {number} */ alpha = 0.3) {
  if (history.length === 0) return [];
  const result = [history[0]];
  for (let i = 1; i < history.length; i++) {
    result.push(Math.round(alpha * history[i] + (1 - alpha) * result[i - 1]));
  }
  return result;
}

function pearsonCorrelation(/** @type {number[]} */ xs, /** @type {number[]} */ ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return 0;

  const xMean = xs.slice(0, n).reduce((/** @type {number} */ a, /** @type {number} */ b) => a + b, 0) / n;
  const yMean = ys.slice(0, n).reduce((/** @type {number} */ a, /** @type {number} */ b) => a + b, 0) / n;

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
  const p = (/** @type {number} */ n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}年${p(d.getMonth() + 1)}月${p(d.getDate())}日 ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function extractReportMeta(/** @type {string} */ filename) {
  const match = filename.match(/^health-(\d{4}-\d{2}-\d{2})(?:-(\d{6}))?\.html$/);
  if (!match) return null;
  const [, date, timeRaw = ""] = match;
  const time = timeRaw
    ? `${timeRaw.slice(0, 2)}:${timeRaw.slice(2, 4)}:${timeRaw.slice(4, 6)}`
    : "—";
  return { file: filename, date, time, timeRaw };
}

export function compareReportMeta(/** @type {any} */ a, /** @type {any} */ b) {
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
    .filter((/** @type {string} */ f) => f.endsWith(".html") && f !== "index.html")
    .map((/** @type {string} */ file) => {
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

export function pickLatestReportsByDate(/** @type {any[]} */ files) {
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

export function removeReportsForDate(/** @type {string} */ date, /** @type {string} */ keepFile = "") {
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
      .filter((/** @type {any} */ f) => f.date !== today);
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
    return readFileSync(trendPath, "utf-8").trim().split("\n").filter(Boolean).map((/** @type {string} */ l) => {
      try { return JSON.parse(l); } catch { return null; }
    }).filter(Boolean);
  } catch {
    return [];
  }
}

export function buildGradeSparkline(/** @type {any[]} */ history) {
  if (history.length < 2) return "";

  /** @type {Record<string, string>} */
  const gradeColors = { A: "#22c55e", B: "#22c55e", C: "#f59e0b", D: "#ef4444" };
  const sampled = history.length <= 20 ? history : history.filter((/** @type {any} */ _, /** @type {number} */ i) => i % Math.ceil(history.length / 20) === 0 || i === history.length - 1);
  const dots = sampled.map((/** @type {any} */ h, /** @type {number} */ i) => {
    const color = gradeColors[h.grade] || "#666";
    const last = i === sampled.length - 1;
    const size = last ? "10px" : "6px";
    return `<span class="h-grade-dot" style="--color:${color};--size:${size}" title="${h.grade} 级 · ${h.composite} 分 · ${h.timestamp?.slice(0,10) || ""}"></span>`;
  }).join("");

  return `<div class="h-grade-spark">${dots}</div>`;
}

export function getDimensionHistory() {
  /** @type {Record<string, any[]>} */
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
      .filter((/** @type {string} */ f) => f.endsWith(".html") && f !== "index.html")
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

export function dimTrendIcon(/** @type {string} */ dimLabel, /** @type {number} */ currentScore, /** @type {Record<string, any[]>} */ history) {
  const dimHistory = history[dimLabel] || [];
  if (dimHistory.length < 2) return "";

  const prev = dimHistory[dimHistory.length - 2];
  if (!prev || prev.score === undefined) return "";

  const diff = currentScore - prev.score;
  if (diff > 5) return `<span class="h-trend up" title="提升 ${diff} 分">↑${diff}</span>`;
  if (diff < -5) return `<span class="h-trend down" title="下降 ${Math.abs(diff)} 分">↓${Math.abs(diff)}</span>`;
  return '<span class="h-trend stable" title="持平">→</span>';
}

export function dimSparkline(/** @type {string} */ dimLabel, /** @type {Record<string, any[]>} */ history) {
  const dimHistory = history[dimLabel] || [];
  if (dimHistory.length < 2) return "";

  const scores = dimHistory.map((/** @type {any} */ h) => h.score);
  const max = Math.max(...scores, 100);
  const bars = scores.map((/** @type {number} */ s) => {
    const h = Math.max(2, Math.round((s / max) * 16));
    const color = scoreColor(s);
    return `<span class="h-spark-bar" style="--h:${h}px;--color:${color}" title="${s} 分"></span>`;
  }).join("");

  return `<div class="h-sparkline">${bars}</div>`;
}

// ── Enhanced trend analysis (powered by lib/scoring.mjs) ─────────

/**
 * Build enhanced trend analysis from health history.
 * Returns professional-grade statistics for the report.
 *
 * @param {any[]} history - Health trend entries
 * @returns {any} Enhanced analysis data for HTML rendering
 */
export function buildEnhancedTrendAnalysis(/** @type {any[]} */ history) {
  if (!history || history.length < 2) return null;

  const composites = history.map((/** @type {any} */ h) => h.composite).filter((/** @type {any} */ s) => typeof s === "number");
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
  /** @type {Record<string, number>} */
  const gradeCounts = { A: 0, B: 0, C: 0, D: 0 };
  for (const h of history) {
    const g = getGrade(h.composite || 0);
    if (gradeCounts[g.grade] !== undefined) gradeCounts[g.grade]++;
  }

  // Dimension-level trends
  /** @type {Record<string, any>} */
  const dimTrends = {};
  const dimHistory = getDimensionHistory();
  for (const [label, points] of Object.entries(dimHistory)) {
    if (points.length >= 3) {
      const scores = points.map((/** @type {any} */ p) => p.score);
      dimTrends[label] = {
        trend: detectTrend(scores),
        current: scores[scores.length - 1],
        prev: scores[scores.length - 2] || scores[scores.length - 1],
        dist: scoreDistribution(scores),
      };
    }
  }

  // Identify regressing and improving dimensions
  /** @type {any[]} */
  const regressing = [];
  /** @type {any[]} */
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
 * @param {any} analysis - From buildEnhancedTrendAnalysis()
 * @returns {string} HTML
 */
export function buildTrendSummaryHTML(/** @type {any} */ analysis) {
  if (!analysis) return "";

  const { trend, velocity, forecast, gradeDistribution } = analysis;

  const trendIcon = trend.direction === "rising" ? "📈"
    : trend.direction === "falling" ? "📉" : "📊";
  const trendLabel = trend.direction === "rising" ? "上升趋势"
    : trend.direction === "falling" ? "下降趋势" : "保持稳定";
  const trendTier = trend.direction === "rising" ? "up"
    : trend.direction === "falling" ? "down" : "flat";

  const velIcon = velocity.recent > 0 ? "↗" : velocity.recent < 0 ? "↘" : "→";
  const accelNote = velocity.accelerating
    ? `<span class="h-rt-warn">⚠ 趋势正在加速</span>`
    : "";

  return `
  <div class="h-rt-summary">
    <div class="h-rt-title">📊 趋势分析摘要</div>
    <div class="h-rt-grid">
      <div class="h-rt-card">
        <div class="h-rt-icon">${trendIcon}</div>
        <div class="h-rt-card-val ${trendTier}">${trendLabel}</div>
        <div class="h-rt-meta">斜率: ${trend.slopePerWeek > 0 ? "+" : ""}${trend.slopePerWeek} 分/周</div>
        <div class="h-rt-meta">置信度: ${trend.confidence === "high" ? "高" : trend.confidence === "medium" ? "中" : "低"} (R²=${trend.r2})</div>
      </div>
      <div class="h-rt-card">
        <div class="h-rt-icon">${velIcon}</div>
        <div class="h-rt-card-val">近期变化: ${velocity.recent > 0 ? "+" : ""}${velocity.recent} 分</div>
        <div class="h-rt-meta">周均变化: ${velocity.weekly > 0 ? "+" : ""}${velocity.weekly} 分</div>
        ${accelNote}
      </div>
      <div class="h-rt-card">
        <div class="h-rt-icon">🔮</div>
        <div class="h-rt-card-val">预测: ${forecast.forecast} 分</div>
        <div class="h-rt-meta">区间: ${forecast.range[0]}–${forecast.range[1]} 分</div>
        <div class="h-rt-meta">7天后预测值</div>
      </div>
      <div class="h-rt-card">
        <div class="h-rt-card-val as-label">评级分布</div>
        <div class="h-rt-grade-dist">
          ${Object.entries(gradeDistribution).map(([g, c]) =>
            `<span class="h-rt-grade-chip ${g}">${g}: ${c}</span>`
          ).join("")}
        </div>
        <div class="h-rt-meta with-top">历史 ${analysis.totalEntries} 次检查</div>
      </div>
    </div>
    ${analysis.regressingDimensions.length > 0 ? `
    <div class="h-rt-regress">
      <span class="h-rt-regress-label">⚠ 退化维度:</span>
      ${analysis.regressingDimensions.map((/** @type {any} */ d) =>
        `<span class="h-rt-dim-slope">${d.label} <span class="h-rt-dim-slope regress">${d.slope > 0 ? "+" : ""}${d.slope}/周</span></span>`
      ).join("")}
    </div>` : ""}
    ${analysis.improvingDimensions.length > 0 ? `
    <div class="h-rt-improve">
      <span class="h-rt-improve-label">✅ 改善维度:</span>
      ${analysis.improvingDimensions.map((/** @type {any} */ d) =>
        `<span class="h-rt-dim-slope">${d.label} <span class="h-rt-dim-slope improve">+${d.slope}/周</span></span>`
      ).join("")}
    </div>` : ""}
  </div>`;
}

/**
 * Build anomaly alert HTML for the enhanced report.
 *
 * @param {any} analysis - From buildEnhancedTrendAnalysis()
 * @returns {string} HTML
 */
export function buildAnomalyAlertHTML(/** @type {any} */ analysis) {
  if (!analysis || !analysis.anomalies || analysis.anomalies.length === 0) return "";

  return `
  <div class="h-rt-anomaly">
    <span class="h-rt-anomaly-label">🔍 检测到 ${analysis.anomalies.length} 个异常评分点:</span>
    ${analysis.anomalies.slice(0, 5).map((/** @type {any} */ a) =>
      `<span class="h-rt-anomaly-item">${a.date || "—"}: <b>${a.value}</b> 分</span>`
    ).join("")}
    <span class="h-rt-anomaly-hint">(偏离典型值超过 3.5× 中位绝对偏差)</span>
  </div>`;
}

// ── Dimension correlation matrix ────────────────────────────────

/**
 * Build a correlation matrix between health dimensions using historical data.
 * Uses Pearson correlation on per-dimension score histories.
 *
 * @param {Record<string, any[]>} dimHistory - From getDimensionHistory() — { label: [{date, score}] }
 * @param {string[]} [focusDims] - Optional subset of dimension labels to include
 * @returns {{ matrix: number[][], labels: string[], insights: string[] } | null}
 */
export function buildCorrelationMatrix(/** @type {Record<string, any[]>} */ dimHistory, /** @type {string[]} */ focusDims) {
  // Collect labels that have enough data points
  let candidates = Object.entries(dimHistory)
    .filter((e) => e[1].length >= 3)
    .map((e) => e[0]);

  if (focusDims && focusDims.length > 0) {
    candidates = candidates.filter((l) => focusDims.indexOf(l) >= 0);
  }

  if (candidates.length < 3) return null;

  // Align scores by date
  /** @type {Record<string, Record<string, number>>} */
  const dateMap = {};
  for (const label of candidates) {
    const points = dimHistory[label] || [];
    for (const p of points) {
      if (!dateMap[p.date]) dateMap[p.date] = {};
      dateMap[p.date][label] = p.score;
    }
  }

  // Build aligned score arrays
  const dates = Object.keys(dateMap).sort();
  /** @type {Record<string, (number | null)[]>} */
  const scoreArrays = {};
  for (const c of candidates) scoreArrays[c] = [];

  for (const d of dates) {
    const row = dateMap[d];
    for (const lbl of candidates) {
      scoreArrays[lbl].push(row[lbl] !== undefined ? row[lbl] : null);
    }
  }

  // Compute correlation matrix
  const n = candidates.length;
  /** @type {number[][]} */
  const matrix = [];
  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1.0;
      } else if (j < i) {
        matrix[i][j] = matrix[j][i]; // symmetric
      } else {
        /** @type {number[]} */ const xs = [];
        /** @type {number[]} */ const ys = [];
        const arrI = scoreArrays[candidates[i]];
        const arrJ = scoreArrays[candidates[j]];
        for (let k = 0; k < arrI.length; k++) {
          if (arrI[k] !== null && arrJ[k] !== null) {
            xs.push(arrI[k] ?? 0);
            ys.push(arrJ[k] ?? 0);
          }
        }
        matrix[i][j] = xs.length >= 3 ? pearsonCorrelation(xs, ys) : 0;
      }
    }
  }

  // Generate insights
  const strongPairs = [];
  for (let _f = 0; _f < n; _f++) {
    for (let _g = _f + 1; _g < n; _g++) {
      const r = matrix[_f][_g];
      if (Math.abs(r) >= 0.7) {
        strongPairs.push({
          a: candidates[_f], b: candidates[_g], r,
          direction: r > 0 ? '正相关' : '负相关',
        });
      }
    }
  }
  strongPairs.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));

  const insights = strongPairs.slice(0, 5).map((sp) => {
    const strength = Math.abs(sp.r) >= 0.85 ? '强' : '显著';
    const rel = sp.r > 0
      ? strength + '正相关 (r=' + sp.r.toFixed(2) + ') — 改善一方可带动另一方'
      : strength + '负相关 (r=' + sp.r.toFixed(2) + ') — 存在权衡关系';
    return sp.a + ' ↔ ' + sp.b + ': ' + rel;
  });

  return { matrix, labels: candidates, insights };
}

// ── Historical benchmarking ──────────────────────────────────────

/**
 * Compute historical benchmarks from trend data.
 * Compares current score against best, worst, and average periods.
 *
 * @param {any[]} history - Health trend entries
 * @param {number} currentComposite - Current composite score
 * @returns {{ best: any, worst: any, avg: number, percentile: number, periodLabel: string, bestGap: number, avgGap: number, totalSamples: number } | null}
 */
export function buildHistoricalBenchmarks(/** @type {any[]} */ history, /** @type {number} */ currentComposite) {
  if (!history || history.length < 2) return null;

  const composites = history.map((/** @type {any} */ h) => h.composite).filter((/** @type {any} */ s) => typeof s === "number");
  if (composites.length < 2) return null;

  /** @type {any} */ let best = null;
  /** @type {any} */ let worst = null;
  let sum = 0;
  for (const h of history) {
    const s = h.composite;
    if (typeof s !== "number") continue;
    sum += s;
    if (!best || s > best.score) best = { score: s, date: (h.timestamp || "").slice(0, 10), grade: h.grade || "" };
    if (!worst || s < worst.score) worst = { score: s, date: (h.timestamp || "").slice(0, 10), grade: h.grade || "" };
  }

  const avg = Math.round(sum / composites.length);

  // Percentile rank: what % of historical scores are below current
  const below = composites.filter((s) => s < currentComposite).length;
  const percentile = Math.round((below / composites.length) * 100);

  // Period labels
  const days = history.length; // approximate data points as daily
  const periodLabel = days <= 7 ? "近7天" : days <= 30 ? "近30天" : days <= 90 ? "近90天" : "全部历史";

  // Best/average gap
  const bestGap = currentComposite - (best ? best.score : currentComposite);
  const avgGap = currentComposite - avg;

  return {
    best,
    worst,
    avg,
    percentile,
    bestGap,
    avgGap,
    totalSamples: composites.length,
    periodLabel,
  };
}

/**
 * Build benchmarking HTML for the report.
 *
 * @param {any} benchmarks - From buildHistoricalBenchmarks()
 * @returns {string} HTML
 */
export function buildBenchmarkHTML(/** @type {any} */ benchmarks) {
  if (!benchmarks || benchmarks.totalSamples < 2) return "";

  const bm = benchmarks;
  const vsBest = bm.bestGap >= 0 ? '达到历史最佳' : '距最佳差 ' + Math.abs(bm.bestGap) + ' 分';
  const vsBestTier = bm.bestGap >= 0 ? 'pass' : bm.bestGap >= -5 ? 'warn' : 'fail';
  const vsAvgTier = bm.avgGap >= 0 ? 'up' : 'down';
  const percentileTier = bm.percentile >= 75 ? 'pct-pass' : bm.percentile >= 50 ? 'pct-warn' : 'pct-fail';

  return `<div class="h-section">
<h2>📊 历史基准对比 <span class="h-section-sub-inline">${bm.periodLabel} · ${bm.totalSamples} 次检查</span></h2>
<div class="h-rt-bench-grid">
<div class="h-rt-bench-cell">
<div class="h-rt-bench-lbl">历史最佳</div>
<div class="h-rt-bench-val best">${bm.best.score}</div>
<div class="h-rt-bench-sub">${bm.best.date} · ${bm.best.grade}级</div>
</div>
<div class="h-rt-bench-cell">
<div class="h-rt-bench-lbl">历史平均</div>
<div class="h-rt-bench-val avg">${bm.avg}</div>
<div class="h-rt-bench-sub">${bm.totalSamples} 次均值</div>
</div>
<div class="h-rt-bench-cell">
<div class="h-rt-bench-lbl">历史最差</div>
<div class="h-rt-bench-val worst">${bm.worst.score}</div>
<div class="h-rt-bench-sub">${bm.worst.date} · ${bm.worst.grade}级</div>
</div>
<div class="h-rt-bench-cell">
<div class="h-rt-bench-lbl">百分位</div>
<div class="h-rt-bench-val ${percentileTier}">P${bm.percentile}</div>
<div class="h-rt-bench-sub">超越 ${bm.percentile}% 历史记录</div>
</div>
</div>
<div class="h-rt-bench-foot">
📊 对比最佳: <span class="h-rt-bench-delta ${vsBestTier}">${vsBest}</span> · 对比均值: <span class="h-rt-bench-delta ${vsAvgTier}">${bm.avgGap >= 0 ? '+' : ''}${bm.avgGap} 分</span>
</div>
</div>`;
}

/**
 * Build a weekly digest summarizing key changes, regressions, and improvements
 * over the past 7 days. Designed for executive-level consumption.
 *
 * @param {any} enhancedTrend - From buildEnhancedTrendAnalysis()
 * @param {any[]} healthTrend - Full health trend history
 * @param {number} currentScore - Current composite score
 * @returns {string} HTML
 */
export function buildWeeklyDigest(/** @type {any} */ enhancedTrend, /** @type {any[]} */ healthTrend, /** @type {number} */ currentScore) {
  if (!enhancedTrend || !healthTrend || healthTrend.length < 2) return "";

  const { regressing = [], improving = [], anomalies = [], trend = {}, gradeDistribution: gradeDist = {}, forecast, totalEntries } = enhancedTrend;

  // Calculate week-over-week changes
  const recentEntries = healthTrend.slice(-7);
  let weekChange = 0;
  if (recentEntries.length >= 2) {
    weekChange = currentScore - (recentEntries[0].composite || currentScore);
  }

  // Build digest items
  const digestItems = [];

  // Overall direction
  const directionIcon = trend.direction === "rising" ? "📈" : trend.direction === "falling" ? "📉" : "📊";
  const directionLabel = trend.direction === "rising" ? "持续改善" : trend.direction === "falling" ? "持续退化" : "保持稳定";
  const directionTier = trend.direction === "rising" ? "up" : trend.direction === "falling" ? "down" : "flat";
  const weekChangeTier = weekChange >= 0 ? "up" : "down";
  digestItems.push({
    icon: directionIcon,
    text: `整体趋势：<b class='h-rt-b ${directionTier}'>${directionLabel}</b>，周变化 <b class='h-rt-b ${weekChangeTier}'>${weekChange >= 0 ? "+" : ""}${weekChange} 分</b>，斜率 ${trend.slopePerWeek > 0 ? "+" : ""}${trend.slopePerWeek || 0}/周`,
  });

  // Grade distribution
  const gradeSummary = ["A", "B", "C", "D"]
    .filter((g) => gradeDist[g] > 0)
    .map((g) => g + "级 " + gradeDist[g] + " 次");
  if (gradeSummary.length > 0) {
    digestItems.push({
      icon: "📊",
      text: "等级分布：" + gradeSummary.join(" · ") + "（共 " + totalEntries + " 次检查）",
    });
  }

  // Regressing dimensions
  if (regressing.length > 0) {
    const regressText = regressing.slice(0, 3).map((/** @type {any} */ r) => r.label + "(" + r.slope + "/周)").join("、");
    digestItems.push({
      icon: "🔴",
      text: "退化维度：<b class='h-rt-b down'>" + regressing.length + " 个</b> — " + regressText + (regressing.length > 3 ? " 等" : ""),
    });
  } else {
    digestItems.push({
      icon: "🟢",
      text: "退化维度：<b class='h-rt-b up'>0 个</b>，所有维度保持稳定或改善",
    });
  }

  // Improving dimensions
  if (improving.length > 0) {
    const improveText = improving.slice(0, 3).map((/** @type {any} */ r) => r.label + "(+" + r.slope + "/周)").join("、");
    digestItems.push({
      icon: "🟢",
      text: "改善维度：<b class='h-rt-b up'>" + improving.length + " 个</b> — " + improveText + (improving.length > 3 ? " 等" : ""),
    });
  }

  // Anomalies
  if (anomalies.length > 0) {
    digestItems.push({
      icon: "⚠️",
      text: "异常检测：<b class='h-rt-b warn'>" + anomalies.length + " 个异常点</b>，建议查看异常告警面板了解详情",
    });
  }

  // Forecast
  if (forecast) {
    const fcDir = forecast.forecast > currentScore ? "上升" : forecast.forecast < currentScore ? "下降" : "持平";
    const fcTier = forecast.forecast > currentScore ? "up" : forecast.forecast < currentScore ? "down" : "flat";
    digestItems.push({
      icon: "🔮",
      text: "7 天预测：<b class='h-rt-b " + fcTier + "'>" + forecast.forecast + " 分</b>（" + fcDir + " " + Math.abs(forecast.forecast - currentScore) + " 分），置信度 " + (trend.confidence || "low"),
    });
  }

  const digestHtml = digestItems.map((item) =>
    `<div class="h-rt-digest-row">
<span class="h-rt-digest-icon">${item.icon}</span>
<span class="h-rt-digest-text">${item.text}</span>
</div>`
  ).join("");

  return `<div class="h-section">
<h2>📋 周度摘要 <span class="h-section-sub-inline">Weekly Digest · 近 7 天关键变化</span></h2>
<div class="h-rt-digest-body">${digestHtml}</div>
<div class="h-rt-digest-foot">
基于 ${totalEntries} 次历史检查数据分析 · 数据来源: .memory/health-trend.jsonl
</div>
</div>`;
}
