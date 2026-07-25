/**
 * @file: core.js
 * @purpose: Shared architecture diagram layout engine. Sections 0-8 of the
 *           per-project arch/data.js are identical across all projects —
 *           this file eliminates that ~4200 lines of duplication.
 *
 *           Each project's arch/data.js now only defines:
 *             • Section 3  — COMP_DEFS, BOUNDARY_DEFS, CONNECTION_DEFS, LAYER_BAND
 *             • Section 9  — static content (summaryCards, pipeline, etc.)
 *
 *           …and calls window.ruiArchEngine.buildSvg(config) to produce the SVG.
 *
 * @api: window.ruiArchEngine.buildSvg(config) → svgDiagram string
 * @config_shape:
 *   {
 *     compDefs:      COMP_DEFS[],
 *     boundaryDefs:  BOUNDARY_DEFS[],
 *     connDefs:      CONNECTION_DEFS[],
 *     layerBand:     { key: { y, rows, colSpan } },
 *     stdW:          number (default 160),
 *     stdH:          number (default 60),
 *     smallW:        number (default 140),
 *     smallH:        number (default 56),
 *     legend:        { x, y, swatches: [{fill,stroke,label}], lineStyles: [{color,dash,label}] },
 *     layers:        [{ key, label, color }],
 *     outermost:     { label, sub },
 *     diagram:       { title, desc }
 *   }
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
     SECTION 4 — LAYOUT ENGINE
     ═══════════════════════════════════════════════════════════════════ */
  var COL_X = [60, 240, 420, 600, 780, 960, 1140, 1320, 1500];
  var ROW_H_LAYER = 88;

  function computeHeight(lines, w) {
    var lineH = 14;
    return 50 + lines.length * lineH;
  }

  function layoutComponents(compDefs, layerBand, stdW, stdH) {
    var comps = [];
    compDefs.forEach(function (d) {
      var band = layerBand[d.layer];
      var x = COL_X[d.col] || 0;
      var y = band.y + d.row * ROW_H_LAYER;
      var w = d.w || (d.lines ? 200 : stdW);
      var h = d.h || (d.lines ? computeHeight(d.lines, w) : stdH);
      comps.push({
        id: d.id, type: d.type, layer: d.layer,
        label: d.label, sub: d.sub,
        lines: d.lines || null, x: x, y: y, w: w, h: h
      });
    });
    return comps;
  }

  function layoutBoundaries(comps, boundaryDefs) {
    var byId = {};
    comps.forEach(function (c) { byId[c.id] = c; });
    return boundaryDefs.map(function (b) {
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
  function escapeXml(s) { return P.esc(s); }

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

  /* ARROW_COLOR_MAP: maps stroke color → short name for marker resolution */
  var ARROW_COLOR_MAP = {
    '#34d399': 'emerald',
    '#fb923c': 'orange',
    '#fb7185': 'rose',
    '#fbbf24': 'amber',
    '#64748b': 'slate',
    '#22d3ee': 'cyan',
    '#a78bfa': 'violet',
    '#94a3b8': 'slate'
  };

  function renderLegend(x, y, swatches, lineStyles) {
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
      var markerName = ARROW_COLOR_MAP[s.color] || 'slate';
      parts.push('<line x1="' + sx + '" y1="' + sy + '" x2="' + (sx + 36) + '" y2="' + sy + '" ' +
                 'stroke="' + s.color + '" stroke-width="' + STROKE + '"' + dashAttr +
                 ' marker-end="url(#arrow-' + markerName + ')"/>');
      parts.push('<text x="' + (sx + 50) + '" y="' + (sy + 4) + '" fill="#cbd5e1" font-size="10">' +
                 escapeXml(s.label) + '</text>');
    });
    return parts.join('');
  }

  /* ═══════════════════════════════════════════════════════════════════
     SECTION 7 — OUTERMOST REGION + LAYER RAIL
     ═══════════════════════════════════════════════════════════════════ */
  function renderCornerBrackets(x, y, w, h) {
    return P.renderCornerBrackets(x, y, w, h, '#fbbf24', 12);
  }

  function renderOutermost(comps, bounds, legendY, outerLabel, outerSub) {
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
      label: outerLabel,
      sub: outerSub,
      markup:
        '<rect class="svg-outermost" x="' + x + '" y="' + y + '" ' +
          'width="' + w + '" height="' + h + '" rx="20" ' +
          'fill="rgba(251,191,36,0.012)" stroke="#fbbf24" ' +
          'stroke-width="2.2" stroke-dasharray="10,5"/>' +
        '<rect x="' + (x + 12) + '" y="' + (y + 8) + '" height="32" width="320" rx="6" ' +
          'fill="#020617" stroke="#fbbf24" stroke-width="1.2"/>' +
        '<text x="' + (x + 22) + '" y="' + (y + 24) + '" fill="#fbbf24" ' +
          'font-size="12" font-weight="700">▸ ' + escapeXml(outerLabel) + '</text>' +
        '<text x="' + (x + 22) + '" y="' + (y + 36) + '" fill="#94a3b8" font-size="9">' +
          escapeXml(outerSub) + '</text>' +
        renderCornerBrackets(x, y, w, h)
    };
  }

  function renderLayerRail(comps, layerInfo) {
    var groups = {};
    comps.forEach(function (c) {
      if (!groups[c.layer]) groups[c.layer] = [];
      groups[c.layer].push(c);
    });

    var parts = [];
    layerInfo.forEach(function (li) {
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
     SECTION 8 — COMPOSE THE SVG (PUBLIC API)
     ═══════════════════════════════════════════════════════════════════ */
  function buildSvg(config) {
    var _stdW  = config.stdW  != null ? config.stdW  : 160;
    var _stdH  = config.stdH  != null ? config.stdH  : 60;
    var lg     = config.legend || {};
    var lx     = lg.x != null ? lg.x : 60;
    var ly     = lg.y != null ? lg.y : 1140;
    var swatches    = lg.swatches    || [];
    var lineStyles  = lg.lineStyles  || [];
    var layerInfo   = config.layers || [];
    var outerLabel  = config.outermost ? config.outermost.label : '';
    var outerSub    = config.outermost ? config.outermost.sub   : '';
    var diag        = config.diagram || {};
    var diagTitle   = diag.title || '';
    var diagDesc    = diag.desc  || '';

    var comps  = layoutComponents(config.compDefs, config.layerBand, _stdW, _stdH);
    var bounds = layoutBoundaries(comps, config.boundaryDefs);
    var outermost = renderOutermost(comps, bounds, ly, outerLabel, outerSub);

    var svgW = outermost.x + outermost.w + 40;
    var svgH = outermost.y + outermost.h + 40;

    var parts = [];
    parts.push('<svg ref="svg" viewBox="0 0 ' + svgW + ' ' + svgH + '" ' +
               'role="img" aria-labelledby="diagram-title diagram-desc" ' +
               'xmlns="http://www.w3.org/2000/svg" ' +
               'shape-rendering="geometricPrecision" text-rendering="geometricPrecision">');
    parts.push('<title id="diagram-title">' + escapeXml(diagTitle) + '</title>');
    parts.push('<desc id="diagram-desc">' + escapeXml(diagDesc) + '</desc>');
    parts.push(renderDefs());
    parts.push('<rect width="100%" height="100%" fill="url(#grid)"/>');
    parts.push('<rect width="100%" height="100%" fill="url(#grid-major)"/>');
    parts.push(renderLayerRail(comps, layerInfo));
    parts.push(renderArrows(comps, config.connDefs));
    parts.push(renderMasks(comps));
    parts.push(renderComponents(comps));
    parts.push(renderBoundaries(bounds));
    parts.push(renderLegend(lx, ly, swatches, lineStyles));
    parts.push(outermost.markup);
    parts.push('</svg>');
    return parts.join('\n');
  }

  /* ── PUBLIC API ───────────────────────────────────────────────── */
  window.ruiArchEngine = {
    buildSvg: buildSvg,
    /* Expose style tokens so projects can reference them in legend configs */
    STYLES: STYLES,
    CONN: CONN
  };
})();
