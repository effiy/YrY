#!/usr/bin/env node
/**
 * audit — Tool call audit logger for the rui pipeline.
 * CLI entry point: node lib/audit.mjs <command> [args]
 * Commands: record | summary | check
 */

import { join, dirname } from "node:path";
import { existsSync, readFileSync, mkdirSync, appendFileSync } from "node:fs";

// --- constants ----------------------------------------------------------------
import { NODE_ARGV_OFFSET, STORY_PANEL_DIR, TOOL_AUDIT_FILE as AUDIT_FILE } from "./constants.mjs";
import { bold, dim, red, green, yellow } from "./tty.mjs";
import { findProjectRoot } from "./fs.mjs";

// Agent tool permissions (from agent YAML frontmatter)
/** @type {Record<string, Set<string>>} */
const AGENT_TOOLS = {
  pm:             new Set(["Read", "Grep", "Glob", "Bash"]),
  coder:          new Set(["Read", "Grep", "Glob", "Edit", "Write", "Bash"]),
  tester:         new Set(["Read", "Grep", "Glob", "Bash"]),
  reporter:       new Set(["Read", "Grep", "Glob"]),
  security:       new Set(["Read", "Grep", "Glob"]),
  "self-improve": new Set(["Read", "Grep", "Glob", "Bash"]),
};

// --- args --------------------------------------------------------------------
function showHelp() {
  console.log("");
  console.log("audit — 工具调用审计记录器");
  console.log("");
  console.log("用法: node lib/audit.mjs <command> [args]");
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
  const args = process.argv.slice(NODE_ARGV_OFFSET);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
    showHelp();
    process.exit(0);
  }

  const cmd = args[0];
  /** @type {{ command: string, story: string, agent: string, tool: string, target: string, durationMs: number, error: string, result: string, [k: string]: string|number }} */
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

// --- audit path ---
function getAuditPath(/** @type {string} */ projectRoot, /** @type {string} */ story) {
  return join(projectRoot, STORY_PANEL_DIR, story, AUDIT_FILE);
}

// --- record ---
/** @param {any} opts */
function cmdRecord(opts) {
  if (!opts.story || !opts.agent || !opts.tool) {
    console.error("audit: record 需要 --story=<name> --agent=<name> --tool=<name>");
    process.exit(1);
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
function readAuditRecords(/** @type {string} */ projectRoot, /** @type {string} */ story) {
  const auditPath = getAuditPath(projectRoot, story);
  if (!existsSync(auditPath)) return [];

  try {
    const content = readFileSync(auditPath, "utf-8").trim();
    if (!content) return [];
    return content.split("\n").map((/** @type {string} */ line) => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
  } catch {
    return [];
  }
}

function cmdSummary(/** @type {any} */ opts) {
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

  /** @type {Record<string, Record<string, { count: number, errors: number, totalDuration: number, targets: Set<string> }>>} */
  const stats = {};
  for (const r of records) {
    /** @type {any} */
    const rr = r;
    if (!stats[rr.agent]) stats[rr.agent] = {};
    if (!stats[rr.agent][rr.tool]) {
      stats[rr.agent][rr.tool] = { count: 0, errors: 0, totalDuration: 0, targets: new Set() };
    }
    const s = stats[rr.agent][rr.tool];
    s.count++;
    if (rr.result === "failure") s.errors++;
    s.totalDuration += rr.duration_ms || 0;
    if (rr.target) s.targets.add(rr.target);
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
function cmdCheck(/** @type {any} */ opts) {
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
    /** @type {any} */
    const rr = r;
    const allowed = AGENT_TOOLS[rr.agent];
    if (!allowed) {
      violations++;
      console.log(yellow(`  ⚠️  未知 agent: ${rr.agent} (tool=${rr.tool})`));
      continue;
    }
    if (!allowed.has(rr.tool)) {
      violations++;
      console.log(red(`  ❌ 越权: agent=${rr.agent} tool=${rr.tool} (未在 ${rr.agent}.md tools 列表中声明)`));
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
        process.exit(1);
      }
      cmdSummary(opts);
      break;
    case "check":
      if (!opts.story) {
        console.error("audit: check 需要 --story=<name>");
        process.exit(1);
      }
      cmdCheck(opts);
      break;
    default:
      console.error(`audit: 未知命令 "${opts.command}"。可用: record | summary | check`);
      process.exit(1);
  }
}

main();
