/* ═══════════════════════════════════════════════════════════════════════════
   rui HTML CDN — ruiCrossNav · Vue 3 cross-navigation component (single-file entry)

   Applicable to: scene pages · quick jump between the 7 deliverable types
                  (list / arch / kg / source / test / demo / review)

   Page usage (host page):
     <script src="/.claude/shared/vendor/vue@3.4.27/vue.global.prod.js"></script>
     <script src="/.claude/shared/rui-cross-nav/index.js"></script>
     <div id="cross-nav-host"></div>
     <script>
       window.ruiCrossNav.mount({ basePath: './', active: 'Checklist', pages: [{ id: 'Checklist', icon: '📋', href: 'plan-checklist.html' }, ...] }, '#cross-nav-host').then(app => { ... });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'ruiCrossNav',
        configKey:     'rui_CROSS_NAV_CONFIG',
        cssMarker:     'rui-cross-nav-css',
        readyEvent:    'rui-cross-nav-ready',
        errorEvent:    'rui-cross-nav-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'rui-cross-nav-tpl',
            loadTimeoutMs: ruiComponentHelpers.DEFAULT_LOAD_TIMEOUT_MS,
            defaults: {
                basePath:        './',
                separator:       '·',
                active:          '',
                ariaLabel:       'Cross navigation',
                activeAriaLabel: 'Current page'
            }
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'ruiCrossNav',
                template: tpl,
                props: {
                    pages:           { type: Array,  required: true },
                    basePath:        { type: String, default: function () { return cfg.defaults.basePath; } },
                    active:          { type: String, default: function () { return cfg.defaults.active; } },
                    separator:       { type: String, default: function () { return cfg.defaults.separator; } },
                    ariaLabel:       { type: String, default: function () { return cfg.defaults.ariaLabel; } },
                    activeAriaLabel: { type: String, default: function () { return cfg.defaults.activeAriaLabel; } }
                }
            };
        }
    });
})();
