/**
 * Tests for the rui-reporter skill — process reporting and knowledge curation.
 */
import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../../../lib/vitest-adapter.mjs';
import { fileExists, readFile, hasMermaidDiagram, parseFrontmatter } from '../../../lib/test-helpers.mjs';

const SKILL_DIR = 'skills/rui-reporter';

describe('rui-reporter skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('has valid frontmatter', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const fm = parseFrontmatter(content);
      assert.ok(fm, 'SKILL.md must have frontmatter');
      assert.ok(fm.name === 'rui-reporter', 'frontmatter name must be rui-reporter');
    });

    it('has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 1000, 'SKILL.md should have substantial content');
    });

    it('has mermaid diagram', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasMermaidDiagram(content), 'SKILL.md must have mermaid diagram');
    });

    it('documents all sub-commands', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const commands = ['--story', 'knowledge-graph', 'metrics-history', 'delivery-summary'];
      for (const cmd of commands) {
        assert.ok(content.includes(cmd), `must document ${cmd} command`);
      }
    });

    it('documents knowledge graph consistency check', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('知识图谱') || content.includes('knowledge-graph'),
        'must document knowledge graph consistency check'
      );
    });

    it('documents the four review dimensions', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const dims = ['Accuracy', 'Completeness', 'Traceability', 'Consistency'];
      for (const dim of dims) {
        assert.ok(content.includes(dim), `must document ${dim} review dimension`);
      }
    });

    it('documents curation principles', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('记') || content.includes('引') || content.includes('串'),
        'must document curation principles (记/引/串)');
    });

    it('documents the ≥2 source rule', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('≥ 2') || content.includes('>=2'),
        'must document ≥2 source rule for curation');
    });

    it('has structured sections', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const headings = (content.match(/^## /gm) || []);
      assert.ok(headings.length >= 5, `SKILL.md should have ≥5 sections, got ${headings.length}`);
    });

    it('references reporter.md agent spec', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('reporter.md'), 'must reference reporter.md agent spec');
    });
  });

  describe('reporter.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/reporter.md`), 'reporter.md must exist');
    });

    it('has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/reporter.md`);
      assert.ok(content.length > 200, 'reporter.md should have substantial content');
    });
  });

  describe('help.mjs', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/help.mjs`), 'help.mjs must exist');
    });

    it('executes successfully', () => {
      const out = execSync('node skills/rui-reporter/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.length > 50, 'help.mjs should output help text');
    });
  });

  describe('rules', () => {
    it('has rules/reporting-standards.md', () => {
      assert.ok(fileExists(`${SKILL_DIR}/rules/reporting-standards.md`), 'rules/reporting-standards.md must exist');
    });

    it('reporting-standards.md has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/rules/reporting-standards.md`);
      assert.ok(content.length > 300, 'reporting-standards.md should have substantial content');
    });
  });

  describe('single responsibility', () => {
    it('SKILL.md focuses on reporting and curation', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const reportTerms = (content.match(/报告|report|策展|curation/g) || []);
      assert.ok(reportTerms.length >= 5, 'SKILL.md must focus on reporting and curation');
    });
  });
});


  describe('edge cases', () => {
    it('SKILL.md documents evidence level discipline', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('Level') || content.includes('证据') || content.includes('A/B'), 'must document evidence levels');
    });

    it('SKILL.md documents knowledge curation workflow', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('记') || content.includes('引') || content.includes('串'), 'must document curation workflow');
    });
  });
const exitCode = await run();
