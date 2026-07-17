/**
 * @file: index.js
 * @purpose: Vue 3 application for the architecture diagram page.
 *           Splits responsibilities into three composables so the main
 *           app stays declarative:
 *             · useSvgInteractions — focus / hover / keyboard (Esc) / click-to-reset
 *             · useExport          — Copy / PNG / PDF via html2canvas + jsPDF,
 *                                    with rui-toast for success/failure feedback
 *
 * @data_source: window.REPORT_DATA  (set by data.js, loaded before this file)
 * @dom_mount:   #app                (defined in index.html)
 */
(function () {
  'use strict';

  function getReportData() {
    var data = window.REPORT_DATA;
    if (data && typeof data === 'object') return data;
    return {
      meta: {},
      executiveSummary: [],
      toc: [],
      metrics: [],
      svgDiagram: '',
      summaryCards: [],
      pipeline: [],
      securityCards: [],
      trace: [],
      scalingTiles: [],
      ownership: null,
      apiTable: null,
      stack: [],
      schemaTiles: [],
      roadmap: [],
      glossary: []
    };
  }

  /* ──────────────────────────────────────────────────────────────────
     Wait for shared/loader.js IIFE to finish (it auto-injects
     shared/vendor/vue@3.4.27/vue.global.prod.js). Falls back to a
     poll on window.Vue if the promise is missing.
     ────────────────────────────────────────────────────────────────── */
  function whenVueReady() {
    if (window.Vue) return Promise.resolve();
    if (window.__vueLoadPromise) return window.__vueLoadPromise;
    return new Promise(function (resolve) {
      var tries = 0;
      var t = setInterval(function () {
        if (window.Vue) { clearInterval(t); resolve(); }
        else if (++tries > 50) { clearInterval(t); resolve(); }
      }, 100);
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     Wait for data.js to publish window.REPORT_DATA. The page normally
     loads data.js before index.js, but some preview environments can
     momentarily delay global availability during navigation. Waiting here
     avoids mounting an empty shell that only fills after a manual refresh.
     ────────────────────────────────────────────────────────────────── */
  function whenReportDataReady() {
    var data = window.REPORT_DATA;
    if (data && typeof data === 'object') return Promise.resolve(data);
    return new Promise(function (resolve) {
      var tries = 0;
      var t = setInterval(function () {
        var current = window.REPORT_DATA;
        if (current && typeof current === 'object') {
          clearInterval(t);
          resolve(current);
        } else if (++tries > 20) {
          clearInterval(t);
          console.warn('[arch-diagram] REPORT_DATA missing after wait — mounting fallback shell');
          resolve(getReportData());
        }
      }, 100);
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     useSvgInteractions — index the SVG, wire up hover/click/focus.
     Returns reactive { focusedComp, resetFocus, init } for the parent.
     ────────────────────────────────────────────────────────────────── */
  function useSvgInteractions() {
    var focusedComp = Vue.ref(null);
    var compGroups = [];
    var arrowGroups = [];
    var svgEl = null;
    var containerEl = null;

    function pointToRectDist(px, py, rect) {
      var cx = Math.max(rect.x, Math.min(px, rect.x + rect.w));
      var cy = Math.max(rect.y, Math.min(py, rect.y + rect.h));
      return Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy));
    }

    function findConnectedArrows(comp) {
      var threshold = 30;
      var b = comp.bounds;
      var connected = [];
      for (var i = 0; i < arrowGroups.length; i++) {
        var a = arrowGroups[i];
        var d1 = pointToRectDist(a.x1, a.y1, b);
        var d2 = pointToRectDist(a.x2, a.y2, b);
        if (d1 < threshold || d2 < threshold) connected.push(a);
      }
      return connected;
    }

    function clearHighlight() {
      if (focusedComp.value) return;
      if (containerEl) containerEl.classList.remove('dimmed');
      if (svgEl) {
        svgEl.querySelectorAll('.highlight').forEach(function (el) {
          el.classList.remove('highlight');
        });
      }
    }

    function highlightComponent(comp) {
      if (!containerEl || !svgEl) return;
      containerEl.classList.add('dimmed');
      comp.mask.classList.add('highlight');
      comp.styled.classList.add('highlight');
      comp.styled.classList.add('svg-comp');
      comp.labels.forEach(function (l) { l.classList.add('highlight'); });
      findConnectedArrows(comp).forEach(function (a) {
        a.el.classList.add('highlight');
        if (a.label) a.label.classList.add('highlight');
      });
    }

    function focusComponent(comp) {
      focusedComp.value = comp;
      highlightComponent(comp);
    }

    function resetFocus() {
      focusedComp.value = null;
      clearHighlight();
      if (svgEl) {
        svgEl.querySelectorAll('.highlight').forEach(function (el) {
          el.classList.remove('highlight');
        });
      }
    }

    function indexArrow(el, isPath) {
      var x1 = 0, y1 = 0, x2 = 0, y2 = 0;
      if (isPath) {
        var d = el.getAttribute('d') || '';
        var m  = d.match(/M\s*([\d.]+)\s+([\d.]+)/);
        var last = d.match(/([\d.]+)\s+([\d.]+)\s*$/);
        if (m)    { x1 = parseFloat(m[1]);    y1 = parseFloat(m[2]); }
        if (last) { x2 = parseFloat(last[1]); y2 = parseFloat(last[2]); }
      } else {
        x1 = parseFloat(el.getAttribute('x1'));
        y1 = parseFloat(el.getAttribute('y1'));
        x2 = parseFloat(el.getAttribute('x2'));
        y2 = parseFloat(el.getAttribute('y2'));
      }
      if (isNaN(x1)) return;

      // find the nearest label text
      var texts = svgEl.querySelectorAll('text');
      var labelEl = null;
      var minDist = 25;
      var midX = (x1 + x2) / 2, midY = (y1 + y2) / 2;
      texts.forEach(function (t) {
        var tx = parseFloat(t.getAttribute('x'));
        var ty = parseFloat(t.getAttribute('y'));
        var dist = Math.sqrt((tx - midX) * (tx - midX) + (ty - midY) * (ty - midY));
        if (dist < minDist) { minDist = dist; labelEl = t; }
      });

      arrowGroups.push({
        el: el,
        x1: x1, y1: y1, x2: x2, y2: y2,
        label: labelEl,
        stroke: el.getAttribute('stroke') || ''
      });
    }

    function indexComponents() {
      var masks = svgEl.querySelectorAll('rect[fill="#0f172a"]');
      var styledRects = svgEl.querySelectorAll('rect');
      var texts = svgEl.querySelectorAll('text');

      masks.forEach(function (mask) {
        var bx = parseFloat(mask.getAttribute('x'));
        var by = parseFloat(mask.getAttribute('y'));
        var bw = parseFloat(mask.getAttribute('width'));
        var bh = parseFloat(mask.getAttribute('height'));

        // match by position to the styled semi-transparent rect
        var styled = null;
        for (var i = 0; i < styledRects.length; i++) {
          var r = styledRects[i];
          if (r === mask) continue;
          var fill = r.getAttribute('fill') || '';
          if (!fill.includes('rgba') && !fill.includes('url(#')) continue;
          var rx = parseFloat(r.getAttribute('x'));
          var ry = parseFloat(r.getAttribute('y'));
          if (Math.abs(rx - bx) < 2 && Math.abs(ry - by) < 2) { styled = r; break; }
        }
        if (!styled) return;

        // collect labels inside the bounding box
        var labels = [];
        texts.forEach(function (t) {
          var tx = parseFloat(t.getAttribute('x'));
          var ty = parseFloat(t.getAttribute('y'));
          if (tx >= bx - 2 && tx <= bx + bw + 2 && ty >= by - 2 && ty <= by + bh + 2) {
            labels.push(t);
          }
        });

        // pick the first white/bold label as the component name
        var name = '';
        for (var j = 0; j < labels.length; j++) {
          var fw = labels[j].getAttribute('font-weight');
          var fill = labels[j].getAttribute('fill');
          if (fill === 'white' || fill === '#fff' || fill === '#ffffff') {
            name = labels[j].textContent.trim();
            break;
          }
        }
        if (!name && labels.length > 0) name = labels[0].textContent.trim();
        if (!name) return;

        compGroups.push({
          name: name,
          mask: mask,
          styled: styled,
          labels: labels,
          bounds: { x: bx, y: by, w: bw, h: bh }
        });
      });
    }

    function bindInteractions() {
      compGroups.forEach(function (comp) {
        comp.styled.style.pointerEvents = 'all';
        comp.styled.classList.add('comp-stroke');

        comp.styled.addEventListener('mouseenter', function () {
          if (focusedComp.value) return;
          highlightComponent(comp);
        });
        comp.styled.addEventListener('mouseleave', function () {
          if (focusedComp.value) return;
          clearHighlight();
        });
        comp.styled.addEventListener('click', function (e) {
          e.stopPropagation();
          if (focusedComp.value === comp) resetFocus();
          else focusComponent(comp);
        });
      });

      // background click resets focus
      svgEl.addEventListener('click', function (e) {
        if (e.target === svgEl ||
            (e.target.tagName === 'rect' && e.target.getAttribute('fill') === 'url(#grid)')) {
          resetFocus();
        }
      });

      // mark arrow + boundary elements
      arrowGroups.forEach(function (a) { a.el.classList.add('svg-arrow'); });
      svgEl.querySelectorAll(
        'rect[fill="transparent"], rect[fill="rgba(251, 191, 36, 0.04)"], rect[fill="rgba(251, 113, 133, 0.03)"]'
      ).forEach(function (r) { r.classList.add('svg-boundary'); });
    }

    function init(svg, container) {
      svgEl = svg;
      containerEl = container;
      indexComponents();
      svgEl.querySelectorAll('line[marker-end]').forEach(function (l) { indexArrow(l, false); });
      svgEl.querySelectorAll('path[marker-end]').forEach(function (p) { indexArrow(p, true); });
      bindInteractions();
    }

    return {
      focusedComp: focusedComp,
      resetFocus: resetFocus,
      init: init,
      compCount: function () { return compGroups.length; },
      arrowCount: function () { return arrowGroups.length; }
    };
  }

  /* ──────────────────────────────────────────────────────────────────
     useExport — Copy / PNG / PDF with rui-toast feedback.
     ────────────────────────────────────────────────────────────────── */
  function useExport(containerRef) {
    var exporting = Vue.ref(false);

    function snapshot() {
      var el = containerRef.value;
      if (!el) return Promise.reject(new Error('container not mounted'));
      var r = el.getBoundingClientRect();
      var pad = 32;
      return window.html2canvas(document.body, {
        backgroundColor: '#020617',
        scale: 2,
        useCORS: true,
        ignoreElements: function (e) {
          return e.classList && (
            e.classList.contains('toolbar') ||
            e.classList.contains('focus-indicator') ||
            e.classList.contains('rui-toast-container') ||
            e.classList.contains('rui-back-top-btn') ||
            e.id === 'rui-toast-host'
          );
        },
        x: r.left + window.scrollX - pad,
        y: r.top  + window.scrollY - pad,
        width:  r.width  + pad * 2,
        height: r.height + pad * 2
      });
    }

    function copyAsImage() {
      if (exporting.value) return;
      exporting.value = true;
      snapshot().then(function (canvas) {
        return new Promise(function (resolve, reject) {
          canvas.toBlob(function (blob) {
            if (!blob) { reject(new Error('canvas.toBlob returned null')); return; }
            navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]).then(resolve, reject);
          }, 'image/png');
        });
      }).then(function () {
        if (window.ruiToast) window.ruiToast.success('Copied to clipboard', 'Diagram snapshot ready to paste');
      }).catch(function (err) {
        if (window.ruiToast) window.ruiToast.error('Copy failed', err && err.message || 'Browser blocked clipboard access');
      }).finally(function () { exporting.value = false; });
    }

    function downloadPNG() {
      if (exporting.value) return;
      exporting.value = true;
      snapshot().then(function (canvas) {
        var link = document.createElement('a');
        link.download = 'index.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        if (window.ruiToast) window.ruiToast.success('PNG downloaded', 'index.png');
      }).catch(function (err) {
        if (window.ruiToast) window.ruiToast.error('PNG download failed', err && err.message || 'Unknown error');
      }).finally(function () { exporting.value = false; });
    }

    function downloadPDF() {
      if (exporting.value) return;
      exporting.value = true;
      snapshot().then(function (canvas) {
        var orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
        var pdf = new window.jspdf.jsPDF({
          orientation: orientation,
          unit: 'px',
          format: [canvas.width, canvas.height],
          hotfixes: ['px_scaling']
        });
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('index.pdf');
        if (window.ruiToast) window.ruiToast.success('PDF downloaded', 'index.pdf');
      }).catch(function (err) {
        if (window.ruiToast) window.ruiToast.error('PDF download failed', err && err.message || 'Unknown error');
      }).finally(function () { exporting.value = false; });
    }

    return { exporting: exporting, copyAsImage: copyAsImage, downloadPNG: downloadPNG, downloadPDF: downloadPDF };
  }

  /* ──────────────────────────────────────────────────────────────────
     Vue template — built once at top level so it can be passed to
     Vue.createApp. References DATA fields directly via the root
     component's `data()`.
     ────────────────────────────────────────────────────────────────── */
  var TEMPLATE = String.raw`
    <div class="container" id="report-container" ref="containerRef">

      <!-- HEADER -->
      <header class="header">
        <div class="header-row">
          <div class="pulse-dot" aria-hidden="true"></div>
          <h1>{{ meta.pageTitle }}</h1>
          <div class="toolbar" :class="{ expanded: toolbarOpen }">
            <div id="diagram-toolbar-actions" class="toolbar-actions" role="group" aria-label="Export options">
              <button type="button" @click="copyAsImage" :disabled="exporting" title="Copy as PNG to clipboard">📋 Copy</button>
              <button type="button" @click="downloadPNG"  :disabled="exporting" title="Download PNG">🖼️ PNG</button>
              <button type="button" @click="downloadPDF"  :disabled="exporting" title="Download PDF">📄 PDF</button>
            </div>
            <button type="button"
                    class="toolbar-toggle"
                    @click="toolbarOpen = !toolbarOpen"
                    :aria-expanded="toolbarOpen"
                    aria-controls="diagram-toolbar-actions"
                    title="Export options"
                    aria-label="Toggle export options">⋯</button>
          </div>
        </div>
        <p class="subtitle">{{ meta.subtitle }}</p>
      </header>

      <!-- EXECUTIVE SUMMARY -->
      <section class="exec-strip" aria-label="Executive summary">
        <div v-for="item in executiveSummary" :key="item.title" class="tile">
          <div class="tile-title" :class="item.color">{{ item.title }}</div>
          {{ item.content }}
        </div>
      </section>

      <!-- TABLE OF CONTENTS -->
      <nav class="toc" aria-label="Table of contents">
        <a v-for="link in toc" :key="link.href" :href="link.href">{{ link.icon }} {{ link.label }}</a>
      </nav>

      <!-- SYSTEM HEALTH METRICS -->
      <section class="metrics-strip" id="metrics" aria-label="System health metrics">
        <article v-for="m in metrics" :key="m.label" class="metric-tile">
          <span class="metric-label">
            <span v-if="m.status" class="status-dot" :class="m.status" aria-hidden="true"></span>
            {{ m.label }}
          </span>
          <span class="metric-value" :class="m.valueClass">{{ m.value }}</span>
          <span class="metric-sub">{{ m.sub }}</span>
        </article>
      </section>

      <!-- MAIN SVG DIAGRAM -->
      <section class="diagram-container" id="diagram" aria-label="System architecture diagram" ref="diagramContainerRef">
        <div v-html="svgDiagram"></div>
      </section>

      <!-- SUMMARY CARDS (exactly 3) -->
      <section class="cards" id="summary" aria-label="Architecture summary">
        <article v-for="card in summaryCards" :key="card.title" class="card">
          <header class="card-header">
            <span class="card-dot" :class="card.color" aria-hidden="true"></span>
            <h3 v-html="card.title"></h3>
          </header>
          <ul>
            <li v-for="(line, i) in card.items" :key="i">{{ line }}</li>
          </ul>
        </article>
      </section>

      <!-- DEPLOYMENT PIPELINE -->
      <section v-if="pipeline && pipeline.length" class="pipeline-strip" id="pipeline" aria-label="Deployment pipeline">
        <template v-for="(stage, i) in pipeline" :key="stage.badge">
          <div class="pipeline-stage">
            <span class="pipeline-badge" :class="stage.badgeClass">{{ stage.badge }}</span>
            <span class="pipeline-info" v-html="stage.info"></span>
          </div>
          <span v-if="i < pipeline.length - 1" class="pipeline-arrow" aria-hidden="true">→</span>
        </template>
      </section>

      <!-- SECURITY POSTURE -->
      <section v-if="securityCards && securityCards.length" class="cards" id="security" style="margin-top: 1.5rem;" aria-label="Security posture">
        <article v-for="card in securityCards" :key="card.title" class="card">
          <header class="card-header">
            <span class="card-dot" :class="card.color" aria-hidden="true"></span>
            <h3 v-html="card.title"></h3>
          </header>
          <ul>
            <li v-for="(line, i) in card.items" :key="i">{{ line }}</li>
          </ul>
        </article>
      </section>

      <!-- TYPICAL REQUEST TRACE -->
      <section v-if="trace && trace.length" class="panel" id="trace" aria-labelledby="trace-title">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.875rem;">
          <span id="trace-title" class="panel-header" style="margin: 0;">🔍 Typical Request Trace — Checkout Flow</span>
          <span style="font-size: 0.65rem; color: var(--text-dim);">{{ meta.traceSub }}</span>
        </div>
        <div class="trace-row">
          <template v-for="(step, i) in trace" :key="step.name">
            <div class="trace-step">
              <div class="trace-step-name" :class="step.nameClass">{{ step.name }}</div>
              <div class="trace-step-sub">{{ step.sub }}</div>
              <div class="trace-step-time">{{ step.time }}</div>
            </div>
            <span v-if="i < trace.length - 1" class="trace-arrow" aria-hidden="true">→</span>
          </template>
        </div>
      </section>

      <!-- SCALING & RESILIENCE -->
      <section v-if="scalingTiles && scalingTiles.length" class="panel" id="scaling" aria-labelledby="scaling-title">
        <h3 id="scaling-title" class="panel-header">⚖️ Scaling &amp; Resilience Policies</h3>
        <div class="panel-grid-4">
          <div v-for="tile in scalingTiles" :key="tile.title" class="tile">
            <div class="tile-title" :class="tile.color">{{ tile.title }}</div>
            <div class="tile-body" v-html="tile.body"></div>
          </div>
        </div>
      </section>

      <!-- SERVICE OWNERSHIP -->
      <section v-if="ownership && ownership.headers && ownership.headers.length" class="panel" id="ownership" style="overflow-x: auto;" aria-labelledby="ownership-title">
        <h3 id="ownership-title" class="panel-header">👥 Service Ownership &amp; On-Call</h3>
        <table class="panel-table">
          <thead>
            <tr>
              <th v-for="h in ownership.headers" :key="h">{{ h }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in ownership.rows" :key="i">
              <td v-for="(cell, j) in row" :key="j" v-html="cell"></td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- API CONTRACT -->
      <section v-if="apiTable && apiTable.headers && apiTable.headers.length" class="panel" id="api" style="overflow-x: auto;" aria-labelledby="api-title">
        <h3 id="api-title" class="panel-header">📡 API Contract Summary — Public Endpoints</h3>
        <table class="panel-table">
          <thead>
            <tr>
              <th v-for="h in apiTable.headers" :key="h">{{ h }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in apiTable.rows" :key="i">
              <td><span :style="'color: var(--color-' + row.color + '); font-weight: 600;'" v-html="row.method"></span></td>
              <td class="mono">{{ row.path }}</td>
              <td>{{ row.service }}</td>
              <td>{{ row.auth }}</td>
              <td>{{ row.rate }}</td>
              <td style="color: var(--text-muted);">{{ row.desc }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- TECHNOLOGY STACK -->
      <section v-if="stack && stack.length" class="panel" id="stack" aria-labelledby="stack-title">
        <h3 id="stack-title" class="panel-header">🧰 Technology Stack &amp; Versions</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem; font-size: 0.68rem;">
          <div v-for="kv in stack" :key="kv.label" class="kv">
            <span class="kv-label">{{ kv.label }}</span>
            <span class="kv-value" :class="kv.valueClass">{{ kv.value }}</span>
          </div>
        </div>
      </section>

      <!-- DATABASE SCHEMA -->
      <section v-if="schemaTiles && schemaTiles.length" class="panel" id="schema" style="overflow-x: auto;" aria-labelledby="schema-title">
        <h3 id="schema-title" class="panel-header">🗄️ Core Database Schema — PostgreSQL</h3>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.7rem;">
          <div v-for="t in schemaTiles" :key="t.title" class="tile" style="min-width: 160px;">
            <div class="tile-title violet">{{ t.title }}</div>
            <div class="tile-body" v-html="t.body"></div>
          </div>
        </div>
      </section>

      <!-- FUTURE ROADMAP -->
      <section v-if="roadmap && roadmap.length" class="panel" id="roadmap" aria-labelledby="roadmap-title">
        <h3 id="roadmap-title" class="panel-header">🔮 Future Roadmap &amp; Technical Debt</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.5rem; font-size: 0.68rem;">
          <div v-for="item in roadmap" :key="item.tag + item.text" class="roadmap-item">
            <span class="roadmap-tag" :class="item.tagClass">{{ item.tag }}</span>
            <span :style="item.textClass === 'muted' ? 'color: var(--text-muted);' : 'color: var(--text-secondary);'">{{ item.text }}</span>
          </div>
        </div>
      </section>

      <!-- GLOSSARY -->
      <section class="panel" aria-labelledby="glossary-title">
        <h3 id="glossary-title" class="panel-header">📖 Glossary</h3>
        <div class="glossary-grid">
          <div v-for="g in glossary" :key="g.term">
            <span class="glossary-term" :class="g.termClass">{{ g.term }}</span> — <span v-html="g.def"></span>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <p class="footer">{{ meta.footer }}</p>

      <!-- Focus indicator -->
      <div class="focus-indicator" :class="{ visible: focusedComp }" role="status" aria-live="polite">
        <span>{{ focusedComp ? 'Focused: ' + focusedComp.name : '' }}</span>
        <button type="button" @click="resetFocus">✕ Reset <kbd>Esc</kbd></button>
      </div>
    </div>
  `;

  /* ──────────────────────────────────────────────────────────────────
     Mount: assemble the page-level Vue app, register shared components,
     then install the SVG interaction composable.
     ────────────────────────────────────────────────────────────────── */
  Promise.all([whenVueReady(), whenReportDataReady()]).then(function (results) {
    var DATA = results[1];
    if (!window.Vue) {
      console.error('[arch-diagram] Vue 3 failed to load — page will not mount.');
      return;
    }

    var svgInteractions = useSvgInteractions();
    var containerRef = Vue.ref(null);
    var diagramContainerRef = Vue.ref(null);
    var exporter = useExport(containerRef);

    var app = Vue.createApp({
      template: TEMPLATE,
      data: function () {
        return {
          meta:              DATA.meta,
          executiveSummary:  DATA.executiveSummary,
          toc:               DATA.toc,
          metrics:           DATA.metrics,
          svgDiagram:        DATA.svgDiagram,
          summaryCards:      DATA.summaryCards,
          pipeline:          DATA.pipeline,
          securityCards:     DATA.securityCards,
          trace:             DATA.trace,
          scalingTiles:      DATA.scalingTiles,
          ownership:         DATA.ownership,
          apiTable:          DATA.apiTable,
          stack:             DATA.stack,
          schemaTiles:       DATA.schemaTiles,
          roadmap:           DATA.roadmap,
          glossary:          DATA.glossary,
          toolbarOpen:       false
          // focusedComp is provided by setup() (ref from useSvgInteractions)
        };
      },
      setup: function () {
        return {
          containerRef:        containerRef,
          diagramContainerRef: diagramContainerRef,
          focusedComp:         svgInteractions.focusedComp,
          exporting:           exporter.exporting,
          copyAsImage:         exporter.copyAsImage,
          downloadPNG:         exporter.downloadPNG,
          downloadPDF:         exporter.downloadPDF,
          resetFocus:          svgInteractions.resetFocus
        };
      },
      mounted: function () {
        // Initialise the SVG interaction composable on the rendered <svg>.
        //
        // Why not `this.$el.querySelector(...)`? Vue 3 wraps a multi-root
        // template's $el in a DocumentFragment (no querySelector), so
        // calling it throws `this.$el.querySelector is not a function` and
        // surfaces as a console error on first paint. We use the template
        // ref (containerRef) declared in setup() — it always points at a
        // real Element. The historical trigger was the second root
        // `<rui-back-top>`; the back-top component now self-mounts to
        // #rui-back-top-host so the template stays single-root.
        var root = this.containerRef;
        if (root) {
          var svgEl = root.querySelector('svg');
          var containerEl = root.querySelector('.diagram-container');
          if (svgEl) svgInteractions.init(svgEl, containerEl);
        }

        // Escape resets focus + closes toolbar
        this._onKey = function (e) {
          if (e.key === 'Escape') {
            svgInteractions.resetFocus();
            this.toolbarOpen = false;
          }
        }.bind(this);
        document.addEventListener('keydown', this._onKey);
      },
      beforeUnmount: function () {
        if (this._onKey) document.removeEventListener('keydown', this._onKey);
      }
    });

    // Register shared components defensively — if the shared script failed
    // to load the app still mounts.
    if (window.ruiBackTop && window.ruiBackTop.name === 'ruiBackTop') {
      app.component('rui-back-top', window.ruiBackTop);
    }
    if (window.ruiToast && window.ruiToast.name === 'ruiToast') {
      app.component('rui-toast', window.ruiToast);
    }

    app.mount('#app');
  });
})();
