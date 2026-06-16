/**
 * concurrency.mjs — Shared concurrency utilities
 *
 * Usage:
 *   import { runConcurrent } from '../../lib/concurrency.mjs';
 *   await runConcurrent(items, async (item) => { ... }, CONCURRENCY);
 */

/**
 * Run async operations concurrently with a limit.
 *
 * @param {Array} items - Items to process
 * @param {Function} fn - Async function to call per item: (item) => Promise
 * @param {number} concurrency - Max concurrent workers
 * @returns {Promise<void>} Resolves when all items are processed
 */
export async function runConcurrent(items, fn, concurrency) {
  const queue = [...items];
  let cursor = 0;
  async function worker() {
    while (cursor < queue.length) {
      await fn(queue[cursor++]);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, worker);
  await Promise.all(workers);
}
