#!/usr/bin/env node
// rui-claude — .claude/ 目录管理 help

const B = 1, D = 2, Y = 33, C = 36;
const { bold, dim, yellow, cyan } = (() => {
  const m = (c) => (s) => `\x1b[${c}m${s}\x1b[0m`;
  const e = { bold: m(B), dim: m(D), yellow: m(Y), cyan: m(C) };
  if (!process.stdout.isTTY) for (const k of Object.keys(e)) e[k] = (s) => s;
  return e;
})();

const I = "  ", SI = "    ", LW = 48;

function hdr(t) { return `\n${bold(t)}\n`; }
function item(c, d, f) {
  const l = `${SI}${c}`;
  return `${f ? f(l) : l}${" ".repeat(Math.max(2, LW - l.length))}${d}`;
}
function s(t) { return `\n${SI}${bold(t)}\n`; }

const help = `
${bold("# rui-claude — .claude/ 配置管理")}

${dim("同步远端配置 · 健康度分析 · 需求管线 | 注：version --up 已迁移至 /rui")}

${hdr("语法")}
${item("/rui-claude", "推荐任务：5 层评分排序的维护建议", cyan)}
${item("/rui-claude sync", "远端 → 本地覆盖 .claude/（需确认）", yellow)}
${item("/rui-claude update", "升级 YrY 插件 + 同步远端 .claude/", yellow)}
${item("/rui-claude retro [--json]", "健康度分析：配置结构 / 健康度 / 改进项", cyan)}
${item("/rui-claude <需求>", "需求管线：走完整 doc+code 修改 .claude/", yellow)}

${hdr("使用场景")}
${s("拉取团队最新配置")}
${item("/rui-claude sync", "从远端 API 全量覆盖本地 .claude/", cyan)}

${s("一键升级并同步")}
${item("/rui-claude update", "git pull 最新 YrY → 清缓存 → sync .claude/", cyan)}

${s("分析配置健康度")}
${item("/rui-claude retro", "分析 agents/rules/skills 结构 → 输出复盘", cyan)}
${item("/rui-claude retro --json", "JSON 格式输出（供脚本消费）", cyan)}

${s("修改配置走完整管线")}
${item('/rui-claude "新增一个 check hook"', "需求 → doc → code → 交付", cyan)}

${s("全流程：同步 → 分析 → 修复")}
${item("/rui-claude sync", "Step 1：从远端拉取最新 .claude/", cyan)}
${item("/rui-claude retro", "Step 2：分析健康度，获取改进项", cyan)}
${item('/rui-claude "修复 retro 报告中的 P0 项"', "Step 3：走完整管线修复", cyan)}
`;

console.log(help);
