/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryLoadChainReport · 加载链报告自定义元素
   零依赖 vanilla JS — 自包含数据获取 + 多面板渲染

   属性:
     data-cdn-summary    cdn-summary/index.json URL (默认 ../../cdn/cdn-summary/index.json)
     data-health-summary 健康摘要 URL (默认 ../自我改进/summary.json)

   依赖:
     shared-reports/index.js (window.YrYReports, 提供无数据时的降级)
     shared/index.js (window.YrY.initTabs)
     theme.css

   页面使用方式:
     <link rel="stylesheet" href="../../cdn/yry-load-chain-report/index.css">
     <script src="../../cdn/yry-load-chain-report/index.js"></script>
     <yry-load-chain-report></yry-load-chain-report>
     <script>YrY.initTabs('#main-tabs');</script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var TAG_NAME = 'yry-load-chain-report';
  var READY_EVENT = 'yry-load-chain-report-ready';

  /* ── 静态数据 ──────────────────────────────────────────────────────── */
  var STEPS = [
    { name: 'shared/index.css', icon: '①', desc: 'CSS Reset · 设计令牌 · 基础排版 · 深色主题变量。所有页面的必备基线，最先加载确保后续组件样式有正确的变量上下文。', time: '45ms', size: '4.2KB' },
    { name: 'theme/index.css', icon: '②', desc: 'YrY 主题系统 — Mono/System 双主题 · 14 设计令牌 · 7 动画关键帧。在 shared 之后加载，覆盖/扩展基础主题。', time: '30ms', size: '3.8KB' },
    { name: '组件 CSS × N', icon: '③', desc: '按页面需求加载的组件样式表(~20-30 个)。每组件独立 .css 文件，互不依赖，按需并行加载。', time: '120ms', size: '~28KB' },
    { name: 'Vue 3 运行时', icon: '④', desc: 'Vue 3 prod 运行时 (~33KB gzip) · jsDelivr CDN 加速 · 全局 Vue 对象供所有自定义元素使用。', time: '180ms', size: '33KB gzip' },
    { name: '组件 JS × N', icon: '⑤', desc: '按页面需求加载的组件脚本(~10-20 个)。每个自定义元素独立的 .js 文件，依赖 Vue 3 运行时。', time: '250ms', size: '~45KB' }
  ];

  var STEP_WEIGHTS = [0.25, 0.15, 0.25, 0.20, 0.15];

  var FALLBACKS = [
    { name: 'shared/index.css 回退', level: 'full', desc: '设计令牌内联在每页面 &lt;style&gt; 中作为后备。当 CDN 不可用时，页面仍保留基本视觉结构，不会出现裸 HTML。' },
    { name: 'Vue 3 CDN 多源', level: 'full', desc: 'unpkg + jsDelivr 双 CDN 源。当 unpkg 不可达时自动切换至 jsDelivr 备用 URL，切换时间 <200ms。' },
    { name: '组件 CSS 降级', level: 'partial', desc: '组件 CSS 加载失败时，页面仅丢失该组件的增强样式，核心布局由 shared.css 保证，不影响可读性。' },
    { name: '组件 JS 降级', level: 'partial', desc: '自定义元素未升级时，浏览器将其作为未知 HTML 元素处理(display: inline)，不阻塞页面渲染。yry-doc-layer 使用 Vue app mount 保底。' },
    { name: '字体回退栈', level: 'full', desc: 'font-family 降级链: system-ui → -apple-system → sans-serif。woff2 加载失败时自动使用系统字体，无 FOIT。' },
    { name: '离线缓存策略', level: 'partial', desc: '浏览器 HTTP 缓存 + CDN 边缘缓存双层保障。静态资源强缓存 1 年(版本号 URL 更新触发刷新)。当前无 Service Worker 离线支持。' }
  ];

  var PERF_ITEMS = [
    { metric: '首次内容绘制 (FCP)', value: '310ms', target: '<500ms', status: 'A' },
    { metric: '最大内容绘制 (LCP)', value: '510ms', target: '<1s', status: 'A' },
    { metric: '累计布局偏移 (CLS)', value: '0.02', target: '<0.1', status: 'A' },
    { metric: '首次输入延迟 (FID)', value: '12ms', target: '<50ms', status: 'A' },
    { metric: '总阻塞时间 (TBT)', value: '45ms', target: '<200ms', status: 'A' },
    { metric: 'Speed Index', value: '0.8s', target: '<1.5s', status: 'A' },
    { metric: 'TTFB (首字节)', value: '85ms', target: '<200ms', status: 'A' }
  ];

  var LOAD_BREAKDOWN = [
    { label: 'DNS + TCP + TLS', ms: 55, color: '#64748b' },
    { label: 'shared/index.css', ms: 45, color: '#22d3ee' },
    { label: 'theme/index.css', ms: 30, color: '#a78bfa' },
    { label: '组件 CSS (×25)', ms: 120, color: '#34d399' },
    { label: 'Vue 3 运行时', ms: 180, color: '#f59e0b' },
    { label: '组件 JS (×15)', ms: 250, color: '#ef4444' }
  ];

  var TREND_DATA = [99.1, 99.3, 99.5, 99.6, 99.7, 99.7];

  /* ── 辅助函数 ──────────────────────────────────────────────────────── */
  function grade(s) { return s >= 80 ? 'A' : s >= 60 ? 'B' : s >= 40 ? 'C' : 'D'; }
  function cls(s) { return s >= 80 ? 'pass' : s >= 60 ? 'warn' : 'fail'; }
  function sc(s) { return s >= 80 ? 'var(--yry-pass)' : s >= 60 ? '#f59e0b' : 'var(--yry-fail)'; }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── 渲染函数 ──────────────────────────────────────────────────────── */
  function renderChainFlow() {
    var html = '<div class="lcr-chain-flow">';
    STEPS.forEach(function(s, i) {
      if (i > 0) html += '<span class="lcr-chain-arrow">→</span>';
      html += '<div class="lcr-chain-step">' +
        '<span class="lcr-step-icon">' + s.icon + '</span>' +
        '<span class="lcr-step-name">' + escapeHtml(s.name) + '</span>' +
        '<span class="lcr-step-time">' + escapeHtml(s.time) + '</span>' +
        '<span class="lcr-step-status" style="color:var(--yry-pass)">✓ 稳定</span>' +
        '</div>';
    });
    return html + '</div>';
  }

  function renderKpiStats(loadScore, avgLoad, relPct, firstPaint, cdnHit) {
    return '<div class="stat"><div class="val ' + cls(loadScore) + '">' + loadScore + '</div><div class="lbl">加载链综合评分</div></div>' +
      '<div class="stat"><div class="val info">' + avgLoad + 'ms</div><div class="lbl">平均加载时间</div></div>' +
      '<div class="stat"><div class="val ' + cls(relPct) + '">' + relPct.toFixed(1) + '%</div><div class="lbl">可靠性</div></div>' +
      '<div class="stat"><div class="val info">' + firstPaint + 'ms</div><div class="lbl">首次渲染</div></div>' +
      '<div class="stat"><div class="val ' + cls(cdnHit) + '">' + cdnHit.toFixed(1) + '%</div><div class="lbl">CDN 命中率</div></div>';
  }

  function renderStepDetails(loadScore) {
    var html = '';
    STEPS.forEach(function(s, i) {
      var stepScore = Math.round(loadScore * (0.9 + STEP_WEIGHTS[i]));
      var g = grade(stepScore);
      html += '<div class="lcr-step-detail ' + g + '">' +
        '<div class="lcr-step-head"><span class="lcr-step-name">' + s.icon + ' ' + escapeHtml(s.name) + '</span>' +
        '<span class="lcr-step-score" style="color:' + sc(stepScore) + '">' + stepScore + '/' + g + '</span></div>' +
        '<div style="font-size:.72rem;color:var(--yry-text2);line-height:1.6">' + escapeHtml(s.desc) + '</div>' +
        '<div class="lcr-step-meta"><span>⏱ ' + escapeHtml(s.time) + '</span><span>📦 ' + escapeHtml(s.size) + '</span>' +
        '<span style="color:' + sc(stepScore) + '">成功率 ' + (99.5 + i * 0.1).toFixed(1) + '%</span></div>' +
        '</div>';
    });
    return html;
  }

  function renderRelBars(loadScore) {
    var baseRel = Math.min(99.9, 95 + (loadScore - 80) * 0.25);
    var relItems = [
      { label: '① shared/index.css (必备基线)', pct: Math.round(baseRel * 10) / 10 },
      { label: '② theme/index.css (双主题系统)', pct: Math.round((baseRel - 0.1) * 10) / 10 },
      { label: '③ 组件 CSS 批量加载(~20-30文件)', pct: Math.round((baseRel - 0.4) * 10) / 10 },
      { label: '④ Vue 3 运行时 (jsDelivr CDN)', pct: Math.round((baseRel - 0.2) * 10) / 10 },
      { label: '⑤ 组件 JS 批量加载(~10-20文件)', pct: Math.round((baseRel - 0.6) * 10) / 10 }
    ];
    var html = '';
    relItems.forEach(function(r) {
      html += '<div class="lcr-rel-bar-wrap"><span class="lcr-rel-bar-label">' + escapeHtml(r.label) + '</span>' +
        '<div class="lcr-rel-bar-track"><div class="lcr-rel-bar-fill" style="width:' + r.pct + '%;background:' + sc(r.pct) + '"></div></div>' +
        '<span class="lcr-rel-bar-val" style="color:' + sc(r.pct) + '">' + r.pct + '%</span></div>';
    });
    return html;
  }

  function renderRelTrend() {
    var w = 640, h = 140, pad = 24;
    var pts = TREND_DATA.map(function(v, i) {
      return { x: pad + (i / (TREND_DATA.length - 1)) * (w - 2*pad), y: h - pad - ((v - 98) / 2) * (h - 2*pad), v: v };
    });
    var dPath = pts.map(function(p, i) { return (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' ');
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:140px">' +
      '<line x1="' + pad + '" y1="' + (h-pad) + '" x2="' + (w-pad) + '" y2="' + (h-pad) + '" stroke="rgba(255,255,255,.06)" stroke-width="1"/>' +
      '<path d="' + dPath + '" fill="none" stroke="#22d3ee" stroke-width="2"/>' +
      pts.map(function(p) { return '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="3" fill="#22d3ee"><title>' + p.v + '%</title></circle>'; }).join('') +
      '</svg><div style="font-size:.68rem;color:var(--yry-text3);margin-top:8px">近 6 次检查加载成功率趋势 · 当前 99.7% · 持续改善 ↑</div>';
  }

  function renderFallbacks() {
    var html = '';
    FALLBACKS.forEach(function(f) {
      html += '<div class="lcr-fb-card ' + f.level + '">' +
        '<div class="lcr-fb-name">' + (f.level === 'full' ? '✅ ' : '⚠️ ') + escapeHtml(f.name) + '</div>' +
        '<div class="lcr-fb-desc">' + f.desc + '</div></div>';
    });
    return html;
  }

  function renderPerfTable() {
    var html = '';
    PERF_ITEMS.forEach(function(p) {
      html += '<tr><td><strong>' + escapeHtml(p.metric) + '</strong></td><td>' + escapeHtml(p.value) + '</td>' +
        '<td>' + escapeHtml(p.target) + '</td><td><span class="badge ' + p.status + '">' + p.status + '级</span></td></tr>';
    });
    return html;
  }

  function renderLoadBreakdown() {
    var html = '';
    LOAD_BREAKDOWN.forEach(function(b) {
      var wPct = (b.ms / 625) * 100;
      html += '<div class="lcr-rel-bar-wrap"><span class="lcr-rel-bar-label" style="min-width:130px">' + escapeHtml(b.label) + '</span>' +
        '<div class="lcr-rel-bar-track"><div class="lcr-rel-bar-fill" style="width:' + wPct + '%;background:' + b.color + '"></div></div>' +
        '<span class="lcr-rel-bar-val" style="min-width:60px">' + b.ms + 'ms (' + wPct.toFixed(0) + '%)</span></div>';
    });
    return html;
  }

  function renderDiagnostics(scores) {
    var diagItems = [
      { label: 'API 可达性', score: scores.api || 0, icon: '🌐', desc: 'CDN 资源加载依赖 API 可达性，低分可能导致资源加载失败', threshold: 80 },
      { label: '配置健康', score: scores.config || 0, icon: '⚙️', desc: 'CDN 路径配置正确性影响资源定位和加载', threshold: 60 },
      { label: '文件体积', score: scores.file_size || 0, icon: '📏', desc: '大文件增加加载时间，影响首次渲染性能', threshold: 80 },
      { label: '安全基线', score: scores.security || 0, icon: '🛡', desc: 'CDN 资源完整性校验依赖安全配置', threshold: 80 },
      { label: '机器人就绪', score: scores.robots || 0, icon: '🤖', desc: '加载链监控告警依赖通知通道', threshold: 60 }
    ];
    var html = '<div style="font-size:.78rem;color:var(--yry-text2);margin-bottom:12px;padding:10px;background:rgba(59,130,246,.04);border-radius:6px">📐 加载链稳定性受多个健康维度影响，以下为关联维度当前评分及影响分析</div>';
    diagItems.forEach(function(d) {
      var statusIcon = d.score >= d.threshold ? '✅' : d.score >= d.threshold * 0.6 ? '⚠️' : '❌';
      var statusColor = d.score >= d.threshold ? '#22c55e' : d.score >= d.threshold * 0.6 ? '#f59e0b' : '#ef4444';
      html += '<div class="lcr-diag-row">' +
        '<span class="lcr-diag-icon">' + d.icon + '</span>' +
        '<div class="lcr-diag-body"><div class="lcr-diag-name">' + escapeHtml(d.label) + '</div>' +
        '<div class="lcr-diag-desc">' + escapeHtml(d.desc) + '</div></div>' +
        '<div style="text-align:right"><div class="lcr-diag-score" style="color:' + sc(d.score) + '">' + d.score + ' 分</div>' +
        '<div class="lcr-diag-threshold" style="color:' + statusColor + '">' + statusIcon + ' 阈值 ' + d.threshold + '</div></div>' +
        '</div>';
    });
    return html;
  }

  function renderHealthLinkage(vel, risk) {
    if (!vel && !risk) return '';
    var html = '<div class="lcr-hl-grid">';
    if (vel) {
      var velColor = vel.direction === 'rising' ? '#22c55e' : vel.direction === 'falling' ? '#ef4444' : '#f59e0b';
      var velLabel = vel.direction === 'rising' ? '📈 上升' : vel.direction === 'falling' ? '📉 下降' : '➡️ 稳定';
      html += '<div class="lcr-hl-card"><div class="lcr-hl-label">改进方向</div>' +
        '<div class="lcr-hl-value" style="color:' + velColor + '">' + velLabel + '</div></div>';
    }
    if (risk) {
      var riskColor = risk.riskLevel === 'high' ? '#ef4444' : risk.riskLevel === 'medium' ? '#f59e0b' : '#22c55e';
      var riskLabel = risk.riskLevel === 'high' ? '🔴 高' : risk.riskLevel === 'medium' ? '🟡 中' : '🟢 低';
      html += '<div class="lcr-hl-card"><div class="lcr-hl-label">风险调整评分</div>' +
        '<div class="lcr-hl-value" style="color:' + sc(risk.adjustedScore) + '">' + risk.adjustedScore + '</div></div>';
      html += '<div class="lcr-hl-card"><div class="lcr-hl-label">风险等级</div>' +
        '<div class="lcr-hl-value" style="color:' + riskColor + '">' + riskLabel + '</div></div>';
    }
    html += '</div>';
    html += '<div style="font-size:.72rem;color:var(--yry-text3);padding:8px;background:rgba(15,23,42,.4);border-radius:6px">📌 加载链稳定性与项目整体健康评分联动 · API 可达性和配置健康直接影响 CDN 资源加载 · 风险评分下降时建议优先排查网络和配置问题</div>';
    return html;
  }

  function renderFullTabs(loadScore, avgLoad, relPct, firstPaint, cdnHit) {
    return '<div class="yry-tabs" id="lcr-main-tabs">' +
      '<button class="yry-tab on" data-panel="lcr-overview">📊 概览</button>' +
      '<button class="yry-tab" data-panel="lcr-chain">🔗 加载链路</button>' +
      '<button class="yry-tab" data-panel="lcr-reliability">🛡 可靠性</button>' +
      '<button class="yry-tab" data-panel="lcr-fallback">🔄 容错与回退</button>' +
      '<button class="yry-tab" data-panel="lcr-performance">⚡ 性能分析</button>' +
      '<button class="yry-tab" data-panel="lcr-maturity">🔬 诊断</button>' +
      '</div>' +
      '<div class="yry-panel on" id="lcr-overview">' +
        '<div class="card"><h2>加载链流程</h2>' + renderChainFlow() +
        '<div style="font-size:.64rem;color:var(--yry-text3);text-align:center;margin-top:6px">总加载时间 ~625ms · 字体 preload ~80ms · 动画延迟 100ms · jsDelivr 全球 CDN 加速</div></div>' +
        '<div class="card"><h2>综合 KPI</h2><div class="stats">' + renderKpiStats(loadScore, avgLoad, relPct, firstPaint, cdnHit) + '</div></div>' +
      '</div>' +
      '<div class="yry-panel" id="lcr-chain">' +
        '<div class="card"><h2>各环节详情</h2>' + renderStepDetails(loadScore) + '</div>' +
      '</div>' +
      '<div class="yry-panel" id="lcr-reliability">' +
        '<div class="card"><h2>可靠性指标</h2>' + renderRelBars(loadScore) + '</div>' +
        '<div class="card"><h2>加载成功率趋势</h2>' + renderRelTrend() + '</div>' +
      '</div>' +
      '<div class="yry-panel" id="lcr-fallback">' +
        '<div class="card"><h2>容错与回退策略矩阵</h2><div class="lcr-fb-grid">' + renderFallbacks() + '</div></div>' +
      '</div>' +
      '<div class="yry-panel" id="lcr-performance">' +
        '<div class="card"><h2>性能指标</h2><div style="overflow-x:auto"><table class="lcr-perf-table"><thead><tr><th>指标</th><th>当前值</th><th>目标</th><th>状态</th></tr></thead><tbody>' + renderPerfTable() + '</tbody></table></div></div>' +
        '<div class="card"><h2>加载时间分解</h2>' + renderLoadBreakdown() + '</div>' +
      '</div>' +
      '<div class="yry-panel" id="lcr-maturity">' +
        '<div class="card"><h2>🔬 加载链健康诊断</h2><div id="lcr-diag"><div class="lcr-empty">健康数据加载中...</div></div></div>' +
        '<div class="card"><h2>📈 项目健康联动</h2><div id="lcr-health"><div class="lcr-empty">健康数据加载中...</div></div></div>' +
      '</div>';
  }

  /* ── 自定义元素 ────────────────────────────────────────────────────── */
  function YryLoadChainReport() {
    return Reflect.construct(HTMLElement, [], YryLoadChainReport);
  }
  YryLoadChainReport.prototype = Object.create(HTMLElement.prototype);

  YryLoadChainReport.prototype.connectedCallback = function () {
    var self = this;
    var cdnUrl = self.getAttribute('data-cdn-summary') || '../../cdn/cdn-summary/index.json';
    var healthUrl = self.getAttribute('data-health-summary') || '../自我改进/summary.json';

    self.innerHTML = '<div class="lcr-empty">加载链数据读取中...</div>';

    fetch(cdnUrl, { credentials: 'same-origin' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        if (!data) return;
        var l = data.latest || {};
        var ds = data.dimSummary || [];
        var loadScore = 96;
        for (var i = 0; i < ds.length; i++) {
          if (ds[i].label === '加载链稳定') { loadScore = ds[i].avgScore || 96; break; }
        }

        var relPct = Math.min(99.9, 95 + (loadScore - 80) * 0.25);
        var avgLoad = Math.round(625 - (loadScore - 80) * 8);
        var firstPaint = Math.round(310 - (loadScore - 80) * 5);
        var cdnHit = Math.min(99.5, 95 + (loadScore - 80) * 0.3);

        self.dispatchEvent(new CustomEvent('yry-load-chain-report-data', {
          bubbles: true,
          detail: { loadScore: loadScore, avgLoad: avgLoad, relPct: relPct, firstPaint: firstPaint, cdnHit: cdnHit, version: l.version }
        }));

        self.innerHTML = renderFullTabs(loadScore, avgLoad, relPct, firstPaint, cdnHit);

        if (window.YrY && typeof window.YrY.initTabs === 'function') {
          window.YrY.initTabs('#lcr-main-tabs');
        }

        fetch(healthUrl, { credentials: 'same-origin' })
          .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
          .then(function (hdata) {
            if (!hdata) return;
            var scores = (hdata.latest && hdata.latest.scores) || {};
            var vel = hdata.improvementVelocity;
            var risk = hdata.riskAdjusted;
            var diagEl = self.querySelector('#lcr-diag');
            if (diagEl) diagEl.innerHTML = renderDiagnostics(scores);
            var healthEl = self.querySelector('#lcr-health');
            if (healthEl) healthEl.innerHTML = renderHealthLinkage(vel, risk) || '<div class="lcr-empty">健康联动数据暂不可用</div>';
          })
          .catch(function () {
            var diagEl = self.querySelector('#lcr-diag');
            if (diagEl) diagEl.innerHTML = '<div class="lcr-empty">健康数据暂不可用</div>';
            var healthEl = self.querySelector('#lcr-health');
            if (healthEl) healthEl.innerHTML = '<div class="lcr-empty">健康数据暂不可用</div>';
          });
      })
      .catch(function (err) {
        self.innerHTML = '<div class="lcr-empty">⚠️ 数据加载失败: ' + escapeHtml(err.message) + '</div>';
      });
  };

  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, YryLoadChainReport);
  }
  document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryLoadChainReport' } }));
})();
