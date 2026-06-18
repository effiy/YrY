/**
 * report-trend — Time utilities and health trend/history functions.
 * Extracted from health-report.mjs for module decomposition.
 */

import { existsSync, readdirSync, readFileSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";

import { REPORT_DIR, DIM_LABELS } from "./report-constants.mjs";
import { nowDate } from "../../../lib/fs.mjs";
import { PASS_THRESHOLD, WARN_THRESHOLD, scoreColor } from "./bot-health-analysis.mjs";

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
