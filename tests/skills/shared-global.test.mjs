/**
 * shared.css 全局样式测试 — 重置、动画、面包屑、工具栏等
 *
 * 验证 shared.css 在两类页面中都生效的基础规则。
 *
 * 对应场景文档:
 *   - docs/故事任务面板/yry-cdn/场景-2-双主题系统设计/
 */

import { describe, it, assert, run } from '../lib/test-harness.mjs';
import { fileExists, readFile, PROJECT_ROOT } from '../lib/helpers.mjs';

const SHARED_CSS = 'cdn/shared.css';

describe('shared.css — 全局共享样式', () => {
  // ── File integrity ────────────────────────────────────────────────
  describe('文件完整性', () => {
    it('shared.css 存在', () => assert.ok(fileExists(SHARED_CSS)));
    it('文件内容充足 (> 1000 chars)', () => {
      const content = readFile(SHARED_CSS);
      assert.ok(content.length > 1000, 'shared.css 应有足够内容');
    });
  });

  // ── Reset / base ──────────────────────────────────────────────────
  describe('基础重置', () => {
    it('包含 box-sizing 设置', () => {
      const content = readFile(SHARED_CSS);
      assert.ok(content.includes('box-sizing'), '应包含 box-sizing 重置');
    });
    it('包含 margin/padding 重置', () => {
      const content = readFile(SHARED_CSS);
      assert.ok(content.includes('margin') && content.includes('padding'), '应包含间距重置');
    });
    it('包含 scroll-behavior', () => {
      const content = readFile(SHARED_CSS);
      assert.ok(content.includes('scroll-behavior'), '应设置平滑滚动');
    });
  });

  // ── Breadcrumb ────────────────────────────────────────────────────
  describe('面包屑', () => {
    it('包含 .yry-breadcrumb 样式', () => {
      const content = readFile(SHARED_CSS);
      assert.ok(content.includes('yry-breadcrumb'), '应包含面包屑样式');
    });
  });

  // ── Cross-navigation ──────────────────────────────────────────────
  describe('跨导航', () => {
    it('包含 .yry-cross-nav 样式', () => {
      const content = readFile(SHARED_CSS);
      assert.ok(content.includes('yry-cross-nav'), '应包含跨导航样式');
    });
  });

  // ── Toolbar ───────────────────────────────────────────────────────
  describe('工具栏', () => {
    it('包含 .yry-toolbar 样式', () => {
      const content = readFile(SHARED_CSS);
      assert.ok(content.includes('yry-toolbar'), '应包含工具栏样式');
    });
  });

  // ── Toast ─────────────────────────────────────────────────────────
  describe('Toast 通知', () => {
    it('包含 .yry-toast 样式', () => {
      const content = readFile(SHARED_CSS);
      assert.ok(content.includes('yry-toast'), '应包含 toast 样式');
    });
  });

  // ── Animations ────────────────────────────────────────────────────
  describe('动画', () => {
    it('包含 fadeInUp 动画', () => {
      const content = readFile(SHARED_CSS);
      assert.ok(content.includes('fadeInUp') || content.includes('@keyframes'), '应包含动画定义');
    });
  });
});

const exitCode = await run();
process.exit(exitCode);
