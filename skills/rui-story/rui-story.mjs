#!/usr/bin/env node
// rui-story — Story panel management implementation
// 用法: node skills/rui-story/rui-story.mjs <command> [args]
// 由 SKILL.md 规约驱动；本脚本实现只读查询命令的确定性逻辑

import { join, sep, dirname, resolve } from "node:path";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { homedir } from "node:os";

// --- config ----------------------------------------------------------------
const API_URL = process.env.IMPORT_DOCS_API_URL || "https://api.effiy.cn";
const API_X_TOKEN = process.env.API_X_TOKEN || "";
const HTTP_TIMEOUT = 30_000;
const CONCURRENCY = 4;
const QUERY_LIMIT = 10_000;
const ERROR_MSG_MAX_LEN = 500;

// --- story extraction constants -------------------------------------------
const STORY_DIR_OFFSET = 1;
// minimum parts beyond panelIdx to contain a file: [panelDir, storyDir] → 2
const STORY_NAME_OFFSET = 2;

// --- display/formatting constants -----------------------------------------
const STATUS_COUNT_PAD = 4;
const RECENT_STORY_COUNT = 5;
const MIN_NAME_COL_WIDTH = 14;
const STATUS_COL_WIDTH = 18;
const FILES_COL_WIDTH = 5;
const DATE_COL_WIDTH = 19;
const TYPE_COL_WIDTH = 10;
const LIST_COL_GAP_WIDTH = 30;
const MIN_COL_GAP = 1;
const FILE_LIST_NAME_PAD = 2;
const RECOMMEND_NAME_WIDTH = 20;
const DATE_ZERO_PAD = 2;

// --- CLI argument constants ------------------------------------------------
const NODE_ARGV_OFFSET = 2;
const SHOW_MIN_ARGS = 2;

// --- TTY helpers -----------------------------------------------------------
const ANSI_BOLD_ON = 1;
const ANSI_BOLD_OFF = 22;
const ANSI_DIM_ON = 2;
const ANSI_FG_RED = 31;
const ANSI_FG_GREEN = 32;
const ANSI_FG_YELLOW = 33;
const ANSI_FG_CYAN = 36;
const ANSI_FG_DEFAULT = 39;

const tty = process.stdout.isTTY;
const bold = (s) => tty ? `\x1b[${ANSI_BOLD_ON}m${s}\x1b[${ANSI_BOLD_OFF}m` : s;
const dim = (s) => tty ? `\x1b[${ANSI_DIM_ON}m${s}\x1b[${ANSI_BOLD_OFF}m` : s;
const red = (s) => tty ? `\x1b[${ANSI_FG_RED}m${s}\x1b[${ANSI_FG_DEFAULT}m` : s;
const green = (s) => tty ? `\x1b[${ANSI_FG_GREEN}m${s}\x1b[${ANSI_FG_DEFAULT}m` : s;
const yellow = (s) => tty ? `\x1b[${ANSI_FG_YELLOW}m${s}\x1b[${ANSI_FG_DEFAULT}m` : s;
const cyan = (s) => tty ? `\x1b[${ANSI_FG_CYAN}m${s}\x1b[${ANSI_FG_DEFAULT}m` : s;

// --- args ------------------------------------------------------------------
function parseArgs() {
  const args = process.argv.slice(NODE_ARGV_OFFSET);
  if (args.length === 0) return { command: "overview" };

  const cmd = args[0];

  if (cmd === "--help" || cmd === "-h" || cmd === "help") {
    return { command: "help" };
  }

  if (cmd === "overview" || cmd === "list" || cmd === "recommend" || cmd === "health" || cmd === "merge-to-main") {
    return { command: cmd };
  }

  if (cmd === "show") {
    if (args.length < SHOW_MIN_ARGS) {
      console.error("rui-story: show 需要 <name> 参数");
      process.exit(0);
    }
    return { command: "show", name: args[1] };
  }

  console.error(`rui-story: 未知命令 "${cmd}"，使用 --help 查看帮助`);
  process.exit(0);
}

// --- project root ----------------------------------------------------------
function findProjectRoot(startDir) {
  let dir = resolve(startDir);
  while (true) {
    if (existsSync(join(dir, ".git")) || existsSync(join(dir, ".claude")))
      return dir;
    const parent = dirname(dir);
    if (parent === dir) return resolve(startDir);
    dir = parent;
  }
}

// --- project name from CLAUDE.md -------------------------------------------
function readProjectName(projectRoot) {
  const claudePath = join(projectRoot, "CLAUDE.md");
  if (!existsSync(claudePath)) return null;

  let content;
  try {
    content = readFileSync(claudePath, "utf-8");
  } catch {
    return null;
  }

  // Pattern 1: Table row (YrY style): | 项目名 | YrY |
  let match = content.match(/\|\s*项目名\s*\|\s*(\S+)\s*\|/);
  if (match) return match[1];

  // Pattern 2: Bold label (YiAi style): **项目名**：YiAi（宜 AI）
  match = content.match(/\*\*项目名\*\*[：:]\s*(\S+?)(?:（[^）]*）)?\s*$/m);
  if (match) return match[1];

  // Pattern 3: 项目名: Value
  match = content.match(/项目名[：:]\s*(\S+)/);
  if (match) return match[1].replace(/（.*）/, "").trim();

  // Fallback: project root directory name
  return projectRoot.split(sep).pop();
}

// --- API helpers (replicated from rui-import/sync.mjs) --------------------
async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Token": API_X_TOKEN,
        ...options.headers,
      },
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, ERROR_MSG_MAX_LEN)}`);
    try { return JSON.parse(text); }
    catch { return text; }
  } finally { clearTimeout(timer); }
}

async function querySessionsFull(apiUrl) {
  const body = {
    module_name: "services.database.data_service",
    method_name: "query_documents",
    parameters: { cname: "sessions", limit: QUERY_LIMIT },
  };
  const data = await fetchJson(apiUrl + "/", { method: "POST", body: JSON.stringify(body) });
  return data?.data?.list || data?.list || [];
}

async function readRemoteFile(apiUrl, remotePath) {
  const body = { target_file: remotePath };
  return fetchJson(apiUrl + "/read-file", { method: "POST", body: JSON.stringify(body) });
}

// --- story extraction ------------------------------------------------------
function extractStoryName(filePath) {
  const parts = filePath.split("/");
  const panelIdx = parts.indexOf("故事任务面板");
  if (panelIdx === -1 || panelIdx + STORY_NAME_OFFSET >= parts.length) return null;
  return parts[panelIdx + STORY_DIR_OFFSET];
}

function groupSessionsByStory(sessions) {
  const map = new Map();
  for (const s of sessions) {
    const fp = s.file_path || "";
    if (!fp.startsWith("故事任务面板/")) continue;
    const name = extractStoryName(fp);
    if (!name) continue;
    if (!map.has(name)) map.set(name, []);
    map.get(name).push(s);
  }
  return map;
}

// --- blocked state ---------------------------------------------------------
function readBlockedState(projectRoot, storyName) {
  const ruiStatePath = join(projectRoot, "docs", "故事任务面板", storyName, ".memory", "rui-state.json");
  if (!existsSync(ruiStatePath)) return null;
  try {
    const data = JSON.parse(readFileSync(ruiStatePath, "utf-8"));
    return {
      blocked: data.blocked === true,
      block_reason: data.block_reason || null,
    };
  } catch {
    return null;
  }
}

// --- status determination --------------------------------------------------
const BASELINE_DOCS = ["使用场景", "技术评审", "测试设计", "安全审计"];

function hasProjectFile(fileBasenames, projectPrefix, docType) {
  // projectPrefix includes hyphen, e.g. "YrY-"
  const target = `${projectPrefix}${docType}.md`;
  return fileBasenames.has(target);
}

function determineStatus(fileBasenames, projectPrefix, blockedState) {
  if (!hasProjectFile(fileBasenames, projectPrefix, "故事任务"))
    return "任务";

  const baselineComplete = BASELINE_DOCS.every(doc =>
    hasProjectFile(fileBasenames, projectPrefix, doc)
  );
  if (!baselineComplete)
    return "设计";

  if (!hasProjectFile(fileBasenames, projectPrefix, "实施报告"))
    return "实施";

  if (!hasProjectFile(fileBasenames, projectPrefix, "测试报告"))
    return "测试";

  if (!hasProjectFile(fileBasenames, projectPrefix, "自改进复盘"))
    return "报告";

  return "改进";
}

// --- type inference --------------------------------------------------------
const TYPE_LABELS = {
  backend: "后端",
  frontend: "前端",
  fullstack: "全栈",
  meta: "元",
};

async function inferType(apiUrl, storySessions, projectPrefix) {
  const reviewTarget = `${projectPrefix}技术评审.md`;
  const reviewSession = storySessions.find(s => {
    const base = (s.file_path || "").split("/").pop();
    return base === reviewTarget;
  });
  if (!reviewSession) return "meta";

  const remotePath = reviewSession.file_path;
  try {
    const data = await readRemoteFile(apiUrl, remotePath);
    const content = (data?.data?.content ?? data?.content ?? "").toLowerCase();

    const hasBackend = /\b(api|数据|后端|服务端|接口|数据库|server|backend|服务|路由)\b/i.test(content);
    const hasFrontend = /\b(组件|交互|样式|前端|页面|ui|frontend|界面|布局|渲染|响应式)\b/i.test(content);

    if (hasBackend && hasFrontend) return "fullstack";
    if (hasBackend) return "backend";
    if (hasFrontend) return "frontend";
    return "meta";
  } catch {
    return "meta";
  }
}

async function inferTypesBatch(apiUrl, storyMap, projectPrefix) {
  const entries = [...storyMap.entries()];
  const results = new Map();

  const queue = [...entries];
  async function worker() {
    while (queue.length > 0) {
      const [name, sessions] = queue.shift();
      results.set(name, await inferType(apiUrl, sessions, projectPrefix));
    }
  }
  const workers = Array.from({ length: Math.min(CONCURRENCY, entries.length) }, worker);
  await Promise.all(workers);

  return results;
}

// --- git branch check ------------------------------------------------------
function checkGitBranch(name) {
  try {
    const output = execSync(`git branch --list "feat/${name}"`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    if (output) return `feat/${name}`;
    return null;
  } catch {
    return null;
  }
}

// --- output formatters -----------------------------------------------------

const STATUS_CONFIG = {
  任务: { label: "任务", colorFn: dim },
  设计: { label: "设计", colorFn: yellow },
  实施: { label: "实施", colorFn: (s) => s },
  测试: { label: "测试", colorFn: cyan },
  报告: { label: "报告", colorFn: green },
  改进: { label: "改进", colorFn: green },
};

function statusDisplay(status) {
  const cfg = STATUS_CONFIG[status] || { label: status, colorFn: (s) => s };
  return cfg.colorFn(cfg.label);
}

function formatDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(DATE_ZERO_PAD, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function latestTimestamp(sessions) {
  let max = 0;
  for (const s of sessions) {
    const t = s.updatedAt || s.updated_at || 0;
    if (t > max) max = t;
  }
  return max;
}

function printOverview(storyMap, projectPrefix, blockedMap) {
  const counts = {
    任务: 0,
    设计: 0,
    实施: 0,
    测试: 0,
    报告: 0,
    改进: 0,
  };

  const storyStatuses = [];

  for (const [name, sessions] of storyMap) {
    const basenames = new Set(sessions.map(s => (s.file_path || "").split("/").pop()));
    const blocked = blockedMap.get(name);
    const status = determineStatus(basenames, projectPrefix, blocked);
    counts[status]++;
    storyStatuses.push({ name, status, updatedAt: latestTimestamp(sessions) });
  }

  console.log("");
  console.log(bold("故事任务面板 · 状态概览"));
  console.log("────────────────────────────────");

  const order = ["改进", "报告", "测试", "实施", "设计", "任务"];
  for (const s of order) {
    const cfg = STATUS_CONFIG[s];
    const countStr = String(counts[s]).padStart(STATUS_COUNT_PAD);
    console.log(`  ${cfg.colorFn(cfg.label.padEnd(STATUS_COL_WIDTH))} ${countStr}`);
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log("────────────────────────────────");
  console.log(`  ${"合计".padEnd(STATUS_COL_WIDTH)} ${String(total).padStart(STATUS_COUNT_PAD)} 个故事`);

  storyStatuses.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  const recent = storyStatuses.slice(0, RECENT_STORY_COUNT);
  console.log("");
  console.log("最近活动:");
  if (recent.length === 0) {
    console.log("  无");
  } else {
    for (const s of recent) {
      const name = s.name.padEnd(STATUS_COL_WIDTH);
      const date = formatDate(s.updatedAt);
      const st = statusDisplay(s.status);
      console.log(`  ${name} ${date}   ${st}`);
    }
  }

  console.log("");
}

function printList(storyMap, projectPrefix, blockedMap, typeMap) {
  const entries = [];

  for (const [name, sessions] of storyMap) {
    const basenames = new Set(sessions.map(s => (s.file_path || "").split("/").pop()));
    const blocked = blockedMap.get(name);
    const status = determineStatus(basenames, projectPrefix, blocked);
    const files = sessions.length;
    const lastMod = latestTimestamp(sessions);
    const type = typeMap.get(name) || "meta";
    const branch = checkGitBranch(name);
    entries.push({ name, status, files, lastMod, type, branch });
  }

  entries.sort((a, b) => (b.lastMod || 0) - (a.lastMod || 0));

  console.log("");
  console.log(bold("故事任务面板 · 进度全景"));
  console.log("");

  if (entries.length === 0) {
    console.log(dim("  远端无故事任务面板数据"));
    console.log("");
    return;
  }

  const nameW = Math.max(MIN_NAME_COL_WIDTH, ...entries.map(e => e.name.length));
  const statusW = STATUS_COL_WIDTH;
  const filesW = FILES_COL_WIDTH;
  const dateW = DATE_COL_WIDTH;
  const typeW = TYPE_COL_WIDTH;

  const pad = (s, w) => {
    const str = String(s);
    const visible = str.replace(/\x1b\[[0-9;]*m/g, "").length;
    return str + " ".repeat(Math.max(MIN_COL_GAP, w - visible));
  };

  console.log(`  ${pad("Story", nameW)} ${pad("Status", statusW)} ${pad("Files", filesW)} ${pad("Last Modified", dateW)} ${pad("Type", typeW)} Branch`);

  const sepLen = nameW + statusW + filesW + dateW + typeW + LIST_COL_GAP_WIDTH;
  console.log(`  ${dim("─".repeat(sepLen))}`);

  for (const e of entries) {
    const name = pad(e.name, nameW);
    const status = pad(statusDisplay(e.status), statusW);
    const files = pad(String(e.files), filesW);
    const date = pad(formatDate(e.lastMod), dateW);
    const type = pad(TYPE_LABELS[e.type] || e.type, typeW);
    const branch = e.branch || "—";
    console.log(`  ${name} ${status} ${files} ${date} ${type} ${branch}`);
  }

  console.log("");
}

function printShow(storyName, sessions, projectPrefix, blockedState, type) {
  const basenames = new Set(sessions.map(s => (s.file_path || "").split("/").pop()));
  const status = determineStatus(basenames, projectPrefix, blockedState);
  const branch = checkGitBranch(storyName);

  const files = sessions.map(s => ({
    name: (s.file_path || "").split("/").pop(),
    updatedAt: s.updatedAt || s.updated_at || 0,
  })).sort((a, b) => a.name.localeCompare(b.name));

  console.log("");
  console.log(bold(`${storyName} · ${statusDisplay(status)}`));
  console.log("");

  console.log(`  📂 远端路径: 故事任务面板/${storyName}/`);
  console.log(`  📋 类型: ${TYPE_LABELS[type] || type}`);
  console.log(`  📄 文件: ${files.length} 个`);
  console.log("");

  if (files.length > 0) {
    console.log("    文件清单:");
    const maxLen = Math.max(...files.map(f => f.name.length));
    for (const f of files) {
      const name = f.name.padEnd(maxLen + FILE_LIST_NAME_PAD);
      const date = formatDate(f.updatedAt);
      console.log(`    ${name} ${date}`);
    }
    console.log("");
  }

  console.log(`  🔀 Git 分支: ${branch || "—"}`);
  console.log("");
  console.log("  📊 元数据:");
  console.log(`    状态: ${statusDisplay(status)}`);
  console.log(`    阻断原因: ${blockedState?.block_reason || "—"}`);
  console.log("");
}

function printRecommend(storyMap) {
  console.log("");
  if (storyMap.size === 0) {
    console.log(dim("  远端无故事任务面板数据"));
    console.log("");
    return;
  }

  console.log(bold("远端可同步故事"));
  console.log("");

  const names = [...storyMap.keys()].sort();
  for (const name of names) {
    const sessions = storyMap.get(name);
    console.log(`  ${name.padEnd(RECOMMEND_NAME_WIDTH)} ${dim(`(${sessions.length} 个文件)`)}`);
  }

  console.log("");
  console.log(bold("推荐命令"));
  console.log("");
  for (const name of names) {
    console.log(`  /rui-story sync ${name}`);
  }
  console.log("");
}

function printHealth(result) {
  console.log("");
  console.log(bold("rui-story 健康检查"));
  console.log("══════════════════");
  console.log("");

  let pass = 0, warn = 0, fail = 0;

  function check(label, ok, detail) {
    const mark = ok ? green("  ✅") : (detail.includes("缺失") ? yellow("  ⚠️") : red("  ❌"));
    console.log(`${mark} ${label}: ${detail}`);
    if (ok) pass++;
    else if (detail.includes("缺失")) warn++;
    else fail++;
  }

  console.log(bold("── API 凭据"));
  check("API_X_TOKEN", !!API_X_TOKEN, API_X_TOKEN ? "已配置" : "缺失 — 无法查询远端");

  console.log("");

  console.log(bold("── 远端可达性"));
  if (API_X_TOKEN) {
    if (result.apiError) {
      check("API 可达", false, `不可达: ${result.apiError}`);
    } else {
      check("API 可达 (effiy.cn)", true, `查询到 ${result.totalSessions} 个 sessions`);
      const panelCount = result.panelSessions || 0;
      if (panelCount > 0) {
        check("故事任务面板 sessions", true, `${panelCount} 个 (${result.storyCount} 个故事)`);
      } else {
        check("故事任务面板 sessions", false, "无故事任务面板数据");
      }
    }
  } else {
    check("API 可达", false, "跳过 — Token 未配置");
  }

  console.log("");

  console.log(bold("── 项目配置"));
  check("CLAUDE.md", !!result.projectName, result.projectName ? `项目名 = ${result.projectName}` : "未找到或无法解析");
  const storyDir = join(result.projectRoot || "", "docs", "故事任务面板");
  check("故事目录", existsSync(storyDir), existsSync(storyDir) ? "docs/故事任务面板/ 存在" : "docs/故事任务面板/ 不存在");

  console.log("");
  console.log(bold(`Summary: ${green(String(pass))} pass, ${yellow(String(warn))} warn, ${fail > 0 ? red(String(fail)) : String(fail)} error`));
  console.log("");
}

// --- command handlers ------------------------------------------------------

async function cmdOverview(apiUrl, projectRoot, projectPrefix) {
  console.error(dim("[rui-story] overview mode — 查询远端 API..."));
  let sessions;
  try {
    sessions = await querySessionsFull(apiUrl);
  } catch (err) {
    console.error(`[rui-story] 远端不可达: ${err.message}`);
    process.exit(0);
  }
  const storyMap = groupSessionsByStory(sessions);
  const blockedMap = new Map();
  for (const name of storyMap.keys()) {
    const bs = readBlockedState(projectRoot, name);
    if (bs) blockedMap.set(name, bs);
  }
  printOverview(storyMap, projectPrefix, blockedMap);
}

async function cmdList(apiUrl, projectRoot, projectPrefix) {
  console.error(dim("[rui-story] list mode — 查询远端 API..."));
  let sessions;
  try {
    sessions = await querySessionsFull(apiUrl);
  } catch (err) {
    console.error(`[rui-story] 远端不可达: ${err.message}`);
    process.exit(0);
  }
  const storyMap = groupSessionsByStory(sessions);
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
  const typeMap = await inferTypesBatch(apiUrl, storyMap, projectPrefix);

  printList(storyMap, projectPrefix, blockedMap, typeMap);
}

async function cmdShow(apiUrl, projectRoot, projectPrefix, name) {
  console.error(dim(`[rui-story] show mode — 查询远端 story=${name}...`));
  let sessions;
  try {
    sessions = await querySessionsFull(apiUrl);
  } catch (err) {
    console.error(`[rui-story] 远端不可达: ${err.message}`);
    process.exit(0);
  }
  const storyMap = groupSessionsByStory(sessions);

  if (!storyMap.has(name)) {
    console.log("");
    console.log(red(`故事 "${name}" 不存在于远端`));
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
  const blockedState = readBlockedState(projectRoot, name);
  const type = await inferType(apiUrl, storySessions, projectPrefix);

  printShow(name, storySessions, projectPrefix, blockedState, type);
}

async function cmdRecommend(apiUrl) {
  console.error(dim("[rui-story] recommend mode — 查询远端可同步故事..."));
  let sessions;
  try {
    sessions = await querySessionsFull(apiUrl);
  } catch (err) {
    console.error(`[rui-story] 远端不可达: ${err.message}`);
    process.exit(0);
  }
  const storyMap = groupSessionsByStory(sessions);
  printRecommend(storyMap);
}

async function cmdHealth(apiUrl, projectRoot) {
  const result = {
    projectRoot,
    projectName: null,
    totalSessions: 0,
    panelSessions: 0,
    storyCount: 0,
    apiError: null,
  };

  result.projectName = readProjectName(projectRoot);

  if (API_X_TOKEN) {
    try {
      const sessions = await querySessionsFull(apiUrl);
      result.totalSessions = sessions.length;
      const panelSessions = sessions.filter(s =>
        (s.file_path || "").startsWith("故事任务面板/")
      );
      result.panelSessions = panelSessions.length;
      const storyMap = groupSessionsByStory(sessions);
      result.storyCount = storyMap.size;
    } catch (err) {
      result.apiError = err.message;
    }
  }

  printHealth(result);
}

async function cmdMergeToMain(projectRoot) {
  const steps = [];
  const mainBranch = "main";

  // §1 Identify current branch
  let currentBranch;
  try {
    currentBranch = execSync("git branch --show-current", {
      encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    console.error("[rui-story] 无法获取当前分支");
    process.exit(1);
  }

  if (!currentBranch) {
    console.error("[rui-story] 当前不在任何分支上（detached HEAD）");
    process.exit(1);
  }

  if (currentBranch === mainBranch) {
    console.error(`[rui-story] 当前已在 ${mainBranch} 分支，无需合并`);
    process.exit(0);
  }

  steps.push(`§1 当前分支: ${currentBranch}`);

  // §2 Check for uncommitted changes
  let stashed = false;
  try {
    const status = execSync("git status --porcelain", {
      encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    if (status) {
      console.error("[rui-story] §2 检测到未提交变更，执行 git stash");
      execSync("git stash -u", { encoding: "utf-8", stdio: "inherit" });
      stashed = true;
    } else {
      console.error("[rui-story] §2 工作区干净，无需 stash");
    }
  } catch (err) {
    console.error(`[rui-story] stash 失败: ${err.message}`);
    process.exit(1);
  }

  // §3 Fetch latest main
  console.error("[rui-story] §3 拉取远端最新 main");
  try {
    execSync(`git fetch origin ${mainBranch}`, { encoding: "utf-8", stdio: "inherit" });
  } catch (err) {
    console.error(`[rui-story] fetch 失败: ${err.message}`);
    if (stashed) execSync("git stash pop", { encoding: "utf-8", stdio: "inherit" });
    process.exit(1);
  }

  // §4 Checkout main and pull
  console.error(`[rui-story] §4 切换到 ${mainBranch}`);
  try {
    execSync(`git checkout ${mainBranch}`, { encoding: "utf-8", stdio: "inherit" });
    execSync(`git pull origin ${mainBranch}`, { encoding: "utf-8", stdio: "inherit" });
  } catch (err) {
    console.error(`[rui-story] checkout/pull ${mainBranch} 失败: ${err.message}`);
    if (stashed) {
      execSync(`git checkout ${currentBranch}`, { encoding: "utf-8", stdio: "inherit" });
      execSync("git stash pop", { encoding: "utf-8", stdio: "inherit" });
    }
    process.exit(1);
  }

  // §5 Merge feature branch
  console.error(`[rui-story] §5 合并 ${currentBranch} → ${mainBranch}`);
  try {
    execSync(`git merge ${currentBranch} --no-edit`, { encoding: "utf-8", stdio: "inherit" });
  } catch (err) {
    console.error(`[rui-story] 合并失败，可能存在冲突: ${err.message}`);
    console.error(`[rui-story] 请手动解决冲突后执行 git push origin ${mainBranch}`);
    process.exit(1);
  }

  // §6 Push to remote
  console.error(`[rui-story] §6 推送 ${mainBranch} 到远端`);
  try {
    execSync(`git push origin ${mainBranch}`, { encoding: "utf-8", stdio: "inherit" });
  } catch (err) {
    console.error(`[rui-story] push 失败: ${err.message}`);
    process.exit(1);
  }

  steps.push(`§6 已推送 origin/${mainBranch}`);

  // §7 Checkout back to feature branch
  console.error(`[rui-story] §7 切回 ${currentBranch}`);
  try {
    execSync(`git checkout ${currentBranch}`, { encoding: "utf-8", stdio: "inherit" });
  } catch {
    // non-fatal
  }

  // §8 Restore stash
  if (stashed) {
    console.error("[rui-story] §8 恢复 stash");
    try {
      execSync("git stash pop", { encoding: "utf-8", stdio: "inherit" });
    } catch {
      console.error("[rui-story] stash pop 失败，请手动 git stash pop");
    }
  }

  // §9 Summary
  console.error("");
  console.error("[rui-story] ✅ 合并完成");
  console.error(`[rui-story]    ${currentBranch} → ${mainBranch} → origin/${mainBranch}`);
}

// --- help delegate ---------------------------------------------------------
const SKILL_NAME = "rui-story";

function findPluginHelpPath() {
  const pluginRoot = join(homedir(), ".claude/plugins/cache/yry/yry");
  if (!existsSync(pluginRoot)) return null;
  try {
    const versions = readdirSync(pluginRoot).filter(d => /^\d+\.\d+\.\d+$/.test(d)).sort();
    if (versions.length === 0) return null;
    const helpPath = join(pluginRoot, versions[versions.length - 1], "skills", SKILL_NAME, "help.mjs");
    return existsSync(helpPath) ? helpPath : null;
  } catch {
    return null;
  }
}

async function showHelp() {
  const helpPath = findPluginHelpPath();
  if (helpPath) {
    try {
      execSync(`node "${helpPath}"`, { stdio: "inherit" });
    } catch {
      fallbackHelp();
    }
  } else {
    fallbackHelp();
  }
}

function fallbackHelp() {
  console.log("");
  console.log(bold("rui-story — 故事任务面板管理"));
  console.log("");
  console.log(dim("远端查询 · 查看 · 同步 | 数据源为远端 API，不读本地文件系统"));
  console.log("");
  console.log(bold("只读命令（远端 API）"));
  console.log("  /rui-story                    状态概览");
  console.log("  /rui-story list               进度全景表格");
  console.log("  /rui-story show <name>        单故事详情");
  console.log("  /rui-story recommend          同步推荐");
  console.log("  /rui-story health             健康检查");
  console.log("");
  console.log(bold("写入命令"));
  console.log("  /rui-story sync [<name>]      远端→本地 (委托 rui-import)");
  console.log("  /rui-story clear [<name>]     仅本地：清除非项目前缀文件");
  console.log("  /rui-story remove <name>      仅本地：删除故事目录");
  console.log("");
  console.log(bold("分支命令"));
  console.log("  /rui-story merge-to-main      将当前分支合并到 main 并推送远端");
  console.log("");
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
    process.exit(0);
  }

  // projectPrefix includes hyphen: "YrY-"
  const projectPrefix = projectName + "-";

  // Token check for commands that query remote
  const needsRemote = ["overview", "list", "show", "recommend", "health"].includes(opts.command);
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
    case "merge-to-main":
      await cmdMergeToMain(projectRoot);
      break;
    default:
      console.error(`[rui-story] 未知命令: ${opts.command}`);
      process.exit(0);
  }
}

main().catch(err => {
  console.error(`[rui-story] fatal: ${err.message}`);
  process.exit(0);
});
