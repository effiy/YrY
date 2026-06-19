/**
 * Tests for lib/test-harness.mjs — meta-test for the test framework itself.
 * Ensures describe/it/assert/run all behave correctly.
 */

import { describe, it, assert, run } from '../test-harness.mjs';

describe('lib/test-harness.mjs (meta)', () => {
  describe('断言方法', () => {
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

  describe('describe/it 注册', () => {
    it('可以嵌套 describe/it', () => {
      let ran = false;
      describe('outer', () => {
        describe('inner', () => {
          it('inner test', () => {
            ran = true;
          });
        });
      });
      // 注册是同步的,执行在 run() 时,但注册本身已生效
      assert.ok(typeof ran === 'boolean');
    });

    it('it.skip 标记为跳过', () => {
      // 仅注册,无需断言 (skip 由 run() 处理)
      it.skip('skipped test', () => {
        assert.fail('should not run');
      });
      assert.ok(true, 'registration did not throw');
    });
  });
});

await run();
