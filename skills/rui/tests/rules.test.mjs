/**
 * Tests for all rule definitions — verifies each rule has a complete,
 * well-formed definition. Rules are now integrated into skills/<asterisk>/rules/.
 */

import { describe, it, assert, run } from '../../../lib/vitest-adapter.mjs';
import { fileExists, readFile, hasMermaidDiagram, hasTable, listRules } from '../../../lib/test-helpers.mjs';

// Rule → skill mapping (rules are now within their owning skills' rules/ dirs)
const RULE_TO_SKILL = {
  'agent-handoff': 'rui',
  'architecture-principles': 'rui',
  'delivery-gate': 'rui',
  'design-principles': 'rui',
  'loop-engineering': 'rui',
  'mermaid-theme': 'rui',
  'security-guardrails': 'rui',
  'analysis-methodology': 'rui-analysis',
  'notification-rules': 'rui-bot',
  'bundle-analysis': 'rui-bundle-analyze',
  'rui-claude': 'rui-claude',
  'code-paradigm': 'rui-code',
  'code-pipeline': 'rui-code',
  'code-pipeline-techniques': 'rui-code',
  'doc-pipeline': 'rui-doc',
  'health-scoring': 'rui-health',
  'architecture-diagram': 'rui-html',
  'doc-generation': 'rui-html',
  'doc-generation-lifecycle': 'rui-html',
  'doc-quality': 'rui-html',
  'sync-rules': 'rui-import',
  'init-pipeline': 'rui-init',
  'npm-management': 'rui-npm',
  'plan-execution': 'rui-plan',
  'reporting-standards': 'rui-reporter',
  'skill-quality': 'rui-skills',
  'knowledge-graph': 'rui-story',
  'knowledge-graph-ownership': 'rui-story',
  'trend-analysis': 'rui-trends',
  'update-pipeline': 'rui-update',
  'version-policy': 'rui-version',
  'self-improve': 'rui-yry',
};

function getRulePath(ruleName) {
  const skill = RULE_TO_SKILL[ruleName];
  if (!skill) return null;
  return `skills/${skill}/rules/${ruleName}.md`;
}

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
    it('has all required rules', () => {
      for (const name of REQUIRED_RULES) {
        assert.ok(RULES.includes(name), `missing rule: ${name}`);
      }
    });
  });

  // ── Per-rule checks ─────────────────────────────────────────
  for (const ruleName of RULES) {
    describe(`${ruleName} rule`, () => {
      const filePath = getRulePath(ruleName);

      it('file exists in skill rules dir', () => {
        assert.ok(filePath && fileExists(filePath), `${ruleName}.md must exist (expected: ${filePath})`);
      });

      it('has substantial content', () => {
        if (!filePath || !fileExists(filePath)) return;
        const content = readFile(filePath);
        const lines = content.split('\n').length;
        assert.ok(lines > 30, `${ruleName}.md should have >30 lines (has ${lines})`);
      });

      it('has a title/heading', () => {
        if (!filePath || !fileExists(filePath)) return;
        const content = readFile(filePath);
        assert.ok(content.startsWith('# ') || content.includes('\n# '),
          'must have a level-1 heading');
      });

      it('has at least one mermaid diagram or table (expression priority)', () => {
        if (!filePath || !fileExists(filePath)) return;
        const content = readFile(filePath);
        assert.ok(hasMermaidDiagram(content) || hasTable(content),
          'must include at least one mermaid diagram or table per expression priority rule');
      });
    });
  }

  // ── Key rule: code-pipeline ─────────────────────────────────
  describe('code-pipeline rule (critical)', () => {
    it('documents branch isolation', () => {
      const content = readFile('skills/rui-code/rules/code-pipeline.md');
      assert.ok(
        content.includes('分支隔离') || content.includes('feat/'),
        'must document branch isolation with feat/ pattern'
      );
    });

    it('documents Gate A (test-first)', () => {
      const content = readFile('skills/rui-code/rules/code-pipeline.md');
      assert.ok(
        content.includes('门禁') || content.includes('测试先行') || content.includes('test-first') || content.includes('测试设计'),
        'must document test-first gate'
      );
    });

    it('documents Gate B (verification)', () => {
      const content = readFile('skills/rui-code/rules/code-pipeline.md');
      assert.ok(
        content.includes('Gate B') || content.includes('验证'),
        'must document Gate B verification'
      );
    });

    it('documents P0 clearing discipline', () => {
      const content = readFile('skills/rui-code/rules/code-pipeline.md');
      assert.ok(
        content.includes('P0') && (content.includes('清零') || content.includes('清除')),
        'must document P0 clearing requirement'
      );
    });
  });

  // ── Key rule: security-guardrails ───────────────────────────
  describe('security-guardrails rule (critical)', () => {
    it('covers no-hardcoded-secrets', () => {
      const content = readFile('skills/rui/rules/security-guardrails.md');
      assert.ok(
        content.includes('密钥') || content.includes('Token') || content.includes('secret') || content.includes('凭据'),
        'must prohibit hardcoded secrets/credentials'
      );
    });

    it('covers auth bypass prevention', () => {
      const content = readFile('skills/rui/rules/security-guardrails.md');
      assert.ok(
        content.includes('认证') || content.includes('auth'),
        'must cover authentication requirements'
      );
    });
  });

  // ── Key rule: doc-generation ────────────────────────────────
  describe('doc-generation rule', () => {
    it('enforces expression priority (diagram → text → table)', () => {
      const content = readFile('skills/rui-html/rules/doc-generation.md');
      assert.ok(
        content.includes('表达优先') || content.includes('diagram') || content.includes('mermaid'),
        'must enforce expression priority'
      );
    });
  });
});

const _exitCode = await run();
