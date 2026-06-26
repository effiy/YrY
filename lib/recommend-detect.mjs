/**
 * recommend-detect — project type detection and file scanning
 * Extracted from recommend.mjs for single-responsibility.
 */

import { readdir } from "node:fs/promises";
import { join } from "node:path";

export const FRONTEND_EXTS = new Set([".vue", ".jsx", ".tsx", ".svelte"]);
export const BACKEND_SRC_EXTS = new Set([".ts", ".js", ".mjs", ".py", ".go", ".rs", ".java", ".rb", ".php"]);
export const DEFAULT_EXCLUDES = new Set([
  ".git", "node_modules", "dist", "build", ".claude", "vendor",
  "__pycache__", ".next", ".nuxt", "target", "coverage", ".turbo"
]);

/** Return the set of file extensions relevant for a given project type.
 * @param {"frontend"|"backend"|"fullstack"|"meta"|"unknown"} type
 * @returns {Set<string>} Set of extensions with leading `.` */
export function extsForType(type) {
  if (type === "frontend") return FRONTEND_EXTS;
  if (type === "backend") return BACKEND_SRC_EXTS;
  return new Set([...FRONTEND_EXTS, ...BACKEND_SRC_EXTS]);
}

/** Classify a file as "frontend" or "backend" based on extension and project type.
 * @param {string} file - File path or basename
 * @param {"frontend"|"backend"|"fullstack"|"meta"|"unknown"} projectType
 * @returns {"frontend"|"backend"|null} */
export function fileType(file, projectType) {
  const ext = file.split(".").pop()?.toLowerCase();
  if (!ext) return null;
  if (projectType === "frontend" || projectType === "fullstack") {
    if (FRONTEND_EXTS.has("." + ext)) return "frontend";
  }
  if (projectType === "backend" || projectType === "fullstack") {
    if (BACKEND_SRC_EXTS.has("." + ext)) return "backend";
  }
  if (FRONTEND_EXTS.has("." + ext)) return "frontend";
  if (BACKEND_SRC_EXTS.has("." + ext)) return "backend";
  return null;
}

/** Recursively scan a directory for source files matching the project type.
 * @param {string} root - Absolute path to scan
 * @param {"frontend"|"backend"|"fullstack"|"meta"|"unknown"} projectType
 * @param {string[]} [userExcludes=[]] - Additional directory names to exclude
 * @returns {Promise<Array<{path: string, type: string}>>} */
export async function scanFiles(root, projectType, userExcludes = []) {
  /** @type {Array<{path: string, type: string}>} */
  const result = [];
  const excludes = new Set([...DEFAULT_EXCLUDES, ...userExcludes]);
  const exts = extsForType(projectType);

  async function walk(/** @type {string} */ dir) {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); }
    catch { return; }

    for (const entry of entries) {
      if (excludes.has(entry.name)) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) { await walk(full); continue; }
      if (!entry.isFile()) continue;
      const ext = entry.name.split(".").pop()?.toLowerCase();
      if (ext && exts.has("." + ext)) {
        const ft = fileType(entry.name, projectType);
        if (ft) result.push({ path: full, type: ft });
      }
    }
  }

  await walk(root);
  return result;
}
