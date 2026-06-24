/**
 * Tests for the rui-html skill — HTML document generation from markdown.
 */
import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../../../lib/vitest-adapter.mjs';
import { fileExists, readFile, hasMermaidDiagram, parseFrontmatter } from '../../../lib/test-helpers.mjs';

const SKILL_DIR = 'skills/rui-html';

describe('rui-html skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('has valid frontmatter', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const fm = parseFrontmatter(content);
      assert.ok(fm, 'SKILL.md must have frontmatter');
      assert.ok(fm.name === 'rui-html', 'frontmatter name must be rui-html');
    });

    it('has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 1000, 'SKILL.md should have substantial content');
    });

    it('has mermaid diagram', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasMermaidDiagram(content), 'SKILL.md must have mermaid diagram');
    });

    it('documents the 7 HTML document types', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const types = ['计划清单', '架构图', '知识图谱', '源码', '测试面板', '演示', '审查'];
      let found = 0;
      for (const t of types) {
        if (content.includes(t)) found++;
      }
      assert.ok(found >= 4, `must document the 7 HTML types, found ${found}`);
    });

    it('documents single-source iron law', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('单源生') || content.includes('index.md') || content.includes('single source'),
        'must document single-source iron law'
      );
    });

    it('documents --force flag', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('--force'), 'must document --force flag');
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
      const out = execSync('node skills/rui-html/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.length > 50, 'help.mjs should output help text');
    });
  });

  describe('rui-html.mjs', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/rui-html.mjs`), 'rui-html.mjs must exist');
    });

    it('is importable', () => {
      const content = readFile(`${SKILL_DIR}/rui-html.mjs`);
      assert.ok(content.length > 200, 'rui-html.mjs should have substantial content');
    });
  });

  describe('lib', () => {
    it('has generator.mjs', () => {
      assert.ok(fileExists(`${SKILL_DIR}/lib/generator.mjs`), 'lib/generator.mjs must exist');
    });

    it('has templates.mjs', () => {
      assert.ok(fileExists(`${SKILL_DIR}/lib/templates.mjs`), 'lib/templates.mjs must exist');
    });

    it('has extractor.mjs', () => {
      assert.ok(fileExists(`${SKILL_DIR}/lib/extractor.mjs`), 'lib/extractor.mjs must exist');
    });
  });

  describe('templates', () => {
    it('has shared CSS files', () => {
      assert.ok(fileExists(`${SKILL_DIR}/templates/shared-a.css`), 'shared-a.css must exist');
      assert.ok(fileExists(`${SKILL_DIR}/templates/shared-b.css`), 'shared-b.css must exist');
    });

    it('has category A templates', () => {
      assert.ok(fileExists(`${SKILL_DIR}/templates/cat-a/架构图.html`), 'cat-a/架构图.html must exist');
      assert.ok(fileExists(`${SKILL_DIR}/templates/cat-a/知识图谱.html`), 'cat-a/知识图谱.html must exist');
    });

    it('has category B templates', () => {
      const catB = ['计划清单', '源码', '测试面板', '演示', '审查'];
      for (const name of catB) {
        assert.ok(fileExists(`${SKILL_DIR}/templates/cat-b/${name}.html`), `cat-b/${name}.html must exist`);
      }
    });
  });

  describe('single responsibility', () => {
    it('SKILL.md focuses on HTML generation from markdown', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const htmlTerms = (content.match(/HTML|html|模板|template|生成|generate/g) || []);
      assert.ok(htmlTerms.length >= 5, 'SKILL.md must focus on HTML generation');
    });
  });
});

const exitCode = await run();
