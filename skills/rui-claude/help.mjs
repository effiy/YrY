#!/usr/bin/env node
// rui-claude — Manage .claude/ directories help
// 用法: node skills/rui-claude/help.mjs 或 /rui-claude --help

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
${bold("# rui-claude — .claude/ 目录管理")}

${dim("同步远端配置 · 健康度分析 · 操作历史 · 需求管线")}

${hdr("用法")}
${item("/rui-claude --help, -h, help", "显示此帮助信息")}

${hdr("命令")}

${subhdr("只读命令")}
${item("/rui-claude", "推荐任务：5 层评分排序（L0 时间 / L1 依赖 / L2 风险 / L3 覆盖 / L4 质量）", green)}
${item("/rui-claude retro", "健康度分析：三节复盘 (配置结构 / 健康度 / 改进项)", green)}
${item("  --name <kebab-case>", "指定故事名（默认自动生成）", yellow)}
${item("  --json", "JSON 格式输出", yellow)}
${item("/rui-claude history list", "列出最近操作记录", green)}
${item("  --limit N", "返回记录数 (默认 10)", yellow)}
${item("/rui-claude history stats", "操作统计摘要", green)}
${item("  --json", "JSON 格式输出", yellow)}

${subhdr("写入命令")}
${item("/rui-claude sync", "覆盖式同步：远端 API → import-docs pull 覆盖本地 .claude/", yellow)}
${item("", dim("前置确认：覆盖前提示用户确认意图。操作范围仅限 .claude/。"))}
${item("/rui-claude <需求>", "需求管线：走 rui code 流程修改 .claude/ 配置", yellow)}
${item("", dim("完整 Gate A → 逐模块 P0 → Gate B → 自改进 → 交付管线。"))}

${hdr("健康度分析维度")}${dim("（/rui-claude retro 输出）")}
${item("配置结构", "agents/ · rules/ · skills/ 目录完整性 + 文件数统计", dim)}
${item("健康度", "SKILL.md 规约完整性 · Agent 定义一致性 · 规则交叉引用", dim)}
${item("改进项", "缺失项清单 · 冗余项检测 · 优先级排序建议", dim)}

${hdr("常用场景示例")}
${item("# 拉取团队最新 .claude/ 配置", "", bold)}
${item("/rui-claude sync", "从远端 API 全量覆盖本地 .claude/ → 提示确认后执行", green)}
${item("", "")}
${item("# 分析配置健康度", "", bold)}
${item("/rui-claude retro", "分析 agents/rules/skills 结构 → 输出复盘文档", green)}
${item("/rui-claude retro --name config-audit", "指定故事名", green)}
${item("/rui-claude retro --json", "JSON 格式输出（供脚本消费）", green)}
${item("", "")}
${item("# 查看操作历史", "", bold)}
${item("/rui-claude history list", "最近 10 条操作记录", green)}
${item("/rui-claude history list --limit 20", "最近 20 条", green)}
${item("/rui-claude history stats --json", "统计摘要 (JSON)", green)}
${item("", "")}
${item("# 修改 .claude/ 配置走完整管线", "", bold)}
${item('/rui-claude "新增一个 security check hook"', "需求 → doc → code → 交付", green)}
${item("", "")}
${item("# 获取推荐维护任务", "", bold)}
${item("/rui-claude", "5 层评分排序的 .claude/ 维护建议", green)}

${hdr("操作边界")}
${item("✅ .claude/ 目录内", "agents/ · rules/ · skills/ · formulas.md · settings.json", green)}
${item("❌ 不可触及", "业务源码 · .claude-plugin/ · 其他项目目录", red)}

${hdr("核心规则")}
${line(dim("1. 仅限 .claude/ — 操作范围硬边界"))}
${line(dim("2. 走 rui code 管线 — 变更必须通过 Gate A/B"))}
${line(dim("3. feat 分支隔离 — Edit/Write 前验证 git branch，禁止在 main 改码"))}
${line(dim("4. sync 前确认意图 — 覆盖式操作需用户确认"))}
${line(dim("5. 空输入只推荐 — 不执行任何变更"))}
${line(dim("6. retro 纯分析 — 不修改任何文件"))}

${hdr("管线集成")}
${line(dim("sync 操作通过 import-docs mode=pull 实现，不自行对接远端 API。"))}
${line(dim("需求管线委托 /rui code，操作目标限定在 .claude/ 目录内。"))}

${hdr("相关资源")}
${item("SKILL.md", "skills/rui-claude/SKILL.md — 完整规约", dim)}
${item("rui-claude.md", "rules/rui-claude.md — 操作规则", dim)}
${item("rui", "/rui — 故事驱动 SDLC 编排器", dim)}

${dim("详细说明: skills/rui-claude/SKILL.md | 规则: rules/rui-claude.md")}
`;

console.log(help);
