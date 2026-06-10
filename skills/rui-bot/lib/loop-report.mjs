/**
 * loop-report — Self-loop report generator and notification dispatcher.
 * Generates styled HTML reports in docs/自循环报告/ and sends WeChat notifications.
 *
 * Usage:
 *   node skills/rui-bot/lib/loop-report.mjs --skill=<name> --status=<pass|warn|fail> [--summary=<text>]
 */

import { writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPORT_DIR = "docs/自循环报告";
const CDN_DEPTH = "../../";

function nowISO() {
  return new Date().toISOString().replace(/T/, " ").slice(0, 19);
}

function nowDate() {
  return new Date().toISOString().slice(0, 10);
}

function nowTime() {
  return new Date().toISOString().slice(11, 19);
}

function nowTimestamp() {
  return Date.now().toString(36);
}

const SKILL_META = {
  "rui-trends":    { icon: "📡", label: "技术趋势监控", interval: "每周一早 9 点" },
  "rui-analysis":  { icon: "🔍", label: "代码健康看门狗", interval: "周一/周四早 8 点" },
  "rui-import":    { icon: "📤", label: "持续文档同步", interval: "每 30 分钟" },
  "rui-story":     { icon: "📋", label: "故事状态轮询", interval: "每 5 分钟" },
  "rui-claude":    { icon: "⚙️", label: "配置健康检查", interval: "每天早 10 点" },
  "rui-bot":       { icon: "💬", label: "通知队列轮询", interval: "每 5 分钟" },
  "rui-npm":       { icon: "📦", label: "依赖安全审计", interval: "每周一早 8 点" },
  "self-improve":  { icon: "🔄", label: "持续自改进闭环", interval: "每周一早 9 点" },
  "rui-html":      { icon: "🎨", label: "HTML 过期重生成", interval: "每 30 分钟" },
  "rui-doc":       { icon: "📝", label: "文档新鲜度检查", interval: "工作日早 8 点" },
  "rui-version":   { icon: "🏷️", label: "版本漂移检测", interval: "每周一早 9 点" },
  "rui-plan":      { icon: "📐", label: "计划新鲜度检查", interval: "工作日早 8 点" },
};

/**
 * Generate a self-loop HTML report.
 */
export function generateReport({ skill, status, summary, details, findings }) {
  const meta = SKILL_META[skill] || { icon: "🔄", label: skill, interval: "—" };
  const ts = nowISO();
  const filename = `${skill}-${nowDate()}-${nowTimestamp()}.html`;

  const statusBadge = {
    pass: '<span class="yry-badge pass">✅ 通过</span>',
    warn: '<span class="yry-badge warn">⚠️ 告警</span>',
    fail: '<span class="yry-badge fail">🚫 异常</span>',
  }[status] || '<span class="yry-badge">—</span>';

  const findingsHtml = (findings || []).map((f, i) =>
    `<div class="yry-finding ${f.level || 'info'}">
      <div class="yry-finding-head">${i + 1}. ${f.title || f.message}</div>
      ${f.detail ? `<div class="yry-finding-body">${f.detail}</div>` : ""}
    </div>`
  ).join("\n");

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>自循环报告 · ${meta.label}</title>
<link rel="stylesheet" href="${CDN_DEPTH}cdn/shared.css">
<link rel="stylesheet" href="${CDN_DEPTH}cdn/theme.css">
<style>
:root {
  --yry-bg: rgba(22,22,32,1);
  --yry-bg-card: linear-gradient(159deg, rgba(38,38,52,1) 0%, rgba(34,34,46,1) 100%);
  --yry-accent: #FFC107;
  --yry-pass: #22c55e; --yry-fail: #ef4444; --yry-warn: #f59e0b;
  --yry-text: rgba(250,250,252,1); --yry-text2: rgba(160,160,164,1); --yry-text3: rgba(110,110,114,1);
  --yry-radius: 12px; --yry-border: 1px solid rgba(255,255,255,0.06);
  --yry-shadow: 0 4px 20px rgba(0,0,0,0.3);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--yry-bg); color: var(--yry-text); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif; line-height: 1.6; min-height: 100vh; }
.yry-container { max-width: 800px; margin: 0 auto; padding: 48px 24px 80px; }
.yry-header { text-align: center; margin-bottom: 32px; }
.yry-header .icon { font-size: 2.5rem; }
.yry-header h1 { font-size: 1.6rem; margin: 12px 0 6px; }
.yry-header .meta { color: var(--yry-text3); font-size: .82rem; }
.yry-card { background: var(--yry-bg-card); border: var(--yry-border); border-radius: var(--yry-radius); padding: 24px; box-shadow: var(--yry-shadow); margin-bottom: 20px; }
.yry-card h2 { font-size: 1.1rem; margin-bottom: 12px; color: var(--yry-accent); }
.yry-stats { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
.yry-stat { background: var(--yry-bg-card); border: var(--yry-border); border-radius: var(--yry-radius); padding: 16px 20px; text-align: center; box-shadow: var(--yry-shadow); flex: 1; min-width: 100px; }
.yry-stat .yry-val { font-size: 1.6rem; font-weight: 700; }
.yry-stat .yry-val.pass { color: var(--yry-pass); }
.yry-stat .yry-val.warn { color: var(--yry-warn); }
.yry-stat .yry-val.fail { color: var(--yry-fail); }
.yry-stat .yry-lbl { font-size: .72rem; color: var(--yry-text3); margin-top: 4px; }
.yry-badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: .85rem; font-weight: 600; }
.yry-badge.pass { background: rgba(34,197,94,.15); color: var(--yry-pass); }
.yry-badge.warn { background: rgba(245,158,11,.15); color: var(--yry-warn); }
.yry-badge.fail { background: rgba(239,68,68,.15); color: var(--yry-fail); }
.yry-summary { padding: 16px; border-left: 3px solid var(--yry-accent); background: rgba(255,193,7,.04); border-radius: 0 var(--yry-radius) var(--yry-radius) 0; margin-bottom: 20px; color: var(--yry-text2); font-size: .9rem; }
.yry-finding { padding: 14px 18px; margin-bottom: 8px; border-radius: 8px; border: var(--yry-border); }
.yry-finding.info { background: rgba(59,130,246,.04); }
.yry-finding.warn { background: rgba(245,158,11,.04); border-left: 3px solid var(--yry-warn); }
.yry-finding.fail { background: rgba(239,68,68,.04); border-left: 3px solid var(--yry-fail); }
.yry-finding-head { font-weight: 600; font-size: .9rem; }
.yry-finding-body { margin-top: 6px; color: var(--yry-text2); font-size: .82rem; }
.yry-footer { text-align: center; color: var(--yry-text3); font-size: .74rem; margin-top: 48px; padding-top: 20px; border-top: var(--yry-border); }
.yry-breadcrumb { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 24px; font-size: .76rem; }
.yry-breadcrumb a { color: #7aa2f7; text-decoration: none; }
.yry-breadcrumb .yry-bc-sep { color: #53576c; opacity: .5; }
.yry-breadcrumb .yry-bc-current { color: #94a3b8; }
</style>
</head>
<body>
<div class="yry-container">

<nav class="yry-breadcrumb">
  <a href="${CDN_DEPTH}docs/index.html">📄 文档中心</a>
  <span class="yry-bc-sep">/</span>
  <a href="${CDN_DEPTH}docs/自循环报告/">🔄 自循环报告</a>
  <span class="yry-bc-sep">/</span>
  <span class="yry-bc-current">${meta.label}</span>
</nav>

<div class="yry-header">
  <div class="icon">${meta.icon}</div>
  <h1>自循环报告 · ${meta.label}</h1>
  <div class="meta">${ts} · ${meta.interval} · ${statusBadge}</div>
</div>

<div class="yry-stats">
  <div class="yry-stat">
    <div class="yry-val ${status}">${status === 'pass' ? '✓' : status === 'warn' ? '⚠' : '✗'}</div>
    <div class="yry-lbl">状态</div>
  </div>
  <div class="yry-stat">
    <div class="yry-val pass">${(findings || []).filter(f => f.level === 'info').length}</div>
    <div class="yry-lbl">信息</div>
  </div>
  <div class="yry-stat">
    <div class="yry-val warn">${(findings || []).filter(f => f.level === 'warn').length}</div>
    <div class="yry-lbl">告警</div>
  </div>
  <div class="yry-stat">
    <div class="yry-val fail">${(findings || []).filter(f => f.level === 'fail').length}</div>
    <div class="yry-lbl">异常</div>
  </div>
</div>

${summary ? `<div class="yry-summary">${summary}</div>` : ""}

${findingsHtml ? `
<div class="yry-card">
  <h2>📋 检查详情</h2>
  ${findingsHtml}
</div>
` : ""}

${details ? `
<div class="yry-card">
  <h2>📊 详细数据</h2>
  <pre style="color:var(--yry-text2);font-size:.82rem;white-space:pre-wrap;overflow-x:auto">${details}</pre>
</div>
` : ""}

<div class="yry-footer">
  自循环报告 · ${skill} · ${ts}<br>
  <span style="color:var(--yry-text3)">由 rui-bot loop-report 自动生成</span>
</div>

</div>
<script src="${CDN_DEPTH}cdn/shared.js"></script>
</body>
</html>`;

  // Ensure report directory exists
  if (!existsSync(REPORT_DIR)) {
    mkdirSync(REPORT_DIR, { recursive: true });
  }

  const filePath = join(REPORT_DIR, filename);
  writeFileSync(filePath, html, "utf-8");

  return { filePath, filename };
}

/**
 * Generate an index page for all loop reports.
 */
export function generateIndex() {
  if (!existsSync(REPORT_DIR)) return;

  const files = readdirSync(REPORT_DIR)
    .filter(f => f.endsWith(".html") && f !== "index.html")
    .sort()
    .reverse();

  const rows = files.map(f => {
    const parts = f.replace(".html", "").split("-");
    const skill = parts.slice(0, -2).join("-");
    const date = parts[parts.length - 2];
    const meta = SKILL_META[skill] || { icon: "🔄", label: skill };
    return `<tr>
      <td><a href="${f}">${meta.icon} ${meta.label}</a></td>
      <td>${date}</td>
      <td><a href="${f}">查看</a></td>
    </tr>`;
  }).join("\n");

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>自循环报告索引</title>
<link rel="stylesheet" href="../cdn/shared.css">
<link rel="stylesheet" href="../cdn/theme.css">
<style>
:root {
  --yry-bg: rgba(22,22,32,1);
  --yry-bg-card: linear-gradient(159deg, rgba(38,38,52,1) 0%, rgba(34,34,46,1) 100%);
  --yry-accent: #FFC107;
  --yry-text: rgba(250,250,252,1); --yry-text2: rgba(160,160,164,1); --yry-text3: rgba(110,110,114,1);
  --yry-radius: 12px; --yry-border: 1px solid rgba(255,255,255,0.06);
  --yry-shadow: 0 4px 20px rgba(0,0,0,0.3);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--yry-bg); color: var(--yry-text); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif; line-height: 1.6; min-height: 100vh; }
.yry-container { max-width: 800px; margin: 0 auto; padding: 48px 24px 80px; }
.yry-header { text-align: center; margin-bottom: 32px; }
.yry-header h1 { font-size: 1.6rem; }
.yry-header .meta { color: var(--yry-text3); font-size: .82rem; }
.yry-card { background: var(--yry-bg-card); border: var(--yry-border); border-radius: var(--yry-radius); padding: 24px; box-shadow: var(--yry-shadow); }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 10px 16px; text-align: left; border-bottom: var(--yry-border); font-size: .88rem; }
th { color: var(--yry-text3); font-size: .76rem; text-transform: uppercase; }
td a { color: #7aa2f7; text-decoration: none; }
td a:hover { color: var(--yry-accent); }
.yry-footer { text-align: center; color: var(--yry-text3); font-size: .74rem; margin-top: 48px; padding-top: 20px; border-top: var(--yry-border); }
</style>
</head>
<body>
<div class="yry-container">
<div class="yry-header">
  <h1>🔄 自循环报告</h1>
  <div class="meta">${files.length} 份报告</div>
</div>
<div class="yry-card">
  <table>
    <thead><tr><th>模块</th><th>日期</th><th>操作</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="3" style="color:var(--yry-text3)">暂无报告</td></tr>'}</tbody>
  </table>
</div>
<div class="yry-footer">由 rui-bot loop-report 自动生成</div>
</div>
</body>
</html>`;

  writeFileSync(join(REPORT_DIR, "index.html"), html, "utf-8");
}

/**
 * Send a loop report notification via rui-bot (direct function call, no shell).
 */
export async function notifyReport({ skill, status, filename, summary, findings }) {
  const meta = SKILL_META[skill] || { icon: "🔄", label: skill };
  const statusEmoji = { pass: "✅", warn: "⚠️", fail: "🚫" }[status] || "📋";
  const statusLabel = { pass: "通过", warn: "告警", fail: "异常" }[status] || status;

  // Build findings summary (max 3 items)
  const topFindings = (findings || []).slice(0, 3);
  const findingsText = topFindings.length > 0
    ? topFindings.map((f, i) => `${i + 1}. ${f.level === "fail" ? "❌" : f.level === "warn" ? "⚠️" : "ℹ️"} ${f.title || f.message}`).join("\n")
    : "";

  // Read latest health score for context
  let healthLine = "";
  try {
    const trendPath = ".memory/health-trend.jsonl";
    if (existsSync(trendPath)) {
      const lines = readFileSync(trendPath, "utf-8").trim().split("\n").filter(Boolean);
      if (lines.length > 0) {
        const latest = JSON.parse(lines[lines.length - 1]);
        const hIcon = latest.grade === "A" || latest.grade === "B" ? "✅" : latest.grade === "C" ? "⚠️" : "🚫";
        const diags = (latest.triggeredDiags || []).length > 0 ? ` | 触发: ${latest.triggeredDiags.join(",")}` : "";
        healthLine = `🩺 健康度: ${latest.composite}/${latest.grade} ${hIcon}${diags}`;
      }
    }
  } catch { /* skip */ }

  const content = [
    `${meta.icon} 自循环报告 · ${meta.label}`,
    `状态: ${statusEmoji} ${statusLabel}`,
    `摘要: ${summary || "无异常"}`,
    healthLine,
    findingsText ? `发现:\n${findingsText}` : "",
    `报告: docs/自循环报告/${filename}`,
    `时间: ${new Date().toISOString().slice(0, 19).replace("T", " ")}`,
  ].filter(Boolean).join("\n");

  try {
    const { sendNotification, findProjectRoot } = await import("../send.mjs");
    const projectRoot = findProjectRoot(process.cwd());
    const result = await sendNotification(projectRoot, {
      skill,
      command: "自循环",
      status: "complete",
      content,
    });
    return result.ok;
  } catch (err) {
    console.error(`[loop-report] 通知发送失败: ${err.message}`);
    return false;
  }
}

/**
 * Main CLI entry point.
 */
async function main() {
  const args = process.argv.slice(2);
  const opts = { findings: [] };

  for (const arg of args) {
    const eq = arg.indexOf("=");
    if (eq === -1) continue;
    const key = arg.slice(2, eq);
    const val = arg.slice(eq + 1);
    if (key === "findings") {
      try { opts.findings = JSON.parse(val); } catch {}
    } else {
      opts[key] = val;
    }
  }

  if (!opts.skill || !opts.status) {
    console.log("用法: node loop-report.mjs --skill=<name> --status=pass|warn|fail [--summary=<text>] [--findings=<json>] [--notify]");
    process.exit(0);
  }

  const { filePath, filename } = generateReport(opts);
  console.log(`[loop-report] 报告已生成: ${filePath}`);

  generateIndex();
  console.log("[loop-report] 索引已更新: docs/自循环报告/index.html");

  if (opts.notify) {
    await notifyReport({ skill: opts.skill, status: opts.status, filename, summary: opts.summary, findings: opts.findings });
  }
}

const _isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (_isMain) {
  main();
}
