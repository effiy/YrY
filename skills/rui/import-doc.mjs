#!/usr/bin/env node
// import-doc — 文档生成后自动导入远端 API
// 用法: node skills/rui/import-doc.mjs <file-path>
// 每个故事文档生成后立即调用，单文件导入 + 语义标签自动附加
// 导入失败不阻断管线，末端批量安全网兜底

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SYNC_SCRIPT = resolve(__dirname, "../rui-import/sync.mjs");
const ARGV_OFFSET = 2;

// --- TTY helpers -------------------------------------------------------------
const tty = process.stdout.isTTY;
const bold = (s) => tty ? `\x1b[1m${s}\x1b[22m` : s;
const dim = (s) => tty ? `\x1b[2m${s}\x1b[22m` : s;
const green = (s) => tty ? `\x1b[32m${s}\x1b[39m` : s;
const yellow = (s) => tty ? `\x1b[33m${s}\x1b[39m` : s;
const red = (s) => tty ? `\x1b[31m${s}\x1b[39m` : s;

// --- args --------------------------------------------------------------------
function parseArgs() {
  const args = process.argv.slice(ARGV_OFFSET);
  const filePath = args.find(a => !a.startsWith("--"));
  const opts = { json: args.includes("--json"), silent: args.includes("--silent") };
  return { filePath: filePath ? resolve(filePath) : null, ...opts };
}

function showHelp() {
  console.log("");
  console.log("import-doc — 文档生成后自动导入远端 API");
  console.log("");
  console.log("用法: node skills/rui/import-doc.mjs <file-path> [--json] [--silent]");
  console.log("");
  console.log("选项:");
  console.log("  --json      JSON 格式输出结果");
  console.log("  --silent    仅输出错误");
  console.log("");
  console.log("行为:");
  console.log("  1. 验证文件存在");
  console.log("  2. 调用 sync.mjs file=<path> 单文件导入");
  console.log("  3. 自动附加语义标签（stage/type/baseline）");
  console.log("  4. 失败不阻断，输出告警");
  console.log("");
}

// --- main --------------------------------------------------------------------
function main() {
  const { filePath, json, silent } = parseArgs();

  if (!filePath) {
    showHelp();
    process.exit(0);
  }

  // 1. 验证文件存在
  if (!existsSync(filePath)) {
    const msg = `[import-doc] file not found: ${filePath}`;
    if (json) console.log(JSON.stringify({ status: "error", reason: "file-not-found", file: filePath }));
    else console.error(red(msg));
    process.exit(0); // 不阻断管线
  }

  // 2. 调用 sync.mjs 单文件导入
  const cmd = `node "${SYNC_SCRIPT}" file=${filePath}`;
  if (!silent) console.error(dim(`[import-doc] ${cmd}`));

  try {
    const stdout = execSync(cmd, {
      encoding: "utf-8",
      timeout: 30_000,
      env: { ...process.env },
      cwd: process.cwd(),
    });

    // sync.mjs 单文件模式输出到 stderr，stdout 通常为空
    // execSync 默认只捕获 stdout，stderr 透传到父进程
    // 所以这里主要靠 exit code 判断

    if (!silent) console.error(green(`[import-doc] ✓ imported: ${filePath}`));
    if (json) console.log(JSON.stringify({ status: "ok", file: filePath }));
    process.exit(0);
  } catch (err) {
    const stderr = err.stderr?.toString() || "";
    const isNoToken = stderr.includes("no-token");

    if (isNoToken) {
      if (!silent) console.error(yellow(`[import-doc] ⚠ no-token — skipped: ${filePath}`));
      if (json) console.log(JSON.stringify({ status: "skipped", reason: "no-token", file: filePath }));
    } else {
      if (!silent) console.error(red(`[import-doc] ✗ failed: ${filePath}`));
      if (json) console.log(JSON.stringify({ status: "error", reason: "import-failed", file: filePath, error: (err.message || "").slice(0, 200) }));
    }
    process.exit(0); // 不阻断管线
  }
}

main();
