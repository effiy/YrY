#!/usr/bin/env node
/**
 * cdn-score-updater — CDN 评分报告增强器
 *
 * 读取 cdn/cdn-summary/index.json，使用 lib/scoring.mjs 计算并追加
 * scoreReport 段（可靠性/趋势/预测/维度拆解/建议），使 CDN 页面能展示
 * 更丰富的实时评分报告。
 *
 * 用法:
 *   node lib/cdn-score-updater.mjs
 *   node lib/cdn-score-updater.mjs --pretty   # 美化输出
 */

import { join } from "node:path";
import { existsSync, mkdirSync, readFileSync } from "node:fs";

import { readJsonl, findProjectRoot, isMain, writeJson } from "./fs.mjs";
import {
  detectTrend,
  forecastScore,
  scoreReliability,
  dimensionBreakdown,
  classifyScore,
} from "./scoring.mjs";

// ── Main updater ──────────────────────────────────────────────────────

/**
 * Read the CDN summary JSON, compute score report data, and return the
 * enriched object. Does NOT write to disk — call writeJson() separately.
 *
 * @param {string} projectRoot
 * @returns {object} The enriched CDN summary object
 */
export function computeCdnScoreReport(projectRoot) {
  const summaryPath = join(projectRoot, "cdn/cdn-summary/index.json");
  const raw = readFileSync(summaryPath, "utf8");
  const data = JSON.parse(raw);

  const scoreTrend = data.scoreTrend || [];
  const dimSummary = data.dimSummary || [];
  const componentHealth = data.componentHealth || {};
  const diagSummary = data.diagSummary || [];

  // ── Composite history ──────────────────────────────────────────
  const history = scoreTrend.map(e => e.score).filter(s => typeof s === "number");

  // ── Trend ──────────────────────────────────────────────────────
  const trend = history.length >= 3 ? detectTrend(history) : null;

  // ── Forecast ───────────────────────────────────────────────────
  const forecast = history.length >= 5 ? forecastScore(history, 7) : null;

  // ── Reliability ────────────────────────────────────────────────
  const reliability = history.length >= 3 ? scoreReliability(history) : null;

  // ── Dimension breakdown ────────────────────────────────────────
  const dimScores = {};
  const dimCfgs = {};
  const dimHistories = {};

  for (const d of dimSummary) {
    const key = d.label;
    dimScores[key] = d.avgScore || 0;
    dimCfgs[key] = {
      label: d.label,
      weight: d.entries || 1,
      category: ["CSS 组件覆盖", "双主题完备性", "JS API 一致性"].includes(d.label)
        ? "quality" : ["加载链稳定", "页面迁移率", "字体性能"].includes(d.label)
        ? "structural" : "engineering",
    };
    // Per-dimension history from scoreTrend (simplified: use trend value)
    dimHistories[key] = scoreTrend.map(e => ({
      date: e.date,
      score: Math.max(0, Math.min(100, d.avgScore - d.trend + (d.trend * scoreTrend.indexOf(e) / Math.max(1, scoreTrend.length - 1)))),
    }));
  }

  const breakdown = dimensionBreakdown(dimScores, dimCfgs, dimHistories, {
    warnThreshold: 60,
    criticalThreshold: 40,
  });

  // ── Recommendations ────────────────────────────────────────────
  const recommendations = breakdown
    .filter(b => b.status === "critical" || b.status === "warn" || b.trendDirection === "falling")
    .map(b => ({
      priority: b.status === "critical" ? "P0" : b.status === "warn" ? "P1" : "P2",
      dim: b.label,
      score: b.score,
      action: b.recommendation,
    }));

  // ── Diagnostics triggered count ────────────────────────────────
  const diagTriggered = diagSummary.filter(d => d.count > 0).length;

  // ── Component health breakdown ────────────────────────────────
  const compBreakdown = [];
  for (const [cat, info] of Object.entries(componentHealth)) {
    if (cat === "overallAvg" || cat === "totalComponents") continue;
    if (typeof info === "object" && info.avgScore !== undefined) {
      compBreakdown.push({
        category: cat,
        label: cat === "css" ? "CSS 组件" : cat === "themes" ? "双主题" :
               cat === "apis" ? "JS API" : cat === "scripts" ? "脚本工具" : cat,
        score: info.avgScore,
        count: info.count || 0,
        grade: classifyScore(info.avgScore),
      });
    }
  }

  // ── Assemble score report ──────────────────────────────────────
  const scoreReport = {
    updated: new Date().toISOString(),
    composite: data.latest?.composite || 0,
    grade: data.latest?.grade || "D",
    dataPoints: history.length,
    trend: trend ? {
      direction: trend.direction,
      slopePerWeek: trend.slopePerWeek,
      r2: trend.r2,
      confidence: trend.confidence,
    } : null,
    forecast: forecast ? {
      value: forecast.forecast,
      range: forecast.range,
      confidence: forecast.confidence,
    } : null,
    reliability: reliability ? {
      current: reliability.current,
      mean: reliability.mean,
      stddev: reliability.stddev,
      ci95: reliability.ci95,
      volatility: reliability.volatility,
      score: reliability.reliability,
    } : null,
    breakdown,
    recommendations,
    componentBreakdown: compBreakdown,
    diagnostics: {
      triggered: diagTriggered,
      total: diagSummary.length,
      rate: diagSummary.length > 0 ? Math.round((diagTriggered / diagSummary.length) * 100) : 0,
      topDiags: diagSummary.filter(d => d.count > 0).sort((a, b) => b.rate - a.rate).slice(0, 3),
    },
  };

  // ── Attach to data (non-destructive: keep all existing fields) ─
  data.scoreReport = scoreReport;

  return data;
}

// ── CLI entry ───────────────────────────────────────────────────────────

const _isMain = isMain(import.meta.url);
if (_isMain) {
  const argv = process.argv.slice(2);
  const pretty = argv.includes("--pretty") || argv.includes("-p");
  const root = findProjectRoot(process.cwd());

  const enriched = computeCdnScoreReport(root);
  const outPath = join(root, "cdn/cdn-summary/index.json");
  writeJson(outPath, enriched, pretty ? 2 : undefined);

  const sr = enriched.scoreReport;
  console.log(`[cdn-score] CDN 评分报告已附加到: ${outPath}`);
  console.log(`  综合评分: ${sr.composite}/${sr.grade}`);
  console.log(`  数据点:   ${sr.dataPoints}`);
  if (sr.trend) {
    console.log(`  趋势:     ${sr.trend.direction} (${sr.trend.slopePerWeek > 0 ? "+" : ""}${sr.trend.slopePerWeek}/周, R²=${sr.trend.r2})`);
  }
  if (sr.forecast) {
    console.log(`  预测:     ${sr.forecast.value} (范围 ${sr.forecast.range[0]}–${sr.forecast.range[1]})`);
  }
  if (sr.reliability) {
    console.log(`  可靠性:   ${Math.round(sr.reliability.score * 100)}% (${sr.reliability.volatility} 波动)`);
  }
  console.log(`  维度数:   ${sr.breakdown.length}`);
  console.log(`  建议数:   ${sr.recommendations.length}`);
  console.log(`  诊断:     ${sr.diagnostics.triggered}/${sr.diagnostics.total} 触发`);
}
