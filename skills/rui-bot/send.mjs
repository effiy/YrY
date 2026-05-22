#!/usr/bin/env node
// send — Executable rui-bot notification sender
// 用法: node skills/rui-bot/send.mjs [options]
// 按 SKILL.md 规约发送企微通知并追加消息日志

import { join, resolve, dirname, basename } from "node:path";
import { existsSync, readFileSync, mkdirSync, appendFileSync } from "node:fs";

// --- constants ----------------------------------------------------------------
const API_URL_DEFAULT = "https://api.effiy.cn/wework/send-message";
const HTTP_TIMEOUT = 30_000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1_000;
const MAX_MSG_LENGTH = 2_000;
const ERROR_TRUNCATE_LINES = 20;
const FILE_LIST_MAX = 10;
const ARGV_OFFSET = 2;

const STATUS_EMOJI = {
  complete: "✅",
  blocked: "🚫",
  "gate-fail": "🔍",
};

const STATUS_LABELS = {
  complete: "完成",
  blocked: "阻断",
  "gate-fail": "门禁失败",
};

const FIELD_EMOJI = {
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
  const args = process.argv.slice(ARGV_OFFSET);
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
    retries: MAX_RETRIES,
    // Field values for structured message
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
  };

  for (const arg of args) {
    if (arg === "--no-send") { opts.noSend = true; continue; }

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
  console.log("  node skills/rui-bot/send.mjs health");
  console.log("");
  console.log("Options:");
  console.log("  --story=<name>         故事名");
  console.log("  --project=<name>       项目名（默认从 CLAUDE.md 读取）");
  console.log("  --status=<s>           状态: complete|blocked|gate-fail（默认 complete）");
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
  console.log("  --content=<text>       直接指定消息正文（覆盖字段构建）");
  console.log("  --no-send              仅写日志，不发送 HTTP");
  console.log("  --retries=<N>          重试次数（默认 3）");
  console.log("");
}

// --- project helpers ---------------------------------------------------------
function findProjectRoot(startDir) {
  let dir = resolve(startDir);
  while (true) {
    if (existsSync(join(dir, ".git")) || existsSync(join(dir, ".claude"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return resolve(startDir);
    dir = parent;
  }
}

function readProjectName(projectRoot) {
  const claudePath = join(projectRoot, "CLAUDE.md");
  if (!existsSync(claudePath)) return basename(projectRoot);
  try {
    const content = readFileSync(claudePath, "utf-8");
    let match = content.match(/\|\s*项目名\s*\|\s*(\S+)\s*\|/);
    if (match) return match[1];
    match = content.match(/\*\*项目名\*\*[：:]\s*(\S+)/);
    if (match) return match[1];
    return basename(projectRoot);
  } catch {
    return basename(projectRoot);
  }
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
function buildMessage(opts, projectName) {
  if (opts.content) {
    const msg = `【${projectName}】\n${opts.content}`;
    return msg.length > MAX_MSG_LENGTH ? msg.slice(0, MAX_MSG_LENGTH - 3) + "..." : msg;
  }

  const lines = [`【${projectName}】`];
  const emoji = STATUS_EMOJI[opts.status] || STATUS_EMOJI.complete;
  const label = STATUS_LABELS[opts.status] || STATUS_LABELS.complete;

  lines.push(`${emoji} ${label}`);

  // Common fields
  if (opts.conclusion)   lines.push(`${FIELD_EMOJI.conclusion} 结论: ${opts.conclusion}`);
  if (opts.description)  lines.push(`${FIELD_EMOJI.description} 描述: ${opts.description}`);
  if (opts.scope)        lines.push(`${FIELD_EMOJI.scope} 范围: ${opts.scope}`);

  // Scenario-specific fields
  if (opts.status === "complete" || !opts.status || opts.status === "complete") {
    if (opts.nextStep) lines.push(`${FIELD_EMOJI.nextStep} 下一步: ${opts.nextStep}`);
  }
  if (opts.status === "blocked") {
    if (opts.reason)   lines.push(`${FIELD_EMOJI.reason} 原因: ${opts.reason}`);
    if (opts.recovery) lines.push(`${FIELD_EMOJI.recovery} 恢复点: ${opts.recovery}`);
  }
  if (opts.status === "gate-fail") {
    if (opts.gate)       lines.push(`${FIELD_EMOJI.gate} 门禁: ${opts.gate}`);
    if (opts.gateResult) lines.push(`${FIELD_EMOJI.result} 结果: ${opts.gateResult}`);
  }

  // More common fields
  if (opts.impact)   lines.push(`${FIELD_EMOJI.impact} 影响: ${opts.impact}`);
  if (opts.evidence) lines.push(`${FIELD_EMOJI.evidence} 证据: ${opts.evidence}`);
  if (opts.session)  lines.push(`${FIELD_EMOJI.session} 会话: ${opts.session}`);

  const msg = lines.join("\n");
  return msg.length > MAX_MSG_LENGTH ? msg.slice(0, MAX_MSG_LENGTH - 3) + "..." : msg;
}

// --- notification log ---
function appendNotificationLog(projectRoot, projectName, story, message) {
  const logPath = join(projectRoot, "docs", "故事任务面板", story, `${projectName}-消息通知列表.md`);
  const logDir = dirname(logPath);
  if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true });

  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const timestamp = `【${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}】`;

  const entry = `\n${timestamp}\n\n${message}\n`;

  appendFileSync(logPath, entry, "utf-8");
  return logPath;
}

// --- delivery tracking ---
function appendDeliveryTracking(projectRoot, story, step, status, durationMs, error) {
  const trackPath = join(projectRoot, "docs", "故事任务面板", story, ".memory", "delivery-tracking.jsonl");
  const trackDir = dirname(trackPath);
  if (!existsSync(trackDir)) mkdirSync(trackDir, { recursive: true });

  const record = {
    timestamp: new Date().toISOString(),
    story,
    step,
    status,
    duration_ms: durationMs,
    error: error || null,
    retry_count: 0,
    notification_template_version: "1.0.0",
  };

  appendFileSync(trackPath, JSON.stringify(record) + "\n", "utf-8");
}

// --- API ---
async function sendToWecom(apiUrl, webhookUrl, content, token) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT);

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

// --- health check ---
async function cmdHealth(projectRoot) {
  const config = loadConfig(projectRoot);
  const token = process.env.API_X_TOKEN || "";

  console.log("");
  console.log("rui-bot 健康检查");
  console.log("═══════════════════");
  console.log("");

  // Token check
  const tokenOk = !!token;
  console.log(`  API_X_TOKEN:        ${tokenOk ? "✅ 已配置" : "⚠️  缺失"}`);

  // Config check
  console.log(`  config.json:        ${existsSync(join(projectRoot, ".claude", "skills", "rui-bot", "config.json")) ? "✅ 存在" : "⚠️  缺失"}`);
  console.log(`  api_url:            ${config.api_url || API_URL_DEFAULT}`);
  console.log(`  default_robot:      ${config.default_robot || "general"}`);

  // Robot check
  const robots = config.robots || {};
  const robotNames = Object.keys(robots);
  console.log(`  机器人:             ${robotNames.length > 0 ? robotNames.join(", ") : "⚠️  未配置"}`);
  for (const [name, cfg] of Object.entries(robots)) {
    const hasWebhook = !!(cfg.webhook_url) || !!(cfg.webhook_url_env && process.env[cfg.webhook_url_env]);
    console.log(`    ${name}: webhook ${hasWebhook ? "✅" : "⚠️  缺失"}`);
  }

  // API reachability (only if token available)
  if (tokenOk) {
    console.log("");
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10_000);
      const res = await fetch(config.api_url || API_URL_DEFAULT, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", "X-Token": token },
        body: JSON.stringify({ webhook_url: "", content: "health-check" }),
      });
      clearTimeout(timer);
      console.log(`  API 可达:           ✅ (status ${res.status})`);
    } catch (err) {
      console.log(`  API 可达:           ❌ ${err.message}`);
    }
  }

  console.log("");
}

// --- main send ---
async function cmdSend(opts) {
  const projectRoot = findProjectRoot(process.cwd());
  const projectName = opts.project || readProjectName(projectRoot);
  const config = loadConfig(projectRoot);
  const token = process.env.API_X_TOKEN || "";

  // Build message
  const message = buildMessage(opts, projectName);

  const startTime = Date.now();

  // Step 1: Always append notification log
  if (opts.story) {
    const logPath = appendNotificationLog(projectRoot, projectName, opts.story, message);
    console.log(`[rui-bot] 日志已追加: ${logPath}`);
    appendDeliveryTracking(projectRoot, opts.story, "log", "success", Date.now() - startTime, null);
  }

  // Step 2: Send if not --no-send
  if (opts.noSend) {
    console.log("[rui-bot] --no-send 模式，跳过 HTTP 发送");
    if (opts.story) {
      appendDeliveryTracking(projectRoot, opts.story, "notify", "skipped", Date.now() - startTime, null);
    }
    return;
  }

  if (!token) {
    console.log("[rui-bot] ⚠️  API_X_TOKEN 缺失，跳过 HTTP 发送（no-token 降级）");
    if (opts.story) {
      appendDeliveryTracking(projectRoot, opts.story, "notify", "skipped", Date.now() - startTime, "no-token");
    }
    return;
  }

  // Resolve webhook
  const robotName = config.default_robot || "general";
  const robot = (config.robots || {})[robotName] || {};
  let webhookUrl = robot.webhook_url || "";

  // Check for env var override
  if (robot.webhook_url_env && process.env[robot.webhook_url_env]) {
    webhookUrl = process.env[robot.webhook_url_env];
  }
  // Also check direct env var
  if (process.env.WEWORK_BOT_WEBHOOK_URL) {
    webhookUrl = process.env.WEWORK_BOT_WEBHOOK_URL;
  }

  if (!webhookUrl) {
    console.log("[rui-bot] ⚠️  webhook URL 未配置，跳过发送");
    if (opts.story) {
      appendDeliveryTracking(projectRoot, opts.story, "notify", "skipped", Date.now() - startTime, "no-webhook");
    }
    return;
  }

  const apiUrl = config.api_url || API_URL_DEFAULT;

  console.log(`[rui-bot] 发送通知: story=${opts.story || "—"} status=${opts.status}`);
  const result = await sendWithRetry(apiUrl, webhookUrl, message, token, opts.retries);

  const elapsed = Date.now() - startTime;

  if (result.ok) {
    console.log(`[rui-bot] ✅ 发送成功 (retries=${result.retries})`);
    if (opts.story) {
      appendDeliveryTracking(projectRoot, opts.story, "notify", "success", elapsed, null);
    }
  } else {
    console.error(`[rui-bot] ❌ 发送失败: ${result.error} (retries=${result.retries})`);
    if (opts.story) {
      appendDeliveryTracking(projectRoot, opts.story, "notify", "failure", elapsed, result.error);
    }
  }
}

// --- main ---
async function main() {
  const args = process.argv.slice(ARGV_OFFSET);

  if (args[0] === "health") {
    const projectRoot = findProjectRoot(process.cwd());
    await cmdHealth(projectRoot);
    return;
  }

  if (args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
    showUsage();
    return;
  }

  const opts = parseArgs();
  await cmdSend(opts);
}

main().catch((err) => {
  console.error(`[rui-bot] fatal: ${err.message}`);
  process.exit(0);
});
