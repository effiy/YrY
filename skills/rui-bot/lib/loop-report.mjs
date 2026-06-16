/**
 * loop-report — Self-loop report generator and notification dispatcher.
 * Generates styled HTML reports in docs/自循环报告/ and sends WeChat notifications.
 *
 * Usage:
 *   node skills/rui-bot/lib/loop-report.mjs --skill=<name> --status=<pass|warn|fail> [--summary=<text>]
 */

import { writeFileSync, mkdirSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { nowISO, nowDate } from "../../../lib/fs.mjs";

const REPORT_DIR = "docs/自循环报告";
const CDN_DEPTH = "../../";

function fmtDisplay(iso) {
  return iso.replace('T', ' ').slice(0, 19);
}

function nowTime() {
  return new Date().toISOString().slice(11, 19);
}

function nowTimestamp() {
  return Date.now().toString(36);
}

/**
 * Read latest health score for cross-report context.
 */
function getLatestHealthContext() {
  try {
    const trendPath = ".memory/health-trend.jsonl";
    if (!existsSync(trendPath)) return null;
    const lines = readFileSync(trendPath, "utf-8").trim().split("\n").filter(Boolean);
    if (lines.length === 0) return null;
    const latest = JSON.parse(lines[lines.length - 1]);
    return { score: latest.composite, grade: latest.grade, date: latest.timestamp?.slice(0, 10) };
  } catch { return null; }
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

const CROSS_REFS = {
  "rui-trends":   { dim: "自循环报告", desc: "趋势数据影响自循环报告新鲜度和 D5 诊断信号，过时趋势可能导致技术选型决策失误" },
  "rui-analysis":  { dim: "D2 质量退化", desc: "代码分析结果直接输入 D2 质量退化检测，高频修改文件和复杂度热点是质量热点的核心信号" },
  "rui-import":    { dim: "API 可达性", desc: "文档同步依赖 API 可达性，失败时导致远端与本地文档基线不一致" },
  "rui-story":     { dim: "Git 仓库状态", desc: "故事状态变更涉及 Git 分支和索引更新，分支隔离违规为 P0 事件" },
  "rui-claude":    { dim: "配置文件", desc: "配置健康直接影响 .claude/ 完整性评分，多目录配置漂移触发 D6 诊断" },
  "rui-bot":       { dim: "机器人配置", desc: "通知投递依赖机器人 webhook 配置和 API 可达性，失败队列堆积影响消息时效" },
  "rui-npm":       { dim: "依赖管理", desc: "依赖安全审计结果输入工程化成熟度-依赖管理维度，已知漏洞触发 P0 安全告警" },
  "self-improve":  { dim: "D0-D7 诊断", desc: "自改进闭环是 D0-D7 诊断的主要触发源，驱动全维度健康检查" },
};

/**
 * Generate a self-loop HTML report with enhanced detail.
 */
export function generateReport({ skill, status, summary, details, findings }) {
  const meta = SKILL_META[skill] || { icon: "🔄", label: skill, interval: "—" };
  const ts = fmtDisplay(nowISO());
  const filename = `${skill}-${nowDate()}.html`;

  const statusBadge = {
    pass: '<span class="yry-badge pass">✅ 通过</span>',
    warn: '<span class="yry-badge warn">⚠️ 告警</span>',
    fail: '<span class="yry-badge fail">🚫 异常</span>',
  }[status] || '<span class="yry-badge">—</span>';

  const findingsHtml = (findings || []).map((f, i) => {
    const resolution = resolutionForFinding(f);
    return `<div class="yry-finding ${f.level || 'info'}">
      <div class="yry-finding-head">${i + 1}. ${f.title || f.message}</div>
      ${f.detail ? `<div class="yry-finding-body">${f.detail}</div>` : ""}
      ${resolution ? `<div class="yry-finding-resolution"><span class="yry-resolution-badge ${f.level || 'info'}">🔧 建议措施</span>${resolution}</div>` : ""}
    </div>`;
  }).join("\n");

  const hc = getLatestHealthContext();
  const healthStatHtml = hc ? `
  <div class="yry-stat">
    <a href="${CDN_DEPTH}docs/健康报告/" style="text-decoration:none;color:inherit">
      <div class="yry-val ${hc.grade === 'A' || hc.grade === 'B' ? 'pass' : hc.grade === 'C' ? 'warn' : 'fail'}">${hc.score}</div>
      <div class="yry-lbl">🩺 健康度 ${hc.grade} 级</div>
    </a>
  </div>` : "";

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
.yry-finding-resolution { margin-top: 8px; padding: 8px 12px; background: rgba(15,23,42,.4); border-radius: 6px; font-size: .78rem; color: var(--yry-text2); line-height: 1.5; display: flex; gap: 8px; align-items: flex-start; }
.yry-resolution-badge { flex-shrink: 0; font-size: .66rem; font-weight: 600; padding: 2px 8px; border-radius: 4px; }
.yry-resolution-badge.fail { background: rgba(239,68,68,.12); color: var(--yry-fail); }
.yry-resolution-badge.warn { background: rgba(245,158,11,.12); color: var(--yry-warn); }
.yry-resolution-badge.info { background: rgba(59,130,246,.1); color: var(--yry-info); }
.yry-footer { text-align: center; color: var(--yry-text3); font-size: .74rem; margin-top: 48px; padding-top: 20px; border-top: var(--yry-border); }
.yry-breadcrumb { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 24px; font-size: .76rem; }
.yry-breadcrumb a { color: #7aa2f7; text-decoration: none; }
.yry-breadcrumb .yry-bc-sep { color: #53576c; opacity: .5; }
.yry-breadcrumb .yry-bc-current { color: #94a3b8; }
/* Enhanced sections */
.yry-impact-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.yry-impact-badge { display: inline-block; padding: 4px 14px; border-radius: 6px; color: #fff; font-size: .8rem; font-weight: 600; }
.yry-impact-summary { font-size: .84rem; color: var(--yry-text2); }
.yry-impact-detail { padding: 12px; background: rgba(15,23,42,.4); border-radius: 8px; border: var(--yry-border); margin-top: 8px; }
.yry-hist-dot { transition: transform .15s; }
.yry-hist-dot:hover { transform: scale(1.8); }
.yry-cross-item { flex: 1; min-width: 200px; }
.yry-cross-label { font-size: .78rem; color: var(--yry-text3); margin-bottom: 4px; }
.yry-cross-desc { font-size: .88rem; font-weight: 600; color: var(--yry-accent); line-height: 1.5; }
.yry-cross-badge { text-align: center; padding: 8px 16px; background: rgba(15,23,42,.4); border-radius: 8px; border: var(--yry-border); flex-shrink: 0; min-width: 80px; }
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
  ${healthStatHtml}
</div>

${summary ? `<div class="yry-summary">${summary}</div>` : ""}

${findingsHtml ? `
<div class="yry-card">
  <h2>📋 检查详情</h2>
  ${findingsHtml}
</div>
` : ""}

${buildImpactAssessment(findings || [], status)}

${buildSkillHistoryCard(skill)}

${details ? `
<div class="yry-card">
  <h2>📊 详细数据</h2>
  <pre style="color:var(--yry-text2);font-size:.82rem;white-space:pre-wrap;overflow-x:auto">${details}</pre>
</div>
` : ""}

${buildCrossReferenceCard(skill, status)}

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

/* ═══ Enhanced section builders ═══ */

function resolutionForFinding(finding) {
  const title = (finding.title || finding.message || "").toLowerCase();
  if (title.includes("不可达") || title.includes("unreachable") || title.includes("timeout")) {
    return "检查网络连接和目标服务状态，验证 URL 配置是否正确；如为外部服务故障，等待恢复后重试";
  }
  if (title.includes("空数据") || title.includes("empty") || title.includes("返回空")) {
    return "数据源页面结构可能已变更，需更新 HTML 解析选择器；检查目标页面是否改版，调整提取逻辑";
  }
  if (title.includes("失败") || title.includes("error") || title.includes("异常")) {
    return "查看详细错误日志定位根因；如为临时性故障，系统将在下次轮询自动重试";
  }
  if (title.includes("高") || title.includes("过高") || title.includes("频繁")) {
    return "审查相关维度的当前配置和阈值，评估是否需要调整参数或增加资源分配";
  }
  if (title.includes("低") || title.includes("过低") || title.includes("不足")) {
    return "识别瓶颈资源或缺失配置，制定改进计划并设定目标值；可参考健康报告建议";
  }
  if (title.includes("过时") || title.includes("stale") || title.includes("过期") || title.includes("未更新")) {
    return "触发对应的刷新或重生成流程；检查自动化调度是否正常，必要时手动触发更新";
  }
  if (title.includes("安全") || title.includes("security") || title.includes("漏洞")) {
    return "立即评估风险等级，优先修复高危漏洞；更新依赖版本或应用安全补丁";
  }
  if (title.includes("配置") || title.includes("config") || title.includes("缺失")) {
    return "补齐缺失的配置项，参考项目规约文档确保配置完整性；验证配置格式合规";
  }
  return null;
}

function buildImpactAssessment(findings, status) {
  if (!findings || findings.length === 0) return "";
  const failCount = findings.filter(f => f.level === 'fail').length;
  const warnCount = findings.filter(f => f.level === 'warn').length;
  const infoCount = findings.filter(f => f.level === 'info').length;
  const severityLabel = failCount > 0 ? '需立即关注' : warnCount > 0 ? '需关注' : '正常';
  const severityColor = failCount > 0 ? 'var(--yry-fail)' : warnCount > 0 ? 'var(--yry-warn)' : 'var(--yry-pass)';
  const topIssues = findings.filter(f => f.level === 'fail' || f.level === 'warn').slice(0, 5);
  const suggestion = failCount > 0
    ? '优先处理异常项，防止管线阻塞或数据丢失。建议在下一轮迭代中分配修复任务。'
    : warnCount > 0
    ? '计划性修复告警项，避免升级为异常。可在例行维护窗口处理。'
    : '继续监控，维持当前良好状态。';
  return `<div class="yry-card">
    <h2>🎯 影响评估 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${failCount + warnCount} 项需关注</span></h2>
    <div class="yry-impact-header">
      <span class="yry-impact-badge" style="background:${severityColor}">${severityLabel}</span>
      <span class="yry-impact-summary">异常 ${failCount} · 告警 ${warnCount} · 信息 ${infoCount}</span>
    </div>
    ${topIssues.length > 0 ? `<div class="yry-impact-detail"><strong>关键问题:</strong><ul style="margin-top:6px;padding-left:20px;color:var(--yry-text2);font-size:.84rem">${topIssues.map(f => `<li>${f.title || f.message}${f.detail ? `<br><span style="color:var(--yry-text3);font-size:.76rem">${f.detail}</span>` : ''}</li>`).join('')}</ul></div>` : ''}
    <div style="margin-top:10px;font-size:.78rem;color:var(--yry-text3)">📌 ${suggestion}</div>
  </div>`;
}

function buildSkillHistoryCard(skill) {
  try {
    if (!existsSync(REPORT_DIR)) return "";
    const files = readdirSync(REPORT_DIR)
      .filter(f => f.startsWith(skill + '-') && f.endsWith('.html'))
      .sort().reverse();
    if (files.length < 2) {
      return `<div class="yry-card">
        <h2>📈 历史趋势</h2>
        <div style="text-align:center;color:var(--yry-text3);padding:20px;font-size:.84rem">仅 1 份报告 — 积累更多数据后启用趋势对比</div>
      </div>`;
    }
    const recent = files.slice(0, 10);
    const dots = recent.map((f, i) => {
      const dm = f.match(/(\d{4}-\d{2}-\d{2})/);
      const date = dm ? dm[1] : '';
      const isLatest = i === 0;
      const size = isLatest ? '10px' : '6px';
      return `<span style="display:inline-block;width:${size};height:${size};border-radius:50%;background:var(--yry-pass);margin:0 2px;transition:transform .15s;cursor:default" title="${date}" onmouseover="this.style.transform='scale(1.8)'" onmouseout="this.style.transform='scale(1)'"></span>`;
    }).join('');
    return `<div class="yry-card">
      <h2>📈 历史趋势 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">最近 ${Math.min(files.length, 10)} 次执行</span></h2>
      <div style="display:flex;align-items:center;gap:10px;padding:12px 0">
        <span style="font-size:.7rem;color:var(--yry-text3)">最早</span>
        <div style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px">${dots}</div>
        <span style="font-size:.7rem;color:var(--yry-text3)">最新</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:var(--yry-border)">
        <span style="font-size:.74rem;color:var(--yry-text3)">共 ${files.length} 份历史报告</span>
        <span style="font-size:.7rem;color:var(--yry-text3)">执行频率: ${SKILL_META[skill]?.interval || '—'}</span>
      </div>
    </div>`;
  } catch { return ""; }
}

function buildCrossReferenceCard(skill, status) {
  const ref = CROSS_REFS[skill];
  if (!ref) return "";
  const statusIcon = status === 'pass' ? '✓' : status === 'warn' ? '⚠' : '✗';
  const statusColor = status === 'pass' ? 'var(--yry-pass)' : status === 'warn' ? 'var(--yry-warn)' : 'var(--yry-fail)';
  return `<div class="yry-card">
    <h2>🔗 关联分析 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">对项目健康的影响</span></h2>
    <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">
      <div class="yry-cross-item">
        <div class="yry-cross-label">关联维度</div>
        <div class="yry-cross-desc">${ref.dim}</div>
      </div>
      <div class="yry-cross-item">
        <div class="yry-cross-label">影响机制</div>
        <div class="yry-cross-desc">${ref.desc}</div>
      </div>
      <div class="yry-cross-badge">
        <div style="font-size:.7rem;color:var(--yry-text3)">当前状态</div>
        <div style="font-size:1.1rem;font-weight:700;color:${statusColor}">${statusIcon} ${status === 'pass' ? '正常' : status === 'warn' ? '告警' : '异常'}</div>
      </div>
    </div>
  </div>`;
}

/**
 * Generate reports.json manifest for the self-loop report index page.
 * Scans all HTML report files and writes metadata as JSON.
 */
export function generateManifest() {
  if (!existsSync(REPORT_DIR)) return;

  const files = readdirSync(REPORT_DIR)
    .filter(f => f.endsWith(".html") && f !== "index.html")
    .sort()
    .reverse();

  function parseLoopFilename(name) {
    const m1 = name.match(/^(.+)-(\d{4}-\d{2}-\d{2})\.html$/);
    if (m1) return { skill: m1[1], date: m1[2] };
    const m2 = name.match(/^(.+)-(\d{4}-\d{2}-\d{2})-(.+)\.html$/);
    if (m2) return { skill: m2[1], date: m2[2] };
    return { skill: name.replace(/\.html$/, ""), date: "" };
  }

  const seen = new Set();
  const reports = [];

  for (const f of files) {
    const parsed = parseLoopFilename(f);
    const skill = parsed.skill;
    const date = parsed.date;
    const key = `${skill}::${date}`;
    if (date && seen.has(key)) continue;
    if (date) seen.add(key);

    const meta = SKILL_META[skill] || { icon: "🔄", label: skill };
    let status = "pass";
    let summary = "";
    let findings = null;
    try {
      const html = readFileSync(join(REPORT_DIR, f), "utf-8");
      const badgeMatch = html.match(/class="yry-badge\s+(pass|warn|fail)"/);
      if (badgeMatch) status = badgeMatch[1];
      const summaryMatch = html.match(/<div class="yry-summary">([\s\S]*?)<\/div>/);
      if (summaryMatch) summary = summaryMatch[1].replace(/<[^>]+>/g, "").trim();
      const infoCount = (html.match(/class="yry-finding\s+info"/g) || []).length;
      const warnCount = (html.match(/class="yry-finding\s+warn"/g) || []).length;
      const failCount = (html.match(/class="yry-finding\s+fail"/g) || []).length;
      findings = { info: infoCount, warn: warnCount, fail: failCount };
    } catch { /* skip */ }

    reports.push({
      file: f,
      skill,
      skillLabel: meta.label,
      icon: meta.icon,
      date,
      status,
      summary,
      findings,
    });
  }

  writeFileSync(join(REPORT_DIR, "reports.json"), JSON.stringify(reports), "utf-8");
}

/**
 * Generate an index page for all loop reports — dynamic client-side version.
 * Reads reports.json at page load for live data.
 */
export function generateIndex() {
  if (!existsSync(REPORT_DIR)) return;

  const files = readdirSync(REPORT_DIR)
    .filter(f => f.endsWith(".html") && f !== "index.html")
    .sort()
    .reverse();

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>自循环报告索引</title>
<link rel="stylesheet" href="../../cdn/shared.css">
<link rel="stylesheet" href="../../cdn/theme.css">
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
.yry-bc { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 24px; font-size: .76rem; }
.yry-bc a { color: #22d3ee; text-decoration: none; }
.yry-bc a:hover { color: var(--yry-accent); }
.yry-bc .yry-bc-sep { color: var(--yry-text3); opacity: .4; }
.yry-bc .yry-bc-cur { color: var(--yry-text2); }
.yry-header { text-align: center; margin-bottom: 32px; }
.yry-header h1 { font-size: 1.6rem; }
.yry-header .desc { color: var(--yry-text2); font-size: .84rem; margin-top: 8px; line-height: 1.6; max-width: 600px; margin-left: auto; margin-right: auto; }
.yry-header .meta { color: var(--yry-text3); font-size: .82rem; margin-top: 6px; }
.yry-stats { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
.yry-stat { background: var(--yry-bg-card); border: var(--yry-border); border-radius: var(--yry-radius); padding: 16px 20px; text-align: center; box-shadow: var(--yry-shadow); flex: 1; min-width: 100px; cursor: default; }
.yry-stat .yry-val { font-size: 1.6rem; font-weight: 700; }
.yry-stat .yry-val.pass { color: var(--yry-pass); }
.yry-stat .yry-val.warn { color: var(--yry-warn); }
.yry-stat .yry-val.fail { color: var(--yry-fail); }
.yry-stat .yry-val.info { color: #22d3ee; }
.yry-stat .yry-lbl { font-size: .72rem; color: var(--yry-text3); margin-top: 4px; }
.yry-card { background: var(--yry-bg-card); border: var(--yry-border); border-radius: var(--yry-radius); padding: 24px; box-shadow: var(--yry-shadow); margin-bottom: 20px; }
.yry-card h2 { font-size: 1.1rem; margin-bottom: 12px; color: var(--yry-accent); }
.yry-intro { padding: 16px; border-left: 3px solid var(--yry-accent); background: rgba(255,193,7,.04); border-radius: 0 var(--yry-radius) var(--yry-radius) 0; margin-bottom: 20px; color: var(--yry-text2); font-size: .84rem; line-height: 1.7; }
.yry-intro strong { color: var(--yry-accent); }
.yry-intro code { background: rgba(59,130,246,.1); padding: 1px 6px; border-radius: 4px; font-size: .82em; color: #22d3ee; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 10px 16px; text-align: left; border-bottom: var(--yry-border); font-size: .88rem; }
th { color: var(--yry-text3); font-size: .76rem; text-transform: uppercase; }
td a { color: #7aa2f7; text-decoration: none; }
td a:hover { color: var(--yry-accent); }
.yry-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: .72rem; font-weight: 600; }
.yry-badge.pass { background: rgba(34,197,94,.15); color: var(--yry-pass); }
.yry-badge.warn { background: rgba(245,158,11,.15); color: var(--yry-warn); }
.yry-badge.fail { background: rgba(239,68,68,.15); color: var(--yry-fail); }
.yry-links { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px; justify-content: center; }
.yry-link { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; background: rgba(59,130,246,.08); border: 1px solid rgba(59,130,246,.15); color: #22d3ee; text-decoration: none; font-size: .82rem; transition: all .15s; }
.yry-link:hover { background: rgba(59,130,246,.15); color: var(--yry-accent); }
.yry-footer { text-align: center; color: var(--yry-text3); font-size: .74rem; margin-top: 48px; padding-top: 20px; border-top: var(--yry-border); }
.yry-skill-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.yry-skill-chip { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; background: rgba(59,130,246,.06); border: 1px solid rgba(59,130,246,.1); font-size: .74rem; color: var(--yry-text2); }
.yry-skill-chip .si { font-size: .9rem; }
.yry-empty { text-align: center; padding: 48px 24px; color: var(--yry-text3); }
.yry-empty code { color: #22d3ee; }
#loading { text-align: center; color: var(--yry-text3); padding: 40px; }
</style>
</head>
<body>
<div class="yry-container">
<nav class="yry-bc">
  <a href="../../docs/index.html">📄 文档中心</a>
  <span class="yry-bc-sep">/</span>
  <span class="yry-bc-cur">🔄 自循环报告</span>
</nav>
<div class="yry-header">
  <h1>🔄 自循环报告</h1>
  <div class="desc">12 技能定期巡检，由 Cron 定时触发，报告自动生成并推送企微通知。覆盖趋势监控、代码健康、文档同步、故事轮询、配置检查、依赖审计、自改进闭环等全维度。</div>
  <div class="meta">${files.length} 份报告</div>
</div>
<div class="yry-intro">
  <strong>工作原理</strong>：Cron 定时任务按预设间隔触发技能执行 → 每轮执行生成自循环报告 HTML → <code>rui-bot loop-report</code> 汇总并推送企微通知 → 关联维度数据输入 D0-D7 诊断引擎。<br>
  <strong>报告位置</strong>：<code>docs/自循环报告/</code> · <strong>生成工具</strong>：<code>node skills/rui-bot/lib/loop-report.mjs</code> · <strong>通知渠道</strong>：企业微信 Webhook
</div>
<div class="yry-card">
  <h2>📋 报告列表</h2>
  <table>
    <thead><tr><th>技能模块</th><th>日期</th><th>状态</th><th>摘要</th><th>操作</th></tr></thead>
    <tbody id="tbody"></tbody>
  </table>
</div>
<div class="yry-links">
  <a class="yry-link" href="../../skills/rui-bot/SKILL.md" target="_blank">📋 rui-bot 规约</a>
  <a class="yry-link" href="../健康报告/index.html">🩺 健康报告</a>
  <a class="yry-link" href="../趋势报告/index.html">📡 趋势报告</a>
  <a class="yry-link" href="../index.html">📄 文档中心</a>
</div>
<div class="yry-footer">
  由 rui-bot loop-report 自动生成 · 数据实时读取<br>
  <span style="color:var(--yry-text3)">12 技能 · 定时巡检 · 企微通知</span>
</div>
</div>
<script>
(async function() {
  var tbody = document.getElementById('tbody');
  try {
    var resp = await fetch('reports.json');
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    var reports = await resp.json();
    if (reports.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5"><div class="yry-empty">暂无自循环报告<br><span style="font-size:.7rem;margin-top:8px;display:block">运行 <code>node skills/rui-bot/lib/loop-report.mjs --skill=&lt;name&gt; --status=&lt;pass|warn|fail&gt;</code> 生成首份报告</span></div></td></tr>';
      return;
    }
    var badgeMap = { pass: '✅ 通过', warn: '⚠️ 告警', fail: '🚫 异常' };
    tbody.innerHTML = reports.map(function(r) {
      var badge = '<span class="yry-badge ' + (r.status || 'pass') + '">' + (badgeMap[r.status] || r.status) + '</span>';
      return '<tr>' +
        '<td><a href="' + (r.file || '#') + '">' + (r.icon || '🔄') + ' ' + (r.skillLabel || r.skill) + '</a></td>' +
        '<td>' + r.date + '</td>' +
        '<td>' + badge + '</td>' +
        '<td style="font-size:.82rem;color:var(--yry-text2)">' + (r.summary || '—') + '</td>' +
        '<td><a href="' + (r.file || '#') + '">查看</a></td>' +
        '</tr>';
    }).join('');
  } catch(e) {
    tbody.innerHTML = '<tr><td colspan="5"><div class="yry-empty">暂无自循环报告<br><span style="font-size:.7rem;margin-top:8px;display:block">运行 <code>node skills/rui-bot/lib/loop-report.mjs --skill=&lt;name&gt; --status=&lt;pass|warn|fail&gt;</code> 生成首份报告</span></div></td></tr>';
  }
})();
</script>
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
    const { sendNotification } = await import("../send.mjs");
    const { findProjectRoot } = await import("../../../lib/fs.mjs");
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
  const opts = { skill: "", status: "", summary: "", details: "", findings: [] };

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

  generateManifest();
  console.log("[loop-report] 清单已更新: docs/自循环报告/reports.json");

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
