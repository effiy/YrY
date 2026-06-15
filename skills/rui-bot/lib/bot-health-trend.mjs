/**
 * bot-health-trend — Health scoring dimensions, grade thresholds, trend persistence.
 * Extracted from send.mjs for module decomposition.
 */

import { join } from "node:path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";

export const HEALTH_TREND_FILE = ".memory/health-trend.jsonl";

export const HEALTH_DIMENSIONS = {
  token:      { label: "Token 凭据", weight: 15 },
  config:     { label: "配置文件", weight: 10 },
  robots:     { label: "机器人配置", weight: 10 },
  api:        { label: "API 可达性", weight: 15 },
  reports:    { label: "自循环报告", weight: 10 },
  format:     { label: "消息格式合规", weight: 10 },
  diagnostics:{ label: "D0-D7 诊断", weight: 10 },
  git:        { label: "Git 仓库状态", weight: 10 },
  security:   { label: "安全扫描", weight: 10 },
  em_testing: { label: "测试体系", weight: 10 },
  em_types:   { label: "类型安全", weight: 8 },
  em_linting: { label: "代码规范", weight: 8 },
  em_cicd:    { label: "CI/CD", weight: 8 },
  em_docs:    { label: "文档完整", weight: 8 },
  em_deps:    { label: "依赖管理", weight: 5 },
  em_git:     { label: "Git 纪律", weight: 5 },
  comp_qual:  { label: "组件质量", weight: 10 },
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
      compScoreSummary: result.compScores ? {
        skills:  { count: result.compScores.skills.length,  avgScore: Math.round(result.compScores.skills.reduce((a,c) => a + c.score, 0) / Math.max(1, result.compScores.skills.length)) },
        agents:  { count: result.compScores.agents.length,  avgScore: Math.round(result.compScores.agents.reduce((a,c) => a + c.score, 0) / Math.max(1, result.compScores.agents.length)) },
        rules:   { count: result.compScores.rules.length,   avgScore: Math.round(result.compScores.rules.reduce((a,c) => a + c.score, 0) / Math.max(1, result.compScores.rules.length)) },
        scripts: { count: result.compScores.scripts.length, avgScore: Math.round(result.compScores.scripts.reduce((a,c) => a + c.score, 0) / Math.max(1, result.compScores.scripts.length)) },
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
