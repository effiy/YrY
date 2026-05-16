#!/usr/bin/env node
// rui-claude — Manage .claude/ directories help
// 用法: node skills/rui-claude/help.mjs 或 /rui-claude --help

const { bold, underline, dim } = (() => {
  const e = { bold: (s) => `\x1b[1m${s}\x1b[22m`, underline: (s) => `\x1b[4m${s}\x1b[24m`, dim: (s) => `\x1b[2m${s}\x1b[22m` };
  if (!process.stdout.isTTY) return { bold: (s) => s, underline: (s) => s, dim: (s) => s };
  return e;
})();

const INDENT = "  ";

function hdr(text) {
  return `\n${bold(underline(text))}\n`;
}

function item(cmd, desc) {
  const left = `${INDENT}${cmd}`;
  const pad = Math.max(2, 28 - left.length);
  return `${left}${" ".repeat(pad)}${desc}`;
}

function section(title, entries) {
  return hdr(title) + entries.map(([c, d]) => item(c, d)).join("\n");
}

const help = `
${bold("# rui-claude — .claude/ 目录管理")}

${dim("同步远端配置 · 健康度分析 · 操作历史 | 操作边界仅限 .claude/")}

${section("命令", [
  ["/rui-claude sync", "覆盖式同步：rm -rf .claude/ → rsync 远端"],
  ["/rui-claude retro", "健康度分析：三节复盘 (配置结构/健康度/改进项)"],
  ["/rui-claude history list", "列出最近 N 条操作记录"],
  ["/rui-claude history stats", "操作统计摘要"],
  ["/rui-claude <需求>", "需求管线：走 rui code 流程修改 .claude/"],
  ["/rui-claude", "推荐任务：5 层评分排序 5~10 条"],
])}

${section("常用场景示例", [
  ["# 拉取团队最新配置", ""],
  ["/rui-claude sync", "从远端全量覆盖本地 .claude/ (会提示确认)"],
  ["", ""],
  ["# 分析配置健康度", ""],
  ["/rui-claude retro", "分析 agents/rules/skills 结构，输出复盘文档"],
  ["/rui-claude retro --name my-audit", "指定故事名"],
  ["/rui-claude retro --json", "JSON 格式输出"],
  ["", ""],
  ["# 查看操作历史", ""],
  ["/rui-claude history list", "最近操作记录"],
  ["/rui-claude history list --limit 20", "最近 20 条"],
  ["/rui-claude history stats --json", "统计摘要 JSON"],
  ["", ""],
  ["# 修改 .claude/ 配置走完整管线", ""],
  ["/rui-claude \"新增一个 security check hook\"", "doc + code 完整管线"],
  ["", ""],
  ["# 获取推荐任务", ""],
  ["/rui-claude", "列出建议的 .claude/ 维护任务"],
])}

${section("操作边界", [
  ["✅ .claude/ 目录内", "agents/ · rules/ · skills/ · formulas.md"],
  ["❌ 不可触及", "业务源码 · 外部配置 · 其他目录"],
])}

${section("核心规则", [
  ["仅限 .claude/", "操作范围硬边界"],
  ["走 rui code 管线", "变更必须通过 Gate A/B"],
  ["feat 分支隔离", "禁止在 main 直接修改"],
  ["sync 前确认意图", "覆盖式操作需用户确认"],
  ["空输入只推荐", "不执行任何变更"],
])}

${dim("详细说明: skills/rui-claude/SKILL.md | 规则: rules/rui-claude.md")}
`;

console.log(help);
