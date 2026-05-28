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
${item("/rui <需求> [--name <n>]", "端到端：doc + code 自动串联", cyan)}
${item("/rui doc <需求> [--name <n>]", "拆需求为故事 + 5 文档基线（只读源码）", cyan)}
${item("/rui doc --from-code [需求]", "从源码反推文档基线（只读，冲突保护）", cyan)}
${item("/rui doc --from-local <n>", "从已有本地文档补全缺失基线", cyan)}
${item("/rui code <name>", "实现故事（源码唯一入口）", cyan)}
${item("/rui code --from-doc <n>", "从文档反推，补全缺失报告（只读）", cyan)}
${item("/rui update <n> [ctx] [--no-code]", "增量更新，T1/T2/T3 自动裁剪", cyan)}
${item("/rui yry [--depth N]", "自改进闭环：扫描→诊断→实现→验证（默认 3 轮）", cyan)}
${item("/rui version --up", "版本升级：判定 → 更新 → commit → push + tag", cyan)}
${item("/rui version --rollback <n>", "回退故事文档到历史版本", cyan)}

${hdr("使用场景")}
${s("新仓库初始化")}
${item("/rui init", "Step 1：建立 CLAUDE.md + README + 故事面板基线", cyan)}

${s("端到端交付")}
${item('/rui "用户登录支持手机号+验证码" --name user-login', "拆故事 → 文档基线 → 编码 → 验证 → 交付", cyan)}

${s("存量代码补文档")}
${item("/rui doc --from-code", "pm 扫描源码推荐待文档化模块（选择后反推）", cyan)}
${item("/rui doc --from-code user-login", "直接对指定模块源码反推 5 文档基线", cyan)}

${s("增量更新")}
${item('/rui update user-login "新增 OAuth"', "T1~T3 自动判定变更范围，刷新文档 + 重跑验证", cyan)}

${s("已有部分文档，补全缺失")}
${item("/rui doc --from-local user-login", "扫描已有 → 按依赖链生成缺失 → 不覆盖已有", cyan)}

${s("查看进度 + 被阻断后恢复")}
${item("/rui-story list && /rui", "扫故事状态 → 获取推荐任务", cyan)}
${item("/rui code user-login", "被阻断后重跑同命令，从断点续跑", cyan)}
`;

console.log(help);
