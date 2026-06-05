/**
 * Tests for all rule definitions — verifies each rule has a complete,
 * well-formed definition that covers required aspects.
 */

import { describe, it, assert, run } from '../lib/test-harness.mjs';
import { fileExists, readFile, readDir, hasSection, hasMermaidDiagram, hasTable, listRules } from '../lib/helpers.mjs';

const RULES_DIR = 'rules';

describe('rule definitions', () => {
  // ── Rule coverage ───────────────────────────────────────────
  const RULES = listRules();
  const REQUIRED_RULES = [
    'architecture-diagram', 'code-pipeline', 'delivery-gate',
    'doc-generation', 'knowledge-graph', 'mermaid-theme',
    'plan-execution', 'rui-claude',
    'security-guardrails', 'self-improve',
  ];

  describe('rule coverage', () => {
    it('has all 10 required rules', () => {
      for (const name of REQUIRED_RULES) {
        assert.ok(RULES.includes(name), `missing rule: ${name}`);
      }
      assert.equal(RULES.length, 10, 'should have exactly 10 rule definitions');
    });
  });

  // ── Per-rule checks ─────────────────────────────────────────
  for (const ruleName of RULES) {
    describe(`${ruleName} rule`, () => {
      const filePath = `${RULES_DIR}/${ruleName}.md`;

      it('file exists', () => {
        assert.ok(fileExists(filePath), `${ruleName}.md must exist`);
      });

      it('has substantial content', () => {
        const content = readFile(filePath);
        const lines = content.split('\n').length;
        assert.ok(lines > 30, `${ruleName}.md should have >30 lines (has ${lines})`);
      });

      it('has a title/heading', () => {
        const content = readFile(filePath);
        assert.ok(content.startsWith('# ') || content.includes('\n# '),
          'must have a level-1 heading');
      });

      it('has at least one mermaid diagram (expression priority)', () => {
        const content = readFile(filePath);
        assert.ok(hasMermaidDiagram(content),
          'must include at least one mermaid diagram per expression priority rule');
      });

      it('has at least one table for structured data', () => {
        const content = readFile(filePath);
        assert.ok(hasTable(content),
          'must include at least one markdown table for structured data');
      });
    });
  }

  // ── Key rule: code-pipeline ─────────────────────────────────
  describe('code-pipeline rule (critical)', () => {
    it('documents branch isolation', () => {
      const content = readFile('rules/code-pipeline.md');
      assert.ok(
        content.includes('分支隔离') || content.includes('feat/'),
        'must document branch isolation with feat/ pattern'
      );
    });

    it('documents Gate A (test-first)', () => {
      const content = readFile('rules/code-pipeline.md');
      assert.ok(
        content.includes('门禁') || content.includes('测试先行') || content.includes('test-first') || content.includes('测试设计'),
        'must document test-first gate'
      );
    });

    it('documents Gate B (verification)', () => {
      const content = readFile('rules/code-pipeline.md');
      assert.ok(
        content.includes('Gate B') || content.includes('验证'),
        'must document Gate B verification'
      );
    });

    it('documents P0 clearing discipline', () => {
      const content = readFile('rules/code-pipeline.md');
      assert.ok(
        content.includes('P0') && (content.includes('清零') || content.includes('清除')),
        'must document P0 clearing requirement'
      );
    });
  });

  // ── Key rule: security-guardrails ───────────────────────────
  describe('security-guardrails rule (critical)', () => {
    it('covers no-hardcoded-secrets', () => {
      const content = readFile('rules/security-guardrails.md');
      assert.ok(
        content.includes('密钥') || content.includes('Token') || content.includes('secret') || content.includes('凭据'),
        'must prohibit hardcoded secrets/credentials'
      );
    });

    it('covers auth bypass prevention', () => {
      const content = readFile('rules/security-guardrails.md');
      assert.ok(
        content.includes('认证') || content.includes('auth'),
        'must cover authentication requirements'
      );
    });
  });

  // ── Key rule: doc-generation ────────────────────────────────
  describe('doc-generation rule', () => {
    it('enforces expression priority (diagram → text → table)', () => {
      const content = readFile('rules/doc-generation.md');
      assert.ok(
        content.includes('表达优先') || content.includes('diagram') || content.includes('mermaid'),
        'must enforce expression priority'
      );
    });
  });
});

const exitCode = await run();
process.exit(exitCode);
