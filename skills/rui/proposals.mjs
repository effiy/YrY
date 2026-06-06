#!/usr/bin/env node
// proposals — D0-D7 diagnostic engine and proposal generator for self-improve
// 用法: node skills/rui/proposals.mjs <command> [args]
// 命令: generate | list | evaluate | upgrade-candidates

import { join, resolve, dirname } from "node:path";
import { existsSync, readFileSync, readdirSync, mkdirSync, appendFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

// --- constants (imported from shared lib) --------------------------------------
import {
  NODE_ARGV_OFFSET,
  STORY_PANEL_DIR,
  PROPOSALS_DIR,
  PROPOSALS_FILE,
  EXEC_MEMORY_FILE,
  TOOL_AUDIT_FILE,
  DELIVERY_TRACK_FILE,
  RUI_STATE_FILE,
  IMPROVE_STORY_PREFIX,
  DEFAULT_MIN_PRIORITY,
  PRIORITY_ORDER,
  MIN_EXEC_MEMORIES,
  BLOCK_RATE_THRESHOLD,
  P0_DENSITY_MULTIPLIER,
  T3_PROPORTION_THRESHOLD,
  STAGE_DURATION_MULTIPLIER,
  PROPOSAL_TYPES,
  DIAGNOSTIC_PROPOSAL_TYPE,
  DIAGNOSTIC_LABELS,
  DIAGNOSTIC_BASELINES,
  DIAGNOSTIC_MIN_CONFIDENCE,
  UPGRADE_THRESHOLDS,
  UPGRADE_TARGETS,
  TOOL_ERROR_RATE_THRESHOLD,
  GATE_B_MAX_ROUNDS,
  PROPOSAL_CLOSURE_MIN_RATE,
  STATUS_HISTORY_FILE,
  MEMORY_DIR,
  COMPRESSED_MEMORY_FILE,
} from "../../lib/constants.mjs";

const ARGV_OFFSET = NODE_ARGV_OFFSET;

const MATERIALIZED_FIELD = "materialized_story_dir";

// --- TTY helpers -------------------------------------------------------------
import { bold, dim, red, green, yellow, cyan } from "../../lib/tty.mjs";
import { readProjectName } from "../../lib/fs.mjs";
import { readJsonl, readJson } from "../../lib/fs.mjs";

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
import { findProjectRoot } from "../../lib/fs.mjs";

// --- data readers ------------------------------------------------------------



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
  const statusHistory = readJsonl(join(storyPath, STATUS_HISTORY_FILE));

  // Snapshot: collect git evidence as required by rules/self-improve.md
  let gitSnapshot = null;
  let codeSnapshot = null;
  try {
    const gitRoot = projectRoot;
    // Git diff stat since last story completion marker
    const diffStat = execSync("git diff --stat HEAD", { cwd: gitRoot, encoding: "utf-8", timeout: 5000 }).trim();
    const changedFiles = execSync("git diff --name-only HEAD", { cwd: gitRoot, encoding: "utf-8", timeout: 5000 }).trim().split("\n").filter(Boolean);
    const diffShort = execSync("git diff --shortstat HEAD", { cwd: gitRoot, encoding: "utf-8", timeout: 5000 }).trim();

    gitSnapshot = {
      branch: execSync("git branch --show-current", { cwd: gitRoot, encoding: "utf-8", timeout: 3000 }).trim(),
      shortStat: diffShort,
      changedFiles,
      fileCount: changedFiles.length,
      diffSummary: diffStat.slice(0, 2000),
      collectedAt: new Date().toISOString(),
    };

    // Code snapshot: large files and dependency hotspots
    const largeFiles = changedFiles
      .filter((f) => existsSync(join(gitRoot, f)))
      .map((f) => {
        try {
          const stat = readFileSync(join(gitRoot, f), "utf-8");
          return { file: f, lines: stat.split("\n").length };
        } catch { return { file: f, lines: -1 }; }
      })
      .filter((f) => f.lines > 500);

    codeSnapshot = {
      largeFiles,
      hotFiles: changedFiles.filter((f) => changedFiles.filter((g) => g !== f && f.split("/")[0] === g.split("/")[0]).length >= 2).slice(0, 10),
    };
  } catch {
    gitSnapshot = { error: "git snapshot 采集失败", collectedAt: new Date().toISOString() };
    codeSnapshot = { error: "代码快照采集失败" };
  }

  return { storyName, storyPath, allExec, toolAudit, deliveryTrack, ruiState, proposals, statusHistory, gitSnapshot, codeSnapshot };
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

  // D4: Process degradation — Gate B > 2 rounds (from status history retries)
  if (data.statusHistory && data.statusHistory.length >= DIAGNOSTIC_MIN_CONFIDENCE.D4) {
    // Count phase retries where status went backward (from later to earlier stage)
    const forwardOrder = ["任务", "设计", "实施", "测试", "报告", "改进"];
    let gateBRounds = 0;
    for (const entry of data.statusHistory) {
      const fromIdx = forwardOrder.indexOf(entry.from_status);
      const toIdx = forwardOrder.indexOf(entry.to_status);
      // A retry (going backward) from 测试 or later = Gate B retry
      if (fromIdx >= forwardOrder.indexOf("测试") && toIdx < fromIdx) {
        gateBRounds++;
      }
    }
    // Track delivery failures too, but primary signal is Gate B rounds
    const deliveryFailures = data.deliveryTrack.filter((r) => r.status === "failure").length;
    if (gateBRounds > GATE_B_MAX_ROUNDS) {
      diagnostics.push({
        id: "D4",
        label: DIAGNOSTIC_LABELS.D4,
        triggered: true,
        confidence: gateBRounds,
        evidence: `Gate B ${gateBRounds} 轮回溯 > ${GATE_B_MAX_ROUNDS} 轮阈值${deliveryFailures > 0 ? `（交付失败 ${deliveryFailures} 次）` : ""}`,
        baseline: DIAGNOSTIC_BASELINES.D4,
        suggestion: `Gate B 回溯 ${gateBRounds} 轮，测试先行不足。建议在 Gate A 加强测试用例设计，减少 Gate B 回溯`,
      });
    } else if (deliveryFailures >= DIAGNOSTIC_MIN_CONFIDENCE.D4 && gateBRounds === 0) {
      // Fallback: if no status history, use delivery failures as proxy
      diagnostics.push({
        id: "D4",
        label: DIAGNOSTIC_LABELS.D4,
        triggered: true,
        confidence: deliveryFailures,
        evidence: `${deliveryFailures} 次交付失败（无状态历史数据，使用交付追踪代理）`,
        baseline: DIAGNOSTIC_BASELINES.D4,
        suggestion: "交付失败率偏高，检查 Gate A/B 验证步骤，确保测试先行",
      });
    }
  } else {
    // No status history — fall back to delivery failures
    const deliveryFailures = data.deliveryTrack.filter((r) => r.status === "failure").length;
    if (deliveryFailures >= DIAGNOSTIC_MIN_CONFIDENCE.D4) {
      diagnostics.push({
        id: "D4",
        label: DIAGNOSTIC_LABELS.D4,
        triggered: true,
        confidence: deliveryFailures,
        evidence: `${deliveryFailures} 次交付失败（状态历史数据不足，使用交付追踪代理）`,
        baseline: DIAGNOSTIC_BASELINES.D4,
        suggestion: "交付失败率偏高，检查 Gate A/B 验证步骤，确保测试先行",
      });
    }
  }

  // D5: Dependency degradation — stage durations (proxied by retries)
  if (data.toolAudit.length >= DIAGNOSTIC_MIN_CONFIDENCE.D5) {
    const toolErrors = data.toolAudit.filter((r) => r.result === "failure").length;
    const errorRate = data.toolAudit.length > 0 ? toolErrors / data.toolAudit.length : 0;
    if (errorRate > TOOL_ERROR_RATE_THRESHOLD) {
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

  // D6: Documentation staleness — check document vs code consistency
  if (execCount >= DIAGNOSTIC_MIN_CONFIDENCE.D6) {
    const projectRoot = findProjectRoot(data.storyPath);
    const projectName = readProjectName(projectRoot);
    let docIssues = [];

    // Check 1: Scene docs freshness — compare doc mtime vs git last modified
    try {
      const storyDir = data.storyPath;
      if (existsSync(storyDir)) {
        const entries = readdirSync(storyDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && entry.name.startsWith("场景")) {
            const sceneDir = join(storyDir, entry.name);
            const mdFiles = readdirSync(sceneDir).filter((f) => f.endsWith(".md") || f.endsWith(".html"));
            for (const mf of mdFiles) {
              const docPath = join(sceneDir, mf);
              try {
                const docStat = readFileSync(docPath, "utf-8");
                // Check if document has §4 自改进 section (required for completed scenes)
                const hasSelfImprove = /§4\s*自改进|自改进复盘/i.test(docStat);
                const hasEvidence = /证据 Level|snapshot|Git diff|代码快照/.test(docStat);
                if (!hasSelfImprove && docStat.length > 500) {
                  docIssues.push(`${entry.name}/${mf}: 缺少 §4 自改进章节`);
                }
                if (!hasEvidence && /§2\s*实施报告|实施报告/.test(docStat)) {
                  docIssues.push(`${entry.name}/${mf}: §2 实施报告缺少证据引用`);
                }
              } catch { /* skip unreadable files */ }
            }
          }
        }
      }
    } catch { /* skip */ }

    // Check 2: Retro document existence
    const retroPath = join(data.storyPath, `${projectName}-自改进复盘.md`);
    const retroMissing = !existsSync(retroPath);

    // Check 3: proposals.jsonl existence as a proxy for self-improve execution
    const proposalsPath = join(data.storyPath, PROPOSALS_DIR, PROPOSALS_FILE);
    const noProposals = !existsSync(proposalsPath) || readJsonl(proposalsPath).length === 0;

    if (docIssues.length > 0 || retroMissing || (noProposals && execCount >= MIN_EXEC_MEMORIES)) {
      const evidenceParts = [];
      if (docIssues.length > 0) evidenceParts.push(`${docIssues.length} 个场景文档缺自改进章节`);
      if (retroMissing) evidenceParts.push("自改进复盘文档缺失");
      if (noProposals && execCount >= MIN_EXEC_MEMORIES) evidenceParts.push("无提案记录");
      const confidence = docIssues.length + (retroMissing ? 1 : 0) + (noProposals ? 1 : 0);

      diagnostics.push({
        id: "D6",
        label: DIAGNOSTIC_LABELS.D6,
        triggered: true,
        confidence,
        evidence: evidenceParts.join("；"),
        baseline: DIAGNOSTIC_BASELINES.D6,
        suggestion: docIssues.length > 0
          ? `补齐 ${docIssues.length} 个场景的 §4 自改进章节，确保文档与代码同步`
          : "补齐自改进复盘文档和提案记录，确保每个故事走完管线后产出复盘",
      });
    }
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

function generateProposals(storyName, diagnostics, storyPath, snapshotData) {
  if (diagnostics.length === 0) {
    console.log(green("[proposals] 无诊断触发，不生成提案"));
    return [];
  }

  // Enforce snapshot evidence requirement (rules/self-improve.md: "无 snapshot 不出提案")
  const hasGitSnapshot = snapshotData && snapshotData.gitSnapshot && !snapshotData.gitSnapshot.error;
  const hasCodeSnapshot = snapshotData && snapshotData.codeSnapshot && !snapshotData.codeSnapshot.error;

  if (!hasGitSnapshot && !hasCodeSnapshot) {
    console.log(yellow("[proposals] ⚠️  无 snapshot 证据，按规则不产出提案"));
    console.log(dim("  规则: rules/self-improve.md — 提案必须有 snapshot 证据支撑"));
    console.log("");
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
      snapshot: {
        git: snapshotData?.gitSnapshot || null,
        code: snapshotData?.codeSnapshot || null,
      },
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
>     NOW["当前状态<br/>${(proposal.current_state || proposal.evidence).slice(0, 30)}"]
>     NOW --> GOAL["目标状态<br/>${(proposal.target_state || "改进完成").slice(0, 30)}"]
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
> 作为项目维护者，我想要 ${proposal.actionable_command}，以便解决 ${diagLabel}，提升项目健康度。优先级 ${proposal.priority}。范围边界：${proposal.problem_source} 相关配置与文档。依赖：执行记忆数据可用，诊断基线可访问。来源：self-improve / ${diagId} / ${proposal.id}。
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
  if (data.gitSnapshot && !data.gitSnapshot.error) {
    console.log(`[proposals] Git 快照: ${data.gitSnapshot.fileCount} 个变更文件, ${data.gitSnapshot.shortStat}`);
  }
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

  const snapshotData = { gitSnapshot: data.gitSnapshot, codeSnapshot: data.codeSnapshot };
  const proposals = generateProposals(opts.story, diagnostics, data.storyPath, snapshotData);
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
  const projectRoot = findProjectRoot(process.cwd());

  if (!opts.id) {
    console.log("");
    console.log(yellow("[proposals] evaluate 需要 --id=<proposal_id>"));
    console.log("");
    return;
  }

  // Find the proposal across all stories
  let targetProposal = null;
  let targetStoryPath = null;
  const storyDirs = [];
  try {
    const panelDir = join(projectRoot, STORY_PANEL_DIR);
    if (existsSync(panelDir)) {
      const entries = readdirSync(panelDir, { withFileTypes: true });
      for (const e of entries) {
        if (e.isDirectory() && !e.name.startsWith(".")) {
          storyDirs.push({ name: e.name, path: join(panelDir, e.name) });
        }
      }
    }
  } catch { /* skip */ }

  for (const sd of storyDirs) {
    const proposalsPath = join(sd.path, PROPOSALS_DIR, PROPOSALS_FILE);
    const proposals = readJsonl(proposalsPath);
    const found = proposals.find((p) => p.id === opts.id);
    if (found) {
      targetProposal = found;
      targetStoryPath = sd.path;
      break;
    }
  }

  if (!targetProposal) {
    console.log("");
    console.log(yellow(`[proposals] 未找到提案: ${opts.id}`));
    console.log("");
    return;
  }

  // Collect execution memories for pre/post windows
  const allExec = [];
  for (const sd of storyDirs) {
    const storyExec = readJsonl(join(sd.path, EXEC_MEMORY_FILE));
    allExec.push(...storyExec);
  }
  // Also check root .memory
  const rootExec = readJsonl(join(projectRoot, MEMORY_DIR, "execution-memory.jsonl"));
  allExec.push(...rootExec);

  const proposalDate = new Date(targetProposal.date).getTime();

  // Pre-window: memories before proposal date (up to 12 most recent)
  const preMemories = allExec
    .filter((r) => {
      const ts = r.timestamp ? new Date(r.timestamp).getTime() : 0;
      return ts < proposalDate;
    })
    .slice(-12);

  // Post-window: memories after proposal date (up to 12 most recent)
  const postMemories = allExec
    .filter((r) => {
      const ts = r.timestamp ? new Date(r.timestamp).getTime() : 0;
      return ts >= proposalDate;
    })
    .slice(0, 12);

  const preCount = preMemories.length;
  const postCount = postMemories.length;

  console.log("");
  console.log(bold(`E1-E4 评估 · ${targetProposal.id}`));
  console.log("══════════════════════════════");
  console.log(`  提案类型: ${targetProposal.type} | 优先级: ${targetProposal.priority}`);
  console.log(`  前后记忆: pre=${preCount} post=${postCount} (需要各 ≥${MIN_EXEC_MEMORIES})`);
  console.log("");

  if (preCount < MIN_EXEC_MEMORIES || postCount < MIN_EXEC_MEMORIES) {
    console.log(yellow("  ⚠️  数据不足，无法完成硬评估"));
    console.log(yellow("  降级: 仅生成观察记录，提案状态保持 open"));
    console.log("");
    console.log(dim("  提示: 运行更多故事管线积累数据后，重新运行 evaluate"));
    console.log("");

    // Write partial observation to proposal feedback
    targetProposal.feedback.push({
      date: new Date().toISOString(),
      type: "observation",
      note: `数据不足 (pre=${preCount}, post=${postCount})，跳过 E1-E4 硬评估`,
    });
    targetProposal.eval_result = "insufficient_data";
    return;
  }

  // Compute pre metrics
  function computeMetrics(memories) {
    let blockedCount = 0;
    let totalP0 = 0, totalIssues = 0;
    let t3Count = 0;
    const agentCounts = {};

    for (const r of memories) {
      if (r.was_blocked) blockedCount++;
      const qi = r.quality_issues || {};
      totalP0 += (qi.P0 || []).length;
      totalIssues += (qi.P0 || []).length + (qi.P1 || []).length + (qi.P2 || []).length;
      if (r.planned_change_level === "T3" || r.actual_change_level === "T3") t3Count++;
      const agents = r.agents_called || [];
      for (const a of agents) {
        agentCounts[a] = (agentCounts[a] || 0) + 1;
      }
    }

    return {
      count: memories.length,
      block_rate: memories.length > 0 ? blockedCount / memories.length : 0,
      p0_density: totalIssues > 0 ? totalP0 / totalIssues : 0,
      t3_proportion: memories.length > 0 ? t3Count / memories.length : 0,
      agent_participation: agentCounts,
    };
  }

  const preMetrics = computeMetrics(preMemories);
  const postMetrics = computeMetrics(postMemories);

  // E1: Block rate
  const e1_improved = postMetrics.block_rate < preMetrics.block_rate;
  const e1_degraded = postMetrics.block_rate > preMetrics.block_rate;

  // E2: P0 density
  const e2_improved = postMetrics.p0_density < preMetrics.p0_density;
  const e2_degraded = postMetrics.p0_density > preMetrics.p0_density;

  // E3: Bad cases — check if bad_cases from pre-window still appear in post-window
  const preBadCases = new Set();
  for (const r of preMemories) {
    const bc = r.bad_cases || [];
    for (const b of bc) {
      if (b.lesson) preBadCases.add(b.lesson);
    }
  }
  const postBadCases = new Set();
  for (const r of postMemories) {
    const bc = r.bad_cases || [];
    for (const b of bc) {
      if (b.lesson) postBadCases.add(b.lesson);
    }
  }
  const stillPresent = [...preBadCases].filter((bc) => postBadCases.has(bc));
  const resolved = [...preBadCases].filter((bc) => !postBadCases.has(bc));
  const e3_improved = resolved.length > 0;
  const e3_degraded = stillPresent.length > 0;

  // E4: Overall
  let improvements = 0, degradations = 0;
  if (e1_improved) improvements++; else if (e1_degraded) degradations++;
  if (e2_improved) improvements++; else if (e2_degraded) degradations++;
  if (e3_improved) improvements++; else if (e3_degraded) degradations++;

  const overall = improvements > degradations ? "improved" :
                  degradations > improvements ? "degraded" : "neutral";

  // Display results
  console.log(bold("  评估结果"));
  console.log("  ─────────");
  console.log(`  E1 阻断率:   pre=${(preMetrics.block_rate * 100).toFixed(1)}% → post=${(postMetrics.block_rate * 100).toFixed(1)}%  ${e1_improved ? green("↓改善") : e1_degraded ? red("↑退化") : dim("→持平")}`);
  console.log(`  E2 P0 密度:  pre=${(preMetrics.p0_density * 100).toFixed(1)}% → post=${(postMetrics.p0_density * 100).toFixed(1)}%  ${e2_improved ? green("↓改善") : e2_degraded ? red("↑退化") : dim("→持平")}`);
  console.log(`  E3 不良案例: 已解决=${resolved.length} 仍存在=${stillPresent.length}  ${e3_improved && !e3_degraded ? green("✓改善") : e3_degraded ? red("✗退化") : dim("→无数据")}`);
  console.log(`  E4 综合:     ${overall === "improved" ? green("改善 ✅") : overall === "degraded" ? red("退化 ⚠️") : dim("中性")}`);
  console.log("");

  // Update proposal status
  const evalResult = {
    proposal_id: targetProposal.id,
    evaluated_at: new Date().toISOString(),
    pre_memory_count: preCount,
    post_memory_count: postCount,
    E1: e1_improved ? "improved" : e1_degraded ? "degraded" : "unchanged",
    E2: e2_improved ? "improved" : e2_degraded ? "degraded" : "unchanged",
    E3: e3_improved && !e3_degraded ? "improved" : e3_degraded ? "degraded" : "unchanged",
    E4: overall,
    resolved_bad_cases: resolved,
    still_present_bad_cases: stillPresent,
  };

  targetProposal.feedback.push({
    date: new Date().toISOString(),
    type: "evaluation",
    result: evalResult,
  });
  targetProposal.eval_result = overall;

  if (overall === "improved") {
    targetProposal.status = "done";
    console.log(green("  ✅ 提案闭合 — 改善 > 退化"));
  } else if (overall === "degraded") {
    console.log(red("  ⚠️  提案退化 — 建议回退或重新提案"));
  }

  // Write back to proposals.jsonl
  const proposalsPath = join(targetStoryPath, PROPOSALS_DIR, PROPOSALS_FILE);
  if (existsSync(proposalsPath)) {
    try {
      const lines = readFileSync(proposalsPath, "utf-8").trim().split("\n").filter(Boolean);
      const updated = lines.map((line) => {
        const parsed = JSON.parse(line);
        if (parsed.id === targetProposal.id) {
          return JSON.stringify(Object.assign(parsed, {
            status: targetProposal.status,
            eval_result: targetProposal.eval_result,
            feedback: targetProposal.feedback,
          }));
        }
        return JSON.stringify(parsed);
      });
      writeFileSync(proposalsPath, updated.join("\n") + "\n", "utf-8");
      console.log(dim(`  已更新 proposals.jsonl`));
    } catch (e) {
      console.log(yellow(`  ⚠️  更新 proposals.jsonl 失败: ${e.message}`));
    }
  }

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

  const upgradeMap = UPGRADE_TARGETS;
  const thresholdMap = UPGRADE_THRESHOLDS;

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
