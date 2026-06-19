/**
 * Theme components 测试 — 两类主题的组件完整性
 *
 * 验证两个主题文件中所有组件的样式规则完整性。
 *
 * 对应场景文档:
 *   - docs/故事任务面板/yry-cdn/场景-2-双主题系统设计/
 */

import { describe, it, assert, run } from '../../lib/test-harness.mjs';
import { fileExists, readFile, PROJECT_ROOT } from '../../lib/test-helpers.mjs';

const THEME_CSS = 'cdn/theme/index.css';
const THEME_MONO = 'cdn/theme-mono/index.css';
const SHARED_CSS = 'cdn/shared/index.css';

// Shared components that both themes must reference
const SHARED_COMPONENTS = [
  'breadcrumb', 'cross-nav', 'toolbar', 'toast', 'footer',
];

// B-only components
const B_COMPONENTS = [
  'container', 'header', 'stats', 'stat',
  'tabs', 'tab', 'panel', 'suite', 'section',
  'bar-wrap', 'bar-outer', 'card', 'btn',
  'progress-wrap', 'progress-bar', 'accent', 'sub',
];

// A-only components
const A_COMPONENTS = [
  'mono-header', 'mono-card', 'mono-subtitle', 'mono-footer',
  'mono-cards', 'diagram-wrap', 'graph-wrap',
];

describe('Theme components — 组件完整性', () => {
  describe('共享组件 (shared/index.css)', () => {
    const content = readFile(SHARED_CSS);
    for (const comp of SHARED_COMPONENTS) {
      it(`shared/index.css 包含 yry-${comp}`, () => {
        assert.ok(content.includes(`yry-${comp}`), `应包含共享组件 ${comp}`);
      });
    }
  });

  describe('B 类组件 (theme/index.css)', () => {
    const content = readFile(THEME_CSS);
    for (const comp of B_COMPONENTS) {
      it(`theme/index.css 包含 yry-${comp}`, () => {
        assert.ok(content.includes(`yry-${comp}`), `应包含 B 类组件 ${comp}`);
      });
    }
  });

  describe('A 类组件 (theme-mono/index.css)', () => {
    const content = readFile(THEME_MONO);
    for (const comp of A_COMPONENTS) {
      it(`theme-mono/index.css 包含 ${comp}`, () => {
        assert.ok(content.includes(comp), `应包含 A 类组件 ${comp}`);
      });
    }
  });

  describe('跨主题对比', () => {
    it('两个主题有不同背景色', () => {
      const bgB = readFile(THEME_CSS).match(/--yry-bg\s*:\s*([^;]+)/)?.[1] || '';
      const bgA = readFile(THEME_MONO).match(/--yry-bg\s*:\s*([^;]+)/)?.[1] || '';
      assert.notEqual(bgB, bgA, '两个主题应有不同背景色');
    });
  });
});

const exitCode = await run();
process.exit(exitCode);
