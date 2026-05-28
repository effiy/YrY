#!/usr/bin/env node
// status — Story status transition validator and cross-story dashboard
// 用法: node skills/rui-story/status.mjs <command> [args]
// 命令: check | transition | dashboard

import { join, resolve, dirname } from "node:path";
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync, appendFileSync } from "node:fs";

// --- constants ----------------------------------------------------------------
const VALID_TRANSITIONS = {
  任务: new Set(["设计"]),
  设计: new Set(["任务", "实施"]),
  实施: new Set(["设计", "测试"]),
  测试: new Set(["实施", "报告"]),
  报告: new Set(["测试", "改进"]),
  改进: new Set(["报告"]),
};

const STORY_PANEL_DIR = "docs/故事任务面板";
const ARGV_OFFSET = 2;
const STATUS_ORDER = ["改进", "报告", "测试", "实施", "设计", "任务"];
const STATUS_LABELS = {
  任务: "任务",
  设计: "设计",
  实施: "实施",
  测试: "测试",
  报告: "报告",
  改进: "改进",
};

// --- TTY helpers -------------------------------------------------------------
const tty = process.stdout.isTTY;
const bold = (s) => tty ? `\x1b[1m${s}\x1b[22m` : s;
const dim = (s) => tty ? `\x1b[2m${s}\x1b[22m` : s;
const red = (s) => tty ? `\x1b[31m${s}\x1b[39m` : s;
const green = (s) => tty ? `\x1b[32m${s}\x1b[39m` : s;
const yellow = (s) => tty ? `\x1b[33m${s}\x1b[39m` : s;
const cyan = (s) => tty ? `\x1b[36m${s}\x1b[39m` : s;

// --- help -------------------------------------------------------------------
function showHelp() {
  console.log("");
  console.log("status — 故事状态转移验证与跨故事仪表板");
  console.log("");
  console.log("用法: node skills/rui-story/status.mjs <command> [args]");
  console.log("");
  console.log("命令:");
  console.log("  check      验证状态转移合法性");
  console.log("             --from=<status> --to=<status>");
  console.log("  transition 执行状态转移");
  console.log("             --story=<name> --to=<status> [--reason=<text>] [--dry-run]");
  console.log("  dashboard  跨故事聚合仪表板");
  console.log("");
  console.log("合法转移规则:");
  console.log("  任务 → 设计");
  console.log("  设计 → 任务, 实施");
  console.log("  实施 → 设计, 测试");
  console.log("  测试 → 实施, 报告");
  console.log("  报告 → 测试, 改进");
  console.log("  改进 → 报告");
  console.log("");
  console.log("输出:");
  console.log("");
}

// --- args --------------------------------------------------------------------
function parseArgs() {
  const args = process.argv.slice(ARGV_OFFSET);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
    showHelp();
    process.exit(0);
  }

  const cmd = args[0];
  const opts = { command: cmd, from: "", to: "", story: "", reason: "", dryRun: false };

  for (const arg of args.slice(1)) {
    if (arg === "--dry-run") { opts.dryRun = true; continue; }
    const eq = arg.indexOf("=");
    if (eq === -1) continue;
    const key = arg.slice(2, eq);
    const val = arg.slice(eq + 1);
    if (key in opts) opts[key] = val;
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

// --- state machine -----------------------------------------------------------

function isValidTransition(from, to) {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.has(to);
}

function checkTransition(from, to) {
  if (!from || !to) {
    console.error("status: check 需要 --from=<from> --to=<to>");
    process.exit(0);
  }

  const valid = isValidTransition(from, to);
  if (valid) {
    console.log(green(`✓ 合法转移: ${from} → ${to}`));
    process.exit(0);
  } else {
    const allowed = VALID_TRANSITIONS[from];
    const allowedStr = allowed ? [...allowed].join(", ") : "无";
    console.log(red(`✗ 非法转移: ${from} → ${to}`));
    console.log(`  允许目标: ${allowedStr}`);
    process.exit(1);
  }
}

function readRuiState(storyPath) {
  try {
  } catch {
    return null;
  }
}

function writeRuiState(storyPath, state) {
}

function appendStatusHistory(storyPath, entry) {
}

function applyTransition(opts, projectRoot) {
  const storyPath = join(projectRoot, STORY_PANEL_DIR, opts.story);
  if (!existsSync(storyPath)) {
    console.error(`status: 故事目录不存在: ${storyPath}`);
    process.exit(0);
  }

  let currentState = readRuiState(storyPath);
  if (!currentState) {
    currentState = {
      story_name: opts.story,
      started_at: new Date().toISOString(),
      current_stage: "任务",
      status: "任务",
      blocked: false,
      block_reason: null,
      change_history: [],
    };
  }

  const currentStatus = currentState.status || currentState.current_stage || "任务";

  if (!isValidTransition(currentStatus, opts.to)) {
    const allowed = VALID_TRANSITIONS[currentStatus];
    const allowedStr = allowed ? [...allowed].join(", ") : "无";
    console.log(red(`非法转移: ${currentStatus} → ${opts.to}`));
    console.log(`  当前状态: ${currentStatus}`);
    console.log(`  允许目标: ${allowedStr}`);
    process.exit(0);
  }

  if (opts.dryRun) {
    console.log(`[dry-run] 将执行: ${currentStatus} → ${opts.to}`);
    console.log(`  故事: ${opts.story}`);
    console.log(`  原因: ${opts.reason || "—"}`);
    process.exit(0);
  }

  const timestamp = new Date().toISOString();
  const historyEntry = {
    timestamp,
    from_status: currentStatus,
    to_status: opts.to,
    trigger: "manual",
    reason: opts.reason || null,
    valid: true,
  };

  // Update state
  const newState = { ...currentState };
  newState.status = opts.to;
  newState.current_stage = opts.to;
  newState.last_updated = timestamp;

  if (!newState.change_history) newState.change_history = [];
  newState.change_history.push({
    timestamp,
    from_status: currentStatus,
    to_status: opts.to,
    trigger: opts.reason || "pipeline",
  });

  writeRuiState(storyPath, newState);
  appendStatusHistory(storyPath, historyEntry);

  console.log(green(`✓ 状态转移完成: ${currentStatus} → ${opts.to}`));
  console.log(`  故事: ${opts.story}`);
  console.log(`  时间: ${timestamp}`);
}

// --- dashboard ---------------------------------------------------------------

function findStoryDirs(projectRoot) {
  const panelDir = join(projectRoot, STORY_PANEL_DIR);
  if (!existsSync(panelDir)) return [];

  try {
    return readdirSync(panelDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith("."))
      .map((d) => ({ name: d.name, path: join(panelDir, d.name) }));
  } catch {
    return [];
  }
}

function formatDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const STATUS_COLOR_FN = {
  任务: dim,
  设计: yellow,
  实施: (s) => s,
  测试: cyan,
  报告: green,
  改进: green,
};

function statusDisplay(status) {
  const fn = STATUS_COLOR_FN[status] || ((s) => s);
  return fn(STATUS_LABELS[status] || status);
}

function printDashboard(storyData) {
  console.log("");
  console.log(bold("故事状态仪表板 · 本地聚合"));
  console.log("══════════════════════════════");
  console.log("");

  if (storyData.length === 0) {
    console.log(dim("  docs/故事任务面板/ 下无故事目录"));
    console.log("");
    return;
  }

  // Status counts
  const counts = {};
  for (const s of STATUS_ORDER) counts[s] = 0;
  for (const d of storyData) {
    const status = d.status || "任务";
    if (counts[status] !== undefined) counts[status]++;
  }

  const STATUS_PAD = 18;
  const COUNT_PAD = 4;
  console.log(bold("  状态分布"));
  for (const s of STATUS_ORDER) {
    const label = statusDisplay(s).padEnd(STATUS_PAD);
    const count = String(counts[s]).padStart(COUNT_PAD);
    console.log(`  ${label} ${count}`);
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(`  ${"─".repeat(STATUS_PAD + COUNT_PAD)}`);
  console.log(`  ${"合计".padEnd(STATUS_PAD)} ${String(total).padStart(COUNT_PAD)} 个故事`);
  console.log("");

  // Story table
  const NAME_MIN = 14;
  const STATUS_W = 18;
  const LAST_W = 19;
  const BLOCKED_W = 14;

  storyData.sort((a, b) => (b.lastUpdated || 0).localeCompare(a.lastUpdated || ""));

  console.log(bold("  故事列表"));
  console.log("");
  const nameW = Math.max(NAME_MIN, ...storyData.map((d) => d.name.length));
  const hName = "Story".padEnd(nameW);
  const hStatus = "Status".padEnd(STATUS_W);
  const hLast = "Last Updated".padEnd(LAST_W);
  const hBlocked = "Blocked";
  console.log(`  ${hName} ${hStatus} ${hLast} ${hBlocked}`);
  console.log(`  ${dim("─".repeat(nameW + STATUS_W + LAST_W + BLOCKED_W + 6))}`);

  for (const d of storyData) {
    const name = d.name.padEnd(nameW);
    const status = statusDisplay(d.status || "任务").padEnd(STATUS_W);
    const lastUp = formatDate(d.lastUpdated).padEnd(LAST_W);
    const blocked = d.blocked ? red("BLOCKED") : "—";
    console.log(`  ${name} ${status} ${lastUp} ${blocked}`);
  }
  console.log("");
}

function cmdDashboard(projectRoot) {
  const stories = findStoryDirs(projectRoot);
  const data = [];

  for (const story of stories) {
    const state = readRuiState(story.path);
    data.push({
      name: story.name,
      status: state?.status || state?.current_stage || "任务",
      lastUpdated: state?.last_updated || state?.started_at || null,
      blocked: state?.blocked || false,
      blockReason: state?.block_reason || null,
      branch: state?.branch || null,
    });
  }

  printDashboard(data);
}

// --- main --------------------------------------------------------------------
function main() {
  const opts = parseArgs();
  const projectRoot = findProjectRoot(process.cwd());

  switch (opts.command) {
    case "check":
      checkTransition(opts.from, opts.to);
      break;
    case "transition":
      if (!opts.story) {
        console.error("status: transition 需要 --story=<name>");
        process.exit(0);
      }
      if (!opts.to) {
        console.error("status: transition 需要 --to=<status>");
        process.exit(0);
      }
      applyTransition(opts, projectRoot);
      break;
    case "dashboard":
      cmdDashboard(projectRoot);
      break;
    default:
      console.error(`status: 未知命令 "${opts.command}"。可用: check | transition | dashboard`);
      process.exit(0);
  }
}

main();
