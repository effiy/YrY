/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryHealthIndex · 健康报告索引自定义元素
   零依赖 vanilla JS — 自包含数据获取 + 报告列表渲染

   属性:
     data-src   reports.json URL (默认 reports.json)

   依赖:
     theme.css / shared-reports.css (提供 .yry-badge / .yry-stats / table 等基础样式)

   页面使用方式:
     <link rel="stylesheet" href="../../cdn/yry-health-index/index.css">
     <script src="../../cdn/yry-health-index/index.js"></script>
     <yry-health-index data-src="reports.json"></yry-health-index>

   渲染结构:
     报告历史表 (日期 · 时间 · 评分 · 等级 · 诊断 · 操作)
     空状态: 引导运行 `node skills/rui-bot/send.mjs health --html`
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var TAG_NAME = 'yry-health-index';
  var READY_EVENT = 'yry-health-index-ready';
  var ERROR_EVENT = 'yry-health-index-error';

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, '&#39;');
  }

  function renderEmpty() {
    return '<tr><td colspan="6"><div class="hi-empty">暂无报告' +
      '<span class="hi-empty-hint"><code>node skills/rui-bot/send.mjs health --html</code> 生成首份报告</span>' +
      '</div></td></tr>';
  }

  function renderError(msg) {
    return '<tr><td colspan="6"><div class="hi-error">加载失败: ' + escapeHtml(msg) + '</div></td></tr>';
  }

  function renderRow(r) {
    var scoreHtml = r.score ? '<span class="hi-row-score ' + escapeAttr(r.grade || '') + '">' + r.score + ' 分</span>' : '—';
    var gradeHtml = r.grade ? '<span class="yry-badge ' + escapeAttr(r.grade) + '">' + escapeHtml(r.grade) + ' 级</span>' : '—';
    var trigHtml;
    if (r.triggers !== null && r.triggers !== undefined) {
      if (r.triggers > 0) {
        trigHtml = '<span style="color:var(--yry-warn)">' + r.triggers + '/8</span>';
      } else {
        trigHtml = '<span style="color:var(--yry-pass)">0/8</span>';
      }
    } else {
      trigHtml = '—';
    }
    var timeHtml = r.time && r.time !== '—' ? escapeHtml(r.time) : '—';
    var file = escapeAttr(r.file || '#');
    var date = escapeHtml(r.date || '');

    return '<tr>' +
      '<td><a class="hi-link" href="' + file + '">🩺 ' + date + '</a></td>' +
      '<td>' + timeHtml + '</td>' +
      '<td>' + scoreHtml + '</td>' +
      '<td>' + gradeHtml + '</td>' +
      '<td>' + trigHtml + '</td>' +
      '<td><a class="hi-link" href="' + file + '">查看</a></td>' +
      '</tr>';
  }

  function renderTable(reports) {
    var html = '<table><thead><tr><th>日期</th><th>时间</th><th>评分</th><th>等级</th><th>诊断</th><th>操作</th></tr></thead><tbody>';
    if (!reports || reports.length === 0) {
      html += renderEmpty();
    } else {
      for (var i = 0; i < reports.length; i++) {
        html += renderRow(reports[i]);
      }
    }
    return html + '</tbody></table>';
  }

  function YryHealthIndex() {
    return Reflect.construct(HTMLElement, [], YryHealthIndex);
  }
  YryHealthIndex.prototype = Object.create(HTMLElement.prototype);
  YryHealthIndex.prototype.connectedCallback = function () {
    var self = this;
    var src = self.getAttribute('data-src') || 'reports.json';
    self.innerHTML = '<div class="hi-loading">加载健康报告列表...</div>';

    fetch(src, { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + r.statusText);
        return r.json();
      })
      .then(function (reports) {
        self.dispatchEvent(new CustomEvent('yry-health-index-data', {
          bubbles: true,
          detail: { count: (reports || []).length, reports: reports }
        }));
        self.innerHTML = renderTable(reports);
      })
      .catch(function (err) {
        self.innerHTML = '<table><thead><tr><th>日期</th><th>时间</th><th>评分</th><th>等级</th><th>诊断</th><th>操作</th></tr></thead><tbody>' + renderError(err.message) + '</tbody></table>';
        document.dispatchEvent(new CustomEvent(ERROR_EVENT, { detail: { error: err } }));
      });
  };

  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, YryHealthIndex);
  }
  document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryHealthIndex' } }));
})();
