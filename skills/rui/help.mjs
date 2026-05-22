#!/usr/bin/env node
// rui — Story-driven SDLC orchestrator help
// 用法: node skills/rui/help.mjs 或 /rui --help

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
${bold("# rui — 故事驱动 SDLC 编排器")}

${dim("需求 → 文档 → 代码 → 交付 · 提案生成 · 工具审计 | 6 Agent 协同 | Gate A/B 门禁 | 三步强制交付")}

${hdr("快速入门")}
${item("/rui <需求> [--name <name>]", "端到端：需求 → 文档基线 → 编码 → 交付", cyan)}
${item("/rui init", "建立项目基线：CLAUDE.md + README + 故事面板", cyan)}
${item("/rui", "任务推荐（只读，不触发交付）", cyan)}

${hdr("子命令")}

${subhdr("端到端管线")}
${item("/rui <需求> [--name <name>]", "需求 → 文档基线 → 编码 → 交付", cyan)}
${flag("name <name>", "故事名（kebab-case，如 user-login）。省略时 pm 自动提取")}

${subhdr("文档基线")}
${item("/rui doc <需求> [--name <name>]", "拆需求为故事 + 生成文档基线（只读源码）", cyan)}
${item("/rui doc --from-code [需求]", "从源码反推故事文档（只读，冲突保护）", cyan)}
${item("/rui doc --from-local <name>", "从已有本地文档补全缺失基线（只读已有，不覆盖）", cyan)}

${subhdr("编码实现")}
${item("/rui code <name>", "实现故事（源码唯一入口）", cyan)}
${item("/rui code --from-doc <name>", "从文档反推，补全缺失文档（只读）", cyan)}

${subhdr("增量更新")}
${item("/rui update <name> [ctx] [--no-code]", "增量更新（T1/T2/T3 自动裁剪）", cyan)}
${flag("no-code", "仅刷新文档不改源码")}

${subhdr("项目初始化")}
${item("/rui init", "建立项目基线：CLAUDE.md + README + 故事面板", cyan)}
${item("/rui", "任务推荐（只读，不触发交付）", cyan)}

${subhdr("自改进工具（辅助脚本）")}
${item("node skills/rui/proposals.mjs generate --story=<name>", "D0-D7 诊断引擎 → 提案写入 proposals.jsonl", cyan)}
${item("node skills/rui/proposals.mjs list --story=<name>", "列出所有提案（可按 status=open|done|superseded 过滤）", cyan)}
${item("node skills/rui/proposals.mjs evaluate --id=<proposal_id>", "E1-E4 效果评估（需前后各 ≥3 条执行记忆）", cyan)}
${item("node skills/rui/proposals.mjs upgrade-candidates", "经验技能化候选：同类型提案 ≥阈值故事数 → 升级为规则", cyan)}
${item("node skills/rui/proposals.mjs materialize --story=<name>", "实例化提案 → 故事任务目录（故事任务.md + rui-state.json）", cyan)}
${flag("dry-run", "仅预览不创建")}
${flag("min-priority P0|P1|P2", "按优先级过滤（默认 P2）")}
${item("node skills/rui/audit.mjs record --story=<name> --agent=<name> --tool=<name> --target=<path>", "工具调用审计：记录 agent/tool/target/result", cyan)}
${item("node skills/rui/audit.mjs summary --story=<name>", "工具调用汇总：agent→tool→count 统计", cyan)}
${item("node skills/rui/audit.mjs check --story=<name>", "权限合规检查：对照 agent YAML frontmatter 声明", cyan)}

${subhdr("管线数据工具（内部辅助）")}
${item("node .memory/collector.mjs --story=<name> --command=<cmd> --stage=<stage>", "集中式执行记忆写入：16 字段 schema 校验 + 追加", dim)}
${item("node .memory/log-interaction.mjs --story=<name> --turn=<N> --agent=<name> --user-input=\"...\" --assistant-response=\"...\"", "交互日志确定性追加：coder.md 格式 + 自动去重", dim)}
${item("node .memory/collector.mjs --validate", "执行记忆完整性校验：必填字段 + 类型检查", dim)}

${hdr("使用场景")}
${scene("端到端：一个需求从始至终")}
${item('/rui "用户登录：密码+短信验证码" --name user-login', "拆故事 → 文档基线 → 编码 → 验证 → 交付", cyan)}
${scene("仅生成文档基线")}
${item('/rui doc "用户登录功能" --name user-login', "拆需求为故事，产出 5 文档基线到面板目录", cyan)}
${item("/rui doc @requirements.md --name payment", "从本地文件读取需求", cyan)}
${scene("从文档基线开始编码")}
${item("/rui code user-login", "Gate A → 逐模块 P0 清零 → Gate B → 交付", cyan)}
${scene("存量代码补文档")}
${item("/rui doc --from-code", "pm 扫描源码推荐待文档化的模块（5 层评分）", cyan)}
${item("/rui doc --from-code user-login", "从指定模块源码反推完整文档基线", cyan)}
${scene("小修小补")}
${item('/rui update user-login "新增 OAuth 登录"', "T1~T3 自动判定变更范围，刷新文档 + 重跑验证", cyan)}
${item("/rui update user-login --no-code", "仅刷新文档不改源码", cyan)}
${scene("已有部分文档，补全缺失基线")}
${item("/rui doc --from-local user-login", "扫描已有文档 → 按依赖链生成缺失 → 不覆盖已有", cyan)}
${scene("自改进诊断")}
${item("node skills/rui/proposals.mjs generate --story=user-login", "采集执行记忆 → D0-D7 判定 → 生成提案（数据<3条时降级）", cyan)}
${item("node skills/rui/proposals.mjs list --story=user-login --status=open", "查看待处理提案", cyan)}
${scene("提案实例化为故事任务")}
${item("node skills/rui/proposals.mjs materialize --story=user-login", "open 提案 → 故事任务目录（任务）→ import-docs 自动同步", cyan)}
${item("node skills/rui/proposals.mjs generate --story=user-login --materialize", "诊断 + 实例化一步完成", cyan)}
${item("node skills/rui/proposals.mjs materialize --story=user-login --dry-run", "预览将创建的目录（不实际执行）", cyan)}
${scene("工具权限审计")}
${item("node skills/rui/audit.mjs check --story=user-login", "对照 agent 声明工具列表，检出越权调用", cyan)}
${scene("查看进度 & 获取推荐")}
${item("/rui-story list && /rui", "扫描故事状态 → 获取管线评分的推荐任务", cyan)}
${scene("首次进入仓库")}
${item("/rui init", "建立 CLAUDE.md + README + 故事面板基线", cyan)}
${scene("多故事串行 + 被阻断后恢复")}
${item('/rui "用户系统：注册+登录+权限管理"', "pm 拆分为 ≥3 故事 → 逐故事串行 doc → code", cyan)}
${item("/rui code user-login", "被阻断后重跑同命令，从断点续跑", cyan)}
`;

console.log(help);
