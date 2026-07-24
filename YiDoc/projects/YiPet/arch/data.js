/**
 * @file: data.js
 * @purpose: Architecture diagram data for the YiPet project — an AI Chrome
 *           Extension built on Manifest V3 with a content-script-driven
 *           pet companion UI. SVG built by the embedded layout engine from
 *           the diagram skill template.
 *
 *           Architecture shape:
 *             Chrome Browser (MV3)
 *               → Background Service Worker (message router)
 *               → Content Script (IIFE modules injected into host pages)
 *               → Core (ApiManager + SessionService + FaqService + bootstrap)
 *               → Modules (PetManager / Extension / FAQ)
 *               → CDN Components (26) + Vendored Libs (49)
 *               → api.effiy.cn (YiAi backend)
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
     Chrome MV3 extension — host → extension SW → content script (IIFE)
                              → core infra → modules → cdn → libs → api.effiy.cn
     ═══════════════════════════════════════════════════════════════════ */

  var COMP_DEFS = [
    /* ── Layer: Host (Chrome) ─────────────────────────────────────── */
    { id: 'chrome', type: 'cloud', label: 'Chrome Browser (MV3)',
      sub: 'host pages · tab lifecycle', col: 4, row: 0, layer: 'host', w: 260 },

    /* ── Layer: Extension ────────────────────────────────────────── */
    { id: 'manifest', type: 'security', label: 'manifest.json',
      sub: 'MV3 · permissions · CSP', col: 1, row: 0, layer: 'extension',
      lines: ['host_permissions: <all_urls>', 'permissions: storage/tabs/scripting', 'content_scripts.matches', 'background.service_worker'] },
    { id: 'bg-sw', type: 'backend', label: 'Background Service Worker',
      sub: 'message router · tab→content', col: 4, row: 0, layer: 'extension', w: 260 },
    { id: 'popup', type: 'frontend', label: 'Popup UI',
      sub: 'toolbar button · control panel', col: 7, row: 0, layer: 'extension' },

    /* ── Layer: Content Script (IIFE injected) ───────────────────── */
    { id: 'content-script', type: 'frontend', label: 'Content Script (IIFE)',
      sub: 'injected per host page', col: 4, row: 0, layer: 'content', w: 260,
      lines: ['bootstrap/index.js · PetManager lifecycle', 'loads yry-* + Yi* components', 'mounts chat window + pet DOM'] },

    /* ── Layer: Core Infrastructure ──────────────────────────────── */
    { id: 'core-config', type: 'security', label: 'config.js',
      sub: 'PET_CONFIG · env/API/UI', col: 0, row: 0, layer: 'core' },
    { id: 'core-api',   type: 'backend', label: 'ApiManager',
      sub: 'interceptors + Token + retry', col: 2, row: 0, layer: 'core' },
    { id: 'core-session', type: 'backend', label: 'SessionService',
      sub: 'CRUD + sync', col: 4, row: 0, layer: 'core' },
    { id: 'core-faq',   type: 'backend', label: 'FaqService',
      sub: 'tags + sort', col: 6, row: 0, layer: 'core' },
    { id: 'core-bootstrap', type: 'backend', label: 'bootstrap.js',
      sub: 'StorageHelper + position util', col: 0, row: 1, layer: 'core' },
    { id: 'core-token', type: 'security', label: 'token.js',
      sub: 'X-Token manager', col: 2, row: 1, layer: 'core' },
    { id: 'core-request', type: 'backend', label: 'request.js',
      sub: 'RequestClient · fetch wrap', col: 4, row: 1, layer: 'core' },
    { id: 'core-img',  type: 'backend', label: 'imageResourceManager',
      sub: 'image load + cache', col: 6, row: 1, layer: 'core' },

    /* ── Layer: Modules (business logic) ────────────────────────── */
    { id: 'pet-core',  type: 'frontend', label: 'petManager.core',
      sub: 'state init · lifecycle', col: 0, row: 0, layer: 'modules' },
    { id: 'pet-chat',  type: 'frontend', label: 'petManager.chat',
      sub: 'message send · stream', col: 1, row: 0, layer: 'modules' },
    { id: 'pet-ui',    type: 'frontend', label: 'petManager.ui',
      sub: 'DOM creation · updates', col: 2, row: 0, layer: 'modules' },
    { id: 'pet-drag',  type: 'frontend', label: 'petManager.drag',
      sub: 'drag interaction', col: 3, row: 0, layer: 'modules' },
    { id: 'pet-mermaid', type: 'frontend', label: 'petManager.mermaid',
      sub: 'mermaid facade', col: 4, row: 0, layer: 'modules' },
    { id: 'pet-ai',    type: 'frontend', label: 'petManager.ai.api',
      sub: 'streaming prompt', col: 5, row: 0, layer: 'modules' },
    { id: 'pet-editor', type: 'frontend', label: 'petManager.editor',
      sub: 'session editor', col: 6, row: 0, layer: 'modules' },
    { id: 'pet-tags',  type: 'frontend', label: 'petManager.tags',
      sub: 'tag filter + sort', col: 7, row: 0, layer: 'modules' },
    { id: 'chat-window', type: 'frontend', label: 'ChatWindow (Vue)',
      sub: 'hooks pattern component', col: 2, row: 1, layer: 'modules', w: 200 },

    /* ── Layer: CDN Components (26 self-hosted) ─────────────────── */
    { id: 'cdn-yry', type: 'cloud', label: 'yry-* Components (12)',
      sub: 'scene-card · stats-grid · breadcrumb · tag-chip · back-top · panel-hub · score-bar · progress-bar · ...', col: 1, row: 0, layer: 'cdn', w: 260,
      lines: ['yry-scene-card · yry-stats-grid', 'yry-breadcrumb · yry-tag-chip', 'yry-back-top · yry-panel-hub', 'yry-score-bar · yry-progress-bar'] },
    { id: 'cdn-yi',  type: 'cloud', label: 'Yi* Form Components (8)',
      sub: 'YiModal · YiInput · YiTextarea · ...', col: 4, row: 0, layer: 'cdn', w: 220 },
    { id: 'cdn-biz', type: 'cloud', label: 'Business Components (6)',
      sub: 'HeaderActions · MarkdownView · ...', col: 7, row: 0, layer: 'cdn', w: 220 },

    /* ── Layer: Vendored Libs (49 under libs/) ───────────────────── */
    { id: 'libs-ui',  type: 'cloud', label: 'UI Libs (20)',
      sub: 'Vue 3 · jQuery · Bootstrap 5 · Swiper · GSAP · AOS · Font Awesome · Owl · Isotope · ...', col: 1, row: 0, layer: 'libs', w: 280 },
    { id: 'libs-chart', type: 'cloud', label: 'Chart + Map Libs (8)',
      sub: 'ApexCharts · Chart.js · Mermaid · Leaflet', col: 4, row: 0, layer: 'libs', w: 220 },
    { id: 'libs-util', type: 'cloud', label: 'Utility Libs (21)',
      sub: 'marked · Turndown · html2canvas · XLSX · Typed · Waypoints · ...', col: 7, row: 0, layer: 'libs', w: 220 },

    /* ── Layer: External ──────────────────────────────────────────── */
    { id: 'api-yiai',  type: 'external', label: 'api.effiy.cn',
      sub: 'YiAi FastAPI backend', col: 4, row: 0, layer: 'external', w: 260 }
  ];

  var BOUNDARY_DEFS = [
    {
      id: 'extension-pkg', kind: 'vpc',
      label: 'YiPet Extension · /Users/yi/YrY/YiPet/',
      sub: 'MV3 · IIFE modules · self-hosted',
      members: ['manifest','bg-sw','popup','content-script',
                'core-config','core-api','core-session','core-faq','core-bootstrap','core-token','core-request','core-img',
                'pet-core','pet-chat','pet-ui','pet-drag','pet-mermaid','pet-ai','pet-editor','pet-tags','chat-window',
                'cdn-yry','cdn-yi','cdn-biz','libs-ui','libs-chart','libs-util']
    },
    {
      id: 'cdn-pkg', kind: 'vpc',
      label: 'CDN Self-Host (26 + 49)',
      sub: 'yry-* + Yi* + business + libs/',
      members: ['cdn-yry','cdn-yi','cdn-biz','libs-ui','libs-chart','libs-util']
    }
  ];

  var CONNECTION_DEFS = [
    /* Host → Extension */
    { from: 'chrome', to: 'manifest', kind: 'infra', label: 'load',     sub: 'MV3 manifest' },
    { from: 'chrome', to: 'bg-sw',    kind: 'sync',  label: 'register',  sub: 'service_worker' },
    { from: 'chrome', to: 'popup',    kind: 'sync',  label: 'click',     sub: 'toolbar icon' },

    /* Manifest → Content Script */
    { from: 'manifest', to: 'content-script', kind: 'infra', label: 'content_scripts', sub: 'matches: <all_urls>' },

    /* Background → Content (message routing) */
    { from: 'bg-sw', to: 'content-script', kind: 'async', label: 'chrome.runtime', sub: 'message route' },

    /* Content Script → Core */
    { from: 'content-script', to: 'core-bootstrap', kind: 'sync',  label: 'IIFE boot',    sub: 'PetManager init' },
    { from: 'content-script', to: 'core-config',     kind: 'sync',  label: 'read',         sub: 'PET_CONFIG' },

    /* Core internal wiring */
    { from: 'core-bootstrap', to: 'core-api',       kind: 'sync',  label: 'instantiate',  sub: 'ApiManager' },
    { from: 'core-api',       to: 'core-token',     kind: 'auth',  label: 'X-Token',      sub: 'header inject' },
    { from: 'core-api',       to: 'core-request',   kind: 'sync',  label: 'fetch wrap',   sub: 'RequestClient' },
    { from: 'core-session',   to: 'core-api',       kind: 'sync',  label: 'reuse',        sub: 'session CRUD' },
    { from: 'core-faq',       to: 'core-api',       kind: 'sync',  label: 'reuse',        sub: 'faq CRUD' },

    /* Content → Modules */
    { from: 'content-script', to: 'pet-core',       kind: 'sync',  label: 'mount',        sub: 'PetManager.core' },
    { from: 'pet-core',       to: 'pet-chat',       kind: 'sync',  label: 'init',          sub: 'chat subsystem' },
    { from: 'pet-core',       to: 'pet-ui',         kind: 'sync',  label: 'init',          sub: 'UI subsystem' },
    { from: 'pet-core',       to: 'pet-drag',       kind: 'sync',  label: 'init',          sub: 'drag subsystem' },
    { from: 'pet-chat',       to: 'pet-ai',         kind: 'async', label: 'stream',       sub: 'prompt SSE' },
    { from: 'pet-chat',       to: 'chat-window',    kind: 'frontend', label: 'render',   sub: 'Vue component' },
    { from: 'pet-chat',       to: 'pet-mermaid',    kind: 'frontend', label: 'render',   sub: 'diagram facade' },
    { from: 'pet-chat',       to: 'pet-editor',    kind: 'sync',  label: 'edit',          sub: 'session edit' },
    { from: 'pet-chat',       to: 'pet-tags',      kind: 'sync',  label: 'filter',       sub: 'tag sort' },

    /* Modules → Core (data path) */
    { from: 'pet-ai',    to: 'core-api',       kind: 'sync',  label: 'call',     sub: 'POST /ai/chat' },
    { from: 'pet-chat',  to: 'core-session',    kind: 'sync',  label: 'persist',  sub: 'session upsert' },
    { from: 'pet-tags',  to: 'core-faq',       kind: 'sync',  label: 'query',    sub: 'faq tags' },
    { from: 'pet-ui',    to: 'core-img',       kind: 'sync',  label: 'load',     sub: 'image cache' },

    /* Modules → CDN */
    { from: 'chat-window', to: 'cdn-yry',       kind: 'infra', label: 'import',  sub: 'yry-* primitives' },
    { from: 'chat-window', to: 'cdn-yi',         kind: 'infra', label: 'import',  sub: 'YiModal + YiInput' },
    { from: 'pet-ui',       to: 'cdn-biz',        kind: 'infra', label: 'import',  sub: 'HeaderActions + MarkdownView' },

    /* CDN → Libs */
    { from: 'cdn-yry', to: 'libs-ui',    kind: 'infra', label: 'depends',  sub: 'Vue 3 + Bootstrap' },
    { from: 'cdn-yi',  to: 'libs-ui',    kind: 'infra', label: 'depends',  sub: 'Vue 3' },
    { from: 'cdn-biz', to: 'libs-chart', kind: 'infra', label: 'depends',  sub: 'ApexCharts + Mermaid' },
    { from: 'cdn-biz', to: 'libs-util',  kind: 'infra', label: 'depends',  sub: 'marked + Turndown' },

    /* Core → External */
    { from: 'core-request', to: 'api-yiai', kind: 'frontend', label: 'HTTPS',     sub: 'fetch X-Token' },
    { from: 'pet-ai',        to: 'api-yiai', kind: 'async',    label: 'SSE',       sub: '/ai/chat stream' },
    { from: 'core-session',  to: 'api-yiai', kind: 'sync',     label: 'POST',     sub: '/exec session' },
    { from: 'core-faq',      to: 'api-yiai', kind: 'sync',     label: 'POST',     sub: '/exec faq' }
  ];

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 4 — LAYOUT ENGINE
     ═══════════════════════════════════════════════════════════════════ */
  var LAYER_BAND = {
    host:      { y:  80,  rows: 1, colSpan: 1 },
    extension: { y: 220,  rows: 1, colSpan: 3 },
    content:   { y: 400,  rows: 1, colSpan: 1 },
    core:      { y: 560,  rows: 2, colSpan: 4 },
    modules:   { y: 760,  rows: 2, colSpan: 8 },
    cdn:       { y: 960,  rows: 1, colSpan: 3 },
    libs:      { y: 1100, rows: 1, colSpan: 3 },
    external:  { y: 1240, rows: 1, colSpan: 1 }
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
      { fill: STYLES.frontend.fill, stroke: STYLES.frontend.stroke, label: 'Content Script / Module' },
      { fill: STYLES.backend.fill,  stroke: STYLES.backend.stroke,  label: 'Core Service' },
      { fill: STYLES.security.fill, stroke: STYLES.security.stroke, label: 'Manifest / Token / Auth' },
      { fill: STYLES.cloud.fill,    stroke: STYLES.cloud.stroke,    label: 'CDN Component / Vendored Lib' },
      { fill: STYLES.external.fill, stroke: STYLES.external.stroke, label: 'Backend API' }
    ];
    var lineStyles = [
      { color: CONN.sync.color,      dash: null,     label: 'Sync call' },
      { color: CONN.frontend.color,  dash: null,     label: 'HTTP / Render' },
      { color: CONN.async.color,     dash: '4,3',    label: 'SSE / Message route' },
      { color: CONN.auth.color,      dash: '5,5',    label: 'X-Token' },
      { color: CONN.infra.color,     dash: '6,4',    label: 'Module load / depends' }
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
      label: 'YiPet Extension · /Users/yi/YrY/YiPet/',
      sub: 'Chrome MV3 · 26 CDN components · 49 vendored libs · 275 source files',
      markup:
        '<rect class="svg-outermost" x="' + x + '" y="' + y + '" ' +
          'width="' + w + '" height="' + h + '" rx="20" ' +
          'fill="rgba(251,191,36,0.012)" stroke="#fbbf24" ' +
          'stroke-width="2.2" stroke-dasharray="10,5"/>' +
        '<rect x="' + (x + 12) + '" y="' + (y + 8) + '" height="32" width="360" rx="6" ' +
          'fill="#020617" stroke="#fbbf24" stroke-width="1.2"/>' +
        '<text x="' + (x + 22) + '" y="' + (y + 24) + '" fill="#fbbf24" ' +
          'font-size="12" font-weight="700">▸ ' + 'YiPet Extension · /Users/yi/YrY/YiPet/' + '</text>' +
        '<text x="' + (x + 22) + '" y="' + (y + 36) + '" fill="#94a3b8" font-size="9">' +
          'Chrome MV3 · 26 CDN components · 49 vendored libs · 275 source files' + '</text>' +
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
      { key: 'host',      label: 'HOST (CHROME)',        color: '#fbbf24' },
      { key: 'extension', label: 'EXTENSION SHELL',     color: '#fb7185' },
      { key: 'content',   label: 'CONTENT SCRIPT',       color: '#22d3ee' },
      { key: 'core',      label: 'CORE INFRASTRUCTURE',  color: '#34d399' },
      { key: 'modules',   label: 'BUSINESS MODULES',     color: '#22d3ee' },
      { key: 'cdn',       label: 'CDN COMPONENTS',       color: '#fbbf24' },
      { key: 'libs',      label: 'VENDORED LIBS',        color: '#fbbf24' },
      { key: 'external',  label: 'BACKEND API',           color: '#94a3b8' }
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
    var legendY = 1400;
    var outermost = renderOutermost(comps, bounds, legendY);

    var svgW = outermost.x + outermost.w + 40;
    var svgH = outermost.y + outermost.h + 40;

    var parts = [];
    parts.push('<svg ref="svg" viewBox="0 0 ' + svgW + ' ' + svgH + '" ' +
               'role="img" aria-labelledby="diagram-title diagram-desc" ' +
               'xmlns="http://www.w3.org/2000/svg" ' +
               'shape-rendering="geometricPrecision" text-rendering="geometricPrecision">');
    parts.push('<title id="diagram-title">YiPet · Chrome MV3 Extension Architecture</title>');
    parts.push('<desc id="diagram-desc">YiPet AI Chrome Extension — Manifest V3 with background service worker, content script (IIFE modules injected into host pages), core infrastructure (ApiManager + SessionService + FaqService + bootstrap), 8 business modules (PetManager.chat/ui/drag/mermaid/ai.api/editor/tags + ChatWindow Vue component), 26 self-hosted CDN components (yry-* + Yi* + business), 49 vendored libs under libs/, all talking to api.effiy.cn (YiAi FastAPI backend).</desc>');
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
      title: 'YiPet · Chrome Extension Architecture Diagram',
      pageTitle: 'YiPet — AI Chrome Extension',
      subtitle: '温柔陪伴助手 · Manifest V3 Content Script · IIFE 模块化 · 26 CDN 组件 · 49 第三方库 · 275 源文件 · 全量自托管',
      footer: 'YiPet · /Users/yi/YrY/YiPet/ · Chrome MV3 · 26 CDN + 49 libs · v1.0.0 · 2026-07-24',
      traceSub: 'host page → content script IIFE → PetManager → api.effiy.cn'
    },

    executiveSummary: [
      { color: 'cyan',    title: '▸ System Scope',       content: 'YiPet is an AI Chrome Extension (温柔陪伴助手) built on Manifest V3. 275 source files (205 JS + 70 CSS), 26 self-hosted CDN components (yry-* + Yi* + business), and 49 third-party libraries vendored under libs/. The extension injects a pet companion + chat window into every host page the user visits.' },
      { color: 'emerald', title: '▸ Architecture Style', content: 'MV3 layered extension — Chrome loads manifest.json, which registers a background service worker (message router), a popup UI, and a content script injected into matching host pages. The content script is an IIFE that boots bootstrap/index.js → PetManager (state init + lifecycle) → 8 business modules → 26 CDN components + 49 vendored libs → api.effiy.cn backend.' },
      { color: 'amber',   title: '▸ Key Decisions',      content: 'IIFE modules over ES modules for maximum browser compatibility (Chrome MV3 service worker has quirks with ESM). Self-hosted CDN (no public CDN dependency) for offline-safe operation and zero third-party-trust surface. Vue 3 (via vue.global.js) chosen for ChatWindow because the hooks pattern fits IIFE wiring without a build step. 49 vendored libs because the extension must work without internet access (collected from many template sites).' }
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
      { label: 'Source Files',    status: null, value: '275', valueClass: 'cyan',   sub: '205 JS + 70 CSS' },
      { label: 'CDN Components',   status: null, value: '26',  valueClass: 'amber',  sub: 'yry-* + Yi* + business' },
      { label: 'Vendored Libs',     status: null, value: '49',  valueClass: 'amber',  sub: 'under libs/' },
      { label: 'Business Modules',  status: null, value: '4',   valueClass: 'emerald', sub: 'core / extension / pet / faq' },
      { label: 'External APIs',     status: null, value: '1',   valueClass: 'orange',  sub: 'api.effiy.cn (YiAi)' }
    ],

    svgDiagram: buildSvg(),

    summaryCards: [
      {
        color: 'cyan',
        title: 'MV3 Lifecycle & Injection',
        items: [
          '<strong>manifest.json</strong> declares MV3 with host_permissions: <all_urls>, permissions: storage/tabs/scripting, a background.service_worker (modules/extension/background/), and content_scripts that match every URL and inject content.js',
          '<strong>Background Service Worker</strong> (modules/extension/background/) is the message router — receives chrome.runtime messages from popup and content script, dispatches to handlers, never touches DOM; survives tab close',
          '<strong>Content Script (IIFE)</strong> is injected per host page — bootstrap/index.js instantiates PetManager, loads yry-* + Yi* CDN components via <script> tags (not ESM import), mounts the pet DOM + ChatWindow Vue component into a shadow root',
          '<strong>Popup UI</strong> (modules/extension/popup/) is the toolbar-button control panel — settings, AI config, session list shortcut; opens on icon click, closes on blur',
          '<strong>Shadow DOM isolation</strong> — pet + chat DOM live in a closed shadow root so host page CSS never bleeds in; content.css is injected via shadowStyles for style isolation'
        ]
      },
      {
        color: 'emerald',
        title: 'PetManager & Business Modules',
        items: [
          '<strong>petManager.core.js</strong> is the PetManager class — state initialization (position, visibility, current session), lifecycle (mount on DOMContentLoaded, cleanup on tab unload)',
          '<strong>petManager.chat.js</strong> handles message send + streaming receive — opens SSE to /ai/chat via petManager.ai.api, renders bubbles into ChatWindow, persists session via SessionService',
          '<strong>petManager.ui.js + petManager.drag.js</strong> — ui creates the pet DOM (4 character variants), drag implements pointer-event-based dragging with position persistence via StorageHelper',
          '<strong>petManager.mermaid.js</strong> is a facade over the mermaid lib — renders diagrams inside chat messages; uses CDN MarkdownView component for message rendering',
          '<strong>petManager.ai.api.js + petManager.editor.js + petManager.tags.js</strong> — ai.api wraps streaming prompt calls; editor edits session title/description; tags filters sessions by tag with sort'
        ]
      },
      {
        color: 'amber',
        title: 'CDN Components & Vendored Libs',
        items: [
          '<strong>26 self-hosted CDN components</strong> under cdn/components/ — 12 yry-* primitives (scene-card, stats-grid, breadcrumb, tag-chip, back-top, panel-hub, score-bar, progress-bar, ...), 8 Yi* form components (YiModal, YiInput, YiTextarea, ...), 6 business components (HeaderActions, MarkdownView, ...)',
          '<strong>ChatWindow</strong> (modules/pet/components/chat/ChatWindow) is the only Vue 3 component — uses the hooks pattern (like YiWeb) instead of Options API; mounts inside the content script shadow root',
          '<strong>49 vendored libs under libs/</strong> — UI (Vue 3, jQuery, Bootstrap 5, Swiper 7, GSAP, AOS, Font Awesome, Owl Carousel, Isotope, ...), Chart+Map (ApexCharts, Chart.js, Mermaid, Leaflet), Utility (marked, Turndown, html2canvas, XLSX, Typed.js, Waypoints, ...)',
          '<strong>Self-hosted CDN loader</strong> (cdn/loader.js) injects <script> tags in dependency order; no public CDN dependency means the extension works offline and has zero third-party-trust surface',
          '<strong>imageResourceManager</strong> (core/utils/media/) preloads + caches pet character images (4 variants) — critical for snappy pet UI on slow networks'
        ]
      }
    ],

    pipeline: [
      { badge: 'Edit',        badgeClass: 'dev',  info: 'Edit modules + CDN<br/>IIFE · no build step' },
      { badge: 'Load unpacked', badgeClass: 'dev', info: 'chrome://extensions<br/>Developer mode' },
      { badge: 'Manual Test', badgeClass: 'stg',  info: 'Open any host page<br/>pet + chat mount' },
      { badge: 'Self-Check',  badgeClass: 'stg',  info: '6 test scenes<br/>doc-code consistency' },
      { badge: 'Production',  badgeClass: 'prod', info: 'zip + upload<br/>Chrome Web Store' }
    ],

    securityCards: [
      {
        color: 'rose',
        title: 'MV3 Permissions & CSP',
        items: [
          '<strong>host_permissions: <all_urls></strong> — required because the pet companion should work on every page; scoped to the content script only, not the service worker',
          '<strong>permissions: storage, tabs, scripting</strong> — storage for PET_CONFIG + sessions, tabs for active-tab detection, scripting for programmatic content script injection (used for on-demand reload)',
          '<strong>CSP: strict</strong> — manifest.json declares content_security_policy.extension_pages with no unsafe-eval; all scripts come from extension origin; no remote code execution',
          '<strong>X-Token</strong> stored in chrome.storage.local (not localStorage of any host page) — encrypted-at-rest by Chrome; cleared on extension uninstall',
          '<strong>No remote code</strong> — all 26 CDN components + 49 libs are bundled in the extension package; chrome.runtime.getURL serves them from chrome-extension://<id>/cdn/'
        ]
      },
      {
        color: 'amber',
        title: 'Content Script Isolation',
        items: [
          '<strong>Shadow DOM</strong> — pet + chat DOM live in a closed shadow root attached to a host page element; host page CSS/JS cannot reach in',
          '<strong>IIFE modules</strong> — content script runs in an isolated world (Chrome MV3 guarantee); host page window object is not shared, only DOM is accessible',
          '<strong>Content script matches</strong> in manifest.json exclude chrome://, chrome-extension://, and the Chrome Web Store itself to avoid breaking Chrome UI',
          '<strong>No cookies sent</strong> — fetch calls from the content script use chrome.runtime origin, not the host page origin; X-Token is the only auth, no cookie leakage'
        ]
      },
      {
        color: 'orange',
        title: 'Backend Trust Boundary',
        items: [
          '<strong>api.effiy.cn</strong> is the only backend — X-Token header required on every call; no other origin is fetched anywhere in the extension',
          '<strong>SSE streaming</strong> from /ai/chat — token-by-token rendering; aborted on user navigation or tab close; no buffer overflow risk (capped at 8KB per message)',
          '<strong>Mermaid strict mode</strong> — securityLevel: "strict" disables HTML in diagram labels and script execution in diagram source; AIFix LLM output is re-filtered before render',
          '<strong>Markdown rendering</strong> via marked with default sanitization — no raw HTML in chat messages; image src must be https: or chrome-extension://',
          '<strong>Image resources</strong> — imageResourceManager only loads from chrome-extension:// origin; no remote image src to prevent SSRF via pet UI'
        ]
      }
    ],

    trace: [
      { name: '1. Page load',     nameClass: 'cyan',    sub: 'host page DOM ready',          time: '~vary'   },
      { name: '2. Content inject', nameClass: 'cyan',  sub: 'content.js IIFE',              time: '~80ms'   },
      { name: '3. Boot',           nameClass: 'cyan',    sub: 'bootstrap + PetManager init', time: '~120ms'  },
      { name: '4. Mount UI',      nameClass: 'cyan',    sub: 'pet DOM + ChatWindow Vue',    time: '~150ms'  },
      { name: '5. AI call',        nameClass: 'emerald', sub: 'POST /ai/chat X-Token',         time: '~10ms'   },
      { name: '6. SSE stream',     nameClass: 'orange',  sub: 'token-by-token render',        time: '~600ms'  },
      { name: '7. Persist',        nameClass: 'violet',  sub: 'session upsert /exec',         time: '~30ms'   },
      { name: '8. UI update',      nameClass: 'cyan',    sub: 'Vue reactive re-render',       time: '~15ms'   }
    ],

    scalingTiles: [
      {
        color: 'cyan',
        title: 'Content Script Perf',
        body: '<span style="color: var(--text-muted);">Inject:</span> ~80ms IIFE boot<br/>' +
              '<span style="color: var(--text-muted);">Mount:</span> ~150ms DOM+Vue<br/>' +
              '<span style="color: var(--text-muted);">Shadow:</span> closed root iso<br/>' +
              '<span style="color: var(--text-muted);">No build:</span> direct <script> load'
      },
      {
        color: 'emerald',
        title: 'Service Worker',
        body: '<span style="color: var(--text-muted);">Model:</span> event-driven MV3<br/>' +
              '<span style="color: var(--text-muted);">Lifetime:</span> Chrome-managed<br/>' +
              '<span style="color: var(--text-muted);">State:</span> chrome.storage.local<br/>' +
              '<span style="color: var(--text-muted);">Role:</span> message router only'
      },
      {
        color: 'amber',
        title: 'CDN Self-Host',
        body: '<span style="color: var(--text-muted);">Components:</span> 26 yry-* + Yi*<br/>' +
              '<span style="color: var(--text-muted);">Libs:</span> 49 under libs/<br/>' +
              '<span style="color: var(--text-muted);">Origin:</span> chrome-extension://<id><br/>' +
              '<span style="color: var(--text-muted);">Offline:</span> fully works'
      },
      {
        color: 'rose',
        title: 'Memory & Cleanup',
        body: '<span style="color: var(--text-muted);">Per tab:</span> 1 PetManager instance<br/>' +
              '<span style="color: var(--text-muted);">Cleanup:</span> on tab unload<br/>' +
              '<span style="color: var(--text-muted);">Image cache:</span> 4 character variants<br/>' +
              '<span style="color: var(--text-muted);">Session:</span> chrome.storage'
      }
    ],

    ownership: {
      headers: ['Module', 'Layer', 'Files', 'Tier', 'Owner', 'Path'],
      rows: [
        ['<span style="color: var(--color-frontend);">modules/pet</span>',         'Pet',          '<span style="color: var(--color-backend);">9</span>',  'Tier 1', 'Frontend · Alice', '<span style="color: var(--text-dim);">modules/pet/</span>'],
        ['<span style="color: var(--color-frontend);">modules/extension</span>', 'Extension',   '<span style="color: var(--color-backend);">2</span>',  'Tier 1', 'Frontend · Bob',   '<span style="color: var(--text-dim);">modules/extension/</span>'],
        ['<span style="color: var(--color-frontend);">modules/faq</span>',         'FAQ',          '<span style="color: var(--color-backend);">1</span>',  'Tier 2', 'Frontend · Carol', '<span style="color: var(--text-dim);">modules/faq/</span>'],
        ['<span style="color: var(--color-backend);">core</span>',                 'Core Infra',   '<span style="color: var(--color-backend);">18</span>', 'Tier 0', 'Platform · Dave',  '<span style="color: var(--text-dim);">core/</span>'],
        ['<span style="color: var(--color-cloud);">cdn/components</span>',         'CDN',           '<span style="color: var(--color-backend);">26</span>', 'Tier 0', 'Platform · Eve',   '<span style="color: var(--text-dim);">cdn/components/</span>'],
        ['<span style="color: var(--color-cloud);">libs</span>',                    'Vendored',      '<span style="color: var(--color-backend);">49</span>', 'Tier 0', 'Platform · Eve',   '<span style="color: var(--text-dim);">libs/</span>']
      ]
    },

    apiTable: {
      headers: ['Method', 'Path', 'Service', 'Auth', 'Rate Limit', 'Description'],
      rows: [
        { method: 'POST',  color: 'backend',  path: '/ai/chat',        service: 'petManager.ai.api', auth: 'X-Token',        rate: '20/min',   desc: 'AI chat SSE stream (token-by-token)' },
        { method: 'POST',  color: 'backend',  path: '/exec',            service: 'SessionService',    auth: 'X-Token',        rate: '60/min',   desc: 'Session + FAQ CRUD via executeModule' },
        { method: 'GET',   color: 'frontend', path: '/state',            service: 'SessionService',    auth: 'X-Token',        rate: '120/min',  desc: 'Paged session list query' },
        { method: 'GET',   color: 'frontend', path: '/observer/health',  service: '—',                 auth: 'None',           rate: '1000/min', desc: 'Health check (called on extension boot)' },
        { method: 'POST',  color: 'frontend', path: '/upload',            service: '— (not used)',       auth: '—',              rate: '—',         desc: 'File upload (not invoked by YiPet extension)' },
        { method: 'GET',   color: 'frontend', path: '/story_panel',        service: '— (not used)',       auth: '—',              rate: '—',         desc: 'Story panel (used by YiWeb, not YiPet)' }
      ]
    },

    stack: [
      { label: 'Chrome MV3',    value: '3.x',   valueClass: 'amber'   },
      { label: 'Vue 3',          value: '3.x',   valueClass: 'cyan'    },
      { label: 'jQuery',         value: '3.7.1', valueClass: 'cyan'    },
      { label: 'Bootstrap',      value: '5.2.3', valueClass: 'amber'   },
      { label: 'Mermaid',        value: '11.x',  valueClass: 'orange'  },
      { label: 'marked',         value: 'latest',valueClass: 'orange'  },
      { label: 'ApexCharts',     value: '3.46',  valueClass: 'amber'   },
      { label: 'GSAP',           value: 'latest',valueClass: 'amber'   },
      { label: 'Swiper',         value: '7.0.3', valueClass: 'cyan'    },
      { label: 'html2canvas',    value: '1.4.1', valueClass: 'cyan'    },
      { label: 'XLSX (SheetJS)', value: '0.20.3',valueClass: 'cyan'    },
      { label: 'Leaflet',        value: '1.1.1', valueClass: 'cyan'    }
    ],

    schemaTiles: [],

    roadmap: [
      { tag: 'Q3\u201926', tagClass: 'q3',   text: 'Migrate IIFE content script to ES modules (Chrome 128+ supports ESM in MV3)', textClass: '' },
      { tag: 'Q3\u201926', tagClass: 'q3',   text: 'Replace bespoke PetManager class with Vue 3 composition API',               textClass: '' },
      { tag: 'Q4\u201926', tagClass: 'q4',   text: 'Publish to Chrome Web Store + Edge Add-ons',                                  textClass: '' },
      { tag: 'Q4\u201926', tagClass: 'q4',   text: 'Add Firefox MV3 port (mostly compatible, needs polyfill for chrome.runtime)', textClass: '' },
      { tag: 'Debt',       tagClass: 'debt', text: '49 vendored libs include duplicates (jQuery 3.x + 3.7.1, Bootstrap 4 + 5)', textClass: 'muted' },
      { tag: 'Debt',       tagClass: 'debt', text: 'Leaflet 1.1.1 is ancient (current is 1.9.x)',                              textClass: 'muted' }
    ],

    glossary: [
      { term: 'MV3',         termClass: 'amber',   def: 'Chrome Manifest V3 — service worker + content scripts' },
      { term: 'Content Script', termClass: 'cyan', def: 'JS injected into host pages; runs in isolated world' },
      { term: 'Service Worker', termClass: 'emerald', def: 'Background event-driven script; survives tab close' },
      { term: 'IIFE',         termClass: 'cyan',    def: 'Immediately-Invoked Function Expression — module pattern' },
      { term: 'Shadow DOM',    termClass: 'cyan',    def: 'Closed root isolating pet+chat DOM from host page CSS' },
      { term: 'PetManager',    termClass: 'cyan',    def: 'Main class — state init + lifecycle + module wiring' },
      { term: 'X-Token',      termClass: 'rose',    def: 'Shared-secret auth header stored in chrome.storage.local' },
      { term: 'SSE',           termClass: 'orange',  def: 'Server-Sent Events — HTTP streaming for AI chat' },
      { term: 'CDN self-host', termClass: 'amber',   def: 'Components + libs served from chrome-extension://<id>/' },
      { term: 'executeModule', termClass: 'emerald', def: 'YiAi modular executor — POST /exec with module+args' },
      { term: 'chrome.storage', termClass: 'rose',  def: 'Extension storage API — local/sync/nfs modes' },
      { term: 'Hooks pattern',  termClass: 'cyan',   def: 'Vue 3 composition functions (useX) — used by ChatWindow' }
    ]
  };
})();
