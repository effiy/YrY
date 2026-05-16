#!/usr/bin/env node
// wework-bot — WeChat Work bot notification help
// 用法: node skills/wework-bot/help.mjs 或 /wework-bot --help

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
  const pad = Math.max(2, 32 - left.length);
  return `${left}${" ".repeat(pad)}${desc}`;
}

function section(title, entries) {
  return hdr(title) + entries.map(([c, d]) => item(c, d)).join("\n");
}

function line(text) {
  return `${INDENT}${text}`;
}

const help = `
${bold("# wework-bot — 企业微信机器人通知")}

${dim("消息发送 · 日志追加 · 管线收口 | rui 强制集成步骤")}

${hdr("用法")}
${item("/wework-bot --help", "显示此帮助信息")}
${item("/wework-bot -h", "同上")}
${item("/wework-bot help", "同上")}

${section("调用形态", [
  ["agent=<name>", "通过内置 agents 映射路由 (推荐)"],
  ["robot=<name>", "直接指定机器人"],
  ["name=<Project>-<story>", "故事全名，分解为日志路径"],
  ["content=<text>", "消息正文 (与 contentFile 二选一)"],
  ["contentFile=<path>", "从文件读正文"],
  ["noSend=true", "仅追加日志，不发送 HTTP"],
  ["project=<name>", "项目名，默认从 name 推断"],
  ["apiUrl=<url>", "覆盖默认网关地址"],
])}

${section("触发场景与消息模板", [
  ["# 管线完成通知", ""],
  ["agent=rui name=YiWeb-user-login", "自动构建完成消息 → 日志 + 发送"],
  ['content="🎯 结论: ..."', "手动构建消息内容"],
  ["", ""],
  ["# 阻断通知", ""],
  ["agent=rui name=YiWeb-user-login", "自动读取 rui-state.json → 阻断消息"],
  ["", ""],
  ["# 仅写日志不发消息", ""],
  ['agent=rui name=YiWeb-user-login noSend=true', "仅追加到 00-消息通知列表.md"],
  ["", ""],
  ["# 检查状态 (空输入)", ""],
  ["/wework-bot", "检测 token / 配置 / 通知列表完整性"],
])}

${section("环境变量", [
  ["API_X_TOKEN", "必填 · 鉴权令牌 · 仅从环境变量读取"],
  ["WEWORK_BOT_API_URL", "可选 · 覆盖默认网关地址"],
  ["<robot>.webhook_url_env", "可选 · 指定机器人的 webhook URL 环境变量名"],
])}

${section("消息格式约束", [
  ["首行自动拼接", "【项目名】由发送方追加"],
  ["emoji : 值", "每行一个字段，禁用 markdown"],
  ["分隔线", "仅用 ——— ，至多一条"],
  ["字数上限", "≤ 2000 字"],
  ["禁止", "占位符 · token/webhook URL 明文"],
])}

${section("三步收口 (hook 触发器)", [
  ["① hook-log", "追加日志到 00-消息通知列表.md (noSend=true)"],
  ["② import-docs", "文档同步到远端"],
  ["③ hook-notify", "实际发送企微消息 (依赖 API_X_TOKEN)"],
])}

${section("安全底线", [
  ["API_X_TOKEN", "仅从环境变量，禁止提交仓库"],
  ["webhook URL", "由环境变量注入，禁止写入文档"],
  ["日志脱敏", "token/webhook URL 不回显"],
])}

${section("全局选项", [
  ["--help, -h, help", "显示此帮助信息"],
])}

${dim("详细说明: skills/wework-bot/SKILL.md | 集成: skills/rui/SKILL.md §强制集成")}
`;

console.log(help);
