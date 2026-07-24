/**
 * @file: data.js
 * @purpose: Algorithmic SVG generator + static content for the architecture
 *           diagram. The SVG is no longer hand-positioned — every
 *           coordinate, boundary, and arrow path is computed by the
 *           embedded layout engine so that:
 *             · boundaries auto-size around their contained components
 *             · arrows route orthogonally with deterministic bend points
 *             · labels fit inside boxes (textLength + lengthAdjust) and
 *               get a pill background for readability
 *             · the outermost wireframe wraps every element (components,
 *               boundaries, AND the legend) with auto-computed padding
 *             · line strokes are thicker (2px) and markers are larger
 *               for crystal-clear rendering on retina + print
 *
 * @shape:
 *   {
 *     meta, executiveSummary, toc, metrics, svgDiagram,
 *     summaryCards, pipeline, securityCards, trace, scalingTiles,
 *     ownership, apiTable, stack, schemaTiles, roadmap, glossary
 *   }
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 0 — SHARED PRIMITIVES RESOLUTION
     Consume YiPet/cdn/components/diagram/primitives.js for the visual
     language (palette, markers, patterns, text rendering, corner
     brackets) so this template and the per-dep page generator
     share one source of truth. The primitives module is loaded as
     a separate <script> in index.html, but if it's missing (e.g.
     when this template is used in isolation) we fall back to
     inline defaults that match the same visual language.
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
     All coordinates are computed from these tokens; tweak here to
     resize the entire diagram. Grid is the unit-snap distance.
     ═══════════════════════════════════════════════════════════════════ */
  var GRID = 10;             // unit-snap distance (px)
  var PAD = 16;              // inner padding for component text
  var COL_GAP = 40;          // gap between columns
  var ROW_GAP = 50;          // gap between rows in the same layer
  var BOUNDARY_PAD = 18;     // padding inside a security/VPC boundary
  var OUTER_PAD = 28;        // padding inside the outermost region
  var LEGEND_H = 168;        // reserved height for the legend block
  var STROKE = 2;            // main line stroke-width
  var BOUNDARY_STROKE = 1.5; // boundary stroke-width
  var OUTER_STROKE = 2;      // outermost region stroke-width

  /* snap a number to the nearest GRID multiple */
  function snap(v) { return Math.round(v / GRID) * GRID; }

  /* clamp into [lo, hi] */
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* round a number to 2 decimals (keeps SVG payload small) */
  function r(n) { return Math.round(n * 100) / 100; }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 2 — COLOR / STYLE TOKENS
     Mirrors the design system in references/design-system.md. Each
     component type has a fill (rgba), a stroke (hex), and an arrow
     color. The renderers consume these directly.
     ═══════════════════════════════════════════════════════════════════ */
  /* STYLES map semantic component types to colors. All color values
     come from the shared PALETTE in ruiDiagramPrimitives, so any
     change to the palette updates this map automatically. */
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

  /* Connection palette — sync/async/auth/infra/telemetry mapping.
     Colors come from the shared PALETTE; markers are resolved
     dynamically from the color via P.markerForColor() so adding a
     new palette token automatically gets a matching arrowhead. */
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
     A component is a single box. A boundary is a dashed/solid
     container that groups components. A connection is a directed
     edge with a protocol label.
     ═══════════════════════════════════════════════════════════════════ */

  /* Component spec:
        { id, type, label, sub, lines?, col, row, layer, w, h }
     col/row = position within its layer
     layer   = outer band it belongs to
     w/h     = optional override; otherwise auto-sized from `lines`
  */
  var COMP_DEFS = [
    /* ── Layer: Client ───────────────────────────────────────────── */
    { id: 'users',     type: 'external', label: 'Users',
      sub: 'Web · Mobile · API', col: 0, row: 0, layer: 'client', w: 160 },

    /* ── Layer: Edge & Security ──────────────────────────────────── */
    { id: 'cloudfront',type: 'cloud', label: 'CloudFront',
      sub: 'CDN · 250 PoPs', col: 1, row: 0, layer: 'edge' },
    { id: 'waf',       type: 'security', label: 'AWS WAF',
      sub: 'OWASP · Bot mgmt', col: 2, row: 0, layer: 'edge' },
    { id: 'shield',    type: 'security', label: 'Shield Advanced',
      sub: 'DDoS L3/L4/L7', col: 3, row: 0, layer: 'edge' },
    { id: 'alb',       type: 'cloud', label: 'ALB',
      sub: 'L7 · :443 · 50K qps', col: 4, row: 0, layer: 'edge' },

    /* ── Layer: Identity & Gateway ───────────────────────────────── */
    { id: 'auth',      type: 'security', label: 'Auth Service',
      sub: 'OAuth2 · OIDC · JWT', col: 2, row: 1, layer: 'gateway' },
    { id: 'gateway',   type: 'backend', label: 'API Gateway',
      sub: 'Routing · Validation', col: 4, row: 1, layer: 'gateway',
      lines: ['Auth middleware', 'Rate limit · 10K rps',
              'Schema validation', 'Circuit breaker', 'mTLS termination'],
      w: 170, h: 132 },

    /* ── Layer: Service Mesh ─────────────────────────────────────── */
    { id: 'svc-user',    type: 'backend', label: 'User Service',
      sub: 'Go 1.22 · :8080 · ×2', col: 5, row: 0, layer: 'services' },
    { id: 'svc-order',   type: 'backend', label: 'Order Service',
      sub: 'Go 1.22 · :8081 · ×2', col: 5, row: 1, layer: 'services' },
    { id: 'svc-payment', type: 'backend', label: 'Payment Service',
      sub: 'Go 1.22 · :8082 · ×1', col: 5, row: 2, layer: 'services' },
    { id: 'svc-notify',  type: 'backend', label: 'Notification Worker',
      sub: 'Go 1.22 · :8090 · ×2', col: 5, row: 3, layer: 'services' },

    /* ── Layer: Data ─────────────────────────────────────────────── */
    { id: 'redis',      type: 'database', label: 'Redis Cluster',
      sub: '3 masters · 3 replicas', col: 6, row: 0, layer: 'data', w: 180 },
    { id: 'postgres',   type: 'database', label: 'PostgreSQL RDS',
      sub: 'Multi-AZ · 2 replicas', col: 6, row: 1, layer: 'data', w: 180,
      lines: ['Primary r6g.4xl', 'Read replica ×2',
              'pgvector · PostGIS', 'PITR · 35 days'] },
    { id: 'kafka',      type: 'message', label: 'Kafka',
      sub: '3 brokers · RF=3', col: 6, row: 3, layer: 'data', w: 180 },

    /* ── Layer: External ─────────────────────────────────────────── */
    { id: 'sendgrid',  type: 'external', label: 'SendGrid',
      sub: 'Transactional email', col: 2, row: 0, layer: 'external' },
    { id: 'stripe',    type: 'external', label: 'Stripe',
      sub: 'Payments API', col: 5, row: 0, layer: 'external' },

    /* ── Layer: CI / Observability (right column) ─────────────────── */
    { id: 'ci',        type: 'cloud', label: 'GitHub Actions',
      sub: 'CI/CD · Canary', col: 8, row: 0, layer: 'ci' },
    { id: 'ecr',       type: 'cloud', label: 'ECR',
      sub: 'Image registry', col: 8, row: 1, layer: 'ci' },
    { id: 'terraform', type: 'cloud', label: 'Terraform',
      sub: 'IaC · plan/apply', col: 8, row: 2, layer: 'ci' },
    { id: 'pagerduty', type: 'external', label: 'PagerDuty',
      sub: 'On-call · 5min ack', col: 8, row: 4, layer: 'ci' },
    { id: 'grafana',   type: 'ops', label: 'Grafana',
      sub: '20+ dashboards', col: 8, row: 5, layer: 'ci' },
    { id: 'prometheus',type: 'ops', label: 'Prometheus',
      sub: '5s scrape · 30d', col: 8, row: 6, layer: 'ci' },
    { id: 'otel',      type: 'ops', label: 'OpenTelemetry',
      sub: 'OTLP · 100% sample', col: 8, row: 7, layer: 'ci' }
  ];

  /* Boundaries (containers) — drawn AFTER components, BEFORE outermost.
     Each boundary's bounds are auto-computed from its members. */
  var BOUNDARY_DEFS = [
    {
      id: 'sg-auth', kind: 'security',
      label: 'sg-auth :443 · OAuth2',
      members: ['auth']
    },
    {
      id: 'vpc-svc', kind: 'vpc',
      label: 'VPC · Services (10.0.0.0/16)',
      sub: 'sg-services · :3000-8090',
      members: ['gateway','svc-user','svc-order','svc-payment','svc-notify']
    },
    {
      id: 'vpc-data', kind: 'vpc',
      label: 'VPC · Data (10.0.1.0/24)',
      sub: 'sg-data · :5432 :6379 :9092',
      members: ['redis','postgres','kafka']
    }
  ];

  /* Connections — directed edges with a label + sub label.
     from / to refer to component ids. kind picks the arrow style. */
  var CONNECTION_DEFS = [
    /* Client → Edge */
    { from: 'users',      to: 'cloudfront', kind: 'frontend',
      label: 'HTTPS / TLS 1.3',     sub: 'p95 ≤ 120ms' },
    { from: 'cloudfront', to: 'shield',     kind: 'frontend',
      label: 'L3/L4 DDoS' },
    { from: 'shield',     to: 'waf',        kind: 'frontend',
      label: 'L7 inspection' },
    { from: 'waf',        to: 'alb',        kind: 'frontend',
      label: 'HTTPS · :443' },

    /* Edge → Identity / Gateway */
    { from: 'alb',        to: 'auth',       kind: 'auth',
      label: 'JWT verify' },
    { from: 'auth',       to: 'gateway',    kind: 'auth',
      label: 'OAuth2 · OIDC' },

    /* Gateway → Services */
    { from: 'gateway',    to: 'svc-user',   kind: 'sync', label: 'gRPC',  sub: 'p95 ≤ 18ms' },
    { from: 'gateway',    to: 'svc-order',  kind: 'sync', label: 'REST',  sub: 'p95 ≤ 45ms' },
    { from: 'gateway',    to: 'svc-payment',kind: 'sync', label: 'REST',  sub: 'mTLS' },
    { from: 'gateway',    to: 'svc-notify', kind: 'async',label: 'WS pub' },

    /* Services → Data */
    { from: 'svc-user',   to: 'postgres',   kind: 'data', label: 'SQL',   sub: 'p95 ≤ 8ms' },
    { from: 'svc-user',   to: 'redis',      kind: 'data', label: 'GET/SET', sub: 'p95 ≤ 2ms' },
    { from: 'svc-order',  to: 'postgres',   kind: 'data', label: 'R/W' },
    { from: 'svc-order',  to: 'kafka',      kind: 'async',label: 'publish',  sub: 'orders.v1' },
    { from: 'svc-payment',to: 'postgres',   kind: 'data', label: 'INSERT' },
    { from: 'svc-payment',to: 'stripe',     kind: 'sync', label: 'charge',   sub: 'idempotent' },
    { from: 'svc-notify', to: 'sendgrid',   kind: 'sync', label: 'SMTP' },
    { from: 'svc-notify', to: 'kafka',      kind: 'async',label: 'consume',  sub: 'orders.v1' },

    /* CI / Infra → Services */
    { from: 'ci',         to: 'ecr',        kind: 'infra',label: 'push' },
    { from: 'ci',         to: 'gateway',    kind: 'infra',label: 'deploy',   sub: 'canary 10→100%' },
    { from: 'ecr',        to: 'gateway',    kind: 'infra',label: 'pull' },
    { from: 'terraform',  to: 'vpc-svc',    kind: 'infra',label: 'provision' },

    /* Observability tap (telemetry, drawn dotted) */
    { from: 'otel',       to: 'gateway',    kind: 'telemetry', label: 'OTLP' },
    { from: 'prometheus', to: 'svc-user',   kind: 'telemetry', label: 'scrape' },
    { from: 'grafana',    to: 'prometheus', kind: 'telemetry', label: 'query' },
    { from: 'pagerduty',  to: 'otel',       kind: 'telemetry', label: 'alert' }
  ];

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 4 — LAYOUT ENGINE
     Step 1: place each component on a virtual grid (col / row within
             its layer, x / y are computed from the layer's band y).
     Step 2: size each component box (auto from text lines, or override).
     Step 3: compute boundary bounds from their members.
     Step 4: route every connection orthogonally.
     Step 5: compute the outermost region to wrap every element.
     ═══════════════════════════════════════════════════════════════════ */

  /* Per-layer vertical positions and per-column horizontal positions
     are auto-computed. We use a 9-column virtual grid. */
  var LAYER_BAND = {
    client:   { y:  80,  rows: 1, colSpan: 1 },
    edge:     { y: 220,  rows: 1, colSpan: 4 },
    gateway:  { y: 360,  rows: 2, colSpan: 4 },
    services: { y: 540,  rows: 4, colSpan: 1 },
    data:     { y: 540,  rows: 4, colSpan: 1 },
    external: { y: 920,  rows: 1, colSpan: 6 },
    ci:       { y:  80,  rows: 8, colSpan: 1 }
  };

  /* Standard component dimensions (used when not overridden) */
  var STD_W = 160;
  var STD_H = 60;
  var SMALL_W = 140;
  var SMALL_H = 56;

  /* Pre-compute each component's pixel position + size */
  function layoutComponents() {
    var comps = [];
    /* First pass: determine max rows per layer and column widths.
       We sort by (layer, col, row) and assign col_x based on col index,
       y based on row index + layer base. */
    var layerMaxCol = {};
    var layerMaxRow = {};
    COMP_DEFS.forEach(function (d) {
      var band = LAYER_BAND[d.layer];
      layerMaxCol[d.layer] = Math.max(layerMaxCol[d.layer] || 0, d.col);
      layerMaxRow[d.layer] = Math.max(layerMaxRow[d.layer] || 0, d.row);
    });

    /* compute the global column X positions — 9 columns total */
    var COL_X = [60, 240, 420, 600, 780, 960, 1140, 1320, 1500];
    var ROW_H_LAYER = 88; /* per-row stride inside a layer */

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

  /* Estimate the height required for a list of bullet lines */
  function computeHeight(lines, w) {
    /* base (title + sub) + lines * line-height */
    var lineH = 14;
    return 50 + lines.length * lineH;
  }

  /* Compute boundary bounds from their contained components */
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
        y: snap(minY - BOUNDARY_PAD - 16 /* room for label */),
        w: snap(maxX - minX + 2 * BOUNDARY_PAD),
        h: snap(maxY - minY + 2 * BOUNDARY_PAD + 16),
        members: members
      };
    }).filter(Boolean);
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 5 — ORTHOGONAL ROUTING
     Given two component boxes and the preferred exit/entry side,
     compute a 2-bend or 3-bend polyline that avoids other components
     where possible. The router is simple (Manhattan) but produces
     crisp, professional results.
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

  /* Pick the best exit/entry sides given two components. */
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

  /* Build a path string from a list of {x,y} waypoints. */
  function polyline(points) {
    if (!points.length) return '';
    var d = 'M ' + r(points[0].x) + ' ' + r(points[0].y);
    for (var i = 1; i < points.length; i++) {
      d += ' L ' + r(points[i].x) + ' ' + r(points[i].y);
    }
    return d;
  }

  /* Compute an orthogonal route between two points. */
  function orthogonalRoute(p1, p2) {
    var dx = p2.x - p1.x, dy = p2.y - p1.y;
    /* Same row → straight horizontal */
    if (Math.abs(dy) < 0.5) return [p1, p2];
    /* Same column → straight vertical */
    if (Math.abs(dx) < 0.5) return [p1, p2];
    /* 2-bend Manhattan: out, bend at midpoint x, then in.
       If endpoints align in x, we use a single bend on y. */
    var midX = p1.x + dx / 2;
    var midY = p1.y + dy / 2;
    /* Prefer H-V-H routing (2 bends at x = midX) when both bends stay
       outside any overlapping box. The simple version uses 2 bends. */
    return [
      p1,
      { x: midX, y: p1.y },
      { x: midX, y: p2.y },
      p2
    ];
  }

  /* Mid-point of a polyline (used to place the label) */
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
     The renderers take the computed model and emit SVG fragments in
     the mandatory paint order:
       defs → grid → arrows → masks → components → boundaries → legend
     The outermost region is emitted LAST so it visually wraps everything.
     ═══════════════════════════════════════════════════════════════════ */

  function renderDefs() {
    /* Markers, patterns, and shadow filters come from the shared
       primitives module (SECTION 0). The local `glow` filter is
       unique to this diagram and stays inline. */
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
      /* Push the anchor point slightly outside the box so the arrow
         head doesn't sit on top of the stroke. */
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
      /* Label pill at the midpoint of the path */
      var mid = pathMidpoint(points);
      if (c.label) {
        parts.push(renderLabelPill(mid, c.from, c.to, c.label, c.sub, style.color));
      }
    });
    return parts.join('');
  }

  /* Render a label "pill": a small rounded rect behind the text so the
     label is readable on top of any background. Includes data-from /
     data-to so the index.js interaction code can highlight the pill
     alongside its arrow. */
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

  function escapeXml(s) {
    /* Delegated to the shared primitives module. Kept as a local
       wrapper so the many existing call sites don't have to change. */
    return P.esc(s);
  }

  function renderMasks(comps) {
    /* Opaque mask drawn BEFORE the styled rect so arrows underneath
       the box are hidden. Same x/y/w/h as the styled rect. */
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
      /* Title row */
      var titleY = c.y + 22;
      var subY = c.y + 38;
      /* textLength to ensure the title fits; we let it shrink up to 90%
         of the box width. */
      var titleTextW = c.w - 20;
      inner.push('<text x="' + (c.x + c.w / 2) + '" y="' + titleY + '" ' +
                 'fill="#ffffff" font-size="12" font-weight="700" ' +
                 'text-anchor="middle" textLength="' + titleTextW + '" ' +
                 'lengthAdjust="spacingAndGlyphs">' + escapeXml(c.label) + '</text>');
      inner.push('<text x="' + (c.x + c.w / 2) + '" y="' + subY + '" ' +
                 'fill="#cbd5e1" font-size="9" text-anchor="middle" ' +
                 'textLength="' + (c.w - 16) + '" lengthAdjust="spacingAndGlyphs">' +
                 escapeXml(c.sub) + '</text>');
      /* Bullet list for multi-line components */
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

  /* Legend with two sections: component swatches + line styles.
     Auto-laid out below the diagram body. */
  function renderLegend(x, y) {
    var swatches = [
      { fill: STYLES.frontend.fill, stroke: STYLES.frontend.stroke, label: 'Frontend / CDN' },
      { fill: STYLES.backend.fill,  stroke: STYLES.backend.stroke,  label: 'Backend Service' },
      { fill: STYLES.database.fill, stroke: STYLES.database.stroke, label: 'Database / Cache' },
      { fill: STYLES.cloud.fill,    stroke: STYLES.cloud.stroke,    label: 'Cloud / AWS' },
      { fill: STYLES.security.fill, stroke: STYLES.security.stroke, label: 'Security / Auth' },
      { fill: STYLES.message.fill,  stroke: STYLES.message.stroke,  label: 'Message Bus' },
      { fill: STYLES.external.fill, stroke: STYLES.external.stroke, label: 'External / 3rd Party' },
      { fill: STYLES.ops.fill,      stroke: STYLES.ops.stroke,      label: 'Observability Tool' }
    ];
    var lineStyles = [
      { color: CONN.sync.color,      dash: null,     label: 'Sync (REST / gRPC)' },
      { color: CONN.async.color,     dash: '4,3',    label: 'Async (Pub / Sub)' },
      { color: CONN.auth.color,      dash: '5,5',    label: 'Auth / Security' },
      { color: CONN.infra.color,     dash: '6,4',    label: 'Infra / Deploy' },
      { color: CONN.telemetry.color, dash: '2,2',    label: 'Telemetry / Logs' }
    ];

    var parts = [];
    parts.push('<text x="' + x + '" y="' + y + '" fill="#ffffff" font-size="13" font-weight="700">Legend</text>');
    /* Component swatches — 4 columns */
    var colW = 220, rowH = 28;
    swatches.forEach(function (s, i) {
      var sx = x + (i % 4) * colW;
      var sy = y + 24 + Math.floor(i / 4) * rowH;
      parts.push('<rect x="' + sx + '" y="' + sy + '" width="22" height="14" rx="3" ' +
                 'fill="' + s.fill + '" stroke="' + s.stroke + '" stroke-width="1.5"/>');
      parts.push('<text x="' + (sx + 32) + '" y="' + (sy + 11) + '" fill="#cbd5e1" font-size="10">' +
                 escapeXml(s.label) + '</text>');
    });
    /* Line styles — 5 columns */
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
     Computed from ALL non-legend content. The legend is included
     inside the region so the entire diagram is wrapped by a single
     outermost wireframe.
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
    var y = snap(minY - OUTER_PAD - 28 /* room for label */);
    var w = snap(maxX - minX + 2 * OUTER_PAD);
    var h = snap(maxY - minY + 2 * OUTER_PAD + 28);
    return {
      x: x, y: y, w: w, h: h,
      labelY: y + 20,
      label: 'AWS Region · us-east-1',
      sub: 'Multi-AZ · 3 AZs · 12 services · 7 data stores',
      markup:
        /* subtle background fill — 0.012 amber is barely visible, lets
           the dashed border speak for the region. */
        '<rect class="svg-outermost" x="' + x + '" y="' + y + '" ' +
          'width="' + w + '" height="' + h + '" rx="20" ' +
          'fill="rgba(251,191,36,0.012)" stroke="#fbbf24" ' +
          'stroke-width="2.2" stroke-dasharray="10,5"/>' +
        /* name tag at the top-left, with a thin border to read as a
           "section label" not just floating text. */
        '<rect x="' + (x + 12) + '" y="' + (y + 8) + '" height="32" width="240" rx="6" ' +
          'fill="#020617" stroke="#fbbf24" stroke-width="1.2"/>' +
        '<text x="' + (x + 22) + '" y="' + (y + 24) + '" fill="#fbbf24" ' +
          'font-size="12" font-weight="700">▸ ' + 'AWS Region · us-east-1' + '</text>' +
        '<text x="' + (x + 22) + '" y="' + (y + 36) + '" fill="#94a3b8" font-size="9">' +
          'Multi-AZ · 3 AZs · 12 services · 7 data stores' + '</text>' +
        /* corner brackets — four tiny L-shapes at each corner that read
           as "frame markers", making the region feel more professional. */
        renderCornerBrackets(x, y, w, h)
    };
  }

  /* Render the 4 corner brackets of the outermost region. Delegates
     to the shared primitives module so the bracket geometry is
     identical across all yry-report diagrams. */
  function renderCornerBrackets(x, y, w, h) {
    return P.renderCornerBrackets(x, y, w, h, '#fbbf24', 12);
  }

  /* Render a vertical "layer rail" along the left side of the diagram
     with rotated labels for each layer. This gives the diagram a
     professional "swimlane" feel and helps the reader orient. */
  function renderLayerRail(comps) {
    /* Group components by layer, then compute the y-range of each layer. */
    var groups = {};
    comps.forEach(function (c) {
      if (!groups[c.layer]) groups[c.layer] = [];
      groups[c.layer].push(c);
    });

    /* Display order + color for each layer (top → bottom on the rail) */
    var LAYER_INFO = [
      { key: 'client',   label: 'CLIENT',                color: '#94a3b8' },
      { key: 'edge',     label: 'EDGE & SECURITY',       color: '#22d3ee' },
      { key: 'gateway',  label: 'IDENTITY & GATEWAY',    color: '#fb7185' },
      { key: 'services', label: 'SERVICE MESH',          color: '#34d399' },
      { key: 'data',     label: 'DATA & MESSAGING',      color: '#a78bfa' },
      { key: 'external', label: 'EXTERNAL SERVICES',     color: '#94a3b8' },
      { key: 'ci',       label: 'CI / OBSERVABILITY',    color: '#fbbf24' }
    ];

    var parts = [];
    /* The rail sits at x=8 (just inside the outermost region padding). */
    LAYER_INFO.forEach(function (li) {
      var items = groups[li.key];
      if (!items || !items.length) return;
      var yMin = Math.min.apply(null, items.map(function (c) { return c.y; }));
      var yMax = Math.max.apply(null, items.map(function (c) { return c.y + c.h; }));
      var midY = (yMin + yMax) / 2;
      var h = yMax - yMin;
      /* vertical text rotated -90 around its baseline */
      var labelX = 18;
      var labelY = midY;
      parts.push('<g class="layer-rail">');
      /* thin vertical line marking the layer's range */
      parts.push('<line x1="' + labelX + '" y1="' + yMin + '" x2="' + labelX + '" y2="' + yMax + '" ' +
                 'stroke="' + li.color + '" stroke-width="1" stroke-dasharray="2,2" opacity="0.6"/>');
      /* label, rotated, centered on the layer's mid-y */
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
     Run the layout, compute bounds + routes, and stitch together
     the final SVG string in the mandatory paint order.
     ═══════════════════════════════════════════════════════════════════ */
  function buildSvg() {
    var comps = layoutComponents();
    var bounds = layoutBoundaries(comps);
    var legendX = 60;
    var legendY = 1040;  /* placed below the external-services layer */
    var outermost = renderOutermost(comps, bounds, legendY);

    var svgW = outermost.x + outermost.w + 40;
    var svgH = outermost.y + outermost.h + 40;

    var parts = [];
    parts.push('<svg ref="svg" viewBox="0 0 ' + svgW + ' ' + svgH + '" ' +
               'role="img" aria-labelledby="diagram-title diagram-desc" ' +
               'xmlns="http://www.w3.org/2000/svg" ' +
               'shape-rendering="geometricPrecision" text-rendering="geometricPrecision">');
    parts.push('<title id="diagram-title">Microservices Platform Architecture — AWS us-east-1</title>');
    parts.push('<desc id="diagram-desc">Cloud-native microservices platform: CloudFront CDN, Shield, WAF, ALB, Auth Service, API Gateway, four Go microservices, PostgreSQL RDS, Redis, Kafka, and supporting CI/CD and observability tooling.</desc>');
    /* 1. defs */
    parts.push(renderDefs());
    /* 2. grid background */
    parts.push('<rect width="100%" height="100%" fill="url(#grid)"/>');
    parts.push('<rect width="100%" height="100%" fill="url(#grid-major)"/>');
    /* 2.5 layer rail (rotated labels on the left side) */
    parts.push(renderLayerRail(comps));
    /* 3. arrows (under everything) */
    parts.push(renderArrows(comps, CONNECTION_DEFS));
    /* 4. opaque masks (hide arrow segments that pass through boxes) */
    parts.push(renderMasks(comps));
    /* 5. component boxes + text */
    parts.push(renderComponents(comps));
    /* 6. inner boundaries (security groups / VPCs) */
    parts.push(renderBoundaries(bounds));
    /* 7. legend (inside the outermost region) */
    parts.push(renderLegend(legendX, legendY));
    /* 8. outermost wireframe (wraps everything) */
    parts.push(outermost.markup);
    parts.push('</svg>');
    return parts.join('\n');
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 9 — STATIC CONTENT
     (The non-SVG data sections that the Vue template consumes.)
     ═══════════════════════════════════════════════════════════════════ */
  window.REPORT_DATA = {
    meta: {
      title: 'Microservices Platform Architecture Diagram',
      pageTitle: 'Microservices Platform — Cloud-Native Architecture',
      subtitle: 'Multi-service e-commerce platform on AWS · event-driven · CI/CD with canary · multi-AZ · 99.97% uptime',
      footer: 'Microservices Platform · AWS us-east-1 · Go + PostgreSQL + Kafka · v2.4.0 · 2026-07-19',
      traceSub: 'end-to-end p95 ≤ 380ms'
    },

    executiveSummary: [
      { color: 'cyan',    title: '▸ System Scope',       content: 'Cloud-native microservices platform serving 500K+ daily active users across web, mobile, and API channels. Processes 12K requests/sec with p95 latency under 200ms end-to-end and 99.97% measured uptime over the trailing 30 days.' },
      { color: 'emerald', title: '▸ Architecture Style', content: 'Hybrid cloud-native: CDN edge → WAF → Shield → ALB → API Gateway → domain microservices → polyglot persistence. Event-driven communication via Kafka for async workflows. CI/CD with canary deployments and automated rollback on alarm.' },
      { color: 'violet',  title: '▸ Key Decisions',      content: 'Go chosen for service performance (sub-ms GC pauses, native mTLS, single static binary). PostgreSQL over NoSQL for ACID compliance on payment data. Kafka over SQS for ordered event replay and long-term retention. Redis cluster mode for sub-2ms reads at p95.' }
    ],

    toc: [
      { href: '#diagram',   icon: '📐', label: 'Diagram' },
      { href: '#metrics',   icon: '📊', label: 'Metrics' },
      { href: '#summary',   icon: '📋', label: 'Summary' },
      { href: '#pipeline',  icon: '🚀', label: 'Pipeline' },
      { href: '#security',  icon: '🔒', label: 'Security' },
      { href: '#trace',     icon: '🔍', label: 'Trace' },
      { href: '#scaling',   icon: '⚖️', label: 'Scaling' },
      { href: '#ownership', icon: '👥', label: 'Teams' },
      { href: '#api',       icon: '📡', label: 'API' },
      { href: '#stack',     icon: '🧰', label: 'Stack' },
      { href: '#schema',    icon: '🗄️', label: 'Schema' },
      { href: '#roadmap',   icon: '🔮', label: 'Roadmap' }
    ],

    metrics: [
      { label: 'Uptime (30d)',     status: 'green', value: '99.97%', valueClass: 'green',  sub: 'SLA target: 99.95% · +0.02% buffer' },
      { label: 'Requests / sec',   status: null,    value: '12.4K',  valueClass: 'cyan',   sub: 'peak 28K · p95 ≤ 200ms · p99 ≤ 410ms' },
      { label: 'Error Rate (24h)', status: null,    value: '0.07%',  valueClass: 'amber',  sub: 'threshold 0.1% · 5xx + 4xx combined' },
      { label: 'Deploy Frequency', status: null,    value: '8 / wk', valueClass: 'violet', sub: 'canary · mean MTTR 12m · change-fail 4%' },
      { label: 'Active Alerts',    status: null,    value: '0',      valueClass: 'rose',   sub: 'PagerDuty · 5min ack · 30min escalation' }
    ],

    svgDiagram: buildSvg(),

    summaryCards: [
      {
        color: 'cyan',
        title: 'Architecture & Scaling',
        items: [
          'API Gateway (×3 instances, auto-scaling 2→8) is the single entry point — routes REST, gRPC, and WebSocket traffic with circuit-breaker protection (50% error threshold, 30s open)',
          'Four Go microservices (User ×2, Order ×2, Payment ×1, Notification ×2) deployed across 3 AZs in private subnets, each with dedicated ENIs and 30s warm-up grace',
          'CloudFront CDN at 250 PoPs with integrated Shield Advanced + WAF for L3/L4/L7 DDoS mitigation, OWASP Top 10 rule sets, and per-IP rate limiting (10K rps per IP)',
          'Auth Service enforces OAuth2 + OIDC with short-lived JWT (15min) + refresh tokens (7d rotating); all inter-service traffic uses mTLS with certs rotated every 24h via SPIFFE',
          'S3 stores static assets and log archives with SSE-KMS encryption, cross-region replication to us-west-2, and 90-day lifecycle policy for cold logs'
        ]
      },
      {
        color: 'emerald',
        title: 'Data Flow & Performance',
        items: [
          'Critical path latency: Edge (p95 ≤ 120ms) → ALB (p95 ≤ 45ms) → API Gateway (p95 ≤ 18ms) → Service (p95 ≤ 45ms) → PostgreSQL (p95 ≤ 8ms) = end-to-end p95 ≤ 280ms',
          'Order events published to Kafka topic `orders.v1` (24 partitions, RF=3) and consumed asynchronously by Notification Worker; email delivery via SendGrid SMTP with retry+DLQ',
          'Redis Cluster (3 masters + 3 replicas) caches user sessions with write-through invalidation; hit rate target ≥ 95% at 10K reads/sec, eviction policy allkeys-lru',
          'Payment Service integrates Stripe API with idempotency keys (24h TTL); transaction records persisted to PostgreSQL with ACID guarantees and Stripe webhook reconciliation',
          'All database connections use TLS 1.3 within the secured VPC data layer (10.0.1.0/24); connection pooling at 200 conns/pool, slow query log > 100ms routed to PagerDuty'
        ]
      },
      {
        color: 'violet',
        title: 'Reliability & Observability',
        items: [
          'PostgreSQL RDS Multi-AZ with 2 read replicas; automated failover < 60s; point-in-time recovery with 35-day retention; weekly failover drill',
          'GitHub Actions CI/CD: lint → unit → integration → build → ECR push → ECS deploy with canary rollout (10% → 50% → 100% over 30min) and automated rollback on CloudWatch alarm',
          'Observability: Grafana (20+ panels), Prometheus (5s scrape, 30d retention), OpenTelemetry (100% sampling, OTLP/gzip), ELK (7-day hot, 90-day cold)',
          'SLA targets: 99.95% API availability, p95 response < 200ms, error rate < 0.1%; PagerDuty on-call with 5min ack / 30min escalation, status page at status.example.com',
          'Chaos engineering: monthly GameDay exercises (AZ failure, RDS failover, Redis eviction) with documented runbooks and post-mortem template'
        ]
      }
    ],

    pipeline: [
      { badge: 'Dev',          badgeClass: 'dev',  info: 'Push to feature branch<br/>PR + review' },
      { badge: 'CI',           badgeClass: 'dev',  info: 'Lint · Unit · Integration<br/>Trivy + Semgrep' },
      { badge: 'Build',        badgeClass: 'dev',  info: 'Multi-stage Docker<br/>Push to ECR' },
      { badge: 'Staging',      badgeClass: 'stg',  info: 'ECS Fargate deploy<br/>E2E + load test' },
      { badge: 'Canary 10%',   badgeClass: 'stg',  info: '10% traffic · 10min bake' },
      { badge: 'Canary 50%',   badgeClass: 'stg',  info: '50% traffic · monitor' },
      { badge: 'Production',   badgeClass: 'prod', info: '100% traffic<br/>Auto-rollback on alarm' }
    ],

    securityCards: [
      {
        color: 'rose',
        title: 'Encryption & Secrets',
        items: [
          'In-transit: TLS 1.3 enforced for all external + inter-service communication; mTLS within service mesh via SPIFFE/SPIRE with 24h cert rotation',
          'At-rest: AES-256-GCM for RDS, S3 (SSE-KMS with customer-managed keys, annual rotation), EBS volumes, and ElastiCache Redis',
          'Secrets managed via AWS Secrets Manager with automatic 30-day rotation; no hardcoded credentials in source, all access via IAM roles + STS temporary credentials',
          'KMS key policy enforces least-privilege (per-service grants); CloudTrail + KMS audit logs forwarded to SIEM with 7-year retention for compliance'
        ]
      },
      {
        color: 'amber',
        title: 'Network & Access',
        items: [
          'VPC isolation: Services (10.0.0.0/16) + Data (10.0.1.0/24) across 3 AZs — no public subnets for data tier, NAT Gateway egress only',
          'Security groups follow least-privilege: only required ports open between specific CIDR ranges; default-deny on all inbound',
          'WAF rules: managed OWASP Top 10 + custom rules for known attack patterns, IP reputation (AWS + 3rd party feed), geo-allowlist (US/EU/APAC)',
          'IAM: role-based access with temporary credentials (STS, max 1h); no long-lived IAM user keys; permission boundaries for break-glass scenarios'
        ]
      },
      {
        color: 'orange',
        title: 'Compliance & Audit',
        items: [
          'Framework alignment: SOC 2 Type II (annual), GDPR (EU data residency in eu-west-1), PCI-DSS v4.0 (payment tier), HIPAA-ready (BAA available)',
          'Audit logging: CloudTrail (all API calls), VPC Flow Logs (network), RDS audit logs (DB queries), application audit log (sensitive operations)',
          'Vulnerability scanning: ECR image scanning on push + weekly Trivy scans with Slack notifications; SAST via Semgrep, DAST via OWASP ZAP on staging',
          'Incident response: PagerDuty on-call rotation, 5-min ack SLA, 30-min escalation, automated rollback via CloudWatch composite alarm; quarterly tabletop exercises'
        ]
      }
    ],

    trace: [
      { name: '1. DNS/TLS',     nameClass: 'cyan',    sub: 'CloudFront · 250 PoPs', time: '~80ms' },
      { name: '2. WAF',         nameClass: 'cyan',    sub: 'Rule check',           time: '~12ms' },
      { name: '3. ALB',         nameClass: 'cyan',    sub: 'L7 route :443',        time: '~8ms'  },
      { name: '4. Gateway',     nameClass: 'emerald', sub: 'JWT + Validate',       time: '~45ms' },
      { name: '5. Order Svc',   nameClass: 'emerald', sub: 'Business logic',       time: '~65ms' },
      { name: '6. DB Write',    nameClass: 'violet',  sub: 'INSERT order',         time: '~18ms' },
      { name: '7. Kafka pub',   nameClass: 'orange',  sub: 'orders.v1',            time: '~35ms' },
      { name: '8. 200 OK',      nameClass: 'emerald', sub: 'JSON response',        time: '~17ms' }
    ],

    scalingTiles: [
      {
        color: 'cyan',
        title: 'API Gateway Auto-Scaling',
        body: '<span style="color: var(--text-muted);">Metric:</span> CPU ≥ 70% OR RequestCount ≥ 5K/min<br/>' +
              '<span style="color: var(--text-muted);">Policy:</span> +2 instances · 5min cooldown<br/>' +
              '<span style="color: var(--text-muted);">Range:</span> Min 2 · Desired 3 · Max 8<br/>' +
              '<span style="color: var(--text-muted);">Scale-in:</span> CPU ≤ 30% for 10min → −1'
      },
      {
        color: 'emerald',
        title: 'Service Tier Scaling',
        body: '<span style="color: var(--text-muted);">User/Order:</span> CPU ≥ 60% → +1 (max 4)<br/>' +
              '<span style="color: var(--text-muted);">Payment:</span> Fixed ×1 (PCI scope)<br/>' +
              '<span style="color: var(--text-muted);">Notification:</span> Queue depth ≥ 1K → +1<br/>' +
              '<span style="color: var(--text-muted);">Warm-up:</span> 30s grace per instance'
      },
      {
        color: 'violet',
        title: 'Database Resilience',
        body: '<span style="color: var(--text-muted);">RDS:</span> Multi-AZ · Auto-failover ≤ 60s<br/>' +
              '<span style="color: var(--text-muted);">Backup:</span> Daily snapshots · 35d PITR<br/>' +
              '<span style="color: var(--text-muted);">Redis:</span> Cluster mode · Auto-failover<br/>' +
              '<span style="color: var(--text-muted);">Kafka:</span> 3 brokers · RF=3 · min.insync=2'
      },
      {
        color: 'rose',
        title: 'Disaster Recovery',
        body: '<span style="color: var(--text-muted);">RPO:</span> 5 min (cross-region replication)<br/>' +
              '<span style="color: var(--text-muted);">RTO:</span> 30 min (automated failover)<br/>' +
              '<span style="color: var(--text-muted);">DR Region:</span> us-west-2 (warm standby)<br/>' +
              '<span style="color: var(--text-muted);">Test:</span> Quarterly failover drill'
      }
    ],

    ownership: {
      headers: ['Service', 'Team', 'Tier', 'SLA', 'On-Call', 'Runbook'],
      rows: [
        ['<span style="color: var(--color-frontend);">API Gateway</span>',  'Platform',  '<span style="color: var(--color-backend);">Tier 0</span>', '99.95%', 'Primary: Alice · Secondary: Bob',     '<span style="color: var(--text-dim);">/ops/gateway</span>'],
        ['<span style="color: var(--color-backend);">User Service</span>',   'Identity',  '<span style="color: var(--color-backend);">Tier 1</span>', '99.9%',  'Primary: Carol · Secondary: Dave',    '<span style="color: var(--text-dim);">/ops/user-svc</span>'],
        ['<span style="color: var(--color-backend);">Order Service</span>',  'Commerce',  '<span style="color: var(--color-backend);">Tier 1</span>', '99.9%',  'Primary: Eve · Secondary: Frank',     '<span style="color: var(--text-dim);">/ops/order-svc</span>'],
        ['<span style="color: var(--color-backend);">Payment Svc</span>',    'Commerce',  '<span style="color: var(--color-cloud);">Tier 1</span>',   '99.95%', 'Primary: Eve · Escalation: Legal',    '<span style="color: var(--text-dim);">/ops/payment-svc</span>'],
        ['<span style="color: var(--color-security);">Auth Service</span>',  'Identity',  '<span style="color: var(--color-backend);">Tier 0</span>', '99.95%', 'Primary: Carol · SecOps backup',      '<span style="color: var(--text-dim);">/ops/auth-svc</span>'],
        ['<span style="color: var(--color-database);">PostgreSQL</span>',    'Platform',  '<span style="color: var(--color-backend);">Tier 0</span>', '99.95%', 'Primary: Bob · AWS Support',          '<span style="color: var(--text-dim);">/ops/rds</span>']
      ]
    },

    apiTable: {
      headers: ['Method', 'Path', 'Service', 'Auth', 'Rate Limit', 'Description'],
      rows: [
        { method: 'GET',   color: 'backend',  path: '/api/v1/users/:id',       service: 'User Service',   auth: 'JWT (read)',     rate: '100/min',   desc: 'Fetch user profile by ID' },
        { method: 'POST',  color: 'cloud',    path: '/api/v1/orders',          service: 'Order Service',  auth: 'JWT + scope',   rate: '30/min',    desc: 'Create new order (idempotent)' },
        { method: 'PATCH', color: 'frontend', path: '/api/v1/orders/:id',      service: 'Order Service',  auth: 'JWT + owner',   rate: '60/min',    desc: 'Update order status or details' },
        { method: 'POST',  color: 'backend',  path: '/api/v1/payments/charge', service: 'Payment Svc',    auth: 'JWT + mTLS',    rate: '10/min',    desc: 'Authorize and capture payment' },
        { method: 'GET',   color: 'backend',  path: '/api/v1/health',          service: 'Gateway',        auth: 'None',         rate: '1000/min',  desc: 'Aggregated health check (all services)' },
        { method: 'WS',    color: 'security', path: '/ws/v1/events',           service: 'Gateway',        auth: 'JWT + upgrade',rate: '50 conn/IP', desc: 'Real-time order status stream' }
      ]
    },

    stack: [
      { label: 'Go',           value: '1.22',   valueClass: 'cyan'   },
      { label: 'PostgreSQL',   value: '16.2',   valueClass: 'violet' },
      { label: 'Redis',        value: '7.2',    valueClass: 'rose'   },
      { label: 'Kafka',        value: '3.7',    valueClass: 'orange' },
      { label: 'TypeScript',   value: '5.4',    valueClass: 'cyan'   },
      { label: 'React',        value: '18.3',   valueClass: 'cyan'   },
      { label: 'Docker',       value: '26.x',   valueClass: 'amber'  },
      { label: 'Terraform',    value: '1.8',    valueClass: 'amber'  },
      { label: 'Prometheus',   value: '2.52',   valueClass: 'orange' },
      { label: 'Grafana',      value: '11.0',   valueClass: 'orange' }
    ],

    schemaTiles: [
      {
        title: 'users',
        body: '<span style="color: var(--color-cloud);">PK</span> id UUID<br/>' +
              'email VARCHAR(255) UNIQUE<br/>' +
              'name VARCHAR(255)<br/>' +
              'created_at TIMESTAMP<br/>' +
              '<span style="color: var(--text-dim);">→ orders.user_id</span>'
      },
      {
        title: 'orders',
        body: '<span style="color: var(--color-cloud);">PK</span> id UUID<br/>' +
              '<span style="color: var(--color-cloud);">FK</span> user_id → users<br/>' +
              'status ENUM(\'pending\',\'paid\',\'cancelled\')<br/>' +
              'total DECIMAL(10,2)<br/>' +
              '<span style="color: var(--text-dim);">→ payments.order_id</span>'
      },
      {
        title: 'payments',
        body: '<span style="color: var(--color-cloud);">PK</span> id UUID<br/>' +
              '<span style="color: var(--color-cloud);">FK</span> order_id → orders<br/>' +
              'stripe_charge_id VARCHAR(255)<br/>' +
              'amount DECIMAL(10,2)<br/>' +
              'status ENUM(\'auth\',\'captured\',\'refunded\')'
      },
      {
        title: 'sessions',
        body: '<span style="color: var(--color-cloud);">PK</span> token VARCHAR(512)<br/>' +
              'user_id UUID<br/>' +
              'expires_at TIMESTAMP<br/>' +
              '<span style="color: var(--text-dim);">Redis-backed cache</span><br/>' +
              '<span style="color: var(--text-dim);">TTL: 24h</span>'
      },
      {
        title: 'outbox',
        body: '<span style="color: var(--color-cloud);">PK</span> id BIGSERIAL<br/>' +
              'aggregate_id UUID<br/>' +
              'event_type VARCHAR(100)<br/>' +
              'payload JSONB<br/>' +
              '<span style="color: var(--text-dim);">processed BOOL DEFAULT false</span>'
      }
    ],

    roadmap: [
      { tag: 'Q3\u201926', tagClass: 'q3',   text: 'Service mesh migration (Istio → Linkerd)',                       textClass: '' },
      { tag: 'Q3\u201926', tagClass: 'q3',   text: 'Payment Service split: Stripe + PayPal adapters',               textClass: '' },
      { tag: 'Q4\u201926', tagClass: 'q4',   text: 'Event sourcing for Order domain (Kafka log compaction)',        textClass: '' },
      { tag: 'Q4\u201926', tagClass: 'q4',   text: 'Multi-region active-active (us-east-1 + eu-west-1)',            textClass: '' },
      { tag: 'Debt',       tagClass: 'debt', text: 'User Service: migrate remaining REST endpoints to gRPC',       textClass: 'muted' },
      { tag: 'Debt',       tagClass: 'debt', text: 'Consolidate 3 monitoring dashboards into 1 unified Grafana view', textClass: 'muted' }
    ],

    glossary: [
      { term: 'ALB',         termClass: 'cyan',    def: 'Application Load Balancer, L7 routing' },
      { term: 'WAF',         termClass: 'cyan',    def: 'Web Application Firewall, OWASP rules' },
      { term: 'gRPC',        termClass: 'emerald', def: 'High-performance RPC over HTTP/2 + Protobuf' },
      { term: 'JWT',         termClass: 'emerald', def: 'JSON Web Token, stateless authentication' },
      { term: 'Kafka',       termClass: 'orange',  def: 'Distributed event streaming platform' },
      { term: 'WSS',         termClass: 'orange',  def: 'WebSocket Secure, real-time bidirectional' },
      { term: 'PITR',        termClass: 'violet',  def: 'Point-In-Time Recovery, DB backup strategy' },
      { term: 'Multi-AZ',    termClass: 'violet',  def: 'Multi Availability Zone, HA deployment' },
      { term: 'ECR',         termClass: 'amber',   def: 'Elastic Container Registry, Docker images' },
      { term: 'ECS',         termClass: 'amber',   def: 'Elastic Container Service, container orchestration' },
      { term: 'mTLS',        termClass: 'rose',    def: 'Mutual TLS, bidirectional certificate verification' },
      { term: 'OIDC',        termClass: 'rose',    def: 'OpenID Connect, identity layer on OAuth2' },
      { term: 'RPO',         termClass: '',        def: 'Recovery Point Objective, max data loss' },
      { term: 'RTO',         termClass: '',        def: 'Recovery Time Objective, max downtime' },
      { term: 'SLA',         termClass: '',        def: 'Service Level Agreement, availability target' },
      { term: 'MTTR',        termClass: '',        def: 'Mean Time To Recovery, avg incident duration' },
      { term: 'SPIFFE',      termClass: 'rose',    def: 'Secure Production Identity Framework for Everyone (workload identity)' }
    ]
  };
})();
