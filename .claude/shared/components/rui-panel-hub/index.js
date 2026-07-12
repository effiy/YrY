/* ═══════════════════════════════════════════════════════════════════════════
   rui HTML CDN — ruiPanelHub · Vue 3 panel-hub toolbar component (single-file entry)

   This file registers the ruiPanelHub Vue 3 toolbar component via the standard
   rui-* loader chain. The window.PanelHub global API (panel open/close/register)
   has been extracted to panel-hub-api.js and loads synchronously before this script.

   Page usage (host page):
     <script src="../../../../rui-html-cdn/rui-panel-hub/panel-hub-api.js"></script>
     <script src="../../../../rui-html-cdn/rui-panel-hub/index.js"></script>
     <div id="panel-hub-host"></div>
     <script>
       window.ruiPanelHub.mount({ buttons: [...] }, '#panel-hub-host').then(app => { ... });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'ruiPanelHub',
        configKey:     'rui_PANEL_HUB_CONFIG',
        cssMarker:     'rui-panel-hub-css',
        readyEvent:    'rui-panel-hub-ready',
        errorEvent:    'rui-panel-hub-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'rui-panel-hub-tpl',
            loadTimeoutMs: ruiComponentHelpers.DEFAULT_LOAD_TIMEOUT_MS,
            defaults: {
                ariaLabel: 'Panel hub toolbar',
                flow:      ''
            }
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'ruiPanelHub',
                template: tpl,
                props: {
                    label:     { type: Object, default: null },
                    buttons:   { type: Array,  required: true },
                    flow:      { type: String, default: function () { return cfg.defaults.flow; } },
                    ariaLabel: { type: String, default: function () { return cfg.defaults.ariaLabel; } }
                },
                methods: {
                    onSelect: function (panel) {
                        this.$el.dispatchEvent(new CustomEvent('panel-hub-select', {
                            detail:  { panel: panel },
                            bubbles: true
                        }));
                    },
                    onLabelClick: function () {
                        if (this.label && this.label.panel) this.onSelect(this.label.panel);
                    }
                }
            };
        }
    });
})();
