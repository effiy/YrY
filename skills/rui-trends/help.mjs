#!/usr/bin/env node
// rui-trends — 技术趋势发现 help

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
${bold("# rui-trends — 技术趋势发现 & 代码库健康分析")}

${dim("模块统计 · 大文件检测 · 变更热点 · 组件审计 · 历史复盘 · GitHub Trending")}

${hdr("语法")}
${item("/rui-trends", "基础统计：文件数/模块数/技术栈概况", cyan)}
${item("/rui-trends all", "一键全量扫描", cyan)}
${item("/rui-trends modules", "模块规模：文件数/行数/最大文件", cyan)}
${item("/rui-trends large-files [--threshold N]", "大文件检测（默认 ≥500 行）", cyan)}
${item("/rui-trends hotspots [--since D] [--top N]", "Git 高频变更文件（默认近 30 天）", cyan)}
${item("/rui-trends components", "zk- 组件使用频次统计", cyan)}
${item("/rui-trends review", "扫描历史自改进复盘，对比趋势", cyan)}
${item("/rui-trends trending [--since D] [-l L]", "GitHub Trending（daily|weekly，支持语言过滤）", cyan)}

${hdr("使用场景")}
${s("新接手项目")}
${item("/rui-trends", "基础统计 → 全局认知", cyan)}
${item("/rui-trends modules && /rui-trends large-files", "了解模块规模 → 识别大文件", cyan)}

${s("重构前健康检查")}
${item("/rui-trends large-files --threshold 800", "定位超过 800 行的待拆分文件", cyan)}
${item("/rui-trends hotspots --since 2026-01-01", "年度变更热点，识别不稳定模块", cyan)}
${item("/rui-trends components", "审计组件依赖关系", cyan)}

${s("日常迭代监控")}
${item("/rui-trends hotspots --top 10", "变更最频繁的前 10 个文件", cyan)}
${item("/rui-trends trending -l TypeScript", "关注 TS 生态热门仓库", cyan)}

${s("团队复盘")}
${item("/rui-trends all", "生成完整健康度报告", cyan)}
${item("/rui-trends review", "对比历史复盘，评估改进效果", cyan)}
`;

console.log(help);
