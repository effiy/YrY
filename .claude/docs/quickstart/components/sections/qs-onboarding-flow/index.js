/* ═══════════════════════════════════════════════════════════════════════════
   qs HTML CDN — qsOnboardingFlow · Vue 3 onboarding-flow section renderer
   Step tracker with localStorage progress + ordered step list. Emits
   `update:done-steps` when the user toggles a step and `open-command`
   when a step's command is clicked.

   Page usage (host page):
     <script src="components/sections/qs-onboarding-flow/index.js"></script>
     <script>
       // After qs-onboarding-flow-ready:
       const app = Vue.createApp({ ... });
       app.component('qs-onboarding-flow', window.qsOnboardingFlow);
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'qsOnboardingFlow',
        configKey:     'QS_ONBOARDING_FLOW_CONFIG',
        cssMarker:     'qs-onboarding-flow-css',
        readyEvent:    'qs-onboarding-flow-ready',
        errorEvent:    'qs-onboarding-flow-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'qs-onboarding-flow-tpl',
            loadTimeoutMs: 5000,
            defaults: {}
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'qsOnboardingFlow',
                template: tpl,
                props: {
                    section:   { type: Object, required: true },
                    doneSteps: { type: Object, default: function () { return new Set(); } }
                },
                emits: ['update:done-steps', 'open-command'],
                computed: {
                    steps: function () { return this.section.steps || []; },
                    progressPct: function () {
                        return this.steps.length
                            ? Math.round((this.doneSteps.size / this.steps.length) * 100)
                            : 0;
                    }
                },
                methods: {
                    toggleStep: function (i) {
                        var next = new Set(this.doneSteps);
                        if (next.has(i)) next.delete(i);
                        else next.add(i);
                        this.$emit('update:done-steps', next);
                    },
                    reset: function () { this.$emit('update:done-steps', new Set()); },
                    openCommand: function (step) {
                        this.$emit('open-command', {
                            name:        'onboarding-step-' + (step.order || ''),
                            command:     step.command,
                            description: step.action,
                            source:      'Onboarding flow'
                        });
                    }
                }
            };
        }
    });
})();
