#!/usr/bin/env node
// wework-bot — WeChat Work bot notification help
// 用法: node skills/wework-bot/help.mjs 或 /wework-bot --help

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
${bold("# wework-bot — 企业微信机器人通知")}

${dim("消息发送 · 日志追加 · 管线收口 | rui 强制集成")}

${hdr("快速入门")}
${item("agent=rui name=user-login", "管线完成/阻断通知 → 日志 + 发送", green)}
${item("/wework-bot", "状态检查：token / 配置 / 通知列表完整性", green)}
${item("agent=rui name=user-login noSend=true", "仅追加日志不发送 HTTP", cyan)}

${hdr("子命令")}
${item("agent=<name>", "通过内置 agents 映射路由消息模板 (推荐)", green)}
${item("robot=<name>", "直接指定机器人名称", yellow)}
${item("name=<story>", "故事名 (kebab-case)，用于日志路径", green)}
${item("content=<text>", "消息正文", yellow)}
${item("contentFile=<path>", "从文件读取消息正文 (与 content 二选一)", yellow)}
${item("noSend=true", "仅追加日志，不发送 HTTP 请求", cyan)}
${item("project=<name>", "项目名，默认从 name 推断", yellow)}
${item("apiUrl=<url>", "覆盖默认网关地址", yellow)}

${hdr("使用场景")}
${item("# 管线完成自动通知（rui 自动触发）", "", bold)}
${item("agent=rui name=user-login", "自动读取 rui-state.json → 构建消息 → 日志 + 发送", green)}
${item("", "")}
${item("# 仅追加通知日志不发送", "", bold)}
${item("agent=rui name=user-login noSend=true", "消息写入本地日志文件，不调 HTTP", green)}
${item("", "")}
${item("# 手动发送自定义消息", "", bold)}
${item('agent=rui name=payment content="✅ 支付模块完成"', "手动指定消息内容", green)}
${item("", "")}
${item("# 从文件读取消息内容", "", bold)}
${item("agent=rui name=user-login contentFile=./report.md", "从文件读取长文本", green)}
${item("", "")}
${item("# 指定机器人发送", "", bold)}
${item("robot=ci-bot name=user-login content=...", "使用特定机器人 webhook", green)}
${item("", "")}
${item("# 健康检查", "", bold)}
${item("/wework-bot", "检测 token / 配置 / 通知列表完整性", green)}
${item("", "")}
${item("# 发送测试消息验证配置", "", bold)}
${item('agent=rui name=test content="🎯 结论: 配置验证通过"', "验证 token / webhook / 网关全链路", green)}
${item("", "")}
${item("# 阻断通知使用专用机器人", "", bold)}
${item("agent=rui robot=oncall-bot name=payment", "严重阻断用值班机器人，与普通完成通知区分", green)}
${item("", "")}
${item("# Token 缺失时先写日志后补发", "", bold)}
${item("agent=rui name=user-login noSend=true", "Step 1: 仅追加日志不发送（容错）", green)}
${item("# 配置 API_X_TOKEN 后重新触发", "Step 2: Token 就绪后重跑管线自动发送", green)}
${item("", "")}
${item("# 从外部报告文件发送长消息", "", bold)}
${item("agent=rui name=user-login contentFile=./report.md", "消息体从 report.md 读取，适合 CI 报告等场景", green)}
${item("", "")}
${item("# 先预览消息格式再实际发送", "", bold)}
${item("agent=rui name=user-login noSend=true", "Step 1: 仅写日志，检查 {project}-消息通知列表.md 中格式", green)}
${item("agent=rui name=user-login", "Step 2: 格式确认无误后正式发送", green)}
${item("", "")}
${item("# CI/CD 管线集成通知", "", bold)}
${item("agent=rui name=deploy content=\"🎯 结论: v1.6.2 已部署到生产环境\"", "部署完成后自动触发通知", green)}
${item("", "")}
${item("# 多故事汇总通知", "", bold)}
${item("agent=rui name=sprint-review contentFile=./sprint-summary.md", "从汇总报告文件发送迭代回顾通知", green)}
`;

console.log(help);
