/**
 * health-report — Comprehensive health report HTML generator.
 * Generates styled HTML reports in docs/健康报告/ with full D0-D7 diagnostics.
 *
 * Usage:
 *   import { generateHealthReport, generateHealthIndex } from './health-report.mjs';
 *   const { filePath } = generateHealthReport(healthResult);
 *   generateHealthIndex();
 */

import { writeFileSync, mkdirSync, existsSync, readdirSync, readFileSync } from "node:fs";
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
};

const DIM_WEIGHTS = {
  token: 15, config: 10, robots: 10, api: 15, reports: 10, format: 10, diagnostics: 10, git: 10, security: 10,
  em_testing: 20, em_types: 15, em_linting: 15, em_cicd: 15, em_docs: 15, em_deps: 10, em_git: 10,
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

/**
 * Read previous health report score for trend comparison.
 */
function getPreviousScore() {
  if (!existsSync(REPORT_DIR)) return null;
  try {
    const files = readdirSync(REPORT_DIR)
      .filter((f) => f.endsWith(".html") && f !== "index.html")
      .sort()
      .reverse();
    if (files.length === 0) return null;

    // Read the latest report (which is the most recent before this one)
    // Since we haven't written the current one yet, files[0] is the previous
    const content = readFileSync(join(REPORT_DIR, files[0]), "utf-8");
    const scoreMatch = content.match(/h-score-num[^>]*>(\d+)</);
    const gradeMatch = content.match(/h-score-grade[^>]*>([ABCD]) 级</);
    if (scoreMatch) {
      return { score: parseInt(scoreMatch[1], 10), grade: gradeMatch ? gradeMatch[1] : null, date: files[0].replace("health-", "").replace(".html", "").split("-").slice(0, 3).join("-") };
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
  const dots = history.map((h, i) => {
    const color = gradeColors[h.grade] || "#666";
    const last = i === history.length - 1;
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
  const filename = `health-${nowDate()}-${nowTimestamp()}.html`;
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
  const opsDims = ["token", "config", "robots", "api", "reports", "format", "diagnostics", "git", "security"];
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
    const sparkline = dimSparkline(label, dimHistory);
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
        ${sparkline ? `<div class="h-dim-spark-wrap">${sparkline}</div>` : ''}
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
<style>
:root {
  --yry-bg: rgba(22,22,32,1); --yry-bg-card: linear-gradient(159deg, rgba(38,38,52,1) 0%, rgba(34,34,46,1) 100%);
  --yry-accent: #FFC107; --yry-pass: #22c55e; --yry-fail: #ef4444; --yry-warn: #f59e0b;
  --yry-info: #3b82f6; --yry-cyan: #22d3ee;
  --yry-text: rgba(250,250,252,1); --yry-text2: rgba(160,160,164,1); --yry-text3: rgba(110,110,114,1);
  --yry-radius: 12px; --yry-border: 1px solid rgba(255,255,255,0.06);
  --yry-shadow: 0 4px 20px rgba(0,0,0,0.3); --yry-shadow-lg: 0 8px 32px rgba(0,0,0,0.4);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--yry-bg); color: var(--yry-text); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif; line-height: 1.6; min-height: 100vh; }
.h-container { max-width: 960px; margin: 0 auto; padding: 40px 24px 80px; }

/* Tabs */
.h-tabs { display: flex; gap: 0; border-bottom: var(--yry-border); margin-bottom: 28px; animation: fadeInDown .5s .1s ease both; }
.h-tab { padding: 10px 22px; cursor: pointer; font-size: .84rem; color: var(--yry-text3); border-bottom: 2px solid transparent; transition: all .15s; user-select: none; display: flex; align-items: center; gap: 6px; }
.h-tab:hover { color: var(--yry-text2); }
.h-tab.on { color: var(--yry-accent); border-bottom-color: var(--yry-accent); }
.h-tab .h-tab-badge { font-size: .62rem; padding: 1px 7px; border-radius: 8px; font-weight: 600; }
.h-tab .h-tab-badge.warn { background: rgba(245,158,11,.15); color: var(--yry-warn); }
.h-tab .h-tab-badge.fail { background: rgba(239,68,68,.15); color: var(--yry-fail); }
.h-panel { display: none; animation: fadeInUp .4s ease both; }
.h-panel.on { display: block; }

@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeInDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

/* Breadcrumb */
.h-bc { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 24px; font-size: .76rem; }
.h-bc a { color: var(--yry-cyan); text-decoration: none; }
.h-bc a:hover { color: var(--yry-accent); }
.h-bc .h-bc-sep { color: var(--yry-text3); opacity: .4; }
.h-bc .h-bc-cur { color: var(--yry-text2); }

/* Header */
.h-header { text-align: center; margin-bottom: 32px; }
.h-header h1 { font-size: 1.8rem; font-weight: 700; margin-bottom: 8px; }
.h-header .h-date { color: var(--yry-text3); font-size: .82rem; }

/* Hero score */
.h-hero { display: flex; justify-content: center; align-items: center; gap: 32px; margin-bottom: 32px; flex-wrap: wrap; }
.h-score-ring { width: 140px; height: 140px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 4px solid; }
.h-score-num { font-size: 2.4rem; font-weight: 800; line-height: 1; }
.h-score-grade { font-size: 1.1rem; font-weight: 700; margin-top: 2px; }
.h-score-label { font-size: .72rem; color: var(--yry-text3); margin-top: 2px; }

.h-hero-stats { display: flex; flex-direction: column; gap: 8px; }
.h-hero-stat { display: flex; align-items: center; gap: 8px; font-size: .85rem; }
.h-hero-stat .h-hs-icon { font-size: 1.1rem; }
.h-hero-stat .h-hs-val { font-weight: 600; color: var(--yry-accent); }

/* Section */
.h-section { background: var(--yry-bg-card); border: var(--yry-border); border-radius: var(--yry-radius); padding: 24px; box-shadow: var(--yry-shadow); margin-bottom: 20px; }
.h-section h2 { font-size: 1.1rem; margin-bottom: 16px; color: var(--yry-accent); display: flex; align-items: center; gap: 8px; }

/* Dimension cards */
.h-dim-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; margin-bottom: 0; }
.h-dim-card { display: flex; flex-direction: column; gap: 10px; background: rgba(15,23,42,.3); border: var(--yry-border); border-radius: 10px; padding: 14px 18px; transition: transform .15s, box-shadow .15s, border-color .15s; position: relative; overflow: hidden; }
.h-dim-card:hover { transform: translateY(-1px); box-shadow: var(--yry-shadow-lg); border-color: rgba(255,255,255,.08); }
.h-dim-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--dc-color, #666); border-radius: 0 3px 3px 0; transition: opacity .3s; }
.h-dim-card::after { content: ''; position: absolute; inset: 0; background: var(--dc-color, #666); opacity: .03; pointer-events: none; }

.h-dim-top { display: flex; align-items: center; gap: 8px; }
.h-dim-icon { font-size: .9rem; flex-shrink: 0; line-height: 1; }
.h-dim-label { font-size: .8rem; font-weight: 600; flex: 1; color: var(--yry-text); }
.h-dim-warn-chip { font-size: .6rem; font-weight: 700; padding: 1px 6px; border-radius: 6px; background: rgba(239,68,68,.15); color: var(--yry-fail); }
.h-dim-score { font-size: 1.15rem; font-weight: 800; font-family: 'JetBrains Mono', 'Fira Code', monospace; line-height: 1; }
.h-dim-score-sm { font-size: .58rem; font-weight: 500; opacity: .6; margin-left: 1px; }
.h-dim-delta-badge { font-size: .64rem; font-weight: 700; padding: 1px 7px; border-radius: 6px; margin-left: -2px; }
.h-dim-delta-badge.up { background: rgba(34,197,94,.12); color: var(--yry-pass); }
.h-dim-delta-badge.down { background: rgba(239,68,68,.12); color: var(--yry-fail); }
.h-dim-delta-badge.flat { background: rgba(255,255,255,.05); color: var(--yry-text3); }

.h-dim-bar-row { display: flex; align-items: center; gap: 8px; }
.h-dim-bar { flex: 1; height: 6px; border-radius: 3px; background: rgba(255,255,255,.05); overflow: hidden; }
.h-dim-bar-fill { height: 100%; border-radius: 3px; transition: width .6s ease; }
.h-dim-spark-wrap { flex-shrink: 0; }

.h-dim-foot { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding-top: 2px; border-top: 1px solid rgba(255,255,255,.03); }
.h-dim-chip { font-size: .6rem; font-weight: 700; padding: 1px 8px; border-radius: 4px; letter-spacing: .3px; text-transform: uppercase; }
.h-dim-chip.pass { background: rgba(34,197,94,.12); color: var(--yry-pass); }
.h-dim-chip.warn { background: rgba(245,158,11,.12); color: var(--yry-warn); }
.h-dim-chip.fail { background: rgba(239,68,68,.12); color: var(--yry-fail); }
.h-dim-note { font-size: .62rem; color: var(--yry-text3); opacity: .65; }

.h-sparkline { display: flex; align-items: flex-end; gap: 2px; height: 16px; padding: 1px 4px; background: rgba(0,0,0,.15); border-radius: 3px; }
.h-spark-bar { width: 3px; border-radius: 1px; min-height: 2px; transition: height .3s; }
.h-spark-bar:hover { opacity: .7; transform: scaleY(1.3); }
.h-grade-spark { display: inline-flex; align-items: center; gap: 3px; padding: 4px 12px; background: rgba(255,255,255,.03); border-radius: 16px; }
.h-grade-dot { border-radius: 50%; display: inline-block; transition: transform .2s; }
.h-grade-dot:hover { transform: scale(1.5); }
.h-boot-badge { display: inline-block; padding: 2px 10px; border-radius: 10px; font-size: .7rem; font-weight: 600; background: rgba(59,130,246,.15); color: var(--yry-cyan); margin-right: 6px; }
.h-new-badge { display: inline-block; padding: 1px 8px; border-radius: 8px; font-size: .65rem; font-weight: 700; background: rgba(239,68,68,.15); color: var(--yry-fail); margin-left: 4px; animation: fadeInDown .3s ease; }
.h-new-badge.warn { background: rgba(245,158,11,.15); color: var(--yry-warn); }
.h-rec-list { display: flex; flex-direction: column; gap: 8px; }
.h-rec-item { display: flex; gap: 10px; padding: 12px 14px; background: rgba(15,23,42,.4); border-radius: 8px; border: var(--yry-border); }
.h-rec-prio { font-size: .85rem; flex-shrink: 0; margin-top: 1px; }
.h-rec-body { flex: 1; }
.h-rec-source { font-size: .72rem; color: var(--yry-text3); margin-bottom: 2px; font-weight: 600; text-transform: uppercase; }
.h-rec-text { font-size: .82rem; color: var(--yry-text2); line-height: 1.5; }
.h-summary-card { background: var(--yry-bg-card); border: var(--yry-border); border-radius: var(--yry-radius); padding: 16px 20px; box-shadow: var(--yry-shadow); margin-bottom: 20px; }
.h-summary-row { display: flex; gap: 16px; flex-wrap: wrap; }
.h-summary-item { flex: 1; min-width: 90px; text-align: center; padding: 8px 12px; background: rgba(15,23,42,.4); border-radius: 8px; }
.h-summary-val { font-size: 1rem; font-weight: 700; }
.h-summary-lbl { font-size: .65rem; color: var(--yry-text3); margin-top: 2px; text-transform: uppercase; letter-spacing: .5px; }
.h-summary-rec { margin-top: 10px; padding: 8px 12px; font-size: .8rem; color: var(--yry-cyan); background: rgba(59,130,246,.06); border-radius: 6px; }

/* Score composition */
.h-comp-list { display: flex; flex-direction: column; gap: 6px; }
.h-comp-row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: rgba(15,23,42,.3); border-radius: 6px; }
.h-comp-rank { font-size: .7rem; font-weight: 700; color: var(--yry-text3); min-width: 20px; text-align: center; }
.h-comp-label { font-size: .8rem; font-weight: 500; min-width: 80px; color: var(--yry-text2); }
.h-comp-score { font-size: .72rem; font-weight: 600; min-width: 85px; font-family: 'JetBrains Mono', monospace; }
.h-comp-bar-wrap { flex: 1; height: 8px; border-radius: 4px; background: rgba(255,255,255,.05); overflow: hidden; }
.h-comp-bar-inner { height: 100%; border-radius: 4px; transition: width .6s ease; }
.h-comp-val { font-size: .78rem; font-weight: 700; color: var(--yry-accent); min-width: 28px; text-align: right; font-family: 'JetBrains Mono', monospace; }

/* Diagnostic rows */
.h-diag-summary { font-size: .78rem; color: var(--yry-text3); font-weight: 400; margin-left: 8px; }
.h-diag-list { display: flex; flex-direction: column; gap: 8px; }
.h-diag-row { padding: 14px 16px; border-radius: 8px; border: var(--yry-border); }
.h-diag-row.ok { background: rgba(34,197,94,.03); }
.h-diag-row.triggered { background: rgba(245,158,11,.04); border-left: 3px solid var(--yry-warn); }
.h-diag-head { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.h-diag-id { font-weight: 700; font-size: .85rem; }
.h-diag-label { font-size: .82rem; color: var(--yry-text2); }
.h-diag-confidence { font-size: .7rem; color: var(--yry-text3); margin-left: auto; }
.h-diag-evidence { font-size: .78rem; color: var(--yry-text2); margin-top: 4px; padding-left: 4px; }
.h-diag-suggestion { font-size: .78rem; color: var(--yry-cyan); margin-top: 4px; padding-left: 4px; }
.h-diag-empty { text-align: center; color: var(--yry-text3); padding: 20px; font-size: .84rem; }
.h-placeholder { text-align: center; color: var(--yry-text3); padding: 24px; font-size: .84rem; }

/* Detail items */
.h-detail-list { display: flex; flex-direction: column; gap: 6px; }
.h-detail-item { display: flex; align-items: flex-start; gap: 8px; font-size: .82rem; color: var(--yry-text2); padding: 6px 0; }
.h-detail-icon { flex-shrink: 0; margin-top: 1px; }

/* Footer */
.h-footer { text-align: center; color: var(--yry-text3); font-size: .74rem; margin-top: 48px; padding-top: 20px; border-top: var(--yry-border); }
.h-footer a { color: var(--yry-cyan); text-decoration: none; }
.h-footer a:hover { color: var(--yry-accent); }

/* Health bar */
.h-bar-wrap { margin-bottom: 4px; }
.h-bar-outer { height: 10px; border-radius: 5px; overflow: hidden; background: rgba(255,255,255,.06); }
.h-bar-seg { height: 100%; transition: width .6s ease; }

/* Links */
.h-links { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px; }
.h-link { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; background: rgba(59,130,246,.08); border: 1px solid rgba(59,130,246,.15); color: var(--yry-cyan); text-decoration: none; font-size: .82rem; transition: all .15s; }
.h-link:hover { background: rgba(59,130,246,.15); border-color: rgba(59,130,246,.3); }

@media (max-width: 640px) {
  .h-hero { flex-direction: column; gap: 20px; }
  .h-dim-grid { grid-template-columns: 1fr; }
}
</style>
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
  <div class="h-tab" data-panel="diagnostics">🔬 诊断<span class="h-tab-badge ${(hr.diagnostics?.triggered?.length ?? 0) > 0 ? 'warn' : ''}">${hr.diagnostics?.triggered?.length ?? 0}/8</span></div>
  <div class="h-tab" data-panel="actions">💡 行动<span class="h-tab-badge">${recommendations.length}</span></div>
</div>

<!-- Panel 1: Overview -->
<div class="h-panel on" id="overview">
  ${buildSummaryCard(hr, prev, recommendations)}
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

<!-- Panel 3: Diagnostics -->
<div class="h-panel" id="diagnostics">
  ${diagSection}
</div>

<!-- Panel 4: Actions -->
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

  const filePath = join(REPORT_DIR, filename);
  writeFileSync(filePath, html, "utf-8");

  return { filePath, filename };
}

/**
 * Generate/update the health report index page.
 */
export function generateHealthIndex() {
  if (!existsSync(REPORT_DIR)) {
    mkdirSync(REPORT_DIR, { recursive: true });
  }

  const files = readdirSync(REPORT_DIR)
    .filter((f) => f.endsWith(".html") && f !== "index.html")
    .sort()
    .reverse();

  let latestInfo = "";
  if (files.length > 0) {
    const latest = files[0];
    const latestPath = join(REPORT_DIR, latest);
    try {
      const content = readFileSync(latestPath, "utf-8");
      const scoreMatch = content.match(/h-score-num[^>]*>(\d+)</);
      const gradeMatch = content.match(/h-score-grade[^>]*>([ABCD]) 级</);
      if (scoreMatch) {
        latestInfo = `<div class="hi-latest">
          <span class="hi-latest-label">最新评估:</span>
          <span class="hi-latest-score">${scoreMatch[1]} 分</span>
          ${gradeMatch ? `<span class="hi-latest-grade">${gradeMatch[1]} 级</span>` : ""}
          <span class="hi-latest-date">${latest.replace("health-", "").replace(".html", "").split("-").slice(0, 3).join("-")}</span>
        </div>`;
      }
    } catch { /* skip */ }
  }

  const rows = files.map((f) => {
    const name = f.replace(".html", "");
    const parts = name.split("-");
    const date = parts.slice(1, 4).join("-");
    const time = parts.slice(4).join(":");
    return `<tr>
      <td><a href="${f}">🩺 ${date}</a></td>
      <td>${time || "—"}</td>
      <td><a href="${f}">查看</a></td>
    </tr>`;
  }).join("\n");

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
  --yry-bg: rgba(22,22,32,1); --yry-bg-card: linear-gradient(159deg, rgba(38,38,52,1) 0%, rgba(34,34,46,1) 100%);
  --yry-accent: #FFC107; --yry-pass: #22c55e;
  --yry-text: rgba(250,250,252,1); --yry-text2: rgba(160,160,164,1); --yry-text3: rgba(110,110,114,1);
  --yry-radius: 12px; --yry-border: 1px solid rgba(255,255,255,0.06);
  --yry-shadow: 0 4px 20px rgba(0,0,0,0.3);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--yry-bg); color: var(--yry-text); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif; line-height: 1.6; min-height: 100vh; }
.hi-container { max-width: 800px; margin: 0 auto; padding: 48px 24px 80px; }
.hi-bc { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 24px; font-size: .76rem; }
.hi-bc a { color: var(--yry-cyan); text-decoration: none; }
.hi-bc a:hover { color: var(--yry-accent); }
.hi-bc .hi-bc-sep { color: var(--yry-text3); opacity: .4; }
.hi-bc .hi-bc-cur { color: var(--yry-text2); }
.hi-header { text-align: center; margin-bottom: 32px; }
.hi-header h1 { font-size: 1.6rem; }
.hi-header .hi-meta { color: var(--yry-text3); font-size: .82rem; margin-top: 6px; }
.hi-card { background: var(--yry-bg-card); border: var(--yry-border); border-radius: var(--yry-radius); padding: 24px; box-shadow: var(--yry-shadow); }
.hi-latest { text-align: center; padding: 16px; margin-bottom: 20px; background: rgba(255,193,7,.05); border-radius: 10px; border: var(--yry-border); }
.hi-latest-label { font-size: .78rem; color: var(--yry-text3); }
.hi-latest-score { font-size: 1.8rem; font-weight: 800; color: var(--yry-accent); margin: 0 4px; }
.hi-latest-grade { font-size: 1rem; font-weight: 700; color: var(--yry-pass); }
.hi-latest-date { display: block; font-size: .72rem; color: var(--yry-text3); margin-top: 4px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 10px 16px; text-align: left; border-bottom: var(--yry-border); font-size: .88rem; }
th { color: var(--yry-text3); font-size: .76rem; text-transform: uppercase; }
td a { color: var(--yry-cyan); text-decoration: none; }
td a:hover { color: var(--yry-accent); }
.hi-links { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px; justify-content: center; }
.hi-link { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; background: rgba(59,130,246,.08); border: 1px solid rgba(59,130,246,.15); color: var(--yry-cyan); text-decoration: none; font-size: .82rem; transition: all .15s; }
.hi-link:hover { background: rgba(59,130,246,.15); }
.hi-footer { text-align: center; color: var(--yry-text3); font-size: .74rem; margin-top: 48px; padding-top: 20px; border-top: var(--yry-border); }
</style>
</head>
<body>
<div class="hi-container">

<nav class="hi-bc">
  <a href="${CDN_DEPTH}docs/index.html">📄 文档中心</a>
  <span class="hi-bc-sep">/</span>
  <span class="hi-bc-cur">🩺 健康报告</span>
</nav>

<div class="hi-header">
  <h1>🩺 健康报告</h1>
  <div class="hi-meta">${files.length} 份历史报告</div>
</div>

${latestInfo}

<div class="hi-card">
  <table>
    <thead><tr><th>日期</th><th>时间</th><th>操作</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="3" style="color:var(--yry-text3)">暂无报告 — 运行 <code>node skills/rui-bot/send.mjs health --html</code> 生成首份报告</td></tr>'}</tbody>
  </table>
</div>

<div class="hi-links">
  <a class="hi-link" href="${CDN_DEPTH}docs/自循环报告/">📊 自循环报告</a>
  <a class="hi-link" href="${CDN_DEPTH}docs/故事任务面板/">📋 故事任务面板</a>
  <a class="hi-link" href="${CDN_DEPTH}docs/index.html">📄 文档中心</a>
</div>

<div class="hi-footer">
  健康报告索引<br>
  <span style="color:var(--yry-text3)">由 rui-bot health-report 自动生成</span>
</div>

</div>
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
