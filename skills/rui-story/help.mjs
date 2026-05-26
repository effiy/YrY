#!/usr/bin/env node
// rui-story — Story panel management and sync help
// 用法: node skills/rui-story/help.mjs 或 /rui-story --help

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
${bold("# rui-story — 故事任务面板管理")}

${dim("远端查询 · 同步 · 健康检查 · 删除 | 数据源为远端 API，不读本地文件系统")}

${hdr("快速入门")}
${item("/rui-story", "状态概览：远端查询 → 按状态统计 + 最近活动", cyan)}
${item("/rui-story list", "进度全景：远端查询 → 所有故事详细表格", cyan)}
${item("/rui-story sync [<name>]", "文档同步：远端 → 本地（委托 rui-import）", cyan)}
${item("/rui-story health", "健康检查：API 凭据 / 远端可达性 / 项目配置 / 数据完整性", cyan)}

${hdr("子命令")}

${subhdr("只读命令（远端 API）")}
${item("/rui-story", "状态概览：远端查询 → 按状态统计 + 最近活动", cyan)}
${item("/rui-story list", "进度全景：远端查询 → 所有故事详细表格（含类型推断 + git 分支）", cyan)}
${item("/rui-story health", "健康检查：API 凭据 / 远端可达性 / 项目配置 / 数据完整性", cyan)}

${subhdr("写入命令")}
${item("/rui-story sync [<name>]", "远端→本地覆盖（委托 rui-import mode=pull）", yellow)}
${item("/rui-story remove <name>", "仅本地：删除整个故事目录，先展示后确认", yellow)}

${hdr("使用场景")}
${scene("查看项目整体进度")}
${item("/rui-story", "远端查询 → 状态统计 + 最近 5 个活跃故事", cyan)}
${item("/rui-story list", "表格：Story | Status | Files | Last Modified | Type | Branch", cyan)}
${scene("从远端同步故事")}
${item("/rui-story sync user-login", "委托 rui-import 从远端 API 拉取故事文档到本地", cyan)}
${item("/rui-story sync", "展示所有可同步故事的推荐列表，用户选择后同步", cyan)}
${scene("删除故事本地副本")}
${item("/rui-story remove old-story", "展示目录内容 → 确认后删除（远端不受影响）", cyan)}
${scene("健康检查与修复")}
${item("/rui-story health", "Step 1：诊断凭据 / API / 配置 / 数据完整性", cyan)}
${item("# 按 health 输出提示配置 API_X_TOKEN", "Step 2：根据诊断建议修复", dim)}
${item("/rui-story health", "Step 3：重新检查确认修复", cyan)}
${scene("误删后重新拉取")}
${item("/rui-story sync user-login", "远端文档不受 remove 影响，随时可重新同步", cyan)}
`;

console.log(help);
