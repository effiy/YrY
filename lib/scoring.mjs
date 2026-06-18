/**
 * scoring — Enhanced scoring utilities for health, trend, and report analysis.
 *
 * Provides professional-grade scoring functions: multi-tier scoring, trend
 * analysis, moving averages, regression detection, forecast, and anomaly
 * detection. All health/report modules import from here.
 */

import { HEALTH_GRADE_THRESHOLDS } from "./constants.mjs";

// ── Score classification ──────────────────────────────────────────

/** Score tier thresholds */
export const SCORE_TIERS = {
  excellent: 90,   // ≥ 90: 优秀
  good:      75,   // ≥ 75: 良好
  fair:      60,   // ≥ 60: 一般
  poor:      0,    // < 60: 需关注
};

/**
 * Classify a score into a tier.
 * @param {number} score - 0-100 score
 * @returns {'excellent'|'good'|'fair'|'poor'}
 */
export function classifyScore(score) {
  if (score >= SCORE_TIERS.excellent) return "excellent";
  if (score >= SCORE_TIERS.good) return "good";
  if (score >= SCORE_TIERS.fair) return "fair";
  return "poor";
}

/**
 * Get grade letter from composite score.
 * @param {number} score
 * @returns {{ grade: string, label: string, color: string }}
 */
export function getGrade(score) {
  return HEALTH_GRADE_THRESHOLDS.find(g => score >= g.min)
    || HEALTH_GRADE_THRESHOLDS[HEALTH_GRADE_THRESHOLDS.length - 1];
}

// ── Multi-tier scoring ────────────────────────────────────────────

/**
 * Score a dimension with multi-tier thresholds.
 *
 * Instead of binary pass/fail, this supports up to 5 tiers with distinct
 * scores, producing more nuanced and actionable results.
 *
 * @param {Array<{threshold: number, score: number, label?: string}>} tiers
 *        Array of {threshold, score} sorted by threshold DESC.
 *        threshold = minimum raw value to qualify for this score.
 *        First matching tier wins.
 * @param {number} rawValue - The measured raw value
 * @returns {{ score: number, tier: number, label: string }}
 *
 * @example
 *   // Token length scoring
 *   multiTierScore([
 *     { threshold: 30, score: 100, label: "长令牌 (≥30字符)" },
 *     { threshold: 16, score: 80,  label: "标准令牌 (≥16字符)" },
 *     { threshold: 1,  score: 40,  label: "短令牌 (<16字符)" },
 *   ], tokenLen) // → { score: 100, tier: 0, label: "长令牌" }
 */
export function multiTierScore(tiers, rawValue) {
  for (let i = 0; i < tiers.length; i++) {
    if (rawValue >= tiers[i].threshold) {
      return {
        score: tiers[i].score,
        tier: i,
        label: tiers[i].label || `Tier ${i}`,
      };
    }
  }
  return { score: 0, tier: tiers.length, label: "未达标" };
}

/**
 * Weighted sub-criteria scoring.
 *
 * Combines multiple boolean/percentage sub-checks into a single dimension
 * score, each contributing its weight to the total.
 *
 * @param {Array<{weight: number, pass: boolean, label: string}>} criteria
 * @returns {{ score: number, passed: string[], failed: string[], breakdown: object }}
 */
export function weightedSubScore(criteria) {
  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0);
  if (totalWeight === 0) return { score: 0, passed: [], failed: [], breakdown: {} };

  let earnedWeight = 0;
  const passed = [];
  const failed = [];
  const breakdown = {};

  for (const c of criteria) {
    breakdown[c.label] = c.pass;
    if (c.pass) {
      earnedWeight += c.weight;
      passed.push(c.label);
    } else {
      failed.push(c.label);
    }
  }

  return {
    score: Math.round((earnedWeight / totalWeight) * 100),
    passed,
    failed,
    breakdown,
  };
}

// ── Trend analysis ────────────────────────────────────────────────

/**
 * Compute simple moving average (SMA) over a score history array.
 *
 * @param {number[]} history - Array of scores (chronological order)
 * @param {number} window - Window size (default 7)
 * @returns {number[]} SMA values, same length as input (first window-1 values are null)
 */
export function movingAverage(history, window = 7) {
  const result = [];
  for (let i = 0; i < history.length; i++) {
    if (i < window - 1) {
      result.push(null);
    } else {
      const slice = history.slice(i - window + 1, i + 1);
      result.push(Math.round(slice.reduce((a, b) => a + b, 0) / slice.length));
    }
  }
  return result;
}

/**
 * Compute exponential moving average (EMA).
 *
 * @param {number[]} history
 * @param {number} alpha - Smoothing factor (0-1, default 0.3)
 * @returns {number[]}
 */
export function exponentialMA(history, alpha = 0.3) {
  if (history.length === 0) return [];
  const result = [history[0]];
  for (let i = 1; i < history.length; i++) {
    result.push(Math.round(alpha * history[i] + (1 - alpha) * result[i - 1]));
  }
  return result;
}

/**
 * Detect trend direction and velocity using linear regression.
 *
 * @param {number[]} history - Chronological score array
 * @returns {{
 *   direction: 'rising'|'falling'|'stable',
 *   slope: number,         // points per data point
 *   slopePerWeek: number,  // projected change over 7 data points
 *   r2: number,            // goodness of fit (0-1)
 *   confidence: 'high'|'medium'|'low'
 * }}
 */
export function detectTrend(history) {
  if (history.length < 3) {
    return { direction: "stable", slope: 0, slopePerWeek: 0, r2: 0, confidence: "low" };
  }

  const n = history.length;
  const xMean = (n - 1) / 2;
  const yMean = history.reduce((a, b) => a + b, 0) / n;

  let ssXY = 0, ssXX = 0, ssYY = 0;
  for (let i = 0; i < n; i++) {
    const dx = i - xMean;
    const dy = history[i] - yMean;
    ssXY += dx * dy;
    ssXX += dx * dx;
    ssYY += dy * dy;
  }

  const slope = ssXX !== 0 ? ssXY / ssXX : 0;
  const r2 = ssYY !== 0 ? (ssXY * ssXY) / (ssXX * ssYY) : 0;
  const slopePerWeek = slope * 7;

  let direction;
  const absSlopePerWeek = Math.abs(slopePerWeek);
  if (absSlopePerWeek < 1) direction = "stable";
  else if (slope > 0) direction = "rising";
  else direction = "falling";

  let confidence;
  if (r2 >= 0.7) confidence = "high";
  else if (r2 >= 0.4) confidence = "medium";
  else confidence = "low";

  return {
    direction,
    slope: Math.round(slope * 100) / 100,
    slopePerWeek: Math.round(slopePerWeek * 100) / 100,
    r2: Math.round(r2 * 100) / 100,
    confidence,
  };
}

/**
 * Forecast future score using linear regression.
 *
 * @param {number[]} history
 * @param {number} periodsAhead - How many data points to forecast (default 7)
 * @returns {{ forecast: number, range: [number, number], confidence: string }}
 */
export function forecastScore(history, periodsAhead = 7) {
  const trend = detectTrend(history);
  if (trend.confidence === "low" || history.length < 5) {
    const lastScore = history[history.length - 1] || 0;
    return { forecast: lastScore, range: [lastScore - 10, lastScore + 10], confidence: "low" };
  }

  const lastIdx = history.length - 1;
  const forecast = Math.round(history[lastIdx] + trend.slope * periodsAhead);

  // Prediction interval based on historical stddev
  const mean = history.reduce((a, b) => a + b, 0) / history.length;
  const variance = history.reduce((s, v) => s + (v - mean) ** 2, 0) / history.length;
  const stddev = Math.sqrt(variance);
  const margin = Math.round(stddev * 1.5);

  return {
    forecast: Math.max(0, Math.min(100, forecast)),
    range: [Math.max(0, forecast - margin), Math.min(100, forecast + margin)],
    confidence: trend.confidence,
  };
}

// ── Anomaly detection ─────────────────────────────────────────────

/**
 * Detect anomalous scores using modified Z-score (MAD-based).
 * More robust than standard deviation for small samples.
 *
 * @param {number[]} history
 * @param {number} threshold - Modified Z-score threshold (default 3.5)
 * @returns {number[]} Indices of anomalous values
 */
export function detectAnomalies(history, threshold = 3.5) {
  if (history.length < 5) return [];

  const median = [...history].sort((a, b) => a - b)[Math.floor(history.length / 2)];
  const deviations = history.map(v => Math.abs(v - median));
  const mad = [...deviations].sort((a, b) => a - b)[Math.floor(deviations.length / 2)];

  if (mad === 0) return [];

  const anomalies = [];
  for (let i = 0; i < history.length; i++) {
    const modifiedZ = 0.6745 * Math.abs(history[i] - median) / mad;
    if (modifiedZ > threshold) {
      anomalies.push(i);
    }
  }
  return anomalies;
}

// ── Score distribution ────────────────────────────────────────────

/**
 * Compute score distribution statistics.
 *
 * @param {number[]} scores
 * @returns {{
 *   min: number, max: number, mean: number, median: number,
 *   stddev: number, p25: number, p75: number, range: number
 * }}
 */
export function scoreDistribution(scores) {
  if (scores.length === 0) {
    return { min: 0, max: 0, mean: 0, median: 0, stddev: 0, p25: 0, p75: 0, range: 0 };
  }

  const sorted = [...scores].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((a, b) => a + b, 0) / n;
  const variance = sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];
  const p25 = sorted[Math.floor(n * 0.25)];
  const p75 = sorted[Math.floor(n * 0.75)];

  return {
    min: sorted[0],
    max: sorted[n - 1],
    mean: Math.round(mean * 10) / 10,
    median,
    stddev: Math.round(Math.sqrt(variance) * 10) / 10,
    p25,
    p75,
    range: sorted[n - 1] - sorted[0],
  };
}

/**
 * Compute score velocity (rate of change).
 *
 * @param {number[]} history
 * @returns {{ recent: number, weekly: number, accelerating: boolean }}
 */
export function scoreVelocity(history) {
  if (history.length < 3) return { recent: 0, weekly: 0, accelerating: false };

  const recent = history[history.length - 1] - history[history.length - 2];
  const half = Math.floor(history.length / 2);
  const firstHalf = history.slice(0, half);
  const secondHalf = history.slice(half);
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const weekly = Math.round((secondAvg - firstAvg) * 10) / 10;

  return {
    recent,
    weekly,
    accelerating: Math.abs(recent) > Math.abs(weekly) && recent * weekly > 0,
  };
}

// ── Correlation ───────────────────────────────────────────────────

/**
 * Compute Pearson correlation coefficient between two score arrays.
 *
 * @param {number[]} xs
 * @param {number[]} ys
 * @returns {number} r ∈ [-1, 1]
 */
export function pearsonCorrelation(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return 0;

  const xMean = xs.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const yMean = ys.slice(0, n).reduce((a, b) => a + b, 0) / n;

  let ssXY = 0, ssXX = 0, ssYY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - xMean;
    const dy = ys[i] - yMean;
    ssXY += dx * dy;
    ssXX += dx * dx;
    ssYY += dy * dy;
  }

  const denom = Math.sqrt(ssXX * ssYY);
  return denom !== 0 ? Math.round(ssXY / denom * 100) / 100 : 0;
}

// ── Contribution analysis ─────────────────────────────────────────

/**
 * Analyze which dimensions contribute most to the composite score.
 * Identifies top drag and top boost dimensions.
 *
 * @param {object} scores - { dimKey: score }
 * @param {object} weights - { dimKey: weight }
 * @returns {{
 *   topDrag: Array<{dim: string, impact: number}>,
 *   topBoost: Array<{dim: string, impact: number}>,
 *   dragTotal: number
 * }}
 */
export function contributionAnalysis(scores, weights) {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const entries = Object.entries(scores)
    .filter(([dim]) => weights[dim] !== undefined)
    .map(([dim, score]) => {
      const weight = weights[dim];
      const contribution = (score * weight) / totalWeight;
      const maxContribution = (100 * weight) / totalWeight;
      const gap = maxContribution - contribution; // points lost from max
      return { dim, score, weight, contribution, maxContribution, gap };
    });

  const sorted = entries.sort((a, b) => b.gap - a.gap);
  const topDrag = sorted.filter(e => e.gap > 0).slice(0, 5);
  const topBoost = [...entries]
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 5);
  const dragTotal = topDrag.reduce((s, e) => s + e.gap, 0);

  return { topDrag, topBoost, dragTotal: Math.round(dragTotal * 10) / 10 };
}

// ── Score confidence ──────────────────────────────────────────────

/**
 * Calculate confidence level for a score based on data quality indicators.
 *
 * @param {object} opts
 * @param {boolean} opts.bootstrapped - Whether score is from bootstrap (less reliable)
 * @param {number} opts.dataPoints - Number of data points backing the score
 * @param {boolean} opts.directMeasure - Whether score is from direct measurement vs heuristic
 * @returns {{ level: 'high'|'medium'|'low', value: number }}
 */
export function scoreConfidence({ bootstrapped = false, dataPoints = 1, directMeasure = true } = {}) {
  let value = 1.0;
  if (bootstrapped) value -= 0.3;
  if (dataPoints < 3) value -= 0.2;
  else if (dataPoints >= 10) value += 0.1;
  if (!directMeasure) value -= 0.15;

  value = Math.max(0, Math.min(1, value));

  let level;
  if (value >= 0.8) level = "high";
  else if (value >= 0.5) level = "medium";
  else level = "low";

  return { level, value: Math.round(value * 100) / 100 };
}

// ── Composite helpers ─────────────────────────────────────────────

/**
 * Compute composite score from dimension scores and weights.
 *
 * @param {object} scores - { dimKey: score }
 * @param {object} weights - { dimKey: weight }
 * @returns {number} Composite score 0-100
 */
export function computeComposite(scores, weights) {
  let totalScore = 0, totalWeight = 0;
  for (const [dim, weight] of Object.entries(weights)) {
    if (scores[dim] !== undefined) {
      totalScore += scores[dim] * weight;
      totalWeight += weight;
    }
  }
  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
}

/**
 * Compute category sub-scores.
 *
 * @param {object} scores - { dimKey: score }
 * @param {object} dimensions - { dimKey: { category, weight } }
 * @returns {object} { [category]: { score, weight, dims } }
 */
export function categoryScores(scores, dimensions) {
  const cats = {};
  for (const [dim, cfg] of Object.entries(dimensions)) {
    const cat = cfg.category || "other";
    if (!cats[cat]) cats[cat] = { totalScore: 0, totalWeight: 0, dims: {} };
    const score = scores[dim];
    if (score !== undefined) {
      cats[cat].totalScore += score * cfg.weight;
      cats[cat].totalWeight += cfg.weight;
      cats[cat].dims[dim] = score;
    }
  }
  const result = {};
  for (const [cat, data] of Object.entries(cats)) {
    result[cat] = {
      score: data.totalWeight > 0 ? Math.round(data.totalScore / data.totalWeight) : 0,
      weight: data.totalWeight,
      dimCount: Object.keys(data.dims).length,
    };
  }
  return result;
}
