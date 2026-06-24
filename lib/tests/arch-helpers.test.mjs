/**
 * Tests for readFrontmatter — verifies shared architecture helper
 * functions return sensible values.
 */

import { describe, it, assert, run } from '../vitest-adapter.mjs';

import { readFrontmatter } from '../arch-dimensions/solid.mjs';

describe('lib/arch-dimensions/solid.mjs — readFrontmatter()', () => {
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
