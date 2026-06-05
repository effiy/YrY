#!/usr/bin/env node
// branch-check — 分支隔离确定性强制脚本
// 用法: node skills/rui/branch-check.mjs --story=<name> [--mode=write|read|init]
// 模式: write（写操作必须 feat/<name>）| read（只读检查）| init（项目初始化）

import { execSync } from "node:child_process";
import { join, resolve, dirname } from "node:path";
import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";

// --- constants ----------------------------------------------------------------
const STORY_PANEL_DIR = "docs/故事任务面板";
const FEAT_PREFIX = "feat/";
import { NODE_ARGV_OFFSET } from "../../lib/constants.mjs";
const ARGV_OFFSET = NODE_ARGV_OFFSET;
const VALID_MODES = ["write", "read", "init"];

import { bold, dim, red, green, yellow } from "../../lib/tty.mjs";

// --- args --------------------------------------------------------------------
function showHelp() {
  console.log("");
  console.log("branch-check — 分支隔离确定性强制脚本");
  console.log("");
  console.log("用法: node skills/rui/branch-check.mjs --story=<name> [--mode=<mode>]");
  console.log("");
  console.log("模式:");
  console.log("  write  feat/<name> 必须存在，不在则从 main 创建并切换（默认）");
  console.log("  read   只读检查：报告当前分支状态，不阻断");
  console.log("  init   项目初始化：允许在 main，警告已有 feat 分支");
  console.log("");
  console.log("规则:");
  console.log("  写操作必须在 feat/<name> 分支上       — no-branch-isolation");
  console.log("  feat 分支必须从 main 创建             — bad-branch");
  console.log("  禁止在已有 feat 分支上创建新故事分支   — no-nested-branch");
  console.log("");
  console.log("验证项:");
  console.log("  ① 当前分支 = feat/<name>（write 模式）");
  console.log("  ② feat/<name> 从 main 拉出（write 模式）");
  console.log("  ③ story-level .memory/rui-state.json 写入 branch 字段");
  console.log("");
}

function parseArgs() {
  const args = process.argv.slice(ARGV_OFFSET);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
    showHelp();
    process.exit(0);
  }

  const opts = { story: "", mode: "write" };
  for (const arg of args) {
    const eq = arg.indexOf("=");
    if (eq === -1) continue;
    const key = arg.slice(2, eq);
    const val = arg.slice(eq + 1);
    if (key === "mode") opts.mode = val;
    else opts[key] = val;
  }

  if (!opts.story) {
    console.error(red("branch-check: 需要 --story=<name>"));
    process.exit(1);
  }

  if (!VALID_MODES.includes(opts.mode)) {
    console.error(red(`branch-check: 无效模式 "${opts.mode}"，可用: ${VALID_MODES.join(" | ")}`));
    process.exit(1);
  }

  return opts;
}

// --- project root ------------------------------------------------------------
import { findProjectRoot } from "../../lib/fs.mjs";

// --- git helpers -------------------------------------------------------------
function git(args, cwd) {
  try {
    return execSync(`git ${args}`, { cwd, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch {
    return null;
  }
}

function currentBranch(cwd) {
  return git("branch --show-current", cwd);
}

function branchExists(name, cwd) {
  const result = git(`rev-parse --verify ${name}`, cwd);
  return result !== null;
}

function branchFromMain(name, cwd) {
  // Check if the merge base of main and feat/<name> equals the tip of main
  const mergeBase = git(`merge-base main ${name}`, cwd);
  if (!mergeBase) return false;
  const mainHead = git("rev-parse main", cwd);
  if (!mainHead) return false;
  // A branch is "from main" if its merge-base with main is an ancestor of main HEAD
  const isAncestor = git(`merge-base --is-ancestor ${mergeBase} ${mainHead}`, cwd);
  return isAncestor !== null; // exit 0 = is ancestor
}

function existingFeatBranches(cwd) {
  const result = git("branch --list 'feat/*'", cwd);
  if (!result) return [];
  return result.split("\n").map((l) => l.replace(/^[* ] /, "").trim()).filter(Boolean);
}

// --- rui-state update ---------------------------------------------------------
function updateRuiState(storyPath, branch) {
  const memoryDir = join(storyPath, ".memory");
  mkdirSync(memoryDir, { recursive: true });

  const statePath = join(memoryDir, "rui-state.json");
  let state = {};
  if (existsSync(statePath)) {
    try {
      state = JSON.parse(readFileSync(statePath, "utf-8"));
    } catch {
      // corrupted, start fresh
    }
  }

  state.branch = branch;
  state.last_updated = new Date().toISOString();
  writeFileSync(statePath, JSON.stringify(state, null, 2) + "\n", "utf-8");
}

// --- mode handlers -----------------------------------------------------------

function checkWriteMode(projectRoot, storyName) {
  const featBranch = `${FEAT_PREFIX}${storyName}`;
  const curr = currentBranch(projectRoot);

  console.log("");
  console.log(bold(`分支隔离检查 · write 模式`));
  console.log(`  故事: ${storyName}  |  目标分支: ${featBranch}  |  当前: ${curr}`);
  console.log("");

  // Step 1: Ensure feat/<name> exists locally, create from main if not
  if (!branchExists(featBranch, projectRoot)) {
    console.log(dim(`  ${featBranch} 不存在，从 main 创建...`));

    // Ensure we start from main to create the branch
    if (curr !== "main") {
      const switchResult = git("checkout main", projectRoot);
      if (switchResult === null) {
        console.error(red(`  ❌ 无法切换到 main（有未提交更改？）`));
        console.log("");
        console.log(dim("  请先提交或暂存更改: git add -A && git commit"));
        process.exit(1);
      }
      console.log(dim("  切换到 main"));
    }

    // Pull latest main to ensure clean starting point
    git("pull origin main", projectRoot);

    // Create and switch to feat/<name>
    const createResult = git(`checkout -b ${featBranch}`, projectRoot);
    if (createResult === null) {
      console.error(red(`  ❌ 无法创建 ${featBranch}`));
      process.exit(1);
    }
    console.log(green(`  ✅ 已创建 ${featBranch}（从 main）`));
    console.log("");
  }

  // Step 2: Verify current branch
  const branch = currentBranch(projectRoot);
  if (branch !== featBranch) {
    // Try to switch to feat/<name>
    if (branch === "main") {
      console.error(red(`  ❌ 阻断: 当前在 main，写操作必须在 ${featBranch}`));
      console.log("");
      console.log(dim(`  切换: git checkout ${featBranch}`));
      console.log(dim(`  或创建: node skills/rui/branch-check.mjs --story=${storyName} --mode=write`));
      process.exit(1);
    }

    // On some other branch — try switching
    const switchResult = git(`checkout ${featBranch}`, projectRoot);
    if (switchResult === null) {
      console.error(red(`  ❌ 无法切换到 ${featBranch}（no-branch-isolation）`));
      console.log("");
      console.log(dim(`  当前分支 ${branch} 可能有未提交更改`));
      process.exit(1);
    }
    console.log(green(`  ✅ 已切换到 ${featBranch}`));
    console.log("");
  }

  // Step 3: Verify branch ancestry from main
  if (!branchFromMain(featBranch, projectRoot)) {
    console.log(yellow(`  ⚠️  警告: ${featBranch} 可能不是从 main 拉出（bad-branch）`));
    console.log(yellow(`      请确保分支从 main 创建: git checkout main && git branch -D ${featBranch} && 重新运行`));
    console.log("");
    // Don't block — this is a warning, not an error, to avoid blocking legitimate cases
  }

  // Step 4: Update story-level rui-state.json
  const storyPath = join(projectRoot, STORY_PANEL_DIR, storyName);
  if (existsSync(storyPath)) {
    updateRuiState(storyPath, featBranch);
    console.log(dim(`  rui-state.branch → ${featBranch}`));
  }

  // Step 5: Update root-level rui-state.json
  const rootStatePath = join(projectRoot, ".memory", "rui-state.json");
  if (existsSync(rootStatePath)) {
    try {
      const rootState = JSON.parse(readFileSync(rootStatePath, "utf-8"));
      rootState.branch = featBranch;
      rootState.last_updated = new Date().toISOString();
      writeFileSync(rootStatePath, JSON.stringify(rootState, null, 2) + "\n", "utf-8");
      console.log(dim(`  root rui-state.branch → ${featBranch}`));
    } catch {
      // ignore
    }
  }

  console.log("");
  console.log(green(`✅ 分支隔离通过 — ${featBranch}`));
  console.log("");

  return featBranch;
}

function checkReadMode(projectRoot, storyName) {
  const featBranch = `${FEAT_PREFIX}${storyName}`;
  const curr = currentBranch(projectRoot);
  const featBranches = existingFeatBranches(projectRoot);

  console.log("");
  console.log(bold(`分支隔离检查 · read 模式`));
  console.log(`  故事: ${storyName}  |  目标分支: ${featBranch}  |  当前: ${curr}`);
  console.log("");

  if (curr === featBranch) {
    console.log(green(`  ✅ 已在 ${featBranch}`));
  } else if (curr === "main") {
    console.log(dim(`  ℹ️  当前在 main — 只读操作安全`));
    if (branchExists(featBranch, projectRoot)) {
      console.log(dim(`     ${featBranch} 已存在，可切换: git checkout ${featBranch}`));
    }
  } else if (curr && curr.startsWith(FEAT_PREFIX)) {
    console.log(yellow(`  ⚠️  当前在 ${curr}，非目标分支 ${featBranch}`));
    console.log(yellow(`     只读操作在非目标 feat 分支上 — 注意不要写入`));
  } else {
    console.log(yellow(`  ⚠️  当前在 ${curr}，非标准分支`));
  }

  // Show existing feat branches
  if (featBranches.length > 0) {
    console.log("");
    console.log(dim(`  已有 feat 分支: ${featBranches.join(", ")}`));
  }

  console.log("");
  return curr;
}

function checkInitMode(projectRoot, storyName) {
  const curr = currentBranch(projectRoot);
  const featBranches = existingFeatBranches(projectRoot);

  console.log("");
  console.log(bold(`分支隔离检查 · init 模式`));
  console.log(`  项目: ${storyName}  |  当前分支: ${curr}`);
  console.log("");

  if (curr !== "main") {
    console.log(yellow(`  ⚠️  建议在 main 上执行 init`));
    if (curr && curr.startsWith(FEAT_PREFIX)) {
      console.log(yellow(`     当前在 ${curr}，init 产生的基线可能不完整`));
    }
  } else {
    console.log(green(`  ✅ 在 main 上 — init 安全`));
  }

  if (featBranches.length > 0) {
    console.log("");
    console.log(dim(`  已有 feat 分支: ${featBranches.join(", ")}`));
    console.log(yellow(`  ⚠️  init 仅建立项目基线，不会影响已有 feat 分支`));
  }

  console.log("");
  return curr;
}

// --- main ---
function main() {
  const opts = parseArgs();
  const projectRoot = findProjectRoot(process.cwd());

  // Verify we're in a git repo
  if (!existsSync(join(projectRoot, ".git"))) {
    console.error(red("branch-check: 不在 git 仓库中"));
    process.exit(1);
  }

  switch (opts.mode) {
    case "write":
      checkWriteMode(projectRoot, opts.story);
      break;
    case "read":
      checkReadMode(projectRoot, opts.story);
      break;
    case "init":
      checkInitMode(projectRoot, opts.story);
      break;
  }
}

main();
