/**
 * Tests for the rui-trends skill — technology trends discovery.
 */

import { describe, it, assert, run } from '../lib/test-harness.mjs';
import { fileExists, readFile } from '../lib/helpers.mjs';

const SKILL_DIR = 'skills/rui-trends';

describe('rui-trends skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('is not empty', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 200, 'SKILL.md should have content');
    });

    it('references data sources (GitHub/OSS Insight/TrendShift)', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const hasSource = content.includes('GitHub') || content.includes('OSS Insight') ||
        content.includes('TrendShift') || content.includes('trend');
      assert.ok(hasSource, 'must reference technology trend data sources');
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
