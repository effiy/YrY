/* ═══════════════════════════════════════════════════════════════════════════
   qs HTML CDN — qsFaq · Vue 3 FAQ section renderer
   Q&A pairs. Click the question to toggle. The host supplies a
   `collapsed` array (question indices currently collapsed) and listens
   for `toggle-question` events.

   Page usage (host page):
     <script src="components/sections/qs-faq/index.js"></script>
     <script>
       // After qs-faq-ready:
       const app = Vue.createApp({ ... });
       app.component('qs-faq', window.qsFaq);
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'qsFaq',
        configKey:     'QS_FAQ_CONFIG',
        cssMarker:     'qs-faq-css',
        readyEvent:    'qs-faq-ready',
        errorEvent:    'qs-faq-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'qs-faq-tpl',
            loadTimeoutMs: 5000,
            defaults: {}
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'qsFaq',
                template: tpl,
                props: {
                    section:   { type: Object, required: true },
                    collapsed: { type: Array,  default: function () { return []; } }
                },
                emits: ['toggle-question'],
                methods: {
                    isOpen: function (i) { return this.collapsed.indexOf(i) < 0; },
                    toggle: function (i) { this.$emit('toggle-question', i); }
                }
            };
        }
    });
})();
