#!/usr/bin/env node
// rui-story — Story panel management and sync help
// 用法: node skills/rui-story/help.mjs 或 /rui-story --help

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
${bold("# rui-story — 故事任务面板管理")}

${dim("远端查询 · 状态跟踪 · 同步 · 清理 | 数据源为远端 API，不读本地文件系统")}

${hdr("快速入门")}
${item("/rui-story", "状态概览：远端查询 → 按状态统计 + 最近活动", green)}
${item("/rui-story list", "进度全景：远端查询 → 所有故事详细表格", green)}
${item("/rui-story show <name>", "单故事详情：文件清单 / 状态 / 元数据 / 阻断原因", green)}

${hdr("子命令")}

${subhdr("只读命令")}
${item("/rui-story", "状态概览：远端查询 → 按状态统计 + 最近活动", green)}
${item("/rui-story list", "进度全景：远端查询 → 所有故事详细表格（含类型推断 + git 分支）", green)}
${item("/rui-story show <name>", "单故事详情：文件清单 / 状态 / 元数据 / 阻断原因", green)}
${item("/rui-story recommend", "同步推荐：列出远端可同步的故事及推荐命令", green)}
${item("/rui-story health", "健康检查: API 凭据 / 远端可达性 / 项目配置 / 数据完整性", green)}

${subhdr("写入命令")}
${item("/rui-story sync [<name>]", "远端→本地覆盖 (委托 import-docs mode=pull)", yellow)}
${item("/rui-story clear [<name>]", "仅本地：移除非 {project}- 前缀文件，先展示后确认", yellow)}
${item("/rui-story remove <name>", "仅本地：删除整个故事目录，先展示后确认", yellow)}

${hdr("使用场景")}
${item("# 查看项目整体进度", "", bold)}
${item("/rui-story", "远端查询 → 状态统计 + 最近 5 个活跃故事", green)}
${item("", "")}
${item("# 查看全部故事详情表格", "", bold)}
${item("/rui-story list", "表格: Story | Status | Files | Last Modified | Type | Branch", green)}
${item("", "")}
${item("# 查看单个故事", "", bold)}
${item("/rui-story show user-login", "远端查询 → 文件清单 / 状态 / 元数据 / 阻断原因", green)}
${item("", "")}
${item("# 从远端同步", "", bold)}
${item("/rui-story sync user-login", "委托 import-docs 从远端 API 拉取故事文档到本地", green)}
${item("/rui-story sync", "展示所有可同步故事的推荐列表", green)}
${item("", "")}
${item("# 清理混入的其他项目文件", "", bold)}
${item("/rui-story clear user-login", "扫描目录 → 双重清单 → 确认后清除非项目前缀文件", green)}
${item("", "")}
${item("# 删除故事本地副本", "", bold)}
${item("/rui-story remove old-story", "展示目录内容 → 确认后删除（远端不受影响）", green)}
${item("", "")}
${item("# 获取同步推荐", "", bold)}
${item("/rui-story recommend", "查询远端故事面板 → 列出可同步故事 + 推荐命令", green)}
${item("", "")}
${item("# 健康检查", "", bold)}
${item("/rui-story health", "检查凭据/API/配置/数据完整性", green)}
${item("", "")}
${item("# 清理所有故事目录中的异项目文件", "", bold)}
${item("/rui-story clear", "扫描全部故事目录 → 列出每目录双重清单 → 逐个确认清理", green)}
${item("", "")}
${item("# 误删后重新拉取", "", bold)}
${item("/rui-story sync user-login", "远端文档不受 remove 影响，随时可重新同步", green)}
${item("", "")}
${item("# 健康检查发现问题后修复", "", bold)}
${item("/rui-story health", "Step 1: 诊断凭据/API/配置/数据", green)}
${item("# 按 health 输出提示配置 API_X_TOKEN 或检查网络", "Step 2: 根据诊断建议修复", green)}
${item("/rui-story health", "Step 3: 重新检查确认修复", green)}
${item("", "")}
${item("# 诊断阻断原因", "", bold)}
${item("/rui-story show user-login", "查看详情 → 阻断原因字段 → 按提示恢复后重跑 /rui code", green)}
${item("", "")}
${item("# 浏览可同步故事再选择", "", bold)}
${item("/rui-story sync", "无参数 → 列出远端可同步的故事 + 推荐命令 → 用户选择", green)}
${item("", "")}
${item("# 找出需要关注的进行中故事", "", bold)}
${item("/rui-story list", "按状态筛选 docs_in_progress / code_in_progress → 决定下一步", green)}
`;

console.log(help);
