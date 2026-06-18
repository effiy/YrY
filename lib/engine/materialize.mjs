/**
 * materialize — proposal materialization into story directories
 * Extracted from proposals.mjs for single-responsibility.
 */

import { join } from "node:path";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

import {
  STORY_PANEL_DIR,
  PROPOSALS_DIR,
  PROPOSALS_FILE,
  IMPROVE_STORY_PREFIX,
  DEFAULT_MIN_PRIORITY,
  PRIORITY_ORDER,
  DIAGNOSTIC_LABELS,
  DIAGNOSTIC_BASELINES,
} from "../constants.mjs";
import { bold, dim, green, yellow } from "../tty.mjs";
import { readProjectName, readJsonl, findProjectRoot, updateJsonlById, writeJson, fmtDate } from "../fs.mjs";

function deriveStoryDirName(proposal, projectRoot) {
  const diagMatch = proposal.id.match(/D\d+/i);
  const diagId = diagMatch ? diagMatch[0].toLowerCase() : "improve";
  const sourceStory = proposal.story_name || "unknown";
  const baseName = `${IMPROVE_STORY_PREFIX}-${sourceStory}-${diagId}`;

  const storyPanelPath = join(projectRoot, STORY_PANEL_DIR);
  const targetPath = join(storyPanelPath, baseName);

  if (!existsSync(targetPath)) return baseName;

  const titleSlug = proposal.title
    .replace(/\[.*?\]/g, "")
    .replace(/[^a-zA-Z0-9一-鿿]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30)
    .toLowerCase();
  const sluggedName = `${baseName}-${titleSlug}`;
  const sluggedPath = join(storyPanelPath, sluggedName);

  if (!existsSync(sluggedPath)) return sluggedName;

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
      { timestamp: now, from_status: null, to_status: "任务", trigger: "self-improve materialize" },
    ],
  };

  const memoryDir = join(storyPath, ".memory");
  mkdirSync(memoryDir, { recursive: true });
  writeJson(join(memoryDir, "rui-state.json"), ruiState);
  return ruiState;
}

function buildBaselineDocContent(proposal, projectName) {
  const diagId = proposal.id.match(/D\d+/i)?.[0] || "DIAG";
  const diagLabel = DIAGNOSTIC_LABELS[diagId] || "自改进诊断";
  const diagBaseline = DIAGNOSTIC_BASELINES[diagId] || "—";
  const now = fmtDate(new Date());

  return `> | v1.0 | ${now} | auto | 🌿 main | ⏱️ — | 📎 [proposals.mjs](../../lib/proposals.mjs) |
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
}

function generateBaselineDoc(proposal, projectName, storyDirName) {
  const content = buildBaselineDocContent(proposal, projectName);
  const storyDir = join(findProjectRoot(process.cwd()), STORY_PANEL_DIR, storyDirName);
  mkdirSync(storyDir, { recursive: true });
  const docPath = join(storyDir, `${projectName}-故事任务.md`);
  writeFileSync(docPath, content, "utf-8");
  return docPath;
}

function materializeProposal(proposal, projectRoot, projectName, dryRun) {
  const storyDirName = deriveStoryDirName(proposal, projectRoot);
  const storyPath = join(projectRoot, STORY_PANEL_DIR, storyDirName);

  if (dryRun) {
    return { proposalId: proposal.id, storyDirName, storyPath, dryRun: true };
  }

  mkdirSync(storyPath, { recursive: true });
  createRuiState(storyPath, proposal);
  const docPath = generateBaselineDoc(proposal, projectName, storyDirName);

  const proposalsDir = join(projectRoot, STORY_PANEL_DIR, proposal.story_name, PROPOSALS_DIR);
  updateJsonlById(join(proposalsDir, PROPOSALS_FILE), proposal.id, (r) => {
    r.materialized_story_dir = storyDirName;
    r.materialized_at = new Date().toISOString();
  });

  return { proposalId: proposal.id, storyDirName, storyPath, docPath, dryRun: false };
}

export function cmdMaterialize(opts) {
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
