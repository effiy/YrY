/**
 * Tests for the rui-yry skill — autonomous self-improvement loop.
 */
import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../../../lib/vitest-adapter.mjs';
import { fileExists, readFile, hasMermaidDiagram, parseFrontmatter } from '../../../lib/test-helpers.mjs';

const SKILL_DIR = 'skills/rui-yry';

describe('rui-yry skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('has valid frontmatter', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const fm = parseFrontmatter(content);
      assert.ok(fm, 'SKILL.md must have frontmatter');
      assert.ok(fm.name === 'rui-yry', 'frontmatter name must be rui-yry');
    });

    it('has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 1000, 'SKILL.md should have substantial content');
    });

    it('has mermaid diagram', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasMermaidDiagram(content), 'SKILL.md must have mermaid diagram');
    });

    it('documents D0-D8 diagnostics', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      for (let i = 0; i <= 8; i++) {
        assert.ok(content.includes(`D${i}`), `must document D${i} diagnostic`);
      }
    });

    it('documents E1-E4 evaluation', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const evaluations = ['E1', 'E2', 'E3', 'E4'];
      for (const e of evaluations) {
        assert.ok(content.includes(e), `must document ${e} evaluation`);
      }
    });

    it('documents sub-skill delegation', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const skills = ['rui-story', 'rui-doc', 'rui-code', 'rui-version'];
      let found = 0;
      for (const s of skills) {
        if (content.includes(s)) found++;
      }
      assert.ok(found >= 3, `must document sub-skill delegation, found ${found}`);
    });

    it('documents --depth parameter', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('--depth'), 'must document --depth parameter');
    });

    it('documents termination conditions', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('终止') || content.includes('terminat'),
        'must document termination conditions'
      );
    });

    it('documents auto-merge and auto-split', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('合并') || content.includes('merge') || content.includes('拆分') || content.includes('split'),
        'must document auto-merge and auto-split'
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

  describe('self-improve.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/self-improve.md`), 'self-improve.md must exist');
    });

    it('has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/self-improve.md`);
      assert.ok(content.length > 200, 'self-improve.md should have substantial content');
    });
  });

  describe('rules', () => {
    it('has self-improve.md rule', () => {
      assert.ok(fileExists(`${SKILL_DIR}/rules/self-improve.md`), 'rules/self-improve.md must exist');
    });

    it('self-improve.md rule has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/rules/self-improve.md`);
      assert.ok(content.length > 500, 'rules/self-improve.md should have substantial content');
    });
  });

  describe('help.mjs', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/help.mjs`), 'help.mjs must exist');
    });

    it('executes successfully', () => {
      const out = execSync('node skills/rui-yry/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.length > 50, 'help.mjs should output help text');
    });
  });

  describe('single responsibility', () => {
    it('SKILL.md is an orchestrator that delegates to sub-skills', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('委托') || content.includes('delegat') || content.includes('编排'),
        'SKILL.md must declare itself as orchestrator delegating to sub-skills'
      );
    });
  });
});

const _exitCode = await run();
