#!/usr/bin/env node
// rui-claude — Manage .claude/ directories help
// 用法: node skills/rui-claude/help.mjs 或 /rui-claude --help

const ANSI_BOLD = 1;
const ANSI_DIM = 2;
const ANSI_UNDERLINE = 4;
const ANSI_RED = 31;
const ANSI_GREEN = 32;
const ANSI_YELLOW = 33;
const ANSI_CYAN = 36;

const { bold, underline, dim, yellow, green, cyan, red } = (() => {
  const make = (code) => (s) => `\x1b[${code}m${s}\x1b[0m`;
  const e = {
    bold: make(ANSI_BOLD), underline: make(ANSI_UNDERLINE), dim: make(ANSI_DIM),
    yellow: make(ANSI_YELLOW), green: make(ANSI_GREEN), cyan: make(ANSI_CYAN), red: make(ANSI_RED),
  };
  if (!process.stdout.isTTY) {
    for (const k of Object.keys(e)) e[k] = (s) => s;
  }
  return e;
})();

const INDENT = "  ";
const LEFT_COLUMN_WIDTH = 32;
const COLUMN_MIN_PADDING = 2;

function hdr(text) {
  return `\n${bold(underline(text))}\n`;
}

function subhdr(text) {
  return `\n${bold(text)}`;
}

function item(cmd, desc, colorFn) {
  const left = `${INDENT}${cmd}`;
  const pad = Math.max(COLUMN_MIN_PADDING, LEFT_COLUMN_WIDTH - left.length);
  return `${colorFn ? colorFn(left) : left}${" ".repeat(pad)}${desc}`;
}

function line(text) {
  return `${INDENT}${text}`;
}

const help = `
${bold("# rui-claude — .claude/ 目录管理")}

${dim("同步远端配置 · 健康度分析 · 操作历史 · 需求管线")}

${hdr("快速入门")}
${item("/rui-claude", "推荐任务：5 层评分排序的 .claude/ 维护建议", green)}
${item("/rui-claude sync", "覆盖式同步：远端 API → import-docs pull 覆盖本地 .claude/", green)}
${item("/rui-claude retro", "健康度分析：三节复盘 (配置结构 / 健康度 / 改进项)", green)}

${hdr("子命令")}

${subhdr("只读命令")}
${item("/rui-claude", "推荐任务：5 层评分排序（L0 时间 / L1 依赖 / L2 风险 / L3 覆盖 / L4 质量）", green)}
${item("/rui-claude retro", "健康度分析：三节复盘 (配置结构 / 健康度 / 改进项)", green)}
${item("  --name <kebab-case>", "指定故事名（默认自动生成）", yellow)}
${item("  --json", "JSON 格式输出", yellow)}
${item("/rui-claude history list", "列出最近操作记录", green)}
${item("  --limit N", "返回记录数 (默认 10)", yellow)}
${item("/rui-claude history stats", "操作统计摘要", green)}
${item("  --json", "JSON 格式输出", yellow)}

${subhdr("写入命令")}
${item("/rui-claude sync", "覆盖式同步：远端 API → import-docs pull 覆盖本地 .claude/", yellow)}
${item("/rui-claude <需求>", "需求管线：走 rui code 流程修改 .claude/ 配置", yellow)}

${hdr("使用场景")}
${item("# 拉取团队最新 .claude/ 配置", "", bold)}
${item("/rui-claude sync", "从远端 API 全量覆盖本地 .claude/ → 提示确认后执行", green)}
${item("", "")}
${item("# 分析配置健康度", "", bold)}
${item("/rui-claude retro", "分析 agents/rules/skills 结构 → 输出复盘文档", green)}
${item("/rui-claude retro --name config-audit", "指定故事名", green)}
${item("/rui-claude retro --json", "JSON 格式输出（供脚本消费）", green)}
${item("", "")}
${item("# 查看操作历史", "", bold)}
${item("/rui-claude history list", "最近 10 条操作记录", green)}
${item("/rui-claude history list --limit 20", "最近 20 条", green)}
${item("/rui-claude history stats --json", "统计摘要 (JSON)", green)}
${item("", "")}
${item("# 修改 .claude/ 配置走完整管线", "", bold)}
${item('/rui-claude "新增一个 security check hook"', "需求 → doc → code → 交付", green)}
${item("", "")}
${item("# 获取推荐维护任务", "", bold)}
${item("/rui-claude", "5 层评分排序的 .claude/ 维护建议", green)}
${item("", "")}
${item("# retro JSON 输出（供脚本消费）", "", bold)}
${item("/rui-claude retro --json", "结构化输出，可管道到 jq 或其他工具", green)}
${item("", "")}
${item("# 全流程：同步配置 → 分析 → 修复", "", bold)}
${item("/rui-claude sync", "Step 1: 从远端拉取最新 .claude/ 配置", green)}
${item("/rui-claude retro", "Step 2: 分析配置健康度，获取改进项", green)}
${item('/rui-claude "修复 retro 报告中的 P0 项"', "Step 3: 走完整管线修复问题", green)}
${item("", "")}
${item("# 监控操作频率", "", bold)}
${item("/rui-claude history stats", "查看 sync / retro / 需求 操作频次统计", green)}
${item("/rui-claude history stats --json", "JSON 格式，供监控脚本消费", green)}
${item("", "")}
${item("# 带故事名的复盘（可溯源）", "", bold)}
${item("/rui-claude retro --name config-audit-2026-q2", "复盘文档写入自改进故事面板/ 指定名称", green)}
${item("", "")}
${item("# 同步前先查历史（安全工作流）", "", bold)}
${item("/rui-claude history list --limit 5", "Step 1: 查看最近操作，确认无冲突", green)}
${item("/rui-claude sync", "Step 2: 确认安全后同步", green)}
${item("", "")}
${item("# 调试：查看谁改了什么", "", bold)}
${item("/rui-claude history list --limit 20", "列出最近 20 条操作，排查配置变更来源", green)}
`;

console.log(help);
