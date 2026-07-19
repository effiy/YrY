/*
 * @file: index.js
 * @purpose: Vue 3 orchestrator for the rui-report-quickstart template.
 *            The page shell (toolbar, TOC, sections, footer), the
 *            command palette (Cmd/Ctrl+K), the command detail modal,
 *            the markdown exporter, and the global state live here.
 *            All reusable Vue components have been moved to
 *            components/<category>/<name>/ and are registered on the
 *            app via the global `window.qsXxx` once their *-ready
 *            event has fired.
 *
 * @four_file_layout: data.js · index.html · index.css · index.js
 * @shared_dependencies: loader.js (Vue 3 + rui component bootstrap),
 *                       rui-back-top, rui-toast, rui-badge, rui-tag-chip,
 *                       rui-progress-bar, rui-stats-grid.
 *
 * @page_components (consumed via window.qsXxx):
 *   qs-donut          — pure SVG donut chart with center label
 *   qs-coverage-cell  — radial progress cells, one per section
 *   qs-mini-bars      — compact group bar list
 *   qs-sparkline      — inline SVG line + area chart
 *   qs-hero-path      — 5-step onboarding node graph
 *   qs-coverage-gaps  — coverage-gap callout panel
 *   qs-skill-landscape — skill-group treemap
 *   qs-stack-diagram  — layered tech-stack diagram
 *   qs-overview, qs-concepts, qs-directory-map, qs-onboarding-flow,
 *   qs-commands, qs-faq, qs-further-reading
 *   qs-palette        — Cmd/Ctrl+K search overlay
 *   qs-modal          — command detail modal
 *
 * @interactive_features:
 *   · Command palette (Cmd/Ctrl+K)  — searches sections, concepts,
 *                                      commands, FAQ across the page
 *   · Concept role chips            — multi-select filter
 *   · FAQ collapse                  — click question to toggle
 *   · Onboarding step tracker       — localStorage, progress bar
 *   · Command detail modal          — click any command row
 *   · Animated count-up             — score ring
 *   · Deep link via URL hash        — auto-scroll on load
 *   · Keyboard shortcuts            — j/k nav, t top, c copy,
 *                                      Cmd/Ctrl+K palette, ? help
 */
(() => {
  'use strict';

  const NS = (typeof window !== 'undefined' && window.__ruiReportQuickstartNS__) || 'rui-report-quickstart';
  if (typeof console !== 'undefined' && console.log) {
    console.log('[' + NS + '] index.js boot');
  }

  /* ═══════════════════════════════════════════════════════════════
     A. SHARED COMPONENT REGISTRATION
     ─────────────────────────────────────────────────────────────── */
  const SHARED_COMPONENTS = [
    'rui-back-top', 'rui-toast', 'rui-badge',
    'rui-tag-chip', 'rui-progress-bar', 'rui-stats-grid'
  ];
  function registerSharedComponents() {
    if (typeof window === 'undefined') return;
    if (typeof window.ruiRegisterComponent !== 'function') return;
    SHARED_COMPONENTS.forEach((name) => {
      try {
        if (window[name] && typeof window.ruiRegisterComponent === 'function') {
          window.ruiRegisterComponent(name, window[name]);
        }
      } catch (err) {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('[' + NS + '] shared component skipped:', name, err);
        }
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     B. CLIPBOARD + TOAST HELPERS
     ─────────────────────────────────────────────────────────────── */
  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext !== false) {
      return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    }
    return Promise.resolve(fallbackCopy(text));
  }
  function fallbackCopy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      ta.style.pointerEvents = 'none';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch (_) { return false; }
  }
  function notify(level, message) {
    if (typeof window !== 'undefined' && window.ruiToast && typeof window.ruiToast.show === 'function') {
      try { window.ruiToast.show({ level, message, timeout: 1800 }); return; }
      catch (_) { /* fall through to console */ }
    }
    if (typeof console !== 'undefined' && console.log) console.log('[' + NS + ']', level, message);
  }

  /* ═══════════════════════════════════════════════════════════════
     C. THEME + FILTER STATE
     ─────────────────────────────────────────────────────────────── */
  const THEME_KEY    = 'rui-report-quickstart.theme';
  const FILTER_KEY   = 'rui-report-quickstart.filter';
  const COLLAPSE_KEY = 'rui-report-quickstart.collapsed';
  const STEPS_KEY    = 'rui-report-quickstart.steps-done';
  const FAQ_KEY      = 'rui-report-quickstart.faq-collapsed';
  const ROLES_KEY    = 'rui-report-quickstart.role-filter';
  const FILTER_OPTIONS = [
    { value: 'all',          label: 'All' },
    { value: 'pass-partial', label: 'Issues only' },
    { value: 'pass',         label: 'Green only' }
  ];
  const THEME_OPTIONS = [
    { value: 'system', label: 'Auto' },
    { value: 'light',  label: 'Light' },
    { value: 'dark',   label: 'Dark' }
  ];

  function readStored(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (_) { return fallback; }
  }
  function writeStored(key, value) {
    try { localStorage.setItem(key, value); } catch (_) { /* ignore */ }
  }
  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'light' || theme === 'dark') {
      root.setAttribute('data-theme', theme);
    } else {
      root.removeAttribute('data-theme');
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     D. MARKDOWN EXPORTER
     ─────────────────────────────────────────────────────────────── */
  function gradeOf(composite) {
    if (composite >= 90) return 'A';
    if (composite >= 80) return 'B';
    if (composite >= 70) return 'C';
    if (composite >= 60) return 'D';
    return 'F';
  }
  function escapeMd(s) {
    if (s == null) return '';
    return String(s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
  }
  function quickstartToMarkdown(data) {
    if (!data) return '';
    const lines = [];
    const h = data.header || {};
    lines.push('# ' + (h.title || 'Quickstart'));
    if (h.tagline) lines.push('', h.tagline);
    if (h.scope) lines.push('', '_Scope: ' + h.scope + '_');
    if (h.audience) lines.push('', '_Audience: ' + h.audience + '_');
    if (h.generatedAt) lines.push('', '_Generated: ' + h.generatedAt + '_');

    if (data.score) {
      lines.push('', '## Score', '');
      lines.push('- Composite: **' + data.score.composite + ' / 100** (' + gradeOf(data.score.composite) + ')');
      if (data.score.summary) lines.push('- Summary: ' + data.score.summary);
    }
    (data.sections || []).forEach((s, idx) => {
      lines.push('', '## ' + (idx + 1) + '. ' + s.title);
      if (s.coverage != null) lines.push('', '_Coverage: ' + s.coverage + '% · Verdict: ' + (s.verdict || 'n/a') + '_');
      renderSectionBody(lines, s);
    });
    return lines.join('\n');
  }
  function renderSectionBody(lines, s) {
    if (!s) return;
    if (s.kind === 'overview') {
      if (s.summary) lines.push('', s.summary);
      if (Array.isArray(s.tiles)) {
        lines.push('', '| Field | Value |', '| --- | --- |');
        s.tiles.forEach((t) => lines.push('| ' + t.label + ' | ' + escapeMd(t.value) + ' |'));
      }
      if (Array.isArray(s.stats)) {
        lines.push('', '| Stat | Value |', '| --- | --- |');
        s.stats.forEach((t) => lines.push('| ' + t.label + ' | ' + t.value + ' |'));
      }
    } else if (s.kind === 'concepts') {
      (s.items || []).forEach((c) => {
        lines.push('', '### ' + c.name + (c.role ? '  \n`' + c.role + '`' : ''));
        if (c.description) lines.push('', c.description);
        if (c.file) lines.push('', '_Location: `' + c.file + (c.line ? ':' + c.line : '') + '`_');
      });
    } else if (s.kind === 'directory-map') {
      if (s.tree) lines.push('', '```', s.tree, '```');
      if (Array.isArray(s.annotations)) {
        s.annotations.forEach((a) => {
          lines.push('', '- **`' + a.path + '`** — ' + (a.note || ''));
        });
      }
    } else if (s.kind === 'onboarding-flow') {
      (s.steps || []).forEach((step, i) => {
        lines.push('', (i + 1) + '. **' + (step.action || 'Step') + '** — ' + (step.outcome || ''));
        if (step.command) lines.push('   ```', '   ' + step.command, '   ```');
      });
    } else if (s.kind === 'commands') {
      lines.push('', '| Command | Description | Source |', '| --- | --- | --- |');
      (s.items || []).forEach((c) => {
        lines.push('| `' + c.name + '` | ' + escapeMd(c.description || '') + ' | ' + (c.source || '') + ' |');
      });
    } else if (s.kind === 'faq') {
      (s.items || []).forEach((q) => {
        lines.push('', '**Q: ' + q.question + '**');
        lines.push('', q.answer || '');
        if (q.source) lines.push('', '_Source: ' + q.source + '_');
      });
    } else if (s.kind === 'further-reading') {
      (s.items || []).forEach((r) => {
        lines.push('', '- [' + r.title + '](' + (r.href || '#') + ') — ' + (r.description || '') + (r.kind ? ' _(' + r.kind + ')_' : ''));
      });
    }
    if (s.todo) {
      lines.push('', '> **TODO** — ' + s.todo.reason);
      if (s.todo.command) lines.push('> Run: `' + s.todo.command + '`');
    }
  }
  if (typeof window !== 'undefined') {
    window.quickstartToMarkdown = quickstartToMarkdown;
  }

  /* ═══════════════════════════════════════════════════════════════
     E. ANIMATION HELPERS
     ─────────────────────────────────────────────────────────────── */
  /** Animate a 0→value counter over `duration` ms using requestAnimationFrame. */
  function animateNumber(from, to, duration, onUpdate, onDone) {
    if (typeof requestAnimationFrame === 'undefined') {
      onUpdate(to); onDone && onDone(); return;
    }
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); /* ease-out cubic */
      const v = Math.round(from + (to - from) * eased);
      onUpdate(v);
      if (t < 1) requestAnimationFrame(step);
      else onDone && onDone();
    }
    requestAnimationFrame(step);
  }

  /* ═══════════════════════════════════════════════════════════════
     F. PAGE COMPONENTS
     Each component lives in components/<category>/<name>/ and is
     exposed on `window.qsXxx` after its *-ready event. We wait for
     all of them in parallel before mounting the Vue app.
     ─────────────────────────────────────────────────────────────── */
  const PAGE_COMPONENTS = [
    { tag: 'qs-donut',            key: 'qsDonut',            event: 'qs-donut-ready'            },
    { tag: 'qs-coverage-cell',    key: 'qsCoverageCell',     event: 'qs-coverage-cell-ready'    },
    { tag: 'qs-mini-bars',        key: 'qsMiniBars',         event: 'qs-mini-bars-ready'        },
    { tag: 'qs-sparkline',        key: 'qsSparkline',        event: 'qs-sparkline-ready'        },
    { tag: 'qs-hero-path',        key: 'qsHeroPath',         event: 'qs-hero-path-ready'        },
    { tag: 'qs-coverage-gaps',    key: 'qsCoverageGaps',     event: 'qs-coverage-gaps-ready'    },
    { tag: 'qs-skill-landscape',  key: 'qsSkillLandscape',   event: 'qs-skill-landscape-ready'  },
    { tag: 'qs-stack-diagram',    key: 'qsStackDiagram',     event: 'qs-stack-diagram-ready'    },
    { tag: 'qs-overview',         key: 'qsOverview',         event: 'qs-overview-ready'         },
    { tag: 'qs-concepts',         key: 'qsConcepts',         event: 'qs-concepts-ready'         },
    { tag: 'qs-directory-map',    key: 'qsDirectoryMap',     event: 'qs-directory-map-ready'    },
    { tag: 'qs-onboarding-flow',  key: 'qsOnboardingFlow',   event: 'qs-onboarding-flow-ready'  },
    { tag: 'qs-commands',         key: 'qsCommands',         event: 'qs-commands-ready'         },
    { tag: 'qs-faq',              key: 'qsFaq',              event: 'qs-faq-ready'              },
    { tag: 'qs-further-reading',  key: 'qsFurtherReading',   event: 'qs-further-reading-ready'  },
    { tag: 'qs-palette',          key: 'qsPalette',          event: 'qs-palette-ready'          },
    { tag: 'qs-modal',            key: 'qsModal',            event: 'qs-modal-ready'            }
  ];
  function whenAllPageComponentsReady(timeoutMs) {
    const pending = PAGE_COMPONENTS.map((c) => {
      if (window[c.key] && window[c.key].name) return Promise.resolve(c);
      return new Promise((resolve) => {
        const onReady = () => resolve(c);
        window.addEventListener(c.event, onReady, { once: true });
      });
    });
    const timeout = new Promise((resolve) => setTimeout(() => resolve('timeout'), timeoutMs || 5000));
    return Promise.race([Promise.all(pending), timeout]);
  }

  /* ═══════════════════════════════════════════════════════════════
     G. SEARCH INDEX + HELPERS
     ─────────────────────────────────────────────────────────────── */
  function buildIndex(sections) {
    const idx = [];
    (sections || []).forEach((s) => {
      idx.push({ kind: 'section', id: s.id, title: s.title, section: s.title, search: s.title });
      if (s.kind === 'concepts' && s.items) {
        s.items.forEach((c) => idx.push({
          kind: 'concept', id: s.id, section: s.title, title: c.name,
          subtitle: c.role, search: [c.name, c.role, c.description, c.file].filter(Boolean).join(' '),
          ref: c
        }));
      } else if (s.kind === 'commands' && s.items) {
        s.items.forEach((c) => idx.push({
          kind: 'command', id: s.id, section: s.title, title: c.name,
          subtitle: c.description, search: [c.name, c.command, c.description, c.source].filter(Boolean).join(' '),
          ref: c
        }));
      } else if (s.kind === 'faq' && s.items) {
        s.items.forEach((q) => idx.push({
          kind: 'faq', id: s.id, section: s.title, title: q.question,
          subtitle: (q.answer || '').slice(0, 100) + (q.answer && q.answer.length > 100 ? '…' : ''),
          search: [q.question, q.answer, q.source].filter(Boolean).join(' '),
          ref: q
        }));
      } else if (s.kind === 'further-reading' && s.items) {
        s.items.forEach((r) => idx.push({
          kind: 'reading', id: s.id, section: s.title, title: r.title,
          subtitle: r.description, search: [r.title, r.description, r.kind, r.href].filter(Boolean).join(' '),
          ref: r
        }));
      } else if (s.kind === 'onboarding-flow' && s.steps) {
        s.steps.forEach((step, i) => idx.push({
          kind: 'onboarding', id: s.id, section: s.title,
          title: 'Step ' + (i + 1) + ' — ' + (step.action || ''),
          subtitle: (step.command || step.outcome || ''),
          search: [step.action, step.outcome, step.command, step.file].filter(Boolean).join(' '),
          ref: step
        }));
      }
    });
    return idx;
  }

  /* ═══════════════════════════════════════════════════════════════
     H. MAIN TEMPLATE
     ─────────────────────────────────────────────────────────────── */
  const TEMPLATE = String.raw`
<div class="qs-shell">
  <!-- Header -->
  <header class="qs-header qs-fade-in">
    <div class="qs-header-meta">
      <span class="qs-pill">{{ header.kind || 'Quickstart' }}</span>
      <span v-if="header.scope"><strong>Scope:</strong> <code class="qs-mono">{{ header.scope }}</code></span>
      <span v-if="header.audience"><strong>Audience:</strong> {{ header.audience }}</span>
      <span v-if="header.generatedAt"><strong>Generated:</strong> {{ header.generatedAt }}</span>
    </div>
    <h1 class="qs-title">{{ header.title }}</h1>
    <p class="qs-tagline" v-if="header.tagline">{{ header.tagline }}</p>
  </header>

  <!-- 2-column layout: TOC + main -->
  <div class="qs-layout" style="margin-top: var(--qs-space-xl)">
    <aside class="qs-toc" id="qs-toc" aria-label="On this page">
      <div class="qs-toc-title">On this page</div>
      <ul class="qs-toc-list">
        <li
          v-for="(s, idx) in visibleSections" :key="s.id"
          :class="{ 'is-active': activeSection === s.id }">
          <a :href="'#' + s.id" @click="onTocClick(s, $event)">
            <span class="qs-toc-num">{{ idx + 1 }}</span>
            <span class="qs-toc-title-text">{{ s.title }}</span>
            <span :class="['qs-toc-dot', 'is-' + (s.verdict || 'pass')]"
              :aria-label="'Verdict: ' + (s.verdict || 'pass')"></span>
          </a>
        </li>
      </ul>
      <div class="qs-visually-hidden" aria-live="polite" data-shortcut-announcer></div>
    </aside>

    <main class="qs-main" id="qs-main" :data-filter="filter">
      <!-- Score banner with charts -->
      <section class="qs-score qs-fade-up" aria-label="Score summary">
        <div class="qs-score-summary">
          <span class="qs-score-label">Composite score</span>
          <span class="qs-score-callout" v-if="score.summary">{{ score.summary }}</span>
          <div class="qs-mini-bars" style="margin-top: var(--qs-space-md);" v-if="groupBars.length">
            <qs-mini-bars :rows="groupBars" />
          </div>
        </div>
        <div class="qs-score-figure" style="gap: var(--qs-space-2xl);">
          <div style="display: flex; flex-direction: column; align-items: center; gap: var(--qs-space-md);">
            <qs-donut
              :segments="verdictSegments"
              :value="displayScore"
              label="Composite"
              :size="140"
              :thickness="14"
              :legend="true" />
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--qs-space-sm);">
            <span class="qs-score-composite">{{ displayScore }}<span style="font-size:18px;font-weight:600;color:var(--qs-text-muted)">/100</span></span>
            <span :class="['qs-score-grade', 'is-' + score.grade]">{{ score.grade }}</span>
            <span class="qs-mono qs-muted" style="font-size: var(--qs-text-xs);">
              {{ passCount }} pass · {{ partialCount }} partial · {{ failCount }} fail
            </span>
          </div>
        </div>
      </section>

      <!-- Per-section coverage grid -->
      <section class="qs-fade-up" aria-label="Coverage by section">
        <div class="qs-coverage-grid">
          <qs-coverage-cell
            v-for="s in visibleSections" :key="s.id"
            :label="s.title"
            :value="s.coverage || 0"
            :verdict="s.verdict || 'pass'" />
        </div>
      </section>

      <!-- HERO PANEL -->
      <section class="qs-hero qs-fade-up" aria-label="Onboarding path">
        <div class="qs-hero-lead">
          <span class="qs-hero-eyebrow">Quick onboarding</span>
          <h2 class="qs-hero-title">Ship your first skill in ≈ 18 min</h2>
          <p class="qs-hero-sub">
            Five ordered steps. Each one owns a specific surface of
            the project — README, CLAUDE.md, docs/, arch scenes,
            and the verify gate. Hover a step to read its outcome;
            the sparkline shows the coverage trend over the last 7
            release checkpoints.
          </p>
          <div class="qs-hero-stats">
            <div class="qs-hero-stat">
              <span class="qs-hero-stat-value">
                {{ displayScore }}<span class="qs-hero-stat-suffix">/100</span>
              </span>
              <span class="qs-hero-stat-label">Coverage</span>
            </div>
            <div class="qs-hero-stat">
              <span class="qs-hero-stat-value">
                {{ totalMinutes }}<span class="qs-hero-stat-suffix">min</span>
              </span>
              <span class="qs-hero-stat-label">Time to first ship</span>
            </div>
            <div class="qs-hero-stat">
              <span class="qs-hero-stat-value">
                {{ doneCount }}<span class="qs-hero-stat-suffix">/ 5</span>
              </span>
              <span class="qs-hero-stat-label">Steps cleared</span>
            </div>
            <div class="qs-hero-stat">
              <span class="qs-hero-stat-value">
                {{ totalManifests }}<span class="qs-hero-stat-suffix">skills</span>
              </span>
              <span class="qs-hero-stat-label">Catalog size</span>
            </div>
          </div>
        </div>
        <div class="qs-hero-cta">
          <div class="qs-hero-cta-time">
            <strong>≈ {{ totalMinutes }}</strong>
            <span>minutes to first skill</span>
          </div>
          <button
            type="button"
            class="qs-hero-cta-button"
            :class="{ 'is-active': allStepsDone }"
            @click="onCtaStart"
            :aria-label="ctaLabel">
            {{ allStepsDone ? 'Onboarded — replay' : (overviewHero.cta || 'Start onboarding') }}
          </button>
          <p class="qs-hero-cta-hint" v-if="overviewHero.ctaHint">
            <kbd>⌘</kbd> + <kbd>Enter</kbd> marks this report as onboarded
          </p>
        </div>
        <qs-hero-path
          v-if="overviewHero && overviewHero.steps && overviewHero.steps.length"
          :steps="overviewHero.steps"
          :done-set="heroDoneSet" />

        <qs-coverage-gaps
          v-if="overviewHero && overviewHero.gaps && overviewHero.gaps.length"
          :gaps="overviewHero.gaps"
          :hint="overviewHero.gapsHint" />
      </section>

      <!-- Sections -->
      <section
        v-for="(s, idx) in visibleSections" :key="s.id"
        :id="s.id"
        :class="['qs-section', 'qs-fade-up', { 'is-collapsed': collapsed[s.id] }]"
        :data-verdict="s.verdict || 'pass'">
        <header class="qs-section-head" :aria-expanded="!collapsed[s.id]" @click="toggleSection(s.id)">
          <span class="qs-section-index">{{ idx + 1 }}</span>
          <span class="qs-section-title">{{ s.title }}</span>
          <span :class="['qs-verdict', 'is-' + (s.verdict || 'pass')]" v-if="s.verdict">{{ s.verdict }}</span>
          <span class="qs-coverage" v-if="s.coverage != null" @click.stop>
            <span class="qs-coverage-track">
              <span :class="['qs-coverage-fill', 'is-' + (s.verdict || 'pass')]"
                :style="{ width: s.coverage + '%' }"></span>
            </span>
            <span class="qs-coverage-value">{{ s.coverage }}%</span>
          </span>
          <button
            class="qs-section-copy"
            :class="{ 'is-copied': copyState[s.id] }"
            :aria-label="copyState[s.id] ? 'Section copied' : 'Copy this section as Markdown'"
            @click.stop="copySection(s)">
            <span class="qs-section-copy-icon">{{ copyState[s.id] ? '✓' : '⧉' }}</span>
            <span>{{ copyState[s.id] ? 'Copied' : 'Copy' }}</span>
          </button>
          <span class="qs-section-toggle" aria-hidden="true">▾</span>
        </header>
        <div class="qs-section-body">
          <component :is="'qs-' + s.kind" v-bind="sectionProps(s)" v-on="sectionListeners(s)"></component>
        </div>
      </section>

      <footer class="qs-footer">
        <span>
          <span class="qs-kbd">j</span>/<span class="qs-kbd">k</span> nav
          <span class="qs-kbd">t</span> top
          <span class="qs-kbd">c</span> copy
          <span class="qs-kbd">/</span> search
          <span class="qs-kbd">⌘K</span> palette
          <span class="qs-kbd">?</span> help
        </span>
        <span>Static analysis only · no project execution</span>
      </footer>
    </main>
  </div>
</div>
`;

  /* ═══════════════════════════════════════════════════════════════
     I. MOUNT
     ─────────────────────────────────────────────────────────────── */
  function mount() {
    const root = document.getElementById('quickstart-app');
    if (!root) return;
    if (typeof window === 'undefined' || typeof window.Vue === 'undefined') {
      console.error('[' + NS + '] Vue is not available; aborting mount');
      return;
    }
    const Vue = window.Vue;
    const { createApp, ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

    let app = null;

    const initialDatasetKey = (function () {
      const all = (window.QUICKSTART_DATA && window.QUICKSTART_DATA.datasets) || [];
      if (!all.length) return 'default';
      return all[0].key || 'default';
    }());

    // The full Vue 3 root config — assembled below so the closure
    // can use the constants declared in this scope.
    const rootConfig = {
      setup() {
        const datasets = ref((window.QUICKSTART_DATA && window.QUICKSTART_DATA.datasets) || []);
        const datasetKey = ref(initialDatasetKey);
        const filterOptions = ref(FILTER_OPTIONS);
        const themeOptions  = ref(THEME_OPTIONS);
        const filter  = ref(readStored(FILTER_KEY, 'all'));
        const theme   = ref(readStored(THEME_KEY, 'system'));
        const collapsed = reactive({});
        const copyState = reactive({ all: false });
        const activeSection = ref(null);
        const search = ref('');
        const searchFocused = ref(false);
        const doneSteps = reactive(new Set());
        const faqCollapsed = reactive(new Set());
        const activeRoles = ref([]);

        // State for palette + modal (rendered via separate Vue apps)
        const paletteOpen = ref(false);
        const modalCommand = ref(null);

        // Initialize persisted state
        try {
          const s = JSON.parse(localStorage.getItem(COLLAPSE_KEY) || '{}');
          Object.keys(s).forEach((k) => { collapsed[k] = !!s[k]; });
        } catch (_) { /* ignore */ }
        try {
          const a = JSON.parse(localStorage.getItem(STEPS_KEY) || '[]');
          a.forEach((i) => doneSteps.add(i));
        } catch (_) { /* ignore */ }
        try {
          const f = JSON.parse(localStorage.getItem(FAQ_KEY) || '[]');
          f.forEach((i) => faqCollapsed.add(i));
        } catch (_) { /* ignore */ }
        try {
          const r = JSON.parse(localStorage.getItem(ROLES_KEY) || '[]');
          activeRoles.value = Array.isArray(r) ? r : [];
        } catch (_) { /* ignore */ }

        applyTheme(theme.value);

        // ── Computed: current dataset + flattened sections
        const current = computed(() => {
          const list = datasets.value;
          if (!list.length) return null;
          const entry = list.find((d) => d.key === datasetKey.value) || list[0];
          return (entry && entry.data) || entry || null;
        });
        const header = computed(() => (current.value && current.value.header) || {});
        const score  = computed(() => {
          const s = (current.value && current.value.score) || { composite: 0, summary: '', grade: 'C' };
          return Object.assign({}, s, { grade: s.grade || gradeOf(s.composite) });
        });
        const sections = computed(() => (current.value && current.value.sections) || []);

        // ── Search + filter
        const visibleSections = computed(() => {
          const q = search.value.trim().toLowerCase();
          let list = sections.value;
          if (q) {
            list = list.filter((s) => {
              const hay = (s.title + ' ' + (s.items ? JSON.stringify(s.items) : '') + ' ' + (s.summary || '') + ' ' + (s.steps ? JSON.stringify(s.steps) : '')).toLowerCase();
              return hay.indexOf(q) >= 0;
            });
          }
          if (filter.value === 'pass-partial') list = list.filter((s) => (s.verdict || 'pass') !== 'fail');
          else if (filter.value === 'pass') list = list.filter((s) => (s.verdict || 'pass') === 'pass');
          return list;
        });

        // ── Score breakdown by verdict
        const verdictCounts = computed(() => {
          const v = { pass: 0, partial: 0, fail: 0 };
          sections.value.forEach((s) => {
            const verdict = s.verdict || (s.coverage >= 90 ? 'pass' : s.coverage >= 50 ? 'partial' : 'fail');
            v[verdict] = (v[verdict] || 0) + 1;
          });
          return v;
        });
        const passCount    = computed(() => verdictCounts.value.pass);
        const partialCount = computed(() => verdictCounts.value.partial);
        const failCount    = computed(() => verdictCounts.value.fail);
        const verdictSegments = computed(() => {
          const v = verdictCounts.value;
          const out = [];
          if (v.pass)    out.push({ value: v.pass,    cls: 'is-pass',    label: 'Pass' });
          if (v.partial) out.push({ value: v.partial, cls: 'is-partial', label: 'Partial' });
          if (v.fail)    out.push({ value: v.fail,    cls: 'is-fail',    label: 'Fail' });
          return out;
        });

        // ── Group bars (skill group breakdown — synthesised from concepts)
        const groupBars = computed(() => {
          const concepts = sections.value.find((s) => s.kind === 'concepts');
          if (!concepts || !concepts.items) return [];
          const groups = {};
          concepts.items.forEach((c) => {
            const group = (c.role || 'other');
            groups[group] = (groups[group] || 0) + 1;
          });
          return Object.keys(groups).map((g) => ({
            name: g,
            value: groups[g],
            color: 'var(--qs-accent)'
          }));
        });

        // ── Animated counter for the score
        const displayScore = ref(0);
        watch(score, (s) => {
          animateNumber(displayScore.value, s.composite || 0, 600, (v) => { displayScore.value = v; });
        }, { immediate: true });

        // ── Search index for palette
        const searchIndex = computed(() => buildIndex(sections.value));

        // ── Theme
        function setTheme(value) {
          theme.value = value;
          applyTheme(value);
          writeStored(THEME_KEY, value);
        }
        // ── Filter
        function setFilter(value) {
          filter.value = value;
          writeStored(FILTER_KEY, value);
        }
        // ── Section collapse
        function toggleSection(id) {
          collapsed[id] = !collapsed[id];
          try { localStorage.setItem(COLLAPSE_KEY, JSON.stringify(collapsed)); } catch (_) { /* ignore */ }
        }
        // ── Onboarding steps
        function setDoneSteps(next) {
          doneSteps.clear();
          (next || new Set()).forEach((i) => doneSteps.add(i));
          try { localStorage.setItem(STEPS_KEY, JSON.stringify(Array.from(doneSteps))); } catch (_) { /* ignore */ }
        }

        // ── HERO: derived data + interactions
        const overviewHero = computed(() => {
          const s = sections.value.find((x) => x.id === 'overview');
          return (s && s.hero) || { steps: [], totalMinutes: 0, cta: 'Start onboarding' };
        });
        const overviewLandscape = computed(() => {
          const s = sections.value.find((x) => x.id === 'overview');
          return (s && s.landscape) || { total: 0, groups: [], trend: [] };
        });
        const overviewStack = computed(() => {
          const s = sections.value.find((x) => x.id === 'overview');
          return (s && s.stack) || { layers: [] };
        });
        const heroDoneSet = computed(() => {
          const set = new Set();
          const steps = overviewHero.value.steps || [];
          doneSteps.forEach((i) => {
            if (steps[i] && steps[i].id) set.add(steps[i].id);
          });
          return set;
        });
        const totalMinutes = computed(() => {
          const steps = overviewHero.value.steps || [];
          return steps.reduce((acc, s) => acc + (Number(s.minutes) || 0), 0)
              || overviewHero.value.totalMinutes || 0;
        });
        const totalSteps = computed(() => (overviewHero.value.steps || []).length);
        const doneCount = computed(() => heroDoneSet.value.size);
        const allStepsDone = computed(() => totalSteps.value > 0 && doneCount.value >= totalSteps.value);
        const totalManifests = computed(() => {
          const ls = overviewLandscape.value;
          if (ls && ls.total) return ls.total;
          const stats = (sections.value.find((x) => x.id === 'overview') || {}).stats || [];
          const m = stats.find((x) => /manifest|skill/i.test(x.label));
          return m ? m.value : 0;
        });
        const ctaLabel = computed(() => {
          if (allStepsDone.value) return 'Onboarded — replay onboarding';
          return (overviewHero.value && overviewHero.value.cta) || 'Start onboarding';
        });
        function onCtaStart() {
          if (allStepsDone.value) {
            setDoneSteps(new Set());
            return;
          }
          const steps = overviewHero.value.steps || [];
          setDoneSteps(new Set(steps.map((_, i) => i)));
          const el = document.getElementById('onboarding-flow');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // ── FAQ collapse
        function toggleFaq(i) {
          if (faqCollapsed.has(i)) faqCollapsed.delete(i);
          else faqCollapsed.add(i);
          try { localStorage.setItem(FAQ_KEY, JSON.stringify(Array.from(faqCollapsed))); } catch (_) { /* ignore */ }
        }
        // ── Active roles
        watch(activeRoles, (val) => {
          try { localStorage.setItem(ROLES_KEY, JSON.stringify(val)); } catch (_) { /* ignore */ }
        });

        // ── Copy feedback helper
        function flashCopy(key) {
          copyState[key] = true;
          setTimeout(() => { copyState[key] = false; }, 1500);
        }

        // ── Markdown export
        function buildMarkdown(scope) {
          if (!current.value) return '';
          if (scope === 'all') return quickstartToMarkdown(current.value);
          return quickstartToMarkdown({ header: current.value.header, sections: [scope] });
        }
        async function copySection(s) {
          const md = buildMarkdown(s);
          const ok = await copyToClipboard(md);
          flashCopy(s.id);
          notify(ok ? 'pass' : 'fail', ok ? 'Section copied as Markdown' : 'Copy failed');
        }
        async function copyAllMarkdown() {
          const md = buildMarkdown('all');
          const ok = await copyToClipboard(md);
          flashCopy('all');
          notify(ok ? 'pass' : 'fail', ok ? 'Report copied as Markdown' : 'Copy failed');
        }

        // ── Section props + listeners
        function sectionProps(s) {
          const p = { section: s };
          if (s.kind === 'concepts') p.roleFilter = activeRoles.value;
          if (s.kind === 'onboarding-flow') { p.doneSteps = doneSteps; }
          if (s.kind === 'faq') { p.collapsed = Array.from(faqCollapsed); }
          return p;
        }
        function sectionListeners(s) {
          const l = {};
          if (s.kind === 'onboarding-flow') {
            l['update:doneSteps'] = (val) => setDoneSteps(val);
            l['open-command'] = openCommand;
          }
          if (s.kind === 'commands') l['open-command'] = openCommand;
          if (s.kind === 'faq') l['toggle-question'] = toggleFaq;
          return l;
        }

        // ── TOC click → set active section
        function onTocClick(s, e) {
          activeSection.value = s.id;
        }

        // ── Command palette + modal
        function openPalette() {
          paletteOpen.value = true;
          mountPaletteIfNeeded();
        }
        function closePalette() { paletteOpen.value = false; }
        function onPalettePick(item) {
          closePalette();
          if (!item) return;
          if (item.kind === 'command' && item.ref) {
            openCommand(item.ref);
          } else if (item.kind === 'onboarding' && item.ref) {
            openCommand({ name: 'onboarding-step-' + (item.ref.order || ''), command: item.ref.command, description: item.ref.action, source: 'Onboarding flow' });
          } else if (item.id) {
            const el = document.getElementById(item.id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            activeSection.value = item.id;
          }
        }
        function openCommand(cmd) { modalCommand.value = cmd; mountModalIfNeeded(); }
        function closeModal() { modalCommand.value = null; }

        // ── Scroll spy + progress + keyboard
        let observer = null;
        let scrollHandler = null;
        let keyHandler = null;
        let progressBar = null;
        const sectionRefs = [];

        function setActiveSection(id) { activeSection.value = id; }

        function initChrome() {
          progressBar = document.querySelector('[data-progress-bar]');
          sections.value.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) sectionRefs.push({ id: s.id, el });
          });
          if ('IntersectionObserver' in window && sectionRefs.length) {
            observer = new IntersectionObserver((entries) => {
              let best = null;
              entries.forEach((e) => {
                if (!e.isIntersecting) return;
                if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
              });
              if (best) {
                const idx = sectionRefs.findIndex((r) => r.el === best.target);
                if (idx >= 0) setActiveSection(sectionRefs[idx].id);
              }
            }, { rootMargin: '-30% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });
            sectionRefs.forEach((r) => observer.observe(r.el));
          }
          scrollHandler = function () {
            if (!progressBar) return;
            const doc = document.documentElement;
            const max = doc.scrollHeight - window.innerHeight;
            const ratio = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
            progressBar.style.width = (ratio * 100).toFixed(1) + '%';
          };
          window.addEventListener('scroll', scrollHandler, { passive: true });
          scrollHandler();

          keyHandler = function (e) {
            const t = e.target;
            if (t && (t.matches('input, textarea, select, [contenteditable]'))) {
              if (e.key === 'Escape' && paletteOpen.value) { closePalette(); e.preventDefault(); }
              return;
            }
            const k = e.key;
            if ((e.metaKey || e.ctrlKey) && (k === 'k' || k === 'K')) {
              e.preventDefault();
              if (paletteOpen.value) closePalette(); else openPalette();
              return;
            }
            if (k === 'j') { e.preventDefault(); navigateSection(+1); }
            else if (k === 'k') { e.preventDefault(); navigateSection(-1); }
            else if (k === 't') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
            else if (k === 'c') { e.preventDefault(); copyAllMarkdown(); }
            else if (k === '/') {
              e.preventDefault();
              const s = document.querySelector('.qs-search');
              if (s) s.focus();
            }
            else if (k === '?') { e.preventDefault(); showHelp(); }
            else if (k === 'Escape') {
              if (paletteOpen.value) { closePalette(); e.preventDefault(); }
              else if (modalCommand.value) { closeModal(); e.preventDefault(); }
            }
          };
          window.addEventListener('keydown', keyHandler);
        }

        function navigateSection(delta) {
          if (!sectionRefs.length) return;
          const list = sectionRefs;
          const curIdx = list.findIndex((r) => r.id === activeSection.value);
          let next = curIdx + delta;
          if (curIdx < 0) next = delta > 0 ? 0 : list.length - 1;
          next = Math.max(0, Math.min(list.length - 1, next));
          const target = list[next];
          if (target) {
            target.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSection(target.id);
          }
        }
        function showHelp() {
          notify('info', 'Shortcuts — j/k nav · t top · c copy · / search · ⌘K palette · ? help');
        }

        // ── Palette / modal Vue sub-apps (lazy mount)
        let paletteApp = null;
        let modalApp = null;
        function mountPaletteIfNeeded() {
          if (paletteApp) return;
          const mountRoot = document.getElementById('qs-palette-root');
          if (!mountRoot) return;
          paletteApp = createApp({
            data() { return { open: false, index: [] }; },
            methods: {
              setOpen(open, index) {
                this.index = index || [];
                this.open = open;
                if (open) {
                  document.body.style.overflow = 'hidden';
                  mountRoot.setAttribute('aria-hidden', 'false');
                } else {
                  document.body.style.overflow = '';
                  mountRoot.setAttribute('aria-hidden', 'true');
                }
              }
            },
            render() {
              if (!this.open) return null;
              return Vue.h(window.qsPalette, {
                index: this.index,
                onClose: () => this.setOpen(false),
                onPick: (it) => onPalettePick(it)
              });
            }
          });
          paletteApp.mount('#qs-palette-root');
          paletteApp._instance.setupState.open = paletteOpen.value;
          paletteApp._instance.setupState.index = searchIndex.value;
          if (paletteOpen.value) {
            document.body.style.overflow = 'hidden';
            mountRoot.setAttribute('aria-hidden', 'false');
          }
        }
        function mountModalIfNeeded() {
          if (modalApp) return;
          const mountRoot = document.getElementById('qs-modal-root');
          if (!mountRoot) return;
          modalApp = createApp({
            data() { return { open: false, command: null }; },
            methods: {
              setOpen(open, command) {
                this.command = command;
                this.open = open;
                mountRoot.setAttribute('aria-hidden', open ? 'false' : 'true');
              }
            },
            render() {
              if (!this.open || !this.command) return null;
              return Vue.h(window.qsModal, { command: this.command, onClose: () => this.setOpen(false) });
            }
          });
          modalApp.mount('#qs-modal-root');
        }

        watch(paletteOpen, (val) => {
          if (paletteApp) {
            paletteApp._instance.setupState.open = val;
            paletteApp._instance.setupState.index = searchIndex.value;
            if (val) document.body.style.overflow = 'hidden';
            else document.body.style.overflow = '';
            const pr = document.getElementById('qs-palette-root');
            if (pr) pr.setAttribute('aria-hidden', val ? 'false' : 'true');
          }
        });
        watch(modalCommand, (val) => {
          if (modalApp) {
            modalApp._instance.setupState.open = !!val;
            modalApp._instance.setupState.command = val;
            const mr = document.getElementById('qs-modal-root');
            if (mr) mr.setAttribute('aria-hidden', val ? 'false' : 'true');
          }
        });

        onMounted(() => {
          nextTick(() => {
            try { initChrome(); } catch (err) { console.error('[' + NS + '] initChrome error:', err); }
            requestAnimationFrame(() => {
              document.body.classList.add('qs-theme-ready');
            });
            if (location.hash) {
              const id = location.hash.replace(/^#/, '');
              setTimeout(() => {
                const el = document.getElementById(id);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 200);
            }
          });
        });
        onUnmounted(() => {
          if (observer) observer.disconnect();
          if (scrollHandler) window.removeEventListener('scroll', scrollHandler);
          if (keyHandler) window.removeEventListener('keydown', keyHandler);
        });

        return {
          datasets, datasetKey, header, score, sections, visibleSections,
          filter, theme, filterOptions, themeOptions,
          collapsed, copyState, activeSection, search, searchFocused,
          doneSteps, faqCollapsed, activeRoles,
          paletteOpen, modalCommand,
          displayScore, passCount, partialCount, failCount,
          verdictSegments, groupBars,
          overviewHero, overviewLandscape, overviewStack,
          heroDoneSet, totalMinutes, totalSteps, doneCount, allStepsDone,
          totalManifests, ctaLabel, onCtaStart,
          setFilter, setTheme, toggleSection, copySection, copyAllMarkdown,
          sectionProps, sectionListeners, onTocClick,
          openPalette, closePalette, onPalettePick, openCommand, closeModal
        };
      },
      template: TEMPLATE
    };

    // Now create the real app with the full root config, then
    // register all page components on it.
    app = createApp(rootConfig);

    // Register each page component from `window.qsXxx` if exposed.
    // Components register themselves on window via ruiBootstrapComponent.
    PAGE_COMPONENTS.forEach((c) => {
      const opts = window[c.key];
      if (opts && opts.name) {
        try { app.component(opts.name, opts); }
        catch (err) { console.warn('[' + NS + '] register ' + c.tag + ' failed:', err); }
      } else {
        console.warn('[' + NS + '] page component not found on window:', c.key);
      }
    });

    // Promote shared rui-* options if the host exposed them.
    ['ruiBackTop', 'ruiToast', 'ruiBadge', 'ruiTagChip',
     'ruiProgressBar', 'ruiStatsGrid'].forEach(function (name) {
      const opts = window[name];
      if (opts && opts.name) {
        try { app.component(opts.name, opts); } catch (_) { /* ignore */ }
      }
    });

    try {
      app.mount('#quickstart-app');
    } catch (err) {
      console.error('[' + NS + '] mount failed:', err);
    } finally {
      try { root.removeAttribute('v-cloak'); } catch (_) { /* ignore */ }
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     J. ENTRY
     ─────────────────────────────────────────────────────────────── */
  if (typeof window !== 'undefined') {
    window.__ruiReportQuickstartNS__ = NS;
    registerSharedComponents();

    function whenVueReady(timeoutMs) {
      const ms = timeoutMs || 7000;
      if (window.Vue && window.Vue.createApp) return Promise.resolve(window.Vue);
      if (window.__vueLoadPromise && typeof window.__vueLoadPromise.then === 'function') {
        return window.__vueLoadPromise.then(function () { return window.Vue; });
      }
      return new Promise(function (resolve, reject) {
        const start = Date.now();
        (function poll() {
          if (window.Vue && window.Vue.createApp) return resolve(window.Vue);
          if (Date.now() - start > ms) return reject(new Error('[' + NS + '] Vue load timeout'));
          setTimeout(poll, 30);
        })();
      });
    }

    function start() {
      whenVueReady()
        .then(function () {
          // Wait for all page components (max 5s) before mounting. The
          // rui bootstrap loads the template and CSS via XHR/Fetch
          // asynchronously, so window.qsXxx may not be ready when
          // index.js first runs.
          return whenAllPageComponentsReady(5000);
        })
        .then(function () { mount(); })
        .catch(function (err) {
          console.error('[' + NS + ']', err && err.message || err);
          setTimeout(function () {
            if (window.Vue && window.Vue.createApp) {
              whenAllPageComponentsReady(5000).then(mount).catch(function () { mount(); });
            }
          }, 200);
        });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
      start();
    }
  }
})();
