#!/usr/bin/env node
// rui — Story-driven SDLC orchestrator help
// 用法: node skills/rui/help.mjs 或 /rui --help

const { bold, underline, dim } = (() => {
  const e = { bold: (s) => `\x1b[1m${s}\x1b[22m`, underline: (s) => `\x1b[4m${s}\x1b[24m`, dim: (s) => `\x1b[2m${s}\x1b[22m` };
  // 非 tty 时跳过颜色
  if (!process.stdout.isTTY) return { bold: (s) => s, underline: (s) => s, dim: (s) => s };
  return e;
})();

const INDENT = "  ";
const WIDTH = 80;

function hdr(text) {
  return `\n${bold(underline(text))}\n`;
}

function item(cmd, desc) {
  const left = `${INDENT}${cmd}`;
  const pad = Math.max(2, 28 - left.length);
  return `${left}${" ".repeat(pad)}${desc}`;
}

function section(title, entries) {
  return hdr(title) + entries.map(([c, d]) => item(c, d)).join("\n");
}

function line(text) {
  return `${INDENT}${text}`;
}

const help = `
${bold("# rui — 故事驱动 SDLC 编排器")}

${dim("需求 → 文档 → 代码 → 交付 | 6 Agent 协同 | Gate A/B 门禁验证")}

${hdr("用法")}
${item("/rui --help", "显示此帮助信息")}
${item("/rui -h", "同上")}
${item("/rui help", "同上")}

${section("写入命令（末端自动交付）", [
  ["/rui init", "建立项目基线：detect→explore→generate→setup→verify"],
  ["/rui <需求>", "端到端管线：自动串联 doc→code，一气呵成"],
  ["/rui doc <需求>", "拆需求为故事 + 生成文档基线 (01/用户场景/02/03/04)"],
  ["/rui code <name>", "实现故事：Gate A→逐模块→Gate B→自改进→交付"],
  ["/rui update <name> [ctx]", "增量更新：T1/T2/T3 自动裁剪管线"],
  ["/rui code --from-doc <name>", "从文档反推：只读源码补全缺失文档"],
  ["/rui doc --from-code [req]", "从源码反推：req 空时扫描推荐，有值时直接反推"],
])}

${section("只读命令（不触发 hook）", [
  ["/rui", "任务推荐：5 层链式管线评分排序"],
  ["/rui list", "进度全景：按文件存在性判定状态"],
])}

${section("常用场景示例", [
  ["# 新项目初始化", ""],
  ["/rui init", "首次进入仓库，建立 CLAUDE.md + README 基线"],
  ["", ""],
  ["# 一个需求从始至终", ""],
  ["/rui \"用户登录功能：密码+短信\"", "端到端：自动拆故事→文档→代码→交付"],
  ["", ""],
  ["# 仅生成文档不写代码", ""],
  ["/rui doc \"用户登录功能\"", "拆需求为故事，生成 01~04 文档基线"],
  ["", ""],
  ["# 从文档开始编码", ""],
  ["/rui code YiWeb-user-login", "基于已有文档实现故事"],
  ["", ""],
  ["# 存量代码补文档", ""],
  ["/rui doc --from-code", "pm 扫描源码推荐待文档化模块"],
  ["/rui doc --from-code YiWeb-user-login", "从指定模块源码反推完整故事文档"],
  ["", ""],
  ["# 小修小补", ""],
  ["/rui update YiWeb-user-login \"新增OAuth登录\"", "T1～T3 自动判定变更范围"],
  ["", ""],
  ["# 补充文档到已有故事", ""],
  ["/rui code --from-doc YiWeb-user-login", "只读源码补全缺失的 02/03/05/06"],
  ["", ""],
  ["# 查看进度", ""],
  ["/rui list", "扫描面板中所有故事的状态"],
  ["/rui", "获取下一步推荐任务"],
])}

${section("管线阶段", [
  ["需求解析 → 自适应规划 → 影响分析", "pm 拆故事，coder 补齐设计"],
  ["文档生成 (01/用户场景/02/03/04)", "Gate A 前置条件"],
  ["Gate A → 逐模块实现", "P0 清零再前进"],
  ["验证 (05/06/07)", "Gate B ≤2 轮"],
  ["自改进 → 交付", "D0–D7 复盘 + 三步收口"],
])}

${section("阻断标识速览", [
  ["no-parse / no-source / chain-broken", "需求→文档阶段"],
  ["bad-branch / no-checkout / skip-gate-a", "预检→实现阶段"],
  ["code-p0 / gate-b-limit", "实现→验证阶段"],
  ["auto-merge / no-token / no-metrics", "交付阶段"],
])}

${section("全局选项", [
  ["--help, -h, help", "显示此帮助信息"],
])}

${dim("详细说明: skills/rui/SKILL.md | 公式: skills/rui/formulas.md | 管线: rules/code-pipeline.md")}
`;

console.log(help);
