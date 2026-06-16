/* ==========================================================================
   yry-export-toolbar/index.js — Zero-config export toolbar

   Usage:
     <div class="yry-export-toolbar" data-target="#container" data-filename="my-export">
       <button data-action="copy-png">📋 Copy PNG</button>
       <button data-action="download-png">🖼 PNG</button>
       <button data-action="download-pdf">📄 PDF</button>
       <button data-action="copy-svg">📋 Copy SVG</button>
       <button data-action="download-svg">📄 SVG</button>
     </div>
     <script src="path/to/yry-export-toolbar/index.js"></script>

   data-target: CSS selector for the container to capture (default: '#report-container')
   data-filename: base filename without extension (default: 'export')
   data-bg: background color for canvas (default: '#020617')
   data-scale: pixel scale factor (default: '2')

   Dependencies (must be loaded before this script):
     - html2canvas (for PNG/PDF export)
     - jspdf (for PDF export, via window.jspdf)
   ========================================================================== */

(function () {
  'use strict';

  var STATUS_OK = 'yry-export-ok';
  var STATUS_ERR = 'yry-export-err';
  var STATUS_BUSY = 'yry-export-busy';
  var FEEDBACK_DURATION = 2000;

  // ── Helpers ───────────────────────────────────────────────────────────────

  function setStatus(btn, cls, text) {
    btn.classList.remove(STATUS_OK, STATUS_ERR, STATUS_BUSY);
    if (cls) btn.classList.add(cls);
    if (text !== undefined) btn.textContent = text;
  }

  function restoreAfter(btn, origText) {
    setTimeout(function () {
      btn.classList.remove(STATUS_OK, STATUS_ERR, STATUS_BUSY);
      btn.textContent = origText;
    }, FEEDBACK_DURATION);
  }

  function resolveTarget(selector) {
    if (!selector) return document.getElementById('report-container') || document.body;
    var el = document.querySelector(selector);
    return el || document.getElementById('report-container') || document.body;
  }

  function getRect(el, pad) {
    var r = el.getBoundingClientRect();
    return {
      x: r.left + window.scrollX - pad,
      y: r.top + window.scrollY - pad,
      width: r.width + pad * 2,
      height: r.height + pad * 2
    };
  }

  // ── Canvas rendering ──────────────────────────────────────────────────────

  function captureElement(el, opts) {
    var pad = opts.pad || 32;
    var bg = opts.bg || '#020617';
    var scale = opts.scale || 2;
    var r = getRect(el, pad);
    return html2canvas(document.body, {
      backgroundColor: bg,
      scale: scale,
      useCORS: true,
      ignoreElements: function (e) {
        return e.classList && e.classList.contains('yry-export-toolbar');
      },
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height
    });
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  function copyPNG(btn, el, opts) {
    var orig = btn.textContent;
    setStatus(btn, STATUS_BUSY, '⏳ ...');
    captureElement(el, opts).then(function (canvas) {
      return new Promise(function (resolve) { canvas.toBlob(resolve, 'image/png'); });
    }).then(function (blob) {
      return navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    }).then(function () {
      setStatus(btn, STATUS_OK, '✓ Copied!');
      restoreAfter(btn, orig);
    }).catch(function () {
      setStatus(btn, STATUS_ERR, '✗ Failed');
      restoreAfter(btn, orig);
    });
  }

  function downloadPNG(btn, el, opts) {
    var orig = btn.textContent;
    setStatus(btn, STATUS_BUSY, '⏳ ...');
    captureElement(el, opts).then(function (canvas) {
      var link = document.createElement('a');
      link.download = (opts.filename || 'export') + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      setStatus(btn, STATUS_OK, '✓ Done!');
      restoreAfter(btn, orig);
    }).catch(function () {
      setStatus(btn, STATUS_ERR, '✗ Failed');
      restoreAfter(btn, orig);
    });
  }

  function downloadPDF(btn, el, opts) {
    var orig = btn.textContent;
    setStatus(btn, STATUS_BUSY, '⏳ ...');
    captureElement(el, opts).then(function (canvas) {
      var imgData = canvas.toDataURL('image/png');
      var jsPDF = window.jspdf ? window.jspdf.jsPDF : null;
      if (!jsPDF) throw new Error('jsPDF not loaded');
      var orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
      var pdf = new jsPDF({
        orientation: orientation,
        unit: 'px',
        format: [canvas.width, canvas.height],
        hotfixes: ['px_scaling']
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save((opts.filename || 'export') + '.pdf');
      setStatus(btn, STATUS_OK, '✓ Done!');
      restoreAfter(btn, orig);
    }).catch(function () {
      setStatus(btn, STATUS_ERR, '✗ Failed');
      restoreAfter(btn, orig);
    });
  }

  function copySVG(btn, el, opts) {
    var orig = btn.textContent;
    try {
      var svg = el.querySelector('svg');
      if (!svg) throw new Error('No SVG found in target');
      navigator.clipboard.writeText(svg.outerHTML).then(function () {
        setStatus(btn, STATUS_OK, '✓ Copied');
        restoreAfter(btn, orig);
      }).catch(function () {
        setStatus(btn, STATUS_ERR, '✗ Failed');
        restoreAfter(btn, orig);
      });
    } catch (e) {
      setStatus(btn, STATUS_ERR, '✗ Failed');
      restoreAfter(btn, orig);
    }
  }

  function downloadSVG(btn, el, opts) {
    var orig = btn.textContent;
    try {
      var svg = el.querySelector('svg');
      if (!svg) throw new Error('No SVG found in target');
      var blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = (opts.filename || 'export') + '.svg';
      link.click();
      setStatus(btn, STATUS_OK, '✓ Done!');
      restoreAfter(btn, orig);
    } catch (e) {
      setStatus(btn, STATUS_ERR, '✗ Failed');
      restoreAfter(btn, orig);
    }
  }

  // ── Action dispatch ───────────────────────────────────────────────────────

  var ACTIONS = {
    'copy-png': copyPNG,
    'download-png': downloadPNG,
    'download-pdf': downloadPDF,
    'copy-svg': copySVG,
    'download-svg': downloadSVG
  };

  // ── Initialization ────────────────────────────────────────────────────────

  function initToolbar(toolbar) {
    var targetSelector = toolbar.getAttribute('data-target') || '#report-container';
    var filename = toolbar.getAttribute('data-filename') || 'export';
    var bg = toolbar.getAttribute('data-bg') || '#020617';
    var scale = parseInt(toolbar.getAttribute('data-scale') || '2', 10);
    var pad = parseInt(toolbar.getAttribute('data-pad') || '32', 10);

    var opts = { filename: filename, bg: bg, scale: scale, pad: pad };

    // Resolve target lazily on each action (element may not be in DOM at init time)
    toolbar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-action');
      var handler = ACTIONS[action];
      if (!handler) return;

      var el = resolveTarget(targetSelector);
      handler(btn, el, opts);
    });
  }

  function initAll() {
    var toolbars = document.querySelectorAll('.yry-export-toolbar');
    for (var i = 0; i < toolbars.length; i++) {
      initToolbar(toolbars[i]);
    }
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Expose for manual init
  window.YrYExportToolbar = { init: initAll, initToolbar: initToolbar };
})();
