/* ═══════════════════════════════════════════════════════════════════════════
   qs HTML CDN — qsConcepts · Vue 3 concepts section renderer
   Multi-select role filter + concept card grid. Active roles persist
   via the roleFilter prop on the host.

   Page usage (host page):
     <script src="components/sections/qs-concepts/index.js"></script>
     <script>
       // After qs-concepts-ready:
       const app = Vue.createApp({ ... });
       app.component('qs-concepts', window.qsConcepts);
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'qsConcepts',
        configKey:     'QS_CONCEPTS_CONFIG',
        cssMarker:     'qs-concepts-css',
        readyEvent:    'qs-concepts-ready',
        errorEvent:    'qs-concepts-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'qs-concepts-tpl',
            loadTimeoutMs: 5000,
            defaults: {}
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'qsConcepts',
                template: tpl,
                props: {
                    section:    { type: Object, required: true },
                    roleFilter: { type: Array,  default: function () { return []; } }
                },
                emits: ['update:active-roles'],
                data: function () {
                    return { activeRoles: [] };
                },
                watch: {
                    activeRoles: function (val) { this.$emit('update:active-roles', val); }
                },
                computed: {
                    roleCounts: function () {
                        var counts = {};
                        (this.section.items || []).forEach(function (it) {
                            if (!it.role) return;
                            counts[it.role] = (counts[it.role] || 0) + 1;
                        });
                        return Object.keys(counts)
                            .map(function (role) { return { role: role, count: counts[role] }; })
                            .sort(function (a, b) { return b.count - a.count; });
                    },
                    visibleItems: function () {
                        if (!this.activeRoles.length) return this.section.items || [];
                        return (this.section.items || []).filter(function (it) {
                            return this.activeRoles.indexOf(it.role) >= 0;
                        }.bind(this));
                    }
                },
                methods: {
                    toggleRole: function (role) {
                        var i = this.activeRoles.indexOf(role);
                        if (i >= 0) this.activeRoles.splice(i, 1);
                        else this.activeRoles.push(role);
                    },
                    clearRoles: function () { this.activeRoles = []; },
                    onConceptClick: function (c) {
                        /* The click is currently decorative; reserved for
                           future drill-down panels. */
                    }
                }
            };
        }
    });
})();
