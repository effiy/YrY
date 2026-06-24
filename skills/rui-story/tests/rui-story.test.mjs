/**
 * Tests for the rui-story skill — story panel management and sync.
 */
import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../../../lib/vitest-adapter.mjs';
import { fileExists, readFile, hasSection, hasMermaidDiagram, parseFrontmatter } from '../../../lib/test-helpers.mjs';

const SKILL_DIR = 'skills/rui-story';

describe('rui-story skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('has valid frontmatter', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const fm = parseFrontmatter(content);
      assert.ok(fm, 'SKILL.md must have frontmatter');
      assert.ok(fm.name === 'rui-story', 'frontmatter name must be rui-story');
    });

    it('has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 500, 'SKILL.md should have substantial content');
    });

    it('has mermaid diagram', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasMermaidDiagram(content), 'SKILL.md must have mermaid diagram');
    });

    it('documents list command', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('list'), 'must document list command');
    });

    it('documents sync command', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('sync') || content.includes('同步'),
        'must document sync command'
      );
    });

    it('documents knowledge graph schema', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('知识图谱') || content.includes('knowledge-graph') || content.includes('story→scene→source'),
        'must document knowledge graph schema'
      );
    });

    it('has structured sections', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const headings = (content.match(/^## /gm) || []);
      assert.ok(headings.length >= 4, `SKILL.md should have ≥4 sections, got ${headings.length}`);
    });
  });

  describe('rui-story.mjs', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/rui-story.mjs`), 'rui-story.mjs must exist');
    });

    it('has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/rui-story.mjs`);
      assert.ok(content.length > 100, 'rui-story.mjs should have content');
    });

    it('--help outputs usage', () => {
      try {
        const out = execSync('node skills/rui-story/rui-story.mjs --help 2>&1', {
          cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
        });
        assert.ok(out.length > 50 || out.includes('用法') || out.includes('Usage'),
          '--help should output usage info');
      } catch (e) {
        const output = (e.stdout || '') + (e.stderr || '');
        assert.ok(output.length > 20, '--help should produce output');
      }
    });
  });

  describe('help.mjs', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/help.mjs`), 'help.mjs must exist');
    });

    it('executes successfully', () => {
      const out = execSync('node skills/rui-story/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.length > 50, 'help.mjs should output help text');
    });
  });

  describe('lib', () => {
    it('has extract.mjs', () => {
      assert.ok(fileExists(`${SKILL_DIR}/lib/extract.mjs`), 'lib/extract.mjs must exist');
      const content = readFile(`${SKILL_DIR}/lib/extract.mjs`);
      assert.ok(content.length > 50, 'lib/extract.mjs should have content');
    });
  });

  describe('rules', () => {
    it('has knowledge-graph.md', () => {
      assert.ok(fileExists(`${SKILL_DIR}/rules/knowledge-graph.md`), 'rules/knowledge-graph.md must exist');
    });

    it('knowledge-graph.md has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/rules/knowledge-graph.md`);
      assert.ok(content.length > 100, 'knowledge-graph.md should have substantial content');
    });

    it('has knowledge-graph-ownership.md', () => {
      assert.ok(fileExists(`${SKILL_DIR}/rules/knowledge-graph-ownership.md`), 'rules/knowledge-graph-ownership.md must exist');
    });
  });

  describe('single responsibility', () => {
    it('SKILL.md focuses on story panel management', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const storyTerms = (content.match(/故事|story|面板|panel|同步|sync|知识图谱/g) || []);
      assert.ok(storyTerms.length >= 5, 'SKILL.md must focus on story panel management');
    });
  });
});

const exitCode = await run();