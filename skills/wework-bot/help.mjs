#!/usr/bin/env node
// wework-bot — WeChat Work bot notification help
// 用法: node skills/wework-bot/help.mjs 或 /wework-bot --help

const { bold, underline, dim, yellow, green, cyan, red } = (() => {
  const make = (code) => (s) => `\x1b[${code}m${s}\x1b[0m`;
  const e = {
    bold: make(1), underline: make(4), dim: make(2),
    yellow: make(33), green: make(32), cyan: make(36), red: make(31),
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

function section(title, entries) {
  return hdr(title) + entries.map(([c, d, color]) => item(c, d, color)).join("\n");
}

function line(text) {
  return `${INDENT}${text}`;
}

function para(text) {
  return `\n${INDENT}${text}`;
}

function flag(name, desc) {
  return item(`  ${name}`, desc, yellow);
}

const help = `
${bold("# wework-bot — 企业微信机器人通知")}

${dim("消息发送 · 日志追加 · 管线收口 | rui 强制集成 — 交付三步收口第③步")}

${hdr("用法")}
${item("/wework-bot --help, -h, help", "显示此帮助信息")}

${hdr("调用形态")}${dim("（key=value 参数，无顺序要求）")}

${item("agent=<name>", "通过内置 agents 映射路由消息模板 (推荐)", green)}
${item("  rui", "管线完成通知 / 阻断通知", dim)}
${item("robot=<name>", "直接指定机器人名称", yellow)}
${item("name=<story>", "故事名 (kebab-case)，用于日志路径", green)}
${item("content=<text>", "消息正文", yellow)}
${item("contentFile=<path>", "从文件读取消息正文 (与 content 二选一)", yellow)}
${item("noSend=true", "仅追加日志，不发送 HTTP 请求", cyan)}
${item("project=<name>", "项目名，默认从 name 推断", yellow)}
${item("apiUrl=<url>", "覆盖默认网关地址", yellow)}

${hdr("触发场景 & 消息模板")}

${subhdr("管线完成通知")}
${item("agent=rui name=user-login", "自动构建完成消息 → 日志 + 发送", green)}
${item("", dim("消息含: 故事名 / 状态 / 产出文件 / 耗时。首行自动拼【项目名】。"))}

${subhdr("阻断通知")}
${item("agent=rui name=user-login", "自动读取 rui-state.json → 构建阻断消息", red)}
${item("", dim("消息含: 阻断阶段 / 阻断原因 / P0 清单。"))}

${subhdr("仅写日志不发消息")}
${item("agent=rui name=user-login noSend=true", "仅追加到 {project}-消息通知列表.md", cyan)}

${subhdr("手动构建消息")}
${item('content="🎯 结论: ..."', "手动指定消息正文（跳过模板构建）", yellow)}

${subhdr("状态检查")}
${item("/wework-bot", "检测 token / 配置 / 通知列表完整性", green)}

${hdr("三步收口")}${dim("（rui 交付阶段 hook 自动触发）")}
${item("① hook-log", "追加日志到 {project}-消息通知列表.md (noSend=true)", dim)}
${item("② import-docs", "文档同步到远端 API", dim)}
${item("③ hook-notify", "实际发送企微消息 (依赖 API_X_TOKEN)", dim)}

${hdr("常用场景示例")}
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

${hdr("消息格式约束")}
${line(dim("1. 首行自动拼接【项目名】— 由发送方追加"))}
${line(dim("2. emoji : 值 — 每行一个字段，禁用 markdown 语法"))}
${line(dim("3. 分隔线仅用 ——— — 至多一条"))}
${line(dim("4. 字数上限 ≤ 2000 字"))}
${line(dim("5. 禁止: 占位符 · token/webhook URL 明文"))}

${hdr("环境变量")}
${item("API_X_TOKEN", "必填 · 鉴权令牌 · 仅从环境变量读取（缺失时降级 noSend）", yellow)}
${item("WEWORK_BOT_API_URL", "可选 · 覆盖默认网关地址", dim)}
${item("<robot>.webhook_url_env", "可选 · 指定机器人的 webhook URL 环境变量名", dim)}

${hdr("安全底线")}
${item("API_X_TOKEN", "仅从环境变量，禁止提交仓库", red)}
${item("webhook URL", "由环境变量注入，禁止写入文档", red)}
${item("日志脱敏", "token / webhook URL 不回显到日志", red)}
${item("消息内容", "禁止含占位符 · 未脱敏密钥 · 内部 URL", red)}

${hdr("降级行为")}
${item("API_X_TOKEN 缺失", "降级 noSend — 仅写日志不发送 HTTP", dim)}
${item("HTTP 发送失败", "记录错误到日志，不阻断管线")}
${item("contentFile 不存在", "记录告警，消息体标注「文件缺失」")}
${item("agent 未匹配", "记录告警，使用原始输入作为消息体")}

${hdr("管线集成")}
${line(dim("rui 交付三步收口第③步，强制集成。每次 /rui code 完成或阻断时自动触发。"))}
${line(dim("失败不阻断管线 — 通知为尽力交付 (best-effort)。"))}

${hdr("相关资源")}
${item("SKILL.md", "skills/wework-bot/SKILL.md — 完整规约", dim)}
${item("rui", "skills/rui/SKILL.md §强制集成 — 三步收口", dim)}
${item("import-docs", "skills/import-docs/SKILL.md — 收口第②步", dim)}

${dim("详细说明: skills/wework-bot/SKILL.md | 集成: skills/rui/SKILL.md §强制集成")}
`;

console.log(help);
