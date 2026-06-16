#!/usr/bin/env node
// record — execution memory recorder for the self-improve pipeline
// 用法: node lib/record.mjs <command> [args]
// 命令: exec | delivery | audit | state | bootstrap

import { join } from "node:path";
import { existsSync, mkdirSync, appendFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// --- constants (imported from shared lib) --------------------------------------
import {
  NODE_ARGV_OFFSET,
  STORY_PANEL_DIR,
  MEMORY_DIR,
  PROPOSALS_DIR,
  EXEC_MEMORY_FILE,
  COMPRESSED_MEMORY_FILE,
} from "./constants.mjs";

import { bold, dim, green, yellow } from "./tty.mjs";
import { readProjectName, findProjectRoot, findStoryDirs, readJsonl, readJson } from "./fs.mjs";


// --- args --------------------------------------------------------------------
function showHelp() {
  console.log("");
  console.log("record — 执行记忆记录器（自改进数据采集）");
  console.log("");
  console.log("用法: node lib/record.mjs <command> [args]");
  console.log("");
  console.log("命令:");
  console.log("  exec         记录管线执行事件 → execution-memory.jsonl");
  console.log("               --story=<name> --session=<id> [--stage=<阶段>] [--blocked] [--reason=<原因>]");
  console.log("               [--change-level=T1|T2|T3] [--agents=a,b,c] [--p0=<n>] [--p1=<n>] [--p2=<n>]");
  console.log("  delivery     记录交付事件 → delivery-tracking.jsonl");
  console.log("               --story=<name> --status=success|failure [--step=<步骤名>]");
  console.log("  audit        记录工具调用审计 → tool-audit.jsonl");
  console.log("               --story=<name> --tool=<工具名> --result=success|failure [--duration-ms=<ms>]");
  console.log("  state        更新管线状态 → rui-state.json");
  console.log("               --story=<name> --stage=<阶段> [--blocked] [--reason=<原因>]");
  console.log("  bootstrap    为一组故事引导初始化 .memory/ 和 .improvement/ 目录");
  console.log("               [--story=<name>] [--all]");
  console.log("  compress     压缩执行记忆为滚动摘要 → compressed-memory.json");
  console.log("               [--story=<name>] [--window=12]");
  console.log("");
  console.log("数据契约（见 skills/rui/coder.md §数据契约）:");
  console.log("  execution-memory.jsonl: session_id, timestamp, story_name, phase_transitions, quality_issues...");
  console.log("  delivery-tracking.jsonl: session_id, timestamp, story_name, status, step...");
  console.log("  tool-audit.jsonl: session_id, timestamp, story_name, tool, result, duration_ms...");
  console.log("  rui-state.json: 覆盖写入，单文件记录当前管线状态");
  console.log("");
}

function parseArgs() {
  const args = process.argv.slice(NODE_ARGV_OFFSET);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
    showHelp();
    process.exit(0);
  }

  const cmd = args[0];
  const opts = { command: cmd, story: "", all: false, window: 12 };

  for (const arg of args.slice(1)) {
    const eq = arg.indexOf("=");
    if (eq === -1) {
      const key = arg.replace(/^--?/, "");
      if (key === "all") opts.all = true;
      else if (key === "blocked") opts.blocked = true;
      continue;
    }
    const key = arg.slice(2, eq);
    const val = arg.slice(eq + 1);
    if (key === "window") opts.window = parseInt(val, 10) || 12;
    else opts[key] = val;
  }

  return opts;
}

// --- helpers -----------------------------------------------------------------
/**
 * Resolve a story name to its project root and story directory path.
 * @param {string} storyName
 * @returns {{ projectRoot: string, storyPath: string }}
 */
function resolveStory(storyName) {
  const projectRoot = findProjectRoot(process.cwd());
  const storyPath = join(projectRoot, STORY_PANEL_DIR, storyName);
  if (!existsSync(storyPath)) {
    console.error(`record: 故事目录不存在: ${storyPath}`);
    process.exit(0);
  }
  return { projectRoot, storyPath };
}

/** Ensure .memory/ directory exists under story path. */
function ensureMemoryDir(storyPath) {
  const dir = join(storyPath, MEMORY_DIR);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

/** Ensure .improvement/ directory exists under story path. */
function ensureImprovementDir(storyPath) {
  const dir = join(storyPath, PROPOSALS_DIR);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

/** Append a JSON object as a line to a JSONL file. */
function appendJsonl(path, obj) {
  appendFileSync(path, JSON.stringify(obj) + "\n", "utf-8");
}

/** Return current timestamp in ISO format. */
function nowISO() {
  return new Date().toISOString();
}

// --- commands ----------------------------------------------------------------

/**
 * Record a pipeline execution event → execution-memory.jsonl.
 * @param {{ story: string, session?: string, stage?: string, blocked?: boolean,
 *   reason?: string, 'change-level'?: string, agents?: string, p0?: string,
 *   p1?: string, p2?: string, feature?: string, description?: string,
 *   context?: string, 'duration-ms'?: string }} opts
 */
function cmdExec(opts) {
  const { storyPath } = resolveStory(opts.story);
  const sessionId = opts.session || `s${Date.now().toString(36)}`;
  const memoryDir = ensureMemoryDir(storyPath);

  const qualityIssues = {
    P0: opts.p0 ? Array(parseInt(opts.p0, 10)).fill("P0-issue") : [],
    P1: opts.p1 ? Array(parseInt(opts.p1, 10)).fill("P1-issue") : [],
    P2: opts.p2 ? Array(parseInt(opts.p2, 10)).fill("P2-issue") : [],
  };

  const record = {
    session_id: sessionId,
    timestamp: nowISO(),
    story_name: opts.story,
    feature: opts.feature || "",
    description: opts.description || "",
    planned_change_level: opts["change-level"] || "T2",
    actual_change_level: opts["change-level"] || "T2",
    phase_transitions: [],
    update_context: opts.context || "",
    agents_called: opts.agents ? opts.agents.split(",").map((s) => s.trim()) : [],
    quality_issues: qualityIssues,
    bad_cases: [],
    was_blocked: !!opts.blocked,
    block_reason: opts.reason || (opts.blocked ? "unknown" : null),
    stage: opts.stage || "",
    duration_ms: opts["duration-ms"] ? parseInt(opts["duration-ms"], 10) : 0,
  };

  const filePath = join(memoryDir, "execution-memory.jsonl");
  appendJsonl(filePath, record);
  console.log(green(`✓ 执行记忆已记录: ${filePath}`));
  console.log(dim(`  session=${sessionId} story=${opts.story} blocked=${!!opts.blocked}`));
}

/**
 * Record a delivery tracking event → delivery-tracking.jsonl.
 * @param {{ story: string, status: string, step?: string }} opts
 */
function cmdDelivery(opts) {
  const { storyPath } = resolveStory(opts.story);
  const memoryDir = ensureMemoryDir(storyPath);

  const record = {
    session_id: opts.session || `dlv${Date.now().toString(36)}`,
    timestamp: nowISO(),
    story_name: opts.story,
    status: opts.status || "success",
    step: opts.step || "unknown",
    message: opts.message || "",
    duration_ms: opts["duration-ms"] ? parseInt(opts["duration-ms"], 10) : 0,
  };

  const filePath = join(memoryDir, "delivery-tracking.jsonl");
  appendJsonl(filePath, record);
  console.log(green(`✓ 交付事件已记录: ${filePath}`));
  console.log(dim(`  status=${record.status} step=${record.step}`));
}

/**
 * Record a tool call audit event → tool-audit.jsonl.
 * @param {{ story: string, tool: string, result: string, 'duration-ms'?: string }} opts
 */
function cmdAudit(opts) {
  const { storyPath } = resolveStory(opts.story);
  const memoryDir = ensureMemoryDir(storyPath);

  const record = {
    session_id: opts.session || `aud${Date.now().toString(36)}`,
    timestamp: nowISO(),
    story_name: opts.story,
    tool: opts.tool || "unknown",
    result: opts.result || "success",
    duration_ms: opts["duration-ms"] ? parseInt(opts["duration-ms"], 10) : 0,
    error: opts.error || null,
  };

  const filePath = join(memoryDir, "tool-audit.jsonl");
  appendJsonl(filePath, record);
  console.log(green(`✓ 工具审计已记录: ${filePath}`));
  console.log(dim(`  tool=${record.tool} result=${record.result}`));
}

/**
 * Update pipeline state → rui-state.json.
 * @param {{ story: string, stage: string, blocked?: boolean, reason?: string }} opts
 */
function cmdState(opts) {
  const { storyPath } = resolveStory(opts.story);
  const memoryDir = ensureMemoryDir(storyPath);
  const statePath = join(memoryDir, "rui-state.json");

  // Read existing state or create new
  let state = readJson(statePath);
  const now = nowISO();

  if (!state) {
    state = {
      story_name: opts.story,
      started_at: now,
      current_stage: opts.stage || "任务",
      status: opts.stage || "任务",
      blocked: false,
      block_reason: null,
      last_updated: now,
      pipeline_progress: {},
      delivery_pipeline: {},
      change_history: [],
    };
  }

  // Update fields
  state.last_updated = now;
  if (opts.stage) {
    const previousStage = state.current_stage;
    state.current_stage = opts.stage;
    state.status = opts.stage;
    state.change_history.push({
      timestamp: now,
      from_status: previousStage,
      to_status: opts.stage,
      trigger: "record state command",
    });
  }
  if (opts.blocked !== undefined) {
    state.blocked = !!opts.blocked;
    state.block_reason = opts.reason || (opts.blocked ? "unknown" : null);
  }

  writeFileSync(statePath, JSON.stringify(state, null, 2) + "\n", "utf-8");
  console.log(green(`✓ 管线状态已更新: ${statePath}`));
  console.log(dim(`  stage=${state.current_stage} blocked=${state.blocked}`));
}

/**
 * Bootstrap .memory/ and .improvement/ directories for one or all stories.
 * @param {{ story?: string, all?: boolean }} opts
 */
function cmdBootstrap(opts) {
  const projectRoot = findProjectRoot(process.cwd());
  const projectName = readProjectName(projectRoot);

  let stories;
  if (opts.story) {
    const storyPath = join(projectRoot, STORY_PANEL_DIR, opts.story);
    if (!existsSync(storyPath)) {
      console.error(`record: 故事目录不存在: ${storyPath}`);
      process.exit(0);
    }
    stories = [{ name: opts.story, path: storyPath }];
  } else {
    stories = findStoryDirs(projectRoot);
  }

  console.log("");
  console.log(bold(`引导初始化 .memory/ 和 .improvement/ · ${stories.length} 个故事`));
  console.log("");

  for (const story of stories) {
    const memoryDir = ensureMemoryDir(story.path);
    const improveDir = ensureImprovementDir(story.path);

    // Create initial rui-state.json if missing
    const statePath = join(memoryDir, "rui-state.json");
    if (!existsSync(statePath)) {
      const initialState = {
        story_name: story.name,
        started_at: nowISO(),
        current_stage: "任务",
        status: "任务",
        blocked: false,
        block_reason: null,
        last_updated: nowISO(),
        pipeline_progress: {},
        delivery_pipeline: {},
        change_history: [{
          timestamp: nowISO(),
          from_status: null,
          to_status: "任务",
          trigger: "bootstrap",
        }],
      };
      writeFileSync(statePath, JSON.stringify(initialState, null, 2) + "\n", "utf-8");
    }

    // Create initial status-history.jsonl if missing (seed with bootstrap entry)
    const statusHistoryPath = join(memoryDir, "status-history.jsonl");
    if (!existsSync(statusHistoryPath)) {
      const seedEntry = {
        timestamp: nowISO(),
        story_name: story.name,
        from_status: null,
        to_status: "任务",
        trigger: "bootstrap",
      };
      appendJsonl(statusHistoryPath, seedEntry);
    }

    console.log(`  ${green("✓")} ${story.name}`);
    console.log(`    ${dim(memoryDir)}`);
    console.log(`    ${dim(improveDir)}`);
  }

  // Also create project root .memory/ for cross-story data
  const rootMemoryDir = join(projectRoot, MEMORY_DIR);
  if (!existsSync(rootMemoryDir)) {
    mkdirSync(rootMemoryDir, { recursive: true });
  }

  console.log("");
  console.log(green(`✅ 已引导 ${stories.length} 个故事`));
  console.log(dim(`  项目根 .memory/: ${rootMemoryDir}`));
  console.log("");
}

/**
 * Compress execution memories into a rolling summary → compressed-memory.json.
 * @param {{ story?: string, window?: string }} opts
 */
function cmdCompress(opts) {
  const projectRoot = findProjectRoot(process.cwd());
  const window = opts.window || 12;
  let allExec = [];

  if (opts.story) {
    const storyPath = join(projectRoot, STORY_PANEL_DIR, opts.story);
    allExec = readJsonl(join(storyPath, EXEC_MEMORY_FILE));
  } else {
    const stories = findStoryDirs(projectRoot);
    for (const s of stories) {
      allExec = allExec.concat(readJsonl(join(s.path, EXEC_MEMORY_FILE)));
    }
  }

  if (allExec.length === 0) {
    console.log("");
    console.log(dim("  无执行记忆数据可压缩"));
    console.log("");
    return;
  }

  // Take last N memories
  const recent = allExec.slice(-window);

  // Compute aggregate stats
  let blockedCount = 0, totalP0 = 0, totalIssues = 0;
  const agentCounts = {};
  const stageDurations = {};
  for (const r of recent) {
    if (r.was_blocked) blockedCount++;
    const qi = r.quality_issues || {};
    totalP0 += (qi.P0 || []).length;
    totalIssues += (qi.P0 || []).length + (qi.P1 || []).length + (qi.P2 || []).length;
    for (const a of (r.agents_called || [])) {
      agentCounts[a] = (agentCounts[a] || 0) + 1;
    }
    const transitions = r.phase_transitions || [];
    for (const t of transitions) {
      const key = `${t.from}→${t.to}`;
      if (!stageDurations[key]) stageDurations[key] = [];
      stageDurations[key].push(t.duration_ms || 0);
    }
  }

  // Compute averages for stage durations
  const stageAvgs = {};
  for (const [key, durs] of Object.entries(stageDurations)) {
    if (durs.length > 0) {
      stageAvgs[key] = Math.round(durs.reduce((a, b) => a + b, 0) / durs.length);
    }
  }

  const compressed = {
    compiled_at: nowISO(),
    window_size: window,
    source_count: recent.length,
    total_executions: allExec.length,
    block_rate: recent.length > 0 ? (blockedCount / recent.length * 100).toFixed(1) + "%" : "0%",
    p0_density: totalIssues > 0 ? (totalP0 / totalIssues * 100).toFixed(1) + "%" : "0%",
    agent_participation: agentCounts,
    avg_stage_durations_ms: stageAvgs,
    story_distribution: recent.reduce((acc, r) => {
      acc[r.story_name] = (acc[r.story_name] || 0) + 1;
      return acc;
    }, {}),
  };

  // Write compressed memory (single JSON object)
  const targetPath = opts.story
    ? join(projectRoot, STORY_PANEL_DIR, opts.story, COMPRESSED_MEMORY_FILE)
    : join(projectRoot, COMPRESSED_MEMORY_FILE);
  writeFileSync(targetPath, JSON.stringify(compressed, null, 2) + "\n", "utf-8");

  console.log("");
  console.log(green(`✓ 记忆压缩完成: ${targetPath}`));
  console.log(dim(`  窗口=${window} 源数据=${recent.length} 总数据=${allExec.length}`));
  console.log(dim(`  阻断率=${compressed.block_rate} P0密度=${compressed.p0_density}`));
  console.log("");
}

// --- main ---
function main() {
  const opts = parseArgs();

  switch (opts.command) {
    case "exec":
      if (!opts.story) {
        console.error("record: exec 需要 --story=<name>");
        process.exit(0);
      }
      cmdExec(opts);
      break;
    case "delivery":
      if (!opts.story) {
        console.error("record: delivery 需要 --story=<name>");
        process.exit(0);
      }
      cmdDelivery(opts);
      break;
    case "audit":
      if (!opts.story) {
        console.error("record: audit 需要 --story=<name>");
        process.exit(0);
      }
      cmdAudit(opts);
      break;
    case "state":
      if (!opts.story) {
        console.error("record: state 需要 --story=<name>");
        process.exit(0);
      }
      cmdState(opts);
      break;
    case "bootstrap":
      cmdBootstrap(opts);
      break;
    case "compress":
      cmdCompress(opts);
      break;
    default:
      console.error(`record: 未知命令 "${opts.command}"。可用: exec | delivery | audit | state | bootstrap | compress`);
      process.exit(0);
  }
}

if (process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
