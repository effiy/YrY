#!/usr/bin/env node
// log-interaction — Deterministic interaction log appender for rui pipeline
// 用法: node .memory/log-interaction.mjs [options]
// 按 coder.md 交互日志格式追加每条人机交互轮次

import { join, resolve, dirname } from "node:path";
import { existsSync, readFileSync, mkdirSync, appendFileSync, writeFileSync } from "node:fs";

// --- constants ----------------------------------------------------------------
const SEPARATOR_SECTION = "---";
const ARGV_OFFSET = 2;
const SESSION_ID_LENGTH = 14;

// --- args --------------------------------------------------------------------
function showHelp() {
  console.log("");
  console.log("log-interaction — 确定性交互日志追加器");
  console.log("");
  console.log("用法: node .memory/log-interaction.mjs [options]");
  console.log("");
  console.log("参数:");
  console.log("  --story=<name>            故事名（必填）");
  console.log("  --turn=<N>                回合编号（必填）");
  console.log("  --agent=<name>            Agent 名称（必填）");
  console.log("  --user-input=<text>       用户输入全文");
  console.log("  --assistant-response=<text> 助手响应摘要");
  console.log("  --decisions=<d1;d2>       关键决策（分号分隔）");
  console.log("  --session-id=<id>         会话 ID（默认自动生成）");
  console.log("  --project=<name>          项目名（默认从 CLAUDE.md 读取）");
  console.log("  --help                    显示此帮助");
  console.log("");
  console.log("格式约定: coder.md § 交互日志");
  console.log("去重规则: 同 turn 号已存在时自动跳过");
  console.log("");
}

function parseArgs() {
  const args = process.argv.slice(ARGV_OFFSET);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
    showHelp();
    process.exit(0);
  }

  const opts = {
    story: "",
    turn: 0,
    agent: "",
    userInput: "",
    assistantResponse: "",
    decisions: "",
    sessionId: "",
    project: "",
  };

  for (const arg of args) {
    const eq = arg.indexOf("=");
    if (eq === -1) continue;
    const key = arg.slice(2, eq);
    const val = arg.slice(eq + 1);
    if (key === "turn") {
      opts[key] = parseInt(val, 10);
    } else {
      opts[key] = val;
    }
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

// --- project name ------------------------------------------------------------
function readProjectName(projectRoot) {
  const claudePath = join(projectRoot, "CLAUDE.md");
  if (!existsSync(claudePath)) {
    return projectRoot.split("/").pop();
  }

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

// --- session ID ---
function generateSessionId() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return [
    now.getFullYear().toString().slice(2),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    "-",
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");
}

function formatDateForHeader(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatTime(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// --- log format ---
function buildTurnEntry(opts, now) {
  const timeStr = formatTime(now);
  const lines = [];

  lines.push(`### ${timeStr} | turn-${opts.turn} | ${opts.agent}`);
  lines.push("");
  lines.push("**👤 用户**:");
  lines.push(`${opts.userInput || "—"}`);
  lines.push("");
  lines.push("**🤖 助手**:");
  lines.push(`${opts.assistantResponse || "—"}`);

  if (opts.decisions) {
    lines.push("");
    lines.push("**📋 关键决策**:");
    const decisions = opts.decisions.split(";").map((d) => d.trim()).filter(Boolean);
    for (const d of decisions) {
      lines.push(`- ${d}`);
    }
  }

  lines.push("");
  lines.push(SEPARATOR_SECTION);
  return lines.join("\n");
}

function buildSessionHeader(sessionId, date) {
  return [
    `> 交互日志 · 追加写入 · rui 管线自动维护`,
    "",
    `## 会话 ${sessionId} — ${date}`,
    "",
  ].join("\n");
}

function getLogPath(projectRoot, projectName, story) {
  return join(projectRoot, "docs", "故事任务面板", story, `${projectName}-交互日志.md`);
}

// --- dedup check ---
function hasTurnEntry(logPath, turn) {
  if (!existsSync(logPath)) return false;
  try {
    const content = readFileSync(logPath, "utf-8");
    const turnPattern = new RegExp(`turn-${turn}\\s*\\|`);
    return turnPattern.test(content);
  } catch {
    return false;
  }
}

// --- command handler ---
function cmdAppend(opts) {
  const projectRoot = findProjectRoot(process.cwd());
  const projectName = opts.project || readProjectName(projectRoot);
  const sessionId = opts.sessionId || generateSessionId();
  const now = new Date();
  const dateStr = formatDateForHeader(now);

  const logPath = getLogPath(projectRoot, projectName, opts.story);

  // Create directory if needed
  const logDir = dirname(logPath);
  if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true });

  // Dedup check
  if (hasTurnEntry(logPath, opts.turn)) {
    console.log(`[log-interaction] 跳过: story=${opts.story} turn-${opts.turn} 已存在`);
    process.exit(0);
  }

  // Build content
  let content = "";
  const isNewFile = !existsSync(logPath);

  if (isNewFile) {
    content += buildSessionHeader(sessionId, dateStr) + "\n";
  }

  content += buildTurnEntry(opts, now);

  appendFileSync(logPath, content, "utf-8");
  console.log(`[log-interaction] 已追加: story=${opts.story} turn=${opts.turn} agent=${opts.agent} ${isNewFile ? "(新文件)" : ""}`);
}

// --- main ---
function main() {
  const opts = parseArgs();

  if (!opts.story) {
    console.error("[log-interaction] 缺少 --story=<name>");
    process.exit(0);
  }
  if (!opts.turn) {
    console.error("[log-interaction] 缺少 --turn=<N>");
    process.exit(0);
  }
  if (!opts.agent) {
    console.error("[log-interaction] 缺少 --agent=<name>");
    process.exit(0);
  }

  cmdAppend(opts);
}

main();
