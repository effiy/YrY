/**
 * Tests for lib/io.mjs — concurrency and plugin utilities.
 */

import { describe, it, assert, run } from '../vitest-adapter.mjs';
import { runConcurrent, findPluginHelpPath } from '../io.mjs';

describe('lib/io.mjs', () => {
  describe('runConcurrent()', () => {
    it('并发执行所有任务', async () => {
      const results = [];
      await runConcurrent([1, 2, 3, 4, 5], async (n) => {
        results.push(n * 2);
      }, 3);
      assert.equal(results.length, 5, 'all 5 items must be processed');
      results.sort((a, b) => a - b);
      assert.deepEqual(results, [2, 4, 6, 8, 10]);
    });

    it('空数组立即返回', async () => {
      const results = [];
      await runConcurrent([], async (n) => { results.push(n); }, 3);
      assert.equal(results.length, 0, 'no items to process');
    });

    it('并发数大于数组长度时正常工作', async () => {
      const results = [];
      await runConcurrent([1, 2], async (n) => {
        results.push(n);
      }, 10);
      assert.equal(results.length, 2);
    });

    it('并发数为 1 时顺序执行', async () => {
      const order = [];
      await runConcurrent([1, 2, 3], async (n) => {
        order.push(n);
      }, 1);
      assert.deepEqual(order, [1, 2, 3], 'must execute in order with concurrency=1');
    });

    it('任务抛出错误时传播', async () => {
      let threw = false;
      try {
        await runConcurrent([1], async () => { throw new Error('boom'); }, 1);
      } catch {
        threw = true;
      }
      assert.ok(threw, 'must propagate errors');
    });

    it('单元素数组正常执行', async () => {
      const results = [];
      await runConcurrent([42], async (n) => { results.push(n); }, 1);
      assert.deepEqual(results, [42]);
    });
  });

  describe('findPluginHelpPath()', () => {
    it('返回 null 或有效路径', () => {
      const result = findPluginHelpPath('rui');
      if (result === null) {
        assert.ok(true, 'plugin not installed, returns null gracefully');
      } else {
        assert.ok(typeof result === 'string', 'must return string path');
        assert.ok(result.includes('help.mjs'), 'path must point to help.mjs');
      }
    });

    it('不存在 skill 返回 null', () => {
      assert.equal(findPluginHelpPath('nonexistent-skill-xyz'), null);
    });
  });
});

await run();