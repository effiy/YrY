#!/usr/bin/env node
// rui-story — Story panel management and sync help
// 用法: node skills/rui-story/help.mjs 或 /rui-story --help

const { bold, underline, dim } = (() => {
  const e = { bold: (s) => `\x1b[1m${s}\x1b[22m`, underline: (s) => `\x1b[4m${s}\x1b[24m`, dim: (s) => `\x1b[2m${s}\x1b[22m` };
  if (!process.stdout.isTTY) return { bold: (s) => s, underline: (s) => s, dim: (s) => s };
  return e;
})();

const INDENT = "  ";
const LEFT_COLUMN_WIDTH = 28;
const COLUMN_MIN_PADDING = 2;

function hdr(text) {
  return `\n${bold(underline(text))}\n`;
}

function item(cmd, desc) {
  const left = `${INDENT}${cmd}`;
  const pad = Math.max(COLUMN_MIN_PADDING, LEFT_COLUMN_WIDTH - left.length);
  return `${left}${" ".repeat(pad)}${desc}`;
}

function section(title, entries) {
  return hdr(title) + entries.map(([c, d]) => item(c, d)).join("\n");
}

function line(text) {
  return `${INDENT}${text}`;
}

const help = `
${bold("# rui-story — 故事任务面板管理")}

${dim("远端查询 · 查看 · 同步 | 数据源为远端 API，不读本地文件系统")}

${hdr("用法")}
${item("/rui-story --help", "显示此帮助信息")}
${item("/rui-story -h", "同上")}
${item("/rui-story help", "同上")}

${section("只读命令（远端 API）", [
  ["/rui-story", "状态概览：远端查询 → 按状态统计 + 最近活动"],
  ["/rui-story list", "进度全景：远端查询 → 所有故事详细表格"],
  ["/rui-story show <name>", "单故事详情：远端查询 → 文件清单/状态/元数据"],
])}

${section("写入命令", [
  ["/rui-story sync [<name>]", "远端→本地覆盖 (委托 import-docs mode=pull)"],
  ["/rui-story clear [<name>]", "仅本地：移除非 {project}- 前缀文件，先展示后确认"],
  ["/rui-story remove <name>", "仅本地：删除整个故事目录，先展示后确认"],
])}

${section("常用场景示例", [
  ["# 查看项目整体进度", ""],
  ["/rui-story", "远端查询故事面板，展示状态统计和最近活动"],
  ["", ""],
  ["# 查看所有故事详情", ""],
  ["/rui-story list", "远端查询，表格形式展示所有故事的完整信息"],
  ["", ""],
  ["# 查看单个故事", ""],
  ["/rui-story show user-login", "远端查询，展示该故事的所有文件、状态、元数据"],
  ["", ""],
  ["# 从远端同步故事文档到本地", ""],
  ["/rui-story sync user-login", "委托 import-docs 从远端拉取该故事文档"],
  ["/rui-story sync", "展示可同步故事推荐，等待用户选择"],
  ["", ""],
  ["# 清理混入的其他项目文件（仅本地）", ""],
  ["/rui-story clear user-login", "扫描目录，展示双重清单（删除/保留），确认后清除非 YrY- 文件"],
  ["/rui-story clear", "扫描所有故事目录，逐目录清理非项目前缀文件"],
  ["", ""],
  ["# 删除故事本地副本（仅本地）", ""],
  ["/rui-story remove old-story", "展示目录内容，确认后删除整个本地目录（远端不受影响）"],
])}

${section("数据源", [
  ["默认模式", "远端 API（api.effiy.cn）"],
  ["查询操作", "零本地文件系统读取"],
  ["sync 操作", "远端 → 本地（唯一远端写本地场景）"],
  ["clear/remove 操作", "纯本地，不触碰远端 API"],
])}

${section("操作边界", [
  ["✅ 远端 API 查询", "sessions 故事任务面板/ 前缀"],
  ["✅ sync 委托 import-docs", "远端 → 本地"],
  ["✅ clear/remove 本地操作", "仅本地文件系统，不触碰远端"],
  ["❌ 查询读本地文件系统", "禁止"],
  ["❌ 不可触及", "源码 · git 分支操作 · 故事文档内容生成"],
])}

${section("核心规则", [
  ["远端为默认数据源", "查询不读本地文件系统（sync/clear/remove 例外）"],
  ["仅查询与同步", "不创建文档内容（那是 /rui doc）"],
  ["不改源码", "不改源代码或 git 分支"],
  ["kebab-case", "name 小写连字符，无 Project 前缀"],
  ["sync 委托 import-docs", "不自行实现同步逻辑"],
  ["clear/remove 仅本地", "不触碰远端数据，先展示后确认再执行"],
])}

${section("全局选项", [
  ["--help, -h, help", "显示此帮助信息"],
])}

${dim("详细说明: skills/rui-story/SKILL.md | 远端面板: 故事任务面板/")}
`;

console.log(help);
