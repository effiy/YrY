#!/usr/bin/env node
// rui — Story-driven SDLC orchestrator help
// 用法: node skills/rui/help.mjs 或 /rui --help

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
const WIDTH = 80;

function hdr(text) {
  return `\n${bold(underline(text))}\n`;
}

function subhdr(text) {
  return `\n${bold(text)}`;
}

function item(cmd, desc, colorFn) {
  const left = `${INDENT}${cmd}`;
  const pad = Math.max(2, 32 - left.length);
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
${bold("# rui — 故事驱动 SDLC 编排器")}

${dim("需求 → 文档 → 代码 → 交付 | 6 Agent 协同 | Gate A/B 门禁验证 | 三步强制交付")}

${hdr("用法")}
${item("/rui <需求>", "端到端管线：自动串联 doc → code，一气呵成")}
${item("/rui <命令> [选项]", "按阶段执行：doc | code | update | init")}
${item("/rui --help, -h, help", "显示此帮助信息")}

${para(`${dim("需求")} 支持自然语言文本 / ${dim("@file")} 引用本地文件 / ${dim("URL")}。`)}

${hdr("全局选项")}
${flag("name <kebab-case>", "故事目录名，如 user-login、payment-refactor")}
${para(`${dim("约束：")}只能用小写字母、数字和连字符 ${dim("^[a-z0-9]+(-[a-z0-9]+)*$")}。省略时 pm 从需求自动提取语义名。`)}

${hdr("写入命令")}${dim("（末端自动触发 hook-log → import-docs → wework-bot）")}

${item("/rui init", "建立项目基线：detect → explore → generate → setup → verify")}
${item("", dim("初始化 CLAUDE.md + README + 故事面板。可重复运行，标记段全量重生。"))}

${item("/rui <需求> [--name <n>]", "端到端：pm 拆故事 → coder 出文档 → coder 写代码 → 交付")}
${item("", dim("等价于 /rui doc <需求> 完成后自动接 /rui code <name>。"))}

${item("/rui doc <需求> [--name <n>]", "拆需求为故事 + 生成文档基线（只读源码，不写代码）")}
${item("", dim("产出：故事任务 · 使用场景 · 技术评审 · 测试设计 · 安全审计"))}

${item("/rui code <name>", "实现故事：Gate A → 逐模块 P0 清零 → Gate B → 自改进 → 交付")}
${item("", dim("前置：docs/故事任务面板/<name>/ 下文档基线齐备。源码唯一入口。"))}

${item("/rui code --from-doc <name>", "从文档反推：只读源码补全缺失文档（不覆盖已有）")}
${item("", dim("补全：实施报告 · 测试报告 · 自改进复盘。禁止改源码。"))}

${item("/rui update <name> [ctx] [--no-code]", "增量更新：T1/T2/T3 自动裁剪管线")}
${item("", dim("T1 措辞格式（仅刷新变更章节）→ T2 增删接口（裁剪分析设计）→ T3 边界重构（全级联刷新）。"))}
${item("", dim("--no-code：仅刷新文档，不改源码。"))}

${item("/rui doc --from-code [需求]", "从源码反推故事文档（全程只读，冲突保护）")}
${item("", dim("需求为空时 pm 扫描推荐列表（5 层评分）→ 用户选择 → 生成。"))}
${item("", dim("需求有值时直接反推完整文档基线。"))}

${hdr("只读命令")}${dim("（不触发 hook，不写文件）")}

${item("/rui", "任务推荐：5 层链式管线评分（L0 时间 / L1 依赖 / L2 风险 / L3 覆盖 / L4 质量）")}
${item("/rui-story list", "进度全景：扫描面板中所有故事的状态与完成度")}
${item("/rui-story", "故事面板总览")}

${hdr("常用场景")}
${item("# 首次进入仓库", "", bold)}
${item("/rui init", "建立 CLAUDE.md + README + 故事面板基线", green)}
${item("", "")}
${item("# 一个需求从始至终", "", bold)}
${item(`/rui "用户登录：密码+短信验证码" --name user-login`, "端到端：自动拆故事 → 文档基线 → 编码 → 验证 → 交付", green)}
${item("", "")}
${item("# 仅生成文档（指定目录名）", "", bold)}
${item(`/rui doc "用户登录功能" --name user-login`, "拆需求为故事，生成完整文档基线到 故事任务面板/user-login/", green)}
${item(`/rui doc @requirements.md --name payment`, "从本地文件读取需求，目录名 payment", green)}
${item(`/rui doc https://wiki.example.com/prd --name export`, "从 URL 读取需求，目录名 export", green)}
${item("", "")}
${item("# 从已有文档开始编码", "", bold)}
${item("/rui code user-login", "基于 docs/故事任务面板/user-login/ 下文档实现故事", green)}
${item("", "")}
${item("# 存量代码补文档", "", bold)}
${item("/rui doc --from-code", "pm 扫描源码推荐待文档化的模块（5 层评分排序）", green)}
${item("/rui doc --from-code user-login", "从指定模块源码反推完整故事文档基线", green)}
${item("", "")}
${item("# 补充文档到已有故事", "", bold)}
${item("/rui code --from-doc user-login", "只读源码补全缺失的实施报告/测试报告/自改进复盘", green)}
${item("", "")}
${item("# 小修小补", "", bold)}
${item(`/rui update user-login "新增 OAuth 登录"`, "T1~T3 自动判定变更范围，刷新文档 + 重跑验证", green)}
${item("/rui update user-login --no-code", "仅刷新文档不改源码（如修正措辞/格式）", green)}
${item("", "")}
${item("# 查看进度 & 获取推荐", "", bold)}
${item("/rui-story list", "扫描所有故事的状态与产出完整度", green)}
${item("/rui", "获取管线评分后的下一步推荐任务", green)}

${hdr("故事文档基线")}${dim("（产出至 docs/故事任务面板/<name>/）")}

${item("{project}-故事任务.md", "问题空间基线 — pm 拆分，Gate A 入口", yellow)}
${item("{project}-使用场景.md", "用户空间基线 — 无技术术语", yellow)}
${item("{project}-技术评审.md", "架构/API/数据/组件/状态（按项目类型裁剪）", yellow)}
${item("{project}-测试设计.md", "AC 覆盖 + Gate A 交接信令", yellow)}
${item("{project}-安全审计.md", "独立安全审计，威胁建模覆盖全部信任边界", yellow)}
${item("{project}-实施报告.md", "逐模块实现记录 — code 阶段产出", cyan)}
${item("{project}-测试报告.md", "测试结果 + Gate B 验证 — code 阶段产出", cyan)}
${item("{project}-自改进复盘.md", "D0–D7 诊断 + 改进提案 — code 阶段产出", cyan)}
${item("{project}-交互日志.md", "全阶段操作日志（追加写）", dim)}
${item("{project}-消息通知列表.md", "交付通知记录（追加写）", dim)}

${hdr("管线阶段")}

${item("需求解析 → 自适应规划 → 影响分析", "pm 拆故事，查阅外部参考，烧烤纪律")}
${item("文档生成", "故事任务 + 使用场景 + 技术评审 + 测试设计 + 安全审计")}
${item("预检 → Gate A", "分支隔离 feats/<name>，测试先行，文档基线齐备检查")}
${item("逐模块实现", "P0 清零再前进，源码唯一入口")}
${item("验证 → Gate B", "≤2 轮验证，超出阻断 gate-b-limit")}
${item("自改进 → 交付", "D0–D7 诊断复盘 + hook-log → import-docs → wework-bot")}

${hdr("阻断标识速查")}

${item("需求→文档阶段", "no-parse · no-source · chain-broken · doc-p0 · no-doc-isolation", red)}
${item("预检→实现阶段", "bad-branch · no-checkout · no-branch-isolation · skip-gate-a", red)}
${item("实现→验证阶段", "code-p0 · gate-b-limit", red)}
${item("交付阶段", "auto-merge · no-token（降级）· no-metrics（降级）", yellow)}

${hdr("核心约束")}
${line(dim("1. 逐故事串行 — 多故事按拆分顺序处理，互不交叉"))}
${line(dim("2. 分支隔离 — Edit/Write 前必须验证当前分支为 feat/<name>"))}
${line(dim("3. 源码唯一入口 — 只能走 /rui code 改源码，禁止跳过管线直接改码"))}
${line(dim("4. 测试先行 — Gate A 阻断无测试实现；Gate B 超过 2 轮验证阻断交付"))}
${line(dim("5. 逐模块 P0 清零 — 每模块安全审查后 P0 必须清零才前进下一模块"))}
${line(dim("6. 产出内聚 — 关键产出全部限定在 docs/故事任务面板/<name>/ 目录内"))}
${line(dim("7. 表达优先 — 文档内容优先级: 图 → 结构化文本 → 表，不可降级用大段文字"))}

${hdr("相关资源")}
${item("SKILL.md", "skills/rui/SKILL.md — 完整规约（命令面 + 编排骨架）", dim)}
${item("formulas.md", "skills/rui/formulas.md — 文档公式 + P0 检查清单", dim)}
${item("code-pipeline.md", "rules/code-pipeline.md — 分支隔离 · Gate A/B · 逐模块 P0", dim)}
${item("AGENT.md", "agents/AGENT.md — 角色拓扑 · 行为纪律 · 设计原则 · 多 Agent 协作", dim)}
${item("ranking.md", "skills/rui/ranking.md — 5 层评分框架", dim)}
${item("rui-story", "skills/rui-story/SKILL.md — 故事面板管理", dim)}
${item("import-docs", "skills/import-docs/SKILL.md — 文档同步", dim)}
${item("wework-bot", "skills/wework-bot/SKILL.md — 企微通知", dim)}
${item("self-improve.md", "rules/self-improve.md — 自改进闭环 D0–D7", dim)}

${dim("YrY 版本: 1.5.5 | 架构: plugin — 6 技能 + 6 Agent + 5 规则")}
`;

console.log(help);
