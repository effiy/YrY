#!/usr/bin/env node
// rui-claude — Manage .claude/ directories help
// 用法: node skills/rui-claude/help.mjs 或 /rui-claude --help

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
const LEFT_COLUMN_WIDTH = 44;
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
${bold("# rui-claude — .claude/ 目录管理")}

${dim("同步远端配置 · 健康度分析 · 操作历史 · 需求管线 | version --up 已迁移至 /rui")}

${hdr("快速入门")}
${item("/rui-claude", "推荐任务：5 层评分排序的 .claude/ 维护建议", cyan)}
${item("/rui-claude sync", "覆盖式同步：远端 API → rui-import pull 覆盖本地 .claude/", cyan)}
${item("/rui-claude update", "插件升级：git pull 最新 YrY → 清除插件缓存 → sync 远端 .claude/", cyan)}
${item("/rui-claude update-version", "版本收敛升级：合并所有分支 → 自主升版 → 推送 + tag", cyan)}
${item("/rui-claude retro", "健康度分析：三节复盘（配置结构 / 健康度 / 改进项）", cyan)}

${hdr("子命令")}

${subhdr("只读命令")}
${item("/rui-claude", "推荐任务：5 层评分排序（L0 时间 / L1 依赖 / L2 风险 / L3 覆盖 / L4 质量）", cyan)}
${item("/rui-claude retro", "健康度分析：三节复盘（配置结构 / 健康度 / 改进项）", cyan)}
${flag("name <kebab-case>", "指定故事名（默认自动生成）")}
${flag("json", "JSON 格式输出")}
${item("/rui-claude history list", "列出最近操作记录", cyan)}
${flag("limit N", "返回记录数（默认 10）")}
${item("/rui-claude history stats", "操作统计摘要", cyan)}
${flag("json", "JSON 格式输出")}

${subhdr("写入命令")}
${item("/rui-claude sync", "覆盖式同步：远端 API → rui-import pull 覆盖本地 .claude/", yellow)}
${item("/rui-claude update", "插件升级：git pull 最新 YrY → sync 远端 .claude/ 双刷新", yellow)}
${item("/rui-claude update-version", "版本收敛升级：合并所有分支 → 自主升版 → 推送 + tag", yellow)}
${item("/rui-claude <需求>", "需求管线：走 rui code 流程修改 .claude/ 配置", yellow)}

${hdr("使用场景")}
${scene("拉取团队最新 .claude/ 配置")}
${item("/rui-claude sync", "从远端 API 全量覆盖本地 .claude/ → 提示确认后执行", cyan)}
${scene("一键升级 YrY 插件并同步配置")}
${item("/rui-claude update", "git pull 最新 YrY → 清除旧版本缓存 → sync .claude/ → 三重刷新完成", cyan)}
${scene("合并所有开发分支并发布新版本")}
${item("/rui-claude update-version", "合并所有 feat 分支到 main → 自主判定版本号 → 推送远端 + tag", cyan)}
${scene("分析配置健康度")}
${item("/rui-claude retro", "分析 agents/rules/skills 结构 → 输出复盘文档", cyan)}
${item("/rui-claude retro --name config-audit", "指定故事名，可溯源", cyan)}
${item("/rui-claude retro --json", "JSON 格式输出（供脚本消费）", cyan)}
${scene("查看操作历史")}
${item("/rui-claude history list", "最近 10 条操作记录", cyan)}
${item("/rui-claude history list --limit 20", "最近 20 条", cyan)}
${item("/rui-claude history stats --json", "统计摘要（JSON）", cyan)}
${scene("修改 .claude/ 配置走完整管线")}
${item('/rui-claude "新增一个 security check hook"', "需求 → doc → code → 交付", cyan)}
${scene("获取推荐维护任务")}
${item("/rui-claude", "5 层评分排序的 .claude/ 维护建议", cyan)}
${scene("全流程：同步配置 → 分析 → 修复")}
${item("/rui-claude sync", "Step 1：从远端拉取最新 .claude/ 配置", cyan)}
${item("/rui-claude retro", "Step 2：分析配置健康度，获取改进项", cyan)}
${item('/rui-claude "修复 retro 报告中的 P0 项"', "Step 3：走完整管线修复问题", cyan)}
${scene("监控操作频率")}
${item("/rui-claude history stats", "查看 sync / retro / 需求 操作频次统计", cyan)}
${item("/rui-claude history stats --json", "JSON 格式，供监控脚本消费", cyan)}
${scene("版本升级（迁移至 rui）")}
${item("/rui version --up", "version --up 已从 rui-claude 迁移至 /rui，详见 /rui --help", cyan)}
${scene("同步前先查历史（安全工作流）")}
${item("/rui-claude history list --limit 5", "Step 1：查看最近操作，确认无冲突", cyan)}
${item("/rui-claude sync", "Step 2：确认安全后同步", cyan)}
${scene("调试：查看谁改了什么")}
${item("/rui-claude history list --limit 20", "列出最近 20 条操作，排查配置变更来源", cyan)}
`;

console.log(help);
