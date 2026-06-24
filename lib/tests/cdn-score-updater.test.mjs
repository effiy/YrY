/**
 * Tests for lib/cdn-score-updater.mjs — CDN score report enhancer.
 * Tests score report structure, dimension category mapping, and recommendation generation.
 */

import { describe, it, assert } from "../vitest-adapter.mjs";

function classifyScore(score) {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "fair";
  return "poor";
}

function buildRecommendations(breakdown) {
  return breakdown
    .filter(b => b.status === "critical" || b.status === "warn" || b.trendDirection === "falling")
    .map(b => ({
      priority: b.status === "critical" ? "P0" : b.status === "warn" ? "P1" : "P2",
      dim: b.label,
      score: b.score,
      action: b.recommendation,
    }));
}

function computeDiagRate(triggered, total) {
  return total > 0 ? Math.round((triggered / total) * 100) : 0;
}

function getComponentLabel(cat) {
  const labels = {
    css: "CSS 组件",
    themes: "双主题",
    apis: "JS API",
    scripts: "脚本工具",
  };
  return labels[cat] || cat;
}

function mapCategory(dimLabel) {
  if (["CSS 组件覆盖", "双主题完备性", "JS API 一致性"].includes(dimLabel)) {
    return "quality";
  }
  if (["加载链稳定", "页面迁移率", "字体性能"].includes(dimLabel)) {
    return "structural";
  }
  return "engineering";
}

describe("lib/cdn-score-updater.mjs", () => {
  describe("classifyScore()", () => {
    it("≥ 90 → excellent", () => {
      assert.equal(classifyScore(90), "excellent");
      assert.equal(classifyScore(95), "excellent");
    });

    it("≥ 75 → good", () => {
      assert.equal(classifyScore(75), "good");
      assert.equal(classifyScore(89), "good");
    });

    it("≥ 60 → fair", () => {
      assert.equal(classifyScore(60), "fair");
      assert.equal(classifyScore(74), "fair");
    });

    it("< 60 → poor", () => {
      assert.equal(classifyScore(59), "poor");
      assert.equal(classifyScore(0), "poor");
    });
  });

  describe("buildRecommendations()", () => {
    it("空 breakdown 返回空数组", () => {
      assert.equal(buildRecommendations([]).length, 0);
    });

    it("critical → P0", () => {
      const breakdown = [
        { status: "critical", label: "Token", score: 30, recommendation: "修复" },
      ];
      const recs = buildRecommendations(breakdown);
      assert.equal(recs.length, 1);
      assert.equal(recs[0].priority, "P0");
    });

    it("warn → P1", () => {
      const breakdown = [
        { status: "warn", label: "Git", score: 50, recommendation: "改进" },
      ];
      const recs = buildRecommendations(breakdown);
      assert.equal(recs[0].priority, "P1");
    });

    it("falling trend → P2", () => {
      const breakdown = [
        { status: "ok", trendDirection: "falling", label: "API", score: 80, recommendation: "关注" },
      ];
      const recs = buildRecommendations(breakdown);
      assert.equal(recs[0].priority, "P2");
    });

    it("ok + stable → 不生成建议", () => {
      const breakdown = [
        { status: "ok", trendDirection: "stable", label: "Config", score: 90, recommendation: "保持" },
      ];
      assert.equal(buildRecommendations(breakdown).length, 0);
    });
  });

  describe("computeDiagRate()", () => {
    it("3/8 → 38%", () => {
      assert.equal(computeDiagRate(3, 8), 38);
    });

    it("0/8 → 0%", () => {
      assert.equal(computeDiagRate(0, 8), 0);
    });

    it("total 为 0 → 0%", () => {
      assert.equal(computeDiagRate(0, 0), 0);
    });

    it("全部触发 → 100%", () => {
      assert.equal(computeDiagRate(8, 8), 100);
    });
  });

  describe("getComponentLabel()", () => {
    it("css → CSS 组件", () => {
      assert.equal(getComponentLabel("css"), "CSS 组件");
    });

    it("themes → 双主题", () => {
      assert.equal(getComponentLabel("themes"), "双主题");
    });

    it("apis → JS API", () => {
      assert.equal(getComponentLabel("apis"), "JS API");
    });

    it("未知类别返回原名", () => {
      assert.equal(getComponentLabel("unknown"), "unknown");
    });
  });

  describe("mapCategory()", () => {
    it("CSS 组件覆盖 → quality", () => {
      assert.equal(mapCategory("CSS 组件覆盖"), "quality");
    });

    it("双主题完备性 → quality", () => {
      assert.equal(mapCategory("双主题完备性"), "quality");
    });

    it("加载链稳定 → structural", () => {
      assert.equal(mapCategory("加载链稳定"), "structural");
    });

    it("未知维度 → engineering", () => {
      assert.equal(mapCategory("未知维度"), "engineering");
    });
  });
});