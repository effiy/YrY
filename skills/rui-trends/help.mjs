#!/usr/bin/env node
// rui-trends — Query technology trends from GitHub/OSS Insight/TrendShift
// 用法: node skills/rui-trends/help.mjs 或 /rui-trends --help

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
  return item(`  --${name}`, desc, yellow);
}

const help = `
${bold("# rui-trends — 技术趋势发现")}

${dim("GitHub Trending · OSS Insight · TrendShift · Top-Starred | 自改进 D0/D3/D5/D6 集成")}

${hdr("用法")}
${item("/rui-trends --help, -h, help", "显示此帮助信息")}

${hdr("数据源 & 子命令")}

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

${hdr("输出格式")}
${line(dim("所有子命令输出统一格式:"))}
${item("表格", "排名 | 仓库 | Stars | 语言 | 趋势 | 描述", dim)}
${item("关键发现", "从数据中提取的人工可读要点（3-5 条）")}
${item("与 YrY 关联", "技术选型 / 架构验证 / 依赖替换建议")}

${hdr("诊断 × 子命令映射")}
${item("D0 基线偏离", "github-trending --lang <L> + trendshift --range 90", dim)}
${item("D3 复杂度增长", "github-trending + oss-insight", dim)}
${item("D5 依赖退化", "all（四源全查，主触发诊断）", dim)}
${item("D6 文档过时", "github-trending --since weekly", dim)}

${hdr("常用场景示例")}
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

${hdr("自改进集成")}
${line(dim("本技能是自改进管线 D0/D3/D5/D6 诊断的核心数据源。"))}
${line(dim("趋势数据为实时快照，不落盘缓存。诊断结论写入自改进复盘 §2.1。"))}
${line(dim("同一趋势信号连续 ≥2 故事触发 → 升级为 libs/trends.md 规则。"))}
${para(dim("详细: rules/self-improve.md (诊断规则) · agents/self-improve.md (数据源表)"))}

${hdr("提案路由")}
${item("技术栈趋势下降", "→ D0 基线偏离 → process: 技术选型复审", dim)}
${item("新兴替代方案", "→ D3 复杂度 → refactor: 依赖替换评估", dim)}
${item("libs/ URL 失效", "→ D5 依赖退化 → refactor: 更新外部参考", dim)}
${item("趋势参考陈旧", "→ D6 文档过时 → process: 刷新周期调整", dim)}

${hdr("降级策略")}
${item("WebFetch 不可用", "输出 URL 引导用户手动访问，标注「无网络访问」", dim)}
${item("JS 渲染页面", "输出 meta 信息 + title，标注「需手动访问」")}
${item("API 限速", "间隔 5s 重试最多 2 次，仍失败输出上次缓存")}
${item("所有数据源不可达", "输出待补充占位符 → D5 诊断跳过（no-metrics）")}
${item("仅 1 源可用", "标注「数据不足」→ 跳过 E3 评估")}

${hdr("核心约束")}
${line(dim("1. 趋势数据不缓存到本地文件 — 每次查询实时获取"))}
${line(dim("2. 输出格式统一 — 表格 + 关键发现 + 关联分析"))}
${line(dim("3. 降级不阻断管线 — 数据不可达时输出占位符"))}
${line(dim("4. 诊断假设需基线依据 — 不凭单一趋势信号下结论"))}

${hdr("相关资源")}
${item("SKILL.md", "skills/rui-trends/SKILL.md — 完整规约 + 诊断全景", dim)}
${item("trends.md", "libs/trends.md — 外部参考索引 + 新鲜度标记", dim)}
${item("self-improve.md", "rules/self-improve.md — D0–D7 诊断规则", dim)}
${item("self-improve.md", "agents/self-improve.md — 自改进 Agent 数据源表", dim)}

${dim("YrY 自包含原则：外部趋势数据不缓存到本地。每次查询实时获取。")}
`;

console.log(help);
