#!/usr/bin/env node
// rui-story — Story panel management implementation
// 用法: node skills/rui-story/rui-story.mjs <command> [args]
// 由 SKILL.md 规约驱动；本脚本实现只读查询命令的确定性逻辑

import { join } from "node:path";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";

import { dim, yellow } from "../../lib/tty.mjs";
import { DEFAULT_API_URL } from "../../lib/constants.mjs";
import { findProjectRoot, readProjectName } from "../../lib/fs.mjs";
import { querySessionsFull } from "../../lib/io.mjs";
import { extractStoryName, groupSessionsByStory, readBlockedState } from "./lib/extract.mjs";
import { printOverview, printList, printShow, printRecommend, printHealth } from "./lib/format.mjs";
import { parseArgs, showHelp } from "./lib/cli.mjs";
import { inferType, inferTypesBatch } from "./lib/infer.mjs";
import { checkGitBranch, cmdMergeToMain } from "./lib/merge.mjs";

// --- config ----------------------------------------------------------------
const API_URL = process.env.IMPORT_DOCS_API_URL || DEFAULT_API_URL;
const API_X_TOKEN = process.env.API_X_TOKEN || "";

// --- command handlers ------------------------------------------------------

async function cmdOverview(/** @type {string} */ apiUrl, /** @type {string} */ projectRoot, /** @type {string} */ projectPrefix) {
  console.error(dim("[rui-story] overview mode — 查询远端 API..."));
  let sessions;
  try {
    sessions = await querySessionsFull(apiUrl, API_X_TOKEN);
  } catch (err) {
    console.error(`[rui-story] 远端不可达: ${err.message}`);
    process.exit(1);
  }
  const storyMap = groupSessionsByStory(sessions || []);
  const blockedMap = new Map();
  for (const name of storyMap.keys()) {
    const bs = readBlockedState(projectRoot, name);
    if (bs) blockedMap.set(name, bs);
  }
  printOverview(storyMap, projectPrefix, blockedMap);
}

async function cmdList(/** @type {string} */ apiUrl, /** @type {string} */ projectRoot, /** @type {string} */ projectPrefix) {
  console.error(dim("[rui-story] list mode — 查询远端 API..."));
  let sessions;
  try {
    sessions = await querySessionsFull(apiUrl, API_X_TOKEN);
  } catch (err) {
    console.error(`[rui-story] 远端不可达: ${err.message}`);
    process.exit(1);
  }
  const storyMap = groupSessionsByStory(sessions || []);
  if (storyMap.size === 0) {
    console.log("");
    console.log(dim("  远端无故事任务面板数据"));
    console.log("");
    process.exit(0);
  }

  const blockedMap = new Map();
  for (const name of storyMap.keys()) {
    const bs = readBlockedState(projectRoot, name);
    if (bs) blockedMap.set(name, bs);
  }

  console.error(dim(`[rui-story] 推断 ${storyMap.size} 个故事的类型...`));
  const typeMap = await inferTypesBatch(apiUrl, storyMap, projectPrefix, API_X_TOKEN);

  printList(storyMap, projectPrefix, blockedMap, typeMap, checkGitBranch);
}

async function cmdShow(/** @type {string} */ apiUrl, /** @type {string} */ projectRoot, /** @type {string} */ projectPrefix, /** @type {string | null | undefined} */ name) {
  console.error(dim(`[rui-story] show mode — 查询远端 story=${name}...`));
  let sessions;
  try {
    sessions = await querySessionsFull(apiUrl, API_X_TOKEN);
  } catch (err) {
    console.error(`[rui-story] 远端不可达: ${err.message}`);
    process.exit(1);
  }
  const storyMap = groupSessionsByStory(sessions || []);

  if (!storyMap.has(name)) {
    console.log("");
    console.log(`故事 "${name}" 不存在于远端`);
    if (storyMap.size > 0) {
      console.log("");
      console.log("远端已知故事:");
      for (const n of [...storyMap.keys()].sort()) {
        console.log(`  ${n}`);
      }
    }
    console.log("");
    process.exit(0);
  }

  const storySessions = storyMap.get(name);
  const blockedState = readBlockedState(projectRoot, /** @type {string} */ (name || ""));
  const type = await inferType(apiUrl, storySessions, projectPrefix, API_X_TOKEN);

  printShow(/** @type {string} */ (name || ""), storySessions, projectPrefix, blockedState, type, checkGitBranch);
}

async function cmdRecommend(/** @type {string} */ apiUrl) {
  console.error(dim("[rui-story] recommend mode — 查询远端可同步故事..."));
  let sessions;
  try {
    sessions = await querySessionsFull(apiUrl, API_X_TOKEN);
  } catch (err) {
    console.error(`[rui-story] 远端不可达: ${err.message}`);
    process.exit(1);
  }
  const storyMap = groupSessionsByStory(sessions || []);
  printRecommend(storyMap);
}

async function cmdHealth(/** @type {string} */ apiUrl, /** @type {string} */ projectRoot) {
  /** @type {{ projectRoot: string, projectName: string|null, apiToken: boolean, totalSessions: number, panelSessions: number, storyCount: number, apiError: string|null, isGitRepo: boolean, hasStoryPanel: boolean }} */
  const result = {
    projectRoot,
    projectName: null,
    apiToken: !!API_X_TOKEN,
    totalSessions: 0,
    panelSessions: 0,
    storyCount: 0,
    apiError: null,
    isGitRepo: false,
    hasStoryPanel: false,
  };

  result.projectName = readProjectName(projectRoot);
  result.isGitRepo = existsSync(join(projectRoot, ".git"));
  result.hasStoryPanel = existsSync(join(projectRoot, "docs", "故事任务面板"));

  if (API_X_TOKEN) {
    try {
      const sessions = await querySessionsFull(apiUrl, API_X_TOKEN);
      result.totalSessions = sessions.length;
      const panelSessions = sessions.filter(s =>
        extractStoryName(s.file_path || "")
      );
      result.panelSessions = panelSessions.length;
      const storyMap = groupSessionsByStory(sessions || []);
      result.storyCount = storyMap.size;
    } catch (err) {
      result.apiError = err.message;
    }
  }

  printHealth(result);
}

async function cmdSync(/** @type {string} */ apiUrl, /** @type {string} */ projectRoot, /** @type {string} */ projectPrefix, /** @type {string | null | undefined} */ name) {
  if (!name) {
    console.error(dim("[rui-story] sync 需要 <name> 参数，使用 recommend 查看可同步故事"));
    await cmdRecommend(apiUrl);
    return;
  }

  const storyDir = join(projectRoot, "docs", "故事任务面板", name);
  const syncScript = join(projectRoot, "skills", "rui-import", "sync.mjs");

  if (!existsSync(syncScript)) {
    console.error("[rui-story] rui-import sync 脚本不存在");
    process.exit(1);
  }

  console.error(dim(`[rui-story] sync mode — 从远端拉取 story=${name} (前缀: ${projectPrefix})...`));

  try {
    execSync(`node "${syncScript}" dir="${storyDir}" mode=pull projectPrefix="${projectPrefix}"`, {
      encoding: "utf-8",
      stdio: "inherit",
    });
  } catch (err) {
    console.error(`[rui-story] sync 失败: ${err.message}`);
    process.exit(1);
  }
}

// --- main ------------------------------------------------------------------
async function main() {
  const opts = parseArgs();
  if (opts.command === "help") {
    await showHelp();
    return;
  }

  const projectRoot = findProjectRoot(process.cwd());
  const projectName = readProjectName(projectRoot);
  const apiUrl = API_URL;

  if (!projectName) {
    console.error("[rui-story] 无法确定项目名，请检查 CLAUDE.md");
    process.exit(1);
  }

  const projectPrefix = projectName + "-";

  const needsRemote = ["overview", "list", "show", "recommend", "health", "sync"].includes(opts.command);
  if (needsRemote && !API_X_TOKEN) {
    console.log("");
    console.log(yellow("⚠️  API_X_TOKEN: 缺失 — 无法查询远端"));
    console.log("");
    console.log("配置方法:");
    console.log("  export API_X_TOKEN=<your-token>");
    console.log("");
    process.exit(0);
  }

  switch (opts.command) {
    case "overview":
      await cmdOverview(apiUrl, projectRoot, projectPrefix);
      break;
    case "list":
      await cmdList(apiUrl, projectRoot, projectPrefix);
      break;
    case "show":
      await cmdShow(apiUrl, projectRoot, projectPrefix, opts.name);
      break;
    case "recommend":
      await cmdRecommend(apiUrl);
      break;
    case "health":
      await cmdHealth(apiUrl, projectRoot);
      break;
    case "sync":
      await cmdSync(apiUrl, projectRoot, projectPrefix, opts.name);
      break;
    case "merge-to-main":
      await cmdMergeToMain(projectRoot);
      break;
    default:
      console.error(`[rui-story] 未知命令: ${opts.command}`);
      process.exit(1);
  }
}

main().catch(err => {
  console.error(`[rui-story] fatal: ${err.message}`);
  process.exit(1);
});
