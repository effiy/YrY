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
  exponentialMA,
  detectTrend,
  forecastScore,
  detectAnomalies,
  scoreDistribution,
  scoreVelocity,
  getGrade,
  classifyScore,
} from "../../../lib/scoring.mjs";

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
