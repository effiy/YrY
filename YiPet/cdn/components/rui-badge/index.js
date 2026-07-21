/* ═══════════════════════════════════════════════════════════════════════════
   rui HTML CDN — ruiBadge · Vue 3 badge component (single-file entry)

   A small inline badge/label component for status indicators, alert chips,
   and tag-like elements. Use this instead of inline styled spans.

   Supported modifiers:
     accent, info, cyan, green, purple, red, warn, blue, pass, fail, vip

   Supported sizes:
     sm (small — for inline use like scene-card badges)
     md (medium — default, for standalone alert chips)

   Page usage (host page):
     <script src="/YiPet/libs/vue.global.js"></script>
     <script src="/YiPet/cdn/components/rui-badge/index.js"></script>
     <div id="badge"></div>
     <script>
       window.ruiBadge.mount({ text: 'NEW', modifier: 'fail', size: 'sm' }, '#badge');
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'ruiBadge',
        configKey:     'rui_BADGE_CONFIG',
        cssMarker:     'rui-badge-css',
        readyEvent:    'rui-badge-ready',
        errorEvent:    'rui-badge-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'rui-badge-tpl',
            loadTimeoutMs: ruiComponentHelpers.DEFAULT_LOAD_TIMEOUT_MS,
            defaults: { modifier: 'info', size: 'md' }
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'ruiBadge',
                template: tpl,
                props: {
                    text:     { type: String, required: true },
                    modifier: { type: String, default: function () { return cfg.defaults.modifier; } },
                    size:     { type: String, default: function () { return cfg.defaults.size; } }
                },
                computed: {
                    sizeClass: function () {
                        var validSizes = ['sm', 'md'];
                        if (validSizes.indexOf(this.size) === -1) {
                            console.warn('[ruiBadge] unknown size "' + this.size + '", falling back to "md"');
                            return 'rui-badge--md';
                        }
                        return 'rui-badge--' + this.size;
                    }
                }
            };
        }
    });
})();
