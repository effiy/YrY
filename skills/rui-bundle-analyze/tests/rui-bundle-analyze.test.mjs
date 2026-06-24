/**
 * Tests for the rui-bundle-analyze skill — file size & dependency visualization.
 */
import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../../../lib/vitest-adapter.mjs';
import { fileExists, readFile, hasMermaidDiagram, parseFrontmatter } from '../../../lib/test-helpers.mjs';

const SKILL_DIR = 'skills/rui-bundle-analyze';

describe('rui-bundle-analyze skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('has valid frontmatter', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const fm = parseFrontmatter(content);
      assert.ok(fm, 'SKILL.md must have frontmatter');
      assert.ok(fm.name === 'rui-bundle-analyze', 'frontmatter name must be rui-bundle-analyze');
    });

    it('has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 2000, 'SKILL.md should have substantial content');
    });

    it('documents treemap algorithm', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('treemap') || content.includes('squarified'),
        'must document treemap layout algorithm'
      );
    });

    it('documents exclusion rules', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('node_modules') || content.includes('排除'),
        'must document file/directory exclusion rules'
      );
    });

    it('documents color encoding strategy', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('Tableau10') || content.includes('颜色') || content.includes('color'),
        'must document color encoding strategy'
      );
    });

    it('documents design principles', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('零配置') || content.includes('只读') || content.includes('自包含'),
        'must document design principles (zero-config, read-only, self-contained)'
      );
    });

    it('documents comparison with traditional tools', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('传统') || content.includes('webpack'),
        'must document comparison with traditional bundle analyzers'
      );
    });

    it('has structured sections', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const headings = (content.match(/^## /gm) || []);
      assert.ok(headings.length >= 8, `SKILL.md should have ≥8 sections, got ${headings.length}`);
    });
  });

  describe('analyze.mjs', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/analyze.mjs`), 'analyze.mjs must exist');
    });

    it('has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/analyze.mjs`);
      assert.ok(content.length > 500, 'analyze.mjs should have substantial content');
    });
  });

  describe('help.mjs', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/help.mjs`), 'help.mjs must exist');
    });

    it('executes successfully', () => {
      const out = execSync('node skills/rui-bundle-analyze/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.length > 50, 'help.mjs should output help text');
    });
  });

  describe('rules', () => {
    it('has rules/bundle-analysis.md', () => {
      assert.ok(fileExists(`${SKILL_DIR}/rules/bundle-analysis.md`), 'rules/bundle-analysis.md must exist');
    });

    it('bundle-analysis.md has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/rules/bundle-analysis.md`);
      assert.ok(content.length > 300, 'bundle-analysis.md should have substantial content');
    });
  });

  describe('single responsibility', () => {
    it('SKILL.md focuses on file size and dependency visualization', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const bundleTerms = (content.match(/体积|size|treemap|依赖|dependency|bundle/g) || []);
      assert.ok(bundleTerms.length >= 5, 'SKILL.md must focus on file size and dependency analysis');
    });

    it('is a standalone skill (not in default pipeline)', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const fm = parseFrontmatter(content);
      assert.ok(fm, 'SKILL.md must have frontmatter');
      assert.ok(fm.lifecycle === 'standalone', 'rui-bundle-analyze should be standalone lifecycle');
    });
  });
});

const exitCode = await run();
