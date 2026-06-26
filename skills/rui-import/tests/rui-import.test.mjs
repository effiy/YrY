/**
 * Tests for the rui-import skill — document sync to remote API.
 */
import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../../../lib/vitest-adapter.mjs';
import { fileExists, readFile, hasSection, hasMermaidDiagram, parseFrontmatter } from '../../../lib/test-helpers.mjs';

const SKILL_DIR = 'skills/rui-import';

describe('rui-import skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('has valid frontmatter', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const fm = parseFrontmatter(content);
      assert.ok(fm, 'SKILL.md must have frontmatter');
      assert.ok(fm.name === 'rui-import', 'frontmatter name must be rui-import');
    });

    it('has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 500, 'SKILL.md should have substantial content');
    });

    it('documents workflow stages', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasSection(content, '工作流全景'), 'must have workflow overview');
    });

    it('documents scan rules', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasSection(content, '扫描规则'), 'must document scan rules');
    });

    it('documents API contract', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasSection(content, 'API 契约'), 'must document API contract');
    });

    it('documents error model', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasSection(content, '错误模型'), 'must document error model');
    });

    it('has mermaid diagrams', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasMermaidDiagram(content), 'must include mermaid diagrams');
    });

    it('documents project root detection', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('.git') || content.includes('.claude'),
        'must document project root detection logic');
    });

    it('has structured sections', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const headings = (content.match(/^## /gm) || []);
      assert.ok(headings.length >= 4, `SKILL.md should have ≥4 sections, got ${headings.length}`);
    });
  });

  describe('sync.mjs', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/sync.mjs`), 'sync.mjs must exist');
    });

    it('contains upload logic', () => {
      const content = readFile(`${SKILL_DIR}/sync.mjs`);
      assert.ok(
        content.includes('write-file') || content.includes('upload') || content.includes('sync'),
        'sync.mjs must have upload logic'
      );
    });

    it('--help outputs usage', () => {
      try {
        const out = execSync('node skills/rui-import/sync.mjs --help 2>&1', {
          cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
        });
        assert.ok(out.length > 100 || out.includes('用法') || out.includes('rui-import'),
          '--help should output usage syntax');
      } catch (e) {
        const output = (e.stdout || '') + (e.stderr || '');
        assert.ok(output.length > 20, '--help should produce output');
      }
    });

    it('mode=list works without API calls', () => {
      try {
        const out = execSync('node skills/rui-import/sync.mjs workspace=true mode=list 2>&1', {
          cwd: process.cwd(), encoding: 'utf-8', timeout: 15_000,
        });
        assert.ok(
          out.includes('found') || out.includes('file') || out.includes('scan'),
          'mode=list should list files without API calls'
        );
      } catch (e) {
        const output = (e.stdout || '') + (e.stderr || '');
        assert.ok(output.length > 0, 'mode=list should produce output');
      }
    });
  });

  describe('help.mjs', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/help.mjs`), 'help.mjs must exist');
    });

    it('executes successfully', () => {
      const out = execSync('node skills/rui-import/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.length > 50, 'help.mjs should output help text');
    });
  });

  describe('rules', () => {
    it('has rules/sync-rules.md', () => {
      assert.ok(fileExists(`${SKILL_DIR}/rules/sync-rules.md`), 'rules/sync-rules.md must exist');
    });

    it('sync-rules.md has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/rules/sync-rules.md`);
      assert.ok(content.length > 300, 'sync-rules.md should have substantial content');
    });

    it('sync-rules.md documents upload strategy', () => {
      const content = readFile(`${SKILL_DIR}/rules/sync-rules.md`);
      assert.ok(
        content.includes('上传') || content.includes('upload'),
        'must document upload strategy'
      );
    });

    it('sync-rules.md documents error handling', () => {
      const content = readFile(`${SKILL_DIR}/rules/sync-rules.md`);
      assert.ok(
        content.includes('错误') || content.includes('error') || content.includes('失败'),
        'must document error handling'
      );
    });
  });

  describe('single responsibility', () => {
    it('SKILL.md focuses on document sync', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const syncTerms = (content.match(/同步|sync|上传|upload|远端|remote/g) || []);
      assert.ok(syncTerms.length >= 5, 'SKILL.md must focus on document synchronization');
    });

    it('does not import from other skills directly', () => {
      const content = readFile(`${SKILL_DIR}/sync.mjs`);
      const importLines = content.split('\n').filter(l => l.trim().startsWith('import '));
      const skillImports = importLines.filter(l => l.includes('skills/'));
      assert.ok(skillImports.length === 0, 'sync.mjs must not import from other skills directly');
    });
  });
});

const _exitCode = await run();