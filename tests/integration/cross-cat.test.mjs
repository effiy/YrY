/**
 * Cross-category integration test — CDN and theme integration
 *
 * 跨类别集成测试：验证 CDN 资源在 A/B 两类页面中的正确加载。
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
import { existsSync, readdirSync } from 'node:fs';

const CDN_DIR = 'cdn';

describe('cross-cat — 跨类别 CDN 集成测试', () => {
  // ── Story panel CDN links ─────────────────────────────────────────
  describe('故事面板 CDN 引用', () => {
    // Check all story panels use consistent CDN paths
    it('yry-cdn 场景页面使用本地 CDN', () => {
      const htmlFile = 'docs/故事任务面板/yry-cdn/场景-1-cdn资源加载与页面渲染/演示.html';
      if (fileExists(htmlFile)) {
        const content = readFile(htmlFile);
        assert.ok(content.includes('cdn/shared.css') || content.includes('cdn/shared.js'),
          '应引用本地 CDN 资源');
      }
    });

    it('yry-arch 场景页面使用本地 CDN', () => {
      const htmlFile = 'docs/故事任务面板/yry-arch/场景-1-模块定位/演示.html';
      if (fileExists(htmlFile)) {
        const content = readFile(htmlFile);
        assert.ok(content.includes('cdn/shared.css') || content.includes('cdn/shared.js'),
          '应引用本地 CDN 资源');
      }
    });

    it('yry-self-test 场景页面使用本地 CDN', () => {
      const htmlFile = 'docs/故事任务面板/yry-self-test/场景-1-init后全量自检/演示.html';
      if (fileExists(htmlFile)) {
        const content = readFile(htmlFile);
        assert.ok(content.includes('cdn/shared.css') || content.includes('cdn/shared.js'),
          '应引用本地 CDN 资源');
      }
    });

    it('rui-npm 故事页面使用本地 CDN', () => {
      const htmlFile = 'docs/故事任务面板/rui-npm/场景-1-包搜索与发现/演示.html';
      if (fileExists(htmlFile)) {
        const content = readFile(htmlFile);
        assert.ok(content.includes('cdn/shared.css') || content.includes('cdn/shared.js'),
          '应引用本地 CDN 资源');
      }
    });
  });

  // ── CDN directory structure ───────────────────────────────────────
  describe('CDN 目录结构', () => {
    it('所有核心文件存在', () => {
      const required = [
        'cdn/shared.css', 'cdn/shared.js', 'cdn/theme.css',
        'cdn/theme-mono.css', 'cdn/fonts.css', 'cdn/package.json',
      ];
      for (const f of required) {
        assert.ok(fileExists(f), `${f} 应存在`);
      }
    });

    it('fonts/ 目录有字体文件', () => {
      const fontDir = 'cdn/fonts';
      assert.ok(existsSync(fontDir), 'fonts/ 应存在');
      const woff2 = readdirSync(fontDir).filter(f => f.endsWith('.woff2'));
      assert.ok(woff2.length >= 4, `应有至少 4 个 woff2 文件，实际 ${woff2.length}`);
    });
  });

  // ── Theme consistency across stories ──────────────────────────────
  describe('跨故事主题一致性', () => {
    it('所有 B 类页面使用 theme.css', () => {
      // Spot-check a few Cat B pages
      const bPages = [
        'docs/故事任务面板/yry-arch/场景-1-模块定位/审查.html',
        'docs/故事任务面板/yry-self-test/场景-2-commit前增量自检/测试面板.html',
      ];
      for (const page of bPages) {
        if (fileExists(page)) {
          const content = readFile(page);
          assert.ok(content.includes('theme.css') && !content.includes('theme-mono.css'),
            `${page} 应使用 B 类主题 (theme.css)`);
        }
      }
    });

    it('所有 A 类页面使用 theme-mono.css', () => {
      const aPages = [
        'docs/故事任务面板/yry-arch/场景-1-模块定位/架构图.html',
        'docs/故事任务面板/yry-arch/场景-1-模块定位/知识图谱.html',
      ];
      for (const page of aPages) {
        if (fileExists(page)) {
          const content = readFile(page);
          assert.ok(content.includes('theme-mono.css') || content.includes('theme-mono'),
            `${page} 应使用 A 类主题 (theme-mono.css)`);
        }
      }
    });
  });

  // ── JS API consistency ────────────────────────────────────────────
  describe('JS API 一致性', () => {
    it('shared.js 定义所有公共 API', () => {
      const content = readFile('cdn/shared.js');
      const apis = ['toast', 'copyCmd', 'switchPanel'];
      for (const api of apis) {
        assert.ok(content.includes(api), `shared.js 应包含 ${api}`);
      }
    });
  });
});

const exitCode = await run();
process.exit(exitCode);
