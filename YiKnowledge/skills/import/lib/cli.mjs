/**
 * yry-import cli -- argument parsing and help delegation
 * Extracted from sync.mjs for single-responsibility
 */

import { NODE_ARGV_OFFSET } from "./constants.mjs";
import { showPluginHelp } from "./io.mjs";
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
  console.log("yry-import sync -- Batch sync documents to remote");
  console.log("");
  console.log("Parameters (key=value):");
  console.log("  workspace=true          Project root full scan + upload");
  console.log("  dir=<path>              Specified directory scan (absolute path)");
  console.log("  exts=md,json,yaml       Deprecated -- no extension restrictions now, all files are uploaded");
  console.log("  exclude=tmp,build       Append exclude directories");
  console.log("  prefix=a,b              Remote path prefix");
  console.log("  file=<path>             Single file import (auto-attach semantic tags)");
  console.log("  apiUrl=<url>            Override API URL");
  console.log("  mode=list               List only, no upload");
  console.log("  mode=pull               Remote → Local download");
  console.log("");
  console.log("Environment variables:");
  console.log("  API_X_TOKEN             Auth token (silent degradation when missing)");
  console.log("  IMPORT_DOCS_API_URL     Override default API URL");
  console.log("");
  console.log("Details: ~/.claude/plugins/cache/yry/yry/<version>/skills/yry-import/help.mjs");
}

export function hasArgs(opts) {
  if (opts.mode === "pull") return opts.scanDir !== null;
  return opts.scanRoot === "workspace" || opts.scanDir !== null;
}