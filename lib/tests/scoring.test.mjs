/**
 * Tests for lib/scoring.mjs — verifies score classification, grading,
 * and tier constants work as documented.
 */

import { describe, it, assert, run } from '../vitest-adapter.mjs';

import {
  SCORE_TIERS, classifyScore, getGrade,
  periodComparison, scoreReliability,
  spiderChartData, dimensionBreakdown, generateScoreReport,
  multiTierScore,
  movingAverage, detectTrend, computeComposite,
} from '../scoring.mjs';

function normalizeScore(/** @type {number} */ value, /** @type {number} */ sourceMin, /** @type {number} */ sourceMax, /** @type {number} */ targetMin, /** @type {number} */ targetMax) {
  if (targetMin === undefined) targetMin = 0;
  if (targetMax === undefined) targetMax = 100;
  if (sourceMin === sourceMax) return targetMin;
  const clamped = Math.max(sourceMin, Math.min(sourceMax, value));
  return Math.round(
    (targetMin + ((clamped - sourceMin) * (targetMax - targetMin)) / (sourceMax - sourceMin)) * 10
  ) / 10;
}

describe('lib/scoring.mjs', () => {
  describe('SCORE_TIERS 常量', () => {
    it('包含 4 个分级:excellent/good/fair/poor', () => {
      assert.ok(SCORE_TIERS.excellent >= 0);
      assert.ok(SCORE_TIERS.good >= 0);
      assert.ok(SCORE_TIERS.fair >= 0);
      assert.ok(SCORE_TIERS.poor >= 0);
    });

    it('阈值降序排列', () => {
      assert.ok(SCORE_TIERS.excellent > SCORE_TIERS.good, 'excellent > good');
      assert.ok(SCORE_TIERS.good > SCORE_TIERS.fair, 'good > fair');
      assert.ok(SCORE_TIERS.fair > SCORE_TIERS.poor, 'fair > poor');
    });
  });

  describe('classifyScore()', () => {
    it('100 → excellent', () => assert.equal(classifyScore(100), 'excellent'));
    it('90  → excellent', () => assert.equal(classifyScore(90), 'excellent'));
    it('89  → good', () => assert.equal(classifyScore(89), 'good'));
    it('75  → good', () => assert.equal(classifyScore(75), 'good'));
    it('74  → fair', () => assert.equal(classifyScore(74), 'fair'));
    it('60  → fair', () => assert.equal(classifyScore(60), 'fair'));
    it('59  → poor', () => assert.equal(classifyScore(59), 'poor'));
    it('0   → poor', () => assert.equal(classifyScore(0), 'poor'));
  });

  describe('getGrade()', () => {
    it('返回包含 grade/label/color 的对象', () => {
      const result = getGrade(85);
      assert.equal(typeof result.grade, 'string');
      assert.equal(typeof result.label, 'string');
      assert.equal(typeof result.color, 'string');
    });

    it('100 → 最高等级', () => {
      const result = getGrade(100);
      assert.ok(result.grade === 'A' || result.grade === 'S', 'high score should get top grade');
    });

    it('0 → 返回最低等级 (fallback)', () => {
      const result = getGrade(0);
      assert.ok(result.grade === 'D' || result.grade === 'F', 'zero score should get bottom grade');
    });

    it('负数 → 返回最低等级 (fallback)', () => {
      const result = getGrade(-10);
      assert.ok(result.grade === 'D' || result.grade === 'F', 'negative score should fall back');
    });
  });

  describe('normalizeScore()', () => {
    it('将 0-50 量表映射到 0-100', () => {
      assert.equal(normalizeScore(25, 0, 50, 0, 100), 50);
    });
    it('将 0-100 量表映射到 0-50', () => {
      assert.equal(normalizeScore(50, 0, 100, 0, 50), 25);
    });
    it('超出范围时 clamp 到边界', () => {
      assert.equal(normalizeScore(200, 0, 100, 0, 100), 100);
      assert.equal(normalizeScore(-10, 0, 100, 0, 100), 0);
    });
    it('相同源范围时返回 targetMin', () => {
      assert.equal(normalizeScore(50, 50, 50, 0, 100), 0);
    });
  });

  describe('periodComparison()', () => {
    const current = { composite: 85, scores: { dim_a: 90, dim_b: 70, dim_c: 80 } };
    const previous = { composite: 80, scores: { dim_a: 85, dim_b: 75, dim_c: 80 } };

    it('计算复合分变化量', () => {
      const result = periodComparison(current, previous);
      assert.equal(result.compositeDelta, 5);
    });
    it('识别改善和退化的维度', () => {
      const result = periodComparison(current, previous);
      assert.ok(result.improved.includes('dim_a'), 'dim_a should be improved (+5)');
      assert.ok(result.declined.includes('dim_b'), 'dim_b should be declined (-5)');
    });
    it('识别最大涨幅和最大跌幅', () => {
      const result = periodComparison(current, previous);
      assert.ok(result.biggestGain !== null);
      assert.ok(result.biggestDrop !== null);
    });
    it('netChange 为改善数减退化数', () => {
      const result = periodComparison(current, previous);
      assert.equal(result.netChange, 0); // 1 improved, 1 declined, 1 stable
    });
  });

  describe('scoreReliability()', () => {
    it('稳定高分序列 → 低波动, 高可靠性', () => {
      const result = scoreReliability([90, 91, 90, 92, 91, 90, 91]);
      assert.equal(result.volatility, 'low');
      assert.ok(result.reliability > 0.9, 'high reliability for stable scores');
    });
    it('波动序列 → 高波动, 低可靠性', () => {
      const result = scoreReliability([60, 90, 50, 95, 40, 85, 55]);
      assert.equal(result.volatility, 'high');
      assert.ok(result.reliability < 0.8, 'low reliability for volatile scores');
    });
    it('返回 95% 置信区间', () => {
      const result = scoreReliability([80, 82, 81, 83, 80, 82, 81]);
      assert.ok(Array.isArray(result.ci95));
      assert.equal(result.ci95.length, 2);
      assert.ok(result.ci95[0] <= result.current);
      assert.ok(result.ci95[1] >= result.current);
    });
  });

  describe('spiderChartData()', () => {
    const scores = { dim_a: 85, dim_b: 70, dim_c: 90, dim_d: 60 };
    const dims = {
      dim_a: { label: '维度A', weight: 10, category: 'core' },
      dim_b: { label: '维度B', weight: 8, category: 'core' },
      dim_c: { label: '维度C', weight: 5, category: 'quality' },
      dim_d: { label: '维度D', weight: 3, category: 'quality' },
    };

    it('生成按权重排序的轴数据', () => {
      const result = spiderChartData(scores, dims);
      assert.ok(result.axes.length <= 8);
      assert.equal(result.axes[0].key, 'dim_a'); // highest weight first
    });
    it('包含分类聚合数据', () => {
      const result = spiderChartData(scores, dims);
      assert.ok(result.categories.length > 0);
    });
    it('计算 overall 均值', () => {
      const result = spiderChartData(scores, dims);
      assert.ok(result.overall > 0);
    });
  });

  describe('dimensionBreakdown()', () => {
    const scores = { dim_a: 85, dim_b: 35, dim_c: 55, dim_d: 70 };
    const dims = {
      dim_a: { label: '维度A', weight: 10, category: 'core' },
      dim_b: { label: '维度B', weight: 8, category: 'core' },
      dim_c: { label: '维度C', weight: 5, category: 'quality' },
      dim_d: { label: '维度D', weight: 3, category: 'quality' },
    };

    it('按严重程度排序 (critical → warn → ok)', () => {
      const result = dimensionBreakdown(scores, dims);
      assert.equal(result[0].status, 'critical', 'first should be critical');
      assert.equal(result[0].dim, 'dim_b', 'dim_b has score 35 = critical');
    });
    it('包含推荐建议', () => {
      const result = dimensionBreakdown(scores, dims);
      result.forEach(r => assert.ok(typeof r.recommendation === 'string'));
    });
    it('标注 grade 等级', () => {
      const result = dimensionBreakdown(scores, dims);
      const a = result.find(r => r.dim === 'dim_a');
      assert.equal(a?.grade, 'B'); // 85 → B
    });
  });

  describe('generateScoreReport()', () => {
    const dims = {
      dim_a: { label: '维度A', weight: 20, category: 'core' },
      dim_b: { label: '维度B', weight: 20, category: 'core' },
      dim_c: { label: '维度C', weight: 10, category: 'quality' },
      dim_d: { label: '维度D', weight: 10, category: 'engineering' },
    };
    const scores = { dim_a: 90, dim_b: 80, dim_c: 70, dim_d: 85 };
    const history = [75, 78, 80, 82, 83];

    it('生成完整报告结构 (meta/composite/trend/breakdown)', () => {
      const report = generateScoreReport({
        composite: 83, scores, dimensions: dims, history,
        diagTriggered: 2, reportDate: '2026-06-20', title: '测试报告',
      });
      assert.equal(report.meta.title, '测试报告');
      assert.equal(report.composite.score, 83);
      assert.equal(report.composite.grade, 'B');
      assert.ok(report.trend !== null, 'should have trend data');
      assert.ok(report.breakdown.length === 4, '4 dimensions in breakdown');
      assert.ok(report.recommendations.length >= 0);
    });

    it('无需 history 时也能生成报告', () => {
      const report = generateScoreReport({
        composite: 60, scores: { dim_a: 60 }, dimensions: dims,
      });
      assert.equal(report.trend, null);
      assert.equal(report.reliability, null);
      assert.ok(report.breakdown.length > 0);
    });

    it('包含期间比较数据', () => {
      const report = generateScoreReport({
        composite: 85, scores, dimensions: dims,
        prevPeriod: { composite: 80, scores: { dim_a: 85, dim_b: 75, dim_c: 70, dim_d: 80 }, date: '2026-06-13' },
      });
      assert.ok(report.comparison !== null);
      assert.equal((/** @type {any} */ (report.comparison)).compositeDelta, 5);
    });

    it('包含建议操作', () => {
      const report = generateScoreReport({
        composite: 50, scores: { dim_a: 35, dim_b: 45, dim_c: 55, dim_d: 65 }, dimensions: dims,
        diagTriggered: 5,
      });
      assert.ok(report.recommendations.length > 0);
      assert.ok(report.summary.risks.length > 0);
    });
  });

  describe('movingAverage()', () => {
    it('计算简单移动平均', () => {
      const result = movingAverage([80, 82, 84, 86, 88], 3);
      assert.equal(result.length, 5);
      assert.equal(result[0], null); // first window-1 are null
      assert.equal(result[1], null);
      assert.equal(result[2], 82); // (80+82+84)/3
    });

    it('窗口大于数组时全部为 null', () => {
      const result = movingAverage([80, 82], 5);
      assert.equal(result.length, 2);
      assert.equal(result[0], null);
      assert.equal(result[1], null);
    });
  });

  describe('detectTrend()', () => {
    it('上升趋势返回 rising', () => {
      const result = detectTrend([80, 82, 85, 88, 91]);
      assert.equal(result.direction, 'rising');
    });

    it('下降趋势返回 falling', () => {
      const result = detectTrend([91, 88, 85, 82, 80]);
      assert.equal(result.direction, 'falling');
    });

    it('平稳趋势返回 stable', () => {
      const result = detectTrend([85, 85, 85, 85, 85]);
      assert.equal(result.direction, 'stable');
    });

    it('包含 slope 和 r2 字段', () => {
      const result = detectTrend([80, 82, 85, 88, 91]);
      assert.typeOf(result.slope, 'number');
      assert.typeOf(result.r2, 'number');
      assert.typeOf(result.confidence, 'string');
    });
  });

  describe('computeComposite()', () => {
    it('按权重计算加权平均', () => {
      const scores = { a: 80, b: 90 };
      const weights = { a: 5, b: 5 };
      assert.equal(computeComposite(scores, weights), 85);
    });

    it('单维度返回自身分数', () => {
      assert.equal(computeComposite({ a: 75 }, { a: 10 }), 75);
    });

    it('缺失维度不计入权重', () => {
      assert.equal(computeComposite({ a: 80 }, { a: 5, b: 5 }), 80);
    });
  });

  describe('multiTierScore()', () => {
    it('返回包含 score/tier/label 的结果', () => {
      const tiers = [
        { threshold: 90, score: 100, label: 'A' },
        { threshold: 75, score: 80, label: 'B' },
        { threshold: 60, score: 60, label: 'C' },
      ];
      const result = multiTierScore(tiers, 85);
      assert.equal(result.score, 80);
      assert.equal(result.tier, 1);
      assert.equal(result.label, 'B');
    });
  });
});

await run();
