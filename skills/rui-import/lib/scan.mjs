/**
 * rui-import scan — file scanning and path mapping
 * Extracted from sync.mjs for single-responsibility
 */

import { readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { DEFAULT_EXCLUDES } from "./config.mjs";

export async function scanFiles(root, userExcludes) {
  const result = [];
  const excludes = new Set([...DEFAULT_EXCLUDES, ...userExcludes]);

  async function walk(dir) {
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

export function resolveRemotePath(localPath, root, projectRootName, prefix) {
  let rel = relative(root, localPath).split(sep).join("/").replace(/\s/g, "_");
  rel = projectRootName + "/" + rel;

  const segments = [];
  if (prefix.length > 0) segments.push(...prefix);
  segments.push(...rel.split("/"));
  return segments.join("/");
}

export function getTags(remotePath, _localPath, _projectRootName) {
  const parts = remotePath.split("/");
  parts.pop();
  return parts;
}
