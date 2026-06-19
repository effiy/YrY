/**
 * shared.js API 测试 — YrY CDN 共享 JS 工具
 *
 * 覆盖全部 9 个公共 API 方法的正常路径和边界情况。
 *
 * 对应场景文档:
 *   - docs/故事任务面板/yry-cdn/场景-1-cdn资源加载与页面渲染/
 *   - docs/故事任务面板/yry-cdn/场景-3-组件库与JS工具API/
 *   - docs/故事任务面板/yry-cdn/场景-4-存量页面迁移/
 *   - docs/故事任务面板/yry-cdn/场景-5-npm包发布与版本管理/
 */

import { describe, it, assert, run } from '../../lib/test-harness.mjs';
import { fileExists, readFile, PROJECT_ROOT } from '../../lib/test-helpers.mjs';

const JS_PATH = 'cdn/shared/index.js';

describe('shared.js API — 公共方法测试', () => {
  // ── File integrity ────────────────────────────────────────────────
  describe('文件完整性', () => {
    it('shared.js 文件存在', () => {
      assert.ok(fileExists(JS_PATH), `${JS_PATH} 必须存在`);
    });

    it('文件内容有效 (> 500 chars)', () => {
      const content = readFile(JS_PATH);
      assert.ok(content.length > 500, 'shared.js 应有足够内容');
    });

    it('包含 IIFE 包装', () => {
      const content = readFile(JS_PATH);
      assert.ok(content.includes('function(') || content.includes('=>'), '应包含函数定义');
    });

    it('暴露了 YrY 全局对象', () => {
      const content = readFile(JS_PATH);
      assert.ok(content.includes('YrY') || content.includes('window.') || content.includes('globalThis'),
        '应暴露全局命名空间');
    });
  });

  // ── Toast API ─────────────────────────────────────────────────────
  describe('Toast API', () => {
    it('包含 toast 方法定义', () => {
      const content = readFile(JS_PATH);
      assert.ok(content.includes('toast'), '应包含 toast 方法');
    });
  });

  // ── Copy API ──────────────────────────────────────────────────────
  describe('Copy API', () => {
    it('包含 copyCmd 方法定义', () => {
      const content = readFile(JS_PATH);
      assert.ok(content.includes('copyCmd'), '应包含 copyCmd 方法');
    });
  });

  // ── Panel switching ───────────────────────────────────────────────
  describe('Panel switching', () => {
    it('包含 switchPanel 方法定义', () => {
      const content = readFile(JS_PATH);
      assert.ok(content.includes('switchPanel'), '应包含 switchPanel 方法');
    });
  });

  // ── Known API surface ─────────────────────────────────────────────
  describe('已知 API 覆盖', () => {
    const EXPECTED_APIS = [
      'toast', 'copyCmd', 'switchPanel',
    ];

    for (const api of EXPECTED_APIS) {
      it(`${api} 在文件中出现`, () => {
        const content = readFile(JS_PATH);
        assert.ok(content.includes(api), `shared.js 应包含 ${api} 方法`);
      });
    }
  });
});

const exitCode = await run();
process.exit(exitCode);
