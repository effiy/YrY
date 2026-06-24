/**
 * Tests for lib/help-layout.mjs — verifies help text formatting helpers
 * return correctly structured strings.
 */

import { describe, it, assert, run } from '../vitest-adapter.mjs';
import { hdr, subhdr, item, flag, scene } from '../help-layout.mjs';

describe('lib/help-layout.mjs', () => {
  describe('hdr()', () => {
    it('返回包含换行的粗体文本', () => {
      const result = hdr('标题');
      assert.ok(result.startsWith('\n'), 'hdr() must start with newline');
      assert.ok(result.includes('标题'), 'must include the text');
      assert.ok(typeof result === 'string', 'must return string');
    });
  });

  describe('subhdr()', () => {
    it('返回包含缩进的粗体文本', () => {
      const result = subhdr('子标题');
      assert.ok(result.startsWith('\n'), 'subhdr() must start with newline');
      assert.ok(result.includes('子标题'), 'must include the text');
      assert.ok(result.length > 2, 'must have indentation');
    });
  });

  describe('item()', () => {
    it('返回包含命令和描述的对齐文本', () => {
      const result = item('test-cmd', '测试说明');
      assert.ok(result.includes('test-cmd'), 'must include the command');
      assert.ok(result.includes('测试说明'), 'must include the description');
      assert.ok(typeof result === 'string', 'must return string');
    });

    it('不带颜色函数时返回纯文本', () => {
      const result = item('cmd', 'desc');
      const withColor = item('cmd', 'desc', (s) => `[${s}]`);
      assert.ok(withColor.startsWith('['), 'must apply color function');
      assert.ok(!result.startsWith('['), 'plain version must not have color');
    });
  });

  describe('flag()', () => {
    it('短 flag 使用 - 前缀', () => {
      const result = flag('h', '显示帮助');
      assert.ok(result.includes('-h'), 'short flag must use - prefix');
      assert.ok(result.includes('显示帮助'), 'must include description');
    });

    it('长 flag 使用 -- 前缀', () => {
      const result = flag('help', '显示帮助');
      assert.ok(result.includes('--help'), 'long flag must use -- prefix');
    });
  });

  describe('scene()', () => {
    it('返回包含标题的缩进文本', () => {
      const result = scene('场景一');
      assert.ok(result.startsWith('\n'), 'scene() must start with newline');
      assert.ok(result.includes('场景一'), 'must include the title');
    });
  });
});

await run();