#!/usr/bin/env node
// audit — Tool call audit logger for rui pipeline
// 用法: node skills/rui/audit.mjs <command> [args]
// 命令: record | summary | check

import { join, resolve, dirname } from "node:path";
import { existsSync, readFileSync, mkdirSync, appendFileSync } from "node:fs";

// --- constants ----------------------------------------------------------------
import { NODE_ARGV_OFFSET } from "../../lib/constants.mjs";
const ARGV_OFFSET = NODE_ARGV_OFFSET;
const AUDIT_FILE = ".memory/tool-audit.jsonl";

// Agent tool permissions (from agent YAML frontmatter)
const AGENT_TOOLS = {
  pm:             new Set(["Read", "Grep", "Glob", "Bash"]),
  coder:          new Set(["Read", "Grep", "Glob", "Edit", "Write", "Bash"]),
  tester:         new Set(["Read", "Grep", "Glob", "Bash"]),
  reporter:       new Set(["Read", "Grep", "Glob"]),
  security:       new Set(["Read", "Grep", "Glob"]),
  "self-improve": new Set(["Read", "Grep", "Glob", "Bash"]),
};

import { bold, dim, red, green, yellow } from "../../lib/tty.mjs";

// --- args --------------------------------------------------------------------
function showHelp() {
  console.log("");
  console.log("audit — 工具调用审计记录器");
  console.log("");
  console.log("用法: node skills/rui/audit.mjs <command> [args]");
  console.log("");
  console.log("命令:");
  console.log("  record   记录一次工具调用");
  console.log("           --story=<name> --agent=<name> --tool=<name> --target=<path>");
  console.log("           [--result=success|failure] [--error=<msg>] [--duration_ms=<N>]");
  console.log("  summary  工具调用汇总");
  console.log("           --story=<name>");
  console.log("  check    权限合规检查（对照 agent YAML frontmatter）");
  console.log("           --story=<name>");
  console.log("");
  console.log("数据存储: .memory/tool-audit.jsonl（追加）");
  console.log("");
}

function parseArgs() {
  const args = process.argv.slice(ARGV_OFFSET);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
    showHelp();
    process.exit(0);
  }

  const cmd = args[0];
  const opts = { command: cmd, story: "", agent: "", tool: "", target: "", durationMs: 0, error: "", result: "success" };

  for (const arg of args.slice(1)) {
    const eq = arg.indexOf("=");
    if (eq === -1) continue;
    const key = arg.slice(2, eq);
    const val = arg.slice(eq + 1);
    if (key === "duration_ms") {
      opts.durationMs = parseInt(val, 10) || 0;
    } else {
      opts[key] = val;
    }
  }

  return opts;
}

// --- project root ------------------------------------------------------------
import { findProjectRoot } from "../../lib/fs.mjs";

// --- audit path ---
function getAuditPath(projectRoot, story) {
  return join(projectRoot, "docs", "故事任务面板", story, AUDIT_FILE);
}

// --- record ---
function cmdRecord(opts) {
  if (!opts.story || !opts.agent || !opts.tool) {
    console.error("audit: record 需要 --story=<name> --agent=<name> --tool=<name>");
    process.exit(0);
  }

  const projectRoot = findProjectRoot(process.cwd());
  const auditPath = getAuditPath(projectRoot, opts.story);
  const auditDir = dirname(auditPath);
  if (!existsSync(auditDir)) mkdirSync(auditDir, { recursive: true });

  const record = {
    timestamp: new Date().toISOString(),
    session_id: process.env.SESSION_ID || "",
    agent: opts.agent,
    tool: opts.tool,
    target: opts.target || "",
    duration_ms: opts.durationMs,
    result: opts.result,
    error: opts.error || null,
  };

  appendFileSync(auditPath, JSON.stringify(record) + "\n", "utf-8");
  console.log(`[audit] 已记录: agent=${opts.agent} tool=${opts.tool} target=${opts.target || "—"}`);
}

// --- summary ---
function readAuditRecords(projectRoot, story) {
  const auditPath = getAuditPath(projectRoot, story);
  if (!existsSync(auditPath)) return [];

  try {
    const content = readFileSync(auditPath, "utf-8").trim();
    if (!content) return [];
    return content.split("\n").map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
  } catch {
    return [];
  }
}

function cmdSummary(opts) {
  const projectRoot = findProjectRoot(process.cwd());
  const records = readAuditRecords(projectRoot, opts.story);

  console.log("");
  console.log(bold(`工具调用审计 · ${opts.story}`));
  console.log("══════════════════════");
  console.log("");

  if (records.length === 0) {
    console.log(dim("  无审计记录"));
    console.log("");
    return;
  }

  // agent -> tool -> { count, errors, totalDuration }
  const stats = {};
  for (const r of records) {
    if (!stats[r.agent]) stats[r.agent] = {};
    if (!stats[r.agent][r.tool]) {
      stats[r.agent][r.tool] = { count: 0, errors: 0, totalDuration: 0, targets: new Set() };
    }
    const s = stats[r.agent][r.tool];
    s.count++;
    if (r.result === "failure") s.errors++;
    s.totalDuration += r.duration_ms || 0;
    if (r.target) s.targets.add(r.target);
  }

  const agents = Object.keys(stats).sort();
  for (const agent of agents) {
    console.log(bold(`  ${agent}`));
    const tools = Object.keys(stats[agent]).sort();
    for (const tool of tools) {
      const s = stats[agent][tool];
      const avgMs = s.count > 0 ? Math.round(s.totalDuration / s.count) : 0;
      const errStr = s.errors > 0 ? red(` (${s.errors} 失败)`) : "";
      const avgStr = s.totalDuration > 0 ? ` avg=${avgMs}ms` : "";
      console.log(`    ${tool}: ${s.count} 次${avgStr}${errStr}`);
    }
    console.log("");
  }

  console.log(bold(`  总计: ${records.length} 条记录`));
  console.log("");
}

// --- check ---
function cmdCheck(opts) {
  const projectRoot = findProjectRoot(process.cwd());
  const records = readAuditRecords(projectRoot, opts.story);

  console.log("");
  console.log(bold(`工具权限合规检查 · ${opts.story}`));
  console.log("═══════════════════════════");
  console.log("");

  if (records.length === 0) {
    console.log(dim("  无审计记录，跳过检查"));
    console.log("");
    return;
  }

  let violations = 0;

  for (const r of records) {
    const allowed = AGENT_TOOLS[r.agent];
    if (!allowed) {
      violations++;
      console.log(yellow(`  ⚠️  未知 agent: ${r.agent} (tool=${r.tool})`));
      continue;
    }
    if (!allowed.has(r.tool)) {
      violations++;
      console.log(red(`  ❌ 越权: agent=${r.agent} tool=${r.tool} (未在 ${r.agent}.md tools 列表中声明)`));
    }
  }

  if (violations === 0) {
    console.log(green(`  ✅ 全部合规: ${records.length} 条记录，无越权调用`));
  } else {
    console.log("");
    console.log(red(`  ${violations} 条越权记录`));
  }
  console.log("");
}

// --- main ---
function main() {
  const opts = parseArgs();

  switch (opts.command) {
    case "record":
      cmdRecord(opts);
      break;
    case "summary":
      if (!opts.story) {
        console.error("audit: summary 需要 --story=<name>");
        process.exit(0);
      }
      cmdSummary(opts);
      break;
    case "check":
      if (!opts.story) {
        console.error("audit: check 需要 --story=<name>");
        process.exit(0);
      }
      cmdCheck(opts);
      break;
    default:
      console.error(`audit: 未知命令 "${opts.command}"。可用: record | summary | check`);
      process.exit(0);
  }
}

main();
