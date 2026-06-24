/**
 * Tests for the rui-update skill — incremental story updates.
 */
import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../../../lib/vitest-adapter.mjs';
import { fileExists, readFile, hasMermaidDiagram, parseFrontmatter, hasSection } from '../../../lib/test-helpers.mjs';

const SKILL_DIR = 'skills/rui-update';

describe('rui-update skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 1000, 'SKILL.md should have substantial content');
    });

    it('has valid frontmatter', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const fm = parseFrontmatter(content);
      assert.ok(fm, 'SKILL.md must have frontmatter');
      assert.ok(fm.name === 'rui-update', 'frontmatter name must be rui-update');
      assert.ok(fm.description, 'frontmatter must have description');
    });

    it('has mermaid diagram', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasMermaidDiagram(content), 'SKILL.md must have mermaid diagram');
    });

    it('documents T1/T2/T3 levels', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('T1') && content.includes('T2') && content.includes('T3'),
        'must document all three update levels');
    });

    it('documents T1 execution flow', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasSection(content, 'T1'), 'must document T1 execution flow');
    });

    it('documents T2 execution flow', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasSection(content, 'T2'), 'must document T2 execution flow');
    });

    it('documents T3 execution flow', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasSection(content, 'T3'), 'must document T3 execution flow');
    });

    it('documents auto-determination logic', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('判定') || content.includes('determin'),
        'must document T1/T2/T3 auto-determination logic'
      );
    });

    it('documents branch isolation gate', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('分支隔离') || content.includes('feat/'),
        'must document branch isolation requirement');
    });

    it('documents --no-code flag', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('--no-code'), 'must document --no-code flag');
    });

    it('documents degradation strategy', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('降级') || content.includes('degrad'),
        'must document degradation strategy'
      );
    });

    it('has structured sections', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const headings = (content.match(/^## /gm) || []);
      assert.ok(headings.length >= 5, `SKILL.md should have ≥5 sections, got ${headings.length}`);
    });
  });

  describe('AGENTS.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/AGENTS.md`), 'AGENTS.md must exist');
    });

    it('documents pm role', () => {
      const content = readFile(`${SKILL_DIR}/AGENTS.md`);
      assert.ok(content.includes('pm'), 'must document pm agent role');
    });

    it('documents coder role', () => {
      const content = readFile(`${SKILL_DIR}/AGENTS.md`);
      assert.ok(content.includes('coder'), 'must document coder agent role');
    });

    it('documents tester role', () => {
      const content = readFile(`${SKILL_DIR}/AGENTS.md`);
      assert.ok(content.includes('tester'), 'must document tester agent role');
    });
  });

  describe('help.mjs', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/help.mjs`), 'help.mjs must exist');
    });

    it('executes successfully', () => {
      const out = execSync('node skills/rui-update/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.length > 100, 'help.mjs should output substantial help text');
    });

    it('documents T1/T2/T3 in help', () => {
      const out = execSync('node skills/rui-update/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.includes('T1') && out.includes('T2') && out.includes('T3'),
        'help.mjs must document T1/T2/T3 levels');
    });

    it('documents --no-code flag in help', () => {
      const out = execSync('node skills/rui-update/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.includes('--no-code'), 'help.mjs must document --no-code flag');
    });

    it('imports from shared lib (dedup)', () => {
      const content = readFile(`${SKILL_DIR}/help.mjs`);
      assert.ok(content.includes("from '../../lib/tty.mjs'"), 'must import from lib/tty.mjs');
      assert.ok(content.includes("from '../../lib/help-layout.mjs'"), 'must import from lib/help-layout.mjs');
    });
  });

  describe('rules', () => {
    it('has rules/update-pipeline.md', () => {
      assert.ok(fileExists(`${SKILL_DIR}/rules/update-pipeline.md`), 'rules/update-pipeline.md must exist');
    });

    it('update-pipeline.md has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/rules/update-pipeline.md`);
      assert.ok(content.length > 300, 'update-pipeline.md should have substantial content');
    });
  });

  describe('single responsibility', () => {
    it('SKILL.md focuses on incremental update pipeline', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        (content.match(/更新|update|增量|incremental/g) || []).length >= 5,
        'SKILL.md must focus on incremental update'
      );
    });

    it('SKILL.md references branch isolation (shared concern)', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('分支隔离') || content.includes('branch'),
        'must reference branch isolation as shared concern'
      );
    });
  });
});

const exitCode = await run();
