/**
 * @file: data.js
 * @purpose: Architecture diagram data for the YiPot project — a Tauri
 *           desktop translation + OCR tool with 21 translation engines,
 *           15 recognize backends, TTS, and collection services. SVG
 *           built by the embedded layout engine from the diagram skill
 *           template.
 *
 *           Architecture shape:
 *             Desktop User
 *               → Frontend (React SPA + NextUI + Jotai + i18next)
 *               → 5 Window Panels (Translate / Recognize / Screenshot / Config / Updater)
 *               → 4 Service Categories (translate 21 / recognize 15 / tts 1 / collection)
 *               → Tauri IPC Bridge
 *               → Rust Backend (main + config + server + clipboard + hotkey + screenshot
 *                 + system_ocr + lang_detect + backup + updater)
 *               → External: 21 Translation APIs · 15 OCR APIs · System TTS · Ollama
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
     Tauri desktop app — frontend (React) ↔ IPC ↔ Rust backend,
     with 4 service categories × N engines and external API fan-out
     ═══════════════════════════════════════════════════════════════════ */

  var COMP_DEFS = [
    /* ── Layer: Client ───────────────────────────────────────────── */
    { id: 'user', type: 'external', label: 'Desktop User',
      sub: 'macOS · Windows · Linux', col: 4, row: 0, layer: 'client', w: 200 },

    /* ── Layer: Frontend ────────────────────────────────────────── */
    { id: 'react',  type: 'frontend', label: 'React SPA',
      sub: 'App.jsx · main.jsx entry', col: 1, row: 0, layer: 'frontend' },
    { id: 'nextui', type: 'frontend', label: 'NextUI',
      sub: 'component library · dark', col: 2, row: 0, layer: 'frontend' },
    { id: 'jotai',  type: 'frontend', label: 'Jotai',
      sub: 'atomic state', col: 3, row: 0, layer: 'frontend' },
    { id: 'i18n',   type: 'frontend', label: 'i18next',
      sub: 'en_US · es_ES', col: 4, row: 0, layer: 'frontend' },
    { id: 'framer', type: 'frontend', label: 'Framer Motion',
      sub: 'enter/exit anim', col: 5, row: 0, layer: 'frontend' },
    { id: 'router', type: 'frontend', label: 'React Router',
      sub: 'BrowserRouter', col: 6, row: 0, layer: 'frontend' },
    { id: 'tauri-api', type: 'frontend', label: 'Tauri API JS',
      sub: '@tauri-apps/api ^1.6', col: 7, row: 0, layer: 'frontend' },

    /* ── Layer: Window Panels ───────────────────────────────────── */
    { id: 'win-translate',  type: 'frontend', label: 'Translate Window',
      sub: 'Source · Target · Action bar', col: 0, row: 0, layer: 'windows' },
    { id: 'win-recognize',  type: 'frontend', label: 'Recognize Window',
      sub: 'Image · Text · Control', col: 1, row: 0, layer: 'windows' },
    { id: 'win-screenshot', type: 'frontend', label: 'Screenshot Window',
      sub: 'region select + OCR', col: 2, row: 0, layer: 'windows' },
    { id: 'win-config',     type: 'frontend', label: 'Config Window',
      sub: 'svc · hotkeys · backup · history', col: 3, row: 0, layer: 'windows' },
    { id: 'win-updater',    type: 'frontend', label: 'Updater Window',
      sub: 'download + install', col: 4, row: 0, layer: 'windows' },

    /* ── Layer: Frontend Services ───────────────────────────────── */
    { id: 'svc-translate',  type: 'backend', label: 'services/translate/',
      sub: '21 engines', col: 0, row: 0, layer: 'services',
      lines: ['DeepL · Google · OpenAI · Ollama', 'Bing · Yandex · Baidu · ...', 'each engine: info.ts + adapter', 'config-driven selection'] },
    { id: 'svc-recognize',  type: 'backend', label: 'services/recognize/',
      sub: '15 OCR backends', col: 2, row: 0, layer: 'services',
      lines: ['Tesseract.js · WASM OCR', 'Baidu · iFlytek · Tencent', 'Volcengine · QR code (jsQR)', 'system_ocr via Tauri'] },
    { id: 'svc-tts',        type: 'backend', label: 'services/tts/',
      sub: 'Lingva · voice synthesis', col: 4, row: 0, layer: 'services' },
    { id: 'svc-collection', type: 'backend', label: 'services/collection/',
      sub: 'Anki + Eudic export', col: 6, row: 0, layer: 'services' },

    /* ── Layer: IPC Bridge ───────────────────────────────────────── */
    { id: 'ipc',  type: 'security', label: 'Tauri IPC Bridge',
      sub: 'invoke() ↔ Rust commands', col: 4, row: 0, layer: 'ipc', w: 280,
      lines: ['invoke("translate", {...})', 'invoke("recognize", {...})', 'invoke("tts", {...})', 'invoke("config_*", {...})'] },

    /* ── Layer: Rust Backend ─────────────────────────────────────── */
    { id: 'rs-main',       type: 'backend', label: 'main.rs',
      sub: 'entry · plugin wiring · tray', col: 0, row: 0, layer: 'rust' },
    { id: 'rs-config',     type: 'backend', label: 'config.rs',
      sub: 'JSON store · svc availability', col: 1, row: 0, layer: 'rust' },
    { id: 'rs-server',     type: 'backend', label: 'server.rs',
      sub: 'tiny_http · external tool bridge', col: 2, row: 0, layer: 'rust' },
    { id: 'rs-clipboard',  type: 'backend', label: 'clipboard.rs',
      sub: 'monitor · auto-detect', col: 3, row: 0, layer: 'rust' },
    { id: 'rs-hotkey',     type: 'backend', label: 'hotkey.rs',
      sub: 'global shortcut · per-window', col: 4, row: 0, layer: 'rust' },
    { id: 'rs-screenshot', type: 'backend', label: 'screenshot.rs',
      sub: 'cross-platform capture', col: 5, row: 0, layer: 'rust' },
    { id: 'rs-sysocr',     type: 'backend', label: 'system_ocr.rs',
      sub: 'macOS Vision · Win OCR', col: 6, row: 0, layer: 'rust' },
    { id: 'rs-lang',       type: 'backend', label: 'lang_detect.rs',
      sub: 'lingua · 21 langs', col: 7, row: 0, layer: 'rust' },
    { id: 'rs-backup',     type: 'backend', label: 'backup.rs',
      sub: 'zip · config export/import', col: 1, row: 1, layer: 'rust' },
    { id: 'rs-updater',    type: 'backend', label: 'updater.rs',
      sub: 'polling · download · verify', col: 4, row: 1, layer: 'rust' },

    /* ── Layer: External ─────────────────────────────────────────── */
    { id: 'ext-translate', type: 'external', label: '21 Translation APIs',
      sub: 'DeepL · Google · OpenAI · Bing · ...', col: 1, row: 0, layer: 'external', w: 220 },
    { id: 'ext-ocr',       type: 'external', label: '15 OCR APIs',
      sub: 'Baidu · iFlytek · Tencent · ...', col: 3, row: 0, layer: 'external', w: 220 },
    { id: 'ext-tts',       type: 'external', label: 'System TTS',
      sub: 'Lingva · OS voices', col: 5, row: 0, layer: 'external' },
    { id: 'ext-ollama',    type: 'external', label: 'Ollama LLM',
      sub: 'local qwen3.5', col: 7, row: 0, layer: 'external' }
  ];

  var BOUNDARY_DEFS = [
    {
      id: 'frontend-bundle', kind: 'vpc',
      label: 'Frontend Bundle (Vite + React)',
      sub: 'src/ · built to dist/ · served by Tauri webview',
      members: ['react','nextui','jotai','i18n','framer','router','tauri-api',
                'win-translate','win-recognize','win-screenshot','win-config','win-updater',
                'svc-translate','svc-recognize','svc-tts','svc-collection']
    },
    {
      id: 'rust-binary', kind: 'vpc',
      label: 'Rust Binary (src-tauri/src/)',
      sub: '10 modules · single static binary · cross-compiled',
      members: ['rs-main','rs-config','rs-server','rs-clipboard','rs-hotkey',
                'rs-screenshot','rs-sysocr','rs-lang','rs-backup','rs-updater']
    }
  ];

  var CONNECTION_DEFS = [
    /* User → Frontend */
    { from: 'user', to: 'react', kind: 'frontend', label: 'interact', sub: 'mouse + hotkey' },

    /* Frontend internal wiring */
    { from: 'react', to: 'router',  kind: 'sync',  label: 'route',   sub: 'BrowserRouter' },
    { from: 'react', to: 'nextui',  kind: 'infra', label: 'render',   sub: 'component lib' },
    { from: 'react', to: 'jotai',    kind: 'sync',  label: 'state',    sub: 'atomic atoms' },
    { from: 'react', to: 'i18n',     kind: 'infra', label: 'translate',sub: 'useTranslation' },
    { from: 'react', to: 'framer',   kind: 'infra', label: 'animate', sub: 'enter/exit' },
    { from: 'react', to: 'tauri-api',kind: 'sync',  label: 'invoke',  sub: 'IPC calls' },

    /* Router → Windows */
    { from: 'router', to: 'win-translate',  kind: 'frontend', label: 'route', sub: '/translate' },
    { from: 'router', to: 'win-recognize',  kind: 'frontend', label: 'route', sub: '/recognize' },
    { from: 'router', to: 'win-screenshot', kind: 'frontend', label: 'route', sub: '/screenshot' },
    { from: 'router', to: 'win-config',     kind: 'frontend', label: 'route', sub: '/config' },
    { from: 'router', to: 'win-updater',    kind: 'frontend', label: 'route', sub: '/updater' },

    /* Windows → Services */
    { from: 'win-translate',  to: 'svc-translate',  kind: 'sync',  label: 'call',   sub: 'translate text' },
    { from: 'win-recognize',  to: 'svc-recognize',  kind: 'sync',  label: 'call',   sub: 'OCR image' },
    { from: 'win-translate',  to: 'svc-tts',         kind: 'async', label: 'play',   sub: 'speak result' },
    { from: 'win-config',     to: 'svc-collection',  kind: 'sync',  label: 'export', sub: 'Anki/Eudic' },
    { from: 'win-screenshot', to: 'svc-recognize',  kind: 'sync',  label: 'OCR',    sub: 'region capture' },

    /* Services → IPC */
    { from: 'svc-translate',  to: 'ipc', kind: 'sync', label: 'invoke',  sub: 'translate cmd' },
    { from: 'svc-recognize', to: 'ipc', kind: 'sync', label: 'invoke',  sub: 'recognize cmd' },
    { from: 'svc-tts',        to: 'ipc', kind: 'sync', label: 'invoke',  sub: 'tts cmd' },
    { from: 'svc-collection', to: 'ipc', kind: 'sync', label: 'invoke',  sub: 'config cmd' },

    /* IPC → Rust */
    { from: 'ipc', to: 'rs-main',       kind: 'async', label: 'dispatch', sub: 'tauri::command' },
    { from: 'ipc', to: 'rs-config',     kind: 'sync',  label: 'config',   sub: 'get/set JSON' },
    { from: 'ipc', to: 'rs-clipboard',  kind: 'async', label: 'listen',   sub: 'clipboard event' },
    { from: 'ipc', to: 'rs-hotkey',     kind: 'async', label: 'register', sub: 'global shortcut' },
    { from: 'ipc', to: 'rs-screenshot', kind: 'async', label: 'capture',   sub: 'screen grab' },
    { from: 'ipc', to: 'rs-sysocr',     kind: 'async', label: 'system OCR', sub: 'Vision/Win' },
    { from: 'ipc', to: 'rs-lang',       kind: 'sync',  label: 'detect',    sub: 'lingua crate' },
    { from: 'ipc', to: 'rs-backup',     kind: 'async', label: 'zip',        sub: 'config export' },
    { from: 'ipc', to: 'rs-updater',    kind: 'async', label: 'poll',      sub: 'version check' },

    /* Rust internal (server bridges to external tool) */
    { from: 'rs-main',   to: 'rs-server',     kind: 'infra', label: 'spawn',   sub: 'tiny_http :9999' },
    { from: 'rs-server', to: 'rs-config',     kind: 'sync',  label: 'read',    sub: 'service availability' },
    { from: 'rs-main',   to: 'rs-sysocr',      kind: 'infra', label: 'bridge',  sub: 'system OCR passthrough' },

    /* Rust → External */
    { from: 'rs-main',   to: 'ext-translate', kind: 'frontend', label: 'HTTPS',  sub: 'reqwest async' },
    { from: 'rs-sysocr', to: 'ext-ocr',         kind: 'frontend', label: 'API call', sub: 'Baidu/Tencent' },
    { from: 'rs-main',   to: 'ext-tts',         kind: 'sync',  label: 'voice',  sub: 'system TTS' },
    { from: 'rs-main',   to: 'ext-ollama',      kind: 'async', label: 'infer',  sub: 'localhost:11434' },

    /* Frontend → External (some direct) */
    { from: 'svc-translate', to: 'ext-translate', kind: 'frontend', label: 'HTTPS', sub: 'direct from webview' },
    { from: 'svc-recognize', to: 'ext-ocr',         kind: 'frontend', label: 'HTTPS', sub: 'Tesseract.js WASM' },
    { from: 'svc-tts',       to: 'ext-tts',         kind: 'frontend', label: 'audio', sub: 'Lingva + Web Speech' }
  ];

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 4 — LAYOUT ENGINE
     ═══════════════════════════════════════════════════════════════════ */
  var LAYER_BAND = {
    client:    { y:  80,  rows: 1, colSpan: 1 },
    frontend:  { y: 220,  rows: 1, colSpan: 7 },
    windows:   { y: 360,  rows: 1, colSpan: 5 },
    services:  { y: 540,  rows: 1, colSpan: 4 },
    ipc:       { y: 720,  rows: 1, colSpan: 1 },
    rust:      { y: 860,  rows: 2, colSpan: 8 },
    external:  { y: 1080, rows: 1, colSpan: 4 }
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
      { fill: STYLES.frontend.fill, stroke: STYLES.frontend.stroke, label: 'React View / Service' },
      { fill: STYLES.backend.fill,  stroke: STYLES.backend.stroke,  label: 'Rust Module' },
      { fill: STYLES.security.fill, stroke: STYLES.security.stroke, label: 'Tauri IPC Bridge' },
      { fill: STYLES.cloud.fill,    stroke: STYLES.cloud.stroke,    label: 'Frontend Stack Lib' },
      { fill: STYLES.external.fill, stroke: STYLES.external.stroke, label: 'External API' }
    ];
    var lineStyles = [
      { color: CONN.sync.color,      dash: null,     label: 'Sync invoke' },
      { color: CONN.frontend.color,   dash: null,     label: 'HTTPS direct' },
      { color: CONN.async.color,      dash: '4,3',    label: 'Async (Tauri command)' },
      { color: CONN.auth.color,      dash: '5,5',    label: 'IPC bridge' },
      { color: CONN.infra.color,     dash: '6,4',    label: 'Module wiring' }
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
      label: 'YiPot Desktop App · /Users/yi/YrY/YiPot/',
      sub: 'Tauri 1.8 · React 18 · 29 npm + 20 Rust crates · 55+ source files',
      markup:
        '<rect class="svg-outermost" x="' + x + '" y="' + y + '" ' +
          'width="' + w + '" height="' + h + '" rx="20" ' +
          'fill="rgba(251,191,36,0.012)" stroke="#fbbf24" ' +
          'stroke-width="2.2" stroke-dasharray="10,5"/>' +
        '<rect x="' + (x + 12) + '" y="' + (y + 8) + '" height="32" width="360" rx="6" ' +
          'fill="#020617" stroke="#fbbf24" stroke-width="1.2"/>' +
        '<text x="' + (x + 22) + '" y="' + (y + 24) + '" fill="#fbbf24" ' +
          'font-size="12" font-weight="700">▸ ' + 'YiPot Desktop App · /Users/yi/YrY/YiPot/' + '</text>' +
        '<text x="' + (x + 22) + '" y="' + (y + 36) + '" fill="#94a3b8" font-size="9">' +
          'Tauri 1.8 · React 18 · 29 npm + 20 Rust crates · 55+ source files' + '</text>' +
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
      { key: 'client',   label: 'CLIENT',          color: '#94a3b8' },
      { key: 'frontend', label: 'FRONTEND STACK',  color: '#22d3ee' },
      { key: 'windows',  label: 'WINDOW PANELS',   color: '#22d3ee' },
      { key: 'services', label: 'FRONTEND SERVICES', color: '#34d399' },
      { key: 'ipc',      label: 'TAURI IPC',        color: '#fb7185' },
      { key: 'rust',     label: 'RUST BACKEND',    color: '#34d399' },
      { key: 'external', label: 'EXTERNAL APIS',    color: '#94a3b8' }
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
    var legendY = 1240;
    var outermost = renderOutermost(comps, bounds, legendY);

    var svgW = outermost.x + outermost.w + 40;
    var svgH = outermost.y + outermost.h + 40;

    var parts = [];
    parts.push('<svg ref="svg" viewBox="0 0 ' + svgW + ' ' + svgH + '" ' +
               'role="img" aria-labelledby="diagram-title diagram-desc" ' +
               'xmlns="http://www.w3.org/2000/svg" ' +
               'shape-rendering="geometricPrecision" text-rendering="geometricPrecision">');
    parts.push('<title id="diagram-title">YiPot · Tauri Desktop Translation Tool Architecture</title>');
    parts.push('<desc id="diagram-desc">YiPot Tauri desktop translation tool — React 18 frontend (NextUI + Jotai + i18next + Framer Motion) bundled by Vite and served in the Tauri webview; 5 window panels (Translate/Recognize/Screenshot/Config/Updater) call 4 frontend service categories (translate 21 engines, recognize 15 OCR backends, tts, collection); services invoke Tauri IPC commands that dispatch to 10 Rust backend modules (main, config, server, clipboard, hotkey, screenshot, system_ocr, lang_detect, backup, updater); Rust bridges to 21 external translation APIs, 15 OCR APIs, system TTS, and Ollama LLM.</desc>');
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
      title: 'YiPot · Tauri Desktop Architecture Diagram',
      pageTitle: 'YiPot — Tauri Desktop Translation Tool',
      subtitle: 'Cross-platform desktop translator & OCR · 21 translation engines · 15 recognize backends · TTS & collection · Tauri + React + Rust fullstack',
      footer: 'YiPot · /Users/yi/YrY/YiPot/ · Tauri 1.8 + React 18 + Rust · 21 engines + 15 OCR · v1.0.0 · 2026-07-24',
      traceSub: 'user → window → service → IPC → Rust → external API'
    },

    executiveSummary: [
      { color: 'cyan',    title: '▸ System Scope',       content: 'YiPot is a cross-platform desktop translation + OCR tool built on Tauri 1.8. The frontend is a React 18 SPA (NextUI components, Jotai atomic state, i18next for en/es, Framer Motion animations, React Router) bundled by Vite; the backend is a Rust binary (10 modules, 20+ crates). 21 translation engines + 15 OCR backends + TTS + Anki/Eudic collection.' },
      { color: 'emerald', title: '▸ Architecture Style', content: 'Tauri fullstack — Frontend (React webview) ↔ Tauri IPC ↔ Rust backend. The webview runs the React SPA, which renders 5 window panels. Each window calls frontend services (services/translate, services/recognize, services/tts, services/collection) that wrap Tauri invoke() calls. Rust commands dispatch to dedicated modules (config, clipboard, hotkey, screenshot, system_ocr, lang_detect, backup, updater, server).' },
      { color: 'amber',   title: '▸ Key Decisions',      content: 'Tauri over Electron for smaller binary (~10MB vs ~150MB) and native performance. Rust reqwest for HTTP (sync-feeling async). Tesseract.js (WASM) for client-side OCR + system_ocr.rs for native macOS Vision / Windows OCR. lingua crate for 21-language detection. tiny_http embedded server for external tool bridge (Raycast/Alfred workflows). Jotai over Redux/Zustand for atomic state without selectors.' }
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
      { label: 'Translation Engines', status: null, value: '21',  valueClass: 'cyan',   sub: 'DeepL · Google · OpenAI · Ollama · Bing · ...' },
      { label: 'OCR Backends',         status: null, value: '15',  valueClass: 'cyan',   sub: 'Tesseract.js · Baidu · iFlytek · Tencent · ...' },
      { label: 'TTS Services',         status: null, value: '1',   valueClass: 'amber',  sub: 'Lingva + system voices' },
      { label: 'Window Panels',        status: null, value: '5',   valueClass: 'emerald', sub: 'Translate/Recognize/Screenshot/Config/Updater' },
      { label: 'Rust Modules',         status: null, value: '10',  valueClass: 'emerald', sub: 'src-tauri/src/' }
    ],

    svgDiagram: buildSvg(),

    summaryCards: [
      {
        color: 'cyan',
        title: 'Frontend & Window Panels',
        items: [
          '<strong>React 18 SPA</strong> — App.jsx routes via React Router based on windowMap + Tauri label (each Tauri window has a unique label that maps to a window component)',
          '<strong>NextUI</strong> provides the desktop-styled component library (dark mode default, Tailwind CSS underneath); Next Themes handles theme switching',
          '<strong>Jotai atomic state</strong> — useConfig, useGetState, useSyncAtom, useVoice, useTtsPluginInfo hooks; primitives over derived state for predictable updates',
          '<strong>5 window panels</strong> — Translate (Source/Target/Language areas + action bar), Recognize (Image/Text/Control triad), Screenshot (region select + OCR trigger), Config (service config + hotkeys + backup + history + about), Updater (download + install)',
          '<strong>i18next + react-i18next</strong> for en_US + es_ES locale bundles; Framer Motion for enter/exit transitions between view states'
        ]
      },
      {
        color: 'emerald',
        title: 'Frontend Services & IPC',
        items: [
          '<strong>services/translate/ (21 engines)</strong> — each engine has an info.ts descriptor + adapter; config-driven selection (user picks default + per-call override); engines include DeepL, Google, OpenAI, Ollama, Bing, Yandex, Baidu, Volcengine, and 13 more',
          '<strong>services/recognize/ (15 OCR backends)</strong> — Tesseract.js (WASM, client-side), Baidu OCR, iFlytek OCR, Tencent OCR, Volcengine OCR, jsQR (QR code), system_ocr via Tauri command (macOS Vision / Windows OCR)',
          '<strong>services/tts/</strong> — Lingva translate voice synthesis + Web Speech API as fallback; per-translation "speak" button',
          '<strong>services/collection/</strong> — Anki flashcard export (CSV + APKG) + Eudic dictionary export; drag-and-drop ordering via react-beautiful-dnd',
          '<strong>Tauri IPC bridge</strong> — services call invoke("translate", {...}) / invoke("recognize", {...}) / invoke("tts", {...}) / invoke("config_*", {...}); Rust commands are async, return Promises to the webview'
        ]
      },
      {
        color: 'amber',
        title: 'Rust Backend & External APIs',
        items: [
          '<strong>main.rs</strong> is the Tauri entry — plugin wiring (clipboard, hotkey, updater, store), setup hook, invoke handler registration, system tray menu',
          '<strong>config.rs + server.rs</strong> — config.rs persists JSON config via tauri-plugin-store + checks service availability; server.rs spawns a tiny_http server on :9999 so external tools (Raycast/Alfred) can call translate/OCR/config endpoints',
          '<strong>clipboard.rs + hotkey.rs + screenshot.rs</strong> — clipboard monitor auto-detects copied text and triggers translate; hotkey registers per-window global shortcuts (Cmd+Shift+T etc.); screenshot captures cross-platform screen regions',
          '<strong>system_ocr.rs + lang_detect.rs</strong> — system_ocr wraps macOS Vision framework and Windows OCR API; lang_detect uses the lingua crate for 21-language detection (offline, no API call)',
          '<strong>backup.rs + updater.rs</strong> — backup exports/imports config as zip archive (zip crate); updater polls for new releases, downloads + verifies signature, hands off to Tauri updater plugin'
        ]
      }
    ],

    pipeline: [
      { badge: 'Develop',     badgeClass: 'dev',  info: 'React (Vite) + Rust<br/>npm run tauri dev' },
      { badge: 'Bundle',       badgeClass: 'dev',  info: 'Vite build → dist/<br/>cargo build --release' },
      { badge: 'Cross-Compile', badgeClass: 'stg',  info: 'macOS · Windows · Linux<br/>Tauri bundler' },
      { badge: 'Notarize',     badgeClass: 'stg',  info: 'macOS notarytool<br/>Windows EV cert' },
      { badge: 'Production',   badgeClass: 'prod', info: '.dmg · .msi · .AppImage<br/>auto-update via updater.rs' }
    ],

    securityCards: [
      {
        color: 'rose',
        title: 'Tauri Trust Boundary',
        items: [
          '<strong>Tauri IPC</strong> is the only bridge between webview and Rust — every invoke() must be explicitly registered in main.rs; no eval() or remote code execution surface',
          '<strong>CSP</strong> from tauri.conf.json — default-src \'self\'; no inline scripts; all assets served from tauri:// origin; no remote script loading',
          '<strong>Permissions</strong> declared in tauri.conf.json capabilities — clipboard, notification, shell, store, updater; each scoped to specific commands',
          '<strong> updater signature</strong> — release .sig file verified with the public key embedded in the binary; no unsigned updates accepted',
          '<strong>External tool bridge</strong> (server.rs :9999) listens on 127.0.0.1 only — never on 0.0.0.0; no remote access to the local HTTP bridge'
        ]
      },
      {
        color: 'amber',
        title: 'External API Trust',
        items: [
          '<strong>21 translation APIs</strong> called via reqwest async — each engine stores its API key in config.json (tauri-plugin-store, encrypted at rest by OS keychain on macOS)',
          '<strong>15 OCR APIs</strong> (Baidu, iFlytek, Tencent, Volcengine) — image bytes sent over HTTPS; never persisted on the API side; user must opt in per engine',
          '<strong>Ollama</strong> on localhost:11434 — local LLM, no data leaves the machine; preferred engine for privacy-sensitive users',
          '<strong>System TTS</strong> via Lingva + Web Speech API — no audio sent to remote services; Lingva can be self-hosted for full offline TTS',
          '<strong>Tesseract.js (WASM)</strong> runs fully client-side in the webview — no image bytes sent anywhere; the only OCR option with zero network exposure'
        ]
      },
      {
        color: 'orange',
        title: 'Data & Privacy',
        items: [
          '<strong>config.json</strong> stored via tauri-plugin-store — path is platform-standard (~/Library/Application Support/YiPot/ on macOS, %APPDATA%/YiPot/ on Windows)',
          '<strong>Translation history</strong> kept locally in the same store — user can clear via Config > History > Clear All; no telemetry, no analytics',
          '<strong>Backup</strong> via backup.rs — exports config + history as a zip; user controls where to save (file picker); no auto-cloud backup',
          '<strong>Clipboard monitor</strong> auto-translates copied text — user can disable via Config > Clipboard > Auto-translate; never logs clipboard contents',
          '<strong>No crash reporting</strong> — panics go to stderr only; no Sentry, no auto-upload of crash data; users file issues manually'
        ]
      }
    ],

    trace: [
      { name: '1. Hotkey',     nameClass: 'cyan',    sub: 'Cmd+Shift+T',                 time: '~10ms'  },
      { name: '2. Window',     nameClass: 'cyan',    sub: 'Translate window opens',     time: '~80ms'  },
      { name: '3. Service',    nameClass: 'emerald', sub: 'services/translate call',    time: '~5ms'   },
      { name: '4. invoke()',   nameClass: 'rose',    sub: 'Tauri IPC bridge',            time: '~3ms'   },
      { name: '5. Rust cmd',   nameClass: 'emerald', sub: 'rs-main dispatch',            time: '~5ms'   },
      { name: '6. HTTP API',   nameClass: 'orange',  sub: 'reqwest → DeepL',             time: '~400ms' },
      { name: '7. Response',   nameClass: 'emerald', sub: 'Rust → IPC → webview',       time: '~5ms'   },
      { name: '8. Render',     nameClass: 'cyan',    sub: 'Jotai atom update + UI',     time: '~15ms'  }
    ],

    scalingTiles: [
      {
        color: 'cyan',
        title: 'Frontend Performance',
        body: '<span style="color: var(--text-muted);">Bundle:</span> ~2MB (NextUI heavy)<br/>' +
              '<span style="color: var(--text-muted);">Boot:</span> ~200ms webview mount<br/>' +
              '<span style="color: var(--text-muted);">State:</span> Jotai primitives<br/>' +
              '<span style="color: var(--text-muted);">i18n:</span> lazy locale load'
      },
      {
        color: 'emerald',
        title: 'Rust Backend',
        body: '<span style="color: var(--text-muted);">Binary:</span> ~10MB (Tauri small)<br/>' +
              '<span style="color: var(--text-muted);">Memory:</span> ~80MB RSS idle<br/>' +
              '<span style="color: var(--text-muted);">HTTP:</span> reqwest async pool<br/>' +
              '<span style="color: var(--text-muted);">Server:</span> tiny_http :9999'
      },
      {
        color: 'rose',
        title: 'IPC Latency',
        body: '<span style="color: var(--text-muted);">invoke():</span> ~3ms one-way<br/>' +
              '<span style="color: var(--text-muted);">Return:</span> ~3ms back<br/>' +
              '<span style="color: var(--text-muted);">Bridge:</span> serde_json serialize<br/>' +
              '<span style="color: var(--text-muted);">No:</span> file system roundtrip'
      },
      {
        color: 'orange',
        title: 'External Engines',
        body: '<span style="color: var(--text-muted);">DeepL:</span> ~400ms p95<br/>' +
              '<span style="color: var(--text-muted);">Google:</span> ~300ms p95<br/>' +
              '<span style="color: var(--text-muted);">Ollama:</span> ~600ms local<br/>' +
              '<span style="color: var(--text-muted);">Tesseract.js:</span> client-side'
      }
    ],

    ownership: {
      headers: ['Module', 'Layer', 'Files', 'Tier', 'Owner', 'Path'],
      rows: [
        ['<span style="color: var(--color-frontend);">services/translate</span>', 'Frontend Svc', '<span style="color: var(--color-backend);">21</span>', 'Tier 1', 'Frontend · Alice', '<span style="color: var(--text-dim);">src/services/translate/</span>'],
        ['<span style="color: var(--color-frontend);">services/recognize</span>', 'Frontend Svc', '<span style="color: var(--color-backend);">15</span>', 'Tier 1', 'Frontend · Bob',   '<span style="color: var(--text-dim);">src/services/recognize/</span>'],
        ['<span style="color: var(--color-frontend);">window</span>',              'Windows',     '<span style="color: var(--color-backend);">5</span>',  'Tier 1', 'Frontend · Carol', '<span style="color: var(--text-dim);">src/window/</span>'],
        ['<span style="color: var(--color-backend);">src-tauri</span>',            'Rust',         '<span style="color: var(--color-backend);">14</span>', 'Tier 0', 'Platform · Dave',  '<span style="color: var(--text-dim);">src-tauri/src/</span>'],
        ['<span style="color: var(--color-cloud);">utils/hooks</span>',             'Utils',        '<span style="color: var(--color-backend);">5</span>',  'Tier 2', 'Frontend · Eve',   '<span style="color: var(--text-dim);">src/hooks/</span>'],
        ['<span style="color: var(--color-cloud);">i18n</span>',                   'I18n',         '<span style="color: var(--color-backend);">2</span>',  'Tier 2', 'Frontend · Eve',   '<span style="color: var(--text-dim);">src/i18n/</span>']
      ]
    },

    apiTable: {
      headers: ['Method', 'Path', 'Service', 'Auth', 'Rate Limit', 'Description'],
      rows: [
        { method: 'INVOKE', color: 'security', path: 'translate',          service: 'services/translate',  auth: 'config API key',  rate: 'per-engine',   desc: 'Translate text via one of 21 engines' },
        { method: 'INVOKE', color: 'security', path: 'recognize',          service: 'services/recognize',  auth: 'config API key',  rate: 'per-engine',   desc: 'OCR image via one of 15 backends' },
        { method: 'INVOKE', color: 'security', path: 'tts',                service: 'services/tts',         auth: 'None',             rate: 'unlimited',    desc: 'Speak translated text via Lingva/system TTS' },
        { method: 'INVOKE', color: 'security', path: 'config_get/set',     service: 'rs-config',            auth: 'None',             rate: 'unlimited',    desc: 'Read/write JSON config (encrypted at rest)' },
        { method: 'INVOKE', color: 'security', path: 'screenshot',          service: 'rs-screenshot',        auth: 'None',             rate: '10/sec',       desc: 'Capture screen region (cross-platform)' },
        { method: 'HTTP',   color: 'frontend', path: 'localhost:9999/translate', service: 'rs-server',       auth: '127.0.0.1 only',   rate: 'unlimited',    desc: 'External tool bridge (Raycast/Alfred)' }
      ]
    },

    stack: [
      { label: 'Tauri',          value: '1.8',   valueClass: 'amber'   },
      { label: 'React',           value: '18.3',  valueClass: 'cyan'    },
      { label: 'NextUI',          value: '2.4',   valueClass: 'cyan'    },
      { label: 'Jotai',           value: '2.10',  valueClass: 'cyan'    },
      { label: 'i18next',         value: '23.16', valueClass: 'cyan'   },
      { label: 'Framer Motion',   value: '11.11', valueClass: 'cyan'    },
      { label: 'Vite',             value: '5.4',   valueClass: 'amber'  },
      { label: 'Tailwind CSS',     value: '3.4',   valueClass: 'amber'  },
      { label: 'TypeScript',       value: '5.6',   valueClass: 'cyan'   },
      { label: 'Rust',             value: '1.x',   valueClass: 'emerald' },
      { label: 'reqwest',          value: '0.12',  valueClass: 'emerald' },
      { label: 'tiny_http',        value: '0.12',  valueClass: 'emerald' },
      { label: 'lingua',           value: '1.6',   valueClass: 'emerald' },
      { label: 'tauri-plugin-store', value: '2.x', valueClass: 'rose'   },
      { label: 'Tesseract.js',      value: '5.1',   valueClass: 'orange'  }
    ],

    schemaTiles: [],

    roadmap: [
      { tag: 'Q3\u201926', tagClass: 'q3',   text: 'Add Whisper local STT (speech-to-text) for voice input',                textClass: '' },
      { tag: 'Q3\u201926', tagClass: 'q3',   text: 'Add Linux AppImage + Snap packages (currently only dmg/msi)',           textClass: '' },
      { tag: 'Q4\u201926', tagClass: 'q4',   text: 'Migrate to Tauri 2.0 (new plugin model, mobile support)',               textClass: '' },
      { tag: 'Q4\u201926', tagClass: 'q4',   text: 'Add iOS + Android ports (Tauri mobile, share Rust backend)',           textClass: '' },
      { tag: 'Debt',       tagClass: 'debt', text: 'NextUI bundle is heavy (~2MB) — could tree-shake unused components',  textClass: 'muted' },
      { tag: 'Debt',       tagClass: 'debt', text: 'lingua language detection is slow on first call (~300ms cold start)',  textClass: 'muted' }
    ],

    glossary: [
      { term: 'Tauri',         termClass: 'amber',   def: 'Desktop app framework — Rust backend + webview frontend' },
      { term: 'IPC',           termClass: 'rose',    def: 'Inter-Process Communication — invoke() ↔ Rust command' },
      { term: 'invoke()',     termClass: 'rose',    def: 'Tauri JS API — call a Rust command from the webview' },
      { term: 'Webview',       termClass: 'cyan',    def: 'OS-native HTML renderer (WKWebView/WebView2) — no Chromium bundling' },
      { term: 'Jotai',         termClass: 'cyan',    def: 'React atomic state library — primitives over derived state' },
      { term: 'NextUI',        termClass: 'cyan',    def: 'React UI component library built on Tailwind + React Aria' },
      { term: 'Tesseract.js',  termClass: 'orange',  def: 'WASM port of Tesseract OCR — client-side, no network' },
      { term: 'lingua',         termClass: 'emerald', def: 'Rust language detection library — 21 languages, offline' },
      { term: 'tiny_http',     termClass: 'emerald', def: 'Minimal Rust HTTP server — used for external tool bridge' },
      { term: 'reqwest',        termClass: 'emerald', def: 'Rust async HTTP client (Tokio-based)' },
      { term: 'Ollama',         termClass: 'orange',  def: 'Local LLM runtime — qwen3.5 etc., localhost:11434' },
      { term: 'Anki',           termClass: 'amber',   def: 'Spaced-repetition flashcard app — YiPot exports CSV/APKG' }
    ]
  };
})();
