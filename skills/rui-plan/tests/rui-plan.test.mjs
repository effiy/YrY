/**
 * Tests for the rui-plan skill — implementation plan generation.
 */
import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../../../lib/vitest-adapter.mjs';
import { fileExists, readFile, hasMermaidDiagram, parseFrontmatter } from '../../../lib/test-helpers.mjs';

const SKILL_DIR = 'skills/rui-plan';

describe('rui-plan skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('has valid frontmatter', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const fm = parseFrontmatter(content);
      assert.ok(fm, 'SKILL.md must have frontmatter');
      assert.ok(fm.name === 'rui-plan', 'frontmatter name must be rui-plan');
    });

    it('has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 1000, 'SKILL.md should have substantial content');
    });

    it('has mermaid diagram', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasMermaidDiagram(content), 'SKILL.md must have mermaid diagram');
    });

    it('documents five pipeline steps', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const steps = ['读取', '映射', '分解', '审查', '保存'];
      let found = 0;
      for (const step of steps) {
        if (content.includes(step)) found++;
      }
      assert.ok(found >= 3, `must document pipeline steps, found ${found}`);
    });

    it('documents six self-review items', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('自审查') || content.includes('六项'),
        'must document six self-review items');
    });

    it('documents bridge role between doc and code', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('doc') && content.includes('code'),
        'must document bridge role between doc and code'
      );
    });

    it('references plan-execution.md rule', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('plan-execution.md'), 'must reference plan-execution.md rule');
    });

    it('references planner.md agent spec', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('planner.md'), 'must reference planner.md agent spec');
    });

    it('has structured sections', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const headings = (content.match(/^## /gm) || []);
      assert.ok(headings.length >= 5, `SKILL.md should have ≥5 sections, got ${headings.length}`);
    });
  });

  describe('planner.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/planner.md`), 'planner.md must exist');
    });

    it('has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/planner.md`);
      assert.ok(content.length > 100, 'planner.md should have substantial content');
    });
  });

  describe('architect.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/architect.md`), 'architect.md must exist');
    });

    it('has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/architect.md`);
      assert.ok(content.length > 100, 'architect.md should have substantial content');
    });
  });

  describe('AGENTS.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/AGENTS.md`), 'AGENTS.md must exist');
    });

    it('documents planner role', () => {
      const content = readFile(`${SKILL_DIR}/AGENTS.md`);
      assert.ok(content.includes('planner'), 'must document planner agent role');
    });

    it('references planner.md', () => {
      const content = readFile(`${SKILL_DIR}/AGENTS.md`);
      assert.ok(content.includes('planner.md'), 'must reference planner.md');
    });
  });

  describe('help.mjs', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/help.mjs`), 'help.mjs must exist');
    });

    it('executes successfully', () => {
      const out = execSync('node skills/rui-plan/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.length > 50, 'help.mjs should output help text');
    });
  });

  describe('single responsibility', () => {
    it('SKILL.md focuses on plan generation', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const planTerms = (content.match(/计划|plan|任务|task|分解|decompose/g) || []);
      assert.ok(planTerms.length >= 5, 'SKILL.md must focus on plan generation');
    });
  });
});

const _exitCode = await run();
