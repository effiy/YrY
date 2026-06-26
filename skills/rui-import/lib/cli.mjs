/**
 * rui-import cli — argument parsing and help delegation
 * Extracted from sync.mjs for single-responsibility
 */

import { NODE_ARGV_OFFSET } from "../../../lib/constants.mjs";
import { showPluginHelp } from "../../../lib/io.mjs";
import { SKILL_NAME } from "./config.mjs";

export function parseArgs() {
  const args = process.argv.slice(NODE_ARGV_OFFSET);
  /** @type {{ exclude: string[], prefix: string[], mode: string, apiUrl?: string, names?: string[], file?: string, projectPrefix?: string, scanRoot?: string, scanDir?: string }} */
  const opts = { exclude: [], prefix: [], mode: "import" };
  let scanRoot = null;
  let scanDir = null;

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      showHelp();
    }
    const eq = arg.indexOf("=");
    if (eq === -1) continue;
    const key = arg.slice(0, eq);
    const val = arg.slice(eq + 1);
    switch (key) {
      case "workspace": scanRoot = "workspace"; break;
      case "dir": scanDir = val; break;
      case "exclude": opts.exclude = val.split(",").map(s => s.trim()); break;
      case "prefix": opts.prefix = val.split(",").map(s => s.trim()); break;
      case "apiUrl": opts.apiUrl = val; break;
      case "mode": opts.mode = val; break;
      case "names": opts.names = val.split(",").map(s => s.trim()); break;
      case "file": opts.file = val; break;
      case "projectPrefix": opts.projectPrefix = val; break;
    }
  }

  return { scanRoot, scanDir, ...opts };
}

export function showHelp() {
  showPluginHelp(SKILL_NAME, fallbackHelp);
  process.exit(0);
}

export function fallbackHelp() {
  console.log("rui-import sync — 文档批量同步到远端");
  console.log("");
  console.log("参数 (key=value):");
  console.log("  workspace=true          项目根全量扫描 + 上传");
  console.log("  dir=<path>              指定目录扫描 (绝对路径)");
  console.log("  exts=md,json,yaml       已废弃 — 现无扩展名限制，所有文件均上传");
  console.log("  exclude=tmp,build       追加排除目录");
  console.log("  prefix=a,b              远端路径前缀");
  console.log("  file=<path>             单文件导入（自动附加语义标签）");
  console.log("  apiUrl=<url>            覆盖 API 地址");
  console.log("  mode=list               仅列出，不上传");
  console.log("  mode=pull               远端 → 本地下载");
  console.log("");
  console.log("环境变量:");
  console.log("  API_X_TOKEN             鉴权令牌 (缺失时静默降级)");
  console.log("  IMPORT_DOCS_API_URL     覆盖默认 API 地址");
  console.log("");
  console.log("详细: ~/.claude/plugins/cache/yry/yry/<version>/skills/rui-import/help.mjs");
}

export function hasArgs(opts) {
  if (opts.mode === "pull") return opts.scanDir !== null;
  return opts.scanRoot === "workspace" || opts.scanDir !== null;
}
