// scripts/lib/walk.mjs — 遍历所有场景的辅助
import fs from 'node:fs/promises';
import path from 'node:path';
import { DOCS_DIR, SUBDIRS, TEMPLATE_SCENARIO, ARTIFACTS } from './paths.mjs';

/**
 * 异步遍历所有场景目录，按顺序对每个场景调用 handler。
 * 收集 handler 抛出的错误，最后统一返回 (成功列表, 失败列表)。
 *
 * @template T
 * @param {(ctx: {subdir:string, scenarioDir:string, fullPath:string}) => Promise<T>} handler
 * @returns {Promise<{ok: T[], failed: Array<{ctx, err: Error}>>}
 */
export async function forEachScenario(handler) {
  const ok = [];
  const failed = [];
  for (const sub of SUBDIRS) {
    const base = path.join(DOCS_DIR, sub);
    let entries;
    try { entries = await fs.readdir(base); }
    catch { continue; }
    for (const name of entries) {
      if (name.startsWith('.') || name === TEMPLATE_SCENARIO) continue;
      if (!name.startsWith('场景-')) continue;
      const fullPath = path.join(base, name);
      const ctx = { subdir: sub, scenarioDir: name, fullPath };
      try { ok.push(await handler(ctx)); }
      catch (err) { failed.push({ ctx, err }); }
    }
  }
  return { ok, failed };
}

/** 一个场景的 index.md 必须存在；不存在则跳过。 */
export function hasIndexMd(ctx) {
  return async () => {
    try { await fs.access(path.join(ctx.fullPath, 'index.md')); return true; }
    catch { return false; }
  };
}

/** 一个场景的 7 个 html 制品路径 */
export function artifactPaths(ctx) {
  const out = {};
  for (const a of ARTIFACTS) out[a] = path.join(ctx.fullPath, a);
  return out;
}

export { ARTIFACTS };
