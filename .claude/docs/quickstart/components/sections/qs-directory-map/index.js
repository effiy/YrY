/* ═══════════════════════════════════════════════════════════════════════════
   qs HTML CDN — qsDirectoryMap · Vue 3 directory-map section renderer
   Preformatted tree + annotation grid.

   Page usage (host page):
     <script src="components/sections/qs-directory-map/index.js"></script>
     <script>
       // After qs-directory-map-ready:
       const app = Vue.createApp({ ... });
       app.component('qs-directory-map', window.qsDirectoryMap);
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'qsDirectoryMap',
        configKey:     'QS_DIRECTORY_MAP_CONFIG',
        cssMarker:     'qs-directory-map-css',
        readyEvent:    'qs-directory-map-ready',
        errorEvent:    'qs-directory-map-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'qs-directory-map-tpl',
            loadTimeoutMs: 5000,
            defaults: {}
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'qsDirectoryMap',
                template: tpl,
                props: {
                    section: { type: Object, required: true }
                }
            };
        }
    });
})();
