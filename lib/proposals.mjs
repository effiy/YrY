#!/usr/bin/env node
/**
 * proposals — D0-D7 diagnostic engine and proposal generator for self-improve.
 * CLI entry point: node lib/proposals.mjs <command> [args]
 * Commands: generate | list | evaluate | upgrade-candidates | materialize
 * Orchestrates: engine/diagnostics.mjs · engine/evaluate.mjs · engine/materialize.mjs · engine/upgrade.mjs
 */

import { join } from "node:path";
import { existsSync, readFileSync, readdirSync, mkdirSync, appendFileSync } from "node:fs";
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
  MEMORY_DIR,
  MIN_EXEC_MEMORIES,
  GIT_TIMEOUT_MS,
  DIAGNOSTIC_PROPOSAL_TYPE,
  STATUS_HISTORY_FILE,
} from "./constants.mjs";

const MATERIALIZED_FIELD = "materialized_story_dir";

// --- TTY helpers -------------------------------------------------------------
import { bold, dim, green, yellow } from "./tty.mjs";
import { readJsonl, readJson, readProjectName, findProjectRoot } from "./fs.mjs";
import { runDiagnostics } from "./engine/diagnostics.mjs";
import { cmdEvaluate } from "./engine/evaluate.mjs";
import { cmdMaterialize } from "./engine/materialize.mjs";
import { cmdUpgradeCandidates } from "./engine/upgrade.mjs";

// --- args --------------------------------------------------------------------
function showHelp() {
  console.log("");
  console.log("proposals — D0-D7 诊断引擎与提案生成器");
  console.log("");
  console.log("用法: node lib/proposals.mjs <command> [args]");
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
  const args = process.argv.slice(NODE_ARGV_OFFSET);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
    showHelp();
    process.exit(0);
  }

  const cmd = args[0];
  const opts = { command: cmd, story: "", id: "", status: "open", format: "table", materialize: false, minPriority: "", dryRun: false };

  for (const arg of args.slice(1)) {
    const eq = arg.indexOf("=");
    if (eq === -1) {
      const key = arg.replace(/^--?/, "");
      if (key === "materialize") opts.materialize = true;
      else if (key === "dry-run") opts.dryRun = true;
      continue;
    }
    const key = arg.slice(2, eq);
    const val = arg.slice(eq + 1);
    opts[key] = val;
  }

  return opts;
}

// --- project root ------------------------------------------------------------

// --- data collection for a story --------------------------------------------
function collectStoryData(projectRoot, storyName) {
  const storyPath = join(projectRoot, STORY_PANEL_DIR, storyName);
  const execRecords = readJsonl(join(storyPath, EXEC_MEMORY_FILE));
  const rootExecRecords = readJsonl(join(projectRoot, MEMORY_DIR, "execution-memory.jsonl"));
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
    const diffStat = execSync("git diff --stat HEAD", { cwd: gitRoot, encoding: "utf-8", timeout: GIT_TIMEOUT_MS }).trim();
    const changedFiles = execSync("git diff --name-only HEAD", { cwd: gitRoot, encoding: "utf-8", timeout: GIT_TIMEOUT_MS }).trim().split("\n").filter(Boolean);
    const diffShort = execSync("git diff --shortstat HEAD", { cwd: gitRoot, encoding: "utf-8", timeout: GIT_TIMEOUT_MS }).trim();

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

// --- D6 pre-computation (FS-dependent, kept in proposals.mjs) ----------------
function computeDocIssues(storyPath, execCount) {
  const projectRoot = findProjectRoot(storyPath);
  const projectName = readProjectName(projectRoot);
  const docIssues = [];
  let retroMissing = false;
  let noProposals = false;

  try {
    if (existsSync(storyPath)) {
      const entries = readdirSync(storyPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith("场景")) {
          const sceneDir = join(storyPath, entry.name);
          let mdFiles;
          try { mdFiles = readdirSync(sceneDir); } catch { continue; }
          for (const mf of mdFiles.filter((f) => f.endsWith(".md") || f.endsWith(".html"))) {
            const docPath = join(sceneDir, mf);
            try {
              const docStat = readFileSync(docPath, "utf-8");
              const hasSelfImprove = /§4\s*自改进|自改进复盘/i.test(docStat);
              const hasEvidence = /证据 Level|snapshot|Git diff|代码快照/.test(docStat);
              if (!hasSelfImprove && docStat.length > 500) {
                docIssues.push(`${entry.name}/${mf}: 缺少 §4 自改进章节`);
              }
              if (!hasEvidence && /§2\s*实施报告|实施报告/.test(docStat)) {
                docIssues.push(`${entry.name}/${mf}: §2 实施报告缺少证据引用`);
              }
            } catch { /* skip unreadable */ }
          }
        }
      }
    }
  } catch { /* skip */ }

  const retroPath = join(storyPath, `${projectName}-自改进复盘.md`);
  retroMissing = !existsSync(retroPath);
  const proposalsPath = join(storyPath, PROPOSALS_FILE);
  noProposals = !existsSync(proposalsPath) || readJsonl(proposalsPath).length === 0;

  return { docIssues, retroMissing, noProposals };
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
  const existingProposalsPath = join(storyPath, PROPOSALS_FILE);
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

  const proposalsPath = join(storyPath, PROPOSALS_FILE);
  for (const p of proposals) {
    appendFileSync(proposalsPath, JSON.stringify(p) + "\n", "utf-8");
  }

  return proposals;
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

  const { docIssues, retroMissing, noProposals } = computeDocIssues(data.storyPath, data.allExec.length);
  Object.assign(data, { docIssues, retroMissing, noProposals });
  const diagnostics = runDiagnostics(data, docIssues);

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

  const proposals = readJsonl(join(storyPath, PROPOSALS_FILE));

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

// cmdEvaluate imported from ./evaluate.mjs

// --- main ---
function main() {
  const opts = parseArgs();

  switch (opts.command) {
    case "generate":
      if (!opts.story) {
        console.error("proposals: generate 需要 --story=<name>");
        process.exit(1);
      }
      cmdGenerate(opts);
      break;
    case "list":
      if (!opts.story) {
        console.error("proposals: list 需要 --story=<name>");
        process.exit(1);
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
        process.exit(1);
      }
      cmdMaterialize(opts);
      break;
    default:
      console.error(`proposals: 未知命令 "${opts.command}"。可用: generate | list | evaluate | upgrade-candidates | materialize`);
      process.exit(1);
  }
}

main();
