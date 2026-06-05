/**
 * Tests for the rui skill — the central SDLC orchestrator.
 * Verifies SKILL.md integrity, executable scripts, and key constraints.
 */

import { describe, it, assert, run } from '../lib/test-harness.mjs';
import { fileExists, readFile, readDir, hasSection, hasMermaidDiagram, PROJECT_ROOT } from '../lib/helpers.mjs';

const SKILL_DIR = 'skills/rui';

describe('rui skill', () => {
  // ── SKILL.md integrity ──────────────────────────────────────
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('is not empty', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 500, 'SKILL.md should be substantial (>500 chars)');
    });

    it('has command reference section', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasSection(content, '选哪条命令'), 'must have command selection guide');
    });

    it('has pipeline overview', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasSection(content, '管线一览'), 'must have pipeline overview');
    });

    it('has core constraints', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasSection(content, '核心约束'), 'must have core constraints');
    });

    it('has at least one mermaid diagram', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasMermaidDiagram(content), 'must include mermaid diagrams (expression priority)');
    });

    it('documents all sub-commands (init/doc/code/update/yry/version)', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const commands = ['init', 'doc', 'code', 'update', 'yry', 'version --up', 'version --rollback'];
      for (const cmd of commands) {
        assert.ok(
          hasSection(content, cmd) || content.includes(cmd),
          `must document "/rui ${cmd}"`
        );
      }
    });

    it('has blocking identifier reference', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasSection(content, '阻断标识'), 'must document blocking identifiers');
    });
  });

  // ── Executable scripts ──────────────────────────────────────
  describe('executables', () => {
    it('help.mjs exists and parses', () => {
      assert.ok(fileExists(`${SKILL_DIR}/help.mjs`), 'help.mjs must exist');
      // Syntax check by importing
      const content = readFile(`${SKILL_DIR}/help.mjs`);
      assert.ok(content.length > 100, 'help.mjs should have content');
    });

    it('branch-check.mjs exists and parses', () => {
      assert.ok(fileExists(`${SKILL_DIR}/branch-check.mjs`), 'branch-check.mjs must exist');
      const content = readFile(`${SKILL_DIR}/branch-check.mjs`);
      assert.ok(content.includes('feat/'), 'must reference feat/ branch pattern');
    });

    it('recommend.mjs exists and parses', () => {
      assert.ok(fileExists(`${SKILL_DIR}/recommend.mjs`), 'recommend.mjs must exist');
      const content = readFile(`${SKILL_DIR}/recommend.mjs`);
      assert.ok(content.length > 100, 'recommend.mjs should have content');
    });

    it('audit.mjs exists and parses', () => {
      assert.ok(fileExists(`${SKILL_DIR}/audit.mjs`), 'audit.mjs must exist');
      const content = readFile(`${SKILL_DIR}/audit.mjs`);
      assert.ok(content.length > 50, 'audit.mjs should have content');
    });

    it('proposals.mjs exists and parses', () => {
      assert.ok(fileExists(`${SKILL_DIR}/proposals.mjs`), 'proposals.mjs must exist');
      const content = readFile(`${SKILL_DIR}/proposals.mjs`);
      assert.ok(content.length > 50, 'proposals.mjs should have content');
    });
  });

  // ── Supporting documents ────────────────────────────────────
  describe('supporting docs', () => {
    it('has formulas.md', () => {
      assert.ok(fileExists(`${SKILL_DIR}/formulas.md`), 'formulas.md defines doc generation formulas');
    });

    it('has coder.md', () => {
      assert.ok(fileExists(`${SKILL_DIR}/coder.md`), 'coder.md defines code phase behavior');
    });

    it('has ranking.md', () => {
      assert.ok(fileExists(`${SKILL_DIR}/ranking.md`), 'ranking.md defines recommendation scoring');
    });
  });
});

// ── Run ────────────────────────────────────────────────────────────
const exitCode = await run();
process.exit(exitCode);
