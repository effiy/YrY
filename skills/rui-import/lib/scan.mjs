/**
 * rui-import scan — file scanning and path mapping
 * Extracted from sync.mjs for single-responsibility
 */

import { readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { DEFAULT_EXCLUDES } from "./config.mjs";

export async function scanFiles(/** @type {string} */ root, /** @type {string[]} */ userExcludes) {
  /** @type {string[]} */
  const result = [];
  const excludes = new Set([...DEFAULT_EXCLUDES, ...userExcludes]);

  async function walk(/** @type {string} */ dir) {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); }
    catch { return; }

    for (const entry of entries) {
      if (excludes.has(entry.name)) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) { await walk(full); continue; }
      if (entry.isFile()) result.push(full);
    }
  }

  await walk(root);
  return result;
}

export function resolveRemotePath(/** @type {string} */ localPath, /** @type {string} */ root, /** @type {string} */ projectRootName, /** @type {string[]} */ prefix) {
  let rel = relative(root, localPath).split(sep).join("/").replace(/\s/g, "_");
  rel = projectRootName + "/" + rel;

  const segments = [];
  if (prefix.length > 0) segments.push(...prefix);
  segments.push(...rel.split("/"));
  return segments.join("/");
}

export function getTags(/** @type {string} */ remotePath, /** @type {string} */ _localPath, /** @type {string} */ _projectRootName) {
  const parts = remotePath.split("/");
  parts.pop();
  return parts;
}
