#!/usr/bin/env node
/**
 * score-report-generator — 独立评分报告生成器
 *
 * 从 .memory/health-trend.jsonl 和 .memory/arch-trend.jsonl 读取历史数据，
 * 使用 lib/scoring.mjs 生成完整的结构化评分报告 JSON。
 *
 * 输出: docs/评分报告/score-report.json
 *
 * 用法:
 *   node lib/score-report-generator.mjs                    # 生成完整报告
 *   node lib/score-report-generator.mjs --output report.json  # 指定输出路径
 *   node lib/score-report-generator.mjs --since 2026-06-01    # 仅分析指定日期后
 *   node lib/score-report-generator.mjs --pretty              # 美化输出 (多行)
 *   node lib/score-report-generator.mjs --help                # 帮助
 */

import { join, dirname } from "node:path";
import { existsSync, mkdirSync } from "node:fs";

import { readJsonl, findProjectRoot, isMain, writeJson } from "./fs.mjs";
import { DIAGNOSTIC_LABELS, HEALTH_SCORING_DIMENSIONS } from "./constants.mjs";
import {
  generateScoreReport,
  computeComposite,
} from "./scoring.mjs";

// ── CLI argument parsing ─────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { output: null, since: null, pretty: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--output" || a === "-o") {
      args.output = argv[++i] || null;
    } else if (a === "--since" || a === "-s") {
      args.since = argv[++i] || null;
    } else if (a === "--pretty" || a === "-p") {
      args.pretty = true;
    } else if (a === "--help" || a === "-h") {
      args.help = true;
    }
  }
  return args;
}

function showHelp() {
  console.log([
    "score-report-generator — 独立评分报告生成器",
    "",
    "用法:",
    "  node lib/score-report-generator.mjs [options]",
    "",
    "选项:",
    "  -o, --output <path>   输出文件路径 (默认: docs/评分报告/score-report.json)",
    "  -s, --since <date>    仅分析指定日期之后的记录 (YYYY-MM-DD)",
    "  -p, --pretty          美化 JSON 输出 (多行缩进)",
    "  -h, --help            显示帮助",
    "",
    "数据源:",
    "  .memory/health-trend.jsonl   健康趋势数据",
    "  .memory/arch-trend.jsonl     架构合规趋势数据",
  ].join("\n"));
}

// ── Main generator ──────────────────────────────────────────────────────

const DEFAULT_OUTPUT = "docs/评分报告/score-report.json";

/**
 * Generate a complete scoring report.
 *
 * @param {string} projectRoot - Absolute path to project root
 * @param {object} [opts]
 * @param {string} [opts.since] - ISO date filter
 * @returns {object} The score report object
 */
export function generate(projectRoot, opts = {}) {
  const sinceDate = opts.since || null;

  // ── Load data ──────────────────────────────────────────────────────
  const healthPath = join(projectRoot, ".memory/health-trend.jsonl");
  let healthEntries = readJsonl(healthPath);

  if (sinceDate) {
    healthEntries = healthEntries.filter(
      e => (e.timestamp || "").slice(0, 10) >= sinceDate
    );
  }

  // Sort by timestamp ascending
  healthEntries.sort((a, b) =>
    (a.timestamp || "").localeCompare(b.timestamp || "")
  );

  // ── Current scores ─────────────────────────────────────────────────
  const latest = healthEntries.length > 0
    ? healthEntries[healthEntries.length - 1]
    : null;
  const currentScores = latest?.scores || {};
  const currentComposite = latest?.composite
    || computeComposite(currentScores, weightsFromDims(HEALTH_SCORING_DIMENSIONS));

  // ── History ────────────────────────────────────────────────────────
  const history = healthEntries
    .map(e => e.composite)
    .filter(s => typeof s === "number");

  // ── Previous period ────────────────────────────────────────────────
  let prevPeriod = null;
  if (healthEntries.length >= 2) {
    const prev = healthEntries[healthEntries.length - 2];
    prevPeriod = {
      composite: prev.composite || 0,
      scores: prev.scores || {},
      date: (prev.timestamp || "").slice(0, 10),
    };
  }

  // ── Dimension history ──────────────────────────────────────────────
  const dimHistory = {};
  for (const [dim, cfg] of Object.entries(HEALTH_SCORING_DIMENSIONS)) {
    const label = cfg.label;
    dimHistory[label] = healthEntries
      .filter(e => e.scores && typeof e.scores[dim] === "number")
      .map(e => ({ date: (e.timestamp || "").slice(0, 10), score: e.scores[dim] }));
  }

  // ── Architecture ───────────────────────────────────────────────────
  const archPath = join(projectRoot, ".memory/arch-trend.jsonl");
  const archEntries = readJsonl(archPath);
  let archResult = null;
  if (archEntries.length > 0) {
    const archLast = archEntries[archEntries.length - 1];
    archResult = {
      archGrade: archLast.archGrade || "D",
      archPassedDims: archLast.archPassedDims || [],
      archFailedDims: archLast.archFailedDims || [],
      archDimResults: (archLast.archFailedDims || []).map(d => ({
        dim: d.name || d,
        passed: false,
        score: 0,
      })).concat(
        (archLast.archPassedDims || []).map(d => ({
          dim: d.name || d,
          passed: true,
          score: 100,
        }))
      ),
    };
  }

  // ── Diagnostics triggered ──────────────────────────────────────────
  const diagTriggered = latest?.triggeredDiags?.length || 0;

  // ── Generate report ────────────────────────────────────────────────
  const reportDate = new Date().toISOString().slice(0, 10);

  const report = generateScoreReport({
    composite: currentComposite,
    scores: currentScores,
    dimensions: HEALTH_SCORING_DIMENSIONS,
    history,
    dimHistory,
    prevPeriod,
    archResult,
    diagTriggered,
    reportDate,
    title: "YrY 项目健康评分报告",
  });

  // ── Add metadata ───────────────────────────────────────────────────
  report.meta.generatedAt = new Date().toISOString();
  report.meta.dataPoints = healthEntries.length;
  report.meta.dateRange = healthEntries.length > 0
    ? {
        from: (healthEntries[0].timestamp || "").slice(0, 10),
        to: (healthEntries[healthEntries.length - 1].timestamp || "").slice(0, 10),
      }
    : { from: "", to: "" };
  report.meta.dataSource = ".memory/health-trend.jsonl";

  // Add dimension labels for reference
  report.dimensionLabels = {};
  for (const [dim, cfg] of Object.entries(HEALTH_SCORING_DIMENSIONS)) {
    report.dimensionLabels[dim] = {
      label: cfg.label,
      weight: cfg.weight,
      category: cfg.category,
      icon: cfg.icon,
    };
  }

  return report;
}

// ── Helpers ─────────────────────────────────────────────────────────────

function weightsFromDims(dimensions) {
  const w = {};
  for (const [dim, cfg] of Object.entries(dimensions)) {
    w[dim] = cfg.weight;
  }
  return w;
}

// ── CLI entry ───────────────────────────────────────────────────────────

const _isMain = isMain(import.meta.url);
if (_isMain) {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  const root = findProjectRoot(process.cwd());
  const report = generate(root, { since: args.since });

  const outPath = args.output
    ? join(root, args.output)
    : join(root, DEFAULT_OUTPUT);

  const outDir = dirname(outPath);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  writeJson(outPath, report, args.pretty ? 2 : undefined);

  console.log(`[score-report] 评分报告已生成: ${outPath}`);
  console.log(`  综合评分: ${report.composite.score}/${report.composite.grade} (${report.composite.label})`);
  console.log(`  数据点:   ${report.meta.dataPoints}`);
  console.log(`  维度数:   ${report.breakdown.length}`);
  console.log(`  建议数:   ${report.recommendations.length}`);
  if (report.recommendations.length > 0) {
    console.log(`    P0: ${report.recommendations.filter(r => r.priority === "P0").length}`);
    console.log(`    P1: ${report.recommendations.filter(r => r.priority === "P1").length}`);
    console.log(`    P2: ${report.recommendations.filter(r => r.priority === "P2").length}`);
  }
  if (report.trend) {
    console.log(`  趋势:     ${report.trend.direction} (${report.trend.slopePerWeek > 0 ? "+" : ""}${report.trend.slopePerWeek}/周)`);
  }
  if (report.forecast) {
    console.log(`  预测:     ${report.forecast.value} (范围 ${report.forecast.range[0]}–${report.forecast.range[1]})`);
  }
}
