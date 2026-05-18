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

${dim("扫描 · 查看 · 同步 | 操作仅限 docs/故事任务面板/")}

${hdr("用法")}
${item("/rui-story --help", "显示此帮助信息")}
${item("/rui-story -h", "同上")}
${item("/rui-story help", "同上")}

${section("只读命令", [
  ["/rui-story", "状态概览：按状态统计 + 最近活动"],
  ["/rui-story list", "进度全景：所有故事的详细表格（从 /rui 迁移）"],
  ["/rui-story show <name>", "单故事详情：文件清单/状态/元数据/git 分支"],
])}

${section("写入命令", [
  ["/rui-story sync [<name>]", "从远端同步文档到本地；未指定名称时展示推荐提示"],
])}

${section("常用场景示例", [
  ["# 查看项目整体进度", ""],
  ["/rui-story", "展示状态统计和最近活动"],
  ["", ""],
  ["# 查看所有故事详情", ""],
  ["/rui-story list", "表格形式展示所有故事的完整信息"],
  ["", ""],
  ["# 查看单个故事", ""],
  ["/rui-story show user-login", "展示该故事的所有文件、状态、元数据"],
  ["", ""],
  ["# 从远端同步故事文档", ""],
  ["/rui-story sync user-login", "从远端同步该故事文档到本地"],
  ["/rui-story sync", "展示可同步故事推荐，等待用户选择"],
])}

${section("操作边界", [
  ["✅ docs/故事任务面板/", "查询与同步"],
  ["❌ 不可触及", "源码 · git 分支操作 · 故事文档内容生成"],
])}

${section("核心规则", [
  ["仅查询与同步", "不创建文档内容（那是 /rui doc）"],
  ["不改源码", "不改源代码或 git 分支"],
  ["kebab-case", "name 小写连字符，无 Project 前缀"],
  ["sync 委托 import-docs", "不自行实现同步逻辑"],
])}

${section("全局选项", [
  ["--help, -h, help", "显示此帮助信息"],
])}

${dim("详细说明: skills/rui-story/SKILL.md | 故事面板: docs/故事任务面板/")}
`;

console.log(help);
