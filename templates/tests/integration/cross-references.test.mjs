/**
 * Integration test — cross-cutting consistency checks.
 */
import { describe, it, assert } from '../lib/test-harness.mjs';
import { fileExists, readFile, readDir, PROJECT_ROOT } from '../lib/helpers.mjs';

describe('cross-references', () => {
  it('CLAUDE.md references all agents', () => {
    const claude = readFile('CLAUDE.md');
    const agents = readDir('agents').filter(f => f.endsWith('.md'));
    for (const a of agents) assert.ok(claude.includes(a), `CLAUDE.md must reference ${a}`);
  });
  it('CLAUDE.md references all rules', () => {
    const claude = readFile('CLAUDE.md');
    const rules = readDir('rules').filter(f => f.endsWith('.md'));
    for (const r of rules) assert.ok(claude.includes(r), `CLAUDE.md must reference ${r}`);
  });
  {{EXTRA_CROSS_TESTS}}
});
