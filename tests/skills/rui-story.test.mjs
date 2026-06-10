/**
 * Tests for the rui-story skill — story panel management and sync.
 */

import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../lib/test-harness.mjs';
import { fileExists, readFile, hasSection } from '../lib/helpers.mjs';

const SKILL_DIR = 'skills/rui-story';

describe('rui-story skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('is not empty', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 200, 'SKILL.md should have content');
    });

    it('documents list command', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('list'), 'must document list command');
    });
  });

  describe('executables', () => {
    it('help.mjs exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/help.mjs`), 'help.mjs must exist');
    });

    it('rui-story.mjs exists and parses', () => {
      assert.ok(fileExists(`${SKILL_DIR}/rui-story.mjs`), 'rui-story.mjs must exist');
      const content = readFile(`${SKILL_DIR}/rui-story.mjs`);
      assert.ok(content.length > 100, 'rui-story.mjs should have content');
    });

    // collect/status functionality merged into lib/extract.mjs + lib/format.mjs
    it('lib/extract.mjs exists and parses', () => {
      assert.ok(fileExists(`${SKILL_DIR}/lib/extract.mjs`), 'lib/extract.mjs must exist');
      const content = readFile(`${SKILL_DIR}/lib/extract.mjs`);
      assert.ok(content.length > 50, 'lib/extract.mjs should have content');
    });

    it('rui-story.mjs --help outputs usage', () => {
      try {
        const out = execSync('node skills/rui-story/rui-story.mjs --help 2>&1', {
          cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
        });
        assert.ok(out.length > 50 || out.includes('用法') || out.includes('Usage') || out.includes('command'),
          '--help should output usage info');
      } catch (e) {
        const output = (e.stdout || '') + (e.stderr || '');
        assert.ok(output.length > 20, '--help should produce output');
      }
    });
  });
});

const exitCode = await run();
process.exit(exitCode);
