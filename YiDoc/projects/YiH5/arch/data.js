/**
 * @file: data.js
 * @purpose: Architecture diagram data for the YiH5 project — a vanilla
 *           JavaScript H5 SPA with session management, AI chat, news feed,
 *           and mermaid integration. SVG built by the embedded layout
 *           engine from the diagram skill template.
 *
 *           Architecture shape:
 *             Mobile User → index.html (SPA) → Hash Router
 *               → Home View (state/chat/page-context)
 *               → Components (9) + Services (7) + Utils (6) + Mermaid (10)
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
     YiH5 vanilla JS SPA — client → index.html → router → view →
     components + services + utils → api.effiy.cn backend
     ═══════════════════════════════════════════════════════════════════ */

  var COMP_DEFS = [
    /* ── Layer: Client ───────────────────────────────────────────── */
    { id: 'mobile-user', type: 'external', label: 'Mobile User',
      sub: 'iOS · Android · WeChat', col: 4, row: 0, layer: 'client', w: 200 },

    /* ── Layer: Entry ─────────────────────────────────────────────── */
    { id: 'index-html', type: 'frontend', label: 'index.html (SPA Shell)',
      sub: 'SVG sprite + debug panel', col: 4, row: 0, layer: 'entry', w: 220,
      lines: ['CDN libs: marked + mermaid + md5', 'loads views/home/index.js', 'config.js bootstraps apiBase'] },

    /* ── Layer: Router ────────────────────────────────────────────── */
    { id: 'router', type: 'frontend', label: 'Hash Router',
      sub: 'parseRoute · navigateToChat', col: 4, row: 0, layer: 'router', w: 220 },

    /* ── Layer: View ──────────────────────────────────────────────── */
    { id: 'state-js', type: 'frontend', label: 'state.js',
      sub: 'global reactive state', col: 2, row: 0, layer: 'view' },
    { id: 'chat-js',  type: 'frontend', label: 'chat.js',
      sub: 'message + stream + persist', col: 4, row: 0, layer: 'view' },
    { id: 'page-ctx', type: 'frontend', label: 'page-context.js',
      sub: 'optimize · translate · save', col: 6, row: 0, layer: 'view' },

    /* ── Layer: Components ───────────────────────────────────────── */
    { id: 'comp-chat',  type: 'frontend', label: 'Chat',
      sub: 'bubbles + stream', col: 0, row: 0, layer: 'components' },
    { id: 'comp-news',  type: 'frontend', label: 'NewsList',
      sub: 'virtual scroll + read', col: 1, row: 0, layer: 'components' },
    { id: 'comp-session', type: 'frontend', label: 'SessionList',
      sub: 'swipe-delete + fav', col: 2, row: 0, layer: 'components' },
    { id: 'comp-base',  type: 'frontend', label: 'BaseList',
      sub: 'sort + filter', col: 3, row: 0, layer: 'components' },
    { id: 'comp-virtual', type: 'frontend', label: 'VirtualList',
      sub: 'windowed render', col: 4, row: 0, layer: 'components' },
    { id: 'comp-swipe', type: 'frontend', label: 'SwipeScroll',
      sub: 'gesture handler', col: 5, row: 0, layer: 'components' },
    { id: 'comp-search', type: 'frontend', label: 'Search',
      sub: 'query + clear', col: 6, row: 0, layer: 'components' },
    { id: 'comp-preview', type: 'frontend', label: 'Preview',
      sub: 'zoom + long-press save', col: 7, row: 0, layer: 'components' },

    /* ── Layer: Services ─────────────────────────────────────────── */
    { id: 'svc-auth',    type: 'backend', label: 'auth.js',
      sub: 'X-Token · localStorage', col: 0, row: 0, layer: 'services' },
    { id: 'svc-client',  type: 'backend', label: 'client.js',
      sub: 'fetchWithAuth + RequestClient', col: 2, row: 0, layer: 'services' },
    { id: 'svc-prompt',  type: 'backend', label: 'prompt.js',
      sub: 'AI · SSE + think-strip', col: 4, row: 0, layer: 'services' },
    { id: 'svc-session', type: 'backend', label: 'session.js',
      sub: 'CRUD via executeModule', col: 6, row: 0, layer: 'services' },
    { id: 'svc-news',    type: 'backend', label: 'news.js',
      sub: 'query_documents · rss', col: 1, row: 1, layer: 'services' },
    { id: 'svc-faq',     type: 'backend', label: 'faq.js',
      sub: 'query_documents · faqs', col: 3, row: 1, layer: 'services' },
    { id: 'svc-index',   type: 'backend', label: 'index.js (barrel)',
      sub: 'API URL constants', col: 5, row: 1, layer: 'services' },

    /* ── Layer: Utils ────────────────────────────────────────────── */
    { id: 'util-md',    type: 'cloud', label: 'markdown.js',
      sub: 'marked wrapper + mermaid hook', col: 1, row: 0, layer: 'utils' },
    { id: 'util-msg',   type: 'cloud', label: 'msg.js',
      sub: 'role + text normalize', col: 3, row: 0, layer: 'utils' },
    { id: 'util-scroll', type: 'cloud', label: 'scroll.js',
      sub: 'preserve + near-bottom', col: 5, row: 0, layer: 'utils' },
    { id: 'util-vp',    type: 'cloud', label: 'viewport.js',
      sub: 'iOS visualViewport', col: 7, row: 0, layer: 'utils' },

    /* ── Layer: Mermaid ───────────────────────────────────────────── */
    { id: 'mermaid-core', type: 'message', label: 'Mermaid Core',
      sub: 'MermaidConfig + Renderer', col: 2, row: 0, layer: 'mermaid',
      lines: ['theme / security / font', 'render + error handling'] },
    { id: 'mermaid-plugins', type: 'message', label: 'Mermaid Plugins',
      sub: 'AIFix · Clipboard · Download · Fullscreen · Toolbar', col: 5, row: 0, layer: 'mermaid', w: 260 },

    /* ── Layer: External ──────────────────────────────────────────── */
    { id: 'api-yiai',  type: 'external', label: 'api.effiy.cn',
      sub: 'YiAi FastAPI backend', col: 4, row: 0, layer: 'external', w: 260 }
  ];

  var BOUNDARY_DEFS = [
    {
      id: 'spa-shell', kind: 'vpc',
      label: 'YiH5 SPA · /Users/yi/YrY/YiH5/',
      sub: 'IIFE modules · zero build step',
      members: ['index-html','router','state-js','chat-js','page-ctx',
                'comp-chat','comp-news','comp-session','comp-base','comp-virtual',
                'comp-swipe','comp-search','comp-preview',
                'svc-auth','svc-client','svc-prompt','svc-session',
                'svc-news','svc-faq','svc-index',
                'util-md','util-msg','util-scroll','util-vp',
                'mermaid-core','mermaid-plugins']
    }
  ];

  var CONNECTION_DEFS = [
    /* Client → Entry */
    { from: 'mobile-user', to: 'index-html', kind: 'frontend', label: 'HTTP', sub: 'GET /' },

    /* Entry → Router */
    { from: 'index-html', to: 'router',     kind: 'sync',     label: 'hashchange', sub: 'parseRoute' },

    /* Router → Views */
    { from: 'router',     to: 'state-js',  kind: 'sync',     label: 'route',      sub: 'home' },
    { from: 'router',     to: 'chat-js',   kind: 'sync',     label: 'navigateToChat', sub: '#chat/:id' },
    { from: 'router',     to: 'page-ctx',  kind: 'sync',     label: 'route',      sub: 'page context' },

    /* Views → Components */
    { from: 'chat-js',    to: 'comp-chat',  kind: 'frontend', label: 'render',    sub: 'message bubbles' },
    { from: 'chat-js',    to: 'comp-session', kind: 'frontend', label: 'render', sub: 'session list' },
    { from: 'state-js',   to: 'comp-news',  kind: 'frontend', label: 'render',    sub: 'virtual scroll' },
    { from: 'state-js',   to: 'comp-base',  kind: 'frontend', label: 'render',    sub: 'sort+filter' },
    { from: 'state-js',   to: 'comp-virtual', kind: 'frontend', label: 'render', sub: 'windowed' },
    { from: 'state-js',   to: 'comp-swipe', kind: 'frontend', label: 'gesture',  sub: 'delete/fav' },
    { from: 'page-ctx',   to: 'comp-search', kind: 'frontend', label: 'bind',    sub: 'query' },
    { from: 'page-ctx',   to: 'comp-preview', kind: 'frontend', label: 'zoom',   sub: 'image preview' },

    /* Views → Services */
    { from: 'chat-js',    to: 'svc-prompt', kind: 'async',    label: 'SSE',       sub: 'AI stream' },
    { from: 'chat-js',    to: 'svc-session', kind: 'sync',   label: 'CRUD',       sub: 'session upsert' },
    { from: 'state-js',   to: 'svc-session', kind: 'sync',   label: 'query',     sub: 'paged list' },
    { from: 'state-js',   to: 'svc-news',    kind: 'sync',   label: 'query',     sub: 'rss docs' },
    { from: 'page-ctx',   to: 'svc-faq',     kind: 'sync',   label: 'query',     sub: 'faqs docs' },

    /* Components → Utils */
    { from: 'comp-chat',  to: 'util-md',    kind: 'infra',   label: 'render',     sub: 'marked + mermaid' },
    { from: 'comp-chat',  to: 'util-msg',   kind: 'infra',   label: 'normalize',  sub: 'role/text' },
    { from: 'comp-chat',  to: 'util-scroll', kind: 'infra',  label: 'scroll',    sub: 'near-bottom' },
    { from: 'comp-virtual', to: 'util-vp',  kind: 'infra',   label: 'inset',     sub: 'iOS safe area' },

    /* Utils → Mermaid */
    { from: 'util-md',    to: 'mermaid-core', kind: 'async', label: 'mermaid',   sub: 'render hook' },
    { from: 'mermaid-core', to: 'mermaid-plugins', kind: 'sync', label: 'extend', sub: 'AIFix+Clipboard' },

    /* Services → External */
    { from: 'svc-client',  to: 'api-yiai', kind: 'frontend', label: 'HTTPS',     sub: 'fetchWithAuth' },
    { from: 'svc-auth',    to: 'svc-client', kind: 'auth',  label: 'X-Token',    sub: 'inject header' },
    { from: 'svc-prompt',  to: 'svc-client', kind: 'sync',  label: 'call',       sub: 'POST /ai/chat' },
    { from: 'svc-session', to: 'svc-client', kind: 'sync',  label: 'call',       sub: 'POST /exec' },
    { from: 'svc-news',    to: 'svc-client', kind: 'sync',  label: 'call',       sub: 'POST /exec' },
    { from: 'svc-faq',     to: 'svc-client', kind: 'sync',  label: 'call',       sub: 'POST /exec' }
  ];

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 4 — LAYOUT ENGINE
     ═══════════════════════════════════════════════════════════════════ */
  var LAYER_BAND = {
    client:     { y:  80,  rows: 1, colSpan: 1 },
    entry:      { y: 220,  rows: 1, colSpan: 1 },
    router:     { y: 380,  rows: 1, colSpan: 1 },
    view:       { y: 520,  rows: 1, colSpan: 3 },
    components: { y: 660,  rows: 1, colSpan: 8 },
    services:   { y: 800,  rows: 2, colSpan: 7 },
    utils:      { y: 1020, rows: 1, colSpan: 4 },
    mermaid:    { y: 1160, rows: 1, colSpan: 2 },
    external:   { y: 1300, rows: 1, colSpan: 1 }
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
      { fill: STYLES.frontend.fill, stroke: STYLES.frontend.stroke, label: 'View / Component' },
      { fill: STYLES.backend.fill,  stroke: STYLES.backend.stroke,  label: 'Service (API client)' },
      { fill: STYLES.cloud.fill,    stroke: STYLES.cloud.stroke,    label: 'Utility Module' },
      { fill: STYLES.message.fill,  stroke: STYLES.message.stroke,  label: 'Mermaid Engine' },
      { fill: STYLES.external.fill, stroke: STYLES.external.stroke, label: 'Backend API' }
    ];
    var lineStyles = [
      { color: CONN.frontend.color, dash: null,  label: 'HTTP / Render' },
      { color: CONN.sync.color,     dash: null,  label: 'Sync call' },
      { color: CONN.async.color,    dash: '4,3', label: 'SSE / Mermaid' },
      { color: CONN.auth.color,    dash: '5,5', label: 'X-Token inject' },
      { color: CONN.infra.color,   dash: '6,4', label: 'Util hook' }
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
      label: 'YiH5 SPA · /Users/yi/YrY/YiH5/',
      sub: 'Vanilla JS · IIFE modules · 38 source files · 3 CDN libs',
      markup:
        '<rect class="svg-outermost" x="' + x + '" y="' + y + '" ' +
          'width="' + w + '" height="' + h + '" rx="20" ' +
          'fill="rgba(251,191,36,0.012)" stroke="#fbbf24" ' +
          'stroke-width="2.2" stroke-dasharray="10,5"/>' +
        '<rect x="' + (x + 12) + '" y="' + (y + 8) + '" height="32" width="320" rx="6" ' +
          'fill="#020617" stroke="#fbbf24" stroke-width="1.2"/>' +
        '<text x="' + (x + 22) + '" y="' + (y + 24) + '" fill="#fbbf24" ' +
          'font-size="12" font-weight="700">▸ ' + 'YiH5 SPA · /Users/yi/YrY/YiH5/' + '</text>' +
        '<text x="' + (x + 22) + '" y="' + (y + 36) + '" fill="#94a3b8" font-size="9">' +
          'Vanilla JS · IIFE modules · 38 source files · 3 CDN libs' + '</text>' +
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
      { key: 'client',     label: 'CLIENT',           color: '#94a3b8' },
      { key: 'entry',      label: 'SPA SHELL',         color: '#22d3ee' },
      { key: 'router',     label: 'HASH ROUTER',       color: '#22d3ee' },
      { key: 'view',       label: 'HOME VIEW',         color: '#22d3ee' },
      { key: 'components', label: 'UI COMPONENTS',     color: '#22d3ee' },
      { key: 'services',   label: 'API SERVICES',      color: '#34d399' },
      { key: 'utils',      label: 'UTILITY MODULES',   color: '#fbbf24' },
      { key: 'mermaid',    label: 'MERMAID ENGINE',    color: '#fb923c' },
      { key: 'external',   label: 'BACKEND API',       color: '#94a3b8' }
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
    var legendY = 1460;
    var outermost = renderOutermost(comps, bounds, legendY);

    var svgW = outermost.x + outermost.w + 40;
    var svgH = outermost.y + outermost.h + 40;

    var parts = [];
    parts.push('<svg ref="svg" viewBox="0 0 ' + svgW + ' ' + svgH + '" ' +
               'role="img" aria-labelledby="diagram-title diagram-desc" ' +
               'xmlns="http://www.w3.org/2000/svg" ' +
               'shape-rendering="geometricPrecision" text-rendering="geometricPrecision">');
    parts.push('<title id="diagram-title">YiH5 · Vanilla JS SPA Architecture</title>');
    parts.push('<desc id="diagram-desc">YiH5 H5 frontend SPA — index.html shell loads views/home/index.js IIFE entry, hash-based router dispatches to home/chat/news/page-context views, 9 UI components (BaseList/Chat/Content/NewsList/Preview/Search/SessionList/VirtualList/SwipeScroll), 7 API services (auth/client/faq/news/prompt/session/index) talking to api.effiy.cn, plus 6 utility modules and a 10-module Mermaid integration.</desc>');
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
      title: 'YiH5 · H5 SPA Architecture Diagram',
      pageTitle: 'YiH5 — Vanilla JS H5 SPA',
      subtitle: 'Vanilla JS SPA · Session mgmt + AI Chat + News feed · powered by api.effiy.cn · 3 CDN libs · 38 source files',
      footer: 'YiH5 · /Users/yi/YrY/YiH5/ · Vanilla JS · marked + mermaid + md5 · v1.0.0 · 2026-07-24',
      traceSub: 'mobile → SPA boot → route → view → service → api.effiy.cn'
    },

    executiveSummary: [
      { color: 'cyan',    title: '▸ System Scope',       content: 'YiH5 is a mobile-first H5 SPA built with vanilla JavaScript (no framework, no build step). 38 source files organized into 5 packages: components (9), services (7), utils (6), views/home (6), and a 10-module mermaid integration. Loaded directly via index.html — IIFE modules wire everything together at boot.' },
      { color: 'emerald', title: '▸ Architecture Style', content: 'Hash-routed SPA — index.html loads views/home/index.js (IIFE entry) which boots router, state, and view factories. Router (hash-based parseRoute) dispatches to home/chat/news/page-context views. Views render into 9 components; components consume 7 services; services wrap fetchWithAuth calls to api.effiy.cn (the YiAi FastAPI backend).' },
      { color: 'amber',   title: '▸ Key Decisions',      content: 'Vanilla JS over Vue/React for sub-second TTI on slow mobile networks — no framework runtime, no hydration. IIFE modules over ES modules for legacy WeChat browser compatibility. Mermaid integration is bespoke (10 sub-modules: core + 7 plugins) for chat-message diagram rendering with AIFix (LLM-powered diagram repair). Virtual scrolling everywhere for 1000+ item lists on 2GB devices.' }
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
      { label: 'Source Files',   status: null, value: '38',  valueClass: 'cyan',   sub: 'vanilla JS · IIFE' },
      { label: 'Components',     status: null, value: '9',   valueClass: 'cyan',   sub: 'UI modules' },
      { label: 'Services',        status: null, value: '7',   valueClass: 'emerald', sub: 'API client modules' },
      { label: 'CDN Libs',         status: null, value: '3',   valueClass: 'amber',  sub: 'marked · mermaid · md5' },
      { label: 'Mermaid Modules',  status: null, value: '10',  valueClass: 'orange', sub: 'core + 7 plugins' }
    ],

    svgDiagram: buildSvg(),

    summaryCards: [
      {
        color: 'cyan',
        title: 'SPA Shell & Routing',
        items: [
          '<strong>index.html</strong> is the SPA shell — loads 3 CDN libs (marked, mermaid, md5) and the views/home/index.js IIFE entry; ships an inline SVG sprite and a debug panel toggle',
          '<strong>Hash Router</strong> (views/home/router.js) — parseRoute() parses location.hash, navigateToChat(:id) scrolls into the chat view; hash routing chosen for WeChat browser deep-link compatibility',
          '<strong>state.js</strong> holds global reactive state (sessions, news, filters, chat) — a vanilla pub-sub pattern; updates trigger targeted component re-renders without a virtual DOM',
          '<strong>chat.js</strong> is the chat view factory — renders bubbles, manages streaming SSE responses, persists session state via svc-session; integrates marked + mermaid for message rendering',
          '<strong>page-context.js</strong> powers the long-press context panel — optimize (LLM), translate (LLM), save (session) actions on selected page text'
        ]
      },
      {
        color: 'emerald',
        title: 'Service & API Layer',
        items: [
          '<strong>auth.js</strong> manages X-Token in localStorage — injected by client.js into every fetchWithAuth call as the X-Token header; missing token redirects to a login hash route',
          '<strong>client.js</strong> = fetchWithAuth() + RequestClient class — wraps fetch with timeout (10s), abort, retry (3x), and JSON envelope unwrapping ({success, code, data})',
          '<strong>prompt.js</strong> handles AI chat SSE — opens a POST /ai/chat stream, strips <think> tags, dispatches token-by-token to chat.js; aborts on user navigation',
          '<strong>session.js</strong> + <strong>news.js</strong> + <strong>faq.js</strong> all call POST /exec on api.effiy.cn with the executeModule pattern (module name + args) — YiAi runs the modular executor',
          '<strong>index.js (barrel)</strong> re-exports all 6 service modules and centralizes API URL constants (apiBase from config.js)'
        ]
      },
      {
        color: 'orange',
        title: 'Mermaid Integration & Components',
        items: [
          '<strong>Mermaid Core</strong> (MermaidConfig + MermaidRenderer) — wraps the mermaid.min.js CDN lib with theme/security/font config and an error-handling render pipeline; called from util-md.js when a message contains a ```mermaid fenced block',
          '<strong>Mermaid Plugins (7)</strong> — AIFix (LLM-powered diagram repair on parse error), Clipboard (PNG/SVG copy), Download (file export), Fullscreen (maximized view), Toolbar (zoom/reset/fit), plus 2 helpers',
          '<strong>9 UI components</strong> — Chat (bubbles + stream), NewsList (virtual scroll + read tracking), SessionList (swipe-to-delete + favorite), BaseList (sort + filter), VirtualList (windowed render engine), SwipeScrollController (gesture handler), Search (query + clear), Preview (image zoom + long-press save), Content (display wrapper)',
          '<strong>6 utility modules</strong> — markdown.js (marked wrapper + mermaid hook), msg.js (role/text normalize), scroll.js (preserve + near-bottom), viewport.js (iOS visualViewport inset), data.js (deep merge), index.js (barrel)',
          '<strong>Virtual scrolling</strong> everywhere — VirtualList + NewsList render only visible items + buffer; handles 1000+ RSS articles on 2GB Android devices without jank'
        ]
      }
    ],

    pipeline: [
      { badge: 'Edit',        badgeClass: 'dev',  info: 'Edit views/components/services<br/>vanilla JS · no build' },
      { badge: 'Local Serve', badgeClass: 'dev',  info: 'python -m http.server<br/>:8000 or Live Server' },
      { badge: 'Manual Test', badgeClass: 'stg',  info: 'Chrome DevTools<br/>mobile emulation' },
      { badge: 'Stage',       badgeClass: 'stg',  info: 'rsync to h5.effiy.cn<br/>Nginx serve' },
      { badge: 'Production',  badgeClass: 'prod', info: 'CDN cache forever<br/>WeChat browser ready' }
    ],

    securityCards: [
      {
        color: 'rose',
        title: 'Auth & Token',
        items: [
          '<strong>X-Token</strong> stored in localStorage — injected by client.js into every fetchWithAuth call; missing/expired token redirects to a hash-routed login prompt',
          '<strong>No CSRF protection</strong> needed — all API calls are X-Token-headered POSTs, not cookie-based; SameSite=Strict cookies would break WeChat deep-links',
          '<strong>No OAuth/JWT</strong> — single shared X-Token pattern matches YiAi backend; token rotation is manual via /state upsert',
          '<strong>HTTPS required</strong> — fetchWithAuth refuses http:// origins in production (config.js mode check); staging allows http:// for local dev'
        ]
      },
      {
        color: 'amber',
        title: 'Network & CORS',
        items: [
          '<strong>api.effiy.cn</strong> is the only allowed origin — config.js pins apiBase; no wildcard fetch anywhere in the codebase',
          '<strong>CORS</strong> handled by YiAi backend (FastAPI CORSMiddleware) — YiH5 does not need to bypass CORS; preflight cache 1 day',
          '<strong>fetchWithAuth</strong> enforces 10s timeout + AbortController — no hanging requests on flaky mobile networks; 3 retries with exponential backoff via Tenacity-equivalent',
          '<strong>WeChat in-app browser</strong> is the primary target — hash routing (not history API) for deep-link compatibility; no external navigation that breaks the webview'
        ]
      },
      {
        color: 'orange',
        title: 'Mermaid Sandbox',
        items: [
          '<strong>Mermaid security: true</strong> — MermaidConfig sets securityLevel: "strict" which disables HTML in labels and script execution in diagram source',
          '<strong>AIFix plugin</strong> sends broken diagram source to /ai/chat with a repair prompt — LLM output is re-rendered through the strict security filter before display',
          '<strong>Markdown rendering</strong> uses marked with default sanitization — no raw HTML in chat messages; image src must be https:',
          '<strong>Preview component</strong> blocks navigation on long-press — images are saved via blob URL + a tag, no script execution from external image src'
        ]
      }
    ],

    trace: [
      { name: '1. DNS/TLS',     nameClass: 'cyan',    sub: 'CDN · h5.effiy.cn',         time: '~40ms'  },
      { name: '2. SPA Boot',    nameClass: 'cyan',    sub: 'index.html + 3 CDN libs',   time: '~180ms' },
      { name: '3. IIFE Wire',  nameClass: 'cyan',    sub: 'views/home/index.js',        time: '~25ms'  },
      { name: '4. Route',       nameClass: 'cyan',    sub: 'parseRoute hash',            time: '~3ms'   },
      { name: '5. View Render', nameClass: 'cyan',    sub: 'components mount',           time: '~60ms'  },
      { name: '6. Service Call', nameClass: 'emerald', sub: 'fetchWithAuth',            time: '~10ms'  },
      { name: '7. Backend',     nameClass: 'orange',  sub: 'api.effiy.cn',              time: '~600ms' },
      { name: '8. UI Update',   nameClass: 'cyan',    sub: 'pub-sub re-render',         time: '~15ms'  }
    ],

    scalingTiles: [
      {
        color: 'cyan',
        title: 'SPA Performance',
        body: '<span style="color: var(--text-muted);">TTI:</span> sub-second on 3G<br/>' +
              '<span style="color: var(--text-muted);">Bundle:</span> ~62 KB (no framework)<br/>' +
              '<span style="color: var(--text-muted);">CDN:</span> 3 libs · marked+mermaid+md5<br/>' +
              '<span style="color: var(--text-muted);">Render:</span> pub-sub targeted'
      },
      {
        color: 'emerald',
        title: 'Service Calls',
        body: '<span style="color: var(--text-muted);">Timeout:</span> 10s fetchWithAuth<br/>' +
              '<span style="color: var(--text-muted);">Retry:</span> 3x backoff<br/>' +
              '<span style="color: var(--text-muted);">Stream:</span> SSE for /ai/chat<br/>' +
              '<span style="color: var(--text-muted);">Pattern:</span> POST /exec module'
      },
      {
        color: 'orange',
        title: 'Virtual Scroll',
        body: '<span style="color: var(--text-muted);">Engine:</span> VirtualList windowed<br/>' +
              '<span style="color: var(--text-muted);">Items:</span> 1000+ without jank<br/>' +
              '<span style="color: var(--text-muted);">Buffer:</span> 5 above + 5 below<br/>' +
              '<span style="color: var(--text-muted);">Used in:</span> NewsList + SessionList'
      },
      {
        color: 'rose',
        title: 'Mobile Hardening',
        body: '<span style="color: var(--text-muted);">Viewport:</span> iOS visualViewport<br/>' +
              '<span style="color: var(--text-muted);">Scroll:</span> preserve + near-bottom<br/>' +
              '<span style="color: var(--text-muted);">Gesture:</span> SwipeScroll delete/fav<br/>' +
              '<span style="color: var(--text-muted);">Target:</span> WeChat + Safari + Chrome'
      }
    ],

    ownership: {
      headers: ['Module', 'Layer', 'Files', 'Tier', 'Owner', 'Path'],
      rows: [
        ['<span style="color: var(--color-frontend);">views/home</span>', 'View',     '<span style="color: var(--color-backend);">6</span>',  'Tier 1', 'Frontend · Alice', '<span style="color: var(--text-dim);">views/home/</span>'],
        ['<span style="color: var(--color-frontend);">components</span>', 'Components','<span style="color: var(--color-backend);">9</span>',  'Tier 1', 'Frontend · Bob',   '<span style="color: var(--text-dim);">components/</span>'],
        ['<span style="color: var(--color-backend);">services</span>',   'Services',  '<span style="color: var(--color-backend);">7</span>',  'Tier 1', 'Frontend · Carol', '<span style="color: var(--text-dim);">services/</span>'],
        ['<span style="color: var(--color-cloud);">utils</span>',          'Utils',     '<span style="color: var(--color-backend);">6</span>',  'Tier 2', 'Frontend · Dave',  '<span style="color: var(--text-dim);">utils/</span>'],
        ['<span style="color: var(--color-message);">mermaid</span>',     'Mermaid',   '<span style="color: var(--color-backend);">10</span>', 'Tier 2', 'Frontend · Eve',   '<span style="color: var(--text-dim);">mermaid/</span>'],
        ['<span style="color: var(--color-security);">config.js</span>',  'Config',    '<span style="color: var(--color-backend);">1</span>',  'Tier 0', 'Frontend · Alice', '<span style="color: var(--text-dim);">config.js</span>']
      ]
    },

    apiTable: {
      headers: ['Method', 'Path', 'Service', 'Auth', 'Rate Limit', 'Description'],
      rows: [
        { method: 'POST',  color: 'backend',  path: '/ai/chat',     service: 'prompt.js',     auth: 'X-Token',        rate: '20/min',   desc: 'AI chat SSE stream (token-by-token)' },
        { method: 'POST',  color: 'backend',  path: '/exec',         service: 'session/news/faq', auth: 'X-Token',     rate: '60/min',   desc: 'Module executor (sessions, rss, faqs collections)' },
        { method: 'POST',  color: 'frontend', path: '/upload',        service: '— (not used)',   auth: '—',              rate: '—',         desc: 'File upload (not invoked by YiH5 SPA)' },
        { method: 'GET',   color: 'frontend', path: '/state',         service: 'session.js',     auth: 'X-Token',        rate: '120/min',  desc: 'Paged session list query' },
        { method: 'GET',   color: 'frontend', path: '/story_panel',   service: '— (not used)',   auth: '—',              rate: '—',         desc: 'Story panel (used by YiWeb, not YiH5)' },
        { method: 'GET',   color: 'frontend', path: '/observer/health', service: '—',            auth: 'None',           rate: '1000/min', desc: 'Health check (called by client.js on boot)' }
      ]
    },

    stack: [
      { label: 'Vanilla JS',  value: 'ES5+',   valueClass: 'cyan'    },
      { label: 'marked',       value: 'CDN',    valueClass: 'cyan'    },
      { label: 'mermaid',      value: 'CDN',    valueClass: 'orange'  },
      { label: 'md5',          value: 'CDN',    valueClass: 'amber'   },
      { label: 'IIFE Modules', value: 'pattern',valueClass: 'cyan'    },
      { label: 'Hash Router',  value: 'custom', valueClass: 'cyan'    },
      { label: 'fetch API',    value: 'native', valueClass: 'emerald' },
      { label: 'AbortController', value: 'native', valueClass: 'emerald' },
      { label: 'localStorage', value: 'native', valueClass: 'rose'   },
      { label: 'SVG sprite',   value: 'inline', valueClass: 'cyan'   }
    ],

    schemaTiles: [],

    roadmap: [
      { tag: 'Q3\u201926', tagClass: 'q3',   text: 'Migrate IIFE modules to native ES modules (WeChat now supports them)', textClass: '' },
      { tag: 'Q3\u201926', tagClass: 'q3',   text: 'Replace bespoke pub-sub with a tiny reactive store (≤2KB)',         textClass: '' },
      { tag: 'Q4\u201926', tagClass: 'q4',   text: 'Add service worker for offline-first chat history',                    textClass: '' },
      { tag: 'Q4\u201926', tagClass: 'q4',   text: 'Bundle mermaid on-demand (lazy-load only when chat has diagrams)',   textClass: '' },
      { tag: 'Debt',       tagClass: 'debt', text: 'config.js hardcodes apiBase — no env switching',                     textClass: 'muted' },
      { tag: 'Debt',       tagClass: 'debt', text: 'SwipeScrollController is a single file, not a folder',               textClass: 'muted' }
    ],

    glossary: [
      { term: 'SPA',         termClass: 'cyan',    def: 'Single-Page Application — client-side routing, no full page reload' },
      { term: 'IIFE',        termClass: 'cyan',    def: 'Immediately-Invoked Function Expression — vanilla JS module pattern' },
      { term: 'Hash Router',  termClass: 'cyan',    def: 'location.hash-based routing — works in WeChat in-app browser' },
      { term: 'VirtualList',  termClass: 'cyan',    def: 'Windowed renderer — only visible items + buffer mounted' },
      { term: 'fetchWithAuth', termClass: 'emerald', def: 'fetch wrapper injecting X-Token header + timeout + retry' },
      { term: 'X-Token',     termClass: 'rose',    def: 'Shared-secret auth header (24h TTL, set by YiAi backend)' },
      { term: 'SSE',          termClass: 'orange',  def: 'Server-Sent Events — HTTP streaming for AI chat tokens' },
      { term: 'Mermaid',      termClass: 'orange',  def: 'Diagram-as-code library (flowchart/sequence/class/ER)' },
      { term: 'AIFix',        termClass: 'orange',  def: 'Mermaid plugin — LLM repairs broken diagram source' },
      { term: 'executeModule', termClass: 'emerald', def: 'YiAi modular executor pattern — POST /exec with module+args' },
      { term: 'TTI',          termClass: 'cyan',    def: 'Time-to-Interactive — mobile perf metric' },
      { term: 'WeChat Browser', termClass: 'amber',  def: 'Primary target — in-app webview with quirks' }
    ]
  };
})();
