/* ==========================================================================
   self-improve-index.js — 自我改进仪表板渲染逻辑
   依赖: ../../cdn/shared-reports/index.js (提供 YrYReports.* 工具函数)
   注意: 本页面使用独立评分阈值 (80/60 vs 标准 85/70/55)
   ========================================================================== */

(function() {
  var DIAG_LABELS = {};
  var DIAG_DESCS = {};
  var DIM_LABELS = {};

  function scoreClr(s) { return s >= 90 ? 'var(--yry-pass)' : s >= 75 ? 'var(--yry-warn)' : 'var(--yry-fail)'; }
  function scoreGrade(s) { return s >= 90 ? 'A' : s >= 75 ? 'B' : s >= 60 ? 'C' : 'D'; }
  function scoreCls(s) { return s >= 90 ? 'A' : s >= 75 ? 'B' : s >= 60 ? 'C' : 'D'; }

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

    // 1) 归一化四类组件数据 + 趋势
    var items = [
      { key: 'skills',  label: 'Skills',  icon: '🧩', desc: '技能规约 · SKILL.md', target: 'skills/*.md', diag: 'D6/D8' },
      { key: 'agents',  label: 'Agents',  icon: '🤖', desc: 'Agent 定义 · AGENT.md', target: 'agents/*.md', diag: 'D0/D4' },
      { key: 'rules',   label: 'Rules',   icon: '📋', desc: '规则文件 · *.md', target: 'rules/*.md',  diag: 'D7/D4' },
      { key: 'scripts', label: 'Scripts', icon: '⚡', desc: '辅助脚本 · .mjs/.js', target: 'lib/*.mjs', diag: 'D1/D3' }
    ].map(function(it) {
      var d = ch[it.key] || { count: 0, avgScore: 0 };
      var t = (ch.trends && ch.trends[it.key]) || {};
      var hasBaseline = (t.olderAvg !== undefined && t.olderAvg !== null && (t.totalEntries || 0) > 0);
      return { key: it.key, label: it.label, icon: it.icon, desc: it.desc, target: it.target, diag: it.diag,
               count: d.count || 0, score: d.avgScore || 0, trend: t, hasBaseline: hasBaseline };
    });

    var totalCount  = ch.totalComponents || items.reduce(function(s, x) { return s + x.count; }, 0);
    var totalRecent = items.reduce(function(s, x) { return s + (x.trend.recentEntries || 0); }, 0);
    var totalEntries = items.reduce(function(s, x) { return s + (x.trend.totalEntries || 0); }, 0);
    var overall = ch.overallAvg || 0;
    var overallClr = scoreClr(overall);
    var overallGrade = scoreGrade(overall);
    var coveredCount = items.filter(function(x) { return x.count > 0; }).length;
    var coveragePct = Math.round(coveredCount / items.length * 100);
    var weakItems    = items.filter(function(x) { return x.count > 0 && x.score < 75; });
    var emptyItems   = items.filter(function(x) { return x.count === 0; });
    var lowActivity  = items.filter(function(x) {
      return x.trend.totalEntries > 0 && (x.trend.recentEntries / x.trend.totalEntries) < 0.3;
    });

    // 2) 顶部 Hero：大分数 + 4 项关键指标
    var heroHtml = '<div style="display:flex;align-items:stretch;gap:0;flex-wrap:wrap;margin-bottom:14px;border-radius:10px;overflow:hidden;border:var(--yry-border)">' +
      '<div style="padding:16px 22px;background:linear-gradient(135deg,rgba(15,23,42,.7),rgba(15,23,42,.4));display:flex;align-items:center;gap:14px;min-width:200px">' +
        '<div style="text-align:center">' +
          '<div style="font-size:2.4rem;font-weight:800;line-height:1;color:' + overallClr + '">' + overall + '</div>' +
          '<div style="margin-top:6px"><span class="badge ' + overallGrade + '">' + overallGrade + ' 级</span></div>' +
        '</div>' +
        '<div style="height:48px;width:1px;background:rgba(255,255,255,.08)"></div>' +
        '<div>' +
          '<div style="font-size:.7rem;color:var(--yry-text3)">综合均分</div>' +
          '<div style="font-size:.64rem;color:var(--yry-text3);margin-top:2px">跨 4 组件域</div>' +
        '</div>' +
      '</div>' +
      '<div style="padding:12px 20px;background:rgba(15,23,42,.3);display:flex;gap:24px;flex-wrap:wrap;flex:1;min-width:280px;align-items:center">' +
        '<div><div style="font-size:1.3rem;font-weight:700;color:var(--yry-accent)">' + totalCount + '</div><div style="font-size:.6rem;color:var(--yry-text3);margin-top:2px">组件总数</div></div>' +
        '<div><div style="font-size:1.3rem;font-weight:700;color:var(--yry-cyan)">' + coveredCount + '/4</div><div style="font-size:.6rem;color:var(--yry-text3);margin-top:2px">域覆盖率 · ' + coveragePct + '%</div></div>' +
        '<div><div style="font-size:1.3rem;font-weight:700;color:var(--yry-pass)">' + totalRecent + '</div><div style="font-size:.6rem;color:var(--yry-text3);margin-top:2px">近期测量 / ' + totalEntries + ' 总</div></div>' +
        '<div><div style="font-size:1.3rem;font-weight:700;color:' + (weakItems.length ? 'var(--yry-warn)' : 'var(--yry-pass)') + '">' + weakItems.length + '</div><div style="font-size:.6rem;color:var(--yry-text3);margin-top:2px">需关注组件</div></div>' +
      '</div>' +
    '</div>';

    // 3) 组件分布条（按数量堆叠）
    var distBar = totalCount > 0 ? items.map(function(it) {
      var pct = it.count / totalCount * 100;
      var clr = it.count > 0 ? 'var(--yry-accent)' : 'rgba(255,255,255,.04)';
      return '<div title="' + it.label + ': ' + it.count + '" style="width:' + pct.toFixed(2) + '%;background:' + clr + ';height:100%;transition:width .4s"></div>';
    }).join('') : '<div style="width:100%;background:rgba(255,255,255,.04);height:100%"></div>';
    var distLegend = items.map(function(it) {
      var pct = totalCount > 0 ? (it.count / totalCount * 100).toFixed(1) : '0';
      return '<span style="display:inline-flex;align-items:center;gap:4px;margin-right:14px;font-size:.66rem;color:var(--yry-text3)">' +
        '<span style="width:8px;height:8px;border-radius:2px;background:' + (it.count > 0 ? 'var(--yry-accent)' : 'rgba(255,255,255,.1)') + '"></span>' +
        '<span>' + it.icon + ' ' + it.label + ' <strong style="color:var(--yry-text2)">' + it.count + '</strong> (' + pct + '%)</span>' +
      '</span>';
    }).join('');
    var distHtml = '<div style="margin-bottom:14px">' +
      '<div style="display:flex;justify-content:space-between;font-size:.64rem;color:var(--yry-text3);margin-bottom:4px">' +
        '<span>组件分布 (按数量)</span>' +
        '<span>总计 ' + totalCount + '</span>' +
      '</div>' +
      '<div style="display:flex;height:8px;border-radius:4px;overflow:hidden;background:rgba(255,255,255,.05)">' + distBar + '</div>' +
      '<div style="margin-top:6px">' + distLegend + '</div>' +
    '</div>';

    // 4) 工具：趋势 + 活跃度渲染
    function renderTrend(item) {
      if (!item.hasBaseline) return '<span style="color:var(--yry-text3)">— 基线不足</span>';
      var v = item.trend.trend;
      if (v > 1) return '<span style="color:var(--yry-pass)">↑ +' + v + ' 分</span>';
      if (v < -1) return '<span style="color:var(--yry-fail)">↓ ' + v + ' 分</span>';
      return '<span style="color:var(--yry-text3)">→ 持平</span>';
    }
    function renderActivity(item) {
      if (!item.trend.totalEntries) return '<span style="color:var(--yry-text3)">无测量</span>';
      var r = item.trend.recentEntries || 0;
      var tot = item.trend.totalEntries;
      var pct = Math.round(r / tot * 100);
      var clr = pct >= 60 ? 'var(--yry-pass)' : pct >= 30 ? 'var(--yry-warn)' : 'var(--yry-fail)';
      return '<span style="color:var(--yry-text3)">活跃 <strong style="color:' + clr + '">' + r + '/' + tot + '</strong> (' + pct + '%)</span>';
    }

    // 5) 四类组件详情卡（5 字段：图标 + 评分 + 进度条 + 状态/路径 + 趋势/活跃度 + 关联诊断）
    var cardsHtml = '<div class="comp-grid">' + items.map(function(item) {
      var g = scoreGrade(item.score);
      var clr = scoreClr(item.score);
      var empty = item.count === 0;
      var status, statusClr;
      if (empty)       { status = '未部署'; statusClr = 'var(--yry-text3)'; }
      else if (item.score >= 90) { status = '优秀';   statusClr = 'var(--yry-pass)'; }
      else if (item.score >= 75) { status = '稳定';   statusClr = 'var(--yry-pass)'; }
      else if (item.score >= 60) { status = '待优化'; statusClr = 'var(--yry-warn)'; }
      else                       { status = '需关注'; statusClr = 'var(--yry-fail)'; }

      return '<div class="comp-item" style="' + (empty ? 'opacity:.65;' : '') + '">' +
        '<div style="display:flex;align-items:center;gap:10px">' +
          '<div class="comp-icon">' + item.icon + '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-weight:600;font-size:.84rem">' + item.label + '</div>' +
            '<div class="comp-count">' + item.desc + '</div>' +
          '</div>' +
          '<div style="text-align:right">' +
            '<div class="comp-score" style="color:' + (empty ? 'var(--yry-text3)' : clr) + '">' + (empty ? '—' : item.score) + '</div>' +
            '<div style="font-size:.58rem;color:var(--yry-text3);margin-top:2px">' + (empty ? '无数据' : g + ' 级') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="comp-bar-wrap"><div class="comp-bar-fill" style="width:' + (empty ? 0 : item.score) + '%;background:' + (empty ? 'var(--yry-text3)' : clr) + '"></div></div>' +
        '<div style="display:flex;justify-content:space-between;font-size:.6rem;margin-top:2px">' +
          '<span style="color:' + statusClr + '">● ' + status + '</span>' +
          '<span style="color:var(--yry-text3)">' + item.count + ' 个 · 路径 ' + item.target + '</span>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;font-size:.62rem;padding-top:6px;border-top:1px dashed rgba(255,255,255,.06);gap:8px">' +
          '<span style="flex-shrink:0">' + renderTrend(item) + '</span>' +
          '<span style="text-align:right">' + renderActivity(item) + '</span>' +
        '</div>' +
        (empty ? '' :
          '<div style="font-size:.58rem;color:var(--yry-text3);margin-top:2px">关联诊断 <code style="color:var(--yry-text2)">' + item.diag + '</code></div>'
        ) +
      '</div>';
    }).join('') + '</div>';

    // 6) 行动建议（按优先级自动生成）
    var recs = [];
    if (weakItems.length) {
      recs.push('<span style="color:var(--yry-warn)">⚠ 重点改进:</span> ' +
        weakItems.map(function(x) {
          return '<strong style="color:var(--yry-text2)">' + x.label + '</strong>(' + x.score + ' → ' + x.diag + ')';
        }).join(' · '));
    }
    if (emptyItems.length) {
      recs.push('<span style="color:var(--yry-text3)">ℹ️ 待补充:</span> ' +
        emptyItems.map(function(x) { return x.label; }).join(' · ') +
        ' 三个域尚无内容，建议先建立基础规约（参考 <code>skills/rui-yry/</code> 模板）');
    }
    if (lowActivity.length) {
      recs.push('<span style="color:var(--yry-warn)">📉 测量偏低:</span> ' +
        lowActivity.map(function(x) { return x.label; }).join(' · ') +
        ' — 近期 5 周期测量占比 &lt; 30%，需增加健康检查频率');
    }
    if (recs.length === 0 && overall >= 90) {
      recs.push('<span style="color:var(--yry-pass)">✓ 综合状态优秀</span> — 4 域均 ≥ 90 分，维持当前规约节奏即可');
    } else if (recs.length === 0) {
      recs.push('<span style="color:var(--yry-pass)">✓ 综合状态良好</span> — 所有域均 ≥ 75 分，关注评分较低项即可');
    }
    var recHtml = '<div style="margin-top:14px;padding:12px 16px;background:rgba(15,23,42,.3);border-radius:6px;border:var(--yry-border);font-size:.72rem;line-height:1.8">' +
      '<div style="font-weight:600;color:var(--yry-text2);margin-bottom:4px;font-size:.7rem">📋 行动建议 · Action Items</div>' +
      recs.map(function(r) { return '<div>' + r + '</div>'; }).join('') +
    '</div>';

    return heroHtml + distHtml + cardsHtml + recHtml;
  }

  function renderArchHealth(ah) {
    if (!ah || !ah.latest) return '<div class="empty">暂无架构健康数据</div>';
    var latest = ah.latest;
    var scores = latest.scores || {};
    var dimTrends = ah.dimTrends || {};
    var passClr = latest.composite >= 90 ? 'var(--yry-pass)' : latest.composite >= 75 ? 'var(--yry-warn)' : 'var(--yry-fail)';

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
        trendHtml = '<span class="arch-dim-trend" style="color:' + (trendVal >= 90 ? 'var(--yry-pass)' : trendVal >= 75 ? 'var(--yry-warn)' : 'var(--yry-fail)') + '">均 ' + trendVal + '</span>';
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
      '<span><span class="dot" style="background:var(--yry-pass)"></span> A 级 (≥90)</span>' +
      '<span><span class="dot" style="background:#4ade80"></span> B 级 (75-89)</span>' +
      '<span><span class="dot" style="background:var(--yry-warn)"></span> C 级 (60-74)</span>' +
      '<span><span class="dot" style="background:var(--yry-fail)"></span> D 级 (&lt;60)</span>' +
      '<span style="margin-left:auto;color:var(--yry-text3)">悬停圆点查看详情</span>' +
      '</div>';

    return html;
  }

  Promise.all([
    fetch('summary.json').then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; }),
    fetch('self-improve-meta.json').then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; })
  ]).then(function(results) {
    var data = results[0];
    var meta = results[1] || {};
    DIAG_LABELS = meta.DIAG_LABELS || {};
    DIAG_DESCS = meta.DIAG_DESCS || {};
    DIM_LABELS = meta.DIM_LABELS || {};
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

      // Cycle count (loops = totalEntries from health-trend.jsonl snapshots)
      var cycleEl = document.getElementById('siCycleCount');
      if (cycleEl) cycleEl.innerHTML = '<strong style="color:var(--yry-accent)">' + data.totalEntries + '</strong> 次';

      // ── Capability KPIs ─────────────────────────────────────────────────
      (function() {
        var el = document.getElementById('capabilityKpis');
        if (!el) return;
        var diagSummary = data.diagSummary || [];
        var dimSummary = data.dimSummary || [];
        var signals = data.signals || [];
        var weekly = data.weekly || [];
        var scoreTrend = data.scoreTrend || [];

        // 1. 闭环数 (loop count) = totalEntries
        var loops = data.totalEntries || 0;

        // 2. 平均评分
        var avgScore = weekly.length > 0 ? Math.round(weekly.reduce(function(s, w) { return s + (w.avgScore || 0); }, 0) / weekly.length) : (latest.composite || 0);
        var avgClr = avgScore >= 90 ? 'pass' : avgScore >= 75 ? 'warn' : 'fail';

        // 3. 诊断解决率 = (历史触发 - 当前活跃) / 历史触发
        var totalDiagTriggers = diagSummary.reduce(function(s, d) { return s + (d.count || 0); }, 0);
        var currentTriggers = (latest.triggeredDiags || []).length;
        var resolveRate = totalDiagTriggers > 0 ? Math.round((totalDiagTriggers - currentTriggers) / totalDiagTriggers * 100) : 100;
        var resolveClr = resolveRate >= 80 ? 'pass' : resolveRate >= 50 ? 'warn' : 'fail';

        // 4. 维度改善率
        var improvingDims = dimSummary.filter(function(d) { return (d.trend || 0) > 5; }).length;
        var totalDims = dimSummary.length;
        var improveRate = totalDims > 0 ? Math.round(improvingDims / totalDims * 100) : 0;
        var improveClr = improveRate >= 50 ? 'pass' : improveRate >= 25 ? 'warn' : 'fail';

        // 5. 维度复发率 = 退化维度 / 总维度
        var degradingDims = dimSummary.filter(function(d) { return (d.trend || 0) < -5; }).length;
        var recRate = totalDims > 0 ? Math.round(degradingDims / totalDims * 100) : 0;
        var recClr = recRate <= 10 ? 'pass' : recRate <= 25 ? 'warn' : 'fail';

        // 6. MTTR estimate — from scoreTrend drops: drops+recovery cycles
        var drops = [];
        for (var i = 1; i < scoreTrend.length; i++) {
          if (scoreTrend[i].score < scoreTrend[i-1].score - 5) {
            drops.push(i);
          }
        }
        var mttr = '—';
        var mttrClr = 'info';
        if (drops.length > 0 && scoreTrend.length > 0) {
          // estimate cycles to recover = (avg interval × 2)
          var avgInterval = scoreTrend.length / drops.length;
          var cyclesPerRecovery = 2;
          mttr = '~' + Math.round(avgInterval * cyclesPerRecovery) + ' 周期';
          mttrClr = avgInterval * cyclesPerRecovery <= 4 ? 'pass' : 'warn';
        } else if (data.totalEntries >= 3) {
          mttr = '稳定';
          mttrClr = 'pass';
        }

        // 7. 技能化条目 = E4 candidates from signals + recurring diags
        var e4Count = signals.filter(function(s) { return s.type === 'improvement'; }).length;
        var recurringDiags = diagSummary.filter(function(d) { return (d.count || 0) >= 3; }).length;
        var skillCount = e4Count + recurringDiags;
        var skillClr = skillCount >= 3 ? 'pass' : skillCount >= 1 ? 'warn' : 'info';

        // 8. 退化率 = (degrading dims × severity weight) / total
        var degRate = totalDims > 0 ? Math.round(degradingDims / totalDims * 100) : 0;
        var degClr = degRate === 0 ? 'pass' : degRate <= 15 ? 'warn' : 'fail';

        // 9. Stabilization status
        var stab = data.stabilization || {};
        var stabStatus = stab.status || 'stable';
        var stabLabel = stabStatus === 'converging' ? '收敛中' : stabStatus === 'stable' ? '稳定' : '发散中';
        var stabClr = stabStatus === 'converging' ? 'pass' : stabStatus === 'stable' ? 'info' : 'fail';
        var stabDesc = stab.description || '系统评分波动性分析';

        // 10. Confidence-adjusted score
        var confAdj = data.confidenceAdjusted || {};
        var confScore = confAdj.adjustedScore !== undefined ? confAdj.adjustedScore : (latest.composite || 0);
        var confLevel = confAdj.level || 'medium';
        var confClr = confLevel === 'high' ? 'pass' : confLevel === 'medium' ? 'warn' : 'fail';
        var confDiscount = confAdj.discount || 0;

        var html = '';
        var kpis = [
          { label: '闭环数', value: loops, suffix: '次观察→评估完整闭环', cls: 'info', valCls: 'info' },
          { label: '平均评分', value: avgScore, suffix: '周聚合均值 / 100', cls: avgClr, valCls: avgClr },
          { label: '置信调整分', value: confScore, suffix: '可靠性调整后 (' + confLevel + ' 置信度, -' + confDiscount + '%)', cls: confClr, valCls: confClr },
          { label: '诊断解决率', value: resolveRate + '%', suffix: '已清零 / 历史触发', cls: resolveClr, valCls: resolveClr },
          { label: '维度改善率', value: improveRate + '%', suffix: improvingDims + ' / ' + totalDims + ' 维度改善', cls: improveClr, valCls: improveClr },
          { label: '维度复发率', value: recRate + '%', suffix: degradingDims + ' / ' + totalDims + ' 维度退化', cls: recClr, valCls: recClr },
          { label: 'MTTR', value: mttr, suffix: '从触发到恢复的估算', cls: mttrClr, valCls: mttrClr },
          { label: '系统稳定性', value: stabLabel, suffix: stabDesc.slice(0, 24), cls: stabClr, valCls: stabClr },
          { label: '技能化条目', value: skillCount, suffix: 'E4 候选 + ≥3 次诊断', cls: skillClr, valCls: skillClr },
          { label: '退化维度占比', value: degRate + '%', suffix: degradingDims + ' 维度处于下降趋势', cls: degClr, valCls: degClr }
        ];
        kpis.forEach(function(k) {
          html += '<div class="kpi-item ' + k.cls + '">' +
            '<div class="kpi-label">' + k.label + '</div>' +
            '<div class="kpi-value ' + k.valCls + '">' + k.value + '</div>' +
            '<div class="kpi-suffix">' + k.suffix + '</div>' +
            '</div>';
        });
        el.textContent = '';
        el.insertAdjacentHTML('beforeend', html);
      })();

      // Stats
      var scClr = latest.composite >= 90 ? 'pass' : latest.composite >= 75 ? 'warn' : 'fail';
      var gradeClr = {A:'pass', B:'pass', C:'warn', D:'fail'}[latest.grade] || 'info';
      var trigCount = (latest.triggeredDiags || []).length;
      var trigClr = trigCount === 0 ? 'pass' : 'warn';

      document.getElementById('stats').textContent = '';
      document.getElementById('stats').insertAdjacentHTML('beforeend',
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

      document.getElementById('latestBody').insertAdjacentHTML('beforeend', '<div style="display:flex;;align-items:center;gap:20px;flex-wrap:wrap">' +
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
        '</div>' + triggeredHtml);

      // D0-D8 with rates from weekly data
      var allDiags = ['D0','D1','D2','D3','D4','D5','D6','D7','D8'];
      var triggeredSet = {};
      (latest.triggeredDiags || []).forEach(function(d) { triggeredSet[d] = true; });

      // Get rates from weekly summary
      var diagRates = {};
      var diagSummary = data.diagSummary || [];
      diagSummary.forEach(function(d) { diagRates[d.id] = d; });

      document.getElementById('diagGrid').textContent = '';
      document.getElementById('diagGrid').insertAdjacentHTML('beforeend',  allDiags.map(function(d) {
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

      // ── Diagnostic Trigger History (heatmap-like) ────────────────────────
      (function() {
        var el = document.getElementById('diagHistory');
        var axisEl = document.getElementById('diagHistoryAxis');
        if (!el) return;
        var daily = data.daily || [];
        // Get last 14 days (or all if fewer)
        var recent = daily.slice(-14);
        if (recent.length === 0) {
          el.textContent = '';
          el.insertAdjacentHTML('beforeend', '<div class="empty">无每日数据</div>');
          if (axisEl) axisEl.textContent = '';
          return;
        }
        var diags = ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'];
        // Build lookup: date → set of triggered diag IDs (from daily.topDiags)
        var triggeredByDate = {};
        recent.forEach(function(day) {
          var topDiags = day.topDiags || [];
          topDiags.forEach(function(td) {
            if ((td.count || 0) > 0) {
              if (!triggeredByDate[day.date]) triggeredByDate[day.date] = {};
              triggeredByDate[day.date][td.id] = true;
            }
          });
        });
        var html = diags.map(function(d) {
          var triggeredDays = 0;
          var cells = recent.map(function(day) {
            var triggered = triggeredByDate[day.date] && triggeredByDate[day.date][d];
            if (triggered) triggeredDays++;
            return '<div class="diag-history-cell' + (triggered ? ' triggered' : '') + '" title="' + (day.date || '') + ' ' + d + '"></div>';
          }).join('');
          var rate = Math.round(triggeredDays / recent.length * 100);
          var rateClr = rate > 50 ? 'var(--yry-fail)' : rate > 20 ? 'var(--yry-warn)' : 'var(--yry-text2)';
          return '<div class="diag-history-row">' +
            '<div class="diag-history-id">' + d + '</div>' +
            '<div class="diag-history-name">' + (DIAG_LABELS[d] || '').slice(0, 6) + '</div>' +
            '<div class="diag-history-bars">' + cells + '</div>' +
            '<div class="diag-history-rate" style="color:' + rateClr + '">' + rate + '%</div>' +
            '</div>';
        }).join('');
        el.textContent = '';
        el.insertAdjacentHTML('beforeend', html);
        // Axis (date labels)
        if (axisEl) {
          axisEl.textContent = '';
          axisEl.insertAdjacentHTML('beforeend', recent.map(function(day) {
            var lbl = (day.date || '').slice(-5); // MM-DD
            return '<span>' + lbl + '</span>';
          }).join(''));
        }
      })();

      // Dimension scores with weekly comparison
      var dimSummary = data.dimSummary || [];
      var dimAvgs = {};
      dimSummary.forEach(function(d) { dimAvgs[d.dim] = d; });

      var dimEntries = Object.keys(scores).map(function(k) {
        return { dim: k, score: scores[k], avg: dimAvgs[k] ? dimAvgs[k].avgScore : undefined, recent: dimAvgs[k] ? dimAvgs[k].recentAvg : undefined, trendVal: dimAvgs[k] ? dimAvgs[k].trend : undefined };
      });
      dimEntries.sort(function(a, b) { return a.score - b.score; });

      // ── Priority Matrix (改进候选优先级矩阵) ────────────────────────────
      (function() {
        var el = document.getElementById('priorityMatrix');
        if (!el) return;
        // Build candidate list: dimensions with low score or declining trend
        var candidates = [];
        Object.keys(scores).forEach(function(k) {
          var s = scores[k];
          var av = dimAvgs[k] || {};
          var trend = av.trend || 0;
          var avg = av.avgScore || s;
          // Skip perfect scores (no improvement needed)
          if (s >= 90 && trend >= 0) return;
          // Severity score: 0-100 based on score + trend
          var sev = (100 - s) * 0.7 + (trend < 0 ? Math.abs(trend) * 0.3 : 0);
          // Priority: P0 (score<55) / P1 (score<70) / P2 (score<85)
          var pri = s < 60 ? 'p0' : s < 75 ? 'p1' : 'p2';
          candidates.push({
            dim: k, score: s, avg: avg, trend: trend,
            severity: sev, priority: pri,
            label: DIM_LABELS[k] || k
          });
        });
        candidates.sort(function(a, b) { return b.severity - a.severity; });
        var top = candidates.slice(0, 8);
        if (top.length === 0) {
          el.textContent = '';
          el.insertAdjacentHTML('beforeend', '<div class="empty" style="grid-column:1/-1">✅ 无需改进候选 — 所有维度评分 ≥85 且趋势平稳</div>');
          return;
        }
        var html = top.map(function(c, i) {
          var prBadge = c.priority === 'p0' ? '<span class="badge fail">P0</span>' :
                        c.priority === 'p1' ? '<span class="badge warn">P1</span>' :
                        '<span class="badge info">P2</span>';
          var trendTxt = c.trend > 0 ? '<span style="color:var(--yry-pass)">↑ +' + c.trend + '</span>' :
                         c.trend < 0 ? '<span style="color:var(--yry-fail)">↓ ' + c.trend + '</span>' :
                         '<span style="color:var(--yry-text3)">→ 0</span>';
          var g = scoreGrade(c.score);
          var action = c.priority === 'p0' ? '⛔ 阻断管线 · 立即修复' :
                       c.priority === 'p1' ? '⚡ 24h 内启动修复 · 强化审查' :
                       '📋 计划修复 · 候选本周改进';
          return '<div class="priority-item ' + c.priority + '">' +
            '<div class="priority-rank">#' + (i + 1) + '</div>' +
            '<div class="priority-body">' +
              '<div class="priority-title">' + c.label + ' · <span style="color:' + scoreClr(c.score) + '">' + c.score + ' 分</span> <span class="badge ' + g + '">' + g + '</span> ' + prBadge + '</div>' +
              '<div class="priority-meta">' +
                '<span>周均: ' + c.avg + '</span>' +
                '<span>趋势: ' + trendTxt + '</span>' +
                '<span>严重度: ' + Math.round(c.severity) + '</span>' +
              '</div>' +
              '<div class="priority-action">' + action + '</div>' +
            '</div>' +
            '</div>';
        }).join('');
        el.textContent = '';
        el.insertAdjacentHTML('beforeend', html);
      })();

      // ── Dimension Recurrence Ranking ────────────────────────────────────
      (function() {
        var el = document.getElementById('recurrenceList');
        if (!el) return;
        var list = Object.keys(scores).map(function(k) {
          var s = scores[k];
          var av = dimAvgs[k] || {};
          return {
            dim: k, score: s, avg: av.avgScore || s,
            trend: av.trend || 0,
            label: DIM_LABELS[k] || k
          };
        });
        // Sort by score asc, then by trend asc (worst first)
        list.sort(function(a, b) {
          if (a.score !== b.score) return a.score - b.score;
          return a.trend - b.trend;
        });
        var top = list.slice(0, 10);
        var html = top.map(function(c, i) {
          var clr = scoreClr(c.score);
          var g = scoreGrade(c.score);
          var trendHtml = '';
          if (c.trend > 5) trendHtml = '<span class="rec-trend" style="color:var(--yry-pass)">↑ +' + c.trend + '</span>';
          else if (c.trend < -5) trendHtml = '<span class="rec-trend" style="color:var(--yry-fail)">↓ ' + c.trend + '</span>';
          else trendHtml = '<span class="rec-trend" style="color:var(--yry-text3)">→ ' + c.trend + '</span>';
          return '<div class="rec-row">' +
            '<div class="rec-rank">#' + (i + 1) + '</div>' +
            '<div class="rec-name">' + c.label + '</div>' +
            '<div class="rec-bar"><div class="rec-fill" style="width:' + c.score + '%;background:' + clr + '"></div></div>' +
            '<div class="rec-score" style="color:' + clr + '">' + c.score + '</div>' +
            trendHtml +
            '</div>';
        }).join('');
        el.textContent = '';
        el.insertAdjacentHTML('beforeend', html);
      })();

      // ── Dimension Scores · Latest vs Weekly Avg ────────────────────────
      (function() {
        var grid = document.getElementById('dimGrid');
        var summaryEl = document.getElementById('dimSummary');
        if (!grid) return;

        // 1. Pre-compute Δ = 最新 − 周均 + 等级分布 + 极值
        var total = dimEntries.length;
        var improved = 0, declined = 0, flat = 0, noAvg = 0;
        var sumDelta = 0, avgDeltaCount = 0;
        var gradeCounts = { A: 0, B: 0, C: 0, D: 0 };
        var topGain = null, topLoss = null;
        var lowestDim = null;

        dimEntries.forEach(function(d) {
          var g = scoreGrade(d.score);
          gradeCounts[g]++;
          if (!lowestDim || d.score < lowestDim.score) lowestDim = { name: DIM_LABELS[d.dim] || d.dim, score: d.score };

          if (d.avg === undefined || d.avg === null) {
            d.delta = null;
            noAvg++;
            return;
          }
          var delta = Math.round((d.score - d.avg) * 10) / 10;
          d.delta = delta;
          sumDelta += delta;
          avgDeltaCount++;
          if (delta > 0.5) {
            improved++;
            if (!topGain || delta > topGain.delta) topGain = { name: DIM_LABELS[d.dim] || d.dim, delta: delta };
          } else if (delta < -0.5) {
            declined++;
            if (!topLoss || delta < topLoss.delta) topLoss = { name: DIM_LABELS[d.dim] || d.dim, delta: delta };
          } else {
            flat++;
          }
        });
        var avgDelta = avgDeltaCount > 0 ? Math.round((sumDelta / avgDeltaCount) * 10) / 10 : 0;
        var avgDeltaClr = avgDelta > 0.3 ? 'var(--yry-pass)' : avgDelta < -0.3 ? 'var(--yry-fail)' : 'var(--yry-text3)';
        var avgDeltaSign = avgDelta > 0 ? '+' : '';

        // 2. 顶部摘要条 (8 个统计单元)
        if (summaryEl) {
          var sHtml = '' +
            '<div class="dim-summary-item"><span class="dim-summary-val">' + total + '</span><span class="dim-summary-lbl">维度总数</span></div>' +
            '<div class="dim-summary-item"><span class="dim-summary-val" style="color:' + avgDeltaClr + '">' + avgDeltaSign + avgDelta + '</span><span class="dim-summary-lbl">周均 Δ</span></div>' +
            '<div class="dim-summary-item"><span class="dim-summary-val" style="color:var(--yry-pass)">' + improved + '</span><span class="dim-summary-lbl">↑ 改善</span></div>' +
            '<div class="dim-summary-item"><span class="dim-summary-val" style="color:var(--yry-fail)">' + declined + '</span><span class="dim-summary-lbl">↓ 退化</span></div>' +
            '<div class="dim-summary-item"><span class="dim-summary-val" style="color:var(--yry-text3)">' + flat + '</span><span class="dim-summary-lbl">→ 持平</span></div>' +
            '<div class="dim-summary-item"><span class="dim-summary-val" style="color:var(--yry-warn)">' + (gradeCounts.D + gradeCounts.C) + '</span><span class="dim-summary-lbl">C/D 级</span></div>' +
            (topGain ? '<div class="dim-summary-item"><span class="dim-summary-val" style="color:var(--yry-pass);font-size:.94rem">+' + topGain.delta + '</span><span class="dim-summary-lbl">最大涨幅 · ' + topGain.name + '</span></div>' : '') +
            (topLoss ? '<div class="dim-summary-item"><span class="dim-summary-val" style="color:var(--yry-fail);font-size:.94rem">' + topLoss.delta + '</span><span class="dim-summary-lbl">最大跌幅 · ' + topLoss.name + '</span></div>' : '') +
            (lowestDim ? '<div class="dim-summary-item"><span class="dim-summary-val" style="color:' + scoreClr(lowestDim.score) + '">' + lowestDim.score + '</span><span class="dim-summary-lbl">最薄弱 · ' + lowestDim.name + '</span></div>' : '');
          summaryEl.textContent = '';
          summaryEl.insertAdjacentHTML('beforeend', sHtml);
        }

        // 3. 维度卡片 (按评分升序，薄弱维度优先展示)
        grid.classList.add('dim-grid-rich');
        grid.textContent = '';
        grid.insertAdjacentHTML('beforeend', dimEntries.map(function(d) {
          var g = scoreGrade(d.score);
          var clr = scoreClr(d.score);
          var label = DIM_LABELS[d.dim] || d.dim;

          // Delta 徽章
          var deltaBadge = '';
          if (d.delta !== null) {
            var dClr = d.delta > 0.5 ? 'var(--yry-pass)' : d.delta < -0.5 ? 'var(--yry-fail)' : 'var(--yry-text3)';
            var dBg = d.delta > 0.5 ? 'rgba(34,197,94,.10)' : d.delta < -0.5 ? 'rgba(239,68,68,.10)' : 'rgba(255,255,255,.04)';
            var dArrow = d.delta > 0.5 ? '↑' : d.delta < -0.5 ? '↓' : '→';
            var dSign = d.delta > 0 ? '+' : '';
            deltaBadge = '<span class="dim-delta" style="color:' + dClr + ';background:' + dBg + '" title="最新 − 周均">' + dArrow + ' ' + dSign + d.delta + '</span>';
          } else {
            deltaBadge = '<span class="dim-delta" style="color:var(--yry-text3);background:rgba(255,255,255,.04)">— 无均值</span>';
          }

          // 对比柱: 浅色 = 周均, 深色 = 最新 (重叠覆盖, 直观看出偏移方向)
          var latestPct = Math.max(0, Math.min(100, d.score));
          var avgPct = d.avg !== undefined ? Math.max(0, Math.min(100, d.avg)) : 0;
          var barHtml = '<div class="dim-bar-wrap" title="最新 ' + d.score + ' / 周均 ' + (d.avg !== undefined ? d.avg : '—') + '">' +
            '<div class="dim-bar-bg" style="width:' + avgPct + '%"></div>' +
            '<div class="dim-bar-fg" style="width:' + latestPct + '%;background:' + clr + '"></div>' +
            '</div>';

          // 元信息行: 周均数值 + 趋势 (>10 才显示, 避免噪音)
          var avgLabel = d.avg !== undefined ? '周均 ' + d.avg : '周均 —';
          var trendLabel = '';
          if (d.trendVal !== undefined && Math.abs(d.trendVal) > 10) {
            var tClr = d.trendVal > 0 ? 'var(--yry-pass)' : 'var(--yry-fail)';
            trendLabel = '<span class="dim-trend" style="color:' + tClr + '">趋势 ' + (d.trendVal > 0 ? '+' : '') + d.trendVal + '</span>';
          }

          return '<div class="dim-item dim-item-rich" data-dim="' + d.dim + '">' +
            '<div class="dim-head">' +
              '<span class="dim-dot ' + g + '"></span>' +
              '<span class="dim-name">' + label + '</span>' +
              '<span class="dim-score" style="color:' + clr + '">' + d.score + '</span>' +
              deltaBadge +
            '</div>' +
            barHtml +
            '<div class="dim-meta-row">' +
              '<span>' + avgLabel + '</span>' +
              trendLabel +
            '</div>' +
            '</div>';
        }).join(''));
      })();

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
        document.getElementById('branchList').insertAdjacentHTML('beforeend',  branchSummary.map(function(b) {
          var barClr = b.avgScore >= 90 ? 'var(--yry-pass)' : b.avgScore >= 75 ? 'var(--yry-warn)' : 'var(--yry-fail)';
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

      // ── Skillification Tracking ─────────────────────────────────────────
      (function() {
        var el = document.getElementById('skillificationGrid');
        if (!el) return;
        // Derive patterns from diagSummary + signals
        var patterns = [];
        var diagSummary = data.diagSummary || [];
        diagSummary.forEach(function(d) {
          var count = d.count || 0;
          if (count < 1) return;
          // Map diagnostic ID to likely pattern target
          var targetMap = {
            'D0': 'CLAUDE.md · AGENT.md',
            'D1': 'code-pipeline.md',
            'D2': 'doc-generation.md',
            'D3': 'pm.md（故事拆分）',
            'D4': 'code-pipeline.md',
            'D5': 'AGENT.md',
            'D6': 'CLAUDE.md',
            'D7': 'self-improve.md',
            'D8': 'architecture-principles.md'
          };
          var target = targetMap[d.id] || 'self-improve.md';
          var status = count >= 3 ? 'promoted' : count >= 2 ? 'candidate' : 'observed';
          var progress = Math.min(100, Math.round(count / 3 * 100));
          var fillColor = status === 'promoted' ? 'var(--yry-pass)' : status === 'candidate' ? 'var(--yry-cyan)' : 'var(--yry-text3)';
          patterns.push({
            name: (DIAG_LABELS && DIAG_LABELS[d.id]) || d.id,
            id: d.id,
            count: count,
            target: target,
            status: status,
            progress: progress,
            fillColor: fillColor
          });
        });
        // Add improvement signals as patterns
        var signals = data.signals || [];
        signals.filter(function(s) { return s.type === 'improvement'; }).forEach(function(s) {
          patterns.push({
            name: s.title || (s.msg || '').slice(0, 16),
            id: 'S+',
            count: s.count || 1,
            target: s.target || 'SKILL.md',
            status: 'candidate',
            progress: 66,
            fillColor: 'var(--yry-cyan)'
          });
        });
        if (patterns.length === 0) {
          el.textContent = '';
          el.insertAdjacentHTML('beforeend', '<div class="empty" style="grid-column:1/-1;color:var(--yry-pass)">✅ 暂无待技能化模式 — 所有诊断均 ≤ 1 次触发</div>');
          return;
        }
        // Sort by count desc
        patterns.sort(function(a, b) { return b.count - a.count; });
        var html = patterns.slice(0, 12).map(function(p) {
          var statusLabel = p.status === 'promoted' ? '<span class="badge pass">已固化</span>' :
                            p.status === 'candidate' ? '<span class="badge info">候选</span>' :
                            '<span class="badge">观察</span>';
          var remaining = p.status === 'promoted' ? '✓ 规约已固化' : (3 - p.count) + ' 次后升级';
          return '<div class="skill-card ' + p.status + '">' +
            '<div class="skill-head">' +
              '<span class="skill-name">' + p.name + '</span>' +
              statusLabel +
            '</div>' +
            '<div class="skill-count">已触发 <strong style="color:' + p.fillColor + '">' + p.count + '</strong> 次 · 目标: <code>' + p.target + '</code></div>' +
            '<div class="skill-prog">' +
              '<div class="skill-prog-bar"><div class="skill-prog-fill" style="width:' + p.progress + '%;background:' + p.fillColor + '"></div></div>' +
              '<div class="skill-prog-label">' + remaining + '</div>' +
            '</div>' +
            '</div>';
        }).join('');
        el.textContent = '';
        el.insertAdjacentHTML('beforeend', html);
      })();

      // Architecture Health
      document.getElementById('archBody').textContent = '';

      document.getElementById('archBody').insertAdjacentHTML('beforeend', renderArchHealth(data.archHealth));

      // ── Architecture Drift Monitor ──────────────────────────────────────
      (function() {
        var el = document.getElementById('driftMonitor');
        if (!el) return;
        var archHealth = data.archHealth || {};
        // archHealth structure: { latest: { scores: {...}, composite, grade }, dimTrends: {dim: {label, recentAvg, trend}} }
        var scores = (archHealth.latest && archHealth.latest.scores) || archHealth.dimScores || {};
        var trends = archHealth.dimTrends || {};
        var dimList = Object.keys(scores).map(function(k) {
          var td = trends[k] || {};
          return { key: k, score: scores[k], trend: td.trend || 0, label: td.label || k };
        });
        if (dimList.length === 0) {
          el.textContent = '';
          el.insertAdjacentHTML('beforeend', '<div class="empty" style="grid-column:1/-1">无架构维度数据</div>');
          return;
        }
        // Sort by score asc to highlight weakest
        dimList.sort(function(a, b) { return a.score - b.score; });
        var html = dimList.slice(0, 12).map(function(d) {
          var sc = d.score;
          var tr = d.trend;
          var label = d.label || d.key;
          var dir = tr > 3 ? 'up' : tr < -3 ? 'down' : 'flat';
          var arrow = dir === 'up' ? '↑' : dir === 'down' ? '↓' : '→';
          var clr = dir === 'up' ? 'var(--yry-pass)' : dir === 'down' ? 'var(--yry-fail)' : 'var(--yry-text2)';
          var thresholdNote = sc < 70 ? '<div class="drift-threshold">⚠ 低于阈值 70 (D8 触发)</div>' : '';
          return '<div class="drift-item ' + dir + '">' +
            '<div class="drift-name">' + label + '</div>' +
            '<div class="drift-score-row">' +
              '<div class="drift-score" style="color:' + (scoreClr ? scoreClr(sc) : clr) + '">' + sc + '</div>' +
              '<div class="drift-arrow ' + dir + '">' + arrow + ' ' + (tr > 0 ? '+' + tr : tr) + '</div>' +
            '</div>' +
            thresholdNote +
            '</div>';
        }).join('');
        el.textContent = '';
        el.insertAdjacentHTML('beforeend', html);
      })();

      // Score Trend
      document.getElementById('trendBody').textContent = '';

      document.getElementById('trendBody').insertAdjacentHTML('beforeend', renderScoreTrend(data.scoreTrend));

      // ── Trend Forecast (simple linear regression on scoreTrend) ─────────
      (function() {
        var el = document.getElementById('forecastSummary');
        if (!el) return;
        var st = data.scoreTrend || [];
        if (st.length < 4) {
          el.textContent = '';
          el.insertAdjacentHTML('beforeend', '<div class="empty" style="font-size:.7rem">数据不足 (需 ≥4 个数据点)</div>');
          return;
        }
        // Linear regression: y = a + b*x
        var n = st.length;
        var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (var i = 0; i < n; i++) {
          sumX += i;
          sumY += st[i].score || 0;
          sumXY += i * (st[i].score || 0);
          sumX2 += i * i;
        }
        var b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
        var a = (sumY - b * sumX) / n;
        var nextScore = Math.round(a + b * n);
        var projected = Math.max(0, Math.min(100, nextScore));
        var dir = b > 1 ? 'up' : b < -1 ? 'down' : 'flat';
        var arrow = dir === 'up' ? '↑' : dir === 'down' ? '↓' : '→';
        var clr = dir === 'up' ? 'var(--yry-pass)' : dir === 'down' ? 'var(--yry-fail)' : 'var(--yry-cyan)';
        var note = dir === 'up' ? '改善趋势' : dir === 'down' ? '下滑趋势 · 建议干预' : '趋势平稳';
        el.textContent = '';
        el.insertAdjacentHTML('beforeend',
          '<div style="display:flex;align-items:center;gap:14px;padding:10px 14px;background:rgba(15,23,42,.4);border-radius:8px;border:var(--yry-border)">' +
            '<span class="forecast-legend" style="font-size:.72rem;color:var(--yry-cyan)">预测下一周期</span>' +
            '<span style="font-size:1.6rem;font-weight:800;color:' + clr + ';font-family:JetBrains Mono,monospace">' + projected + ' 分 ' + arrow + '</span>' +
            '<span style="font-size:.68rem;color:var(--yry-text3)">基于最近 ' + n + ' 数据点的线性回归 (斜率 ' + (b > 0 ? '+' : '') + b.toFixed(2) + ')</span>' +
          '</div>');
      })();

      // Signal detection
      var signals = data.signals || [];
      if (signals.length > 0) {
        document.getElementById('sigCard').style.display = 'block';
        document.getElementById('sigList').textContent = '';
        document.getElementById('sigList').insertAdjacentHTML('beforeend',  signals.map(function(s) {
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
        document.getElementById('evalMatrix').insertAdjacentHTML('beforeend',  tableHtml +
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

      // ── Root cause analysis (Tab 1) ──────────────────────────────────
      (function() {
        var el = document.getElementById('rootCausePanel');
        if (!el) return;
        var hints = data.rootCauseHints || [];
        if (hints.length === 0) {
          el.textContent = '';
          el.insertAdjacentHTML('beforeend', '<div class="empty">✅ 所有维度评分 ≥80，无需根因分析</div>');
          return;
        }
        var html = hints.map(function(h) {
          var gradeColor = scoreClr(h.score);
          var grade = scoreGrade(h.score);
          var trendIcon = h.trend > 3 ? '↑' : h.trend < -3 ? '↓' : '→';
          var trendClr = h.trend > 3 ? 'var(--yry-pass)' : h.trend < -3 ? 'var(--yry-fail)' : 'var(--yry-text3)';
          var diagTags = (h.relatedDiags || []).map(function(d) {
            return '<span class="badge triggered" style="margin-right:3px">' + d.id + ' ' + d.label + ' (' + d.rate + '%)</span>';
          }).join('');
          var corrTags = (h.correlatedDims || []).map(function(c) {
            var cClr = c.r >= 0.7 ? 'var(--yry-pass)' : c.r >= 0.4 ? 'var(--yry-warn)' : 'var(--yry-text3)';
            return '<span style="color:' + cClr + ';margin-right:4px;font-size:.68rem">' + c.dim + '(r=' + c.r + ')</span>';
          }).join('');
          var causes = (h.possibleCauses || []).map(function(c, i) {
            return '<li style="font-size:.72rem;color:var(--yry-text2);margin-bottom:2px">' + (i + 1) + '. ' + c + '</li>';
          }).join('');
          return '<div class="rec-row">' +
            '<div class="rec-rank"><span class="badge ' + grade + '">' + grade + '</span></div>' +
            '<div class="rec-name" style="color:' + gradeColor + '">' + h.label + ' · ' + h.score + ' 分 <span style="font-size:.68rem;color:' + trendClr + '">' + trendIcon + ' ' + Math.abs(h.trend) + '</span></div>' +
            '<div style="flex:1;min-width:200px">' +
              (diagTags ? '<div style="margin-bottom:4px">' + diagTags + '</div>' : '') +
              (corrTags ? '<div style="margin-bottom:4px">关联维度: ' + corrTags + '</div>' : '') +
              '<ul style="margin:0;padding-left:16px">' + causes + '</ul>' +
            '</div>' +
            '</div>';
        }).join('');
        el.textContent = '';
        el.insertAdjacentHTML('beforeend', html);
      })();

      // ── Cross-dimension correlation heatmap (Tab 2) ─────────────────
      (function() {
        var el = document.getElementById('correlationHeatmap');
        if (!el) return;
        var cd = data.crossDimension;
        if (!cd || !cd.pairs || cd.pairs.length === 0) {
          el.textContent = '';
          el.insertAdjacentHTML('beforeend', '<div class="empty">数据不足，需要 ≥5 个重叠数据点进行相关性分析</div>');
          return;
        }
        var topPairs = cd.pairs.slice(0, 10);
        var html = '<div style="display:flex;flex-wrap:wrap;gap:8px">';
        topPairs.forEach(function(p) {
          var absR = Math.abs(p.r);
          var bg = p.r >= 0.7 ? 'rgba(34,197,94,.12)' : p.r >= 0.4 ? 'rgba(245,158,11,.08)' : p.r <= -0.7 ? 'rgba(239,68,68,.12)' : 'rgba(255,255,255,.03)';
          var borderClr = p.r >= 0.7 ? 'rgba(34,197,94,.3)' : p.r >= 0.4 ? 'rgba(245,158,11,.2)' : p.r <= -0.7 ? 'rgba(239,68,68,.3)' : 'rgba(255,255,255,.06)';
          var rClr = p.r >= 0.7 ? 'var(--yry-pass)' : p.r >= 0.4 ? 'var(--yry-warn)' : p.r <= -0.7 ? 'var(--yry-fail)' : 'var(--yry-text3)';
          html += '<div style="padding:8px 12px;border-radius:6px;background:' + bg + ';border:1px solid ' + borderClr + ';font-size:.72rem;text-align:center">' +
            '<div style="font-weight:600;color:var(--yry-text2)">' + p.dim1 + ' ↔ ' + p.dim2 + '</div>' +
            '<div style="font-size:1.1rem;font-weight:700;color:' + rClr + ';font-family:JetBrains Mono,monospace">r = ' + p.r + '</div>' +
            '<div style="font-size:.6rem;color:var(--yry-text3)">' + p.strength + ' · n=' + p.n + '</div>' +
            '</div>';
        });
        html += '</div>';
        if (cd.clusters && cd.clusters.length > 0) {
          html += '<div style="margin-top:10px;font-size:.68rem;color:var(--yry-text3)">相关性簇: ' + cd.clusters.map(function(c) { return '[' + c.join(', ') + ']'; }).join(' · ') + '</div>';
        }
        el.textContent = '';
        el.insertAdjacentHTML('beforeend', html);
      })();

      // ── Improvement potential (Tab 3) ───────────────────────────────
      (function() {
        var el = document.getElementById('improvePotential');
        var legendEl = document.getElementById('ipLegend');
        var distEl = document.getElementById('ipDist');
        var qwEl = document.getElementById('ipQuickWins');
        if (!el) return;
        var ip = data.improvementPotential;
        if (!ip || !ip.ranking || ip.ranking.length === 0) {
          el.textContent = '';
          el.insertAdjacentHTML('beforeend', '<div class="empty">数据不足，无法计算改进潜力</div>');
          return;
        }

        var ranking = ip.ranking;
        var top = ranking.slice(0, 8);
        var dimLabel = function(key) { return DIM_LABELS[key] || key; };
        var actionable = top.filter(function(r) { return r.roi > 0; });
        var totalImpact = ranking.reduce(function(s, r) { return s + (r.impact || 0); }, 0);
        var actionableImpact = actionable.reduce(function(s, r) { return s + (r.impact || 0); }, 0);
        var top3 = top.slice(0, 3);
        var top3Impact = top3.reduce(function(s, r) { return s + (r.impact || 0); }, 0);
        var top3Pct = actionableImpact > 0 ? Math.round(top3Impact / actionableImpact * 100) : 0;
        var maxROI = Math.max.apply(null, top.map(function(r) { return r.roi; }).concat([1]));
        var maxImpact = Math.max.apply(null, top.map(function(r) { return r.impact; }).concat([1]));
        var maxVol = Math.max.apply(null, top.map(function(r) { return r.volatility || 0; }).concat([1]));
        var fallingCount = top.filter(function(r) { return r.trend === 'falling'; }).length;
        var risingCount = top.filter(function(r) { return r.trend === 'rising'; }).length;
        var stableCount = top.filter(function(r) { return r.trend === 'stable' || !r.trend; }).length;
        var p0Count = top.filter(function(r, i) { return i < 3 && r.roi > 0; }).length;

        // 1) 顶部 Hero：可改进维度 + 4 项关键指标
        var heroHtml = '<div style="display:flex;align-items:stretch;gap:0;flex-wrap:wrap;margin-bottom:12px;border-radius:10px;overflow:hidden;border:var(--yry-border)">' +
          '<div style="padding:14px 20px;background:linear-gradient(135deg,rgba(15,23,42,.7),rgba(15,23,42,.4));display:flex;align-items:center;gap:14px;min-width:180px">' +
            '<div style="text-align:center">' +
              '<div style="font-size:2.2rem;font-weight:800;line-height:1;color:var(--yry-accent)">' + actionable.length + '</div>' +
              '<div style="margin-top:4px"><span class="badge pass">可改进</span></div>' +
            '</div>' +
            '<div style="height:46px;width:1px;background:rgba(255,255,255,.08)"></div>' +
            '<div>' +
              '<div style="font-size:.68rem;color:var(--yry-text3)">潜在总分收益</div>' +
              '<div style="font-size:1rem;font-weight:700;color:var(--yry-cyan)">+' + totalImpact + ' 分</div>' +
            '</div>' +
          '</div>' +
          '<div style="padding:10px 18px;background:rgba(15,23,42,.3);display:flex;gap:22px;flex-wrap:wrap;flex:1;min-width:280px;align-items:center">' +
            '<div><div style="font-size:1.2rem;font-weight:700;color:var(--yry-pass)">+' + top3Impact + '</div><div style="font-size:.58rem;color:var(--yry-text3);margin-top:2px">Top3 总影响</div></div>' +
            '<div><div style="font-size:1.2rem;font-weight:700;color:var(--yry-cyan)">' + top3Pct + '%</div><div style="font-size:.58rem;color:var(--yry-text3);margin-top:2px">占可改进收益</div></div>' +
            '<div><div style="font-size:1.2rem;font-weight:700;color:var(--yry-fail)">' + p0Count + '</div><div style="font-size:.58rem;color:var(--yry-text3);margin-top:2px">P0 高优</div></div>' +
            '<div><div style="font-size:1.2rem;font-weight:700;color:var(--yry-warn)">' + fallingCount + '↓</div><div style="font-size:.58rem;color:var(--yry-text3);margin-top:2px">趋势下行</div></div>' +
          '</div>' +
        '</div>';
        if (legendEl) { legendEl.textContent = ''; legendEl.insertAdjacentHTML('beforeend', heroHtml); }

        // 2) ROI 分布条：横向条形图按 ROI 比例
        var distHtml = '<div style="padding:10px 14px;background:rgba(15,23,42,.3);border-radius:8px;border:var(--yry-border)">' +
          '<div style="display:flex;justify-content:space-between;font-size:.66rem;color:var(--yry-text3);margin-bottom:6px">' +
            '<span><strong style="color:var(--yry-text2)">ROI 分布</strong> · 按 ROI 比例堆叠</span>' +
            '<span>Top ' + actionable.length + ' 维度合计 ROI <strong style="color:var(--yry-accent)">' + actionable.reduce(function(s,r){return s+r.roi;},0).toFixed(1) + '</strong></span>' +
          '</div>' +
          '<div style="display:flex;height:10px;border-radius:5px;overflow:hidden;background:rgba(255,255,255,.05)">' +
          top.map(function(r, i) {
            if (!r.roi) return '';
            var pct = r.roi / actionable.reduce(function(s, x) { return s + x.roi; }, 0) * 100;
            var clr = i === 0 ? 'var(--yry-fail)' : i < 3 ? 'var(--yry-warn)' : i < 5 ? 'var(--yry-cyan)' : 'var(--yry-accent)';
            return '<div title="#' + (i+1) + ' ' + dimLabel(r.dim) + ' · ROI ' + r.roi + '" style="width:' + pct.toFixed(2) + '%;background:' + clr + ';height:100%;transition:width .4s"></div>';
          }).join('') + '</div>' +
          '<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:8px;font-size:.6rem;color:var(--yry-text3)">' +
            '<span><span style="display:inline-block;width:8px;height:8px;background:var(--yry-fail);border-radius:2px;margin-right:3px;vertical-align:middle"></span>#1 (Top ROI)</span>' +
            '<span><span style="display:inline-block;width:8px;height:8px;background:var(--yry-warn);border-radius:2px;margin-right:3px;vertical-align:middle"></span>#2-#3 (P0)</span>' +
            '<span><span style="display:inline-block;width:8px;height:8px;background:var(--yry-cyan);border-radius:2px;margin-right:3px;vertical-align:middle"></span>#4-#5 (P1)</span>' +
            '<span><span style="display:inline-block;width:8px;height:8px;background:var(--yry-accent);border-radius:2px;margin-right:3px;vertical-align:middle"></span>#6+ (P2)</span>' +
          '</div>' +
        '</div>';
        if (distEl) { distEl.innerHTML = distHtml; }

        // 3) Top 8 详细排序卡片（增强：3 维进度条 + 标签）
        var cardsHtml = '<div style="font-size:.72rem;color:var(--yry-text3);margin:14px 0 8px"><strong style="color:var(--yry-text2)">📋 Top 8 详细列表</strong> · 点击维度名可跳转相关诊断</div>';
        cardsHtml += '<div class="priority-grid">';
        top.forEach(function(r, i) {
          var pri = i < 3 ? 'p0' : i < 5 ? 'p1' : 'p2';
          var prBadge = pri === 'p0' ? '<span class="badge fail">P0</span>' : pri === 'p1' ? '<span class="badge warn">P1</span>' : '<span class="badge info">P2</span>';
          var trendIcon = r.trend === 'rising' ? '↑' : r.trend === 'falling' ? '↓' : '→';
          var trendClr = r.trend === 'rising' ? 'var(--yry-pass)' : r.trend === 'falling' ? 'var(--yry-fail)' : 'var(--yry-text3)';
          var trendLabel = r.trend === 'rising' ? '上行' : r.trend === 'falling' ? '下行' : '平稳';
          var impactPct = (r.impact / maxImpact * 100).toFixed(0);
          var volatPct = r.volatility ? Math.min(100, (r.volatility / maxVol * 100)).toFixed(0) : 0;
          var fixScore = r.volatility ? Math.max(0, 100 - r.volatility).toFixed(0) : 0;
          var action = r.impact >= 4 ? '⛔ 高优先级 · 预计提升综合评分 +' + r.impact + ' 分' :
                       r.impact >= 2 ? '⚡ 中等优先级 · 建议本周修复 · 预估 +' + r.impact + ' 分' :
                       r.impact >= 1 ? '📋 低优先级 · 可纳入下轮改进 · 预估 +' + r.impact + ' 分' :
                       '✅ 已达标 · 无需改进';

          cardsHtml += '<div class="priority-item ' + pri + '">' +
            '<div class="priority-rank">' + (i + 1) + '</div>' +
            '<div class="priority-body">' +
              '<div class="priority-title">' + dimLabel(r.dim) + ' · <span style="color:' + scoreClr(r.score) + '">' + r.score + '</span> 分 ' + prBadge + '</div>' +
              // ROI 总条
              '<div style="margin-top:6px">' +
                '<div style="display:flex;justify-content:space-between;font-size:.6rem;color:var(--yry-text3);margin-bottom:2px">' +
                  '<span>ROI 综合</span>' +
                  '<span><strong style="color:var(--yry-cyan)">' + r.roi + '</strong> / ' + maxROI.toFixed(1) + '</span>' +
                '</div>' +
                '<div style="height:5px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden">' +
                  '<div style="width:' + (r.roi / maxROI * 100).toFixed(0) + '%;height:100%;background:linear-gradient(90deg,var(--yry-cyan),var(--yry-accent));border-radius:3px"></div>' +
                '</div>' +
              '</div>' +
              // 3 维分量条
              '<div style="margin-top:8px;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:.58rem">' +
                '<div>' +
                  '<div style="display:flex;justify-content:space-between;color:var(--yry-text3);margin-bottom:2px">' +
                    '<span>影响度</span><strong style="color:var(--yry-text2)">' + r.impact + '</strong>' +
                  '</div>' +
                  '<div style="height:3px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden">' +
                    '<div style="width:' + impactPct + '%;height:100%;background:var(--yry-pass)"></div>' +
                  '</div>' +
                '</div>' +
                '<div>' +
                  '<div style="display:flex;justify-content:space-between;color:var(--yry-text3);margin-bottom:2px">' +
                    '<span>易修复 ' + fixScore + '%</span><strong style="color:var(--yry-text2)">' + r.volatility.toFixed(1) + '</strong>' +
                  '</div>' +
                  '<div style="height:3px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden">' +
                    '<div style="width:' + volatPct + '%;height:100%;background:var(--yry-cyan)"></div>' +
                  '</div>' +
                '</div>' +
                '<div>' +
                  '<div style="display:flex;justify-content:space-between;color:' + trendClr + ';margin-bottom:2px">' +
                    '<span>趋势</span><strong>' + trendIcon + ' ' + trendLabel + '</strong>' +
                  '</div>' +
                  '<div style="height:3px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden">' +
                    '<div style="width:' + (r.trend === 'rising' ? 80 : r.trend === 'falling' ? 100 : 40) + '%;height:100%;background:' + trendClr + '"></div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<div class="priority-action">' + action + '</div>' +
            '</div>' +
            '</div>';
        });
        cardsHtml += '</div>';
        el.textContent = '';
        el.insertAdjacentHTML('beforeend', cardsHtml);

        // 4) Quick Wins 区
        if (ip.quickWins && ip.quickWins.length > 0) {
          var realQW = ip.quickWins.filter(function(q) { return q.estimatedGain > 0; });
          if (realQW.length > 0) {
            var qwHtml = '<div style="margin-top:18px;padding:12px 14px;background:rgba(34,197,94,.06);border-radius:8px;border:1px solid rgba(34,197,94,.2)">' +
              '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
                '<div style="font-size:.84rem;font-weight:600;color:var(--yry-pass)">⚡ 快速改进项 · Quick Wins</div>' +
                '<div style="font-size:.62rem;color:var(--yry-text3)">高影响 · 低波动 · 立即可执行</div>' +
              '</div>' +
              '<div style="font-size:.68rem;color:var(--yry-text3);margin-bottom:10px">修复后可立即拉升评分 — 建议优先排入本周迭代</div>' +
              '<div class="ref-grid">' +
              realQW.map(function(qw) {
                var g = qw.estimatedGain >= 5 ? 'pass' : qw.estimatedGain >= 2 ? 'warn' : 'info';
                return '<div class="ref-card" style="border-left:3px solid var(--yry-pass);position:relative">' +
                  '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">' +
                    '<strong style="color:var(--yry-pass)">' + dimLabel(qw.dim) + '</strong>' +
                    '<span class="badge ' + g + '">+' + qw.estimatedGain + '</span>' +
                  '</div>' +
                  '<div style="font-size:.64rem;color:var(--yry-text3)">当前 <strong style="color:var(--yry-text2)">' + qw.score + '</strong> 分 · 修复影响 <strong style="color:var(--yry-cyan)">' + qw.impact + '</strong></div>' +
                '</div>';
              }).join('') +
              '</div>' +
            '</div>';
            if (qwEl) { qwEl.innerHTML = qwHtml; }
          } else {
            if (qwEl) { qwEl.innerHTML = '<div style="margin-top:14px;padding:10px 14px;background:rgba(34,197,94,.06);border-radius:6px;font-size:.72rem;color:var(--yry-text3);border:1px dashed rgba(34,197,94,.2)">✓ 当前无快速改进项 — 所有高 ROI 维度已纳入 Top 8 排序</div>'; }
          }
        } else {
          if (qwEl) { qwEl.innerHTML = ''; }
        }
      })();

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
      var clr = score >= 90 ? 'var(--yry-pass)' : score >= 75 ? 'var(--yry-warn)' : 'var(--yry-fail)';
      var el = document.getElementById('healthRef');
      if (!el) return;
      el.textContent = '';

      el.insertAdjacentHTML('beforeend', '<div style="width:72px;;height:72px;border-radius:50%;border:3px solid ' + clr + ';display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;color:' + clr + ';flex-shrink:0">' + score + '</div>' +
        '<div style="font-size:.72rem;color:var(--yry-text3);line-height:1.7">' +
          '<div><strong style="color:var(--yry-text)">健康评分</strong> <span class="badge ' + (grade === 'A' || grade === 'B' ? 'pass' : grade === 'C' ? 'warn' : 'fail') + '">' + grade + ' 级</span></div>' +
          '<div>报告日期: ' + (latest.date || '—') + '</div>' +
          '<div>诊断触发: ' + ((latest.triggers || 0) > 0 ? '<span style="color:var(--yry-warn)">' + latest.triggers + ' 项</span>' : '<span style="color:var(--yry-pass)">无</span>') + '</div>' +
          '<div>健康与自改进联动: 健康趋势异常 → 自改进闭环诊断触发 → 改进 → 评估</div>' +
        '</div>');
    })
    .catch(function() {});
})();
