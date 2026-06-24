/**
 * Tests for lib/vitest-adapter.mjs — verifies the adapter's assert methods
 * and describe/it primitives work correctly under vitest.
 */

import { describe, it, assert, run } from '../vitest-adapter.mjs';

describe('lib/vitest-adapter.mjs', () => {
  describe('assert 方法', () => {
    it('assert.equal 通过相同值', () => {
      assert.equal(1, 1);
      assert.equal('a', 'a');
      assert.equal(null, null);
    });

    it('assert.equal 不通过不同值 (抛错)', () => {
      let threw = false;
      try { assert.equal(1, 2); } catch { threw = true; }
      assert.ok(threw, 'must throw on mismatch');
    });

    it('assert.notEqual 通过不同值', () => {
      assert.notEqual(1, 2);
    });

    it('assert.deepEqual 通过深度相同', () => {
      assert.deepEqual({ a: 1, b: [2, 3] }, { a: 1, b: [2, 3] });
    });

    it('assert.ok 通过 truthy', () => {
      assert.ok(1);
      assert.ok('x');
      assert.ok([]);
    });

    it('assert.throws 通过抛错函数', () => {
      assert.throws(() => { throw new Error('boom'); });
    });

    it('assert.match 通过正则', () => {
      assert.match('hello world', /world/);
    });

    it('assert.includes 通过包含子串', () => {
      assert.includes('hello world', 'world');
    });

    it('assert.typeOf 通过类型匹配', () => {
      assert.typeOf([], 'array');
      assert.typeOf({}, 'object');
      assert.typeOf('s', 'string');
    });
  });

  describe('it.skip', () => {
    it.skip('skipped test 不会执行', () => {
      assert.fail('should not run');
    });
  });

  describe('it.only (不实际使用, 仅验证存在)', () => {
    it('it.only 是函数', () => {
      assert.typeOf(it.only, 'function');
    });
  });
});

await run();
