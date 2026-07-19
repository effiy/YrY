/* ═══════════════════════════════════════════════════════════════════════════
   qs HTML CDN — qsStackDiagram · Vue 3 layered tech-stack diagram
   Vertical layers with tier label + inline item chips.

   Page usage (host page):
     <script src="components/hero/qs-stack-diagram/index.js"></script>
     <script>
       // After qs-stack-diagram-ready:
       const app = Vue.createApp({ ... });
       app.component('qs-stack-diagram', window.qsStackDiagram);
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'qsStackDiagram',
        configKey:     'QS_STACK_DIAGRAM_CONFIG',
        cssMarker:     'qs-stack-diagram-css',
        readyEvent:    'qs-stack-diagram-ready',
        errorEvent:    'qs-stack-diagram-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'qs-stack-diagram-tpl',
            loadTimeoutMs: 5000,
            defaults: {}
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'qsStackDiagram',
                template: tpl,
                props: {
                    data: { type: Object, required: true }
                }
            };
        }
    });
})();
