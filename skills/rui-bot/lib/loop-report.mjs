/**
 * loop-report — Self-loop report generator and notification dispatcher.
 * Generates styled HTML reports in docs/自循环报告/ and sends WeChat notifications.
 *
 * Usage:
 *   node skills/rui-bot/lib/loop-report.mjs --skill=<name> --status=<pass|warn|fail> [--summary=<text>]
 */

import { writeFileSync, mkdirSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { nowISO, nowDate, isMain, fmtDisplay, writeJson } from "../../../lib/fs.mjs";
import { NODE_ARGV_OFFSET } from "../../../lib/constants.mjs";
import { LOOP_SKILLS, getCheckItems, getCrossRef } from "../../../lib/loop/registry.mjs";

const REPORT_DIR = "docs/自循环报告";
const CDN_DEPTH = "../../";

// Build SKILL_META index from registry for backwards-compat with downstream code.
const SKILL_META = Object.fromEntries(
  LOOP_SKILLS.map(s => [s.skill, { icon: s.icon, label: s.label, interval: s.interval, category: s.category, desc: s.desc }])
);

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

/**
 * Build a status summary card showing what was checked and the health context.
 * For pass reports, shows what passed; for non-pass, shows what needs attention.
 */
function buildStatusSummary(/** @type {string} */ skill, /** @type {string} */ status, /** @type {any[]} */ findings, /** @type {any} */ meta) {
  const checkItems = getCheckItemsForSkill(skill);
  const failedFindings = (findings || []).filter((/** @type {any} */ f) => f.level === 'fail' || f.level === 'warn');
  const passedCount = checkItems.length - failedFindings.length;

  const checkHtml = checkItems.map((/** @type {any} */ item) => {
    const hasIssue = failedFindings.some((f) => (f.title || f.message || "").toLowerCase().indexOf(item.keyword) >= 0);
    const icon = hasIssue ? '⚠️' : '✅';
    const tier = hasIssue ? 'warn' : 'pass';
    return `<div class="lp-check-row">
<span class="lp-check-icon ${tier}">${icon}</span>
<span class="lp-check-label">${item.label}</span>
<span class="lp-check-target">${item.target}</span>
</div>`;
  }).join("");

  const statusNote = status === 'pass'
    ? '所有检查项均通过，技能运行正常。下一个巡检周期将自动重新检查。'
    : status === 'warn'
    ? passedCount + '/' + checkItems.length + ' 项通过，建议在例行维护窗口处理告警项。'
    : passedCount + '/' + checkItems.length + ' 项通过，存在阻塞性问题需立即修复。';

  return `<div class="yry-card">
<h2>📋 检查清单 <span class="lp-section-sub">${passedCount}/${checkItems.length} 通过</span></h2>
<div class="lp-check-wrap">${checkHtml}</div>
<div class="lp-check-banner ${status}">
📌 ${statusNote} 执行频率：${meta.interval || '—'}。
</div>
</div>`;
}

/**
 * Get the list of check items for each skill type.
 * Delegates to the central registry (lib/loop-registry.mjs).
 */
function getCheckItemsForSkill(/** @type {string} */ skill) {
  return getCheckItems(skill);
}
function buildActionPlan(/** @type {any[]} */ findings, /** @type {string} */ status) {
  if (!findings || findings.length === 0) return "";
  const failItems = findings.filter((/** @type {any} */ f) => f.level === 'fail');
  const warnItems = findings.filter((/** @type {any} */ f) => f.level === 'warn');
  const allActionItems = failItems.concat(warnItems);
  if (allActionItems.length === 0) return "";

  const steps = allActionItems.slice(0, 5).map((/** @type {any} */ f, /** @type {number} */ i) => {
    const priority = f.level === 'fail' ? 'P0' : 'P1';
    const tier = f.level === 'fail' ? 'fail' : 'warn';
    return `<div class="lp-step-row ${tier}">
<span class="lp-step-num">${i + 1}. ${priority}</span>
<div class="lp-step-body"><div class="lp-step-title">${f.title || f.message}</div>
<div class="lp-step-detail">${f.detail || ''}</div></div>
</div>`;
  }).join('');

  const urgencyNote = status === 'fail'
    ? '存在异常项，建议在 2 小时内启动修复，防止管线阻塞或数据丢失。'
    : '存在告警项，建议在 24 小时内评估并制定修复计划，避免升级为异常。';

  return `<div class="yry-card">
<h2>📋 行动计划 <span class="lp-section-sub">Action Plan</span></h2>
<div class="lp-step-wrap">${steps}</div>
<div class="lp-step-urgency">⏱️ ${urgencyNote}</div>
</div>`;
}

/**
 * Generate a self-loop HTML report with enhanced detail.
 */
export function generateReport({ skill, status, summary, details, findings } = /** @type {any} */ ({})) {
  const meta = SKILL_META[skill] || { icon: "🔄", label: skill, interval: "—", desc: "" };
  const ts = fmtDisplay(nowISO());
  const filename = `${skill}-${nowDate()}.html`;

  /** @type {Record<string, string>} */ const statusBadges = {
    pass: '<span class="yry-badge pass">✅ 通过</span>',
    warn: '<span class="yry-badge warn">⚠️ 告警</span>',
    fail: '<span class="yry-badge fail">🚫 异常</span>',
  };
  const statusBadge = statusBadges[status] || '<span class="yry-badge">—</span>';

  const findingsHtml = (findings || []).map((/** @type {any} */ f, /** @type {number} */ i) => {
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
    <a href="${CDN_DEPTH}docs/健康报告/" class="lp-inherit-link">
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
<link rel="stylesheet" href="${CDN_DEPTH}cdn/shared/index.css">
<link rel="stylesheet" href="${CDN_DEPTH}cdn/theme/index.css">
	<link rel="stylesheet" href="${CDN_DEPTH}cdn/shared-reports/index.css">
	<link rel="stylesheet" href="${CDN_DEPTH}cdn/loop-report/index.css">
</head>
<body>
<div class="yry-container lp-container">

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
  ${meta.desc ? `<div class="desc lp-desc">${meta.desc}</div>` : ""}
</div>

<div class="yry-stats">
  <div class="yry-stat">
    <div class="yry-val ${status}">${status === 'pass' ? '✓' : status === 'warn' ? '⚠' : '✗'}</div>
    <div class="yry-lbl">状态</div>
  </div>
  <div class="yry-stat">
    <div class="yry-val pass">${(findings || []).filter((/** @type {any} */ f) => f.level === 'info').length}</div>
    <div class="yry-lbl">信息</div>
  </div>
  <div class="yry-stat">
    <div class="yry-val warn">${(findings || []).filter((/** @type {any} */ f) => f.level === 'warn').length}</div>
    <div class="yry-lbl">告警</div>
  </div>
  <div class="yry-stat">
    <div class="yry-val fail">${(findings || []).filter((/** @type {any} */ f) => f.level === 'fail').length}</div>
    <div class="yry-lbl">异常</div>
  </div>
  ${healthStatHtml}
</div>

${summary ? `<div class="yry-summary">${summary}</div>` : ""}

${buildStatusSummary(skill, status, findings || [], meta)}

${findingsHtml ? `
<div class="yry-card">
  <h2>📋 检查详情</h2>
  ${findingsHtml}
</div>
` : ""}

${buildImpactAssessment(findings || [], status)}

${buildSeverityBreakdown(findings || [])}

${buildSkillHistoryCard(skill)}

${buildSLATrackingCard(skill, status)}

${details ? `
<div class="yry-card">
  <h2>📊 详细数据</h2>
  <pre class="lp-pre">${details}</pre>
</div>
` : ""}

${buildCrossReferenceCard(skill, status)}

${status !== 'pass' ? buildActionPlan(findings || [], status) : ""}

<div class="yry-footer">
  自循环报告 · ${skill} · ${ts}<br>
  <span class="lp-meta">由 rui-bot loop-report 自动生成</span>
</div>

</div>
<script src="${CDN_DEPTH}cdn/shared/index.js"></script>
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

function resolutionForFinding(/** @type {any} */ finding) {
  const title = (finding.title || finding.message || "").toLowerCase();
  const detail = (finding.detail || "").toLowerCase();
  const combined = title + " " + detail;

  if (combined.includes("不可达") || combined.includes("unreachable") || combined.includes("timeout") || combined.includes("fetch failed")) {
    return "检查网络连接和目标服务状态，验证 URL 配置是否正确；如为外部服务故障，等待恢复后系统将在下次轮询自动重试。若连续 3 次不可达，检查是否需要更新 API 端点或增加代理配置。";
  }
  if (combined.includes("空数据") || combined.includes("empty") || combined.includes("返回空") || combined.includes("返回 0")) {
    return "数据源页面结构可能已变更，需更新 HTML 解析选择器；检查目标页面是否改版，调整提取逻辑。建议对比最近一次成功抓取的原始响应，定位选择器变更点。";
  }
  if (combined.includes("失败") || combined.includes("error") || combined.includes("异常") || combined.includes("崩溃")) {
    return "查看详细错误日志定位根因；如为临时性故障，系统将在下次轮询自动重试。若为代码逻辑错误，检查最近一次部署变更，定位引入异常的 commit。";
  }
  if (combined.includes("高") || combined.includes("过高") || combined.includes("频繁") || combined.includes("激增")) {
    return "审查相关维度的当前配置和阈值，评估是否需要调整参数或增加资源分配。检查是否为正常业务增长，若是异常增长需排查是否存在配置错误或资源泄漏。";
  }
  if (combined.includes("低") || combined.includes("过低") || combined.includes("不足") || combined.includes("下降")) {
    return "识别瓶颈资源或缺失配置，制定改进计划并设定目标值。可参考健康报告中的改进建议，优先处理影响评分最大的维度。";
  }
  if (combined.includes("过时") || combined.includes("stale") || combined.includes("过期") || combined.includes("未更新") || combined.includes("不一致")) {
    return "触发对应的刷新或重生成流程；检查自动化调度是否正常，必要时手动触发更新。如为版本号不一致，运行 rui-version 检测并自动修复。";
  }
  if (combined.includes("安全") || combined.includes("security") || combined.includes("漏洞") || combined.includes("cve")) {
    return "立即评估风险等级（CVSS 评分），优先修复高危漏洞（CVSS≥7.0）；运行 npm audit fix 尝试自动修复，无法自动修复的手动更新依赖版本或应用安全补丁。";
  }
  if (combined.includes("配置") || combined.includes("config") || combined.includes("缺失") || combined.includes("不存在")) {
    return "补齐缺失的配置项，参考项目规约文档确保配置完整性；运行 rui-init 或手动创建配置文件，验证配置格式合规后重新运行检查。";
  }
  if (combined.includes("版本") || combined.includes("version") || combined.includes("plugin.json")) {
    return "运行 rui-version 自动检测并修复版本号不一致；检查 plugin.json、package.json、CHANGELOG.md、README.md 四个文件的版本号是否同步。";
  }
  if (combined.includes("webhook") || combined.includes("通知") || combined.includes("队列") || combined.includes("积压")) {
    return "检查 webhook URL 配置正确性和网络可达性；验证 API_X_TOKEN 环境变量是否有效；若队列积压超过 10 条，考虑增加重试间隔或排查 webhook 服务端限流策略。";
  }
  return null;
}

function buildImpactAssessment(/** @type {any[]} */ findings, /** @type {string} */ _status) {
  if (!findings || findings.length === 0) return "";
  const failCount = findings.filter((/** @type {any} */ f) => f.level === 'fail').length;
  const warnCount = findings.filter((/** @type {any} */ f) => f.level === 'warn').length;
  const infoCount = findings.filter((/** @type {any} */ f) => f.level === 'info').length;
  const severityLabel = failCount > 0 ? '需立即关注' : warnCount > 0 ? '需关注' : '正常';
  const severityTier = failCount > 0 ? 'high' : warnCount > 0 ? 'mid' : 'low';
  const topIssues = findings.filter((/** @type {any} */ f) => f.level === 'fail' || f.level === 'warn').slice(0, 5);
  const suggestion = failCount > 0
    ? '优先处理异常项，防止管线阻塞或数据丢失。建议在下一轮迭代中分配修复任务。'
    : warnCount > 0
    ? '计划性修复告警项，避免升级为异常。可在例行维护窗口处理。'
    : '继续监控，维持当前良好状态。';
  return `<div class="yry-card">
    <h2>🎯 影响评估 <span class="lp-section-sub">${failCount + warnCount} 项需关注</span></h2>
    <div class="yry-impact-header">
      <span class="yry-impact-badge severity-${severityTier}">${severityLabel}</span>
      <span class="yry-impact-summary">异常 ${failCount} · 告警 ${warnCount} · 信息 ${infoCount}</span>
    </div>
    ${topIssues.length > 0 ? `<div class="yry-impact-detail"><strong>关键问题:</strong><ul>${topIssues.map((/** @type {any} */ f) => `<li>${f.title || f.message}${f.detail ? `<br><span class="lp-top-issues-detail">${f.detail}</span>` : ''}</li>`).join('')}</ul></div>` : ''}
    <div class="lp-suggestion">📌 ${suggestion}</div>
  </div>`;
}

/**
 * Build a severity breakdown showing the distribution of findings by level
 * and the potential impact of each category.
 */
function buildSeverityBreakdown(/** @type {any[]} */ findings) {
  if (!findings || findings.length === 0) return "";

  /** @type {Record<string, any[]>} */ const byLevel = { fail: [], warn: [], info: [] };
  for (const f of findings) {
    (byLevel[f.level] || byLevel.info).push(f);
  }

  const levelConfig = {
    fail: { icon: "🚫", label: "异常 (Fail)", desc: "需要立即处理的严重问题，可能导致管线阻塞、数据丢失或安全风险" },
    warn: { icon: "⚠️", label: "告警 (Warn)", desc: "需要关注但非紧急的问题，建议在下一维护窗口处理" },
    info: { icon: "ℹ️", label: "信息 (Info)", desc: "正常运行信息，无需处理，用于状态追踪和审计" },
  };

  let html = '<div class="yry-card"><h2>📊 严重程度分布 <span class="lp-section-sub">Severity Breakdown</span></h2>';

  for (const [level, config] of Object.entries(levelConfig)) {
    const items = byLevel[level] || [];
    if (items.length === 0) continue;
    const pct = Math.round((items.length / findings.length) * 100);
    html += `<div class="lp-sev-block ${level}">
      <div class="lp-sev-head">
        <span class="lp-sev-label">${config.icon} ${config.label}</span>
        <span class="lp-sev-count">${items.length} 项 (${pct}%)</span>
      </div>
      <div class="lp-sev-desc">${config.desc}</div>
      <div class="lp-sev-list">
        ${items.slice(0, 3).map((/** @type {any} */ f) => `<div class="lp-sev-item">• ${f.title || f.message}</div>`).join("")}
        ${items.length > 3 ? `<div class="lp-sev-more">... 还有 ${items.length - 3} 项</div>` : ""}
      </div>
    </div>`;
  }

  html += '</div>';
  return html;
}

/**
 * Build SLA tracking card showing response time expectations
 * and historical resolution patterns for the skill.
 */
function buildSLATrackingCard(/** @type {string} */ skill, /** @type {string} */ status) {
  const meta = SKILL_META[skill] || { interval: "—" };

  /** @type {Record<string, {target: string, threshold: string, escalation: string}>} */ const slaConfig = {
    fail: { target: "2 小时", threshold: "4 小时", escalation: "8 小时" },
    warn: { target: "24 小时", threshold: "3 天", escalation: "7 天" },
    pass: { target: "N/A", threshold: "N/A", escalation: "N/A" },
  };
  const sla = slaConfig[status] || slaConfig.pass;

  if (status === "pass") {
    return `<div class="yry-card">
      <h2>⏱️ SLA 追踪 <span class="lp-section-sub">Service Level Agreement</span></h2>
      <div class="lp-sla-ok">✅ 当前状态正常，无 SLA 计时器启动</div>
    </div>`;
  }

  return `<div class="yry-card">
    <h2>⏱️ SLA 追踪 <span class="lp-section-sub">Service Level Agreement</span></h2>
    <div class="lp-sla-grid">
      <div class="lp-sla-cell target">
        <div class="lp-sla-cell-label">🎯 目标响应</div>
        <div class="lp-sla-cell-val target">${sla.target}</div>
      </div>
      <div class="lp-sla-cell threshold">
        <div class="lp-sla-cell-label">⚠️ 升级阈值</div>
        <div class="lp-sla-cell-val threshold">${sla.threshold}</div>
      </div>
      <div class="lp-sla-cell escalation">
        <div class="lp-sla-cell-label">🚨 强制升级</div>
        <div class="lp-sla-cell-val escalation">${sla.escalation}</div>
      </div>
    </div>
    <div class="lp-sla-foot">
      📌 执行频率: ${meta.interval} · 下次自动检查时将更新状态 · 若状态持续异常，SLA 计时器将继续累计
    </div>
  </div>`;
}

function buildSkillHistoryCard(/** @type {string} */ skill) {
  try {
    if (!existsSync(REPORT_DIR)) return "";
    const files = readdirSync(REPORT_DIR)
      .filter((/** @type {any} */ f) => f.startsWith(skill + '-') && f.endsWith('.html'))
      .sort().reverse();
    if (files.length < 2) {
      return `<div class="yry-card">
        <h2>📈 历史趋势</h2>
        <div class="lp-sla-empty">仅 1 份报告 — 积累更多数据后启用趋势对比</div>
      </div>`;
    }
    const recent = files.slice(0, 10);
    const dots = recent.map((/** @type {any} */ f, /** @type {number} */ i) => {
      const dm = f.match(/(\d{4}-\d{2}-\d{2})/);
      const date = dm ? dm[1] : '';
      const isLatest = i === 0;
      return `<span class="yry-hist-dot${isLatest ? ' latest' : ''}" title="${date}"></span>`;
    }).join('');
    return `<div class="yry-card">
      <h2>📈 历史趋势 <span class="lp-section-sub">最近 ${Math.min(files.length, 10)} 次执行</span></h2>
      <div class="yry-hist-row">
        <span class="yry-hist-edge">最早</span>
        <div class="yry-hist-dots">${dots}</div>
        <span class="yry-hist-edge">最新</span>
      </div>
      <div class="yry-hist-foot">
        <span class="yry-hist-foot-l">共 ${files.length} 份历史报告</span>
        <span class="yry-hist-foot-r">执行频率: ${SKILL_META[skill]?.interval || '—'}</span>
      </div>
    </div>`;
  } catch { return ""; }
}

function buildCrossReferenceCard(/** @type {string} */ skill, /** @type {string} */ status) {
  const ref = getCrossRef(skill);
  if (!ref) return "";
  const statusIcon = status === 'pass' ? '✓' : status === 'warn' ? '⚠' : '✗';
  const statusTier = status === 'pass' ? 'pass' : status === 'warn' ? 'warn' : 'fail';
  return `<div class="yry-card">
    <h2>🔗 关联分析 <span class="lp-section-sub">对项目健康的影响</span></h2>
    <div class="yry-cross-row">
      <div class="yry-cross-item">
        <div class="yry-cross-label">关联诊断维度</div>
        <div class="yry-cross-desc">${ref.dim}</div>
      </div>
      <div class="yry-cross-item">
        <div class="yry-cross-label">影响机制</div>
        <div class="yry-cross-desc">${ref.desc}</div>
      </div>
      <div class="yry-cross-badge">
        <div class="yry-cross-cur-label">当前状态</div>
        <div class="yry-cross-cur-val ${statusTier}">${statusIcon} ${status === 'pass' ? '正常' : status === 'warn' ? '告警' : '异常'}</div>
      </div>
    </div>
    ${ref.impact ? `<div class="yry-cross-impact"><strong>📊 升级策略：</strong>${ref.impact}</div>` : ""}
  </div>`;
}

/**
 * Generate reports.json manifest for the self-loop report index page.
 * Scans all HTML report files and writes metadata as JSON.
 */
export function generateManifest() {
  if (!existsSync(REPORT_DIR)) return;

  const files = readdirSync(REPORT_DIR)
    .filter((/** @type {any} */ f) => f.endsWith(".html") && f !== "index.html")
    .sort()
    .reverse();

  function parseLoopFilename(/** @type {string} */ name) {
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

  writeJson(join(REPORT_DIR, "reports.json"), reports);
}

/**
 * Generate an index page for all loop reports — dynamic client-side version.
 * Reads reports.json at page load for live data.
 */
export function generateIndex() {
  if (!existsSync(REPORT_DIR)) return;

  const files = readdirSync(REPORT_DIR)
    .filter((/** @type {any} */ f) => f.endsWith(".html") && f !== "index.html")
    .sort()
    .reverse();

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>自循环报告索引</title>
<link rel="stylesheet" href="../../cdn/shared/index.css">
<link rel="stylesheet" href="../../cdn/theme/index.css">
	<link rel="stylesheet" href="../../cdn/shared-reports/index.css">
	<link rel="stylesheet" href="../../cdn/loop-report/index.css">
</head>
<body>
<div class="yry-container lp-container">
<nav class="yry-bc">
  <a href="../../docs/index.html">📄 文档中心</a>
  <span class="yry-bc-sep">/</span>
  <span class="yry-bc-cur">🔄 自循环报告</span>
</nav>
<div class="yry-header">
  <h1>🔄 自循环报告</h1>
  <div class="desc">20 技能定期巡检，由 Cron 定时触发，报告自动生成并推送企微通知。覆盖趋势监控、代码健康、文档同步、故事轮询、配置检查、依赖审计、自改进闭环等全维度。</div>
  <div class="meta">${files.length} 份报告</div>
</div>
<div class="yry-intro">
  <strong>工作原理</strong>：Cron 定时任务按预设间隔触发技能执行 → 每轮执行生成自循环报告 HTML → <code>rui-bot loop-report</code> 汇总并推送企微通知 → 关联维度数据输入 D0-D8 诊断引擎。<br>
  <strong>报告位置</strong>：<code>docs/自循环报告/</code> · <strong>生成工具</strong>：<code>node skills/rui-bot/lib/loop-report.mjs</code> · <strong>通知渠道</strong>：企业微信 Webhook
</div>
<div class="yry-card">
  <h2>📋 报告列表</h2>
  <table>
    <thead><tr><th>技能模块</th><th>日期</th><th>新鲜度</th><th>状态</th><th>摘要</th><th>操作</th></tr></thead>
    <tbody id="tbody"></tbody>
  </table>
</div>
<div class="yry-links">
  <a class="yry-link" href="../../skills/rui-bot/SKILL.md" target="_blank">📋 rui-bot 规约</a>
  <a class="yry-link" href="../趋势报告/index.html">📡 趋势报告</a>
  <a class="yry-link" href="../index.html">📄 文档中心</a>
</div>
<div class="yry-footer">
  由 rui-bot loop-report 自动生成 · 数据实时读取<br>
  <span class="lp-meta">20 技能 · 定时巡检 · 企微通知</span>
</div>
</div>
<script>
(async function() {
  const tbody = document.getElementById('tbody');
  try {
    const resp = await fetch('reports.json');
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const reports = await resp.json();
    if (reports.length === 0) {
      tbody.appendChild(buildEmptyRow());
      return;
    }
    const badgeMap = { pass: '✅ 通过', warn: '⚠️ 告警', fail: '🚫 异常' };
    reports.forEach((r) => {
      tbody.appendChild(buildReportRow(r, badgeMap));
    });
  } catch(e) {
    tbody.appendChild(buildEmptyRow());
  }

  function buildEmptyRow() {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    const div = document.createElement('div');
    div.className = 'yry-empty';
    div.textContent = '\u6682\u65e0\u81ea\u5faa\u73af\u62a5\u544a';
    div.appendChild(document.createElement('br'));
    const span = document.createElement('span');
    span.style.cssText = 'font-size:.7rem;margin-top:8px;display:block';
    const code = document.createElement('code');
    code.textContent = 'node skills/rui-bot/lib/loop-report.mjs --skill=<name> --status=<pass|warn|fail> \u751f\u6210\u9996\u4efd\u62a5\u544a';
    span.appendChild(code);
    div.appendChild(span);
    td.appendChild(div);
    tr.appendChild(td);
    return tr;
  }

  function buildReportRow(r, badgeMap) {
    const tr = document.createElement('tr');
    const status = r.status || 'pass';

    const tdSkill = document.createElement('td');
    const aSkill = document.createElement('a');
    aSkill.href = r.file || '#';
    aSkill.textContent = (r.icon || '\ud83d\udd04') + ' ' + (r.skillLabel || r.skill);
    tdSkill.appendChild(aSkill);
    tr.appendChild(tdSkill);

    const tdDate = document.createElement('td');
    tdDate.textContent = r.date;
    tr.appendChild(tdDate);

    const tdFresh = document.createElement('td');
    const freshInfo = computeFreshness(r.skill, r.date);
    const freshBadge = document.createElement('span');
    freshBadge.className = 'yry-badge ' + freshInfo.level;
    freshBadge.textContent = freshInfo.label;
    freshBadge.style.fontSize = '.72rem';
    freshBadge.style.padding = '2px 8px';
    tdFresh.appendChild(freshBadge);
    tr.appendChild(tdFresh);

    const tdStatus = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = 'yry-badge ' + status;
    badge.textContent = badgeMap[status] || status;
    tdStatus.appendChild(badge);
    tr.appendChild(tdStatus);

    const tdSummary = document.createElement('td');
    tdSummary.style.cssText = 'font-size:.82rem;color:var(--yry-text-secondary)';
    tdSummary.textContent = r.summary || '\u2014';
    tr.appendChild(tdSummary);

    const tdAction = document.createElement('td');
    const aAction = document.createElement('a');
    aAction.href = r.file || '#';
    aAction.textContent = '\u67e5\u770b';
    tdAction.appendChild(aAction);
    tr.appendChild(tdAction);

    return tr;
  }

  // Freshness: compare report age vs skill's expected interval.
  // Uses a simple lookup (mirrors lib/loop/registry.mjs cron intervals).
  const SKILL_INTERVAL_DAYS = {
    'rui-trends': 7, 'rui-analysis': 4, 'rui-import': 0.5, 'rui-story': 0.5,
    'rui-claude': 1, 'rui-bot': 0.5, 'rui-npm': 7, 'rui-html': 0.5,
    'rui-doc': 1, 'rui-version': 7, 'rui-plan': 1, 'rui-bundle-analyze': 7,
    'rui-code': 1, 'rui-health': 0.5, 'rui-init': 30, 'rui-update': 4,
    'rui-skills': 7, 'rui-reporter': 4, 'self-improve': 7, 'rui-yry': 7,
    'rui-config': 1
  };
  function computeFreshness(skill, dateStr) {
    const intervalDays = SKILL_INTERVAL_DAYS[skill] || 7;
    const ageDays = (Date.now() - new Date(dateStr).getTime()) / 86400000;
    if (ageDays <= intervalDays) return { level: 'pass', label: '新鲜' };
    if (ageDays <= intervalDays * 2) return { level: 'warn', label: '过期 ' + Math.floor(ageDays) + 'd' };
    return { level: 'fail', label: '陈旧 ' + Math.floor(ageDays) + 'd' };
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
export async function notifyReport({ skill, status, filename, summary, findings } = /** @type {any} */ ({})) {
  const meta = SKILL_META[skill] || { icon: "🔄", label: skill };
  /** @type {Record<string, string>} */ const statusEmojiMap = { pass: "✅", warn: "⚠️", fail: "🚫" };
  const statusEmoji = statusEmojiMap[status] || "📋";
  /** @type {Record<string, string>} */ const statusLabelMap = { pass: "通过", warn: "告警", fail: "异常" };
  const statusLabel = statusLabelMap[status] || status;

  // Build findings summary (max 3 items)
  const topFindings = (findings || []).slice(0, 3);
  const findingsText = topFindings.length > 0
    ? topFindings.map((/** @type {any} */ f, /** @type {number} */ i) => `${i + 1}. ${f.level === "fail" ? "❌" : f.level === "warn" ? "⚠️" : "ℹ️"} ${f.title || f.message}`).join("\n")
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
    `时间: ${fmtDisplay(nowISO())}`,
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
  const args = process.argv.slice(NODE_ARGV_OFFSET);
  /** @type {any} */ const opts = { skill: "", status: "", summary: "", details: "", findings: [] };

  for (const arg of args) {
    const eq = arg.indexOf("=");
    if (eq === -1) continue;
    const key = arg.slice(2, eq);
    const val = arg.slice(eq + 1);
    if (key === "findings") {
      try { opts.findings = JSON.parse(val); } catch { /* invalid JSON, skip */ }
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

const _isMain = isMain(import.meta.url);
if (_isMain) {
  main();
}
