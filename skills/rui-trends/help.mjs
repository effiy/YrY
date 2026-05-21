#!/usr/bin/env node
// rui-trends — 技术趋势发现 + 代码库健康分析
// 用法: node skills/rui-trends/help.mjs 或 /rui-trends --help

const ANSI_BOLD = 1;
const ANSI_DIM = 2;
const ANSI_UNDERLINE = 4;
const ANSI_YELLOW = 33;
const ANSI_GREEN = 36;
const ANSI_CYAN = 36;

const { bold, underline, dim, yellow, green, cyan } = (() => {
  const make = (code) => (s) => `\x1b[${code}m${s}\x1b[0m`;
  const e = {
    bold: make(ANSI_BOLD), underline: make(ANSI_UNDERLINE), dim: make(ANSI_DIM),
    yellow: make(ANSI_YELLOW), green: make(ANSI_GREEN), cyan: make(ANSI_CYAN),
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

function line(text) {
  return `${SUB_INDENT}${text}`;
}

function scene(title) {
  return `\n${SUB_INDENT}${bold(title)}\n`;
}

const help = `
${bold("# rui-trends — 技术趋势发现 & 代码库健康分析")}

${dim("代码库统计 · 大文件检测 · 变更热点 · 组件审计 · 历史复盘 · GitHub Trending")}

${hdr("快速入门")}
${item("/rui-trends", "基础统计：总文件/模块数/技术栈概况", green)}
${item("/rui-trends all", "一键全量扫描", cyan)}
${item("/rui-trends --help", "显示此帮助信息", dim)}

${hdr("子命令")}

${subhdr("modules — 模块规模概览")}
${item("/rui-trends modules", "各模块文件数 / 行数 / 最大文件", green)}

${subhdr("large-files — 大文件检测")}
${item("/rui-trends large-files", "列出 ≥500 行的文件", green)}
${flag("threshold N", "设置行数阈值，默认 500")}

${subhdr("hotspots — Git 高频变更文件")}
${item("/rui-trends hotspots", "近 30 天变更热点排行", green)}
${flag("since <date>", "起始日期（如 2026-01-01）")}
${flag("top N", "只看前 N 个文件")}

${subhdr("components — zk- 组件使用频次统计")}
${item("/rui-trends components", "统计 zk- 前缀组件的引用频次", green)}

${subhdr("review — 历史自改进复盘扫描")}
${item("/rui-trends review", "扫描 docs/ 下历史复盘记录，对比趋势", green)}

${subhdr("trending — GitHub Trending")}
${item("/rui-trends trending", "GitHub Trending 当前热门仓库", green)}
${flag("since daily|weekly", "时间窗口，默认 daily")}
${flag("l <L>", "编程语言过滤（如 TypeScript, Rust, Go）")}

${hdr("使用场景")}
${scene("新接手项目")}
${item("/rui-trends", "先看基础统计，建立全局认知", green)}
${item("/rui-trends modules", "了解各模块规模，识别核心模块", green)}
${item("/rui-trends large-files", "发现需要拆分的大文件", green)}
${scene("重构前健康检查")}
${item("/rui-trends large-files --threshold 800", "定位超过 800 行的文件", green)}
${item("/rui-trends hotspots --since 2026-01-01", "查看年度变更热点，识别不稳定模块", green)}
${item("/rui-trends components", "审计 zk- 组件依赖关系", green)}
${scene("日常迭代监控")}
${item("/rui-trends hotspots", "近 30 天变更热点，追踪修改集中区", green)}
${item("/rui-trends hotspots --top 10", "只看变更最多的前 10 个文件", green)}
${item("/rui-trends trending", "了解外部技术趋势，保持技术敏感度", green)}
${scene("团队复盘")}
${item("/rui-trends all", "生成完整健康度报告", cyan)}
${item("/rui-trends review", "对比历史复盘记录，评估改进效果", green)}
`;

console.log(help);
