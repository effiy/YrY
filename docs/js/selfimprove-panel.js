/**
 * selfimprove-panel.js — self-improvement analytics panel
 *
 * Reads .memory/health-trend.jsonl + summary.json and renders
 * daily / weekly / monthly / overview perspectives.
 * Depends on: panel-hub.js (loaded first)
 */
(function() {
  'use strict';
  var H = window.PanelHub;
  if (!H) { console.error('selfimprove-panel: PanelHub required'); return; }

  var siBody = document.getElementById('siPanelBody');
  var siFilters = document.querySelectorAll('#siFilters .np-filter-chip');
  var siCount = document.getElementById('siTotalCount');
  var siBadge = document.getElementById('selfimproveBadge');
  var siLiveGrade = document.getElementById('siLiveGrade');
  var siFooterTime = document.getElementById('siFooterTime');
  var siData = null;
  var siRaw = [];
  var siLoaded = false;
  var siPeriod = 'daily';

  /* ── Registration ───────────────────────── */
  H.register('selfimprove', null, 'selfimprovePanel', 'selfimproveOverlay', function() {
    if (!siLoaded) fetchData();
  });

  /* ── Filter chips ───────────────────────── */
  siFilters.forEach(function(c) {
    c.addEventListener('click', function(e) {
      e.stopPropagation();
      siFilters.forEach(function(x) { x.classList.remove('active'); });
      this.classList.add('active');
      siPeriod = this.dataset.period;
      render();
    });
  });

  var siRefresh = document.getElementById('siRefresh');
  if (siRefresh) {
    siRefresh.addEventListener('click', function(e) {
      e.stopPropagation();
      siRefresh.classList.add('spinning');
      siData = null; siRaw = []; siLoaded = false;
      fetchData().finally(function() { siRefresh.classList.remove('spinning'); });
    });
  }

  /* ── Diagnostic reference ───────────────── */
  var DIAG_INFO = {
    D0: { label: '基线偏离', desc: '项目基线（CLAUDE.md/README.md）与实际状态不一致', rec: '运行 /rui init 重生基线并对照差异' },
    D1: { label: '效率退化', desc: '管线执行效率下降：重复操作、超时增加、轮次膨胀', rec: '检查最近 10 次执行记忆，定位重复模式' },
    D2: { label: '质量退化', desc: 'P0 清零速度下降或 Gate B 失败率上升', rec: '审查最近 3 个故事的 Gate B 评估数据' },
    D3: { label: '复杂度增长', desc: '文件膨胀、函数增长、循环复杂度超过阈值', rec: '运行 rui-analysis 定位高复杂度模块' },
    D4: { label: '流程退化', desc: '管线阶段跳过率上升或阻断标识重复出现', rec: '检查 delivery-tracking.jsonl 中的阻断模式' },
    D5: { label: '依赖退化', desc: '依赖版本过期、安全漏洞、或外部 API 不可达', rec: '运行 npm audit + rui-trends 检查外部源可达性' },
    D6: { label: '文档过时', desc: '文档内容与源码实现不一致或链接断裂', rec: '运行 /rui-update 批量刷新过期文档' },
    D7: { label: '配置漂移', desc: '.claude/ 配置与 plugin.json 声明不一致', rec: '运行 /rui-claude sync 同步配置' }
  };

  /* ── Data ───────────────────────────────── */
  async function fetchData() {
    siLoaded = true;
    siBody.innerHTML = '<div class="panel-loading">加载中...</div>';
    try {
      var _a = await Promise.all([
        fetch(H.PATHS.summaryJson).then(function(r) { return r.ok ? r.json() : null; }),
        fetch(H.PATHS.healthTrend).then(function(r) { return r.ok ? r.text() : ''; }).catch(function() { return ''; })
      ]);
      siData = _a[0];
      if (!siData) throw new Error('summary.json 不可用');

      var jsonlText = _a[1] || '';
      siRaw = jsonlText.trim().split('\n').filter(Boolean).map(function(line) {
        try { return JSON.parse(line); } catch(e) { return null; }
      }).filter(Boolean);

      if (siBadge && siData.latest) {
        var latest = siData.latest;
        siBadge.textContent = latest.composite !== undefined ? String(latest.composite) : '';
        siBadge.className = 'badge';
        if (latest.grade) siBadge.classList.add('si-' + latest.grade);
        siBadge.title = '最新评分: ' + latest.composite + '分 ' + latest.grade + '级 | 共 ' + (siData.totalEntries||0) + ' 条记录';
      } else if (siBadge && siData.totalEntries) {
        siBadge.textContent = siData.totalEntries > 99 ? '99+' : String(siData.totalEntries);
        siBadge.className = 'badge';
      }
      if (siLiveGrade && siData.latest) {
        var lg = siData.latest, lGrade = lg.grade || '', lScore = lg.composite;
        siLiveGrade.textContent = lScore + ' ' + lGrade;
        siLiveGrade.className = 'si-live-grade ' + (lGrade ? lGrade : 'loading');
      }
      if (siCount) siCount.textContent = (siData.dateRange ? siData.dateRange.from + ' → ' + siData.dateRange.to : siData.totalEntries + ' 条');
      if (siFooterTime) {
        var now = new Date();
        siFooterTime.textContent = '更新 ' + now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
      }
    } catch(e) {
      siBody.innerHTML = '<div class="panel-empty">数据加载失败<br><span class="hint">运行 <code>node lib/proposals.mjs generate</code> 生成自改进数据</span></div>';
      siData = null; siRaw = [];
      return;
    }
    render();
  }

  function scoreColor(s) { return s >= 80 ? '#22c55e' : s >= 60 ? '#f59e0b' : '#ef4444'; }
  function scoreCls(s)  { return s >= 80 ? 'ok' : s >= 60 ? 'warn' : 'bad'; }
  function mxCls(s)     { return s >= 80 ? 'mx-pass' : s >= 60 ? 'mx-warn' : 'mx-fail'; }

  /* ── Hero section ────────────────────────── */
  function renderHero() {
    if (!siData || !siData.latest) return '';
    var l = siData.latest, s = l.composite, g = l.grade;
    var gradeInfo = { A: { color: '#22c55e', bg: 'rgba(34,197,94,.1)', label: '优秀' },
                      B: { color: '#22c55e', bg: 'rgba(34,197,94,.08)', label: '良好' },
                      C: { color: '#f59e0b', bg: 'rgba(245,158,11,.1)', label: '需关注' },
                      D: { color: '#ef4444', bg: 'rgba(239,68,68,.1)', label: '告警' } };
    var gi = gradeInfo[g] || gradeInfo.C;

    // Compute trend vs previous from raw data
    var trendHtml = '';
    if (siRaw.length >= 2) {
      var prev = siRaw[siRaw.length - 2];
      var diff = s - (prev.composite || s);
      var trendIcon = diff > 3 ? '📈' : diff < -3 ? '📉' : '📊';
      var trendLabel = diff > 3 ? '↑' + diff : diff < -3 ? '↓' + Math.abs(diff) : '→0';
      var trendColor = diff > 3 ? '#22c55e' : diff < -3 ? '#ef4444' : 'var(--text-muted)';
      trendHtml = '<div class="si-hero-stat"><span class="si-hs-icon">' + trendIcon + '</span> vs 上次: <span style="color:' + trendColor + ';font-weight:700">' + H.escHtml(trendLabel) + ' 分</span></div>';
    }

    // Grade sparkline from raw data (last 20)
    var sparkHtml = '';
    if (siRaw.length > 1) {
      var gradeColors = { A: '#22c55e', B: '#22c55e', C: '#f59e0b', D: '#ef4444' };
      var sampled = siRaw.slice(-20);
      sparkHtml = '<div class="si-grade-spark">';
      sampled.forEach(function(e, i) {
        var last = i === sampled.length - 1;
        var size = last ? '10px' : '5px';
        sparkHtml += '<span class="si-grade-dot" style="background:' + (gradeColors[e.grade] || '#555') + ';width:' + size + ';height:' + size + '" title="' + (e.grade||'?') + '级 · ' + (e.composite||'?') + '分 · ' + ((e.timestamp||'').slice(0,10)) + '"></span>';
      });
      sparkHtml += '</div>';
    }

    var diagCount = siData.diagSummary ? siData.diagSummary.filter(function(d) { return d.count > 0; }).length : 0;

    var html = '';
    html += '<div class="si-hero">';
    html += '<div class="si-hero-ring" style="border-color:' + gi.color + ';background:' + gi.bg + '">';
    html += '<div class="si-hero-score" style="color:' + gi.color + '">' + s + '</div>';
    html += '<div class="si-hero-grade" style="background:' + gi.color + '">' + gi.label + '</div>';
    html += '</div>';
    html += '<div class="si-hero-info">';
    html += '<div class="si-hero-label">' + g + ' 级 · 综合健康度</div>';
    html += '<div class="si-hero-stats">';
    html += trendHtml;
    html += '<div class="si-hero-stat"><span class="si-hs-icon">🔬</span> D0-D7: <span style="font-weight:700">' + diagCount + '/8</span> 触发</div>';
    html += '<div class="si-hero-stat"><span class="si-hs-icon">📊</span> ' + (siData.dimSummary ? siData.dimSummary.length : 0) + ' 维度</div>';
    html += '<div class="si-hero-stat"><span class="si-hs-icon">📋</span> ' + (siData.totalEntries||0) + ' 条记录</div>';
    html += '</div></div>';
    if (sparkHtml) html += sparkHtml;
    html += '</div>';
    return html;
  }

  /* ── Summary card ────────────────────────── */
  function renderSummaryCard() {
    if (!siData) return '';
    var latest = siData.latest;
    if (!latest) return '';

    // Overall assessment
    var gradeLabel = { A:'优秀', B:'良好', C:'需关注', D:'告警' };
    var overall = gradeLabel[latest.grade] || '未知';
    var overallIcon = latest.grade === 'A' || latest.grade === 'B' ? '✅' : latest.grade === 'C' ? '⚠️' : '🚫';

    // Diagnostic trigger count
    var diagCount = siData.diagSummary ? siData.diagSummary.filter(function(d) { return d.count > 0; }).length : 0;

    // Dimension pass/warn/fail from dimSummary
    var dimPass = 0, dimWarn = 0, dimFail = 0;
    if (siData.dimSummary) {
      siData.dimSummary.forEach(function(d) {
        if (d.avgScore >= 80) dimPass++;
        else if (d.avgScore >= 60) dimWarn++;
        else dimFail++;
      });
    }

    // Weakest / strongest dimensions
    var sortedDims = siData.dimSummary ? siData.dimSummary.slice().sort(function(a, b) { return a.avgScore - b.avgScore; }) : [];
    var weakest = sortedDims[0];
    var strongest = sortedDims[sortedDims.length - 1];
    var weakLabel = weakest ? H.escHtml(weakest.label) + ' ' + weakest.avgScore : '—';
    var strongLabel = strongest ? H.escHtml(strongest.label) + ' ' + strongest.avgScore : '—';
    var weakTrend = weakest && weakest.trend !== 0 ? (weakest.trend > 0 ? ' ↑' : ' ↓') : '';
    var weakTrendClr = weakest && weakest.trend < -3 ? '#ef4444' : 'inherit';

    // Recommendations count
    var recCount = (siData.signals ? siData.signals.length : 0) + diagCount;

    // Top recommendation
    var topRec = '';
    if (siData.signals && siData.signals.length > 0) {
      var firstSig = siData.signals[0];
      topRec = firstSig.msg || '';
    } else if (diagCount > 0) {
      topRec = diagCount + ' 项诊断触发需处理';
    } else {
      topRec = '系统运行健康，无紧急事项';
    }

    var html = '<div class="si-summary-card">';
    // Row 1
    html += '<div class="si-summary-row">';
    html += '<div class="si-summary-item"><div class="si-summary-val">' + overallIcon + ' ' + overall + '</div><div class="si-summary-lbl">综合评估</div></div>';
    html += '<div class="si-summary-item"><div class="si-summary-val">' + diagCount + '/8</div><div class="si-summary-lbl">诊断触发</div></div>';
    html += '<div class="si-summary-item"><div class="si-summary-val"><span style="color:#22c55e">' + dimPass + '</span> <span style="color:#f59e0b">' + dimWarn + '</span> <span style="color:#ef4444">' + dimFail + '</span></div><div class="si-summary-lbl">维度过/警/败</div></div>';
    html += '<div class="si-summary-item"><div class="si-summary-val" style="color:' + weakTrendClr + '">' + weakLabel + weakTrend + '</div><div class="si-summary-lbl">最弱维度</div></div>';
    html += '</div>';
    // Row 2
    html += '<div class="si-summary-row">';
    html += '<div class="si-summary-item"><div class="si-summary-val" style="color:#22c55e">' + strongLabel + '</div><div class="si-summary-lbl">最强维度</div></div>';
    html += '<div class="si-summary-item"><div class="si-summary-val">' + recCount + ' 项</div><div class="si-summary-lbl">改进建议</div></div>';
    html += '<div class="si-summary-item" style="flex:2;min-width:140px"><div class="si-summary-val" style="font-size:.7rem;text-align:left">💡 ' + H.escHtml(topRec.slice(0, 50)) + (topRec.length > 50 ? '…' : '') + '</div><div class="si-summary-lbl">首项建议</div></div>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  /* ── Recommendations ─────────────────────── */
  function renderRecommendations() {
    if (!siData) return '';
    var recs = [];

    // From signals
    if (siData.signals) {
      siData.signals.forEach(function(s) {
        var prio = s.type === 'regression' ? 'high' : s.type === 'warning' ? 'high' : 'medium';
        recs.push({ source: s.type === 'regression' ? '维度退化' : s.type === 'warning' ? '诊断告警' : '改进信号', text: s.msg, priority: prio });
      });
    }

    // From triggered diagnostics with recommendations
    if (siData.diagSummary) {
      siData.diagSummary.forEach(function(d) {
        if (d.count > 0) {
          var di = DIAG_INFO[d.id] || {};
          if (di.rec) {
            var alreadyCovered = recs.some(function(r) { return r.text.indexOf(d.id) >= 0; });
            if (!alreadyCovered) {
              recs.push({ source: d.id + ' ' + (d.label || ''), text: di.rec, priority: d.rate >= 50 ? 'high' : 'medium' });
            }
          }
        }
      });
    }

    if (recs.length === 0) {
      return '<div class="si-section-title">💡 改进建议</div><div style="padding:4px 16px 8px;font-size:.64rem;color:var(--text-muted)">✅ 暂无建议 — 所有指标健康</div>';
    }

    // Deduplicate by text
    var seen = {};
    var uniq = [];
    recs.forEach(function(r) {
      var key = r.text.slice(0, 30);
      if (!seen[key]) { seen[key] = true; uniq.push(r); }
    });
    // Sort high priority first
    uniq.sort(function(a, b) { return a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0; });
    var top = uniq.slice(0, 6);

    var html = '<div class="si-section-title">💡 改进建议 (' + top.length + ' 项)</div><div class="si-rec-list">';
    top.forEach(function(r) {
      var prioColor = r.priority === 'high' ? '#ef4444' : '#f59e0b';
      var prioIcon = r.priority === 'high' ? '🔴' : '🟡';
      html += '<div class="si-rec-item"><span class="si-rec-prio" style="color:' + prioColor + '">' + prioIcon + '</span>';
      html += '<div class="si-rec-body"><div class="si-rec-source">' + H.escHtml(r.source) + '</div>';
      html += '<div class="si-rec-text">' + H.escHtml(r.text) + '</div></div></div>';
    });
    html += '</div>';
    return html;
  }

  /* ── Component health ────────────────────── */
  function renderComponentHealth() {
    if (!siData || !siData.componentHealth) return '';
    var ch = siData.componentHealth;
    var types = [
      { key: 'skills',  icon: '🤖', label: 'Skills' },
      { key: 'agents',  icon: '👥', label: 'Agents' },
      { key: 'rules',   icon: '📏', label: 'Rules' },
      { key: 'scripts', icon: '📜', label: 'Scripts' },
    ];
    var html = '<div class="si-section-title">📦 组件健康</div><div class="si-comp-section">';
    types.forEach(function(t) {
      var data = ch[t.key];
      if (!data || data.count === 0) return;
      var s = data.avgScore || 0;
      var barW = Math.max(3, s);
      html += '<div class="si-comp-row"><span class="si-comp-icon">' + t.icon + '</span>';
      html += '<span class="si-comp-label">' + t.label + '</span>';
      html += '<div class="si-comp-bar-wrap"><div class="si-comp-bar" style="width:' + barW + '%;background:' + scoreColor(s) + '"></div></div>';
      html += '<span class="si-comp-score" style="color:' + scoreColor(s) + '">' + s + ' 分</span>';
      html += '<span class="si-comp-count">' + data.count + ' 个</span></div>';
    });
    if (ch.overallAvg !== undefined) {
      html += '<div class="si-comp-summary">综合均分: <span style="color:' + scoreColor(ch.overallAvg) + ';font-weight:700">' + ch.overallAvg + ' 分</span> · 共 <span style="font-weight:700">' + (ch.totalComponents||0) + '</span> 组件</div>';
    }
    html += '</div>';
    return html;
  }

  /* ── Overview render ────────────────────── */
  function renderOverview() {
    if (!siData) return;
    var html = '';

    // New: hero + summary card + recommendations
    html += renderHero();
    html += renderSummaryCard();
    html += renderRecommendations();

    if (siData.dimSummary && siData.dimSummary.length > 0) {
      html += '<div class="si-section-title">📐 维度健康矩阵（全部 ' + siData.dimSummary.length + ' 维）</div>';
      html += '<div class="si-matrix">';
      siData.dimSummary.forEach(function(d) {
        var s = d.avgScore;
        var trendIcon = d.trend > 3 ? ' ↑' : d.trend < -3 ? ' ↓' : '';
        var trendClr = d.trend > 3 ? '#22c55e' : d.trend < -3 ? '#ef4444' : '';
        html += '<div class="si-mx-card ' + mxCls(s) + '" title="' + H.escHtml(d.label) + ' · 均分' + s + ' · 最近' + d.recentAvg + ' · ' + d.entries + '次">';
        html += '<div class="si-mx-name">' + H.escHtml(d.label) + '</div>';
        html += '<div class="si-mx-score" style="color:' + scoreColor(s) + '">' + s + '</div>';
        if (trendIcon) html += '<div class="si-mx-trend" style="color:' + trendClr + '">' + trendIcon + Math.abs(d.trend) + '</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    // New: component health
    html += renderComponentHealth();

    if (siData.diagSummary && siData.diagSummary.length > 0) {
      html += '<div class="si-section-title">🔬 诊断触发概览</div>';
      var activeCount = siData.diagSummary.filter(function(d) { return d.count > 0; });
      if (activeCount.length === 0) {
        html += '<div style="padding:4px 16px 8px;font-size:.64rem;color:var(--text-muted)">✅ 近期无诊断触发</div>';
      } else {
        var maxCount = activeCount[0].count || 1;
        activeCount.forEach(function(d) {
          var barW = Math.max(3, Math.round((d.count||0) / maxCount * 100));
          var barClr = d.rate >= 50 ? '#ef4444' : d.rate >= 25 ? '#f59e0b' : '#60a5fa';
          var label = siData.diagLabels && siData.diagLabels[d.id] ? siData.diagLabels[d.id] : d.label;
          var di = DIAG_INFO[d.id] || {};
          html += '<div class="si-diag-card"><span class="si-dc-id">' + d.id + '</span>';
          html += '<div class="si-dc-info"><div class="si-dc-name">' + H.escHtml(label) + '</div>';
          html += '<div class="si-dc-stats">触发 ' + d.count + ' 次 · 覆盖率 ' + d.rate + '%';
          if (di.desc) html += ' · ' + H.escHtml(di.desc);
          if (di.rec) html += '<br><span style="color:#fbbf24">💡 ' + H.escHtml(di.rec) + '</span>';
          html += '</div></div>';
          html += '<span class="si-dc-bar-wrap"><span class="si-dc-bar" style="width:' + barW + '%;background:' + barClr + '"></span></span>';
          html += '<span class="si-dc-badge" style="color:' + barClr + '">' + d.rate + '%</span></div>';
        });
      }
    }

    if (siData.branchSummary && siData.branchSummary.length > 0) {
      html += '<div class="si-section-title">🌿 分支健康对比</div><div class="si-branch-chips">';
      siData.branchSummary.forEach(function(b) {
        html += '<div class="si-br-chip"><span class="si-br-name" title="' + H.escHtml(b.name) + '">' + H.escHtml(b.name) + '</span>';
        html += '<span class="si-br-score" style="color:' + scoreColor(b.avgScore) + '">' + b.avgScore + '</span>';
        html += '<span class="si-br-meta"><span>×' + b.count + '次</span>';
        if (b.avgUncommitted !== undefined) html += '<span style="color:' + (b.avgUncommitted > 20 ? '#f59e0b' : 'inherit') + '">' + b.avgUncommitted + '未提交</span>';
        html += '</span></div>';
      });
      html += '</div>';
    }

    if (siData.scoreTrend && siData.scoreTrend.length > 1) {
      html += '<div class="si-section-title">📈 评分走势（全部 ' + siData.scoreTrend.length + ' 个数据点）</div>';
      html += '<div class="si-sparkline-legend"><span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#22c55e"></span> A(≥80)</span><span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#f59e0b"></span> B/C(60-79)</span><span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#ef4444"></span> D(<60)</span></div>';
      html += '<div class="si-sparkline">';
      var trend = siData.scoreTrend.slice(-80);
      var allScores = trend.map(function(p) { return p.score; });
      var minS = Math.min.apply(null, allScores), maxS = Math.max.apply(null, allScores);
      trend.forEach(function(p) {
        var h = Math.max(2, Math.round(p.score / 100 * 38));
        html += '<span class="si-spark-bar" style="height:' + h + 'px;background:' + scoreColor(p.score) + '" title="' + p.date + ' ' + (p.time||'') + ': ' + p.score + '分 ' + (p.grade||'') + '级"></span>';
      });
      html += '</div>';
    }

    if (siData.signals && siData.signals.length > 0) {
      html += '<div class="si-signals">';
      siData.signals.forEach(function(s) {
        html += '<div class="si-signal ' + s.type + '"><span class="si-sig-icon">' + (s.icon||'') + '</span>' + H.escHtml(s.msg) + '</div>';
      });
      html += '</div>';
    }

    siBody.innerHTML = html;
  }

  /* ── Period render ──────────────────────── */
  function renderPeriod() {
    if (!siData) return;
    var buckets = siPeriod === 'daily' ? siData.daily : siPeriod === 'weekly' ? siData.weekly : siData.monthly;
    if (!buckets || buckets.length === 0) {
      siBody.innerHTML = '<div class="panel-empty">暂无' + (siPeriod === 'daily' ? '日' : siPeriod === 'weekly' ? '周' : '月') + '报数据<br><span class="hint">积累更多数据后自动生成</span></div>';
      return;
    }

    var current = buckets[buckets.length - 1];
    var prev = buckets.length > 1 ? buckets[buckets.length - 2] : null;
    var html = '';
    var sc = current.avgScore, gd = current.topGrade;
    var pLabel = siPeriod === 'daily' ? current.date || '' : siPeriod === 'weekly' ? (current.week||'') + ' ~ ' + (current.weekEnd||'') : (current.month||'').replace('-','年') + '月';
    var pTitle = siPeriod === 'daily' ? '日报' : siPeriod === 'weekly' ? '周报' : '月报';

    html += '<div class="si-period-header"><div class="si-period-score" style="color:' + scoreColor(sc) + '">' + sc + '</div>';
    html += '<span class="si-period-grade ' + gd + '">' + gd + ' 级</span>';
    html += '<div class="si-period-meta">' + pTitle + ' · ' + H.escHtml(pLabel) + ' · ' + current.entries + ' 次检查';
    if (current.minScore !== undefined && current.minScore !== current.maxScore) html += ' · 范围 ' + current.minScore + '–' + current.maxScore;
    if (current.branches && current.branches.length) html += ' · ' + current.branches.length + ' 分支';
    html += '</div>';
    if (prev && current.avgScore !== prev.avgScore) {
      var dSign = current.avgScore > prev.avgScore ? '+' : '';
      html += '<div class="si-period-delta ' + (current.avgScore > prev.avgScore ? 'up' : 'down') + '">' + dSign + (current.avgScore - prev.avgScore) + ' 分 vs 上期</div>';
    }
    if (current.gradeDist) {
      html += '<div class="si-grade-dist">';
      ['A','B','C','D'].forEach(function(g) { var cnt = current.gradeDist[g] || 0; if (cnt > 0) html += '<span class="si-gd-chip ' + g + '">' + g + '×' + cnt + '</span>'; });
      html += '</div>';
    }
    // Grade sparkline for period
    if (siRaw.length > 1) {
      var gradeColors = { A: '#22c55e', B: '#22c55e', C: '#f59e0b', D: '#ef4444' };
      var periodSampled = siRaw.slice(-20);
      html += '<div class="si-grade-spark" style="justify-content:flex-start;padding:2px 0">';
      periodSampled.forEach(function(e, i) {
        var last = i === periodSampled.length - 1;
        var size = last ? '10px' : '5px';
        html += '<span class="si-grade-dot" style="background:' + (gradeColors[e.grade] || '#555') + ';width:' + size + ';height:' + size + '" title="' + (e.grade||'?') + '级 · ' + (e.composite||'?') + '分"></span>';
      });
      html += '</div>';
    }
    html += '</div>';

    if (siPeriod === 'daily' && siData.signals) {
      html += '<div class="si-signals">';
      siData.signals.forEach(function(s) { html += '<div class="si-signal ' + s.type + '"><span class="si-sig-icon">' + (s.icon||'') + '</span>' + H.escHtml(s.msg) + '</div>'; });
      html += '</div>';
    }

    if (siData.scoreTrend && siData.scoreTrend.length > 1) {
      html += '<div class="si-section-title">📈 评分走势</div><div class="si-sparkline">';
      siData.scoreTrend.slice(-60).forEach(function(p) {
        var h = Math.max(2, Math.round(p.score / 100 * 38));
        html += '<span class="si-spark-bar" style="height:' + h + 'px;background:' + scoreColor(p.score) + '" title="' + p.date + ': ' + p.score + '分"></span>';
      });
      html += '</div>';
    }

    if (siData.dimSummary && siData.dimSummary.length > 0) {
      html += '<div class="si-section-title">📐 维度评分</div><div class="si-dim-table">';
      siData.dimSummary.slice(0, 9).forEach(function(d) {
        var tIcon = d.trend > 3 ? '↑' : d.trend < -3 ? '↓' : '';
        var tClr = d.trend > 3 ? 't-green' : d.trend < -3 ? 't-red' : '';
        html += '<div class="si-dim-trow"><span class="si-dt-label">' + H.escHtml(d.label) + '</span>';
        html += '<span class="si-dt-bar-wrap"><span class="si-dt-bar" style="width:' + Math.max(d.avgScore, 3) + '%;background:' + scoreColor(d.avgScore) + '"></span></span>';
        html += '<span class="si-dt-val">' + d.avgScore + '</span><span class="si-dt-delta ' + tClr + '">' + (d.trend !== 0 ? tIcon + Math.abs(d.trend) : '—') + '</span></div>';
      });
      html += '</div>';
    }

    if (current.topDiags && current.topDiags.length > 0) {
      html += '<div class="si-section-title">🔬 本期诊断触发</div>';
      current.topDiags.forEach(function(d) {
        var barClr = d.rate >= 50 ? '#ef4444' : d.rate >= 25 ? '#f59e0b' : '#60a5fa';
        var label = siData.diagLabels && siData.diagLabels[d.id] ? siData.diagLabels[d.id] : d.label;
        var di = DIAG_INFO[d.id] || {};
        html += '<div class="si-diag-card"><span class="si-dc-id">' + d.id + '</span>';
        html += '<div class="si-dc-info"><div class="si-dc-name">' + H.escHtml(label) + '</div><div class="si-dc-stats">×' + d.count + ' 次 · 覆盖率 ' + d.rate + '%';
        if (di.desc) html += ' · ' + H.escHtml(di.desc);
        html += '</div></div>';
        html += '<span class="si-dc-bar-wrap"><span class="si-dc-bar" style="width:' + Math.max(Math.round(d.rate), 3) + '%;background:' + barClr + '"></span></span>';
        html += '<span class="si-dc-badge" style="color:' + barClr + '">' + d.rate + '%</span></div>';
      });
    }

    if (siPeriod === 'daily' && siRaw.length > 0) {
      var today = current.date || '';
      var todayEntries = siRaw.filter(function(e) { return e.timestamp && e.timestamp.slice(0,10) === today; }).sort(function(a, b) { return (b.timestamp||'').localeCompare(a.timestamp||''); });
      if (todayEntries.length > 0) {
        html += '<div class="si-section-title">🕐 今日检查记录（' + todayEntries.length + ' 次）</div><div class="si-timeline">';
        todayEntries.forEach(function(e) {
          var t = e.timestamp ? e.timestamp.slice(11,16) : '';
          html += '<div class="si-tl-entry"><span class="si-tl-dot" style="background:' + scoreColor(e.composite) + '"></span>';
          html += '<span class="si-tl-time">' + H.escHtml(t) + '</span><span class="si-tl-score" style="color:' + scoreColor(e.composite) + '">' + e.composite + '</span>';
          html += '<span class="si-tl-diags">' + (e.grade||'') + '级';
          if (e.triggeredDiags && e.triggeredDiags.length > 0) {
            html += '<span class="si-tl-diag-tags">';
            e.triggeredDiags.forEach(function(diag) {
              var dinfo = DIAG_INFO[diag] || {};
              html += '<span class="si-tl-diag-tag warm" title="' + H.escHtml(dinfo.desc || '') + ' → ' + H.escHtml(dinfo.rec || '') + '">' + diag + '</span>';
            });
            html += '</span>';
          }
          html += '</span>';
          if (e.gitBranch) html += '<span class="si-tl-br">' + H.escHtml(e.gitBranch) + '</span>';
          if (e.gitUncommitted && e.gitUncommitted > 10) html += '<span class="si-tl-uncom">' + e.gitUncommitted + '未提交</span>';
          html += '</div>';
        });
        html += '</div>';
      }
    } else if (siPeriod === 'weekly' && siData.daily) {
      var ws = current.week || '', we = current.weekEnd || '';
      var weekDays = siData.daily.filter(function(d) { return d.date >= ws && d.date <= we; });
      if (weekDays.length > 0) {
        html += '<div class="si-section-title">📅 本周各日概况</div><div class="si-day-grid">';
        var dn = ['日','一','二','三','四','五','六'];
        weekDays.forEach(function(d) {
          var dayIdx = new Date(d.date).getDay();
          html += '<div class="si-day-cell"><div class="si-day-name">周' + dn[dayIdx] + '</div><div class="si-day-score" style="color:' + scoreColor(d.avgScore) + '">' + d.avgScore + '</div><div class="si-day-count">' + d.entries + '次</div></div>';
        });
        html += '</div>';
      }
    } else if (siPeriod === 'monthly' && siData.weekly) {
      var mPrefix = (current.month||'').replace(/-/g,'');
      var mWeeks = siData.weekly.filter(function(w) { return (w.week||'').replace(/-/g,'').startsWith(mPrefix); });
      if (mWeeks.length > 0) {
        html += '<div class="si-section-title">📅 本月各周概况</div><div class="si-day-grid">';
        mWeeks.forEach(function(w) {
          html += '<div class="si-day-cell"><div class="si-day-name">W' + (w.week||'').replace(/.*W0?(\d+)$/,'$1') + '</div><div class="si-day-score" style="color:' + scoreColor(w.avgScore) + '">' + w.avgScore + '</div><div class="si-day-count">' + w.entries + '次</div></div>';
        });
        html += '</div>';
      }
    }

    if (current.branches && current.branches.length > 0) {
      html += '<div class="si-section-title">🌿 本期活跃分支</div><div class="si-branch-chips">';
      current.branches.forEach(function(b) {
        var name = typeof b === 'string' ? b : b.name || '';
        var count = typeof b === 'object' ? b.count : 0;
        html += '<span class="si-br-chip"><span class="si-br-name">' + H.escHtml(name) + '</span>';
        if (count) html += '<span class="si-br-meta"><span>×' + count + '</span></span>';
        html += '</span>';
      });
      html += '</div>';
    }

    html += '<div class="si-section-title">📋 历史' + pTitle + '</div>';
    var maxBuckets = siPeriod === 'daily' ? 14 : siPeriod === 'weekly' ? 8 : 12;
    var hist = buckets.slice(0, buckets.length - 1).reverse().slice(0, maxBuckets);
    if (hist.length === 0) {
      html += '<div style="padding:4px 16px 8px;font-size:.64rem;color:var(--text-muted)">暂无更多历史数据</div>';
    } else {
      hist.forEach(function(b) {
        var key = b.date || b.week || b.month;
        var label = siPeriod === 'weekly' ? (b.week||'') + ' ~ ' + (b.weekEnd||'') : siPeriod === 'monthly' ? (b.month||'').replace('-','年') + '月' : key;
        html += '<div class="si-bucket"><div class="si-bucket-head"><span class="si-bucket-date">' + H.escHtml(label) + '</span>';
        html += '<span class="si-bucket-grade ' + (b.topGrade||'') + '">' + b.avgScore + '分 ' + (b.topGrade||'') + '级</span>';
        html += '<span class="si-bucket-meta">' + b.entries + ' 次</span>';
        if (b.delta && b.delta.score !== 0) html += '<span class="si-bucket-meta">' + (b.delta.score > 0 ? '+' : '') + b.delta.score + ' vs 上期</span>';
        html += '</div>';
        if (b.topDiags && b.topDiags.length > 0) {
          html += '<div class="si-bucket-diags">';
          b.topDiags.forEach(function(d) { html += '<span class="si-bucket-diag' + (d.rate >= 50 ? ' hot' : '') + '">' + d.id + ' ' + H.escHtml(d.label) + ' ×' + d.count + '</span>'; });
          html += '</div>';
        }
        html += '</div>';
      });
    }

    siBody.innerHTML = html;
  }

  function render() {
    if (!siData) return;
    if (siPeriod === 'overview') { renderOverview(); } else { renderPeriod(); }
  }
})();
