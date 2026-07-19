/* ═══════════════════════════════════════════════════════════════════════════
   qs HTML CDN — qsCoverageCell · Vue 3 radial progress cell
   Small radial progress dial (SVG) with label + value text.

   Page usage (host page):
     <script src="components/charts/qs-coverage-cell/index.js"></script>
     <script>
       // After qs-coverage-cell-ready:
       const app = Vue.createApp({ ... });
       app.component('qs-coverage-cell', window.qsCoverageCell);
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'qsCoverageCell',
        configKey:     'QS_COVERAGE_CELL_CONFIG',
        cssMarker:     'qs-coverage-cell-css',
        readyEvent:    'qs-coverage-cell-ready',
        errorEvent:    'qs-coverage-cell-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'qs-coverage-cell-tpl',
            loadTimeoutMs: 5000,
            defaults: { size: 48 }
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'qsCoverageCell',
                template: tpl,
                props: {
                    label:  { type: String, required: true },
                    value:  { type: Number, default: 0 },
                    verdict:{ type: String, default: 'pass' },
                    size:   { type: Number, default: function () { return cfg.defaults.size; } }
                },
                computed: {
                    circ()   { return 2 * Math.PI * 15; },
                    offset() { return this.circ * (1 - Math.max(0, Math.min(100, this.value)) / 100); }
                }
            };
        }
    });
})();
