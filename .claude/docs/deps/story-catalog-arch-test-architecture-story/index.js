(function () {
  'use strict';
  var data = window.REPORT_DATA || {};
  var app = document.getElementById('app');
  if (!app) return;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function metricCard(metric) {
    return '<article class="panel metric">' +
      '<div class="metric-label">' + esc(metric.label) + '</div>' +
      '<div class="metric-value tone-' + esc(metric.tone || 'cyan') + '">' + esc(metric.value) + '</div>' +
      '<div class="metric-sub">' + esc(metric.sub || '') + '</div>' +
    '</article>';
  }

  function summaryCard(card) {
    return '<article class="panel">' +
      '<div class="panel-title tone-' + esc(card.tone || 'cyan') + '">' + esc(card.title) + '</div>' +
      '<ul class="summary-list">' +
        (card.items || []).map(function (item) { return '<li>' + esc(item) + '</li>'; }).join('') +
      '</ul>' +
    '</article>';
  }

  function anchorRow(row) {
    return '<tr>' +
      '<td><code>' + esc(row.match) + '</code></td>' +
      '<td>' + esc(row.mode) + '</td>' +
      '<td>' + esc(row.reason || '') + '</td>' +
    '</tr>';
  }

  function linkItem(link) {
    return '<a href="' + esc(link.href) + '"' + (link.external ? ' target="_blank" rel="noreferrer noopener"' : '') + '>' +
      '<span class="link-label">' + esc(link.label) + '</span>' +
      '<span class="link-href">' + esc(link.href) + '</span>' +
    '</a>';
  }

  app.innerHTML = '' +
    '<div class="page">' +
      '<header class="header">' +
        '<div class="header-top">' +
          '<span class="pulse" aria-hidden="true"></span>' +
          '<div class="title-wrap">' +
            '<h1 class="title">' + esc(data.meta.pageTitle) + '</h1>' +
            '<p class="subtitle">' + esc(data.meta.subtitle) + '</p>' +
          '</div>' +
          '<nav class="header-links">' +
            '<a href="../index.html">Back to deps</a>' +
            (data.meta.upstream ? '<a href="' + esc(data.meta.upstream) + '" target="_blank" rel="noreferrer noopener">Primary link</a>' : '') +
            '<a href="#anchors">Path anchors</a>' +
          '</nav>' +
        '</div>' +
        '<div class="toc">' +
          '<a href="#overview">Overview</a>' +
          '<a href="#diagram">Diagram</a>' +
          '<a href="#anchors">Anchors</a>' +
          '<a href="#links">Links</a>' +
        '</div>' +
      '</header>' +
      '<section id="overview" class="grid metrics">' +
        (data.metrics || []).map(metricCard).join('') +
      '</section>' +
      '<section id="diagram" class="panel svg-shell">' +
        '<div class="panel-title">Diagram-style report</div>' +
        '<div class="panel-sub">Generated from the docs card inventory using the visual language of <code>rui-reports/diagram</code>.</div>' +
        (data.svgDiagram || '') +
      '</section>' +
      '<section class="grid cards section">' +
        (data.summaryCards || []).map(summaryCard).join('') +
      '</section>' +
      '<section class="split section">' +
        '<article id="anchors" class="panel">' +
          '<div class="panel-title">Path anchors</div>' +
          '<div class="panel-sub">Used by <code>docs/files/index.html</code> to jump from file-level findings back to this card report.</div>' +
          '<div class="table-wrap"><table class="table"><thead><tr><th>Match</th><th>Mode</th><th>Reason</th></tr></thead><tbody>' +
            ((data.anchors || []).length ? data.anchors.map(anchorRow).join('') : '<tr><td colspan="3">No direct file-path anchor was derived for this card.</td></tr>') +
          '</tbody></table></div>' +
        '</article>' +
        '<article id="links" class="panel">' +
          '<div class="panel-title">Related links</div>' +
          '<div class="panel-sub">Original destinations referenced by the home-page card.</div>' +
          '<div class="link-list">' +
            ((data.links || []).length ? data.links.map(linkItem).join('') : '<p class="muted">No extra links were attached to this card.</p>') +
          '</div>' +
        '</article>' +
      '</section>' +
      '<section class="panel section">' +
        '<div class="panel-title">Notes</div>' +
        '<ul class="summary-list">' +
          (data.notes || []).map(function (item) { return '<li>' + esc(item) + '</li>'; }).join('') +
        '</ul>' +
      '</section>' +
      '<p class="footer">' + esc(data.meta.footer || '') + '</p>' +
    '</div>';
}());
