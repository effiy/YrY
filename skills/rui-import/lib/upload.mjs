/**
 * rui-import upload — single-file and batch upload orchestration
 * Extracted from sync.mjs for single-responsibility
 */

import { readFile } from "node:fs/promises";
import { CONCURRENCY } from "../../../lib/constants.mjs";
import { runConcurrent } from "../../../lib/io.mjs";
import { resolveRemotePath } from "./scan.mjs";
import { writeRemoteFile, createSession, updateSession } from "./api.mjs";

export async function uploadSingleFile(/** @type {string} */ filePath, /** @type {string} */ apiUrl, /** @type {Map<string, any>} */ existingPaths, /** @type {string} */ root, /** @type {string} */ workspaceName, /** @type {string[]} */ prefix) {
  const remotePath = resolveRemotePath(filePath, root, workspaceName, prefix);
  const content = await readFile(filePath, "utf-8");
  const existingItem = existingPaths.get(remotePath);
  await writeRemoteFile(apiUrl, remotePath, content, !!existingItem);
  if (existingItem) {
    await updateSession(apiUrl, remotePath, existingItem);
    return { status: "overwritten", file: filePath, remotePath };
  }
  const created = await createSession(apiUrl, remotePath, filePath, workspaceName);
  existingPaths.set(remotePath, created);
  return { status: "created", file: filePath, remotePath };
}

export async function uploadAll(/** @type {string[]} */ files, /** @type {string} */ apiUrl, /** @type {Map<string, any>} */ existingPaths, /** @type {string} */ root, /** @type {string} */ workspaceName, /** @type {string[]} */ prefix) {
  let created = 0, overwritten = 0, failed = 0;
  /** @type {any[]} */
  const errors = [];

  async function worker(/** @type {string} */ file) {
    try {
      const result = await uploadSingleFile(file, apiUrl, existingPaths, root, workspaceName, prefix);
      if (result.status === "created") created++;
      else if (result.status === "overwritten") overwritten++;
      else { failed++; errors.push({ file: result.file, remotePath: result.remotePath, error: /** @type {any} */ (result).error }); }
    } catch (err) {
      failed++;
      const remotePath = resolveRemotePath(file, root, workspaceName, prefix);
      errors.push({ file, remotePath, error: err.message });
    }
  }

  await runConcurrent(files, worker, CONCURRENCY);

  return { created, overwritten, failed, errors };
}
