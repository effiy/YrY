/**
 * Tests for the rui-code skill — source code implementation pipeline.
 */
import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../../../lib/vitest-adapter.mjs';
import { fileExists, readFile, hasMermaidDiagram, parseFrontmatter } from '../../../lib/test-helpers.mjs';

const SKILL_DIR = 'skills/rui-code';

describe('rui-code skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('has valid frontmatter', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const fm = parseFrontmatter(content);
      assert.ok(fm, 'SKILL.md must have frontmatter');
      assert.ok(fm.name === 'rui-code', 'frontmatter name must be rui-code');
    });

    it('has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 1000, 'SKILL.md should have substantial content');
    });

    it('has mermaid diagram', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasMermaidDiagram(content), 'SKILL.md must have mermaid diagram');
    });

    it('documents Gate A', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('Gate A'), 'must document Gate A');
    });

    it('documents Gate B', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('Gate B'), 'must document Gate B');
    });

    it('documents per-module P0 clearing', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('P0'), 'must document P0 clearing');
    });

    it('documents branch isolation gate', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('分支隔离') || content.includes('branch-check'),
        'must document branch isolation gate'
      );
    });

    it('documents --from-doc mode', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('--from-doc'), 'must document --from-doc mode');
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
      const out = execSync('node skills/rui-code/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.length > 50, 'help.mjs should output help text');
    });
  });

  describe('rules', () => {
    it('has code-pipeline.md', () => {
      assert.ok(fileExists(`${SKILL_DIR}/rules/code-pipeline.md`), 'rules/code-pipeline.md must exist');
    });

    it('has code-paradigm.md', () => {
      assert.ok(fileExists(`${SKILL_DIR}/rules/code-paradigm.md`), 'rules/code-paradigm.md must exist');
    });

    it('code-pipeline.md has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/rules/code-pipeline.md`);
      assert.ok(content.length > 500, 'code-pipeline.md should have substantial content');
    });
  });

  describe('single responsibility', () => {
    it('SKILL.md is sole entry point for code changes', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('唯一入口') || content.includes('sole entry'),
        'SKILL.md must declare itself as sole code change entry point'
      );
    });
  });
});


  describe('edge cases', () => {
    it('SKILL.md documents Gate A/B flow', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('Gate A') && content.includes('Gate B'), 'must document both gates');
    });

    it('SKILL.md documents per-module P0 clearing', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('逐模块') || content.includes('per-module'), 'must document per-module approach');
    });
  });
const _exitCode = await run();
