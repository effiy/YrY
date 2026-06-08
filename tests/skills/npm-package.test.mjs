/**
 * npm package 测试 — CDN 包结构、发布和版本管理
 *
 * 验证 yry-cdn 包的 package.json 完整性、文件清单和 semver。
 *
 * 对应场景文档:
 *   - docs/故事任务面板/yry-cdn/场景-5-npm包发布与版本管理/
 */

import { describe, it, assert, run } from '../lib/test-harness.mjs';
import { fileExists, readFile, PROJECT_ROOT } from '../lib/helpers.mjs';
import { existsSync, statSync, readdirSync } from 'node:fs';

const PKG_DIR = 'cdn';
const PKG_JSON = `${PKG_DIR}/package.json`;
const CDN_FILES = [
  'shared.css', 'shared.js', 'theme.css', 'theme-mono.css',
  'fonts.css', 'README.md',
];

describe('npm package — CDN 包发布与版本管理', () => {
  // ── package.json integrity ────────────────────────────────────────
  describe('package.json', () => {
    it('存在', () => assert.ok(fileExists(PKG_JSON)));

    let pkg;
    it('是合法 JSON', () => {
      try { pkg = JSON.parse(readFile(PKG_JSON)); assert.ok(true); }
      catch { assert.fail('package.json 不是合法 JSON'); }
    });

    it('name 字段正确', () => { assert.ok(pkg?.name?.length > 0); });
    it('version 符合 semver', () => {
      assert.match(pkg?.version || '', /^\d+\.\d+\.\d+/, `version 应为 semver: ${pkg?.version}`);
    });
    it('有 description', () => { assert.ok(pkg?.description?.length > 10); });
    it('main 指向 shared.js', () => { assert.equal(pkg?.main, 'shared.js'); });
    it('有 license', () => { assert.ok(pkg?.license); });
  });

  // ── Published files ───────────────────────────────────────────────
  describe('发布文件', () => {
    it('files 数组包含所有必要文件', () => {
      const pkg = JSON.parse(readFile(PKG_JSON));
      assert.ok(Array.isArray(pkg.files), 'files 应为数组');
      for (const f of CDN_FILES) {
        const found = pkg.files.some(x => x === f || (f.startsWith(x.replace(/\*/g, ''))));
        assert.ok(found, `files[] 应包含 ${f}`);
      }
    });

    for (const f of CDN_FILES) {
      it(`${f} 存在且非空`, () => {
        const path = `${PKG_DIR}/${f}`;
        assert.ok(fileExists(path), `${path} 应存在`);
        const size = statSync(existsSync(path) ? path : PKG_DIR).size;
        assert.ok(size > 0, `${f} 不应为空`);
      });
    }
  });

  // ── Font files ────────────────────────────────────────────────────
  describe('字体文件', () => {
    const fontDir = `${PKG_DIR}/fonts`;
    it('fonts/ 目录存在', () => {
      assert.ok(existsSync(fontDir), 'fonts/ 目录应存在');
    });
    it('包含 4 个 woff2 文件', () => {
      if (existsSync(fontDir)) {
        const woff2 = readdirSync(fontDir).filter(f => f.endsWith('.woff2'));
        assert.equal(woff2.length, 4, `应有 4 个 woff2，实际 ${woff2.length}`);
      }
    });
  });

  // ── Version management ────────────────────────────────────────────
  describe('版本管理', () => {
    it('版本号格式正确', () => {
      const pkg = JSON.parse(readFile(PKG_JSON));
      const [major, minor, patch] = pkg.version.split('.').map(Number);
      assert.ok(major >= 0 && minor >= 0 && patch >= 0, '版本号各部分应为非负整数');
    });
  });
});

const exitCode = await run();
process.exit(exitCode);
