/* ═══════════════════════════════════════════════════════════════════════════
   rui HTML CDN — ruiStatsGrid · Vue 3 stats-card component (single-file entry)

   Applicable to: progress overview · KPI total · multi-card stat panels

   Page usage (host page):
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../rui-html-cdn/rui-stats-grid/index.js"></script>
     <div id="stats-grid"></div>
     <script>
       window.ruiStatsGrid.mount({ items: [{ value: 16, label: '已完成', modifier: 'pass' }, ...] }, '#stats-grid').then(app => { ... });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'ruiStatsGrid',
        configKey:     'rui_STATS_GRID_CONFIG',
        cssMarker:     'rui-stats-grid-css',
        readyEvent:    'rui-stats-grid-ready',
        errorEvent:    'rui-stats-grid-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'rui-stats-grid-tpl',
            loadTimeoutMs: ruiComponentHelpers.DEFAULT_LOAD_TIMEOUT_MS,
            defaults: { layout: 'grid' }
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'ruiStatsGrid',
                template: tpl,
                props: {
                    items:  { type: Array,  required: true },
                    layout: { type: String, default: function () { return cfg.defaults.layout; } }
                }
            };
        }
    });
})();
