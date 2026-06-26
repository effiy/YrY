/**
 * Tests for lib/engine/diagnostics.mjs — D0-D8 diagnostic engine pure functions.
 */

import { describe, it, assert, run } from '../vitest-adapter.mjs';

/** @type {any} */
let runDiagnostics;
async function load() {
  if (runDiagnostics) return;
  const mod = await import('../engine/diagnostics.mjs');
  runDiagnostics = mod.runDiagnostics;
}

function makeExec(/** @type {any} */ overrides = {}) {
  return {
    was_blocked: false,
    block_reason: null,
    stage: 'code',
    quality_issues: {},
    planned_change_level: 'T2',
    actual_change_level: 'T2',
    ...overrides,
  };
}

function makeData(/** @type {any[]} */ allExec, /** @type {any} */ extra = {}) {
  return {
    allExec,
    statusHistory: [],
    deliveryTrack: [],
    toolAudit: [],
    proposals: [],
    ...extra,
  };
}

describe('engine/diagnostics.mjs', () => {
  describe('runDiagnostics()', () => {
    it('空数据返回空诊断数组', async () => {
      await load();
      const result = runDiagnostics(makeData([]));
      assert.typeOf(result, 'array');
      assert.equal(result.length, 0);
    });

    it('D0: 阻断但无原因的记录触发基线偏离', async () => {
      await load();
      const data = makeData([
        makeExec({ was_blocked: true, block_reason: null }),
        makeExec({ was_blocked: true, block_reason: null }),
      ]);
      const result = runDiagnostics(data);
      const d0 = result.find((/** @type {any} */ d) => d.id === 'D0');
      assert.ok(d0, 'D0 must trigger');
      assert.ok(d0.triggered);
      assert.ok(d0.confidence >= 2);
    });

    it('D1: 阻断率超过阈值时触发', async () => {
      await load();
      const allExec = [];
      for (let i = 0; i < 10; i++) {
        allExec.push(makeExec({ was_blocked: i < 6 }));
      }
      const result = runDiagnostics(makeData(allExec));
      const d1 = result.find((/** @type {any} */ d) => d.id === 'D1');
      if (d1) {
        assert.ok(d1.triggered);
        assert.ok(d1.evidence.includes('阻断率'));
      }
    });

    it('D2: P0 密度超过 50% 时触发', async () => {
      await load();
      const data = makeData([
        makeExec({ quality_issues: { P0: ['a', 'b'], P1: ['c'] } }),
        makeExec({ quality_issues: { P0: ['d'], P1: [] } }),
        makeExec({ quality_issues: { P0: ['e'], P1: ['f'] } }),
      ]);
      const result = runDiagnostics(data);
      const d2 = result.find((/** @type {any} */ d) => d.id === 'D2');
      assert.ok(d2, 'D2 must trigger with P0 density > 50%');
      assert.ok(d2.triggered);
    });

    it('D3: T3 占比超过阈值时触发', async () => {
      await load();
      const allExec = [];
      for (let i = 0; i < 10; i++) {
        allExec.push(makeExec({ planned_change_level: i < 5 ? 'T3' : 'T1' }));
      }
      const result = runDiagnostics(makeData(allExec));
      const d3 = result.find((/** @type {any} */ d) => d.id === 'D3');
      if (d3) {
        assert.ok(d3.triggered);
        assert.ok(d3.evidence.includes('T3'));
      }
    });

    it('正常数据不触发任何诊断', async () => {
      await load();
      const allExec = [];
      for (let i = 0; i < 20; i++) {
        allExec.push(makeExec());
      }
      const result = runDiagnostics(makeData(allExec));
      const triggered = result.filter((/** @type {any} */ d) => d.triggered);
      assert.ok(triggered.length === 0, `expected 0 triggered, got ${triggered.length}: ${triggered.map((/** @type {any} */ d) => d.id).join(',')}`);
    });

    it('每个诊断结果包含 id/label/triggered/evidence/baseline/suggestion', async () => {
      await load();
      const data = makeData([
        makeExec({ was_blocked: true, block_reason: null }),
        makeExec({ was_blocked: true, block_reason: null }),
        makeExec({ was_blocked: true, block_reason: null }),
      ]);
      const result = runDiagnostics(data);
      for (const d of result) {
        assert.typeOf(d.id, 'string');
        assert.typeOf(d.label, 'string');
        assert.typeOf(d.triggered, 'boolean');
        assert.typeOf(d.evidence, 'string');
        assert.typeOf(d.baseline, 'string');
        assert.typeOf(d.suggestion, 'string');
      }
    });

    it('D4: 交付失败达到阈值时触发', async () => {
      await load();
      const data = makeData(
        [makeExec(), makeExec(), makeExec()],
        { deliveryTrack: [
          { status: 'failure' }, { status: 'failure' },
        ]},
      );
      const result = runDiagnostics(data);
      const d4 = result.find((/** @type {any} */ d) => d.id === 'D4');
      if (d4) {
        assert.ok(d4.triggered);
        assert.ok(d4.evidence.includes('交付失败'));
      }
    });

    it('D5: 工具调用失败率超过阈值时触发', async () => {
      await load();
      const data = makeData(
        [makeExec(), makeExec(), makeExec()],
        { toolAudit: [
          { result: 'failure' }, { result: 'failure' }, { result: 'success' },
        ]},
      );
      const result = runDiagnostics(data);
      const d5 = result.find((/** @type {any} */ d) => d.id === 'D5');
      if (d5) {
        assert.ok(d5.triggered);
        assert.ok(d5.evidence.includes('工具调用失败率'));
      }
    });

    it('D6: 文档问题时触发', async () => {
      await load();
      const data = makeData(
        [makeExec(), makeExec(), makeExec()],
        { retroMissing: true },
      );
      const result = runDiagnostics(data, ['场景1', '场景2']);
      const d6 = result.find((/** @type {any} */ d) => d.id === 'D6');
      assert.ok(d6, 'D6 must trigger with doc issues');
      assert.ok(d6.triggered);
      assert.ok(d6.evidence.includes('文档'));
    });

    it('D7: 提案闭合率低于阈值时触发', async () => {
      await load();
      const proposals = [];
      for (let i = 0; i < 5; i++) {
        proposals.push({ status: i < 3 ? 'open' : 'done' });
      }
      const data = makeData(
        [makeExec(), makeExec(), makeExec()],
        { proposals },
      );
      const result = runDiagnostics(data);
      const d7 = result.find((/** @type {any} */ d) => d.id === 'D7');
      if (d7) {
        assert.ok(d7.triggered);
        assert.ok(d7.evidence.includes('提案闭合率'));
      }
    });

    it('D8: 架构合规问题不触发 (无 archIssues)', async () => {
      await load();
      const data = makeData([makeExec(), makeExec()]);
      const result = runDiagnostics(data);
      const d8 = result.find((/** @type {any} */ d) => d.id === 'D8');
      assert.ok(!d8, 'D8 must not trigger without archIssues');
    });
  });
});

await run();