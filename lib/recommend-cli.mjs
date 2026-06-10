/**
 * recommend-cli — argument parsing and help display
 * Extracted from recommend.mjs for single-responsibility.
 */

import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { findPluginHelpPath } from "./plugin-utils.mjs";
import { NODE_ARGV_OFFSET } from "./constants.mjs";

const SKILL_NAME = "rui";

export function parseArgs() {
  const args = process.argv.slice(NODE_ARGV_OFFSET);
  const opts = { type: "auto", format: "json" };
  let root = null;

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      showHelp();
    }
    const eq = arg.indexOf("=");
    if (eq === -1) continue;
    const key = arg.slice(0, eq);
    const val = arg.slice(eq + 1);
    switch (key) {
      case "--root": root = val; break;
      case "--type": opts.type = val; break;
      case "--format": opts.format = val; break;
    }
  }

  return { root, ...opts };
}

export function showHelp() {
  const helpPath = findPluginHelpPath(SKILL_NAME);
  if (existsSync(helpPath)) {
    try {
      execSync(`node "${helpPath}"`, { stdio: "inherit" });
      process.exit(0);
    } catch {
      // fall through to inline help
    }
  }

  const ANSI_BOLD = 1;
  const ANSI_DIM = 2;
  const ANSI_UNDERLINE = 4;
  const ANSI_GREEN = 32;
  const ANSI_YELLOW = 33;

  const { bold, underline, dim, yellow, green } = (() => {
    const make = (code) => (s) => `\x1b[${code}m${s}\x1b[0m`;
    const e = { bold: make(ANSI_BOLD), underline: make(ANSI_UNDERLINE), dim: make(ANSI_DIM), yellow: make(ANSI_YELLOW), green: make(ANSI_GREEN) };
    if (!process.stdout.isTTY) { for (const k of Object.keys(e)) e[k] = (s) => s; }
    return e;
  })();

  const INDENT = "  ";
  const LEFT_COLUMN_WIDTH = 32;
  const COLUMN_MIN_PADDING = 2;
  function hdr(t) { return `\n${bold(underline(t))}\n`; }
  function item(c, d, clr) {
    const l = `${INDENT}${c}`;
    const p = Math.max(COLUMN_MIN_PADDING, LEFT_COLUMN_WIDTH - l.length);
    return `${clr ? clr(l) : l}${" ".repeat(p)}${d}`;
  }
  function sec(t, es) { return hdr(t) + es.map(([c, d, clr]) => item(c, d, clr)).join("\n"); }
  function line(t) { return `${INDENT}${t}`; }

  const help = `
${bold("# recommend — 源码分析器")}

${dim("扫描源码 → 提取签名 → 依赖分析 → git 指标 → 文档覆盖度")}
${dim("由 PM agent 在 /rui doc --from-code 探索模式中调用")}

${hdr("参数")}
${item("--root=<path>", "项目根目录 (必填)", yellow)}
${item("--type=auto|frontend|backend|fullstack|meta", "项目类型 (默认: auto)", yellow)}
${item("--format=json|jsonl", "输出格式 (默认: json)", yellow)}

${hdr("项目类型检测逻辑")}
${item("auto", "读取 package.json → 按依赖推断 frontend/backend/fullstack/meta", dim)}
${item("frontend", "仅扫描 .vue .jsx .tsx .svelte 文件")}
${item("backend", "仅扫描 .ts .js .mjs .py .go .rs .java .rb .php 文件")}
${item("fullstack", "扫描全部前后端源文件")}

${hdr("逐文件收集指标")}
${item("metrics", "行数 · 签名提取 (Props/Events/Routes) · 被依赖数")}
${item("git", "最后修改时间 · 作者数 · 90天变更次数 (git log)")}
${item("doc", "检查 docs/故事任务面板/<name>/ 下的文档覆盖度")}
${item("signatures", "提取: Props/Events/Routes/API 端点签名")}

${hdr("输出结构")}
${line(dim("每个 story candidate 包含:"))}
${item("storyName / command", "故事名 (kebab) + 推荐 /rui doc --from-code 命令", green)}
${item("sourceFiles", "源文件列表 + 关联文件 (双向 import 关系)")}
${item("coverage", "文档覆盖描述 + 期望的 8 文档基线清单")}
${item("metrics", "总行数 · 文件数 · 签名 Top 10 · 被依赖数")}
${item("git", "最后修改 · 作者数 · 90天变更次数")}
${item("doc", "覆盖率状态: no_docs / partial / complete")}
${item("security", "hasUserInput · hasAuth · hasApiCall 布尔信号")}

${hdr("示例")}
${item("# 自动检测类型，扫描当前项目", "", bold)}
${item("--root=.", "输出 JSON 推荐列表到 stdout", green)}
${item("", "")}
${item("# 限定前端文件", "", bold)}
${item("--root=. --type=frontend", "仅扫描 .vue/.jsx/.tsx/.svelte", green)}
${item("", "")}
${item("# JSONL 格式 (逐行)", "", bold)}
${item("--root=/path/to/project --format=jsonl", "每行一个 story candidate JSON", green)}
${item("", "")}
${item("# 指定项目类型 + JSONL", "", bold)}
${item("--root=. --type=backend --format=jsonl", "后端文件 + 逐行输出", green)}

${hdr("管线集成")}
${line(dim("调用方: PM agent (skills/rui/SKILL.md §doc-from-code)"))}
${line(dim("流程: recommend 输出 JSON → PM 5 层评分 (L0–L4) → 排序 → 推荐列表"))}
${line(dim("评分维度: L0 时间紧急度 · L1 依赖拓扑 · L2 风险信号 · L3 覆盖缺口 · L4 质量信号"))}
${line(dim("详细: skills/rui/ranking.md"))}

${hdr("相关资源")}
${item("SKILL.md", "skills/rui/SKILL.md — rui 完整规约", dim)}
${item("ranking.md", "skills/rui/ranking.md — 5 层评分框架", dim)}
${item("help.mjs", "skills/rui/help.mjs — rui 编排器完整帮助", dim)}
`;

  console.log(help);
  process.exit(0);
}
