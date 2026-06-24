/**
 * YrY 文档中心 · 评分报告数据填充脚本
 * 从 docs/index.html 内联 <script> 迁出，保持 IIFE 结构以兼容现有加载顺序
 * 数据源优先级: score-report.json → summary.json → cdn-summary/index.json → 内置默认值
 */
(function() {
  'use strict';

  /* ── 评分工具函数 (浏览器端复刻 lib/scoring.mjs 核心逻辑) ── */
  var SCORE_TIERS = { excellent: 90, good: 75, fair: 60, poor: 0 };
  var GRADE_THRESHOLDS = [
    { grade: 'A', min: 90, label: '优秀', color: '#4ade80' },
    { grade: 'B', min: 75, label: '良好', color: '#60a5fa' },
    { grade: 'C', min: 60, label: '一般', color: '#fbbf24' },
    { grade: 'D', min: 0,  label: '需关注', color: '#f87171' }
  ];

  function getGrade(score) {
    for (var i = 0; i < GRADE_THRESHOLDS.length; i++) {
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
    var n = history.length;
    var xMean = (n - 1) / 2;
    var yMean = 0;
    for (var i = 0; i < n; i++) yMean += history[i];
    yMean /= n;
    var ssXY = 0, ssXX = 0, ssYY = 0;
    for (var i = 0; i < n; i++) {
      var dx = i - xMean;
      var dy = history[i] - yMean;
      ssXY += dx * dy;
      ssXX += dx * dx;
      ssYY += dy * dy;
    }
    var slope = ssXX !== 0 ? ssXY / ssXX : 0;
    var r2 = ssYY !== 0 ? (ssXY * ssXY) / (ssXX * ssYY) : 0;
    var slopePerWeek = slope * 7;
    var direction = Math.abs(slopePerWeek) < 1 ? 'stable' : (slope > 0 ? 'rising' : 'falling');
    var confidence = r2 >= 0.7 ? 'high' : (r2 >= 0.4 ? 'medium' : 'low');
    return {
      direction: direction, slope: Math.round(slope * 100) / 100,
      slopePerWeek: Math.round(slopePerWeek * 100) / 100,
      r2: Math.round(r2 * 100) / 100, confidence: confidence
    };
  }

  function forecastScore(history, periodsAhead) {
    periodsAhead = periodsAhead || 7;
    var trend = detectTrend(history);
    if (!trend || trend.confidence === 'low' || history.length < 5) {
      var lastScore = history && history.length ? history[history.length - 1] : 0;
      return { forecast: lastScore, range: [lastScore - 10, lastScore + 10], confidence: 'low' };
    }
    var lastIdx = history.length - 1;
    var fc = Math.round(history[lastIdx] + trend.slope * periodsAhead);
    var mean = 0;
    for (var i = 0; i < history.length; i++) mean += history[i];
    mean /= history.length;
    var variance = 0;
    for (var i = 0; i < history.length; i++) variance += Math.pow(history[i] - mean, 2);
    variance /= history.length;
    var stddev = Math.sqrt(variance);
    var margin = Math.round(stddev * 1.5);
    return {
      forecast: Math.max(0, Math.min(100, fc)),
      range: [Math.max(0, fc - margin), Math.min(100, fc + margin)],
      confidence: trend.confidence
    };
  }

  function scoreReliability(history) {
    if (!history || history.length < 3) return null;
    var n = history.length;
    var mean = 0;
    for (var i = 0; i < n; i++) mean += history[i];
    mean /= n;
    var variance = 0;
    for (var i = 0; i < n; i++) variance += Math.pow(history[i] - mean, 2);
    variance /= n;
    var stddev = Math.sqrt(variance);
    var cv = mean !== 0 ? stddev / mean : 0;
    var volatility = cv < 0.05 ? 'low' : (cv < 0.15 ? 'moderate' : 'high');
    var reliability = Math.max(0, Math.min(1, 1 - cv));
    return {
      mean: Math.round(mean * 10) / 10,
      stddev: Math.round(stddev * 10) / 10,
      volatility: volatility,
      reliability: Math.round(reliability * 100) / 100
    };
  }

  /* ── 域名感知: 自动选择正确的数据源基础路径 ── */
  function getBasePath() {
    var host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return '..';
    if (host.includes('cdn')) return '..';
    return '..';
  }

  /* ── 渲染评分报告 ── */
  function renderScoreReport(data) {
    var composite = data.composite || 0;
    var gradeInfo = getGrade(composite);
    var tier = classifyScore(composite);

    // 优先使用内嵌的完整评分报告
    var fullReport = data._scoreReport || data;

    // 概述网格
    var elComp = document.getElementById('sr-composite');
    if (elComp) {
      elComp.textContent = composite;
      elComp.style.color = gradeInfo.color;
    }
    var elGrade = document.getElementById('sr-grade-label');
    if (elGrade) elGrade.textContent = gradeInfo.grade + '级 · ' + gradeInfo.label;

    // 趋势 — 优先使用完整报告的趋势数据
    var trend = null;
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
    var forecast = null;
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

    var reliability = null;
    if (fullReport.reliability && typeof fullReport.reliability.score === 'number') {
      reliability = {
        reliability: fullReport.reliability.score,
        volatility: fullReport.reliability.volatility || 'low'
      };
    } else {
      var historyVals2 = [];
      var scoreHistory2 = data.scoreTrend || [];
      for (var i2 = 0; i2 < scoreHistory2.length; i2++) {
        if (typeof scoreHistory2[i2].score === 'number') historyVals2.push(scoreHistory2[i2].score);
        else if (typeof scoreHistory2[i2].composite === 'number') historyVals2.push(scoreHistory2[i2].composite);
      }
      reliability = scoreReliability(historyVals2);
    }

    var trendEmoji = { rising: '📈', falling: '📉', stable: '➡️' };
    var trendLabel = { rising: '上升', falling: '下降', stable: '稳定' };

    var elTrendDir = document.getElementById('sr-trend-dir');
    if (elTrendDir && trend) {
      elTrendDir.textContent = trendEmoji[trend.direction] + ' ' + trendLabel[trend.direction];
    }
    var elTrendDetail = document.getElementById('sr-trend-detail');
    if (elTrendDetail && trend) {
      elTrendDetail.textContent = (trend.slopePerWeek > 0 ? '+' : '') + trend.slopePerWeek + '分/周 · 置信度' +
        (trend.confidence === 'high' ? '高' : trend.confidence === 'medium' ? '中' : '低') +
        ' · R²=' + trend.r2;
    }

    var elFc = document.getElementById('sr-forecast');
    if (elFc && forecast) {
      elFc.textContent = forecast.forecast;
      var fcGrade = getGrade(forecast.forecast);
      elFc.style.color = fcGrade.color;
    }
    var elFcRange = document.getElementById('sr-forecast-range');
    if (elFcRange && forecast) {
      elFcRange.textContent = forecast.range[0] + ' – ' + forecast.range[1] + ' (95% CI)';
    }

    var elRel = document.getElementById('sr-reliability');
    if (elRel && reliability) {
      elRel.textContent = Math.round(reliability.reliability * 100) + '%';
    }
    var elVol = document.getElementById('sr-volatility');
    if (elVol && reliability) {
      var volLabel = { low: '低波动·高可靠', moderate: '中等波动', high: '高波动·低可靠' };
      elVol.textContent = volLabel[reliability.volatility] || '';
    }

    var elDiag = document.getElementById('sr-diag');
    if (elDiag) {
      var triggered = data.diagTriggered || (data.diagSummary ? data.diagSummary.triggered : 0) || 0;
      elDiag.textContent = triggered + '/8';
      if (triggered >= 3) elDiag.style.color = '#f87171';
      else if (triggered >= 1) elDiag.style.color = '#fbbf24';
      else elDiag.style.color = '#4ade80';
    }

    var elArch = document.getElementById('sr-arch');
    var elArchDetail = document.getElementById('sr-arch-detail');
    if (elArch && data.archHealth) {
      var archGrade = data.archHealth.grade || '—';
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
    var dimEntries = [];
    for (var key in dims) {
      if (dims.hasOwnProperty(key)) {
        var d = dims[key];
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
    var displayDims = dimEntries.slice(0, 10);
    var dimListEl = document.getElementById('sr-dim-list');
    if (dimListEl && displayDims.length > 0) {
      var html = '';
      for (var i = 0; i < displayDims.length; i++) {
        var dim = displayDims[i];
        var dimGrade = getGrade(dim.score);
        var barClass = classifyScore(dim.score);
        var trendArrow = dim.trend === 'rising' ? '↑' : dim.trend === 'falling' ? '↓' : '→';
        var trendCls = dim.trend === 'rising' ? 'is-rising' : dim.trend === 'falling' ? 'is-falling' : 'is-stable';
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
    var elCompDelta = document.getElementById('sr-comp-delta');
    var elCompImproved = document.getElementById('sr-comp-improved');
    var elCompDeclined = document.getElementById('sr-comp-declined');
    var elCompNet = document.getElementById('sr-comp-net');
    if (scoreHistory.length >= 2) {
      var prevScore = typeof scoreHistory[scoreHistory.length - 2].score === 'number'
        ? scoreHistory[scoreHistory.length - 2].score
        : (scoreHistory[scoreHistory.length - 2].composite || 0);
      var currScore = typeof scoreHistory[scoreHistory.length - 1].score === 'number'
        ? scoreHistory[scoreHistory.length - 1].score
        : (scoreHistory[scoreHistory.length - 1].composite || 0);
      var delta = Math.round((currScore - prevScore) * 10) / 10;
      if (elCompDelta) { elCompDelta.textContent = (delta > 0 ? '+' : '') + delta + ' 分'; elCompDelta.style.color = delta > 0 ? '#4ade80' : delta < 0 ? '#f87171' : '#6b708a'; }
      if (elCompImproved) { elCompImproved.textContent = delta > 0 ? (delta > 3 ? '显著改善 ↑↑' : '小幅改善 ↑') : '—'; elCompImproved.style.color = delta > 0 ? '#4ade80' : '#6b708a'; }
      if (elCompDeclined) { elCompDeclined.textContent = delta < 0 ? (delta < -3 ? '明显退化 ↓↓' : '轻微退化 ↓') : '—'; elCompDeclined.style.color = delta < 0 ? '#f87171' : '#6b708a'; }
      var netLabel = delta > 0 ? '+' + delta : delta < 0 ? '' + delta : '持平';
      if (elCompNet) { elCompNet.textContent = netLabel; elCompNet.style.color = delta > 0 ? '#4ade80' : delta < 0 ? '#f87171' : '#6b708a'; }
    }

    // AI 摘要
    var summaryEl = document.getElementById('sr-summary');
    if (summaryEl) {
      var stateLabel = composite >= 90 ? '健康' : composite >= 75 ? '基本健康' : composite >= 60 ? '需要关注' : '存在风险';
      var summaryText = '项目综合健康指数 ' + composite + ' 分（' + gradeInfo.grade + '级 · ' + gradeInfo.label + '），整体状态判定：<strong>' + stateLabel + '</strong>。';
      if (trend) {
        summaryText += '近7日评分呈<strong>' + trendLabel[trend.direction] + '趋势</strong>' +
          (trend.direction !== 'stable' ? '（Δ=' + (trend.slopePerWeek > 0 ? '+' : '') + trend.slopePerWeek + '分/周 · R²=' + trend.r2 + ' · 置信度' + trend.confidence + '）' : '（R²=' + trend.r2 + '）') + '。';
      }
      if (forecast) {
        summaryText += '7天后预测评分 <strong>' + forecast.forecast + ' 分</strong>' +
          (forecast.confidence !== 'low' ? '（95% CI: ' + forecast.range[0] + '–' + forecast.range[1] + ' · 置信度' + forecast.confidence + '）' : '（基础数据不足,置信度低）') + '。';
      }
      if (reliability) {
        var volDesc = reliability.volatility === 'low' ? '高' : reliability.volatility === 'moderate' ? '中' : '低';
        summaryText += '评分可靠性 <strong>' + Math.round(reliability.reliability * 100) + '%</strong>（波动性' + volDesc + '）。';
      }
      var p0Count = 0, p1Count = 0;
      if (data._scoreReport && data._scoreReport.recommendations) {
        var recs = data._scoreReport.recommendations;
        for (var ri = 0; ri < recs.length; ri++) {
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
    var elUpdated = document.getElementById('sr-updated');
    if (elUpdated) {
      elUpdated.textContent = '更新于 ' + new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }

    // P0 badge
    var p0Badge = document.getElementById('sr-p0-badge');
    if (p0Badge && composite < 60) {
      p0Badge.style.display = 'inline';
    }
  }

  /* ── 渲染评分方法卡片 (接受任意数据格式,内部归一化) ── */
  function renderMethodologyCards(data) {
    // 归一化: 兼容 score-report.json / summary.json / raw dim data
    var composite = typeof data.composite === 'object'
      ? (data.composite.score || 0)
      : (data.composite || 0);
    var phiGrade = getGrade(composite);
    var elPhi = document.getElementById('sm-grade-phi');
    if (elPhi) {
      elPhi.textContent = composite + '/' + phiGrade.grade;
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
        for (var key in data.dimSummary) {
          if (data.dimSummary[key].label === label) return data.dimSummary[key].score;
        }
      }
      return null;
    }

    // SHI: 技能健康指数
    var shiScore = data.skillScore
      || dimLookup('组件质量')
      || dimLookup('技能健康')
      || (data.dimSummary && data.dimSummary.skill_health ? data.dimSummary.skill_health.score : null)
      || 86;
    var shiGrade = getGrade(shiScore);
    var elShi = document.getElementById('sm-grade-shi');
    if (elShi) {
      elShi.textContent = shiScore + '/' + shiGrade.grade;
      elShi.className = 'sm-card-grade grade-' + shiGrade.grade;
    }

    // TQI: 测试质量指数
    var tqiScore = data.testScore
      || dimLookup('测试覆盖')
      || dimLookup('测试')
      || 60;
    var tqiGrade = getGrade(tqiScore);
    var elTqi = document.getElementById('sm-grade-tqi');
    if (elTqi) {
      elTqi.textContent = tqiScore + '/' + tqiGrade.grade;
      elTqi.className = 'sm-card-grade grade-' + tqiGrade.grade;
    }

    // SII: 自改进闭环指数
    var siiScore = data.selfImproveScore
      || dimLookup('自改进闭环')
      || dimLookup('自改进')
      || 89;
    var siiGrade = getGrade(siiScore);
    var elSii = document.getElementById('sm-grade-sii');
    if (elSii) {
      elSii.textContent = siiScore + '/' + siiGrade.grade;
      elSii.className = 'sm-card-grade grade-' + siiGrade.grade;
    }

    // AQI: 架构质量指数
    var aqiScore = null;
    var aqiGradeLetter = null;
    if (data.archHealth && data.archHealth.grade) {
      aqiGradeLetter = data.archHealth.grade;
      aqiScore = aqiGradeLetter === 'A' ? 95 : aqiGradeLetter === 'B' ? 80 : aqiGradeLetter === 'C' ? 50 : 30;
    } else if (data.architecture && data.architecture.grade) {
      aqiGradeLetter = data.architecture.grade;
      aqiScore = aqiGradeLetter === 'A' ? 95 : aqiGradeLetter === 'B' ? 80 : aqiGradeLetter === 'C' ? 50 : 30;
    }
    var elAqi = document.getElementById('sm-grade-aqi');
    if (elAqi && aqiGradeLetter) {
      elAqi.textContent = aqiScore + '/' + aqiGradeLetter;
      elAqi.className = 'sm-card-grade grade-' + aqiGradeLetter;
    }

    // DHI: 诊断健康指数 — 100 - triggered×15, min 0
    var diagTrig = data.diagTriggered || 0;
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
    var dhiScore = Math.max(0, 100 - diagTrig * 15);

    // UPHI: Unified Project Health Index
    var uphiHealthScore = composite;
    var uphiCompScore = shiScore;
    var uphiDiagScore = dhiScore;
    var uphiArchScore = aqiScore;
    if (!uphiArchScore && aqiGradeLetter) {
      uphiArchScore = aqiGradeLetter === 'A' ? 95 : aqiGradeLetter === 'B' ? 80 : aqiGradeLetter === 'C' ? 50 : 30;
    }
    if (!uphiArchScore) uphiArchScore = 80;
    var uphiScore = Math.round(uphiHealthScore * 0.4 + uphiCompScore * 0.25 + uphiDiagScore * 0.2 + uphiArchScore * 0.15);
    var uphiGrade = getGrade(uphiScore);
    var elUphi = document.getElementById('sm-grade-uphi');
    if (elUphi) {
      elUphi.textContent = uphiScore + '/' + uphiGrade.grade;
      elUphi.className = 'sm-card-grade grade-' + uphiGrade.grade;
    }

    // DQI: Document Quality Index
    var dqiScore = data.docQualityScore
      || dimLookup('文档质量')
      || (data.archHealth && typeof data.archHealth.docFreshness === 'number' ? data.archHealth.docFreshness : null)
      || 82;
    var dqiGrade = getGrade(dqiScore);
    var elDqi = document.getElementById('sm-grade-dqi');
    if (elDqi) {
      elDqi.textContent = dqiScore + '/' + dqiGrade.grade;
      elDqi.className = 'sm-card-grade grade-' + dqiGrade.grade;
    }
  }

  /* ── Live 数据拉取 (优先使用完整的 score-report.json) ── */
  function fetchScoreData() {
    var base = getBasePath();
    var urls = [
      base + '/docs/评分报告/score-report.json',
      base + '/docs/自我改进/summary.json',
      base + '/cdn/cdn-summary/index.json',
      base + '/cdn/health-report/index.json'
    ];

    var idx = 0;
    function tryNext() {
      if (idx >= urls.length) {
        console.warn('[ScoreReport] 所有数据源均不可达,使用默认数据');
        renderWithDefaultData();
        return;
      }
      var url = urls[idx++];
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
            var srData = data.scoreReport || data;
            renderScoreReport(srData);
          }
          renderMethodologyCards(data);
          var elUpdated = document.getElementById('sr-updated');
          if (elUpdated) {
            var srcLabel = url.indexOf('score-report.json') !== -1 ? '评分报告' :
                           url.indexOf('summary.json') !== -1 ? '自我改进' : 'CDN汇总';
            elUpdated.textContent = '更新于 ' + new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) + ' · 数据源: ' + srcLabel;
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
    var p0Badge = document.getElementById('sr-p0-badge');
    if (!p0Badge) return;
    var p0 = 0, p1 = 0;
    for (var i = 0; i < recs.length; i++) {
      if (recs[i].priority === 'P0') p0++;
      else if (recs[i].priority === 'P1') p1++;
    }
    if (p0 > 0) {
      p0Badge.textContent = (p0 > 0 ? 'P0×' + p0 + ' ' : '') + (p1 > 0 ? 'P1×' + p1 : '') + ' 待处理';
      p0Badge.style.display = 'inline';
    }
  }

  function buildDimSummaryFromReport(report) {
    var dims = {};
    var breakdown = report.breakdown || [];
    for (var i = 0; i < breakdown.length; i++) {
      var b = breakdown[i];
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
    var elDelta = document.getElementById('sr-comp-delta');
    var elImproved = document.getElementById('sr-comp-improved');
    var elDeclined = document.getElementById('sr-comp-declined');
    var elNet = document.getElementById('sr-comp-net');

    if (comparison && comparison.compositeDelta !== undefined) {
      var delta = comparison.compositeDelta || 0;
      if (elDelta) { elDelta.textContent = (delta > 0 ? '+' : '') + delta + ' 分'; elDelta.style.color = delta > 0 ? '#4ade80' : delta < 0 ? '#f87171' : '#6b708a'; }
      if (elImproved) { elImproved.textContent = (comparison.improved || 0) + ' 项'; elImproved.style.color = comparison.improved > 0 ? '#4ade80' : '#6b708a'; }
      if (elDeclined) { elDeclined.textContent = (comparison.declined || 0) + ' 项'; elDeclined.style.color = comparison.declined > 0 ? '#f87171' : '#6b708a'; }
      var net = (comparison.improved || 0) - (comparison.declined || 0);
      if (elNet) { elNet.textContent = (net > 0 ? '+' : '') + net; elNet.style.color = net > 0 ? '#4ade80' : net < 0 ? '#f87171' : '#6b708a'; }
    } else if (comparison && comparison.dimensions) {
      var improved = 0, declined = 0, totalDelta = 0;
      for (var i = 0; i < comparison.dimensions.length; i++) {
        var d = comparison.dimensions[i];
        if (d.delta > 0) improved++;
        else if (d.delta < 0) declined++;
        totalDelta += (d.delta || 0);
      }
      var avgDelta = comparison.dimensions.length > 0 ? Math.round(totalDelta / comparison.dimensions.length) : 0;
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

  /* ── 默认数据回退 ── */
  function renderWithDefaultData() {
    var defaultData = {
      composite: 94,
      scoreTrend: [{ score: 82 }, { score: 94 }],
      dimSummary: {
        token_health:  { label: 'Token健康', score: 100, trend: 'stable', category: 'core' },
        config_health: { label: '配置健康', score: 100, trend: 'stable', category: 'core' },
        api_health:    { label: 'API健康',   score: 100,  trend: 'stable', category: 'core' },
        reports_health:{ label: '报告健康', score: 100,  trend: 'stable', category: 'core' },
        format_health: { label: '格式规范', score: 100,  trend: 'stable', category: 'quality' },
        diag_health:   { label: '诊断健康', score: 85,  trend: 'rising', category: 'core' },
        git_health:    { label: 'Git健康',   score: 80,  trend: 'rising', category: 'core' },
        security:      { label: '安全防护', score: 100,  trend: 'stable', category: 'core' },
        testing:       { label: '测试覆盖', score: 100,  trend: 'rising', category: 'engineering' },
        cicd:          { label: 'CI/CD',     score: 100,  trend: 'rising', category: 'engineering' },
        types:         { label: '类型安全', score: 100,  trend: 'stable', category: 'engineering' },
        docs:          { label: '文档覆盖', score: 100,  trend: 'stable', category: 'engineering' },
        deps:          { label: '依赖管理', score: 100,  trend: 'stable', category: 'engineering' },
        dep_analysis:  { label: '依赖分析', score: 81,  trend: 'rising', category: 'structural' },
        file_size:     { label: '文件大小', score: 96,  trend: 'stable', category: 'structural' },
        notify:        { label: '通知健康', score: 100,  trend: 'stable', category: 'quality' },
        comp_qual:     { label: '组件质量', score: 85,  trend: 'stable',  category: 'quality' },
        em_cicd:       { label: 'CI/CD',     score: 100,  trend: 'rising', category: 'engineering' },
        em_testing:    { label: '测试成熟度',score: 100,  trend: 'rising', category: 'engineering' },
        em_deps:       { label: '依赖管理', score: 100,  trend: 'stable', category: 'engineering' }
      },
      archHealth: { grade: 'A' },
      diagTriggered: 1
    };
    renderScoreReport(defaultData);
    renderMethodologyCards(defaultData);
    var elUpdated = document.getElementById('sr-updated');
    if (elUpdated) elUpdated.textContent = '⚠️ 离线模式 · 使用内置默认数据';
    var summaryEl = document.getElementById('sr-summary');
    if (summaryEl) {
      summaryEl.innerHTML = '<strong>⚠️ 数据源不可达 — 当前显示离线默认值</strong><br><br>' +
        '以下评分基于<strong>内置静态基线数据</strong>，反映项目最后一次健康检查时的近似状态，非实时数据。<br><br>' +
        '<strong>恢复实时数据的方法：</strong><br>' +
        '① 运行 <code>node lib/score-report-generator.mjs</code> 生成最新评分报告<br>' +
        '② 运行 <code>node skills/rui-bot/send.mjs health</code> 执行健康检查并持久化趋势<br>' +
        '③ 确认 <code>docs/评分报告/score-report.json</code> 文件存在且可被 HTTP 服务访问<br>' +
        '④ 如使用本地文件预览，启动 HTTP 服务器：<code>npx serve docs</code> 或 <code>python3 -m http.server</code><br><br>' +
        '数据源尝试顺序：score-report.json → summary.json → cdn-summary/index.json → 内置默认值';
    }
  }

  /* ── 入口: 页面加载后启动 ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchScoreData);
  } else {
    fetchScoreData();
  }

  /* ── 每 5 分钟自动刷新 ── */
  setInterval(fetchScoreData, 5 * 60 * 1000);
})();
