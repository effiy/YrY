#!/usr/bin/env node
// trends-discovery — Query technology trends from GitHub/OSS Insight/TrendShift
// 用法: node skills/trends-discovery/help.mjs 或 /trends-discovery --help

const { bold, underline, dim } = (() => {
  const e = { bold: (s) => `\x1b[1m${s}\x1b[22m`, underline: (s) => `\x1b[4m${s}\x1b[24m`, dim: (s) => `\x1b[2m${s}\x1b[22m` };
  if (!process.stdout.isTTY) return { bold: (s) => s, underline: (s) => s, dim: (s) => s };
  return e;
})();

const INDENT = "  ";

function hdr(text) {
  return `\n${bold(underline(text))}\n`;
}

function item(cmd, desc) {
  const left = `${INDENT}${cmd}`;
  const pad = Math.max(2, 36 - left.length);
  return `${left}${" ".repeat(pad)}${desc}`;
}

function section(title, entries) {
  return hdr(title) + entries.map(([c, d]) => item(c, d)).join("\n");
}

const help = `
${bold("# trends-discovery — 技术趋势发现")}

${dim("GitHub Trending · OSS Insight · TrendShift · Top-Starred | 自改进 D5 集成")}

${hdr("用法")}
${item("/trends-discovery --help", "显示此帮助信息")}
${item("/trends-discovery -h", "同上")}
${item("/trends-discovery help", "同上")}

${section("调用形态", [
  ["/trends-discovery", "状态检查：各数据源可达性 + 最近查询时间"],
  ["/trends-discovery github-trending", "查询 GitHub Trending 当前榜单"],
  ["  --lang <language>", "编程语言过滤 (如 TypeScript, Python, Rust)"],
  ["  --since daily|weekly", "时间窗口 (默认 daily)"],
  ["/trends-discovery oss-insight", "查询 OSS Insight 仓库排名"],
  ["  --metric stars|forks|contributors", "排名指标 (默认 stars)"],
  ["  --limit N", "返回数量 (默认 10)"],
  ["/trends-discovery trendshift", "查询 TrendShift 趋势变化"],
  ["  --range 7|30|90", "时间范围天数 (默认 7)"],
  ["/trends-discovery top-starred", "查询 GitHub 高星项目"],
  ["  --min-stars N", "最低 star 数 (默认 100000)"],
  ["/trends-discovery all", "依次查询全部四个数据源"],
])}

${section("输出格式", [
  ["表格 (排名|仓库|Stars|语言|趋势|描述)", "所有子命令的标准输出"],
  ["关键发现", "列表中的人工可读要点"],
  ["与 YrY 的关联", "技术选型/架构验证建议"],
])}

${section("管线集成", [
  ["自改进 D5 诊断", "依赖退化诊断时自动调用，验证外部参考新鲜度"],
  ["交付阶段", "技术选型验证，输出写入实施报告"],
  ["输出位置", "{project}-自改进复盘.md §2.1 技术趋势验证"],
])}

${section("常用场景示例", [
  ["# 快速查看今日趋势", ""],
  ["/trends-discovery github-trending --since daily", "GitHub 今日热门仓库"],
  ["# 评估技术栈社区活跃度", ""],
  ["/trends-discovery top-starred --min-stars 50000", "5万星以上项目列表"],
  ["/trends-discovery oss-insight --metric contributors", "贡献者活跃度排行"],
  ["# 发现快速上升项目", ""],
  ["/trends-discovery trendshift --range 7", "7天内 star 增长最快项目"],
  ["# 全面扫描", ""],
  ["/trends-discovery all", "依次查询全部四个数据源"],
])}

${section("降级行为", [
  ["WebFetch 不可用", "输出 URL 引导用户手动访问"],
  ["JS 渲染页面", "输出 meta 信息，标注需手动访问"],
  ["API 限速", "间隔重试最多 2 次，仍失败则输出提示"],
])}

${dim("YrY 自包含原则：外部趋势数据不缓存到本地。每次查询实时获取。")}
`;

process.stdout.write(help.trimStart() + "\n");
