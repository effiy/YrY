/* ═══════════════════════════════════════════════════════════════════════════
   qs HTML CDN — qsPalette · Vue 3 command palette overlay
   Cmd/Ctrl+K search overlay. Receives an `index` prop and emits
   `close` / `pick` events.

   Page usage (host page):
     <script src="components/overlay/qs-palette/index.js"></script>
     <script>
       // After qs-palette-ready, mount a Vue sub-app:
       const app = Vue.createApp({ ... });
       app.component('qs-palette', window.qsPalette);
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'qsPalette',
        configKey:     'QS_PALETTE_CONFIG',
        cssMarker:     'qs-palette-css',
        readyEvent:    'qs-palette-ready',
        errorEvent:    'qs-palette-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'qs-palette-tpl',
            loadTimeoutMs: 5000,
            defaults: {}
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'qsPalette',
                template: tpl,
                props: {
                    index: { type: Array, default: function () { return []; } }
                },
                emits: ['close', 'pick'],
                data: function () {
                    return {
                        q: '',
                        activeKey: { kind: null, i: 0 }
                    };
                },
                computed: {
                    filtered: function () {
                        var q = this.q.trim().toLowerCase();
                        if (!q) return this.index.slice(0, 30);
                        return this.index.filter(function (it) {
                            return it.search.toLowerCase().indexOf(q) >= 0;
                        }).slice(0, 30);
                    },
                    groups: function () {
                        var map = {
                            section:    { kind: 'section',    label: 'Sections',  items: [] },
                            concept:    { kind: 'concept',    label: 'Concepts',  items: [] },
                            command:    { kind: 'command',    label: 'Commands',  items: [] },
                            faq:        { kind: 'faq',        label: 'FAQ',       items: [] },
                            reading:    { kind: 'reading',    label: 'Reading',   items: [] },
                            onboarding: { kind: 'onboarding', label: 'Onboarding', items: [] }
                        };
                        this.filtered.forEach(function (it) {
                            if (map[it.kind]) map[it.kind].items.push(it);
                        });
                        return Object.keys(map).map(function (k) { return map[k]; }).filter(function (g) { return g.items.length; });
                    }
                },
                methods: {
                    close: function () { this.$emit('close'); },
                    pick: function (item) { this.$emit('pick', item); },
                    setActive: function (kind, i) { this.activeKey = { kind: kind, i: i }; },
                    isActive: function (kind, i) { return this.activeKey.kind === kind && this.activeKey.i === i; },
                    activeItem: function () {
                        for (var g = 0; g < this.groups.length; g++) {
                            if (this.groups[g].kind === this.activeKey.kind) {
                                return this.groups[g].items[this.activeKey.i] || null;
                            }
                        }
                        return null;
                    },
                    onKey: function (e) {
                        var flat = [];
                        this.groups.forEach(function (g) { g.items.forEach(function (it) { flat.push(it); }); });
                        if (e.key === 'Escape') { e.preventDefault(); this.close(); return; }
                        if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            if (!flat.length) return;
                            var cur = this.activeItem();
                            var idx = cur ? flat.indexOf(cur) : -1;
                            idx = Math.min(flat.length - 1, idx + 1);
                            this.activeKey = {
                                kind: flat[idx].kind,
                                i: this.groups.find(function (g) { return g.kind === flat[idx].kind; }).items.indexOf(flat[idx])
                            };
                        } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            if (!flat.length) return;
                            cur = this.activeItem();
                            idx = cur ? flat.indexOf(cur) : flat.length;
                            idx = Math.max(0, idx - 1);
                            this.activeKey = {
                                kind: flat[idx].kind,
                                i: this.groups.find(function (g) { return g.kind === flat[idx].kind; }).items.indexOf(flat[idx])
                            };
                        } else if (e.key === 'Enter') {
                            e.preventDefault();
                            cur = this.activeItem();
                            if (cur) this.pick(cur);
                        }
                    }
                },
                mounted: function () {
                    this.$nextTick(function () {
                        if (this.$refs.input) this.$refs.input.focus();
                    });
                }
            };
        }
    });
})();
