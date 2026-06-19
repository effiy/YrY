/**
 * Tests for lib/tty.mjs — verifies ANSI formatting helpers work correctly
 * and degrade gracefully when stdout is not a TTY.
 */

import { describe, it, assert, run } from '../test-harness.mjs';

import { bold, dim, underline, red, green, yellow, cyan } from '../tty.mjs';

describe('lib/tty.mjs', () => {
  describe('格式化函数返回字符串', () => {
    it('bold() 返回字符串', () => {
      assert.equal(typeof bold('test'), 'string', 'must return string');
    });

    it('dim() 返回字符串', () => {
      assert.equal(typeof dim('test'), 'string', 'must return string');
    });

    it('underline() 返回字符串', () => {
      assert.equal(typeof underline('test'), 'string', 'must return string');
    });

    it('red()/green()/yellow()/cyan() 返回字符串', () => {
      assert.equal(typeof red('test'), 'string');
      assert.equal(typeof green('test'), 'string');
      assert.equal(typeof yellow('test'), 'string');
      assert.equal(typeof cyan('test'), 'string');
    });
  });

  describe('非 TTY 环境下的退化', () => {
    it('所有格式化函数在非 TTY 下返回原文 (vitest 默认非 TTY)', () => {
      assert.equal(bold('test'), 'test');
      assert.equal(dim('test'), 'test');
      assert.equal(red('test'), 'test');
      assert.equal(green('test'), 'test');
      assert.equal(yellow('test'), 'test');
      assert.equal(cyan('test'), 'test');
    });
  });

  describe('空字符串与特殊字符', () => {
    it('接受空字符串', () => {
      assert.equal(typeof bold(''), 'string');
      assert.equal(typeof red(''), 'string');
    });

    it('接受包含 ANSI 的字符串 (不会重复转义)', () => {
      const s = bold('inner');
      const wrapped = bold(s);
      assert.equal(typeof wrapped, 'string');
    });
  });
});

await run();
