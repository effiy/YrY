/**
 * bot-health-trend — Trend persistence and display helpers.
 * Extracted from send.mjs for module decomposition.
 *
 * Scoring dimensions, weights, labels, and grade thresholds are imported
 * from the canonical source: lib/constants.mjs.
 */

import { join } from "node:path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";

import { avgScore } from "./bot-health-analysis.mjs";
import {
  HEALTH_SCORING_DIMENSIONS,
  HEALTH_GRADE_THRESHOLDS,
} from "../../../lib/constants.mjs";

export const HEALTH_TREND_FILE = ".memory/health-trend.jsonl";

// Re-export from canonical source for backward compatibility
export { HEALTH_SCORING_DIMENSIONS as HEALTH_DIMENSIONS };
export { HEALTH_GRADE_THRESHOLDS as HEALTH_GRADE };

export function scoreEmoji(/** @type {number} */ score) {
  if (score >= 90) return "✅";
  if (score >= 75) return "✅";
  if (score >= 60) return "⚠️";
  return "❌";
}

export function healthBar(/** @type {number} */ score, width = 20) {
  const filled = Math.round((score / 100) * width);
  const empty = width - filled;
  const color = score >= 75 ? "\x1b[32m" : score >= 60 ? "\x1b[33m" : "\x1b[31m";
  return `${color}${"█".repeat(filled)}\x1b[90m${"░".repeat(empty)}\x1b[0m`;
}

export function saveHealthTrend(/** @type {any} */ result, /** @type {string} */ projectRoot) {
  try {
    const entry = {
      timestamp: new Date().toISOString(),
      composite: result.composite,
      grade: result.grade,
      scores: result.scores,
      bootstrapped: result.diagnostics?.bootstrapped || false,
      triggeredDiags: (result.diagnostics?.triggered || []).map((/** @type {any} */ d) => d.id),
      gitBranch: result.gitInfo?.branch || "",
      gitUncommitted: result.gitInfo?.uncommitted || 0,
      fileSizeData: result.fileSizeInfo ? {
        totalBytes: result.fileSizeInfo.totalBytes,
        totalFiles: result.fileSizeInfo.totalFiles,
        avgFileSize: result.fileSizeInfo.avgFileSize,
      } : null,
      depData: result.depInfo ? {
        totalFiles: result.depInfo.totalFiles,
        totalEdges: result.depInfo.totalEdges,
        cycleCount: result.depInfo.cycles.length,
        orphanCount: result.depInfo.orphans.length,
      } : null,
      compScoreSummary: result.compScores ? {
        skills:  { count: result.compScores.skills.length,  avgScore: avgScore(result.compScores.skills) },
        agents:  { count: result.compScores.agents.length,  avgScore: avgScore(result.compScores.agents) },
        rules:   { count: result.compScores.rules.length,   avgScore: avgScore(result.compScores.rules) },
        scripts: { count: result.compScores.scripts.length, avgScore: avgScore(result.compScores.scripts) },
      } : null,
    };
    const trendPath = join(projectRoot, HEALTH_TREND_FILE);
    const dir = join(projectRoot, ".memory");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const currentDate = entry.timestamp.slice(0, 10);
    const existingLines = existsSync(trendPath)
      ? readFileSync(trendPath, "utf-8").split("\n").filter(Boolean)
      : [];
    const retainedLines = existingLines.filter((/** @type {string} */ line) => {
      try {
        const parsed = JSON.parse(line);
        return parsed?.timestamp?.slice(0, 10) !== currentDate;
      } catch {
        return true;
      }
    });
    retainedLines.push(JSON.stringify(entry));
    writeFileSync(trendPath, retainedLines.join("\n") + "\n", "utf-8");
  } catch { /* best effort */ }
}
