/**
 * scoring — Enhanced scoring utilities for health, trend, and report analysis.
 *
 * Provides professional-grade scoring functions: multi-tier scoring, trend
 * analysis, moving averages, regression detection, forecast, and anomaly
 * detection. All health/report modules import from here.
 */

import {
  HEALTH_GRADE_THRESHOLDS,
  VOLATILITY_PENALTY_FACTOR,
  VOLATILITY_MIN_HISTORY,
  CONFIDENCE_DISCOUNT,
  CONFIDENCE_RELIABILITY_HIGH,
  CONFIDENCE_RELIABILITY_MEDIUM,
  CORRELATION_MIN_OVERLAP,
  CORRELATION_STRONG,
  CORRELATION_MODERATE,
  STABILIZATION_WINDOW,
  STABILIZATION_CV_THRESHOLD,
  IMPROVEMENT_QUICK_WIN_COUNT,
  IMPROVEMENT_EFFORT_FACTOR,
} from "./constants.mjs";

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

// ── Volatility-adjusted scoring ────────────────────────────────────

/**
 * Compute a volatility-adjusted composite score.
 *
 * High-volatility dimensions get penalized: their effective weight is reduced
 * by VOLATILITY_PENALTY_FACTOR * CV, so noisy dimensions contribute less to
 * the final score. This produces a more conservative (lower) composite when
 * dimensions are unstable.
 *
 * @param {object} scores - { dimKey: score }
 * @param {object} weights - { dimKey: weight }
 * @param {object} [history] - { dimKey: number[] } historical scores per dimension
 * @returns {{ score: number, penalties: Array<{dim: string, cv: number, penalty: number}>, totalPenalty: number }}
 */
export function volatilityAdjustedComposite(scores, weights, history) {
  let totalScore = 0, totalWeight = 0;
  const penalties = [];

  for (const [dim, weight] of Object.entries(weights)) {
    if (scores[dim] === undefined) continue;

    let effectiveWeight = weight;
    const hist = history && history[dim];

    if (hist && hist.length >= VOLATILITY_MIN_HISTORY) {
      const mean = hist.reduce((a, b) => a + b, 0) / hist.length;
      const variance = hist.reduce((s, v) => s + (v - mean) ** 2, 0) / hist.length;
      const stddev = Math.sqrt(variance);
      const cv = mean !== 0 ? stddev / Math.abs(mean) : 0;

      if (cv > 0) {
        const penalty = Math.min(0.5, VOLATILITY_PENALTY_FACTOR * cv);
        effectiveWeight = weight * (1 - penalty);
        penalties.push({ dim, cv: Math.round(cv * 1000) / 1000, penalty: Math.round(penalty * 1000) / 1000 });
      }
    }

    totalScore += scores[dim] * effectiveWeight;
    totalWeight += effectiveWeight;
  }

  const totalPenalty = penalties.reduce((s, p) => s + p.penalty, 0);

  return {
    score: totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0,
    penalties,
    totalPenalty: Math.round(totalPenalty * 1000) / 1000,
  };
}

// ── Confidence-adjusted scoring ─────────────────────────────────────

/**
 * Apply a confidence discount to the composite score based on reliability.
 *
 * When the score has low reliability (high volatility, few data points),
 * a discount is applied to reflect the uncertainty.
 *
 * @param {number} composite - Raw composite score 0-100
 * @param {number} reliability - Reliability score 0-1 from scoreReliability()
 * @returns {{ adjustedScore: number, discount: number, level: 'high'|'medium'|'low' }}
 */
export function confidenceAdjustedComposite(composite, reliability) {
  let level, discount;

  if (reliability >= CONFIDENCE_RELIABILITY_HIGH) {
    level = "high";
    discount = CONFIDENCE_DISCOUNT.high;
  } else if (reliability >= CONFIDENCE_RELIABILITY_MEDIUM) {
    level = "medium";
    discount = CONFIDENCE_DISCOUNT.medium;
  } else {
    level = "low";
    discount = CONFIDENCE_DISCOUNT.low;
  }

  const adjustedScore = Math.max(0, Math.round(composite * (1 - discount)));

  return {
    adjustedScore,
    discount: Math.round(discount * 100),
    level,
  };
}

// ── Cross-dimension correlation ─────────────────────────────────────

/**
 * Compute Pearson correlation between every pair of dimensions.
 *
 * @param {object} dimHistory - { dimLabel: [{date: string, score: number}] }
 * @returns {{ pairs: Array<{dim1: string, dim2: string, r: number, strength: string, n: number}>, clusters: Array<string[]> }}
 */
export function crossDimensionCorrelation(dimHistory) {
  const dims = Object.keys(dimHistory);
  const pairs = [];

  for (let i = 0; i < dims.length; i++) {
    for (let j = i + 1; j < dims.length; j++) {
      const d1 = dims[i], d2 = dims[j];
      const h1 = dimHistory[d1] || [], h2 = dimHistory[d2] || [];

      // Align by date
      const dateMap = {};
      for (const p of h1) {
        if (p.date) dateMap[p.date] = { x: p.score };
      }
      for (const p of h2) {
        if (p.date && dateMap[p.date] !== undefined) {
          dateMap[p.date].y = p.score;
        }
      }

      const aligned = Object.values(dateMap).filter((v) => v.x !== undefined && v.y !== undefined);
      if (aligned.length < CORRELATION_MIN_OVERLAP) continue;

      const n = aligned.length;
      const xs = aligned.map((v) => v.x);
      const ys = aligned.map((v) => v.y);
      const xMean = xs.reduce((a, b) => a + b, 0) / n;
      const yMean = ys.reduce((a, b) => a + b, 0) / n;

      let ssXY = 0, ssXX = 0, ssYY = 0;
      for (let k = 0; k < n; k++) {
        ssXY += (xs[k] - xMean) * (ys[k] - yMean);
        ssXX += (xs[k] - xMean) ** 2;
        ssYY += (ys[k] - yMean) ** 2;
      }

      const r = ssXX > 0 && ssYY > 0 ? ssXY / Math.sqrt(ssXX * ssYY) : 0;
      const absR = Math.abs(r);
      const strength = absR >= CORRELATION_STRONG ? "strong" : absR >= CORRELATION_MODERATE ? "moderate" : "weak";

      pairs.push({
        dim1: d1, dim2: d2,
        r: Math.round(r * 1000) / 1000,
        strength,
        n,
      });
    }
  }

  // Sort by absolute r descending
  pairs.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));

  // Simple transitive clustering: group dims connected by strong positive correlation
  const strongEdges = pairs.filter((p) => p.r >= CORRELATION_STRONG);
  const clusters = [];
  const visited = new Set();

  for (const edge of strongEdges) {
    let found = false;
    for (const cluster of clusters) {
      if (cluster.includes(edge.dim1) || cluster.includes(edge.dim2)) {
        if (!cluster.includes(edge.dim1)) cluster.push(edge.dim1);
        if (!cluster.includes(edge.dim2)) cluster.push(edge.dim2);
        visited.add(edge.dim1);
        visited.add(edge.dim2);
        found = true;
        break;
      }
    }
    if (!found) {
      clusters.push([edge.dim1, edge.dim2]);
      visited.add(edge.dim1);
      visited.add(edge.dim2);
    }
  }

  return { pairs, clusters };
}

// ── Improvement potential ranking ───────────────────────────────────

/**
 * Rank dimensions by their improvement potential (ROI).
 *
 * Combines impact (how much the composite would improve if fixed),
 * effort (proxied by volatility — volatile dimensions are harder to fix),
 * and urgency (trend direction).
 *
 * @param {object} scores - { dimKey: score }
 * @param {object} weights - { dimKey: weight }
 * @param {object} [history] - { dimKey: number[] } historical scores
 * @returns {Array<{dim: string, score: number, impact: number, volatility: number, trend: string, roi: number}>}
 */
export function improvementPotentialRanking(scores, weights, history) {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const entries = [];

  for (const [dim, weight] of Object.entries(weights)) {
    const score = scores[dim];
    if (score === undefined) continue;

    // Impact: how much composite improves if this dimension reaches 100
    const normalizedWeight = weight / totalWeight;
    const impact = Math.round(normalizedWeight * (100 - score));

    // Effort: proxied by historical volatility
    let volatility = 0;
    let trend = "stable";
    if (history && history[dim] && history[dim].length >= 3) {
      const hist = history[dim];
      const distribution = scoreDistribution(hist);
      volatility = distribution.stddev;
      const trendResult = detectTrend(hist);
      trend = trendResult.direction;
    }

    // ROI: impact adjusted by effort and urgency
    const effortFactor = 1 + volatility * IMPROVEMENT_EFFORT_FACTOR / 100;
    const urgencyFactor = trend === "falling" ? 1.2 : 1;
    const roi = Math.round(impact / effortFactor * urgencyFactor * 10) / 10;

    entries.push({
      dim,
      score,
      impact,
      volatility: Math.round(volatility * 10) / 10,
      trend,
      roi,
    });
  }

  entries.sort((a, b) => b.roi - a.roi);
  return entries;
}

/**
 * Identify quick wins: dimensions with high impact and low effort.
 *
 * @param {object} scores - { dimKey: score }
 * @param {object} weights - { dimKey: weight }
 * @param {object} [history] - { dimKey: number[] }
 * @param {number} [limit=3] - Max quick wins to return
 * @returns {Array<{dim: string, score: number, impact: number, estimatedGain: number}>}
 */
export function quickWins(scores, weights, history, limit = IMPROVEMENT_QUICK_WIN_COUNT) {
  const ranked = improvementPotentialRanking(scores, weights, history);

  // Quick wins: high impact, low volatility, positive or stable trend
  const candidates = ranked
    .filter((r) => r.volatility <= 15 && r.trend !== "falling")
    .slice(0, limit);

  return candidates.map((r) => ({
    dim: r.dim,
    score: r.score,
    impact: r.impact,
    estimatedGain: r.impact,
  }));
}

// ── Score stabilization analysis ────────────────────────────────────

/**
 * Analyze whether the score series is converging, stable, or diverging.
 *
 * Uses rolling CV over windows to detect the trend of volatility itself.
 * Converging = volatility is decreasing (system self-correcting).
 * Diverging = volatility is increasing (system becoming unstable).
 *
 * @param {number[]} history - Chronological score array
 * @returns {{ status: 'converging'|'stable'|'diverging', cvTrend: number, currentCV: number, description: string }}
 */
export function scoreStabilization(history) {
  if (history.length < STABILIZATION_WINDOW * 2) {
    return {
      status: "stable",
      cvTrend: 0,
      currentCV: 0,
      description: "数据不足，无法判定稳定性趋势",
    };
  }

  // Compute rolling CV over windows
  const windowSize = Math.min(STABILIZATION_WINDOW, Math.floor(history.length / 2));
  const rollingCVs = [];

  for (let i = 0; i <= history.length - windowSize; i++) {
    const window = history.slice(i, i + windowSize);
    const mean = window.reduce((a, b) => a + b, 0) / window.length;
    const variance = window.reduce((s, v) => s + (v - mean) ** 2, 0) / window.length;
    const stddev = Math.sqrt(variance);
    const cv = mean !== 0 ? stddev / Math.abs(mean) : 0;
    rollingCVs.push(cv);
  }

  const currentCV = rollingCVs[rollingCVs.length - 1];

  // Trend of CV itself
  const cvTrend = detectTrend(rollingCVs);
  let status, description;

  if (cvTrend.direction === "falling" && cvTrend.confidence !== "low") {
    status = "converging";
    description = "评分波动性持续下降，系统趋于稳定";
  } else if (cvTrend.direction === "rising" && cvTrend.confidence !== "low") {
    status = "diverging";
    description = "评分波动性持续上升，系统趋于不稳定，需干预";
  } else if (currentCV < STABILIZATION_CV_THRESHOLD) {
    status = "stable";
    description = "评分波动性低且稳定，系统健康";
  } else {
    status = "stable";
    description = "评分波动性在正常范围内";
  }

  return {
    status,
    cvTrend: cvTrend.slopePerWeek,
    currentCV: Math.round(currentCV * 1000) / 1000,
    description,
  };
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

// ── Dimension influence ranking ─────────────────────────────────

/**
 * Rank dimensions by their statistical influence on the composite score.
 *
 * Influence combines three factors:
 *   1. Weight — how much the dimension counts in the composite
 *   2. Variance — how much the dimension score varies (high variance = more impact on changes)
 *   3. Correlation with composite — how strongly the dimension tracks overall health
 *
 * @param {object} scores - Current { dimKey: score }
 * @param {object} dimensions - HEALTH_SCORING_DIMENSIONS { dimKey: { weight, label, category } }
 * @param {object} [history] - Optional { label: [{date, score}] } from getDimensionHistory()
 * @returns {Array<{dim: string, label: string, influence: number, weight: number, variance: number, correlation: number, category: string}>}
 */
export function rankDimensionInfluence(scores, dimensions, history) {
  var entries = [];

  for (var _a = 0, _b = Object.entries(dimensions); _a < _b.length; _a++) {
    var _c = _b[_a], dim = _c[0], cfg = _c[1];
    if (scores[dim] === undefined) continue;

    // Weight factor: normalized weight
    var weightFactor = cfg.weight;

    // Variance factor: how much this dimension varies historically
    var varianceFactor = 0;
    if (history) {
      var label = cfg.label;
      var points = history[label] || [];
      if (points.length >= 3) {
        var scoreVals = points.map(function(p) { return p.score; });
        var dist = scoreDistribution(scoreVals);
        varianceFactor = dist.stddev; // higher stddev = more volatile = more impactful
      }
    }

    // Current gap factor: how far from perfect (100)
    var gapFactor = 100 - (scores[dim] || 0);

    // Correlation factor: approximate by combining gap and weight
    // (simplified; full correlation would need aligned composite history)
    var correlationFactor = 0;

    // Composite influence score
    var influence = Math.round(
      (weightFactor * 0.4 + varianceFactor * 0.3 + gapFactor * 0.3) * 10
    ) / 10;

    entries.push({
      dim: dim,
      label: cfg.label,
      influence: influence,
      weight: weightFactor,
      variance: Math.round(varianceFactor * 10) / 10,
      correlation: Math.round(correlationFactor * 10) / 10,
      category: cfg.category || "other",
      currentScore: scores[dim] || 0,
      gap: gapFactor,
    });
  }

  // Sort by influence descending
  entries.sort(function(a, b) { return b.influence - a.influence; });

  return entries;
}

// ── Executive summary generation ────────────────────────────────

/**
 * Generate a natural-language executive summary from health check results.
 *
 * @param {object} opts
 * @param {number} opts.composite - Composite score
 * @param {string} opts.grade - Grade letter
 * @param {object} opts.scores - { dimKey: score }
 * @param {object} opts.dimensions - HEALTH_SCORING_DIMENSIONS
 * @param {object} [opts.trend] - From detectTrend()
 * @param {object} [opts.prev] - Previous check { composite, date }
 * @param {object} [opts.archResult] - Architecture check result
 * @param {number} [opts.diagTriggered] - Number of triggered diagnostics
 * @param {Array} [opts.topDrag] - From contributionAnalysis
 * @param {Array} [opts.influence] - From rankDimensionInfluence
 * @returns {{ summary: string, highlights: string[], risks: string[] }}
 */
export function generateExecutiveSummary(opts) {
  var composite = opts.composite || 0;
  var grade = opts.grade || "D";
  var scores = opts.scores || {};
  var dimensions = opts.dimensions || {};
  var trend = opts.trend || null;
  var prev = opts.prev || null;
  var archResult = opts.archResult || null;
  var diagTriggered = opts.diagTriggered || 0;

  var gradeLabel = grade === "A" ? "优秀" : grade === "B" ? "良好" : grade === "C" ? "一般" : "需关注";
  var healthAdj = composite >= 90 ? "健康" : composite >= 75 ? "基本健康" : composite >= 60 ? "需要关注" : "存在风险";

  // Count by category
  var catCounts = { core: { pass: 0, fail: 0 }, structural: { pass: 0, fail: 0 }, engineering: { pass: 0, fail: 0 }, quality: { pass: 0, fail: 0 } };
  for (var _a = 0, _b = Object.entries(scores); _a < _b.length; _a++) {
    var _c = _b[_a], dim = _c[0], score = _c[1];
    var cat = (dimensions[dim] && dimensions[dim].category) || "core";
    if (!catCounts[cat]) catCounts[cat] = { pass: 0, fail: 0 };
    if (score >= 80) catCounts[cat].pass++;
    else catCounts[cat].fail++;
  }

  // Find worst dimensions
  var sortedDims = Object.entries(scores)
    .filter(function(e) { return dimensions[e[0]] !== undefined; })
    .sort(function(a, b) { return a[1] - b[1]; });
  var worst3 = sortedDims.slice(0, 3).map(function(e) {
    return (dimensions[e[0]] && dimensions[e[0]].label) || e[0];
  });
  var best3 = sortedDims.slice(-3).reverse().map(function(e) {
    return (dimensions[e[0]] && dimensions[e[0]].label) || e[0];
  });

  // Build summary paragraph
  var summary = '项目健康综合评分为 ' + composite + ' 分（' + grade + '级·' + gradeLabel + '），整体状态' + healthAdj + '。';

  // Category highlights
  var catParts = [];
  for (var _d = 0, _e = ['core', 'structural', 'engineering', 'quality']; _d < _e.length; _d++) {
    var cat = _e[_d];
    var c = catCounts[cat];
    if (!c || (c.pass + c.fail) === 0) continue;
    var catLabel = { core: '核心运营', structural: '结构健康', engineering: '工程成熟度', quality: '组件质量' }[cat] || cat;
    if (c.fail === 0) catParts.push(catLabel + '全部达标');
    else catParts.push(catLabel + '中 ' + c.fail + '/' + (c.pass + c.fail) + ' 项需关注');
  }
  summary += catParts.join('；') + '。';

  // Trend
  if (trend && trend.confidence !== 'low') {
    summary += '综合评分呈' + (trend.direction === 'rising' ? '上升' : trend.direction === 'falling' ? '下降' : '稳定') + '趋势';
    if (trend.direction !== 'stable') {
      summary += '（' + (trend.slopePerWeek > 0 ? '+' : '') + trend.slopePerWeek + '分/周，置信度' + (trend.confidence === 'high' ? '高' : '中') + '）';
    }
    summary += '。';
  }

  // Comparison
  if (prev) {
    var diff = composite - prev.composite;
    if (diff > 3) summary += '较上次检查提升 ' + diff + ' 分。';
    else if (diff < -3) summary += '较上次检查下降 ' + Math.abs(diff) + ' 分，需关注。';
    else summary += '与上次检查基本持平。';
  }

  // Architecture
  if (archResult) {
    var archFailed = archResult.archFailedDims?.length || 0;
    if (archFailed > 0) summary += '架构合规检查发现 ' + archFailed + ' 个失败维度（' + (archResult.archFailedDims || []).slice(0, 3).join('、') + '）。';
    else summary += '架构合规检查全部通过。';
  }

  // Diagnostics
  if (diagTriggered > 0) summary += '诊断引擎触发 ' + diagTriggered + '/8 项诊断，建议关注。';
  else summary += '诊断引擎无告警。';

  // Highlights (key findings)
  var highlights = [];
  if (worst3.length > 0) {
    highlights.push('需优先改进: ' + worst3.slice(0, 3).join('、'));
  }
  if (best3.length > 0) {
    highlights.push('表现最佳: ' + best3.slice(0, 3).join('、'));
  }
  if (trend && trend.direction === 'falling' && trend.confidence !== 'low') {
    highlights.push('⚠️ 评分呈下降趋势，建议排查根因');
  }
  if (diagTriggered >= 3) {
    highlights.push('⚠️ 多个诊断被触发，系统存在结构性问题');
  }

  // Risks
  var risks = [];
  for (var _f = 0; _f < sortedDims.length && _f < 5; _f++) {
    var _g = sortedDims[_f], dim = _g[0], score = _g[1];
    if (score < 60) {
      risks.push((dimensions[dim] && dimensions[dim].label || dim) + '得分 ' + score + '，需立即处理');
    } else if (score < 80) {
      risks.push((dimensions[dim] && dimensions[dim].label || dim) + '得分 ' + score + '，建议改进');
    }
  }

  if (trend && trend.direction === 'falling' && trend.slopePerWeek < -3) {
    risks.push('若当前趋势持续，7天后评分预计降至 ' + Math.max(0, composite + Math.round(trend.slopePerWeek)) + ' 分');
  }

  return { summary: summary, highlights: highlights, risks: risks };
}

// ── Period comparison ───────────────────────────────────────────────

/**
 * Compare scores between two periods (e.g., week-over-week, month-over-month).
 *
 * @param {object} current - Current period data { composite, scores: {dimKey: score}, date }
 * @param {object} previous - Previous period data { composite, scores: {dimKey: score}, date }
 * @returns {{
 *   compositeDelta: number,
 *   dimDeltas: Array<{dim: string, label: string, current: number, previous: number, delta: number, direction: string}>,
 *   improved: string[], declined: string[],
 *   biggestGain: {dim: string, delta: number}|null,
 *   biggestDrop: {dim: string, delta: number}|null,
 *   netChange: number
 * }}
 */
export function periodComparison(current, previous) {
  const compositeDelta = Math.round((current.composite - previous.composite) * 10) / 10;

  const dimDeltas = [];
  const improved = [];
  const declined = [];

  const allDims = new Set([
    ...Object.keys(current.scores || {}),
    ...Object.keys(previous.scores || {}),
  ]);

  for (const dim of allDims) {
    const cur = current.scores[dim];
    const prev = previous.scores[dim];
    if (cur === undefined || prev === undefined) continue;
    const delta = Math.round((cur - prev) * 10) / 10;
    const entry = {
      dim,
      label: dim,
      current: cur,
      previous: prev,
      delta,
      direction: delta > 0.5 ? "improved" : delta < -0.5 ? "declined" : "stable",
    };
    dimDeltas.push(entry);
    if (entry.direction === "improved") improved.push(dim);
    else if (entry.direction === "declined") declined.push(dim);
  }

  // Sort by absolute delta
  dimDeltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const biggestGain = dimDeltas.filter(d => d.delta > 0)[0] || null;
  const biggestDrop = dimDeltas.filter(d => d.delta < 0)[0] || null;

  return {
    compositeDelta,
    dimDeltas,
    improved,
    declined,
    biggestGain: biggestGain ? { dim: biggestGain.dim, delta: biggestGain.delta } : null,
    biggestDrop: biggestDrop ? { dim: biggestDrop.dim, delta: biggestDrop.delta } : null,
    netChange: improved.length - declined.length,
  };
}

// ── Score reliability ───────────────────────────────────────────────

/**
 * Calculate confidence intervals around the current score based on historical volatility.
 *
 * @param {number[]} history - Chronological score history
 * @param {number} zScore - Z-score for confidence level (1.96 = 95%, default)
 * @returns {{
 *   current: number,
 *   mean: number,
 *   stddev: number,
 *   ci95: [number, number],
 *   volatility: 'low'|'moderate'|'high',
 *   reliability: number
 * }}
 */
export function scoreReliability(history, zScore) {
  if (zScore === undefined) zScore = 1.96; // 95% confidence
  if (history.length < 3) {
    const last = history[history.length - 1] || 0;
    return {
      current: last,
      mean: last,
      stddev: 0,
      ci95: [last, last],
      volatility: "low",
      reliability: 0.3,
    };
  }

  const n = history.length;
  const mean = history.reduce((a, b) => a + b, 0) / n;
  const variance = history.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const stddev = Math.sqrt(variance);
  const current = history[n - 1];
  const margin = zScore * stddev;

  // Coefficient of variation (CV) for volatility classification
  const cv = mean !== 0 ? stddev / mean : 0;

  let volatility;
  if (cv < 0.05) volatility = "low";
  else if (cv < 0.15) volatility = "moderate";
  else volatility = "high";

  // Reliability: inverse of CV, clamped to 0-1
  const reliability = Math.round(Math.max(0, Math.min(1, 1 - cv)) * 100) / 100;

  return {
    current,
    mean: Math.round(mean * 10) / 10,
    stddev: Math.round(stddev * 10) / 10,
    ci95: [Math.round((current - margin) * 10) / 10, Math.round((current + margin) * 10) / 10],
    volatility,
    reliability,
  };
}

// ── Spider/radar chart data ─────────────────────────────────────────

/**
 * Generate spider/radar chart data for multi-dimensional visualization.
 *
 * @param {object} scores - { dimKey: score (0-100) }
 * @param {object} dimensions - { dimKey: { label, weight, category } }
 * @param {object} [opts]
 * @param {number} [opts.maxAxes=8] - Maximum number of axes (top-N by weight)
 * @param {boolean} [opts.byCategory=false] - Group by category instead of individual dims
 * @returns {{
 *   axes: Array<{key: string, label: string, category: string, score: number, weight: number, fullScore: number}>,
 *   categories: Array<{key: string, label: string, score: number}>,
 *   maxScore: number,
 *   overall: number
 * }}
 */
export function spiderChartData(scores, dimensions, opts) {
  const maxAxes = (opts && opts.maxAxes) || 8;
  const byCategory = (opts && opts.byCategory) || false;

  // Per-dimension axes
  const allAxes = Object.entries(dimensions)
    .filter(([dim]) => scores[dim] !== undefined)
    .map(([dim, cfg]) => ({
      key: dim,
      label: cfg.label || dim,
      category: cfg.category || "other",
      score: scores[dim] || 0,
      weight: cfg.weight || 1,
      fullScore: 100, // max for this axis
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, maxAxes);

  // Aggregate by category
  const catMap = {};
  for (const axis of allAxes) {
    if (!catMap[axis.category]) {
      catMap[axis.category] = { key: axis.category, label: axis.category, totalScore: 0, count: 0 };
    }
    catMap[axis.category].totalScore += axis.score;
    catMap[axis.category].count += 1;
  }
  const categories = Object.values(catMap).map(c => ({
    key: c.key,
    label: c.label,
    score: Math.round(c.totalScore / c.count),
  }));

  // Overall from all dimensions
  const allScores = Object.entries(dimensions)
    .filter(([dim]) => scores[dim] !== undefined)
    .map(([dim]) => scores[dim]);
  const overall = allScores.length > 0
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : 0;

  return {
    axes: allAxes,
    categories,
    maxScore: 100,
    overall,
  };
}

// ── Dimension breakdown ──────────────────────────────────────────────

/**
 * Detailed per-dimension analysis with trends, gaps, and recommendations.
 *
 * @param {object} scores - Current { dimKey: score }
 * @param {object} dimensions - HEALTH_SCORING_DIMENSIONS { dimKey: { weight, label, category } }
 * @param {object} [history] - Per-dimension history { label: [{date, score}] }
 * @param {object} [opts]
 * @param {number} [opts.warnThreshold=60] - Score below which is a warning
 * @param {number} [opts.criticalThreshold=40] - Score below which is critical
 * @returns {Array<{
 *   dim: string, label: string, category: string,
 *   score: number, grade: string, weight: number,
 *   status: 'ok'|'warn'|'critical',
 *   trend: string, trendDirection: string,
 *   gap: number, // gap to 100
 *   recommendation: string
 * }>}
 */
export function dimensionBreakdown(scores, dimensions, history, opts) {
  const warnThreshold = (opts && opts.warnThreshold) || 60;
  const criticalThreshold = (opts && opts.criticalThreshold) || 40;

  const breakdown = [];

  for (let _a = 0, _b = Object.entries(dimensions); _a < _b.length; _a++) {
    const _c = _b[_a], dim = _c[0], cfg = _c[1];
    const score = scores[dim];
    if (score === undefined) continue;

    // Trend
    let trendDirection = "stable";
    let trendLabel = "→ 稳定";
    if (history) {
      const points = history[cfg.label] || [];
      if (points.length >= 3) {
        const vals = points.map(p => p.score);
        const trend = detectTrend(vals);
        trendDirection = trend.direction;
        if (trend.direction === "rising") trendLabel = "↑ 上升";
        else if (trend.direction === "falling") trendLabel = "↓ 下降";
      }
    }

    // Grade
    const gradeInfo = getGrade(score);

    // Status
    let status = "ok";
    if (score < criticalThreshold) status = "critical";
    else if (score < warnThreshold) status = "warn";

    // Gap
    const gap = 100 - score;

    // Recommendation
    let recommendation = "";
    if (status === "critical") {
      recommendation = "需立即采取改进措施，该项严重低于基线";
    } else if (status === "warn") {
      recommendation = "建议制定改进计划，提升至良好水平";
    } else if (trendDirection === "falling") {
      recommendation = "注意下降趋势，排查根因防止退化";
    } else if (gap > 20) {
      recommendation = "仍有提升空间，可纳入优化计划";
    } else {
      recommendation = "保持当前水平，持续监控";
    }

    breakdown.push({
      dim,
      label: cfg.label,
      category: cfg.category || "other",
      score,
      grade: gradeInfo.grade,
      weight: cfg.weight,
      status,
      trend: trendLabel,
      trendDirection,
      gap,
      recommendation,
    });
  }

  // Sort: critical first, then warn, then by gap descending
  breakdown.sort((a, b) => {
    const statusOrder = { critical: 0, warn: 1, ok: 2 };
    const sa = statusOrder[a.status];
    const sb = statusOrder[b.status];
    if (sa !== sb) return sa - sb;
    return b.gap - a.gap;
  });

  return breakdown;
}

// ── Score report generation ──────────────────────────────────────────

/**
 * Generate a comprehensive structured score report.
 *
 * This is the primary output function for generating complete scoring reports
 * suitable for HTML rendering, notifications, and trend analysis.
 *
 * @param {object} opts
 * @param {number} opts.composite - Composite score 0-100
 * @param {object} opts.scores - { dimKey: score }
 * @param {object} opts.dimensions - HEALTH_SCORING_DIMENSIONS
 * @param {number[]} [opts.history] - Chronological composite score history
 * @param {object} [opts.dimHistory] - Per-dimension history { label: [{date, score}] }
 * @param {object} [opts.prevPeriod] - Previous period for comparison { composite, scores, date }
 * @param {object} [opts.archResult] - Architecture check result
 * @param {number} [opts.diagTriggered] - Number of triggered diagnostics
 * @param {string} [opts.reportDate] - ISO date string for the report
 * @param {string} [opts.title] - Report title
 * @returns {{
 *   meta: { title: string, date: string, version: string },
 *   composite: { score: number, grade: string, label: string, color: string, tier: string, slo: string },
 *   trend: object,
 *   reliability: object,
 *   forecast: object,
 *   velocity: object,
 *   distribution: object,
 *   categories: object,
 *   spider: object,
 *   breakdown: Array,
 *   contribution: { topDrag: Array, topBoost: Array, dragTotal: number },
 *   comparison: object|null,
 *   architecture: { grade: string, passed: number, failed: number, dims: Array }|null,
 *   diagnostics: { triggered: number, total: number, rate: number },
 *   summary: { text: string, highlights: string[], risks: string[] },
 *   recommendations: Array<{priority: string, dim: string, action: string}>
 * }}
 */
export function generateScoreReport(opts) {
  const composite = opts.composite || 0;
  const scores = opts.scores || {};
  const dimensions = opts.dimensions || {};
  const history = opts.history || [];
  const dimHistory = opts.dimHistory || null;
  const prevPeriod = opts.prevPeriod || null;
  const archResult = opts.archResult || null;
  const diagTriggered = opts.diagTriggered || 0;
  const reportDate = opts.reportDate || new Date().toISOString().slice(0, 10);
  const title = opts.title || "健康评分报告";

  // --- Composite ---
  const gradeInfo = getGrade(composite);
  const tier = classifyScore(composite);
  const sloStatus = composite >= 75 ? "ok" : composite >= 60 ? "warning" : composite >= 40 ? "critical" : "breach";

  // --- Trend ---
  const trend = history.length >= 3 ? detectTrend(history) : null;

  // --- Reliability ---
  const reliability = history.length >= 3 ? scoreReliability(history) : null;

  // --- Forecast ---
  const forecast = history.length >= 5 ? forecastScore(history, 7) : null;

  // --- Velocity ---
  const velocity = history.length >= 3 ? scoreVelocity(history) : null;

  // --- Distribution ---
  const distribution = history.length >= 3 ? scoreDistribution(history) : null;

  // --- Categories ---
  const categories = categoryScores(scores, dimensions);

  // --- Spider chart data ---
  const spider = spiderChartData(scores, dimensions, { maxAxes: 8 });

  // --- Dimension breakdown ---
  const breakdown = dimensionBreakdown(scores, dimensions, dimHistory);

  // --- Contribution analysis ---
  const weights = {};
  for (const [dim, cfg] of Object.entries(dimensions)) {
    weights[dim] = cfg.weight;
  }
  const contribution = contributionAnalysis(scores, weights);

  // --- Period comparison ---
  const comparison = prevPeriod
    ? periodComparison(
        { composite, scores, date: reportDate },
        { composite: prevPeriod.composite, scores: prevPeriod.scores || {}, date: prevPeriod.date }
      )
    : null;

  // --- Architecture ---
  const architecture = archResult
    ? {
        grade: archResult.archGrade || "D",
        passed: archResult.archPassedDims?.length || 0,
        failed: archResult.archFailedDims?.length || 0,
        dims: (archResult.archDimResults || []).map(d => ({
          dim: d.dim || d.name,
          passed: d.passed || d.status === "pass",
          score: d.score || (d.passed ? 100 : 0),
        })),
      }
    : null;

  // --- Diagnostics ---
  const diagnostics = {
    triggered: diagTriggered,
    total: 9, // D0-D8
    rate: Math.round((diagTriggered / 8) * 100),
  };

  // --- Executive summary ---
  const summary = generateExecutiveSummary({
    composite,
    grade: gradeInfo.grade,
    scores,
    dimensions,
    trend,
    prev: prevPeriod ? { composite: prevPeriod.composite, date: prevPeriod.date } : null,
    archResult,
    diagTriggered,
    topDrag: contribution.topDrag,
  });

  // --- Recommendations ---
  const recommendations = [];
  for (let i = 0; i < breakdown.length; i++) {
    const b = breakdown[i];
    if (b.status === "critical") {
      recommendations.push({
        priority: "P0",
        dim: b.label,
        action: b.recommendation,
      });
    } else if (b.status === "warn") {
      recommendations.push({
        priority: "P1",
        dim: b.label,
        action: b.recommendation,
      });
    } else if (b.trendDirection === "falling") {
      recommendations.push({
        priority: "P2",
        dim: b.label,
        action: b.recommendation,
      });
    }
  }

  return {
    meta: {
      title,
      date: reportDate,
      version: "5.4.0",
    },
    composite: {
      score: composite,
      grade: gradeInfo.grade,
      label: gradeInfo.label,
      color: gradeInfo.color,
      tier,
      slo: sloStatus,
    },
    trend: trend ? {
      direction: trend.direction,
      slope: trend.slope,
      slopePerWeek: trend.slopePerWeek,
      r2: trend.r2,
      confidence: trend.confidence,
    } : null,
    reliability: reliability ? {
      current: reliability.current,
      mean: reliability.mean,
      stddev: reliability.stddev,
      ci95: reliability.ci95,
      volatility: reliability.volatility,
      score: reliability.reliability,
    } : null,
    forecast: forecast ? {
      value: forecast.forecast,
      range: forecast.range,
      confidence: forecast.confidence,
    } : null,
    velocity: velocity ? {
      recent: velocity.recent,
      weekly: velocity.weekly,
      accelerating: velocity.accelerating,
    } : null,
    distribution: distribution ? {
      min: distribution.min,
      max: distribution.max,
      mean: distribution.mean,
      median: distribution.median,
      stddev: distribution.stddev,
      p25: distribution.p25,
      p75: distribution.p75,
      range: distribution.range,
    } : null,
    categories,
    spider,
    breakdown,
    contribution,
    comparison,
    architecture,
    diagnostics,
    summary,
    recommendations,
  };

  // ── Enhanced fields ──────────────────────────────────────────────
  // Build per-dimension score history for enhanced functions
  const dimScoreHistory = {};
  if (dimHistory) {
    for (const [label, points] of Object.entries(dimHistory)) {
      dimScoreHistory[label] = points.map((p) => p.score);
    }
  }

  // Volatility-adjusted composite
  if (history.length >= VOLATILITY_MIN_HISTORY) {
    report.volatilityAdjusted = volatilityAdjustedComposite(scores, weights, dimScoreHistory);
  }

  // Confidence-adjusted composite
  if (reliability) {
    report.confidenceAdjusted = confidenceAdjustedComposite(composite, reliability.reliability);
  }

  // Cross-dimension correlation
  if (dimHistory && Object.keys(dimHistory).length >= 2) {
    report.crossCorrelation = crossDimensionCorrelation(dimHistory);
  }

  // Improvement potential
  if (history.length >= 3) {
    report.improvementPotential = {
      ranking: improvementPotentialRanking(scores, weights, dimScoreHistory || {}),
      quickWins: quickWins(scores, weights, dimScoreHistory || {}),
    };
  }

  // Score stabilization
  if (history.length >= STABILIZATION_WINDOW * 2) {
    report.stabilization = scoreStabilization(history);
  }

  return report;
}
