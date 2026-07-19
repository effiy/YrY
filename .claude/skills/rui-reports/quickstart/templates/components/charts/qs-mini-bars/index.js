/* ═══════════════════════════════════════════════════════════════════════════
   qs HTML CDN — qsMiniBars · Vue 3 compact group bar list
   Stacked bar list. Pass [{ name, value, color }] to rows.

   Page usage (host page):
     <script src="components/charts/qs-mini-bars/index.js"></script>
     <script>
       // After qs-mini-bars-ready:
       const app = Vue.createApp({ ... });
       app.component('qs-mini-bars', window.qsMiniBars);
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'qsMiniBars',
        configKey:     'QS_MINI_BARS_CONFIG',
        cssMarker:     'qs-mini-bars-css',
        readyEvent:    'qs-mini-bars-ready',
        errorEvent:    'qs-mini-bars-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'qs-mini-bars-tpl',
            loadTimeoutMs: 5000,
            defaults: {}
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'qsMiniBars',
                template: tpl,
                props: {
                    rows: { type: Array, required: true }
                },
                methods: {
                    pct: function (r) {
                        var m = Math.max.apply(null, this.rows.map(function (x) { return x.value; }));
                        return Math.min(100, Math.max(0, (r.value / (m || 1)) * 100));
                    }
                }
            };
        }
    });
})();
