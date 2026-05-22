#!/usr/bin/env node
// collector — Centralized execution-memory writer for rui pipeline
// 用法: node .memory/collector.mjs [options]
// 每次 rui 管线执行时确定性地追加一条记录到 execution-memory.jsonl

import { join, resolve, dirname } from "node:path";
import { existsSync, readFileSync, mkdirSync, appendFileSync } from "node:fs";

// --- constants ----------------------------------------------------------------
const PROJECT_ROOT_MARKERS = [".git", ".claude"];
const REQUIRED_FIELDS = ["session_id", "timestamp", "story_name", "command", "stage"];
const VALID_LEVELS = ["T1", "T2", "T3"];
const VALID_STAGES = [
  "init", "plan", "impact_analysis", "arch_design",
  "doc_generation", "pre_check", "gate_a", "implementation",
  "verification", "self_improve", "delivery", "update",
];
const CHANGE_LEVEL_DEFAULT = "T2";
const STAGE_DEFAULT = "init";
const STORY_DEFAULT = "unknown";
const MODEL_DEFAULT = "unknown";
const INDENT_SPACES = 2;
const ARGV_OFFSET = 2;

// --- args --------------------------------------------------------------------
function showHelp() {
  console.log("");
  console.log("collector — 集中式执行记忆写入器");
  console.log("");
  console.log("用法: node .memory/collector.mjs [options]");
  console.log("");
  console.log("参数:");
  console.log("  --story=<name>            故事名（必填）");
  console.log("  --command=<cmd>           触发 rui 命令（如 /rui code user-login）");
  console.log("  --stage=<stage>           当前阶段: init|plan|doc_generation|implementation|verification|self_improve|delivery|update");
  console.log("  --sessionId=<id>          会话 ID（默认自动生成 YYYYMMDDHHmmss）");
  console.log("  --planned=<T1|T2|T3>     计划变更等级（默认 T2）");
  console.log("  --actual=<T1|T2|T3>      实际变更等级（默认 T2）");
  console.log("  --agents=<a1,a2>         参与的 Agent（逗号分隔）");
  console.log("  --context=<text>          变更上下文描述");
  console.log("  --blocked                 标记为阻断");
  console.log("  --block-reason=<reason>   阻断原因");
  console.log("  --markPhase               记录阶段切换");
  console.log("  --phaseFrom=<stage>       阶段切换起点");
  console.log("  --phaseTo=<stage>         阶段切换终点");
  console.log("  --stdin                   从标准输入读取 JSON 批量设置字段");
  console.log("  --validate                校验 execution-memory.jsonl 完整性");
  console.log("  --help                    显示此帮助");
  console.log("");
  console.log("数据契约（16 字段）: skills/rui/coder.md");
  console.log("管线集成: rules/delivery-gate.md § Step 0");
  console.log("");
}

function parseArgs() {
  const args = process.argv.slice(ARGV_OFFSET);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
    showHelp();
    process.exit(0);
  }

  const opts = {
    story: STORY_DEFAULT,
    command: "",
    stage: STAGE_DEFAULT,
    blocked: false,
    block_reason: null,
    planned: CHANGE_LEVEL_DEFAULT,
    actual: CHANGE_LEVEL_DEFAULT,
    agents: "",
    context: "",
    markPhase: null,
    phaseFrom: null,
    phaseTo: null,
    stdin: false,
    validate: false,
    sessionId: "",
  };

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") { showHelp(); process.exit(0); }
    if (arg === "--blocked") { opts.blocked = true; continue; }
    if (arg === "--stdin") { opts.stdin = true; continue; }
    if (arg === "--validate") { opts.validate = true; continue; }

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
    for (const marker of PROJECT_ROOT_MARKERS) {
      if (existsSync(join(dir, marker))) return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) return resolve(startDir);
    dir = parent;
  }
}

// --- validation --------------------------------------------------------------
function validateRecord(record) {
  const errors = [];
  for (const field of REQUIRED_FIELDS) {
    if (!record[field]) errors.push(`缺少必填字段: ${field}`);
  }
  if (record.planned_change_level && !VALID_LEVELS.includes(record.planned_change_level)) {
    errors.push(`planned_change_level 无效: ${record.planned_change_level}（应为 T1/T2/T3）`);
  }
  if (record.actual_change_level && !VALID_LEVELS.includes(record.actual_change_level)) {
    errors.push(`actual_change_level 无效: ${record.actual_change_level}（应为 T1/T2/T3）`);
  }
  if (record.stage && !VALID_STAGES.includes(record.stage)) {
    errors.push(`stage 无效: ${record.stage}`);
  }
  return errors;
}

function generateSessionId() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => { data += chunk; });
    process.stdin.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(new Error(`stdin JSON 解析失败: ${err.message}`));
      }
    });
    process.stdin.on("error", reject);
  });
}

// --- command handlers --------------------------------------------------------

async function cmdAppend(opts) {
  let stdinData = {};
  if (opts.stdin) {
    try {
      stdinData = await readStdin();
    } catch (err) {
      console.error(`[collector] ${err.message}`);
      process.exit(0);
    }
  }

  const sessionId = opts.sessionId || process.env.SESSION_ID || generateSessionId();
  const model = process.env.CLAUDE_MODEL || MODEL_DEFAULT;

  const record = {
    session_id: sessionId,
    timestamp: new Date().toISOString(),
    story_name: opts.story,
    command: opts.command || "",
    stage: opts.stage,
    feature: opts.context || stdinData.feature || "",
    description: stdinData.description || "",
    planned_change_level: opts.planned,
    actual_change_level: opts.actual,
    phase_transitions: [],
    update_context: opts.context || stdinData.update_context || "",
    agents_called: opts.agents ? opts.agents.split(",").map((s) => s.trim()).filter(Boolean) : [],
    quality_issues: stdinData.quality_issues || { P0: [], P1: [], P2: [] },
    bad_cases: stdinData.bad_cases || [],
    was_blocked: opts.blocked,
    block_reason: opts.block_reason || null,
    model,
    ...stdinData._extra,
  };

  // Phase transition recording
  if (opts.markPhase && opts.phaseFrom && opts.phaseTo) {
    const existingRecord = findLastRecordForStory(opts.story);
    if (existingRecord) {
      record.phase_transitions = (existingRecord.phase_transitions || []).concat([{
        from: opts.phaseFrom,
        to: opts.phaseTo,
        timestamp: new Date().toISOString(),
        duration_ms: 0,
      }]);
    } else {
      record.phase_transitions = [{
        from: opts.phaseFrom,
        to: opts.phaseTo,
        timestamp: new Date().toISOString(),
        duration_ms: 0,
      }];
    }
  }

  const errors = validateRecord(record);
  if (errors.length > 0) {
    console.error("[collector] 记录校验失败:");
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(0);
  }

  const memoryDir = resolve(".memory");
  if (!existsSync(memoryDir)) mkdirSync(memoryDir, { recursive: true });

  const filePath = join(memoryDir, "execution-memory.jsonl");
  const line = JSON.stringify(record) + "\n";
  appendFileSync(filePath, line, "utf-8");

  console.log(`[collector] 已追加: story=${record.story_name} stage=${record.stage} session=${record.session_id}`);
}

function findLastRecordForStory(storyName) {
  const filePath = resolve(".memory/execution-memory.jsonl");
  if (!existsSync(filePath)) return null;

  try {
    const content = readFileSync(filePath, "utf-8").trim();
    if (!content) return null;
    const lines = content.split("\n");
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const record = JSON.parse(lines[i]);
        if (record.story_name === storyName) return record;
      } catch { /* skip malformed lines */ }
    }
  } catch { /* file read error */ }
  return null;
}

function cmdValidate() {
  const filePath = resolve(".memory/execution-memory.jsonl");
  if (!existsSync(filePath)) {
    console.log("[collector] execution-memory.jsonl 不存在（尚无记录）");
    process.exit(0);
  }

  let lineCount = 0;
  let errorCount = 0;
  try {
    const content = readFileSync(filePath, "utf-8").trim();
    if (!content) {
      console.log("[collector] execution-memory.jsonl 为空");
      process.exit(0);
    }
    const lines = content.split("\n");
    lineCount = lines.length;
    for (let i = 0; i < lines.length; i++) {
      try {
        const record = JSON.parse(lines[i]);
        const errors = validateRecord(record);
        if (errors.length > 0) {
          errorCount++;
          console.log(`[collector] 行 ${i + 1} 校验失败:`);
          for (const err of errors) console.log(`  - ${err}`);
        }
      } catch (err) {
        errorCount++;
        console.log(`[collector] 行 ${i + 1} JSON 解析失败: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`[collector] 读取失败: ${err.message}`);
    process.exit(0);
  }

  const ok = lineCount - errorCount;
  console.log(`[collector] 校验完成: ${ok} 通过, ${errorCount} 失败, ${lineCount} 总计`);
}

// --- main --------------------------------------------------------------------
async function main() {
  const opts = parseArgs();

  if (opts.validate) {
    cmdValidate();
    return;
  }

  await cmdAppend(opts);
}

main().catch((err) => {
  console.error(`[collector] fatal: ${err.message}`);
  process.exit(0);
});
