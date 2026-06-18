/**
 * bot-health-trend — Health scoring dimensions, grade thresholds, trend persistence.
 * Extracted from send.mjs for module decomposition.
 */

import { join } from "node:path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";

import { avgScore } from "./bot-health-analysis.mjs";

export const HEALTH_TREND_FILE = ".memory/health-trend.jsonl";

export const HEALTH_DIMENSIONS = {
  token:      { label: "Token 凭据", weight: 12 },
  config:     { label: "配置文件", weight: 8 },
  robots:     { label: "机器人配置", weight: 8 },
  api:        { label: "API 可达性", weight: 12 },
  reports:    { label: "自循环报告", weight: 8 },
  format:     { label: "消息格式合规", weight: 8 },
  diagnostics:{ label: "D0-D7 诊断", weight: 8 },
  git:        { label: "Git 仓库状态", weight: 8 },
  security:   { label: "安全扫描", weight: 8 },
  file_size:  { label: "文件体积", weight: 8 },
  dep_analysis:{ label: "依赖分析", weight: 8 },
  em_testing: { label: "测试体系", weight: 8 },
  em_types:   { label: "类型安全", weight: 6 },
  em_linting: { label: "代码规范", weight: 6 },
  em_cicd:    { label: "CI/CD", weight: 6 },
  em_docs:    { label: "文档完整", weight: 6 },
  em_deps:    { label: "依赖管理", weight: 4 },
  em_git:     { label: "Git 纪律", weight: 4 },
  comp_qual:  { label: "组件质量", weight: 8 },
};

export const HEALTH_GRADE = [
  { min: 90, grade: "A", label: "优秀", color: "\x1b[32m" },
  { min: 75, grade: "B", label: "良好", color: "\x1b[33m" },
  { min: 60, grade: "C", label: "一般", color: "\x1b[33m" },
  { min: 0,  grade: "D", label: "需关注", color: "\x1b[31m" },
];

export function scoreEmoji(score) {
  if (score >= 90) return "✅";
  if (score >= 75) return "✅";
  if (score >= 60) return "⚠️";
  return "❌";
}

export function healthBar(score, width = 20) {
  const filled = Math.round((score / 100) * width);
  const empty = width - filled;
  const color = score >= 75 ? "\x1b[32m" : score >= 60 ? "\x1b[33m" : "\x1b[31m";
  return `${color}${"█".repeat(filled)}\x1b[90m${"░".repeat(empty)}\x1b[0m`;
}

export function saveHealthTrend(result, projectRoot) {
  try {
    const entry = {
      timestamp: new Date().toISOString(),
      composite: result.composite,
      grade: result.grade,
      scores: result.scores,
      bootstrapped: result.diagnostics?.bootstrapped || false,
      triggeredDiags: (result.diagnostics?.triggered || []).map((d) => d.id),
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
    const retainedLines = existingLines.filter((line) => {
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
