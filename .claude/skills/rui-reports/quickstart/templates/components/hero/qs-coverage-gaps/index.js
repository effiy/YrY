/* ═══════════════════════════════════════════════════════════════════════════
   qs HTML CDN — qsCoverageGaps · Vue 3 callout panel
   Highlights the sections dragging the score below 90%.

   Page usage (host page):
     <script src="components/hero/qs-coverage-gaps/index.js"></script>
     <script>
       // After qs-coverage-gaps-ready:
       const app = Vue.createApp({ ... });
       app.component('qs-coverage-gaps', window.qsCoverageGaps);
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'qsCoverageGaps',
        configKey:     'QS_COVERAGE_GAPS_CONFIG',
        cssMarker:     'qs-coverage-gaps-css',
        readyEvent:    'qs-coverage-gaps-ready',
        errorEvent:    'qs-coverage-gaps-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'qs-coverage-gaps-tpl',
            loadTimeoutMs: 5000,
            defaults: { hint: '' }
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'qsCoverageGaps',
                template: tpl,
                props: {
                    gaps: { type: Array, default: function () { return []; } },
                    hint: { type: String, default: function () { return cfg.defaults.hint; } }
                }
            };
        }
    });
})();
