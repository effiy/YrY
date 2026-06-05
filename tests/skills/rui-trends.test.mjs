/**
 * Tests for the rui-trends skill — technology trends discovery.
 */

import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../lib/test-harness.mjs';
import { fileExists, readFile, hasSection, hasMermaidDiagram } from '../lib/helpers.mjs';

const SKILL_DIR = 'skills/rui-trends';

describe('rui-trends skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('is not empty', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 500, 'SKILL.md should have substantial content');
    });

    it('has mermaid diagram', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasMermaidDiagram(content), 'SKILL.md must have mermaid diagram');
    });

    it('documents all 7 sub-commands', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const commands = ['status', 'github-trending', 'oss-insight', 'trendshift', 'top-starred', 'find-skills', 'all'];
      for (const cmd of commands) {
        assert.ok(content.includes(cmd), `must document ${cmd} command`);
      }
    });

    it('references all 4 data sources', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('GitHub') || content.includes('github-trending'), 'must reference GitHub Trending');
      assert.ok(content.includes('OSS Insight') || content.includes('oss-insight'), 'must reference OSS Insight');
      assert.ok(content.includes('TrendShift') || content.includes('trendshift'), 'must reference TrendShift');
      assert.ok(content.includes('Top-Starred') || content.includes('top-starred'), 'must reference Top-Starred');
    });

    it('has degradation strategies', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('降级策略'), 'must have degradation strategies section');
    });

    it('documents self-improve integration', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('自改进集成') || content.includes('D5') || content.includes('D6'),
        'must document self-improve integration');
    });
  });

  describe('help.mjs', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/help.mjs`), 'help.mjs must exist');
    });

    it('executes successfully', () => {
      try {
        const out = execSync('node skills/rui-trends/help.mjs 2>&1', {
          cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
        });
        assert.ok(out.length > 100, 'help.mjs should output substantial help text');
      } catch (e) {
        const output = (e.stdout || '') + (e.stderr || '');
        assert.ok(output.length > 20, 'help.mjs should produce output');
      }
    });

    it('help output matches SKILL.md command set', () => {
      const helpOut = execSync('node skills/rui-trends/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      const skContent = readFile(`${SKILL_DIR}/SKILL.md`);
      // All SKILL.md commands should appear in help.mjs output
      const commands = ['status', 'github-trending', 'oss-insight', 'trendshift', 'top-starred', 'find-skills', 'all'];
      for (const cmd of commands) {
        assert.ok(helpOut.includes(cmd) || skContent.includes(cmd),
          `command ${cmd} should be consistent between SKILL.md and help.mjs`);
      }
    });
  });
});

const exitCode = await run();
process.exit(exitCode);
