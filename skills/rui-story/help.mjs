#!/usr/bin/env node
// rui-story — Story panel management and sync help
// 用法: node skills/rui-story/help.mjs 或 /rui-story --help

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

const help = `
${bold("# rui-story — 故事任务面板管理")}

${dim("远端查询 · 状态跟踪 · 同步 · 清理 | 数据源为远端 API，不读本地文件系统")}

${hdr("用法")}
${item("/rui-story --help, -h, help", "显示此帮助信息")}

${hdr("只读命令")}${dim("（远端 API 查询，不触碰本地文件系统）")}

${item("/rui-story", "状态概览：远端查询 → 按状态统计 + 最近活动", green)}
${item("/rui-story list", "进度全景：远端查询 → 所有故事详细表格（含类型推断 + git 分支）", green)}
${item("/rui-story show <name>", "单故事详情：文件清单 / 状态 / 元数据 / 阻断原因", green)}
${item("/rui-story recommend", "同步推荐：列出远端可同步的故事及推荐命令", green)}
${item("/rui-story health", "健康检查: API 凭据 / 远端可达性 / 项目配置 / 数据完整性", green)}

${hdr("写入命令")}${dim("（本地文件系统操作）")}

${item("/rui-story sync [<name>]", "远端→本地覆盖 (委托 import-docs mode=pull)", yellow)}
${item("", dim("无参数时展示可同步故事推荐，等待用户选择。"))}
${item("/rui-story clear [<name>]", "仅本地：移除非 {project}- 前缀文件，先展示后确认", yellow)}
${item("", dim("扫描目录 → 双重清单（删除/保留）→ 确认后执行。"))}
${item("/rui-story remove <name>", "仅本地：删除整个故事目录，先展示后确认", yellow)}
${item("", dim("展示目录内容 → 确认后删除。远端不受影响。"))}

${hdr("状态判定")}
${item("not_started", "无 {project}-故事任务.md", dim)}
${item("docs_in_progress", "有故事任务但文档基线不完整", yellow)}
${item("docs_done", "文档基线完整，无实施报告", cyan)}
${item("code_in_progress", "有实施报告，无测试报告")}
${item("code_done", "测试报告就绪", green)}
${item("blocked", "测试报告就绪但 .memory/rui-state.json 标记阻断", red)}

${hdr("常用场景示例")}
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

${hdr("操作边界")}
${item("✅ 远端 API 查询", "sessions 故事任务面板/ 前缀 — 所有只读命令", green)}
${item("✅ sync 委托 import-docs", "远端 → 本地 (唯一远端写本地场景)", green)}
${item("✅ clear/remove 本地操作", "仅本地文件系统，不触碰远端 API", green)}
${item("❌ 查询读本地文件系统", "禁止 (sync/clear/remove 例外)", red)}
${item("❌ 源码 · git 分支操作 · 内容生成", "不可触及", red)}

${hdr("核心规则")}
${line(dim("1. 远端为默认数据源 — 所有查询不读本地文件系统"))}
${line(dim("2. 仅查询与同步 — 不创建文档内容（那是 /rui doc 的职责）"))}
${line(dim("3. 不改源码 — 不改源代码或 git 分支"))}
${line(dim("4. kebab-case — name 小写连字符，无 project 前缀"))}
${line(dim("5. sync 委托 import-docs — 不自行实现同步逻辑"))}
${line(dim("6. clear/remove 先展示后确认 — 确定性脚本执行，无需 agent 解读"))}
${line(dim("7. recommend/health 确定性输出 — 纯数据查询，不依赖 AI 推理"))}

${hdr("数据流")}
${item("默认模式", "远端 API (https://api.effiy.cn) → sessions 查询", dim)}
${item("只读命令", "零本地文件系统读取，纯远端 API", dim)}
${item("sync", "远端 → 本地覆盖 (唯一远端写本地方向)", dim)}
${item("clear/remove", "纯本地文件系统操作，不触碰远端", dim)}
${item("无 API_X_TOKEN", "所有命令受阻，显示配置指引", dim)}

${hdr("相关资源")}
${item("SKILL.md", "skills/rui-story/SKILL.md — 完整规约", dim)}
${item("rui-story.mjs", "skills/rui-story/rui-story.mjs — 实现脚本", dim)}
${item("import-docs", "skills/import-docs/SKILL.md — sync 委托目标", dim)}
${item("rui", "/rui — 故事驱动 SDLC 编排器", dim)}

${dim("详细说明: skills/rui-story/SKILL.md | 远端面板: 故事任务面板/")}
`;

console.log(help);
