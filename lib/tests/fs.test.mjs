/**
 * Tests for lib/fs.mjs — verifies file system helpers and project root
 * discovery work as expected.
 */

import { describe, it, assert, run } from '../test-harness.mjs';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { findProjectRoot, readProjectName } from '../fs.mjs';

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
});

await run();
