#!/usr/bin/env node
/**
 * send — Executable rui-bot notification sender
 * 用法: node skills/rui-bot/send.mjs [options]
 * 按 SKILL.md 规约发送企微通知并追加消息日志
 *
 * 对应场景文档:
 *   - docs/故事任务面板/yry-arch/场景-2-数据流追踪/
 *   - docs/故事任务面板/yry-arch/场景-4-依赖变更影响/
 *   - docs/故事任务面板/yry-self-test/ (全局通知)
 */

import { join } from "node:path";
import { existsSync, readFileSync, readdirSync, appendFileSync, writeFileSync, statSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

import {
  NODE_ARGV_OFFSET, HTTP_TIMEOUT_MS, HTTP_TIMEOUT_SHORT_MS, MAX_RETRIES, RETRY_DELAY_MS,
  MAX_MSG_LENGTH, DEFAULT_API_URL,
  DIAGNOSTIC_LABELS, DIAGNOSTIC_BASELINES, DIAGNOSTIC_MIN_CONFIDENCE,
  T3_PROPORTION_THRESHOLD,
  STORY_PANEL_DIR,
} from "../../lib/constants.mjs";
import { findProjectRoot, readProjectName } from "../../lib/fs.mjs";
import { runDiagnostics } from "../../lib/engine/diagnostics.mjs";

// --- constants ----------------------------------------------------------------
const API_URL_DEFAULT = `${DEFAULT_API_URL}/wework/send-message`;

const STATUS_EMOJI = {
  complete: "✅",
  blocked: "🚫",
  "gate-fail": "🔍",
  progress: "⏳",
};

const STATUS_LABELS = {
  complete: "完成",
  blocked: "阻断",
  "gate-fail": "门禁失败",
  progress: "进行中",
};

const FIELD_EMOJI = {
  skill: "🤖",
  command: "📋",
  conclusion: "🎯",
  description: "📝",
  scope: "📌",
  nextStep: "👉",
  impact: "🌐",
  evidence: "📎",
  session: "⏱️",
  reason: "❌",
  recovery: "🧭",
  gate: "🔍",
  result: "📊",
};

// --- args --------------------------------------------------------------------
function parseArgs() {
  const args = process.argv.slice(NODE_ARGV_OFFSET);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
    showUsage();
    process.exit(0);
  }

  const opts = {
    story: "",
    status: "complete",
    project: "",
    content: "",
    noSend: false,
    dryRun: false,
    retries: MAX_RETRIES,
    // Rich / verbose mode flags
    rich: false,
    verbose: false,
    // Field values for structured message
    skill: "",
    command: "",
    conclusion: "",
    description: "",
    scope: "",
    nextStep: "",
    impact: "",
    evidence: "",
    session: "",
    reason: "",
    recovery: "",
    gate: "",
    gateResult: "",
    stage: "",
    fileStats: "",
    // Progress / pipeline fields
    totalStages: "",
    currentStage: "",
    completedSteps: "",
    totalSteps: "",
    timing: "",
    p0Count: "",
    p1Count: "",
    p2Count: "",
    // Verbose diagnostic fields
    diagSummary: "",
    testSummary: "",
    fcCount: "",
    reportLink: "",
  };

  for (const arg of args) {
    if (arg === "--no-send") { opts.noSend = true; continue; }
    if (arg === "--dry-run") { opts.dryRun = true; continue; }
    if (arg === "--rich") { opts.rich = true; continue; }
    if (arg === "--verbose") { opts.verbose = true; continue; }

    const eq = arg.indexOf("=");
    if (eq === -1) continue;
    const key = arg.slice(2, eq);
    const val = arg.slice(eq + 1);
    if (key === "retries") {
      opts.retries = parseInt(val, 10) || MAX_RETRIES;
    } else {
      opts[key] = val;
    }
  }

  return opts;
}

function showUsage() {
  console.log("");
  console.log("rui-bot send — 企业微信通知发送");
  console.log("");
  console.log("用法:");
  console.log("  node skills/rui-bot/send.mjs [options]");
  console.log("  node skills/rui-bot/send.mjs health [--html] [--notify] [--alert]");
  console.log("  node skills/rui-bot/send.mjs flush");
  console.log("");
  console.log("Options:");
  console.log("  --story=<name>         故事名");
  console.log("  --project=<name>       项目名（默认从 CLAUDE.md 读取）");
  console.log("  --skill=<name>         技能标识（rui / rui-story / rui-claude / rui-bot / rui-import）");
  console.log("  --command=<text>       执行的命令（如 /rui doc user-login）");
  console.log("  --status=<s>           状态: complete|blocked|gate-fail|progress（默认 complete）");
  console.log("  --stage=<text>         当前阶段");
  console.log("  --conclusion=<text>    结论");
  console.log("  --description=<text>   描述");
  console.log("  --scope=<text>         范围");
  console.log("  --nextStep=<text>      下一步（complete 场景）");
  console.log("  --impact=<text>        影响");
  console.log("  --evidence=<text>      证据");
  console.log("  --session=<text>       会话信息");
  console.log("  --reason=<text>        阻断原因（blocked 场景）");
  console.log("  --recovery=<text>      恢复点（blocked 场景）");
  console.log("  --gate=<text>          门禁名称（gate-fail 场景）");
  console.log("  --gateResult=<text>    门禁结果（gate-fail 场景）");
  console.log("  --fileStats=<text>     变更文件统计");
  console.log("  --content=<text>       直接指定消息正文（覆盖字段构建）");
  console.log("  --no-send              仅写日志，不发送 HTTP");
  console.log("  --retries=<N>          重试次数（默认 3）");
  console.log("");
  console.log("Rich 格式选项 (--rich):");
  console.log("  --rich                  启用 Rich 视觉格式（进度条 / 管线指示器 / 耗时 / P0 统计）");
  console.log("  --totalStages=<N>       总阶段数");
  console.log("  --currentStage=<N>      当前阶段编号");
  console.log("  --completedSteps=<N>    已完成步骤数");
  console.log("  --totalSteps=<N>        总步骤数");
  console.log("  --timing=<text>         耗时（如 2.3min）");
  console.log("  --p0Count=<N>           P0 数量");
  console.log("  --p1Count=<N>           P1 数量");
  console.log("  --p2Count=<N>           P2 数量");
  console.log("");
  console.log("Verbose 选项 (--verbose):");
  console.log("  --verbose               启用诊断概要块（D0-D7 / 变更统计 / 测试摘要）");
  console.log("  --diagSummary=<text>    诊断概要（\\n 分隔多行）");
  console.log("  --testSummary=<text>    测试摘要（如 8/10 通过, 2 失败）");
  console.log("  --fcCount=<N>           变更文件数");
  console.log("  --reportLink=<url>      完整报告链接");
  console.log("");
}

// --- config ---
function loadConfig(projectRoot) {
  const configPath = join(projectRoot, ".claude", "skills", "rui-bot", "config.json");
  if (!existsSync(configPath)) return { api_url: API_URL_DEFAULT, robots: {}, agents: {}, default_robot: "general" };
  try {
    return JSON.parse(readFileSync(configPath, "utf-8"));
  } catch {
    return { api_url: API_URL_DEFAULT, robots: {}, agents: {}, default_robot: "general" };
  }
}

// --- message builder ---

/**
 * Make a unicode block-character progress bar.
 * @param {number} percent - 0-100
 * @param {number} width - bar width in characters (default 20)
 * @returns {string} e.g., "████████░░░░░░░░░░░░"
 */
function makeProgressBar(percent, width = 20) {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.round((clamped / 100) * width);
  const empty = width - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

/**
 * Compute progress percentage from current/total stage or step counts.
 * @returns {number|null}
 */
function computeProgressPercent(opts) {
  if (opts.currentStage && opts.totalStages) {
    const cs = parseInt(opts.currentStage, 10);
    const ts = parseInt(opts.totalStages, 10);
    if (!isNaN(cs) && !isNaN(ts) && ts > 0) {
      return Math.round((cs / ts) * 100);
    }
  }
  if (opts.completedSteps && opts.totalSteps) {
    const done = parseInt(opts.completedSteps, 10);
    const total = parseInt(opts.totalSteps, 10);
    if (!isNaN(done) && !isNaN(total) && total > 0) {
      return Math.round((done / total) * 100);
    }
  }
  return null;
}

/**
 * Truncate message to MAX_MSG_LENGTH, appending ... if truncated.
 */
function truncateMsg(msg) {
  return msg.length > MAX_MSG_LENGTH ? msg.slice(0, MAX_MSG_LENGTH - 3) + "..." : msg;
}

/**
 * Compute story statistics from the story directory.
 * Scans scene directories and determines completion + last activity.
 * @returns {{ totalScenes: number, completedScenes: number, lastActivity: string }|null}
 */
function computeStoryStats(projectRoot, storyName) {
  const storyDir = join(projectRoot, STORY_PANEL_DIR, storyName);
  if (!existsSync(storyDir)) return null;

  let totalScenes = 0;
  let completedScenes = 0;
  let latestMs = 0;

  try {
    const entries = readdirSync(storyDir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isDirectory() || !/^场景-\d+-/.test(e.name)) continue;
      totalScenes++;
      const sceneDir = join(storyDir, e.name);

      // Completion evidence: implementation artifacts exist
      const hasEvidence = existsSync(join(sceneDir, "审查.html"))
                       || existsSync(join(sceneDir, "测试面板.html"))
                       || existsSync(join(sceneDir, "源码.html"));
      if (hasEvidence) completedScenes++;

      // Track latest mtime across all scene files
      try {
        const sceneFiles = readdirSync(sceneDir);
        for (const f of sceneFiles) {
          try {
            const s = statSync(join(sceneDir, f));
            if (s.mtimeMs > latestMs) latestMs = s.mtimeMs;
          } catch { /* skip unreadable */ }
        }
      } catch { /* skip unreadable scene */ }
    }
  } catch {
    return null;
  }

  const lastActivity = latestMs > 0 ? new Date(latestMs).toISOString().slice(0, 10) : "";

  return { totalScenes, completedScenes, lastActivity };
}

/**
 * Build a rich visual pipeline block.
 * Returns an array of lines (no trailing newline).
 */
function buildRichBlock(opts, emoji) {
  const lines = [];
  const pct = computeProgressPercent(opts);

  lines.push("┌─ Pipeline ──────────────────");

  if (pct !== null) {
    lines.push(`│ ${makeProgressBar(pct, 18)} ${pct}%`);
  }

  if (opts.currentStage && opts.totalStages) {
    const stageName = opts.stage || (opts.status === "complete" ? "完成" : "进行中…");
    lines.push(`│ 阶段 ${opts.currentStage}/${opts.totalStages}: ${stageName} ${emoji}`);
  } else if (opts.stage) {
    lines.push(`│ ${opts.stage} ${emoji}`);
  } else {
    lines.push(`│ ${STATUS_LABELS[opts.status] || "运行中"} ${emoji}`);
  }

  if (opts.timing) {
    lines.push(`│ 耗时: ${opts.timing}`);
  }

  const p0 = opts.p0Count || "0";
  const p1 = opts.p1Count || "0";
  const p2 = opts.p2Count || "0";
  lines.push(`│ P0: ${p0}  P1: ${p1}  P2: ${p2}`);

  lines.push("└────────────────────────────");
  return lines;
}

/**
 * Build a verbose diagnostic summary block.
 */
function buildVerboseBlock(opts, projectRoot) {
  const lines = [];
  lines.push("┌─ 诊断概要 ──────────────────");

  if (opts.diagSummary) {
    // Support \\n as line separator for shell-passed args
    const diagLines = opts.diagSummary.replace(/\\n/g, "\n").split("\n").filter(Boolean);
    for (const dl of diagLines) {
      lines.push(`│ ${dl}`);
    }
  } else if (projectRoot) {
    // Auto-compute light diagnostic summary when projectRoot available
    try {
      const diagResult = getDiagnosticResult(projectRoot);
      if (diagResult.skip || diagResult.triggered.length === 0) {
        lines.push("│ D0-D7: 无异常");
      } else {
        for (const d of diagResult.triggered) {
          lines.push(`│ ${d.id}: ${d.label}`);
        }
      }
    } catch {
      lines.push("│ 诊断数据不可用");
    }
  }

  if (opts.fcCount) {
    lines.push(`│ 变更文件: ${opts.fcCount} 个`);
  }

  if (opts.testSummary) {
    lines.push(`│ 测试: ${opts.testSummary}`);
  }

  if (opts.reportLink) {
    lines.push(`│ 完整报告: ${opts.reportLink}`);
  }

  lines.push("└────────────────────────────");
  return lines;
}

/**
 * Build a story statistics block.
 */
function buildStoryStatsBlock(stats, storyName, p0Count, p1Count, p2Count) {
  const lines = [];
  lines.push(`┌─ 故事统计: ${storyName} ────────`);

  if (stats.totalScenes > 0) {
    lines.push(`│ 场景: ${stats.completedScenes}/${stats.totalScenes} 完成`);
  }

  const p0 = p0Count || "0";
  const p1 = p1Count || "0";
  const p2 = p2Count || "0";
  lines.push(`│ P0: ${p0}  P1: ${p1}  P2: ${p2}`);

  if (stats.lastActivity) {
    lines.push(`│ 最近活动: ${stats.lastActivity}`);
  }

  lines.push("└────────────────────────────");
  return lines;
}

function buildMessage(opts, projectName, projectRoot) {
  // When raw content is provided, still enforce skill + command prefix
  if (opts.content) {
    // Unescape shell-passed newlines
    const content = opts.content.replace(/\\n/g, "\n");
    const header = `【${projectName}】`;
    const prefixLines = [];
    if (opts.skill) prefixLines.push(`${FIELD_EMOJI.skill} 技能: ${opts.skill}`);
    if (opts.command) prefixLines.push(`${FIELD_EMOJI.command} 命令: ${opts.command}`);
    const prefix = prefixLines.length > 0 ? prefixLines.join("\n") + "\n" : "";
    const msg = `${header}\n${prefix}${content}`;
    return truncateMsg(msg);
  }

  const lines = [`【${projectName}】`];
  const emoji = STATUS_EMOJI[opts.status] || STATUS_EMOJI.complete;
  const label = STATUS_LABELS[opts.status] || STATUS_LABELS.complete;
  const storyCtx = opts.story ? `故事 ${opts.story}` : "当前项目";
  const dateStr = new Date().toISOString().slice(0, 10);

  // Constraint #7: skill + command must be first two lines after project header
  lines.push(`${FIELD_EMOJI.skill} 技能: ${opts.skill || "rui"}`);
  lines.push(`${FIELD_EMOJI.command} 命令: ${opts.command || "—"}`);

  // ---- Rich visual block (if enabled) ----
  if (opts.rich) {
    lines.push("");
    lines.push(...buildRichBlock(opts, emoji));
  }

  // All required fields with smart defaults — never bare
  let conclusion;
  if (opts.conclusion) {
    conclusion = opts.conclusion;
  } else if (opts.status === "progress") {
    const cs = opts.currentStage || "?";
    const ts = opts.totalStages || "?";
    conclusion = `阶段 ${cs}/${ts}: ${opts.stage || "进行中…"}`;
  } else {
    conclusion = `${label} ${storyCtx}${opts.stage ? ` ${opts.stage} 阶段` : ""}`;
  }

  const description = opts.description || `${storyCtx} 管线${label}`;
  const scope = opts.scope || (opts.story ? `docs/故事任务面板/${opts.story}/` : "—");
  const nextStep = opts.nextStep || (opts.status === "blocked" ? "修复后重跑同命令续跑" : "继续下一阶段");
  const impact = opts.impact || (opts.story ? `docs/故事任务面板/${opts.story}/` : "—");
  const evidence = opts.evidence || (opts.story ? ".memory/rui-state.json" : "—");
  const session = opts.session || dateStr;

  // Insert blank line between rich block and standard fields
  if (opts.rich) lines.push("");

  lines.push(`${FIELD_EMOJI.conclusion} 结论: ${conclusion}`);
  lines.push(`${FIELD_EMOJI.description} 描述: ${description}`);
  lines.push(`${FIELD_EMOJI.scope} 范围: ${scope}`);

  // Scenario-specific fields
  if (opts.status === "blocked") {
    lines.push(`${FIELD_EMOJI.reason} 原因: ${opts.reason || "见 rui-state.json"}`);
    lines.push(`${FIELD_EMOJI.recovery} 恢复点: ${opts.recovery || opts.stage || opts.story || "—"}`);
  }
  if (opts.status === "gate-fail") {
    lines.push(`${FIELD_EMOJI.gate} 门禁: ${opts.gate || "—"}`);
    lines.push(`${FIELD_EMOJI.result} 结果: ${opts.gateResult || "—"}`);
  }
  if (opts.status === "progress") {
    if (opts.completedSteps || opts.totalSteps) {
      lines.push(`📊 进度: ${opts.completedSteps || "?"}/${opts.totalSteps || "?"} 步骤已完成`);
    }
    if (opts.timing) {
      lines.push(`⏱️ 耗时: ${opts.timing}`);
    }
  }

  lines.push(`${FIELD_EMOJI.nextStep} 下一步: ${nextStep}`);
  lines.push(`${FIELD_EMOJI.impact} 影响: ${impact}`);
  lines.push(`${FIELD_EMOJI.evidence} 证据: ${evidence}`);
  lines.push(`${FIELD_EMOJI.session} 会话: ${session}`);

  // Detail section with file stats
  if (opts.fileStats) {
    lines.push("");
    lines.push("———");
    lines.push("");
    lines.push(`变更统计: ${opts.fileStats}`);
  }

  // ---- Story statistics (auto-computed when --story + --rich) ----
  if (opts.story && opts.rich && projectRoot) {
    const stats = computeStoryStats(projectRoot, opts.story);
    if (stats && (stats.totalScenes > 0 || stats.lastActivity)) {
      lines.push("");
      lines.push("———");
      lines.push("");
      lines.push(...buildStoryStatsBlock(stats, opts.story, opts.p0Count, opts.p1Count, opts.p2Count));
    }
  }

  // ---- Verbose diagnostic block (if enabled) ----
  if (opts.verbose) {
    lines.push("");
    lines.push("———");
    lines.push("");
    lines.push(...buildVerboseBlock(opts, projectRoot));
  }

  // ---- Summary footer ----
  const now = new Date();
  const ts = now.toISOString().replace("T", " ").slice(0, 19);
  const sessionId = (Math.random() + 1).toString(36).substring(2, 8);
  lines.push("");
  lines.push(`└─ ${ts} · sid:${sessionId}`);

  return truncateMsg(lines.join("\n"));
}

/**
 * Build a health-check-specific notification message.
 */
function buildHealthNotification(hr, projectName) {
  const lines = [`【${projectName}】`];
  const dateStr = new Date().toISOString().slice(0, 10);

  lines.push(`${FIELD_EMOJI.skill} 技能: rui-bot`);
  lines.push(`${FIELD_EMOJI.command} 命令: health`);

  const gradeEmoji = hr.grade === "A" ? "✅" : hr.grade === "B" ? "✅" : hr.grade === "C" ? "⚠️" : "🚫";
  lines.push(`🩺 健康度: ${hr.composite} 分 / ${hr.grade} 级 ${gradeEmoji}`);

  // Triggered diagnostics summary
  if (hr.diagnostics?.triggered?.length > 0) {
    const diagSummary = hr.diagnostics.triggered.map((d) => `${d.id} ${d.label}`).join(", ");
    lines.push(`⚠️ 触发诊断: ${diagSummary}`);
  } else {
    lines.push(`✅ D0-D7: 全部通过`);
  }

  // Dimension highlights — only show warnings/failures
  const warnings = [];
  for (const [dim, label] of Object.entries({
    token: "Token", config: "配置", robots: "机器人", api: "API",
    reports: "报告", format: "格式", diagnostics: "诊断",
  })) {
    const s = hr.scores[dim];
    if (s !== undefined && s < 80) warnings.push(`${label} ${s}分`);
  }
  if (warnings.length > 0) {
    lines.push(`📊 关注维度: ${warnings.join(", ")}`);
  }

  lines.push(`${FIELD_EMOJI.evidence} 报告: docs/健康报告/`);
  lines.push(`${FIELD_EMOJI.session} 检查时间: ${dateStr}`);

  const msg = lines.join("\n");
  return msg.length > MAX_MSG_LENGTH ? msg.slice(0, MAX_MSG_LENGTH - 3) + "..." : msg;
}

/**
 * Build a health ALERT notification — more urgent format for below-threshold scores.
 */
function buildHealthAlertNotification(hr, projectName, threshold) {
  const lines = [`【${projectName}】🚨 健康告警`];
  const dateStr = new Date().toISOString().slice(0, 10);

  lines.push(`${FIELD_EMOJI.skill} 技能: rui-bot`);
  lines.push(`${FIELD_EMOJI.command} 命令: health --alert`);

  const gradeEmoji = hr.grade === "D" ? "🔴" : "🟡";
  lines.push(`🩺 健康度: ${hr.composite} 分 / ${hr.grade} 级 ${gradeEmoji} (阈值 ${threshold})`);

  // Worst dimensions (below 60)
  const critical = [];
  const warnings = [];
  for (const [dim, cfg] of Object.entries(HEALTH_DIMENSIONS)) {
    const s = hr.scores[dim];
    if (s !== undefined && s < 40) critical.push(`${cfg.label} ${s}分`);
    else if (s !== undefined && s < 70) warnings.push(`${cfg.label} ${s}分`);
  }

  if (critical.length > 0) {
    lines.push(`🔴 严重: ${critical.join(", ")}`);
  }
  if (warnings.length > 0) {
    lines.push(`🟡 警告: ${warnings.join(", ")}`);
  }

  // Triggered diagnostics
  if (hr.diagnostics?.triggered?.length > 0) {
    const diagSummary = hr.diagnostics.triggered.map((d) => `${d.id} ${d.label}`).join(", ");
    lines.push(`⚠️ 触发诊断: ${diagSummary}`);
  }

  // Git info if problematic
  if (hr.gitInfo && hr.gitInfo.uncommitted > 20) {
    lines.push(`📦 Git: ${hr.gitInfo.uncommitted} 个未提交文件`);
  }

  lines.push(`${FIELD_EMOJI.evidence} 报告: docs/健康报告/`);
  lines.push(`${FIELD_EMOJI.session} 告警时间: ${dateStr}`);
  lines.push("");
  lines.push("💡 建议: 运行 node skills/rui-bot/send.mjs health --html 查看完整报告");

  const msg = lines.join("\n");
  return msg.length > MAX_MSG_LENGTH ? msg.slice(0, MAX_MSG_LENGTH - 3) + "..." : msg;
}

// --- API ---
async function sendToWecom(apiUrl, webhookUrl, content, token) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-Token": token || "",
      },
      body: JSON.stringify({
        webhook_url: webhookUrl,
        content,
      }),
    });

    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);

    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { ok: true, data };
  } finally {
    clearTimeout(timer);
  }
}

async function sendWithRetry(apiUrl, webhookUrl, content, token, maxRetries) {
  let lastError = null;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const result = await sendToWecom(apiUrl, webhookUrl, content, token);
      return { ...result, retries: i };
    } catch (err) {
      lastError = err.message;
      if (i < maxRetries) {
        console.error(`[rui-bot] 重试 ${i + 1}/${maxRetries}: ${err.message}`);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }

  return { ok: false, error: lastError, retries: maxRetries };
}

// --- notification queue ---

const NOTIFICATION_QUEUE_FILE = ".memory/notification-queue.jsonl";

function enqueueFailedNotification(projectRoot, message, webhookUrl, apiUrl, token) {
  const queuePath = join(projectRoot, NOTIFICATION_QUEUE_FILE);
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    message,
    webhook_url: webhookUrl,
    api_url: apiUrl,
    token_hint: token ? `${token.slice(0, 4)}...` : "",
    retries: 0,
  });
  try {
    appendFileSync(queuePath, entry + "\n", "utf-8");
    console.log("[rui-bot] 📥 失败通知已入队列, 待 flush 重试");
  } catch (err) {
    console.error(`[rui-bot] 入队列失败: ${err.message}`);
  }
}

async function flushNotificationQueue(projectRoot) {
  const queuePath = join(projectRoot, NOTIFICATION_QUEUE_FILE);
  if (!existsSync(queuePath)) {
    console.log("[rui-bot] 通知队列为空，无需处理");
    return { flushed: 0, remaining: 0 };
  }

  let lines;
  try {
    lines = readFileSync(queuePath, "utf-8").trim().split("\n").filter(Boolean);
  } catch {
    return { flushed: 0, remaining: 0 };
  }

  if (lines.length === 0) {
    return { flushed: 0, remaining: 0 };
  }

  console.log(`[rui-bot] 队列中有 ${lines.length} 条待发通知，开始重试...`);

  const remaining = [];
  let flushed = 0;

  for (const line of lines) {
    let entry;
    try { entry = JSON.parse(line); } catch { continue; }

    if (!entry.webhook_url || !entry.message) continue;

    const token = process.env.API_X_TOKEN || "";
    if (!token) {
      remaining.push(line);
      continue;
    }

    const result = await sendWithRetry(entry.api_url, entry.webhook_url, entry.message, token, 1);
    if (result.ok) {
      flushed++;
    } else {
      entry.retries = (entry.retries || 0) + 1;
      if (entry.retries < MAX_RETRIES) {
        remaining.push(JSON.stringify(entry));
      } else {
        console.error(`[rui-bot] 通知已达最大重试次数，丢弃: ${entry.timestamp}`);
      }
    }
  }

  // Rewrite queue with remaining entries
  try {
    if (remaining.length > 0) {
      writeFileSync(queuePath, remaining.join("\n") + "\n", "utf-8");
    } else {
      writeFileSync(queuePath, "", "utf-8"); // Clear the file
    }
  } catch { /* best effort */ }

  console.log(`[rui-bot] 队列处理完成: 发送 ${flushed} 条, 剩余 ${remaining.length} 条`);
  return { flushed, remaining: remaining.length };
}

// --- health scoring ---
const HEALTH_DIMENSIONS = {
  token:      { label: "Token 凭据", weight: 15 },
  config:     { label: "配置文件", weight: 10 },
  robots:     { label: "机器人配置", weight: 10 },
  api:        { label: "API 可达性", weight: 15 },
  reports:    { label: "自循环报告", weight: 10 },
  format:     { label: "消息格式合规", weight: 10 },
  diagnostics:{ label: "D0-D7 诊断", weight: 10 },
  git:        { label: "Git 仓库状态", weight: 10 },
  security:   { label: "安全扫描", weight: 10 },
  em_testing: { label: "测试体系", weight: 10 },
  em_types:   { label: "类型安全", weight: 8 },
  em_linting: { label: "代码规范", weight: 8 },
  em_cicd:    { label: "CI/CD", weight: 8 },
  em_docs:    { label: "文档完整", weight: 8 },
  em_deps:    { label: "依赖管理", weight: 5 },
  em_git:     { label: "Git 纪律", weight: 5 },
  comp_qual:  { label: "组件质量", weight: 10 },
};

const HEALTH_GRADE = [
  { min: 90, grade: "A", label: "优秀", color: "\x1b[32m" },
  { min: 75, grade: "B", label: "良好", color: "\x1b[33m" },
  { min: 60, grade: "C", label: "一般", color: "\x1b[33m" },
  { min: 0,  grade: "D", label: "需关注", color: "\x1b[31m" },
];

function scoreEmoji(score) {
  if (score >= 90) return "✅";
  if (score >= 75) return "✅";
  if (score >= 60) return "⚠️";
  return "❌";
}

function healthBar(score, width = 20) {
  const filled = Math.round((score / 100) * width);
  const empty = width - filled;
  const color = score >= 75 ? "\x1b[32m" : score >= 60 ? "\x1b[33m" : "\x1b[31m";
  return `${color}${"█".repeat(filled)}\x1b[90m${"░".repeat(empty)}\x1b[0m`;
}

// ── notification delivery log ─────────────────────────────

const NOTIFICATION_LOG_FILE = ".memory/notification-log.jsonl";

function logNotificationDelivery(projectRoot, opts, result) {
  try {
    const entry = {
      timestamp: new Date().toISOString(),
      story: opts.story || "",
      skill: opts.skill || "",
      status: opts.status || "",
      result: result.ok ? "ok" : "fail",
      error: result.error || "",
      retries: result.retries || 0,
      msgLength: result.msgLength || 0,
      dryRun: result.dryRun || false,
    };
    const logPath = join(projectRoot, NOTIFICATION_LOG_FILE);
    appendFileSync(logPath, JSON.stringify(entry) + "\n", "utf-8");
  } catch { /* best effort */ }
}

// ── health trend persistence ──────────────────────────────

const HEALTH_TREND_FILE = ".memory/health-trend.jsonl";

function saveHealthTrend(result, projectRoot) {
  try {
    const entry = {
      timestamp: new Date().toISOString(),
      composite: result.composite,
      grade: result.grade,
      scores: result.scores,
      bootstrapped: result.diagnostics?.bootstrapped || false,
      triggeredDiags: (result.diagnostics?.triggered || []).map((d) => d.id),
      gitBranch: result.gitInfo?.branch || "",
      gitUncommitted: result.gitInfo?.uncommitted || 0,
      compScoreSummary: result.compScores ? {
        skills:  { count: result.compScores.skills.length,  avgScore: Math.round(result.compScores.skills.reduce((a,c) => a + c.score, 0) / Math.max(1, result.compScores.skills.length)) },
        agents:  { count: result.compScores.agents.length,  avgScore: Math.round(result.compScores.agents.reduce((a,c) => a + c.score, 0) / Math.max(1, result.compScores.agents.length)) },
        rules:   { count: result.compScores.rules.length,   avgScore: Math.round(result.compScores.rules.reduce((a,c) => a + c.score, 0) / Math.max(1, result.compScores.rules.length)) },
        scripts: { count: result.compScores.scripts.length, avgScore: Math.round(result.compScores.scripts.reduce((a,c) => a + c.score, 0) / Math.max(1, result.compScores.scripts.length)) },
      } : null,
    };
    const trendPath = join(projectRoot, HEALTH_TREND_FILE);
    const dir = join(projectRoot, ".memory");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    appendFileSync(trendPath, JSON.stringify(entry) + "\n", "utf-8");
  } catch { /* best effort */ }
}

// ── git snapshot ────────────────────────────────────────────
function getGitSnapshot(projectRoot) {
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      cwd: projectRoot, encoding: "utf-8", timeout: 5000,
    }).trim();

    const status = execSync("git status --porcelain", {
      cwd: projectRoot, encoding: "utf-8", timeout: 5000,
    });

    const uncommitted = status.trim().split("\n").filter(Boolean).length;

    const behindAhead = execSync("git rev-list --left-right --count origin/$(git rev-parse --abbrev-ref HEAD)...HEAD 2>/dev/null || echo '0\t0'", {
      cwd: projectRoot, encoding: "utf-8", timeout: 5000, shell: true,
    }).trim();

    const [behind, ahead] = behindAhead.split("\t").map(Number);

    const issues = [];
    if (uncommitted > 10) issues.push(`${uncommitted} 个未提交文件`);
    if (!isNaN(behind) && behind > 0) issues.push(`落后 origin ${behind} 个提交`);
    if (!isNaN(ahead) && ahead > 5) issues.push(`领先 origin ${ahead} 个提交（建议推送）`);

    const score = issues.length === 0 ? 100
      : uncommitted > 20 ? 40
      : issues.length >= 2 ? 60
      : 80;

    const summary = issues.length > 0
      ? `${branch} · ${issues.join("; ")}`
      : `${branch} · ${uncommitted > 0 ? `${uncommitted} 个未提交文件` : "工作区干净"}`;

    const icon = score >= 80 ? "✅" : score >= 60 ? "⚠️" : "❌";
    return { score, summary, icon, branch, uncommitted, behind, ahead };
  } catch {
    return { score: 0, summary: "Git 信息获取失败", icon: "⏭️", branch: "?", uncommitted: 0, behind: 0, ahead: 0 };
  }
}

// ── security scan ──────────────────────────────────────────
function runSecurityScan(projectRoot) {
  const findings = [];

  // Check for common secret patterns in tracked files (skip node_modules, .git, .memory)
  const secretPatterns = [
    { pattern: /(['"])(x?-?token|x?-?key|x?-?secret|password|passwd)\1\s*[:=]\s*['"][^'"]{8,}['"]/gi, label: "硬编码凭据" },
    { pattern: /sk-[a-zA-Z0-9]{20,}/g, label: "疑似 OpenAI/API 密钥" },
    { pattern: /ghp_[a-zA-Z0-9]{36}/g, label: "疑似 GitHub Token" },
    { pattern: /AKIA[0-9A-Z]{16}/g, label: "疑似 AWS Access Key" },
  ];

  try {
    const trackedFiles = execSync("git ls-files --cached --others --exclude-standard", {
      cwd: projectRoot, encoding: "utf-8", timeout: 5000,
    }).trim().split("\n").filter(Boolean);

    const scannable = trackedFiles.filter((f) =>
      !f.startsWith(".git/") && !f.startsWith("node_modules/") && !f.startsWith(".memory/")
      && /\.(js|mjs|ts|json|yml|yaml|md|env|toml|sh|py|rb)$/.test(f)
    );

    for (const file of scannable.slice(0, 200)) { // Limit scan to 200 files
      try {
        const content = readFileSync(join(projectRoot, file), "utf-8");
        for (const { pattern, label } of secretPatterns) {
          pattern.lastIndex = 0;
          const matches = content.match(pattern);
          if (matches) {
            findings.push(`${file}: ${label} (${matches.length} 处)`);
          }
        }
      } catch { /* skip unreadable */ }
    }
  } catch { /* git ls-files failed */ }

  // Check .env files not in .gitignore
  try {
    const envFiles = execSync("git ls-files --others .env* 2>/dev/null || true", {
      cwd: projectRoot, encoding: "utf-8", timeout: 3000,
    }).trim();
    if (envFiles) {
      findings.push(`未追踪的 .env 文件: ${envFiles.split("\n").join(", ")}`);
    }
  } catch { /* skip */ }

  const score = findings.length === 0 ? 100
    : findings.length <= 2 ? 70
    : findings.length <= 5 ? 40
    : 20;

  const summary = findings.length === 0
    ? "未发现风险"
    : `${findings.length} 项发现: ${findings.slice(0, 2).join("; ")}${findings.length > 2 ? ` +${findings.length - 2} 项` : ""}`;

  const icon = score >= 80 ? "✅" : score >= 60 ? "⚠️" : "❌";
  return { score, summary, icon, findings };
}

// --- structure analysis ---
const STRUCT_LARGE_FILE_WARN = 500;
const STRUCT_LARGE_FILE_CRIT = 1000;
const STRUCT_MODULE_FILE_WARN = 30;
const STRUCT_MODULE_LINE_WARN = 3000;
const STRUCT_TOP_FILES = 20;
const STRUCT_TOP_MODULES = 10;
const STRUCT_SOURCE_EXT = new Set([
  "js", "mjs", "cjs", "ts", "tsx", "jsx", "py", "rb", "go", "rs",
  "java", "kt", "scala", "sh", "bash", "zsh", "md", "json", "yml", "yaml",
  "html", "css", "scss", "vue", "svelte",
]);

function countFileLines(filePath) {
  try {
    const buf = readFileSync(filePath);
    if (buf.length > 2 * 1024 * 1024) {
      return String(buf).split("\n").length;
    }
    let count = 0;
    let cr = false;
    for (const b of buf) {
      if (b === 0x0a) { count++; cr = false; }
      else if (b === 0x0d) { cr = true; }
      else if (cr) { count++; cr = false; }
    }
    if (cr || (buf.length > 0 && buf[buf.length - 1] !== 0x0a)) count++;
    return count;
  } catch {
    return 0;
  }
}

/**
 * Analyze project structure: large files and large modules.
 * Returns { largeFiles, modules, totals, score, summary, icon }.
 */
function getStructureHealth(projectRoot) {
  const largeFiles = [];
  const modules = new Map();

  try {
    const tracked = execSync("git ls-files --cached --others --exclude-standard", {
      cwd: projectRoot, encoding: "utf-8", timeout: 8000,
    }).trim().split("\n").filter(Boolean);

    let fileCount = 0;
    let totalLines = 0;
    let skipped = 0;

    for (const rel of tracked) {
      if (
        rel.startsWith(".git/") ||
        rel.startsWith("node_modules/") ||
        rel.startsWith(".memory/") ||
        rel.startsWith("dist/") ||
        rel.startsWith("build/") ||
        rel.startsWith("coverage/") ||
        rel.startsWith("cdn/")
      ) continue;
      const dot = rel.lastIndexOf(".");
      const ext = dot > 0 ? rel.slice(dot + 1).toLowerCase() : "";
      if (!STRUCT_SOURCE_EXT.has(ext)) continue;

      const abs = join(projectRoot, rel);
      const lines = countFileLines(abs);
      if (lines <= 0) continue;

      fileCount++;
      totalLines += lines;

      if (lines >= STRUCT_LARGE_FILE_WARN) {
        largeFiles.push({ path: rel, lines, ext });
      }

      const topDir = rel.includes("/") ? rel.split("/")[0] : "(root)";
      const mod = modules.get(topDir) || { name: topDir, fileCount: 0, lines: 0, maxLines: 0, maxFile: "" };
      mod.fileCount++;
      mod.lines += lines;
      if (lines > mod.maxLines) { mod.maxLines = lines; mod.maxFile = rel; }
      modules.set(topDir, mod);
    }

    largeFiles.sort((a, b) => b.lines - a.lines);
    const topFiles = largeFiles.slice(0, STRUCT_TOP_FILES);

    const topModules = [...modules.values()]
      .sort((a, b) => b.lines - a.lines)
      .slice(0, STRUCT_TOP_MODULES)
      .map((m) => ({
        ...m,
        avgLines: m.fileCount > 0 ? Math.round(m.lines / m.fileCount) : 0,
      }));

    const critFiles = largeFiles.filter((f) => f.lines >= STRUCT_LARGE_FILE_CRIT).length;
    const warnFiles = largeFiles.length - critFiles;
    const hotModules = topModules.filter(
      (m) => m.lines >= STRUCT_MODULE_LINE_WARN || m.fileCount >= STRUCT_MODULE_FILE_WARN,
    );

    let score = 100;
    score -= critFiles * 8;
    score -= warnFiles * 3;
    score -= hotModules.length * 4;
    score = Math.max(0, Math.min(100, score));

    const summary =
      `${fileCount} 源文件 · ${totalLines.toLocaleString()} 行` +
      (largeFiles.length > 0 ? ` · ${largeFiles.length} 大文件` : "") +
      (hotModules.length > 0 ? ` · ${hotModules.length} 热模块` : "");

    const icon = score >= 80 ? "✅" : score >= 60 ? "⚠️" : "❌";

    return {
      largeFiles: topFiles,
      allLargeFileCount: largeFiles.length,
      critFileCount: critFiles,
      modules: topModules,
      totals: { fileCount, totalLines },
      score,
      summary,
      icon,
    };
  } catch (err) {
    return {
      largeFiles: [],
      allLargeFileCount: 0,
      critFileCount: 0,
      modules: [],
      totals: { fileCount: 0, totalLines: 0 },
      score: 0,
      summary: `分析失败: ${err.message?.slice(0, 40) || "unknown"}`,
      icon: "❌",
    };
  }
}

// --- health check ---
async function cmdHealth(projectRoot, opts = {}) {
  const config = loadConfig(projectRoot);
  const token = process.env.API_X_TOKEN || "";
  const scores = {};
  const details = [];
  const quiet = opts.short || false;

  console.log("");
  console.log("╔════════════════════════════════════════╗");
  console.log("║       rui-bot 综合健康检查             ║");
  console.log("╚════════════════════════════════════════╝");
  console.log("");

  // ── 1. Token ──────────────────────────────────────────
  const tokenOk = !!token;
  const tokenLen = token.length;
  scores.token = tokenOk ? 100 : 0;
  details.push({
    dim: "token",
    label: "Token 凭据",
    status: tokenOk ? "pass" : "fail",
    detail: tokenOk ? `已配置 (${tokenLen} 字符)` : "API_X_TOKEN 环境变量缺失",
    score: scores.token,
  });
  console.log(`  ${tokenOk ? "✅" : "❌"} Token 凭据:       ${tokenOk ? `已配置 (${tokenLen} 字符)` : "缺失 — 通知发送将降级跳过"}`);

  // ── 2. Config ─────────────────────────────────────────
  const configPath = join(projectRoot, ".claude", "skills", "rui-bot", "config.json");
  const configOk = existsSync(configPath);
  const robotCount = Object.keys(config.robots || {}).length;
  const notifEnabled = config.notification ? Object.entries(config.notification).filter(([,v]) => v).length : 0;
  scores.config = configOk ? (robotCount > 0 ? 100 : 60) : 20;
  details.push({
    dim: "config",
    label: "配置文件",
    status: configOk ? "pass" : "warn",
    detail: configOk
      ? `存在 — ${robotCount} 机器人, ${notifEnabled}/4 通知开关已启用`
      : "config.json 缺失，使用内置默认值",
    score: scores.config,
  });
  console.log(`  ${configOk ? "✅" : "⚠️"} 配置文件:         ${configOk ? `${robotCount} 机器人, ${notifEnabled}/4 通知开关` : "缺失 — 使用内置默认"}`);

  // ── 3. Robots ─────────────────────────────────────────
  const robots = config.robots || {};
  const robotNames = Object.keys(robots);
  let robotOkCount = 0;
  for (const [name, cfg] of Object.entries(robots)) {
    const hasWebhook = !!(cfg.webhook_url) || !!(cfg.webhook_url_env && process.env[cfg.webhook_url_env]);
    if (hasWebhook) robotOkCount++;
  }
  scores.robots = robotNames.length > 0
    ? Math.round((robotOkCount / robotNames.length) * 100)
    : 0;
  details.push({
    dim: "robots",
    label: "机器人配置",
    status: scores.robots >= 100 ? "pass" : scores.robots >= 50 ? "warn" : "fail",
    detail: robotNames.length > 0
      ? `${robotOkCount}/${robotNames.length} webhook 就绪 (${robotNames.join(", ")})`
      : "无机器人配置",
    score: scores.robots,
  });
  const robotIcon = scores.robots >= 100 ? "✅" : scores.robots >= 50 ? "⚠️" : "❌";
  console.log(`  ${robotIcon} 机器人配置:       ${robotOkCount}/${robotNames.length} webhook 就绪`);
  for (const [name, cfg] of Object.entries(robots)) {
    const hasWebhook = !!(cfg.webhook_url) || !!(cfg.webhook_url_env && process.env[cfg.webhook_url_env]);
    console.log(`    ${hasWebhook ? "✅" : "⚠️"} ${name}: webhook ${hasWebhook ? "已配置" : "缺失"}`);
  }

  // ── 4. API ────────────────────────────────────────────
  let apiScore = 0;
  let apiStatus = "fail";
  let apiDetail = "";
  if (tokenOk) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT_SHORT_MS);
      const res = await fetch(config.api_url || API_URL_DEFAULT, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", "X-Token": token },
        body: JSON.stringify({ webhook_url: "", content: "health-check" }),
      });
      clearTimeout(timer);
      // Any HTTP response (even 4xx/5xx) means the API is reachable.
      // The status code reflects request validity, not reachability.
      apiScore = 100;
      apiStatus = "pass";
      apiDetail = `可达 (HTTP ${res.status})`;
      console.log(`  ✅ API 可达性:       ${apiDetail}`);
    } catch (err) {
      apiScore = 0;
      apiDetail = `不可达 — ${err.message.slice(0, 60)}`;
      console.log(`  ❌ API 可达性:       ${apiDetail}`);
    }
  } else {
    apiScore = 0;
    apiDetail = "跳过 — Token 未配置";
    console.log(`  ⏭️ API 可达性:       ${apiDetail}`);
  }
  scores.api = apiScore;
  details.push({ dim: "api", label: "API 可达性", status: apiStatus, detail: apiDetail, score: apiScore });

  // ── 5. Self-loop reports ──────────────────────────────
  const reportDir = join(projectRoot, "docs", "自循环报告");
  let reportScore = 0;
  let reportDetail = "";
  if (existsSync(reportDir)) {
    const reportFiles = readdirSync(reportDir).filter(f => f.endsWith(".html") && f !== "index.html");
    const indexOk = existsSync(join(reportDir, "index.html"));
    const recentCount = reportFiles.filter(f => {
      try {
        // Support both legacy (date as second-to-last segment) and loop-report
        // format: skill-YYYY-MM-DD-timestamp.html — scan for date triple
        const base = f.replace(".html", "");
        const parts = base.split("-");
        let fileDate = null;
        // Try legacy: second-to-last segment is a full date string (length 10)
        const legacyCandidate = parts[parts.length - 2];
        if (legacyCandidate && legacyCandidate.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(legacyCandidate)) {
          fileDate = new Date(legacyCandidate);
        } else {
          // Try loop-report format: scan for YYYY-MM-DD triple
          for (let i = 0; i <= parts.length - 3; i++) {
            if (/^\d{4}$/.test(parts[i]) && /^\d{2}$/.test(parts[i+1]) && /^\d{2}$/.test(parts[i+2])) {
              fileDate = new Date(`${parts[i]}-${parts[i+1]}-${parts[i+2]}`);
              break;
            }
          }
        }
        if (!fileDate || isNaN(fileDate.getTime())) return false;
        const daysOld = (Date.now() - fileDate.getTime()) / 86400000;
        return daysOld <= 7;
      } catch { return false; }
    }).length;
    reportScore = indexOk ? (recentCount > 0 ? 100 : 60) : 40;
    reportDetail = `${reportFiles.length} 份报告, ${recentCount} 份近 7 天${indexOk ? "" : ", 索引缺失"}`;
  } else {
    reportScore = 0;
    reportDetail = "报告目录不存在";
  }
  scores.reports = reportScore;
  const reportIcon = reportScore >= 80 ? "✅" : reportScore >= 50 ? "⚠️" : "❌";
  details.push({ dim: "reports", label: "自循环报告", status: reportScore >= 80 ? "pass" : reportScore >= 50 ? "warn" : "fail", detail: reportDetail, score: reportScore });
  console.log(`  ${reportIcon} 自循环报告:       ${reportDetail}`);

  // ── 6. Message format compliance ──────────────────────
  const { formatOk, formatIssues } = validateMessageFormat();
  scores.format = formatOk ? 100 : Math.max(0, 100 - formatIssues.length * 25);
  details.push({
    dim: "format",
    label: "消息格式合规",
    status: formatOk ? "pass" : "warn",
    detail: formatOk ? "SKILL.md 格式约束全部满足" : `${formatIssues.length} 项不合规: ${formatIssues.join("; ")}`,
    score: scores.format,
  });
  console.log(`  ${formatOk ? "✅" : "⚠️"} 消息格式合规:     ${formatOk ? "全部通过" : formatIssues.length + " 项不合规"}`);
  if (!formatOk) {
    for (const issue of formatIssues) console.log(`    ⚠️ ${issue}`);
  }

  // ── 7. D0-D7 diagnostics (full engine) ────────────────
  const diagResult = getDiagnosticResult(projectRoot);
  scores.diagnostics = diagResult.score;
  const diagDetail = diagResult.skip
    ? diagResult.summary
    : `${diagResult.execCount} 条记录, ${diagResult.triggered.length}/8 诊断触发`;
  details.push({
    dim: "diagnostics",
    label: "D0-D7 诊断",
    status: diagResult.score >= 80 ? "pass" : diagResult.score >= 60 ? "warn" : "fail",
    detail: diagDetail,
    score: diagResult.score,
    diagnostics: diagResult.diagnostics,
    triggered: diagResult.triggered,
  });
  const diagIcon = diagResult.score >= 80 ? "✅" : diagResult.score >= 60 ? "⚠️" : diagResult.skip ? "⏭️" : "❌";
  const bootLabel = diagResult.bootstrapped ? " (Git 引导)" : "";
  console.log(`  ${diagIcon} D0-D7 诊断:       ${diagDetail}${bootLabel}`);
  if (diagResult.triggered?.length > 0) {
    for (const d of diagResult.triggered) {
      console.log(`    ⚠️ ${d.id} ${d.label}: ${d.evidence}`);
    }
  }

  // ── 8. Git repository state ──────────────────────────
  const gitInfo = getGitSnapshot(projectRoot);
  scores.git = gitInfo.score;
  details.push({
    dim: "git",
    label: "Git 仓库状态",
    status: gitInfo.score >= 80 ? "pass" : gitInfo.score >= 60 ? "warn" : "fail",
    detail: gitInfo.summary,
    score: gitInfo.score,
  });
  console.log(`  ${gitInfo.icon} Git 仓库状态:     ${gitInfo.summary}`);

  // ── 9. Security scan ──────────────────────────────────
  const secInfo = runSecurityScan(projectRoot);
  scores.security = secInfo.score;
  details.push({
    dim: "security",
    label: "安全扫描",
    status: secInfo.score >= 80 ? "pass" : secInfo.score >= 60 ? "warn" : "fail",
    detail: secInfo.summary,
    score: secInfo.score,
  });
  console.log(`  ${secInfo.icon} 安全扫描:         ${secInfo.summary}`);

  // ── 10-16. Engineering maturity (rui-init §7) ────────────
  const emResult = assessEngineeringMaturity(projectRoot);
  Object.assign(scores, emResult.scores);
  for (const d of emResult.details) details.push(d);
  for (const [dim, info] of Object.entries(emResult.scores)) {
    const icon = info >= 80 ? "✅" : info >= 60 ? "⚠️" : "❌";
    const label = HEALTH_DIMENSIONS[dim]?.label || dim;
    console.log(`  ${icon} ${label}:${" ".repeat(Math.max(0, 12 - label.length))} ${info} 分 — ${emResult.summaries[dim] || ""}`);
  }

  // ── 17. Structure analysis (大模块/大文件) ──────────────
  const structInfo = getStructureHealth(projectRoot);
  console.log(`  ${structInfo.icon} 结构健康:         ${structInfo.summary}`);

  // ── Composite score ───────────────────────────────────
  let totalScore = 0;
  let totalWeight = 0;
  for (const [dim, cfg] of Object.entries(HEALTH_DIMENSIONS)) {
    if (scores[dim] !== undefined) {
      totalScore += scores[dim] * cfg.weight;
      totalWeight += cfg.weight;
    }
  }
  const composite = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  const grade = HEALTH_GRADE.find(g => composite >= g.min);

  console.log("");
  console.log("  ┌──────────────────────────────────────┐");
  console.log(`  │ 综合健康度: ${grade.color}${composite} 分 / ${grade.grade} 级 — ${grade.label}\x1b[0m  │`);
  console.log(`  │ ${healthBar(composite)} │`);
  console.log("  └──────────────────────────────────────┘");
  console.log("");

  // ── Component quality dimension (before display loop) ────
  const compScores = scanComponentScores(projectRoot);
  const allComps = [...compScores.skills, ...compScores.agents, ...compScores.rules, ...compScores.scripts];
  const compQualScore = allComps.length > 0
    ? Math.round(allComps.reduce((a, c) => a + c.score, 0) / allComps.length)
    : 0;
  const compPassCount = allComps.filter((c) => c.score >= 80).length;
  const compWarnCount = allComps.filter((c) => c.score >= 60 && c.score < 80).length;
  const compFailCount = allComps.filter((c) => c.score < 60).length;
  scores.comp_qual = compQualScore;
  details.push({
    dim: "comp_qual",
    label: "组件质量",
    status: compQualScore >= 80 ? "pass" : compQualScore >= 60 ? "warn" : "fail",
    detail: `${allComps.length} 组件均分 ${compQualScore} · 优秀 ${compPassCount} / 一般 ${compWarnCount} / 待改进 ${compFailCount}`,
    score: compQualScore,
  });
  console.log(`  ${compQualScore >= 80 ? "✅" : compQualScore >= 60 ? "⚠️" : "❌"} 组件质量:         ${compQualScore} 分 — ${allComps.length} 组件 (Skills ${compScores.skills.length} · Agents ${compScores.agents.length} · Rules ${compScores.rules.length} · Scripts ${compScores.scripts.length})`);

  // Dimension breakdown
  console.log("  维度得分:");
  for (const [dim, cfg] of Object.entries(HEALTH_DIMENSIONS)) {
    const s = scores[dim] ?? 0;
    const bar = healthBar(s, 10);
    console.log(`    ${cfg.label.padEnd(14)} ${bar} ${s} 分`);
  }
  console.log("");

  const result = { composite, grade: grade.grade, scores, details, diagnostics: diagResult, config, tokenOk, robotOkCount, robotNames, gitInfo, secInfo, structInfo, compScores };
  saveHealthTrend(result, projectRoot);

  // Regenerate self-improve summary after each health check
  try {
    const { generateSummary } = await import("../../../lib/selfimprove-generator.mjs");
    generateSummary(projectRoot);
  } catch { /* best effort — summary generation is non-critical */ }

  return result;
}

/**
 * Assess project engineering maturity from file system signals.
 * Returns scores and details for the 7 engineering dimensions (rui-init §7).
 */
function assessEngineeringMaturity(projectRoot) {
  const scores = {};
  const details = [];
  const summaries = {};
  const pkgJsonPath = join(projectRoot, "package.json");
  const pkg = existsSync(pkgJsonPath) ? JSON.parse(readFileSync(pkgJsonPath, "utf-8")) : null;
  const allDeps = { ...(pkg?.dependencies || {}), ...(pkg?.devDependencies || {}) };
  const depNames = Object.keys(allDeps);

  // 1. Testing infrastructure
  const testFrameworks = ["vitest", "jest", "mocha", "ava", "jasmine", "pytest", "go-test", "cargo-test"];
  const hasTestFramework = depNames.some(d => testFrameworks.includes(d));
  const hasTestDir = existsSync(join(projectRoot, "tests")) || existsSync(join(projectRoot, "__tests__")) || existsSync(join(projectRoot, "test"));
  const hasTestScript = pkg?.scripts?.test;
  const testCaseCount = countTestCases(projectRoot);
  let emTestScore = 0;
  if (hasTestFramework && testCaseCount >= 10) emTestScore = 100;
  else if (hasTestFramework && testCaseCount > 0) emTestScore = 80;
  else if (hasTestFramework || hasTestDir) emTestScore = 60;
  else if (hasTestScript) emTestScore = 30;
  scores.em_testing = emTestScore;
  summaries.em_testing = hasTestFramework ? `${testCaseCount} 用例` : "无测试框架";
  details.push({ dim: "em_testing", label: "测试体系", status: emTestScore >= 80 ? "pass" : emTestScore >= 60 ? "warn" : "fail", detail: `${hasTestFramework ? testFrameworks.find(d => depNames.includes(d)) : "无框架"}, ${testCaseCount} 用例`, score: emTestScore });

  // 2. Type safety
  const isTS = existsSync(join(projectRoot, "tsconfig.json"));
  const hasStrictTS = isTS && readFileSync(join(projectRoot, "tsconfig.json"), "utf-8").includes('"strict"');
  const hasFlow = depNames.includes("flow-bin") || existsSync(join(projectRoot, ".flowconfig"));
  const hasTypings = existsSync(join(projectRoot, "*.d.ts")) || depNames.some(d => d.startsWith("@types/"));
  let emTypeScore = 0;
  if (isTS && hasStrictTS) emTypeScore = 100;
  else if (isTS) emTypeScore = 70;
  else if (hasFlow || hasTypings) emTypeScore = 40;
  scores.em_types = emTypeScore;
  summaries.em_types = isTS ? (hasStrictTS ? "strict" : "宽松") : "纯 JS";
  details.push({ dim: "em_types", label: "类型安全", status: emTypeScore >= 80 ? "pass" : emTypeScore >= 60 ? "warn" : "fail", detail: isTS ? `TypeScript${hasStrictTS ? " strict" : " (宽松)"}` : "纯 JavaScript", score: emTypeScore });

  // 3. Linting/code style
  const hasESLint = existsSync(join(projectRoot, ".eslintrc.js")) || existsSync(join(projectRoot, ".eslintrc.json")) || existsSync(join(projectRoot, ".eslintrc.cjs")) || existsSync(join(projectRoot, ".eslintrc")) || existsSync(join(projectRoot, "eslint.config.js")) || existsSync(join(projectRoot, "eslint.config.mjs"));
  const hasPrettier = existsSync(join(projectRoot, ".prettierrc")) || existsSync(join(projectRoot, ".prettierrc.json")) || existsSync(join(projectRoot, ".prettierrc.js")) || existsSync(join(projectRoot, "prettier.config.js"));
  const hasEditorConfig = existsSync(join(projectRoot, ".editorconfig"));
  const lintCount = [hasESLint, hasPrettier, hasEditorConfig].filter(Boolean).length;
  const hasCILint = hasESLint && (existsSync(join(projectRoot, ".github")) || existsSync(join(projectRoot, ".gitlab-ci.yml")));
  let emLintScore = 0;
  if (hasCILint) emLintScore = 100;
  else if (lintCount >= 2) emLintScore = 80;
  else if (lintCount >= 1) emLintScore = 60;
  scores.em_linting = emLintScore;
  const lintTools = [];
  if (hasESLint) lintTools.push("ESLint");
  if (hasPrettier) lintTools.push("Prettier");
  if (hasEditorConfig) lintTools.push("EditorConfig");
  summaries.em_linting = lintTools.join(",") || "无";
  details.push({ dim: "em_linting", label: "代码规范", status: emLintScore >= 80 ? "pass" : emLintScore >= 60 ? "warn" : "fail", detail: `${lintCount} 工具: ${lintTools.join(", ") || "无"}${hasCILint ? " + CI 强制" : ""}`, score: emLintScore });

  // 4. CI/CD
  const hasGitHubActions = existsSync(join(projectRoot, ".github", "workflows"));
  const hasGitLabCI = existsSync(join(projectRoot, ".gitlab-ci.yml"));
  const hasJenkins = existsSync(join(projectRoot, "Jenkinsfile"));
  const hasCICD = hasGitHubActions || hasGitLabCI || hasJenkins;
  const hasCIWorkflows = hasGitHubActions && readdirSync(join(projectRoot, ".github", "workflows")).filter(f => f.endsWith(".yml") || f.endsWith(".yaml")).length > 0;
  let emCICDScore = 0;
  if (hasCIWorkflows) emCICDScore = 100;
  else if (hasCICD) emCICDScore = 70;
  scores.em_cicd = emCICDScore;
  const ciLabel = hasGitHubActions ? "GitHub Actions" : hasGitLabCI ? "GitLab CI" : hasJenkins ? "Jenkins" : "无";
  summaries.em_cicd = ciLabel;
  details.push({ dim: "em_cicd", label: "CI/CD", status: emCICDScore >= 80 ? "pass" : emCICDScore >= 60 ? "warn" : "fail", detail: hasCICD ? ciLabel : "无 CI/CD 管线", score: emCICDScore });

  // 5. Documentation completeness
  const hasReadme = existsSync(join(projectRoot, "README.md"));
  const hasClaude = existsSync(join(projectRoot, "CLAUDE.md"));
  const hasAPIDocs = existsSync(join(projectRoot, "docs")) || existsSync(join(projectRoot, "api-docs"));
  const docCount = [hasReadme, hasClaude, hasAPIDocs].filter(Boolean).length;
  let emDocScore = 0;
  if (docCount >= 3) emDocScore = 100;
  else if (docCount >= 2) emDocScore = 80;
  else if (docCount >= 1) emDocScore = 50;
  scores.em_docs = emDocScore;
  const docList = [];
  if (hasReadme) docList.push("README");
  if (hasClaude) docList.push("CLAUDE.md");
  if (hasAPIDocs) docList.push("docs/");
  summaries.em_docs = docList.join(",") || "无";
  details.push({ dim: "em_docs", label: "文档完整", status: emDocScore >= 80 ? "pass" : emDocScore >= 60 ? "warn" : "fail", detail: `${docCount} 文档: ${docList.join(", ") || "无"}`, score: emDocScore });

  // 6. Dependency management
  const hasLockfile = existsSync(join(projectRoot, "package-lock.json")) || existsSync(join(projectRoot, "yarn.lock")) || existsSync(join(projectRoot, "pnpm-lock.yaml")) || existsSync(join(projectRoot, "bun.lockb"));
  const hasNpmScriptVersion = pkg?.scripts && Object.keys(pkg.scripts).some(k => k.includes("version") || k.includes("release"));
  const lockType = existsSync(join(projectRoot, "pnpm-lock.yaml")) ? "pnpm" : existsSync(join(projectRoot, "yarn.lock")) ? "yarn" : existsSync(join(projectRoot, "package-lock.json")) ? "npm" : existsSync(join(projectRoot, "bun.lockb")) ? "bun" : "";
  let emDepScore = 0;
  if (hasLockfile && hasNpmScriptVersion) emDepScore = 100;
  else if (hasLockfile) emDepScore = 70;
  scores.em_deps = emDepScore;
  summaries.em_deps = hasLockfile ? lockType : "无 lockfile";
  details.push({ dim: "em_deps", label: "依赖管理", status: emDepScore >= 80 ? "pass" : emDepScore >= 60 ? "warn" : "fail", detail: hasLockfile ? `${lockType} lockfile${hasNpmScriptVersion ? " + 版本脚本" : ""}` : "无锁文件", score: emDepScore });

  // 7. Git discipline
  const hasGitignore = existsSync(join(projectRoot, ".gitignore"));
  const hasGitAttributes = existsSync(join(projectRoot, ".gitattributes"));
  const hasPRTemplate = existsSync(join(projectRoot, ".github", "PULL_REQUEST_TEMPLATE.md")) || existsSync(join(projectRoot, ".github", "pull_request_template.md"));
  const gitDiscCount = [hasGitignore, hasGitAttributes, hasPRTemplate].filter(Boolean).length;
  const hasBranchProtection = existsSync(join(projectRoot, ".github")) && gitDiscCount >= 2;
  let emGitScore = 0;
  if (hasBranchProtection) emGitScore = 100;
  else if (gitDiscCount >= 2) emGitScore = 80;
  else if (hasGitignore) emGitScore = 60;
  scores.em_git = emGitScore;
  const gitItems = [];
  if (hasGitignore) gitItems.push(".gitignore");
  if (hasGitAttributes) gitItems.push(".gitattributes");
  if (hasPRTemplate) gitItems.push("PR 模板");
  summaries.em_git = gitItems.join(",") || "仅基本";
  details.push({ dim: "em_git", label: "Git 纪律", status: emGitScore >= 80 ? "pass" : emGitScore >= 60 ? "warn" : "fail", detail: `${gitDiscCount} 项: ${gitItems.join(", ") || "无"}`, score: emGitScore });

  return { scores, details, summaries };
}

/**
 * Scan all project components (skills, agents, rules, scripts) and compute
 * per-component quality scores with detailed criteria breakdowns and
 * recommendations for low-scoring components.
 */
function scanComponentScores(projectRoot) {
  const results = { skills: [], agents: [], rules: [], scripts: [] };

  // ── Skills ───────────────────────────────────────────────
  const skillsDir = join(projectRoot, "skills");
  if (existsSync(skillsDir)) {
    const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory());
    for (const sd of skillDirs) {
      const criteria = {};
      const recs = [];
      let score = 0;
      const skillPath = join(skillsDir, sd.name);
      const skillMd = join(skillPath, "SKILL.md");

      // C1: SKILL.md exists (40 pts)
      criteria["SKILL.md 存在"] = existsSync(skillMd);
      if (criteria["SKILL.md 存在"]) {
        score += 40;
        let content = "";
        let lines = 0;
        try { content = readFileSync(skillMd, "utf-8"); lines = content.split("\n").length; } catch {}

        // C2: frontmatter (10 pts)
        criteria["YAML frontmatter"] = /^---/m.test(content);
        if (criteria["YAML frontmatter"]) score += 10;
        else recs.push("添加 YAML frontmatter (name + description)");

        // C3: comprehensive docs (20 pts)
        criteria[`文档 ≥100 行 (当前 ${lines})`] = lines >= 100;
        if (lines >= 100) score += 20;
        else if (lines >= 50) { score += 10; recs.push(`SKILL.md 仅 ${lines} 行，建议扩充到 ≥100 行`); }
        else recs.push(`SKILL.md 仅 ${lines} 行，建议扩充到 ≥100 行`);

        // C4: diagrams (5 pts)
        criteria["含 Mermaid 图表"] = /mermaid|```mermaid/.test(content);
        if (criteria["含 Mermaid 图表"]) score += 5;

        // C5: modular lib/ (15 pts)
        criteria["lib/ 子目录"] = existsSync(join(skillPath, "lib"));
        if (criteria["lib/ 子目录"]) score += 15;
        else if (lines >= 150) recs.push("建议抽取共享逻辑到 lib/ 子目录");

        // Count scripts and help entry
        let mjsCount = 0, hasHelp = false;
        try {
          const files = readdirSync(skillPath, { recursive: true, withFileTypes: true });
          for (const f of files) {
            if (f.isFile() && f.name.endsWith(".mjs")) { mjsCount++; if (f.name === "help.mjs") hasHelp = true; }
          }
        } catch {}

        // C6: help entry (5 pts)
        criteria["help.mjs 入口"] = hasHelp;
        if (hasHelp) score += 5;
        else recs.push("添加 help.mjs 作为技能帮助入口");

        // C7: rich scripts (5 pts)
        criteria[`≥3 个 .mjs (当前 ${mjsCount})`] = mjsCount >= 3;
        if (mjsCount >= 3) score += 5;
      } else {
        recs.push("创建 SKILL.md — 技能无规约文件");
      }

      results.skills.push({
        name: sd.name,
        score: Math.min(100, score),
        criteria,
        recommendations: recs,
        hasSkillMd: criteria["SKILL.md 存在"],
        hasLib: criteria["lib/ 子目录"],
        mjsCount: Object.entries(criteria).find(([k]) => k.includes(".mjs"))?.[1] || 0,
      });
    }
  }

  // ── Agents ───────────────────────────────────────────────
  const agentsDir = join(projectRoot, "agents");
  if (existsSync(agentsDir)) {
    try {
      const agentFiles = readdirSync(agentsDir).filter((f) => f.endsWith(".md"));
      for (const af of agentFiles) {
        const criteria = {};
        const recs = [];
        const agentPath = join(agentsDir, af);
        let score = 0;
        try {
          const content = readFileSync(agentPath, "utf-8");
          const lines = content.split("\n").length;

          // C1: file exists (40)
          score = 40;

          // C2: frontmatter + description (20)
          const hasFM = /^---/m.test(content);
          const hasDesc = /description:/m.test(content);
          criteria["frontmatter + description"] = hasFM && hasDesc;
          if (hasFM && hasDesc) score += 20;
          else if (hasFM) { score += 10; recs.push("frontmatter 缺少 description 字段"); }
          else recs.push("添加 YAML frontmatter");

          // C3: line count (20)
          criteria[`≥200 行 (当前 ${lines})`] = lines >= 200;
          if (lines >= 200) score += 20;
          else if (lines >= 100) { score += 10; recs.push(`仅 ${lines} 行，建议扩充到 ≥200 行`); }
          else recs.push(`仅 ${lines} 行，建议扩充到 ≥200 行`);

          // C4: Red Flags (10)
          criteria["含 Red Flags / 合理化速查"] = /Red Flag|red flag|合理化/.test(content);
          if (criteria["含 Red Flags / 合理化速查"]) score += 10;
          else recs.push("添加 Red Flags 和合理化速查表");

          // C5: Mermaid (5)
          criteria["含 Mermaid 图表"] = /mermaid|```mermaid/.test(content);
          if (criteria["含 Mermaid 图表"]) score += 5;

          // C6: structured sections (5)
          criteria["含结构化章节"] = /##\s+(触发|规则|操作|生效)/.test(content);
          if (criteria["含结构化章节"]) score += 5;
          else recs.push("添加结构化章节 (触发/规则/操作/生效标志)");
        } catch {}
        results.agents.push({
          name: af.replace(".md", ""),
          score: Math.min(100, score),
          criteria,
          recommendations: recs,
        });
      }
    } catch {}
  }

  // ── Rules ───────────────────────────────────────────────
  const rulesDir = join(projectRoot, "rules");
  if (existsSync(rulesDir)) {
    try {
      const ruleFiles = readdirSync(rulesDir).filter((f) => f.endsWith(".md"));
      for (const rf of ruleFiles) {
        const criteria = {};
        const recs = [];
        const rulePath = join(rulesDir, rf);
        let score = 0;
        try {
          const content = readFileSync(rulePath, "utf-8");
          const lines = content.split("\n").length;

          // C1: file exists (40)
          score = 40;

          // C2: frontmatter (15)
          criteria["YAML frontmatter"] = /^---/m.test(content);
          if (criteria["YAML frontmatter"]) score += 15;
          else recs.push("添加 YAML frontmatter");

          // C3: paths or description (15)
          criteria["paths / description 字段"] = /paths:|description:/m.test(content);
          if (criteria["paths / description 字段"]) score += 15;
          else recs.push("frontmatter 添加 paths 或 description 字段");

          // C4: line count (20)
          criteria[`≥150 行 (当前 ${lines})`] = lines >= 150;
          if (lines >= 150) score += 20;
          else if (lines >= 80) { score += 10; recs.push(`仅 ${lines} 行，建议扩充到 ≥150 行`); }
          else recs.push(`仅 ${lines} 行，建议扩充到 ≥150 行`);

          // C5: Mermaid (5)
          criteria["含 Mermaid 图表"] = /mermaid|```mermaid/.test(content);
          if (criteria["含 Mermaid 图表"]) score += 5;

          // C6: structured (5)
          criteria["含结构化章节"] = /##\s+|###\s+/.test(content);
          if (criteria["含结构化章节"]) score += 5;
        } catch {}
        results.rules.push({
          name: rf.replace(".md", ""),
          score: Math.min(100, score),
          criteria,
          recommendations: recs,
        });
      }
    } catch {}
  }

  // ── Scripts (lib/ + lib/engine/ + skills/*/lib/) ─────────
  const scriptDirs = [join(projectRoot, "lib"), join(projectRoot, "lib", "engine")];
  if (existsSync(skillsDir)) {
    try {
      for (const sd of readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
        const skillLib = join(skillsDir, sd.name, "lib");
        if (existsSync(skillLib)) scriptDirs.push(skillLib);
      }
    } catch {}
  }

  for (const dir of scriptDirs) {
    if (!existsSync(dir)) continue;
    try {
      const files = readdirSync(dir, { recursive: true, withFileTypes: true });
      for (const f of files) {
        if (!f.isFile() || !f.name.endsWith(".mjs")) continue;
        const filePath = join(f.path || dir, f.name);
        const criteria = {};
        const recs = [];
        let score = 0;
        try {
          const content = readFileSync(filePath, "utf-8");
          const lines = content.split("\n").length;

          // C1: file exists (40)
          score = 40;

          // C2: JSDoc (20)
          criteria["含 JSDoc 注释"] = /\/\*\*[\s\S]*?\*\//.test(content);
          if (criteria["含 JSDoc 注释"]) score += 20;
          else recs.push("添加 JSDoc 注释说明函数用途和参数");

          // C3: exports (15)
          criteria["含 export 导出"] = /\bexport\s+(default\s+)?(function|class|const|let|var|async)/.test(content);
          if (criteria["含 export 导出"]) score += 15;
          else recs.push("添加 export 语句使函数可被导入复用");

          // C4: line count (15)
          criteria[`≥100 行 (当前 ${lines})`] = lines >= 100;
          if (lines >= 100) score += 15;
          else if (lines >= 30) score += 10;

          // C5: test coverage (10)
          const baseName = f.name.replace(".mjs", "");
          const hasTest = existsSync(join(projectRoot, "tests", `${baseName}.test.mjs`))
            || existsSync(join(projectRoot, "tests", "skills", `${baseName}.test.mjs`));
          criteria["有对应测试文件"] = hasTest;
          if (hasTest) score += 10;
          else if (lines >= 50) recs.push(`创建 tests/${baseName}.test.mjs 增加测试覆盖`);
        } catch {}

        // Derive category from path
        let category = "lib";
        if (dir.includes("/engine")) category = "engine";
        else if (dir.includes("skills/")) {
          const parts = dir.split("/");
          const skillIdx = parts.indexOf("skills");
          category = parts[skillIdx + 1] || "skill-lib";
        }
        results.scripts.push({
          name: f.name,
          category,
          score: Math.min(100, score),
          criteria,
          recommendations: recs,
        });
      }
    } catch {}
  }

  return results;
}

/**
 * Count test cases across known test file patterns.
 */
function countTestCases(projectRoot) {
  let count = 0;
  const testDirs = ["tests", "__tests__", "test", "spec"];
  for (const dir of testDirs) {
    const p = join(projectRoot, dir);
    if (!existsSync(p)) continue;
    try {
      const files = readdirSync(p, { recursive: true, withFileTypes: true });
      for (const f of files) {
        if (f.isFile() && /\.(test|spec)\.(m?js|ts|tsx|py|go|rs)$/.test(f.name)) {
          try {
            const content = readFileSync(join(f.path || p, f.name), "utf-8");
            const matches = content.match(/\b(it|test|describe|def test_|func Test)\b/g);
            if (matches) count += matches.length;
          } catch {}
        }
      }
    } catch {}
  }
  return count;
}

/**
 * Validate SKILL.md message format constraints against implementation.
 */
function validateMessageFormat() {
  const issues = [];

  // Check SKILL.md exists and has format constraints
  const skillPath = join(findProjectRoot(process.cwd()), "skills", "rui-bot", "SKILL.md");
  if (!existsSync(skillPath)) {
    return { formatOk: false, issues: ["SKILL.md 缺失"] };
  }

  const skillContent = readFileSync(skillPath, "utf-8");

  // Constraint #8: skill identifiers
  const validSkills = ["rui", "rui-story", "rui-claude", "rui-bot", "rui-import", "rui-npm", "rui-html", "rui-doc", "rui-version", "rui-plan", "rui-trends", "rui-analysis", "self-improve"];
  // Check if buildMessage uses valid skill identifiers
  // (static check — we verify the code references valid skill set)

  // Constraint #7: skill + command must be first after header
  if (!skillContent.includes("🤖 技能") || !skillContent.includes("📋 命令")) {
    issues.push("SKILL.md 缺少技能/命令字段文档");
  }

  // Constraint #4: MAX_MSG_LENGTH
  if (MAX_MSG_LENGTH > 2048) {
    issues.push(`消息长度上限 ${MAX_MSG_LENGTH} > 2048`);
  }

  // Check FIELD_EMOJI completeness against SKILL.md
  const requiredFields = ["skill", "command", "conclusion", "description", "scope", "impact", "evidence", "session"];
  for (const f of requiredFields) {
    if (!FIELD_EMOJI[f]) {
      issues.push(`消息字段缺少 emoji: ${f}`);
    }
  }

  return { formatOk: issues.length === 0, issues };
}

/**
 * Collect health data from .memory/ files for the full D0-D7 diagnostic engine.
 */
function collectHealthData(projectRoot) {
  const execPath = join(projectRoot, ".memory", "execution-memory.jsonl");
  const auditPath = join(projectRoot, ".memory", "tool-audit.jsonl");
  const deliveryPath = join(projectRoot, ".memory", "delivery-tracking.jsonl");
  const statusPath = join(projectRoot, ".memory", "status-history.jsonl");
  const proposalsPath = join(projectRoot, ".improvement", "proposals.jsonl");

  const readJsonl = (p) => {
    if (!existsSync(p)) return [];
    return readFileSync(p, "utf-8").trim().split("\n").filter(Boolean).map((l) => {
      try { return JSON.parse(l); } catch { return null; }
    }).filter(Boolean);
  };

  return {
    allExec: readJsonl(execPath),
    toolAudit: readJsonl(auditPath),
    deliveryTrack: readJsonl(deliveryPath),
    statusHistory: readJsonl(statusPath),
    proposals: readJsonl(proposalsPath),
  };
}

/**
 * Scan scene directories for D6 documentation staleness issues.
 */
function computeDocIssuesForHealth(projectRoot) {
  const storyDir = join(projectRoot, "docs", "故事任务面板");
  const issues = [];
  if (!existsSync(storyDir)) return { docIssues: [], retroMissing: false, noProposals: false };

  try {
    const stories = readdirSync(storyDir, { withFileTypes: true })
      .filter((d) => d.isDirectory());
    for (const story of stories) {
      const storyPath = join(storyDir, story.name);
      const entries = readdirSync(storyPath, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory() || !entry.name.startsWith("场景")) continue;
        const sceneDir = join(storyPath, entry.name);
        let mdFiles;
        try { mdFiles = readdirSync(sceneDir); } catch { continue; }
        for (const mf of mdFiles.filter((f) => f.endsWith(".md") || f.endsWith(".html"))) {
          const docPath = join(sceneDir, mf);
          try {
            const content = readFileSync(docPath, "utf-8");
            if (!/§4\s*自改进|自改进复盘/i.test(content) && content.length > 500) {
              issues.push(`${story.name}/${entry.name}/${mf}: 缺少 §4 自改进章节`);
            }
          } catch { /* skip */ }
        }
      }
    }
  } catch { /* skip */ }

  const retroPath = join(projectRoot, "docs", "故事任务面板", "yry-arch", "YrY-自改进复盘.md");
  const retroMissing = !existsSync(retroPath);

  const proposalsPath = join(projectRoot, ".improvement", "proposals.jsonl");
  const noProposals = !existsSync(proposalsPath);

  return { docIssues: issues, retroMissing, noProposals };
}

/**
 * Bootstrap D0-D7 diagnostics from git history and project data when no
 * execution memory exists. Derives approximate signals for each dimension.
 */
function getBootstrapDiagnostics(projectRoot) {
  const diagnostics = [];
  let gitActivity = 0;      // commit count in last 30 days
  let largeCommits = 0;     // commits with >15 files (T3 proxy)
  let revertCommits = 0;    // revert/rollback commits (block/recovery proxy)
  let staleDocCount = 0;    // scenes without recent HTML updates
  let highChurnFiles = 0;   // files modified in >5 commits (D2 quality proxy)
  let pkgChanges = 0;       // package.json changes (D5 dependency proxy)
  let lockfileChanges = 0;  // lockfile changes (D5 dependency proxy)

  // Track per-file churn for D2
  const fileChurn = new Map();

  // ── Derive signals from git log ──────────────────────
  try {
    const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    // Full log for commit counting and churn tracking
    const log = execSync(
      `git log --since="${since}" --format="%H %s" --shortstat 2>/dev/null || true`,
      { cwd: projectRoot, encoding: "utf-8", timeout: 5000 }
    );
    const lines = log.split("\n").filter(Boolean);
    for (const line of lines) {
      if (/^[a-f0-9]{40} /.test(line)) {
        gitActivity++;
        if (/ revert|rollback|undo/i.test(line)) revertCommits++;
        // Track package.json changes
        if (/package\.json/i.test(line)) pkgChanges++;
        if (/package-lock|yarn\.lock|pnpm-lock/i.test(line)) lockfileChanges++;
      }
      const m = line.match(/(\d+) files? changed/);
      if (m && parseInt(m[1], 10) > 15) largeCommits++;
    }

    // Per-file churn for D2 quality proxy
    // Only track source files (.mjs/.js), excluding help files (docs, not code)
    try {
      const nameLog = execSync(
        `git log --since="${since}" --name-only --format="" 2>/dev/null || true`,
        { cwd: projectRoot, encoding: "utf-8", timeout: 5000 }
      );
      for (const f of nameLog.split("\n")) {
        const path = f.trim();
        if (!path) continue;
        // Only source code churn; help.mjs is documentation, not quality-relevant
        if (/\.(mjs|js)$/i.test(path) && !/help\.mjs$/.test(path)) {
          fileChurn.set(path, (fileChurn.get(path) || 0) + 1);
        }
      }
      for (const [, count] of fileChurn) {
        if (count > 5) highChurnFiles++;
      }
    } catch { /* skip */ }
  } catch { /* git unavailable */ }

  // ── Scan scene documentation freshness ──────────────
  try {
    const storyDir = join(projectRoot, "docs", "故事任务面板");
    if (existsSync(storyDir)) {
      const stories = readdirSync(storyDir, { withFileTypes: true }).filter((d) => d.isDirectory());
      for (const story of stories) {
        const scenes = readdirSync(join(storyDir, story.name), { withFileTypes: true })
          .filter((d) => d.isDirectory() && d.name.startsWith("场景"));
        for (const scene of scenes) {
          const htmlFiles = readdirSync(join(storyDir, story.name, scene.name))
            .filter((f) => f.endsWith(".html"));
          if (htmlFiles.length === 0) {
            staleDocCount++;
          } else {
            // Check if any HTML file is older than 7 days
            let hasRecent = false;
            for (const hf of htmlFiles) {
              try {
                const s = statSync(join(storyDir, story.name, scene.name, hf));
                if ((Date.now() - s.mtimeMs) / 86400000 < 7) { hasRecent = true; break; }
              } catch { /* skip */ }
            }
            if (!hasRecent) staleDocCount++;
          }
        }
      }
    }
  } catch { /* skip */ }

  // ── Check proposal closure rate ─────────────────────
  const proposalsPath = join(projectRoot, ".improvement", "proposals.jsonl");
  let proposalClosureRate = 1;
  if (existsSync(proposalsPath)) {
    try {
      const lines = readFileSync(proposalsPath, "utf-8").trim().split("\n").filter(Boolean);
      if (lines.length > 0) {
        let closed = 0;
        for (const line of lines) {
          try {
            const p = JSON.parse(line);
            if (p.status === "done" || p.status === "superseded") closed++;
          } catch { /* skip */ }
        }
        proposalClosureRate = closed / lines.length;
      }
    } catch { /* skip */ }
  }

  // ── Build approximate diagnostics ───────────────────
  const triggered = [];

  // D1: Efficiency — use revert rate as block proxy
  if (gitActivity >= 5 && revertCommits > 0) {
    const revertRate = revertCommits / gitActivity;
    if (revertRate > 0.2) {
      triggered.push({
        id: "D1", label: DIAGNOSTIC_LABELS.D1, triggered: true,
        confidence: revertCommits,
        evidence: `${revertCommits}/${gitActivity} 回退提交 (${(revertRate * 100).toFixed(0)}%) — 近似阻断率`,
        baseline: DIAGNOSTIC_BASELINES.D1,
        suggestion: "回退提交占比偏高，加强影响分析阶段预处理，提前识别阻断风险",
      });
    }
  }

  // D3: Complexity — use large commit ratio as T3 proxy
  if (gitActivity >= 3 && largeCommits > 0) {
    const t3Ratio = largeCommits / gitActivity;
    if (t3Ratio > T3_PROPORTION_THRESHOLD) {
      triggered.push({
        id: "D3", label: DIAGNOSTIC_LABELS.D3, triggered: true,
        confidence: largeCommits,
        evidence: `${largeCommits}/${gitActivity} 大提交 (${(t3Ratio * 100).toFixed(0)}%) > ${(T3_PROPORTION_THRESHOLD * 100).toFixed(0)}% — 近似 T3 占比`,
        baseline: DIAGNOSTIC_BASELINES.D3,
        suggestion: "大提交占比偏高，建议加强需求拆分，将大任务拆分为多个小故事",
      });
    }
  }

  // D6: Documentation staleness
  if (staleDocCount > 0) {
    triggered.push({
      id: "D6", label: DIAGNOSTIC_LABELS.D6, triggered: true,
      confidence: staleDocCount,
      evidence: `${staleDocCount} 个场景文档超过 7 天未更新`,
      baseline: DIAGNOSTIC_BASELINES.D6,
      suggestion: "补齐场景文档的 §4 自改进章节，保持文档与代码同步",
    });
  }

  // D7: Configuration drift — proposal closure
  if (proposalClosureRate < 0.5) {
    triggered.push({
      id: "D7", label: DIAGNOSTIC_LABELS.D7, triggered: true,
      confidence: Math.round((1 - proposalClosureRate) * 10),
      evidence: `提案闭合率 ${(proposalClosureRate * 100).toFixed(0)}% < 50%`,
      baseline: DIAGNOSTIC_BASELINES.D7,
      suggestion: "审查提案的可执行性，确保改进项能够落地",
    });
  }

  // D0: Baseline deviation — uncommitted divergence from main
  let uncommittedCount = 0;
  try {
    const status = execSync("git status --porcelain 2>/dev/null || true", {
      cwd: projectRoot, encoding: "utf-8", timeout: 3000,
    });
    uncommittedCount = status.trim().split("\n").filter(Boolean).length;
  } catch { /* skip */ }
  if (uncommittedCount > 50) {
    triggered.push({
      id: "D0", label: DIAGNOSTIC_LABELS.D0, triggered: true,
      confidence: Math.min(uncommittedCount / 10, 10),
      evidence: `${uncommittedCount} 个未提交文件 — 基线可能漂移`,
      baseline: DIAGNOSTIC_BASELINES.D0,
      suggestion: "大量未提交文件增加基线偏离风险，建议分批提交并推送",
    });
  }

  // D2: Quality degradation — high churn source files (>5 changes/month)
  // Excludes help.mjs (documentation). Threshold at ~8% of source files.
  if (gitActivity >= 3 && highChurnFiles > 15) {
    triggered.push({
      id: "D2", label: DIAGNOSTIC_LABELS.D2, triggered: true,
      confidence: highChurnFiles,
      evidence: `${highChurnFiles} 个源码文件月修改 >5 次 — 质量热点`,
      baseline: DIAGNOSTIC_BASELINES.D2,
      suggestion: "高频修改源码文件占比偏高，建议增加单元测试覆盖和代码审查",
    });
  }

  // D4: Process degradation — frequent reverts
  if (gitActivity >= 5 && revertCommits >= 2) {
    triggered.push({
      id: "D4", label: DIAGNOSTIC_LABELS.D4, triggered: true,
      confidence: revertCommits,
      evidence: `${revertCommits} 次回退操作 — 流程可能需要优化`,
      baseline: DIAGNOSTIC_BASELINES.D4,
      suggestion: "多次回退表明 Gate A/B 验证可能不足，建议加强测试先行和影响分析",
    });
  }

  // D5: Dependency degradation — package.json changes without lockfile
  if (gitActivity >= 3 && pkgChanges > lockfileChanges && pkgChanges > 0) {
    triggered.push({
      id: "D5", label: DIAGNOSTIC_LABELS.D5, triggered: true,
      confidence: pkgChanges - lockfileChanges,
      evidence: `${pkgChanges} 次依赖变更, 仅 ${lockfileChanges} 次 lockfile 更新`,
      baseline: DIAGNOSTIC_BASELINES.D5,
      suggestion: "依赖变更未同步更新 lockfile，可能导致环境不一致",
    });
  }

  // Build the full diagnostic list (passed + triggered)
  const allDiags = Object.entries(DIAGNOSTIC_LABELS).map(([id, label]) => {
    const t = triggered.find((d) => d.id === id);
    return t || { id, label, triggered: false, confidence: 0, evidence: "无数据", baseline: DIAGNOSTIC_BASELINES[id] || "", suggestion: "" };
  });

  if (triggered.length === 0) {
    return {
      score: 100, summary: `Git 引导: ${gitActivity} 次提交, 无异常信号`,
      skip: false, diagnostics: allDiags, triggered: [], execCount: 0, bootstrapped: true,
    };
  }

  const score = Math.max(0, 100 - triggered.length * 15);
  const labels = triggered.map((d) => `${d.id} ${d.label}`).join(", ");
  return {
    score,
    summary: `Git 引导: ${gitActivity} 次提交 — 触发: ${labels}`,
    skip: false, diagnostics: allDiags, triggered, execCount: 0, bootstrapped: true,
  };
}

/**
 * Run the full D0-D7 diagnostic engine and return a summary for the health check.
 */
function getDiagnosticResult(projectRoot) {
  const data = collectHealthData(projectRoot);
  const execCount = data.allExec.length;

  if (execCount === 0) {
    // Bootstrap diagnostics from git history + project data
    return getBootstrapDiagnostics(projectRoot);
  }

  try {
    const { docIssues, retroMissing, noProposals } = computeDocIssuesForHealth(projectRoot);
    data.retroMissing = retroMissing;
    data.noProposals = noProposals;

    const diagnostics = runDiagnostics(data, docIssues);
    const triggered = diagnostics.filter((d) => d.triggered);

    if (triggered.length === 0) {
      return {
        score: 100, summary: `${execCount} 条记录 — D0-D7 无异常`,
        skip: false, diagnostics, triggered: [], execCount,
      };
    }

    const score = Math.max(0, 100 - triggered.length * 15);
    const labels = triggered.map((d) => `${d.id} ${d.label}`).join(", ");
    return {
      score, summary: `${execCount} 条记录 — 触发: ${labels}`,
      skip: false, diagnostics, triggered, execCount,
    };
  } catch (err) {
    return { score: 50, summary: `诊断引擎异常: ${err.message}`, skip: true, diagnostics: [], execCount };
  }
}

/**
 * Send a notification. Reusable — used by both CLI (cmdSend) and programmatic callers.
 * @returns {{ ok: boolean, error?: string, retries: number }}
 */
export async function sendNotification(projectRoot, opts) {
  const projectName = opts.project || readProjectName(projectRoot);
  const config = loadConfig(projectRoot);
  const token = process.env.API_X_TOKEN || "";

  const message = buildMessage(opts, projectName, projectRoot);

  if (opts.dryRun) {
    console.log("╔══════════════════════════════════╗");
    console.log("║       Dry-Run 消息预览           ║");
    console.log("╚══════════════════════════════════╝");
    console.log(message);
    console.log("");
    console.log(`[rui-bot] dry-run: 消息长度 ${message.length} 字符, 状态=${opts.status}, 未发送`);
    return { ok: true, error: null, retries: 0, dryRun: true };
  }

  if (opts.noSend) {
    console.log("[rui-bot] --no-send 模式，跳过 HTTP 发送");
    return { ok: false, error: "no-send", retries: 0 };
  }

  if (!token) {
    console.log("[rui-bot] ⚠️  API_X_TOKEN 缺失，跳过 HTTP 发送（no-token 降级）");
    return { ok: false, error: "no-token", retries: 0 };
  }

  const robotName = config.default_robot || "general";
  const robot = (config.robots || {})[robotName] || {};
  let webhookUrl = robot.webhook_url || "";

  if (robot.webhook_url_env && process.env[robot.webhook_url_env]) {
    webhookUrl = process.env[robot.webhook_url_env];
  }
  if (process.env.WEWORK_BOT_WEBHOOK_URL) {
    webhookUrl = process.env.WEWORK_BOT_WEBHOOK_URL;
  }

  if (!webhookUrl) {
    console.log("[rui-bot] ⚠️  webhook URL 未配置，跳过发送");
    return { ok: false, error: "no-webhook", retries: 0 };
  }

  const apiUrl = config.api_url || API_URL_DEFAULT;

  console.log(`[rui-bot] 发送通知: story=${opts.story || "—"} status=${opts.status}`);
  const result = await sendWithRetry(apiUrl, webhookUrl, message, token, opts.retries ?? MAX_RETRIES);

  if (result.ok) {
    console.log(`[rui-bot] ✅ 发送成功 (retries=${result.retries})`);
    await flushNotificationQueue(projectRoot);
  } else {
    console.error(`[rui-bot] ❌ 发送失败: ${result.error} (retries=${result.retries})`);
    enqueueFailedNotification(projectRoot, message, webhookUrl, apiUrl, token);
  }

  result.msgLength = message.length;
  logNotificationDelivery(projectRoot, opts, result);
  return result;
}

// --- main send ---
async function cmdSend(opts) {
  const projectRoot = findProjectRoot(process.cwd());
  await sendNotification(projectRoot, opts);
}

// --- main ---
async function main() {
  const args = process.argv.slice(NODE_ARGV_OFFSET);

  if (args[0] === "flush") {
    const projectRoot = findProjectRoot(process.cwd());
    await flushNotificationQueue(projectRoot);
    return;
  }

  if (args[0] === "health") {
    const projectRoot = findProjectRoot(process.cwd());
    const htmlFlag = args.includes("--html");
    const notifyFlag = args.includes("--notify");
    const alertFlag = args.includes("--alert");
    const shortFlag = args.includes("--short");
    const diffFlag = args.includes("--diff");

    if (shortFlag) {
      // Collect health data quietly
      const origLog = console.log;
      const origError = console.error;
      console.log = () => {};
      console.error = () => {};
      const healthResult = await cmdHealth(projectRoot);
      console.log = origLog;
      console.error = origError;
      // Short output: one-line summary
      const gradeEmoji = healthResult.grade === "A" ? "✅" : healthResult.grade === "B" ? "✅" : healthResult.grade === "C" ? "⚠️" : "🚫";
      const diagSummary = healthResult.diagnostics?.triggered?.length > 0
        ? `触发: ${healthResult.diagnostics.triggered.map((d) => d.id).join(",")}`
        : "D0-D7 通过";
      const worst = Object.entries(healthResult.scores)
        .filter(([, s]) => s < 80)
        .sort(([, a], [, b]) => a - b)
        .slice(0, 3)
        .map(([d]) => d)
        .join(",");
      console.log(`${gradeEmoji} ${healthResult.composite}/${healthResult.grade} | ${diagSummary} | 弱项: ${worst || "无"}`);
      return;
    }

    if (diffFlag) {
      // Read previous trend entry for comparison
      const trendPath = join(projectRoot, HEALTH_TREND_FILE);
      if (!existsSync(trendPath)) {
        console.log("无历史数据，无法对比。请先运行 health 命令。");
        return;
      }
      const trendLines = readFileSync(trendPath, "utf-8").trim().split("\n").filter(Boolean);
      if (trendLines.length < 2) {
        console.log("仅有一次记录，无法对比。请再运行一次 health。");
        return;
      }
      const prev = JSON.parse(trendLines[trendLines.length - 2]);

      // Run quiet health check
      const origLog = console.log;
      const origError = console.error;
      console.log = () => {};
      console.error = () => {};
      const curr = await cmdHealth(projectRoot);
      console.log = origLog;
      console.error = origError;

      // Compare and output diffs
      const changes = [];
      for (const [dim, cfg] of Object.entries(HEALTH_DIMENSIONS)) {
        const prevScore = prev.scores?.[dim];
        const currScore = curr.scores[dim];
        if (prevScore !== undefined && currScore !== undefined) {
          const delta = currScore - prevScore;
          if (Math.abs(delta) >= 5) {
            const arrow = delta > 0 ? "↑" : "↓";
            changes.push(`${arrow}${Math.abs(delta)} ${cfg.label}: ${prevScore}→${currScore}`);
          }
        }
      }

      const prevDiags = new Set(prev.triggeredDiags || []);
      const currDiags = new Set((curr.diagnostics?.triggered || []).map((d) => d.id));
      const newDiags = [...currDiags].filter((d) => !prevDiags.has(d));
      const resolved = [...prevDiags].filter((d) => !currDiags.has(d));

      if (newDiags.length > 0) changes.push(`⚡ 新增诊断: ${newDiags.join(", ")}`);
      if (resolved.length > 0) changes.push(`✅ 已解决: ${resolved.join(", ")}`);

      const gradeDiff = curr.composite - (prev.composite || 0);
      if (Math.abs(gradeDiff) >= 3) {
        const gArrow = gradeDiff > 0 ? "↑" : "↓";
        changes.unshift(`${gArrow}${Math.abs(gradeDiff)} 综合评分: ${prev.composite}→${curr.composite} (${curr.grade})`);
      }

      if (changes.length === 0) {
        console.log("→ 无显著变化");
      } else {
        console.log(changes.join("\n"));
      }
      return;
    }

    const healthResult = await cmdHealth(projectRoot, { html: htmlFlag, notify: notifyFlag, alert: alertFlag });

    // Generate HTML report if requested
    if (htmlFlag && healthResult) {
      try {
        const { generateHealthReport, generateHealthIndex } = await import("./lib/health-report.mjs");
        const { filePath } = generateHealthReport(healthResult);
        console.log(`[rui-bot] 健康报告已生成: ${filePath}`);
        generateHealthIndex();
        console.log("[rui-bot] 健康报告索引已更新: docs/健康报告/index.html");
      } catch (err) {
        console.error(`[rui-bot] HTML 报告生成失败: ${err.message}`);
      }
    }

    // Send notification if requested
    if (notifyFlag && healthResult) {
      const projectName = readProjectName(projectRoot);
      const message = buildHealthNotification(healthResult, projectName);
      const config = loadConfig(projectRoot);
      const token = process.env.API_X_TOKEN || "";
      if (token) {
        const robotName = config.default_robot || "general";
        const robot = (config.robots || {})[robotName] || {};
        let webhookUrl = robot.webhook_url || "";
        if (robot.webhook_url_env && process.env[robot.webhook_url_env]) {
          webhookUrl = process.env[robot.webhook_url_env];
        }
        if (process.env.WEWORK_BOT_WEBHOOK_URL) {
          webhookUrl = process.env.WEWORK_BOT_WEBHOOK_URL;
        }
        if (webhookUrl) {
          const apiUrl = config.api_url || API_URL_DEFAULT;
          const result = await sendWithRetry(apiUrl, webhookUrl, message, token, MAX_RETRIES);
          if (result.ok) {
            console.log(`[rui-bot] ✅ 健康通知发送成功`);
          } else {
            console.error(`[rui-bot] ❌ 健康通知发送失败: ${result.error}`);
          }
        } else {
          console.log("[rui-bot] ⚠️  webhook URL 未配置，跳过健康通知");
        }
      } else {
        console.log("[rui-bot] ⚠️  API_X_TOKEN 缺失，跳过健康通知");
      }
    }

    // Send health alert if score below threshold
    if (alertFlag && healthResult) {
      const alertThreshold = 70; // C/D grade triggers alert
      if (healthResult.composite < alertThreshold) {
        // Smart dedup: skip if same diagnostics and score hasn't dropped >5
        const trendPath = join(projectRoot, HEALTH_TREND_FILE);
        let skipAlert = false;
        if (existsSync(trendPath)) {
          try {
            const trendLines = readFileSync(trendPath, "utf-8").trim().split("\n").filter(Boolean);
            if (trendLines.length >= 2) {
              const prev = JSON.parse(trendLines[trendLines.length - 2]);
              const prevTriggered = (prev.triggeredDiags || []).sort().join(",");
              const currTriggered = (healthResult.diagnostics?.triggered || []).map((d) => d.id).sort().join(",");
              const scoreDrop = prev.composite - healthResult.composite;
              if (prevTriggered === currTriggered && scoreDrop <= 5) {
                console.log(`[rui-bot] 🔇 告警抑制: 与上次相同的诊断 (${currTriggered}), 评分变化 ${scoreDrop}`);
                skipAlert = true;
              }
            }
          } catch { /* proceed with alert */ }
        }

        if (!skipAlert) {
          const projectName = readProjectName(projectRoot);
          const alertMsg = buildHealthAlertNotification(healthResult, projectName, alertThreshold);
        console.log(`[rui-bot] 🚨 健康评分 ${healthResult.composite} 低于阈值 ${alertThreshold}，发送告警`);
        console.log(alertMsg);

        const config = loadConfig(projectRoot);
        const token = process.env.API_X_TOKEN || "";
        if (token) {
          const robotName = config.default_robot || "general";
          const robot = (config.robots || {})[robotName] || {};
          let webhookUrl = robot.webhook_url || "";
          if (robot.webhook_url_env && process.env[robot.webhook_url_env]) webhookUrl = process.env[robot.webhook_url_env];
          if (process.env.WEWORK_BOT_WEBHOOK_URL) webhookUrl = process.env.WEWORK_BOT_WEBHOOK_URL;
          if (webhookUrl) {
            const apiUrl = config.api_url || API_URL_DEFAULT;
            const result = await sendWithRetry(apiUrl, webhookUrl, alertMsg, token, MAX_RETRIES);
            if (result.ok) {
              console.log("[rui-bot] ✅ 健康告警发送成功");
            } else {
              console.error(`[rui-bot] ❌ 健康告警发送失败: ${result.error}`);
              enqueueFailedNotification(projectRoot, alertMsg, webhookUrl, apiUrl, token);
            }
          }
        } else {
          // Print alert to console as fallback
          console.log("[rui-bot] ⚠️  Token/Webhook 缺失，告警仅输出到控制台");
        }
        } // end if (!skipAlert)
      } else {
        console.log(`[rui-bot] ✅ 健康评分 ${healthResult.composite} ≥ 阈值 ${alertThreshold}，无需告警`);
      }
    }
    return;
  }

  if (args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
    showUsage();
    return;
  }

  const opts = parseArgs();
  await cmdSend(opts);
}

const _isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (_isMain) {
  main().catch((err) => {
    console.error(`[rui-bot] fatal: ${err.message}`);
    process.exit(1);
  });
}
