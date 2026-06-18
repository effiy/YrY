/* ==========================================================================
   self-improve-index.js — 自我改进仪表板渲染逻辑
   依赖: ../../cdn/shared-reports.js (提供 YrYReports.* 工具函数)
   注意: 本页面使用独立评分阈值 (80/60 vs 标准 85/70/55)
   ========================================================================== */

(function() {
  var DIAG_LABELS = {
    D0: '基线偏离', D1: '缓存退化', D2: '质量退化', D3: '上下文退化',
    D4: '依赖过期', D5: '外部趋势', D6: '文档过时', D7: '测试缺口', D8: '架构退化'
  };
  var DIAG_DESCS = {
    D0: '配置/规约偏离基线',
    D1: '记忆/缓存文件退化',
    D2: '代码质量指标下降',
    D3: '上下文/文档膨胀',
    D4: '依赖版本过期风险',
    D5: '外部技术趋势变化',
    D6: '文档与代码不一致',
    D7: '测试覆盖率不足',
    D8: '架构范式偏离'
  };
  var DIM_LABELS = {
    token: 'Token 安全', config: '配置健康', robots: '机器人就绪', api: 'API 可达',
    reports: '报告质量', format: '格式规范', diagnostics: '诊断引擎', git: 'Git 纪律',
    security: '安全基线', em_testing: '测试覆盖', em_types: '类型安全', em_linting: '代码检查',
    em_cicd: 'CI/CD', em_docs: '文档质量', em_deps: '依赖管理', em_git: 'Git 实践',
    comp_qual: '组件质量'
  };

  function scoreClr(s) { return s >= 80 ? 'var(--yry-pass)' : s >= 60 ? 'var(--yry-warn)' : 'var(--yry-fail)'; }
  function scoreGrade(s) { return s >= 85 ? 'A' : s >= 70 ? 'B' : s >= 55 ? 'C' : 'D'; }
  function scoreCls(s) { return s >= 85 ? 'A' : s >= 70 ? 'B' : s >= 55 ? 'C' : 'D'; }

  var currentPeriod = 'daily';

  function renderPeriod(data, period) {
    var entries = data[period] || [];
    if (!entries.length) return '<div class="empty">暂无' + (period === 'daily' ? '日' : period === 'weekly' ? '周' : '月') + '趋势数据</div>';

    return entries.map(function(d, i) {
      var barClr = scoreClr(d.avgScore);
      var label = period === 'daily' ? d.date || '日 ' + (i + 1) :
                  period === 'weekly' ? (d.week || '周 ' + (i + 1)) :
                  (d.month || '月 ' + (i + 1));
      var gradeDist = d.gradeDist || {};
      var totalGrades = (gradeDist.A || 0) + (gradeDist.B || 0) + (gradeDist.C || 0) + (gradeDist.D || 0);
      var gradeBars = '';
      if (totalGrades > 0) {
        gradeBars = '<div class="grade-bar-wrap" style="width:100px;flex-shrink:0">' +
          '<div class="grade-bar A" style="width:' + ((gradeDist.A || 0) / totalGrades * 100) + '%" title="A: ' + (gradeDist.A || 0) + '"></div>' +
          '<div class="grade-bar B" style="width:' + ((gradeDist.B || 0) / totalGrades * 100) + '%" title="B: ' + (gradeDist.B || 0) + '"></div>' +
          '<div class="grade-bar C" style="width:' + ((gradeDist.C || 0) / totalGrades * 100) + '%" title="C: ' + (gradeDist.C || 0) + '"></div>' +
          '<div class="grade-bar D" style="width:' + ((gradeDist.D || 0) / totalGrades * 100) + '%" title="D: ' + (gradeDist.D || 0) + '"></div>' +
          '</div>';
      }
      var deltaHtml = '';
      if (d.delta && d.delta.score !== undefined && d.delta.score !== null) {
        var ds = d.delta.score;
        deltaHtml = '<span class="day-delta" style="color:' + (ds > 0 ? 'var(--yry-pass)' : ds < 0 ? 'var(--yry-fail)' : 'var(--yry-text3)') + '">' + (ds > 0 ? '↑+' : ds < 0 ? '↓' : '→') + Math.abs(ds) + '</span>';
      }
      return '<div class="day-card">' +
        '<span class="day-date">' + label + '</span>' +
        '<span class="day-score" style="color:' + barClr + '">' + d.avgScore + '</span>' +
        '<span class="day-grade"><span class="badge ' + (d.topGrade || 'C') + '">' + (d.topGrade || 'C') + '</span></span>' +
        '<div class="day-bar"><div class="day-bar-fill" style="width:' + Math.max(d.avgScore, 3) + '%;background:' + barClr + '"></div></div>' +
        gradeBars +
        deltaHtml +
        '<span class="day-range">' + d.minScore + '–' + d.maxScore + '</span>' +
        '<span style="font-size:.62rem;color:var(--yry-text3)">' + d.entries + ' 条</span>' +
        '</div>';
    }).join('');
  }

  function renderComponentHealth(ch) {
    if (!ch) return '<div class="empty">暂无组件健康数据</div>';
    var items = [
      { key: 'skills', label: 'Skills', icon: '19', count: ch.skills.count, score: ch.skills.avgScore, desc: '技能规约' },
      { key: 'agents', label: 'Agents', icon: '10', count: ch.agents.count, score: ch.agents.avgScore, desc: 'Agent 定义' },
      { key: 'rules', label: 'Rules', icon: '16', count: ch.rules.count, score: ch.rules.avgScore, desc: '规则文件' },
      { key: 'scripts', label: 'Scripts', icon: '51', count: ch.scripts.count, score: ch.scripts.avgScore, desc: '辅助脚本' }
    ];
    var html = '<div style="margin-bottom:14px;display:flex;align-items:center;gap:16px;flex-wrap:wrap">' +
      '<span style="font-size:.78rem;color:var(--yry-text2)">总计 <strong style="color:var(--yry-accent)">' + ch.totalComponents + '</strong> 组件 · 综合均分 <strong style="color:' + scoreClr(ch.overallAvg) + '">' + ch.overallAvg + ' / ' + scoreGrade(ch.overallAvg) + ' 级</strong></span>' +
      '</div>';
    html += '<div class="comp-grid">';
    html += items.map(function(item) {
      var g = scoreGrade(item.score);
      var clr = scoreClr(item.score);
      return '<div class="comp-item">' +
        '<div class="comp-icon">' + (item.key === 'skills' ? '🧩' : item.key === 'agents' ? '🤖' : item.key === 'rules' ? '📋' : '⚡') + '</div>' +
        '<div style="font-weight:600;font-size:.84rem">' + item.label + '</div>' +
        '<div class="comp-count">' + item.count + ' ' + item.desc + '</div>' +
        '<div class="comp-score" style="color:' + clr + '">' + item.score + '<span style="font-size:.6rem;color:var(--yry-text3);margin-left:4px">/ ' + g + ' 级</span></div>' +
        '<div class="comp-bar-wrap"><div class="comp-bar-fill" style="width:' + item.score + '%;background:' + clr + '"></div></div>' +
        '</div>';
    }).join('');
    html += '</div>';
    return html;
  }

  function renderArchHealth(ah) {
    if (!ah || !ah.latest) return '<div class="empty">暂无架构健康数据</div>';
    var latest = ah.latest;
    var scores = latest.scores || {};
    var dimTrends = ah.dimTrends || {};
    var passClr = latest.composite >= 80 ? 'var(--yry-pass)' : latest.composite >= 60 ? 'var(--yry-warn)' : 'var(--yry-fail)';

    // Summary row
    var html = '<div class="arch-summary">' +
      '<div class="arch-big">' +
        '<div class="arch-big-score" style="color:' + passClr + '">' + latest.composite + '</div>' +
        '<div class="arch-big-grade"><span class="badge ' + latest.grade + '">' + latest.grade + ' 级</span></div>' +
      '</div>' +
      '<div class="arch-meta">' +
        '<div>检查通过: <strong style="color:var(--yry-pass)">' + latest.passedChecks + ' / ' + latest.totalChecks + '</strong></div>' +
        '<div>失败维度: <strong style="color:' + (latest.failedDims && latest.failedDims.length > 0 ? 'var(--yry-fail)' : 'var(--yry-pass)') + '">' + (latest.failedDims && latest.failedDims.length > 0 ? latest.failedDims.join(', ') : '无') + '</strong></div>' +
        '<div>检查时间: ' + (latest.timestamp || '—') + '</div>' +
      '</div>' +
      '</div>';

    // Dimension grid
    var dimKeys = Object.keys(scores).sort();
    if (dimKeys.length === 0) {
      dimKeys = Object.keys(dimTrends);
    }
    html += '<div class="arch-dim-grid">';
    html += dimKeys.map(function(k) {
      var dimScore = scores[k] !== undefined ? scores[k] : (dimTrends[k] ? dimTrends[k].recentAvg : '—');
      var dimLabel = dimTrends[k] ? dimTrends[k].label : k;
      var g = typeof dimScore === 'number' ? scoreGrade(dimScore) : '';
      var clr = typeof dimScore === 'number' ? scoreClr(dimScore) : 'var(--yry-text3)';
      var trendVal = dimTrends[k] ? dimTrends[k].trend : undefined;
      var trendHtml = '';
      if (trendVal !== undefined) {
        trendHtml = '<span class="arch-dim-trend" style="color:' + (trendVal >= 80 ? 'var(--yry-pass)' : trendVal >= 60 ? 'var(--yry-warn)' : 'var(--yry-fail)') + '">均 ' + trendVal + '</span>';
      }
      return '<div class="arch-dim-item">' +
        '<span class="arch-dim-dot" style="background:' + clr + '"></span>' +
        '<span class="arch-dim-label">' + dimLabel + '</span>' +
        '<span class="arch-dim-score" style="color:' + clr + '">' + dimScore + '</span>' +
        trendHtml +
        '</div>';
    }).join('');
    html += '</div>';
    return html;
  }

  function renderScoreTrend(rawTrend) {
    if (!rawTrend || rawTrend.length === 0) return '<div class="empty">暂无评分趋势数据</div>';

    // Deduplicate: keep only entries where score changes from previous
    var pts = [];
    var lastScore = null;
    for (var i = 0; i < rawTrend.length; i++) {
      var entry = rawTrend[i];
      if (entry.score !== lastScore || i === 0) {
        pts.push({ idx: i, date: entry.date, time: entry.time, score: entry.score, grade: entry.grade, triggered: entry.triggered });
        lastScore = entry.score;
      }
      // Always capture the last entry of the day
      if (i === rawTrend.length - 1) {
        var last = rawTrend[i];
        if (pts.length === 0 || pts[pts.length - 1].score !== last.score) {
          pts.push({ idx: i, date: last.date, time: last.time, score: last.score, grade: last.grade, triggered: last.triggered });
        }
      }
    }

    var n = pts.length;
    var minScore = 0, maxScore = 100;
    var scores = pts.map(function(p) { return p.score; });
    var dataMin = Math.min.apply(null, scores);
    var dataMax = Math.max.apply(null, scores);
    var pad = (dataMax - dataMin) < 10 ? 10 : 0;
    dataMin = Math.max(0, dataMin - pad);
    dataMax = Math.min(100, dataMax + pad);

    // SVG dimensions
    var W = 860, H = 180, padL = 50, padR = 20, padT = 15, padB = 30;
    var plotW = W - padL - padR, plotH = H - padT - padB;

    function x(i) { return padL + (i / (n - 1)) * plotW; }
    function y(s) { return padT + plotH - ((s - dataMin) / (dataMax - dataMin)) * plotH; }

    // Build polyline path
    var pathD = pts.map(function(p, i) {
      return (i === 0 ? 'M' : 'L') + x(i).toFixed(1) + ',' + y(p.score).toFixed(1);
    }).join(' ');

    // Build area path (for filled area under curve)
    var areaD = pathD + ' L' + x(n - 1).toFixed(1) + ',' + y(dataMin).toFixed(1) + ' L' + x(0).toFixed(1) + ',' + y(dataMin).toFixed(1) + ' Z';

    // Y-axis labels
    var yLabels = '';
    var ySteps = 4;
    for (var yi = 0; yi <= ySteps; yi++) {
      var sv = Math.round(dataMin + (dataMax - dataMin) * yi / ySteps);
      var sy = y(sv);
      yLabels += '<text x="' + (padL - 6) + '" y="' + (sy + 4) + '" text-anchor="end" fill="#6e7072" font-size="10" font-family="JetBrains Mono, monospace">' + sv + '</text>';
      yLabels += '<line x1="' + padL + '" y1="' + sy + '" x2="' + (W - padR) + '" y2="' + sy + '" stroke="rgba(255,255,255,0.04)" stroke-dasharray="3,3"/>';
    }

    // X-axis date labels (show ~5-6 key dates)
    var xLabels = '';
    var seenDates = {};
    var keyPts = [];
    for (var j = 0; j < pts.length; j++) {
      var d = pts[j].date;
      if (!seenDates[d]) {
        seenDates[d] = true;
        keyPts.push({ idx: j, date: d });
      }
    }
    keyPts.forEach(function(kp) {
      xLabels += '<text x="' + x(kp.idx).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" fill="#6e7072" font-size="10">' + kp.date.slice(5) + '</text>';
    });

    // Grade marker dots on the line
    var dots = pts.map(function(p, i) {
      var clr = p.grade === 'A' ? '#22c55e' : p.grade === 'B' ? '#4ade80' : p.grade === 'C' ? '#f59e0b' : '#ef4444';
      return '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(p.score).toFixed(1) + '" r="3" fill="' + clr + '" stroke="rgba(0,0,0,0.3)" stroke-width="1"><title>' + p.date + ' ' + p.time + ' | ' + p.score + '分 ' + p.grade + '级</title></circle>';
    }).join('');

    // Stats
    var firstScore = pts[0].score, lastPtScore = pts[pts.length - 1].score;
    var change = lastPtScore - firstScore;
    var changeClr = change > 0 ? 'var(--yry-pass)' : change < 0 ? 'var(--yry-fail)' : 'var(--yry-text3)';
    var changeSign = change > 0 ? '+' : '';

    var html = '<div class="trend-chart-wrap">' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="rgba(255,193,7,0.15)"/>' +
            '<stop offset="100%" stop-color="rgba(255,193,7,0)"/>' +
          '</linearGradient>' +
        '</defs>' +
        yLabels +
        '<path d="' + areaD + '" fill="url(#areaGrad)"/>' +
        '<path d="' + pathD + '" fill="none" stroke="var(--yry-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
        dots +
        xLabels +
        '<line x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (W - padR) + '" y2="' + (padT + plotH) + '" stroke="rgba(255,255,255,0.08)"/>' +
        '<line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (padT + plotH) + '" stroke="rgba(255,255,255,0.08)"/>' +
      '</svg>' +
      '</div>';

    html += '<div class="trend-stats">' +
      '<div class="trend-stat"><div class="tval" style="color:' + scoreClr(firstScore) + '">' + firstScore + '</div><div class="tlbl">起始评分</div></div>' +
      '<div class="trend-stat"><div class="tval" style="color:' + scoreClr(lastPtScore) + '">' + lastPtScore + '</div><div class="tlbl">最新评分</div></div>' +
      '<div class="trend-stat"><div class="tval" style="color:' + changeClr + '">' + changeSign + change + '</div><div class="tlbl">净变化</div></div>' +
      '<div class="trend-stat"><div class="tval" style="color:var(--yry-accent)">' + dataMin + ' – ' + dataMax + '</div><div class="tlbl">波动区间</div></div>' +
      '<div class="trend-stat"><div class="tval" style="color:var(--yry-text2)">' + pts.length + ' 拐点</div><div class="tlbl">/' + rawTrend.length + ' 采样点</div></div>' +
      '</div>';

    html += '<div class="trend-legend">' +
      '<span><span class="dot" style="background:var(--yry-pass)"></span> A 级 (≥85)</span>' +
      '<span><span class="dot" style="background:#4ade80"></span> B 级 (70-84)</span>' +
      '<span><span class="dot" style="background:var(--yry-warn)"></span> C 级 (55-69)</span>' +
      '<span><span class="dot" style="background:var(--yry-fail)"></span> D 级 (&lt;55)</span>' +
      '<span style="margin-left:auto;color:var(--yry-text3)">悬停圆点查看详情</span>' +
      '</div>';

    return html;
  }

  fetch('summary.json')
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(data) {
      if (!data) { document.getElementById('siCount').textContent = '数据不可用'; return; }

      var latest = data.latest || {};
      var dateRange = data.dateRange || {};
      var scores = latest.scores || {};
      document.getElementById('siCount').textContent = data.totalEntries + ' 条记录 · ' + (dateRange.from || '—') + ' ~ ' + (dateRange.to || '—');

      // Data freshness
      var lastUpdated = data.updated || latest.timestamp || '';
      var ageMins = '—';
      if (lastUpdated) {
        var ageMs = new Date() - new Date(lastUpdated);
        if (!isNaN(ageMs) && ageMs >= 0) {
          var totalMin = Math.floor(ageMs / 60000);
          if (totalMin < 60) ageMins = totalMin + ' 分钟前';
          else if (totalMin < 1440) ageMins = Math.floor(totalMin / 60) + ' 小时前';
          else ageMins = Math.floor(totalMin / 1440) + ' 天前';
        }
      }
      var freshClr = 'var(--yry-pass)';
      if (ageMins.indexOf('天') !== -1) freshClr = 'var(--yry-fail)';
      else if (ageMins.indexOf('小时') !== -1 && parseInt(ageMins) >= 8) freshClr = 'var(--yry-warn)';
      document.getElementById('siFreshness').textContent = '';

      document.getElementById('siFreshness').insertAdjacentHTML('beforeend', '<span style="color:' + freshClr + '">' + ageMins + '</span>');

      // Stats
      var scClr = latest.composite >= 80 ? 'pass' : latest.composite >= 60 ? 'warn' : 'fail';
      var gradeClr = {A:'pass', B:'pass', C:'warn', D:'fail'}[latest.grade] || 'info';
      var trigCount = (latest.triggeredDiags || []).length;
      var trigClr = trigCount === 0 ? 'pass' : 'warn';

      document.getElementById('stats').textContent = '';
      getElementById('stats').insertAdjacentHTML('beforeend', 
        '<div class="stat"><div class="val info">' + data.totalEntries + '</div><div class="lbl">数据条目</div></div>' +
        '<div class="stat"><div class="val ' + scClr + '">' + latest.composite + ' 分</div><div class="lbl">最新评分</div></div>' +
        '<div class="stat"><div class="val ' + gradeClr + '">' + latest.grade + ' 级</div><div class="lbl">最新等级</div></div>' +
        '<div class="stat"><div class="val ' + trigClr + '">' + trigCount + '/9</div><div class="lbl">诊断触发</div></div>' +
        '<div class="stat"><div class="val info">' + (dateRange.to || '—') + '</div><div class="lbl">最新日期</div></div>' +
        '<div class="stat"><div class="val info">' + (latest.gitBranch || '—') + '</div><div class="lbl">Git 分支</div></div>');

      // Latest snapshot
      var triggeredHtml = '';
      if (latest.triggeredDiags && latest.triggeredDiags.length > 0) {
        triggeredHtml = '<div style="margin-top:10px"><strong style="font-size:.76rem">触发诊断:</strong> ' +
          latest.triggeredDiags.map(function(d) { return '<span class="badge triggered">' + d + '</span>'; }).join(' ') +
          '</div>';
      } else {
        triggeredHtml = '<div style="margin-top:10px;color:var(--yry-pass);font-size:.76rem">✅ 无诊断触发 — 所有 D0-D8 指标正常</div>';
      }
      var branchInfo = (latest.gitBranch ? '分支: ' + latest.gitBranch : '') + (latest.gitUncommitted !== undefined ? ' · 未提交: ' + latest.gitUncommitted + ' 文件' : '') + (latest.bootstrapped ? ' · 自举引导模式' : '');
      document.getElementById('latestBody').textContent = '';

      document.getElementById('latestBody').insertAdjacentHTML('beforeend', '<div style="display:flex);align-items:center;gap:20px;flex-wrap:wrap">' +
        '<div style="text-align:center">' +
          '<div style="font-size:2.6rem;font-weight:800;line-height:1;color:' + scoreClr(latest.composite) + '">' + latest.composite + '</div>' +
          '<div style="font-size:.62rem;color:var(--yry-text3);margin-top:4px">综合评分 / 100</div>' +
        '</div>' +
        '<div style="text-align:center">' +
          '<div style="font-size:2rem;font-weight:800;line-height:1;color:' + (latest.grade === 'A' || latest.grade === 'B' ? 'var(--yry-pass)' : latest.grade === 'C' ? 'var(--yry-warn)' : 'var(--yry-fail)') + '">' + latest.grade + '</div>' +
          '<div style="font-size:.62rem;color:var(--yry-text3);margin-top:4px">综合等级</div>' +
        '</div>' +
        '<div style="flex:1;min-width:200px;font-size:.72rem;color:var(--yry-text3)">' +
          '<div>' + (latest.timestamp || '') + '</div>' +
          '<div>' + branchInfo + '</div>' +
          '<div>评分维度: ' + Object.keys(scores).length + ' 项</div>' +
        '</div>' +
        '</div>' + triggeredHtml;

      // D0-D8 with rates from weekly data
      var allDiags = ['D0','D1','D2','D3','D4','D5','D6','D7','D8'];
      var triggeredSet = {};
      (latest.triggeredDiags || []).forEach(function(d) { triggeredSet[d] = true; });

      // Get rates from weekly summary
      var diagRates = {};
      var diagSummary = data.diagSummary || [];
      diagSummary.forEach(function(d) { diagRates[d.id] = d; });

      document.getElementById('diagGrid').textContent = '';
      getElementById('diagGrid').insertAdjacentHTML('beforeend',  allDiags.map(function(d) {
        var isTriggered = !!triggeredSet[d];
        var rateInfo = diagRates[d];
        var rateHtml = '';
        if (rateInfo) {
          var rateClr = rateInfo.rate > 50 ? 'var(--yry-fail)' : rateInfo.rate > 20 ? 'var(--yry-warn)' : 'var(--yry-pass)';
          rateHtml = '<div class="diag-rate" style="color:' + rateClr + '">触发率 ' + rateInfo.rate + '% (' + rateInfo.count + ' 次)</div>';
        } else {
          rateHtml = '<div class="diag-rate" style="color:var(--yry-pass)">触发率 0% (0 次)</div>';
        }
        var cardCls = isTriggered ? 'triggered' : '';
        return '<div class="diag-card ' + cardCls + '">' +
          '<div class="diag-id" style="color:' + (isTriggered ? 'var(--yry-warn)' : 'var(--yry-pass)') + '">' + d + '</div>' +
          '<div class="diag-name">' + (DIAG_LABELS[d] || '') + '</div>' +
          '<div style="margin-top:4px">' + (isTriggered ? '<span class="badge triggered">⚠ 触发</span>' : '<span class="badge clear">✓ 正常</span>') + '</div>' +
          rateHtml +
          '<div style="font-size:.56rem;color:var(--yry-text3);margin-top:2px;line-height:1.4">' + (DIAG_DESCS[d] || '') + '</div>' +
          '</div>';
      }).join(''));

      // Dimension scores with weekly comparison
      var dimSummary = data.dimSummary || [];
      var dimAvgs = {};
      dimSummary.forEach(function(d) { dimAvgs[d.dim] = d; });

      var dimEntries = Object.keys(scores).map(function(k) {
        return { dim: k, score: scores[k], avg: dimAvgs[k] ? dimAvgs[k].avgScore : undefined, recent: dimAvgs[k] ? dimAvgs[k].recentAvg : undefined, trendVal: dimAvgs[k] ? dimAvgs[k].trend : undefined };
      });
      dimEntries.sort(function(a, b) { return a.score - b.score; });

      document.getElementById('dimGrid').textContent = '';
      getElementById('dimGrid').insertAdjacentHTML('beforeend',  dimEntries.map(function(d) {
        var g = scoreGrade(d.score);
        var clr = scoreClr(d.score);
        var avgHtml = d.avg !== undefined ? '<span class="dim-avg">周均 ' + d.avg + '</span>' : '';
        var trendHtml = '';
        if (d.trendVal !== undefined && d.trendVal > 10) trendHtml = '<span style="color:var(--yry-pass);font-size:.6rem">↑ +' + d.trendVal + '</span>';
        else if (d.trendVal !== undefined && d.trendVal < -10) trendHtml = '<span style="color:var(--yry-fail);font-size:.6rem">↓ ' + d.trendVal + '</span>';
        return '<div class="dim-item">' +
          '<span class="dim-dot ' + g + '"></span>' +
          '<span class="dim-name">' + (DIM_LABELS[d.dim] || d.dim) + '</span>' +
          '<span class="dim-score" style="color:' + clr + '">' + d.score + '</span>' +
          avgHtml + trendHtml +
          '</div>';
      }).join(''));

      // Grade distribution from weekly summary
      var weekly = data.weekly && data.weekly[0];
      if (weekly) {
        var gd = weekly.gradeDist || {};
        var total = (gd.A || 0) + (gd.B || 0) + (gd.C || 0) + (gd.D || 0);
        var gdHtml = '<div style="margin-bottom:12px"><div class="grade-bar-wrap" style="height:28px;max-width:500px">';
        if (total > 0) {
          gdHtml += '<div class="grade-bar A" style="width:' + ((gd.A || 0) / total * 100) + '%" title="A: ' + (gd.A || 0) + '"></div>';
          gdHtml += '<div class="grade-bar B" style="width:' + ((gd.B || 0) / total * 100) + '%" title="B: ' + (gd.B || 0) + '"></div>';
          gdHtml += '<div class="grade-bar C" style="width:' + ((gd.C || 0) / total * 100) + '%" title="C: ' + (gd.C || 0) + '"></div>';
          gdHtml += '<div class="grade-bar D" style="width:' + ((gd.D || 0) / total * 100) + '%" title="D: ' + (gd.D || 0) + '"></div>';
        }
        gdHtml += '</div></div>';
        gdHtml += '<div style="display:flex;gap:20px;font-size:.76rem;color:var(--yry-text2);flex-wrap:wrap">' +
          '<span><span style="color:var(--yry-pass)">■</span> A 级: ' + (gd.A || 0) + ' (' + (total > 0 ? Math.round((gd.A || 0) / total * 100) : 0) + '%)</span>' +
          '<span><span style="color:#4ade80">■</span> B 级: ' + (gd.B || 0) + ' (' + (total > 0 ? Math.round((gd.B || 0) / total * 100) : 0) + '%)</span>' +
          '<span><span style="color:var(--yry-warn)">■</span> C 级: ' + (gd.C || 0) + ' (' + (total > 0 ? Math.round((gd.C || 0) / total * 100) : 0) + '%)</span>' +
          '<span><span style="color:var(--yry-fail)">■</span> D 级: ' + (gd.D || 0) + ' (' + (total > 0 ? Math.round((gd.D || 0) / total * 100) : 0) + '%)</span>' +
          '<span>总计: ' + total + ' 条</span>' +
          '</div>';
        document.getElementById('gradeDist').textContent = '';

        document.getElementById('gradeDist').insertAdjacentHTML('beforeend', gdHtml);
      }

      // Branch health
      var branchSummary = data.branchSummary || [];
      if (branchSummary.length > 0) {
        var maxCount = Math.max.apply(null, branchSummary.map(function(b) { return b.count || 0; }));
        document.getElementById('branchList').textContent = '';
        getElementById('branchList').insertAdjacentHTML('beforeend',  branchSummary.map(function(b) {
          var barClr = b.avgScore >= 80 ? 'var(--yry-pass)' : b.avgScore >= 60 ? 'var(--yry-warn)' : 'var(--yry-fail)';
          var barPct = maxCount > 0 ? Math.max((b.count || 0) / maxCount * 100, 5) : 50;
          return '<div class="branch-item">' +
            '<span class="branch-name">' + (b.name || '—') + '</span>' +
            '<span class="branch-count">' + (b.count || 0) + ' 条提交</span>' +
            '<span style="font-weight:700;font-size:.8rem;color:' + barClr + ';min-width:48px">' + (b.avgScore || 0) + ' 分</span>' +
            '<div class="branch-bar"><div class="branch-fill" style="width:' + barPct + '%;background:var(--yry-accent);opacity:.4"></div></div>' +
            '<span style="font-size:.64rem;color:var(--yry-text3)">未提交 ~' + (b.avgUncommitted || 0) + ' 文件</span>' +
            '</div>';
        }).join(''));
      } else {
        document.getElementById('branchList').textContent = '';

        document.getElementById('branchList').insertAdjacentHTML('beforeend', '<div class="empty">暂无分支数据</div>');
      }

      // Component Health
      document.getElementById('compGrid').textContent = '';

      document.getElementById('compGrid').insertAdjacentHTML('beforeend', renderComponentHealth(data.componentHealth));

      // Architecture Health
      document.getElementById('archBody').textContent = '';

      document.getElementById('archBody').insertAdjacentHTML('beforeend', renderArchHealth(data.archHealth));

      // Score Trend
      document.getElementById('trendBody').textContent = '';

      document.getElementById('trendBody').insertAdjacentHTML('beforeend', renderScoreTrend(data.scoreTrend));

      // Signal detection
      var signals = data.signals || [];
      if (signals.length > 0) {
        document.getElementById('sigCard').style.display = 'block';
        document.getElementById('sigList').textContent = '';
        getElementById('sigList').insertAdjacentHTML('beforeend',  signals.map(function(s) {
          var sigCls = s.type === 'critical' ? 'critical' : s.type === 'warning' ? 'warning' : s.type === 'improvement' ? 'improvement' : 'info';
          return '<div class="signal ' + sigCls + '"><span class="signal-icon">' + (s.icon || '📌') + '</span>' + s.msg + '</div>';
        }).join(''));
      }

      // --- E1-E4 Evaluation Effectiveness Matrix ---
      (function() {
        var evalLevels = [
          { id: 'E1', name: '即时验证', desc: '单次检查即时反馈', window: '≤5 分钟', icon: '⚡', metric: '诊断触发后即时复查通过率' },
          { id: 'E2', name: '短期观察', desc: '小时级趋势确认', window: '1–24 小时', icon: '🔬', metric: '改进后 24h 内同维复发率' },
          { id: 'E3', name: '长期趋势', desc: '天/周级统计显著性', window: '1–4 周', icon: '📊', metric: '周均评分变化趋势 (±σ)' },
          { id: 'E4', name: '经验技能化', desc: '固化至规约/SKILL.md', window: '3 次验证后', icon: '📝', metric: '成功技能化条目数 / 候选数' }
        ];

        // Compute E1-E4 metrics from available data
        var dimSummary = data.dimSummary || [];
        var diagSummary = data.diagSummary || [];
        var scoreTrend = data.scoreTrend || [];
        var signals = data.signals || [];

        // E1: triggered diags resolved rate
        var totalDiags = diagSummary.reduce(function(s, d) { return s + (d.count || 0); }, 0);
        var latest = data.latest || {};
        var currentTriggers = (latest.triggeredDiags || []).length;
        // E1 score: if all diags have 0 trigger rate (resolved) → 100
        var resolvedDiags = diagSummary.filter(function(d) { return (d.rate || 0) === 0 && (d.count || 0) > 0; }).length;
        var totalEverTriggered = diagSummary.filter(function(d) { return (d.count || 0) > 0; }).length;
        var e1Score = totalEverTriggered > 0 ? Math.round(resolvedDiags / totalEverTriggered * 100) : (currentTriggers === 0 ? 100 : 50);

        // E2: 24h recurrence — check if consecutive days have same dim drops
        var e2Score = 0;
        var recurrenceCount = 0;
        if (scoreTrend && scoreTrend.length >= 2) {
          var dimNames = Object.keys(latest.scores || {});
          var lastTwo = scoreTrend.slice(-2);
          if (lastTwo.length === 2) {
            dimNames.forEach(function(dim) {
              // Can't compare dim-level scores from trend data, use composite
            });
          }
          // Simplified: if score is stable or improving, E2 is good
          var recentScores = scoreTrend.slice(-3).map(function(s) { return s.score; });
          var allImproving = true;
          for (var si = 1; si < recentScores.length; si++) {
            if (recentScores[si] < recentScores[si-1]) allImproving = false;
          }
          e2Score = allImproving ? 85 : recentScores.length >= 2 && recentScores[recentScores.length-1] >= recentScores[0] ? 70 : 40;
        } else {
          e2Score = 50; // not enough data
        }

        // E3: long-term trend from dimSummary
        var e3Score = 0;
        var improvingDims = 0, degradingDims = 0, totalDims = 0;
        dimSummary.forEach(function(d) {
          totalDims++;
          if ((d.trend || 0) > 5) improvingDims++;
          else if ((d.trend || 0) < -5) degradingDims++;
        });
        if (totalDims > 0) {
          e3Score = Math.round(50 + (improvingDims - degradingDims) / totalDims * 50);
          e3Score = Math.max(0, Math.min(100, e3Score));
        } else {
          e3Score = 50;
        }

        // E4: experience skillification
        var e4Candidates = signals.filter(function(s) { return s.type === 'improvement'; }).length;
        var e4Score = e4Candidates > 0 ? Math.min(100, e4Candidates * 25) : (data.totalEntries > 3 ? 30 : 15);

        var evalScores = [e1Score, e2Score, e3Score, e4Score];
        evalLevels[0].score = e1Score;
        evalLevels[1].score = e2Score;
        evalLevels[2].score = e3Score;
        evalLevels[3].score = e4Score;

        function evalClr(s) { return s >= 80 ? 'var(--yry-pass)' : s >= 60 ? 'var(--yry-warn)' : 'var(--yry-fail)'; }
        function evalGrade(s) { return s >= 80 ? 'A' : s >= 60 ? 'B' : s >= 40 ? 'C' : 'D'; }

        var tableHtml = '<table><thead><tr><th>评估层</th><th>名称</th><th>测量窗口</th><th>评估指标</th><th>效能评分</th><th>等级</th><th>状态</th></tr></thead><tbody>';
        evalLevels.forEach(function(ev) {
          var clr = evalClr(ev.score);
          var grade = evalGrade(ev.score);
          var statusHtml = ev.score >= 80 ? '<span class="badge pass">✓ 有效</span>' :
            ev.score >= 60 ? '<span class="badge warn">△ 观察中</span>' :
            '<span class="badge fail">✗ 待加强</span>';
          tableHtml += '<tr>' +
            '<td><strong style="color:' + clr + '">' + ev.id + '</strong></td>' +
            '<td>' + ev.icon + ' ' + ev.name + '</td>' +
            '<td style="font-size:.72rem;color:var(--yry-text3)">' + ev.window + '</td>' +
            '<td style="font-size:.72rem;color:var(--yry-text2)">' + ev.metric + '</td>' +
            '<td><span style="font-weight:700;font-size:.92rem;color:' + clr + '">' + ev.score + '</span></td>' +
            '<td><span class="badge ' + (grade === 'A' ? 'A' : grade === 'B' ? 'B' : grade === 'C' ? 'C' : 'D') + '">' + grade + '</span></td>' +
            '<td>' + statusHtml + '</td>' +
            '</tr>';
        });
        tableHtml += '</tbody></table>';

        // Insight
        var avgEval = Math.round(evalScores.reduce(function(s, v) { return s + v; }, 0) / 4);
        var weakest = evalLevels.reduce(function(min, ev) { return ev.score < min.score ? ev : min; }, evalLevels[0]);
        var insightHtml = '';
        if (avgEval >= 80) {
          insightHtml = '<span style="color:var(--yry-pass)">四层评估闭环运转良好</span> · 平均效能 ' + avgEval + ' 分 · E1-E4 全链路覆盖';
        } else if (avgEval >= 60) {
          insightHtml = '<span style="color:var(--yry-warn)">评估体系运行中</span> · 平均效能 ' + avgEval + ' 分 · 最弱环节: <strong>' + weakest.id + ' ' + weakest.name + '</strong> (' + weakest.score + ' 分)';
        } else {
          insightHtml = '<span style="color:var(--yry-fail)">评估体系待加强</span> · 平均效能 ' + avgEval + ' 分 · ' + (data.totalEntries < 3 ? '数据积累不足，评分基于有限样本' : '需系统性改进评估流程');
        }

        // Additional detail
        var detailLines = [];
        detailLines.push('E1 即时验证: ' + totalEverTriggered + ' 项触发过诊断 · ' + resolvedDiags + ' 项已清零 · 当前活跃触发 ' + currentTriggers + ' 项');
        detailLines.push('E2 短期观察: ' + (scoreTrend.length >= 2 ? '近 3 次趋势' + (e2Score >= 70 ? '稳定或改善' : '存在波动') : '数据不足 (<2 采样点)'));
        detailLines.push('E3 长期趋势: ' + totalDims + ' 维度中 ' + improvingDims + ' 改善 / ' + degradingDims + ' 退化 / ' + (totalDims - improvingDims - degradingDims) + ' 持平');
        detailLines.push('E4 技能化: ' + e4Candidates + ' 个候选改进模式 · ' + (e4Candidates >= 3 ? '满足固化条件' : '需 ≥3 次验证方可固化'));

        document.getElementById('evalMatrix').textContent = '';
        getElementById('evalMatrix').insertAdjacentHTML('beforeend',  tableHtml +
          '<div style="margin-top:12px;padding:10px 14px;background:rgba(255,255,255,.02);border-radius:8px;font-size:.74rem;color:var(--yry-text2);line-height:1.6">' +
          '<strong>评估总结</strong>: ' + insightHtml +
          '<br>' + detailLines.map(function(l) { return '<span style="font-size:.64rem;color:var(--yry-text3)">' + l + '</span>'; }).join('<br>') +
          '</div>');
      })();

      // --- Improvement Velocity Tracking ---
      (function() {
        var latest = data.latest || {};
        var diagSummary = data.diagSummary || [];
        var signals = data.signals || [];
        var dimSummary = data.dimSummary || [];
        var weekly = data.weekly || [];
        var scoreTrend = data.scoreTrend || [];

        // Calculate improvement metrics
        var totalDiagTriggers = diagSummary.reduce(function(s, d) { return s + (d.count || 0); }, 0);
        var currentTriggers = (latest.triggeredDiags || []).length;
        var resolvedCount = totalDiagTriggers - currentTriggers;

        // Cycle time estimation
        var cycleTimeHours = '—';
        if (scoreTrend && scoreTrend.length >= 3) {
          // Estimate from score recovery patterns
          var drops = [];
          for (var i = 1; i < scoreTrend.length; i++) {
            if (scoreTrend[i].score < scoreTrend[i-1].score - 5) {
              drops.push({ idx: i, drop: scoreTrend[i-1].score - scoreTrend[i].score });
            }
          }
          if (drops.length > 0) {
            // Average recovery: assume ~2 cycles to recover
            cycleTimeHours = '~' + (drops.length * 2) + ' 周期';
          } else {
            cycleTimeHours = '— (无显著下降)';
          }
        }

        // Dimension improvement rate
        var dimImprovements = dimSummary.filter(function(d) { return (d.trend || 0) > 5; });
        var dimDegradations = dimSummary.filter(function(d) { return (d.trend || 0) < -5; });
        var improveRate = dimSummary.length > 0 ? Math.round(dimImprovements.length / dimSummary.length * 100) : 0;
        var degradeRate = dimSummary.length > 0 ? Math.round(dimDegradations.length / dimSummary.length * 100) : 0;

        // Weekly improvement trend
        var weeklyScores = weekly.map(function(w) { return w.avgScore || 0; });
        var weeklyTrend = 0;
        if (weeklyScores.length >= 2) {
          weeklyTrend = weeklyScores[0] - weeklyScores[weeklyScores.length - 1]; // positive = improving (newer is higher)
        }

        // Backlog: unresolved signals
        var backlog = signals.filter(function(s) { return s.type === 'warning' || s.type === 'critical'; }).length;
        var backlogTrend = backlog > 2 ? '上升' : backlog > 0 ? '稳定' : '清零';

        // Resolution rate
        var resolutionRate = totalDiagTriggers > 0 ? Math.round(resolvedCount / totalDiagTriggers * 100) : 100;

        // Velocity card HTML
        var html = '<div class="stats" style="margin-bottom:16px">' +
          '<div class="stat"><div class="val info">' + totalDiagTriggers + '</div><div class="lbl">历史触发总数</div></div>' +
          '<div class="stat"><div class="val ' + (currentTriggers === 0 ? 'pass' : 'warn') + '">' + currentTriggers + '</div><div class="lbl">当前活跃诊断</div></div>' +
          '<div class="stat"><div class="val ' + (resolutionRate >= 80 ? 'pass' : resolutionRate >= 50 ? 'warn' : 'fail') + '">' + resolutionRate + '%</div><div class="lbl">诊断解决率</div></div>' +
          '<div class="stat"><div class="val info">' + cycleTimeHours + '</div><div class="lbl">估算修复周期</div></div>' +
          '<div class="stat"><div class="val ' + (backlog === 0 ? 'pass' : 'warn') + '">' + backlog + '</div><div class="lbl">未处理信号队列</div></div>' +
          '</div>';

        // Dimension improvement velocity table
        html += '<table style="margin-top:12px"><thead><tr><th>维度类别</th><th>改善中</th><th>退化中</th><th>持平</th><th>改善率</th><th>净趋势</th></tr></thead><tbody>';

        var stableDims = dimSummary.length - dimImprovements.length - dimDegradations.length;
        var netTrendClr = improveRate > degradeRate ? 'var(--yry-pass)' : improveRate < degradeRate ? 'var(--yry-fail)' : 'var(--yry-warn)';
        var netTrendIcon = improveRate > degradeRate ? '↑ 改善主导' : improveRate < degradeRate ? '↓ 退化主导' : '→ 持平';

        html += '<tr>' +
          '<td><strong>全部 ' + dimSummary.length + ' 维度</strong></td>' +
          '<td><span style="color:var(--yry-pass)">' + dimImprovements.length + '</span></td>' +
          '<td><span style="color:var(--yry-fail)">' + dimDegradations.length + '</span></td>' +
          '<td>' + stableDims + '</td>' +
          '<td><span style="color:' + (improveRate >= 50 ? 'var(--yry-pass)' : 'var(--yry-warn)') + ';font-weight:600">' + improveRate + '%</span></td>' +
          '<td><span style="color:' + netTrendClr + ';font-weight:600">' + netTrendIcon + '</span></td>' +
          '</tr>';

        // If there are improving/degrading dims, list them
        if (dimImprovements.length > 0) {
          html += '<tr><td colspan="6" style="font-size:.64rem;color:var(--yry-pass);padding-top:0">改善维度: ' + dimImprovements.map(function(d) { return d.dim; }).join(', ') + '</td></tr>';
        }
        if (dimDegradations.length > 0) {
          html += '<tr><td colspan="6" style="font-size:.64rem;color:var(--yry-fail);padding-top:0">退化维度: ' + dimDegradations.map(function(d) { return d.dim + ' (' + (d.trend||0) + ')'; }).join(', ') + '</td></tr>';
        }
        html += '</tbody></table>';

        // Insight
        var velocityInsight = '';
        if (data.totalEntries < 3) {
          velocityInsight = '<span style="color:var(--yry-text3)">数据积累阶段 · ' + data.totalEntries + ' 条记录 · 速率指标将随数据增加而精确化</span>';
        } else if (improveRate >= 50 && resolutionRate >= 80) {
          velocityInsight = '<span style="color:var(--yry-pass)">改进速率健康</span> · 多数维度持续改善 · 诊断高效清零';
        } else if (degradeRate > improveRate) {
          velocityInsight = '<span style="color:var(--yry-fail)">退化速率超过改善速率</span> · 需优先级干预 · 建议聚焦 TOP ' + Math.min(3, dimDegradations.length) + ' 退化维度';
        } else {
          velocityInsight = '<span style="color:var(--yry-warn)">改进与退化并存</span> · 净趋势' + netTrendIcon + ' · 建议加速解决 ' + currentTriggers + ' 个活跃诊断';
        }

        html += '<div style="margin-top:12px;padding:10px 14px;background:rgba(255,255,255,.02);border-radius:8px;font-size:.74rem;color:var(--yry-text2);line-height:1.6">' +
          '<strong>速率分析</strong>: ' + velocityInsight +
          '<br><span style="font-size:.64rem;color:var(--yry-text3)">诊断解决率 = 已清零诊断 / 历史触发总数 · 改善率 = 趋势上升维度 / 总维度 · 周期 = 从触发到恢复的估算时间窗口</span>' +
          '</div>';

        document.getElementById('improveVelocity').textContent = '';


        document.getElementById('improveVelocity').insertAdjacentHTML('beforeend', html);
      })();


      // Time panel with tabs
      document.getElementById('timePanel').textContent = '';

      document.getElementById('timePanel').insertAdjacentHTML('beforeend', renderPeriod(data, 'daily'));

      // Tab click handler
      document.getElementById('timeTabs').addEventListener('click', function(e) {
        var tab = e.target.closest('.time-tab');
        if (!tab) return;
        var period = tab.dataset.period;
        if (period === currentPeriod) return;
        currentPeriod = period;
        var tabs = document.querySelectorAll('.time-tab');
        tabs.forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        document.getElementById('timePanel').textContent = '';

        document.getElementById('timePanel').insertAdjacentHTML('beforeend', renderPeriod(data, period));
      });

    })
    .catch(function(e) {
      document.getElementById('siCount').textContent = '加载失败: ' + e.message;
    });

  // Health cross-reference
  fetch('../健康报告/reports.json')
    .then(function(r) { return r.ok ? r.json() : []; })
    .then(function(hr) {
      if (!hr.length) return;
      var latest = hr[0];
      var score = latest.score || 0;
      var grade = latest.grade || '—';
      var clr = score >= 80 ? 'var(--yry-pass)' : score >= 60 ? 'var(--yry-warn)' : 'var(--yry-fail)';
      var el = document.getElementById('healthRef');
      if (!el) return;
      el.textContent = '';

      el.insertAdjacentHTML('beforeend', '<div style="width:72px);height:72px;border-radius:50%;border:3px solid ' + clr + ';display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;color:' + clr + ';flex-shrink:0">' + score + '</div>' +
        '<div style="font-size:.72rem;color:var(--yry-text3);line-height:1.7">' +
          '<div><strong style="color:var(--yry-text)">健康评分</strong> <span class="badge ' + (grade === 'A' || grade === 'B' ? 'pass' : grade === 'C' ? 'warn' : 'fail') + '">' + grade + ' 级</span></div>' +
          '<div>报告日期: ' + (latest.date || '—') + '</div>' +
          '<div>诊断触发: ' + ((latest.triggers || 0) > 0 ? '<span style="color:var(--yry-warn)">' + latest.triggers + ' 项</span>' : '<span style="color:var(--yry-pass)">无</span>') + '</div>' +
          '<div>健康与自改进联动: 健康趋势异常 → 自改进闭环诊断触发 → 改进 → 评估</div>' +
        '</div>' +
        '<a href="../健康报告/" style="margin-left:auto;font-size:.72rem;color:#22d3ee;text-decoration:none;flex-shrink:0">查看健康报告 →</a>';
    })
    .catch(function() {});
})();
