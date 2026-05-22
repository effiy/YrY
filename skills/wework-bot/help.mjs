#!/usr/bin/env node
// wework-bot — WeChat Work bot notification help
// 用法: node skills/wework-bot/help.mjs 或 /wework-bot --help

const ANSI_BOLD = 1;
const ANSI_DIM = 2;
const ANSI_UNDERLINE = 4;
const ANSI_YELLOW = 33;
const ANSI_CYAN = 36;

const { bold, underline, dim, yellow, cyan } = (() => {
  const make = (code) => (s) => `\x1b[${code}m${s}\x1b[0m`;
  const e = {
    bold: make(ANSI_BOLD), underline: make(ANSI_UNDERLINE), dim: make(ANSI_DIM),
    yellow: make(ANSI_YELLOW), cyan: make(ANSI_CYAN),
  };
  if (!process.stdout.isTTY) {
    for (const k of Object.keys(e)) e[k] = (s) => s;
  }
  return e;
})();

const INDENT = "  ";
const SUB_INDENT = "    ";
const LEFT_COLUMN_WIDTH = 56;
const COLUMN_MIN_PADDING = 2;

function hdr(text) {
  return `\n${bold(text)}\n`;
}

function subhdr(text) {
  return `\n${INDENT}${bold(text)}\n`;
}

function item(cmd, desc, colorFn) {
  const left = `${SUB_INDENT}${cmd}`;
  const pad = Math.max(COLUMN_MIN_PADDING, LEFT_COLUMN_WIDTH - left.length);
  return `${colorFn ? colorFn(left) : left}${" ".repeat(pad)}${desc}`;
}

function flag(name, desc) {
  const firstToken = name.split(/\s/)[0];
  const prefix = firstToken.length === 1 ? "-" : "--";
  return item(`  ${prefix}${name}`, desc, yellow);
}

function scene(title) {
  return `\n${SUB_INDENT}${bold(title)}\n`;
}

const help = `
${bold("# wework-bot — 企业微信机器人通知")}

${dim("消息发送 · 日志追加 · 管线收口 · 健康检查 | rui 强制集成")}

${hdr("快速入门")}
${item("node skills/wework-bot/send.mjs --story=<name> --status=complete --no-send", "仅追加通知日志不发送 HTTP", cyan)}
${item("node skills/wework-bot/send.mjs health", "健康检查：token / webhook / API 可达性", cyan)}
${item("node skills/wework-bot/send.mjs --story=<name> --status=complete", "发送完成通知：构建消息 → 日志 + HTTP 发送", cyan)}

${hdr("可执行入口: node skills/wework-bot/send.mjs")}

${subhdr("命令")}
${item("send.mjs [options]", "发送通知（默认命令）", cyan)}
${item("send.mjs health", "健康检查：token / config.json / webhook / API 可达性", cyan)}
${item("send.mjs --help", "显示此帮助", cyan)}

${subhdr("参数")}
${item("--story=<name>", "故事名（kebab-case），必填", cyan)}
${item("--project=<name>", "项目名，默认从 CLAUDE.md 读取", yellow)}
${item("--status=<s>", "通知类型: complete | blocked | gate-fail（默认 complete）", cyan)}
${item("--conclusion=<text>", "🎯 结论", yellow)}
${item("--description=<text>", "📝 描述", yellow)}
${item("--scope=<text>", "📌 范围", yellow)}
${item("--nextStep=<text>", "👉 下一步（complete 场景）", yellow)}
${item("--impact=<text>", "🌐 影响", yellow)}
${item("--evidence=<text>", "📎 证据", yellow)}
${item("--session=<text>", "⏱️ 会话", yellow)}
${item("--reason=<text>", "❌ 阻断原因（blocked 场景）", yellow)}
${item("--recovery=<text>", "🧭 恢复点（blocked 场景）", yellow)}
${item("--gate=<text>", "🔍 门禁名称（gate-fail 场景）", yellow)}
${item("--gateResult=<text>", "📊 门禁结果（gate-fail 场景）", yellow)}
${item("--content=<text>", "直接指定消息正文（覆盖字段构建）", yellow)}
${item("--no-send", "仅追加日志，不发送 HTTP 请求", cyan)}
${item("--retries=<N>", "HTTP 发送重试次数（默认 3）", yellow)}

${subhdr("输出")}
${item("通知日志", "追加到 docs/故事任务面板/<story>/{project}-消息通知列表.md", dim)}
${item("交付追踪", "追加到 .memory/delivery-tracking.jsonl", dim)}
${item("HTTP 响应", "stdout 打印发送结果", dim)}

${hdr("使用场景")}
${scene("管线完成自动通知（rui 自动触发）")}
${item("node skills/wework-bot/send.mjs --story=user-login --status=complete --conclusion=\"...\" --description=\"...\"", "构建完成消息 → 日志 + HTTP 发送", cyan)}
${scene("仅追加通知日志不发送")}
${item("node skills/wework-bot/send.mjs --story=user-login --status=complete --no-send", "消息写入本地日志文件，不调 HTTP", cyan)}
${scene("阻断通知")}
${item("node skills/wework-bot/send.mjs --story=payment --status=blocked --reason=\"API 限流\" --recovery=\"降低并发后重试\"", "构建阻断消息（含原因+恢复点）→ 日志 + 发送", cyan)}
${scene("门禁失败通知")}
${item("node skills/wework-bot/send.mjs --story=deploy --status=gate-fail --gate=\"Gate B\" --gateResult=\"3 P0 未清零\"", "构建门禁消息（含门禁名称+结果）→ 日志 + 发送", cyan)}
${scene("健康检查")}
${item("node skills/wework-bot/send.mjs health", "检测 token / config.json / webhook / API 可达性", cyan)}
${scene("自定义消息内容")}
${item("node skills/wework-bot/send.mjs --story=user-login --content=\"自定义消息正文\"", "直接指定消息正文，覆盖字段构建", cyan)}
${scene("Token 缺失时先写日志后补发")}
${item("node skills/wework-bot/send.mjs --story=user-login --status=complete --no-send", "Step 1：仅追加日志不发送（容错，自动 no-token 降级）", cyan)}
${item("# 配置 API_X_TOKEN 后重新触发", "Step 2：Token 就绪后重跑管线自动发送", dim)}
`;

console.log(help);
