/**
 * Tests for the rui-claude skill — .claude/ configuration management.
 */

import { describe, it, assert, run } from '../lib/test-harness.mjs';
import { fileExists, readFile, hasSection } from '../lib/helpers.mjs';

const SKILL_DIR = 'skills/rui-claude';

describe('rui-claude skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('is not empty', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 200, 'SKILL.md should have content');
    });

    it('documents scan/analyze operations', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('scan') || content.includes('sync') || content.includes('health') || content.includes('.claude'),
        'must document .claude/ management operations'
      );
    });
  });

  describe('executables', () => {
    it('help.mjs exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/help.mjs`), 'help.mjs must exist');
    });
  });
});

const exitCode = await run();
process.exit(exitCode);
