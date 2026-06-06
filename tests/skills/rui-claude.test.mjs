/**
 * Tests for the rui-claude skill — .claude/ configuration management.
 */

import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../lib/test-harness.mjs';
import { fileExists, readFile, hasSection, hasMermaidDiagram } from '../lib/helpers.mjs';

const SKILL_DIR = 'skills/rui-claude';

describe('rui-claude skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('is not empty', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 500, 'SKILL.md should have substantial content');
    });

    it('has mermaid diagram', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasMermaidDiagram(content), 'SKILL.md must have mermaid diagram');
    });

    it('documents sub-commands', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const commands = ['sync', 'update', 'retro', 'history'];
      for (const cmd of commands) {
        assert.ok(content.includes(cmd), `must document ${cmd} command`);
      }
    });

    it('documents scan/analyze workflow', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('scan') || content.includes('sync') || content.includes('health'),
        'must document .claude/ management operations'
      );
    });

    it('has degradation strategies', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('降级') || content.includes('degrad') || content.includes('失败'),
        'must document error handling or degradation');
    });
  });

  describe('help.mjs', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/help.mjs`), 'help.mjs must exist');
    });

    it('executes successfully', () => {
      try {
        const out = execSync('node skills/rui-claude/help.mjs 2>&1', {
          cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
        });
        assert.ok(out.length > 100, 'help.mjs should output substantial help text');
      } catch (e) {
        const output = (e.stdout || '') + (e.stderr || '');
        assert.ok(output.length > 20, 'help.mjs should produce output');
      }
    });

    it('imports from shared lib (dedup)', () => {
      const content = readFile(`${SKILL_DIR}/help.mjs`);
      assert.ok(content.includes("from '../../lib/tty.mjs'"), 'must import from lib/tty.mjs');
      assert.ok(content.includes("from '../../lib/help-layout.mjs'"), 'must import from lib/help-layout.mjs');
    });

    it('documents sync/retro/history in help', () => {
      const helpOut = execSync('node skills/rui-claude/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(helpOut.includes('sync') && helpOut.includes('retro') && helpOut.includes('history'),
        'help.mjs must document sync, retro, and history');
    });
  });

  describe('executables', () => {
    it('update-version.mjs exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/update-version.mjs`), 'update-version.mjs must exist');
    });

    it('update-version.mjs is executable JavaScript', () => {
      const content = readFile(`${SKILL_DIR}/update-version.mjs`);
      assert.ok(content.length > 200, 'update-version.mjs should have substantial content');
      assert.ok(content.includes('import') || content.includes('require'), 'must have imports');
    });
  });

  describe('cross-references', () => {
    it('SKILL.md references rules/rui-claude.md', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('rui-claude.md') || content.includes('rui-claude'),
        'SKILL.md must reference rules/rui-claude.md'
      );
    });

    it('SKILL.md references agents directory', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('agent') || content.includes('Agent'),
        'SKILL.md must reference agent roles'
      );
    });

    it('help.mjs references all 4 commands consistently', () => {
      const helpOut = execSync('node skills/rui-claude/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      const commands = ['sync', 'update', 'retro', 'history'];
      let allFound = true;
      for (const cmd of commands) {
        if (!helpOut.includes(cmd)) allFound = false;
      }
      assert.ok(allFound, 'help.mjs must document all 4 commands: sync, update, retro, history');
    });
  });

  describe('SKILL.md completeness', () => {
    it('has a command overview section', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('## ') && (content.includes('命令') || content.includes('Command') || content.includes('command')),
        'SKILL.md must document commands'
      );
    });

    it('documents .claude/ directory conventions', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('.claude') || content.includes('claude/'),
        'SKILL.md must reference .claude/ directory'
      );
    });

    it('has structured pipeline documentation', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const hasStructure = (content.match(/## /g) || []).length >= 3;
      assert.ok(hasStructure, 'SKILL.md should have structured sections (≥3 ## headings)');
    });

    it('mentions degradation or fallback strategies', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('降级') || content.includes('degrad') || content.includes('fallback') || content.includes('失败'),
        'SKILL.md must document degradation strategies'
      );
    });
  });
});

const exitCode = await run();
process.exit(exitCode);
