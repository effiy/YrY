/**
 * Tests for lib/arch-check.mjs — architecture compliance verification.
 * Tests grading logic, dimension validation, and scoring functions.
 */

import { describe, it, assert } from "../vitest-adapter.mjs";

const VALID_DIMENSIONS = [
  "kernel", "paradigm", "coupling", "srp", "dry",
  "yagni", "ocp", "isp", "frontmatter", "imports",
];

function computeGrade(failedDimCount) {
  if (failedDimCount === 0) return "A";
  if (failedDimCount <= 2) return "B";
  if (failedDimCount <= 4) return "C";
  return "D";
}

function computeScore(passed, total) {
  if (total === 0) return 100;
  return Math.round((passed / total) * 100);
}

function computeSummary(dimensions) {
  const totalChecks = dimensions.reduce((s, d) => s + d.checks.length, 0);
  const passedChecks = dimensions.reduce(
    (s, d) => s + d.checks.filter((c) => c.pass).length, 0
  );
  const failedDims = dimensions.filter((d) => !d.pass);

  return {
    totalChecks,
    passedChecks,
    failedChecks: totalChecks - passedChecks,
    failedDimensions: failedDims.map((d) => d.label),
    overallPass: failedDims.length === 0,
    grade: computeGrade(failedDims.length),
  };
}

describe("lib/arch-check.mjs", () => {
  describe("评级计算", () => {
    it("0 失败维度 → A 级", () => {
      assert.equal(computeGrade(0), "A");
    });

    it("1 失败维度 → B 级", () => {
      assert.equal(computeGrade(1), "B");
    });

    it("2 失败维度 → B 级", () => {
      assert.equal(computeGrade(2), "B");
    });

    it("3 失败维度 → C 级", () => {
      assert.equal(computeGrade(3), "C");
    });

    it("4 失败维度 → C 级", () => {
      assert.equal(computeGrade(4), "C");
    });

    it("5+ 失败维度 → D 级", () => {
      assert.equal(computeGrade(5), "D");
      assert.equal(computeGrade(10), "D");
    });
  });

  describe("评分计算", () => {
    it("全部通过 → 100", () => {
      assert.equal(computeScore(10, 10), 100);
    });

    it("一半通过 → 50", () => {
      assert.equal(computeScore(5, 10), 50);
    });

    it("零通过 → 0", () => {
      assert.equal(computeScore(0, 10), 0);
    });

    it("total 为 0 → 100（空维度）", () => {
      assert.equal(computeScore(0, 0), 100);
    });

    it("四舍五入", () => {
      assert.equal(computeScore(2, 3), 67); // 66.67 → 67
      assert.equal(computeScore(1, 3), 33); // 33.33 → 33
    });
  });

  describe("摘要计算", () => {
    it("全部维度通过", () => {
      const dims = [
        { label: "kernel", pass: true, checks: [{ pass: true }, { pass: true }] },
        { label: "paradigm", pass: true, checks: [{ pass: true }] },
      ];
      const summary = computeSummary(dims);
      assert.ok(summary.overallPass);
      assert.equal(summary.grade, "A");
      assert.equal(summary.failedChecks, 0);
      assert.equal(summary.failedDimensions.length, 0);
    });

    it("一个维度失败", () => {
      const dims = [
        { label: "kernel", pass: true, checks: [{ pass: true }] },
        { label: "paradigm", pass: false, checks: [{ pass: false }] },
      ];
      const summary = computeSummary(dims);
      assert.ok(!summary.overallPass);
      assert.equal(summary.grade, "B");
      assert.equal(summary.failedChecks, 1);
      assert.equal(summary.failedDimensions.length, 1);
      assert.equal(summary.failedDimensions[0], "paradigm");
    });

    it("多个维度部分检查失败", () => {
      const dims = [
        { label: "kernel", pass: true, checks: [{ pass: true }, { pass: true }] },
        { label: "dry", pass: false, checks: [{ pass: true }, { pass: false }, { pass: false }] },
        { label: "srp", pass: false, checks: [{ pass: false }] },
      ];
      const summary = computeSummary(dims);
      assert.ok(!summary.overallPass);
      assert.equal(summary.grade, "B");
      assert.equal(summary.totalChecks, 6);
      assert.equal(summary.passedChecks, 3);
      assert.equal(summary.failedChecks, 3);
    });
  });

  describe("维度列表", () => {
    it("含 10 个核心维度", () => {
      assert.equal(VALID_DIMENSIONS.length, 10);
    });

    it("含 kernel 维度", () => {
      assert.ok(VALID_DIMENSIONS.includes("kernel"));
    });

    it("含 paradigm 维度", () => {
      assert.ok(VALID_DIMENSIONS.includes("paradigm"));
    });

    it("含 coupling 维度", () => {
      assert.ok(VALID_DIMENSIONS.includes("coupling"));
    });

    it("含 srp/dry/yagni/ocp 维度", () => {
      assert.ok(VALID_DIMENSIONS.includes("srp"));
      assert.ok(VALID_DIMENSIONS.includes("dry"));
      assert.ok(VALID_DIMENSIONS.includes("yagni"));
      assert.ok(VALID_DIMENSIONS.includes("ocp"));
    });

    it("含 isp/frontmatter/imports 维度", () => {
      assert.ok(VALID_DIMENSIONS.includes("isp"));
      assert.ok(VALID_DIMENSIONS.includes("frontmatter"));
      assert.ok(VALID_DIMENSIONS.includes("imports"));
    });
  });
});