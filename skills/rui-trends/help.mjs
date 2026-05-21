#!/usr/bin/env node
// rui-trends — Query technology trends from GitHub/OSS Insight/TrendShift
// 用法: node skills/rui-trends/help.mjs 或 /rui-trends --help

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
const LEFT_COLUMN_WIDTH = 36;
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

function flag(name, desc) {
  return item(`  --${name}`, desc, yellow);
}

const help = `
${bold("# rui-trends — 技术趋势发现")}

${dim("GitHub Trending · OSS Insight · TrendShift · Top-Starred | 自改进集成")}

${hdr("快速入门")}
${item("/rui-trends github-trending --since daily", "GitHub 今日热门仓库", green)}
${item("/rui-trends", "状态检查：各数据源可达性 + 最近查询时间", green)}
${item("/rui-trends all", "依次查询全部四个数据源 → 综合报告", cyan)}

${hdr("子命令")}

${subhdr("github-trending — GitHub Trending 榜单")}
${item("/rui-trends github-trending", "查询当前 GitHub Trending", green)}
${flag("lang <language>", "编程语言过滤 (如 TypeScript, Python, Rust, Go)")}
${flag("since daily|weekly", "时间窗口 (默认: daily)")}

${subhdr("oss-insight — OSS Insight 仓库排名")}
${item("/rui-trends oss-insight", "查询 OSS Insight 仓库排名", green)}
${flag("metric stars|forks|contributors", "排名指标 (默认: stars)")}
${flag("limit N", "返回数量 (默认: 10)")}

${subhdr("trendshift — TrendShift 趋势变化")}
${item("/rui-trends trendshift", "查询 TrendShift 趋势变化", green)}
${flag("range 7|30|90", "时间范围天数 (默认: 7)")}

${subhdr("top-starred — GitHub 高星项目")}
${item("/rui-trends top-starred", "查询 GitHub 高星项目", green)}
${flag("min-stars N", "最低 star 数 (默认: 100000)")}

${subhdr("批量 & 状态")}
${item("/rui-trends all", "依次查询全部四个数据源", cyan)}
${item("/rui-trends", "状态检查：各数据源可达性 + 最近查询时间", green)}

${hdr("使用场景")}
${item("# 快速查看今日趋势", "", bold)}
${item("/rui-trends github-trending --since daily", "GitHub 今日热门仓库", green)}
${item("", "")}
${item("# 查看特定语言趋势", "", bold)}
${item("/rui-trends github-trending --lang Rust --since weekly", "Rust 本周趋势", green)}
${item("", "")}
${item("# 评估技术栈社区活跃度", "", bold)}
${item("/rui-trends top-starred --min-stars 50000", "5万星以上项目列表", green)}
${item("/rui-trends oss-insight --metric contributors", "贡献者活跃度排行", green)}
${item("", "")}
${item("# 发现快速上升项目", "", bold)}
${item("/rui-trends trendshift --range 7", "7天内 star 增长最快项目", green)}
${item("/rui-trends trendshift --range 90", "季度趋势变化（用于 D0 诊断）", green)}
${item("", "")}
${item("# 全面趋势扫描 (D5 诊断用)", "", bold)}
${item("/rui-trends all", "依次查询四个数据源 → 综合报告", green)}
${item("", "")}
${item("# 查询前先探活", "", bold)}
${item("/rui-trends", "检查各数据源可达性 + 最近查询时间", green)}
${item("", "")}
${item("# 对比同一技术在不同数据源的表现", "", bold)}
${item("/rui-trends github-trending --lang TypeScript --since weekly", "Step 1: TypeScript 本周趋势", green)}
${item("/rui-trends top-starred --min-stars 50000", "Step 2: 高星项目交叉验证", green)}
${item("", "")}
${item("# 季度技术栈健康度检查 (D0 基线偏离诊断)", "", bold)}
${item("/rui-trends github-trending --lang Rust --since weekly", "Step 1: 当前技术栈社区热度", green)}
${item("/rui-trends trendshift --range 90", "Step 2: 季度趋势变化，判断是否偏离社区方向", green)}
${item("/rui-trends oss-insight --metric contributors --limit 20", "Step 3: 贡献者活跃度验证生态健康", green)}
${item("", "")}
${item("# 依赖替换评估 (D3 复杂度诊断)", "", bold)}
${item("/rui-trends github-trending --lang Python", "查看是否有更简洁的替代方案在崛起", green)}
${item("/rui-trends oss-insight --metric stars", "对比候选方案与现有依赖的社区认可度", green)}
${item("", "")}
${item("# OSS Insight 多指标对比", "", bold)}
${item("/rui-trends oss-insight --metric forks --limit 20", "按 fork 数排名，评估社区参与度", green)}
${item("/rui-trends oss-insight --metric contributors --limit 15", "按贡献者数排名，评估生态健康度", green)}
${item("", "")}
${item("# 对比日榜 vs 周榜发现加速趋势", "", bold)}
${item("/rui-trends github-trending --since daily", "Step 1: 今日热门（捕捉突然爆发的项目）", green)}
${item("/rui-trends github-trending --since weekly", "Step 2: 本周热门（确认持续热度而非一日行情）", green)}
${item("", "")}
${item("# 发现新兴中小项目", "", bold)}
${item("/rui-trends top-starred --min-stars 10000", "降低门槛到 1 万星，发现快速增长的新项目", green)}
${item("", "")}
${item("# 全链路趋势诊断（自改进 D5 标准流程）", "", bold)}
${item("/rui-trends", "Step 1: 探活 — 确认各数据源可达", green)}
${item("/rui-trends all", "Step 2: 全扫 — 四数据源综合报告", green)}
`;

console.log(help);
