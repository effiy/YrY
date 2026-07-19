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

  function ownershipRow(row) {
    return '<tr>' +
      '<td><code>' + esc(row.skillRoot) + '</code></td>' +
      '<td>' + esc(row.fileCount) + '</td>' +
      '<td>' + esc(row.occurrences) + '</td>' +
      '<td><code>' + esc(row.primaryFile) + '</code></td>' +
      '<td>' + esc(row.usageType) + '</td>' +
    '</tr>';
  }

  function hitRow(row) {
    return '<tr>' +
      '<td><code>' + esc(row.path) + '</code></td>' +
      '<td>' + esc(row.fileKind) + '</td>' +
      '<td>' + esc(row.usageType) + '</td>' +
      '<td>' + esc(row.occurrences) + '</td>' +
      '<td><code>' + esc(row.skillRoot) + '</code></td>' +
    '</tr>';
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
            (data.meta.upstream ? '<a href="' + esc(data.meta.upstream) + '" target="_blank" rel="noreferrer">Upstream</a>' : '') +
            '<a href="#hits">Hit files</a>' +
          '</nav>' +
        '</div>' +
        '<div class="toc">' +
          '<a href="#overview">Overview</a>' +
          '<a href="#diagram">Diagram</a>' +
          '<a href="#ownership">Ownership</a>' +
          '<a href="#hits">Trace</a>' +
        '</div>' +
      '</header>' +
      '<section id="overview" class="grid metrics">' +
        (data.metrics || []).map(metricCard).join('') +
      '</section>' +
      '<section id="diagram" class="panel svg-shell">' +
        '<div class="panel-title">Diagram-style footprint</div>' +
        '<div class="panel-sub">Rebuilt from the current <code>.claude/skills</code> inventory using the visual language of <code>rui-reports/diagram</code>.</div>' +
        (data.svgDiagram || '') +
      '</section>' +
      '<section class="grid cards section">' +
        (data.summaryCards || []).map(summaryCard).join('') +
      '</section>' +
      '<section class="split section">' +
        '<article id="ownership" class="panel">' +
          '<div class="panel-title">Ownership spread</div>' +
          '<div class="panel-sub">Nearest <code>SKILL.md</code> boundary for each matching file.</div>' +
          '<div class="table-wrap"><table class="table"><thead><tr><th>Skill root</th><th>Files</th><th>Occurrences</th><th>Primary file</th><th>Usage</th></tr></thead><tbody>' +
            (data.ownership || []).map(ownershipRow).join('') +
          '</tbody></table></div>' +
        '</article>' +
        '<article class="panel">' +
          '<div class="panel-title">Review notes</div>' +
          '<div class="panel-sub">Why this package matters right now.</div>' +
          '<ul class="summary-list">' +
            (data.reviewNotes || []).map(function (item) { return '<li>' + esc(item) + '</li>'; }).join('') +
          '</ul>' +
        '</article>' +
      '</section>' +
      '<section id="hits" class="panel section">' +
        '<div class="panel-title">Hit files</div>' +
        '<div class="panel-sub">Sorted by literal match count inside the skills catalog.</div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>File</th><th>Kind</th><th>Usage</th><th>Matches</th><th>Skill root</th></tr></thead><tbody>' +
          (data.hitFiles || []).map(hitRow).join('') +
        '</tbody></table></div>' +
      '</section>' +
      '<p class="footer">' + esc(data.meta.footer || '') + '</p>' +
    '</div>';
}());
