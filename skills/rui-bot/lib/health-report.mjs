/**
 * health-report — Comprehensive health report HTML generator.
 * Generates styled HTML reports in docs/健康报告/ with full D0-D7 diagnostics.
 *
 * Usage:
 *   import { generateHealthReport, generateHealthIndex } from './health-report.mjs';
 *   const { filePath } = generateHealthReport(healthResult);
 *   generateHealthIndex();
 */

import { writeFileSync, mkdirSync, existsSync, readdirSync, readFileSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";


const REPORT_DIR = "docs/健康报告";
const CDN_DEPTH = "../../";

const DIM_ICONS = {
  token:       "🔑",
  config:      "⚙️",
  robots:      "🤖",
  api:         "🌐",
  reports:     "📊",
  format:      "📋",
  diagnostics: "🔬",
  git:         "📦",
  security:    "🛡️",
  // Engineering maturity (from rui-init §7)
  em_testing:  "🧪",
  em_types:    "🛡️",
  em_linting:  "📏",
  em_cicd:     "🔄",
  em_docs:     "📚",
  em_deps:     "📦",
  em_git:      "🌿",
  comp_qual:   "📦",
};

const DIM_LABELS = {
  token:       "Token 凭据",
  config:      "配置文件",
  robots:      "机器人配置",
  api:         "API 可达性",
  reports:     "自循环报告",
  format:      "消息格式合规",
  diagnostics: "D0-D7 诊断",
  git:         "Git 仓库状态",
  security:    "安全扫描",
  // Engineering maturity
  em_testing:  "测试体系",
  em_types:    "类型安全",
  em_linting:  "代码规范",
  em_cicd:     "CI/CD",
  em_docs:     "文档完整",
  em_deps:     "依赖管理",
  em_git:      "Git 纪律",
  comp_qual:   "组件质量",
};

const DIM_WEIGHTS = {
  token: 15, config: 10, robots: 10, api: 15, reports: 10, format: 10, diagnostics: 10, git: 10, security: 10,
  em_testing: 20, em_types: 15, em_linting: 15, em_cicd: 15, em_docs: 15, em_deps: 10, em_git: 10,
  comp_qual: 10,
};

const GRADE_STYLE = {
  A: { color: "#22c55e", bg: "rgba(34,197,94,.12)" },
  B: { color: "#f59e0b", bg: "rgba(245,158,11,.12)" },
  C: { color: "#f59e0b", bg: "rgba(245,158,11,.08)" },
  D: { color: "#ef4444", bg: "rgba(239,68,68,.12)" },
};

function nowISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}年${p(d.getMonth() + 1)}月${p(d.getDate())}日 ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function nowDate() {
  return new Date().toISOString().slice(0, 10);
}

function nowTimestamp() {
  const now = new Date();
  return [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");
}

function extractReportMeta(filename) {
  const match = filename.match(/^health-(\d{4}-\d{2}-\d{2})(?:-(\d{6}))?\.html$/);
  if (!match) return null;
  const [, date, timeRaw = ""] = match;
  const time = timeRaw
    ? `${timeRaw.slice(0, 2)}:${timeRaw.slice(2, 4)}:${timeRaw.slice(4, 6)}`
    : "—";
  return { file: filename, date, time, timeRaw };
}

function compareReportMeta(a, b) {
  if (!a) return -1;
  if (!b) return 1;
  if (!a.timeRaw && b.timeRaw) return 1;
  if (a.timeRaw && !b.timeRaw) return -1;
  if (a.date !== b.date) return a.date.localeCompare(b.date);
  return a.timeRaw.localeCompare(b.timeRaw);
}

function listReportFiles() {
  if (!existsSync(REPORT_DIR)) return [];
  return readdirSync(REPORT_DIR)
    .filter((f) => f.endsWith(".html") && f !== "index.html")
    .map((file) => {
      const meta = extractReportMeta(file);
      if (!meta) return null;
      let mtimeMs = 0;
      try {
        mtimeMs = statSync(join(REPORT_DIR, file)).mtimeMs;
      } catch { /* ignore unreadable files */ }
      return { ...meta, mtimeMs };
    })
    .filter(Boolean);
}

function pickLatestReportsByDate(files) {
  const latestByDate = new Map();
  for (const file of files) {
    const existing = latestByDate.get(file.date);
    if (!existing || compareReportMeta(file, existing) > 0 || (compareReportMeta(file, existing) === 0 && file.mtimeMs > existing.mtimeMs)) {
      latestByDate.set(file.date, file);
    }
  }
  return [...latestByDate.values()].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.mtimeMs - a.mtimeMs;
  });
}

function removeReportsForDate(date, keepFile = "") {
  for (const report of listReportFiles()) {
    if (report.date === date && report.file !== keepFile) {
      try {
        unlinkSync(join(REPORT_DIR, report.file));
      } catch { /* best effort cleanup */ }
    }
  }
}

/**
 * Read previous health report score for trend comparison.
 */
function getPreviousScore() {
  const today = nowDate();
  try {
    const files = pickLatestReportsByDate(listReportFiles())
      .filter((f) => f.date !== today);
    if (files.length === 0) return null;

    const content = readFileSync(join(REPORT_DIR, files[0].file), "utf-8");
    const scoreMatch = content.match(/h-score-num[^>]*>(\d+)</);
    const gradeMatch = content.match(/h-score-grade[^>]*>([ABCD]) 级</);
    if (scoreMatch) {
      return { score: parseInt(scoreMatch[1], 10), grade: gradeMatch ? gradeMatch[1] : null, date: files[0].date };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Read health trend JSONL to get grade history.
 */
function getHealthTrend() {
  const trendPath = ".memory/health-trend.jsonl";
  if (!existsSync(trendPath)) return [];
  try {
    return readFileSync(trendPath, "utf-8").trim().split("\n").filter(Boolean).map((l) => {
      try { return JSON.parse(l); } catch { return null; }
    }).filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Build a grade sparkline showing grade history as colored dots.
 */
function buildGradeSparkline(history) {
  if (history.length < 2) return "";

  const gradeColors = { A: "#22c55e", B: "#22c55e", C: "#f59e0b", D: "#ef4444" };
  // Sample to max 20 dots to keep HTML compact
  const sampled = history.length <= 20 ? history : history.filter((_, i) => i % Math.ceil(history.length / 20) === 0 || i === history.length - 1);
  const dots = sampled.map((h, i) => {
    const color = gradeColors[h.grade] || "#666";
    const last = i === sampled.length - 1;
    const size = last ? "10px" : "6px";
    return `<span class="h-grade-dot" style="background:${color};width:${size};height:${size}" title="${h.grade} 级 · ${h.composite} 分 · ${h.timestamp?.slice(0,10) || ""}"></span>`;
  }).join("");

  return `<div class="h-grade-spark">${dots}</div>`;
}

/**
 * Read all previous reports to extract per-dimension score history.
 * Returns a map of dimension → array of {date, score}.
 */
function getDimensionHistory() {
  const history = {};

  // Primary source: health-trend.jsonl (always up to date)
  const trendPath = ".memory/health-trend.jsonl";
  if (existsSync(trendPath)) {
    try {
      const lines = readFileSync(trendPath, "utf-8").trim().split("\n").filter(Boolean);
      for (const line of lines) {
        const entry = JSON.parse(line);
        const date = entry.timestamp?.slice(0, 10) || "";
        if (entry.scores) {
          for (const [dim, score] of Object.entries(entry.scores)) {
            const label = DIM_LABELS[dim] || dim;
            if (!history[label]) history[label] = [];
            history[label].push({ date, score });
          }
        }
      }
      if (Object.keys(history).length > 0) return history;
    } catch { /* fall back to HTML parsing */ }
  }

  // Fallback: parse HTML reports
  if (!existsSync(REPORT_DIR)) return history;

  try {
    const files = readdirSync(REPORT_DIR)
      .filter((f) => f.endsWith(".html") && f !== "index.html")
      .sort(); // oldest first

    for (const f of files) {
      const dateMatch = f.match(/health-(\d{4}-\d{2}-\d{2})-/);
      const date = dateMatch ? dateMatch[1] : "";
      const content = readFileSync(join(REPORT_DIR, f), "utf-8");

      // Extract per-dimension scores from the HTML
      // Pattern: <span class="h-dim-score" style="color:...">85 分</span>
      // But we need the dimension name too. Let's extract from the dim-label spans.
      const dimRegex = /<span class="h-dim-label">([^<]+)<\/span>\s*<span class="h-dim-score"[^>]*>(\d+) 分<\/span>/g;
      let match;
      while ((match = dimRegex.exec(content)) !== null) {
        const label = match[1];
        const score = parseInt(match[2], 10);
        if (!history[label]) history[label] = [];
        // Avoid duplicates for same date
        const existing = history[label].find((e) => e.date === date);
        if (!existing) {
          history[label].push({ date, score });
        }
      }
    }
  } catch { /* skip */ }

  return history;
}

/**
 * Generate a trend indicator for a dimension given its history.
 */
function dimTrendIcon(dimLabel, currentScore, history) {
  const dimHistory = history[dimLabel] || [];
  if (dimHistory.length < 2) return "";

  const prev = dimHistory[dimHistory.length - 2];
  if (!prev || prev.score === undefined) return "";

  const diff = currentScore - prev.score;
  if (diff > 5) return `<span class="h-trend up" title="提升 ${diff} 分">↑${diff}</span>`;
  if (diff < -5) return `<span class="h-trend down" title="下降 ${Math.abs(diff)} 分">↓${Math.abs(diff)}</span>`;
  return '<span class="h-trend stable" title="持平">→</span>';
}

/**
 * Build a mini sparkline bar for a dimension's history.
 */
function dimSparkline(dimLabel, history) {
  const dimHistory = history[dimLabel] || [];
  if (dimHistory.length < 2) return "";

  const scores = dimHistory.map((h) => h.score);
  const max = Math.max(...scores, 100);
  const bars = scores.map((s) => {
    const h = Math.max(2, Math.round((s / max) * 16));
    const color = s >= 80 ? "var(--yry-pass)" : s >= 60 ? "var(--yry-warn)" : "var(--yry-fail)";
    return `<span class="h-spark-bar" style="height:${h}px;background:${color}" title="${s} 分"></span>`;
  }).join("");

  return `<div class="h-sparkline">${bars}</div>`;
}

/**
 * Generate a comprehensive health report HTML file.
 *
 * @param {Object} hr - Health result from cmdHealth()
 * @param {number} hr.composite - Overall score 0-100
 * @param {string} hr.grade - Grade A/B/C/D
 * @param {Object} hr.scores - Per-dimension scores { token: 100, config: 80, ... }
 * @param {Array} hr.details - Per-dimension detail objects
 * @param {Object} hr.diagnostics - D0-D7 diagnostic result { score, summary, triggered, diagnostics, execCount }
 * @returns {{ filePath: string, filename: string }}
 */
export function generateHealthReport(hr) {
  const ts = nowISO();
  const reportDate = nowDate();
  const filename = `health-${reportDate}.html`;
  const gradeInfo = GRADE_STYLE[hr.grade] || GRADE_STYLE.D;

  // Dimension score cards
  // Trend comparison
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

  // Component scores
  const compScores = hr.compScores;

  // Build recommendations from triggered diagnostics + low scores
  const recommendations = [];
  if (hr.diagnostics?.triggered?.length > 0) {
    for (const d of hr.diagnostics.triggered) {
      if (d.suggestion) recommendations.push({ source: `${d.id} ${d.label}`, text: d.suggestion, priority: "high" });
    }
  }
  // Add recommendations for low-scoring dimensions not covered by diagnostics
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
  // Add low-score component recommendations
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

  // Grade sparkline from trend data
  const gradeSparkline = buildGradeSparkline(healthTrend);

  // Detect new/worsened issues since last check
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

  // Separate into operational vs engineering maturity
  const opsDims = ["token", "config", "robots", "api", "reports", "format", "diagnostics", "git", "security", "comp_qual"];
  const emDims = ["em_testing", "em_types", "em_linting", "em_cicd", "em_docs", "em_deps", "em_git"];
  const hasEmDims = emDims.some((d) => hr.scores[d] !== undefined);

  function buildDimCard(dim, label) {
    const score = hr.scores[dim] ?? 0;
    const icon = DIM_ICONS[dim] || "\u{1F4CC}";
    const weight = DIM_WEIGHTS[dim] || 0;
    const barColor = score >= 80 ? "var(--yry-pass)" : score >= 60 ? "var(--yry-warn)" : "var(--yry-fail)";
    const barColorRaw = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
    const statusTier = score >= 80 ? "pass" : score >= 60 ? "warn" : "fail";
    const trend = dimTrendIcon(label, score, dimHistory);
    const sparkline = ''; // dimSparkline(label, dimHistory);
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

  // Health detail items
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

<!-- Tabs -->
<div class="h-tabs">
  <div class="h-tab on" data-panel="overview">📊 概览</div>
  <div class="h-tab" data-panel="scores">📈 评分<span class="h-tab-badge ${dimFail > 0 ? 'fail' : dimWarn > 0 ? 'warn' : ''}">${dimPass}/${dimPass+dimWarn+dimFail}</span></div>
  <div class="h-tab" data-panel="components">📦 组件<span class="h-tab-badge">${compScores ? compScores.skills.length + compScores.agents.length + compScores.rules.length + compScores.scripts.length : 0}</span></div>
  <div class="h-tab" data-panel="diagnostics">🔬 诊断<span class="h-tab-badge ${(hr.diagnostics?.triggered?.length ?? 0) > 0 ? 'warn' : ''}">${hr.diagnostics?.triggered?.length ?? 0}/8</span></div>
  <div class="h-tab" data-panel="actions">💡 行动<span class="h-tab-badge">${recommendations.length}</span></div>
</div>

<!-- Panel 1: Overview -->
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

<!-- Panel 2: Scores -->
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

<!-- Panel 3: Components -->
<div class="h-panel" id="components">
  ${buildComponentSections(compScores)}
</div>

<!-- Panel 4: Diagnostics -->
<div class="h-panel" id="diagnostics">
  ${diagSection}
</div>

<!-- Panel 5: Actions -->
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
  // Compact HTML: strip whitespace, remove blank lines, merge only short adjacent lines
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

/**
 * Build component scoring sections (skills, agents, rules, scripts).
 * Shows per-component scores + detailed criteria breakdowns + recommendations.
 */
function buildComponentSections(compScores) {
  if (!compScores) return "";
  function sc(s){return s>=80?"var(--yry-pass)":s>=60?"var(--yry-warn)":"var(--yry-fail)"}
  function chip(s){return s>=80?'<span class="h-comp-chip pass">优秀</span>':s>=60?'<span class="h-comp-chip warn">一般</span>':'<span class="h-comp-chip fail">待改进</span>'}
  function tbl(items,showMeta){
    if(!items||!items.length)return'<div class="h-placeholder">暂无数据</div>';
    const s=[...items].sort((a,b)=>b.score-a.score);
    return`<table class="h-comp-table"><thead><tr><th>#</th><th>名称</th>${showMeta?'<th>属性</th>':''}<th>评分</th><th>等级</th></tr></thead><tbody>${s.map((x,i)=>{const m=[];if(x.hasSkillMd!==undefined)m.push(x.hasSkillMd?'📄':'❌SKILL.md');if(x.hasLib)m.push('📦lib');if(x.mjsCount>0)m.push('📜'+x.mjsCount);if(x.category)m.push('📂'+x.category);return`<tr><td class="h-comp-rank">${i+1}</td><td class="h-comp-name">${x.name}</td>${showMeta?`<td class="h-comp-meta">${m.join(' ')||'—'}</td>`:''}<td class="h-comp-score-cell"><div class="h-comp-score-bar"><div class="h-comp-score-fill" style="width:${x.score}%;background:${sc(x.score)}"></div></div><span class="h-comp-score-num" style="color:${sc(x.score)}">${x.score} 分</span></td><td>${chip(x.score)}</td></tr>`}).join('')}</tbody></table>`}
  const avg=a=>a.length?Math.round(a.reduce((p,c)=>p+c.score,0)/a.length):0;
  const all=[...(compScores.skills||[]),...(compScores.agents||[]),...(compScores.rules||[]),...(compScores.scripts||[])];
  const lo=all.filter(c=>c.score<60);
  return`<div class="h-section"><h2>📦 组件评分总览</h2><div class="h-comp-summary"><div class="h-comp-sum-item"><div class="h-comp-sum-val" style="color:${sc(avg(all))}">${avg(all)}</div><div class="h-comp-sum-lbl">综合均分 · ${all.length} 组件</div></div><div class="h-comp-sum-item"><div class="h-comp-sum-val" style="color:${sc(avg(compScores.skills))}">${avg(compScores.skills)}</div><div class="h-comp-sum-lbl">Skills · ${compScores.skills.length} 个</div></div><div class="h-comp-sum-item"><div class="h-comp-sum-val" style="color:${sc(avg(compScores.agents))}">${avg(compScores.agents)}</div><div class="h-comp-sum-lbl">Agents · ${compScores.agents.length} 个</div></div><div class="h-comp-sum-item"><div class="h-comp-sum-val" style="color:${sc(avg(compScores.rules))}">${avg(compScores.rules)}</div><div class="h-comp-sum-lbl">Rules · ${compScores.rules.length} 个</div></div><div class="h-comp-sum-item"><div class="h-comp-sum-val" style="color:${sc(avg(compScores.scripts))}">${avg(compScores.scripts)}</div><div class="h-comp-sum-lbl">Scripts · ${compScores.scripts.length} 个</div></div></div></div>${lo.length?`<div class="h-section" style="border-left:3px solid var(--yry-fail)"><h2>⚠️ 低分组件 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${lo.length} 个</span></h2><div class="h-rec-list">${lo.map(c=>`<div class="h-rec-item"><span class="h-rec-prio" style="color:var(--yry-fail)">🔴</span><div class="h-rec-body"><div class="h-rec-source">${c.name} · ${c.score} 分</div><div class="h-rec-text">${(c.recommendations||['补充完善']).join('；')}</div></div></div>`).join('')}</div></div>`:''}<div class="h-section"><h2>🤖 Skills <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${compScores.skills.length} 个 · 均分 ${avg(compScores.skills)}</span></h2>${tbl(compScores.skills,true)}</div><div class="h-section"><h2>👥 Agents <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${compScores.agents.length} 个 · 均分 ${avg(compScores.agents)}</span></h2>${tbl(compScores.agents,false)}</div><div class="h-section"><h2>📏 Rules <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${compScores.rules.length} 个 · 均分 ${avg(compScores.rules)}</span></h2>${tbl(compScores.rules,false)}</div><div class="h-section"><h2>📜 Scripts <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${compScores.scripts.length} 个 · 均分 ${avg(compScores.scripts)}</span></h2>${tbl(compScores.scripts,true)}</div>`;

} // end buildComponentSections

/**
 * Generate/update the health report index page.
 */
export function generateHealthIndex() {
  if (!existsSync(REPORT_DIR)) {
    mkdirSync(REPORT_DIR, { recursive: true });
  }

  const files = pickLatestReportsByDate(listReportFiles());

  // Extract metadata from each report into a JSON data file
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

  // Write data file for JS to fetch
  writeFileSync(join(REPORT_DIR, "reports.json"), JSON.stringify(reports), "utf-8");

  // Generate enhanced static shell that loads data via JS
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

    // Table
    var tbody = document.getElementById('tbody');
    if (reports.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="yry-empty">暂无报告<br><span style="font-size:.7rem;margin-top:8px;display:block">运行 <code>node skills/rui-bot/send.mjs health --html</code> 生成首份报告</span></div></td></tr>';
    } else {
      tbody.innerHTML = reports.map(function(r) {
        var scHtml = r.score ? '<span class="s ' + (r.grade || '') + '">' + r.score + ' 分</span>' : '—';
        var gradeHtml = r.grade ? '<span class="yry-badge ' + r.grade + '">' + r.grade + ' 级</span>' : '—';
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

/**
 * Build a score trend bar chart from health trend history.
 */
function buildScoreTrend(history) {
  if (!history || history.length < 2) return "";
  const recent = history.slice(-10);
  const maxScore = 100;
  const bars = recent.map((h, i) => {
    const hPx = Math.max(4, Math.round((h.composite / maxScore) * 60));
    const color = h.grade === "A" ? "var(--yry-pass)" : h.grade === "B" ? "var(--yry-pass)" : h.grade === "C" ? "var(--yry-warn)" : "var(--yry-fail)";
    const date = h.timestamp?.slice(0, 10) || "";
    const isLatest = i === recent.length - 1;
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;min-width:20px">
      <span style="font-size:.65rem;font-weight:${isLatest ? '700' : '400'};color:var(--yry-accent)">${h.composite}</span>
      <div style="width:100%;max-width:40px;height:${hPx}px;background:${color};border-radius:3px 3px 0 0;opacity:${isLatest ? '1' : '.6'};transition:opacity .2s" title="${date}: ${h.composite} 分 (${h.grade})" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='${isLatest ? '1' : '.6'}'"></div>
      <span style="font-size:.58rem;color:var(--yry-text3)">${date.slice(5)}</span>
    </div>`;
  }).join("");
  return `<div class="h-section">
    <h2>📈 健康趋势 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">最近 ${recent.length} 次</span></h2>
    <div style="display:flex;align-items:flex-end;gap:4px;padding:16px 0 8px;overflow-x:auto">${bars}</div>
    <div style="font-size:.68rem;color:var(--yry-text3);text-align:center;margin-top:4px">▲ 综合健康度变化趋势 — 高分高柱，绿色=优秀 黄色=需关注 红色=告警</div>
  </div>`;
}

/**
 * Build a compact summary card for at-a-glance assessment.
 */
function buildSummaryCard(hr, prev, recommendations) {
  const overallIcon = hr.grade === "A" || hr.grade === "B" ? "✅" : hr.grade === "C" ? "⚠️" : "🚫";
  const overallLabel = hr.grade === "A" ? "优秀" : hr.grade === "B" ? "良好" : hr.grade === "C" ? "需关注" : "告警";

  // Weakest dimension
  const sortedDims = Object.entries(hr.scores || {})
    .sort(([, a], [, b]) => a - b);
  const weakest = sortedDims[0];
  const weakLabel = weakest ? `${DIM_LABELS[weakest[0]] || weakest[0]} ${weakest[1]}分` : "—";
  const strongest = sortedDims[sortedDims.length - 1];
  const strongLabel = strongest ? `${DIM_LABELS[strongest[0]] || strongest[0]} ${strongest[1]}分` : "—";

  // Trend
  let trendText = "";
  if (prev) {
    const diff = hr.composite - prev.score;
    trendText = diff > 3 ? `↑${diff}` : diff < -3 ? `↓${Math.abs(diff)}` : "→0";
  }

  // Dimension status counts
  let dimPass = 0, dimWarn = 0, dimFail = 0;
  for (const s of Object.values(hr.scores || {})) {
    if (s >= 80) dimPass++;
    else if (s >= 60) dimWarn++;
    else dimFail++;
  }

  // Most critical recommendation
  const topRec = recommendations.length > 0 ? recommendations[0].text : "";

  return `<div class="h-summary-card">
    <div class="h-summary-row">
      <div class="h-summary-item">
        <div class="h-summary-val">${overallIcon} ${overallLabel}</div>
        <div class="h-summary-lbl">综合评估</div>
      </div>
      <div class="h-summary-item">
        <div class="h-summary-val">${hr.diagnostics?.triggered?.length ?? 0}/8</div>
        <div class="h-summary-lbl">诊断触发${hr.diagnostics?.bootstrapped ? ' (引导)' : ''}</div>
      </div>
      <div class="h-summary-item">
        <div class="h-summary-val"><span style="color:#22c55e">${dimPass}</span> <span style="color:#f59e0b">${dimWarn}</span> <span style="color:#ef4444">${dimFail}</span></div>
        <div class="h-summary-lbl">维度过关/告警/失败</div>
      </div>
      <div class="h-summary-item">
        <div class="h-summary-val">${weakLabel}${trendText ? ` ${trendText}` : ""}</div>
        <div class="h-summary-lbl">最弱维度${trendText ? ' · 趋势' : ''}</div>
      </div>
    </div>
    <div class="h-summary-row" style="margin-top:8px">
      <div class="h-summary-item">
        <div class="h-summary-val" style="color:#22c55e">${strongLabel}</div>
        <div class="h-summary-lbl">最强维度</div>
      </div>
      <div class="h-summary-item">
        <div class="h-summary-val">${recommendations.length} 项</div>
        <div class="h-summary-lbl">改进建议</div>
      </div>
      <div class="h-summary-item" style="flex:2;min-width:160px">
        <div class="h-summary-val" style="font-size:.75rem;text-align:left">${topRec ? '💡 '+topRec.slice(0,50)+(topRec.length>50?'…':'') : '—'}</div>
        <div class="h-summary-lbl">首项建议</div>
      </div>
    </div>
  </div>`;
}

/**
 * Build a weighted score composition breakdown showing contribution of each dimension.
 */
function buildScoreBreakdown(hr) {
  const entries = [];
  for (const [dim, score] of Object.entries(hr.scores || {})) {
    const label = DIM_LABELS[dim] || dim;
    const weight = DIM_WEIGHTS[dim] || 0;
    const contribution = Math.round(score * weight / 100);
    entries.push({ dim, label, score, weight, contribution });
  }
  entries.sort((a, b) => b.contribution - a.contribution);

  const totalWeight = entries.reduce((s, e) => s + e.weight, 0);
  const totalContribution = entries.reduce((s, e) => s + e.contribution, 0);

  const bars = entries.map((e, i) => {
    const barColor = e.score >= 80 ? "var(--yry-pass)" : e.score >= 60 ? "var(--yry-warn)" : "var(--yry-fail)";
    const barPct = ((e.contribution / totalContribution) * 100).toFixed(0);
    return `<div class="h-comp-row">
      <span class="h-comp-rank">${i + 1}</span>
      <span class="h-comp-label">${e.label}</span>
      <span class="h-comp-score" style="color:${barColor}">${e.score}分 × ${e.weight}%</span>
      <div class="h-comp-bar-wrap"><div class="h-comp-bar-inner" style="width:${barPct}%;background:${barColor}"></div></div>
      <span class="h-comp-val">${e.contribution}</span>
    </div>`;
  }).join("");

  return `<div class="h-section">
    <h2>🔢 评分构成 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">加权分解 · 合计 ${totalContribution}/${totalWeight * 100 / totalWeight} 分</span></h2>
    <div class="h-comp-list">${bars}</div>
    <div style="margin-top:10px;font-size:.68rem;color:var(--yry-text3)">计算公式: 综合评分 = Σ(维度得分 × 权重%) / Σ权重% · 按贡献值降序排列</div>
  </div>`;
}

/**
 * Build actionable recommendations section.
 */
function buildRecommendationsSection(recs) {
  const items = recs.map((r) => {
    const prioColor = r.priority === "high" ? "var(--yry-fail)" : "var(--yry-warn)";
    return `<div class="h-rec-item">
      <span class="h-rec-prio" style="color:${prioColor}">${r.priority === "high" ? "🔴" : "🟡"}</span>
      <div class="h-rec-body">
        <div class="h-rec-source">${r.source}</div>
        <div class="h-rec-text">${r.text}</div>
      </div>
    </div>`;
  }).join("\n");

  return `<div class="h-section">
    <h2>💡 改进建议 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${recs.length} 项</span></h2>
    <div class="h-rec-list">${items}</div>
  </div>`;
}

/**
 * Build structure health section: large files and hot modules.
 */
function buildStructureSection(hr) {
  const si = hr.structInfo;
  if (!si) return "";

  const score = si.score ?? 0;
  const icon = si.icon || "📐";
  const barColor = score >= 80 ? "var(--yry-pass)" : score >= 60 ? "var(--yry-warn)" : "var(--yry-fail)";

  const totals = si.totals || { fileCount: 0, totalLines: 0 };

  // Summary card
  const summaryHtml = `<div class="h-summary-row">
    <div class="h-summary-item">
      <div class="h-summary-val">${totals.fileCount}</div>
      <div class="h-summary-lbl">源文件</div>
    </div>
    <div class="h-summary-item">
      <div class="h-summary-val">${totals.totalLines.toLocaleString()}</div>
      <div class="h-summary-lbl">总行数</div>
    </div>
    <div class="h-summary-item">
      <div class="h-summary-val" style="color:${si.critFileCount > 0 ? 'var(--yry-fail)' : si.allLargeFileCount > 0 ? 'var(--yry-warn)' : 'var(--yry-pass)'}">${si.allLargeFileCount || 0}</div>
      <div class="h-summary-lbl">大文件 ≥500 行${si.critFileCount > 0 ? ` (≥1000: ${si.critFileCount})` : ""}</div>
    </div>
    <div class="h-summary-item">
      <div class="h-summary-val" style="color:${barColor}">${score}</div>
      <div class="h-summary-lbl">结构健康分</div>
    </div>
  </div>`;

  // Large files table
  let filesHtml = "";
  if (si.largeFiles && si.largeFiles.length > 0) {
    const topFiles = si.largeFiles.slice(0, 5);
    const rows = topFiles.map((f, i) => {
      const tier = f.lines >= 1000 ? "fail" : "warn";
      const tierLabel = f.lines >= 1000 ? "巨型" : "大型";
      const tierColor = f.lines >= 1000 ? "var(--yry-fail)" : "var(--yry-warn)";
      const pct = Math.min(100, (f.lines / 2000) * 100);
      return `<tr class="h-struct-row">
        <td class="h-struct-rank">${i + 1}</td>
        <td class="h-struct-path" title="${f.path}">${f.path}</td>
        <td class="h-struct-ext">${f.ext || "—"}</td>
        <td class="h-struct-lines" style="font-family:'JetBrains Mono',monospace">${f.lines.toLocaleString()}</td>
        <td class="h-struct-bar-cell"><div class="h-struct-bar"><div class="h-struct-bar-fill" style="width:${pct}%;background:${tierColor}"></div></div></td>
        <td><span class="h-struct-chip ${tier}">${tierLabel}</span></td>
      </tr>`;
    }).join("");
    filesHtml = `
      <h3 class="h-struct-sub">📄 大文件 TOP 5 <span class="h-struct-sub-note">≥500 行 · 按行数降序 · 共 ${si.largeFiles.length} 个</span></h3>
      <table class="h-struct-table">
        <thead><tr><th>#</th><th>路径</th><th>类型</th><th>行数</th><th>规模</th><th>级别</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  } else {
    filesHtml = `<div class="h-placeholder">✅ 未发现 ≥500 行的大文件</div>`;
  }

  // Modules table
  let modulesHtml = "";
  if (si.modules && si.modules.length > 0) {
    const topMods = si.modules.slice(0, 5);
    const rows = topMods.map((m, i) => {
      const hot = m.lines >= 3000 || m.fileCount >= 30;
      const pct = Math.min(100, (m.lines / 10000) * 100);
      const barColor = hot ? "var(--yry-warn)" : "var(--yry-pass)";
      return `<tr>
        <td class="h-struct-rank">${i + 1}</td>
        <td class="h-struct-path"><strong>${m.name}</strong></td>
        <td class="h-struct-lines">${m.fileCount}</td>
        <td class="h-struct-lines" style="font-family:'JetBrains Mono',monospace">${m.lines.toLocaleString()}</td>
        <td class="h-struct-lines">${m.avgLines}</td>
        <td class="h-struct-bar-cell"><div class="h-struct-bar"><div class="h-struct-bar-fill" style="width:${pct}%;background:${barColor}"></div></div></td>
        <td class="h-struct-max" title="${m.maxFile}">${m.maxLines.toLocaleString()} 行</td>
        <td>${hot ? '<span class="h-struct-chip warn">热</span>' : '<span class="h-struct-chip pass">正常</span>'}</td>
      </tr>`;
    }).join("");
    modulesHtml = `
      <h3 class="h-struct-sub">📦 顶层模块 TOP 5 <span class="h-struct-sub-note">按总行数降序 · 共 ${si.modules.length} 个模块</span></h3>
      <table class="h-struct-table">
        <thead><tr><th>#</th><th>模块</th><th>文件数</th><th>总行数</th><th>均行数</th><th>规模</th><th>最大文件</th><th>状态</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  return `<div class="h-section">
    <h2>📐 结构健康 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${icon} ${si.summary || ""}</span></h2>
    ${summaryHtml}
    ${filesHtml}
    ${modulesHtml}
    <div class="h-struct-legend">
      <span class="h-struct-chip fail">巨型 ≥1000 行</span>
      <span class="h-struct-chip warn">大型 ≥500 行 · 热模块 ≥3000 行或 ≥30 文件</span>
      <span class="h-struct-chip pass">正常</span>
    </div>
  </div>`;
}

/**
 * Build git status and security scan info section HTML.
 */
function buildGitSecuritySection(hr) {
  const parts = [];

  // Git info
  if (hr.gitInfo) {
    const gi = hr.gitInfo;
    const icon = gi.score >= 80 ? "✅" : gi.score >= 60 ? "⚠️" : "❌";
    parts.push(`<div class="h-section">
      <h2>📦 Git 仓库状态 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${icon} ${gi.summary}</span></h2>
      <div class="h-detail-list">
        <div class="h-detail-item"><span class="h-detail-icon">🌿</span><span class="h-detail-text">分支: <strong>${gi.branch || "?"}</strong></span></div>
        <div class="h-detail-item"><span class="h-detail-icon">📝</span><span class="h-detail-text">未提交文件: ${gi.uncommitted ?? "?"} 个</span></div>
        ${gi.behind ? `<div class="h-detail-item"><span class="h-detail-icon">⬇️</span><span class="h-detail-text">落后 origin: ${gi.behind} 个提交</span></div>` : ""}
        ${gi.ahead ? `<div class="h-detail-item"><span class="h-detail-icon">⬆️</span><span class="h-detail-text">领先 origin: ${gi.ahead} 个提交</span></div>` : ""}
      </div>
    </div>`);
  }

  // Security scan
  if (hr.secInfo) {
    const si = hr.secInfo;
    const icon = si.score >= 80 ? "✅" : si.score >= 60 ? "⚠️" : "❌";
    const findingItems = (si.findings || []).length > 0
      ? si.findings.slice(0, 5).map((f) => `<div class="h-detail-item"><span class="h-detail-icon">⚠️</span><span class="h-detail-text" style="font-family:monospace;font-size:.76rem">${f}</span></div>`).join("")
      : "";
    parts.push(`<div class="h-section">
      <h2>🛡️ 安全扫描 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${icon} ${si.summary}</span></h2>
      ${findingItems ? `<div class="h-detail-list">${findingItems}</div>` : '<div class="h-placeholder">未发现安全风险 — 未检测到硬编码凭据、密钥或 Token 泄露</div>'}
    </div>`);
  }

  return parts.join("\n");
}
