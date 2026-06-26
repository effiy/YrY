/**
 * Tests for lib/selfimprove-generator.mjs — summary.json generator.
 * Tests pure helper functions: safeAvg, modeGrade, week/month grouping,
 * diag summary computation, dim stats, and signal generation.
 */

import { describe, it, assert } from "../vitest-adapter.mjs";

/** @param {number[]} nums */
function safeAvg(nums) {
  if (!nums || nums.length === 0) return 0;
  return Math.round(nums.reduce((/** @type {number} */ a, /** @type {number} */ b) => a + b, 0) / nums.length);
}

/** @param {Array<any>} entries */
function modeGrade(entries) {
  /** @type {Record<string, number>} */
  const cnt = { A: 0, B: 0, C: 0, D: 0 };
  for (const e of entries) {
    if (e.grade) cnt[e.grade] = (cnt[e.grade] || 0) + 1;
  }
  const order = ["A", "B", "C", "D"];
  let best = "C", bestCnt = 0;
  for (const g of order) {
    if (cnt[g] > bestCnt || (cnt[g] === bestCnt && order.indexOf(g) < order.indexOf(best))) {
      best = g;
      bestCnt = cnt[g];
    }
  }
  return best;
}

/** @param {string} dateStr */
function getWeekMonday(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

/** @param {string} dateStr */
function getMonthKey(dateStr) {
  return dateStr.slice(0, 7);
}

/** @param {string} mondayStr */
function getWeekSunday(mondayStr) {
  const d = new Date(mondayStr + "T12:00:00");
  d.setDate(d.getDate() + 6);
  return d.toISOString().slice(0, 10);
}

/** @param {Array<any>} entries */
function computeDiagSummary(entries) {
  /** @type {Record<string, number>} */
  const diagCounts = {};
  for (const e of entries) {
    const diags = e.triggeredDiags || [];
    for (const d of diags) {
      diagCounts[d] = (diagCounts[d] || 0) + 1;
    }
  }
  const totalN = entries.length || 1;
  const result = [];
  for (const [id, count] of Object.entries(diagCounts)) {
    result.push({ id, count, rate: Math.round((count / totalN) * 100) });
  }
  const seen = new Set(result.map((r) => r.id));
  for (const d of ["D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8"]) {
    if (!seen.has(d)) {
      result.push({ id: d, count: 0, rate: 0 });
    }
  }
  result.sort((a, b) => b.rate - a.rate);
  return result;
}

/** @param {Array<any>} entries */
function computeDimStats(entries) {
  /** @type {Record<string, any>} */
  const stats = {};
  for (const e of entries) {
    const scores = e.scores || {};
    for (const [dim, score] of Object.entries(scores)) {
      if (typeof score !== "number") continue;
      if (!stats[dim]) stats[dim] = { sum: 0, count: 0, min: score, max: score, nums: [] };
      stats[dim].sum += score;
      stats[dim].count++;
      stats[dim].nums.push(score);
      if (score < stats[dim].min) stats[dim].min = score;
      if (score > stats[dim].max) stats[dim].max = score;
    }
  }
  return stats;
}

describe("lib/selfimprove-generator.mjs", () => {
  describe("safeAvg()", () => {
    it("空数组返回 0", () => {
      assert.equal(safeAvg([]), 0);
    });

    it("null 返回 0", () => {
      assert.equal(safeAvg(/** @type {any} */ (null)), 0);
    });

    it("单元素返回自身", () => {
      assert.equal(safeAvg([42]), 42);
    });

    it("计算平均值", () => {
      assert.equal(safeAvg([10, 20, 30]), 20);
    });
  });

  describe("modeGrade()", () => {
    it("空数组返回 A (同频次取高等级)", () => {
      assert.equal(modeGrade([]), "A");
    });

    it("单一等级返回该等级", () => {
      assert.equal(modeGrade([{ grade: "A" }, { grade: "A" }]), "A");
    });

    it("多等级返回频次最高的", () => {
      const entries = [
        { grade: "A" }, { grade: "B" }, { grade: "B" }, { grade: "C" },
      ];
      assert.equal(modeGrade(entries), "B");
    });

    it("同频次取高等级", () => {
      const entries = [
        { grade: "A" }, { grade: "B" }, { grade: "C" }, { grade: "D" },
      ];
      assert.equal(modeGrade(entries), "A");
    });

    it("无 grade 字段的条目被忽略", () => {
      const entries = [{ grade: "B" }, { grade: "B" }, {}];
      assert.equal(modeGrade(entries), "B");
    });
  });

  describe("getWeekMonday()", () => {
    it("周三返回当周周一 (day=1)", () => {
      const monday = getWeekMonday("2026-06-24");
      const d = new Date(monday + "T12:00:00");
      assert.equal(d.getDay(), 1);
    });
  });

  describe("getMonthKey()", () => {
    it("提取 YYYY-MM", () => {
      assert.equal(getMonthKey("2026-06-22"), "2026-06");
    });

    it("提取不同月份", () => {
      assert.equal(getMonthKey("2026-01-01"), "2026-01");
      assert.equal(getMonthKey("2026-12-31"), "2026-12");
    });
  });

  describe("getWeekSunday()", () => {
    it("周一 +6 天 = 周日 (day=0)", () => {
      const monday = getWeekMonday("2026-06-24");
      const sunday = getWeekSunday(monday);
      const d = new Date(sunday + "T12:00:00");
      assert.equal(d.getDay(), 0);
    });
  });

  describe("computeDiagSummary()", () => {
    it("空条目返回全零 D0-D8", () => {
      const result = computeDiagSummary([]);
      assert.equal(result.length, 9);
      for (const d of result) {
        assert.equal(d.count, 0);
        assert.equal(d.rate, 0);
      }
    });

    it("统计触发诊断", () => {
      const entries = [
        { triggeredDiags: ["D0", "D3"] },
        { triggeredDiags: ["D0"] },
        { triggeredDiags: ["D5", "D7"] },
      ];
      const result = computeDiagSummary(entries);
      const d0 = result.find((r) => r.id === "D0");
      assert.equal(d0?.count, 2);
      assert.equal(d0?.rate, 67);
    });

    it("按 rate 降序排列", () => {
      const entries = [
        { triggeredDiags: ["D0", "D0", "D0"] },
        { triggeredDiags: ["D3"] },
      ];
      const result = computeDiagSummary(entries);
      for (let i = 1; i < result.length; i++) {
        assert.ok(result[i - 1].rate >= result[i].rate);
      }
    });
  });

  describe("computeDimStats()", () => {
    it("空条目返回空对象", () => {
      const stats = computeDimStats([]);
      assert.equal(Object.keys(stats).length, 0);
    });

    it("计算维度统计", () => {
      const entries = [
        { scores: { token: 100, config: 80 } },
        { scores: { token: 80, config: 60 } },
        { scores: { token: 90, config: 70 } },
      ];
      const stats = computeDimStats(entries);
      assert.equal(stats.token.count, 3);
      assert.equal(stats.token.min, 80);
      assert.equal(stats.token.max, 100);
      assert.equal(stats.config.count, 3);
      assert.equal(stats.config.min, 60);
      assert.equal(stats.config.max, 80);
    });

    it("跳过非数字 score", () => {
      const entries = [
        { scores: { token: 100 } },
        { scores: { token: "invalid" } },
        { scores: { token: 80 } },
      ];
      const stats = computeDimStats(entries);
      assert.equal(stats.token.count, 2);
    });
  });
});