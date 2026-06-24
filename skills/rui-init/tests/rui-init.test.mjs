/**
 * Tests for the rui-init skill — project initialization.
 */
import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../../../lib/vitest-adapter.mjs';
import { fileExists, readFile, hasMermaidDiagram, parseFrontmatter } from '../../../lib/test-helpers.mjs';

const SKILL_DIR = 'skills/rui-init';

describe('rui-init skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('has valid frontmatter', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const fm = parseFrontmatter(content);
      assert.ok(fm, 'SKILL.md must have frontmatter');
      assert.ok(fm.name === 'rui-init', 'frontmatter name must be rui-init');
    });

    it('has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 1000, 'SKILL.md should have substantial content');
    });

    it('has mermaid diagram', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasMermaidDiagram(content), 'SKILL.md must have mermaid diagram');
    });

    it('documents six phases', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const phases = ['detect', 'explore', 'generate', 'arch', 'setup', 'verify'];
      for (const phase of phases) {
        assert.ok(content.includes(phase), `must document ${phase} phase`);
      }
    });

    it('documents project type detection', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const types = ['frontend', 'backend', 'fullstack', 'meta'];
      let found = false;
      for (const t of types) {
        if (content.includes(t)) found = true;
      }
      assert.ok(found, 'must document project type detection');
    });

    it('documents CLAUDE.md rui markers', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('rui:project-start') || content.includes('rui:project-end'),
        'must document rui marker sections in CLAUDE.md'
      );
    });

    it('documents idempotent re-run', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('可重复') || content.includes('全量重生') || content.includes('覆盖'),
        'must document idempotent re-run capability'
      );
    });

    it('has structured sections', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const headings = (content.match(/^## /gm) || []);
      assert.ok(headings.length >= 6, `SKILL.md should have ≥6 sections, got ${headings.length}`);
    });
  });

  describe('AGENTS.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/AGENTS.md`), 'AGENTS.md must exist');
    });

    it('has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/AGENTS.md`);
      assert.ok(content.length > 100, 'AGENTS.md should have substantial content');
    });
  });

  describe('help.mjs', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/help.mjs`), 'help.mjs must exist');
    });

    it('executes successfully', () => {
      const out = execSync('node skills/rui-init/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.length > 50, 'help.mjs should output help text');
    });
  });

  describe('rules', () => {
    it('has rules/init-pipeline.md', () => {
      assert.ok(fileExists(`${SKILL_DIR}/rules/init-pipeline.md`), 'rules/init-pipeline.md must exist');
    });

    it('init-pipeline.md has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/rules/init-pipeline.md`);
      assert.ok(content.length > 300, 'init-pipeline.md should have substantial content');
    });
  });

  describe('single responsibility', () => {
    it('SKILL.md focuses on project initialization', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const initTerms = (content.match(/init|初始化|项目|project|profile/g) || []);
      assert.ok(initTerms.length >= 5, 'SKILL.md must focus on project initialization');
    });
  });
describe('edge cases', () => {
    it('SKILL.md documents security surface detection', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('安全') || content.includes('security'),
        'must document security surface detection'
      );
    });

    it('SKILL.md documents idempotent re-run', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('可重复') || content.includes('全量重生') || content.includes('idempotent'),
        'must document idempotent re-run'
      );
    });
  });
});

const exitCode = await run();
