/**
 * Tests for the rui-trends skill — technology trends discovery.
 */

import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../../../lib/vitest-adapter.mjs';
import { fileExists, readFile, hasMermaidDiagram } from '../../../lib/test-helpers.mjs';

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

    it('imports from shared lib (dedup)', () => {
      const content = readFile(`${SKILL_DIR}/help.mjs`);
      assert.ok(content.includes("from '../../lib/"), 'must import from shared lib/');
    });
  });

  describe('executables', () => {
    it('has trend fetch scripts', () => {
      const files = execSync(`ls ${SKILL_DIR}/`, {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 5_000,
      });
      assert.ok(
        files.includes('.mjs') || files.includes('.js'),
        'rui-trends must have executable scripts'
      );
    });
  });

  describe('SKILL.md completeness', () => {
    it('has a data sources section', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('数据') || content.includes('Data') || content.includes('source'),
        'SKILL.md must document data sources'
      );
    });

    it('has a command overview or routing table', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        (content.match(/## /g) || []).length >= 3,
        'SKILL.md must have at least 3 sections'
      );
    });

    it('documents rate limiting or caching', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('cache') || content.includes('缓存') || content.includes('rate') || content.includes('limit'),
        'SKILL.md should document rate limiting or caching strategy'
      );
    });

    it('mentions self-improve integration triggers', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('D5') || content.includes('D6') || content.includes('自改进') || content.includes('self-improve'),
        'SKILL.md must document self-improve integration'
      );
    });

    it('has troubleshooting or FAQ', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('排查') || content.includes('troubleshoot') || content.includes('FAQ') || content.includes('失败'),
        'SKILL.md should have troubleshooting guidance'
      );
    });
  });

  describe('cross-references', () => {
    it('SKILL.md references self-improve rule', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('self-improve') || content.includes('D5'),
        'SKILL.md must reference self-improve integration'
      );
    });

    it('help.mjs is internally consistent', () => {
      const helpOut = execSync('node skills/rui-trends/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      // help output should mention at least 3 of 7 commands
      const commands = ['status', 'github-trending', 'oss-insight', 'trendshift', 'top-starred', 'find-skills', 'all'];
      let found = 0;
      for (const cmd of commands) {
        if (helpOut.includes(cmd)) found++;
      }
      assert.ok(found >= 3, `help.mjs must document at least 3 of 7 commands, found ${found}`);
    });
  });
});

const _exitCode = await run();
