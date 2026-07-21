/* ═══════════════════════════════════════════════════════════════════════════
   rui HTML CDN — ruiScoreBar · Vue 3 score-bar component (single-file entry)

   Unified report-score header used by every rui-report-* page.

   Page usage (host page):
     <script src="/YiPet/libs/vue.global.js"></script>
     <script src="/YiPet/cdn/components/rui-score-bar/index.js"></script>
     <div id="score-bar"></div>
     <script>
       window.ruiScoreBar.mount({ score: { grade: 'B', value: 72, trend: 'up', weights: [...] }, alerts: { p0: 1, p1: 4, p2: 12 } }, '#score-bar').then(app => { ... });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'ruiScoreBar',
        configKey:     'rui_SCORE_BAR_CONFIG',
        cssMarker:     'rui-score-bar-css',
        readyEvent:    'rui-score-bar-ready',
        errorEvent:    'rui-score-bar-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'rui-score-bar-tpl',
            loadTimeoutMs: ruiComponentHelpers.DEFAULT_LOAD_TIMEOUT_MS,
            defaults: { label: 'Score', showAlerts: true }
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'ruiScoreBar',
                template: tpl,
                props: {
                    score:      { type: Object,  required: true },
                    alerts:     { type: Object,  default: function () { return null; } },
                    label:      { type: String,  default: function () { return cfg.defaults.label; } },
                    showAlerts: { type: Boolean, default: function () { return cfg.defaults.showAlerts; } }
                }
            };
        }
    });
})();
