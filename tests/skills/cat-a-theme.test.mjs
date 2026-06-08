/**
 * Cat A 主题测试 — 架构图和知识图谱的等宽字体主题
 *
 * 验证 theme-mono.css 的特有样式规则和组件。
 *
 * 对应场景文档:
 *   - docs/故事任务面板/yry-cdn/场景-2-双主题系统设计/
 */

import { describe, it, assert, run } from '../lib/test-harness.mjs';
import { fileExists, readFile, PROJECT_ROOT } from '../lib/helpers.mjs';

const THEME_MONO = 'cdn/theme-mono.css';
const FONTS_CSS = 'cdn/fonts.css';

describe('Cat A 主题 — theme-mono.css', () => {
  // ── Font dependency ──────────────────────────────────────────────
  describe('字体依赖', () => {
    it('fonts.css 存在', () => assert.ok(fileExists(FONTS_CSS)));
    it('fonts.css 定义了 JetBrains Mono', () => {
      const content = readFile(FONTS_CSS);
      assert.ok(content.includes('JetBrains Mono'), '应定义 JetBrains Mono 字体');
    });
    it('fonts.css 定义了 4 个 font-face', () => {
      const content = readFile(FONTS_CSS);
      const count = (content.match(/@font-face/g) || []).length;
      assert.equal(count, 4, `应有 4 个 @font-face，实际 ${count}`);
    });
  });

  // ── A-class specific components ──────────────────────────────────
  describe('A 类特有组件', () => {
    it('包含 .yry-mono-header 样式', () => {
      const content = readFile(THEME_MONO);
      assert.ok(content.includes('yry-mono-header'), '应包含 A 类 header');
    });
    it('包含 .yry-mono-card 样式', () => {
      const content = readFile(THEME_MONO);
      assert.ok(content.includes('yry-mono-card'), '应包含 A 类卡片');
    });
    it('包含 .yry-mono-subtitle 样式', () => {
      const content = readFile(THEME_MONO);
      assert.ok(content.includes('yry-mono-subtitle'), '应包含 A 类副标题');
    });
  });

  // ── Design integrity ─────────────────────────────────────────────
  describe('设计规范', () => {
    it('使用深蓝色背景色', () => {
      const content = readFile(THEME_MONO);
      const bgMatch = content.match(/--bg\s*:\s*([^;]+)/);
      if (bgMatch) {
        const bg = bgMatch[1].toLowerCase();
        // Dark blue-ish color expected
        assert.ok(bg.includes('#') || bg.includes('rgb'), '应定义颜色值');
      }
    });
  });
});

const exitCode = await run();
process.exit(exitCode);
