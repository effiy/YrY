/* ═══════════════════════════════════════════════════════════════════════════
   qs HTML CDN — qsHeroPath · Vue 3 5-step onboarding node graph
   Horizontal ordered step graph. Each step has a number, name, outcome,
   type tag, and ref. The doneSet highlights cleared steps.

   Page usage (host page):
     <script src="components/hero/qs-hero-path/index.js"></script>
     <script>
       // After qs-hero-path-ready:
       const app = Vue.createApp({ ... });
       app.component('qs-hero-path', window.qsHeroPath);
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'qsHeroPath',
        configKey:     'QS_HERO_PATH_CONFIG',
        cssMarker:     'qs-hero-path-css',
        readyEvent:    'qs-hero-path-ready',
        errorEvent:    'qs-hero-path-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'qs-hero-path-tpl',
            loadTimeoutMs: 5000,
            defaults: {}
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'qsHeroPath',
                template: tpl,
                props: {
                    steps:   { type: Array, required: true },
                    doneSet: { type: Object, default: function () { return new Set(); } }
                }
            };
        }
    });
})();
