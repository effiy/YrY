#!/usr/bin/env node
/**
 * send — Executable rui-bot notification sender (orchestrator).
 * 用法: node skills/rui-bot/send.mjs [options]
 *
 * Sub-modules:
 *   lib/bot-message.mjs      — message building
 *   lib/bot-transport.mjs    — HTTP send, retry, queue
 *   lib/bot-health-trend.mjs — health dimensions, scoring, trend
 *   lib/bot-health-structure.mjs — git, security, structure analysis
 *   lib/bot-health-analysis.mjs  — maturity, components, tests
 *   lib/bot-health-diagnostics.mjs — data collection, diagnostics engine
 *   lib/bot-health-cmd.mjs   — cmdHealth orchestrator
 */

import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  NODE_ARGV_OFFSET, MAX_RETRIES, MAX_MSG_LENGTH, DEFAULT_API_URL, STORY_PANEL_DIR,
} from "../../lib/constants.mjs";
import { findProjectRoot, readProjectName } from "../../lib/fs.mjs";

import { API_URL_DEFAULT, sendWithRetry, enqueueFailedNotification, flushNotificationQueue, logNotificationDelivery, loadConfig } from "./lib/bot-transport.mjs";
import { buildMessage, buildHealthNotification, buildHealthAlertNotification } from "./lib/bot-message.mjs";
import { HEALTH_DIMENSIONS, HEALTH_TREND_FILE } from "./lib/bot-health-trend.mjs";
import { cmdHealth, validateMessageFormat } from "./lib/bot-health-cmd.mjs";

// --- args --------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(NODE_ARGV_OFFSET);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
    showUsage();
    process.exit(0);
  }

  const opts = {
    story: "", status: "complete", project: "", content: "",
    noSend: false, dryRun: false, retries: MAX_RETRIES,
    rich: false, verbose: false,
    skill: "", command: "", conclusion: "", description: "", scope: "",
    nextStep: "", impact: "", evidence: "", session: "",
    reason: "", recovery: "", gate: "", gateResult: "", stage: "", fileStats: "",
    totalStages: "", currentStage: "", completedSteps: "", totalSteps: "",
    timing: "", p0Count: "", p1Count: "", p2Count: "",
    diagSummary: "", testSummary: "", fcCount: "", reportLink: "",
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
    if (key === "retries") { opts.retries = parseInt(val, 10) || MAX_RETRIES; }
    else { opts[key] = val; }
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
  console.log("  --skill=<name>         技能标识");
  console.log("  --command=<text>       执行的命令");
  console.log("  --status=<s>           状态: complete|blocked|gate-fail|progress");
  console.log("  --stage=<text>         当前阶段");
  console.log("  --conclusion=<text>    结论");
  console.log("  --description=<text>   描述");
  console.log("  --scope=<text>         范围");
  console.log("  --nextStep=<text>      下一步");
  console.log("  --impact=<text>        影响");
  console.log("  --evidence=<text>      证据");
  console.log("  --session=<text>       会话信息");
  console.log("  --reason=<text>        阻断原因");
  console.log("  --recovery=<text>      恢复点");
  console.log("  --gate=<text>          门禁名称");
  console.log("  --gateResult=<text>    门禁结果");
  console.log("  --fileStats=<text>     变更文件统计");
  console.log("  --content=<text>       直接指定消息正文");
  console.log("  --no-send              仅写日志，不发送 HTTP");
  console.log("  --retries=<N>          重试次数（默认 3）");
  console.log("  --rich                 启用 Rich 视觉格式");
  console.log("  --verbose              启用诊断概要块");
  console.log("");
}

// --- notification sender -----------------------------------------------------

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

async function cmdSend(opts) {
  const projectRoot = findProjectRoot(process.cwd());
  await sendNotification(projectRoot, opts);
}

// --- main --------------------------------------------------------------------

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
      const origLog = console.log; const origError = console.error;
      console.log = () => {}; console.error = () => {};
      const healthResult = await cmdHealth(projectRoot);
      console.log = origLog; console.error = origError;
      const gradeEmoji = healthResult.grade === "A" ? "✅" : healthResult.grade === "B" ? "✅" : healthResult.grade === "C" ? "⚠️" : "🚫";
      const diagSummary = healthResult.diagnostics?.triggered?.length > 0
        ? `触发: ${healthResult.diagnostics.triggered.map((d) => d.id).join(",")}` : "D0-D7 通过";
      const worst = Object.entries(healthResult.scores).filter(([, s]) => s < 80).sort(([, a], [, b]) => a - b).slice(0, 3).map(([d]) => d).join(",");
      console.log(`${gradeEmoji} ${healthResult.composite}/${healthResult.grade} | ${diagSummary} | 弱项: ${worst || "无"}`);
      return;
    }

    if (diffFlag) {
      const trendPath = join(projectRoot, HEALTH_TREND_FILE);
      if (!existsSync(trendPath)) { console.log("无历史数据，无法对比。请先运行 health 命令。"); return; }
      const trendLines = readFileSync(trendPath, "utf-8").trim().split("\n").filter(Boolean);
      if (trendLines.length < 2) { console.log("仅有一次记录，无法对比。请再运行一次 health。"); return; }
      const prev = JSON.parse(trendLines[trendLines.length - 2]);
      const origLog = console.log; const origError = console.error;
      console.log = () => {}; console.error = () => {};
      const curr = await cmdHealth(projectRoot);
      console.log = origLog; console.error = origError;
      const changes = [];
      for (const [dim, cfg] of Object.entries(HEALTH_DIMENSIONS)) {
        const prevScore = prev.scores?.[dim]; const currScore = curr.scores[dim];
        if (prevScore !== undefined && currScore !== undefined) {
          const delta = currScore - prevScore;
          if (Math.abs(delta) >= 5) { const arrow = delta > 0 ? "↑" : "↓"; changes.push(`${arrow}${Math.abs(delta)} ${cfg.label}: ${prevScore}→${currScore}`); }
        }
      }
      const prevDiags = new Set(prev.triggeredDiags || []);
      const currDiags = new Set((curr.diagnostics?.triggered || []).map((d) => d.id));
      const newDiags = [...currDiags].filter((d) => !prevDiags.has(d));
      const resolved = [...prevDiags].filter((d) => !currDiags.has(d));
      if (newDiags.length > 0) changes.push(`⚡ 新增诊断: ${newDiags.join(", ")}`);
      if (resolved.length > 0) changes.push(`✅ 已解决: ${resolved.join(", ")}`);
      const gradeDiff = curr.composite - (prev.composite || 0);
      if (Math.abs(gradeDiff) >= 3) { const gArrow = gradeDiff > 0 ? "↑" : "↓"; changes.unshift(`${gArrow}${Math.abs(gradeDiff)} 综合评分: ${prev.composite}→${curr.composite} (${curr.grade})`); }
      if (changes.length === 0) console.log("→ 无显著变化"); else console.log(changes.join("\n"));
      return;
    }

    const healthResult = await cmdHealth(projectRoot, { html: htmlFlag, notify: notifyFlag, alert: alertFlag });

    if (htmlFlag && healthResult) {
      try {
        const { generateHealthReport, generateHealthIndex } = await import("./lib/health-report.mjs");
        const { filePath } = generateHealthReport(healthResult);
        console.log(`[rui-bot] 健康报告已生成: ${filePath}`);
        generateHealthIndex();
        console.log("[rui-bot] 健康报告索引已更新: docs/健康报告/index.html");
      } catch (err) { console.error(`[rui-bot] HTML 报告生成失败: ${err.message}`); }
    }

    if (notifyFlag && healthResult) {
      const projectName = readProjectName(projectRoot);
      const message = buildHealthNotification(healthResult, projectName);
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
          const result = await sendWithRetry(apiUrl, webhookUrl, message, token, MAX_RETRIES);
          if (result.ok) console.log(`[rui-bot] ✅ 健康通知发送成功`);
          else console.error(`[rui-bot] ❌ 健康通知发送失败: ${result.error}`);
        } else console.log("[rui-bot] ⚠️  webhook URL 未配置，跳过健康通知");
      } else console.log("[rui-bot] ⚠️  API_X_TOKEN 缺失，跳过健康通知");
    }

    if (alertFlag && healthResult) {
      const alertThreshold = 70;
      if (healthResult.composite < alertThreshold) {
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
              if (result.ok) console.log("[rui-bot] ✅ 健康告警发送成功");
              else { console.error(`[rui-bot] ❌ 健康告警发送失败: ${result.error}`); enqueueFailedNotification(projectRoot, alertMsg, webhookUrl, apiUrl, token); }
            }
          } else console.log("[rui-bot] ⚠️  Token/Webhook 缺失，告警仅输出到控制台");
        }
      } else console.log(`[rui-bot] ✅ 健康评分 ${healthResult.composite} ≥ 阈值 ${alertThreshold}，无需告警`);
    }
    return;
  }

  if (args[0] === "--help" || args[0] === "-h" || args[0] === "help") { showUsage(); return; }

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
