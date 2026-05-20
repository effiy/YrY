#!/usr/bin/env node
// import-docs — Batch sync local documents to remote API help
// 用法: node skills/import-docs/help.mjs 或 /import-docs --help

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

function flag(name, desc) {
  return item(`--${name}`, desc, yellow);
}

const help = `
${bold("# import-docs — 文档批量同步到远端")}

${dim("扫描 · 过滤 · 路径映射 · 上传 | rui 管线强制集成 — 交付三步收口第②步")}

${hdr("用法")}
${item("/import-docs --help, -h, help", "显示此帮助信息")}

${hdr("调用形态")}${dim("（key=value 参数，无顺序要求）")}

${item("workspace=true", "项目根全量扫描 + 上传 (最常用)", green)}
${item("dir=<absolute path>", "指定目录扫描 + 上传", green)}
${item("exts=md,json,yaml", "覆盖默认扩展名 (默认: md)", yellow)}
${item("exclude=tmp,build", "追加排除子目录", yellow)}
${item("prefix=a,b", "远端路径前缀", yellow)}
${item("apiUrl=https://api.example.com", "覆盖默认 API 地址", yellow)}
${item("mode=list", "仅枚举不上传，输出文件清单", cyan)}
${item("mode=pull", "远端→本地下载 (需配合 dir=docs/故事任务面板/<name>/)", cyan)}
${item("names=a,b", "按文件名关键词过滤 (用于 pull 模式精确拉取)", yellow)}

${hdr("上传流程")}
${item("① 扫描", "从项目根递归遍历，不受 .gitignore 限制", dim)}
${item("② 过滤", "排除 .git / node_modules / .claude-plugin + --exclude 追加", dim)}
${item("③ 路径映射", "本地路径 → 远端路径（故事面板特殊处理）", dim)}
${item("④ 拉取已有", "查询远端 sessions 区分 created / overwritten", dim)}
${item("⑤ 上传", "逐文件 POST /write-file（并发 ≤ 4）", dim)}
${item("⑥ 新建 session", "对新增路径追加 create_document", dim)}
${item("⑦ 汇总", "created · overwritten · failed 统计 + 退出码", dim)}

${hdr("扫描规则")}
${item(".claude/ 目录", "全量纳入 · 不限扩展名 · 递归全部子目录", green)}
${item("其他目录", "仅扩展名命中 --exts (默认 md) 的文件")}
${item("默认排除", ".git · node_modules · .claude-plugin", dim)}
${item("故事面板路径", "docs/故事任务面板/ → 远端加 故事任务面板/ 路径映射", dim)}

${hdr("常用场景示例")}
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
${item("# 空输入 — 状态检测", "", bold)}
${item("/import-docs", "检测 token / 远端可达性 / 文件差异 → 推荐任务", green)}

${hdr("环境变量")}
${item("API_X_TOKEN", "必填 · 鉴权令牌 · 仅从环境变量读取（缺失时静默降级 no-token）", yellow)}
${item("IMPORT_DOCS_API_URL", "可选 · 覆盖默认 API 地址 (默认: https://api.effiy.cn)", dim)}

${hdr("降级与容错")}
${item("API_X_TOKEN 缺失", "静默跳过，不阻断管线 (no-token 降级)", dim)}
${item("单文件失败", "记录错误并继续，最终退出码 1")}
${item("网络超时/不可达", "记录告警不阻断 (30s 超时)")}
${item("扫描根不存在", "跳过整次同步，退出码 0（不阻断）")}
${item("远端查询失败", "Set 置空继续上传，全部标记 created")}

${hdr("一级目录标签约束")}
${line(dim("prefix 第一级标签只能是项目目录名或「故事任务面板」，否则 exit 1。"))}
${line(dim("目的：确保远端路径结构一致，防止标签污染。"))}

${hdr("管线集成")}
${line(dim("rui 交付三步收口第②步（hook-log → import-docs → wework-bot）。"))}
${line(dim("每次 /rui code 完成后自动触发。非交互式执行，失败不阻断管线。"))}

${hdr("相关资源")}
${item("SKILL.md", "skills/import-docs/SKILL.md — 完整规约", dim)}
${item("sync.mjs", "skills/import-docs/sync.mjs — 同步实现脚本", dim)}
${item("rui", "skills/rui/SKILL.md §强制集成 — 三步收口", dim)}
${item("rui-story", "skills/rui-story/SKILL.md — sync 的调用方之一", dim)}

${dim("详细说明: skills/import-docs/SKILL.md | 集成: skills/rui/SKILL.md §强制集成")}
`;

console.log(help);
