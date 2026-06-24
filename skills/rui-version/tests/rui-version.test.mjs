/**
 * Tests for the rui-version skill — semantic version management.
 */
import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../../../lib/vitest-adapter.mjs';
import { fileExists, readFile, hasMermaidDiagram, parseFrontmatter } from '../../../lib/test-helpers.mjs';

const SKILL_DIR = 'skills/rui-version';

describe('rui-version skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('has valid frontmatter', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const fm = parseFrontmatter(content);
      assert.ok(fm, 'SKILL.md must have frontmatter');
      assert.ok(fm.name === 'rui-version', 'frontmatter name must be rui-version');
    });

    it('has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 1000, 'SKILL.md should have substantial content');
    });

    it('has mermaid diagram', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasMermaidDiagram(content), 'SKILL.md must have mermaid diagram');
    });

    it('documents --up command', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('--up'), 'must document --up command');
    });

    it('documents --rollback command', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('--rollback'), 'must document --rollback command');
    });

    it('documents semver decision tree', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('MAJOR') && content.includes('MINOR') && content.includes('PATCH'),
        'must document MAJOR/MINOR/PATCH version bump rules'
      );
    });

    it('documents version file sync', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const files = ['plugin.json', 'CLAUDE.md', 'README.md'];
      let found = false;
      for (const f of files) {
        if (content.includes(f)) found = true;
      }
      assert.ok(found, 'must document version file synchronization');
    });

    it('documents conflict resolution', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('冲突') || content.includes('conflict'),
        'must document conflict resolution strategy'
      );
    });

    it('documents CI/CD integration', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('CI/CD') || content.includes('ci/cd') || content.includes('cicd'),
        'must document CI/CD integration'
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
      const out = execSync('node skills/rui-version/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.length > 50, 'help.mjs should output help text');
    });

    it('documents --up and --rollback in help', () => {
      const out = execSync('node skills/rui-version/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.includes('--up') || out.includes('up'), 'help.mjs must document --up');
      assert.ok(out.includes('rollback') || out.includes('回滚'), 'help.mjs must document --rollback');
    });
  });

  describe('rules', () => {
    it('has rules/version-policy.md', () => {
      assert.ok(fileExists(`${SKILL_DIR}/rules/version-policy.md`), 'rules/version-policy.md must exist');
    });

    it('version-policy.md has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/rules/version-policy.md`);
      assert.ok(content.length > 300, 'version-policy.md should have substantial content');
    });
  });

  describe('single responsibility', () => {
    it('SKILL.md focuses on semantic version management', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const versionTerms = (content.match(/版本|version|semver|MAJOR|MINOR|PATCH/g) || []);
      assert.ok(versionTerms.length >= 5, 'SKILL.md must focus on version management');
    });
  });
});


  describe('edge cases', () => {
    it('SKILL.md documents version file sync order', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('plugin.json') || content.includes('CLAUDE.md'), 'must document version file sync');
    });

    it('SKILL.md documents rollback safety', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('rollback') || content.includes('回退'), 'must document rollback');
    });
  });
const exitCode = await run();
