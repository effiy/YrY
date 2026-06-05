/**
 * Tests for all agent definitions — verifies each agent has a complete,
 * well-formed definition file that follows AGENT.md conventions.
 */

import { describe, it, assert, run } from '../lib/test-harness.mjs';
import { fileExists, readFile, readDir, hasSection, hasMermaidDiagram, listAgents } from '../lib/helpers.mjs';

const AGENTS_DIR = 'agents';

describe('agent definitions', () => {
  // ── AGENT.md meta document ──────────────────────────────────
  describe('AGENT.md (meta)', () => {
    it('exists', () => {
      assert.ok(fileExists(`${AGENTS_DIR}/AGENT.md`), 'AGENT.md meta document must exist');
    });

    it('defines role topology', () => {
      const content = readFile(`${AGENTS_DIR}/AGENT.md`);
      assert.ok(hasSection(content, '角色拓扑') || content.includes('拓扑'),
        'must define role topology');
    });

    it('defines behavior discipline', () => {
      const content = readFile(`${AGENTS_DIR}/AGENT.md`);
      assert.ok(
        content.includes('纪律') || content.includes('Red Flag') || content.includes('行为'),
        'must define behavior discipline'
      );
    });

    it('has mermaid diagrams (expression priority)', () => {
      const content = readFile(`${AGENTS_DIR}/AGENT.md`);
      assert.ok(hasMermaidDiagram(content), 'must include mermaid diagrams');
    });
  });

  // ── Individual agent definitions ────────────────────────────
  const AGENTS = listAgents();
  const REQUIRED_AGENTS = ['pm', 'planner', 'coder', 'tester', 'security', 'architect', 'code-reviewer', 'reporter', 'self-improve'];

  describe('agent coverage', () => {
    it('has all 9 required agents', () => {
      for (const name of REQUIRED_AGENTS) {
        assert.ok(AGENTS.includes(name), `missing agent: ${name}`);
      }
      assert.equal(AGENTS.length, 9, 'should have exactly 9 agent definitions');
    });
  });

  // Per-agent checks
  for (const agentName of AGENTS) {
    describe(`${agentName} agent`, () => {
      const filePath = `${AGENTS_DIR}/${agentName}.md`;

      it('file exists', () => {
        assert.ok(fileExists(filePath), `${agentName}.md must exist`);
      });

      it('has substantial content (>100 lines suggested)', () => {
        const content = readFile(filePath);
        const lines = content.split('\n').length;
        assert.ok(lines > 50, `${agentName}.md should have >50 lines (has ${lines})`);
      });

      it('has a clear role definition', () => {
        const content = readFile(filePath);
        const hasRole = content.includes('角色') || content.includes('作为') ||
          content.includes('Role') || content.includes('职责');
        assert.ok(hasRole, 'must define role/responsibility');
      });

      it('has actionable instructions', () => {
        const content = readFile(filePath);
        // Agent files should have concrete behaviors, not just abstracts
        const hasActionable = content.includes('必须') || content.includes('禁止') ||
          content.includes('MUST') || content.includes('检查') || content.includes('验证');
        assert.ok(hasActionable, 'must have actionable instructions (必须/禁止/检查/验证)');
      });

      it('has decision guidance', () => {
        const content = readFile(filePath);
        const hasDecision = content.includes('何时') || content.includes('选择') ||
          content.includes('判定') || content.includes('决策') || content.includes('When') ||
          content.includes('触发') || content.includes('阻断条件') || content.includes('门禁');
        assert.ok(hasDecision, 'should have decision guidance (何时/选择/判定/触发/阻断条件/门禁)');
      });
    });
  }
});

const exitCode = await run();
process.exit(exitCode);
