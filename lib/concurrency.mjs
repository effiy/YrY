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
  async function worker() {
    while (queue.length > 0) {
      await fn(queue.shift());
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, worker);
  await Promise.all(workers);
}
