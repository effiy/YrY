#!/usr/bin/env node
// rui — 故事驱动 SDLC 编排器 help

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
${bold("# rui — 故事驱动 SDLC 编排器")}

${dim("需求 → 文档 → 代码 → 交付 | 6 Agent 协同 | Gate A/B 门禁 | 三步强制交付")}

${hdr("语法")}
${item("/rui", "任务推荐（只读，5 层管线评分排序）", cyan)}
${item("/rui init", "建立基线：CLAUDE.md + README + 故事面板", cyan)}
${item("/rui <需求> [--name <n>]", "统一入口：模型自主判定 新建/增量/反推/补齐/实现/自改进/端到端", cyan)}

${hdr("使用场景")}
${s("新仓库初始化")}
${item("/rui init", "建立 CLAUDE.md + README + 故事面板基线", cyan)}

${s("统一入口 — 模型自主判定模式")}
${item('/rui "用户登录支持手机号+验证码" --name user-login', "自动检测：新需求→新建基线→文档→(可选)编码→交付", cyan)}
${item('/rui user-login "新增 OAuth 登录"', "自动检测：已有故事→增量刷新 T1/T2/T3", cyan)}
${item("/rui user-login", "自动检测：有源码→反推文档 / 部分文档→补齐缺失 / 基线完整→端到端", cyan)}
${item("/rui 复盘自改进", "自动检测：自改进意图→全量扫描→诊断→闭环", cyan)}

${s("查看进度")}
${item("/rui-story list && /rui", "扫故事状态 → 获取推荐任务", cyan)}
`;

console.log(help);
