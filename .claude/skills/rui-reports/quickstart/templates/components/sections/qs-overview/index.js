/* ═══════════════════════════════════════════════════════════════════════════
   qs HTML CDN — qsOverview · Vue 3 overview section renderer
   Renders the overview section body: by-the-numbers, stack diagram,
   KPI grid with sparklines, what-you'll-ship, and skill landscape.
   Depends on qs-stack-diagram, qs-skill-landscape, qs-sparkline.

   Page usage (host page):
     <script src="components/sections/qs-overview/index.js"></script>
     <script>
       // After qs-overview-ready:
       const app = Vue.createApp({ ... });
       app.component('qs-overview', window.qsOverview);
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'qsOverview',
        configKey:     'QS_OVERVIEW_CONFIG',
        cssMarker:     'qs-overview-css',
        readyEvent:    'qs-overview-ready',
        errorEvent:    'qs-overview-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'qs-overview-tpl',
            loadTimeoutMs: 5000,
            defaults: {}
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'qsOverview',
                template: tpl,
                props: {
                    section:    { type: Object, required: true },
                    paletteOpen:{ type: Boolean, default: false },
                    roleFilter: { type: Array,  default: function () { return []; } }
                },
                methods: {
                    kpiTone: function (idx) {
                        // Cycle accent → cyan → pass → warn across the 4 tiles.
                        return ['accent', 'cyan', 'pass', 'warn'][idx % 4];
                    }
                }
            };
        }
    });
})();
