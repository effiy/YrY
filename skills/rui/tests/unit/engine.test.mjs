/**
 * Unit tests for lib/engine/ pure functions.
 * Tests evaluateProposal, computeMetrics — pure logic with no I/O dependencies.
 */

import { describe, it, assert, run } from '../../../../lib/vitest-adapter.mjs';

// Dynamic import since engine modules are ESM with relative imports
let evaluateProposal, computeMetrics;

async function loadModules() {
  if (evaluateProposal) return;
  const mod = await import('../../../../lib/engine/evaluate.mjs');
  evaluateProposal = mod.evaluateProposal;
  computeMetrics = mod.computeMetrics;
}

describe('engine/evaluate.mjs', () => {
  describe('computeMetrics', () => {
    it('returns zeros for empty memories', async () => {
      await loadModules();
      const result = computeMetrics([]);
      assert.equal(result.count, 0);
      assert.equal(result.block_rate, 0);
      assert.equal(result.p0_density, 0);
      assert.equal(result.t3_proportion, 0);
    });

    it('computes block_rate correctly', async () => {
      await loadModules();
      const memories = [
        { was_blocked: true, quality_issues: {}, agents_called: [] },
        { was_blocked: false, quality_issues: {}, agents_called: [] },
        { was_blocked: true, quality_issues: {}, agents_called: [] },
        { was_blocked: false, quality_issues: {}, agents_called: [] },
      ];
      const result = computeMetrics(memories);
      assert.equal(result.count, 4);
      assert.equal(result.block_rate, 0.5);
    });

    it('computes p0_density from quality_issues', async () => {
      await loadModules();
      const memories = [
        { was_blocked: false, quality_issues: { P0: ['a', 'b'], P1: ['c'] }, agents_called: [] },
        { was_blocked: false, quality_issues: { P0: ['d'], P1: ['e', 'f'] }, agents_called: [] },
      ];
      const result = computeMetrics(memories);
      // P0: 3, total: 6, density = 0.5
      assert.equal(result.p0_density, 0.5);
    });

    it('handles missing quality_issues gracefully', async () => {
      await loadModules();
      const memories = [
        { was_blocked: false, agents_called: [] },
        { was_blocked: false, agents_called: [] },
      ];
      const result = computeMetrics(memories);
      assert.equal(result.p0_density, 0);
    });

    it('tracks agent participation counts', async () => {
      await loadModules();
      const memories = [
        { was_blocked: false, quality_issues: {}, agents_called: ['coder', 'tester'] },
        { was_blocked: false, quality_issues: {}, agents_called: ['coder', 'pm'] },
        { was_blocked: false, quality_issues: {}, agents_called: ['coder'] },
      ];
      const result = computeMetrics(memories);
      assert.equal(result.agent_participation.coder, 3);
      assert.equal(result.agent_participation.tester, 1);
      assert.equal(result.agent_participation.pm, 1);
    });

    it('detects T3 change level proportion', async () => {
      await loadModules();
      const memories = [
        { was_blocked: false, quality_issues: {}, agents_called: [], planned_change_level: 'T3' },
        { was_blocked: false, quality_issues: {}, agents_called: [], planned_change_level: 'T2' },
        { was_blocked: false, quality_issues: {}, agents_called: [], actual_change_level: 'T3' },
        { was_blocked: false, quality_issues: {}, agents_called: [], planned_change_level: 'T1' },
      ];
      const result = computeMetrics(memories);
      assert.equal(result.t3_proportion, 0.5);
    });
  });

  describe('evaluateProposal', () => {
    it('returns improved when both metrics improve', async () => {
      await loadModules();
      const pre = { count: 10, block_rate: 0.5, p0_density: 0.4, t3_proportion: 0.2, agent_participation: {} };
      const post = { count: 10, block_rate: 0.2, p0_density: 0.1, t3_proportion: 0.1, agent_participation: {} };
      const result = evaluateProposal({ id: 'test-1' }, pre, post);
      assert.equal(result.E4_overall, 'improved');
      assert.equal(result.E1_block_rate, 'improved');
      assert.equal(result.E2_p0_density, 'improved');
    });

    it('returns degraded when both metrics worsen', async () => {
      await loadModules();
      const pre = { count: 10, block_rate: 0.2, p0_density: 0.1, t3_proportion: 0.1, agent_participation: {} };
      const post = { count: 10, block_rate: 0.5, p0_density: 0.4, t3_proportion: 0.2, agent_participation: {} };
      const result = evaluateProposal({ id: 'test-2' }, pre, post);
      assert.equal(result.E4_overall, 'degraded');
    });

    it('returns neutral when metrics are unchanged', async () => {
      await loadModules();
      const pre = { count: 10, block_rate: 0.3, p0_density: 0.2, t3_proportion: 0.1, agent_participation: {} };
      const post = { count: 10, block_rate: 0.3, p0_density: 0.2, t3_proportion: 0.1, agent_participation: {} };
      const result = evaluateProposal({ id: 'test-3' }, pre, post);
      assert.equal(result.E4_overall, 'neutral');
    });

    it('returns neutral when one improves and one degrades equally', async () => {
      await loadModules();
      const pre = { count: 10, block_rate: 0.5, p0_density: 0.1, t3_proportion: 0.1, agent_participation: {} };
      const post = { count: 10, block_rate: 0.2, p0_density: 0.4, t3_proportion: 0.1, agent_participation: {} };
      const result = evaluateProposal({ id: 'test-4' }, pre, post);
      assert.equal(result.E4_overall, 'neutral');
      assert.equal(result.E1_block_rate, 'improved');
      assert.equal(result.E2_p0_density, 'degraded');
    });

    it('includes proposal_id in result', async () => {
      await loadModules();
      const pre = { count: 5, block_rate: 0, p0_density: 0, t3_proportion: 0, agent_participation: {} };
      const post = { count: 5, block_rate: 0, p0_density: 0, t3_proportion: 0, agent_participation: {} };
      const result = evaluateProposal({ id: 'D1-test-story' }, pre, post);
      assert.equal(result.proposal_id, 'D1-test-story');
      assert.equal(result.E3_bad_cases, 'unknown');
    });
  });
});

run();
