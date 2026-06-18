#!/usr/bin/env node
/**
 * rui-import sync — scan + filter + upload local documents to remote API
 * Triggered by: rui delivery gate step ②, or manual: node skills/rui-import/sync.mjs
 *
 * 对应场景文档:
 *   - docs/故事任务面板/yry-arch/场景-2-数据流追踪/
 *   - docs/故事任务面板/yry-arch/场景-4-依赖变更影响/
 */

import { existsSync } from "node:fs";
import { resolve, sep } from "node:path";
import { findProjectRoot } from "../../lib/fs.mjs";
import { API_URL } from "./lib/config.mjs";
import { parseArgs, hasArgs } from "./lib/cli.mjs";
import { scanFiles, resolveRemotePath } from "./lib/scan.mjs";
import { querySessions } from "./lib/api.mjs";
import { uploadSingleFile, uploadAll } from "./lib/upload.mjs";
import { pullFromRemote, recommendPullMode } from "./lib/pull.mjs";

async function main() {
  const opts = parseArgs();
  const apiUrl = opts.apiUrl || API_URL;

  const root = (opts.scanRoot === "workspace")
    ? findProjectRoot(process.cwd())
    : opts.scanDir
      ? resolve(opts.scanDir)
      : findProjectRoot(process.cwd());

  if (!existsSync(root)) {
    console.error(`[rui-import] scan root not found: ${root}`);
    process.exit(1);
  }

  const workspaceName = root.split(sep).pop() || "workspace";

  if (!hasArgs(opts)) {
    if (opts.mode === "pull") {
      console.error(`[rui-import] scan root: ${root} (pull recommend mode)`);
      await recommendPullMode(apiUrl);
      return;
    }
    opts.scanRoot = "workspace";
  }

  // Pull mode: remote → local download
  if (opts.mode === "pull") {
    if (!process.env.API_X_TOKEN) {
      console.error("[rui-import] no API_X_TOKEN — no-token 降级，跳过 pull");
      return;
    }
    console.error(`[rui-import] pull mode: dir=${root}`);
    const result = await pullFromRemote(apiUrl, root, findProjectRoot(process.cwd()), opts.projectPrefix);
    console.error(JSON.stringify(result));
    process.exit(result.failed > 0 ? 1 : 0);
  }

  // Single-file import mode
  if (opts.file) {
    const filePath = resolve(opts.file);
    if (!existsSync(filePath)) {
      console.error(`[rui-import] file not found: ${filePath}`);
      process.exit(1);
    }
    if (!process.env.API_X_TOKEN) {
      console.error("[rui-import] no API_X_TOKEN — no-token 降级，跳过上传");
      return;
    }
    console.error(`[rui-import] single-file mode: ${filePath}`);
    console.error(`[rui-import] scan root: ${findProjectRoot(process.cwd())}`);
    console.error(`[rui-import] workspace: ${workspaceName}`);

    let existingPaths;
    try {
      existingPaths = await querySessions(apiUrl);
      console.error(`[rui-import] existing sessions: ${existingPaths.size}`);
    } catch (err) {
      console.error(`[rui-import] failed to query sessions: ${err.message}`);
      existingPaths = new Map();
    }

    try {
      const pr = findProjectRoot(process.cwd());
      const result = await uploadSingleFile(filePath, apiUrl, existingPaths, pr, workspaceName, opts.prefix);
      const remotePath = resolveRemotePath(filePath, pr, workspaceName, opts.prefix);
      console.error(`[rui-import] single-file done — ${result.status}: ${filePath} → ${remotePath}`);
      process.exit(result.status === "failed" ? 1 : 0);
    } catch (err) {
      console.error(`[rui-import] FAILED: ${err.message}`);
      process.exit(1);
    }
  }

  console.error(`[rui-import] scan root: ${root}`);
  console.error(`[rui-import] workspace: ${workspaceName}`);

  const files = await scanFiles(root, opts.exclude);
  console.error(`[rui-import] found ${files.length} files`);

  // List mode
  if (opts.mode === "list") {
    for (const f of files) {
      const remotePath = resolveRemotePath(f, root, workspaceName, opts.prefix);
      console.log(`${f} → ${remotePath}`);
    }
    console.error(`\n[rui-import] ${files.length} files (list mode, no upload)`);
    return;
  }

  // Import mode
  if (!process.env.API_X_TOKEN) {
    console.error("[rui-import] no API_X_TOKEN — no-token 降级，跳过上传");
    return;
  }

  console.error("[rui-import] querying existing sessions...");
  let existingPaths;
  try {
    existingPaths = await querySessions(apiUrl);
    console.error(`[rui-import] existing sessions: ${existingPaths.size}`);
  } catch (err) {
    console.error(`[rui-import] failed to query sessions: ${err.message}`);
    existingPaths = new Map();
  }

  console.error(`[rui-import] uploading ${files.length} files (concurrency=${process.env.CONCURRENCY || "default"})...`);
  const result = await uploadAll(files, apiUrl, existingPaths, root, workspaceName, opts.prefix);

  const { created, overwritten, failed, errors } = result;
  console.error(`[rui-import] done — created: ${created}, overwritten: ${overwritten}, failed: ${failed}`);
  if (errors.length > 0) {
    for (const e of errors) {
      console.error(`[rui-import] FAILED: ${e.file} → ${e.error}`);
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(`[rui-import] fatal: ${err.message}`);
  process.exit(1);
});
