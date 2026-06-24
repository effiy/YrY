/**
 * Tests for the rui-skills skill — agent skill ecosystem discovery.
 */
import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../../../lib/vitest-adapter.mjs';
import { fileExists, readFile, hasMermaidDiagram, parseFrontmatter } from '../../../lib/test-helpers.mjs';

const SKILL_DIR = 'skills/rui-skills';

describe('rui-skills skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('has valid frontmatter', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const fm = parseFrontmatter(content);
      assert.ok(fm, 'SKILL.md must have frontmatter');
      assert.ok(fm.name === 'rui-skills', 'frontmatter name must be rui-skills');
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
      const commands = ['find', 'add', 'remove', 'update', 'info'];
      for (const cmd of commands) {
        assert.ok(content.includes(cmd), `must document ${cmd} sub-command`);
      }
    });

    it('documents five-dimension quality model', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const dims = ['来源信誉', '社区活跃度', '维护健康度', '依赖安全性', '兼容性'];
      for (const dim of dims) {
        assert.ok(
          content.includes(dim) || content.includes('信誉') || content.includes('活跃度') || content.includes('健康度'),
          `must document quality dimension: ${dim}`
        );
      }
    });

    it('documents A/B/C/D grade thresholds', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('A') && content.includes('B') && content.includes('C') && content.includes('D'),
        'must document A/B/C/D grade thresholds'
      );
    });

    it('documents risk annotations', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('Low Reputation') || content.includes('Unmaintained') || content.includes('CVE'),
        'must document risk annotations'
      );
    });

    it('documents skill lifecycle', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('发现') || content.includes('评估') || content.includes('安装') || content.includes('卸载'),
        'must document skill lifecycle (发现→评估→安装→卸载)'
      );
    });

    it('documents security blocking rules', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('CVE') || content.includes('安全漏洞'),
        'must document security blocking rules for CVEs');
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
      const out = execSync('node skills/rui-skills/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.length > 100, 'help.mjs should output substantial help text');
    });

    it('documents find and add commands', () => {
      const out = execSync('node skills/rui-skills/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.includes('find') && out.includes('add'),
        'help.mjs must document find and add commands');
    });

    it('imports from shared lib (dedup)', () => {
      const content = readFile(`${SKILL_DIR}/help.mjs`);
      assert.ok(content.includes("from '../../lib/tty.mjs'"), 'must import from lib/tty.mjs');
      assert.ok(content.includes("from '../../lib/help-layout.mjs'"), 'must import from lib/help-layout.mjs');
    });
  });

  describe('rules', () => {
    it('has rules/skill-quality.md', () => {
      assert.ok(fileExists(`${SKILL_DIR}/rules/skill-quality.md`), 'rules/skill-quality.md must exist');
    });

    it('skill-quality.md has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/rules/skill-quality.md`);
      assert.ok(content.length > 300, 'skill-quality.md should have substantial content');
    });
  });

  describe('single responsibility', () => {
    it('SKILL.md focuses on skill discovery and installation', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const skillTerms = (content.match(/技能|skill|安装|install|find|add/g) || []);
      assert.ok(skillTerms.length >= 10, 'SKILL.md must focus on skill discovery');
    });

    it('references rui-trends as origin (SRP split)', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('rui-trends'), 'must reference rui-trends as origin of SRP split');
    });
  });
});

const exitCode = await run();
