/* =========================================================================
   /YiPet/cdn/diagram/primitives.js
   -------------------------------------------------------------------------
   Shared SVG primitives for the rui-reports diagram engines:
     - .claude/skills/rui-reports/diagram/templates/data.js  (architecture)
     - .claude/shared/diagram/diagram.js                     (per-dep page)

   This module is the single source of truth for the visual language
   shared by every rui-report diagram. Both generators load it first
   (see their index.html) and consume its exports.

   Exports a single global: window.ruiDiagramPrimitives

   Contents
   --------
     PALETTE                — unified color tokens
                              { cyan, emerald, violet, amber,
                                rose, orange, slate, ops }
                              Each token has { fill, stroke, text }.

     Utilities              — esc, snap, clamp, r
                              esc   : XML-escape a string
                              snap  : snap a value to a grid multiple
                              clamp : clamp into [lo, hi]
                              r     : round to 2 decimals (compact SVG)

     renderMarkers()        — 7 arrow marker defs (10×8, refX=8)
     renderPatterns()       — grid + grid-major SVG patterns
     renderShadowFilters()  — drop-shadow filters (sm / md)
     renderTextSlot(opts)   — slot-based text element with textLength
     renderArrow(opts)      — straight line with marker + dash + width
     renderCornerBrackets() — 4-corner L-shape decoration
     markerForColor()       — color → marker name lookup
   ========================================================================= */
(function () {
  'use strict';

  /* ── PALETTE ──────────────────────────────────────────────────────
     Each token has matched fill (translucent background) and stroke
     (foreground). `text` is the foreground used for in-box text. */
  var PALETTE = {
    cyan:    { fill: 'rgba(8,51,68,0.45)',   stroke: '#22d3ee', text: '#22d3ee' },
    emerald: { fill: 'rgba(6,78,59,0.45)',   stroke: '#34d399', text: '#34d399' },
    violet:  { fill: 'rgba(76,29,149,0.45)', stroke: '#a78bfa', text: '#a78bfa' },
    amber:   { fill: 'rgba(120,53,15,0.35)', stroke: '#fbbf24', text: '#fbbf24' },
    rose:    { fill: 'rgba(136,19,55,0.45)', stroke: '#fb7185', text: '#fb7185' },
    orange:  { fill: 'rgba(251,146,60,0.35)',stroke: '#fb923c', text: '#fb923c' },
    slate:   { fill: 'rgba(30,41,59,0.55)',  stroke: '#94a3b8', text: '#94a3b8' },
    ops:     { fill: 'rgba(15,23,42,0.6)',   stroke: '#475569', text: '#94a3b8' }
  };

  /* ── UTILITIES ──────────────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function snap(v, grid) {
    grid = grid || 10;
    return Math.round(v / grid) * grid;
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function r(n) { return Math.round(n * 100) / 100; }

  /* ── MARKERS (7 colors, all 10×8 with refX=8) ───────────────────── */
  function renderMarkers() {
    return [
      '<marker id="arrow-cyan"    markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse"><polygon points="0 0, 10 4, 0 8" fill="#22d3ee"/></marker>',
      '<marker id="arrow-emerald" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse"><polygon points="0 0, 10 4, 0 8" fill="#34d399"/></marker>',
      '<marker id="arrow-violet"  markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse"><polygon points="0 0, 10 4, 0 8" fill="#a78bfa"/></marker>',
      '<marker id="arrow-amber"   markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse"><polygon points="0 0, 10 4, 0 8" fill="#fbbf24"/></marker>',
      '<marker id="arrow-rose"    markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse"><polygon points="0 0, 10 4, 0 8" fill="#fb7185"/></marker>',
      '<marker id="arrow-orange"  markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse"><polygon points="0 0, 10 4, 0 8" fill="#fb923c"/></marker>',
      '<marker id="arrow-slate"   markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse"><polygon points="0 0, 10 4, 0 8" fill="#94a3b8"/></marker>'
    ].join('');
  }

  /* ── PATTERNS (grid + grid-major) ───────────────────────────────── */
  function renderPatterns() {
    return [
      '<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">',
        '<path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.4" opacity="0.5"/>',
      '</pattern>',
      '<pattern id="grid-major" width="200" height="200" patternUnits="userSpaceOnUse">',
        '<path d="M 200 0 L 0 0 0 200" fill="none" stroke="#334155" stroke-width="0.6" opacity="0.45"/>',
      '</pattern>'
    ].join('');
  }

  /* ── SHADOW FILTERS ─────────────────────────────────────────────── */
  function renderShadowFilters() {
    return [
      '<filter id="shadow-sm" x="-20%" y="-20%" width="140%" height="140%">',
        '<feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000" flood-opacity="0.55"/>',
      '</filter>',
      '<filter id="shadow-md" x="-30%" y="-30%" width="160%" height="160%">',
        '<feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000" flood-opacity="0.55"/>',
      '</filter>'
    ].join('');
  }

  /* ── TEXT SLOT ────────────────────────────────────────────────────
     Render a <text> element with optional textLength fitting.
     Used by both generators for consistent text rendering.

     opts: {
       x, y, text,             // required
       fill,                   // default '#cbd5e1'
       size,                   // default 10
       weight,                 // default 400
       anchor,                 // default 'middle'
       textLength              // optional, enables spacingAndGlyphs
     } */
  function renderTextSlot(opts) {
    var fill   = opts.fill   || '#cbd5e1';
    var size   = opts.size   || 10;
    var weight = opts.weight || 400;
    var anchor = opts.anchor || 'middle';

    var attrs = [
      'x="' + opts.x + '"',
      'y="' + opts.y + '"',
      'fill="' + fill + '"',
      'font-size="' + size + '"',
      'text-anchor="' + anchor + '"'
    ];
    if (weight !== 400) attrs.push('font-weight="' + weight + '"');
    if (opts.textLength) attrs.push('textLength="' + opts.textLength + '" lengthAdjust="spacingAndGlyphs"');

    return '<text ' + attrs.join(' ') + '>' + esc(opts.text) + '</text>';
  }

  /* ── ARROW (line with marker) ─────────────────────────────────────
     Render a straight <line> with marker + optional dash.
     opts: { x1, y1, x2, y2, stroke, marker, dash, strokeWidth } */
  function renderArrow(opts) {
    var stroke = opts.stroke || '#94a3b8';
    var marker = opts.marker || markerForColor(stroke);
    var dash   = opts.dash   ? ' stroke-dasharray="' + opts.dash + '"' : '';
    var sw     = opts.strokeWidth || 2;
    return '<line x1="' + opts.x1 + '" y1="' + opts.y1 + '" ' +
           'x2="' + opts.x2 + '" y2="' + opts.y2 + '" ' +
           'stroke="' + stroke + '" stroke-width="' + sw + '" ' +
           'stroke-linecap="round" stroke-linejoin="round"' + dash + ' ' +
           'marker-end="url(#' + marker + ')"/>';
  }

  /* ── CORNER BRACKETS ──────────────────────────────────────────────
     Four L-shapes at the corners of a rect. Decorative frame
     markers that read as "section delimiters" — used on the
     outermost wireframe. */
  function renderCornerBrackets(x, y, w, h, color, sz) {
    sz   = sz   || 12;
    var gap = 6;
    var sw  = 2;
    color = color || '#fbbf24';
    return [
      /* top-left */
      '<path d="M ' + x + ' ' + (y + gap + sz) + ' L ' + x + ' ' + (y + gap) + ' L ' + (x + gap + sz) + ' ' + y + '" fill="none" stroke="' + color + '" stroke-width="' + sw + '"/>',
      /* top-right */
      '<path d="M ' + (x + w - gap - sz) + ' ' + y + ' L ' + (x + w - gap) + ' ' + y + ' L ' + (x + w) + ' ' + (y + gap) + '" fill="none" stroke="' + color + '" stroke-width="' + sw + '"/>',
      /* bottom-right */
      '<path d="M ' + (x + w) + ' ' + (y + h - gap - sz) + ' L ' + (x + w) + ' ' + (y + h - gap) + ' L ' + (x + w - gap - sz) + ' ' + (y + h) + '" fill="none" stroke="' + color + '" stroke-width="' + sw + '"/>',
      /* bottom-left */
      '<path d="M ' + (x + gap + sz) + ' ' + (y + h) + ' L ' + (x + gap) + ' ' + (y + h) + ' L ' + x + ' ' + (y + h - gap - sz) + '" fill="none" stroke="' + color + '" stroke-width="' + sw + '"/>'
    ].join('');
  }

  /* ── COLOR → MARKER LOOKUP ──────────────────────────────────────── */
  var COLOR_TO_MARKER = {
    '#22d3ee': 'arrow-cyan',
    '#34d399': 'arrow-emerald',
    '#a78bfa': 'arrow-violet',
    '#fbbf24': 'arrow-amber',
    '#fb7185': 'arrow-rose',
    '#fb923c': 'arrow-orange',
    '#94a3b8': 'arrow-slate'
  };

  function markerForColor(color) {
    return COLOR_TO_MARKER[color] || 'arrow-slate';
  }

  /* ── EXPORT ─────────────────────────────────────────────────────── */
  window.ruiDiagramPrimitives = {
    PALETTE: PALETTE,
    esc: esc,
    snap: snap,
    clamp: clamp,
    r: r,
    renderMarkers: renderMarkers,
    renderPatterns: renderPatterns,
    renderShadowFilters: renderShadowFilters,
    renderTextSlot: renderTextSlot,
    renderArrow: renderArrow,
    renderCornerBrackets: renderCornerBrackets,
    markerForColor: markerForColor
  };
})();
