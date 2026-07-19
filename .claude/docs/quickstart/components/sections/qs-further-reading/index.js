/* ═══════════════════════════════════════════════════════════════════════════
   qs HTML CDN — qsFurtherReading · Vue 3 further-reading section renderer
   Card grid of { title, href, description, kind } outbound links.

   Page usage (host page):
     <script src="components/sections/qs-further-reading/index.js"></script>
     <script>
       // After qs-further-reading-ready:
       const app = Vue.createApp({ ... });
       app.component('qs-further-reading', window.qsFurtherReading);
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'qsFurtherReading',
        configKey:     'QS_FURTHER_READING_CONFIG',
        cssMarker:     'qs-further-reading-css',
        readyEvent:    'qs-further-reading-ready',
        errorEvent:    'qs-further-reading-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'qs-further-reading-tpl',
            loadTimeoutMs: 5000,
            defaults: {}
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'qsFurtherReading',
                template: tpl,
                props: {
                    section: { type: Object, required: true }
                }
            };
        }
    });
})();
