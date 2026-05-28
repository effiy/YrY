#!/usr/bin/env node
// rui-story — 故事任务面板管理 help

const B = 1, D = 2, Y = 33, C = 36;
const { bold, dim, yellow, cyan } = (() => {
  const m = (c) => (s) => `\x1b[${c}m${s}\x1b[0m`;
  const e = { bold: m(B), dim: m(D), yellow: m(Y), cyan: m(C) };
  if (!process.stdout.isTTY) for (const k of Object.keys(e)) e[k] = (s) => s;
  return e;
})();

const I = "  ", SI = "    ", LW = 52;

function hdr(t) { return `\n${bold(t)}\n`; }
function item(c, d, f) {
  const l = `${SI}${c}`;
  return `${f ? f(l) : l}${" ".repeat(Math.max(2, LW - l.length))}${d}`;
}
function s(t) { return `\n${SI}${bold(t)}\n`; }

const help = `
${bold("# rui-story — 故事任务面板管理")}

${dim("远端查询 · 同步 · 健康检查 · 删除 | 数据源为远端 API")}

${hdr("语法")}
${item("/rui-story", "状态概览：按状态统计 + 最近活动", cyan)}
${item("/rui-story list", "进度全景：所有故事详情表格", cyan)}
${item("/rui-story health", "健康检查：凭据/API/配置/数据完整性", cyan)}
${item("/rui-story sync [<name>]", "远端 → 本地覆盖（委托 rui-import）", yellow)}
${item("/rui-story remove <name>", "删除故事本地目录（需确认，远端不受影响）", yellow)}

${hdr("使用场景")}
${s("查看项目整体进度")}
${item("/rui-story", "远端查询 → 状态统计 + 最近活跃故事", cyan)}
${item("/rui-story list", "完整表格：Story | Status | Files | Type | Branch", cyan)}

${s("从远端同步故事")}
${item("/rui-story sync user-login", "远端拉取 user-login 文档覆盖本地", cyan)}

${s("健康检查与修复")}
${item("/rui-story health", "诊断凭据/API/配置/数据完整性 → 按提示修复", cyan)}

${s("删除故事本地副本")}
${item("/rui-story remove old-story", "展示目录内容 → 确认后删除（远端不受影响）", cyan)}

${s("误删后重新拉取")}
${item("/rui-story sync user-login", "远端文档不受 remove 影响，随时可重新同步", cyan)}
`;

console.log(help);
