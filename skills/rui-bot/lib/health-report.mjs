/**
 * health-report — Comprehensive health report HTML generator.
 * Generates styled HTML reports in docs/健康报告/ with full D0-D7 diagnostics.
 *
 * Usage:
 *   import { generateHealthReport, generateHealthIndex } from './health-report.mjs';
 *   const { filePath } = generateHealthReport(healthResult);
 *   generateHealthIndex();
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  REPORT_DIR, CDN_DEPTH, DIM_LABELS, DIM_WEIGHTS, GRADE_STYLE,
} from "./report-constants.mjs";

import {
  nowISO, nowDate, getPreviousScore, getHealthTrend,
  buildGradeSparkline, getDimensionHistory, dimTrendIcon,
  listReportFiles, pickLatestReportsByDate, removeReportsForDate,
} from "./report-trend.mjs";

import {
  buildScoreTrend, buildSummaryCard, buildScoreBreakdown,
  buildRecommendationsSection, buildComponentSections,
  buildStructureSection, buildGitSecuritySection,
} from "./report-sections.mjs";

export function generateHealthReport(hr) {
  const ts = nowISO();
  const reportDate = nowDate();
  const filename = `health-${reportDate}.html`;
  const gradeInfo = GRADE_STYLE[hr.grade] || GRADE_STYLE.D;

  const prev = getPreviousScore();
  const healthTrend = getHealthTrend();
  let trendHtml = "";
  if (prev) {
    const diff = hr.composite - prev.score;
    const trendIcon = diff > 3 ? "📈" : diff < -3 ? "📉" : "📊";
    const trendLabel = diff > 3 ? `提升 ${diff} 分` : diff < -3 ? `下降 ${Math.abs(diff)} 分` : "持平";
    const trendColor = diff > 3 ? "var(--yry-pass)" : diff < -3 ? "var(--yry-fail)" : "var(--yry-text2)";
    trendHtml = `<div class="h-hero-stat"><span class="h-hs-icon">${trendIcon}</span> 对比上次 (${prev.date}): <span class="h-hs-val" style="color:${trendColor}">${trendLabel}</span></div>`;
  }

  const compScores = hr.compScores;

  const recommendations = [];
  if (hr.diagnostics?.triggered?.length > 0) {
    for (const d of hr.diagnostics.triggered) {
      if (d.suggestion) recommendations.push({ source: `${d.id} ${d.label}`, text: d.suggestion, priority: "high" });
    }
  }
  const lowDimRecs = {
    config: "创建 .claude/skills/rui-bot/config.json 配置文件，定义机器人和通知开关",
    robots: "在 config.json 中配置至少一个机器人的 webhook_url",
    api: "检查 API_X_TOKEN 环境变量和 API 服务可达性",
    reports: "运行自循环巡检生成报告，或手动创建 docs/自循环报告/index.html",
    git: "提交并推送未提交的更改，保持工作区干净",
  };
  for (const [dim, label] of Object.entries(DIM_LABELS)) {
    const s = hr.scores[dim];
    if (s !== undefined && s < 60 && !recommendations.some((r) => r.source.includes(label))) {
      const rec = lowDimRecs[dim];
      if (rec) recommendations.push({ source: label, text: rec, priority: "medium" });
    }
  }
  if (compScores) {
    const allComps = [...(compScores.skills||[]), ...(compScores.agents||[]), ...(compScores.rules||[]), ...(compScores.scripts||[])];
    for (const c of allComps) {
      if (c.score < 60 && c.recommendations?.length > 0) {
        recommendations.push({
          source: `组件: ${c.name} (${c.score}分)`,
          text: c.recommendations[0],
          priority: c.score < 40 ? "high" : "medium",
        });
      }
    }
  }

  const gradeSparkline = buildGradeSparkline(healthTrend);

  const prevTriggeredIds = new Set();
  const prevScores = {};
  if (healthTrend.length >= 2) {
    const prevEntry = healthTrend[healthTrend.length - 2];
    for (const id of (prevEntry.triggeredDiags || [])) prevTriggeredIds.add(id);
    if (prevEntry.scores) Object.assign(prevScores, prevEntry.scores);
  }

  const dimCount = Object.keys(DIM_LABELS).length;
  let dimPass = 0, dimWarn = 0, dimFail = 0;
  for (const s of Object.values(hr.scores || {})) {
    if (s >= 80) dimPass++;
    else if (s >= 60) dimWarn++;
    else dimFail++;
  }
  const dimHistory = getDimensionHistory();

  const opsDims = ["token", "config", "robots", "api", "reports", "format", "diagnostics", "git", "security", "comp_qual"];
  const emDims = ["em_testing", "em_types", "em_linting", "em_cicd", "em_docs", "em_deps", "em_git"];
  const hasEmDims = emDims.some((d) => hr.scores[d] !== undefined);

  const DIM_ICONS_LOCAL = {
    token: "🔑", config: "⚙️", robots: "🤖", api: "🌐", reports: "📊",
    format: "📋", diagnostics: "🔬", git: "📦", security: "🛡️",
    em_testing: "🧪", em_types: "🛡️", em_linting: "📏", em_cicd: "🔄",
    em_docs: "📚", em_deps: "📦", em_git: "🌿", comp_qual: "📦",
  };

  function buildDimCard(dim, label) {
    const score = hr.scores[dim] ?? 0;
    const icon = DIM_ICONS_LOCAL[dim] || "\u{1F4CC}";
    const weight = DIM_WEIGHTS[dim] || 0;
    const barColor = score >= 80 ? "var(--yry-pass)" : score >= 60 ? "var(--yry-warn)" : "var(--yry-fail)";
    const barColorRaw = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
    const statusTier = score >= 80 ? "pass" : score >= 60 ? "warn" : "fail";
    const trend = dimTrendIcon(label, score, dimHistory);
    const prevScore = prevScores[dim];
    const contribution = Math.round(score * weight / 100);
    const delta = prevScore !== undefined ? score - prevScore : null;
    const deltaIcon = delta !== null ? (delta > 0 ? "↑" : delta < 0 ? "↓" : "→") : "";
    const deltaCls = delta !== null ? (delta > 0 ? "up" : delta < 0 ? "down" : "flat") : "";

    return `<div class="h-dim-card ${statusTier}" style="--dc-color:${barColorRaw}">
      <div class="h-dim-top">
        <span class="h-dim-icon">${icon}</span>
        <span class="h-dim-label">${label}</span>
        ${delta !== null && delta < -5 ? '<span class="h-dim-warn-chip">⚡ 恶化</span>' : ''}
        ${trend}
        <span class="h-dim-score" style="color:${barColor}">${score}<span class="h-dim-score-sm">分</span></span>
        ${delta !== null ? `<span class="h-dim-delta-badge ${deltaCls}">${deltaIcon}${Math.abs(delta)}</span>` : ''}
      </div>
      <div class="h-dim-bar-row">
        <div class="h-dim-bar"><div class="h-dim-bar-fill" style="width:${score}%;background:${barColor}"></div></div>
      </div>
      <div class="h-dim-foot">
        <span class="h-dim-chip ${statusTier}">${score >= 80 ? '优秀' : score >= 60 ? '一般' : '告警'}</span>
        <span class="h-dim-note">权重 ${weight}%</span>
        <span class="h-dim-note">贡献 ${contribution} 分</span>
        ${prevScore !== undefined ? `<span class="h-dim-note">上次 ${prevScore} 分</span>` : ''}
      </div>
    </div>`;
  }

  const opsCards = opsDims.map((dim) => buildDimCard(dim, DIM_LABELS[dim])).join("\n");
  let emCardsHtml = "";
  if (hasEmDims) {
    emCardsHtml = `
    <div class="h-section">
      <h2>🏗️ 工程化成熟度 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">rui-init §7</span></h2>
      <div class="h-dim-grid">${emDims.map((dim) => buildDimCard(dim, DIM_LABELS[dim])).join("\n")}</div>
    </div>`;
  }

  const dimCardsHtml = opsCards;

  let diagSection = "";
  if (hr.diagnostics && !hr.diagnostics.skip) {
    const allDiags = hr.diagnostics.diagnostics || [];
    const currentTriggeredIds = new Set((hr.diagnostics.triggered || []).map((d) => d.id));
    const diagRows = allDiags.map((d) => {
      const icon = d.triggered ? "⚠️" : "✅";
      const rowClass = d.triggered ? "h-diag-row triggered" : "h-diag-row ok";
      const isNew = d.triggered && currentTriggeredIds.has(d.id) && !prevTriggeredIds.has(d.id);
      const newBadge = isNew ? '<span class="h-new-badge">⚡ 新增</span>' : "";
      const evidence = d.triggered ? `<div class="h-diag-evidence">📎 ${d.evidence}</div>` : "";
      const suggestion = d.triggered ? `<div class="h-diag-suggestion">💡 ${d.suggestion}</div>` : "";
      return `<div class="${rowClass}">
        <div class="h-diag-head">
          <span class="h-diag-id">${icon} ${d.id}</span>
          <span class="h-diag-label">${d.label}</span>
          ${newBadge}
          ${d.triggered ? `<span class="h-diag-confidence">置信度: ${d.confidence}</span>` : ""}
        </div>
        ${evidence}${suggestion}
      </div>`;
    }).join("\n");

    const passedCount = allDiags.filter((d) => !d.triggered).length;
    const totalCount = allDiags.length || 8;

    const bootBadge = hr.diagnostics?.bootstrapped
      ? '<span class="h-boot-badge" title="诊断信号从 Git 历史和项目数据推导，非精确执行记忆">⚡ Git 引导</span>'
      : "";

    diagSection = `
    <div class="h-section">
      <h2>🔬 D0-D7 诊断详情 ${bootBadge}<span class="h-diag-summary">${passedCount}/${totalCount} 通过</span></h2>
      <div class="h-diag-list">${diagRows || '<div class="h-diag-empty">暂无诊断数据 — 需积累执行记忆后触发诊断</div>'}</div>
    </div>`;
  } else {
    diagSection = `
    <div class="h-section">
      <h2>🔬 D0-D7 诊断</h2>
      <div class="h-placeholder">${hr.diagnostics?.summary || "诊断数据不足 — 需积累 ≥1 条执行记忆"}</div>
    </div>`;
  }

  const detailItems = (hr.details || []).map((d) => {
    const icon = d.status === "pass" ? "✅" : d.status === "warn" ? "⚠️" : d.status === "fail" ? "❌" : "⏭️";
    return `<div class="h-detail-item">
      <span class="h-detail-icon">${icon}</span>
      <span class="h-detail-text">${d.detail}</span>
    </div>`;
  }).join("\n");

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>健康报告 · ${nowDate()}</title>
<link rel="stylesheet" href="${CDN_DEPTH}cdn/shared.css">
<link rel="stylesheet" href="${CDN_DEPTH}cdn/theme.css">
<style>.h-crit{color:var(--yry-fail);font-weight:700}.h-trend{font-size:.64rem;margin-left:4px}.h-trend.up{color:var(--yry-pass)}.h-trend.down{color:var(--yry-fail)}.h-trend.stable{color:var(--yry-text3)}.h-new-badge{display:inline-block;padding:1px 8px;border-radius:8px;font-size:.65rem;font-weight:700;background:rgba(239,68,68,.15);color:var(--yry-fail);margin-left:4px}</style>
</head>
<body>
<div class="h-container">

<nav class="h-bc">
  <a href="${CDN_DEPTH}docs/index.html">📄 文档中心</a>
  <span class="h-bc-sep">/</span>
  <a href="${CDN_DEPTH}docs/健康报告/">🩺 健康报告</a>
  <span class="h-bc-sep">/</span>
  <span class="h-bc-cur">${nowDate()}</span>
</nav>

<div class="h-header">
  <h1>🩺 项目健康报告</h1>
  <div class="h-date">${ts} · 综合评估</div>
</div>

<div class="h-hero">
  <div class="h-score-ring" style="border-color:${gradeInfo.color};background:${gradeInfo.bg}">
    <div class="h-score-num" style="color:${gradeInfo.color}">${hr.composite}</div>
    <div class="h-score-grade" style="color:${gradeInfo.color}">${hr.grade} 级</div>
    <div class="h-score-label">综合健康度</div>
  </div>
  <div class="h-hero-stats">
    <div class="h-hero-stat"><span class="h-hs-icon">🔬</span> D0-D7: <span class="h-hs-val">${hr.diagnostics?.triggered?.length ?? "—"}/8 触发</span></div>
    <div class="h-hero-stat"><span class="h-hs-icon">📊</span> 评分维度: <span class="h-hs-val">${dimCount} 项</span></div>
    <div class="h-hero-stat"><span class="h-hs-icon">📋</span> 执行记忆: <span class="h-hs-val">${hr.diagnostics?.execCount ?? 0} 条</span></div>
    <div class="h-hero-stat"><span class="h-hs-icon">🤖</span> 机器人: <span class="h-hs-val">${hr.robotOkCount ?? 0}/${(hr.robotNames || []).length || 0} 就绪</span></div>
    ${trendHtml}
  </div>
  ${gradeSparkline ? `<div style="text-align:center;margin-bottom:8px">${gradeSparkline}</div>` : ""}
</div>

<div class="h-tabs">
  <div class="h-tab on" data-panel="overview">📊 概览</div>
  <div class="h-tab" data-panel="scores">📈 评分<span class="h-tab-badge ${dimFail > 0 ? 'fail' : dimWarn > 0 ? 'warn' : ''}">${dimPass}/${dimPass+dimWarn+dimFail}</span></div>
  <div class="h-tab" data-panel="components">📦 组件<span class="h-tab-badge">${compScores ? compScores.skills.length + compScores.agents.length + compScores.rules.length + compScores.scripts.length : 0}</span></div>
  <div class="h-tab" data-panel="diagnostics">🔬 诊断<span class="h-tab-badge ${(hr.diagnostics?.triggered?.length ?? 0) > 0 ? 'warn' : ''}">${hr.diagnostics?.triggered?.length ?? 0}/8</span></div>
  <div class="h-tab" data-panel="actions">💡 行动<span class="h-tab-badge">${recommendations.length}</span></div>
</div>

<div class="h-panel on" id="overview">
  ${buildSummaryCard(hr, prev, recommendations)}
  ${buildStructureSection(hr)}
  ${buildScoreBreakdown(hr)}
  ${buildScoreTrend(healthTrend)}
  <div class="h-section">
    <h2>🔗 相关资源</h2>
    <div class="h-links">
      <a class="h-link" href="${CDN_DEPTH}docs/自循环报告/">📊 自循环报告</a>
      <a class="h-link" href="${CDN_DEPTH}docs/故事任务面板/">📋 故事任务面板</a>
      <a class="h-link" href="${CDN_DEPTH}docs/index.html">📄 文档中心</a>
      <a class="h-link" href="${CDN_DEPTH}docs/健康报告/">📈 历史报告</a>
    </div>
  </div>
</div>

<div class="h-panel" id="scores">
  <div class="h-section">
    <h2>📊 运维健康评分</h2>
    <div class="h-dim-grid">${dimCardsHtml}</div>
  </div>
  ${emCardsHtml}
  <div class="h-section">
    <h2>📋 检查详情</h2>
    <div class="h-detail-list">${detailItems}</div>
  </div>
</div>

<div class="h-panel" id="components">
  ${buildComponentSections(compScores)}
</div>

<div class="h-panel" id="diagnostics">
  ${diagSection}
</div>

<div class="h-panel" id="actions">
  ${recommendations.length > 0 ? buildRecommendationsSection(recommendations) : '<div class="h-section"><h2>💡 改进建议</h2><div class="h-placeholder">暂无建议 — 所有维度均处于健康状态</div></div>'}
  ${buildGitSecuritySection(hr)}
</div>

<div class="h-footer">
  健康报告 · ${ts}<br>
  <span style="color:var(--yry-text3)">由 rui-bot health 自动生成 · </span>
  <a href="${CDN_DEPTH}docs/健康报告/">查看历史</a>
</div>

</div>
<script src="${CDN_DEPTH}cdn/shared.js"></script>
<script>
document.querySelectorAll('.h-tab').forEach(function(t) {
  t.addEventListener('click', function() {
    document.querySelectorAll('.h-tab').forEach(function(x) { x.classList.remove('on'); });
    document.querySelectorAll('.h-panel').forEach(function(p) { p.classList.remove('on'); });
    this.classList.add('on');
    document.getElementById(this.dataset.panel).classList.add('on');
  });
});
</script>
</body>
</html>`;

  if (!existsSync(REPORT_DIR)) {
    mkdirSync(REPORT_DIR, { recursive: true });
  }

  removeReportsForDate(reportDate, filename);
  const filePath = join(REPORT_DIR, filename);
  let lines = html.replace(/<!--.*?-->/gs, '').split('\n').map(l => l.trim()).filter(l => l);
  const merged = [];
  for (const line of lines) {
    const prev = merged[merged.length - 1];
    if (prev && line.length < 80 && prev.length < 120 && (prev + line).length < 200) {
      merged[merged.length - 1] = prev + line;
    } else {
      merged.push(line);
    }
  }
  const compactHtml = merged.join('\n');
  writeFileSync(filePath, compactHtml, "utf-8");

  return { filePath, filename };
}

export function generateHealthIndex() {
  if (!existsSync(REPORT_DIR)) {
    mkdirSync(REPORT_DIR, { recursive: true });
  }

  const files = pickLatestReportsByDate(listReportFiles());

  const reports = [];
  for (const report of files) {
    let score = null, grade = null, triggers = null, dimTotal = null;
    try {
      const content = readFileSync(join(REPORT_DIR, report.file), "utf-8");
      const sm = content.match(/h-score-num[^>]*>(\d+)</);
      const gm = content.match(/h-score-grade[^>]*>([ABCD]) 级</);
      const tm = content.match(/D0-D7:\s*<span[^>]*>(\d+)\/8/);
      const dm = content.match(/评分维度:\s*<span[^>]*>(\d+)\s*项/);
      if (sm) score = parseInt(sm[1], 10);
      if (gm) grade = gm[1];
      if (tm) triggers = parseInt(tm[1], 10);
      if (dm) dimTotal = parseInt(dm[1], 10);
    } catch { /* skip */ }
    reports.push({ file: report.file, date: report.date, time: report.time, score, grade, triggers, dimTotal });
  }

  writeFileSync(join(REPORT_DIR, "reports.json"), JSON.stringify(reports), "utf-8");

  const reportCount = files.length;
  const latestReport = reports[0] || null;

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>健康报告索引</title>
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
.c { max-width: 800px; margin: 0 auto; padding: 48px 24px 80px; }
.bc { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 24px; font-size: .76rem; }
.bc a { color: #22d3ee; text-decoration: none; } .bc a:hover { color: var(--yry-accent); }
.bc .sep { color: var(--yry-text3); opacity: .4; } .bc .cur { color: var(--yry-text2); }
.hd { text-align: center; margin-bottom: 32px; }
.hd h1 { font-size: 1.6rem; }
.hd .desc { color: var(--yry-text2); font-size: .84rem; margin-top: 8px; line-height: 1.6; max-width: 600px; margin-left: auto; margin-right: auto; }
.hd .meta { color: var(--yry-text3); font-size: .82rem; margin-top: 6px; }
.h-intro { padding: 16px; border-left: 3px solid var(--yry-accent); background: rgba(255,193,7,.04); border-radius: 0 var(--yry-radius) var(--yry-radius) 0; margin-bottom: 20px; color: var(--yry-text2); font-size: .84rem; line-height: 1.7; }
.h-intro strong { color: var(--yry-accent); }
.h-intro code { background: rgba(59,130,246,.1); padding: 1px 6px; border-radius: 4px; font-size: .82em; color: #22d3ee; }
.h-stats { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
.h-stat { background: var(--yry-bg-card); border: var(--yry-border); border-radius: var(--yry-radius); padding: 16px 20px; text-align: center; box-shadow: var(--yry-shadow); flex: 1; min-width: 90px; cursor: default; }
.h-stat .h-val { font-size: 1.4rem; font-weight: 700; }
.h-stat .h-val.pass { color: var(--yry-pass); }
.h-stat .h-val.warn { color: var(--yry-warn); }
.h-stat .h-val.fail { color: var(--yry-fail); }
.h-stat .h-val.info { color: #22d3ee; }
.h-stat .h-lbl { font-size: .68rem; color: var(--yry-text3); margin-top: 4px; }
.latest { text-align: center; padding: 16px 16px 12px; margin-bottom: 20px; background: rgba(255,193,7,.05); border-radius: 10px; border: var(--yry-border); }
.latest .score { font-size: 2rem; font-weight: 800; color: var(--yry-accent); }
.latest .grade { font-size: 1.1rem; font-weight: 700; margin-left: 8px; }
.latest .date { display: block; font-size: .72rem; color: var(--yry-text3); margin-top: 4px; }
.latest .meta-row { font-size: .68rem; color: var(--yry-text3); margin-top: 6px; }
.card { background: var(--yry-bg-card); border: var(--yry-border); border-radius: var(--yry-radius); padding: 24px; box-shadow: var(--yry-shadow); margin-bottom: 20px; }
.card h2 { font-size: 1.1rem; margin-bottom: 12px; color: var(--yry-accent); }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 10px 16px; text-align: left; border-bottom: var(--yry-border); font-size: .88rem; }
th { color: var(--yry-text3); font-size: .76rem; text-transform: uppercase; }
td a { color: #22d3ee; text-decoration: none; } td a:hover { color: var(--yry-accent); }
td .s { font-weight: 700; font-size: .82rem; } td .s.A, td .s.B { color: var(--yry-pass); } td .s.C { color: #f59e0b; } td .s.D { color: var(--yry-fail); }
.yry-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: .72rem; font-weight: 600; }
.yry-badge.A, .yry-badge.B { background: rgba(34,197,94,.15); color: var(--yry-pass); }
.yry-badge.C { background: rgba(245,158,11,.15); color: var(--yry-warn); }
.yry-badge.D { background: rgba(239,68,68,.15); color: var(--yry-fail); }
.links { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px; justify-content: center; }
.links a { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; background: rgba(59,130,246,.08); border: 1px solid rgba(59,130,246,.15); color: #22d3ee; text-decoration: none; font-size: .82rem; transition: all .15s; }
.links a:hover { background: rgba(59,130,246,.15); color: var(--yry-accent); }
.ft { text-align: center; color: var(--yry-text3); font-size: .74rem; margin-top: 48px; padding-top: 20px; border-top: var(--yry-border); }
.yry-empty { text-align: center; padding: 48px 24px; color: var(--yry-text3); }
.yry-empty code { color: #22d3ee; }
#loading { text-align: center; color: var(--yry-text3); padding: 40px; }
</style>
</head>
<body>
<div class="c">

<nav class="bc">
  <a href="${CDN_DEPTH}docs/index.html">📄 文档中心</a>
  <span class="sep">/</span>
  <span class="cur">🩺 健康报告</span>
</nav>

<div class="hd">
  <h1>🩺 健康报告</h1>
  <div class="desc">系统综合健康度量仪表板 — 覆盖 9 核心维度 + 7 工程成熟度评分 + D0-D7 诊断触发。每次运行自动生成 HTML 报告并持久化趋势数据至 <code>.memory/health-trend.jsonl</code>。</div>
  <div class="meta"><span id="count">${reportCount}</span> 份历史报告</div>
</div>

<div class="h-intro">
  <strong>评估体系</strong>：<strong>9 核心维度</strong>（Token 安全、配置健康、机器人就绪、API 可达性、报告质量、格式规范、诊断引擎、Git 纪律、安全基线）+ <strong>7 工程成熟度</strong>（测试、类型、Lint、CI/CD、文档、依赖、Git 实践）<br>
  <strong>诊断联动</strong>：评分过低自动触发 <strong>D0-D7</strong> 分级诊断 · 趋势数据输入自改进分析面板 · 企微通知推送<br>
  <strong>生成命令</strong>：<code>node skills/rui-bot/send.mjs health --html</code>
</div>

<div class="h-stats" id="stats">
  <div class="h-stat"><div class="h-val info">${reportCount}</div><div class="h-lbl">报告总数</div></div>
  <div class="h-stat"><div class="h-val pass">${latestReport && latestReport.score >= 80 ? latestReport.score : '—'}</div><div class="h-lbl">最新评分</div></div>
  <div class="h-stat"><div class="h-val ${latestReport && latestReport.grade === 'A' ? 'pass' : latestReport && latestReport.grade === 'B' ? 'pass' : latestReport && latestReport.grade === 'C' ? 'warn' : 'fail'}">${latestReport ? latestReport.grade || '?' : '—'}</div><div class="h-lbl">最新等级</div></div>
  <div class="h-stat"><div class="h-val info">${latestReport && latestReport.dimTotal ? latestReport.dimTotal : '—'}</div><div class="h-lbl">评分维度</div></div>
  <div class="h-stat"><div class="h-val ${latestReport && latestReport.triggers === 0 ? 'pass' : 'warn'}">${latestReport && latestReport.triggers !== null ? latestReport.triggers : '—'}</div><div class="h-lbl">诊断触发</div></div>
</div>

<div class="card">
  <h2>📋 报告历史</h2>
  <table>
    <thead><tr><th>日期</th><th>时间</th><th>评分</th><th>等级</th><th>诊断</th><th>操作</th></tr></thead>
    <tbody id="tbody"></tbody>
  </table>
</div>

<div class="links">
  <a href="${CDN_DEPTH}docs/自循环报告/">🔄 自循环报告</a>
  <a href="${CDN_DEPTH}docs/趋势报告/">📡 趋势报告</a>
  <a href="${CDN_DEPTH}docs/自我改进/">🧬 自我改进</a>
  <a href="${CDN_DEPTH}docs/故事任务面板/">📋 故事任务面板</a>
  <a href="${CDN_DEPTH}docs/index.html">📄 文档中心</a>
</div>

<div class="ft">
  健康报告索引<br>
  <span style="color:var(--yry-text3)">由 rui-bot health-report 自动生成 · 9 核心 + 7 工程维度 · D0-D7 诊断</span>
</div>

</div>
<script>
(async function() {
  try {
    var res = await fetch('reports.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var reports = await res.json();
    document.getElementById('count').textContent = reports.length;

    var tbody = document.getElementById('tbody');
    if (reports.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="yry-empty">暂无报告<br><span style="font-size:.7rem;margin-top:8px;display:block">运行 <code>node skills/rui-bot/send.mjs health --html</code> 生成首份报告</span></div></td></tr>';
    } else {
      tbody.innerHTML = reports.map(function(r) {
        var scHtml = r.score ? '<span class="s ' + (r.grade || '') + '">' + r.score + ' 分</span>' : '—';
        var gradeHtml = r.grade ? '<span class="yry-badge ' + (r.grade) + '">' + r.grade + ' 级</span>' : '—';
        var trigHtml = r.triggers !== null ? (r.triggers > 0 ? '<span style="color:var(--yry-warn)">' + r.triggers + '/8</span>' : '<span style="color:var(--yry-pass)">0/8</span>') : '—';
        var timeHtml = r.time && r.time !== '—' ? r.time : '—';
        return '<tr><td><a href="' + r.file + '">🩺 ' + r.date + '</a></td><td>' + timeHtml + '</td><td>' + scHtml + '</td><td>' + gradeHtml + '</td><td>' + trigHtml + '</td><td><a href="' + r.file + '">查看</a></td></tr>';
      }).join('');
    }
  } catch(e) {
    document.getElementById('tbody').innerHTML = '<tr><td colspan="6"><div class="yry-empty">加载失败: ' + e.message + '</div></td></tr>';
  }
})();
</script>
</body>
</html>`;

  writeFileSync(join(REPORT_DIR, "index.html"), html, "utf-8");
}
