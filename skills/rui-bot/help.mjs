#!/usr/bin/env node
// rui-bot — 企业微信机器人通知 help

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
${bold("# rui-bot — 企业微信机器人通知")}

${dim("消息发送 · 日志追加 · 管线收口 | rui 强制集成 | 执行入口: node skills/rui-bot/send.mjs")}

${hdr("语法")}
${item("send.mjs --story=<n> [opts]", "发送通知 + 追加日志（默认命令）", cyan)}
${item("send.mjs health", "健康检查：token / webhook / API 可达性", cyan)}

${hdr("必选参数")}
${item("--story=<name>", "故事名（kebab-case）", cyan)}
${item("--status=<s>", "通知类型：complete | blocked | gate-fail", cyan)}

${hdr("常用可选参数")}
${item("--project=<name>", "项目名，默认从 CLAUDE.md 读取", yellow)}
${item("--skill=<name>", "技能标识: rui | rui-story | rui-claude", yellow)}
${item("--command=<text>", "用户执行的命令（含参数）", yellow)}
${item("--no-send", "仅追加日志，不发送 HTTP 请求", cyan)}
${item("--retries=<N>", "HTTP 发送重试次数（默认 3）", yellow)}

${hdr("内容参数（按通知类型选用）")}
${item("--conclusion=<text>", "🎯 结论 | --description=<text> 📝 描述", yellow)}
${item("--scope=<text> → 范围 | --nextStep=<text> → 下一步（complete）", yellow)}
${item("--reason=<text> → 阻断原因 | --recovery=<text> → 恢复点（blocked）", yellow)}
${item("--gate=<text> → 门禁名称 | --gateResult=<text> → 结果（gate-fail）", yellow)}
${item("--content=<text>", "直接指定消息正文（覆盖字段构建）", yellow)}

${hdr("使用场景")}
${s("管线完成自动通知")}
${item("send.mjs --story=user-login --status=complete --conclusion=\"...\" --description=\"...\"", "构建消息 → 日志 + HTTP 发送", cyan)}

${s("阻断通知")}
${item("send.mjs --story=payment --status=blocked --reason=\"API 限流\" --recovery=\"降低并发后重试\"", "含原因+恢复点 → 日志 + 发送", cyan)}

${s("门禁失败通知")}
${item("send.mjs --story=deploy --status=gate-fail --gate=\"Gate B\" --gateResult=\"3 P0 未清零\"", "含门禁名称+结果 → 日志 + 发送", cyan)}

${s("仅追加日志不发送")}
${item("send.mjs --story=user-login --status=complete --no-send", "消息写入本地日志，不调 HTTP（Token 缺失时自动降级）", cyan)}

${s("健康检查")}
${item("send.mjs health", "检测 token / config.json / webhook / API 可达性", cyan)}
`;

console.log(help);
