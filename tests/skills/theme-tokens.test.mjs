/**
 * Theme tokens 测试 — CSS 变量与设计令牌一致性
 *
 * 验证 theme/index.css 和 theme-mono/index.css 的 CSS 自定义属性完整性。
 * 检测两个主题之间的关键差异是否符合设计规范。
 *
 * 对应场景文档:
 *   - docs/故事任务面板/yry-cdn/场景-1-cdn资源加载与页面渲染/
 *   - docs/故事任务面板/yry-cdn/场景-2-双主题系统设计/
 *   - docs/故事任务面板/yry-cdn/场景-3-组件库与JS工具API/
 *   - docs/故事任务面板/yry-cdn/场景-4-存量页面迁移/
 *   - docs/故事任务面板/yry-cdn/场景-5-npm包发布与版本管理/
 */

import { describe, it, assert, run } from '../lib/test-harness.mjs';
import { fileExists, readFile, PROJECT_ROOT } from '../lib/helpers.mjs';

const THEME_CSS = 'cdn/theme/index.css';
const THEME_MONO = 'cdn/theme-mono/index.css';

function extractCssVars(content) {
  const vars = {};
  for (const match of content.matchAll(/--([a-zA-Z0-9_-]+)\s*:\s*([^;]+)/g)) {
    vars[match[1]] = match[2].trim();
  }
  return vars;
}

describe('Theme tokens — 设计令牌一致性', () => {
  // ── File integrity ───────────────────────────────────────────────
  describe('文件完整性', () => {
    it('theme/index.css 存在', () => assert.ok(fileExists(THEME_CSS)));
    it('theme-mono/index.css 存在', () => assert.ok(fileExists(THEME_MONO)));
    it('两个文件内容不同', () => {
      assert.notEqual(readFile(THEME_CSS), readFile(THEME_MONO), '两个主题应有不同样式');
    });
  });

  // ── Theme B tokens (system font, dark purple) ────────────────────
  describe('Cat B — B 类主题 (theme/index.css)', () => {
    const content = readFile(THEME_CSS);
    const vars = extractCssVars(content);

    it('定义了 --yry-bg 变量', () => assert.ok(vars['yry-bg'], '应定义 --yry-bg'));
    it('定义了 --yry-accent 变量', () => assert.ok(vars['yry-accent'], '应定义 --yry-accent'));
    it('定义了 --yry-text / --yry-text2 / --yry-text3', () => {
      assert.ok(vars['yry-text'], '应定义 --yry-text');
      assert.ok(vars['yry-text2'], '应定义 --yry-text2');
      assert.ok(vars['yry-text3'], '应定义 --yry-text3');
    });
    it('使用系统字体栈', () => {
      assert.ok(content.includes('sans-serif') || content.includes('system-ui'),
        'B 类应使用系统字体');
    });
  });

  // ── Theme A tokens (monospace, dark blue) ────────────────────────
  describe('Cat A — A 类主题 (theme-mono/index.css)', () => {
    const content = readFile(THEME_MONO);

    it('文件内容充足 (> 500 chars)', () => {
      assert.ok(content.length > 500, 'theme-mono/index.css 应有足够内容');
    });
    it('使用等宽字体', () => {
      assert.ok(content.includes('mono') || content.includes('Mono'),
        'A 类应使用等宽字体');
    });
    it('定义深蓝色背景', () => {
      assert.ok(content.includes('#020617') || content.includes('background:'),
        '应定义背景色');
    });
  });

  // ── Cross-theme consistency ──────────────────────────────────────
  describe('跨主题对比', () => {
    it('两个主题有不同背景色', () => {
      const bgB = readFile(THEME_CSS).match(/--yry-bg\s*:\s*([^;]+)/)?.[1] || '';
      // theme-mono uses hardcoded colors, not CSS vars — verify it's different
      const monoContent = readFile(THEME_MONO);
      assert.ok(monoContent.includes('background:'), 'theme-mono/index.css 应定义背景色');
      // The two should have different color values
      if (bgB) {
        assert.ok(!monoContent.includes(bgB), '两个主题不应使用相同背景色');
      }
    });

    it('B 类使用 CSS 变量定义令牌', () => {
      const vars = extractCssVars(readFile(THEME_CSS));
      const expected = ['yry-bg', 'yry-text', 'yry-accent', 'yry-shadow', 'yry-radius', 'yry-border'];
      for (const v of expected) {
        assert.ok(vars[v], `theme/index.css 应定义 --${v}`);
      }
    });
  });
});

const exitCode = await run();
process.exit(exitCode);
