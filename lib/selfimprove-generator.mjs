#!/usr/bin/env node
/**
 * selfimprove-generator — summary.json 生成器
 *
 * 从 .memory/health-trend.jsonl 聚合生成 docs/自我改进/summary.json。
 * 纯数据转换，不运行任何健康检查。
 *
 * 用法:
 *   import { generateSummary } from "./selfimprove-generator.mjs";
 *   generateSummary(projectRoot);
 *
 *   # 或直接 CLI:
 *   node lib/selfimprove-generator.mjs
 */

import { join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";

import { readJsonl, findProjectRoot, isMain, writeJson, fmtDate } from "./fs.mjs";
import { DIAGNOSTIC_LABELS, ARCH_HEALTH_DIM_LABELS } from "./constants.mjs";
import {
  detectTrend,
  detectAnomalies,
  forecastScore,
  scoreVelocity,
  scoreDistribution,
  movingAverage,
} from "./scoring.mjs";

// ── helpers ──────────────────────────────────────────────────────────────

function safeAvg(nums) {
  if (!nums || nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function modeGrade(entries) {
  const cnt = { A: 0, B: 0, C: 0, D: 0 };
  for (const e of entries) {
    if (e.grade) cnt[e.grade] = (cnt[e.grade] || 0) + 1;
  }
  // 按频次降序，同频次取高等级 (A > B > C > D)
  const order = ["A", "B", "C", "D"];
  let best = "C", bestCnt = 0;
  for (const g of order) {
    if (cnt[g] > bestCnt || (cnt[g] === bestCnt && order.indexOf(g) < order.indexOf(best))) {
      best = g;
      bestCnt = cnt[g];
    }
  }
  return best;
}

/** ISO Monday of the week containing dateStr (YYYY-MM-DD) */
function getWeekMonday(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay(); // 0=Sun, 1=Mon
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return fmtDate(d);
}

/** Sunday of the week (Monday + 6) */
function getWeekSunday(mondayStr) {
  const d = new Date(mondayStr + "T00:00:00");
  d.setDate(d.getDate() + 6);
  return fmtDate(d);
}

function getMonthKey(dateStr) {
  return dateStr.slice(0, 7); // "YYYY-MM"
}

/**
 * Compute diag summary for a set of entries.
 * Returns: [{ id, count, label, rate }] sorted by rate desc.
 */
function computeDiagSummary(entries, total) {
  const diagCounts = {};
  for (const e of entries) {
    const diags = e.triggeredDiags || [];
    for (const d of diags) {
      diagCounts[d] = (diagCounts[d] || 0) + 1;
    }
  }
  const totalN = total || entries.length || 1;
  const result = [];
  for (const [id, count] of Object.entries(diagCounts)) {
    result.push({
      id,
      count,
      label: DIAGNOSTIC_LABELS[id] || id,
      rate: Math.round((count / totalN) * 100),
    });
  }
  // Add D0-D8 with zero count
  const seen = new Set(result.map((r) => r.id));
  for (const d of ["D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8"]) {
    if (!seen.has(d)) {
      result.push({ id: d, count: 0, label: DIAGNOSTIC_LABELS[d] || d, rate: 0 });
    }
  }
  result.sort((a, b) => b.rate - a.rate);
  return result;
}

/**
 * Compute dimension averages for a set of entries.
 * Returns a map of dim → { sum, count, min, max }.
 */
function computeDimStats(entries) {
  const stats = {};
  for (const e of entries) {
    const scores = e.scores || {};
    for (const [dim, score] of Object.entries(scores)) {
      if (typeof score !== "number") continue;
      if (!stats[dim]) stats[dim] = { sum: 0, count: 0, min: score, max: score, nums: [] };
      stats[dim].sum += score;
      stats[dim].count++;
      stats[dim].nums.push(score);
      if (score < stats[dim].min) stats[dim].min = score;
      if (score > stats[dim].max) stats[dim].max = score;
    }
  }
  return stats;
}

/**
 * Build period buckets from entries grouped by key.
 * @param {Map<string, Array>} groups — key → entries
 * @param {string} keyField — "date", "week", or "month"
 * @param {Array} sortedKeys — sorted keys
 * @returns {Array} period buckets
 */
function buildPeriodBuckets(groups, keyField, sortedKeys, allEntries) {
  const buckets = [];
  for (let i = 0; i < sortedKeys.length; i++) {
    const key = sortedKeys[i];
    const entries = groups.get(key);
    if (!entries || entries.length === 0) continue;

    const scores = entries.map((e) => e.composite).filter((s) => typeof s === "number");
    const avgScore = safeAvg(scores);
    const minScore = scores.length > 0 ? Math.min(...scores) : 0;
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    const gradeDist = { A: 0, B: 0, C: 0, D: 0 };
    for (const e of entries) {
      if (e.grade) gradeDist[e.grade] = (gradeDist[e.grade] || 0) + 1;
    }
    const topGrade = modeGrade(entries);
    const topDiags = computeDiagSummary(entries).slice(0, 5);

    // Branches
    const branchMap = {};
    for (const e of entries) {
      const br = e.gitBranch || "unknown";
      branchMap[br] = (branchMap[br] || 0) + 1;
    }
    const branches = Object.entries(branchMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    const uncommittedVals = entries
      .map((e) => e.gitUncommitted)
      .filter((v) => typeof v === "number");
    const avgUncommitted = safeAvg(uncommittedVals);

    const dimStats = computeDimStats(entries);
    const dimAvgs = {};
    for (const [dim, stat] of Object.entries(dimStats)) {
      dimAvgs[dim] = safeAvg(stat.nums);
    }

    // Delta vs previous period
    let delta = null;
    if (i > 0) {
      const prevBucket = buckets[i - 1];
      const scoreDiff = avgScore - prevBucket.avgScore;
      const prevGrade = prevBucket.topGrade;
      const gradeChange = topGrade !== prevGrade ? `${prevGrade}→${topGrade}` : null;
      delta = { score: scoreDiff, gradeChange };
    }

    const firstTs = entries[0].timestamp || "";
    const lastTs = entries[entries.length - 1].timestamp || "";

    const bucket = {
      entries: entries.length,
      avgScore,
      minScore,
      maxScore,
      topGrade,
      gradeDist,
      topDiags,
      branches,
      avgUncommitted,
      dimAvgs,
      delta,
      firstTs,
      lastTs,
    };

    if (keyField === "date") {
      bucket.date = key;
    } else if (keyField === "week") {
      bucket.week = key;
      bucket.weekEnd = getWeekSunday(key);
    } else if (keyField === "month") {
      bucket.month = key;
    }

    buckets.push(bucket);
  }
  return buckets;
}

// ── main generator ────────────────────────────────────────────────────────

const SUMMARY_DIR = "docs/自我改进";
const SUMMARY_FILE = join(SUMMARY_DIR, "summary.json");

/**
 * Generate summary.json from .memory/health-trend.jsonl.
 *
 * @param {string} projectRoot - Absolute path to the project root.
 * @returns {{ filePath: string, entryCount: number }}
 */
export function generateSummary(projectRoot) {
  const trendPath = join(projectRoot, ".memory/health-trend.jsonl");
  const entries = readJsonl(trendPath);

  if (entries.length === 0) {
    // Minimal valid summary
    const minimal = {
      updated: new Date().toISOString(),
      totalEntries: 0,
      dateRange: { from: "", to: "" },
      latest: null,
      daily: [],
      weekly: [],
      monthly: [],
      scoreTrend: [],
      diagSummary: [],
      diagLabels: { ...DIAGNOSTIC_LABELS },
      dimSummary: [],
      branchSummary: [],
      signals: [],
    };
    const dir = join(projectRoot, SUMMARY_DIR);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeJson(join(projectRoot, SUMMARY_FILE), minimal);
    return { filePath: join(projectRoot, SUMMARY_FILE), entryCount: 0 };
  }

  // Sort by timestamp ascending
  const sorted = [...entries].sort((a, b) => (a.timestamp || "").localeCompare(b.timestamp || ""));
  const totalEntries = sorted.length;

  // ── latest ──────────────────────────────────────────────────────────
  const last = sorted[sorted.length - 1];
  const latest = {
    timestamp: last.timestamp || "",
    composite: last.composite,
    grade: last.grade,
    scores: last.scores || {},
    bootstrapped: last.bootstrapped || false,
    triggeredDiags: last.triggeredDiags || [],
    gitBranch: last.gitBranch || "",
    gitUncommitted: last.gitUncommitted || 0,
  };

  // ── dateRange ───────────────────────────────────────────────────────
  const firstDate = (sorted[0].timestamp || "").slice(0, 10);
  const lastDate = (last.timestamp || "").slice(0, 10);

  // ── scoreTrend ──────────────────────────────────────────────────────
  const scoreTrend = sorted.map((e) => ({
    date: (e.timestamp || "").slice(0, 10),
    time: (e.timestamp || "").slice(11, 16),
    score: e.composite,
    grade: e.grade,
    triggered: (e.triggeredDiags || []).length,
  }));

  // ── Group by day / week / month ─────────────────────────────────────
  const dayGroups = new Map();
  const weekGroups = new Map();
  const monthGroups = new Map();

  for (const e of sorted) {
    const date = (e.timestamp || "").slice(0, 10);
    if (!date) continue;

    // Day
    if (!dayGroups.has(date)) dayGroups.set(date, []);
    dayGroups.get(date).push(e);

    // Week (ISO Monday as key)
    const mon = getWeekMonday(date);
    if (!weekGroups.has(mon)) weekGroups.set(mon, []);
    weekGroups.get(mon).push(e);

    // Month
    const m = getMonthKey(date);
    if (!monthGroups.has(m)) monthGroups.set(m, []);
    monthGroups.get(m).push(e);
  }

  const dayKeys = [...dayGroups.keys()].sort();
  const weekKeys = [...weekGroups.keys()].sort();
  const monthKeys = [...monthGroups.keys()].sort();

  const daily = buildPeriodBuckets(dayGroups, "date", dayKeys);
  const weekly = buildPeriodBuckets(weekGroups, "week", weekKeys);
  const monthly = buildPeriodBuckets(monthGroups, "month", monthKeys);

  // ── diagSummary (global) ────────────────────────────────────────────
  const diagSummary = computeDiagSummary(sorted);

  // ── dimSummary ──────────────────────────────────────────────────────
  const globalDimStats = computeDimStats(sorted);
  const recentN = sorted.slice(-5);
  const recentDimStats = computeDimStats(recentN);

  const dimLabelMap = {
    token: "Token",
    config: "配置",
    robots: "机器人",
    api: "API",
    reports: "报告",
    format: "格式",
    diagnostics: "诊断",
    git: "Git",
    security: "安全",
    comp_qual: "组件质量",
    em_testing: "测试",
    em_types: "类型",
    em_linting: "检查",
    em_cicd: "CI/CD",
    em_docs: "文档",
    em_deps: "依赖",
    em_git: "Git实践",
    ...ARCH_HEALTH_DIM_LABELS,
  };

  const dimSummary = [];
  const allDimKeys = Object.keys(globalDimStats).sort();
  for (const dim of allDimKeys) {
    const gs = globalDimStats[dim];
    const rs = recentDimStats[dim];
    const avgScore = safeAvg(gs.nums);
    const recentAvg = rs ? safeAvg(rs.nums) : avgScore;
    // Trend: recent avg vs older avg (entries before the last 5)
    const olderEntries = sorted.slice(0, Math.max(0, sorted.length - 5));
    const olderStats = computeDimStats(olderEntries);
    const olderAvg = olderStats[dim] ? safeAvg(olderStats[dim].nums) : avgScore;
    const trend = Math.round(recentAvg - olderAvg);

    dimSummary.push({
      dim,
      label: dimLabelMap[dim] || dim,
      avgScore,
      recentAvg,
      entries: gs.count,
      min: gs.min,
      max: gs.max,
      trend,
    });
  }

  // ── branchSummary ───────────────────────────────────────────────────
  const branchMap = {};
  for (const e of sorted) {
    const br = e.gitBranch || "unknown";
    if (!branchMap[br]) branchMap[br] = { scores: [], uncommitted: [] };
    if (typeof e.composite === "number") branchMap[br].scores.push(e.composite);
    if (typeof e.gitUncommitted === "number") branchMap[br].uncommitted.push(e.gitUncommitted);
  }
  const branchSummary = Object.entries(branchMap)
    .map(([name, data]) => ({
      name,
      count: data.scores.length,
      avgScore: safeAvg(data.scores),
      avgUncommitted: safeAvg(data.uncommitted),
    }))
    .sort((a, b) => b.count - a.count);

  // ── signals ─────────────────────────────────────────────────────────
  const signals = [];

  // Warning: diagnostic trigger rate > 50%
  for (const d of diagSummary) {
    if (d.count > 0 && d.rate >= 50) {
      signals.push({
        type: "warning",
        msg: `${d.id} ${d.label} 触发率 ${d.rate}%`,
        icon: "⚠️",
      });
    }
  }

  // Regression: dimension avg < 40 and negative trend (or falling with confidence)
  for (const d of dimSummary) {
    if (d.avgScore < 40 && d.trend < -3) {
      signals.push({
        type: "regression",
        msg: `${d.label} 维度持续偏低 (${d.avgScore}分)`,
        icon: "🔻",
      });
    }
  }

  // Improvement: dimension with strong positive trend
  for (const d of dimSummary) {
    if (d.trend > 10) {
      signals.push({
        type: "improvement",
        msg: `${d.label} 改善 +${d.trend}`,
        icon: "📈",
      });
    }
  }

  // ── Enhanced signals (from lib/scoring.mjs) ─────────────────────────
  const composites = sorted.map(e => e.composite).filter(s => typeof s === "number");
  if (composites.length >= 3) {
    const fullTrend = detectTrend(composites);
    const velocity = scoreVelocity(composites);
    const forecast = forecastScore(composites);
    const anomalies = detectAnomalies(composites);
    const sma = movingAverage(composites, Math.min(7, composites.length));
    const dist = scoreDistribution(composites);

    // Trend direction signal
    if (fullTrend.direction === "falling" && fullTrend.confidence !== "low") {
      signals.push({
        type: "regression",
        msg: `综合评分呈下降趋势 (${fullTrend.slopePerWeek > 0 ? "+" : ""}${fullTrend.slopePerWeek}/周, R²=${fullTrend.r2})`,
        icon: "📉",
      });
    }
    if (fullTrend.direction === "rising" && fullTrend.confidence !== "low") {
      signals.push({
        type: "improvement",
        msg: `综合评分持续上升 (${fullTrend.slopePerWeek > 0 ? "+" : ""}${fullTrend.slopePerWeek}/周, R²=${fullTrend.r2})`,
        icon: "📈",
      });
    }

    // Acceleration warning
    if (velocity.accelerating && velocity.recent < 0) {
      signals.push({
        type: "warning",
        msg: `评分下降正在加速 (近期 ${velocity.recent} 分, 周均 ${velocity.weekly} 分)`,
        icon: "⚠️",
      });
    }

    // Anomaly detection
    if (anomalies.length > 0) {
      const anomalyDates = anomalies.map(i => {
        const entry = sorted[i];
        return entry ? (entry.timestamp || "").slice(0, 10) : "";
      }).filter(Boolean);
      signals.push({
        type: "warning",
        msg: `检测到 ${anomalies.length} 个异常评分点: ${anomalyDates.slice(0, 3).join(", ")}`,
        icon: "🔍",
      });
    }
  }

  // Add enhanced trend data to summary output
  const enhancedTrend = composites.length >= 3 ? {
    trend: detectTrend(composites),
    forecast: forecastScore(composites),
    velocity: scoreVelocity(composites),
    distribution: scoreDistribution(composites),
    sma7: movingAverage(composites, Math.min(7, composites.length)).filter(v => v !== null),
    anomalies: detectAnomalies(composites).map(i => ({
      index: i,
      value: composites[i],
      date: (sorted[i]?.timestamp || "").slice(0, 10),
    })),
  } : null;

  // ── componentHealth ─────────────────────────────────────────────────
  let componentHealth = null;
  if (last.compScoreSummary) {
    const cs = last.compScoreSummary;
    const comps = [cs.skills, cs.agents, cs.rules, cs.scripts].filter(Boolean);
    const allScores = comps.flatMap((c) => (c.avgScore !== undefined ? [c.avgScore] : []));
    const totalComponents = comps.reduce((s, c) => s + (c.count || 0), 0);

    // Component-level trends: compare last 5 entries vs older
    const withCompData = sorted.filter(e => e.compScoreSummary);
    const compRecent = withCompData.slice(-5);
    const compOlder = withCompData.slice(0, Math.max(0, withCompData.length - 5));

    const compTypeTrends = {};
    for (const type of ["skills", "agents", "rules", "scripts"]) {
      const recentScores = compRecent
        .map(e => e.compScoreSummary?.[type]?.avgScore)
        .filter(s => typeof s === "number");
      const olderScores = compOlder
        .map(e => e.compScoreSummary?.[type]?.avgScore)
        .filter(s => typeof s === "number");
      const recentAvg = safeAvg(recentScores);
      const olderAvg = safeAvg(olderScores);
      compTypeTrends[type] = {
        recentAvg,
        olderAvg,
        trend: Math.round(recentAvg - olderAvg),
        recentEntries: recentScores.length,
        totalEntries: recentScores.length + olderScores.length,
      };
    }

    componentHealth = {
      skills: cs.skills || null,
      agents: cs.agents || null,
      rules: cs.rules || null,
      scripts: cs.scripts || null,
      overallAvg: safeAvg(allScores),
      totalComponents,
      trends: compTypeTrends,
    };
  }

  // ── Assemble ────────────────────────────────────────────────────────
  const summary = {
    updated: new Date().toISOString(),
    totalEntries,
    dateRange: { from: firstDate, to: lastDate },
    latest,
    daily,
    weekly,
    monthly,
    scoreTrend,
    diagSummary,
    diagLabels: { ...DIAGNOSTIC_LABELS },
    dimSummary,
    branchSummary,
    signals,
  };

  if (componentHealth) {
    summary.componentHealth = componentHealth;
  }

  if (enhancedTrend) {
    summary.enhancedTrend = enhancedTrend;
  }

  // ── archHealth ──────────────────────────────────────────────────────
  const archTrendPath = join(projectRoot, ".memory", "arch-trend.jsonl");
  const archEntries = readJsonl(archTrendPath);
  if (archEntries.length > 0) {
    const archLast = archEntries[archEntries.length - 1];
    const archScores = archLast.archScores || {};

    // Compute arch dimension trends over last 5 entries
    const archRecent = archEntries.slice(-5);
    const archDimTrends = {};
    for (const dim of Object.keys(ARCH_HEALTH_DIM_LABELS)) {
      const recentScores = archRecent
        .map((e) => (e.archScores && e.archScores[dim]) || null)
        .filter((s) => s !== null);
      const avg = safeAvg(recentScores);
      const older = archEntries.slice(0, Math.max(0, archEntries.length - 5));
      const olderScores = older
        .map((e) => (e.archScores && e.archScores[dim]) || null)
        .filter((s) => s !== null);
      const olderAvg = safeAvg(olderScores);
      archDimTrends[dim] = {
        label: ARCH_HEALTH_DIM_LABELS[dim] || dim,
        recentAvg: avg,
        trend: Math.round(avg - olderAvg),
      };
    }

    summary.archHealth = {
      latest: {
        timestamp: archLast.timestamp || "",
        composite: archLast.archComposite,
        grade: archLast.archGrade,
        scores: archScores,
        failedDims: archLast.archFailedDims || [],
        totalChecks: archLast.totalChecks,
        passedChecks: archLast.passedChecks,
      },
      totalEntries: archEntries.length,
      dimTrends: archDimTrends,
    };
  }

  // ── Write ───────────────────────────────────────────────────────────
  const dir = join(projectRoot, SUMMARY_DIR);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const filePath = join(projectRoot, SUMMARY_FILE);
  writeJson(filePath, summary);

  return { filePath, entryCount: totalEntries };
}

// ── CLI entry ────────────────────────────────────────────────────────────

const _isMain = isMain(import.meta.url);
if (_isMain) {
  const root = findProjectRoot(process.cwd());
  const result = generateSummary(root);
  console.log(`[selfimprove] summary.json 已生成: ${result.filePath} (${result.entryCount} 条记录)`);
}
