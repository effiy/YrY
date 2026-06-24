/**
 * Tests for the rui-health skill — system health diagnosis.
 */
import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../../../lib/vitest-adapter.mjs';
import { fileExists, readFile, hasSection, hasMermaidDiagram, hasTable } from '../../../lib/test-helpers.mjs';

const SKILL_DIR = 'skills/rui-health';

describe('rui-health skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 1000, 'SKILL.md should have substantial content');
    });

    it('has mermaid diagram', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasMermaidDiagram(content), 'SKILL.md must have mermaid diagram');
    });

    it('documents 9 core dimensions', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const coreDims = ['token', 'config', 'robots', 'api', 'reports', 'format', 'diagnostics', 'git', 'security'];
      for (const dim of coreDims) {
        assert.ok(content.includes(dim), `must document core dimension: ${dim}`);
      }
    });

    it('documents 7 engineering maturity dimensions', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const emDims = ['em_testing', 'em_types', 'em_linting', 'em_cicd', 'em_docs', 'em_deps', 'em_git'];
      for (const dim of emDims) {
        assert.ok(content.includes(dim), `must document engineering dimension: ${dim}`);
      }
    });

    it('documents D0-D8 diagnostic engine', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      for (let i = 0; i <= 7; i++) {
        assert.ok(content.includes(`D${i}`), `must document D${i} diagnostic`);
      }
    });

    it('documents scoring algorithm', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('评分') || content.includes('scoring') || content.includes('composite'),
        'must document scoring algorithm');
    });

    it('documents grade thresholds', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('A') && content.includes('B') && content.includes('C') && content.includes('D'),
        'must document A/B/C/D grade thresholds');
    });

    it('has degradation or fallback strategies', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('降级') || content.includes('degrad') || content.includes('fallback') || content.includes('失败'),
        'SKILL.md must document error handling or degradation strategies'
      );
    });

    it('documents relationship with rui-bot', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('rui-bot'), 'must document rui-bot relationship per SRP split');
    });

    it('has structured sections', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const headings = (content.match(/^## /gm) || []);
      assert.ok(headings.length >= 5, `SKILL.md should have ≥5 sections, got ${headings.length}`);
    });
  });

  describe('health.mjs', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/health.mjs`), 'health.mjs must exist');
    });

    it('executes successfully in text mode', () => {
      const out = execSync('node skills/rui-health/health.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.includes('健康评分'), 'health.mjs should output health score');
      assert.ok(out.includes('分'), 'health.mjs should output score value');
    });

    it('executes with --json flag', () => {
      const out = execSync('node skills/rui-health/health.mjs --json 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      const parsed = JSON.parse(out);
      assert.typeOf(parsed.composite, 'number', 'composite must be a number');
      assert.ok(parsed.composite >= 0 && parsed.composite <= 100, 'composite must be 0-100');
      assert.typeOf(parsed.grade, 'string', 'grade must be a string');
      assert.ok(['A', 'B', 'C', 'D'].includes(parsed.grade), 'grade must be A/B/C/D');
      assert.typeOf(parsed.dimensions, 'object', 'dimensions must be an object');
    });

    it('--json output includes all core dimensions', () => {
      const out = execSync('node skills/rui-health/health.mjs --json 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      const { dimensions } = JSON.parse(out);
      const coreKeys = ['token', 'config', 'robots', 'api', 'reports', 'format', 'diagnostics', 'git', 'security'];
      for (const key of coreKeys) {
        assert.ok(key in dimensions, `dimensions must include ${key}`);
        assert.typeOf(dimensions[key].score, 'number', `${key}.score must be a number`);
        assert.typeOf(dimensions[key].detail, 'string', `${key}.detail must be a string`);
      }
    });

    it('--json output includes engineering maturity dimensions', () => {
      const out = execSync('node skills/rui-health/health.mjs --json 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      const { dimensions } = JSON.parse(out);
      const emKeys = ['em_testing', 'em_types', 'em_linting', 'em_cicd', 'em_docs', 'em_deps', 'em_git'];
      for (const key of emKeys) {
        assert.ok(key in dimensions, `dimensions must include ${key}`);
      }
    });

    it('--json output includes timestamp', () => {
      const out = execSync('node skills/rui-health/health.mjs --json 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      const parsed = JSON.parse(out);
      assert.ok(parsed.timestamp, 'must include timestamp');
      assert.ok(Date.parse(parsed.timestamp), 'timestamp must be valid ISO date');
    });

    it('imports from shared lib (dedup)', () => {
      const content = readFile(`${SKILL_DIR}/health.mjs`);
      assert.ok(content.includes("from '../../lib/constants.mjs'"), 'must import from lib/constants.mjs');
      assert.ok(content.includes("from '../../lib/fs.mjs'"), 'must import from lib/fs.mjs');
    });
  });

  describe('help.mjs', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/help.mjs`), 'help.mjs must exist');
    });

    it('executes successfully', () => {
      const out = execSync('node skills/rui-health/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.length > 100, 'help.mjs should output substantial help text');
    });

    it('documents all flags', () => {
      const out = execSync('node skills/rui-health/help.mjs 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.includes('--json'), 'help.mjs must document --json');
      assert.ok(out.includes('--html'), 'help.mjs must document --html');
      assert.ok(out.includes('--trend'), 'help.mjs must document --trend');
    });
  });

  describe('edge cases', () => {
    it('--help flag works', () => {
      const out = execSync('node skills/rui-health/health.mjs --help 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      assert.ok(out.includes('rui-health'), '--help should output help text');
    });

    it('rejects unknown flags', () => {
      try {
        execSync('node skills/rui-health/health.mjs --unknown-flag 2>&1', {
          cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
        });
        assert.fail('should have exited with non-zero');
      } catch (e) {
        assert.ok(e.status !== 0, 'unknown flag should exit with non-zero');
      }
    });

    it('--json output is structurally complete', () => {
      const out = execSync('node skills/rui-health/health.mjs --json 2>&1', {
        cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
      });
      const parsed = JSON.parse(out);
      const requiredFields = ['composite', 'grade', 'dimensions', 'timestamp', 'project'];
      for (const field of requiredFields) {
        assert.ok(field in parsed, `--json must include ${field}`);
      }
    });
  });

  describe('rules', () => {
    it('has rules/health-scoring.md', () => {
      assert.ok(fileExists(`${SKILL_DIR}/rules/health-scoring.md`), 'rules/health-scoring.md must exist');
    });

    it('health-scoring.md has substantial content', () => {
      const content = readFile(`${SKILL_DIR}/rules/health-scoring.md`);
      assert.ok(content.length > 300, 'health-scoring.md should have substantial content');
    });
  });

  describe('single responsibility', () => {
    it('health.mjs does not import from rui-bot', () => {
      const content = readFile(`${SKILL_DIR}/health.mjs`);
      // Check that no import line references rui-bot
      const importLines = content.split('\n').filter(l => l.trim().startsWith('import '));
      const ruiBotImport = importLines.find(l => l.includes('rui-bot'));
      assert.ok(!ruiBotImport, 'health.mjs must not import from rui-bot per SRP');
    });

    it('SKILL.md documents SRP boundary with rui-bot', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(
        content.includes('rui-bot') || content.includes('SRP'),
        'SKILL.md must document SRP boundary with rui-bot'
      );
    });
  });
});

const exitCode = await run();
