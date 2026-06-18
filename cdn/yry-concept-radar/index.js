/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryConceptRadar · 概念雷达图 脚本
   零依赖 vanilla JS — 从 JSON 数据渲染 SVG 雷达/蜘蛛图

   数据格式 (<script type="application/json" id="...">):
   {
     "title": "图表标题",
     "dimensions": [
       { "label": "维度名", "value": 85, "baseline": 60 }
     ]
   }

   使用方式:
     <script type="application/json" id="radar-data">{ ... }</script>
     <yry-concept-radar></yry-concept-radar>
     <script src="yry-concept-radar/index.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var TAG_NAME = 'yry-concept-radar';
  var SVG_NS = 'http://www.w3.org/2000/svg';

  var YryConceptRadar = function () {
    return Reflect.construct(HTMLElement, [], YryConceptRadar);
  };
  YryConceptRadar.prototype = Object.create(HTMLElement.prototype);

  YryConceptRadar.prototype.connectedCallback = function () {
    var self = this;

    // Read config from preceding <script type="application/json">
    var dataEl = this.previousElementSibling;
    if (!dataEl || dataEl.tagName !== 'SCRIPT' || dataEl.type !== 'application/json') {
      var id = this.id;
      if (id) {
        dataEl = document.querySelector('script[type="application/json"][id="' + id + '"]');
      }
    }

    var cfg;
    if (dataEl) {
      try { cfg = JSON.parse(dataEl.textContent); }
      catch (e) { cfg = null; }
    }
    if (!cfg || !cfg.dimensions || cfg.dimensions.length < 3) {
      this.innerHTML = '<div style="text-align:center;padding:24px;color:var(--yry-text3,#888)">🎯 无雷达数据 (至少 3 个维度)</div>';
      return;
    }

    var title = cfg.title || '';
    var dims = cfg.dimensions;
    var hasBaseline = dims.some(function (d) { return typeof d.baseline === 'number'; });

    // Build UI
    var wrap = document.createElement('div');
    wrap.className = 'radar-wrap';

    // Header
    var header = document.createElement('div');
    header.className = 'radar-header';
    var legendHTML = '';
    if (hasBaseline) {
      legendHTML =
        '<div class="radar-legend">' +
        '<span class="lg-item"><span class="lg-dot" style="background:var(--yry-accent,#ffc107)"></span>当前</span>' +
        '<span class="lg-item"><span class="lg-dot" style="background:var(--yry-cyan,#22d3ee)"></span>基线</span>' +
        '</div>';
    }
    header.innerHTML = '<h3>' + escapeHtml(title) + '</h3>' + legendHTML;
    wrap.appendChild(header);

    // SVG
    var svgWrap = document.createElement('div');
    svgWrap.className = 'radar-svg-wrap';

    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'radar-svg');
    svg.setAttribute('viewBox', '-160 -160 320 320');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    var N = dims.length;
    var angleStep = (2 * Math.PI) / N;
    var maxR = 140;

    // Draw concentric rings (20%, 40%, 60%, 80%, 100%)
    for (var level = 1; level <= 5; level++) {
      var r = (maxR / 5) * level;
      var ring = document.createElementNS(SVG_NS, 'circle');
      ring.setAttribute('class', 'rr-ring');
      ring.setAttribute('cx', '0');
      ring.setAttribute('cy', '0');
      ring.setAttribute('r', String(r));
      svg.appendChild(ring);
    }

    // Draw axes and labels
    var points = [];
    var baselinePoints = [];

    for (var i = 0; i < N; i++) {
      var angle = -Math.PI / 2 + i * angleStep;
      var x = Math.cos(angle) * maxR;
      var y = Math.sin(angle) * maxR;

      // Axis line
      var axis = document.createElementNS(SVG_NS, 'line');
      axis.setAttribute('class', 'rr-axis');
      axis.setAttribute('x1', '0');
      axis.setAttribute('y1', '0');
      axis.setAttribute('x2', String(Math.round(x)));
      axis.setAttribute('y2', String(Math.round(y)));
      svg.appendChild(axis);

      // Value point
      var val = Math.min(100, Math.max(0, dims[i].value || 0));
      var vx = Math.cos(angle) * (val / 100) * maxR;
      var vy = Math.sin(angle) * (val / 100) * maxR;
      points.push({ x: vx, y: vy, label: dims[i].label, value: val });

      // Baseline point
      if (hasBaseline) {
        var bl = Math.min(100, Math.max(0, dims[i].baseline || 0));
        var bx = Math.cos(angle) * (bl / 100) * maxR;
        var by = Math.sin(angle) * (bl / 100) * maxR;
        baselinePoints.push({ x: bx, y: by });
      }

      // Label (positioned slightly outside)
      var labelR = maxR + 18;
      var lx = Math.cos(angle) * labelR;
      var ly = Math.sin(angle) * labelR;
      var label = document.createElementNS(SVG_NS, 'text');
      label.setAttribute('class', 'rr-label');
      label.setAttribute('x', String(Math.round(lx)));
      label.setAttribute('y', String(Math.round(ly)));
      label.setAttribute('dy', '0.35em');
      label.textContent = dims[i].label;
      svg.appendChild(label);
    }

    // Draw baseline polygon (behind)
    if (hasBaseline && baselinePoints.length >= 3) {
      var blPoly = document.createElementNS(SVG_NS, 'polygon');
      blPoly.setAttribute('class', 'rr-baseline');
      blPoly.setAttribute('points', baselinePoints.map(function (p) {
        return Math.round(p.x) + ',' + Math.round(p.y);
      }).join(' '));
      svg.appendChild(blPoly);
    }

    // Draw value polygon
    if (points.length >= 3) {
      var poly = document.createElementNS(SVG_NS, 'polygon');
      poly.setAttribute('class', 'rr-shield');
      poly.setAttribute('points', points.map(function (p) {
        return Math.round(p.x) + ',' + Math.round(p.y);
      }).join(' '));
      svg.appendChild(poly);
    }

    // Draw value dots
    points.forEach(function (p, idx) {
      var dot = document.createElementNS(SVG_NS, 'circle');
      dot.setAttribute('class', 'rr-point');
      dot.setAttribute('cx', String(Math.round(p.x)));
      dot.setAttribute('cy', String(Math.round(p.y)));
      dot.setAttribute('r', '3.5');
      dot.style.cursor = 'pointer';

      (function (label, value) {
        dot.addEventListener('mouseenter', function () {
          var desc = wrap.querySelector('.radar-desc');
          if (desc) {
            desc.innerHTML = '<strong>' + escapeHtml(label) + '</strong>: ' + value + ' 分';
          }
        });
      })(p.label, p.value);

      svg.appendChild(dot);
    });

    svgWrap.appendChild(svg);
    wrap.appendChild(svgWrap);

    // Description area
    var desc = document.createElement('div');
    desc.className = 'radar-desc';
    desc.textContent = '悬停雷达图上的节点查看维度详情';
    wrap.appendChild(desc);

    this.appendChild(wrap);
  };

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, YryConceptRadar);
  }
})();
