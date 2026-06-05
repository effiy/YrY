/**
 * Tests for all agent definitions.
 */
import { describe, it, assert } from '../lib/test-harness.mjs';
import { fileExists, readFile } from '../lib/helpers.mjs';

const AGENTS_DIR = 'agents';
const AGENT_FILES = [{{AGENT_FILE_LIST}}];

describe('agents', () => {
  for (const agentFile of AGENT_FILES) {
    describe(agentFile, () => {
      it('exists', () => { assert.ok(fileExists(`${AGENTS_DIR}/${agentFile}`), `${agentFile} must exist`); });
      it('has decision loop', () => { assert.ok(readFile(`${AGENTS_DIR}/${agentFile}`).includes('决策'), `${agentFile} must have decision loop`); });
      it('has red flags', () => { assert.ok(readFile(`${AGENTS_DIR}/${agentFile}`).includes('Red Flags'), `${agentFile} must have Red Flags`); });
    });
  }
});
