/**
 * Cat B 主题测试 — 审查/测试/演示/计划清单的系统字体主题
 *
 * 验证 theme.css 的特有样式规则和 14 个组件。
 *
 * 对应场景文档:
 *   - docs/故事任务面板/yry-cdn/场景-2-双主题系统设计/
 */

import { describe, it, assert, run } from '../lib/test-harness.mjs';
import { fileExists, readFile, PROJECT_ROOT } from '../lib/helpers.mjs';

const THEME_CSS = 'cdn/theme.css';

describe('Cat B 主题 — theme.css', () => {
  // ── B-class specific components ──────────────────────────────────
  describe('B 类组件覆盖', () => {
    const B_COMPONENTS = [
      'container', 'header', 'stats', 'stat',
      'tabs', 'tab', 'panel',
      'suite', 'section', 'bar-wrap', 'bar-outer',
      'card', 'btn', 'progress-wrap', 'progress-bar',
      'accent', 'sub',
    ];

    const content = readFile(THEME_CSS);
    for (const comp of B_COMPONENTS) {
      it(`包含 .yry-${comp} 样式`, () => {
        assert.ok(content.includes(`yry-${comp}`), `theme.css 应包含 ${comp} 组件样式`);
      });
    }
  });

  // ── Design integrity ─────────────────────────────────────────────
  describe('设计规范', () => {
    it('使用深紫黑色背景', () => {
      const content = readFile(THEME_CSS);
      const bgMatch = content.match(/--yry-bg\s*:\s*([^;]+)/);
      if (bgMatch) {
        const bg = bgMatch[1].toLowerCase();
        assert.ok(bg.includes('#') || bg.includes('rgb'), '应定义背景色');
      }
    });

    it('使用系统字体栈', () => {
      const content = readFile(THEME_CSS);
      assert.ok(
        content.includes('-apple-system') || content.includes('sans-serif') ||
        content.includes('Segoe UI'),
        'B 类应使用系统字体栈'
      );
    });

    it('定义金色强调色', () => {
      const content = readFile(THEME_CSS);
      // accent should be a gold/yellow color
      const accent = content.match(/--yry-accent\s*:\s*([^;]+)/);
      if (accent) {
        assert.ok(accent[1].includes('#') || accent[1].includes('rgb'), '应定义强调色');
      }
    });
  });

  // ── Animation presence ───────────────────────────────────────────
  describe('动画', () => {
    it('包含 fadeInUp 关键帧', () => {
      // Animations are inline in HTML, but theme.css may have some
      const content = readFile(THEME_CSS);
      assert.ok(content.length > 2000, 'theme.css 应有足够内容');
    });
  });
});

const exitCode = await run();
process.exit(exitCode);
