/**
 * Tests for the {{SKILL_NAME}} skill — {{SKILL_DESC}}.
 */
import { describe, it, assert } from '../lib/test-harness.mjs';
import { fileExists, readFile, hasSection } from '../lib/helpers.mjs';

const SKILL_DIR = 'skills/{{SKILL_DIR}}';

describe('{{SKILL_NAME}} skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => { assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist'); });
    it('is not empty', () => { assert.ok(readFile(`${SKILL_DIR}/SKILL.md`).length > 500, 'SKILL.md should be substantial'); });
    it('has command reference', () => { assert.ok(hasSection(readFile(`${SKILL_DIR}/SKILL.md`), '{{COMMAND_SECTION}}'), 'must have command section'); });
    it('has pipeline overview', () => { assert.ok(hasSection(readFile(`${SKILL_DIR}/SKILL.md`), '{{PIPELINE_SECTION}}'), 'must have pipeline overview'); });
    {{EXTRA_SKILL_TESTS}}
  });
  describe('executables', () => {
    it('help.mjs exists', () => { assert.ok(fileExists(`${SKILL_DIR}/help.mjs`), 'help.mjs must exist'); });
    {{EXTRA_EXEC_TESTS}}
  });
});
