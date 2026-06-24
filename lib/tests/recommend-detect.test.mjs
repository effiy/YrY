/**
 * Tests for lib/recommend-detect.mjs — project type detection and file scanning.
 */

import { describe, it, assert, run } from '../vitest-adapter.mjs';
import {
  FRONTEND_EXTS,
  BACKEND_SRC_EXTS,
  DEFAULT_EXCLUDES,
  extsForType,
  fileType,
  scanFiles,
} from '../recommend-detect.mjs';

describe('lib/recommend-detect.mjs', () => {
  describe('常量', () => {
    it('FRONTEND_EXTS 包含 .vue/.jsx/.tsx/.svelte', () => {
      assert.ok(FRONTEND_EXTS.has('.vue'));
      assert.ok(FRONTEND_EXTS.has('.jsx'));
      assert.ok(FRONTEND_EXTS.has('.tsx'));
      assert.ok(FRONTEND_EXTS.has('.svelte'));
    });

    it('BACKEND_SRC_EXTS 包含 .ts/.js/.mjs/.py/.go', () => {
      assert.ok(BACKEND_SRC_EXTS.has('.ts'));
      assert.ok(BACKEND_SRC_EXTS.has('.js'));
      assert.ok(BACKEND_SRC_EXTS.has('.mjs'));
      assert.ok(BACKEND_SRC_EXTS.has('.py'));
      assert.ok(BACKEND_SRC_EXTS.has('.go'));
    });

    it('DEFAULT_EXCLUDES 包含 node_modules 和 .git', () => {
      assert.ok(DEFAULT_EXCLUDES.has('node_modules'));
      assert.ok(DEFAULT_EXCLUDES.has('.git'));
      assert.ok(DEFAULT_EXCLUDES.has('dist'));
    });
  });

  describe('extsForType()', () => {
    it('frontend 返回前端扩展名', () => {
      const exts = extsForType('frontend');
      assert.ok(exts.has('.vue'));
      assert.ok(!exts.has('.py'), 'frontend should not include .py');
    });

    it('backend 返回后端扩展名', () => {
      const exts = extsForType('backend');
      assert.ok(exts.has('.go'));
      assert.ok(exts.has('.py'));
      assert.ok(!exts.has('.vue'), 'backend should not include .vue');
    });

    it('unknown 返回全量扩展名', () => {
      const exts = extsForType('unknown');
      assert.ok(exts.has('.vue'));
      assert.ok(exts.has('.go'));
    });
  });

  describe('fileType()', () => {
    it('frontend 项目识别 .vue 文件', () => {
      assert.equal(fileType('App.vue', 'frontend'), 'frontend');
    });

    it('backend 项目识别 .go 文件', () => {
      assert.equal(fileType('main.go', 'backend'), 'backend');
    });

    it('fullstack 项目识别前端文件', () => {
      assert.equal(fileType('App.tsx', 'fullstack'), 'frontend');
    });

    it('fullstack 项目识别后端文件', () => {
      assert.equal(fileType('server.py', 'fullstack'), 'backend');
    });

    it('无扩展名文件返回 null', () => {
      assert.equal(fileType('Dockerfile', 'backend'), null);
    });

    it('未知扩展名返回 null', () => {
      assert.equal(fileType('image.png', 'frontend'), null);
    });
  });

  describe('scanFiles()', () => {
    it('扫描 lib/ 目录返回 .mjs 文件', async () => {
      const files = await scanFiles(process.cwd(), 'backend', ['node_modules', '.git', '.claude', 'cdn', 'coverage']);
      const mjsFiles = files.filter(f => f.path.endsWith('.mjs'));
      assert.ok(mjsFiles.length > 0, 'must find .mjs files in project');
      for (const f of mjsFiles) {
        assert.equal(f.type, 'backend');
      }
    });

    it('排除 node_modules', async () => {
      const files = await scanFiles(process.cwd(), 'backend');
      for (const f of files) {
        assert.ok(!f.path.includes('node_modules'), 'must not include node_modules files');
      }
    });
  });
});

await run();