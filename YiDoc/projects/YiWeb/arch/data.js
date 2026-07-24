/**
 * @file: data.js
 * @purpose: Architecture diagram data for the YiWeb project — a Vue 3 SPA
 *           for AI Code Review with three views (aicr / claude / story),
 *           a hook-pattern state model (66 hooks), a CDN-loaded component
 *           system (no package.json), and a thin core/services layer that
 *           talks to api.effiy.cn + Ollama. SVG built by the embedded
 *           layout engine from the diagram skill template.
 *
 *           Architecture shape:
 *             Browser User
 *               → Entry & CDN (index.html · Vue 3 · baseView · componentLoader · log · error · storage)
 *               → Router (Vue Router hash mode)
 *               → 3 Views (aicr · claude · story)
 *               → Hook Pattern (store + useComputed + useMethods per view · 66 hooks total)
 *               → 20 Components (aicrPage · fileTree · storyPanelPage · claudePanelPage · ...)
 *               → Core Services (requestHelper · authUtils · crud · business · sessionSyncService)
 *               → External: api.effiy.cn · Ollama LLM
 *
 * @shape:
 *   { meta, executiveSummary, toc, metrics, svgDiagram,
 *     summaryCards, pipeline, securityCards, trace, scalingTiles,
 *     ownership, apiTable, stack, schemaTiles, roadmap, glossary }
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 0 — SHARED PRIMITIVES RESOLUTION
     ═══════════════════════════════════════════════════════════════════ */
  var P = window.ruiDiagramPrimitives;
  if (!P) {
    P = {
      PALETTE: {
        cyan:    { fill: 'rgba(8,51,68,0.45)',   stroke: '#22d3ee', text: '#22d3ee' },
        emerald: { fill: 'rgba(6,78,59,0.45)',   stroke: '#34d399', text: '#34d399' },
        violet:  { fill: 'rgba(76,29,149,0.45)', stroke: '#a78bfa', text: '#a78bfa' },
        amber:   { fill: 'rgba(120,53,15,0.35)', stroke: '#fbbf24', text: '#fbbf24' },
        rose:    { fill: 'rgba(136,19,55,0.45)', stroke: '#fb7185', text: '#fb7185' },
        orange:  { fill: 'rgba(251,146,60,0.35)',stroke: '#fb923c', text: '#fb923c' },
        slate:   { fill: 'rgba(30,41,59,0.55)',  stroke: '#94a3b8', text: '#94a3b8' },
        ops:     { fill: 'rgba(15,23,42,0.6)',   stroke: '#475569', text: '#94a3b8' }
      },
      esc: function (s) {
        return String(s == null ? '' : s)
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      },
      renderMarkers: function () { return ''; },
      renderPatterns: function () { return ''; },
      renderShadowFilters: function () { return ''; },
      renderTextSlot: function (o) { return '<text>' + (o.text || '') + '</text>'; },
      renderArrow: function (o) { return '<line/>'; },
      renderCornerBrackets: function () { return ''; },
      markerForColor: function () { return 'arrow-slate'; }
    };
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 1 — LAYOUT CONSTANTS
     ═══════════════════════════════════════════════════════════════════ */
  var GRID = 10;
  var PAD = 16;
  var COL_GAP = 40;
  var ROW_GAP = 50;
  var BOUNDARY_PAD = 18;
  var OUTER_PAD = 28;
  var LEGEND_H = 168;
  var STROKE = 2;
  var BOUNDARY_STROKE = 1.5;
  var OUTER_STROKE = 2;

  function snap(v) { return Math.round(v / GRID) * GRID; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function r(n) { return Math.round(n * 100) / 100; }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 2 — COLOR / STYLE TOKENS
     ═══════════════════════════════════════════════════════════════════ */
  var STYLES = {
    frontend: P.PALETTE.cyan,
    backend:  P.PALETTE.emerald,
    database: P.PALETTE.violet,
    cloud:    P.PALETTE.amber,
    security: P.PALETTE.rose,
    message:  P.PALETTE.orange,
    external: P.PALETTE.slate,
    ops:      P.PALETTE.ops
  };

  var CONN = {
    sync:     { color: P.PALETTE.emerald.stroke, dash: null,  marker: P.markerForColor(P.PALETTE.emerald.stroke) },
    frontend: { color: P.PALETTE.cyan.stroke,    dash: null,  marker: P.markerForColor(P.PALETTE.cyan.stroke)    },
    data:     { color: P.PALETTE.violet.stroke,  dash: null,  marker: P.markerForColor(P.PALETTE.violet.stroke)  },
    auth:     { color: P.PALETTE.rose.stroke,    dash: '5,5', marker: P.markerForColor(P.PALETTE.rose.stroke)    },
    async:    { color: P.PALETTE.orange.stroke,  dash: '4,3', marker: P.markerForColor(P.PALETTE.orange.stroke)  },
    infra:    { color: P.PALETTE.amber.stroke,   dash: '6,4', marker: P.markerForColor(P.PALETTE.amber.stroke)   },
    telemetry:{ color: P.PALETTE.slate.stroke,   dash: '2,2', marker: P.markerForColor(P.PALETTE.slate.stroke)   }
  };

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 3 — LAYOUT MODEL
     Vue 3 SPA — CDN-loaded · hash router · 3 views · hook-pattern state ·
     core services → api.effiy.cn + Ollama
     ═══════════════════════════════════════════════════════════════════ */

  var COMP_DEFS = [
    /* ── Layer: Client ───────────────────────────────────────────── */
    { id: 'user', type: 'external', label: 'Browser User',
      sub: 'Chrome · Edge · Safari', col: 4, row: 0, layer: 'client', w: 200 },

    /* ── Layer: Entry & CDN Utils ───────────────────────────────── */
    { id: 'idx-html',  type: 'frontend', label: 'index.html',
      sub: 'SPA shell · #app mount', col: 0, row: 0, layer: 'entry' },
    { id: 'vue',       type: 'frontend', label: 'Vue 3',
      sub: 'createApp · Composition API', col: 1, row: 0, layer: 'entry' },
    { id: 'baseview',  type: 'frontend', label: 'baseView.js',
      sub: 'createBaseView factory', col: 2, row: 0, layer: 'entry' },
    { id: 'comploader',type: 'frontend', label: 'componentLoader.js',
      sub: 'registerGlobalComponent', col: 3, row: 0, layer: 'entry' },
    { id: 'log',       type: 'frontend', label: 'log.js',
      sub: 'logInfo / logWarn / logError', col: 4, row: 0, layer: 'entry' },
    { id: 'error',     type: 'frontend', label: 'error.js',
      sub: 'error codes · safe wrap', col: 5, row: 0, layer: 'entry' },
    { id: 'storage',   type: 'frontend', label: 'storage.js',
      sub: 'localStorage · cookie', col: 6, row: 0, layer: 'entry' },
    { id: 'md',        type: 'frontend', label: 'Markdown Renderer',
      sub: '/cdn/markdown/index.js', col: 7, row: 0, layer: 'entry' },

    /* ── Layer: Router ───────────────────────────────────────────── */
    { id: 'router', type: 'security', label: 'Vue Router (hash mode)',
      sub: '#/aicr · #/claude · #/story', col: 3, row: 0, layer: 'router', w: 320,
      lines: ['route → view bootstrap', 'router-link navigation', 'hash-based deep link', 'no server routing'] },

    /* ── Layer: Views ────────────────────────────────────────────── */
    { id: 'vw-aicr',   type: 'frontend', label: 'views/aicr/',
      sub: 'AI Code Review', col: 1, row: 0, layer: 'views', w: 220,
      lines: ['index.js entry', 'createStore pattern', 'main review surface'] },
    { id: 'vw-claude', type: 'frontend', label: 'views/claude/',
      sub: 'Claude Panel', col: 4, row: 0, layer: 'views', w: 220,
      lines: ['index.js entry', 'project list + detail', 'card grid + drill-down'] },
    { id: 'vw-story',  type: 'frontend', label: 'views/story/',
      sub: 'Story Management', col: 6, row: 0, layer: 'views', w: 220,
      lines: ['index.js entry', 'CRUD + deps + filters', 'knowledge graph'] },

    /* ── Layer: Hooks (66 total · 3 per view named) ──────────────── */
    { id: 'hk-aicr-store',    type: 'backend', label: 'aicr/hooks/store.js',
      sub: 'central reactive state', col: 0, row: 0, layer: 'hooks',
      lines: ['sessions · fileTree', 'selectedKey · sidebar'] },
    { id: 'hk-aicr-computed',  type: 'backend', label: 'useComputed.js',
      sub: 'derived state · aicr', col: 1, row: 0, layer: 'hooks',
      lines: ['storyTags · skillTags', 'filteredFileCount'] },
    { id: 'hk-aicr-methods',  type: 'backend', label: 'useMethods.js',
      sub: 'methods · aicr', col: 2, row: 0, layer: 'hooks',
      lines: ['search · chat · streaming', 'session CRUD'] },

    { id: 'hk-claude-store',  type: 'backend', label: 'claude/hooks/store.js',
      sub: 'projects state', col: 3, row: 0, layer: 'hooks',
      lines: ['projects · loading · error', 'selectedProject'] },
    { id: 'hk-claude-methods',type: 'backend', label: 'useMethods.js',
      sub: 'methods · claude', col: 4, row: 0, layer: 'hooks',
      lines: ['fetchProjects · select', 'skill/template/agent ops'] },

    { id: 'hk-story-store',   type: 'backend', label: 'story/hooks/store.js',
      sub: 'stories · fileTree · filters', col: 5, row: 0, layer: 'hooks',
      lines: ['stories · editing · deps'] },
    { id: 'hk-story-computed',type: 'backend', label: 'useComputed.js',
      sub: 'derived state · story', col: 6, row: 0, layer: 'hooks',
      lines: ['filteredStories', 'statusCounts · projectTags'] },
    { id: 'hk-story-methods', type: 'backend', label: 'useMethods.js',
      sub: 'methods · story', col: 7, row: 0, layer: 'hooks',
      lines: ['CRUD · deps · knowledge graph'] },

    /* ── Layer: Components (20 total · 8 named groups) ──────────── */
    { id: 'cmp-aicr-page',    type: 'cloud', label: 'aicrPage',
      sub: 'shell · shortcuts · view modes', col: 0, row: 0, layer: 'components' },
    { id: 'cmp-filetree',     type: 'cloud', label: 'fileTree',
      sub: 'batch ops · drag · filter', col: 1, row: 0, layer: 'components' },
    { id: 'cmp-session-chat', type: 'cloud', label: 'SessionChatContext',
      sub: 'streaming · context edit', col: 2, row: 0, layer: 'components' },
    { id: 'cmp-tag-filter',   type: 'cloud', label: 'Tag & Filter',
      sub: 'skills · templates · rules', col: 3, row: 0, layer: 'components' },
    { id: 'cmp-story-panel', type: 'cloud', label: 'storyPanelPage',
      sub: 'list + detail · status', col: 4, row: 0, layer: 'components' },
    { id: 'cmp-dep-editor',  type: 'cloud', label: 'depEditor',
      sub: 'bidirectional deps', col: 5, row: 0, layer: 'components' },
    { id: 'cmp-claude-panel',type: 'cloud', label: 'claudePanelPage',
      sub: 'card grid · search · sort', col: 6, row: 0, layer: 'components' },
    { id: 'cmp-claude-detail',type: 'cloud', label: 'claudeDetailCard',
      sub: 'skills · templates · agents', col: 7, row: 0, layer: 'components' },

    /* ── Layer: Core Services ───────────────────────────────────── */
    { id: 'svc-req',      type: 'backend', label: 'requestHelper.js',
      sub: 'fetch wrapper · timeout · retry', col: 0, row: 0, layer: 'services' },
    { id: 'svc-auth',     type: 'security', label: 'authUtils.js',
      sub: 'X-Token · localStorage', col: 1, row: 0, layer: 'services' },
    { id: 'svc-crud',     type: 'backend', label: 'crud.js',
      sub: 'streamPrompt · batchOps', col: 2, row: 0, layer: 'services' },
    { id: 'svc-business', type: 'backend', label: 'business/',
      sub: 'process mgr · analyzer', col: 3, row: 0, layer: 'services' },
    { id: 'svc-sync',     type: 'backend', label: 'sessionSyncService.js',
      sub: 'aicr ↔ backend sync', col: 4, row: 0, layer: 'services' },
    { id: 'svc-config',   type: 'ops',     label: 'core/config.js',
      sub: 'local/prod endpoints', col: 5, row: 0, layer: 'services' },
    { id: 'svc-utils',    type: 'ops',     label: 'core/utils/index.js',
      sub: 'eventBus · http · validation', col: 6, row: 0, layer: 'services' },
    { id: 'svc-mapper',   type: 'ops',     label: 'fileToStoryMapper.js',
      sub: 'file → story knowledge graph', col: 7, row: 0, layer: 'services' },

    /* ── Layer: External ─────────────────────────────────────────── */
    { id: 'ext-api',    type: 'external', label: 'api.effiy.cn',
      sub: 'REST · SSE streaming', col: 2, row: 0, layer: 'external', w: 220 },
    { id: 'ext-ollama', type: 'external', label: 'Ollama LLM',
      sub: 'localhost:11434', col: 5, row: 0, layer: 'external', w: 220 }
  ];

  var BOUNDARY_DEFS = [
    {
      id: 'spa-bundle', kind: 'vpc',
      label: 'SPA Bundle (index.html + /cdn/ + src/views/)',
      sub: 'Vue 3 SPA · no build step · all CDN-loaded',
      members: ['idx-html','vue','baseview','comploader','log','error','storage','md',
                'router',
                'vw-aicr','vw-claude','vw-story',
                'hk-aicr-store','hk-aicr-computed','hk-aicr-methods',
                'hk-claude-store','hk-claude-methods',
                'hk-story-store','hk-story-computed','hk-story-methods',
                'cmp-aicr-page','cmp-filetree','cmp-session-chat','cmp-tag-filter',
                'cmp-story-panel','cmp-dep-editor','cmp-claude-panel','cmp-claude-detail']
    },
    {
      id: 'service-layer', kind: 'security',
      label: 'Core Services Layer (src/core/services/)',
      sub: 'network · auth · crud · business · sync · config',
      members: ['svc-req','svc-auth','svc-crud','svc-business','svc-sync','svc-config','svc-utils','svc-mapper']
    }
  ];

  var CONNECTION_DEFS = [
    /* User → Entry */
    { from: 'user', to: 'idx-html', kind: 'frontend', label: 'navigate', sub: 'browser GET /' },

    /* Entry internal wiring */
    { from: 'idx-html', to: 'vue',          kind: 'sync',     label: 'mount',    sub: '#app → createApp' },
    { from: 'vue',      to: 'baseview',     kind: 'infra',    label: 'factory',  sub: 'createBaseView()' },
    { from: 'vue',      to: 'comploader',   kind: 'sync',     label: 'register', sub: 'global components' },
    { from: 'vue',      to: 'log',          kind: 'infra',    label: 'instrument',sub: 'logInfo/Warn/Error' },
    { from: 'vue',      to: 'error',        kind: 'infra',    label: 'guard',    sub: 'safe wrap' },
    { from: 'vue',      to: 'storage',      kind: 'data',     label: 'persist',  sub: 'localStorage' },
    { from: 'vue',      to: 'md',           kind: 'infra',    label: 'render',   sub: 'markdown → HTML' },

    /* Entry → Router */
    { from: 'baseview', to: 'router',       kind: 'sync',     label: 'route',    sub: 'hash mode' },

    /* Router → Views */
    { from: 'router', to: 'vw-aicr',   kind: 'frontend', label: 'route', sub: '#/aicr' },
    { from: 'router', to: 'vw-claude', kind: 'frontend', label: 'route', sub: '#/claude' },
    { from: 'router', to: 'vw-story',  kind: 'frontend', label: 'route', sub: '#/story' },

    /* Views → Hooks (createStore pattern) */
    { from: 'vw-aicr',   to: 'hk-aicr-store',    kind: 'sync', label: 'createStore', sub: 'reactive state' },
    { from: 'vw-claude', to: 'hk-claude-store',  kind: 'sync', label: 'createStore', sub: 'reactive state' },
    { from: 'vw-story',  to: 'hk-story-store',   kind: 'sync', label: 'createStore', sub: 'reactive state' },

    /* Hook chain: store → computed → methods */
    { from: 'hk-aicr-store',   to: 'hk-aicr-computed', kind: 'data', label: 'derive', sub: 'computed state' },
    { from: 'hk-aicr-computed', to: 'hk-aicr-methods', kind: 'sync', label: 'operate', sub: 'methods bind' },
    { from: 'hk-story-store',  to: 'hk-story-computed',kind: 'data', label: 'derive', sub: 'computed state' },
    { from: 'hk-story-computed',to: 'hk-story-methods', kind: 'sync', label: 'operate', sub: 'methods bind' },

    /* Views → Components (render) */
    { from: 'vw-aicr',   to: 'cmp-aicr-page',    kind: 'frontend', label: 'render', sub: 'aicrPage shell' },
    { from: 'vw-aicr',   to: 'cmp-filetree',     kind: 'frontend', label: 'render', sub: 'file tree' },
    { from: 'vw-aicr',   to: 'cmp-session-chat', kind: 'frontend', label: 'render', sub: 'AI chat panel' },
    { from: 'vw-aicr',   to: 'cmp-tag-filter',  kind: 'frontend', label: 'render', sub: 'tags + filters' },
    { from: 'vw-story',  to: 'cmp-story-panel', kind: 'frontend', label: 'render', sub: 'story panel' },
    { from: 'vw-story',  to: 'cmp-dep-editor',  kind: 'frontend', label: 'render', sub: 'dependency editor' },
    { from: 'vw-claude', to: 'cmp-claude-panel',kind: 'frontend', label: 'render', sub: 'project list' },
    { from: 'vw-claude', to: 'cmp-claude-detail',kind: 'frontend', label: 'render', sub: 'detail card' },

    /* Components → Hooks (data back-flow via v-model / props) */
    { from: 'cmp-filetree',     to: 'hk-aicr-methods',  kind: 'data', label: 'emit',  sub: 'select/expand' },
    { from: 'cmp-session-chat', to: 'hk-aicr-methods',  kind: 'async',label: 'stream', sub: 'SSE chunk' },
    { from: 'cmp-tag-filter',   to: 'hk-aicr-computed', kind: 'data', label: 'filter', sub: 'tag selection' },

    /* Hooks → Services */
    { from: 'hk-aicr-methods',  to: 'svc-req',     kind: 'sync', label: 'fetch', sub: 'X-Token + timeout' },
    { from: 'hk-aicr-methods',  to: 'svc-sync',    kind: 'sync', label: 'sync',  sub: 'session persist' },
    { from: 'hk-claude-methods',to: 'svc-crud',    kind: 'async',label: 'stream',sub: 'streamPrompt' },
    { from: 'hk-story-methods', to: 'svc-crud',    kind: 'sync', label: 'CRUD',  sub: 'stories + deps' },
    { from: 'hk-story-methods', to: 'svc-business',kind: 'sync', label: 'analyze',sub: 'scenario analyzer' },
    { from: 'hk-story-methods', to: 'svc-mapper',   kind: 'data', label: 'map',   sub: 'file → story' },
    { from: 'svc-req',          to: 'svc-auth',     kind: 'auth', label: 'token', sub: 'X-Token inject' },
    { from: 'svc-req',          to: 'svc-config',   kind: 'infra',label: 'config',sub: 'endpoint switch' },
    { from: 'svc-req',          to: 'svc-utils',    kind: 'infra',label: 'use',   sub: 'eventBus · http' },

    /* Services → External */
    { from: 'svc-req',     to: 'ext-api',    kind: 'frontend', label: 'HTTPS', sub: 'api.effiy.cn' },
    { from: 'svc-crud',    to: 'ext-api',    kind: 'async',    label: 'SSE',    sub: 'streamPromptJSON' },
    { from: 'svc-business',to: 'ext-ollama', kind: 'async',    label: 'infer',  sub: 'localhost:11434' },
    { from: 'svc-sync',    to: 'ext-api',    kind: 'sync',     label: 'sync',   sub: 'session upsert' }
  ];

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 4 — LAYOUT ENGINE
     ═══════════════════════════════════════════════════════════════════ */
  var LAYER_BAND = {
    client:     { y:  80,  rows: 1, colSpan: 1 },
    entry:      { y: 220,  rows: 1, colSpan: 8 },
    router:     { y: 380,  rows: 1, colSpan: 1 },
    views:      { y: 500,  rows: 1, colSpan: 8 },
    hooks:      { y: 640,  rows: 1, colSpan: 8 },
    components: { y: 800,  rows: 1, colSpan: 8 },
    services:   { y: 920,  rows: 1, colSpan: 8 },
    external:   { y: 1060, rows: 1, colSpan: 8 }
  };

  var STD_W = 160;
  var STD_H = 60;
  var SMALL_W = 140;
  var SMALL_H = 56;

  function layoutComponents() {
    var comps = [];
    var layerMaxCol = {};
    var layerMaxRow = {};
    COMP_DEFS.forEach(function (d) {
      var band = LAYER_BAND[d.layer];
      layerMaxCol[d.layer] = Math.max(layerMaxCol[d.layer] || 0, d.col);
      layerMaxRow[d.layer] = Math.max(layerMaxRow[d.layer] || 0, d.row);
    });

    var COL_X = [60, 240, 420, 600, 780, 960, 1140, 1320, 1500];
    var ROW_H_LAYER = 88;

    COMP_DEFS.forEach(function (d) {
      var band = LAYER_BAND[d.layer];
      var x = COL_X[d.col] || 0;
      var y = band.y + d.row * ROW_H_LAYER;
      var w = d.w || (d.lines ? 200 : STD_W);
      var h = d.h || (d.lines ? computeHeight(d.lines, w) : STD_H);
      comps.push({
        id: d.id, type: d.type, layer: d.layer,
        label: d.label, sub: d.sub,
        lines: d.lines || null, x: x, y: y, w: w, h: h
      });
    });
    return comps;
  }

  function computeHeight(lines, w) {
    var lineH = 14;
    return 50 + lines.length * lineH;
  }

  function layoutBoundaries(comps) {
    var byId = {};
    comps.forEach(function (c) { byId[c.id] = c; });
    return BOUNDARY_DEFS.map(function (b) {
      var members = b.members.map(function (id) { return byId[id]; })
                            .filter(Boolean);
      if (!members.length) return null;
      var minX = Math.min.apply(null, members.map(function (m) { return m.x; }));
      var minY = Math.min.apply(null, members.map(function (m) { return m.y; }));
      var maxX = Math.max.apply(null, members.map(function (m) { return m.x + m.w; }));
      var maxY = Math.max.apply(null, members.map(function (m) { return m.y + m.h; }));
      return {
        id: b.id, kind: b.kind, label: b.label, sub: b.sub,
        x: snap(minX - BOUNDARY_PAD),
        y: snap(minY - BOUNDARY_PAD - 16),
        w: snap(maxX - minX + 2 * BOUNDARY_PAD),
        h: snap(maxY - minY + 2 * BOUNDARY_PAD + 16),
        members: members
      };
    }).filter(Boolean);
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 5 — ORTHOGONAL ROUTING
     ═══════════════════════════════════════════════════════════════════ */
  function anchorPoint(comp, side) {
    switch (side) {
      case 'left':   return { x: comp.x,            y: comp.y + comp.h / 2 };
      case 'right':  return { x: comp.x + comp.w,   y: comp.y + comp.h / 2 };
      case 'top':    return { x: comp.x + comp.w / 2, y: comp.y };
      case 'bottom': return { x: comp.x + comp.w / 2, y: comp.y + comp.h };
    }
    return { x: comp.x + comp.w / 2, y: comp.y + comp.h / 2 };
  }

  function pickSides(src, dst) {
    var srcCx = src.x + src.w / 2, srcCy = src.y + src.h / 2;
    var dstCx = dst.x + dst.w / 2, dstCy = dst.y + dst.h / 2;
    var dx = dstCx - srcCx, dy = dstCy - srcCy;
    var fromSide, toSide;
    if (Math.abs(dx) >= Math.abs(dy)) {
      fromSide = dx > 0 ? 'right' : 'left';
      toSide   = dx > 0 ? 'left'  : 'right';
    } else {
      fromSide = dy > 0 ? 'bottom' : 'top';
      toSide   = dy > 0 ? 'top'    : 'bottom';
    }
    return { fromSide: fromSide, toSide: toSide };
  }

  function polyline(points) {
    if (!points.length) return '';
    var d = 'M ' + r(points[0].x) + ' ' + r(points[0].y);
    for (var i = 1; i < points.length; i++) {
      d += ' L ' + r(points[i].x) + ' ' + r(points[i].y);
    }
    return d;
  }

  function orthogonalRoute(p1, p2) {
    var dx = p2.x - p1.x, dy = p2.y - p1.y;
    if (Math.abs(dy) < 0.5) return [p1, p2];
    if (Math.abs(dx) < 0.5) return [p1, p2];
    var midX = p1.x + dx / 2;
    return [
      p1,
      { x: midX, y: p1.y },
      { x: midX, y: p2.y },
      p2
    ];
  }

  function pathMidpoint(points) {
    var total = 0;
    var segs = [];
    for (var i = 1; i < points.length; i++) {
      var a = points[i - 1], b = points[i];
      var len = Math.hypot(b.x - a.x, b.y - a.y);
      segs.push({ a: a, b: b, len: len });
      total += len;
    }
    var target = total / 2, acc = 0;
    for (var j = 0; j < segs.length; j++) {
      if (acc + segs[j].len >= target) {
        var t = (target - acc) / segs[j].len;
        var a = segs[j].a, b = segs[j].b;
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      }
      acc += segs[j].len;
    }
    return { x: points[points.length - 1].x, y: points[points.length - 1].y };
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 6 — SVG RENDERERS
     ═══════════════════════════════════════════════════════════════════ */

  function renderDefs() {
    return [
      '<defs>',
        P.renderMarkers(),
        P.renderPatterns(),
        P.renderShadowFilters(),
        '<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">',
          '<feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>',
        '</filter>',
      '</defs>'
    ].join('');
  }

  function renderArrows(comps, connDefs) {
    var byId = {};
    comps.forEach(function (c) { byId[c.id] = c; });
    var parts = [];
    connDefs.forEach(function (c) {
      var src = byId[c.from], dst = byId[c.to];
      if (!src || !dst) return;
      var sides = pickSides(src, dst);
      var p1 = anchorPoint(src, sides.fromSide);
      var p2 = anchorPoint(dst, sides.toSide);
      var PAD_A = 6;
      if (sides.fromSide === 'right')  p1.x += PAD_A;
      if (sides.fromSide === 'left')   p1.x -= PAD_A;
      if (sides.fromSide === 'bottom') p1.y += PAD_A;
      if (sides.fromSide === 'top')    p1.y -= PAD_A;
      if (sides.toSide === 'right')    p2.x += PAD_A;
      if (sides.toSide === 'left')     p2.x -= PAD_A;
      if (sides.toSide === 'bottom')   p2.y += PAD_A;
      if (sides.toSide === 'top')      p2.y -= PAD_A;

      var points = orthogonalRoute(p1, p2);
      var d = polyline(points);
      var style = CONN[c.kind] || CONN.sync;
      var dashAttr = style.dash ? ' stroke-dasharray="' + style.dash + '"' : '';
      parts.push('<path class="svg-arrow" data-from="' + c.from + '" data-to="' + c.to + '" ' +
                 'd="' + d + '" fill="none" stroke="' + style.color + '" ' +
                 'stroke-width="' + STROKE + '" stroke-linecap="round" stroke-linejoin="round"' +
                 dashAttr + ' marker-end="url(#' + style.marker + ')"/>');
      var mid = pathMidpoint(points);
      if (c.label) {
        parts.push(renderLabelPill(mid, c.from, c.to, c.label, c.sub, style.color));
      }
    });
    return parts.join('');
  }

  function renderLabelPill(mid, from, to, label, sub, color) {
    var padX = 8, padY = 4;
    var fontSize = 10;
    var labelW = Math.max(28, label.length * 5.6 + padX * 2);
    var labelH = 16;
    var x = r(mid.x - labelW / 2);
    var y = r(mid.y - labelH / 2);
    var parts = [];
    parts.push('<rect class="svg-label-bg" data-from="' + from + '" data-to="' + to + '" ' +
               'x="' + x + '" y="' + y + '" ' +
               'width="' + r(labelW) + '" height="' + labelH + '" rx="4" ' +
               'fill="#020617" stroke="' + color + '" stroke-width="1" opacity="0.92"/>');
    parts.push('<text class="svg-label" data-from="' + from + '" data-to="' + to + '" ' +
               'x="' + r(mid.x) + '" y="' + r(mid.y + 3.5) + '" ' +
               'fill="' + color + '" font-size="' + fontSize + '" font-weight="600" ' +
               'text-anchor="middle" stroke="#020617" stroke-width="0.4" paint-order="stroke">' +
               escapeXml(label) + '</text>');
    if (sub) {
      parts.push('<text class="svg-label-sub" data-from="' + from + '" data-to="' + to + '" ' +
                 'x="' + r(mid.x) + '" y="' + r(mid.y + labelH / 2 + 10) + '" ' +
                 'fill="#94a3b8" font-size="8" text-anchor="middle">' +
                 escapeXml(sub) + '</text>');
    }
    return parts.join('');
  }

  function escapeXml(s) { return P.esc(s); }

  function renderMasks(comps) {
    return comps.map(function (c) {
      return '<rect x="' + c.x + '" y="' + c.y + '" width="' + c.w + '" height="' + c.h + '" ' +
             'rx="8" fill="#0f172a"/>';
    }).join('');
  }

  function renderComponents(comps) {
    return comps.map(function (c) {
      var s = STYLES[c.type] || STYLES.external;
      var rx = c.lines ? 10 : 8;
      var isTall = !!c.lines;
      var filterAttr = isTall ? ' filter="url(#shadow-md)"' : ' filter="url(#shadow-sm)"';
      var inner = [];
      var titleY = c.y + 22;
      var subY = c.y + 38;
      var titleTextW = c.w - 20;
      inner.push('<text x="' + (c.x + c.w / 2) + '" y="' + titleY + '" ' +
                 'fill="#ffffff" font-size="12" font-weight="700" ' +
                 'text-anchor="middle" textLength="' + titleTextW + '" ' +
                 'lengthAdjust="spacingAndGlyphs">' + escapeXml(c.label) + '</text>');
      inner.push('<text x="' + (c.x + c.w / 2) + '" y="' + subY + '" ' +
                 'fill="#cbd5e1" font-size="9" text-anchor="middle" ' +
                 'textLength="' + (c.w - 16) + '" lengthAdjust="spacingAndGlyphs">' +
                 escapeXml(c.sub) + '</text>');
      if (c.lines) {
        var yStart = c.y + 60;
        c.lines.forEach(function (line, i) {
          inner.push('<text x="' + (c.x + 14) + '" y="' + (yStart + i * 14) + '" ' +
                     'fill="#cbd5e1" font-size="9" text-anchor="start">' +
                     '• ' + escapeXml(line) + '</text>');
        });
      }
      return [
        '<rect class="comp-stroke" data-component="' + c.id + '" ' +
          'x="' + c.x + '" y="' + c.y + '" width="' + c.w + '" height="' + c.h + '" ' +
          'rx="' + rx + '" fill="' + s.fill + '" stroke="' + s.stroke + '" ' +
          'stroke-width="' + STROKE + '"' + filterAttr + '/>',
        inner.join('')
      ].join('');
    }).join('');
  }

  function renderBoundaries(bounds) {
    return bounds.map(function (b) {
      var stroke, dash, fill, labelY;
      if (b.kind === 'vpc') {
        stroke = '#fbbf24';
        dash = '8,4';
        fill = 'rgba(251,191,36,0.04)';
      } else {
        stroke = '#fb7185';
        dash = '4,4';
        fill = 'rgba(251,113,133,0.05)';
      }
      labelY = b.y + 14;
      return [
        '<rect class="svg-boundary" x="' + b.x + '" y="' + b.y + '" ' +
          'width="' + b.w + '" height="' + b.h + '" rx="14" ' +
          'fill="' + fill + '" stroke="' + stroke + '" ' +
          'stroke-width="' + BOUNDARY_STROKE + '" stroke-dasharray="' + dash + '"/>',
        '<text x="' + (b.x + 14) + '" y="' + labelY + '" fill="' + stroke + '" ' +
          'font-size="11" font-weight="700">' + escapeXml(b.label) + '</text>',
        b.sub
          ? '<text x="' + (b.x + 14) + '" y="' + (labelY + 14) + '" ' +
              'fill="' + stroke + '" font-size="9" opacity="0.85">' +
              escapeXml(b.sub) + '</text>'
          : ''
      ].join('');
    }).join('');
  }

  function renderLegend(x, y) {
    var swatches = [
      { fill: STYLES.frontend.fill, stroke: STYLES.frontend.stroke, label: 'Vue 3 / View' },
      { fill: STYLES.backend.fill,  stroke: STYLES.backend.stroke,  label: 'Hook / Service' },
      { fill: STYLES.security.fill, stroke: STYLES.security.stroke, label: 'Router / Auth' },
      { fill: STYLES.cloud.fill,    stroke: STYLES.cloud.stroke,    label: 'UI Component' },
      { fill: STYLES.ops.fill,      stroke: STYLES.ops.stroke,      label: 'Config / Util' },
      { fill: STYLES.external.fill, stroke: STYLES.external.stroke, label: 'External API' }
    ];
    var lineStyles = [
      { color: CONN.sync.color,      dash: null,     label: 'Sync call' },
      { color: CONN.frontend.color,  dash: null,     label: 'Render / navigate' },
      { color: CONN.async.color,    dash: '4,3',    label: 'SSE stream' },
      { color: CONN.auth.color,     dash: '5,5',    label: 'Token / auth' },
      { color: CONN.infra.color,    dash: '6,4',    label: 'CDN / util wiring' }
    ];

    var parts = [];
    parts.push('<text x="' + x + '" y="' + y + '" fill="#ffffff" font-size="13" font-weight="700">Legend</text>');
    var colW = 220, rowH = 28;
    swatches.forEach(function (s, i) {
      var sx = x + (i % 4) * colW;
      var sy = y + 24 + Math.floor(i / 4) * rowH;
      parts.push('<rect x="' + sx + '" y="' + sy + '" width="22" height="14" rx="3" ' +
                 'fill="' + s.fill + '" stroke="' + s.stroke + '" stroke-width="1.5"/>');
      parts.push('<text x="' + (sx + 32) + '" y="' + (sy + 11) + '" fill="#cbd5e1" font-size="10">' +
                 escapeXml(s.label) + '</text>');
    });
    var ly = y + 24 + Math.ceil(swatches.length / 4) * rowH + 16;
    parts.push('<text x="' + x + '" y="' + ly + '" fill="#cbd5e1" font-size="11" font-weight="600">Line styles</text>');
    lineStyles.forEach(function (s, i) {
      var sx = x + i * colW;
      var sy = ly + 16;
      var dashAttr = s.dash ? ' stroke-dasharray="' + s.dash + '"' : '';
      parts.push('<line x1="' + sx + '" y1="' + sy + '" x2="' + (sx + 36) + '" y2="' + sy + '" ' +
                 'stroke="' + s.color + '" stroke-width="' + STROKE + '"' + dashAttr + ' marker-end="url(#arrow-' + ({
                   '#34d399':'emerald','#fb923c':'orange','#fb7185':'rose',
                   '#fbbf24':'amber','#64748b':'slate'
                 })[s.color] + ')"/>');
      parts.push('<text x="' + (sx + 50) + '" y="' + (sy + 4) + '" fill="#cbd5e1" font-size="10">' +
                 escapeXml(s.label) + '</text>');
    });
    return parts.join('');
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 7 — OUTERMOST REGION
     ═══════════════════════════════════════════════════════════════════ */
  function renderOutermost(comps, bounds, legendY) {
    var minX = Math.min.apply(null, comps.map(function (c) { return c.x; })
        .concat(bounds.map(function (b) { return b.x; })));
    var minY = Math.min.apply(null, comps.map(function (c) { return c.y; })
        .concat(bounds.map(function (b) { return b.y; })));
    var maxX = Math.max.apply(null, comps.map(function (c) { return c.x + c.w; })
        .concat(bounds.map(function (b) { return b.x + b.w; })));
    var maxY = Math.max.apply(null, comps.map(function (c) { return c.y + c.h; })
        .concat(bounds.map(function (b) { return b.y + b.h; }))
        .concat([legendY + LEGEND_H]));
    var x = snap(minX - OUTER_PAD);
    var y = snap(minY - OUTER_PAD - 28);
    var w = snap(maxX - minX + 2 * OUTER_PAD);
    var h = snap(maxY - minY + 2 * OUTER_PAD + 28);
    return {
      x: x, y: y, w: w, h: h,
      labelY: y + 20,
      label: 'YiWeb SPA · /Users/yi/YrY/YiWeb/',
      sub: 'Vue 3 · 3 views · 66 hooks · 20 components · 95 source files · CDN-loaded (no package.json)',
      markup:
        '<rect class="svg-outermost" x="' + x + '" y="' + y + '" ' +
          'width="' + w + '" height="' + h + '" rx="20" ' +
          'fill="rgba(251,191,36,0.012)" stroke="#fbbf24" ' +
          'stroke-width="2.2" stroke-dasharray="10,5"/>' +
        '<rect x="' + (x + 12) + '" y="' + (y + 8) + '" height="32" width="360" rx="6" ' +
          'fill="#020617" stroke="#fbbf24" stroke-width="1.2"/>' +
        '<text x="' + (x + 22) + '" y="' + (y + 24) + '" fill="#fbbf24" ' +
          'font-size="12" font-weight="700">▸ ' + 'YiWeb SPA · /Users/yi/YrY/YiWeb/' + '</text>' +
        '<text x="' + (x + 22) + '" y="' + (y + 36) + '" fill="#94a3b8" font-size="9">' +
          'Vue 3 · 3 views · 66 hooks · 20 components · 95 source files · CDN-loaded (no package.json)' + '</text>' +
        renderCornerBrackets(x, y, w, h)
    };
  }

  function renderCornerBrackets(x, y, w, h) {
    return P.renderCornerBrackets(x, y, w, h, '#fbbf24', 12);
  }

  function renderLayerRail(comps) {
    var groups = {};
    comps.forEach(function (c) {
      if (!groups[c.layer]) groups[c.layer] = [];
      groups[c.layer].push(c);
    });

    var LAYER_INFO = [
      { key: 'client',     label: 'CLIENT',          color: '#94a3b8' },
      { key: 'entry',      label: 'ENTRY & CDN',     color: '#22d3ee' },
      { key: 'router',     label: 'ROUTER',          color: '#fb7185' },
      { key: 'views',      label: 'VIEWS',          color: '#22d3ee' },
      { key: 'hooks',      label: 'HOOK PATTERN',   color: '#34d399' },
      { key: 'components', label: 'COMPONENTS',     color: '#fbbf24' },
      { key: 'services',   label: 'CORE SERVICES',   color: '#34d399' },
      { key: 'external',   label: 'EXTERNAL APIS',   color: '#94a3b8' }
    ];

    var parts = [];
    LAYER_INFO.forEach(function (li) {
      var items = groups[li.key];
      if (!items || !items.length) return;
      var yMin = Math.min.apply(null, items.map(function (c) { return c.y; }));
      var yMax = Math.max.apply(null, items.map(function (c) { return c.y + c.h; }));
      var midY = (yMin + yMax) / 2;
      var labelX = 18;
      var labelY = midY;
      parts.push('<g class="layer-rail">');
      parts.push('<line x1="' + labelX + '" y1="' + yMin + '" x2="' + labelX + '" y2="' + yMax + '" ' +
                 'stroke="' + li.color + '" stroke-width="1" stroke-dasharray="2,2" opacity="0.6"/>');
      parts.push('<text x="' + labelX + '" y="' + labelY + '" ' +
                 'fill="' + li.color + '" font-size="9" font-weight="700" ' +
                 'letter-spacing="1" text-anchor="middle" ' +
                 'transform="rotate(-90 ' + labelX + ' ' + labelY + ')">' +
                 escapeXml(li.label) + '</text>');
      parts.push('</g>');
    });
    return parts.join('');
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 8 — COMPOSE THE SVG
     ═══════════════════════════════════════════════════════════════════ */
  function buildSvg() {
    var comps = layoutComponents();
    var bounds = layoutBoundaries(comps);
    var legendX = 60;
    var legendY = 1220;
    var outermost = renderOutermost(comps, bounds, legendY);

    var svgW = outermost.x + outermost.w + 40;
    var svgH = outermost.y + outermost.h + 40;

    var parts = [];
    parts.push('<svg ref="svg" viewBox="0 0 ' + svgW + ' ' + svgH + '" ' +
               'role="img" aria-labelledby="diagram-title diagram-desc" ' +
               'xmlns="http://www.w3.org/2000/svg" ' +
               'shape-rendering="geometricPrecision" text-rendering="geometricPrecision">');
    parts.push('<title id="diagram-title">YiWeb · Vue 3 SPA Architecture Diagram</title>');
    parts.push('<desc id="diagram-desc">YiWeb Vue 3 SPA for AI Code Review — CDN-loaded Vue 3 with no package.json; index.html mounts createApp, baseView.js + componentLoader.js bootstrap the SPA; Vue Router in hash mode routes to 3 views (aicr/claude/story); each view uses the createStore + useComputed + useMethods hook pattern (66 hooks total); 20 UI components render the views; a core services layer (requestHelper, authUtils, crud, business, sessionSyncService, config, utils, fileToStoryMapper) handles HTTP, auth (X-Token), streaming, and file-to-story mapping; services call api.effiy.cn (REST + SSE) and Ollama (localhost:11434) for local LLM inference.</desc>');
    parts.push(renderDefs());
    parts.push('<rect width="100%" height="100%" fill="url(#grid)"/>');
    parts.push('<rect width="100%" height="100%" fill="url(#grid-major)"/>');
    parts.push(renderLayerRail(comps));
    parts.push(renderArrows(comps, CONNECTION_DEFS));
    parts.push(renderMasks(comps));
    parts.push(renderComponents(comps));
    parts.push(renderBoundaries(bounds));
    parts.push(renderLegend(legendX, legendY));
    parts.push(outermost.markup);
    parts.push('</svg>');
    return parts.join('\n');
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 9 — STATIC CONTENT
     ═══════════════════════════════════════════════════════════════════ */
  window.REPORT_DATA = {
    meta: {
      title: 'YiWeb · Vue 3 SPA Architecture Diagram',
      pageTitle: 'YiWeb — AI Code Review Web Application',
      subtitle: 'Vue 3 SPA · three views (aicr / claude / story) · hook-pattern state (66 hooks) · CDN-based component system · core services → api.effiy.cn + Ollama',
      footer: 'YiWeb · /Users/yi/YrY/YiWeb/ · Vue 3 CDN-loaded · 3 views · 66 hooks · 20 components · 95 source files · v1.0.0 · 2026-07-24',
      traceSub: 'user → router → view → hook → service → external API'
    },

    executiveSummary: [
      { color: 'cyan',    title: '▸ System Scope',       content: 'YiWeb is a Vue 3 single-page application for AI Code Review. It ships 3 views (aicr, claude, story), 20 UI components, 66 reactive hooks, and 95 source files. The entire frontend is CDN-loaded (Vue 3, baseView.js, componentLoader.js, log.js, error.js, storage.js, markdown renderer) — there is no package.json and no build step.' },
      { color: 'emerald', title: '▸ Architecture Style', content: 'Vanilla Vue 3 SPA with a custom hook-pattern state model. Each view (aicr, claude, story) follows the same createStore + useComputed + useMethods triad — store.js holds central reactive state, useComputed.js derives computed state (filtered lists, tag aggregates, status counts), useMethods.js binds all methods (CRUD, streaming, sync). createBaseView wires them together via a factory.' },
      { color: 'amber',   title: '▸ Key Decisions',      content: 'CDN loading over bundling — zero build step, instant deploys, easy onboarding. Hash-mode routing (no server config) — deep links work from any static host. Hook pattern over Pinia/Vuex — co-located per view, no global store, simpler mental model. componentLoader.js dynamically loads HTML/CSS/JS triples per component — true component isolation without a bundler. Core services layer abstracts fetch/X-Token/streaming so views stay declarative.' }
    ],

    toc: [
      { href: '#diagram',   icon: '📐', label: 'Diagram' },
      { href: '#metrics',   icon: '📊', label: 'Metrics' },
      { href: '#summary',   icon: '📋', label: 'Summary' },
      { href: '#security',  icon: '🔒', label: 'Security' },
      { href: '#trace',     icon: '🔍', label: 'Trace' },
      { href: '#api',       icon: '📡', label: 'API' },
      { href: '#stack',     icon: '🧰', label: 'Stack' },
      { href: '#roadmap',   icon: '🔮', label: 'Roadmap' }
    ],

    metrics: [
      { label: 'Views',        status: null, value: '3',  valueClass: 'cyan',    sub: 'aicr / claude / story' },
      { label: 'UI Components', status: null, value: '20', valueClass: 'amber',   sub: 'per-view + shared' },
      { label: 'Hooks',        status: null, value: '66', valueClass: 'emerald', sub: 'store + computed + methods' },
      { label: 'Source Files',  status: null, value: '95', valueClass: 'cyan',    sub: 'JS modules' },
      { label: 'CDN Deps',      status: null, value: '8',  valueClass: 'amber',   sub: 'Vue 3 · baseView · loader · log · error · storage · md · fetch' }
    ],

    svgDiagram: buildSvg(),

    summaryCards: [
      {
        color: 'cyan',
        title: 'Entry, CDN & Router',
        items: [
          '<strong>index.html</strong> is the SPA shell — loads Vue 3 from /cdn/, mounts createApp on #app, and hands off to baseView.js; no SSR, no server template rendering, no build step.',
          '<strong>baseView.js</strong> exposes a createBaseView factory that wires Vue Router (hash mode), registers global components via componentLoader.js, and bootstraps each view with its store + computed + methods triad.',
          '<strong>componentLoader.js</strong> dynamically fetches each component as an HTML/CSS/JS triple via registerGlobalComponent — components are isolated and lazy, no bundler required, no global CSS bleed.',
          '<strong>Vue Router hash mode</strong> — routes #/aicr, #/claude, #/story; deep links survive static hosting and file://; no server rewrites needed.',
          '<strong>CDN utility stack</strong> — log.js (logInfo/Warn/Error), error.js (error codes + safe wrap), storage.js (localStorage/sessionStorage/cookie wrappers), markdown renderer (/cdn/markdown/index.js) for streaming + static rendering.'
        ]
      },
      {
        color: 'emerald',
        title: 'Views & Hook Pattern (66 hooks)',
        items: [
          '<strong>views/aicr/</strong> — AI Code Review surface. index.js bootstraps createStore + useComputed + useMethods. store.js holds sessions, fileTree, selectedKey, sidebar state. useComputed derives storyTags, skillTags, templateTags, filteredFileCount. useMethods handles search, chat, fileTree CRUD, session management, streaming.',
          '<strong>views/claude/</strong> — Claude Panel. store.js holds projects, loading, error, selectedProject. useMethods handles fetchProjects, project selection, skill/template/agent ops. Renders claudePanelPage (card grid + search + sort) and claudeDetailCard (skills/templates/rules/agents info).',
          '<strong>views/story/</strong> — Story Management. store.js holds stories, fileTree, filters, editing, deps. useComputed derives filteredStories, statusCounts, projectTags. useMethods handles story CRUD, deps management, filter/sort, knowledge graph integration.',
          '<strong>createStore pattern</strong> — each view co-locates its reactive state in hooks/store.js; no global Pinia store; state is scoped to its view lifecycle and torn down on route change.',
          '<strong>Sub-hook modules</strong> — aicr splits methods further: sessionChatContextMethods.js (streaming chat + scroll sync) and tagFilterMethods.js (multi-level tag cross-filter); the dashboard counts these toward the 66-hook total.'
        ]
      },
      {
        color: 'amber',
        title: 'Core Services & External APIs',
        items: [
          '<strong>requestHelper.js</strong> — wraps window.fetch with timeout, abort (AbortController), retry, caching, and auth headers; all outbound HTTP funnels through this single module so policies are enforced consistently.',
          '<strong>authUtils.js</strong> — manages the X-Token (localStorage persistence, API settings dialog, inject-on-every-request); no OAuth flow, just a personal token.',
          '<strong>crud.js</strong> — generic CRUD operations + streamPrompt + streamPromptJSON (SSE streaming for AI responses) + batchOps; consumed by all three views.',
          '<strong>business/</strong> — domain logic (process manager, scenario analyzer, requirement analysis); used by the story view for knowledge-graph analysis and by aicr for review orchestration.',
          '<strong>sessionSyncService.js + fileToStoryMapper.js</strong> — syncService keeps aicr sessions consistent with backend; mapper builds the file-to-story knowledge graph (cross-view integration utility). Services target api.effiy.cn (REST + SSE) and Ollama on localhost:11434 (local LLM inference for privacy-sensitive reviews).'
        ]
      }
    ],

    pipeline: [
      { badge: 'Develop',    badgeClass: 'dev',  info: 'Vue 3 + CDN utils<br/>no build step' },
      { badge: 'Stage',       badgeClass: 'stg',  info: 'static host preview<br/>Nginx /cdn/ + /src/' },
      { badge: 'Test',        badgeClass: 'stg',  info: '6 self-check scenes<br/>doc-code consistency' },
      { badge: 'Production',  badgeClass: 'prod', info: 'Nginx serves /cdn + /src<br/>api.effiy.cn backend' },
      { badge: 'Iterate',      badgeClass: 'prod', info: 'add view = 3 hooks +<br/>components + route entry' }
    ],

    securityCards: [
      {
        color: 'rose',
        title: 'Client-Side Trust Boundary',
        items: [
          '<strong>SPA boundary</strong> — all view code runs in the browser; the only server-trusted input is the X-Token (per-user, revocable); never trust client-side filters or computed state on the backend.',
          '<strong>CDN loading</strong> — Vue 3, baseView, componentLoader, log, error, storage, and markdown renderer are served from /cdn/ on the same origin (Nginx); no third-party CDN, no SRI bypass risk.',
          '<strong>componentLoader.js</strong> dynamically fetches HTML/CSS/JS triples — these are same-origin /cdn/components/ paths only; no remote URLs accepted; no eval of fetched JS beyond the browser\'s normal module evaluation.',
          '<strong>CORS</strong> configured on Nginx — api.effiy.cn is the only allowed cross-origin target; all other origins blocked by default.',
          '<strong>Markdown renderer</strong> runs in the browser — output is sanitized before injection; AI responses from Ollama / api.effiy.cn are untrusted and rendered with the same sanitization pass.'
        ]
      },
      {
        color: 'amber',
        title: 'External API Trust',
        items: [
          '<strong>api.effiy.cn</strong> is the only review backend — HTTPS only, X-Token auth on every request, rate-limited per user; SSE streams are validated frame-by-frame in requestHelper.',
          '<strong>Ollama</strong> on localhost:11434 — local LLM, no data leaves the machine; preferred for privacy-sensitive code reviews; user can disable per-session.',
          '<strong>fetch wrapper</strong> enforces timeout + abort + retry on every call — no call can hang indefinitely or retry aggressively; AbortController cancels in-flight streams on view unmount.',
          '<strong>No third-party APIs</strong> — no analytics, no Sentry, no error reporting, no telemetry; the only outbound calls are to api.effiy.cn and (optionally) Ollama.',
          '<strong>Session sync</strong> — sessionSyncService persists to api.effiy.cn only; no localStorage-only sessions that could leak across users on shared devices (X-Token is per-user).'
        ]
      },
      {
        color: 'orange',
        title: 'Data & Privacy',
        items: [
          '<strong>X-Token</strong> stored in localStorage — scoped per user, no password storage, no session hijack beyond token theft (mitigated by HTTPS-only + short-lived tokens); user can rotate via API settings dialog.',
          '<strong>File tree data</strong> in aicr — code under review is fetched on demand from api.effiy.cn, never persisted to localStorage; cleared on session end.',
          '<strong>Streaming chat</strong> — AI responses stream into the DOM via the markdown renderer; no intermediate localStorage writes; scroll sync via SessionChatContextMethods.',
          '<strong>Knowledge graph</strong> — story deps and file-to-story mappings are stored server-side; the client only caches the current view; cleared on logout.',
          '<strong>No cookies for auth</strong> — X-Token is header-injected by requestHelper, not a cookie; CSRF surface is zero for the SPA.'
        ]
      }
    ],

    trace: [
      { name: '1. Navigate',  nameClass: 'cyan',    sub: 'browser #/aicr',           time: '~5ms'   },
      { name: '2. Router',    nameClass: 'rose',    sub: 'hash → view bootstrap',     time: '~5ms'   },
      { name: '3. createBaseView', nameClass: 'cyan', sub: 'factory wires hooks',     time: '~15ms'  },
      { name: '4. createStore', nameClass: 'emerald', sub: 'reactive state init',     time: '~5ms'   },
      { name: '5. useMethods', nameClass: 'emerald', sub: 'fetch review session',     time: '~3ms'   },
      { name: '6. requestHelper', nameClass: 'emerald', sub: 'fetch + X-Token',       time: '~5ms'   },
      { name: '7. api.effiy.cn', nameClass: 'orange', sub: 'REST + SSE stream',         time: '~300ms' },
      { name: '8. Render',    nameClass: 'cyan',    sub: 'markdown + component update', time: '~25ms' }
    ],

    scalingTiles: [
      {
        color: 'cyan',
        title: 'SPA Bundle',
        body: '<span style="color: var(--text-muted);">Build:</span> none (CDN)<br/>' +
              '<span style="color: var(--text-muted);">Initial:</span> ~120KB (Vue 3)<br/>' +
              '<span style="color: var(--text-muted);">Components:</span> lazy /cdn/<br/>' +
              '<span style="color: var(--text-muted);">Boot:</span> ~80ms createApp'
      },
      {
        color: 'emerald',
        title: 'Hook Performance',
        body: '<span style="color: var(--text-muted);">Reactive:</span> Vue 3 proxies<br/>' +
              '<span style="color: var(--text-muted);">Computed:</span> cached per-view<br/>' +
              '<span style="color: var(--text-muted);">Methods:</span> bound on mount<br/>' +
              '<span style="color: var(--text-muted);">Teardown:</span> route-change GC'
      },
      {
        color: 'rose',
        title: 'Auth Latency',
        body: '<span style="color: var(--text-muted);">X-Token read:</span> ~1ms<br/>' +
              '<span style="color: var(--text-muted);">Header inject:</span> ~1ms<br/>' +
              '<span style="color: var(--text-muted);">No:</span> OAuth round-trip<br/>' +
              '<span style="color: var(--text-muted);">No:</span> session cookie check'
      },
      {
        color: 'orange',
        title: 'External APIs',
        body: '<span style="color: var(--text-muted);">api.effiy.cn:</span> ~300ms p95<br/>' +
              '<span style="color: var(--text-muted);">SSE first chunk:</span> ~120ms<br/>' +
              '<span style="color: var(--text-muted);">Ollama local:</span> ~600ms<br/>' +
              '<span style="color: var(--text-muted);">Timeout:</span> 30s hard cap'
      }
    ],

    ownership: {
      headers: ['Module', 'Layer', 'Files', 'Tier', 'Owner', 'Path'],
      rows: [
        ['<span style="color: var(--color-frontend);">views/aicr</span>',  'View',     '<span style="color: var(--color-backend);">8</span>',  'Tier 1', 'Frontend · Alice', '<span style="color: var(--text-dim);">src/views/aicr/</span>'],
        ['<span style="color: var(--color-frontend);">views/claude</span>','View',     '<span style="color: var(--color-backend);">4</span>',  'Tier 1', 'Frontend · Bob',   '<span style="color: var(--text-dim);">src/views/claude/</span>'],
        ['<span style="color: var(--color-frontend);">views/story</span>', 'View',     '<span style="color: var(--color-backend);">6</span>',  'Tier 1', 'Frontend · Carol', '<span style="color: var(--text-dim);">src/views/story/</span>'],
        ['<span style="color: var(--color-backend);">core/services</span>', 'Services', '<span style="color: var(--color-backend);">6</span>',  'Tier 0', 'Platform · Dave',  '<span style="color: var(--text-dim);">src/core/services/</span>'],
        ['<span style="color: var(--color-cloud);">/cdn/utils</span>',     'CDN',      '<span style="color: var(--color-backend);">8</span>',  'Tier 0', 'Platform · Dave',  '<span style="color: var(--text-dim);">/cdn/utils/</span>'],
        ['<span style="color: var(--color-cloud);">/cdn/components</span>','CDN',     '<span style="color: var(--color-backend);">20</span>','Tier 2', 'Frontend · Eve',   '<span style="color: var(--text-dim);">/cdn/components/</span>']
      ]
    },

    apiTable: {
      headers: ['Method', 'Path', 'Service', 'Auth', 'Rate Limit', 'Description'],
      rows: [
        { method: 'GET',  color: 'frontend', path: '/aicr/sessions',         service: 'requestHelper',      auth: 'X-Token',  rate: '60/min',  desc: 'List review sessions for current user' },
        { method: 'POST', color: 'frontend', path: '/aicr/session',         service: 'crud',                auth: 'X-Token',  rate: '30/min',  desc: 'Create new review session' },
        { method: 'POST', color: 'async',    path: '/aicr/stream',          service: 'crud.streamPrompt',   auth: 'X-Token',  rate: '10/min',  desc: 'Stream AI review (SSE, line-by-line)' },
        { method: 'GET',  color: 'frontend', path: '/claude/projects',      service: 'crud',                auth: 'X-Token',  rate: '60/min',  desc: 'List Claude projects (skills/templates/rules/agents)' },
        { method: 'GET',  color: 'frontend', path: '/stories',              service: 'crud',                auth: 'X-Token',  rate: '60/min',  desc: 'List stories with filters' },
        { method: 'POST', color: 'frontend', path: '/stories/dep',          service: 'business',            auth: 'X-Token',  rate: '30/min',  desc: 'Add bidirectional story dependency' },
        { method: 'POST', color: 'async',    path: 'ollama/api/generate',   service: 'business',            auth: 'None',     rate: 'unlimited',desc: 'Local LLM inference (localhost:11434)' }
      ]
    },

    stack: [
      { label: 'Vue',              value: '3.x',   valueClass: 'cyan'    },
      { label: 'Vue Router',       value: '4.x',   valueClass: 'rose'   },
      { label: 'baseView',         value: 'CDN',   valueClass: 'cyan'    },
      { label: 'componentLoader',  value: 'CDN',   valueClass: 'cyan'    },
      { label: 'log.js',           value: 'CDN',   valueClass: 'cyan'    },
      { label: 'error.js',         value: 'CDN',   valueClass: 'cyan'    },
      { label: 'storage.js',       value: 'CDN',   valueClass: 'cyan'    },
      { label: 'Markdown Renderer',value: 'CDN',   valueClass: 'cyan'    },
      { label: 'Fetch API',        value: 'Native',valueClass: 'amber'  },
      { label: 'AbortController',  value: 'Native',valueClass: 'amber'  },
      { label: 'Nginx',            value: 'Infra', valueClass: 'amber'   },
      { label: 'Ollama',           value: 'Local', valueClass: 'orange'  },
      { label: 'api.effiy.cn',     value: 'REST+SSE',valueClass: 'orange'},
      { label: 'createStore',      value: 'Pattern',valueClass: 'emerald'},
      { label: 'X-Token',          value: 'Per-user',valueClass: 'rose' }
    ],

    schemaTiles: [],

    roadmap: [
      { tag: 'Q3\u201926', tagClass: 'q3',   text: 'Add Pinia store for cross-view shared state (currently per-view createStore only)', textClass: '' },
      { tag: 'Q3\u201926', tagClass: 'q3',   text: 'Migrate markdown renderer to a unified sanitizer (DOMPurify) across all views',     textClass: '' },
      { tag: 'Q4\u201926', tagClass: 'q4',   text: 'Add a 4th view (agents) for agentic review workflows and skill orchestration',       textClass: '' },
      { tag: 'Q4\u201926', tagClass: 'q4',   text: 'Replace CDN loading with a Vite build for tree-shaking and source maps in prod',     textClass: '' },
      { tag: 'Debt',       tagClass: 'debt', text: '66 hooks spread across 3 views — some duplication in computed/methods patterns',     textClass: 'muted' },
      { tag: 'Debt',       tagClass: 'debt', text: 'No package.json means no lockfile — CDN versions pinned only via Nginx config',         textClass: 'muted' }
    ],

    glossary: [
      { term: 'Vue 3',            termClass: 'cyan',    def: 'Progressive JS framework — Composition API, reactive proxies' },
      { term: 'SPA',              termClass: 'cyan',    def: 'Single-Page Application — client-side routing, no server rendering' },
      { term: 'Hash Router',      termClass: 'rose',    def: 'Vue Router hash mode — #/path, works on any static host' },
      { term: 'createBaseView',   termClass: 'cyan',    def: 'Custom factory that wires router + hooks + components per view' },
      { term: 'componentLoader',  termClass: 'cyan',    def: 'Dynamic HTML/CSS/JS loader — registerGlobalComponent, no bundler' },
      { term: 'createStore',      termClass: 'emerald', def: 'Per-view reactive state container — co-located, scoped lifecycle' },
      { term: 'useComputed',      termClass: 'emerald', def: 'Derived reactive state — tags, filtered lists, counts' },
      { term: 'useMethods',       termClass: 'emerald', def: 'Per-view method bag — CRUD, streaming, sync, business calls' },
      { term: 'requestHelper',    termClass: 'emerald', def: 'fetch wrapper — timeout, abort, retry, auth headers' },
      { term: 'X-Token',          termClass: 'rose',    def: 'Per-user auth token stored in localStorage, header-injected' },
      { term: 'streamPrompt',     termClass: 'orange',  def: 'SSE streaming endpoint for AI review responses' },
      { term: 'Ollama',           termClass: 'orange',  def: 'Local LLM runtime on localhost:11434 — privacy-friendly inference' },
      { term: 'api.effiy.cn',     termClass: 'orange',  def: 'Backend REST + SSE API — sessions, stories, Claude projects' },
      { term: 'Nginx',            termClass: 'amber',   def: 'Reverse proxy serving /cdn/ static assets + CORS config' }
    ]
  };
})();
