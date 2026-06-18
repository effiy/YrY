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
