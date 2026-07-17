/* ═══════════════════════════════════════════════════════════════════════════
   rui HTML CDN — ruiProgressBar · Vue 3 progress bar component (single-file entry)

   A lightweight progress bar component for scores, completion rates, and
   metric visualization. Use this instead of manually building bar/width spans.

   Props:
     value     — numeric percentage (0-100), required
     label     — text label shown before the bar
     showValue — whether to show the numeric value (default true)
     modifier  — color variant: accent (default), cyan, pass, fail, warn, info, health

   Page usage (host page):
     <script src="/.claude/shared/vendor/vue@3.4.27/vue.global.prod.js"></script>
     <script src="/.claude/shared/rui-progress-bar/index.js"></script>
     <div id="bar"></div>
     <script>
       window.ruiProgressBar.mount({ label: 'Coverage', value: 72 }, '#bar');
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'ruiProgressBar',
        configKey:     'rui_PROGRESS_BAR_CONFIG',
        cssMarker:     'rui-progress-bar-css',
        readyEvent:    'rui-progress-bar-ready',
        errorEvent:    'rui-progress-bar-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'rui-progress-bar-tpl',
            loadTimeoutMs: ruiComponentHelpers.DEFAULT_LOAD_TIMEOUT_MS,
            defaults: { modifier: 'accent', showValue: true }
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'ruiProgressBar',
                template: tpl,
                props: {
                    value:     { type: Number, required: true },
                    label:     { type: String, default: '' },
                    showValue: { type: Boolean, default: function () { return cfg.defaults.showValue; } },
                    modifier:  { type: String, default: function () { return cfg.defaults.modifier; } }
                }
            };
        }
    });
})();
