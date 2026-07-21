/* =========================================================================
   docs/deps/shared/index.js
   -------------------------------------------------------------------------
   Unified render script for all per-dependency report pages under
   docs/deps/<dir>/. One file replaces what used to be 42 duplicated
   copies, while still supporting both layouts discovered in the
   pre-refactor codebase:

     1. Catalog Report (41 of 42 pages)
        · bottom split  = anchors table + links list
        · bottom section = notes list
        · TOC: Overview / Diagram / Anchors / Links

     2. Dependency Footprint (1 of 42 pages — beautiful-mermaid)
        · bottom split  = ownership table + review notes
        · bottom section = hit-files table
        · TOC: Overview / Diagram / Ownership / Trace

   The script auto-detects the layout by inspecting which data fields
   are present on window.REPORT_DATA:

     · data.ownership     → render ownership table (instead of anchors)
     · data.reviewNotes   → render review notes (instead of links)
     · data.hitFiles      → render hit-files table (instead of notes)
     · else               → fall back to the catalog layout

   Per-page data files (deps/<dir>/data.js) only need to set the data
   fields relevant to their layout — no extra config needed.
   ========================================================================= */

(function () {
  'use strict';

  var data = window.REPORT_DATA || {};
  var meta = data.meta || {};
  var app = document.getElementById('app');
  if (!app) return;

  /* ── HTML escape utility ───────────────────────────────────────── */
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ── Layout detection ────────────────────────────────────────────
     Returns:
       mode:  'footprint' | 'catalog'
       leftPanel:  { id, title, sub, thead, renderRow } | null
       rightPanel: { id, title, sub, html } | null
       bottomSection: { id, title, sub, html } | null
       tocItems: [{ href, label }]                                     */
  function detectLayout() {
    var isFootprint = !!data.ownership || !!data.hitFiles || !!data.reviewNotes;
    if (isFootprint) {
      return {
        mode: 'footprint',
        tocItems: [
          { href: '#overview',  label: 'Overview' },
          { href: '#diagram',   label: 'Diagram' },
          { href: '#ownership', label: 'Ownership' },
          { href: '#hits',      label: 'Trace' }
        ],
        leftPanel: {
          id: 'ownership',
          title: 'Ownership spread',
          sub: 'Nearest <code>SKILL.md</code> boundary for each matching file.',
          thead: ['Skill root', 'Files', 'Occurrences', 'Primary file', 'Usage'],
          renderRow: function (row) {
            return '<tr>' +
              '<td><code>' + esc(row.skillRoot) + '</code></td>' +
              '<td>' + esc(row.fileCount) + '</td>' +
              '<td>' + esc(row.occurrences) + '</td>' +
              '<td><code>' + esc(row.primaryFile) + '</code></td>' +
              '<td>' + esc(row.usageType) + '</td>' +
            '</tr>';
          },
          rows: data.ownership || []
        },
        rightPanel: {
          id: 'review',
          title: 'Review notes',
          sub: 'Why this package matters right now.',
          html: '<ul class="summary-list">' +
            (data.reviewNotes || []).map(function (n) {
              return '<li>' + esc(n) + '</li>';
            }).join('') +
          '</ul>'
        },
        bottomSection: {
          id: 'hits',
          title: 'Hit files',
          sub: 'Sorted by literal match count inside the skills catalog.',
          thead: ['File', 'Kind', 'Usage', 'Matches', 'Skill root'],
          renderRow: function (row) {
            return '<tr>' +
              '<td><code>' + esc(row.path) + '</code></td>' +
              '<td>' + esc(row.fileKind) + '</td>' +
              '<td>' + esc(row.usageType) + '</td>' +
              '<td>' + esc(row.occurrences) + '</td>' +
              '<td><code>' + esc(row.skillRoot) + '</code></td>' +
            '</tr>';
          },
          rows: data.hitFiles || []
        }
      };
    }

    /* Default: catalog layout */
    return {
      mode: 'catalog',
      tocItems: [
        { href: '#overview', label: 'Overview' },
        { href: '#diagram',  label: 'Diagram' },
        { href: '#anchors',  label: 'Anchors' },
        { href: '#links',    label: 'Links' }
      ],
      leftPanel: {
        id: 'anchors',
        title: 'Path anchors',
        sub: 'Used by <code>docs/files/index.html</code> to jump from file-level findings back to this card report.',
        thead: ['Match', 'Mode', 'Reason'],
        renderRow: function (row) {
          return '<tr>' +
            '<td><code>' + esc(row.match) + '</code></td>' +
            '<td>' + esc(row.mode) + '</td>' +
            '<td>' + esc(row.reason || '') + '</td>' +
          '</tr>';
        },
        rows: data.anchors || [],
        emptyRow: '<tr><td colspan="3">No direct file-path anchor was derived for this card.</td></tr>'
      },
      rightPanel: {
        id: 'links',
        title: 'Related links',
        sub: 'Original destinations referenced by the home-page card.',
        renderList: function (links) {
          return '<div class="link-list">' + links.map(function (link) {
            return '<a href="' + esc(link.href) + '"' +
              (link.external ? ' target="_blank" rel="noreferrer noopener"' : '') + '>' +
              '<span class="link-label">' + esc(link.label) + '</span>' +
              '<span class="link-href">' + esc(link.href) + '</span>' +
            '</a>';
          }).join('') + '</div>';
        },
        empty: '<p class="muted">No extra links were attached to this card.</p>',
        items: data.links || []
      },
      bottomSection: {
        id: 'notes',
        title: 'Notes',
        isList: true,
        items: data.notes || []
      }
    };
  }

  /* ── Section renderers (small, focused) ───────────────────────── */
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

  function tableSection(panel) {
    var rows = (panel.rows || []).map(panel.renderRow).join('');
    if (!rows && panel.emptyRow) rows = panel.emptyRow;
    return '<article id="' + panel.id + '" class="panel">' +
      '<div class="panel-title">' + esc(panel.title) + '</div>' +
      '<div class="panel-sub">' + panel.sub + '</div>' +
      '<div class="table-wrap"><table class="table"><thead><tr>' +
        panel.thead.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
    '</article>';
  }

  function rightPanelRenderer(panel) {
    var body = panel.renderList
      ? ((panel.items || []).length ? panel.renderList(panel.items) : panel.empty)
      : panel.html;
    return '<article id="' + panel.id + '" class="panel">' +
      '<div class="panel-title">' + esc(panel.title) + '</div>' +
      (panel.sub ? '<div class="panel-sub">' + panel.sub + '</div>' : '') +
      body +
    '</article>';
  }

  function listSection(panel) {
    var items = (panel.items || []).map(function (n) {
      return '<li>' + esc(n) + '</li>';
    }).join('');
    return '<section id="' + panel.id + '" class="panel section">' +
      '<div class="panel-title">' + esc(panel.title) + '</div>' +
      '<ul class="summary-list">' + items + '</ul>' +
    '</section>';
  }

  function renderHeader(layout) {
    var upstreamLabel = layout.mode === 'footprint' ? 'Upstream' : 'Primary link';
    var lastHeaderHref = layout.mode === 'footprint' ? '#hits' : '#anchors';
    var lastHeaderLabel = layout.mode === 'footprint' ? 'Hit files' : 'Path anchors';
    return '<header class="header">' +
      '<div class="header-top">' +
        '<span class="pulse" aria-hidden="true"></span>' +
        '<div class="title-wrap">' +
          '<h1 class="title">' + esc(meta.pageTitle || 'Dependency report') + '</h1>' +
          '<p class="subtitle">' + esc(meta.subtitle || 'Shared dependency insight view.') + '</p>' +
        '</div>' +
        '<nav class="header-links">' +
          '<a href="../index.html">Back to deps</a>' +
          (meta.upstream
            ? '<a href="' + esc(meta.upstream) + '" target="_blank" rel="noreferrer noopener">' + upstreamLabel + '</a>'
            : '') +
          '<a href="' + lastHeaderHref + '">' + lastHeaderLabel + '</a>' +
        '</nav>' +
      '</div>' +
      '<div class="toc">' +
        layout.tocItems.map(function (it) {
          return '<a href="' + it.href + '">' + esc(it.label) + '</a>';
        }).join('') +
      '</div>' +
    '</header>';
  }

  /* ── Diagram subtitle per layout ─────────────────────────────────
     Resolves the SVG markup from the data. Prefers the new algorithmic
     model (`data.diagram`); falls back to legacy inline `data.svgDiagram`
     for any page that hasn't been migrated yet. The shared/diagram.js
     script must be loaded before this point (see index.html). */
  function renderDiagramPanel() {
    var isFootprint = detectLayout().mode === 'footprint';
    var title = isFootprint ? 'Diagram-style footprint' : 'Diagram-style report';
    var sub = isFootprint
      ? 'Rebuilt from the current <code>.claude/skills</code> inventory using the visual language of <code>yry-reports/diagram</code>.'
      : 'Generated from the docs card inventory using the visual language of <code>yry-reports/diagram</code>.';
    var svg = '';
    if (data.diagram && window.ruiDepsDiagram && window.ruiDepsDiagram.render) {
      try { svg = window.ruiDepsDiagram.render(data.diagram); }
      catch (e) { svg = data.svgDiagram || ''; }
    } else {
      svg = data.svgDiagram || '';
    }
    return '<section id="diagram" class="panel svg-shell">' +
      '<div class="panel-title">' + title + '</div>' +
      '<div class="panel-sub">' + sub + '</div>' +
      svg +
    '</section>';
  }

  /* ── Compose the page ──────────────────────────────────────────── */
  var layout = detectLayout();

  /* Update the document title to the pageTitle from data (so the
     browser tab reflects the actual page). */
  if (meta.pageTitle) {
    document.title = meta.pageTitle;
  }

  app.innerHTML = '<div class="page">' +
    renderHeader(layout) +
    '<section id="overview" class="grid metrics">' +
      (data.metrics || []).map(metricCard).join('') +
    '</section>' +
    renderDiagramPanel() +
    '<section class="grid cards section">' +
      (data.summaryCards || []).map(summaryCard).join('') +
    '</section>' +
    '<section class="split section">' +
      tableSection(layout.leftPanel) +
      rightPanelRenderer(layout.rightPanel) +
    '</section>' +
    (layout.bottomSection.isList
      ? listSection(layout.bottomSection)
      : tableSection(layout.bottomSection)) +
    '<p class="footer">' + esc(meta.footer || '') + '</p>' +
  '</div>';
})();
