/* ═══════════════════════════════════════════════════════════════════════════
   qs HTML CDN — qsModal · Vue 3 command-detail modal
   Shows a single command/concept with copy-to-clipboard action.

   Page usage (host page):
     <script src="components/overlay/qs-modal/index.js"></script>
     <script>
       // After qs-modal-ready, mount a Vue sub-app:
       const app = Vue.createApp({ ... });
       app.component('qs-modal', window.qsModal);
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'qsModal',
        configKey:     'QS_MODAL_CONFIG',
        cssMarker:     'qs-modal-css',
        readyEvent:    'qs-modal-ready',
        errorEvent:    'qs-modal-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'qs-modal-tpl',
            loadTimeoutMs: 5000,
            defaults: {}
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'qsModal',
                template: tpl,
                props: {
                    command: { type: Object, required: true }
                },
                emits: ['close'],
                data: function () {
                    return { copyHint: '' };
                },
                methods: {
                    close: function () { this.$emit('close'); },
                    copy: function () {
                        var text = (this.command && this.command.command) || '';
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(text).then(this.flash.bind(null, 'Copied to clipboard'));
                        } else {
                            /* Fallback: hidden textarea */
                            var ta = document.createElement('textarea');
                            ta.value = text;
                            ta.style.position = 'fixed';
                            ta.style.opacity = '0';
                            document.body.appendChild(ta);
                            ta.focus();
                            ta.select();
                            try { document.execCommand('copy'); this.flash('Copied to clipboard'); }
                            catch (e) { this.flash('Copy failed'); }
                            document.body.removeChild(ta);
                        }
                    },
                    flash: function (msg) {
                        var self = this;
                        self.copyHint = msg;
                        setTimeout(function () { self.copyHint = ''; }, 1500);
                    },
                    onKey: function (e) {
                        if (e.key === 'Escape') { e.preventDefault(); this.close(); }
                    }
                },
                mounted: function () {
                    var self = this;
                    document.addEventListener('keydown', self._onEsc = function (e) {
                        if (e.key === 'Escape') self.close();
                    });
                },
                beforeUnmount: function () {
                    if (this._onEsc) document.removeEventListener('keydown', this._onEsc);
                }
            };
        }
    });
})();
