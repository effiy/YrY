/**
 * Tests for all rule definitions.
 */
import { describe, it, assert } from '../lib/test-harness.mjs';
import { fileExists, readFile } from '../lib/helpers.mjs';

const RULES_DIR = 'rules';
const RULE_FILES = [{{RULE_FILE_LIST}}];

describe('rules', () => {
  for (const ruleFile of RULE_FILES) {
    describe(ruleFile, () => {
      it('exists', () => { assert.ok(fileExists(`${RULES_DIR}/${ruleFile}`), `${ruleFile} must exist`); });
      it('has iron law section', () => { assert.ok(readFile(`${RULES_DIR}/${ruleFile}`).includes('铁律'), `${ruleFile} must have iron law`); });
    });
  }
});
