/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryArchAnalysis · 项目架构分析报告自定义元素
   零依赖 vanilla JS — 自包含数据获取 + 多面板渲染

   属性:
     data-src   reports.json URL (默认 reports.json)

   依赖:
     theme.css

   页面使用方式:
     <link rel="stylesheet" href="../../cdn/yry-arch-analysis/index.css">
     <script src="../../cdn/yry-arch-analysis/index.js"></script>
     <yry-arch-analysis data-src="reports.json"></yry-arch-analysis>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var TAG_NAME = 'yry-arch-analysis';
  var READY_EVENT = 'yry-arch-analysis-ready';
  var ERROR_EVENT = 'yry-arch-analysis-error';

  function gradeColor(score) {
    if (score >= 90) return '#4ade80';
    if (score >= 75) return '#60a5fa';
    if (score >= 60) return '#fbbf24';
    return '#f87171';
  }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderHeader(d) {
    return '<div class="aa-header">' +
      '<h1>🏗 项目架构分析报告</h1>' +
      '<div class="aa-date">' + escapeHtml(d.date) + ' · 综合评分 ' + d.overallScore +
      ' (' + escapeHtml(d.overallGrade) + '级) · ' + d.checksPassed + '/' + d.checksTotal + ' 检查通过</div>' +
      '</div>';
  }

  function renderStats(d) {
    return '<div class="aa-grid-2">' +
      '<div class="aa-stat-card"><div class="aa-stat-label">文件总数</div><div class="aa-stat-value">' + d.fileCount + '</div><div class="aa-stat-sub">' + d.totalLines.toLocaleString() + ' 行</div></div>' +
      '<div class="aa-stat-card"><div class="aa-stat-label">JS 文件</div><div class="aa-stat-value">' + d.jsFiles + '</div><div class="aa-stat-sub">' + d.jsLines.toLocaleString() + ' 行</div></div>' +
      '<div class="aa-stat-card"><div class="aa-stat-label">Import 数</div><div class="aa-stat-value">' + d.importCount + '</div><div class="aa-stat-sub">模块依赖边</div></div>' +
      '<div class="aa-stat-card"><div class="aa-stat-label">Skills</div><div class="aa-stat-value">' + d.skills + '</div><div class="aa-stat-sub">' + d.rules + ' Rules · ' + d.agents + ' Agents</div></div>' +
      '<div class="aa-stat-card"><div class="aa-stat-label">lib/ 文件</div><div class="aa-stat-value">' + d.libFiles + '</div><div class="aa-stat-sub">上限 20</div></div>' +
      '</div>';
  }

  function renderFileTypes(d) {
    if (!d.fileTypes) return '';
    var html = '<h2>📁 文件类型分布</h2><div class="aa-file-type-grid">';
    var types = d.fileTypes;
    for (var ext in types) {
      if (!Object.prototype.hasOwnProperty.call(types, ext)) continue;
      html += '<div class="aa-file-type-card"><div class="aa-file-type-ext">.' + escapeHtml(ext) + '</div><div class="aa-file-type-count">' + types[ext] + '</div></div>';
    }
    return html + '</div>';
  }

  function renderDimensions(d) {
    if (!d.dimensions) return '';
    var html = '<h2>📐 架构合规维度</h2><div class="aa-dim-grid">';
    for (var i = 0; i < d.dimensions.length; i++) {
      var dim = d.dimensions[i];
      html += '<div class="aa-dim-card ' + escapeHtml(dim.status || 'pass') + '">' +
        '<span class="aa-dim-name">' + escapeHtml(dim.name) + '</span>' +
        '<span class="aa-dim-score" style="color:' + gradeColor(dim.score) + '">' + dim.score + '</span>' +
        '</div>';
    }
    return html + '</div>';
  }

  function renderIssues(d) {
    if (!d.issues || d.issues.length === 0) return '';
    var html = '<h2>⚠️ 发现项</h2>';
    for (var j = 0; j < d.issues.length; j++) {
      var iss = d.issues[j];
      html += '<div class="aa-issue-card ' + escapeHtml(iss.level || 'info') + '">';
      html += '<div class="aa-issue-msg">' + escapeHtml(iss.msg) + '</div>';
      if (iss.file) html += '<div class="aa-issue-file">📄 ' + escapeHtml(iss.file) + '</div>';
      html += '</div>';
    }
    return html;
  }

  function renderFailedDims(d) {
    if (!d.failedDims || d.failedDims.length === 0) return '';
    var html = '<h2>🔴 未通过维度</h2>';
    for (var k = 0; k < d.failedDims.length; k++) {
      html += '<div class="aa-issue-card warn"><div class="aa-issue-msg">' + escapeHtml(d.failedDims[k]) + ' — 需修复</div></div>';
    }
    return html;
  }

  function renderAll(d) {
    return renderHeader(d) + renderStats(d) + renderFileTypes(d) + renderDimensions(d) + renderIssues(d) + renderFailedDims(d);
  }

  function YryArchAnalysis() {
    return Reflect.construct(HTMLElement, [], YryArchAnalysis);
  }
  YryArchAnalysis.prototype = Object.create(HTMLElement.prototype);
  YryArchAnalysis.prototype.connectedCallback = function () {
    var self = this;
    var src = self.getAttribute('data-src') || 'reports.json';
    self.innerHTML = '<div class="aa-loading">加载项目分析数据…</div>';

    fetch(src, { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + r.statusText);
        return r.json();
      })
      .then(function (reports) {
        if (!reports || !reports.length) {
          self.innerHTML = '<div class="aa-loading">无分析报告数据</div>';
          return;
        }
        self.innerHTML = renderAll(reports[0]);
      })
      .catch(function (err) {
        self.innerHTML = '<div class="aa-loading">⚠️ 无法加载项目分析数据: ' + escapeHtml(err.message) +
          '<br><small>请确认 ' + escapeHtml(src) + ' 存在且可访问</small></div>';
        document.dispatchEvent(new CustomEvent(ERROR_EVENT, { detail: { error: err } }));
      });
  };

  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, YryArchAnalysis);
  }
  document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryArchAnalysis' } }));
})();
