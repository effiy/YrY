#!/usr/bin/env node
// rui-import — 文档同步到远端 API help

const B = 1, D = 2, Y = 33, C = 36;
const { bold, dim, yellow, cyan } = (() => {
  const m = (c) => (s) => `\x1b[${c}m${s}\x1b[0m`;
  const e = { bold: m(B), dim: m(D), yellow: m(Y), cyan: m(C) };
  if (!process.stdout.isTTY) for (const k of Object.keys(e)) e[k] = (s) => s;
  return e;
})();

const I = "  ", SI = "    ", LW = 48;

function hdr(t) { return `\n${bold(t)}\n`; }
function item(c, d, f) {
  const l = `${SI}${c}`;
  return `${f ? f(l) : l}${" ".repeat(Math.max(2, LW - l.length))}${d}`;
}
function s(t) { return `\n${SI}${bold(t)}\n`; }

const help = `
${bold("# rui-import — 文档同步到远端")}

${dim("扫描 · 过滤 · 上传 · 拉取 | rui 管线强制集成 | 执行入口: node skills/rui-import/sync.mjs")}

${hdr("语法")}
${item("sync.mjs workspace=true", "项目根全量扫描 + 上传（最常用）", cyan)}
${item("sync.mjs dir=<path>", "指定目录扫描 + 上传", cyan)}
${item("sync.mjs file=<path>", "单文件导入（自动附加语义标签）", cyan)}
${item("sync.mjs mode=pull dir=<path>", "远端 → 本地下载", yellow)}
${item("sync.mjs mode=list", "仅枚举不上传，输出文件清单", cyan)}

${hdr("常用选项")}
${item("exts=md,json,yaml", "文件扩展名过滤（默认 md）", yellow)}
${item("prefix=a,b", "远端路径前缀（多级目录）", yellow)}
${item("exclude=tmp,build", "追加排除子目录", yellow)}
${item("names=a,b", "按文件名关键词过滤", yellow)}
${item("apiUrl=<url>", "覆盖默认 API 地址", yellow)}

${hdr("使用场景")}
${s("全量同步（rui 管线末端自动触发）")}
${item("sync.mjs workspace=true", "扫描项目根全部 .md + .claude/ → 上传", cyan)}

${s("从远端拉取故事文档")}
${item("sync.mjs dir=docs/故事任务面板/user-login/ mode=pull", "远端 → 本地覆盖整个故事目录", cyan)}

${s("从远端拉取 .claude/ 配置")}
${item("sync.mjs dir=.claude/ mode=pull", "远端 → 本地覆盖 .claude/ 全量", cyan)}

${s("先预览再同步（安全工作流）")}
${item("sync.mjs workspace=true mode=list", "Step 1：预览待上传文件清单", cyan)}
${item("sync.mjs workspace=true", "Step 2：确认无误后实际同步", cyan)}

${s("单文件导入")}
${item("sync.mjs file=docs/故事任务面板/user-login/故事任务.md", "导入单个文件，自动附加语义标签", cyan)}
`;

console.log(help);
