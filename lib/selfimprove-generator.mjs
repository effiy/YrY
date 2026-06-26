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
import { DIAGNOSTIC_LABELS, ARCH_HEALTH_DIM_LABELS, HEALTH_GRADE_THRESHOLDS, DIAGNOSTIC_DIMENSION_MAP, HEALTH_SCORING_DIMENSIONS } from "./constants.mjs";
import {
  detectTrend,
  detectAnomalies,
  forecastScore,
  scoreVelocity,
  scoreDistribution,
  movingAverage,
  scoreReliability,
  periodComparison,
  spiderChartData,
  dimensionBreakdown,
  crossDimensionCorrelation,
  confidenceAdjustedComposite,
  improvementPotentialRanking,
  quickWins,
  scoreStabilization,
} from "./scoring.mjs";

// ── helpers ──────────────────────────────────────────────────────────────

/** @param {number[]} nums */
function safeAvg(nums) {
  if (!nums || nums.length === 0) return 0;
  return Math.round(nums.reduce((/** @type {number} */ a, /** @type {number} */ b) => a + b, 0) / nums.length);
}

/** @param {Array<any>} entries */
function modeGrade(entries) {
  /** @type {Record<string, number>} */
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

/** ISO Monday of the week containing dateStr (YYYY-MM-DD)
 * @param {string} dateStr
 */
function getWeekMonday(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay(); // 0=Sun, 1=Mon
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return fmtDate(d);
}

/** Sunday of the week (Monday + 6)
 * @param {string} mondayStr
 */
function getWeekSunday(mondayStr) {
  const d = new Date(mondayStr + "T00:00:00");
  d.setDate(d.getDate() + 6);
  return fmtDate(d);
}

/** @param {string} dateStr */
function getMonthKey(dateStr) {
  return dateStr.slice(0, 7); // "YYYY-MM"
}

/**
 * Compute diag summary for a set of entries.
 * Returns: [{ id, count, label, rate }] sorted by rate desc.
 * @param {Array<any>} entries
 * @param {number} [total]
 */
function computeDiagSummary(entries, total) {
  /** @type {Record<string, number>} */
  const diagCounts = {};
  for (const e of entries) {
    const diags = e.triggeredDiags || [];
    for (const d of diags) {
      diagCounts[d] = (diagCounts[d] || 0) + 1;
    }
  }
  const totalN = total || entries.length || 1;
  const result = [];
  /** @type {Record<string, string>} */
  const diagLabels = DIAGNOSTIC_LABELS;
  for (const [id, count] of Object.entries(diagCounts)) {
    result.push({
      id,
      count,
      label: diagLabels[id] || id,
      rate: Math.round((count / totalN) * 100),
    });
  }
  // Add D0-D8 with zero count
  const seen = new Set(result.map((r) => r.id));
  for (const d of ["D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8"]) {
    if (!seen.has(d)) {
      result.push({ id: d, count: 0, label: diagLabels[d] || d, rate: 0 });
    }
  }
  result.sort((a, b) => b.rate - a.rate);
  return result;
}

/**
 * Compute dimension averages for a set of entries.
 * Returns a map of dim → { sum, count, min, max }.
 * @param {Array<any>} entries
 */
function computeDimStats(entries) {
  /** @type {Record<string, any>} */
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
 * @param {Map<string, any[]>} groups — key → entries
 * @param {string} keyField — "date", "week", or "month"
 * @param {string[]} sortedKeys — sorted keys
 * @param {Array<any>=} _allEntries — unused, retained for signature stability
 * @returns {any[]} period buckets
 */
function buildPeriodBuckets(groups, keyField, sortedKeys, _allEntries) {
  /** @type {any[]} */
  const buckets = [];
  for (let i = 0; i < sortedKeys.length; i++) {
    const key = sortedKeys[i];
    const entries = groups.get(key);
    if (!entries || entries.length === 0) continue;

    const scores = entries.map((e) => e.composite).filter((s) => typeof s === "number");
    const avgScore = safeAvg(scores);
    const minScore = scores.length > 0 ? Math.min(...scores) : 0;
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    /** @type {Record<string, number>} */
    const gradeDist = { A: 0, B: 0, C: 0, D: 0 };
    for (const e of entries) {
      if (e.grade) gradeDist[e.grade] = (gradeDist[e.grade] || 0) + 1;
    }
    const topGrade = modeGrade(entries);
    const topDiags = computeDiagSummary(entries).slice(0, 5);

    // Branches
    /** @type {Record<string, number>} */
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
    /** @type {Record<string, number>} */
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

    /** @type {any} */
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

/**
 * @param {{ dimSummary: any[], diagSummary: any[], crossDimension: any }} opts
 */
function buildRootCauseHints({ dimSummary, diagSummary, crossDimension }) {
  if (dimSummary.length === 0) return null;
  const hints = [];
  for (const d of dimSummary) {
    if (d.avgScore >= 80) continue;

    /** @type {{ dim: string, label: string, score: number, trend: number, possibleCauses: string[], relatedDiags: Array<{id:string,label:string,count:number,rate:number}>, correlatedDims: Array<{dim:string,r:number,strength:string}> }} */
    const hint = {
      dim: d.dim,
      label: d.label,
      score: d.avgScore,
      trend: d.trend,
      possibleCauses: [],
      relatedDiags: [],
      correlatedDims: [],
    };

    for (const [diagId, affectedDims] of Object.entries(DIAGNOSTIC_DIMENSION_MAP)) {
      if (affectedDims.includes(d.dim)) {
        const diagInfo = diagSummary.find((/** @type {any} */ ds) => ds.id === diagId);
        if (diagInfo && diagInfo.count > 0) {
          hint.relatedDiags.push({
            id: diagId,
            label: diagInfo.label,
            count: diagInfo.count,
            rate: diagInfo.rate,
          });
        }
      }
    }

    if (crossDimension && crossDimension.pairs) {
      const correlated = crossDimension.pairs
        .filter((/** @type {any} */ p) => (p.dim1 === d.label || p.dim2 === d.label) && Math.abs(p.r) >= 0.4)
        .map((/** @type {any} */ p) => ({
          dim: p.dim1 === d.label ? p.dim2 : p.dim1,
          r: p.r,
          strength: p.strength,
        }));
      hint.correlatedDims = correlated.slice(0, 5);
    }

    if (hint.relatedDiags.length > 0) {
      hint.possibleCauses.push(
        `诊断 ${hint.relatedDiags.map((rd) => rd.id).join("、")} 触发，建议先解决相关诊断`
      );
    }
    if (d.trend < -5) {
      hint.possibleCauses.push("该维度呈持续下降趋势，需排查恶化根因");
    }
    if (hint.correlatedDims.length > 0) {
      hint.possibleCauses.push(
        `与 ${hint.correlatedDims.map((c) => `${c.dim}(r=${c.r})`).join("、")} 显著相关，建议联动改进`
      );
    }
    if (hint.possibleCauses.length === 0) {
      hint.possibleCauses.push("该维度评分偏低，建议专项审查");
    }

    hints.push(hint);
  }
  return hints;
}

/** @param {string} projectRoot */
function buildArchHealth(projectRoot) {
  const archEntries = readJsonl(join(projectRoot, ".memory", "arch-trend.jsonl"));
  if (archEntries.length === 0) return null;

  const archLast = archEntries[archEntries.length - 1];
  const archScores = archLast.archScores || {};
  const archRecent = archEntries.slice(-5);
  /** @type {Record<string, any>} */
  const archDimTrends = {};
  /** @type {Record<string, string>} */
  const archDimLabels = ARCH_HEALTH_DIM_LABELS;
  for (const dim of Object.keys(archDimLabels)) {
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
      label: archDimLabels[dim] || dim,
      recentAvg: avg,
      trend: Math.round(avg - olderAvg),
    };
  }

  return {
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

/**
 * @param {{ daily: any[], dimSummary: any[], sorted: any[], totalEntries: number }} opts
 */
function buildImprovementVelocity({ daily, dimSummary, sorted, totalEntries }) {
  if (daily.length < 2) return null;

  const velocityScores = daily.map((/** @type {any} */ d) => d.avgScore);
  const velTrend = detectTrend(velocityScores);
  const velDist = scoreDistribution(velocityScores);

  let positiveDays = 0;
  let totalChanges = 0;
  for (let i = 1; i < daily.length; i++) {
    const change = daily[i].avgScore - daily[i - 1].avgScore;
    if (change > 0) positiveDays++;
    if (change !== 0) totalChanges++;
  }

  /** @type {Record<string, any>} */
  const dimVelocity = {};
  for (const d of dimSummary) {
    if (d.entries >= 3) {
      const dimScores = sorted
        .filter((/** @type {any} */ e) => e.scores && typeof e.scores[d.dim] === "number")
        .map((/** @type {any} */ e) => e.scores[d.dim]);
      if (dimScores.length >= 3) {
        const dimTrend = detectTrend(dimScores);
        const dimVel = scoreVelocity(dimScores);
        dimVelocity[d.dim] = {
          label: d.label,
          current: dimScores[dimScores.length - 1],
          trend: dimTrend.direction,
          slopePerWeek: dimTrend.slopePerWeek,
          velocity: dimVel.recent,
          r2: dimTrend.r2,
        };
      }
    }
  }

  const bottleneckDims = dimSummary
    .filter((/** @type {any} */ d) => d.avgScore < 70)
    .sort((/** @type {any} */ a, /** @type {any} */ b) => a.avgScore - b.avgScore)
    .slice(0, 5)
    .map((/** @type {any} */ d) => ({
      dim: d.dim,
      label: d.label,
      avgScore: d.avgScore,
      trend: d.trend,
      gap: 100 - d.avgScore,
      impact: Math.round((100 - d.avgScore) * (d.entries / Math.max(1, totalEntries)) / 100),
    }));

  return {
    dailyChangeRate: velTrend.slopePerWeek,
    direction: velTrend.direction,
    confidence: velTrend.confidence,
    scoreVolatility: velDist.stddev,
    positiveDayRatio: totalChanges > 0 ? Math.round((positiveDays / totalChanges) * 100) : 50,
    dimVelocity,
    bottlenecks: bottleneckDims,
    recommendation: bottleneckDims.length > 0
      ? `优先修复 ${bottleneckDims[0].label}(${bottleneckDims[0].avgScore}分)，预计可提升综合评分 ${bottleneckDims[0].impact} 分`
      : "所有维度均处于健康水平，继续保持",
  };
}

/**
 * @param {{ composites: number[], weekly: any[], dimSummary: any[], dimLabelMap: Record<string, string>, sorted: any[] }} opts
 */
function buildScoreReport({ composites, weekly, dimSummary, dimLabelMap, sorted }) {
  if (composites.length < 3) return null;
  /** @type {Record<string, any>} */
  const scoreReport = {};

  const reliability = scoreReliability(composites);
  scoreReport.reliability = {
    current: reliability.current,
    mean: reliability.mean,
    stddev: reliability.stddev,
    ci95: reliability.ci95,
    volatility: reliability.volatility,
    score: reliability.reliability,
  };

  if (weekly.length >= 2) {
    const currWeek = weekly[weekly.length - 1];
    const prevWeek = weekly[weekly.length - 2];
    if (currWeek && prevWeek && currWeek.dimAvgs && prevWeek.dimAvgs) {
      const comparison = periodComparison(
        { composite: currWeek.avgScore, scores: currWeek.dimAvgs, date: currWeek.week },
        { composite: prevWeek.avgScore, scores: prevWeek.dimAvgs, date: prevWeek.week }
      );
      scoreReport.comparison = {
        compositeDelta: comparison.compositeDelta,
        biggestGain: comparison.biggestGain,
        biggestDrop: comparison.biggestDrop,
        improvedCount: comparison.improved.length,
        declinedCount: comparison.declined.length,
        netChange: comparison.netChange,
        topChanges: comparison.dimDeltas.slice(0, 5).map((/** @type {any} */ d) => ({
          dim: d.dim,
          label: dimLabelMap[d.dim] || d.dim,
          delta: d.delta,
          direction: d.direction,
        })),
      };
    }
  }

  /** @type {Record<string, number>} */
  const dimScoreMap = {};
  for (const d of dimSummary) {
    dimScoreMap[d.dim] = d.avgScore;
  }
  /** @type {Record<string, any>} */
  const dimCfg = {};
  for (const d of dimSummary) {
    dimCfg[d.dim] = {
      label: d.label,
      weight: d.entries,
      category: ["token", "config", "robots", "api", "reports", "format", "diagnostics", "git", "security"].includes(d.dim)
        ? "core" : ["comp_qual", "em_testing", "em_types", "em_linting", "em_cicd", "em_docs", "em_deps", "em_git"].includes(d.dim)
        ? "engineering" : "quality",
    };
  }
  scoreReport.spider = spiderChartData(dimScoreMap, dimCfg, { maxAxes: 8 });

  /** @type {Record<string, any>} */
  const dimHistory = {};
  for (const d of dimSummary) {
    dimHistory[d.label] = sorted
      .filter((/** @type {any} */ e) => e.scores && typeof e.scores[d.dim] === "number")
      .map((/** @type {any} */ e) => ({ date: (e.timestamp || "").slice(0, 10), score: e.scores[d.dim] }));
  }
  scoreReport.breakdown = dimensionBreakdown(dimScoreMap, dimCfg, dimHistory);

  scoreReport.recommendations = scoreReport.breakdown
    .filter((/** @type {any} */ b) => b.status === "critical" || b.status === "warn" || b.trendDirection === "falling")
    .map((/** @type {any} */ b) => ({
      priority: b.status === "critical" ? "P0" : b.status === "warn" ? "P1" : "P2",
      dim: b.label,
      score: b.score,
      action: b.recommendation,
    }));

  return scoreReport;
}

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

  /** @type {Record<string, string>} */
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
    notify: "通知投递",
    file_size: "文件体积",
    dep_analysis: "依赖分析",
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

  /** @type {any[]} */
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
  /** @type {Record<string, any>} */
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
    const anomalies = detectAnomalies(composites);

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

    /** @type {Record<string, any>} */
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
  /** @type {any} */
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

  // ── scoreReport: 综合评分报告 (from lib/scoring.mjs) ─────────────────
  const scoreReport = buildScoreReport({ composites, weekly, dimSummary, dimLabelMap, sorted });
  if (scoreReport) {
    summary.scoreReport = scoreReport;
  }

  // ── archHealth ──────────────────────────────────────────────────────
  const archHealth = buildArchHealth(projectRoot);
  if (archHealth) {
    summary.archHealth = archHealth;
  }

  // ── Improvement velocity KPI ────────────────────────────────────────
  // Tracks how fast the project improves: score change per day/week
  const improvementVelocity = buildImprovementVelocity({ daily, dimSummary, sorted, totalEntries });
  if (improvementVelocity) {
    summary.improvementVelocity = improvementVelocity;
  }

  // ── Skill maturation index ───────────────────────────────────────────
  // Tracks how component quality evolves over time
  const currentQual = (latest.scores && latest.scores.comp_qual) || 0;
  if (currentQual > 0 && daily.length >= 2) {
    const skillScores = daily
      .filter(d => d.dimAvgs && typeof d.dimAvgs.comp_qual === "number")
      .map(d => d.dimAvgs.comp_qual);
    const fallbackScores = skillScores.length > 0 ? skillScores : [currentQual];

    const maturationStages = {
      initial: { min: 0, max: 40, label: "初始期", desc: "组件基础建设阶段，核心功能待完善" },
      forming: { min: 40, max: 60, label: "形成期", desc: "组件结构逐步规范，规约和代码质量提升中" },
      maturing: { min: 60, max: 80, label: "成熟期", desc: "组件质量稳定，具备自检和自动修复能力" },
      optimized: { min: 80, max: 101, label: "优化期", desc: "组件高度优化，可作为最佳实践模板" },
    };

    let currentStage = maturationStages.initial;
    for (const stage of Object.values(maturationStages)) {
      if (currentQual >= stage.min && currentQual < stage.max) {
        currentStage = stage;
        break;
      }
    }

    const nextStage = Object.values(maturationStages).find(s => s.min > currentQual) || null;

    summary.skillMaturation = {
      currentStage: currentStage.label,
      stageDescription: currentStage.desc,
      componentQualityScore: currentQual,
      nextMilestone: nextStage ? `${nextStage.label} (${nextStage.min}分)` : "已达最高等级",
      gapToNext: nextStage ? nextStage.min - currentQual : 0,
      componentCount: (componentHealth && componentHealth.totalComponents) || 0,
      qualityTrend: fallbackScores.length >= 2 ? detectTrend(fallbackScores).direction : "stable",
    };
  }

  // ── Risk-adjusted health scoring ─────────────────────────────────────
  // Adjusts composite score based on risk factors
  if (latest.scores) {
    const riskFactors = [];
    // Security risk: low security score is a multiplier
    const secScore = latest.scores.security || 100;
    if (secScore < 60) riskFactors.push({ factor: "安全风险", weight: 0.3, impact: Math.round((60 - secScore) * 0.5) });
    // API risk: low API reachability (layered score < 60 means config+probe+history all weak)
    const apiScore = latest.scores.api || 100;
    if (apiScore < 60) riskFactors.push({ factor: "API 可达性低", weight: 0.25, impact: Math.round((60 - apiScore) * 0.4) });
    // Git risk: many uncommitted files
    if ((latest.gitUncommitted || 0) > 20) riskFactors.push({ factor: "Git 未提交文件过多", weight: 0.15, impact: Math.min(15, Math.round((latest.gitUncommitted || 0) / 5)) });
    // Diagnostic risk
    const diagCount = (latest.triggeredDiags || []).length;
    if (diagCount >= 3) riskFactors.push({ factor: "多诊断触发", weight: 0.15, impact: Math.min(10, diagCount * 3) });
    // Config risk
    const cfgScore = latest.scores.config || 100;
    if (cfgScore < 40) riskFactors.push({ factor: "配置缺失", weight: 0.15, impact: Math.round((40 - cfgScore) * 0.3) });

    const totalRiskDeduction = riskFactors.reduce((s, r) => s + r.impact, 0);
    const riskAdjustedScore = Math.max(0, (latest.composite || 0) - totalRiskDeduction);

    summary.riskAdjusted = {
      baseScore: latest.composite || 0,
      riskDeduction: totalRiskDeduction,
      adjustedScore: riskAdjustedScore,
      riskFactors,
      riskLevel: totalRiskDeduction >= 15 ? "high" : totalRiskDeduction >= 8 ? "medium" : "low",
    };
  }

  // ── Grade thresholds (for frontend consumption) ─────────────────────
  summary.gradeThresholds = {};
  for (const g of HEALTH_GRADE_THRESHOLDS) {
    summary.gradeThresholds[g.grade] = g.min;
  }

  // ── Cross-dimension correlation ─────────────────────────────────────
  if (dimSummary.length >= 2) {
    /** @type {Record<string, any>} */
    const dimHistory = {};
    for (const d of dimSummary) {
      dimHistory[d.label] = sorted
        .filter((e) => e.scores && typeof e.scores[d.dim] === "number")
        .map((e) => ({ date: (e.timestamp || "").slice(0, 10), score: e.scores[d.dim] }));
    }
    summary.crossDimension = crossDimensionCorrelation(dimHistory);
  }

  // ── Confidence-adjusted scoring ─────────────────────────────────────
  if (composites.length >= 3) {
    const reliability = scoreReliability(composites);
    summary.confidenceAdjusted = confidenceAdjustedComposite(latest.composite || 0, reliability.reliability);
    summary.confidenceAdjusted.reliability = reliability;
  }

  // ── Improvement potential ───────────────────────────────────────────
  if (composites.length >= 3 && dimSummary.length >= 1) {
    /** @type {Record<string, number>} */
    const dimScores = {};
    /** @type {Record<string, number>} */
    const dimWeights = {};
    /** @type {Record<string, number[]>} */
    const dimHist = {};
    /** @type {Record<string, any>} */
    const healthScoringDims = HEALTH_SCORING_DIMENSIONS;
    const totalWeight = Object.values(healthScoringDims).reduce((s, d) => s + d.weight, 0);

    for (const d of dimSummary) {
      dimScores[d.dim] = d.avgScore;
      dimWeights[d.dim] = (healthScoringDims[d.dim]?.weight || 8) / totalWeight;
      dimHist[d.dim] = sorted
        .filter((e) => e.scores && typeof e.scores[d.dim] === "number")
        .map((e) => e.scores[d.dim]);
    }

    summary.improvementPotential = {
      ranking: improvementPotentialRanking(dimScores, dimWeights, dimHist).slice(0, 10),
      quickWins: quickWins(dimScores, dimWeights, dimHist),
    };
  }

  // ── Root cause hints ────────────────────────────────────────────────
  const rootCauseHints = buildRootCauseHints({
    dimSummary,
    diagSummary,
    crossDimension: summary.crossDimension,
  });
  if (rootCauseHints) {
    summary.rootCauseHints = rootCauseHints;
  }

  // ── Score stabilization ─────────────────────────────────────────────
  if (composites.length >= 14) {
    summary.stabilization = scoreStabilization(composites);
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
