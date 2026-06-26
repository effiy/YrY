/**
 * Tests for lib/vitest-adapter.mjs — verifies the adapter correctly
 * re-exports vitest primitives and assert helpers.
 */

import { describe, it, assert, run, beforeAll, beforeEach, COUNTERS, getResults } from '../vitest-adapter.mjs';

describe('lib/vitest-adapter.mjs', () => {
  describe('describe/it 基本可用', () => {
    it('describe 和 it 可注册并执行测试', () => {
      assert.ok(true, 'basic test execution');
    });
  });

  describe('beforeAll/afterAll 钩子', () => {
    let hookRan = false;

    beforeAll(() => { hookRan = true; });

    it('beforeAll 已执行', () => {
      assert.ok(hookRan, 'beforeAll must have run');
    });
  });

  describe('beforeEach/afterEach 钩子', () => {
    let count = 0;

    beforeEach(() => { count++; });

    it('beforeEach 在第一个测试时执行', () => {
      assert.equal(count, 1);
    });

    it('beforeEach 在第二个测试时再次执行', () => {
      assert.equal(count, 2);
    });
  });

  describe('COUNTERS (向后兼容)', () => {
    it('COUNTERS 对象存在', () => {
      assert.typeOf(COUNTERS, 'object');
      assert.typeOf(COUNTERS.total, 'number');
      assert.typeOf(COUNTERS.passed, 'number');
      assert.typeOf(COUNTERS.failed, 'number');
      assert.typeOf(COUNTERS.skipped, 'number');
    });
  });

  describe('getResults() (向后兼容)', () => {
    it('返回包含 timestamp/summary/suites 的结果对象', () => {
      const result = getResults();
      assert.typeOf(result.timestamp, 'string');
      assert.typeOf(result.summary, 'object');
      assert.typeOf(result.suites, 'object');
    });
  });

  describe('run() (向后兼容)', () => {
    it('返回 0 (no-op under vitest)', async () => {
      const exitCode = await run();
      assert.equal(exitCode, 0);
    });
  });

  describe('assert.typeOf', () => {
    it('识别 array', () => assert.typeOf([], 'array'));
    it('识别 object', () => assert.typeOf({}, 'object'));
    it('识别 string', () => assert.typeOf('x', 'string'));
    it('识别 number', () => assert.typeOf(42, 'number'));
    it('识别 function', () => assert.typeOf(() => {}, 'function'));
    it('识别 boolean', () => assert.typeOf(true, 'boolean'));
    it('识别 undefined', () => assert.typeOf(undefined, 'undefined'));
  });
});

await run();