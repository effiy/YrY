/**
 * bot-health-cmd — cmdHealth: orchestrates all health dimensions into a composite score.
 * Extracted from send.mjs for module decomposition.
 */

import { join } from "node:path";
import { findProjectRoot } from "../../../lib/fs.mjs";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

import {
  MAX_MSG_LENGTH,
  HEALTH_SCORING_DIMENSIONS, HEALTH_DIM_WEIGHTS, HEALTH_DIM_LABELS,
  getSLOStatus, MS_PER_DAY, NOTIF_ROLLING_WINDOW_DAYS,
  DEFAULT_API_URL, API_PROBE_TIMEOUT_MS,
  API_HEALTH_L1_CONFIG_MAX, API_HEALTH_L2_PROBE_MAX, API_HEALTH_L3_HISTORY_MAX,
  API_HEALTH_L1_BOTH, API_HEALTH_L1_ONE, API_HEALTH_L1_NONE,
  API_HEALTH_L2_OK, API_HEALTH_L2_TIMEOUT, API_HEALTH_L2_ERROR,
  API_HEALTH_L3_FULL, API_HEALTH_L3_HIGH, API_HEALTH_L3_MID, API_HEALTH_L3_LOW,
  API_HEALTH_INDIRECT_EVIDENCE_MIN_SUCCESSES,
} from "../../../lib/constants.mjs";

import { loadConfig } from "./bot-transport.mjs";
import { FIELD_EMOJI } from "./bot-message.mjs";
import { scoreStatus, scoreIcon, PASS_THRESHOLD, WARN_THRESHOLD } from "./bot-health-analysis.mjs";
import { HEALTH_DIMENSIONS, healthBar, saveHealthTrend } from "./bot-health-trend.mjs";
import { getHealthTrend } from "./report-trend.mjs";
import { getGitSnapshot, runSecurityScan, getStructureHealth } from "./bot-health-structure.mjs";
import { assessEngineeringMaturity, scanComponentScores, avgScore } from "./bot-health-analysis.mjs";
import { getDiagnosticResult } from "./bot-health-diagnostics.mjs";
import { archScoresForTrend, appendArchTrend } from "../../../lib/arch-check.mjs";
import {
  contributionAnalysis,
  rankDimensionInfluence,
  generateExecutiveSummary,
  categoryScores,
  computeComposite,
  getGrade,
  classifyScore,
  scoreDistribution,
} from "../../../lib/scoring.mjs";
import { getFileSizeAnalysis } from "./bot-health-filesize.mjs";
import { getDependencyAnalysis } from "./bot-health-deps.mjs";

function registerDim(/** @type {Record<string, number>} */ scores, /** @type {any[]} */ details, /** @type {string} */ dim, /** @type {string} */ label, /** @type {any} */ info, /** @type {string} */ logLabel) {
  scores[dim] = info.score;
  details.push({ dim, label, status: scoreStatus(info.score), detail: info.summary, score: info.score });
  console.log(`  ${info.icon} ${logLabel} ${info.summary}`);
}

function validateMessageFormat() {
  const issues = [];

  // Check SKILL.md exists and has format constraints
  const skillPath = join(findProjectRoot(process.cwd()), "skills", "rui-bot", "SKILL.md");
  if (!existsSync(skillPath)) {
    return { formatOk: false, issues: ["SKILL.md 缺失"] };
  }

  const skillContent = readFileSync(skillPath, "utf-8");

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
    if (!(/** @type {any} */ (FIELD_EMOJI))[f]) {
      issues.push(`消息字段缺少 emoji: ${f}`);
    }
  }

  return { formatOk: issues.length === 0, issues };
}
export async function cmdHealth(/** @type {string} */ projectRoot, /** @type {any} */ _opts = {}) {
  const config = loadConfig(projectRoot);
  const token = process.env.API_X_TOKEN || "";
  /** @type {Record<string, number>} */
  const scores = {};
  const details = [];

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
  for (const [, cfg] of Object.entries(robots)) {
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

  // ── 4. API 可达性 (layered: config + probe + history) ───────────────
  // 三层评分: L1 配置(40) + L2 探测(30) + L3 历史投递(30)
  // 设计: 本地探测可能因环境 TCP 不可达失败, 但 L3 历史投递成功是 API 真实可达的间接证据
  //      —— 间接证据将 L2 从"环境超时 15"升级为"间接验证 30", 避免环境性故障拖累评分.
  const apiCfgUrl = config.api_url || `${DEFAULT_API_URL}/wework/send-message`;
  const apiTokenOk = !!(process.env.API_X_TOKEN);
  const apiUrlOk = !!apiCfgUrl;
  const apiL1 = apiUrlOk && apiTokenOk ? API_HEALTH_L1_BOTH
             : apiUrlOk || apiTokenOk ? API_HEALTH_L1_ONE
             : API_HEALTH_L1_NONE;

  // L3 先算: 历史投递成功率作为可达性的间接证据 (近 7 天 notification-log.jsonl)
  const apiLogPath = join(projectRoot, ".memory", "notification-log.jsonl");
  const apiCutoff = Date.now() - NOTIF_ROLLING_WINDOW_DAYS * MS_PER_DAY;
  let apiTotal = 0, apiOk = 0;
  if (existsSync(apiLogPath)) {
    try {
      const lines = readFileSync(apiLogPath, "utf-8").trim().split("\n").filter(Boolean);
      for (const line of lines) {
        const entry = JSON.parse(line);
        const ts = entry.timestamp ? new Date(entry.timestamp).getTime() : 0;
        if (ts < apiCutoff) continue;
        apiTotal++;
        if (entry.result === "ok") apiOk++;
      }
    } catch { /* skip unreadable log */ }
  }
  const apiRate = apiTotal > 0 ? apiOk / apiTotal : null;
  const apiL3 = apiRate === null ? API_HEALTH_L3_FULL
             : apiRate >= 0.95 ? API_HEALTH_L3_FULL
             : apiRate >= 0.80 ? API_HEALTH_L3_HIGH
             : apiRate >= 0.50 ? API_HEALTH_L3_MID
             : API_HEALTH_L3_LOW;
  const apiHasIndirectEvidence = apiOk >= API_HEALTH_INDIRECT_EVIDENCE_MIN_SUCCESSES;

  // L2: 直接探测, 超时时用 L3 间接证据升级
  let apiL2 = API_HEALTH_L2_ERROR;
  let apiProbeMsg = "未探测";
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), API_PROBE_TIMEOUT_MS);
    const res = await fetch(apiCfgUrl, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", "X-Token": process.env.API_X_TOKEN || "" },
      body: JSON.stringify({}),
    });
    clearTimeout(timer);
    apiL2 = API_HEALTH_L2_OK;
    apiProbeMsg = `HTTP ${res.status}`;
  } catch (err) {
    if (err.name === "AbortError" || /abort|ETIMEDOUT|ENETUNREACH|ECONN|fetch failed/i.test(err.message)) {
      if (apiHasIndirectEvidence) {
        apiL2 = API_HEALTH_L2_OK;
        apiProbeMsg = `本地超时, L3 间接验证可达 (${apiOk}/${apiTotal} 投递成功)`;
      } else {
        apiL2 = API_HEALTH_L2_TIMEOUT;
        apiProbeMsg = "本地环境不可达(超时/网络), 无 L3 证据";
      }
    } else {
      apiL2 = API_HEALTH_L2_ERROR;
      apiProbeMsg = err.message.slice(0, 80);
    }
  }

  scores.api = apiL1 + apiL2 + apiL3;
  const apiDetail = `L1配置 ${apiL1}/${API_HEALTH_L1_CONFIG_MAX} · L2探测 ${apiL2}/${API_HEALTH_L2_PROBE_MAX} (${apiProbeMsg}) · L3历史投递 ${apiL3}/${API_HEALTH_L3_HISTORY_MAX}${apiRate === null ? " (无记录)" : ` (${apiOk}/${apiTotal})`}`;
  details.push({
    dim: "api",
    label: "API 可达性",
    status: scores.api >= PASS_THRESHOLD ? "pass" : scores.api >= WARN_THRESHOLD ? "warn" : "fail",
    detail: apiDetail,
    score: scores.api,
  });
  const apiIcon = scores.api >= PASS_THRESHOLD ? "✅" : scores.api >= WARN_THRESHOLD ? "⚠️" : "❌";
  console.log(`  ${apiIcon} API 可达性:        ${apiDetail}`);

  // ── 5. Self-loop reports ──────────────────────────────
  const reportDir = join(projectRoot, "docs", "自循环报告");
  let reportScore = 0;
  let reportDetail = "";
  if (existsSync(reportDir)) {
    const reportFiles = readdirSync(reportDir).filter((/** @type {string} */ f) => f.endsWith(".html") && f !== "index.html");
    const indexOk = existsSync(join(reportDir, "index.html"));
    const recentCount = reportFiles.filter((/** @type {string} */ f) => {
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
  const { formatOk, issues: formatIssues } = validateMessageFormat();
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

  // ── 7. D0-D8 diagnostics (full engine) ────────────────
  const diagResult = getDiagnosticResult(projectRoot);
  scores.diagnostics = diagResult.score;
  const diagDetail = diagResult.skip
    ? diagResult.summary
    : `${diagResult.execCount} 条记录, ${diagResult.triggered.length}/8 诊断触发`;
  details.push({
    dim: "diagnostics",
    label: "D0-D8 诊断",
    status: scoreStatus(diagResult.score),
    detail: diagDetail,
    score: diagResult.score,
    diagnostics: diagResult.diagnostics,
    triggered: diagResult.triggered,
  });
  const diagIcon = diagResult.score >= PASS_THRESHOLD ? "✅" : diagResult.score >= WARN_THRESHOLD ? "⚠️" : diagResult.skip ? "⏭️" : "❌";
  const bootLabel = diagResult.bootstrapped ? " (Git 引导)" : "";
  console.log(`  ${diagIcon} D0-D8 诊断:       ${diagDetail}${bootLabel}`);
  if (diagResult.triggered?.length > 0) {
    for (const d of diagResult.triggered) {
      console.log(`    ⚠️ ${d.id} ${d.label}: ${d.evidence}`);
    }
  }

  // ── 8. Git repository state ──────────────────────────
  const gitInfo = getGitSnapshot(projectRoot);
  registerDim(scores, details, "git", "Git 仓库状态", gitInfo, "Git 仓库状态:    ");

  // ── 9. Security scan ──────────────────────────────────
  const secInfo = runSecurityScan(projectRoot);
  registerDim(scores, details, "security", "安全扫描", secInfo, "安全扫描:        ");

  // ── 10-16. Engineering maturity (rui-init §7) ────────────
  const emResult = assessEngineeringMaturity(projectRoot);
  Object.assign(scores, emResult.scores);
  for (const d of emResult.details) details.push(d);
  for (const [dim, info] of Object.entries(emResult.scores)) {
    const icon = scoreIcon(info);
    const label = (/** @type {any} */ (HEALTH_DIMENSIONS))[dim]?.label || dim;
    console.log(`  ${icon} ${label}:${" ".repeat(Math.max(0, 12 - label.length))} ${info} 分 — ${emResult.summaries[dim] || ""}`);
  }

  // ── 17. Structure analysis (大模块/大文件) ──────────────
  const structInfo = getStructureHealth(projectRoot);
  console.log(`  ${structInfo.icon} 结构健康:         ${structInfo.summary}`);

  // ── 18. File size analysis (文件体积) ────────────────────
  const fileSizeInfo = getFileSizeAnalysis(projectRoot);
  registerDim(scores, details, "file_size", "文件体积", fileSizeInfo, "文件体积:        ");

  // ── 19. Dependency analysis (系统组件依赖) ───────────────
  const depInfo = getDependencyAnalysis(projectRoot);
  registerDim(scores, details, "dep_analysis", "依赖分析", depInfo, "依赖分析:        ");
  if (depInfo.cycles.length > 0) {
    for (const cycle of depInfo.cycles.slice(0, 3)) {
      console.log(`    ⚠️ 循环依赖 (${cycle.length} 层): ${cycle.path.map((/** @type {string} */ p) => p.replace(/^skills\//,"").replace(/^lib\//,"")).join(" → ")}`);
    }
  }

  // ── Notification delivery quality (rolling window) ────────────
  const notifLogPath = join(projectRoot, ".memory", "notification-log.jsonl");
  const NOTIF_WINDOW_MS = NOTIF_ROLLING_WINDOW_DAYS * MS_PER_DAY;
  const notifCutoff = Date.now() - NOTIF_WINDOW_MS;
  let notifTotal = 0, notifOk = 0, notifRetries = 0;
  if (existsSync(notifLogPath)) {
    try {
      const lines = readFileSync(notifLogPath, "utf-8").trim().split("\n").filter(Boolean);
      for (const line of lines) {
        const entry = JSON.parse(line);
        const ts = entry.timestamp ? new Date(entry.timestamp).getTime() : 0;
        if (ts < notifCutoff) continue; // skip entries older than 7 days
        notifTotal++;
        if (entry.result === "ok") { notifOk++; }
        notifRetries += entry.retries || 0;
      }
    } catch { /* skip unreadable log */ }
  }
  const notifSuccessRate = notifTotal > 0 ? Math.round((notifOk / notifTotal) * 100) : 100;
  const notifAvgRetries = notifTotal > 0 ? (notifRetries / notifTotal).toFixed(1) : "0";
  const notifScore = notifTotal === 0 ? 100  // No deliveries yet = full score (no failures)
    : notifSuccessRate >= 100 ? 100
    : notifSuccessRate >= 95 ? 90
    : notifSuccessRate >= 80 ? 70
    : notifSuccessRate >= 50 ? 40
    : 20;
  const notifIcon = notifScore >= 90 ? "✅" : notifScore >= 70 ? "⚠️" : "❌";
  const notifDetail = notifTotal > 0
    ? `${notifOk}/${notifTotal} 成功 (${notifSuccessRate}%) · 均重试 ${notifAvgRetries} 次`
    : "暂无投递记录";
  scores.notify = notifScore;
  details.push({
    dim: "notify",
    label: "通知投递",
    status: notifScore >= 80 ? "pass" : notifScore >= 60 ? "warn" : "fail",
    detail: notifDetail,
    score: notifScore,
  });
  console.log(`  ${notifIcon} 通知投递质量:     ${notifDetail}`);

  // ── Architecture compliance check ──────────────────────
  let archResult = null;
  try {
    archResult = archScoresForTrend(projectRoot);
    appendArchTrend(projectRoot);
  } catch { /* best effort — arch check is non-critical */ }

  // ── Component quality (computed before composite) ────
  const compScores = scanComponentScores(projectRoot);
  const allComps = [...compScores.skills, ...compScores.agents, ...compScores.rules, ...compScores.scripts];
  const compQualScore = avgScore(allComps);
  const compPassCount = allComps.filter((c) => c.score >= 80).length;
  const compWarnCount = allComps.filter((c) => c.score >= 60 && c.score < 80).length;
  const compFailCount = allComps.filter((c) => c.score < 60).length;
  scores.comp_qual = compQualScore;

  // ── Composite score (weighted average) ─────────────────
  const composite = computeComposite(scores, HEALTH_DIM_WEIGHTS);
  const grade = getGrade(composite);

  // ── Previous trend for comparison ───────────────────────
  const prevTrendRaw = getHealthTrend();
  const prevEntry = prevTrendRaw.length >= 2 ? prevTrendRaw[prevTrendRaw.length - 2] : null;

  // ── Category sub-scores ──────────────────────────────────
  const catScores = categoryScores(scores, HEALTH_SCORING_DIMENSIONS);

  // ── Distribution statistics ──────────────────────────────
  const scoreValues = Object.values(scores).filter(s => typeof s === "number");
  const dist = scoreDistribution(scoreValues);
  const tierCounts = { excellent: 0, good: 0, fair: 0, poor: 0 };
  scoreValues.forEach(s => { tierCounts[classifyScore(s)]++; });

  // ── Contribution analysis ────────────────────────────────
  const contrib = contributionAnalysis(scores, HEALTH_DIM_WEIGHTS);

  // ── Output: Header ─────────────────────────────────────
  const catIcons = { core: "⚙️", structural: "📏", engineering: "🔧", quality: "🧩" };
  const catLabels = { core: "核心运营", structural: "结构健康", engineering: "工程成熟度", quality: "组件质量" };

  console.log("");
  console.log("  ┌──────────────────────────────────────────┐");
  const sloStatus = getSLOStatus(composite, { decliningStreak: 0 });
  const sloExtra = sloStatus.level !== "ok" ? ` ⚡${sloStatus.ansi}${sloStatus.label}\x1b[0m` : "";
  console.log(`  │ 综合健康度: ${grade.ansi}${composite} 分 / ${grade.grade} 级 — ${grade.label}\x1b[0m${sloExtra}    │`);
  console.log(`  │ ${healthBar(composite, 36)} │`);
  console.log("  ├──────────────────────────────────────────┤");
  // Category breakdown line
  const catLine = Object.entries(catScores)
    .filter(([,v]) => v.dimCount > 0)
    .map(([cat, v]) => {
      const icon = (/** @type {any} */ (catIcons))[cat] || "📌";
      const color = v.score >= 80 ? "\x1b[32m" : v.score >= 60 ? "\x1b[33m" : "\x1b[31m";
      return `${icon}${(/** @type {any} */ (catLabels))[cat]||cat}:${color}${v.score}\x1b[0m`;
    }).join("  ");
  console.log(`  │ ${catLine}${" ".repeat(Math.max(0, 34 - catLine.replace(/\x1b\[[0-9;]*m/g, "").length))}│`);
  console.log("  └──────────────────────────────────────────┘");
  console.log("");

  // ── Executive summary ──────────────────────────────────
  const execSummary = generateExecutiveSummary({
    composite, grade: grade.grade, scores,
    dimensions: HEALTH_SCORING_DIMENSIONS,
    prev: prevEntry ? { composite: prevEntry.composite, date: prevEntry.timestamp?.slice(0, 10) } : undefined,
    archResult: archResult ? { archFailedDims: archResult.archFailedDims } : undefined,
    diagTriggered: diagResult?.triggered?.length || 0,
  });
  console.log(`  📋 ${execSummary.summary}`);
  console.log("");

  // ── Output: Stats row ──────────────────────────────────
  console.log(`  📊 维度: ${scoreValues.length}项  │  均值 ${dist.mean}  │  中位 ${dist.median}  │  范围 ${dist.min}-${dist.max}  │  标准差 ${dist.stddev}`);
  const G = "\x1b[32m", Y = "\x1b[33m", R = "\x1b[31m";
  console.log(`  🏷️  等级: ${G}优秀 ${tierCounts.excellent}\x1b[0m · ${G}良好 ${tierCounts.good}\x1b[0m · ${Y}一般 ${tierCounts.fair}\x1b[0m · ${R}需关注 ${tierCounts.poor}\x1b[0m`);
  if (contrib.topDrag.length > 0) {
    const top3 = contrib.topDrag.slice(0, 3);
    const dragStr = top3.map(e => `${HEALTH_DIM_LABELS[e.dim] || e.dim}:${e.score}分`).join(" · ");
    const potential = Math.min(100, composite + Math.round(contrib.dragTotal));
    console.log(`  🎯 拖分 Top3: ${dragStr}  → 修复可达 ${potential} 分`);
  }

  // Dimension influence ranking
  const influence = rankDimensionInfluence(scores, HEALTH_SCORING_DIMENSIONS, undefined);
  if (influence.length > 0) {
    const topInf = influence.slice(0, 5);
    const infStr = topInf.map(e => `${e.label}:${e.influence.toFixed(0)}`).join(" · ");
    console.log(`  📐 影响力 Top5: ${infStr}`);
  }
  console.log("");

  // ── Output: Component quality ──────────────────────────
  details.push({
    dim: "comp_qual",
    label: "组件质量",
    status: scoreStatus(compQualScore),
    detail: `${allComps.length} 组件均分 ${compQualScore} · 优秀 ${compPassCount} / 一般 ${compWarnCount} / 待改进 ${compFailCount}`,
    score: compQualScore,
  });
  console.log(`  ${scoreIcon(compQualScore)} 组件质量:         ${compQualScore} 分 — ${allComps.length} 组件 (Skills ${compScores.skills.length} · Agents ${compScores.agents.length} · Rules ${compScores.rules.length} · Scripts ${compScores.scripts.length})`);

  if (archResult) {
    const archIcon = archResult.archComposite >= 90 ? "✅" : archResult.archComposite >= 75 ? "⚠️" : "❌";
    const failedList = archResult.archFailedDims?.length > 0
      ? ` · 失败: ${archResult.archFailedDims.slice(0, 3).join(", ")}${archResult.archFailedDims.length > 3 ? "…" : ""}`
      : " · 全部通过";
    console.log(`  ${archIcon} 架构合规:         ${archResult.archComposite} 分 / ${archResult.archGrade} 级 — ${archResult.archFailedDims?.length || 0} 维度失败${failedList}`);
  }

  // ── Score diff vs previous check ─────────────────────────
  if (prevEntry) {
    const prevComposite = prevEntry.composite;
    const diff = composite - prevComposite;
    const diffIcon = diff > 2 ? "📈" : diff < -2 ? "📉" : "➡️";
    const diffColor = diff > 2 ? "\x1b[32m" : diff < -2 ? "\x1b[31m" : "";
    console.log(`  ${diffIcon} 对比上次: ${diffColor}${diff > 0 ? "+" : ""}${diff}\x1b[0m 分 (${prevComposite} → ${composite})`);

    // Find top 3 dimension changes
    const dimChanges = [];
    for (const dim of Object.keys(scores)) {
      const prevScore = prevEntry.scores?.[dim];
      if (prevScore !== undefined && scores[dim] !== prevScore) {
        dimChanges.push({ dim, prev: prevScore, curr: scores[dim], diff: scores[dim] - prevScore });
      }
    }
    dimChanges.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
    if (dimChanges.length > 0) {
      const topChanges = dimChanges.slice(0, 3);
      const changeStr = topChanges.map(c => {
        const label = HEALTH_DIM_LABELS[c.dim] || c.dim;
        const arrow = c.diff > 0 ? "↑" : "↓";
        return `${label}${arrow}${Math.abs(c.diff)}`;
      }).join(" · ");
      console.log(`    维度变化: ${changeStr}`);
    }
  }

  // ── Output: Dimension breakdown by category ─────────────
  /** @type {Record<string, any[]>} */
  const dimByCat = {};
  for (const [dim, cfg] of Object.entries(HEALTH_SCORING_DIMENSIONS)) {
    const cat = cfg.category || "other";
    if (!dimByCat[cat]) dimByCat[cat] = [];
    dimByCat[cat].push({ dim, label: cfg.label, score: scores[dim] ?? 0 });
  }
  const catOrder = ["core", "structural", "engineering", "quality"];
  for (const cat of catOrder) {
    const dims = dimByCat[cat];
    if (!dims || dims.length === 0) continue;
    const catIcon = (/** @type {any} */ (catIcons))[cat] || "📌";
    const catLabel = (/** @type {any} */ (catLabels))[cat] || cat;
    console.log(`  ${catIcon} ${catLabel}:`);
    for (const d of dims) {
      const bar = healthBar(d.score, 10);
      console.log(`    ${d.label.padEnd(14)} ${bar} ${d.score} 分`);
    }
    console.log("");
  }

  const result = { composite, grade: grade.grade, scores, details, diagnostics: diagResult, config, tokenOk, robotOkCount, robotNames, gitInfo, secInfo, structInfo, fileSizeInfo, depInfo, compScores, archResult };
  saveHealthTrend(result, projectRoot);

  // Regenerate self-improve summary after each health check
  try {
    const { generateSummary } = await import("../../../lib/selfimprove-generator.mjs");
    generateSummary(projectRoot);
  } catch { /* best effort — summary generation is non-critical */ }

  // Auto-update CDN health report
  try {
    updateCdnHealthReport(result, projectRoot);
  } catch { /* best effort — CDN report is non-critical */ }

  return result;
}

/**
 * Auto-update cdn/health\-report\/index\.json with the latest project health data.
 * Preserves existing entries (dedup by date), keeps at most 10 reports.
 */
function updateCdnHealthReport(/** @type {any} */ result, /** @type {string} */ projectRoot) {
  const cdnPath = join(projectRoot, "cdn", "health-report", "index.json");
  /** @type {{ _meta: { updatedAt?: string }, reports: Array<{date:string,time:string,type:string,score:number,grade:string,triggers:number,dimTotal:number,dims:object}> }} */
  let report = { _meta: {}, reports: [] };

  if (existsSync(cdnPath)) {
    try {
      report = JSON.parse(readFileSync(cdnPath, "utf-8"));
    } catch { report = { _meta: {}, reports: [] }; }
  }

  // Map project health dims to CDN-compatible format
  /** @type {Record<string, any>} */
  const dims = {};
  for (const [dim, score] of Object.entries(result.scores || {})) {
    dims[dim] = {
      score,
      detail: result.details?.find((/** @type {any} */ d) => d.dim === dim)?.detail || `${score} 分`,
    };
  }

  const today = new Date().toISOString().slice(0, 10);
  const entry = {
    date: today,
    time: new Date().toISOString().slice(0, 19).replace("T", " "),
    type: "project",
    score: result.composite,
    grade: result.grade,
    triggers: result.diagnostics?.triggered?.length || 0,
    dimTotal: Object.keys(dims).length,
    dims,
  };

  // Dedup: replace same-date project entry
  const reports = (report.reports || []).filter(
    r => !(r.date === today && r.type === "project")
  );
  reports.unshift(entry);
  report.reports = reports.slice(0, 10);
  report._meta.updatedAt = today;

  writeFileSync(cdnPath, JSON.stringify(report, null, 2) + "\n", "utf-8");
}
