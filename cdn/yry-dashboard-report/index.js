/**
 * YrY 文档中心 · 评分报告数据填充脚本
 * 从 docs/index.html 内联 <script> 迁出，保持 IIFE 结构以兼容现有加载顺序
 * 数据源优先级: score-report.json → summary.json → cdn-summary/index.json → 内置默认值
 */
(function() {
  'use strict';

  /* ── 评分工具函数 (浏览器端复刻 lib/scoring.mjs 核心逻辑) ── */
  const SCORE_TIERS = { excellent: 90, good: 75, fair: 60, poor: 0 };
  const GRADE_THRESHOLDS = [
    { grade: 'A', min: 90, label: '优秀', color: '#4ade80' },
    { grade: 'B', min: 75, label: '良好', color: '#60a5fa' },
    { grade: 'C', min: 60, label: '一般', color: '#fbbf24' },
    { grade: 'D', min: 0,  label: '需关注', color: '#f87171' }
  ];

  function getGrade(score) {
    for (let i = 0; i < GRADE_THRESHOLDS.length; i++) {
      if (score >= GRADE_THRESHOLDS[i].min) return GRADE_THRESHOLDS[i];
    }
    return GRADE_THRESHOLDS[GRADE_THRESHOLDS.length - 1];
  }

  function classifyScore(score) {
    if (score >= SCORE_TIERS.excellent) return 'excellent';
    if (score >= SCORE_TIERS.good) return 'good';
    if (score >= SCORE_TIERS.fair) return 'fair';
    return 'poor';
  }

  function detectTrend(history) {
    if (!history || history.length < 3) return null;
    const n = history.length;
    const xMean = (n - 1) / 2;
    let yMean = 0;
    for (var i = 0; i < n; i++) yMean += history[i];
    yMean /= n;
    let ssXY = 0, ssXX = 0, ssYY = 0;
    for (var i = 0; i < n; i++) {
      const dx = i - xMean;
      const dy = history[i] - yMean;
      ssXY += dx * dy;
      ssXX += dx * dx;
      ssYY += dy * dy;
    }
    const slope = ssXX !== 0 ? ssXY / ssXX : 0;
    const r2 = ssYY !== 0 ? (ssXY * ssXY) / (ssXX * ssYY) : 0;
    const slopePerWeek = slope * 7;
    const direction = Math.abs(slopePerWeek) < 1 ? 'stable' : (slope > 0 ? 'rising' : 'falling');
    const confidence = r2 >= 0.7 ? 'high' : (r2 >= 0.4 ? 'medium' : 'low');
    return {
      direction: direction, slope: Math.round(slope * 100) / 100,
      slopePerWeek: Math.round(slopePerWeek * 100) / 100,
      r2: Math.round(r2 * 100) / 100, confidence: confidence
    };
  }

  function forecastScore(history, periodsAhead) {
    periodsAhead = periodsAhead || 7;
    const trend = detectTrend(history);
    if (!trend || trend.confidence === 'low' || history.length < 5) {
      const lastScore = history && history.length ? history[history.length - 1] : 0;
      return { forecast: lastScore, range: [lastScore - 10, lastScore + 10], confidence: 'low' };
    }
    const lastIdx = history.length - 1;
    const fc = Math.round(history[lastIdx] + trend.slope * periodsAhead);
    let mean = 0;
    for (var i = 0; i < history.length; i++) mean += history[i];
    mean /= history.length;
    let variance = 0;
    for (var i = 0; i < history.length; i++) variance += Math.pow(history[i] - mean, 2);
    variance /= history.length;
    const stddev = Math.sqrt(variance);
    const margin = Math.round(stddev * 1.5);
    return {
      forecast: Math.max(0, Math.min(100, fc)),
      range: [Math.max(0, fc - margin), Math.min(100, fc + margin)],
      confidence: trend.confidence
    };
  }

  function scoreReliability(history) {
    if (!history || history.length < 3) return null;
    const n = history.length;
    let mean = 0;
    for (var i = 0; i < n; i++) mean += history[i];
    mean /= n;
    let variance = 0;
    for (var i = 0; i < n; i++) variance += Math.pow(history[i] - mean, 2);
    variance /= n;
    const stddev = Math.sqrt(variance);
    const cv = mean !== 0 ? stddev / mean : 0;
    const volatility = cv < 0.05 ? 'low' : (cv < 0.15 ? 'moderate' : 'high');
    const reliability = Math.max(0, Math.min(1, 1 - cv));
    return {
      mean: Math.round(mean * 10) / 10,
      stddev: Math.round(stddev * 10) / 10,
      volatility: volatility,
      reliability: Math.round(reliability * 100) / 100
    };
  }

  /* ── 域名感知: 自动选择正确的数据源基础路径 ── */
  function getBasePath() {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return '..';
    if (host.includes('cdn')) return '..';
    return '..';
  }

  /* ── 渲染评分报告 ── */
  function renderScoreReport(data) {
    const composite = data.composite || 0;
    const gradeInfo = getGrade(composite);
    const tier = classifyScore(composite);

    // 分数变化 delta toast (仅在非首次刷新时)
    if (_lastCompositeScore !== null && _lastCompositeScore !== composite) {
      var delta = Math.round((composite - _lastCompositeScore) * 10) / 10;
      const absDelta = Math.abs(delta);
      if (absDelta >= 1) {
        const type = delta > 0 ? 'success' : 'warning';
        const arrow = delta > 0 ? '↑' : '↓';
        showToast({
          type: type,
          title: '评分' + arrow + ' ' + (delta > 0 ? '+' : '') + delta + ' 分',
          text: '从 ' + _lastCompositeScore + ' 变为 ' + composite + '（' + gradeInfo.grade + '级）',
          duration: absDelta >= 3 ? 6000 : 3500
        });
      }
    }
    _lastCompositeScore = composite;

    // 优先使用内嵌的完整评分报告
    const fullReport = data._scoreReport || data;

    // 概述网格
    const elComp = document.getElementById('sr-composite');
    if (elComp) {
      elComp.classList.remove('is-loading');
      animateCountUp(elComp, composite);
      elComp.style.color = gradeInfo.color;
    }
    const elGrade = document.getElementById('sr-grade-label');
    if (elGrade) {
      elGrade.classList.remove('is-loading');
      elGrade.textContent = gradeInfo.grade + '级 · ' + gradeInfo.label;
    }
    // "距 A 级 X 分" 提示
    const elHint = document.getElementById('sr-grade-hint');
    if (elHint) {
      const target = 90;
      if (composite >= 90) {
        elHint.textContent = '✓ 已达 A 级（≥' + target + '）';
        elHint.className = 'sr-cell-hint is-positive';
      } else if (composite >= 75) {
        const gap = target - composite;
        elHint.textContent = '距 A 级还差 ' + gap + ' 分';
        elHint.className = 'sr-cell-hint is-neutral';
      } else {
        const gap2 = target - composite;
        elHint.textContent = '距 A 级还差 ' + gap2 + ' 分（需关注）';
        elHint.className = 'sr-cell-hint is-negative';
      }
    }
    // SVG 圆环仪表
    const gaugeFill = document.getElementById('sr-gauge-fill');
    const gaugeText = document.getElementById('sr-gauge-text');
    if (gaugeFill) {
      const circumference = 2 * Math.PI * 34;
      const offset = circumference * (1 - composite / 100);
      gaugeFill.setAttribute('stroke-dasharray', circumference.toFixed(2));
      gaugeFill.setAttribute('stroke-dashoffset', offset.toFixed(2));
      gaugeFill.setAttribute('stroke', gradeInfo.color);
    }
    if (gaugeText) {
      gaugeText.textContent = gradeInfo.grade;
      gaugeText.setAttribute('fill', gradeInfo.color);
    }

    // 趋势 — 优先使用完整报告的趋势数据
    let trend = null;
    if (fullReport.trend && fullReport.trend.direction) {
      trend = {
        direction: fullReport.trend.direction,
        slopePerWeek: fullReport.trend.slopePerWeek || 0,
        r2: fullReport.trend.r2 || 0,
        confidence: fullReport.trend.confidence || 'low'
      };
    } else {
      var scoreHistory = data.scoreTrend || [];
      var historyVals = [];
      for (var i = 0; i < scoreHistory.length; i++) {
        if (typeof scoreHistory[i].score === 'number') historyVals.push(scoreHistory[i].score);
        else if (typeof scoreHistory[i].composite === 'number') historyVals.push(scoreHistory[i].composite);
      }
      trend = detectTrend(historyVals);
    }

    // 预测与可靠性 — 优先使用完整报告的数据
    let forecast = null;
    if (fullReport.forecast && typeof fullReport.forecast.value === 'number') {
      forecast = {
        forecast: fullReport.forecast.value,
        range: fullReport.forecast.range || [fullReport.forecast.value - 10, fullReport.forecast.value + 10],
        confidence: fullReport.forecast.confidence || 'low'
      };
    } else {
      var historyVals = [];
      var scoreHistory = data.scoreTrend || [];
      for (var i = 0; i < scoreHistory.length; i++) {
        if (typeof scoreHistory[i].score === 'number') historyVals.push(scoreHistory[i].score);
        else if (typeof scoreHistory[i].composite === 'number') historyVals.push(scoreHistory[i].composite);
      }
      forecast = forecastScore(historyVals);
    }

    let reliability = null;
    if (fullReport.reliability && typeof fullReport.reliability.score === 'number') {
      reliability = {
        reliability: fullReport.reliability.score,
        volatility: fullReport.reliability.volatility || 'low'
      };
    } else {
      const historyVals2 = [];
      const scoreHistory2 = data.scoreTrend || [];
      for (let i2 = 0; i2 < scoreHistory2.length; i2++) {
        if (typeof scoreHistory2[i2].score === 'number') historyVals2.push(scoreHistory2[i2].score);
        else if (typeof scoreHistory2[i2].composite === 'number') historyVals2.push(scoreHistory2[i2].composite);
      }
      reliability = scoreReliability(historyVals2);
    }

    const trendEmoji = { rising: '📈', falling: '📉', stable: '➡️' };
    const trendLabel = { rising: '上升', falling: '下降', stable: '稳定' };

    const elTrendDir = document.getElementById('sr-trend-dir');
    if (elTrendDir && trend) {
      elTrendDir.textContent = trendEmoji[trend.direction] + ' ' + trendLabel[trend.direction];
    }
    const elTrendDetail = document.getElementById('sr-trend-detail');
    if (elTrendDetail && trend) {
      elTrendDetail.textContent = (trend.slopePerWeek > 0 ? '+' : '') + trend.slopePerWeek + '分/周 · 置信度' +
        (trend.confidence === 'high' ? '高' : trend.confidence === 'medium' ? '中' : '低') +
        ' · R²=' + trend.r2;
    }

    const elFc = document.getElementById('sr-forecast');
    if (elFc && forecast) {
      elFc.textContent = forecast.forecast;
      const fcGrade = getGrade(forecast.forecast);
      elFc.style.color = fcGrade.color;
    }
    const elFcRange = document.getElementById('sr-forecast-range');
    if (elFcRange && forecast) {
      elFcRange.textContent = forecast.range[0] + ' – ' + forecast.range[1] + ' (95% CI)';
    }

    const elRel = document.getElementById('sr-reliability');
    if (elRel && reliability) {
      elRel.textContent = Math.round(reliability.reliability * 100) + '%';
    }
    const elVol = document.getElementById('sr-volatility');
    if (elVol && reliability) {
      const volLabel = { low: '低波动·高可靠', moderate: '中等波动', high: '高波动·低可靠' };
      elVol.textContent = volLabel[reliability.volatility] || '';
    }

    const elDiag = document.getElementById('sr-diag');
    if (elDiag) {
      var triggered = data.diagTriggered || (data.diagSummary ? data.diagSummary.triggered : 0) || 0;
      elDiag.textContent = triggered + '/8';
      if (triggered >= 3) elDiag.style.color = '#f87171';
      else if (triggered >= 1) elDiag.style.color = '#fbbf24';
      else elDiag.style.color = '#4ade80';
    }

    const elArch = document.getElementById('sr-arch');
    const elArchDetail = document.getElementById('sr-arch-detail');
    if (elArch && data.archHealth) {
      const archGrade = data.archHealth.grade || '—';
      elArch.textContent = archGrade + '级';
      if (archGrade === 'A') elArch.style.color = '#4ade80';
      else if (archGrade === 'B') elArch.style.color = '#60a5fa';
      else if (archGrade === 'C') elArch.style.color = '#fbbf24';
      else elArch.style.color = '#f87171';
    }
    if (elArchDetail) {
      elArchDetail.textContent = '10维合规检查';
    }

    // 维度分解
    var dims = data.dimensions || data.dimSummary || {};
    const dimEntries = [];
    for (const key in dims) {
      if (dims.hasOwnProperty(key)) {
        const d = dims[key];
        dimEntries.push({
          key: key,
          label: d.label || key,
          score: d.score || d.avgScore || d.current || 0,
          trend: d.trend || d.trendDirection || 'stable',
          category: d.category || 'core'
        });
      }
    }
    // 排序: 低分优先
    dimEntries.sort(function(a, b) { return a.score - b.score; });

    // 只显示前 10 个维度,突出 critical/warn
    const displayDims = dimEntries.slice(0, 10);
    const dimListEl = document.getElementById('sr-dim-list');
    if (dimListEl && displayDims.length > 0) {
      let html = '';
      for (var i = 0; i < displayDims.length; i++) {
        const dim = displayDims[i];
        const dimGrade = getGrade(dim.score);
        const barClass = classifyScore(dim.score);
        const trendArrow = dim.trend === 'rising' ? '↑' : dim.trend === 'falling' ? '↓' : '→';
        const trendCls = dim.trend === 'rising' ? 'is-rising' : dim.trend === 'falling' ? 'is-falling' : 'is-stable';
        html += '<div class="sr-dim">' +
          '<span class="sr-dim-label" title="' + dim.category + '">' + dim.label + '</span>' +
          '<div class="sr-dim-bar-bg"><div class="sr-dim-bar-fill ' + barClass + ' grade-' + dimGrade.grade + '" style="--score:' + dim.score + '"></div></div>' +
          '<span class="sr-dim-score grade-' + dimGrade.grade + '">' + dim.score + '</span>' +
          '<span class="sr-dim-trend ' + trendCls + '">' + trendArrow + '</span>' +
          '</div>';
      }
      if (dimEntries.length > 10) {
        html += '<div class="sr-dim-overflow">… 还有 ' + (dimEntries.length - 10) + ' 个维度 (详见健康报告)</div>';
      }
      dimListEl.innerHTML = html;
    }

    // 期间对比: 从 scoreTrend 历史数据计算 delta
    var scoreHistory = data.scoreTrend || [];
    const elCompDelta = document.getElementById('sr-comp-delta');
    const elCompImproved = document.getElementById('sr-comp-improved');
    const elCompDeclined = document.getElementById('sr-comp-declined');
    const elCompNet = document.getElementById('sr-comp-net');
    if (scoreHistory.length >= 2) {
      const prevScore = typeof scoreHistory[scoreHistory.length - 2].score === 'number'
        ? scoreHistory[scoreHistory.length - 2].score
        : (scoreHistory[scoreHistory.length - 2].composite || 0);
      const currScore = typeof scoreHistory[scoreHistory.length - 1].score === 'number'
        ? scoreHistory[scoreHistory.length - 1].score
        : (scoreHistory[scoreHistory.length - 1].composite || 0);
      var delta = Math.round((currScore - prevScore) * 10) / 10;
      if (elCompDelta) { elCompDelta.textContent = (delta > 0 ? '+' : '') + delta + ' 分'; elCompDelta.style.color = delta > 0 ? '#4ade80' : delta < 0 ? '#f87171' : '#6b708a'; }
      if (elCompImproved) { elCompImproved.textContent = delta > 0 ? (delta > 3 ? '显著改善 ↑↑' : '小幅改善 ↑') : '—'; elCompImproved.style.color = delta > 0 ? '#4ade80' : '#6b708a'; }
      if (elCompDeclined) { elCompDeclined.textContent = delta < 0 ? (delta < -3 ? '明显退化 ↓↓' : '轻微退化 ↓') : '—'; elCompDeclined.style.color = delta < 0 ? '#f87171' : '#6b708a'; }
      const netLabel = delta > 0 ? '+' + delta : delta < 0 ? '' + delta : '持平';
      if (elCompNet) { elCompNet.textContent = netLabel; elCompNet.style.color = delta > 0 ? '#4ade80' : delta < 0 ? '#f87171' : '#6b708a'; }
    }

    // AI 摘要
    const summaryEl = document.getElementById('sr-summary');
    if (summaryEl) {
      const stateLabel = composite >= 90 ? '健康' : composite >= 75 ? '基本健康' : composite >= 60 ? '需要关注' : '存在风险';
      let summaryText = '项目综合健康指数 ' + composite + ' 分（' + gradeInfo.grade + '级 · ' + gradeInfo.label + '），整体状态判定：<strong>' + stateLabel + '</strong>。';
      if (trend) {
        summaryText += '近7日评分呈<strong>' + trendLabel[trend.direction] + '趋势</strong>' +
          (trend.direction !== 'stable' ? '（Δ=' + (trend.slopePerWeek > 0 ? '+' : '') + trend.slopePerWeek + '分/周 · R²=' + trend.r2 + ' · 置信度' + trend.confidence + '）' : '（R²=' + trend.r2 + '）') + '。';
      }
      if (forecast) {
        summaryText += '7天后预测评分 <strong>' + forecast.forecast + ' 分</strong>' +
          (forecast.confidence !== 'low' ? '（95% CI: ' + forecast.range[0] + '–' + forecast.range[1] + ' · 置信度' + forecast.confidence + '）' : '（基础数据不足,置信度低）') + '。';
      }
      if (reliability) {
        const volDesc = reliability.volatility === 'low' ? '高' : reliability.volatility === 'moderate' ? '中' : '低';
        summaryText += '评分可靠性 <strong>' + Math.round(reliability.reliability * 100) + '%</strong>（波动性' + volDesc + '）。';
      }
      let p0Count = 0, p1Count = 0;
      if (data._scoreReport && data._scoreReport.recommendations) {
        const recs = data._scoreReport.recommendations;
        for (let ri = 0; ri < recs.length; ri++) {
          if (recs[ri].priority === 'P0') p0Count++;
          else if (recs[ri].priority === 'P1') p1Count++;
        }
      }
      var triggered = data.diagTriggered || 0;
      if (triggered > 0) {
        summaryText += '诊断引擎触发 <strong>' + triggered + '/8</strong> 项,';
        if (p0Count > 0 || p1Count > 0) summaryText += '待处理 <strong>' + (p0Count > 0 ? 'P0×' + p0Count : '') + (p0Count > 0 && p1Count > 0 ? ' + ' : '') + (p1Count > 0 ? 'P1×' + p1Count : '') + '</strong>。';
        else summaryText += '暂无高优先级建议。';
      } else {
        summaryText += '诊断引擎<strong>无告警</strong>,全部维度处于正常范围。';
      }
      summaryEl.innerHTML = summaryText;
    }

    // 更新时间
    const elUpdated = document.getElementById('sr-updated');
    if (elUpdated) {
      elUpdated.textContent = '更新于 ' + new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      resetRelativeTime();
      updateRelativeTime();
    }

    // P0 badge
    const p0Badge = document.getElementById('sr-p0-badge');
    if (p0Badge && composite < 60) {
      p0Badge.style.display = 'inline';
    }

    // Sparkline — 评分历史趋势小图
    renderSparkline(data);
    bindSparklineHover(data);

    // 维度筛选 — 初始化与渲染
    var dims = fullDimEntries(data);
    applyDimFilter('all', dims);
    updateDistribution(dims);
    showDimDeltaToast(dims);
    _lastDimScores = snapshotDimScores(dims);

    // 改进建议面板
    renderRecommendations(data);
  }

  /* ── 改进建议面板: 从 report.recommendations 渲染 ── */
  function renderRecommendations(data) {
    const panel = document.getElementById('sr-recommendations');
    const listEl = document.getElementById('sr-rec-list');
    const metaEl = document.getElementById('sr-rec-meta');
    if (!panel || !listEl) return;
    let recs = [];
    if (data._scoreReport && Array.isArray(data._scoreReport.recommendations)) {
      recs = data._scoreReport.recommendations;
    } else if (Array.isArray(data.recommendations)) {
      recs = data.recommendations;
    }
    if (recs.length === 0) {
      panel.classList.add('is-hidden');
      return;
    }
    panel.classList.remove('is-hidden');
    // 排序: P0 → P1 → P2
    const priorityOrder = { P0: 0, P1: 1, P2: 2 };
    recs.sort(function(a, b) {
      const pa = priorityOrder[a.priority] || 9;
      const pb = priorityOrder[b.priority] || 9;
      return pa - pb;
    });
    const top = recs.slice(0, 8);
    let html = '';
    for (let i = 0; i < top.length; i++) {
      const r = top[i];
      const p = (r.priority || 'P2').toLowerCase();
      const text = r.title || r.description || r.message || r.recommendation || '—';
      const dim = r.dim || r.dimension || r.label || '';
      html += '<div class="sr-rec-item is-' + p + '">' +
        '<span class="sr-rec-priority ' + p + '">' + escapeHtml((r.priority || 'P2')) + '</span>' +
        (dim ? '<strong style="color:var(--yry-text-primary,#a9b1d6)">' + escapeHtml(dim) + '</strong> · ' : '') +
        escapeHtml(text) +
        '</div>';
    }
    listEl.innerHTML = html;
    if (metaEl) {
      const counts = { P0: 0, P1: 0, P2: 0 };
      for (let j = 0; j < recs.length; j++) {
        const key = recs[j].priority || 'P2';
        counts[key] = (counts[key] || 0) + 1;
      }
      metaEl.textContent = '共 ' + recs.length + ' 项 · P0×' + (counts.P0 || 0) + ' · P1×' + (counts.P1 || 0) + ' · P2×' + (counts.P2 || 0);
      updateTitleBadge(counts.P0 || 0, counts.P1 || 0);
    }
  }
  function updateDistribution(entries) {
    let excellent = 0, good = 0, poor = 0;
    for (let i = 0; i < entries.length; i++) {
      const s = entries[i].score;
      if (s >= 90) excellent++;
      else if (s >= 75) good++;
      else poor++;
    }
    const total = Math.max(1, entries.length);
    const elExc = document.getElementById('sr-dist-excellent');
    const elGood = document.getElementById('sr-dist-good');
    const elPoor = document.getElementById('sr-dist-poor');
    if (elExc) elExc.textContent = excellent;
    if (elGood) elGood.textContent = good;
    if (elPoor) elPoor.textContent = poor;
    const fillExc = document.getElementById('sr-dist-fill-excellent');
    const fillGood = document.getElementById('sr-dist-fill-good');
    const fillPoor = document.getElementById('sr-dist-fill-poor');
    if (fillExc) fillExc.style.setProperty('--h', (excellent / total * 100) + '%');
    if (fillGood) fillGood.style.setProperty('--h', (good / total * 100) + '%');
    if (fillPoor) fillPoor.style.setProperty('--h', (poor / total * 100) + '%');
  }

  /* ── 维度筛选状态与渲染 ── */
  const _dimState = { filter: 'all', entries: [], query: '', sort: 'score-asc' };
  var _lastCompositeScore = null;
  var _lastDimScores = null;  // { dimKey: score } 上次刷新的维度快照

  /* ── 数据源状态徽章 ── */
  function setSourceStatus(status, label) {
    const statusEl = document.getElementById('sr-source-status');
    const labelEl = document.getElementById('sr-source-label');
    if (labelEl && label) labelEl.textContent = label;
    if (statusEl) {
      statusEl.classList.remove('is-online', 'is-offline', 'is-stale');
      statusEl.classList.add('is-' + status);
      const title = status === 'online' ? '数据源在线 · 实时数据' :
                  status === 'offline' ? '所有数据源不可达 · 使用离线默认值' :
                  '数据源过期 · 可能非最新';
      statusEl.setAttribute('title', title);
    }
  }

  /* ── 维度 delta 计算 + toast ── */
  function showDimDeltaToast(entries) {
    if (!_lastDimScores) return;
    let improved = 0, declined = 0, improvedList = [], declinedList = [];
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const prev = _lastDimScores[e.key];
      if (prev === undefined || prev === e.score) continue;
      if (e.score > prev) {
        improved++;
        if (improvedList.length < 3) improvedList.push(e.label + '+' + (e.score - prev));
      } else if (e.score < prev) {
        declined++;
        if (declinedList.length < 3) declinedList.push(e.label + (e.score - prev));
      }
    }
    if (improved === 0 && declined === 0) return;
    const type = declined > improved ? 'warning' : 'success';
    let title;
    if (improved > 0 && declined > 0) {
      title = improved + ' 项提升 · ' + declined + ' 项退化';
    } else if (improved > 0) {
      title = improved + ' 项维度提升';
    } else {
      title = declined + ' 项维度退化';
    }
    const text = [];
    if (improvedList.length) text.push('↑ ' + improvedList.join(' · '));
    if (declinedList.length) text.push('↓ ' + declinedList.join(' · '));
    showToast({
      type: type,
      title: title,
      text: text.join('  '),
      duration: 5000
    });
  }

  /* ── 快照维度分数 ── */
  function snapshotDimScores(entries) {
    const snap = {};
    for (let i = 0; i < entries.length; i++) {
      snap[entries[i].key] = entries[i].score;
    }
    return snap;
  }

  function fullDimEntries(data) {
    const dims = data.dimensions || data.dimSummary || {};
    const entries = [];
    for (const key in dims) {
      if (!dims.hasOwnProperty(key)) continue;
      const d = dims[key];
      entries.push({
        key: key,
        label: d.label || key,
        score: d.score || d.avgScore || d.current || 0,
        trend: d.trend || d.trendDirection || 'stable',
        category: d.category || 'core',
        recommendation: d.recommendation || '',
        gap: d.gap || 0,
        weight: d.weight || 0
      });
    }
    entries.sort(function(a, b) { return a.score - b.score; });
    return entries;
  }

  function sortEntries(entries, sort) {
    const arr = entries.slice();
    if (sort === 'score-desc') {
      arr.sort(function(a, b) { return b.score - a.score; });
    } else if (sort === 'name') {
      arr.sort(function(a, b) {
        const la = (a.label || '').toLowerCase();
        const lb = (b.label || '').toLowerCase();
        return la < lb ? -1 : la > lb ? 1 : 0;
      });
    } else {
      arr.sort(function(a, b) { return a.score - b.score; });
    }
    return arr;
  }

  function applyDimFilter(filter, entries) {
    _dimState.filter = filter;
    _dimState.entries = entries || _dimState.entries;

    // 先排序再筛选
    const sorted = sortEntries(_dimState.entries, _dimState.sort);

    const visible = [];
    for (let i = 0; i < sorted.length; i++) {
      const e = sorted[i];
      let match = false;
      switch (filter) {
        case 'poor':      match = e.score < 75; break;
        case 'fair':      match = e.score >= 75 && e.score < 90; break;
        case 'excellent': match = e.score >= 90; break;
        case 'rising':    match = e.trend === 'rising'; break;
        case 'falling':   match = e.trend === 'falling'; break;
        default:          match = true;
      }
      if (match && _dimState.query) {
        const q = _dimState.query.toLowerCase();
        match = (e.label && e.label.toLowerCase().indexOf(q) !== -1) ||
                (e.category && e.category.toLowerCase().indexOf(q) !== -1) ||
                (e.key && e.key.toLowerCase().indexOf(q) !== -1);
      }
      if (match) visible.push(e);
    }

    const listEl = document.getElementById('sr-dim-list');
    if (listEl) {
      if (visible.length === 0) {
        listEl.innerHTML = '<div class="sr-dim-overflow">' +
          (_dimState.query ? '无匹配「' + _dimState.query + '」的维度。' : '该筛选条件下无匹配维度。') +
          ' <a href="#" class="sr-reset-link" id="sr-reset-inline">重置筛选</a></div>';
        const resetLink = document.getElementById('sr-reset-inline');
        if (resetLink) resetLink.addEventListener('click', function(ev) {
          ev.preventDefault();
          resetDimFilters();
        });
      } else {
        let html = '';
        const max = Math.min(visible.length, 10);
        for (let j = 0; j < max; j++) {
          const dim = visible[j];
          const dimGrade = getGrade(dim.score);
          const barClass = classifyScore(dim.score);
          const trendArrow = dim.trend === 'rising' ? '↑' : dim.trend === 'falling' ? '↓' : '→';
          const trendCls = dim.trend === 'rising' ? 'is-rising' : dim.trend === 'falling' ? 'is-falling' : 'is-stable';
          const recoAttr = dim.recommendation ? ' data-recommendation="💡 ' + escapeHtml(dim.recommendation) + '"' : '';
          const gapAttr = dim.gap ? ' (gap ' + dim.gap + ')' : '';
          html += '<div class="sr-dim"' + recoAttr + ' tabindex="0">' +
            '<span class="sr-dim-label" title="' + dim.category + gapAttr + '">' + dim.label + '</span>' +
            '<div class="sr-dim-bar-bg"><div class="sr-dim-bar-fill ' + barClass + ' grade-' + dimGrade.grade + '" style="--score:' + dim.score + '"></div></div>' +
            '<span class="sr-dim-score grade-' + dimGrade.grade + '">' + dim.score + '</span>' +
            '<span class="sr-dim-trend ' + trendCls + '">' + trendArrow + '</span>' +
            '</div>';
        }
        if (visible.length > 10) {
          html += '<div class="sr-dim-overflow">… 当前筛选下还有 ' + (visible.length - 10) + ' 个维度 (详见健康报告)</div>';
        }
        listEl.innerHTML = html;
      }
    }

    const countEl = document.getElementById('sr-filter-count');
    if (countEl) {
      countEl.textContent = '显示 ' + visible.length + ' / ' + _dimState.entries.length + ' 维度';
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function resetDimFilters() {
    _dimState.query = '';
    const searchInput = document.getElementById('sr-dim-search');
    if (searchInput) searchInput.value = '';
    const filterBtns = document.querySelectorAll('.sr-filter-btn');
    for (let j = 0; j < filterBtns.length; j++) {
      filterBtns[j].classList.toggle('is-active', filterBtns[j].getAttribute('data-filter') === 'all');
    }
    applyDimFilter('all');
  }

  /* ── Sparkline 渲染 (canvas, 零依赖) ── */
  function renderSparkline(data) {
    const canvas = document.getElementById('sr-spark');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const history = [];
    const trend = data.scoreTrend || [];
    for (let i = 0; i < trend.length; i++) {
      if (typeof trend[i].score === 'number') history.push(trend[i].score);
      else if (typeof trend[i].composite === 'number') history.push(trend[i].composite);
    }
    if (history.length === 0) return;

    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    let min = Infinity, max = -Infinity;
    for (let i2 = 0; i2 < history.length; i2++) {
      if (history[i2] < min) min = history[i2];
      if (history[i2] > max) max = history[i2];
    }
    if (min === max) { min -= 1; max += 1; }
    // 保证 A 级阈值 (90) 在视图内
    const TARGET = 90;
    if (TARGET < min) min = TARGET - 2;
    if (TARGET > max) max = TARGET + 2;
    const pad = 4;
    const innerW = W - pad * 2;
    const innerH = H - pad * 2;
    const step = history.length > 1 ? innerW / (history.length - 1) : 0;

    function px(i) { return pad + i * step; }
    function py(v) {
      const t = (v - min) / (max - min);
      return pad + (1 - t) * innerH;
    }

    // A 级目标线 (虚线)
    const targetY = py(TARGET);
    ctx.strokeStyle = 'rgba(251,191,36,.45)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(pad, targetY);
    ctx.lineTo(W - pad, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
    // 目标标签
    ctx.fillStyle = 'rgba(251,191,36,.85)';
    ctx.font = '9px SF Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('A≥' + TARGET, pad + 2, targetY - 2);

    // 渐变填充
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(34,211,238,.35)');
    grad.addColorStop(1, 'rgba(34,211,238,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(px(0), H);
    for (let i3 = 0; i3 < history.length; i3++) ctx.lineTo(px(i3), py(history[i3]));
    ctx.lineTo(px(history.length - 1), H);
    ctx.closePath();
    ctx.fill();

    // 折线
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(px(0), py(history[0]));
    for (let i4 = 1; i4 < history.length; i4++) ctx.lineTo(px(i4), py(history[i4]));
    ctx.stroke();

    // 最后一个点高亮
    const lastX = px(history.length - 1);
    const lastY = py(history[history.length - 1]);
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(lastX, lastY, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ── 数字 count-up 动画 ── */
  function animateCountUp(el, target, duration) {
    if (!el) return;
    duration = duration || 800;
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { el.textContent = target; return; }
    let start = 0;
    const parsed = parseInt(el.textContent, 10);
    if (!isNaN(parsed)) start = parsed;
    let startTime = null;
    el.classList.add('is-counting');
    function step(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min(1, (ts - startTime) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(start + (target - start) * eased);
      el.textContent = val;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
        el.classList.remove('is-counting');
      }
    }
    requestAnimationFrame(step);
  }

  /* ── Sparkline 悬停: 显示数据点精确值 + 垂直游标 ── */
  let _sparkHistory = [];
  let _sparkBound = false;
  function bindSparklineHover(data) {
    const canvas = document.getElementById('sr-spark');
    if (!canvas) return;
    const history = [];
    const trend = data.scoreTrend || [];
    for (let i = 0; i < trend.length; i++) {
      if (typeof trend[i].score === 'number') history.push(trend[i].score);
      else if (typeof trend[i].composite === 'number') history.push(trend[i].composite);
    }
    _sparkHistory = history;
    if (_sparkBound) return;
    _sparkBound = true;
    canvas.addEventListener('mousemove', function(ev) {
      if (_sparkHistory.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const pad = 4;
      const innerW = rect.width - pad * 2;
      const step = _sparkHistory.length > 1 ? innerW / (_sparkHistory.length - 1) : 0;
      let idx = _sparkHistory.length > 1 ? Math.round((x - pad) / step) : 0;
      idx = Math.max(0, Math.min(_sparkHistory.length - 1, idx));
      const value = _sparkHistory[idx];
      const tooltip = document.getElementById('sr-spark-tooltip');
      const cursor = document.getElementById('sr-spark-cursor');
      if (tooltip) {
        tooltip.textContent = '#' + (idx + 1) + ' · ' + value + ' 分';
        tooltip.style.left = (pad + idx * step) + 'px';
        tooltip.style.top = '0px';
        tooltip.classList.add('is-visible');
      }
      if (cursor) {
        cursor.style.left = (pad + idx * step) + 'px';
        cursor.style.top = '0';
        cursor.style.height = rect.height + 'px';
        cursor.classList.add('is-visible');
      }
    });
    canvas.addEventListener('mouseleave', function() {
      const tooltip = document.getElementById('sr-spark-tooltip');
      const cursor = document.getElementById('sr-spark-cursor');
      if (tooltip) tooltip.classList.remove('is-visible');
      if (cursor) cursor.classList.remove('is-visible');
    });
  }

  /* ── 渲染评分方法卡片 (接受任意数据格式,内部归一化) ── */
  function renderMethodologyCards(data) {
    // 归一化: 兼容 score-report.json / summary.json / raw dim data
    const composite = typeof data.composite === 'object'
      ? (data.composite.score || 0)
      : (data.composite || 0);
    const phiGrade = getGrade(composite);
    const elPhi = document.getElementById('sm-grade-phi');
    if (elPhi) {
      elPhi.classList.remove('is-loading');
      animateCountUp(elPhi, composite, 700);
      // 追加 /A 后缀
      setTimeout(function() {
        elPhi.textContent = composite + '/' + phiGrade.grade;
      }, 720);
      elPhi.className = 'sm-card-grade grade-' + phiGrade.grade;
    }

    // 辅助: 从 dimSummary (object or array) 或 breakdown 中提取维度分数
    function dimLookup(label) {
      if (data.breakdown && Array.isArray(data.breakdown)) {
        for (var i = 0; i < data.breakdown.length; i++) {
          if (data.breakdown[i].label === label) return data.breakdown[i].score;
        }
      }
      if (data.dimSummary && Array.isArray(data.dimSummary)) {
        for (var i = 0; i < data.dimSummary.length; i++) {
          if (data.dimSummary[i].label === label) return data.dimSummary[i].avgScore || data.dimSummary[i].score;
        }
      }
      if (data.dimSummary && typeof data.dimSummary === 'object') {
        for (const key in data.dimSummary) {
          if (data.dimSummary[key].label === label) return data.dimSummary[key].score;
        }
      }
      return null;
    }

    // SHI: 技能健康指数
    const shiScore = data.skillScore
      || dimLookup('组件质量')
      || dimLookup('技能健康')
      || (data.dimSummary && data.dimSummary.skill_health ? data.dimSummary.skill_health.score : null)
      || 86;
    const shiGrade = getGrade(shiScore);
    const elShi = document.getElementById('sm-grade-shi');
    if (elShi) {
      elShi.classList.remove('is-loading');
      animateCountUp(elShi, shiScore, 700);
      setTimeout(function() {
        elShi.textContent = shiScore + '/' + shiGrade.grade;
      }, 720);
      elShi.className = 'sm-card-grade grade-' + shiGrade.grade;
    }

    // TQI: 测试质量指数
    const tqiScore = data.testScore
      || dimLookup('测试覆盖')
      || dimLookup('测试')
      || 60;
    const tqiGrade = getGrade(tqiScore);
    const elTqi = document.getElementById('sm-grade-tqi');
    if (elTqi) {
      elTqi.classList.remove('is-loading');
      animateCountUp(elTqi, tqiScore, 700);
      setTimeout(function() {
        elTqi.textContent = tqiScore + '/' + tqiGrade.grade;
      }, 720);
      elTqi.className = 'sm-card-grade grade-' + tqiGrade.grade;
    }

    // SII: 自改进闭环指数
    const siiScore = data.selfImproveScore
      || dimLookup('自改进闭环')
      || dimLookup('自改进')
      || 89;
    const siiGrade = getGrade(siiScore);
    const elSii = document.getElementById('sm-grade-sii');
    if (elSii) {
      elSii.classList.remove('is-loading');
      animateCountUp(elSii, siiScore, 700);
      setTimeout(function() {
        elSii.textContent = siiScore + '/' + siiGrade.grade;
      }, 720);
      elSii.className = 'sm-card-grade grade-' + siiGrade.grade;
    }

    // AQI: 架构质量指数
    let aqiScore = null;
    let aqiGradeLetter = null;
    if (data.archHealth && data.archHealth.grade) {
      aqiGradeLetter = data.archHealth.grade;
      aqiScore = aqiGradeLetter === 'A' ? 95 : aqiGradeLetter === 'B' ? 80 : aqiGradeLetter === 'C' ? 50 : 30;
    } else if (data.architecture && data.architecture.grade) {
      aqiGradeLetter = data.architecture.grade;
      aqiScore = aqiGradeLetter === 'A' ? 95 : aqiGradeLetter === 'B' ? 80 : aqiGradeLetter === 'C' ? 50 : 30;
    }
    const elAqi = document.getElementById('sm-grade-aqi');
    if (elAqi && aqiGradeLetter) {
      elAqi.textContent = aqiScore + '/' + aqiGradeLetter;
      elAqi.className = 'sm-card-grade grade-' + aqiGradeLetter;
    }

    // DHI: 诊断健康指数 — 100 - triggered×15, min 0
    let diagTrig = data.diagTriggered || 0;
    if (!diagTrig && data.diagnostics && typeof data.diagnostics.triggered === 'number') {
      diagTrig = data.diagnostics.triggered;
    }
    if (!diagTrig && data.diagSummary) {
      if (Array.isArray(data.diagSummary)) {
        diagTrig = data.diagSummary.filter(function(d) { return d.count > 0; }).length;
      } else if (typeof data.diagSummary.triggered === 'number') {
        diagTrig = data.diagSummary.triggered;
      }
    }
    const dhiScore = Math.max(0, 100 - diagTrig * 15);

    // UPHI: Unified Project Health Index
    const uphiHealthScore = composite;
    const uphiCompScore = shiScore;
    const uphiDiagScore = dhiScore;
    let uphiArchScore = aqiScore;
    if (!uphiArchScore && aqiGradeLetter) {
      uphiArchScore = aqiGradeLetter === 'A' ? 95 : aqiGradeLetter === 'B' ? 80 : aqiGradeLetter === 'C' ? 50 : 30;
    }
    if (!uphiArchScore) uphiArchScore = 80;
    const uphiScore = Math.round(uphiHealthScore * 0.4 + uphiCompScore * 0.25 + uphiDiagScore * 0.2 + uphiArchScore * 0.15);
    const uphiGrade = getGrade(uphiScore);
    const elUphi = document.getElementById('sm-grade-uphi');
    if (elUphi) {
      elUphi.classList.remove('is-loading');
      animateCountUp(elUphi, uphiScore, 700);
      setTimeout(function() {
        elUphi.textContent = uphiScore + '/' + uphiGrade.grade;
      }, 720);
      elUphi.className = 'sm-card-grade grade-' + uphiGrade.grade;
    }

    // DQI: Document Quality Index
    const dqiScore = data.docQualityScore
      || dimLookup('文档质量')
      || (data.archHealth && typeof data.archHealth.docFreshness === 'number' ? data.archHealth.docFreshness : null)
      || 82;
    const dqiGrade = getGrade(dqiScore);
    const elDqi = document.getElementById('sm-grade-dqi');
    if (elDqi) {
      elDqi.classList.remove('is-loading');
      animateCountUp(elDqi, dqiScore, 700);
      setTimeout(function() {
        elDqi.textContent = dqiScore + '/' + dqiGrade.grade;
      }, 720);
      elDqi.className = 'sm-card-grade grade-' + dqiGrade.grade;
    }
  }

  /* ── 加载骨架屏 — 数据拉取期间显示 shimmer 占位 ── */
  function showLoadingSkeleton() {
    const ids = ['sr-composite', 'sr-grade-label', 'sr-trend-dir', 'sr-trend-detail',
               'sr-forecast', 'sr-forecast-range', 'sr-reliability', 'sr-volatility',
               'sr-diag', 'sr-arch', 'sr-arch-detail'];
    for (let i = 0; i < ids.length; i++) {
      const el = document.getElementById(ids[i]);
      if (el && !el.textContent.match(/[0-9A-Za-z]/)) {
        el.classList.add('is-loading');
      }
    }
  }

  /* ── Live 数据拉取 (优先使用完整的 score-report.json) ── */
  function fetchScoreData() {
    showLoadingSkeleton();
    resetCountdown();
    setSourceStatus('stale', '连接中…');
    const base = getBasePath();
    const urls = [
      base + '/docs/评分报告/score-report.json',
      base + '/docs/自我改进/summary.json',
      base + '/cdn/cdn-summary/index.json',
      base + '/cdn/health-report/index.json'
    ];

    let idx = 0;
    function tryNext() {
      if (idx >= urls.length) {
        if (!window._scoreReportWarned) { window._scoreReportWarned = true; console.warn('[ScoreReport] 所有数据源均不可达,使用默认数据'); }
        renderWithDefaultData();
        return;
      }
      const url = urls[idx++];
      fetch(url, { signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined })
        .then(function(r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function(data) {
          console.log('[ScoreReport] 数据已加载: ' + url + ' (source ' + (idx) + '/' + urls.length + ')');
          if (url.indexOf('score-report.json') !== -1) {
            renderFromScoreReport(data);
          } else {
            const srData = data.scoreReport || data;
            renderScoreReport(srData);
          }
          renderMethodologyCards(data);
          const srcLabel = url.indexOf('score-report.json') !== -1 ? '评分报告' :
                         url.indexOf('summary.json') !== -1 ? '自我改进' :
                         url.indexOf('cdn-summary') !== -1 ? 'CDN汇总' : '健康报告';
          setSourceStatus('online', '在线 · ' + srcLabel);
          const elUpdated = document.getElementById('sr-updated');
          if (elUpdated) {
            elUpdated.textContent = '更新于 ' + new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) + ' · 数据源: ' + srcLabel;
            resetRelativeTime();
            updateRelativeTime();
          }
        })
        .catch(function() { tryNext(); });
    }
    tryNext();
  }

  /* ── 从 score-report.json 渲染 ── */
  function renderFromScoreReport(report) {
    renderScoreReport({
      composite: report.composite?.score || 0,
      grade: report.composite?.grade,
      scoreTrend: report.meta?.dateRange ? [
        { score: report.composite?.score || 0 }
      ] : [],
      dimSummary: report.dimensionLabels ? buildDimSummaryFromReport(report) : {},
      archHealth: report.architecture ? { grade: report.architecture.grade } : null,
      diagTriggered: report.diagnostics?.triggered || 0,
      _scoreReport: report,
    });

    if (report.comparison) {
      renderComparisonData(report.comparison, report.recommendations || []);
    }
    updateP0Badge(report.recommendations || []);
  }

  function updateP0Badge(recs) {
    const p0Badge = document.getElementById('sr-p0-badge');
    if (!p0Badge) return;
    let p0 = 0, p1 = 0;
    for (let i = 0; i < recs.length; i++) {
      if (recs[i].priority === 'P0') p0++;
      else if (recs[i].priority === 'P1') p1++;
    }
    if (p0 > 0) {
      p0Badge.textContent = (p0 > 0 ? 'P0×' + p0 + ' ' : '') + (p1 > 0 ? 'P1×' + p1 : '') + ' 待处理';
      p0Badge.style.display = 'inline';
    }
  }

  function buildDimSummaryFromReport(report) {
    const dims = {};
    const breakdown = report.breakdown || [];
    for (let i = 0; i < breakdown.length; i++) {
      const b = breakdown[i];
      dims[b.dim] = {
        label: b.label,
        score: b.score,
        trend: b.trendDirection,
        category: b.category,
        status: b.status,
        recommendation: b.recommendation,
        weight: b.weight,
        gap: b.gap,
      };
    }
    return dims;
  }

  function renderComparisonData(comparison, recommendations) {
    const elDelta = document.getElementById('sr-comp-delta');
    const elImproved = document.getElementById('sr-comp-improved');
    const elDeclined = document.getElementById('sr-comp-declined');
    const elNet = document.getElementById('sr-comp-net');

    if (comparison && comparison.compositeDelta !== undefined) {
      const delta = comparison.compositeDelta || 0;
      if (elDelta) { elDelta.textContent = (delta > 0 ? '+' : '') + delta + ' 分'; elDelta.style.color = delta > 0 ? '#4ade80' : delta < 0 ? '#f87171' : '#6b708a'; }
      if (elImproved) { elImproved.textContent = (comparison.improved || 0) + ' 项'; elImproved.style.color = comparison.improved > 0 ? '#4ade80' : '#6b708a'; }
      if (elDeclined) { elDeclined.textContent = (comparison.declined || 0) + ' 项'; elDeclined.style.color = comparison.declined > 0 ? '#f87171' : '#6b708a'; }
      var net = (comparison.improved || 0) - (comparison.declined || 0);
      if (elNet) { elNet.textContent = (net > 0 ? '+' : '') + net; elNet.style.color = net > 0 ? '#4ade80' : net < 0 ? '#f87171' : '#6b708a'; }
    } else if (comparison && comparison.dimensions) {
      let improved = 0, declined = 0, totalDelta = 0;
      for (let i = 0; i < comparison.dimensions.length; i++) {
        const d = comparison.dimensions[i];
        if (d.delta > 0) improved++;
        else if (d.delta < 0) declined++;
        totalDelta += (d.delta || 0);
      }
      const avgDelta = comparison.dimensions.length > 0 ? Math.round(totalDelta / comparison.dimensions.length) : 0;
      if (elDelta) { elDelta.textContent = (avgDelta > 0 ? '+' : '') + avgDelta + ' 分(均)'; elDelta.style.color = avgDelta > 0 ? '#4ade80' : avgDelta < 0 ? '#f87171' : '#6b708a'; }
      if (elImproved) { elImproved.textContent = improved + ' 项'; elImproved.style.color = improved > 0 ? '#4ade80' : '#6b708a'; }
      if (elDeclined) { elDeclined.textContent = declined + ' 项'; elDeclined.style.color = declined > 0 ? '#f87171' : '#6b708a'; }
      var net = improved - declined;
      if (elNet) { elNet.textContent = (net > 0 ? '+' : '') + net; elNet.style.color = net > 0 ? '#4ade80' : net < 0 ? '#f87171' : '#6b708a'; }
    } else {
      if (elDelta) elDelta.textContent = '—';
      if (elImproved) elImproved.textContent = '—';
      if (elDeclined) elDeclined.textContent = '—';
      if (elNet) elNet.textContent = '—';
    }

    updateP0Badge(recommendations);
  }

  /* ── 默认数据回退 (从 default-data.json 异步拉取) ── */
  function renderWithDefaultData() {
    setSourceStatus('offline', '离线模式');
    const base = getBasePath();
    const defaultDataUrl = base + '/cdn/yry-dashboard-report/default-data.json';
    fetch(defaultDataUrl, { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (defaultData) {
        renderScoreReport(defaultData);
        renderMethodologyCards(defaultData);
        const elUpdated = document.getElementById('sr-updated');
        if (elUpdated) elUpdated.textContent = '⚠️ 离线模式 · 使用内置默认数据';
        const summaryEl = document.getElementById('sr-summary');
        if (summaryEl) {
          summaryEl.innerHTML = '<strong>⚠️ 数据源不可达 — 当前显示离线默认值</strong><br><br>' +
            '以下评分基于<strong>内置静态基线数据</strong>，反映项目最后一次健康检查时的近似状态，非实时数据。<br><br>' +
            '<strong>恢复实时数据的方法：</strong><br>' +
            '① 运行 <code>node lib/score-report-generator.mjs</code> 生成最新评分报告<br>' +
            '② 运行 <code>node skills/rui-bot/send.mjs health</code> 执行健康检查并持久化趋势<br>' +
            '③ 确认 <code>docs/评分报告/score-report.json</code> 文件存在且可被 HTTP 服务访问<br>' +
            '④ 如使用本地文件预览，启动 HTTP 服务器：<code>npx serve docs</code> 或 <code>python3 -m http.server</code><br><br>' +
            '数据源尝试顺序：score-report.json → summary.json → cdn-summary/index.json → default-data.json';
        }
      })
      .catch(function (err) {
        console.error('[ScoreReport] default-data.json 加载失败:', err);
      });
  }

  /* ── 入口: 页面加载后启动 ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchScoreData);
  } else {
    fetchScoreData();
  }

  /* ── 交互: 维度筛选按钮 + 折叠按钮 + 搜索 + 重置 + 手动刷新 ── */
  function initInteractionControls() {
    // 筛选按钮
    const filterBtns = document.querySelectorAll('.sr-filter-btn');
    for (let i = 0; i < filterBtns.length; i++) {
      filterBtns[i].addEventListener('click', function() {
        for (let j = 0; j < filterBtns.length; j++) {
          filterBtns[j].classList.remove('is-active');
        }
        this.classList.add('is-active');
        const f = this.getAttribute('data-filter');
        applyDimFilter(f);
        syncFilterToHash(f);
      });
    }
    // 折叠按钮
    const collapseBtns = document.querySelectorAll('.sr-collapse-btn');
    for (let k = 0; k < collapseBtns.length; k++) {
      collapseBtns[k].addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const section = this.closest('.sr-collapsible');
        const target = document.getElementById(targetId);
        const expanded = this.getAttribute('aria-expanded') === 'true';
        if (expanded) {
          if (target) target.style.display = 'none';
          this.setAttribute('aria-expanded', 'false');
          this.textContent = '展开 +';
          if (section) section.classList.add('sr-collapsed');
        } else {
          if (target) target.style.display = '';
          this.setAttribute('aria-expanded', 'true');
          this.textContent = '收起 −';
          if (section) section.classList.remove('sr-collapsed');
        }
      });
    }
    // 搜索框 — 防抖
    const searchInput = document.getElementById('sr-dim-search');
    if (searchInput) {
      let debounceTimer = null;
      searchInput.addEventListener('input', function() {
        if (debounceTimer) clearTimeout(debounceTimer);
        const val = this.value;
        debounceTimer = setTimeout(function() {
          _dimState.query = val.trim();
          applyDimFilter(_dimState.filter);
        }, 180);
      });
    }
    // 重置按钮
    const resetBtn = document.getElementById('sr-reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', function() {
      resetDimFilters();
      syncFilterToHash('all');
    });
    // 维度分布柱状图 — 点击切换筛选
    const distBars = document.querySelectorAll('.sr-dist-bar');
    for (let m = 0; m < distBars.length; m++) {
      distBars[m].addEventListener('click', function() {
        const f = this.getAttribute('data-filter');
        for (let j2 = 0; j2 < filterBtns.length; j2++) {
          filterBtns[j2].classList.toggle('is-active', filterBtns[j2].getAttribute('data-filter') === f);
        }
        applyDimFilter(f);
        syncFilterToHash(f);
      });
    }
    // 排序按钮
    const sortBtns = document.querySelectorAll('.sr-sort-btn');
    for (let s = 0; s < sortBtns.length; s++) {
      sortBtns[s].addEventListener('click', function() {
        for (let s2 = 0; s2 < sortBtns.length; s2++) sortBtns[s2].classList.remove('is-active');
        this.classList.add('is-active');
        _dimState.sort = this.getAttribute('data-sort');
        applyDimFilter(_dimState.filter);
      });
    }
    // 可点击单元格 — 跳转详情报告
    const clickableCells = document.querySelectorAll('.sr-cell[data-href]');
    for (let c = 0; c < clickableCells.length; c++) {
      (function(cell) {
        cell.addEventListener('click', function(ev) {
          // 避免点击内部 canvas/input 触发跳转
          if (ev.target.closest('canvas, input, button, a')) return;
          const href = cell.getAttribute('data-href');
          if (href) window.location.href = href;
        });
        cell.addEventListener('keydown', function(ev) {
          if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            const href = cell.getAttribute('data-href');
            if (href) window.location.href = href;
          }
        });
      })(clickableCells[c]);
    }
    // 相对时间刷新 — 每 30s 更新 sr-updated
    initRelativeTime();
    setInterval(updateRelativeTime, 30000);
    // 手动刷新按钮
    const refreshBtn = document.getElementById('sr-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function() {
        if (this.classList.contains('is-spinning')) return;
        this.classList.add('is-spinning');
        this.textContent = '刷新中…';
        try {
          fetchScoreData();
        } finally {
          const self = this;
          setTimeout(function() {
            self.classList.remove('is-spinning');
            self.textContent = '↻ 刷新';
          }, 900);
        }
      });
    }
    // 从 URL hash 恢复筛选状态 (优先) — 否则尝试 localStorage
    if (!restoreFilterFromHash(filterBtns)) {
      restoreFilterFromStorage(filterBtns);
    }
    // Quicknav 滚动监听 — 高亮当前可见 section
    initScrollSpy();
    // 快捷键帮助浮层
    initShortcutsOverlay();
    // 复制链接按钮
    initCopyLinkButton();
    // 高对比度模式切换
    initContrastToggle();
    // 自动刷新倒计时
    initCountdown();
    // 标签页隐藏时暂停刷新
    initVisibilityPause();
    // 键盘快捷键: R 刷新, 1-6 切换筛选, ? 帮助, / 搜索, H 高对比
    document.addEventListener('keydown', function(ev) {
      if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA' || ev.target.isContentEditable)) return;
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      const key = ev.key.toLowerCase();
      if (key === 'r' && refreshBtn) {
        ev.preventDefault();
        refreshBtn.click();
      } else if (key >= '1' && key <= '6') {
        const idx = parseInt(key, 10) - 1;
        if (filterBtns[idx]) filterBtns[idx].click();
      } else if (key === '?') {
        ev.preventDefault();
        toggleShortcutsOverlay(true);
      } else if (key === '/') {
        ev.preventDefault();
        const search = document.getElementById('sr-dim-search');
        if (search) search.focus();
      } else if (key === 'escape') {
        toggleShortcutsOverlay(false);
      } else if (key === 'h') {
        ev.preventDefault();
        const cb = document.getElementById('sr-contrast-btn');
        if (cb) cb.click();
      }
    });
  }

  /* ── 高对比度模式 ── */
  const CONTRAST_KEY = 'yry-high-contrast';
  function initContrastToggle() {
    const btn = document.getElementById('sr-contrast-btn');
    if (!btn) return;
    // 从 localStorage 恢复
    try {
      if (window.localStorage && localStorage.getItem(CONTRAST_KEY) === 'true') {
        document.body.classList.add('sr-high-contrast');
        btn.setAttribute('aria-pressed', 'true');
      }
    } catch (e) {}
    btn.addEventListener('click', function() {
      const body = document.body;
      const isOn = body.classList.toggle('sr-high-contrast');
      this.setAttribute('aria-pressed', isOn ? 'true' : 'false');
      try {
        if (window.localStorage) localStorage.setItem(CONTRAST_KEY, isOn ? 'true' : 'false');
      } catch (e) {}
      showToast({
        type: 'info',
        title: isOn ? '高对比度模式已开启' : '高对比度模式已关闭',
        text: isOn ? '文本描边与边框加粗，色盲友好配色' : '已恢复默认深色主题',
        duration: 2200
      });
    });
  }

  /* ── 自动刷新倒计时 ── */
  const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
  let _lastFetchTs = Date.now();
  let _countdownTimer = null;
  function initCountdown() {
    const el = document.getElementById('sr-countdown');
    if (!el) return;
    _lastFetchTs = Date.now();
    if (_countdownTimer) clearInterval(_countdownTimer);
    _countdownTimer = setInterval(updateCountdown, 1000);
    updateCountdown();
  }
  function updateCountdown() {
    const el = document.getElementById('sr-countdown');
    if (!el) return;
    const remaining = REFRESH_INTERVAL_MS - (Date.now() - _lastFetchTs);
    if (remaining <= 0) {
      el.textContent = '刷新中…';
      el.classList.remove('is-soon', 'is-imminent');
      return;
    }
    const totalSec = Math.floor(remaining / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    el.textContent = min + ':' + (sec < 10 ? '0' : '') + sec;
    el.classList.toggle('is-soon', remaining < 60000 && remaining >= 20000);
    el.classList.toggle('is-imminent', remaining < 20000);
  }
  function resetCountdown() {
    _lastFetchTs = Date.now();
    updateCountdown();
  }

  /* ── 快捷键帮助浮层 ── */
  function initShortcutsOverlay() {
    const overlay = document.getElementById('sr-shortcuts-overlay');
    const closeBtn = document.getElementById('sr-shortcuts-close');
    const fab = document.getElementById('sr-help-fab');
    if (fab) fab.addEventListener('click', function() { toggleShortcutsOverlay(true); });
    if (closeBtn) closeBtn.addEventListener('click', function() { toggleShortcutsOverlay(false); });
    if (overlay) {
      overlay.addEventListener('click', function(ev) {
        if (ev.target === overlay) toggleShortcutsOverlay(false);
      });
    }
  }
  function toggleShortcutsOverlay(show) {
    const overlay = document.getElementById('sr-shortcuts-overlay');
    if (!overlay) return;
    if (show) {
      overlay.classList.remove('is-hidden');
      const closeBtn = document.getElementById('sr-shortcuts-close');
      if (closeBtn) closeBtn.focus();
    } else {
      overlay.classList.add('is-hidden');
    }
  }

  /* ── 标签页隐藏时暂停刷新 ── */
  let _refreshTimer = null;
  function initVisibilityPause() {
    if (!document.addEventListener) return;
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        if (_refreshTimer) { clearInterval(_refreshTimer); _refreshTimer = null; }
      } else {
        if (!_refreshTimer) {
          // 恢复时立即拉一次最新数据,再恢复定时器
          fetchScoreData();
          _refreshTimer = setInterval(fetchScoreData, 5 * 60 * 1000);
        }
      }
    });
  }

  /* ── localStorage 持久化筛选+排序 (URL hash 回退) ── */
  const STORAGE_KEY = 'yry-dashboard-state';
  function persistFilterState() {
    if (!window.localStorage) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        filter: _dimState.filter,
        sort: _dimState.sort,
        query: _dimState.query
      }));
    } catch (e) { /* 配额或隐私模式,忽略 */ }
  }
  function restoreFilterFromStorage(filterBtns) {
    if (!window.localStorage) return false;
    let raw;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { return false; }
    if (!raw) return false;
    try {
      const state = JSON.parse(raw);
      const f = state.filter || 'all';
      const s = state.sort || 'score-asc';
      _dimState.sort = s;
      // 同步排序按钮
      const sortBtns = document.querySelectorAll('.sr-sort-btn');
      for (let i = 0; i < sortBtns.length; i++) {
        sortBtns[i].classList.toggle('is-active', sortBtns[i].getAttribute('data-sort') === s);
      }
      // 同步筛选按钮
      for (let j = 0; j < filterBtns.length; j++) {
        filterBtns[j].classList.toggle('is-active', filterBtns[j].getAttribute('data-filter') === f);
      }
      if (state.query) {
        const searchInput = document.getElementById('sr-dim-search');
        if (searchInput) {
          searchInput.value = state.query;
          _dimState.query = state.query;
        }
      }
      applyDimFilter(f);
      return true;
    } catch (e) { return false; }
  }

  /* ── Toast 通知系统 ── */
  const TOAST_ICONS = {
    success: '✓', warning: '⚠', error: '✕', info: 'ℹ'
  };
  function showToast(opts) {
    const container = document.getElementById('sr-toast-container');
    if (!container) return;
    const type = opts.type || 'info';
    const title = opts.title || '';
    const text = opts.text || '';
    const duration = opts.duration || 4000;
    const toast = document.createElement('div');
    toast.className = 'sr-toast is-' + type;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    let html = '<span class="sr-toast-icon">' + (TOAST_ICONS[type] || 'ℹ') + '</span>' +
      '<div class="sr-toast-body">';
    if (title) html += '<div class="sr-toast-title">' + escapeHtml(title) + '</div>';
    if (text) html += '<div class="sr-toast-text">' + escapeHtml(text) + '</div>';
    html += '</div><button class="sr-toast-close" aria-label="关闭通知">✕</button>';
    toast.innerHTML = html;
    container.appendChild(toast);
    const closeFn = function() {
      toast.classList.add('is-leaving');
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    };
    toast.querySelector('.sr-toast-close').addEventListener('click', closeFn);
    if (duration > 0) setTimeout(closeFn, duration);
    return toast;
  }

  /* ── 复制分享链接按钮 ── */
  function initCopyLinkButton() {
    const btn = document.getElementById('sr-copy-link-btn');
    if (!btn) return;
    btn.addEventListener('click', function() {
      let url = window.location.href;
      // 确保 hash 包含当前筛选状态
      if (window.location.hash.indexOf('dim-filter=') === -1) {
        syncFilterToHash(_dimState.filter);
        url = window.location.href;
      }
      const self = this;
      function onSuccess() {
        self.classList.add('is-copied');
        self.textContent = '✓ 已复制';
        showToast({
          type: 'success', title: '链接已复制',
          text: '含当前筛选与搜索状态，可直接分享或书签',
          duration: 2500
        });
        setTimeout(function() {
          self.classList.remove('is-copied');
          self.textContent = '🔗 复制链接';
        }, 1800);
      }
      function onFail() {
        showToast({
          type: 'error', title: '复制失败',
          text: '浏览器拒绝访问剪贴板，请手动复制地址栏 URL',
          duration: 4000
        });
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(onSuccess, onFail);
      } else {
        // 回退: 用临时 textarea + execCommand
        try {
          const ta = document.createElement('textarea');
          ta.value = url;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          const ok = document.execCommand('copy');
          document.body.removeChild(ta);
          if (ok) onSuccess(); else onFail();
        } catch (e) { onFail(); }
      }
    });
  }

  /* ── 文档标题 P0/P1 徽章 ── */
  let _origTitle = null;
  let _lastP0Count = null;
  function updateTitleBadge(p0Count, p1Count) {
    if (_origTitle === null) _origTitle = document.title;
    let badge = '';
    if (p0Count > 0) badge = '(' + p0Count + ' P0';
    else if (p1Count > 0) badge = '(' + p1Count + ' P1';
    if (badge) {
      document.title = badge + ') ' + _origTitle;
    } else {
      document.title = _origTitle;
    }
    // P0 首次出现告警 toast
    if (_lastP0Count !== null && p0Count > _lastP0Count) {
      const newP0 = p0Count - _lastP0Count;
      showToast({
        type: 'error',
        title: '⚠ 新增 ' + newP0 + ' 个 P0 告警',
        text: '当前共 ' + p0Count + ' 个 P0 项需立即处理 · 详见改进建议面板',
        duration: 8000
      });
    }
    _lastP0Count = p0Count;
  }

  /* ── URL hash 持久化筛选 ── */
  function syncFilterToHash(filter) {
    persistFilterState();
    if (!window.history || !window.history.replaceState) return;
    let hash = '#dim-filter=' + encodeURIComponent(filter);
    if (_dimState.query) hash += '&q=' + encodeURIComponent(_dimState.query);
    history.replaceState(null, '', hash);
  }

  function restoreFilterFromHash(filterBtns) {
    const hash = window.location.hash || '';
    if (!hash || hash.indexOf('dim-filter=') === -1) return false;
    const parts = hash.replace(/^#/, '').split('&');
    let f = null, q = null;
    for (let i = 0; i < parts.length; i++) {
      const eq = parts[i].indexOf('=');
      if (eq === -1) continue;
      const k = parts[i].slice(0, eq);
      const v = decodeURIComponent(parts[i].slice(eq + 1));
      if (k === 'dim-filter') f = v;
      else if (k === 'q') q = v;
    }
    if (f) {
      for (let j = 0; j < filterBtns.length; j++) {
        filterBtns[j].classList.toggle('is-active', filterBtns[j].getAttribute('data-filter') === f);
      }
      applyDimFilter(f);
    }
    if (q) {
      const searchInput = document.getElementById('sr-dim-search');
      if (searchInput) {
        searchInput.value = q;
        _dimState.query = q;
        applyDimFilter(_dimState.filter);
      }
    }
    return true;
  }

  /* ── 相对时间: "3 分钟前" ── */
  let _lastUpdatedTs = null;
  let _lastUpdatedText = '';
  function initRelativeTime() {
    const el = document.getElementById('sr-updated');
    if (el && _lastUpdatedText) {
      // 保留原始文本,叠加相对时间
    }
    updateRelativeTime();
  }
  function updateRelativeTime() {
    const el = document.getElementById('sr-updated');
    if (!el) return;
    const current = el.textContent;
    if (current && current !== '更新于 —' && !_lastUpdatedTs) {
      _lastUpdatedText = current;
      _lastUpdatedTs = Date.now();
    }
    if (!_lastUpdatedTs) return;
    const diffSec = Math.floor((Date.now() - _lastUpdatedTs) / 1000);
    let rel;
    if (diffSec < 5) rel = '刚刚';
    else if (diffSec < 60) rel = diffSec + ' 秒前';
    else if (diffSec < 3600) rel = Math.floor(diffSec / 60) + ' 分钟前';
    else rel = Math.floor(diffSec / 3600) + ' 小时前';
    el.textContent = _lastUpdatedText + ' · ' + rel;
  }
  // 暴露给 renderScoreReport 重置时间戳
  function resetRelativeTime() {
    _lastUpdatedTs = null;
    _lastUpdatedText = '';
  }

  /* ── Quicknav scroll spy: 高亮当前可见 section ── */
  function initScrollSpy() {
    const chips = document.querySelectorAll('.sr-qn-chip[data-target]');
    if (chips.length === 0 || !('IntersectionObserver' in window)) return;
    const targets = [];
    for (let i = 0; i < chips.length; i++) {
      const id = chips[i].getAttribute('data-target');
      const el = document.getElementById(id);
      if (el) targets.push({ chip: chips[i], el: el });
    }
    const observer = new IntersectionObserver(function(entries) {
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        if (entry.isIntersecting) {
          for (let j = 0; j < chips.length; j++) chips[j].classList.remove('is-active');
          for (let k = 0; k < targets.length; k++) {
            if (targets[k].el === entry.target) {
              targets[k].chip.classList.add('is-active');
            }
          }
        }
      }
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
    for (let m = 0; m < targets.length; m++) observer.observe(targets[m].el);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInteractionControls);
  } else {
    initInteractionControls();
  }

  /* ── sm-cards 交错入场 + score bar 重放动画 ────────────────────── */
  /* 为每个 .sm-card 注入 --sm-i (交错索引),然后重放 score bar 的 fill-in 动画。
     配合 index.css 中 .yry-smcard-in keyframes + .sm-card-scorebar-fill.is-animating 机制。
     自动暴露为 window.YryDashboardReport.animateSmCards() 以便页面按需触发。 */
  function animateSmCards() {
    const cards = Array.prototype.slice.call(
      document.querySelectorAll('.score-methodology .sm-card')
    );
    cards.forEach(function (c, i) { c.style.setProperty('--sm-i', i); });
    const bars = document.querySelectorAll('.sm-card-scorebar-fill[style*="--score"]');
    bars.forEach(function (bar) {
      bar.classList.add('is-animating');
      void bar.offsetWidth; /* 强制 reflow 触发 transition 重置 */
      setTimeout(function () { bar.classList.remove('is-animating'); }, 50);
    });
  }

  function initSmCardsAnimation() {
    /* 数据 fetch 完成后再触发,确保 score 已注入到 --score 自定义属性 */
    setTimeout(animateSmCards, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmCardsAnimation);
  } else {
    initSmCardsAnimation();
  }

  /* ── 每 5 分钟自动刷新 (标签页隐藏时暂停) ── */
  _refreshTimer = setInterval(fetchScoreData, 5 * 60 * 1000);

  /* ── 对外暴露 ── */
  window.YryDashboardReport = window.YryDashboardReport || {};
  window.YryDashboardReport.animateSmCards = animateSmCards;
})();
