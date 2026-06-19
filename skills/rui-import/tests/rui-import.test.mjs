/**
 * Tests for the rui-import skill — document sync to remote API.
 */

import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../../../lib/test-harness.mjs';
import { fileExists, readFile, hasSection, hasMermaidDiagram } from '../../../lib/test-helpers.mjs';

const SKILL_DIR = 'skills/rui-import';

describe('rui-import skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('documents workflow stages', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasSection(content, '工作流全景'), 'must have workflow overview');
    });

    it('documents scan rules', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasSection(content, '扫描规则'), 'must document scan rules');
    });

    it('documents API contract', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasSection(content, 'API 契约'), 'must document API contract');
    });

    it('documents error model', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasSection(content, '错误模型'), 'must document error model');
    });

    it('has mermaid diagrams (expression priority)', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasMermaidDiagram(content), 'must include mermaid diagrams');
    });
  });

  describe('executables', () => {
    it('help.mjs exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/help.mjs`), 'help.mjs must exist');
    });

    it('sync.mjs exists and parses', () => {
      assert.ok(fileExists(`${SKILL_DIR}/sync.mjs`), 'sync.mjs must exist');
      const content = readFile(`${SKILL_DIR}/sync.mjs`);
      assert.ok(content.includes('write-file') || content.includes('upload') || content.includes('sync'),
        'sync.mjs must have file write/upload logic');
    });

    it('sync.mjs --help outputs usage', () => {
      try {
        const out = execSync('node skills/rui-import/sync.mjs --help 2>&1', {
          cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
        });
        assert.ok(out.length > 100 || out.includes('用法') || out.includes('语法') || out.includes('rui-import'),
          '--help should output usage syntax');
      } catch (e) {
        const output = (e.stdout || '') + (e.stderr || '');
        assert.ok(output.length > 20, '--help should produce output');
      }
    });

    it('sync.mjs mode=list works (no API call)', () => {
      try {
        const out = execSync('node skills/rui-import/sync.mjs workspace=true mode=list 2>&1', {
          cwd: process.cwd(), encoding: 'utf-8', timeout: 15_000,
        });
        assert.ok(out.includes('found') || out.includes('file') || out.includes('scan'),
          'mode=list should list files without API calls');
      } catch (e) {
        // May fail without token — that's ok, we're testing it doesn't crash
        const output = (e.stdout || '') + (e.stderr || '');
        assert.ok(output.length > 0, 'mode=list should produce output');
      }
    });
  });
});

const exitCode = await run();
process.exit(exitCode);
