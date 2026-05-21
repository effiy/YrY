#!/usr/bin/env node
// import-docs — Batch sync local documents to remote API help
// 用法: node skills/import-docs/help.mjs 或 /import-docs --help

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
const LEFT_COLUMN_WIDTH = 32;
const COLUMN_MIN_PADDING = 2;

function hdr(text) {
  return `\n${bold(underline(text))}\n`;
}

function item(cmd, desc, colorFn) {
  const left = `${INDENT}${cmd}`;
  const pad = Math.max(COLUMN_MIN_PADDING, LEFT_COLUMN_WIDTH - left.length);
  return `${colorFn ? colorFn(left) : left}${" ".repeat(pad)}${desc}`;
}

function line(text) {
  return `${INDENT}${text}`;
}

const help = `
${bold("# import-docs — 文档批量同步到远端")}

${dim("扫描 · 过滤 · 路径映射 · 上传 | rui 管线强制集成")}

${hdr("快速入门")}
${item("/import-docs workspace=true", "项目根全量扫描 + 上传 (最常用)", green)}
${item("/import-docs", "状态检测：token / 远端可达性 / 文件差异 → 推荐任务", green)}
${item("/import-docs mode=list", "仅枚举不上传，输出文件清单", cyan)}

${hdr("子命令")}
${item("workspace=true", "项目根全量扫描 + 上传", green)}
${item("dir=<absolute path>", "指定目录扫描 + 上传", green)}
${item("exts=md,json,yaml", "覆盖默认扩展名 (默认: md)", yellow)}
${item("exclude=tmp,build", "追加排除子目录", yellow)}
${item("prefix=a,b", "远端路径前缀", yellow)}
${item("apiUrl=https://api.example.com", "覆盖默认 API 地址", yellow)}
${item("mode=list", "仅枚举不上传，输出文件清单", cyan)}
${item("mode=pull", "远端→本地下载 (需配合 dir=)", cyan)}
${item("names=a,b", "按文件名关键词过滤 (pull 模式精确拉取)", yellow)}

${hdr("使用场景")}
${item("# 全量同步（rui 管线末端自动触发）", "", bold)}
${item("/import-docs workspace=true", "扫描项目根全部 .md + .claude/ → 上传", green)}
${item("", "")}
${item("# 从远端拉取故事文档", "", bold)}
${item("/import-docs dir=docs/故事任务面板/user-login/ mode=pull", "远端 → 本地覆盖", green)}
${item("", "")}
${item("# 从远端拉取 .claude/ 配置", "", bold)}
${item("/import-docs dir=.claude/ mode=pull", "远端 → 本地覆盖 .claude/ 全量", green)}
${item("", "")}
${item("# 同步指定目录 + 多文件类型", "", bold)}
${item("/import-docs dir=/path/to/docs exts=md,json,yaml", "仅该目录下的 md/json/yaml", green)}
${item("", "")}
${item("# 全量 + 排除临时目录", "", bold)}
${item("/import-docs workspace=true exclude=tmp,vendor", "跳过 tmp/ 和 vendor/", green)}
${item("", "")}
${item("# 预览不上传", "", bold)}
${item("/import-docs workspace=true mode=list", "列出待上传文件清单", green)}
${item("", "")}
${item("# 带远端前缀上传（多级目录）", "", bold)}
${item("/import-docs workspace=true prefix=docs,api-v2", "远端路径前追加 docs/api-v2/", green)}
${item("", "")}
${item("# 按文件名关键词精确拉取", "", bold)}
${item("/import-docs dir=docs/故事任务面板/user-login/ mode=pull names=技术评审,安全审计", "仅拉取名中含「技术评审」或「安全审计」的文件", green)}
${item("", "")}
${item("# 覆盖远端 API 地址（指向非生产环境）", "", bold)}
${item("/import-docs workspace=true apiUrl=https://staging-api.example.com", "切换 API 目标（如预发验证）", green)}
${item("", "")}
${item("# 先预览再同步（安全工作流）", "", bold)}
${item("/import-docs workspace=true mode=list", "Step 1: 预览待上传文件清单", green)}
${item("/import-docs workspace=true", "Step 2: 确认无误后实际同步", green)}
${item("", "")}
${item("# 仅同步 .claude/ 配置到远端（备份配置）", "", bold)}
${item("/import-docs dir=.claude/", "扫描 .claude/ 全量 → 上传到远端", green)}
${item("", "")}
${item("# 拉取单个故事的全部文档（恢复本地）", "", bold)}
${item("/import-docs dir=docs/故事任务面板/user-login/ mode=pull", "从远端拉取整个故事目录覆盖本地", green)}
${item("", "")}
${item("# 仅检查同步差异（不实际传输）", "", bold)}
${item("/import-docs workspace=true mode=list", "列出本地有而远端无的文件 → 审核后再同步", green)}
`;

console.log(help);
