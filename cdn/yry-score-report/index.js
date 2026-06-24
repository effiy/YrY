/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryScoreReport · 评分报告自定义元素
   零依赖 vanilla JS — 自包含数据获取 + 多面板渲染

   属性:
     data-src   score-report.json 的 URL (默认 score-report.json)

   依赖:
     theme.css (设计令牌)

   页面使用方式:
     <link rel="stylesheet" href="../../cdn/yry-score-report/index.css">
     <script src="../../cdn/yry-score-report/index.js"></script>
     <yry-score-report data-src="score-report.json"></yry-score-report>

   事件:
     yry-score-report-ready   组件已注册
     yry-score-report-error   数据加载失败 (detail: { error })
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var TAG_NAME = 'yry-score-report';
  var READY_EVENT = 'yry-score-report-ready';
  var ERROR_EVENT = 'yry-score-report-error';

  /* ── 评级阈值 ──────────────────────────────────────────────────────── */
  var GRADE_THRESHOLDS = [
    { grade: 'A', min: 90 },
    { grade: 'B', min: 75 },
    { grade: 'C', min: 60 },
    { grade: 'D', min: 0 }
  ];

  function gradeColor(score) {
    if (score >= 90) return 'grade-A';
    if (score >= 75) return 'grade-B';
    if (score >= 60) return 'grade-C';
    return 'grade-D';
  }

  function gradeLabel(score) {
    for (var i = 0; i < GRADE_THRESHOLDS.length; i++) {
      if (score >= GRADE_THRESHOLDS[i].min) return GRADE_THRESHOLDS[i].grade;
    }
    return 'D';
  }

  function statusClass(s) {
    if (s === 'critical') return 'status-critical';
    if (s === 'warn') return 'status-warn';
    return 'status-ok';
  }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── 渲染函数 ──────────────────────────────────────────────────────── */
  function renderHeader(meta) {
    return '<div class="sr-header">' +
      '<div class="sr-title">' + escapeHtml(meta.title || '健康评分报告') +
      ' <span style="font-size:.72rem;color:var(--yry-text3);">v' + escapeHtml(meta.version || '—') + '</span></div>' +
      '<div class="sr-date">生成于 ' + escapeHtml(meta.date || '—') + ' · ' + (meta.dataPoints || 0) + ' 数据点</div>' +
      '</div>';
  }

  function renderOverviewGrid(c, diag, arch, contrib) {
    var archScore = arch.grade === 'A' ? 95 : arch.grade === 'B' ? 80 : arch.grade === 'C' ? 50 : 30;
    var diagColor = diag.triggered > 1 ? '#f87171' : diag.triggered > 0 ? '#fbbf24' : '#4ade80';
    var archPassed = arch.passed || 0;
    var archTotal = archPassed + (arch.failed || 0);
    return '<div class="sr-grid">' +
      '<div class="sr-cell"><div class="sr-cell-label">综合评分</div>' +
        '<div class="sr-cell-value ' + gradeColor(c.score || 0) + '">' + (c.score || '—') + '</div>' +
        '<div class="sr-cell-sub">' + escapeHtml(c.grade || '—') + '级 · ' + escapeHtml(c.label || '') + '</div></div>' +
      '<div class="sr-cell"><div class="sr-cell-label">诊断触发</div>' +
        '<div class="sr-cell-value" style="color:' + diagColor + '">' + (diag.triggered || 0) + '/' + (diag.total || 8) + '</div>' +
        '<div class="sr-cell-sub">触发率 ' + (diag.rate || 0) + '%</div></div>' +
      '<div class="sr-cell"><div class="sr-cell-label">架构合规</div>' +
        '<div class="sr-cell-value ' + gradeColor(archScore) + '">' + escapeHtml(arch.grade || '—') + '级</div>' +
        '<div class="sr-cell-sub">' + archPassed + '/' + archTotal + ' 通过</div></div>' +
      '<div class="sr-cell"><div class="sr-cell-label">拖累总分</div>' +
        '<div class="sr-cell-value" style="color:#f87171">-' + (contrib.dragTotal || 0).toFixed(1) + '</div>' +
        '<div class="sr-cell-sub">可改进空间</div></div>' +
      '</div>';
  }

  function renderCategoryGrid(cats) {
    var keys = Object.keys(cats);
    if (keys.length === 0) return '';
    var html = '<div class="sr-grid" style="grid-template-columns:repeat(auto-fill, minmax(140px, 1fr));">';
    for (var i = 0; i < keys.length; i++) {
      var cat = cats[keys[i]];
      html += '<div class="sr-cell"><div class="sr-cell-label">' + escapeHtml(keys[i]) + '</div>' +
        '<div class="sr-cell-value ' + gradeColor(cat.score) + '" style="font-size:1.1rem;">' + cat.score + '</div>' +
        '<div class="sr-cell-sub">' + cat.dimCount + ' 维度 · 权重' + cat.weight + '</div></div>';
    }
    return html + '</div>';
  }

  function renderBreakdownTable(b) {
    var html = '<h2>📐 维度分解</h2>';
    html += '<table class="breakdown-table"><thead><tr><th>维度</th><th>类别</th><th>评分</th><th>等级</th><th>权重</th><th>状态</th><th>差距</th><th>建议</th></tr></thead><tbody>';
    for (var i = 0; i < b.length; i++) {
      var dim = b[i];
      var gapColor = dim.gap > 50 ? '#f87171' : dim.gap > 20 ? '#fbbf24' : '#6b708a';
      html += '<tr>';
      html += '<td>' + escapeHtml(dim.label) + '</td>';
      html += '<td style="color:var(--yry-text3)">' + escapeHtml(dim.category || '—') + '</td>';
      html += '<td class="' + gradeColor(dim.score) + '" style="font-weight:700;">' + dim.score + '</td>';
      html += '<td class="' + gradeColor(dim.score) + '">' + escapeHtml(dim.grade || gradeLabel(dim.score)) + '</td>';
      html += '<td style="color:var(--yry-text3)">' + escapeHtml(dim.weight || '—') + '</td>';
      html += '<td class="' + statusClass(dim.status) + '">' + escapeHtml(dim.status || 'ok') + '</td>';
      html += '<td style="color:' + gapColor + '">' + (dim.gap || 0) + '</td>';
      html += '<td style="font-size:.7rem;color:var(--yry-text3)">' + escapeHtml(dim.recommendation || '—') + '</td>';
      html += '</tr>';
    }
    return html + '</tbody></table>';
  }

  function renderRecommendations(recs) {
    if (!recs || recs.length === 0) return '';
    var html = '<h2>🔧 改进建议</h2>';
    for (var j = 0; j < recs.length; j++) {
      var rec = recs[j];
      html += '<div class="rec-card ' + escapeHtml(rec.priority || 'P1') + '">';
      html += '<div class="rec-dim">' + escapeHtml(rec.priority || '') + ' · ' + escapeHtml(rec.dim || '') + '</div>';
      html += '<div class="rec-action">' + escapeHtml(rec.action || '') + '</div>';
      html += '</div>';
    }
    return html;
  }

  function renderArchitecture(arch) {
    if (!arch.dims || arch.dims.length === 0) return '';
    var html = '<h2>🏗 架构合规检查</h2>';
    html += '<div class="arch-dims">';
    for (var k = 0; k < arch.dims.length; k++) {
      var ad = arch.dims[k];
      var statusColor = ad.passed ? '#4ade80' : '#f87171';
      html += '<div class="arch-dim ' + (ad.passed ? 'pass' : 'fail') + '">';
      html += '<span class="arch-dim-name">' + escapeHtml(ad.dim) + '</span>';
      html += '<span class="arch-dim-status" style="color:' + statusColor + '">' + (ad.passed ? '✓ 通过' : '✗ 失败') + '</span>';
      html += '</div>';
    }
    return html + '</div>';
  }

  function renderSummary(summary) {
    var html = '';
    if (summary.summary) {
      html += '<h2>📝 AI 摘要</h2>';
      html += '<div class="sr-summary-box">' + escapeHtml(summary.summary) + '</div>';
    }
    if (summary.highlights || summary.risks) {
      html += '<div class="sr-hl-grid">';
      if (summary.highlights) {
        html += '<div class="sr-hl-card highlights"><div class="sr-hl-title">✨ 表现最佳</div>';
        for (var hi = 0; hi < summary.highlights.length; hi++) {
          html += '<div class="sr-hl-item">' + escapeHtml(summary.highlights[hi]) + '</div>';
        }
        html += '</div>';
      }
      if (summary.risks) {
        html += '<div class="sr-hl-card risks"><div class="sr-hl-title">⚠️ 风险项</div>';
        for (var ri = 0; ri < summary.risks.length; ri++) {
          html += '<div class="sr-hl-item">' + escapeHtml(summary.risks[ri]) + '</div>';
        }
        html += '</div>';
      }
      html += '</div>';
    }
    return html;
  }

  function renderAll(d) {
    var c = d.composite || {};
    var b = d.breakdown || [];
    var recs = d.recommendations || [];
    var arch = d.architecture || {};
    var diag = d.diagnostics || {};
    var contrib = d.contribution || {};
    var cats = d.categories || {};
    var summary = d.summary || {};
    var meta = d.meta || {};

    var html = '';
    html += renderHeader(meta);
    html += renderOverviewGrid(c, diag, arch, contrib);
    html += renderCategoryGrid(cats);
    html += renderBreakdownTable(b);
    html += renderRecommendations(recs);
    html += renderArchitecture(arch);
    html += renderSummary(summary);
    return html;
  }

  /* ── 自定义元素定义 ────────────────────────────────────────────────── */
  function YryScoreReport() {
    return Reflect.construct(HTMLElement, [], YryScoreReport);
  }
  YryScoreReport.prototype = Object.create(HTMLElement.prototype);
  YryScoreReport.prototype.connectedCallback = function () {
    var self = this;
    var src = self.getAttribute('data-src') || 'score-report.json';
    self.innerHTML = '<div class="sr-loading">加载评分数据…</div>';

    fetch(src, { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + r.statusText);
        return r.json();
      })
      .then(function (d) {
        self.innerHTML = renderAll(d || {});
      })
      .catch(function (err) {
        self.innerHTML = '<div class="sr-loading">⚠️ 无法加载评分数据: ' + escapeHtml(err.message) +
          '<br><small>请确认 ' + escapeHtml(src) + ' 存在且可访问</small></div>';
        document.dispatchEvent(new CustomEvent(ERROR_EVENT, { detail: { error: err } }));
      });
  };

  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, YryScoreReport);
  }
  document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryScoreReport' } }));
})();
