// skills/rui-story/lib/walk.mjs — 遍历所有场景的辅助
import { listScenarios } from './paths.mjs';

/**
 * 异步遍历所有场景目录，按顺序对每个场景调用 handler。
 * 收集 handler 抛出的错误，最后统一返回 (成功列表, 失败列表)。
 *
 * @template T
 * @param {(ctx: {subdir:string, scenarioDir:string, fullPath:string}) => Promise<T>} handler
 * @returns {Promise<{ok: T[], failed: Array<{ctx: any, err: Error}>}>}
 */
export async function forEachScenario(handler) {
  const scenarios = listScenarios();
  const ok = [];
  const failed = [];
  for (const ctx of scenarios) {
    try { ok.push(await handler(ctx)); }
    catch (err) { failed.push({ ctx, err }); }
  }
  return { ok, failed };
}
