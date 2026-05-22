#!/usr/bin/env node
// proposals — D0-D7 diagnostic engine and proposal generator for self-improve
// 用法: node skills/rui/proposals.mjs <command> [args]
// 命令: generate | list | evaluate | upgrade-candidates

import { join, resolve, dirname } from "node:path";
import { existsSync, readFileSync, readdirSync, mkdirSync, appendFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

// --- constants ----------------------------------------------------------------
const STORY_PANEL_DIR = "docs/故事任务面板";
const PROPOSALS_DIR = ".improvement";
const PROPOSALS_FILE = "proposals.jsonl";
const EXEC_MEMORY_FILE = ".memory/execution-memory.jsonl";
const TOOL_AUDIT_FILE = ".memory/tool-audit.jsonl";
const DELIVERY_TRACK_FILE = ".memory/delivery-tracking.jsonl";
const RUI_STATE_FILE = ".memory/rui-state.json";

// Materialization constants
const IMPROVE_STORY_PREFIX = "improve";
const MATERIALIZED_FIELD = "materialized_story_dir";
const DEFAULT_MIN_PRIORITY = "P2";
const PRIORITY_ORDER = { P0: 0, P1: 1, P2: 2, P3: 3 };

const ARGV_OFFSET = 2;
const MIN_EXEC_MEMORIES = 3;
const BLOCK_RATE_THRESHOLD = 0.20;
const P0_DENSITY_MULTIPLIER = 2.0;
const T3_PROPORTION_THRESHOLD = 0.30;
const STAGE_DURATION_MULTIPLIER = 3.0;

const PROPOSAL_TYPES = ["process", "quality", "refactor", "security", "skill"];

// Diagnostic → proposal type routing (from rules/self-improve.md)
const DIAGNOSTIC_PROPOSAL_TYPE = {
  D0: "process",
  D1: "refactor",
  D2: "quality",
  D3: "security",
  D4: "quality",
  D5: "refactor",
  D6: "process",
  D7: "process",
};

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

const DIAGNOSTIC_BASELINES = {
  D0: "CLAUDE.md · agents/",
  D1: "code-pipeline.md",
  D2: "doc-generation.md",
  D3: "pm.md（故事拆分）",
  D4: "code-pipeline.md",
  D5: "agents/",
  D6: "CLAUDE.md",
  D7: "rules/self-improve.md",
};

const DIAGNOSTIC_MIN_CONFIDENCE = {
  D0: 1,
  D1: 5,
  D2: 3,
  D3: 3,
  D4: 2,
  D5: 3,
  D6: 2,
  D7: 5,
};

// --- TTY helpers -------------------------------------------------------------
const tty = process.stdout.isTTY;
const bold = (s) => tty ? `\x1b[1m${s}\x1b[22m` : s;
const dim = (s) => tty ? `\x1b[2m${s}\x1b[22m` : s;
const red = (s) => tty ? `\x1b[31m${s}\x1b[39m` : s;
const green = (s) => tty ? `\x1b[32m${s}\x1b[39m` : s;
const yellow = (s) => tty ? `\x1b[33m${s}\x1b[39m` : s;

// --- args --------------------------------------------------------------------
function showHelp() {
  console.log("");
  console.log("proposals — D0-D7 诊断引擎与提案生成器");
  console.log("");
  console.log("用法: node skills/rui/proposals.mjs <command> [args]");
  console.log("");
  console.log("命令:");
  console.log("  generate          运行 D0-D7 诊断，生成提案");
  console.log("                    --story=<name> [--materialize]");
  console.log("  list              列出提案");
  console.log("                    --story=<name> [--status=open|done|superseded|all]");
  console.log("  evaluate          评估提案效果（E1-E4）");
  console.log("                    --id=<proposal_id>");
  console.log("  upgrade-candidates 检测经验技能化候选");
  console.log("  materialize        将 open 提案实例化为故事任务目录");
  console.log("                    --story=<name> [--min-priority=P0|P1|P2] [--dry-run]");
  console.log("");
  console.log("D0-D7 诊断映射:");
  console.log("  D0 基线偏离 → process     D1 效率退化 → refactor");
  console.log("  D2 质量退化 → quality     D3 复杂度增长 → security");
  console.log("  D4 流程退化 → quality     D5 依赖退化 → refactor");
  console.log("  D6 文档过时 → process     D7 配置漂移 → process");
  console.log("");
  console.log("升级阈值: process/quality/refactor ≥3 故事, security ≥1, skill ≥2");
  console.log("数据要求: ≥3 条执行记忆走全量诊断，<3 条降级观察模式");
  console.log("");
}

function parseArgs() {
  const args = process.argv.slice(ARGV_OFFSET);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
    showHelp();
    process.exit(0);
  }

  const cmd = args[0];
  const opts = { command: cmd, story: "", id: "", status: "open", format: "table", materialize: false, minPriority: "", dryRun: false };

  for (const arg of args.slice(1)) {
    const eq = arg.indexOf("=");
    if (eq === -1) {
      // Bare flag (no =)
      const key = arg.replace(/^--?/, "");
      if (key === "materialize") opts.materialize = true;
      else if (key === "dry-run") opts.dryRun = true;
      continue;
    }
    const key = arg.slice(2, eq);
    const val = arg.slice(eq + 1);
    if (key === "materialize") opts.materialize = true;
    else if (key === "dry-run") opts.dryRun = true;
    else opts[key] = val;
  }

  return opts;
}

// --- project root ------------------------------------------------------------
function findProjectRoot(startDir) {
  let dir = resolve(startDir);
  while (true) {
    if (existsSync(join(dir, ".git")) || existsSync(join(dir, ".claude"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return resolve(startDir);
    dir = parent;
  }
}

// --- data readers ------------------------------------------------------------
function readJsonl(path) {
  if (!existsSync(path)) return [];
  try {
    const content = readFileSync(path, "utf-8").trim();
    if (!content) return [];
    return content.split("\n").map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
  } catch {
    return [];
  }
}

function readJson(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

function readProjectName(projectRoot) {
  const claudePath = join(projectRoot, "CLAUDE.md");
  if (!existsSync(claudePath)) return projectRoot.split("/").pop();
  try {
    const content = readFileSync(claudePath, "utf-8");
    let match = content.match(/\|\s*项目名\s*\|\s*(\S+)\s*\|/);
    if (match) return match[1];
    match = content.match(/\*\*项目名\*\*[：:]\s*(\S+)/);
    if (match) return match[1];
    return projectRoot.split("/").pop();
  } catch {
    return projectRoot.split("/").pop();
  }
}

// --- data collection for a story --------------------------------------------
function collectStoryData(projectRoot, storyName) {
  const storyPath = join(projectRoot, STORY_PANEL_DIR, storyName);
  const execRecords = readJsonl(join(storyPath, EXEC_MEMORY_FILE));
  const rootExecRecords = readJsonl(join(projectRoot, ".memory", "execution-memory.jsonl"));
  const allExec = execRecords.concat(rootExecRecords.filter((r) => r.story_name === storyName || r.story === storyName));

  const toolAudit = readJsonl(join(storyPath, TOOL_AUDIT_FILE));
  const deliveryTrack = readJsonl(join(storyPath, DELIVERY_TRACK_FILE));
  const ruiState = readJson(join(storyPath, RUI_STATE_FILE));
  const proposals = readJsonl(join(storyPath, PROPOSALS_FILE));

  return { storyName, storyPath, allExec, toolAudit, deliveryTrack, ruiState, proposals };
}

// --- D0-D7 diagnostics -------------------------------------------------------

function runDiagnostics(data) {
  const diagnostics = [];
  const execCount = data.allExec.length;

  // D0: Baseline deviation — execution conflicts with baseline
  if (execCount >= DIAGNOSTIC_MIN_CONFIDENCE.D0) {
    let conflicts = 0;
    for (const r of data.allExec) {
      // Check if blocked but no block_reason — baseline conflict
      if (r.was_blocked && !r.block_reason) conflicts++;
      // Check if stage is invalid
      if (r.stage && r.stage === "unknown") conflicts++;
    }
    if (conflicts > 0) {
      diagnostics.push({
        id: "D0",
        label: DIAGNOSTIC_LABELS.D0,
        triggered: true,
        confidence: conflicts,
        evidence: `${conflicts} 条执行记录与基线冲突`,
        baseline: DIAGNOSTIC_BASELINES.D0,
        suggestion: "核查执行记录中的阻断标记和阶段字段，确保与 CLAUDE.md / agents/ 基线一致",
      });
    }
  }

  // D1: Efficiency degradation — block_rate > 20%
  if (execCount >= DIAGNOSTIC_MIN_CONFIDENCE.D1) {
    let blockedCount = 0;
    for (const r of data.allExec) {
      if (r.was_blocked) blockedCount++;
    }
    const blockRate = execCount > 0 ? blockedCount / execCount : 0;
    if (blockRate > BLOCK_RATE_THRESHOLD) {
      diagnostics.push({
        id: "D1",
        label: DIAGNOSTIC_LABELS.D1,
        triggered: true,
        confidence: Math.round(blockRate * 100),
        evidence: `阻断率 ${(blockRate * 100).toFixed(1)}% > 阈值 ${BLOCK_RATE_THRESHOLD * 100}%`,
        baseline: DIAGNOSTIC_BASELINES.D1,
        suggestion: "阻断率偏高，建议加强影响分析阶段的预处理，提前识别阻断风险",
      });
    }
  }

  // D2: Quality degradation — P0 density > 2x mean
  if (execCount >= DIAGNOSTIC_MIN_CONFIDENCE.D2) {
    let totalP0 = 0;
    let totalIssues = 0;
    for (const r of data.allExec) {
      const qi = r.quality_issues || {};
      totalP0 += (qi.P0 || []).length;
      totalIssues += (qi.P0 || []).length + (qi.P1 || []).length + (qi.P2 || []).length;
    }
    // Since we only have one story, use absolute P0 count as threshold
    if (totalP0 > 0 && totalIssues > 0) {
      const p0Density = totalP0 / totalIssues;
      if (p0Density > 0.5) {
        diagnostics.push({
          id: "D2",
          label: DIAGNOSTIC_LABELS.D2,
          triggered: true,
          confidence: totalP0,
          evidence: `P0 密度 ${(p0Density * 100).toFixed(1)}% (${totalP0}/${totalIssues})`,
          baseline: DIAGNOSTIC_BASELINES.D2,
          suggestion: "P0 密度偏高，建议在 coder 自审查阶段加强代码审查清单",
        });
      }
    }
  }

  // D3: Complexity growth — T3 proportion > 30%
  if (execCount >= DIAGNOSTIC_MIN_CONFIDENCE.D3) {
    let t3Count = 0;
    for (const r of data.allExec) {
      if (r.planned_change_level === "T3" || r.actual_change_level === "T3") t3Count++;
    }
    const t3Proportion = execCount > 0 ? t3Count / execCount : 0;
    if (t3Proportion > T3_PROPORTION_THRESHOLD) {
      diagnostics.push({
        id: "D3",
        label: DIAGNOSTIC_LABELS.D3,
        triggered: true,
        confidence: Math.round(t3Proportion * 100),
        evidence: `T3 占比 ${(t3Proportion * 100).toFixed(1)}% > 阈值 ${T3_PROPORTION_THRESHOLD * 100}%`,
        baseline: DIAGNOSTIC_BASELINES.D3,
        suggestion: "T3 大变更占比偏高，建议加强需求拆分，将大任务拆分为多个 T1/T2 故事",
      });
    }
  }

  // D4: Process degradation — Gate B > 2 rounds (proxied by delivery failures + retries)
  const deliveryFailures = data.deliveryTrack.filter((r) => r.status === "failure").length;
  if (deliveryFailures >= DIAGNOSTIC_MIN_CONFIDENCE.D4) {
    diagnostics.push({
      id: "D4",
      label: DIAGNOSTIC_LABELS.D4,
      triggered: true,
      confidence: deliveryFailures,
      evidence: `${deliveryFailures} 次交付失败`,
      baseline: DIAGNOSTIC_BASELINES.D4,
      suggestion: "交付失败率偏高，检查 Gate A/B 验证步骤，确保测试先行",
    });
  }

  // D5: Dependency degradation — stage durations (proxied by retries)
  if (data.toolAudit.length >= DIAGNOSTIC_MIN_CONFIDENCE.D5) {
    const toolErrors = data.toolAudit.filter((r) => r.result === "failure").length;
    const errorRate = data.toolAudit.length > 0 ? toolErrors / data.toolAudit.length : 0;
    if (errorRate > 0.3) {
      diagnostics.push({
        id: "D5",
        label: DIAGNOSTIC_LABELS.D5,
        triggered: true,
        confidence: toolErrors,
        evidence: `工具调用失败率 ${(errorRate * 100).toFixed(1)}% (${toolErrors}/${data.toolAudit.length})`,
        baseline: DIAGNOSTIC_BASELINES.D5,
        suggestion: "工具调用失败率偏高，检查 agent 协作中的工具路由和错误处理",
      });
    }
  }

  // D6: Documentation staleness — consecutive degraded windows (proxied by missing self-improve)
  const retroPath = join(data.storyPath, `${readProjectName(findProjectRoot(data.storyPath))}-自改进复盘.md`);
  if (!existsSync(retroPath) && execCount >= DIAGNOSTIC_MIN_CONFIDENCE.D6) {
    diagnostics.push({
      id: "D6",
      label: DIAGNOSTIC_LABELS.D6,
      triggered: true,
      confidence: 1,
      evidence: "自改进复盘文档缺失",
      baseline: DIAGNOSTIC_BASELINES.D6,
      suggestion: "补齐自改进复盘文档，确保每个故事走完管线后产出复盘",
    });
  }

  // D7: Configuration drift — proposal closure rate < 50%
  if (data.proposals.length >= DIAGNOSTIC_MIN_CONFIDENCE.D7) {
    let closed = 0;
    for (const p of data.proposals) {
      if (p.status === "done" || p.status === "superseded") closed++;
    }
    const closureRate = data.proposals.length > 0 ? closed / data.proposals.length : 1;
    if (closureRate < 0.5) {
      diagnostics.push({
        id: "D7",
        label: DIAGNOSTIC_LABELS.D7,
        triggered: true,
        confidence: data.proposals.length - closed,
        evidence: `提案闭合率 ${(closureRate * 100).toFixed(1)}% < 50% (${closed}/${data.proposals.length})`,
        baseline: DIAGNOSTIC_BASELINES.D7,
        suggestion: "提案闭合率偏低，审查提案的可执行性，确保改进项能够落地",
      });
    }
  }

  return diagnostics;
}

// --- proposal generation ---

function generateProposals(storyName, diagnostics, storyPath) {
  if (diagnostics.length === 0) {
    console.log(green("[proposals] 无诊断触发，不生成提案"));
    return [];
  }

  // Dedup: skip diagnostics that already have an open proposal
  const existingProposalsPath = join(storyPath, PROPOSALS_DIR, PROPOSALS_FILE);
  const existingProposals = readJsonl(existingProposalsPath);
  const openDiags = new Set(
    existingProposals
      .filter((p) => p.status === "open")
      .map((p) => p.id.match(/D\d+/i)?.[0])
      .filter(Boolean)
  );

  const newDiags = diagnostics.filter((d) => !openDiags.has(d.id));
  if (newDiags.length < diagnostics.length) {
    const skipped = diagnostics.filter((d) => openDiags.has(d.id));
    console.log(dim(`  跳过 ${skipped.length} 个已有 open 提案的诊断: ${skipped.map((d) => d.id).join(", ")}`));
  }

  if (newDiags.length === 0) {
    console.log(dim("  所有诊断已有 open 提案，跳过"));
    return [];
  }

  const proposals = [];
  for (const diag of newDiags) {
    const type = DIAGNOSTIC_PROPOSAL_TYPE[diag.id] || "process";
    const id = `${storyName}-${diag.id}-${Date.now().toString(36)}`;

    proposals.push({
      id,
      date: new Date().toISOString(),
      title: `[${diag.id}] ${diag.label}: ${diag.evidence.slice(0, 80)}`,
      type,
      priority: diag.confidence >= 5 ? "P0" : diag.confidence >= 3 ? "P1" : "P2",
      status: "open",
      story_name: storyName,
      source_phase: "self-improve",
      actionable_command: diag.suggestion.slice(0, 120),
      linked_memory_ids: [],
      problem_source: diag.baseline,
      evidence: diag.evidence,
      current_state: diag.evidence,
      target_state: `解决 ${diag.label}`,
      s1_metrics: {},
      s2_metrics: { confidence: diag.confidence },
      feedback: [],
      eval_result: "pending",
    });
  }

  // Write to proposals.jsonl
  const proposalsDir = join(storyPath, PROPOSALS_DIR);
  if (!existsSync(proposalsDir)) mkdirSync(proposalsDir, { recursive: true });

  const proposalsPath = join(proposalsDir, PROPOSALS_FILE);
  for (const p of proposals) {
    appendFileSync(proposalsPath, JSON.stringify(p) + "\n", "utf-8");
  }

  return proposals;
}

// --- evaluation ---

function evaluateProposal(proposal, preMetrics, postMetrics) {
  // E1: Block rate change
  const blockImproved = postMetrics.block_rate < preMetrics.block_rate;
  const blockDegraded = postMetrics.block_rate > preMetrics.block_rate;

  // E2: P0 density change
  const p0Improved = postMetrics.p0_density < preMetrics.p0_density;
  const p0Degraded = postMetrics.p0_density > preMetrics.p0_density;

  let improvements = 0;
  let degradations = 0;
  if (blockImproved) improvements++;
  if (blockDegraded) degradations++;
  if (p0Improved) improvements++;
  if (p0Degraded) degradations++;

  const result = improvements > degradations ? "improved" :
                 degradations > improvements ? "degraded" : "neutral";

  return {
    proposal_id: proposal.id,
    pre_metrics: preMetrics,
    post_metrics: postMetrics,
    E1_block_rate: blockImproved ? "improved" : blockDegraded ? "degraded" : "unchanged",
    E2_p0_density: p0Improved ? "improved" : p0Degraded ? "degraded" : "unchanged",
    E3_bad_cases: "unknown",
    E4_overall: result,
  };
}

// --- materialization ---------------------------------------------------------

function deriveStoryDirName(proposal, projectRoot) {
  const diagMatch = proposal.id.match(/D\d+/i);
  const diagId = diagMatch ? diagMatch[0].toLowerCase() : "improve";
  const sourceStory = proposal.story_name || "unknown";
  const baseName = `${IMPROVE_STORY_PREFIX}-${sourceStory}-${diagId}`;

  const storyPanelPath = join(projectRoot, STORY_PANEL_DIR);
  const targetPath = join(storyPanelPath, baseName);

  if (!existsSync(targetPath)) return baseName;

  // Collision: append topic slug from title
  const titleSlug = proposal.title
    .replace(/\[.*?\]/g, "")
    .replace(/[^a-zA-Z0-9一-鿿]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30)
    .toLowerCase();
  const sluggedName = `${baseName}-${titleSlug}`;
  const sluggedPath = join(storyPanelPath, sluggedName);

  if (!existsSync(sluggedPath)) return sluggedName;

  // Still collision: append numeric suffix
  let counter = 1;
  while (existsSync(join(storyPanelPath, `${sluggedName}-${counter}`))) {
    counter++;
  }
  return `${sluggedName}-${counter}`;
}

function createRuiState(storyPath, proposal) {
  const now = new Date().toISOString();
  const ruiState = {
    story_name: storyPath.split("/").pop(),
    started_at: now,
    current_stage: "任务",
    status: "任务",
    blocked: false,
    block_reason: null,
    source_proposal_id: proposal.id,
    source_diagnostic: proposal.evidence,
    source_story: proposal.story_name,
    last_updated: now,
    change_history: [
      {
        timestamp: now,
        from_status: null,
        to_status: "任务",
        trigger: "self-improve materialize",
      },
    ],
  };

  const memoryDir = join(storyPath, ".memory");
  mkdirSync(memoryDir, { recursive: true });
  writeFileSync(join(memoryDir, "rui-state.json"), JSON.stringify(ruiState, null, 2) + "\n", "utf-8");
  return ruiState;
}

function generateBaselineDoc(proposal, projectName, storyDirName) {
  const diagId = proposal.id.match(/D\d+/i)?.[0] || "DIAG";
  const diagLabel = DIAGNOSTIC_LABELS[diagId] || "自改进诊断";
  const diagBaseline = DIAGNOSTIC_BASELINES[diagId] || "—";
  const now = new Date().toISOString().slice(0, 10);

  const content = `> | v1.0 | ${now} | auto | 🌿 main | ⏱️ — | 📎 [proposals.mjs](../../skills/rui/proposals.mjs) |
>
> **来源引用**: 自改进诊断自动生成，proposal ${proposal.id}，证据 Level C（统计数据）
>
> [§1 Story](#sec1-story) · [§2 诊断证据](#sec2-evidence) · [§3 目标状态](#sec3-target) · [§L 自改进溯源](#secL-trace)
>
> ---
>
> ### §0 基线声明
>
> > **自改进需求基线 (Self-Improvement Baseline)**: 本文档由 D0-D7 诊断引擎自动生成，定义改进任务的 WHAT 和 WHY。所有后续实施决策必须可追溯至本文档的诊断证据。
>
> ---
>
> ### 需求概述
>
> ${proposal.evidence}。${proposal.title}
>
> ### 效果示意
>
> \`\`\`mermaid
> flowchart LR
>     NOW["当前状态<br/>${(proposal.current_state || proposal.evidence).slice(0, 30)}"]:::pain
>     NOW --> GOAL["目标状态<br/>${(proposal.target_state || "改进完成").slice(0, 30)}"]:::goal
>
>     classDef pain fill:#ffebee,stroke:#c62828;
>     classDef goal fill:#e8f5e9,stroke:#2e7d32;
> \`\`\`
>
> ### 主要价值
>
> - 🔍 **${diagLabel}**: ${proposal.evidence}
> - 📊 **提案类型**: ${proposal.type} | **优先级**: ${proposal.priority}
> - 🎯 **目标**: ${proposal.target_state}
> - 📎 **问题源**: ${proposal.problem_source}
>
> ---
>
> <a id="sec1-story"></a>
>
> ## §1 Story
>
> | 字段 | 内容 |
> |------|------|
> | 作为 | 项目维护者 |
> | 我想要 | ${proposal.actionable_command} |
> | 以便 | 解决 ${diagLabel}，提升项目健康度 |
> | 优先级 | ${proposal.priority} |
> | 范围边界 | ${proposal.problem_source} 相关配置与文档 |
> | 依赖 | 执行记忆数据可用，诊断基线可访问 |
> | 来源 | self-improve / ${diagId} / ${proposal.id} |
>
> ---
>
> <a id="sec2-evidence"></a>
>
> ## §2 诊断证据
>
> | 诊断 | 标签 | 证据 | 基线依据 |
> |------|------|------|---------|
> | ${diagId} | ${diagLabel} | ${proposal.evidence} | ${diagBaseline} |
>
> ---
>
> <a id="sec3-target"></a>
>
> ## §3 目标状态
>
> ${proposal.target_state}
>
> **可执行命令**: \`${proposal.actionable_command}\`
>
> ---
>
> <a id="secL-trace"></a>
>
> ## §L 自改进溯源
>
> | 字段 | 值 |
> |------|-----|
> | proposal_id | ${proposal.id} |
> | 生成日期 | ${proposal.date} |
> | 来源阶段 | ${proposal.source_phase} |
> | 来源故事 | ${proposal.story_name} |
> | 问题源 | ${proposal.problem_source} |
> | 置信度 | ${(proposal.s2_metrics || {}).confidence || "—"} |
> | 评估状态 | ${proposal.eval_result} |
> `;

  const storyDir = join(findProjectRoot(process.cwd()), STORY_PANEL_DIR, storyDirName);
  mkdirSync(storyDir, { recursive: true });
  const docPath = join(storyDir, `${projectName}-故事任务.md`);
  writeFileSync(docPath, content, "utf-8");
  return docPath;
}

function updateProposalRecord(proposalsPath, proposal, storyDirName) {
  if (!existsSync(proposalsPath)) return;

  try {
    const lines = readFileSync(proposalsPath, "utf-8").trim().split("\n").filter(Boolean);
    const updated = lines.map((line) => {
      const parsed = JSON.parse(line);
      if (parsed.id === proposal.id) {
        parsed.materialized_story_dir = storyDirName;
        parsed.materialized_at = new Date().toISOString();
      }
      return JSON.stringify(parsed);
    });
    writeFileSync(proposalsPath, updated.join("\n") + "\n", "utf-8");
  } catch {
    console.error(`  ⚠️  无法更新 proposal 记录: ${proposalsPath}`);
  }
}

function materializeProposal(proposal, projectRoot, projectName, dryRun) {
  const storyDirName = deriveStoryDirName(proposal, projectRoot);
  const storyPath = join(projectRoot, STORY_PANEL_DIR, storyDirName);

  if (dryRun) {
    return { proposalId: proposal.id, storyDirName, storyPath, dryRun: true };
  }

  // Create story directory and .memory/
  mkdirSync(storyPath, { recursive: true });
  createRuiState(storyPath, proposal);
  const docPath = generateBaselineDoc(proposal, projectName, storyDirName);

  // Update proposal record with materialized story dir
  const proposalsDir = join(projectRoot, STORY_PANEL_DIR, proposal.story_name, PROPOSALS_DIR);
  updateProposalRecord(join(proposalsDir, PROPOSALS_FILE), proposal, storyDirName);

  return { proposalId: proposal.id, storyDirName, storyPath, docPath, dryRun: false };
}

function cmdMaterialize(opts) {
  const projectRoot = findProjectRoot(process.cwd());
  const projectName = readProjectName(projectRoot);
  const minPriority = opts.minPriority || DEFAULT_MIN_PRIORITY;
  const minPriorityOrder = PRIORITY_ORDER[minPriority] !== undefined ? PRIORITY_ORDER[minPriority] : PRIORITY_ORDER.P2;

  const storyPath = join(projectRoot, STORY_PANEL_DIR, opts.story);
  const proposalsDir = join(storyPath, PROPOSALS_DIR);
  const proposalsPath = join(proposalsDir, PROPOSALS_FILE);

  if (!existsSync(proposalsPath)) {
    console.log("");
    console.log(dim(`  无提案文件: ${proposalsPath}`));
    console.log("");
    return;
  }

  const allProposals = readJsonl(proposalsPath);
  const candidates = allProposals.filter((p) => {
    if (p.status !== "open") return false;
    if (p.materialized_story_dir) return false;
    const pOrder = PRIORITY_ORDER[p.priority];
    if (pOrder === undefined || pOrder > minPriorityOrder) return false;
    return true;
  });

  if (candidates.length === 0) {
    console.log("");
    console.log(dim("  无可实例化的提案（所有 open 提案已实例化或不满足优先级条件）"));
    console.log("");
    return;
  }

  console.log("");
  console.log(bold(`实例化提案 → 故事任务目录 · ${opts.story}`));
  console.log(`  候选: ${candidates.length} 条（open + 未实例化 + ≥${minPriority}）`);
  if (opts.dryRun) console.log(`  ${yellow("DRY RUN — 仅预览，不创建")}`);
  console.log("");

  const results = [];
  for (const p of candidates) {
    const result = materializeProposal(p, projectRoot, projectName, opts.dryRun);
    results.push(result);
    if (result.dryRun) {
      console.log(`  ${dim("→")} ${result.storyDirName} ${dim("(dry-run)")}`);
    } else {
      console.log(`  ${green("✓")} ${result.storyDirName}`);
      console.log(`    ${dim(result.docPath)}`);
    }
  }

  if (!opts.dryRun) {
    console.log("");
    console.log(bold("rui-import 同步"));
    try {
      execSync("node skills/rui-import/sync.mjs", { cwd: projectRoot, stdio: "inherit" });
    } catch {
      console.log(yellow("  ⚠️  rui-import 同步失败，可手动重试: node skills/rui-import/sync.mjs"));
    }
  }

  console.log("");
  console.log(green(`✅ 已实例化 ${results.length} 条提案`));
  if (!opts.dryRun) {
    console.log(dim(`  查看: node skills/rui-story/status.mjs dashboard`));
  }
  console.log("");
}

// --- commands ----------------------------------------------------------------

function cmdGenerate(opts) {
  const projectRoot = findProjectRoot(process.cwd());
  const data = collectStoryData(projectRoot, opts.story);

  if (data.allExec.length < MIN_EXEC_MEMORIES) {
    console.log("");
    console.log(yellow(`[proposals] ⚠️  数据不足: ${data.allExec.length} 条执行记忆，需要 ≥ ${MIN_EXEC_MEMORIES} 条`));
    console.log(yellow("  降级: 跳过 E1-E4 评估，仅生成观察记录"));
    console.log("");

    if (data.allExec.length === 0) {
      console.log(dim("  无任何执行数据，无法生成提案"));
      console.log("");
      return;
    }
  }

  console.log(`[proposals] 采集数据: exec=${data.allExec.length} audit=${data.toolAudit.length} delivery=${data.deliveryTrack.length} proposals=${data.proposals.length}`);
  console.log(`[proposals] 运行 D0-D7 诊断...`);

  const diagnostics = runDiagnostics(data);

  if (diagnostics.length === 0) {
    console.log(green("  ✅ 无诊断触发"));
    console.log("");
    return;
  }

  console.log("");
  console.log(bold("诊断结果"));
  console.log("────────");
  for (const d of diagnostics) {
    console.log(`  ${yellow(d.id)} ${d.label}: ${d.evidence}`);
    console.log(`      提案: ${d.suggestion}`);
  }
  console.log("");

  const proposals = generateProposals(opts.story, diagnostics, data.storyPath);
  console.log(green(`✅ 已生成 ${proposals.length} 条提案`));

  for (const p of proposals) {
    console.log(`  ${p.id}: [${p.type}] ${p.title}`);
  }
  console.log("");

  if (opts.materialize) {
    cmdMaterialize(opts);
  }
}

function cmdList(opts) {
  const projectRoot = findProjectRoot(process.cwd());
  const storyPath = join(projectRoot, STORY_PANEL_DIR, opts.story || "");
  const proposalsDir = join(storyPath, PROPOSALS_DIR);

  if (!existsSync(proposalsDir)) {
    console.log("");
    console.log(dim(`  .improvement/ 目录不存在: ${storyPath}`));
    console.log("");
    return;
  }

  const proposals = readJsonl(join(proposalsDir, PROPOSALS_FILE));

  if (opts.status && opts.status !== "all") {
    const filtered = proposals.filter((p) => p.status === opts.status);

    console.log("");
    console.log(bold(`提案列表 · ${opts.story} · status=${opts.status}`));
    console.log("══════════════════════════════");
    console.log("");

    if (filtered.length === 0) {
      console.log(dim(`  无 ${opts.status} 状态的提案`));
      console.log("");
      return;
    }

    for (const p of filtered) {
      const statusColor = p.status === "open" ? yellow : p.status === "done" ? green : dim;
      console.log(`  ${p.id}`);
      console.log(`    类型: ${p.type} | 优先级: ${p.priority} | 状态: ${statusColor(p.status)}`);
      console.log(`    标题: ${p.title}`);
      console.log(`    来源: ${p.problem_source} | 评估: ${p.eval_result}`);
      console.log("");
    }
    console.log(`  共 ${filtered.length} 条`);
    console.log("");
  } else {
    console.log("");
    console.log(bold(`提案列表 · ${opts.story}`));
    console.log("══════════════════");
    console.log("");

    if (proposals.length === 0) {
      console.log(dim("  无提案"));
      console.log("");
      return;
    }

    const statusCounts = {};
    for (const p of proposals) {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    }

    for (const [status, count] of Object.entries(statusCounts)) {
      const statusColor = status === "open" ? yellow : status === "done" ? green : dim;
      console.log(`  ${statusColor(status)}: ${count}`);
    }
    console.log("");
    console.log(`  共 ${proposals.length} 条提案`);
    console.log("");
  }
}

function cmdEvaluate(opts) {
  console.log("");
  console.log(yellow("[proposals] E1-E4 评估需要前后各 ≥3 条执行记忆，当前数据不足"));
  console.log(yellow("  跳过硬评估，提案状态保持 pending"));
  console.log("");
  console.log(dim("  提示: 运行更多故事管线积累数据后，重新运行 evaluate"));
  console.log("");
}

function cmdUpgradeCandidates(opts) {
  const projectRoot = findProjectRoot(process.cwd());
  const panelDir = join(projectRoot, STORY_PANEL_DIR);

  // Collect proposals from all stories
  const allProposals = [];
  if (existsSync(panelDir)) {
    try {
      const dirs = readdirSync(panelDir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith("."));
      for (const d of dirs) {
        const proposalsPath = join(panelDir, d.name, PROPOSALS_DIR, PROPOSALS_FILE);
        const proposals = readJsonl(proposalsPath);
        for (const p of proposals) {
          allProposals.push({ ...p, _dir: d.name });
        }
      }
    } catch { /* skip */ }
  }

  console.log("");
  console.log(bold("经验技能化候选"));
  console.log("══════════════");
  console.log("");

  if (allProposals.length === 0) {
    console.log(dim("  无提案数据"));
    console.log("");
    return;
  }

  // Count by type across stories
  const typeStoryCounts = {};
  for (const p of allProposals) {
    if (!typeStoryCounts[p.type]) typeStoryCounts[p.type] = new Set();
    typeStoryCounts[p.type].add(p._dir || p.story_name);
  }

  const upgradeMap = {
    process: "rules/code-pipeline.md",
    quality: "agents/tester.md 或 agents/coder.md",
    refactor: "rules/code-pipeline.md §深度模块",
    security: "agents/security.md P0 约束",
    skill: "skills/ 或 rules/ 新条目",
  };

  const thresholdMap = {
    process: 3,
    quality: 3,
    refactor: 3,
    security: 1,
    skill: 2,
  };

  let foundCandidate = false;
  for (const [type, stories] of Object.entries(typeStoryCounts)) {
    const threshold = thresholdMap[type] || 3;
    const storyList = [...stories].sort();
    const count = storyList.length;

    if (count >= threshold) {
      foundCandidate = true;
      console.log(green(`  ✅ ${type}: ${count} 个故事触发 (${storyList.join(", ")}) ≥ 阈值 ${threshold}`));
      console.log(`     升级目标: ${upgradeMap[type] || "—"}`);
      console.log("");
    }
  }

  if (!foundCandidate) {
    console.log(dim("  无满足升级阈值的提案类型"));
    console.log("");
    console.log(dim("  升级阈值: process/quality/refactor ≥3 故事, security ≥1 故事, skill ≥2 故事"));
    console.log("");
    return;
  }

  console.log(bold("  建议执行经验技能化升级"));
  console.log("");
}

// --- main ---
function main() {
  const opts = parseArgs();

  switch (opts.command) {
    case "generate":
      if (!opts.story) {
        console.error("proposals: generate 需要 --story=<name>");
        process.exit(0);
      }
      cmdGenerate(opts);
      break;
    case "list":
      if (!opts.story) {
        console.error("proposals: list 需要 --story=<name>");
        process.exit(0);
      }
      cmdList(opts);
      break;
    case "evaluate":
      cmdEvaluate(opts);
      break;
    case "upgrade-candidates":
      cmdUpgradeCandidates(opts);
      break;
    case "materialize":
      if (!opts.story) {
        console.error("proposals: materialize 需要 --story=<name>");
        process.exit(0);
      }
      cmdMaterialize(opts);
      break;
    default:
      console.error(`proposals: 未知命令 "${opts.command}"。可用: generate | list | evaluate | upgrade-candidates | materialize`);
      process.exit(0);
  }
}

main();
