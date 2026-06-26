/**
 * bot-message — Notification message building: rich/verbose blocks, story stats, health notifications.
 * Extracted from send.mjs for module decomposition.
 */

import { join } from "node:path";
import { existsSync, readdirSync, statSync } from "node:fs";

import {
  MAX_MSG_LENGTH, STORY_PANEL_DIR,
} from "../../../lib/constants.mjs";
import { nowDate, nowISO, fmtDisplay } from "../../../lib/fs.mjs";

import { getDiagnosticResult } from "./bot-health-diagnostics.mjs";
import { HEALTH_DIMENSIONS } from "./bot-health-trend.mjs";

const STATUS_EMOJI = {
  complete: "✅",
  blocked: "🚫",
  "gate-fail": "🔍",
  progress: "⏳",
};

const STATUS_LABELS = {
  complete: "完成",
  blocked: "阻断",
  "gate-fail": "门禁失败",
  progress: "进行中",
};

export const FIELD_EMOJI = {
  skill: "🤖",
  command: "📋",
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

/**
 * Make a unicode block-character progress bar.
 * @param {number} percent - 0-100
 * @param {number} width - bar width in characters (default 20)
 * @returns {string} e.g., "████████░░░░░░░░░░░░"
 */
export function makeProgressBar(percent, width = 20) {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.round((clamped / 100) * width);
  const empty = width - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

/**
 * Compute progress percentage from current/total stage or step counts.
 * @returns {number|null}
 */
export function computeProgressPercent(/** @type {any} */ opts) {
  if (opts.currentStage && opts.totalStages) {
    const cs = parseInt(opts.currentStage, 10);
    const ts = parseInt(opts.totalStages, 10);
    if (!isNaN(cs) && !isNaN(ts) && ts > 0) {
      return Math.round((cs / ts) * 100);
    }
  }
  if (opts.completedSteps && opts.totalSteps) {
    const done = parseInt(opts.completedSteps, 10);
    const total = parseInt(opts.totalSteps, 10);
    if (!isNaN(done) && !isNaN(total) && total > 0) {
      return Math.round((done / total) * 100);
    }
  }
  return null;
}

/**
 * Truncate message to MAX_MSG_LENGTH, appending ... if truncated.
 */
export function truncateMsg(/** @type {string} */ msg) {
  return msg.length > MAX_MSG_LENGTH ? msg.slice(0, MAX_MSG_LENGTH - 3) + "..." : msg;
}

/**
 * Compute story statistics from the story directory.
 * Scans scene directories and determines completion + last activity.
 * @returns {{ totalScenes: number, completedScenes: number, lastActivity: string }|null}
 */
export function computeStoryStats(/** @type {string} */ projectRoot, /** @type {string} */ storyName) {
  const storyDir = join(projectRoot, STORY_PANEL_DIR, storyName);
  if (!existsSync(storyDir)) return null;

  let totalScenes = 0;
  let completedScenes = 0;
  let latestMs = 0;

  try {
    const entries = readdirSync(storyDir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isDirectory() || !/^场景-\d+-/.test(e.name)) continue;
      totalScenes++;
      const sceneDir = join(storyDir, e.name);

      // Completion evidence: implementation artifacts exist
      const hasEvidence = existsSync(join(sceneDir, "审查.html"))
                       || existsSync(join(sceneDir, "测试面板.html"))
                       || existsSync(join(sceneDir, "源码.html"));
      if (hasEvidence) completedScenes++;

      // Track latest mtime across all scene files
      try {
        const sceneFiles = readdirSync(sceneDir);
        for (const f of sceneFiles) {
          try {
            const s = statSync(join(sceneDir, f));
            if (s.mtimeMs > latestMs) latestMs = s.mtimeMs;
          } catch { /* skip unreadable */ }
        }
      } catch { /* skip unreadable scene */ }
    }
  } catch {
    return null;
  }

  const lastActivity = latestMs > 0 ? new Date(latestMs).toISOString().slice(0, 10) : "";

  return { totalScenes, completedScenes, lastActivity };
}

/**
 * Build a rich visual pipeline block.
 * Returns an array of lines (no trailing newline).
 */
export function buildRichBlock(/** @type {any} */ opts, /** @type {string} */ emoji) {
  const lines = [];
  const pct = computeProgressPercent(opts);

  lines.push("┌─ Pipeline ──────────────────");

  if (pct !== null) {
    lines.push(`│ ${makeProgressBar(pct, 18)} ${pct}%`);
  }

  if (opts.currentStage && opts.totalStages) {
    const stageName = opts.stage || (opts.status === "complete" ? "完成" : "进行中…");
    lines.push(`│ 阶段 ${opts.currentStage}/${opts.totalStages}: ${stageName} ${emoji}`);
  } else if (opts.stage) {
    lines.push(`│ ${opts.stage} ${emoji}`);
  } else {
    lines.push(`│ ${(/** @type {any} */ (STATUS_LABELS))[opts.status] || "运行中"} ${emoji}`);
  }

  if (opts.timing) {
    lines.push(`│ 耗时: ${opts.timing}`);
  }

  const p0 = opts.p0Count || "0";
  const p1 = opts.p1Count || "0";
  const p2 = opts.p2Count || "0";
  lines.push(`│ P0: ${p0}  P1: ${p1}  P2: ${p2}`);

  lines.push("└────────────────────────────");
  return lines;
}

/**
 * Build a verbose diagnostic summary block.
 */
export function buildVerboseBlock(/** @type {any} */ opts, /** @type {string} */ projectRoot) {
  const lines = [];
  lines.push("┌─ 诊断概要 ──────────────────");

  if (opts.diagSummary) {
    // Support \\n as line separator for shell-passed args
    const diagLines = opts.diagSummary.replace(/\\n/g, "\n").split("\n").filter(Boolean);
    for (const dl of diagLines) {
      lines.push(`│ ${dl}`);
    }
  } else if (projectRoot) {
    // Auto-compute light diagnostic summary when projectRoot available
    try {
      const diagResult = getDiagnosticResult(projectRoot);
      const triggered = diagResult.triggered || [];
      if (diagResult.skip || triggered.length === 0) {
        lines.push("│ D0-D8: 无异常");
      } else {
        for (const d of triggered) {
          lines.push(`│ ${d.id}: ${d.label}`);
        }
      }
    } catch {
      lines.push("│ 诊断数据不可用");
    }
  }

  if (opts.fcCount) {
    lines.push(`│ 变更文件: ${opts.fcCount} 个`);
  }

  if (opts.testSummary) {
    lines.push(`│ 测试: ${opts.testSummary}`);
  }

  if (opts.reportLink) {
    lines.push(`│ 完整报告: ${opts.reportLink}`);
  }

  lines.push("└────────────────────────────");
  return lines;
}

/**
 * Build a story statistics block.
 */
export function buildStoryStatsBlock(/** @type {any} */ stats, /** @type {string} */ storyName, /** @type {number} */ p0Count, /** @type {number} */ p1Count, /** @type {number} */ p2Count) {
  const lines = [];
  lines.push(`┌─ 故事统计: ${storyName} ────────`);

  if (stats.totalScenes > 0) {
    lines.push(`│ 场景: ${stats.completedScenes}/${stats.totalScenes} 完成`);
  }

  const p0 = p0Count || "0";
  const p1 = p1Count || "0";
  const p2 = p2Count || "0";
  lines.push(`│ P0: ${p0}  P1: ${p1}  P2: ${p2}`);

  if (stats.lastActivity) {
    lines.push(`│ 最近活动: ${stats.lastActivity}`);
  }

  lines.push("└────────────────────────────");
  return lines;
}

export function buildMessage(/** @type {any} */ opts, /** @type {string} */ projectName, /** @type {string} */ projectRoot) {
  // When raw content is provided, still enforce skill + command prefix
  if (opts.content) {
    // Unescape shell-passed newlines
    const content = opts.content.replace(/\\n/g, "\n");
    const header = `【${projectName}】`;
    const prefixLines = [];
    if (opts.skill) prefixLines.push(`${FIELD_EMOJI.skill} 技能: ${opts.skill}`);
    if (opts.command) prefixLines.push(`${FIELD_EMOJI.command} 命令: ${opts.command}`);
    const prefix = prefixLines.length > 0 ? prefixLines.join("\n") + "\n" : "";
    const msg = `${header}\n${prefix}${content}`;
    return truncateMsg(msg);
  }

  const lines = [`【${projectName}】`];
  const emoji = (/** @type {any} */ (STATUS_EMOJI))[opts.status] || STATUS_EMOJI.complete;
  const label = (/** @type {any} */ (STATUS_LABELS))[opts.status] || STATUS_LABELS.complete;
  const storyCtx = opts.story ? `故事 ${opts.story}` : "当前项目";
  const dateStr = nowDate();

  // Constraint #7: skill + command must be first two lines after project header
  lines.push(`${FIELD_EMOJI.skill} 技能: ${opts.skill || "rui"}`);
  lines.push(`${FIELD_EMOJI.command} 命令: ${opts.command || "—"}`);

  // ---- Rich visual block (if enabled) ----
  if (opts.rich) {
    lines.push("");
    lines.push(...buildRichBlock(opts, emoji));
  }

  // All required fields with smart defaults — never bare
  let conclusion;
  if (opts.conclusion) {
    conclusion = opts.conclusion;
  } else if (opts.status === "progress") {
    const cs = opts.currentStage || "?";
    const ts = opts.totalStages || "?";
    conclusion = `阶段 ${cs}/${ts}: ${opts.stage || "进行中…"}`;
  } else {
    conclusion = `${label} ${storyCtx}${opts.stage ? ` ${opts.stage} 阶段` : ""}`;
  }

  const description = opts.description || `${storyCtx} 管线${label}`;
  const scope = opts.scope || (opts.story ? `docs/故事任务面板/${opts.story}/` : "—");
  const nextStep = opts.nextStep || (opts.status === "blocked" ? "修复后重跑同命令续跑" : "继续下一阶段");
  const impact = opts.impact || (opts.story ? `docs/故事任务面板/${opts.story}/` : "—");
  const evidence = opts.evidence || (opts.story ? ".memory/rui-state.json" : "—");
  const session = opts.session || dateStr;

  // Insert blank line between rich block and standard fields
  if (opts.rich) lines.push("");

  lines.push(`${FIELD_EMOJI.conclusion} 结论: ${conclusion}`);
  lines.push(`${FIELD_EMOJI.description} 描述: ${description}`);
  lines.push(`${FIELD_EMOJI.scope} 范围: ${scope}`);

  // Scenario-specific fields
  if (opts.status === "blocked") {
    lines.push(`${FIELD_EMOJI.reason} 原因: ${opts.reason || "见 rui-state.json"}`);
    lines.push(`${FIELD_EMOJI.recovery} 恢复点: ${opts.recovery || opts.stage || opts.story || "—"}`);
  }
  if (opts.status === "gate-fail") {
    lines.push(`${FIELD_EMOJI.gate} 门禁: ${opts.gate || "—"}`);
    lines.push(`${FIELD_EMOJI.result} 结果: ${opts.gateResult || "—"}`);
  }
  if (opts.status === "progress") {
    if (opts.completedSteps || opts.totalSteps) {
      lines.push(`📊 进度: ${opts.completedSteps || "?"}/${opts.totalSteps || "?"} 步骤已完成`);
    }
    if (opts.timing) {
      lines.push(`⏱️ 耗时: ${opts.timing}`);
    }
  }

  lines.push(`${FIELD_EMOJI.nextStep} 下一步: ${nextStep}`);
  lines.push(`${FIELD_EMOJI.impact} 影响: ${impact}`);
  lines.push(`${FIELD_EMOJI.evidence} 证据: ${evidence}`);
  lines.push(`${FIELD_EMOJI.session} 会话: ${session}`);

  // Detail section with file stats
  if (opts.fileStats) {
    lines.push("");
    lines.push("———");
    lines.push("");
    lines.push(`变更统计: ${opts.fileStats}`);
  }

  // ---- Story statistics (auto-computed when --story + --rich) ----
  if (opts.story && opts.rich && projectRoot) {
    const stats = computeStoryStats(projectRoot, opts.story);
    if (stats && (stats.totalScenes > 0 || stats.lastActivity)) {
      lines.push("");
      lines.push("———");
      lines.push("");
      lines.push(...buildStoryStatsBlock(stats, opts.story, opts.p0Count, opts.p1Count, opts.p2Count));
    }
  }

  // ---- Verbose diagnostic block (if enabled) ----
  if (opts.verbose) {
    lines.push("");
    lines.push("———");
    lines.push("");
    lines.push(...buildVerboseBlock(opts, projectRoot));
  }

  // ---- Summary footer ----
  const ts = fmtDisplay(nowISO());
  const sessionId = (Math.random() + 1).toString(36).substring(2, 8);
  lines.push("");
  lines.push(`└─ ${ts} · sid:${sessionId}`);

  return truncateMsg(lines.join("\n"));
}

/**
 * Build a health-check-specific notification message.
 */
export function buildHealthNotification(/** @type {any} */ hr, /** @type {string} */ projectName) {
  const lines = [`【${projectName}】`];
  const dateStr = nowDate();

  lines.push(`${FIELD_EMOJI.skill} 技能: rui-bot`);
  lines.push(`${FIELD_EMOJI.command} 命令: health`);

  const gradeEmoji = hr.grade === "A" ? "✅" : hr.grade === "B" ? "✅" : hr.grade === "C" ? "⚠️" : "🚫";
  lines.push(`🩺 健康度: ${hr.composite} 分 / ${hr.grade} 级 ${gradeEmoji}`);

  // Triggered diagnostics summary
  if (hr.diagnostics?.triggered?.length > 0) {
    const diagSummary = hr.diagnostics.triggered.map((/** @type {any} */ d) => `${d.id} ${d.label}`).join(", ");
    lines.push(`⚠️ 触发诊断: ${diagSummary}`);
  } else {
    lines.push(`✅ D0-D8: 全部通过`);
  }

  // Dimension highlights — only show warnings/failures
  const warnings = [];
  for (const [dim, label] of Object.entries({
    token: "Token", config: "配置", robots: "机器人", api: "API",
    reports: "报告", format: "格式", diagnostics: "诊断",
  })) {
    const s = hr.scores[dim];
    if (s !== undefined && s < 80) warnings.push(`${label} ${s}分`);
  }
  if (warnings.length > 0) {
    lines.push(`📊 关注维度: ${warnings.join(", ")}`);
  }

  lines.push(`${FIELD_EMOJI.evidence} 报告: docs/健康报告/`);
  lines.push(`${FIELD_EMOJI.session} 检查时间: ${dateStr}`);

  const msg = lines.join("\n");
  return msg.length > MAX_MSG_LENGTH ? msg.slice(0, MAX_MSG_LENGTH - 3) + "..." : msg;
}

/**
 * Build a health ALERT notification — more urgent format for below-threshold scores.
 */
export function buildHealthAlertNotification(/** @type {any} */ hr, /** @type {string} */ projectName, /** @type {number} */ threshold) {
  const lines = [`【${projectName}】🚨 健康告警`];
  const dateStr = nowDate();

  lines.push(`${FIELD_EMOJI.skill} 技能: rui-bot`);
  lines.push(`${FIELD_EMOJI.command} 命令: health --alert`);

  const gradeEmoji = hr.grade === "D" ? "🔴" : "🟡";
  lines.push(`🩺 健康度: ${hr.composite} 分 / ${hr.grade} 级 ${gradeEmoji} (阈值 ${threshold})`);

  // Worst dimensions (below 60)
  const critical = [];
  const warnings = [];
  for (const [dim, cfg] of Object.entries(HEALTH_DIMENSIONS)) {
    const s = hr.scores[dim];
    if (s !== undefined && s < 40) critical.push(`${cfg.label} ${s}分`);
    else if (s !== undefined && s < 70) warnings.push(`${cfg.label} ${s}分`);
  }

  if (critical.length > 0) {
    lines.push(`🔴 严重: ${critical.join(", ")}`);
  }
  if (warnings.length > 0) {
    lines.push(`🟡 警告: ${warnings.join(", ")}`);
  }

  // Triggered diagnostics
  if (hr.diagnostics?.triggered?.length > 0) {
    const diagSummary = hr.diagnostics.triggered.map((/** @type {any} */ d) => `${d.id} ${d.label}`).join(", ");
    lines.push(`⚠️ 触发诊断: ${diagSummary}`);
  }

  // Git info if problematic
  if (hr.gitInfo && hr.gitInfo.uncommitted > 20) {
    lines.push(`📦 Git: ${hr.gitInfo.uncommitted} 个未提交文件`);
  }

  lines.push(`${FIELD_EMOJI.evidence} 报告: docs/健康报告/`);
  lines.push(`${FIELD_EMOJI.session} 告警时间: ${dateStr}`);
  lines.push("");
  lines.push("💡 建议: 运行 node skills/rui-bot/send.mjs health --html 查看完整报告");

  const msg = lines.join("\n");
  return msg.length > MAX_MSG_LENGTH ? msg.slice(0, MAX_MSG_LENGTH - 3) + "..." : msg;
}
