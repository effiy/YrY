/**
 * bot-health-cmd — cmdHealth: orchestrates all health dimensions into a composite score.
 * Extracted from send.mjs for module decomposition.
 */

import { join } from "node:path";
import { findProjectRoot } from "../../../lib/fs.mjs";
import { existsSync, readFileSync, readdirSync } from "node:fs";

import {
  HTTP_TIMEOUT_SHORT_MS, MAX_RETRIES, MAX_MSG_LENGTH,
  HEALTH_SCORING_DIMENSIONS, HEALTH_DIM_WEIGHTS, HEALTH_DIM_LABELS,
} from "../../../lib/constants.mjs";

import { API_URL_DEFAULT, loadConfig } from "./bot-transport.mjs";
import { FIELD_EMOJI } from "./bot-message.mjs";
import { scoreStatus, scoreIcon, PASS_THRESHOLD, WARN_THRESHOLD } from "./bot-health-analysis.mjs";
import { HEALTH_DIMENSIONS, HEALTH_GRADE, healthBar, saveHealthTrend } from "./bot-health-trend.mjs";
import { getGitSnapshot, runSecurityScan, getStructureHealth } from "./bot-health-structure.mjs";
import { assessEngineeringMaturity, scanComponentScores, avgScore } from "./bot-health-analysis.mjs";
import { getDiagnosticResult } from "./bot-health-diagnostics.mjs";
import {
  contributionAnalysis,
  categoryScores,
  computeComposite,
  getGrade,
  classifyScore,
  scoreDistribution,
} from "../../../lib/scoring.mjs";
import { getFileSizeAnalysis } from "./bot-health-filesize.mjs";
import { getDependencyAnalysis } from "./bot-health-deps.mjs";

function registerDim(scores, details, dim, label, info, logLabel) {
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
    if (!FIELD_EMOJI[f]) {
      issues.push(`消息字段缺少 emoji: ${f}`);
    }
  }

  return { formatOk: issues.length === 0, issues };
}
export async function cmdHealth(projectRoot, opts = {}) {
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
    status: scoreStatus(diagResult.score),
    detail: diagDetail,
    score: diagResult.score,
    diagnostics: diagResult.diagnostics,
    triggered: diagResult.triggered,
  });
  const diagIcon = diagResult.score >= PASS_THRESHOLD ? "✅" : diagResult.score >= WARN_THRESHOLD ? "⚠️" : diagResult.skip ? "⏭️" : "❌";
  const bootLabel = diagResult.bootstrapped ? " (Git 引导)" : "";
  console.log(`  ${diagIcon} D0-D7 诊断:       ${diagDetail}${bootLabel}`);
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
    const label = HEALTH_DIMENSIONS[dim]?.label || dim;
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
      console.log(`    ⚠️ 循环依赖 (${cycle.length} 层): ${cycle.path.map((p) => p.replace(/^skills\//,"").replace(/^lib\//,"")).join(" → ")}`);
    }
  }

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
  console.log(`  │ 综合健康度: ${grade.ansi}${composite} 分 / ${grade.grade} 级 — ${grade.label}\x1b[0m    │`);
  console.log(`  │ ${healthBar(composite, 36)} │`);
  console.log("  ├──────────────────────────────────────────┤");
  // Category breakdown line
  const catLine = Object.entries(catScores)
    .filter(([,v]) => v.dimCount > 0)
    .map(([cat, v]) => {
      const icon = catIcons[cat] || "📌";
      const color = v.score >= 80 ? "\x1b[32m" : v.score >= 60 ? "\x1b[33m" : "\x1b[31m";
      return `${icon}${catLabels[cat]||cat}:${color}${v.score}\x1b[0m`;
    }).join("  ");
  console.log(`  │ ${catLine}${" ".repeat(Math.max(0, 34 - catLine.replace(/\x1b\[[0-9;]*m/g, "").length))}│`);
  console.log("  └──────────────────────────────────────────┘");
  console.log("");

  // ── Output: Stats row ──────────────────────────────────
  const statColor = (s, t) => s >= 80 ? "\x1b[32m" : s >= 60 ? "\x1b[33m" : "\x1b[31m";
  console.log(`  📊 维度: ${scoreValues.length}项  │  均值 ${dist.mean}  │  中位 ${dist.median}  │  范围 ${dist.min}-${dist.max}  │  标准差 ${dist.stddev}`);
  const G = "\x1b[32m", Y = "\x1b[33m", R = "\x1b[31m";
  console.log(`  🏷️  等级: ${G}优秀 ${tierCounts.excellent}\x1b[0m · ${G}良好 ${tierCounts.good}\x1b[0m · ${Y}一般 ${tierCounts.fair}\x1b[0m · ${R}需关注 ${tierCounts.poor}\x1b[0m`);
  if (contrib.topDrag.length > 0) {
    const top3 = contrib.topDrag.slice(0, 3);
    const dragStr = top3.map(e => `${HEALTH_DIM_LABELS[e.dim] || e.dim}:${e.score}分`).join(" · ");
    const potential = Math.min(100, composite + Math.round(contrib.dragTotal));
    console.log(`  🎯 拖分 Top3: ${dragStr}  → 修复可达 ${potential} 分`);
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

  // ── Output: Dimension breakdown by category ─────────────
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
    const catIcon = catIcons[cat] || "📌";
    const catLabel = catLabels[cat] || cat;
    console.log(`  ${catIcon} ${catLabel}:`);
    for (const d of dims) {
      const bar = healthBar(d.score, 10);
      console.log(`    ${d.label.padEnd(14)} ${bar} ${d.score} 分`);
    }
    console.log("");
  }

  const result = { composite, grade: grade.grade, scores, details, diagnostics: diagResult, config, tokenOk, robotOkCount, robotNames, gitInfo, secInfo, structInfo, fileSizeInfo, depInfo, compScores };
  saveHealthTrend(result, projectRoot);

  // Regenerate self-improve summary after each health check
  try {
    const { generateSummary } = await import("../../../lib/selfimprove-generator.mjs");
    generateSummary(projectRoot);
  } catch { /* best effort — summary generation is non-critical */ }

  return result;
}
