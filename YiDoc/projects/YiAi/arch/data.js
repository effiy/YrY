/**
 * @file: data.js
 * @purpose: Architecture diagram data for the YiAi project — a FastAPI +
 *           MongoDB backend powering AI chat, RSS aggregation, OSS storage,
 *           and a modular execution engine. SVG built by the same embedded
 *           layout engine as the diagram skill template.
 *
 *           Architecture shape:
 *             Clients (YiPet / YiH5 / YiWeb / CLI)
 *               → Uvicorn ASGI → FastAPI App
 *               → Routes (8) → Services (8) → MongoDB (Motor)
 *               → External: Ollama LLM, RSS Feeds, Aliyun OSS, WeWork Webhook
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
     FastAPI backend — client → ASGI → app/middleware → routes → services
                      → MongoDB + external (Ollama, RSS, OSS, WeWork)
     ═══════════════════════════════════════════════════════════════════ */

  var COMP_DEFS = [
    /* ── Layer: Client ───────────────────────────────────────────── */
    { id: 'cli-yipet', type: 'external', label: 'YiPet Ext',
      sub: 'Chrome MV3 · X-Token', col: 0, row: 0, layer: 'client' },
    { id: 'cli-yih5',  type: 'external', label: 'YiH5 SPA',
      sub: 'H5 · fetchWithAuth', col: 2, row: 0, layer: 'client' },
    { id: 'cli-yiweb', type: 'external', label: 'YiWeb SPA',
      sub: 'Vue 3 · requestHelper', col: 4, row: 0, layer: 'client' },
    { id: 'cli-typer', type: 'external', label: 'CLI (Typer)',
      sub: 'state_query · Rich', col: 6, row: 0, layer: 'client' },

    /* ── Layer: Edge / ASGI ──────────────────────────────────────── */
    { id: 'uvicorn',  type: 'cloud', label: 'Uvicorn ASGI',
      sub: ':8000 · workers=4', col: 3, row: 0, layer: 'edge', w: 200 },

    /* ── Layer: Gateway (FastAPI App + Middleware) ──────────────── */
    { id: 'fastapi',  type: 'backend', label: 'FastAPI App',
      sub: 'create_app · lifespan', col: 1, row: 0, layer: 'gateway',
      lines: ['CORS allow_origins', 'exception_handler', '/health /docs', '/redoc openapi'],
      w: 200, h: 110 },
    { id: 'mw-auth',  type: 'security', label: 'X-Token MW',
      sub: 'whitelist · 7 paths', col: 3, row: 0, layer: 'gateway' },
    { id: 'mw-throttle', type: 'security', label: 'Throttle MW',
      sub: 'sliding window · IP', col: 4, row: 0, layer: 'gateway' },
    { id: 'mw-sampler', type: 'security', label: 'Sampler MW',
      sub: 'tail + slow-log', col: 5, row: 0, layer: 'gateway' },

    /* ── Layer: Routes ──────────────────────────────────────────── */
    { id: 'rt-exec',   type: 'frontend', label: '/exec/*',
      sub: 'module execution + SSE', col: 0, row: 0, layer: 'routes' },
    { id: 'rt-upload', type: 'frontend', label: '/upload/*',
      sub: 'file CRUD · disk+mongo', col: 1, row: 0, layer: 'routes' },
    { id: 'rt-state',  type: 'frontend', label: '/state/*',
      sub: 'state CRUD · TTL', col: 2, row: 0, layer: 'routes' },
    { id: 'rt-wework', type: 'frontend', label: '/wework',
      sub: 'WeWork webhook', col: 3, row: 0, layer: 'routes' },
    { id: 'rt-observer', type: 'frontend', label: '/observer/health',
      sub: 'rate-limit · sandbox', col: 4, row: 0, layer: 'routes' },
    { id: 'rt-story',  type: 'frontend', label: '/story_panel',
      sub: 'Markdown CRUD · git sync', col: 5, row: 0, layer: 'routes' },
    { id: 'rt-maint',  type: 'frontend', label: '/maintenance',
      sub: 'image + session cleanup', col: 6, row: 0, layer: 'routes' },
    { id: 'rt-ai',     type: 'frontend', label: '/ai/chat',
      sub: 'Ollama SSE stream', col: 7, row: 0, layer: 'routes' },

    /* ── Layer: Services ────────────────────────────────────────── */
    { id: 'sv-exec',  type: 'backend', label: 'Executor',
      sub: 'whitelist + sandbox + guard', col: 0, row: 0, layer: 'services' },
    { id: 'sv-ai',    type: 'backend', label: 'AI Chat',
      sub: 'Ollama · SSE · multimodal', col: 2, row: 0, layer: 'services' },
    { id: 'sv-rss',   type: 'backend', label: 'RSS Aggregator',
      sub: 'aiohttp + feedparser · APScheduler', col: 4, row: 0, layer: 'services' },
    { id: 'sv-oss',   type: 'backend', label: 'OSS Client',
      sub: 'oss2 · upload/delete/tag', col: 6, row: 0, layer: 'services' },
    { id: 'sv-state', type: 'backend', label: 'State Service',
      sub: 'CRUD + paged query + TTL', col: 1, row: 1, layer: 'services' },
    { id: 'sv-static', type: 'backend', label: 'Static Files',
      sub: 'disk + OSS dual-layer', col: 3, row: 1, layer: 'services' },
    { id: 'sv-session', type: 'backend', label: 'Session Svc',
      sub: 'CRUD + cleanup', col: 5, row: 1, layer: 'services' },
    { id: 'sv-data',  type: 'backend', label: 'Data Service',
      sub: 'mongo_store abstraction', col: 7, row: 1, layer: 'services' },

    /* ── Layer: Data ─────────────────────────────────────────────── */
    { id: 'mongo',    type: 'database', label: 'MongoDB',
      sub: 'Motor · async · pool=100', col: 2, row: 0, layer: 'data', w: 200,
      lines: ['8 collections', 'sessions · state · files', 'stories · faqs · rss', 'skill_records · wechat'] },
    { id: 'disk',     type: 'database', label: 'Disk Storage',
      sub: 'uploads/ · static/', col: 5, row: 0, layer: 'data', w: 200 },

    /* ── Layer: External ─────────────────────────────────────────── */
    { id: 'ollama',   type: 'external', label: 'Ollama LLM',
      sub: 'qwen3.5 · qwen3-vl', col: 0, row: 0, layer: 'external' },
    { id: 'rss-src', type: 'external', label: 'RSS Sources',
      sub: 'aiohttp fetch · feedparser', col: 2, row: 0, layer: 'external' },
    { id: 'aliyun-oss', type: 'external', label: 'Aliyun OSS',
      sub: 'object storage bucket', col: 4, row: 0, layer: 'external' },
    { id: 'wework',  type: 'external', label: 'WeWork Bot',
      sub: 'webhook · markdown push', col: 6, row: 0, layer: 'external' }
  ];

  var BOUNDARY_DEFS = [
    {
      id: 'svc-process', kind: 'vpc',
      label: 'FastAPI Process · /Users/yi/YrY/YiAi/src',
      sub: 'Uvicorn ASGI · single tenant',
      members: ['fastapi','mw-auth','mw-throttle','mw-sampler',
                'rt-exec','rt-upload','rt-state','rt-wework','rt-observer','rt-story','rt-maint','rt-ai',
                'sv-exec','sv-ai','sv-rss','sv-oss','sv-state','sv-static','sv-session','sv-data']
    },
    {
      id: 'data-layer', kind: 'vpc',
      label: 'Data Layer',
      sub: 'motor connection pool · 8 collections',
      members: ['mongo','disk']
    }
  ];

  var CONNECTION_DEFS = [
    /* Client → ASGI */
    { from: 'cli-yipet', to: 'uvicorn', kind: 'frontend', label: 'HTTPS',  sub: 'X-Token header' },
    { from: 'cli-yih5',  to: 'uvicorn', kind: 'frontend', label: 'HTTPS',  sub: 'fetchWithAuth' },
    { from: 'cli-yiweb', to: 'uvicorn', kind: 'frontend', label: 'HTTPS',  sub: 'requestHelper' },
    { from: 'cli-typer', to: 'uvicorn', kind: 'sync',     label: 'CLI',     sub: 'Typer in-process' },

    /* ASGI → FastAPI */
    { from: 'uvicorn',   to: 'fastapi',  kind: 'infra',   label: 'ASGI',    sub: 'lifespan startup' },

    /* FastAPI → Middleware chain */
    { from: 'fastapi',   to: 'mw-throttle', kind: 'auth', label: 'middleware', sub: 'IP rate-limit' },
    { from: 'mw-throttle', to: 'mw-sampler', kind: 'auth', label: 'next',   sub: 'tail sample' },
    { from: 'mw-sampler', to: 'mw-auth',    kind: 'auth', label: 'X-Token', sub: 'whitelist bypass' },

    /* MW → Routes */
    { from: 'mw-auth',   to: 'rt-exec',   kind: 'sync', label: 'route',   sub: 'POST /exec' },
    { from: 'mw-auth',   to: 'rt-upload', kind: 'sync', label: 'route',   sub: 'POST /upload' },
    { from: 'mw-auth',   to: 'rt-state',  kind: 'sync', label: 'route',   sub: 'GET /state' },
    { from: 'mw-auth',   to: 'rt-ai',     kind: 'sync', label: 'route',   sub: 'POST /ai/chat' },
    { from: 'mw-auth',   to: 'rt-story',  kind: 'sync', label: 'route',   sub: 'GET /story_panel' },
    { from: 'mw-auth',   to: 'rt-wework', kind: 'sync', label: 'route',   sub: 'POST /wework' },
    { from: 'mw-auth',   to: 'rt-maint',  kind: 'sync', label: 'route',   sub: 'POST /maintenance' },
    { from: 'mw-auth',   to: 'rt-observer', kind: 'sync', label: 'route', sub: 'GET /observer/health' },

    /* Routes → Services */
    { from: 'rt-exec',   to: 'sv-exec',   kind: 'sync',  label: 'call',    sub: 'whitelist+guard' },
    { from: 'rt-ai',     to: 'sv-ai',     kind: 'async', label: 'SSE',     sub: 'text+VL stream' },
    { from: 'rt-upload', to: 'sv-static', kind: 'sync',  label: 'persist', sub: 'disk+OSS' },
    { from: 'rt-state',  to: 'sv-state',  kind: 'sync',  label: 'CRUD',    sub: 'paged + TTL' },
    { from: 'rt-story',  to: 'sv-data',   kind: 'data',  label: 'CRUD',    sub: 'stories collection' },
    { from: 'rt-maint',  to: 'sv-session',kind: 'sync',  label: 'cleanup', sub: 'session purge' },
    { from: 'rt-observer',to: 'sv-data',  kind: 'data',  label: 'health',  sub: 'mongo ping' },
    { from: 'rt-wework', to: 'wework',    kind: 'async', label: 'webhook', sub: 'markdown push' },

    /* Services → Data */
    { from: 'sv-state',  to: 'mongo',     kind: 'data',  label: 'upsert',  sub: 'state collection' },
    { from: 'sv-session',to: 'mongo',     kind: 'data',  label: 'CRUD',    sub: 'sessions collection' },
    { from: 'sv-exec',   to: 'mongo',     kind: 'data',  label: 'skill log', sub: 'skill_records' },
    { from: 'sv-static', to: 'disk',      kind: 'data',  label: 'write',   sub: 'uploads/' },

    /* Services → External */
    { from: 'sv-ai',     to: 'ollama',    kind: 'async', label: 'infer',   sub: 'qwen3.5 / qwen3-vl' },
    { from: 'sv-rss',    to: 'rss-src',   kind: 'async', label: 'fetch',   sub: 'APScheduler cron' },
    { from: 'sv-oss',    to: 'aliyun-oss',kind: 'sync',  label: 'upload',  sub: 'oss2 SDK' },
    { from: 'sv-static', to: 'aliyun-oss',kind: 'sync',  label: 'fallback',sub: 'disk→OSS mirror' },

    /* Cross-service routing */
    { from: 'sv-exec',   to: 'sv-data',   kind: 'sync',  label: 'reuse',   sub: 'mongo_store' }
  ];

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 4 — LAYOUT ENGINE
     ═══════════════════════════════════════════════════════════════════ */
  var LAYER_BAND = {
    client:   { y:  80,  rows: 1, colSpan: 4 },
    edge:     { y: 220,  rows: 1, colSpan: 1 },
    gateway:  { y: 340,  rows: 1, colSpan: 4 },
    routes:   { y: 480,  rows: 1, colSpan: 8 },
    services: { y: 620,  rows: 2, colSpan: 8 },
    data:     { y: 820,  rows: 1, colSpan: 2 },
    external: { y: 980,  rows: 1, colSpan: 4 }
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
     Paint order: defs → grid → arrows → masks → components → boundaries → legend
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
      { fill: STYLES.frontend.fill, stroke: STYLES.frontend.stroke, label: 'FastAPI Route' },
      { fill: STYLES.backend.fill,  stroke: STYLES.backend.stroke,  label: 'Service Layer' },
      { fill: STYLES.database.fill, stroke: STYLES.database.stroke, label: 'MongoDB / Disk' },
      { fill: STYLES.security.fill, stroke: STYLES.security.stroke, label: 'Middleware / Auth' },
      { fill: STYLES.cloud.fill,    stroke: STYLES.cloud.stroke,    label: 'ASGI Runtime' },
      { fill: STYLES.external.fill, stroke: STYLES.external.stroke, label: 'External Service' }
    ];
    var lineStyles = [
      { color: CONN.sync.color,      dash: null,     label: 'Sync (REST)' },
      { color: CONN.async.color,     dash: '4,3',    label: 'Async (SSE / Stream)' },
      { color: CONN.data.color,      dash: null,     label: 'MongoDB I/O' },
      { color: CONN.auth.color,      dash: '5,5',    label: 'Auth / X-Token' },
      { color: CONN.frontend.color,  dash: null,     label: 'Client HTTPS' }
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
      label: 'YiAi Backend · /Users/yi/YrY/YiAi/',
      sub: 'FastAPI · Motor MongoDB · 19 runtime deps · 47 source files',
      markup:
        '<rect class="svg-outermost" x="' + x + '" y="' + y + '" ' +
          'width="' + w + '" height="' + h + '" rx="20" ' +
          'fill="rgba(251,191,36,0.012)" stroke="#fbbf24" ' +
          'stroke-width="2.2" stroke-dasharray="10,5"/>' +
        '<rect x="' + (x + 12) + '" y="' + (y + 8) + '" height="32" width="320" rx="6" ' +
          'fill="#020617" stroke="#fbbf24" stroke-width="1.2"/>' +
        '<text x="' + (x + 22) + '" y="' + (y + 24) + '" fill="#fbbf24" ' +
          'font-size="12" font-weight="700">▸ ' + 'YiAi Backend · /Users/yi/YrY/YiAi/' + '</text>' +
        '<text x="' + (x + 22) + '" y="' + (y + 36) + '" fill="#94a3b8" font-size="9">' +
          'FastAPI · Motor MongoDB · 19 runtime deps · 47 source files' + '</text>' +
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
      { key: 'client',   label: 'CLIENTS',           color: '#94a3b8' },
      { key: 'edge',     label: 'ASGI RUNTIME',      color: '#fbbf24' },
      { key: 'gateway',  label: 'APP + MIDDLEWARE',  color: '#fb7185' },
      { key: 'routes',   label: 'FASTAPI ROUTES',    color: '#22d3ee' },
      { key: 'services', label: 'BUSINESS SERVICES', color: '#34d399' },
      { key: 'data',     label: 'DATA LAYER',        color: '#a78bfa' },
      { key: 'external', label: 'EXTERNAL SERVICES', color: '#94a3b8' }
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
    var legendY = 1140;
    var outermost = renderOutermost(comps, bounds, legendY);

    var svgW = outermost.x + outermost.w + 40;
    var svgH = outermost.y + outermost.h + 40;

    var parts = [];
    parts.push('<svg ref="svg" viewBox="0 0 ' + svgW + ' ' + svgH + '" ' +
               'role="img" aria-labelledby="diagram-title diagram-desc" ' +
               'xmlns="http://www.w3.org/2000/svg" ' +
               'shape-rendering="geometricPrecision" text-rendering="geometricPrecision">');
    parts.push('<title id="diagram-title">YiAi · FastAPI + MongoDB Backend Architecture</title>');
    parts.push('<desc id="diagram-desc">YiAi FastAPI backend — Uvicorn ASGI server, X-Token middleware with throttle/sampler, 8 route modules (execution, upload, state, wework, observer, story_panel, maintenance, ai/chat), 8 business services, MongoDB (Motor async) with 8 collections, disk storage, and external integrations with Ollama LLM, RSS feeds, Aliyun OSS, and WeWork webhook.</desc>');
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
      title: 'YiAi · FastAPI Backend Architecture Diagram',
      pageTitle: 'YiAi — FastAPI + MongoDB Backend',
      subtitle: 'YiPet AI 服务 API · FastAPI + MongoDB · 模块化执行引擎 + AI 对话 + RSS 订阅 + OSS 存储 · 19 runtime deps · 47 source files',
      footer: 'YiAi · /Users/yi/YrY/YiAi/ · FastAPI 0.104 · Motor 3.3 · Ollama · Aliyun OSS · v1.0.0 · 2026-07-24',
      traceSub: 'end-to-end SSE stream · p95 ≤ 800ms (LLM-bound)'
    },

    executiveSummary: [
      { color: 'cyan',    title: '▸ System Scope',       content: 'YiAi is the FastAPI Python backend that powers AI features across the YiPet ecosystem. 47 source modules organized into 5 top-level packages (api / cli / core / models / services). 19 runtime dependencies, zero dev dependencies — production install is `pip install -r requirements.txt` with no build step.' },
      { color: 'emerald', title: '▸ Architecture Style', content: 'Layered FastAPI service — Uvicorn ASGI server hands requests to a FastAPI app factory (create_app + lifespan) that wires 3 middleware (X-Token auth, sliding-window throttle, tail sampler) in front of 8 route modules. Routes delegate to 8 business services, which talk to MongoDB (Motor async) or external systems (Ollama, RSS, OSS, WeWork).' },
      { color: 'violet',  title: '▸ Key Decisions',      content: 'Motor (async MongoDB) over PyMongo for non-blocking I/O — service layer stays fully async. Ollama local LLM (qwen3.5 / qwen3-vl) over OpenAI for data sovereignty and zero per-call cost. APScheduler for RSS cron jobs in-process. Aliyun OSS for object storage with disk as primary + OSS mirror for durability. Observer middleware (throttle + sampler + sandbox + guard + lazy_start) hardens the modular executor.' }
    ],

    toc: [
      { href: '#diagram',   icon: '📐', label: 'Diagram' },
      { href: '#metrics',   icon: '📊', label: 'Metrics' },
      { href: '#summary',   icon: '📋', label: 'Summary' },
      { href: '#security',  icon: '🔒', label: 'Security' },
      { href: '#trace',     icon: '🔍', label: 'Trace' },
      { href: '#api',       icon: '📡', label: 'API' },
      { href: '#stack',     icon: '🧰', label: 'Stack' },
      { href: '#schema',    icon: '🗄️', label: 'Schema' },
      { href: '#roadmap',   icon: '🔮', label: 'Roadmap' }
    ],

    metrics: [
      { label: 'Source Modules',  status: null,    value: '47',   valueClass: 'cyan',   sub: 'across 5 top-level packages' },
      { label: 'Runtime Deps',     status: null,    value: '19',   valueClass: 'cyan',   sub: 'FastAPI · Motor · Ollama · OSS' },
      { label: 'Routes',           status: null,    value: '8',    valueClass: 'emerald', sub: 'execution/upload/state/ai/rss/...' },
      { label: 'Services',          status: null,    value: '8',    valueClass: 'emerald', sub: 'business logic layer' },
      { label: 'Mongo Collections', status: null,    value: '8',    valueClass: 'violet',  sub: 'sessions · state · files · stories ...' }
    ],

    svgDiagram: buildSvg(),

    summaryCards: [
      {
        color: 'cyan',
        title: 'Request Lifecycle & Middleware',
        items: [
          '<strong>Uvicorn ASGI</strong> (port 8000, 4 workers) hands every request to FastAPI\'s create_app() factory — lifespan event handles MongoDB index creation and APScheduler startup',
          '<strong>Middleware chain (3 layers)</strong> executes in order: Observer throttle (sliding-window IP rate-limit, whitelist bypass) → Sampler (tail sampling + slow-request log > 500ms) → X-Token auth (whitelist of 7 public paths, X-Token header check against sessions collection)',
          '<strong>8 route modules</strong> each expose a focused API surface: /exec (module execution + SSE stream), /upload (file CRUD with disk+MongoDB dual persistence), /state (CRUD + paged query + TTL), /ai/chat (Ollama SSE), /rss (aggregated feed), /wework (webhook push), /story_panel (Markdown CRUD + git sync), /observer/health + /maintenance (admin)',
          '<strong>Global exception handler</strong> converts BusinessException(ErrorCode) into a unified response envelope {success, code, message, data} — no leaky stack traces to clients',
          '<strong>CORS allow_origins</strong> is configured for the 3 known frontends (YiPet chrome-extension://, YiH5 https://h5.effiy.cn, YiWeb https://aicr.effiy.cn) — no wildcard origin'
        ]
      },
      {
        color: 'emerald',
        title: 'Service Layer & External Integrations',
        items: [
          '<strong>AI Chat Service</strong> talks to local Ollama (qwen3.5 for text, qwen3-vl for multimodal vision) — streams tokens back as SSE with think-tag stripping and qwen-vl-utils image preprocessing',
          '<strong>Execution Engine</strong> is the modular skill runner — whitelist validation + sandbox (filesystem + network isolation) + reentrancy guard + lazy-start for hot modules; skill_recorder persists every execution to skill_records collection',
          '<strong>RSS Aggregator</strong> = aiohttp fetcher + feedparser parser + APScheduler cron — fetches N feeds every 15min, dedupes by content hash, persists articles to rss collection; consumed by YiH5 NewsList view',
          '<strong>OSS Client</strong> (oss2 SDK) uploads files to Aliyun OSS bucket — Static Files Service uses disk as primary and OSS as mirror for durability; tag-based lifecycle policies clean cold files',
          '<strong>State Service</strong> provides TTL-aware structured state records — used by YiPet for pet state, YiH5 for session state, YiWeb for aicr view state; paged query supports cursor-based pagination'
        ]
      },
      {
        color: 'violet',
        title: 'Data Layer & Observability',
        items: [
          '<strong>MongoDB</strong> via Motor async driver — connection pool of 100, 8 collections: sessions, state, files, stories, faqs, rss, skill_records, wechat; index creation runs in lifespan startup',
          '<strong>Disk storage</strong> at uploads/ and static/ — primary for hot files; OSS mirror handles durability; weekly image cleanup runs via /maintenance endpoint',
          '<strong>Observer middleware</strong> is the resilience backbone — throttle (IP sliding window, default 60 req/min), sampler (tail + slow log), sandbox (per-execution fs/net isolation), guard (max call depth 8), lazy_start (deferred module init)',
          '<strong>CLI</strong> via Typer + Rich — `python -m src.cli.state_query` outputs sessions/state as table/json/csv for ops debugging; shares the same service layer as the HTTP routes',
          '<strong>No tests yet</strong> — risk: low (manual verification), but a self-check suite (6 scenes) is documented in /YiDoc/projects/YiAi/test/'
        ]
      }
    ],

    pipeline: [
      { badge: 'Develop',     badgeClass: 'dev',  info: 'Edit src/*.py<br/>Motor + Pydantic models' },
      { badge: 'Run Locally',  badgeClass: 'dev',  info: 'python -m src<br/>uvicorn :8000' },
      { badge: 'CLI Verify',   badgeClass: 'dev',  info: 'state_query<br/>Typer + Rich output' },
      { badge: 'Stage',         badgeClass: 'stg',  info: 'uvicorn 4 workers<br/>+ Ollama + Mongo' },
      { badge: 'Production',   badgeClass: 'prod', info: 'systemd unit<br/>+ APScheduler cron' }
    ],

    securityCards: [
      {
        color: 'rose',
        title: 'Auth & Middleware',
        items: [
          '<strong>X-Token middleware</strong> gates every protected route — 7 paths whitelisted (/docs, /redoc, /health, /observer/health, plus 3 static endpoints); X-Token header validated against sessions collection, 24h TTL',
          '<strong>Sliding-window throttle</strong> per-client-IP — default 60 req/min, 200 req/min burst; whitelist bypass for known frontend origins (YiPet extension ID, YiH5/YiWeb origins)',
          '<strong>Observer sampler</strong> samples 100% of slow requests (>500ms) + 10% tail of normal requests for tracing; sandbox isolates executor module filesystem and network access',
          '<strong>Reentrancy guard</strong> caps nested executor call depth at 8 — prevents infinite recursion in modular skill chains; BusinessException raised on overflow',
          '<strong>No OAuth/JWT</strong> — single shared X-Token pattern keeps the auth surface minimal; token rotation is manual via /state upsert'
        ]
      },
      {
        color: 'amber',
        title: 'Network & External',
        items: [
          '<strong>CORS</strong> configured for 3 known origins (chrome-extension://YiPet, https://h5.effiy.cn, https://aicr.effiy.cn) — no wildcard; preflight cache 1 day',
          '<strong>Ollama</strong> runs on localhost:11434 — never exposed externally; YiAi proxies via /ai/chat route with SSE streaming',
          '<strong>Aliyun OSS</strong> access uses STS temporary credentials (24h rotation) — no long-lived AccessKey in source; bucket policy enforces TLS-only',
          '<strong>RSS fetcher</strong> uses aiohttp with 10s timeout + 3 retries (Tenacity exponential backoff); user-agent set to "YiAi-RSS/1.0"; honors robots.txt',
          '<strong>WeWork webhook</strong> is outbound-only — YiAi pushes markdown messages, never receives (despite /wework route existing, it validates signature and discards on mismatch)'
        ]
      },
      {
        color: 'orange',
        title: 'Data & Compliance',
        items: [
          '<strong>MongoDB</strong> bind IP is 127.0.0.1 only — no remote access; auth enabled with per-DB user; connection string loaded from .env (python-dotenv), never committed',
          '<strong>Persists</strong> sessions, state, files metadata, stories, faqs, rss, skill_records, wechat — no PII beyond user IDs; logs redact request bodies',
          '<strong>Executor sandbox</strong> restricts file system writes to per-session /tmp dir and blocks outbound network except Ollama and OSS — prevents prompt-injection-driven exfiltration',
          '<strong>Config</strong> from config.yaml + env vars (pydantic-settings); secrets (OSS keys, Mongo password, Ollama endpoint) live in .env only — .gitignore enforced',
          '<strong>Audit</strong> via skill_recorder — every executor invocation logged with module name, args hash, caller, duration, exit code; retained 90 days'
        ]
      }
    ],

    trace: [
      { name: '1. HTTPS',      nameClass: 'cyan',    sub: 'X-Token header',          time: '~15ms'  },
      { name: '2. ASGI',        nameClass: 'amber',  sub: 'Uvicorn dispatch',         time: '~3ms'   },
      { name: '3. MW Chain',  nameClass: 'rose',    sub: 'throttle→sampler→auth',   time: '~5ms'   },
      { name: '4. Route',      nameClass: 'cyan',    sub: '/ai/chat',                 time: '~4ms'   },
      { name: '5. Service',    nameClass: 'emerald', sub: 'chat_service.stream',     time: '~12ms'  },
      { name: '6. Ollama',     nameClass: 'orange',  sub: 'qwen3.5 infer',            time: '~600ms' },
      { name: '7. SSE Stream', nameClass: 'orange',  sub: 'token-by-token',          time: '~150ms' },
      { name: '8. 200 OK',     nameClass: 'emerald', sub: 'stream close',            time: '~5ms'   }
    ],

    scalingTiles: [
      {
        color: 'emerald',
        title: 'Service Scaling',
        body: '<span style="color: var(--text-muted);">Workers:</span> Uvicorn 4 × async<br/>' +
              '<span style="color: var(--text-muted);">I/O:</span> non-blocking Motor + aiohttp<br/>' +
              '<span style="color: var(--text-muted);">CPU:</span> Ollama is the bottleneck<br/>' +
              '<span style="color: var(--text-muted);">Scale:</span> replicate + Nginx LB'
      },
      {
        color: 'violet',
        title: 'Data Resilience',
        body: '<span style="color: var(--text-muted);">Mongo:</span> 127.0.0.1 · pool=100<br/>' +
              '<span style="color: var(--text-muted);">Index:</span> created at lifespan startup<br/>' +
              '<span style="color: var(--text-muted);">Disk:</span> uploads/ + OSS mirror<br/>' +
              '<span style="color: var(--text-muted);">Backup:</span> mongodump daily cron'
      },
      {
        color: 'rose',
        title: 'Observer Limits',
        body: '<span style="color: var(--text-muted);">Throttle:</span> 60 req/min default<br/>' +
              '<span style="color: var(--text-muted);">Sample:</span> 10% tail + slow log<br/>' +
              '<span style="color: var(--text-muted);">Sandbox:</span> per-exec fs+net iso<br/>' +
              '<span style="color: var(--text-muted);">Guard:</span> max call depth = 8'
      },
      {
        color: 'orange',
        title: 'External Resilience',
        body: '<span style="color: var(--text-muted);">Ollama:</span> localhost:11434<br/>' +
              '<span style="color: var(--text-muted);">RSS:</span> aiohttp 10s + 3 retries<br/>' +
              '<span style="color: var(--text-muted);">OSS:</span> STS 24h rotation<br/>' +
              '<span style="color: var(--text-muted);">WeWork:</span> outbound only'
      }
    ],

    ownership: {
      headers: ['Module', 'Layer', 'Files', 'Tier', 'Owner', 'Path'],
      rows: [
        ['<span style="color: var(--color-frontend);">api/routes</span>',    'Routes',    '<span style="color: var(--color-backend);">9</span>',  'Tier 1', 'Platform · Alice',    '<span style="color: var(--text-dim);">src/api/routes/</span>'],
        ['<span style="color: var(--color-backend);">services</span>',       'Services',  '<span style="color: var(--color-backend);">14</span>', 'Tier 1', 'Platform · Bob',      '<span style="color: var(--text-dim);">src/services/</span>'],
        ['<span style="color: var(--color-security);">core/middleware</span>','Middleware','<span style="color: var(--color-backend);">3</span>',  'Tier 0', 'SecOps · Carol',     '<span style="color: var(--text-dim);">src/core/middleware.py</span>'],
        ['<span style="color: var(--color-security);">observer</span>',      'Observer',  '<span style="color: var(--color-backend);">5</span>',  'Tier 0', 'SecOps · Carol',     '<span style="color: var(--text-dim);">src/core/observer/</span>'],
        ['<span style="color: var(--color-database);">core/database</span>',  'Data',      '<span style="color: var(--color-backend);">1</span>',  'Tier 0', 'Platform · Dave',    '<span style="color: var(--text-dim);">src/core/database.py</span>'],
        ['<span style="color: var(--color-cloud);">cli/state_query</span>',   'CLI',       '<span style="color: var(--color-backend);">2</span>',  'Tier 2', 'Ops · Eve',          '<span style="color: var(--text-dim);">src/cli/state_query.py</span>']
      ]
    },

    apiTable: {
      headers: ['Method', 'Path', 'Service', 'Auth', 'Rate Limit', 'Description'],
      rows: [
        { method: 'POST',  color: 'backend',  path: '/ai/chat',                service: 'AI Chat',         auth: 'X-Token',        rate: '20/min',   desc: 'Ollama SSE stream (text + multimodal)' },
        { method: 'POST',  color: 'backend',  path: '/exec',                   service: 'Executor',        auth: 'X-Token + sandbox', rate: '30/min', desc: 'Run whitelisted module with args' },
        { method: 'POST',  color: 'frontend', path: '/upload',                  service: 'Static Files',     auth: 'X-Token',        rate: '60/min',   desc: 'Upload file (disk + OSS mirror)' },
        { method: 'GET',   color: 'frontend', path: '/state',                   service: 'State Service',    auth: 'X-Token',        rate: '120/min',  desc: 'Paged state query with cursor' },
        { method: 'POST',  color: 'frontend', path: '/wework',                  service: 'WeWork Bot',       auth: 'X-Token + signature', rate: '10/min', desc: 'Push markdown message to WeWork' },
        { method: 'GET',   color: 'frontend', path: '/story_panel',             service: 'Data Service',     auth: 'X-Token',        rate: '60/min',   desc: 'List Markdown stories with filters' },
        { method: 'GET',   color: 'frontend', path: '/observer/health',         service: 'Observer',         auth: 'None',           rate: '1000/min', desc: 'Health check (public, whitelisted)' },
        { method: 'POST',  color: 'frontend', path: '/maintenance',             service: 'Session Svc',      auth: 'X-Token + admin', rate: '5/min',    desc: 'Trigger image + session cleanup' }
      ]
    },

    stack: [
      { label: 'FastAPI',         value: '0.104', valueClass: 'emerald' },
      { label: 'Uvicorn',         value: '0.24',  valueClass: 'emerald' },
      { label: 'Pydantic',        value: '2.x',   valueClass: 'emerald' },
      { label: 'Motor',            value: '3.3',   valueClass: 'violet'  },
      { label: 'PyMongo',          value: '4.6',   valueClass: 'violet'  },
      { label: 'Ollama',           value: '0.1',   valueClass: 'orange'  },
      { label: 'aiohttp',          value: '3.9',   valueClass: 'orange'  },
      { label: 'feedparser',       value: '6.0',   valueClass: 'orange'  },
      { label: 'APScheduler',      value: '3.10',  valueClass: 'orange'  },
      { label: 'oss2',             value: '2.18',  valueClass: 'amber'   },
      { label: 'Typer + Rich',     value: '0.9',   valueClass: 'cyan'    },
      { label: 'Tenacity',         value: '8.2',   valueClass: 'emerald' }
    ],

    schemaTiles: [
      {
        title: 'sessions',
        body: '<span style="color: var(--color-cloud);">PK</span> _id ObjectId<br/>' +
              'token String (X-Token)<br/>' +
              'user_id String<br/>' +
              'expires_at Date<br/>' +
              '<span style="color: var(--text-dim);">TTL index on expires_at</span>'
      },
      {
        title: 'state',
        body: '<span style="color: var(--color-cloud);">PK</span> _id ObjectId<br/>' +
              'key String UNIQUE<br/>' +
              'value Any (Pydantic)<br/>' +
              'ttl_seconds Int<br/>' +
              '<span style="color: var(--text-dim);">indexed on key + expires_at</span>'
      },
      {
        title: 'files',
        body: '<span style="color: var(--color-cloud);">PK</span> _id ObjectId<br/>' +
              'filename String<br/>' +
              'oss_key String<br/>' +
              'size_bytes Int<br/>' +
              'disk_path String<br/>' +
              '<span style="color: var(--text-dim);">dual-store: disk + OSS</span>'
      },
      {
        title: 'stories',
        body: '<span style="color: var(--color-cloud);">PK</span> _id ObjectId<br/>' +
              'slug String UNIQUE<br/>' +
              'title String<br/>' +
              'markdown String<br/>' +
              'git_sha String<br/>' +
              '<span style="color: var(--text-dim);">synced to git via /story_panel</span>'
      },
      {
        title: 'rss',
        body: '<span style="color: var(--color-cloud);">PK</span> _id ObjectId<br/>' +
              'source_url String<br/>' +
              'title String<br/>' +
              'content_hash String<br/>' +
              'published_at Date<br/>' +
              '<span style="color: var(--text-dim);">dedupe by content_hash</span>'
      }
    ],

    roadmap: [
      { tag: 'Q3\u201926', tagClass: 'q3',   text: 'Add OpenAI/Anthropic as alternative LLM backends behind AI Chat', textClass: '' },
      { tag: 'Q3\u201926', tagClass: 'q3',   text: 'Promote Observer middleware to a standalone PyPI package',     textClass: '' },
      { tag: 'Q4\u201926', tagClass: 'q4',   text: 'Migrate RSS scheduler to Redis-backed distributed locks',       textClass: '' },
      { tag: 'Q4\u201926', tagClass: 'q4',   text: 'Add pytest + httpx test suite (currently manual verification)',  textClass: '' },
      { tag: 'Debt',       tagClass: 'debt', text: 'No dev dependencies declared — no linter/formatter pinned',     textClass: 'muted' },
      { tag: 'Debt',       tagClass: 'debt', text: 'X-Token rotation is manual — no auto-rotation endpoint yet',  textClass: 'muted' }
    ],

    glossary: [
      { term: 'ASGI',         termClass: 'amber',   def: 'Async Server Gateway Interface — Uvicorn protocol' },
      { term: 'FastAPI',     termClass: 'emerald', def: 'Python async web framework on Starlette + Pydantic' },
      { term: 'Motor',        termClass: 'violet',  def: 'Async MongoDB driver for Tornado/asyncio' },
      { term: 'SSE',          termClass: 'orange',  def: 'Server-Sent Events — HTTP streaming protocol' },
      { term: 'Ollama',       termClass: 'orange',  def: 'Local LLM runtime (qwen3.5 / qwen3-vl models)' },
      { term: 'Pydantic',     termClass: 'emerald', def: 'Python data validation + settings library' },
      { term: 'APScheduler',  termClass: 'orange',  def: 'Advanced Python Scheduler — in-process cron jobs' },
      { term: 'OSS',          termClass: 'amber',   def: 'Aliyun Object Storage Service — S3-compatible' },
      { term: 'X-Token',      termClass: 'rose',    def: 'YiAi shared-secret auth header (24h TTL)' },
      { term: 'Observer',    termClass: 'rose',    def: 'YiAi resilience middleware: throttle + sampler + sandbox + guard' },
      { term: 'Typer',        termClass: 'cyan',    def: 'Click-based CLI framework with type hints' },
      { term: 'Tenacity',     termClass: 'emerald', def: 'Python retry library with exponential backoff' }
    ]
  };
})();
