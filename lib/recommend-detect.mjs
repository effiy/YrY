/**
 * recommend-detect — project type detection and file scanning
 * Extracted from recommend.mjs for single-responsibility.
 */

import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";

export const FRONTEND_EXTS = new Set([".vue", ".jsx", ".tsx", ".svelte"]);
export const BACKEND_SRC_EXTS = new Set([".ts", ".js", ".mjs", ".py", ".go", ".rs", ".java", ".rb", ".php"]);
export const DEFAULT_EXCLUDES = new Set([
  ".git", "node_modules", "dist", "build", ".claude", "vendor",
  "__pycache__", ".next", ".nuxt", "target", "coverage", ".turbo"
]);

export function detectType(root) {
  const pj = join(root, "package.json");
  if (!existsSync(pj)) return "unknown";

  let pkg;
  try { pkg = JSON.parse(readFileSync(pj, "utf-8")); } catch { return "unknown"; }
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const keys = Object.keys(deps);

  const hasFrontend = keys.some(k => /react|vue|svelte|next|nuxt|angular|solid/.test(k));
  const hasBackend = keys.some(k => /express|koa|fastify|nest|hono|elysia|hapi/.test(k));

  if (existsSync(join(root, ".claude-plugin", "plugin.json")) && !hasFrontend && !hasBackend)
    return "meta";
  if (hasFrontend && hasBackend) return "fullstack";
  if (hasFrontend) return "frontend";
  if (hasBackend) return "backend";

  if (existsSync(join(root, "src", "routes")) || existsSync(join(root, "src", "controllers")) ||
      existsSync(join(root, "api"))) return "backend";
  if (existsSync(join(root, "src", "components")) || existsSync(join(root, "pages"))) return "frontend";

  return "unknown";
}

export function extsForType(type) {
  if (type === "frontend") return FRONTEND_EXTS;
  if (type === "backend") return BACKEND_SRC_EXTS;
  return new Set([...FRONTEND_EXTS, ...BACKEND_SRC_EXTS]);
}

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

export async function scanFiles(root, projectType, userExcludes = []) {
  const result = [];
  const excludes = new Set([...DEFAULT_EXCLUDES, ...userExcludes]);
  const exts = extsForType(projectType);

  async function walk(dir) {
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
