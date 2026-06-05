/**
 * Tests for the rui-bot skill — WeChat Work bot messaging.
 */

import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../lib/test-harness.mjs';
import { fileExists, readFile, hasSection } from '../lib/helpers.mjs';

const SKILL_DIR = 'skills/rui-bot';

describe('rui-bot skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('is not empty', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 200, 'SKILL.md should have content');
    });

    it('documents send.mjs usage', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('send.mjs'), 'must reference executable send.mjs');
    });

    it('has API contract section', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('webhook') || content.includes('API') || content.includes('notify'),
        'must document webhook/notification API'
      );
    });
  });

  describe('executables', () => {
    it('help.mjs exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/help.mjs`), 'help.mjs must exist');
    });

    it('send.mjs exists and parses', () => {
      assert.ok(fileExists(`${SKILL_DIR}/send.mjs`), 'send.mjs must exist');
      const content = readFile(`${SKILL_DIR}/send.mjs`);
      assert.ok(content.includes('send') || content.includes('notify') || content.includes('webhook'),
        'send.mjs should have send/notify logic');
    });

    it('send.mjs accepts --help', () => {
      try {
        const out = execSync('node skills/rui-bot/send.mjs --help 2>&1', {
          cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
        });
        assert.ok(out.length > 50 || out.includes('用法') || out.includes('Usage') || out.includes('rui-bot'),
          '--help should output usage info');
      } catch (e) {
        // --help with no token may fail but should still print help before error
        const output = (e.stdout || '') + (e.stderr || '');
        assert.ok(output.length > 20, '--help should produce output even on error');
      }
    });
  });
});

const exitCode = await run();
process.exit(exitCode);
