/**
 * Tests for the rui-analysis skill — code and architecture static analysis.
 */
import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../../../lib/vitest-adapter.mjs';
import { fileExists, readFile, hasMermaidDiagram, parseFrontmatter } from '../../../lib/test-helpers.mjs';

const SKILL_DIR = 'skills/rui-analysis';

describe('rui-analysis skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('has valid frontmatter', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const fm = parseFrontmatter(content);
      assert.ok(fm, 'SKILL.md must have frontmatter');
      assert.ok(fm.name === 'rui-analysis', 'frontmatter name must be rui-analysis');
    });

    it('has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 1000, 'SKILL.md should have substantial content');
    });

    it('has mermaid diagram', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasMermaidDiagram(content), 'SKILL.md must have mermaid diagram');
    });

    it('documents five analysis dimensions', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const dims = ['复杂度', '耦合', '文件膨胀', '依赖健康', '架构边界'];
      let found = 0;
      for (const dim of dims) {
        if (content.includes(dim)) found++;
      }
      assert.ok(found >= 4, `must document analysis dimensions, found ${found}`);
    });

    it('documents McCabe complexity', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('McCabe') || content.includes('圈复杂度'),
        'must document McCabe cyclomatic complexity');
    });

    it('documents severity levels', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('Simple') || content.includes('Moderate') || content.includes('Complex') || content.includes('Extreme'),
        'must document complexity severity levels'
      );
    });

    it('documents coupling analysis', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('fan-in') || content.includes('fan-out') || content.includes('循环依赖'),
        'must document coupling analysis'
      );
    });

    it('is specification-driven', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('规约驱动') || content.includes('specification'),
        'must declare specification-driven approach'
      );
    });

    it('has structured sections', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const headings = (content.match(/^## /gm) || []);
      assert.ok(headings.length >= 5, `SKILL.md should have ≥5 sections, got ${headings.length}`);
    });
  });

  describe('help.mjs', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/help.mjs`), 'help.mjs must exist');
    });

    it('executes successfully', () => {
      const out = execSync('node skills/rui-analysis/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.length > 50, 'help.mjs should output help text');
    });
  });

  describe('scripts', () => {
    it('has extract-structure.mjs', () => {
      assert.ok(fileExists(`${SKILL_DIR}/scripts/extract-structure.mjs`), 'scripts/extract-structure.mjs must exist');
    });

    it('extract-structure.mjs has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/scripts/extract-structure.mjs`);
      assert.ok(content.length > 200, 'extract-structure.mjs should have substantial content');
    });
  });

  describe('rules', () => {
    it('has rules/analysis-methodology.md', () => {
      assert.ok(fileExists(`${SKILL_DIR}/rules/analysis-methodology.md`), 'rules/analysis-methodology.md must exist');
    });

    it('analysis-methodology.md has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/rules/analysis-methodology.md`);
      assert.ok(content.length > 300, 'analysis-methodology.md should have substantial content');
    });
  });

  describe('single responsibility', () => {
    it('SKILL.md focuses on static analysis', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const analysisTerms = (content.match(/分析|analysis|复杂度|complexity|耦合|coupling/g) || []);
      assert.ok(analysisTerms.length >= 5, 'SKILL.md must focus on static analysis');
    });
  });

  describe('edge cases', () => {
    it('SKILL.md documents file bloat thresholds', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('500') || content.includes('1000'), 'must document file size thresholds');
    });

    it('SKILL.md documents architecture boundary detection', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('架构') || content.includes('architecture'), 'must document architecture boundary detection');
    });
  });
});

await run();
