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

${dim("消息发送 · 日志追加 · 管线收口 | rui 强制集成")}

${hdr("快速入门")}
${item("agent=rui name=user-login", "管线完成/阻断通知 → 日志 + 发送", cyan)}
${item("/wework-bot", "状态检查：token / 配置 / 通知列表完整性", cyan)}
${item("agent=rui name=user-login noSend=true", "仅追加日志不发送 HTTP", cyan)}

${hdr("参数")}

${subhdr("路由")}
${item("agent=<name>", "通过内置 agents 映射路由消息模板（推荐）", cyan)}
${item("robot=<name>", "直接指定机器人名称", yellow)}

${subhdr("消息内容")}
${item("name=<story>", "故事名（kebab-case），用于日志路径", cyan)}
${item("content=<text>", "消息正文", yellow)}
${item("contentFile=<path>", "从文件读取消息正文（与 content 二选一）", yellow)}

${subhdr("控制")}
${item("noSend=true", "仅追加日志，不发送 HTTP 请求", cyan)}
${item("project=<name>", "项目名，默认从 name 推断", yellow)}
${item("apiUrl=<url>", "覆盖默认网关地址", yellow)}

${hdr("使用场景")}
${scene("管线完成自动通知（rui 自动触发）")}
${item("agent=rui name=user-login", "自动读取 rui-state.json → 构建消息 → 日志 + 发送", cyan)}
${scene("仅追加通知日志不发送")}
${item("agent=rui name=user-login noSend=true", "消息写入本地日志文件，不调 HTTP", cyan)}
${scene("手动发送自定义消息")}
${item('agent=rui name=payment content="支付模块完成"', "手动指定消息内容", cyan)}
${scene("从文件读取消息内容")}
${item("agent=rui name=user-login contentFile=./report.md", "从文件读取长文本", cyan)}
${scene("指定机器人发送")}
${item("robot=ci-bot name=user-login content=...", "使用特定机器人 webhook", cyan)}
${scene("健康检查")}
${item("/wework-bot", "检测 token / 配置 / 通知列表完整性", cyan)}
${scene("发送测试消息验证配置")}
${item('agent=rui name=test content="配置验证通过"', "验证 token / webhook / 网关全链路", cyan)}
${scene("阻断通知使用专用机器人")}
${item("agent=rui robot=oncall-bot name=payment", "严重阻断用值班机器人，与普通完成通知区分", cyan)}
${scene("Token 缺失时先写日志后补发")}
${item("agent=rui name=user-login noSend=true", "Step 1：仅追加日志不发送（容错）", cyan)}
${item("# 配置 API_X_TOKEN 后重新触发", "Step 2：Token 就绪后重跑管线自动发送", dim)}
${scene("先预览消息格式再实际发送")}
${item("agent=rui name=user-login noSend=true", "Step 1：仅写日志，检查通知列表中格式", cyan)}
${item("agent=rui name=user-login", "Step 2：格式确认无误后正式发送", cyan)}
${scene("CI/CD 管线集成通知")}
${item('agent=rui name=deploy content="v1.6.4 已部署到生产环境"', "部署完成后自动触发通知", cyan)}
${scene("多故事汇总通知")}
${item("agent=rui name=sprint-review contentFile=./sprint-summary.md", "从汇总报告文件发送迭代回顾通知", cyan)}
`;

console.log(help);
