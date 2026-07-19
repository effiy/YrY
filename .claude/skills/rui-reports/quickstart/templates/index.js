/**
 * @file: index.js
 * @purpose: Reactive Vue 3 app + per-section renderers + quickstartToMarkdown()
 *            exporter for the rui-report-quickstart template.
 *
 * @four_file_layout: data.js · index.html · index.css · index.js
 *
 * @responsibilities:
 *   1. Mount the Vue 3 app on #quickstart-app once Vue is on window.
 *   2. Render the seven canonical sections in fixed order using
 *      per-section partial templates (re-rendered on dataset change).
 *   3. Drive the toolbar (dataset switcher + coverage filter + theme
 *      switcher + copy markdown) and the sticky section TOC with
 *      active-section highlight.
 *   4. Surface the score banner as an SVG ring + composite + grade.
 *   5. Expose window.quickstartToMarkdown(data) (full report) and
 *      window.quickstartToMarkdownSection(slug, data) (per section)
 *      so the create command and the in-page copy buttons can produce
 *      markdown with the same ## headers as the HTML page.
 *   6. Honor the data-shape contract documented in data.js; missing
 *      fields render as em-dash or TODO rather than crashing.
 *
 * @data_consumed:
 *   window.QUICKSTART_DATA        — currently active dataset (defaults
 *                                    to DATASET_PYTHON on first load)
 *   window.QUICKSTART_DATA_SCHEMA — datasets, canonicalSections, helpers
 */
(function () {
  'use strict';

  var schema = window.QUICKSTART_DATA_SCHEMA || {};
  var data   = window.QUICKSTART_DATA || {};
  var labels = data.labels || {};
  var CANON = schema.canonicalSections || [
    'overview', 'concepts', 'directory-map', 'onboarding-flow',
    'commands', 'faq', 'further-reading'
  ];

  /* ═══════════════════════════════════════════════════════════════════
     HELPERS
     ─────────────────────────────────────────────────────────────────── */

  function emDash(v) { return (v === undefined || v === null || v === '') ? '—' : v; }
  function pct(n)    { return Math.round((Number(n) || 0) * 100) + '%'; }
  function pctNum(n) { return Math.round((Number(n) || 0) * 100); }
  function escape(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function slugTitle(slug) {
    return labels['sectionTitle_' + slug] || slug.replace(/-/g, ' ');
  }

  function hasContent(slug, sec) {
    if (!sec) return false;
    if (slug === 'overview')         return !!(sec.summary || (sec.stack && (sec.stack.language || sec.stack.framework || sec.stack.runtime)) || (sec.scope && sec.scope.files));
    if (slug === 'concepts')         return Array.isArray(sec.items) && sec.items.length > 0;
    if (slug === 'directory-map')    return !!sec.tree;
    if (slug === 'onboarding-flow')  return Array.isArray(sec.steps) && sec.steps.length > 0;
    if (slug === 'commands')         return Array.isArray(sec.items) && sec.items.length > 0;
    if (slug === 'faq')              return Array.isArray(sec.items) && sec.items.length > 0;
    if (slug === 'further-reading')  return Array.isArray(sec.items) && sec.items.length > 0;
    return false;
  }

  /* ═══════════════════════════════════════════════════════════════════
     PER-SECTION HTML RENDERERS
     Each function returns an HTML fragment for one section's body.
     The same fragment shape is shared by the Vue master template
     (via v-html) and by quickstartToMarkdown() (as markdown source).
     ─────────────────────────────────────────────────────────────────── */

  var SECTION_RENDERERS = {
    /* 1 · Project Overview ─────────────────────────────────────────── */
    overview: function (sec) {
      var stack = sec.stack || {};
      var scope = sec.scope || {};
      var stackTiles = [
        labels.stackLanguage  + ': ' + emDash(stack.language),
        labels.stackFramework + ': ' + emDash(stack.framework),
        labels.stackRuntime   + ': ' + emDash(stack.runtime)
      ].map(function (s) {
        return '<div class="qs-overview-tile"><span class="qs-overview-tile-label">' +
               escape(labels.overviewStackLabel) + '</span>' +
               '<span class="qs-overview-tile-value">' + escape(s) + '</span></div>';
      }).join('');

      var scopeTiles = [
        { v: String(scope.files || 0),      l: (scope.files || 0) + ' ' + labels.scopeFiles },
        { v: String(scope.directories || 0),l: (scope.directories || 0) + ' ' + labels.scopeDirectories }
      ];
      if (scope.locLabel) {
        scopeTiles.push({ v: scope.locLabel, l: labels.scopeLines });
      }
      var scopeHtml = scopeTiles.map(function (t) {
        return '<div class="qs-overview-tile"><span class="qs-overview-stat-value">' +
               escape(t.v) + '</span><span class="qs-overview-stat-label">' +
               escape(t.l) + '</span></div>';
      }).join('');

      return [
        '<p class="qs-overview-summary">' + escape(sec.summary || '') + '</p>',
        '<div class="qs-overview-grid">' + stackTiles + scopeHtml + '</div>'
      ].join('');
    },

    /* 2 · Key Concepts ─────────────────────────────────────────────── */
    concepts: function (sec) {
      var items = (sec.items || []).map(function (it) {
        var loc = it.file
          ? '<div class="qs-concept-loc">' + escape(it.file) +
            (it.line ? ':' + it.line : '') + '</div>'
          : '';
        var role = it.role
          ? '<span class="qs-concept-role">' + escape(it.role) + '</span>'
          : '';
        return [
          '<article class="qs-concept">',
          '  <header class="qs-concept-head">',
          '    <span class="qs-concept-name">' + escape(it.name || '') + '</span>',
          '    ' + role,
          '  </header>',
          '  <p class="qs-concept-desc">' + escape(it.description || '') + '</p>',
          '  ' + loc,
          '</article>'
        ].join('\n');
      }).join('\n');
      return '<div class="qs-concept-list">' + items + '</div>';
    },

    /* 3 · Directory Map ────────────────────────────────────────────── */
    'directory-map': function (sec) {
      var treeLines = (sec.tree || '').split('\n');
      var annotations = sec.annotations || {};
      var linesHtml = treeLines.map(function (line) {
        // Match "├── foo  ← note" / "└── foo" — capture the path segment
        var m = line.match(/^([│├└─\s]*)([\w.\-_/]+)(.*)$/);
        if (m && annotations[m[2]]) {
          return '<div class="qs-tree-line has-note">' + escape(line) +
                 '<span class="qs-tree-note"> &nbsp;' +
                 escape(annotations[m[2]]) + '</span></div>';
        }
        return '<div class="qs-tree-line">' + escape(line) + '</div>';
      }).join('');

      var annKeys = Object.keys(annotations || {});
      var annHtml = annKeys.length
        ? '<div class="qs-annotations">' +
            annKeys.map(function (k) {
              return '<div class="qs-annotation">' +
                     '<div class="qs-annotation-path">' + escape(k) + '</div>' +
                     '<div class="qs-annotation-note">' + escape(annotations[k]) + '</div>' +
                     '</div>';
            }).join('') + '</div>'
        : '';

      return [
        '<div class="qs-tree-wrap">',
        '  <pre class="qs-tree">' + linesHtml + '</pre>',
        '  ' + annHtml,
        '</div>'
      ].join('\n');
    },

    /* 4 · Onboarding Flow ──────────────────────────────────────────── */
    'onboarding-flow': function (sec) {
      var steps = (sec.steps || []).map(function (st) {
        var cmd = st.command
          ? '<pre class="qs-step-command">' + escape(st.command) + '</pre>'
          : '';
        return [
          '<article class="qs-step">',
          '  <div class="qs-step-num" aria-hidden="true"></div>',
          '  <div class="qs-step-body">',
          '    <div class="qs-step-action">' + escape(st.action || '') + '</div>',
          '    <div class="qs-step-outcome">' + escape(st.outcome || '') + '</div>',
          '    ' + cmd,
          '  </div>',
          '</article>'
        ].join('\n');
      }).join('\n');
      return '<ol class="qs-steps">' + steps + '</ol>';
    },

    /* 5 · Command Cheatsheet ───────────────────────────────────────── */
    commands: function (sec) {
      var items = (sec.items || []).map(function (it) {
        var src = it.source
          ? '<div class="qs-command-source">' + escape(labels.commandsSource) + ': ' +
            escape(it.source) + '</div>'
          : '';
        return [
          '<div class="qs-command">',
          '  <div class="qs-command-name">' + escape(it.name || '') + '</div>',
          '  <div class="qs-command-body">',
          '    <pre class="qs-command-cmd">' + escape(it.command || '') + '</pre>',
          '    <div class="qs-command-desc">' + escape(it.description || '') + '</div>',
          '    ' + src,
          '  </div>',
          '</div>'
        ].join('\n');
      }).join('\n');
      return '<div class="qs-commands">' + items + '</div>';
    },

    /* 6 · FAQ ──────────────────────────────────────────────────────── */
    faq: function (sec) {
      var items = (sec.items || []).map(function (it) {
        var src = it.source
          ? '<div class="qs-faq-source">' + escape(it.source) + '</div>'
          : '';
        return [
          '<article class="qs-faq-item">',
          '  <div class="qs-faq-q">' + escape(it.question || '') + '</div>',
          '  <div class="qs-faq-a">',
          '    ' + escape(it.answer || ''),
          '    ' + src,
          '  </div>',
          '</article>'
        ].join('\n');
      }).join('\n');
      return '<div class="qs-faq">' + items + '</div>';
    },

    /* 7 · Further Reading ──────────────────────────────────────────── */
    'further-reading': function (sec) {
      var items = (sec.items || []).map(function (it) {
        var kind = it.kind
          ? '<div class="qs-reading-kind">' + escape(it.kind) + '</div>'
          : '';
        return [
          '<a class="qs-reading-item" href="' + escape(it.href || '#') + '">',
          '  ' + kind,
          '  <div class="qs-reading-title">' + escape(it.title || '') + '</div>',
          '  <div class="qs-reading-desc">' + escape(it.description || '') + '</div>',
          '</a>'
        ].join('\n');
      }).join('\n');
      return '<div class="qs-reading">' + items + '</div>';
    }
  };

  /* ── TODO marker (used when a section is empty) ─────────────────── */
  function todoBlock(sec) {
    var reason = (sec.todo && sec.todo.reason) || 'no evidence';
    return [
      '<div class="qs-todo">',
      '  <span class="qs-todo-badge">' + escape(labels.todoBadge) + '</span>',
      '  <div class="qs-todo-reason">' + escape(reason) + '</div>',
      '</div>'
    ].join('\n');
  }

  /* ── Section block: header (with coverage bar + copy btn) + body ── */
  function sectionBlock(slug, sec, idx) {
    var renderer = SECTION_RENDERERS[slug];
    var body = '';
    if (sec && (sec.todo || !hasContent(slug, sec))) {
      body = todoBlock(sec || {});
    } else if (renderer && sec) {
      body = renderer(sec);
    }
    var coverage = sec && typeof sec.coverage === 'number' ? pctNum(sec.coverage) : 0;
    var verdict  = (sec && sec.verdict) || 'fail';
    var verdictLabel = verdict === 'pass' ? labels.verdictPass
                     : verdict === 'partial' ? labels.verdictPartial
                     : labels.verdictFail;
    return [
      '<section class="qs-section" id="qs-' + escape(slug) + '"',
      '         data-slug="' + escape(slug) + '"',
      '         data-verdict="' + escape(verdict) + '"',
      '         data-coverage="' + coverage + '">',
      '  <header class="qs-section-head">',
      '    <span class="qs-section-index">' + (idx + 1) + '</span>',
      '    <h2 class="qs-section-title">' + escape((sec && sec.title) || slugTitle(slug)) + '</h2>',
      '    <div class="qs-coverage" title="' + escape(labels.coverageLabel) + ' · ' + coverage + '%">',
      '      <div class="qs-coverage-track">',
      '        <div class="qs-coverage-fill is-' + escape(verdict) + '" style="width: ' + coverage + '%"></div>',
      '      </div>',
      '      <span class="qs-coverage-value">' + coverage + '%</span>',
      '    </div>',
      '    <span class="qs-verdict is-' + escape(verdict) + '">' + escape(verdictLabel) + '</span>',
      '    <button class="qs-section-copy" data-copy-section="' + escape(slug) + '"',
      '            title="' + escape(labels.sectionCopyLabel) + '"',
      '            aria-label="' + escape(labels.sectionCopyLabel) + '">',
      '      <span class="qs-section-copy-icon" aria-hidden="true">⧉</span>',
      '      <span class="qs-section-copy-label">' + escape(labels.sectionCopyLabel) + '</span>',
      '    </button>',
      '  </header>',
      '  <div class="qs-section-body">' + body + '</div>',
      '</section>'
    ].join('\n');
  }

  /* ═══════════════════════════════════════════════════════════════════
     VUE MASTER TEMPLATE
     Bound state:
       · datasets[]               — registry from data.js
       · currentDataset           — key into datasets[]
       · coverageFilter           — 'all' | 'pass-partial' | 'pass'
       · theme                    — 'auto' | 'light' | 'dark'
       · data                     — the active QUICKSTART_DATA
       · labels                   — labels block
       · sectionsHtml             — pre-rendered HTML for all sections
       · activeSection            — slug currently in viewport (TOC)
       · copyState                — { global: bool, [slug]: bool } for
                                   the 1.5s "Copied!" feedback
     ─────────────────────────────────────────────────────────────────── */
  var MASTER_TEMPLATE = String.raw`
<div class="qs-shell">
  <div class="qs-layout">
    <aside class="qs-toc" aria-label="Section navigation">
      <div class="qs-toc-title">{{ labels.headerSubtitle }}</div>
      <ol class="qs-toc-list">
        <li v-for="(item, idx) in tocItems"
            :class="{ 'is-active': activeSection === item.slug }"
            :data-verdict="item.verdict">
          <a :href="'#qs-' + item.slug" @click="onTocClick($event, item.slug)">
            <span class="qs-toc-num">{{ idx + 1 }}</span>
            <span class="qs-toc-title">{{ item.title }}</span>
            <span class="qs-toc-dot" :class="'is-' + item.verdict" :title="item.verdict"></span>
          </a>
        </li>
      </ol>
    </aside>

    <div class="qs-main">
      <div class="qs-toolbar" role="toolbar" aria-label="Page controls">
        <div class="qs-toolbar-group" role="group" :aria-label="labels.toolbarDatasetLabel">
          <span class="qs-toolbar-label">{{ labels.toolbarDatasetLabel }}</span>
          <select class="qs-select" v-model="currentDataset" :aria-label="labels.toolbarDatasetLabel">
            <option v-for="ds in datasets" :key="ds.key" :value="ds.key">{{ ds.label }}</option>
          </select>
        </div>
        <div class="qs-toolbar-group" role="group" :aria-label="labels.toolbarFilterLabel">
          <span class="qs-toolbar-label">{{ labels.toolbarFilterLabel }}</span>
          <div class="qs-segmented" role="tablist">
            <button v-for="opt in filterOptions"
                    :key="opt.value"
                    :class="{ 'is-active': coverageFilter === opt.value }"
                    @click="coverageFilter = opt.value"
                    role="tab"
                    :aria-selected="coverageFilter === opt.value">
              {{ opt.label }}
            </button>
          </div>
        </div>
        <div class="qs-toolbar-group" role="group" :aria-label="labels.toolbarThemeLabel">
          <span class="qs-toolbar-label">{{ labels.toolbarThemeLabel }}</span>
          <div class="qs-segmented" role="tablist">
            <button v-for="opt in themeOptions"
                    :key="opt.value"
                    :class="{ 'is-active': theme === opt.value }"
                    @click="setTheme(opt.value)"
                    role="tab"
                    :aria-selected="theme === opt.value"
                    :title="opt.title">
              {{ opt.label }}
            </button>
          </div>
        </div>
        <div class="qs-toolbar-spacer"></div>
        <button class="qs-copy-btn"
                :class="{ 'is-copied': copyState.global }"
                @click="copyAllMarkdown"
                :title="labels.toolbarCopyAllLabel"
                :aria-label="labels.toolbarCopyAllLabel">
          <span class="qs-copy-icon" aria-hidden="true">⧉</span>
          <span class="qs-copy-label">{{ copyState.global ? labels.toolbarCopiedLabel : labels.toolbarCopyLabel }}</span>
        </button>
      </div>

      <header class="qs-header">
        <div class="qs-header-meta">
          <span class="qs-pill">{{ labels.headerSubtitle }}</span>
          <span>{{ labels.headerMeta }} · <strong>{{ data.meta.timestamp }}</strong></span>
          <span>{{ labels.languageNote }} · <code>{{ data.meta.language }}</code></span>
          <span><code>{{ data.meta.scopeShort }}</code></span>
        </div>
        <h1 class="qs-title">{{ data.meta.title }}</h1>
        <p class="qs-tagline">{{ tagline }}</p>
      </header>

      <section class="qs-score" aria-label="labels.scoreLabel">
        <div class="qs-score-summary">
          <div class="qs-score-label">{{ labels.scoreLabel }}</div>
          <div class="qs-score-callout" v-if="lowScore">{{ labels.scoreCallout }}</div>
        </div>
        <div class="qs-score-figure">
          <svg class="qs-score-ring" viewBox="0 0 100 100" aria-hidden="true">
            <circle class="qs-score-ring-track" cx="50" cy="50" r="42" />
            <circle class="qs-score-ring-fill"
                    :class="'is-' + data.score.grade"
                    cx="50" cy="50" r="42"
                    :stroke-dasharray="ringCircumference"
                    :stroke-dashoffset="ringOffset"
                    transform="rotate(-90 50 50)" />
          </svg>
          <div class="qs-score-text">
            <div class="qs-score-composite">{{ data.score.composite }}</div>
            <div class="qs-score-grade" :class="'is-' + data.score.grade">{{ data.score.grade }}</div>
          </div>
        </div>
      </section>

      <main v-html="sectionsHtml" :data-filter="coverageFilter" aria-label="Quickstart sections"></main>

      <footer class="qs-footer">
        <span>{{ labels.footerNote }}</span>
        <span class="qs-muted">v{{ version }} · {{ currentDatasetLabel }}</span>
      </footer>
    </div>
  </div>
</div>
`;

  /* ═══════════════════════════════════════════════════════════════════
     MARKDOWN EXPORTERS
     quickstartToMarkdown(d)        — full report (used for README.md)
     quickstartToMarkdownSection(s, d) — single section as markdown
     Identical ## headers to the HTML page in canonical order.
     ─────────────────────────────────────────────────────────────────── */
  function quickstartToMarkdown(d) {
    d = d || data;
    var L = (d.labels || labels);
    var md = [];
    md.push('# ' + (d.meta.title || 'Quickstart'));
    md.push('');
    md.push('> ' + L.headerSubtitle + ' · ' + (d.meta.timestamp || '') +
            ' · language: `' + (d.meta.language || 'en') + '` · scope: `' +
            (d.meta.scopeShort || d.meta.scope || '') + '`');
    md.push('');

    var s = d.score || { composite: 0, grade: 'F', verdicts: {} };
    md.push('**' + L.scoreLabel + ':** ' + (s.composite || 0) + ' / 100 · grade **' + (s.grade || 'F') + '**');
    md.push('');
    if ((s.composite || 0) < 60) { md.push('> ' + L.scoreCallout); md.push(''); }

    (d.sections ? CANON : []).forEach(function (slug) {
      md.push(quickstartToMarkdownSection(slug, d, L).trimEnd());
      md.push('');
    });

    md.push('---');
    md.push('');
    md.push('_' + (d.labels || labels).footerNote + '_');
    md.push('');
    return md.join('\n');
  }

  function quickstartToMarkdownSection(slug, d, L) {
    L = L || (d && d.labels) || labels;
    var sec = ((d || data).sections || {})[slug] || {};
    var title = sec.title || slug;
    var out = ['## ' + title, ''];

    if (sec.todo || !hasContent(slug, sec)) {
      var reason = (sec.todo && sec.todo.reason) || 'no evidence';
      out.push('> **' + L.todoBadge + '** — ' + reason);
      out.push('');
      return out.join('\n');
    }

    if (slug === 'overview') {
      if (sec.summary) { out.push(sec.summary); out.push(''); }
      var stack = sec.stack || {};
      if (stack.language || stack.framework || stack.runtime) {
        out.push('**' + L.overviewStackLabel + ':**');
        out.push('');
        if (stack.language)  out.push('- ' + L.stackLanguage  + ': ' + stack.language);
        if (stack.framework) out.push('- ' + L.stackFramework + ': ' + stack.framework);
        if (stack.runtime)   out.push('- ' + L.stackRuntime   + ': ' + stack.runtime);
        out.push('');
      }
      var scope = sec.scope || {};
      if (scope.files || scope.directories || scope.locLabel) {
        out.push('**' + L.overviewScopeLabel + ':** ' +
                (scope.files || 0) + ' ' + L.scopeFiles + ' · ' +
                (scope.directories || 0) + ' ' + L.scopeDirectories +
                (scope.locLabel ? ' · ' + scope.locLabel : ''));
        out.push('');
      }
    } else if (slug === 'concepts') {
      (sec.items || []).forEach(function (it) {
        var head = '### ' + (it.name || '');
        if (it.role) head += ' · `' + it.role + '`';
        out.push(head);
        if (it.description) { out.push(it.description); out.push(''); }
        if (it.file) out.push('> `' + it.file + (it.line ? ':' + it.line : '') + '`'), out.push('');
      });
    } else if (slug === 'directory-map') {
      if (sec.tree) {
        out.push('```');
        out.push(sec.tree);
        out.push('```');
        out.push('');
      }
      Object.keys(sec.annotations || {}).forEach(function (k) {
        out.push('- `' + k + '` — ' + sec.annotations[k]);
      });
      if (Object.keys(sec.annotations || {}).length) out.push('');
    } else if (slug === 'onboarding-flow') {
      (sec.steps || []).forEach(function (st) {
        out.push((st.order || '') + '. **' + (st.action || '') + '**');
        if (st.outcome) out.push('   - ' + L.onboardingOutcome + ': ' + st.outcome);
        if (st.command) out.push('   - ' + L.onboardingCommand + ': `' + st.command + '`');
      });
      out.push('');
    } else if (slug === 'commands') {
      out.push('| ' + L.commandsName + ' | ' + L.commandsCmd + ' | ' + L.commandsDesc + ' |');
      out.push('| --- | --- | --- |');
      (sec.items || []).forEach(function (it) {
        out.push('| `' + (it.name || '') + '` | `' + (it.command || '') + '` | ' +
                (it.description || '') +
                (it.source ? ' _(' + it.source + ')_' : '') + ' |');
      });
      out.push('');
    } else if (slug === 'faq') {
      (sec.items || []).forEach(function (it) {
        out.push('**Q:** ' + (it.question || ''));
        out.push('');
        out.push('**A:** ' + (it.answer || ''));
        if (it.source) { out.push(''); out.push('> source: ' + it.source); }
        out.push('');
      });
    } else if (slug === 'further-reading') {
      (sec.items || []).forEach(function (it) {
        var line = '- [' + (it.title || '') + '](' + (it.href || '#') + ')';
        if (it.description) line += ' — ' + it.description;
        out.push(line);
      });
      out.push('');
    }
    return out.join('\n');
  }

  /* ═══════════════════════════════════════════════════════════════════
     CLIPBOARD HELPERS
     Prefer navigator.clipboard (modern) and fall back to a hidden
     <textarea> + document.execCommand('copy') for older browsers.
     Always resolve cleanly so the copy button never throws.
     ─────────────────────────────────────────────────────────────────── */
  function copyToClipboard(text) {
    return new Promise(function (resolve) {
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(resolve, function () { fallbackCopy(text); resolve(); });
      } else {
        fallbackCopy(text);
        resolve();
      }
    });
  }
  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e) { /* swallow — copy is best-effort */ }
  }

  /* ═══════════════════════════════════════════════════════════════════
     VUE APP
     ─────────────────────────────────────────────────────────────────── */
  window.__vueLoadPromise = window.__vueLoadPromise || Promise.resolve();
  window.__vueLoadPromise.then(function () {
    if (typeof Vue === 'undefined') {
      console.error('[rui-report-quickstart] Vue global not present after load promise — page will not mount');
      return;
    }

    var datasets = (schema.datasets || []).slice();
    var initialKey = datasets.length ? datasets[0].key : null;
    var initialData = initialKey ? datasets[0].data : data;
    var storedTheme = 'auto';
    try { storedTheme = localStorage.getItem('rui-report-quickstart:theme') || 'auto'; } catch (e) { /* private mode */ }

    var app = Vue.createApp({
      data: function () {
        return {
          datasets:         datasets,
          currentDataset:   initialKey,
          theme:            storedTheme,
          coverageFilter:   'all',
          activeSection:    (CANON[0] || ''),
          data:             initialData,
          labels:           labels,
          sectionsHtml:     '',
          copyState:        { global: false },
          version:          schema.version || 1
        };
      },
      computed: {
        currentDatasetLabel: function () {
          var ds = this.datasets.find(function (d) { return d.key === this.currentDataset; }.bind(this));
          return ds ? ds.label : '';
        },
        tagline: function () {
          var ov = this.data.sections && this.data.sections.overview;
          return (ov && ov.summary)
            ? ov.summary
            : 'Newcomer-facing quickstart for ' + (this.data.meta.scopeShort || 'this scope');
        },
        lowScore: function () { return (this.data.score.composite || 0) < 60; },
        ringCircumference: function () { return 2 * Math.PI * 42; },
        ringOffset: function () {
          var pct = (this.data.score.composite || 0) / 100;
          return this.ringCircumference * (1 - pct);
        },
        tocItems: function () {
          var self = this;
          return CANON.map(function (slug) {
            var sec = (self.data.sections || {})[slug] || {};
            return {
              slug:    slug,
              title:   sec.title || slugTitle(slug),
              verdict: sec.verdict || 'fail'
            };
          });
        },
        filterOptions: function () {
          return [
            { value: 'all',          label: this.labels.filterAll        },
            { value: 'pass-partial', label: this.labels.filterPassPartial },
            { value: 'pass',         label: this.labels.filterPass        }
          ];
        },
        themeOptions: function () {
          return [
            { value: 'auto',  label: this.labels.themeAuto,  title: 'Follow system preference' },
            { value: 'light', label: this.labels.themeLight, title: 'Light theme' },
            { value: 'dark',  label: this.labels.themeDark,  title: 'Dark theme' }
          ];
        }
      },
      watch: {
        currentDataset: function (key) {
          var ds = this.datasets.find(function (d) { return d.key === key; });
          if (ds) {
            this.data = ds.data;
            this.renderSections();
          }
        },
        coverageFilter: function () {
          // Filter is applied via a data-attribute on <main>; CSS hides
          // sections that don't match. No re-render needed.
        }
      },
      mounted: function () {
        this.renderSections();
        this.applyTheme();
        this.bindCopyDelegation();
        this.bindScrollSpy();
        window.addEventListener('hashchange', this.onHashChange);
      },
      beforeUnmount: function () {
        window.removeEventListener('hashchange', this.onHashChange);
        if (this._io) { try { this._io.disconnect(); } catch (e) {} }
      },
      methods: {
        renderSections: function () {
          var d = this.data;
          var html = CANON.map(function (slug, idx) {
            return sectionBlock(slug, (d.sections || {})[slug] || {}, idx);
          }).join('\n');
          this.sectionsHtml = html;
          // After Vue updates the DOM, re-bind the per-section copy
          // buttons (v-html replaces the DOM, so listeners must be
          // re-attached on every render).
          this.$nextTick(this.bindCopyDelegation);
        },
        setTheme: function (val) {
          this.theme = val;
          this.applyTheme();
          try { localStorage.setItem('rui-report-quickstart:theme', val); } catch (e) {}
        },
        applyTheme: function () {
          var t = this.theme;
          if (t === 'auto') {
            document.documentElement.removeAttribute('data-theme');
          } else {
            document.documentElement.setAttribute('data-theme', t);
          }
        },
        bindCopyDelegation: function () {
          var self = this;
          // Event delegation on the <main> element so we don't have
          // to re-bind per section on every render.
          var main = this.$el.querySelector('main');
          if (!main) return;
          if (this._onCopyClick) {
            main.removeEventListener('click', this._onCopyClick);
          }
          this._onCopyClick = function (ev) {
            var btn = ev.target.closest('[data-copy-section]');
            if (!btn) return;
            ev.preventDefault();
            ev.stopPropagation();
            var slug = btn.getAttribute('data-copy-section');
            self.copySectionMarkdown(slug, btn);
          };
          main.addEventListener('click', this._onCopyClick);
        },
        copyAllMarkdown: function () {
          var md = quickstartToMarkdown(this.data);
          var self = this;
          copyToClipboard(md).then(function () {
            self.copyState.global = true;
            setTimeout(function () { self.copyState.global = false; }, 1500);
          });
        },
        copySectionMarkdown: function (slug, btn) {
          var md = quickstartToMarkdownSection(slug, this.data);
          var self = this;
          copyToClipboard(md).then(function () {
            // Per-section visual feedback: swap the button label
            // for 1.5s, then restore. The convention matches the
            // project memory rule (1.5s feedback duration).
            if (!btn) return;
            var labelEl = btn.querySelector('.qs-section-copy-label');
            if (!labelEl) return;
            var orig = labelEl.textContent;
            labelEl.textContent = self.labels.sectionCopiedLabel;
            btn.classList.add('is-copied');
            setTimeout(function () {
              labelEl.textContent = orig;
              btn.classList.remove('is-copied');
            }, 1500);
          });
        },
        bindScrollSpy: function () {
          var self = this;
          if (!('IntersectionObserver' in window)) return;
          if (this._io) { try { this._io.disconnect(); } catch (e) {} }
          // Use rootMargin to mark a section as "active" when its top
          // is within the top third of the viewport.
          this._io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                var slug = entry.target.getAttribute('data-slug');
                if (slug) self.activeSection = slug;
              }
            });
          }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });
          this.$nextTick(function () {
            var sections = self.$el.querySelectorAll('main .qs-section');
            sections.forEach(function (s) { self._io.observe(s); });
          });
        },
        onTocClick: function (ev, slug) {
          // Let the browser's native smooth-scroll (set in CSS)
          // handle the scroll. The IntersectionObserver will pick
          // up the new active section.
        },
        onHashChange: function () {
          var m = (location.hash || '').match(/^#qs-([\w-]+)$/);
          if (m) this.activeSection = m[1];
        }
      }
    });

    app.mount('#quickstart-app');
  });

  /* ═══════════════════════════════════════════════════════════════════
     PUBLIC EXPORTS
     ─────────────────────────────────────────────────────────────────── */
  window.quickstartToMarkdown         = quickstartToMarkdown;
  window.quickstartToMarkdownSection  = quickstartToMarkdownSection;
  window.QUICKSTART_RENDERERS         = SECTION_RENDERERS;
  window.QUICKSTART_HAS_CONTENT       = hasContent;
})();
