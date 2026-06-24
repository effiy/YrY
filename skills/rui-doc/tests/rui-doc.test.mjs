/**
 * Tests for the rui-doc skill — markdown document baseline generation.
 */
import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../../../lib/vitest-adapter.mjs';
import { fileExists, readFile, hasMermaidDiagram, parseFrontmatter } from '../../../lib/test-helpers.mjs';

const SKILL_DIR = 'skills/rui-doc';

describe('rui-doc skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('has valid frontmatter', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const fm = parseFrontmatter(content);
      assert.ok(fm, 'SKILL.md must have frontmatter');
      assert.ok(fm.name === 'rui-doc', 'frontmatter name must be rui-doc');
    });

    it('has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 1000, 'SKILL.md should have substantial content');
    });

    it('has mermaid diagram', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasMermaidDiagram(content), 'SKILL.md must have mermaid diagram');
    });

    it('documents three modes', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('--from-code'), 'must document --from-code mode');
      assert.ok(content.includes('--from-local'), 'must document --from-local mode');
    });

    it('documents document baseline outputs', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const outputs = ['故事任务', '场景', '知识图谱'];
      for (const out of outputs) {
        assert.ok(content.includes(out), `must document ${out} output`);
      }
    });

    it('documents branch isolation requirement', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('分支隔离') || content.includes('feat/'),
        'must document branch isolation for doc writes'
      );
    });

    it('documents P0 check gate', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('P0'), 'must document P0 check gate');
    });

    it('documents multi-story serial execution', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('串行') || content.includes('serial'),
        'must document multi-story serial execution'
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
      const out = execSync('node skills/rui-doc/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.length > 50, 'help.mjs should output help text');
    });
  });

  describe('rules', () => {
    it('has rules/doc-pipeline.md', () => {
      assert.ok(fileExists(`${SKILL_DIR}/rules/doc-pipeline.md`), 'rules/doc-pipeline.md must exist');
    });

    it('doc-pipeline.md has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/rules/doc-pipeline.md`);
      assert.ok(content.length > 300, 'doc-pipeline.md should have substantial content');
    });
  });

  describe('single responsibility', () => {
    it('SKILL.md focuses on document baseline generation', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const docTerms = (content.match(/文档|doc|document|故事|story/g) || []);
      assert.ok(docTerms.length >= 5, 'SKILL.md must focus on document generation');
    });
  });
describe('edge cases', () => {
    it('SKILL.md documents --from-code mode details', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('--from-code'), 'must document --from-code mode');
      assert.ok(content.includes('--from-local'), 'must document --from-local mode');
    });

    it('SKILL.md documents quality gate failures', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('doc-p0') || content.includes('P0') || content.includes('阻断'),
        'must document quality gate failures'
      );
    });
  });
});

const exitCode = await run();
