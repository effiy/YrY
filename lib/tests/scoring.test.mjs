/**
 * Tests for lib/scoring.mjs — verifies score classification, grading,
 * and tier constants work as documented.
 */

import { describe, it, assert, run } from '../test-harness.mjs';

import { SCORE_TIERS, classifyScore, getGrade } from '../scoring.mjs';

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
});

await run();
