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

${dim("远端查询 · 状态跟踪 · 同步 · 清理 · 状态机 · 指标采集 | 数据源为远端 API，不读本地文件系统")}

${hdr("快速入门")}
${item("/rui-story", "状态概览：远端查询 → 按状态统计 + 最近活动", cyan)}
${item("/rui-story list", "进度全景：远端查询 → 所有故事详细表格", cyan)}
${item("/rui-story show <name>", "单故事详情：文件清单 / 状态 / 元数据 / 阻断原因", cyan)}
${item("/rui-story status dashboard", "跨故事聚合仪表板：本地 rui-state.json 汇总", cyan)}

${hdr("子命令")}

${subhdr("只读命令（远端 API）")}
${item("/rui-story", "状态概览：远端查询 → 按状态统计 + 最近活动", cyan)}
${item("/rui-story list", "进度全景：远端查询 → 所有故事详细表格（含类型推断 + git 分支）", cyan)}
${item("/rui-story show <name>", "单故事详情：文件清单 / 状态 / 元数据 / 阻断原因", cyan)}
${item("/rui-story recommend", "同步推荐：列出远端可同步的故事及推荐命令", cyan)}
${item("/rui-story health", "健康检查：API 凭据 / 远端可达性 / 项目配置 / 数据完整性", cyan)}

${subhdr("状态管理（本地）")}
${item("/rui-story status check --from=<s> --to=<s>", "验证状态转移合法性：6 状态机规则引擎（isValidTransition）", cyan)}
${item("/rui-story status dashboard", "跨故事聚合仪表板：本地 rui-state.json 汇总表", cyan)}
${item("/rui-story status transition --story=<name> --to=<s>", "执行状态转移：更新 rui-state.json + 审计日志 + 变更历史", yellow)}

${subhdr("指标采集（本地）")}
${item("/rui-story collect story --story=<name>", "单故事指标：阻断率 / P0 密度 / 工具错误率 / Agent 参与", cyan)}
${item("/rui-story collect all --window=12", "跨故事指标汇总：所有故事聚合统计 + 滚动窗口", cyan)}
${item("/rui-story collect anomalies --threshold=2.0", "异常检测：D0-D7 诊断阈值对比（阻断率/P0密度/T3占比/阶段耗时）", cyan)}


${subhdr("合并拆分")}
${item("/rui-story merge [<name>]", "合并远端与本地故事（最小可用原则）；自动 MINOR 版本升级", yellow)}
${item("/rui-story split <name>", "拆分大故事为独立子故事；父升级子初始 1.0.0", yellow)}

${subhdr("写入命令")}
${item("/rui-story sync [<name>]", "远端→本地覆盖（委托 import-docs mode=pull）", yellow)}
${item("/rui-story clear [<name>]", "仅本地：移除非项目前缀文件，先展示后确认", yellow)}
${item("/rui-story remove <name>", "仅本地：删除整个故事目录，先展示后确认", yellow)}

${hdr("使用场景")}
${scene("查看项目整体进度")}
${item("/rui-story", "远端查询 → 状态统计 + 最近 5 个活跃故事", cyan)}
${item("/rui-story list", "表格：Story | Status | Files | Last Modified | Type | Branch", cyan)}
${scene("查看单个故事详情")}
${item("/rui-story show user-login", "远端查询 → 文件清单 / 状态 / 元数据 / 阻断原因", cyan)}
${scene("跨故事状态聚合")}
${item("/rui-story status dashboard", "本地所有故事目录 rui-state.json → 状态分布 + 故事列表", cyan)}
${scene("验证状态转移合法性")}
${item("/rui-story status check --from=设计 --to=实施", "exit 0=合法  exit 1=非法（跳过中间态直接到测试会被拒绝）", cyan)}
${scene("执行状态转移")}
${item("/rui-story status transition --story=user-login --to=设计 --reason=\"开始设计\"", "更新 rui-state.json + 写入 status-history.jsonl 审计日志", cyan)}
${scene("单故事指标采集")}
${item("/rui-story collect story --story=user-login --format=table", "执行记忆/审计/交付/状态变更计数 → 阻断率/P0密度/工具错误率", cyan)}
${scene("异常检测")}
${item("/rui-story collect anomalies", "跨故事对比 D0-D7 阈值：阻断率>20% | P0密度>2x均值 | T3>30% | 阶段耗时>3x均值", cyan)}
${scene("从远端同步故事")}
${item("/rui-story sync user-login", "委托 import-docs 从远端 API 拉取故事文档到本地", cyan)}
${item("/rui-story sync", "展示所有可同步故事的推荐列表，用户选择后同步", cyan)}
${item("/rui-story recommend", "查询远端故事面板 → 列出可同步故事 + 推荐命令", cyan)}
${scene("清理异项目文件")}
${item("/rui-story clear user-login", "扫描目录 → 双重清单 → 确认后清除非项目前缀文件", cyan)}
${item("/rui-story clear", "扫描全部故事目录 → 列出每目录清单 → 逐个确认清理", cyan)}
${scene("删除故事本地副本")}
${item("/rui-story remove old-story", "展示目录内容 → 确认后删除（远端不受影响）", cyan)}
${scene("健康检查与修复")}
${item("/rui-story health", "Step 1：诊断凭据 / API / 配置 / 数据完整性", cyan)}
${item("# 按 health 输出提示配置 API_X_TOKEN", "Step 2：根据诊断建议修复", dim)}
${item("/rui-story health", "Step 3：重新检查确认修复", cyan)}
${scene("诊断阻断原因")}
${item("/rui-story show user-login", "查看详情 → 阻断原因字段 → 按提示恢复后重跑 /rui code", cyan)}
${scene("误删后重新拉取")}
${item("/rui-story sync user-login", "远端文档不受 remove 影响，随时可重新同步", cyan)}
`;

console.log(help);
