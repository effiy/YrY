/* ═══════════════════════════════════════════════════════════════════════════
   qs HTML CDN — qsSkillLandscape · Vue 3 skill-group treemap
   Sized grid treemap + growth sparkline + distribution legend.
   Requires qs-sparkline to be registered as a global component on the
   same Vue app.

   Page usage (host page):
     <script src="components/charts/qs-sparkline/index.js"></script>
     <script src="components/hero/qs-skill-landscape/index.js"></script>
     <script>
       // After both *-ready events:
       const app = Vue.createApp({ ... });
       app.component('qs-sparkline',     window.qsSparkline);
       app.component('qs-skill-landscape', window.qsSkillLandscape);
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'qsSkillLandscape',
        configKey:     'QS_SKILL_LANDSCAPE_CONFIG',
        cssMarker:     'qs-skill-landscape-css',
        readyEvent:    'qs-skill-landscape-ready',
        errorEvent:    'qs-skill-landscape-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'qs-skill-landscape-tpl',
            loadTimeoutMs: 5000,
            defaults: {}
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'qsSkillLandscape',
                template: tpl,
                props: {
                    data: { type: Object, required: true }
                },
                methods: {
                    // Assign each cell a grid column/row span by share %
                    // so the largest groups get more visual real estate.
                    span: function (group) {
                        if (group.share >= 30) return { col: 'span 2', row: 'span 2' };
                        if (group.share >= 15) return { col: 'span 2', row: 'span 1' };
                        if (group.share >= 8)  return { col: 'span 1', row: 'span 2' };
                        return { col: 'span 1', row: 'span 1' };
                    }
                }
            };
        }
    });
})();
