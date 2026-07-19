/* ═══════════════════════════════════════════════════════════════════════════
   qs HTML CDN — qsDonut · Vue 3 donut chart component
   Pure SVG donut with center label. Pass [{ value, cls, label }] to
   segments; the chart scales segments proportionally.

   Page usage (host page):
     <script src="components/charts/qs-donut/index.js"></script>
     <script>
       // After rui-donut-ready event:
       const app = Vue.createApp({ ... });
       app.component('qs-donut', window.qsDonut);
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'qsDonut',
        configKey:     'QS_DONUT_CONFIG',
        cssMarker:     'qs-donut-css',
        readyEvent:    'qs-donut-ready',
        errorEvent:    'qs-donut-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'qs-donut-tpl',
            loadTimeoutMs: 5000,
            defaults: { size: 140, thickness: 14 }
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'qsDonut',
                template: tpl,
                props: {
                    segments: { type: Array, required: true },
                    value:    { type: [String, Number], default: '' },
                    label:    { type: String, default: '' },
                    size:     { type: Number, default: function () { return cfg.defaults.size; } },
                    thickness:{ type: Number, default: function () { return cfg.defaults.thickness; } },
                    legend:   { type: Boolean, default: true }
                },
                computed: {
                    cx() { return this.size / 2; },
                    cy() { return this.size / 2; },
                    radius() { return (this.size - this.thickness) / 2 - 2; },
                    circumference() { return 2 * Math.PI * this.radius; },
                    viewBox() { return '0 0 ' + this.size + ' ' + this.size; },
                    rotation() { return 'rotate(-90 ' + this.cx + ' ' + this.cy + ')'; },
                    total() {
                        return this.segments.reduce(function (a, s) { return a + (Number(s.value) || 0); }, 0) || 1;
                    },
                    laid() {
                        var c = this.circumference;
                        var offset = 0;
                        var total = this.total;
                        return this.segments.map(function (seg) {
                            var fraction = (Number(seg.value) || 0) / total;
                            var len = fraction * c;
                            var gap = c - len;
                            var item = {
                                cls: seg.cls || '',
                                dasharray: (len) + ' ' + (gap),
                                dashoffset: -offset
                            };
                            offset += len;
                            return item;
                        });
                    }
                }
            };
        }
    });
})();
