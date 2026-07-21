/* =========================================================================
   shared/diagram/diagram.js
   -------------------------------------------------------------------------
   Algorithmic SVG generator for the per-dependency report pages under
   docs/deps/<dir>/. One file replaces the ~2KB of hand-positioned inline
   SVG that was previously duplicated in all 42 data.js files.

   Usage
   -----
   Each per-page data.js declares a `diagram` model instead of an inline
   `svgDiagram`. At render time, shared/index.js calls:

       ruiDepsDiagram.render(diagramModel) → yryDepsDiagram.render(diagramModel)

   and uses the returned string as the SVG markup.

   Shared primitives
   -----------------
   This file consumes /YiPet/cdn/diagram/primitives.js, which is the
   single source of truth for the yry-report visual language (palette,
   markers, patterns, text rendering, corner brackets). Both this file
   and the architecture generator (skills/yry-reports/diagram/templates/
   data.js) use the same primitives, so a tweak in one place updates the
   visual language across the entire system.

   The script gracefully falls back to local defaults if the shared
   primitives module isn't available (so the file remains testable
   in isolation).

   Model shape
   -----------
   {
     mode: 'catalog' | 'footprint'  // default 'catalog'
     package:   { title, desc: [l1, l2], stats: [l1, l2] }
     dashboard: { title, sub, hint }
     anchor:    { title, lines: [l1, l2], hint }
     context:   { title, sub }
     evidence:  { title, sub, hint }
     report:    { title, sub, hint }
     arrows:    { 'from→to': 'custom label', ... }   // optional overrides
   }
   ========================================================================= */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 1 — PRIMITIVES RESOLUTION
     Resolve the shared primitives from window.yryDiagramPrimitives.
     If not available (e.g., when running this file standalone in a
     test sandbox), use the same inline defaults so the file is
     never broken.
     ═══════════════════════════════════════════════════════════════════ */
  var P = window.yryDiagramPrimitives;
  if (!P) {
    /* Minimal fallback so the file still works in isolation. */
    P = {
      PALETTE: {
        cyan:    { fill: 'rgba(8,51,68,0.45)',   stroke: '#22d3ee', text: '#22d3ee' },
        emerald: { fill: 'rgba(6,78,59,0.45)',   stroke: '#34d399', text: '#34d399' },
        violet:  { fill: 'rgba(76,29,149,0.45)', stroke: '#a78bfa', text: '#a78bfa' },
        amber:   { fill: 'rgba(120,53,15,0.35)', stroke: '#fbbf24', text: '#fbbf24' },
        rose:    { fill: 'rgba(136,19,55,0.45)', stroke: '#fb7185', text: '#fb7185' },
        orange:  { fill: 'rgba(251,146,60,0.35)',stroke: '#fb923c', text: '#fb923c' },
        slate:   { fill: 'rgba(30,41,59,0.55)',  stroke: '#94a3b8', text: '#94a3b8' }
      },
      esc: function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); },
      renderMarkers: function () { return ''; },
      renderPatterns: function () { return ''; },
      renderTextSlot: function (o) { return '<text>' + (o.text || '') + '</text>'; },
      renderArrow: function (o) { return '<line/>'; },
      renderCornerBrackets: function () { return ''; },
      markerForColor: function () { return 'arrow-slate'; }
    };
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 2 — LAYOUT TOKENS
     The 6-box layout is fixed: every y-coordinate was lifted from
     the pre-refactor inline SVG and verified against all 42 pages.
     ═══════════════════════════════════════════════════════════════════ */

  var VIEW = { w: 1120, h: 560 };
  var BG_MASK = '#0f172a';
  var STROKE_W = 2;     /* main line stroke (matches architecture) */

  /* Each box declares:
       - geometry: x, y, w, h, rx
       - colors:   fill, stroke, strokeWidth
       - slots:    array of { y, role, color? } — explicit y per text line
                   role is one of: title | sub | desc | line | stat | hint */
  var BOXES = {
    dashboard: {
      x: 70, y: 108, w: 140, h: 76, rx: 10,
      fill: P.PALETTE.slate.fill, stroke: P.PALETTE.cyan.stroke, strokeWidth: STROKE_W,
      slots: [
        { y: 136, role: 'title' },
        { y: 154, role: 'sub'   },
        { y: 169, role: 'hint',  color: P.PALETTE.cyan.stroke }
      ]
    },
    anchor: {
      x: 70, y: 272, w: 140, h: 84, rx: 10,
      fill: P.PALETTE.amber.fill, stroke: P.PALETTE.amber.stroke, strokeWidth: STROKE_W,
      slots: [
        { y: 298, role: 'title' },
        { y: 318, role: 'line'  },
        { y: 332, role: 'line'  },
        { y: 348, role: 'hint',  color: P.PALETTE.amber.stroke }
      ]
    },
    /* Package has mode-dependent stroke and stat1 color. */
    package: {
      x: 350, y: 186, w: 340, h: 132, rx: 16, big: true,
      fill: P.PALETTE.emerald.fill, strokeWidth: 2,
      baseSlots: [
        { y: 220, role: 'title' },
        { y: 246, role: 'desc'  },
        { y: 262, role: 'desc'  }
      ],
      modeConfig: {
        catalog: {
          stroke: P.PALETTE.emerald.stroke,
          statSlots: [
            { y: 284, role: 'stat', color: P.PALETTE.emerald.stroke },
            { y: 300, role: 'stat', color: P.PALETTE.violet.stroke,  size: 8 }
          ]
        },
        footprint: {
          stroke: P.PALETTE.cyan.stroke,
          statSlots: [
            { y: 284, role: 'stat', color: P.PALETTE.cyan.stroke },
            { y: 300, role: 'stat', color: P.PALETTE.violet.stroke, size: 8 }
          ]
        }
      }
    },
    context: {
      x: 780, y: 106, w: 190, h: 72, rx: 10,
      fill: P.PALETTE.emerald.fill, stroke: P.PALETTE.emerald.stroke, strokeWidth: STROKE_W,
      slots: [
        { y: 132, role: 'title' },
        { y: 150, role: 'sub'   }
      ]
    },
    evidence: {
      x: 340, y: 430, w: 360, h: 76, rx: 10,
      fill: P.PALETTE.violet.fill, stroke: P.PALETTE.violet.stroke, strokeWidth: STROKE_W,
      slots: [
        { y: 456, role: 'title' },
        { y: 478, role: 'sub'   },
        { y: 494, role: 'hint',  color: P.PALETTE.violet.stroke }
      ]
    },
    report: {
      x: 780, y: 430, w: 190, h: 76, rx: 10,
      fill: P.PALETTE.slate.fill, stroke: P.PALETTE.cyan.stroke, strokeWidth: STROKE_W,
      slots: [
        { y: 456, role: 'title' },
        { y: 478, role: 'sub'   },
        { y: 494, role: 'hint',  color: P.PALETTE.cyan.stroke }
      ]
    }
  };

  /* Arrow path geometry (start/end) and per-arrow label offsets.
     stroke colors come from the shared palette; markers are resolved
     via P.markerForColor() so the marker name is always in sync. */
  var ARROWS = [
    { from: 'dashboard', to: 'package',  stroke: P.PALETTE.cyan.stroke,
      coords: { x1: 210, y1: 150, x2: 350, y2: 220 },
      label:  { dx: 0,  dy: -15, anchor: 'middle' } },
    { from: 'anchor',    to: 'package',  stroke: P.PALETTE.amber.stroke,
      coords: { x1: 210, y1: 310, x2: 350, y2: 290 },
      label:  { dx: 0,  dy: 2,   anchor: 'middle' } },
    { from: 'package',   to: 'evidence', stroke: P.PALETTE.violet.stroke,
      coords: { x1: 520, y1: 326, x2: 520, y2: 430 },
      label:  { dx: 15, dy: 5,   anchor: 'start'  } },
    { from: 'package',   to: 'context',  stroke: P.PALETTE.emerald.stroke,
      coords: { x1: 760, y1: 240, x2: 900, y2: 150 },
      label:  { dx: 8,  dy: -15, anchor: 'middle' } },
    { from: 'context',   to: 'report',   stroke: P.PALETTE.cyan.stroke,
      coords: { x1: 875, y1: 320, x2: 875, y2: 432 },
      label:  { dx: 13, dy: 6,   anchor: 'start'  } }
  ];

  var ARROW_LABELS = {
    catalog: {
      'dashboard→package': 'dashboard card',
      'anchor→package':    'path anchor',
      'package→evidence':  'evidence',
      'package→context':   'section context',
      'context→report':    'report output'
    },
    footprint: {
      'dashboard→package': 'catalog context',
      'anchor→package':    'source of truth',
      'package→evidence':  'hottest file',
      'package→context':   'top consumer',
      'context→report':    'report output'
    }
  };

  var OUTER = {
    catalog:   { label: 'diagram-style catalog drill-down',    stroke: '#334155', dash: '8,4'  },
    footprint: { label: 'diagram-style dependency footprint',  stroke: '#fbbf24', dash: '10,5' }
  };

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 3 — RENDERERS
     Every renderer delegates to the shared primitives so the visual
     language stays in lock-step with the architecture diagram.
     ═══════════════════════════════════════════════════════════════════ */

  function renderDefs() {
    return '<defs>' + P.renderMarkers() + P.renderPatterns() + '</defs>';
  }

  function renderBackground() {
    /* The base dark background must be inside the SVG (not just on
       the page CSS) so the SVG renders correctly when extracted or
       composited against any backdrop. Matches the architecture. */
    return '<rect width="100%" height="100%" fill="#020617"/>' +
           '<rect width="100%" height="100%" fill="url(#grid)"/>' +
           '<rect width="100%" height="100%" fill="url(#grid-major)"/>';
  }

  function renderOuter(mode) {
    var o = OUTER[mode] || OUTER.catalog;
    var x = 36, y = 36, w = 1048, h = 488;
    return [
      /* subtle fill (1.2% amber) — matches architecture diagram */
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="20" ' +
        'fill="rgba(251,191,36,0.012)" stroke="' + o.stroke + '" ' +
        'stroke-width="' + STROKE_W + '" stroke-dasharray="' + o.dash + '"/>',
      /* corner brackets — match the architecture diagram's decoration style */
      P.renderCornerBrackets(x, y, w, h, o.stroke, 12),
      /* label */
      '<text x="56" y="60" fill="#94a3b8" font-size="11">' + P.esc(o.label) + '</text>'
    ].join('');
  }

  function renderArrows(mode, overrides) {
    var labels = ARROW_LABELS[mode] || ARROW_LABELS.catalog;
    var parts = [];
    ARROWS.forEach(function (a) {
      var key = a.from + '→' + a.to;
      var label = (overrides && overrides[key]) || labels[key] || '';
      var c = a.coords;
      var l = a.label;
      parts.push(P.renderArrow({
        x1: c.x1, y1: c.y1, x2: c.x2, y2: c.y2,
        stroke: a.stroke,
        marker: P.markerForColor(a.stroke),
        strokeWidth: STROKE_W
      }));
      var lx = Math.round((c.x1 + c.x2) / 2) + l.dx;
      var ly = Math.round((c.y1 + c.y2) / 2) + l.dy;
      parts.push(P.renderTextSlot({
        x: lx, y: ly, text: label,
        fill: a.stroke, size: 9, weight: 600, anchor: l.anchor
      }));
    });
    return parts.join('');
  }

  /* Resolve a slot to its text content, given the model. */
  function slotContent(slot, model, listIndex) {
    if (!model) return '';
    switch (slot.role) {
      case 'title': return model.title || '';
      case 'sub':   return model.sub   || '';
      case 'hint':  return model.hint  || '';
      case 'line':  return (model.lines || [])[listIndex] || '';
      case 'desc':  return (model.desc  || [])[listIndex] || '';
      case 'stat':  return (model.stats || [])[listIndex] || '';
    }
    return '';
  }

  /* Render a single text element via the shared primitive.
     Only narrow-box titles get textLength — everything else renders
     naturally, mirroring the pre-refactor SVG behavior. */
  function renderSlotText(box, slot, model, listIndex) {
    var text = slotContent(slot, model, listIndex);
    if (!text) return '';

    var fill    = slot.color || '#94a3b8';
    var size    = 9;
    var weight  = 400;
    var textLen = null;

    switch (slot.role) {
      case 'title':
        fill = 'white';
        size = box.big ? 20 : 12;
        weight = box.big ? 700 : 600;
        textLen = box.w <= 140 ? Math.min(box.w - 16, 120) : null;
        break;
      case 'sub':
        size = box.big ? 12 : 9;
        break;
      case 'desc':
        size = 10;
        break;
      case 'line':
        size = 8;
        break;
      case 'stat':
        size = slot.size || 9;
        break;
      case 'hint':
        size = 8;
        break;
    }

    return P.renderTextSlot({
      x: box.x + box.w / 2,
      y: slot.y,
      text: text,
      fill: fill,
      size: size,
      weight: weight,
      anchor: 'middle',
      textLength: textLen
    });
  }

  function renderBox(name, model) {
    var box = BOXES[name];
    if (!box) return '';
    var parts = [];
    parts.push('<rect x="' + box.x + '" y="' + box.y + '" width="' + box.w +
               '" height="' + box.h + '" rx="' + box.rx + '" fill="' + BG_MASK + '"/>');
    parts.push('<rect x="' + box.x + '" y="' + box.y + '" width="' + box.w +
               '" height="' + box.h + '" rx="' + box.rx + '" ' +
               'fill="' + box.fill + '" stroke="' + box.stroke + '" ' +
               'stroke-width="' + box.strokeWidth + '"/>');
    var listIndex = 0;
    box.slots.forEach(function (slot) {
      parts.push(renderSlotText(box, slot, model, listIndex));
      if (slot.role === 'line') listIndex++;
    });
    return parts.join('');
  }

  function renderPackage(mode, model) {
    var box = BOXES.package;
    if (!box) return '';
    var mc = box.modeConfig[mode] || box.modeConfig.catalog;
    var parts = [];
    parts.push('<rect x="' + box.x + '" y="' + box.y + '" width="' + box.w +
               '" height="' + box.h + '" rx="' + box.rx + '" fill="' + BG_MASK + '"/>');
    parts.push('<rect x="' + box.x + '" y="' + box.y + '" width="' + box.w +
               '" height="' + box.h + '" rx="' + box.rx + '" ' +
               'fill="' + box.fill + '" stroke="' + mc.stroke + '" ' +
               'stroke-width="' + box.strokeWidth + '"/>');
    var descIndex = 0;
    box.baseSlots.forEach(function (slot) {
      parts.push(renderSlotText(box, slot, model, descIndex));
      if (slot.role === 'desc') descIndex++;
    });
    var statIndex = 0;
    mc.statSlots.forEach(function (slot) {
      parts.push(renderSlotText(box, slot, model, statIndex));
      if (slot.role === 'stat') statIndex++;
    });
    return parts.join('');
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 4 — ENTRY POINT
     ═══════════════════════════════════════════════════════════════════ */
  function render(diagram) {
    if (!diagram) return '';
    var mode = diagram.mode || 'catalog';
    var parts = [];
    parts.push('<svg viewBox="0 0 ' + VIEW.w + ' ' + VIEW.h + '" ' +
               'role="img" aria-label="' + P.esc(mode) + ' diagram" ' +
               'xmlns="http://www.w3.org/2000/svg">');
    parts.push(renderDefs());
    parts.push(renderBackground());
    parts.push(renderOuter(mode));
    parts.push(renderArrows(mode, diagram.arrows));
    parts.push(renderBox('dashboard', diagram.dashboard || {}));
    parts.push(renderBox('anchor',    diagram.anchor    || {}));
    parts.push(renderPackage(mode,   diagram.package   || {}));
    parts.push(renderBox('context',   diagram.context   || {}));
    parts.push(renderBox('evidence',  diagram.evidence  || {}));
    parts.push(renderBox('report',    diagram.report    || {}));
    parts.push('</svg>');
    return parts.join('');
  }

  window.yryDepsDiagram = { render: render, BOXES: BOXES };
})();
