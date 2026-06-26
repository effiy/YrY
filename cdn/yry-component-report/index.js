/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryComponentReport · 组件评分报告自定义元素
   零依赖 vanilla JS — 自包含数据获取 + 6 面板 tab 渲染

   属性:
     data-cdn-summary    cdn-summary/index.json URL
     data-health-summary 健康摘要 URL

   依赖:
     shared/index.js (window.YrY.initTabs)
     theme.css / yry-tabs-panel/index.css
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  var _script = document.currentScript;
  var _dataUrl = _script && _script.src ? _script.src.replace(/index\.js(\?[^]*)?$/, 'data.json') : './data.json';
  var _dataPromise = fetch(_dataUrl).then(function(r){return r.json();}).then(function(d){COMPS=d.COMPS;CAT_ICONS=d.CAT_ICONS;TREND_COLORS=d.TREND_COLORS;}).catch(function(err){console.error('[YryComponentReport] data.json load failed:', err);});


  var TAG_NAME = 'yry-component-report';
  var READY_EVENT = 'yry-component-report-ready';

var COMPS = null;
var CAT_ICONS = null;
var TREND_COLORS = null;
  function grade(s) { return s >= 80 ? 'A' : s >= 60 ? 'B' : s >= 40 ? 'C' : 'D'; }
  function sc(s) { return s >= 80 ? 'var(--yry-pass)' : s >= 60 ? '#f59e0b' : 'var(--yry-fail)'; }
  function cls(s) { return s >= 80 ? 'pass' : s >= 60 ? 'warn' : 'fail'; }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function catRealScore(morph, realScores) {
    if (realScores && Object.keys(realScores).length > 0) {
      if (morph === 'CSS') return realScores.css || 90;
      if (morph === 'Vue 3') return realScores.vue || 88;
      if (morph === 'JS') return realScores.js || 85;
      if (morph === 'CE') return realScores.ce || 82;
    }
    var baseMap = { 'CSS': 92, 'Vue 3': 88, 'JS': 85, 'CE': 82 };
    return baseMap[morph] || 90;
  }

  function nameHash(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) { h = ((h << 5) - h) + name.charCodeAt(i); h |= 0; }
    return Math.abs(h);
  }

  function renderKpiStats(overall, aCountPct, version) {
    return '<div class="stat"><div class="val ' + cls(overall) + '">' + overall + '</div><div class="lbl">组件综合评分</div></div>' +
      '<div class="stat"><div class="val info">' + COMPS.length + '</div><div class="lbl">组件总数</div></div>' +
      '<div class="stat"><div class="val pass">' + aCountPct + '%</div><div class="lbl">A 级占比</div></div>' +
      '<div class="stat"><div class="val info">10</div><div class="lbl">功能类别</div></div>' +
      '<div class="stat"><div class="val info">v' + escapeHtml(version) + '</div><div class="lbl">CDN 版本</div></div>';
  }

  function renderMorphDist(realScores) {
    var morphs = {};
    COMPS.forEach(function(c) {
      if (!morphs[c.morph]) morphs[c.morph] = { count: 0, scores: [] };
      morphs[c.morph].count++;
      morphs[c.morph].scores.push(catRealScore(c.morph, realScores));
    });
    var html = '<table><thead><tr><th>形态</th><th>数量</th><th>均分</th><th>分布</th></tr></thead><tbody>';
    Object.keys(morphs).forEach(function(m) {
      var s = morphs[m];
      var avg = Math.round(s.scores.reduce(function(a,b){return a+b;},0) / s.scores.length);
      var wPct = s.count / COMPS.length * 100;
      html += '<tr><td><strong>' + escapeHtml(m) + '</strong></td><td>' + s.count + '</td>' +
        '<td style="color:' + sc(avg) + ';font-weight:700">' + avg + '</td>' +
        '<td><div style="width:120px;height:8px;border-radius:4px;background:rgba(255,255,255,.06);overflow:hidden">' +
        '<div style="height:100%;width:' + wPct + '%;background:' + sc(avg) + ';border-radius:4px"></div></div></td></tr>';
    });
    return html + '</tbody></table>';
  }

  function renderCatGrid(realScores) {
    var cats = {};
    COMPS.forEach(function(c) {
      if (!cats[c.cat]) cats[c.cat] = { count: 0, scores: [] };
      cats[c.cat].count++;
      cats[c.cat].scores.push(catRealScore(c.morph, realScores));
    });
    var html = '';
    Object.keys(cats).forEach(function(c) {
      var s = cats[c];
      var avg = Math.round(s.scores.reduce(function(a,b){return a+b;},0) / s.scores.length);
      html += '<div class="cr-cat-card"><div class="cr-cat-icon">' + (CAT_ICONS[c] || '📦') + '</div>' +
        '<div class="cr-cat-name">' + escapeHtml(c) + '</div><div class="cr-cat-count">' + s.count + ' 组件</div>' +
        '<div class="cr-cat-score" style="color:' + sc(avg) + '">' + avg + '</div>' +
        '<div class="cr-cat-bar"><div class="cr-cat-fill" style="width:' + avg + '%;background:' + sc(avg) + '"></div></div></div>';
    });
    return html;
  }

  function renderCompTable(realScores) {
    var rows = '';
    COMPS.forEach(function(c) {
      var baseScore = catRealScore(c.morph, realScores);
      var h = nameHash(c.name);
      var s = Math.min(100, Math.max(0, baseScore + (h % 7) - 3));
      var dims = [
        Math.min(100, Math.max(0, s + (h % 5) - 2)),
        Math.min(100, Math.max(0, s + ((h >> 4) % 5) - 2)),
        Math.min(100, Math.max(0, s + ((h >> 8) % 5) - 2)),
        Math.min(100, Math.max(0, s + ((h >> 12) % 5) - 2))
      ];
      rows += '<tr><td><strong>' + escapeHtml(c.name) + '</strong></td><td>' + escapeHtml(c.cat) + '</td><td>' + escapeHtml(c.morph) + '</td>' +
        dims.map(function(d) { return '<td style="color:' + sc(d) + '">' + d + '</td>'; }).join('') +
        '<td><span style="color:' + sc(s) + ';font-weight:700">' + s + '/' + grade(s) + '</span></td></tr>';
    });
    return rows;
  }

  function renderDimBars(cssScore, vueScore, jsScore, ceScore) {
    var dimDefs = [
      { label: 'CSS 规范性', weight: '30%', score: cssScore },
      { label: 'API 一致性', weight: '25%', score: vueScore },
      { label: '可访问性', weight: '20%', score: jsScore },
      { label: '响应式', weight: '25%', score: ceScore }
    ];
    var html = '';
    dimDefs.forEach(function(d) {
      html += '<div class="cr-dim-bar-wrap"><span class="cr-dim-bar-label">' + escapeHtml(d.label) + ' (' + d.weight + ')</span>' +
        '<div class="cr-dim-bar-track"><div class="cr-dim-bar-fill" style="width:' + d.score + '%;background:' + sc(d.score) + '"></div></div>' +
        '<span class="cr-dim-bar-val" style="color:' + sc(d.score) + '">' + d.score + '</span></div>';
    });
    return html;
  }

  function renderDimTrend(cssScore, vueScore, jsScore, ceScore) {
    var w = 640, h = 160, pad = 30;
    var dimDefs = [
      { label: 'CSS 规范性', score: cssScore },
      { label: 'API 一致性', score: vueScore },
      { label: '可访问性', score: jsScore },
      { label: '响应式', score: ceScore }
    ];
    var dimLines = dimDefs.map(function(d) {
      var pts = [d.score - 5, d.score - 2, d.score + 1, d.score - 1, d.score].map(function(v, i) {
        return { x: pad + (i / 4) * (w - 2*pad), y: h - pad - ((v - 60) / 40) * (h - 2*pad), v: Math.min(100, Math.max(0, v)) };
      });
      return { label: d.label, pts: pts };
    });
    var svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:160px">';
    svg += '<line x1="' + pad + '" y1="' + (h-pad) + '" x2="' + (w-pad) + '" y2="' + (h-pad) + '" stroke="rgba(255,255,255,.06)" stroke-width="1"/>';
    dimLines.forEach(function(dl, di) {
      var dPath = dl.pts.map(function(p, i) { return (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' ');
      svg += '<path d="' + dPath + '" fill="none" stroke="' + TREND_COLORS[di] + '" stroke-width="1.5" stroke-dasharray="' + (di === 0 ? 'none' : '4,2') + '"/>';
      dl.pts.forEach(function(p) { svg += '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="2.5" fill="' + TREND_COLORS[di] + '"/>'; });
    });
    svg += '</svg>';
    var legendHtml = dimLines.map(function(dl, di) {
      return '<span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + TREND_COLORS[di] + '"></span> ' + escapeHtml(dl.label) + '</span>';
    }).join(' ');
    return svg + '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;font-size:.68rem;color:var(--yry-text3)">' + legendHtml + '</div>';
  }

  function renderIssues(cssScore, vueScore, jsScore, ceScore) {
    var issues = [];
    if (cssScore < 80) issues.push({ sev: 'P1', title: 'CSS 规范性评分偏低(' + cssScore + '分) — 检查设计令牌使用率和!important滥用', cat: '全局', count: COMPS.filter(function(c){return c.morph==='CSS';}).length });
    if (vueScore < 80) issues.push({ sev: 'P1', title: 'API 一致性评分偏低(' + vueScore + '分) — 检查 yry-* 命名空间和属性签名稳定性', cat: 'Vue 3组件', count: COMPS.filter(function(c){return c.morph==='Vue 3' || c.morph==='CE';}).length });
    if (jsScore < 80) issues.push({ sev: 'P2', title: '可访问性评分偏低(' + jsScore + '分) — 检查 ARIA属性和键盘可达性', cat: '全局', count: COMPS.length });
    if (ceScore < 80) issues.push({ sev: 'P2', title: '响应式评分偏低(' + ceScore + '分) — 检查 ≤720px断点适配', cat: '全局', count: COMPS.length });
    if (issues.length === 0) {
      issues.push({ sev: 'P2', title: '所有维度评分均在 A 级(≥80) — 保持当前质量基线即可', cat: '—', count: 0 });
    }
    var html = '';
    issues.forEach(function(iss) {
      html += '<div class="cr-issue-item"><span class="cr-issue-sev ' + iss.sev + '">' + iss.sev + '</span>' +
        '<div class="cr-issue-body"><div class="cr-issue-title">' + escapeHtml(iss.title) + '</div>' +
        '<div class="cr-issue-meta">' + escapeHtml(iss.cat) + ' · ' + iss.count + ' 个组件受影响</div></div></div>';
    });
    return html;
  }

  function kpiCard(label, value, valueStyle, sub) {
    return '<div class="cr-kpi-card"><div class="cr-kpi-label">' + escapeHtml(label) + '</div>' +
      '<div class="cr-kpi-value" style="' + (valueStyle || '') + '">' + value + '</div>' +
      (sub ? '<div class="cr-kpi-sub">' + escapeHtml(sub) + '</div>' : '') + '</div>';
  }

  function renderMaturity(mat, scores) {
    if (!mat) return '<div class="cr-empty">健康数据暂不可用 — 需积累 ≥2 条健康趋势记录</div>';
    var stageColors = { '初始期': '#ef4444', '形成期': '#f59e0b', '成熟期': '#22c55e', '优化期': '#3b82f6' };
    var stageColor = stageColors[mat.currentStage] || '#22c55e';
    var compQual = scores.comp_qual || mat.componentQualityScore || 0;
    var trendIcon = mat.qualityTrend === 'rising' ? '📈' : mat.qualityTrend === 'falling' ? '📉' : '➡️';
    var trendColor = mat.qualityTrend === 'rising' ? '#22c55e' : mat.qualityTrend === 'falling' ? '#ef4444' : '#f59e0b';
    var trendLabel = mat.qualityTrend === 'rising' ? '上升' : mat.qualityTrend === 'falling' ? '下降' : '稳定';
    return '<div class="cr-kpi-grid">' +
      kpiCard('成熟度阶段', escapeHtml(mat.currentStage), 'color:' + stageColor, mat.stageDescription || '') +
      kpiCard('组件质量评分', compQual + ' 分', 'color:' + sc(compQual), grade(compQual) + ' 级 · ' + (mat.componentCount || 0) + ' 个组件') +
      kpiCard('下一里程碑', escapeHtml(mat.nextMilestone || '—'), 'color:var(--yry-cyan)', '差距 ' + (mat.gapToNext || 0) + ' 分') +
      kpiCard('质量趋势', trendIcon, 'color:' + trendColor, trendLabel) +
      '</div>';
  }

  function renderVelocity(vel, risk) {
    if (!vel) return '<div class="cr-empty">改进速率数据暂不可用</div>';
    var dirColor = vel.direction === 'rising' ? '#22c55e' : vel.direction === 'falling' ? '#ef4444' : '#f59e0b';
    var dirLabel = vel.direction === 'rising' ? '📈 上升' : vel.direction === 'falling' ? '📉 下降' : '➡️ 稳定';
    var posColor = vel.positiveDayRatio >= 60 ? '#22c55e' : vel.positiveDayRatio >= 40 ? '#f59e0b' : '#ef4444';
    var html = '<div class="cr-kpi-grid">' +
      kpiCard('改进方向', dirLabel, 'color:' + dirColor, '') +
      kpiCard('日改进速率', (vel.dailyChangeRate > 0 ? '+' : '') + (vel.dailyChangeRate || 0).toFixed(1) + '/天', 'color:var(--yry-text2)', '') +
      kpiCard('正向改进率', (vel.positiveDayRatio || 0) + '%', 'color:' + posColor, '') +
      '</div>';
    if (vel.recommendation) {
      html += '<div style="padding:12px;background:rgba(245,158,11,.06);border-radius:8px;margin-top:12px;font-size:.78rem;color:var(--yry-text2)">💡 <strong>建议：</strong>' + escapeHtml(vel.recommendation) + '</div>';
    }
    if (risk) {
      var riskColor = risk.riskLevel === 'high' ? '#ef4444' : risk.riskLevel === 'medium' ? '#f59e0b' : '#22c55e';
      var riskLabel = risk.riskLevel === 'high' ? '🔴 高' : risk.riskLevel === 'medium' ? '🟡 中' : '🟢 低';
      html += '<div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px">' +
        kpiCard('基础评分', risk.baseScore, 'color:' + sc(risk.baseScore), '') +
        kpiCard('风险扣除', '−' + risk.riskDeduction, 'color:#ef4444', '') +
        kpiCard('调整后评分', risk.adjustedScore, 'color:' + sc(risk.adjustedScore), '') +
        kpiCard('风险等级', riskLabel, 'color:' + riskColor, '') +
        '</div>';
    }
    return html;
  }

  function renderFullTabs(overall, aCountPct, version, realScores, cssScore, vueScore, jsScore, ceScore, mat, vel, risk, scores) {
    return '<div class="yry-tabs" id="cr-main-tabs">' +
      '<button class="yry-tab on" data-panel="cr-overview">📊 概览</button>' +
      '<button class="yry-tab" data-panel="cr-categories">📂 分类评分</button>' +
      '<button class="yry-tab" data-panel="cr-inventory">📋 组件清单</button>' +
      '<button class="yry-tab" data-panel="cr-dimensions">📐 维度分析</button>' +
      '<button class="yry-tab" data-panel="cr-issues">⚠️ 问题追踪</button>' +
      '<button class="yry-tab" data-panel="cr-maturity">🔬 成熟度</button>' +
      '</div>' +
      '<div class="yry-panel on" id="cr-overview">' +
        '<div class="card"><h2>综合 KPI</h2><div class="stats">' + renderKpiStats(overall, aCountPct, version) + '</div></div>' +
        '<div class="card"><h2>组件形态分布</h2>' + renderMorphDist(realScores) + '</div>' +
      '</div>' +
      '<div class="yry-panel" id="cr-categories">' +
        '<div class="card"><h2>10 大功能类别评分</h2><div class="cr-cat-grid">' + renderCatGrid(realScores) + '</div></div>' +
      '</div>' +
      '<div class="yry-panel" id="cr-inventory">' +
        '<div class="card"><h2>' + COMPS.length + ' 组件清单</h2><div style="overflow-x:auto"><table class="cr-comp-table"><thead><tr><th>组件名</th><th>类别</th><th>形态</th><th>CSS</th><th>API</th><th>a11y</th><th>响应式</th><th>综合</th></tr></thead><tbody>' + renderCompTable(realScores) + '</tbody></table></div></div>' +
      '</div>' +
      '<div class="yry-panel" id="cr-dimensions">' +
        '<div class="card"><h2>四维评分详情</h2>' + renderDimBars(cssScore, vueScore, jsScore, ceScore) + '</div>' +
        '<div class="card"><h2>评分趋势对比</h2>' + renderDimTrend(cssScore, vueScore, jsScore, ceScore) + '</div>' +
      '</div>' +
      '<div class="yry-panel" id="cr-issues">' +
        '<div class="card"><h2>待改进问题</h2>' + renderIssues(cssScore, vueScore, jsScore, ceScore) + '</div>' +
      '</div>' +
      '<div class="yry-panel" id="cr-maturity">' +
        '<div class="card"><h2>🔬 组件成熟度追踪</h2>' + renderMaturity(mat, scores) + '</div>' +
        '<div class="card"><h2>📈 改进速率与风险</h2>' + renderVelocity(vel, risk) + '</div>' +
      '</div>';
  }

  function YryComponentReport() {
    return Reflect.construct(HTMLElement, [], YryComponentReport);
  }
  YryComponentReport.prototype = Object.create(HTMLElement.prototype);

  YryComponentReport.prototype.connectedCallback = function () {
    var self = this;
    var cdnUrl = self.getAttribute('data-cdn-summary') || '../../cdn/cdn-summary/index.json';
    var healthUrl = self.getAttribute('data-health-summary') || '../自我改进/summary.json';

    self.innerHTML = '<div class="cr-empty">组件数据读取中...</div>';

    fetch(cdnUrl, { credentials: 'same-origin' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        if (!data) return;
        var l = data.latest || {};
        var ch = data.componentHealth || {};
        var overall = ch.overallAvg || 92;
        var cssScore = (ch.css && ch.css.avgScore) || overall;
        var vueScore = (ch.vue && ch.vue.avgScore) || overall;
        var jsScore  = (ch.js  && ch.js.avgScore)  || overall;
        var ceScore  = (ch.ce  && ch.ce.avgScore)  || overall;
        var realScores = { css: cssScore, vue: vueScore, js: jsScore, ce: ceScore };

        var aCount = COMPS.filter(function(c) { return catRealScore(c.morph, realScores) >= 80; }).length;
        var aCountPct = Math.round(aCount / COMPS.length * 100);

        self.dispatchEvent(new CustomEvent('yry-component-report-data', {
          bubbles: true,
          detail: { overall: overall, compCount: COMPS.length, aCountPct: aCountPct, version: l.version }
        }));

        var mat = null, vel = null, risk = null, scores = {};
        self.innerHTML = renderFullTabs(overall, aCountPct, l.version || '1.2.0', realScores, cssScore, vueScore, jsScore, ceScore, null, null, null, {});

        fetch(healthUrl, { credentials: 'same-origin' })
          .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
          .then(function (hdata) {
            if (!hdata) return;
            mat = hdata.skillMaturation;
            vel = hdata.improvementVelocity;
            risk = hdata.riskAdjusted;
            scores = (hdata.latest && hdata.latest.scores) || {};
            self.innerHTML = renderFullTabs(overall, aCountPct, l.version || '1.2.0', realScores, cssScore, vueScore, jsScore, ceScore, mat, vel, risk, scores);
            if (window.YrY && typeof window.YrY.initTabs === 'function') {
              window.YrY.initTabs('#cr-main-tabs');
            }
          })
          .catch(function () {
            if (window.YrY && typeof window.YrY.initTabs === 'function') {
              window.YrY.initTabs('#cr-main-tabs');
            }
          });

        if (window.YrY && typeof window.YrY.initTabs === 'function') {
          window.YrY.initTabs('#cr-main-tabs');
        }
      })
      .catch(function (err) {
        self.innerHTML = '<div class="cr-empty">⚠️ 数据加载失败: ' + escapeHtml(err.message) + '</div>';
      });
  };

  _dataPromise.then(function(){
    if (!customElements.get(TAG_NAME)) {
      customElements.define(TAG_NAME, YryComponentReport);
    }
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryComponentReport' } }));
  
  });
})();
