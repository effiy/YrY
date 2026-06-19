/**
 * Third-party test framework presence and configuration integrity.
 *
 * Verifies vitest is installed, configured, and the legacy harness is preserved.
 * Run: npx vitest run tests/infrastructure/framework-presence.test.mjs
 */

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..', '..', '..');

describe('第三方测试框架 — vitest 安装与配置', () => {
  describe('package.json', () => {
    it('根目录 package.json 存在', () => {
      expect(existsSync(resolve(PROJECT_ROOT, 'package.json'))).toBe(true);
    });

    it('vitest 声明为 devDependency', () => {
      const pkg = JSON.parse(readFileSync(resolve(PROJECT_ROOT, 'package.json'), 'utf-8'));
      expect(pkg.devDependencies.vitest).toBeDefined();
    });

    it('@vitest/ui 声明为 devDependency', () => {
      const pkg = JSON.parse(readFileSync(resolve(PROJECT_ROOT, 'package.json'), 'utf-8'));
      expect(pkg.devDependencies['@vitest/ui']).toBeDefined();
    });

    it('test 脚本指向 vitest run', () => {
      const pkg = JSON.parse(readFileSync(resolve(PROJECT_ROOT, 'package.json'), 'utf-8'));
      expect(pkg.scripts.test).toBe('vitest run');
    });

    it('test:legacy 脚本保留原运行器', () => {
      const pkg = JSON.parse(readFileSync(resolve(PROJECT_ROOT, 'package.json'), 'utf-8'));
      expect(pkg.scripts['test:legacy']).toBe('node skills/rui/tests/run.mjs');
    });
  });

  describe('vitest.config.mjs', () => {
    it('配置文件存在', () => {
      expect(existsSync(resolve(PROJECT_ROOT, 'vitest.config.mjs'))).toBe(true);
    });

    it('配置文件包含 test include 模式', () => {
      const config = readFileSync(resolve(PROJECT_ROOT, 'vitest.config.mjs'), 'utf-8');
      expect(config).toContain("skills/rui/tests/infrastructure/**/*.test.mjs");
    });

    it('配置文件排除 node_modules', () => {
      const config = readFileSync(resolve(PROJECT_ROOT, 'vitest.config.mjs'), 'utf-8');
      expect(config).toContain('node_modules');
    });
  });

  describe('vitest 模块可导入', () => {
    it('vitest 可被 import()', async () => {
      await expect(import('vitest')).resolves.toBeDefined();
    });

    it('describe/it/expect 可从 vitest 导入', async () => {
      const vitest = await import('vitest');
      expect(vitest.describe).toBeDefined();
      expect(vitest.it).toBeDefined();
      expect(vitest.expect).toBeDefined();
    });
  });

  describe('node_modules 安全管理', () => {
    it('node_modules 已被 gitignore', () => {
      const gitignore = readFileSync(resolve(PROJECT_ROOT, '.gitignore'), 'utf-8');
      expect(gitignore).toContain('node_modules');
    });
  });

  describe('适配层存在', () => {
    it('vitest-adapter.mjs 已创建', () => {
      expect(existsSync(resolve(PROJECT_ROOT, 'lib/vitest-adapter.mjs'))).toBe(true);
    });

    it('适配层可导入', async () => {
      await expect(import('../../../../lib/vitest-adapter.mjs')).resolves.toBeDefined();
    });

    it('适配层导出 describe/it/assert/run', async () => {
      const adapter = await import('../../../../lib/vitest-adapter.mjs');
      expect(adapter.describe).toBeDefined();
      expect(adapter.it).toBeDefined();
      expect(adapter.assert).toBeDefined();
      expect(adapter.run).toBeDefined();
    });

    it('适配层 assert 方法完整 (9 个)', async () => {
      const adapter = await import('../../../../lib/vitest-adapter.mjs');
      const methods = ['equal', 'notEqual', 'deepEqual', 'ok', 'fail', 'throws', 'match', 'includes', 'typeOf'];
      for (const m of methods) {
        expect(adapter.assert[m], `assert.${m}`).toBeDefined();
      }
    });
  });

  describe('遗留测试基础设施保留', () => {
    it('test-harness.mjs 未改动', () => {
      expect(existsSync(resolve(PROJECT_ROOT, 'lib/test-harness.mjs'))).toBe(true);
    });

    it('run.mjs 未改动', () => {
      expect(existsSync(resolve(PROJECT_ROOT, 'skills/rui/tests/run.mjs'))).toBe(true);
    });

    it('helpers.mjs 未改动', () => {
      expect(existsSync(resolve(PROJECT_ROOT, 'lib/test-helpers.mjs'))).toBe(true);
    });

    it('遗留运行器仍可执行', () => {
      const runContent = readFileSync(resolve(PROJECT_ROOT, 'skills/rui/tests/run.mjs'), 'utf-8');
      expect(runContent).toContain('discoverTests');
      expect(runContent).toContain('--skills');
    });
  });
});
