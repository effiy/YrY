/* ═══════════════════════════════════════════════════════════════════════════
   rui HTML CDN — ruiTagChip · Vue 3 tag-chip component (single-file entry)

   Applicable to: tag rows (tags-row) inside cards · status badges · role categories

   Page usage (host page):
     <script src="/YiPet/libs/vue.global.js"></script>
     <script src="/YiPet/cdn/components/rui-tag-chip/index.js"></script>
     <div id="tag-row"></div>
     <script>
       window.ruiTagChip.mount({ text: 'self-built', modifier: 'accent' }, '#tag-row').then(app => { ... });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'ruiTagChip',
        configKey:     'rui_TAG_CHIP_CONFIG',
        cssMarker:     'rui-tag-chip-css',
        readyEvent:    'rui-tag-chip-ready',
        errorEvent:    'rui-tag-chip-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'rui-tag-chip-tpl',
            loadTimeoutMs: ruiComponentHelpers.DEFAULT_LOAD_TIMEOUT_MS,
            defaults: { modifier: 'info' }
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'ruiTagChip',
                template: tpl,
                props: {
                    text:     { type: String, required: true },
                    modifier: { type: String, default: function () { return cfg.defaults.modifier; } },
                    href:     { type: String, default: '' }
                }
            };
        }
    });
})();
