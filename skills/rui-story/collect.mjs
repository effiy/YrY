#!/usr/bin/env node
// collect — CRUD metrics collector and anomaly detection for story task panel
// 用法: node skills/rui-story/collect.mjs <command> [args]
// 命令: story | all | anomalies

import { join, resolve, dirname } from "node:path";
import { existsSync, readFileSync, readdirSync } from "node:fs";

// --- constants ----------------------------------------------------------------
const STORY_PANEL_DIR = "docs/故事任务面板";
const EXEC_MEMORY_FILE = ".memory/execution-memory.jsonl";
const TOOL_AUDIT_FILE = ".memory/tool-audit.jsonl";
const DELIVERY_TRACK_FILE = ".memory/delivery-tracking.jsonl";
const RUI_STATE_FILE = ".memory/rui-state.json";
const STATUS_HISTORY_FILE = ".memory/status-history.jsonl";
const PROPOSALS_FILE = ".improvement/proposals.jsonl";

import { NODE_ARGV_OFFSET } from "../../lib/constants.mjs";
const ARGV_OFFSET = NODE_ARGV_OFFSET;
const DEFAULT_WINDOW = 12;
const ANOMALY_MULTIPLIER = 2.0;
const BLOCK_RATE_P0 = 0.20;
const P0_DENSITY_MULTIPLIER = 2.0;
const T3_PROPORTION_P0 = 0.30;
const STAGE_DURATION_MULTIPLIER = 3.0;

// Diagnostic → anomaly mapping (from rules/self-improve.md)
const DIAGNOSTIC_LABELS = {
  D0: "基线偏离",
  D1: "效率退化",
  D2: "质量退化",
  D3: "复杂度增长",
  D4: "流程退化",
  D5: "依赖退化",
  D6: "文档过时",
  D7: "配置漂移",
};

// --- TTY helpers -------------------------------------------------------------
import { bold, dim, red, green, yellow, cyan } from "../../lib/tty.mjs";
import { readJsonl, readJson, findStoryDirs } from "../../lib/fs.mjs";

// --- args --------------------------------------------------------------------
function showHelp() {
  console.log("");
  console.log("collect — CRUD 指标采集与异常检测");
  console.log("");
  console.log("用法: node skills/rui-story/collect.mjs <command> [args]");
  console.log("");
  console.log("命令:");
  console.log("  story     单故事指标采集");
  console.log("            --story=<name> [--format=json|table]");
  console.log("  all       跨故事指标汇总");
  console.log("            [--window=12] [--format=json|table]");
  console.log("  anomalies 异常检测");
  console.log("            [--threshold=2.0]");
  console.log("");
  console.log("采集指标:");
  console.log("  block_rate        阻断率（阻断次数/总执行次数）");
  console.log("  p0_density        P0 密度（P0数/总问题数）");
  console.log("  tool_error_rate   工具调用失败率");
  console.log("  agent_participation Agent 参与分布");
  console.log("  retry_count       阶段回溯次数");
  console.log("  t3_proportion     T3 大变更占比");
  console.log("  proposal_closure_rate 提案闭合率");
  console.log("");
  console.log("异常检测规则（对应 D0-D7）:");
  console.log("  D1 效率退化: 阻断率 > 20% 或 > 2x 均值");
  console.log("  D2 质量退化: P0 密度 > 2x 均值");
  console.log("  D3 复杂度增长: T3 占比 > 30%");
  console.log("  D5 依赖退化: 阶段耗时 > 3x 均值");
  console.log("  D7 配置漂移: 提案闭合率 < 50%");
  console.log("");
}

function parseArgs() {
  const args = process.argv.slice(ARGV_OFFSET);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
    showHelp();
    process.exit(0);
  }

  const cmd = args[0];
  const opts = { command: cmd, story: "", all: false, format: "json", window: DEFAULT_WINDOW, threshold: ANOMALY_MULTIPLIER };

  for (const arg of args.slice(1)) {
    if (arg === "--all") { opts.all = true; continue; }
    const eq = arg.indexOf("=");
    if (eq === -1) continue;
    const key = arg.slice(2, eq);
    const val = arg.slice(eq + 1);
    if (key === "window") opts.window = parseInt(val, 10) || DEFAULT_WINDOW;
    else if (key === "threshold") opts.threshold = parseFloat(val) || ANOMALY_MULTIPLIER;
    else opts[key] = val;
  }

  return opts;
}

// --- project root ------------------------------------------------------------
import { findProjectRoot } from "../../lib/fs.mjs";

// --- data readers ------------------------------------------------------------



// --- metrics computation -----------------------------------------------------

function computeStoryMetrics(storyPath, storyName) {
  const execRecords = readJsonl(join(storyPath, EXEC_MEMORY_FILE));
  // Also check project root for records with this story
  const projectRoot = findProjectRoot(storyPath);
  const rootExecRecords = readJsonl(join(projectRoot, ".memory", "execution-memory.jsonl"));
  const allExecRecords = execRecords.concat(
    rootExecRecords.filter((r) => r.story_name === storyName || r.story === storyName)
  );

  const auditRecords = readJsonl(join(storyPath, TOOL_AUDIT_FILE));
  const deliveryRecords = readJsonl(join(storyPath, DELIVERY_TRACK_FILE));
  const statusRecords = readJsonl(join(storyPath, STATUS_HISTORY_FILE));
  const proposals = readJsonl(join(storyPath, PROPOSALS_FILE));

  // Stage durations from phase_transitions
  const stageDurations = {};
  for (const r of allExecRecords) {
    const transitions = r.phase_transitions || [];
    for (const t of transitions) {
      if (t.from && t.to && t.duration_ms) {
        const key = `${t.from}→${t.to}`;
        if (!stageDurations[key]) stageDurations[key] = [];
        stageDurations[key].push(t.duration_ms);
      }
    }
  }

  // Block rate
  let blockedCount = 0;
  for (const r of allExecRecords) {
    if (r.was_blocked) blockedCount++;
  }

  const blockRate = allExecRecords.length > 0 ? blockedCount / allExecRecords.length : 0;

  // P0 density
  let totalP0 = 0;
  let totalIssues = 0;
  for (const r of allExecRecords) {
    const qi = r.quality_issues || {};
    totalP0 += (qi.P0 || []).length;
    totalIssues += (qi.P0 || []).length + (qi.P1 || []).length + (qi.P2 || []).length;
  }
  const p0Density = totalIssues > 0 ? totalP0 / totalIssues : 0;

  // Agent participation
  const agentCounts = {};
  for (const r of allExecRecords) {
    const agents = r.agents_called || [];
    for (const a of agents) {
      agentCounts[a] = (agentCounts[a] || 0) + 1;
    }
  }

  // Tool error rate from audit
  let toolErrors = 0;
  let totalToolCalls = auditRecords.length;
  for (const r of auditRecords) {
    if (r.result === "failure") toolErrors++;
  }
  const toolErrorRate = totalToolCalls > 0 ? toolErrors / totalToolCalls : 0;

  // Retry count (phase transitions going backward)
  const forwardOrder = ["任务", "设计", "实施", "测试", "报告", "改进"];
  let retryCount = 0;
  for (const r of statusRecords) {
    const fromIdx = forwardOrder.indexOf(r.from_status);
    const toIdx = forwardOrder.indexOf(r.to_status);
    if (fromIdx > toIdx) retryCount++;
  }

  // T3 proportion
  let t3Count = 0;
  for (const r of allExecRecords) {
    if (r.planned_change_level === "T3" || r.actual_change_level === "T3") t3Count++;
  }
  const t3Proportion = allExecRecords.length > 0 ? t3Count / allExecRecords.length : 0;

  // Delivery metrics
  let deliverySuccesses = 0;
  let deliveryFailures = 0;
  for (const r of deliveryRecords) {
    if (r.status === "success") deliverySuccesses++;
    else if (r.status === "failure") deliveryFailures++;
  }

  // Proposal closure rate
  let closedProposals = 0;
  for (const p of proposals) {
    if (p.status === "done" || p.status === "superseded") closedProposals++;
  }
  const proposalClosureRate = proposals.length > 0 ? closedProposals / proposals.length : 1;

  return {
    story: storyName,
    execution_count: allExecRecords.length,
    audit_count: auditRecords.length,
    delivery_count: deliveryRecords.length,
    status_changes: statusRecords.length,
    proposal_count: proposals.length,
    stage_durations: stageDurations,
    block_rate: Math.round(blockRate * 10000) / 100,
    p0_density: Math.round(p0Density * 10000) / 100,
    agent_participation: agentCounts,
    tool_error_rate: Math.round(toolErrorRate * 10000) / 100,
    retry_count: retryCount,
    t3_proportion: Math.round(t3Proportion * 10000) / 100,
    delivery: { successes: deliverySuccesses, failures: deliveryFailures },
    proposal_closure_rate: Math.round(proposalClosureRate * 10000) / 100,
  };
}

// --- anomaly detection -------------------------------------------------------

function detectAnomalies(allMetrics, threshold) {
  if (allMetrics.length < 2) {
    return { anomalies: [], note: "数据不足（需要 ≥2 个故事做跨故事对比）" };
  }

  const anomalies = [];

  // Compute cross-story means
  const meanBlockRate = allMetrics.reduce((s, m) => s + m.block_rate, 0) / allMetrics.length;
  const meanP0Density = allMetrics.reduce((s, m) => s + m.p0_density, 0) / allMetrics.length;
  const meanToolError = allMetrics.reduce((s, m) => s + m.tool_error_rate, 0) / allMetrics.length;
  const meanT3 = allMetrics.reduce((s, m) => s + m.t3_proportion, 0) / allMetrics.length;

  for (const m of allMetrics) {
    const storyAnomalies = [];

    // D1: Block rate > 20% or > 2x mean
    if (m.block_rate > BLOCK_RATE_P0 * 100 || (meanBlockRate > 0 && m.block_rate > meanBlockRate * threshold)) {
      storyAnomalies.push({
        diagnostic: "D1",
        label: DIAGNOSTIC_LABELS.D1,
        metric: "block_rate",
        value: m.block_rate,
        threshold_value: Math.max(BLOCK_RATE_P0 * 100, meanBlockRate * threshold),
      });
    }

    // D2: P0 density > 2x mean
    if (meanP0Density > 0 && m.p0_density > meanP0Density * P0_DENSITY_MULTIPLIER) {
      storyAnomalies.push({
        diagnostic: "D2",
        label: DIAGNOSTIC_LABELS.D2,
        metric: "p0_density",
        value: m.p0_density,
        threshold_value: meanP0Density * P0_DENSITY_MULTIPLIER,
      });
    }

    // D3: T3 proportion > 30%
    if (m.t3_proportion > T3_PROPORTION_P0 * 100) {
      storyAnomalies.push({
        diagnostic: "D3",
        label: DIAGNOSTIC_LABELS.D3,
        metric: "t3_proportion",
        value: m.t3_proportion,
        threshold_value: T3_PROPORTION_P0 * 100,
      });
    }

    // D5: stage duration anomalies (from stage_durations)
    for (const [key, durations] of Object.entries(m.stage_durations)) {
      if (durations.length === 0) continue;
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      // Compare to cross-story average for same transition
      let crossAvg = 0;
      let crossCount = 0;
      for (const other of allMetrics) {
        const otherDurations = other.stage_durations[key] || [];
        crossAvg += otherDurations.reduce((a, b) => a + b, 0);
        crossCount += otherDurations.length;
      }
      crossAvg = crossCount > 0 ? crossAvg / crossCount : avg;
      if (crossAvg > 0 && avg > crossAvg * STAGE_DURATION_MULTIPLIER) {
        storyAnomalies.push({
          diagnostic: "D5",
          label: DIAGNOSTIC_LABELS.D5,
          metric: `stage_duration.${key}`,
          value: Math.round(avg),
          threshold_value: Math.round(crossAvg * STAGE_DURATION_MULTIPLIER),
        });
      }
    }

    // D7: Proposal closure rate < 50%
    if (m.proposal_count > 0 && m.proposal_closure_rate < 50) {
      storyAnomalies.push({
        diagnostic: "D7",
        label: DIAGNOSTIC_LABELS.D7,
        metric: "proposal_closure_rate",
        value: m.proposal_closure_rate,
        threshold_value: 50,
      });
    }

    if (storyAnomalies.length > 0) {
      anomalies.push({ story: m.story, anomalies: storyAnomalies });
    }
  }

  return { anomalies, mean_metrics: { block_rate: meanBlockRate, p0_density: meanP0Density, tool_error_rate: meanToolError, t3_proportion: meanT3 } };
}

// --- output formatters -------------------------------------------------------

function printMetricsTable(metrics) {
  console.log("");
  console.log(bold(`指标采集 · ${metrics.story}`));
  console.log("══════════════════");
  console.log("");
  console.log(`  执行记录:    ${metrics.execution_count}`);
  console.log(`  审计记录:    ${metrics.audit_count}`);
  console.log(`  交付记录:    ${metrics.delivery_count}`);
  console.log(`  状态变更:    ${metrics.status_changes}`);
  console.log(`  提案数:      ${metrics.proposal_count}`);
  console.log("");
  console.log(bold("  关键指标"));
  console.log(`  阻断率:      ${metrics.block_rate}%`);
  console.log(`  P0 密度:     ${metrics.p0_density}%`);
  console.log(`  工具错误率:  ${metrics.tool_error_rate}%`);
  console.log(`  回溯次数:    ${metrics.retry_count}`);
  console.log(`  T3 占比:     ${metrics.t3_proportion}%`);
  console.log(`  提案闭合率:  ${metrics.proposal_closure_rate}%`);
  console.log("");

  if (Object.keys(metrics.agent_participation).length > 0) {
    console.log(bold("  Agent 参与"));
    for (const [agent, count] of Object.entries(metrics.agent_participation)) {
      console.log(`  ${agent}: ${count} 次`);
    }
    console.log("");
  }

  if (Object.keys(metrics.stage_durations).length > 0) {
    console.log(bold("  阶段耗时"));
    for (const [key, durations] of Object.entries(metrics.stage_durations)) {
      if (durations.length === 0) continue;
      const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
      console.log(`  ${key}: avg=${avg}ms (n=${durations.length})`);
    }
    console.log("");
  }
}

function printAnomalies(result) {
  console.log("");
  console.log(bold("异常检测"));
  console.log("════════");
  console.log("");

  if (result.note) {
    console.log(yellow(`  ⚠️  ${result.note}`));
    console.log("");
    return;
  }

  if (result.anomalies.length === 0) {
    console.log(green("  ✅ 未检测到异常"));
    console.log("");
    return;
  }

  for (const storyAnomaly of result.anomalies) {
    console.log(bold(`  ${storyAnomaly.story}`));
    for (const a of storyAnomaly.anomalies) {
      const label = `${a.diagnostic} ${a.label}`.padEnd(18);
      const val = `当前=${a.value}`.padEnd(16);
      const thresh = `阈值=${a.threshold_value}`;
      console.log(red(`  ❌ ${label} ${val} ${thresh}`));
    }
    console.log("");
  }

  if (result.mean_metrics) {
    console.log(dim("  跨故事均值:"));
    console.log(dim(`  阻断率=${result.mean_metrics.block_rate.toFixed(2)}%  P0密度=${result.mean_metrics.p0_density.toFixed(2)}%  工具错误率=${result.mean_metrics.tool_error_rate.toFixed(2)}%  T3占比=${result.mean_metrics.t3_proportion.toFixed(2)}%`));
    console.log("");
  }
}

function printAllMetrics(allMetrics) {
  console.log("");
  console.log(bold("跨故事指标汇总"));
  console.log("══════════════");
  console.log("");

  if (allMetrics.length === 0) {
    console.log(dim("  无故事数据"));
    console.log("");
    return;
  }

  for (const m of allMetrics) {
    const status = m.execution_count > 0 ? green("有数据") : dim("无执行记录");
    console.log(`  ${m.story.padEnd(18)} exec=${m.execution_count} audit=${m.audit_count} block_rate=${m.block_rate}% ${status}`);
  }
  console.log("");

  // Aggregate
  if (allMetrics.length > 0) {
    const avgBlock = allMetrics.reduce((s, m) => s + m.block_rate, 0) / allMetrics.length;
    const avgP0 = allMetrics.reduce((s, m) => s + m.p0_density, 0) / allMetrics.length;
    console.log(bold("  汇总"));
    console.log(`  故事数:       ${allMetrics.length}`);
    console.log(`  总执行记录:   ${allMetrics.reduce((s, m) => s + m.execution_count, 0)}`);
    console.log(`  总审计记录:   ${allMetrics.reduce((s, m) => s + m.audit_count, 0)}`);
    console.log(`  平均阻断率:   ${avgBlock.toFixed(2)}%`);
    console.log(`  平均 P0 密度: ${avgP0.toFixed(2)}%`);
    console.log("");
  }
}

// --- commands ----------------------------------------------------------------

function cmdStory(opts) {
  const projectRoot = findProjectRoot(process.cwd());
  const storyPath = join(projectRoot, STORY_PANEL_DIR, opts.story);

  if (!existsSync(storyPath)) {
    console.error(`collect: 故事目录不存在: ${storyPath}`);
    process.exit(0);
  }

  const metrics = computeStoryMetrics(storyPath, opts.story);

  if (opts.format === "table") {
    printMetricsTable(metrics);
  } else {
    console.log(JSON.stringify(metrics, null, 2));
  }
}

function cmdAll(opts) {
  const projectRoot = findProjectRoot(process.cwd());
  const stories = findStoryDirs(projectRoot);
  const allMetrics = [];

  for (const story of stories) {
    allMetrics.push(computeStoryMetrics(story.path, story.name));
  }

  if (opts.format === "table") {
    printAllMetrics(allMetrics);
  } else {
    console.log(JSON.stringify(allMetrics, null, 2));
  }
}

function cmdAnomalies(opts) {
  const projectRoot = findProjectRoot(process.cwd());
  const stories = findStoryDirs(projectRoot);
  const allMetrics = [];

  for (const story of stories) {
    allMetrics.push(computeStoryMetrics(story.path, story.name));
  }

  const result = detectAnomalies(allMetrics, opts.threshold);
  printAnomalies(result);
}

// --- main ---
function main() {
  const opts = parseArgs();

  switch (opts.command) {
    case "story":
      if (!opts.story) {
        console.error("collect: story 需要 --story=<name>");
        process.exit(0);
      }
      cmdStory(opts);
      break;
    case "all":
      cmdAll(opts);
      break;
    case "anomalies":
      cmdAnomalies(opts);
      break;
    default:
      console.error(`collect: 未知命令 "${opts.command}"。可用: story | all | anomalies`);
      process.exit(0);
  }
}

main();
