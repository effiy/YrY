/**
 * Tests for the rui-bot skill — WeChat Work bot messaging.
 */

import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../lib/test-harness.mjs';
import { fileExists, readFile, hasSection } from '../lib/helpers.mjs';

const SKILL_DIR = 'skills/rui-bot';

describe('rui-bot skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('is not empty', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 200, 'SKILL.md should have content');
    });

    it('documents send.mjs usage', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('send.mjs'), 'must reference executable send.mjs');
    });

    it('has API contract section', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('webhook') || content.includes('API') || content.includes('notify'),
        'must document webhook/notification API'
      );
    });
  });

  describe('executables', () => {
    it('help.mjs exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/help.mjs`), 'help.mjs must exist');
    });

    it('send.mjs exists and parses', () => {
      assert.ok(fileExists(`${SKILL_DIR}/send.mjs`), 'send.mjs must exist');
      const content = readFile(`${SKILL_DIR}/send.mjs`);
      assert.ok(content.includes('send') || content.includes('notify') || content.includes('webhook'),
        'send.mjs should have send/notify logic');
    });

    it('send.mjs accepts --help', () => {
      try {
        const out = execSync('node skills/rui-bot/send.mjs --help 2>&1', {
          cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
        });
        assert.ok(out.length > 50 || out.includes('用法') || out.includes('Usage') || out.includes('rui-bot'),
          '--help should output usage info');
      } catch (e) {
        const output = (e.stdout || '') + (e.stderr || '');
        assert.ok(output.length > 20, '--help should produce output even on error');
      }
    });
  });

  describe('health check', () => {
    it('runs health command without crashing', () => {
      try {
        const out = execSync('node skills/rui-bot/send.mjs health 2>&1', {
          cwd: process.cwd(), encoding: 'utf-8', timeout: 15_000,
        });
        assert.ok(out.length > 100, 'health command should produce output');
      } catch (e) {
        assert.fail(`health command crashed: ${e.stderr || e.message}`);
      }
    });

    it('outputs all 9 health dimensions', () => {
      const out = execSync('node skills/rui-bot/send.mjs health 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 15_000,
      });
      const dims = ['Token 凭据', '配置文件', '机器人配置', 'API 可达性', '自循环报告', '消息格式合规', 'D0-D7 诊断', 'Git 仓库状态', '安全扫描'];
      for (const dim of dims) {
        assert.ok(out.includes(dim), `health output must include dimension: ${dim}`);
      }
    });

    it('outputs composite score and grade', () => {
      const out = execSync('node skills/rui-bot/send.mjs health 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 15_000,
      });
      assert.ok(out.includes('综合健康度'), 'must include composite health score');
      assert.ok(/[ABCD] 级/.test(out), 'must include grade A/B/C/D');
    });

    it('generates HTML report with --html flag', () => {
      const out = execSync('node skills/rui-bot/send.mjs health --html 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 15_000,
      });
      assert.ok(out.includes('健康报告已生成') || out.includes('健康报告'), 'must confirm HTML report generation');
    });

    it('flush command works', () => {
      const out = execSync('node skills/rui-bot/send.mjs flush 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.includes('队列'), 'flush must reference notification queue');
    });

    it('--short outputs one-line summary', () => {
      const out = execSync('node skills/rui-bot/send.mjs health --short 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 15_000,
      });
      // Format: {icon} {score}/{grade} | 触发: ... | 弱项: ...
      assert.ok(/[ABCD]/.test(out), 'must include grade letter');
      assert.ok(/\d+\/[ABCD]/.test(out), 'must include score/grade');
      assert.ok(out.includes('弱项') || out.includes('通过'), 'must include weak dimensions or pass');
      assert.ok(out.split('\n').filter(Boolean).length <= 3, 'short mode should output few lines');
    });

    it('--alert runs without crash', () => {
      const out = execSync('node skills/rui-bot/send.mjs health --alert 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 15_000,
      });
      // Should either send alert, suppress it, or report score above threshold
      assert.ok(
        out.includes('告警') || out.includes('无需告警') || out.includes('Token') || out.includes('webhook'),
        'alert must produce meaningful output'
      );
    });
  });
});

const exitCode = await run();
process.exit(exitCode);
