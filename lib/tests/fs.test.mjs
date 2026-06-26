/**
 * Tests for lib/fs.mjs — verifies file system helpers and project root
 * discovery work as expected.
 */

import { describe, it, assert, run, beforeAll, afterAll } from '../vitest-adapter.mjs';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { findProjectRoot, readProjectName, nowISO, nowDate, fmtDisplay, fmtDate, escHtml, isMain, readJson, writeJson, readJsonl, updateJsonlById } from '../fs.mjs';

describe('lib/fs.mjs', () => {
  describe('findProjectRoot()', () => {
    it('从 lib/ 向上找到项目根 (.git 或 .claude)', () => {
      const root = findProjectRoot(process.cwd());
      assert.ok(root.includes('YrY') || root.endsWith('YrY'),
        'must reach project root');
    });

    it('找到的项目根包含 package.json', () => {
      const root = findProjectRoot(process.cwd());
      assert.ok(existsSync(join(root, 'package.json')), 'root must have package.json');
    });

    it('找到的项目根包含 lib/ 目录', () => {
      const root = findProjectRoot(process.cwd());
      assert.ok(existsSync(join(root, 'lib')), 'root must have lib/ directory');
    });
  });

  describe('readProjectName()', () => {
    it('从 CLAUDE.md 读取项目名', () => {
      const root = findProjectRoot(process.cwd());
      const name = readProjectName(root);
      assert.equal(typeof name, 'string');
      assert.ok(name.length > 0, 'project name must be non-empty');
    });
  });

  describe('nowISO()', () => {
    it('返回 ISO 8601 格式时间戳', () => {
      const iso = nowISO();
      assert.match(iso, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('nowDate()', () => {
    it('返回 YYYY-MM-DD 格式日期', () => {
      const date = nowDate();
      assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('fmtDisplay()', () => {
    it('转换 ISO 为显示格式', () => {
      const result = fmtDisplay('2026-06-22T10:30:00.000Z');
      assert.equal(result, '2026-06-22 10:30:00');
    });

    it('截断到 19 字符', () => {
      const result = fmtDisplay('2026-06-22T10:30:00.123Z');
      assert.equal(result.length, 19);
    });
  });

  describe('fmtDate()', () => {
    it('格式化 Date 对象为 YYYY-MM-DD', () => {
      const d = new Date('2026-06-22T10:30:00Z');
      assert.equal(fmtDate(d), '2026-06-22');
    });
  });

  describe('escHtml()', () => {
    it('转义 & 字符', () => {
      assert.equal(escHtml('a & b'), 'a &amp; b');
    });

    it('转义 < 和 >', () => {
      assert.equal(escHtml('<script>'), '&lt;script&gt;');
    });

    it('转义双引号', () => {
      assert.equal(escHtml('"hello"'), '&quot;hello&quot;');
    });

    it('安全文本不修改', () => {
      assert.equal(escHtml('hello world'), 'hello world');
    });

    it('非字符串转为字符串', () => {
      assert.equal(escHtml(123), '123');
    });
  });

  describe('isMain()', () => {
    it('测试文件中返回 false (由 vitest 加载)', () => {
      assert.equal(isMain(import.meta.url), false);
    });
  });

  describe('writeJson() / readJson()', () => {
    /** @type {string} */
    let tmpDir;
    /** @type {string} */
    let jsonPath;

    beforeAll(() => {
      tmpDir = mkdtempSync(join(tmpdir(), 'yry-fs-test-'));
      jsonPath = join(tmpDir, 'test.json');
    });

    afterAll(() => {
      rmSync(tmpDir, { recursive: true, force: true });
    });

    it('writeJson 写入并 readJson 读取', () => {
      writeJson(jsonPath, { a: 1, b: [2, 3] });
      assert.ok(existsSync(jsonPath), 'file must exist after write');
      const data = readJson(jsonPath);
      assert.deepEqual(data, { a: 1, b: [2, 3] });
    });

    it('readJson 不存在文件返回 null', () => {
      assert.equal(readJson(join(tmpDir, 'nonexistent.json')), null);
    });

    it('writeJson 覆盖已有文件', () => {
      writeJson(jsonPath, { version: 1 });
      writeJson(jsonPath, { version: 2 });
      const data = readJson(jsonPath);
      assert.equal(data.version, 2);
    });
  });

  describe('readJsonl()', () => {
    /** @type {string} */
    let tmpDir;
    /** @type {string} */
    let jsonlPath;

    beforeAll(() => {
      tmpDir = mkdtempSync(join(tmpdir(), 'yry-fs-test-'));
      jsonlPath = join(tmpDir, 'test.jsonl');
    });

    afterAll(() => {
      rmSync(tmpDir, { recursive: true, force: true });
    });

    it('读取 JSONL 文件为对象数组', () => {
      writeFileSync(jsonlPath, '{"id":1}\n{"id":2}\n{"id":3}\n', 'utf-8');
      const data = readJsonl(jsonlPath);
      assert.equal(data.length, 3);
      assert.deepEqual(data[0], { id: 1 });
    });

    it('不存在文件返回空数组', () => {
      assert.deepEqual(readJsonl(join(tmpDir, 'nonexistent.jsonl')), []);
    });

    it('空文件返回空数组', () => {
      const emptyPath = join(tmpDir, 'empty.jsonl');
      writeFileSync(emptyPath, '', 'utf-8');
      assert.deepEqual(readJsonl(emptyPath), []);
    });

    it('无效 JSON 行被过滤', () => {
      writeFileSync(jsonlPath, '{"id":1}\ninvalid\n{"id":2}\n', 'utf-8');
      const data = readJsonl(jsonlPath);
      assert.equal(data.length, 2);
    });
  });

  describe('updateJsonlById()', () => {
    /** @type {string} */
    let tmpDir;
    /** @type {string} */
    let jsonlPath;

    beforeAll(() => {
      tmpDir = mkdtempSync(join(tmpdir(), 'yry-fs-test-'));
      jsonlPath = join(tmpDir, 'test.jsonl');
    });

    afterAll(() => {
      rmSync(tmpDir, { recursive: true, force: true });
    });

    it('按 id 更新匹配记录', () => {
      writeFileSync(jsonlPath, '{"id":"a","val":1}\n{"id":"b","val":2}\n', 'utf-8');
      const updated = updateJsonlById(jsonlPath, 'a', (/** @type {any} */ rec) => { rec.val = 99; });
      assert.ok(updated, 'must return true on success');
      const data = readJsonl(jsonlPath);
      const a = data.find(r => r.id === 'a');
      assert.equal(a.val, 99);
      const b = data.find(r => r.id === 'b');
      assert.equal(b.val, 2, 'unmatched record must not change');
    });

    it('不存在的文件返回 false', () => {
      assert.equal(updateJsonlById(join(tmpDir, 'nope.jsonl'), 'x', () => {}), false);
    });
  });
});

await run();
