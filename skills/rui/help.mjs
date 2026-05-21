#!/usr/bin/env node
// rui — Story-driven SDLC orchestrator help
// 用法: node skills/rui/help.mjs 或 /rui --help

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

const I = "  ";
const W = 34;

function hdr(text) {
  return `\n${bold(underline(text))}\n`;
}

function item(cmd, desc, colorFn) {
  const left = `${I}${cmd}`;
  const pad = Math.max(2, W - left.length);
  return `${colorFn ? colorFn(left) : left}${" ".repeat(pad)}${desc}`;
}

function grp(text) {
  return `\n${I}${bold(text)}`;
}

function line(text) {
  return `${I}${text}`;
}

const help = `
${bold("# rui — 故事驱动 SDLC 编排器")}

${dim("需求 → 文档 → 代码 → 交付 | 6 Agent 协同 | Gate A/B 门禁 | 三步强制交付")}

${hdr("快速入门")}
${item("/rui <需求> [--name <name>]", "端到端：需求 → 文档基线 → 编码 → 交付")}
${item("/rui init", "建立项目基线：CLAUDE.md + README + 故事面板")}
${item("/rui", "任务推荐（只读，不触发交付）")}

${line(dim("<需求> = 自然语言文本 | @文件路径 | URL"))}
${line(dim("<name>  = kebab-case，如 user-login。省略时 pm 自动提取。"))}

${hdr("子命令")}
${item("/rui <需求> [--name <name>]", "端到端：需求 → 文档基线 → 编码 → 交付")}
${item("/rui doc <需求> [--name <name>]", "拆需求为故事 + 生成文档基线（只读源码）")}
${item("/rui code <name>", "实现故事（源码唯一入口）")}
${item("/rui code --from-doc <name>", "从文档反推，补全缺失文档（只读）")}
${item("/rui update <name> [ctx] [--no-code]", "增量更新（T1/T2/T3 自动裁剪）")}
${item("/rui doc --from-code [需求]", "从源码反推故事文档（只读，冲突保护）")}
${item("/rui init", "建立项目基线：CLAUDE.md + README + 故事面板")}
${item("/rui", "任务推荐（只读，不触发交付）")}

${hdr("使用场景")}
${grp("# 端到端：一个需求从始至终")}
${item(`/rui "用户登录：密码+短信验证码" --name user-login`, "拆故事 → 文档基线 → 编码 → 验证 → 交付", green)}

${grp("# 仅生成文档基线")}
${item(`/rui doc "用户登录功能" --name user-login`, "拆需求为故事，产出 5 文档基线到面板目录", green)}
${item("/rui doc @requirements.md --name payment", "从本地文件读取需求", green)}

${grp("# 从文档基线开始编码")}
${item("/rui code user-login", "Gate A → 逐模块 P0 清零 → Gate B → 交付", green)}

${grp("# 存量代码补文档")}
${item("/rui doc --from-code", "pm 扫描源码推荐待文档化的模块（5 层评分）", green)}
${item("/rui doc --from-code user-login", "从指定模块源码反推完整文档基线", green)}

${grp("# 小修小补")}
${item(`/rui update user-login "新增 OAuth 登录"`, "T1~T3 自动判定变更范围，刷新文档 + 重跑验证", green)}
${item("/rui update user-login --no-code", "仅刷新文档不改源码", green)}

${grp("# 查看进度 & 获取推荐")}
${item("/rui-story list && /rui", "扫描故事状态 → 获取管线评分的推荐任务", green)}

${grp("# 首次进入仓库")}
${item("/rui init", "建立 CLAUDE.md + README + 故事面板基线", green)}

${grp("# 多故事串行 + 被阻断后恢复")}
${item(`/rui "用户系统：注册+登录+权限管理"`, "pm 拆分为 ≥3 故事 → 逐故事串行 doc → code", green)}
${item("/rui code user-login", "被阻断后重跑同命令，从断点续跑", green)}
`;

console.log(help);
