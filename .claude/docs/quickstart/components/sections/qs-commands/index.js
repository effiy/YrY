/* ═══════════════════════════════════════════════════════════════════════════
   qs HTML CDN — qsCommands · Vue 3 commands section renderer
   Table of { name, command, description, source }. Emits
   `open-command` with the row payload when a row is clicked.

   Page usage (host page):
     <script src="components/sections/qs-commands/index.js"></script>
     <script>
       // After qs-commands-ready:
       const app = Vue.createApp({ ... });
       app.component('qs-commands', window.qsCommands);
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'qsCommands',
        configKey:     'QS_COMMANDS_CONFIG',
        cssMarker:     'qs-commands-css',
        readyEvent:    'qs-commands-ready',
        errorEvent:    'qs-commands-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'qs-commands-tpl',
            loadTimeoutMs: 5000,
            defaults: {}
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'qsCommands',
                template: tpl,
                props: {
                    section: { type: Object, required: true }
                },
                emits: ['open-command'],
                methods: {
                    open: function (c) { this.$emit('open-command', c); }
                }
            };
        }
    });
})();
