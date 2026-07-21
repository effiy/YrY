/* ═══════════════════════════════════════════════════════════════════════════
   rui HTML CDN — ruiBreadcrumb · Vue 3 breadcrumb component (single-file entry)

   Applicable to: review · test panel · demo · plan list · architecture diagram · knowledge graph

   Page usage (host page):
     <script src="/YiPet/libs/vue.global.js"></script>
     <script src="/YiPet/cdn/components/rui-breadcrumb/index.js"></script>
     <div id="bc-host"></div>
     <script>
       window.ruiBreadcrumb.mount({ items: [{ label: 'Home', href: '/' }, { label: 'Current' }] }, '#bc-host').then(app => { ... });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'ruiBreadcrumb',
        configKey:     'rui_BREADCRUMB_CONFIG',
        cssMarker:     'rui-breadcrumb-css',
        readyEvent:    'rui-breadcrumb-ready',
        errorEvent:    'rui-breadcrumb-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'rui-breadcrumb-tpl',
            loadTimeoutMs: ruiComponentHelpers.DEFAULT_LOAD_TIMEOUT_MS,
            defaults: {
                ariaLabel: 'Breadcrumb navigation',
                separator: '/'
            }
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'ruiBreadcrumb',
                template: tpl,
                props: {
                    items:     { type: Array,  required: true },
                    ariaLabel: { type: String, default: function () { return cfg.defaults.ariaLabel; } },
                    separator: { type: String, default: function () { return cfg.defaults.separator; } }
                }
            };
        }
    });
})();
