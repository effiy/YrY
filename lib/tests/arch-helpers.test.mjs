/**
 * Tests for lib/arch-helpers.mjs — verifies shared architecture helper
 * functions return sensible values.
 */

import { describe, it, assert, run } from '../test-harness.mjs';

import { countFiles, fileLineCount, readFrontmatter } from '../arch-helpers.mjs';

describe('lib/arch-helpers.mjs', () => {
  describe('countFiles()', () => {
    it('lib/ 中 .mjs 文件计数 > 0', () => {
      const count = countFiles('lib', '*.mjs');
      assert.ok(Number.isInteger(count), 'must return integer');
      assert.ok(count >= 20, 'lib/ should have at least 20 .mjs files');
    });
  });

  describe('fileLineCount()', () => {
    it('lib/constants.mjs 行数 > 0', () => {
      const lines = fileLineCount('lib/constants.mjs');
      assert.ok(Number.isInteger(lines), 'must return integer');
      assert.ok(lines > 0, 'file must have positive line count');
    });

    it('不存在的文件返回 0', () => {
      const lines = fileLineCount('lib/nonexistent-file-xyz.mjs');
      assert.equal(lines, 0, 'nonexistent file should return 0');
    });
  });

  describe('readFrontmatter()', () => {
    it('SKILL.md 包含 frontmatter', () => {
      const fm = readFrontmatter('skills/rui/SKILL.md');
      assert.ok(fm !== null, 'SKILL.md must have frontmatter');
      assert.ok(typeof fm === 'object', 'must return object');
    });

    it('无 frontmatter 的文件返回 null', () => {
      const fm = readFrontmatter('package.json');
      assert.equal(fm, null, 'package.json should not have YAML frontmatter');
    });
  });
});

await run();
