/* ═══════════════════════════════════════════════════════════════════════════
   qs HTML CDN — qsSparkline · Vue 3 inline sparkline
   Pure SVG line + area chart, no external deps. Pass a numeric points
   array; the chart auto-scales min/max.

   Page usage (host page):
     <script src="components/charts/qs-sparkline/index.js"></script>
     <script>
       // After qs-sparkline-ready:
       const app = Vue.createApp({ ... });
       app.component('qs-sparkline', window.qsSparkline);
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    ruiBootstrapComponent({
        componentName: 'qsSparkline',
        configKey:     'QS_SPARKLINE_CONFIG',
        cssMarker:     'qs-sparkline-css',
        readyEvent:    'qs-sparkline-ready',
        errorEvent:    'qs-sparkline-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'qs-sparkline-tpl',
            loadTimeoutMs: 5000,
            defaults: { tone: 'accent', width: 120, height: 32, fill: true }
        },
        buildOptions: function (cfg, tpl) {
            return {
                name: 'qsSparkline',
                template: tpl,
                props: {
                    points: { type: Array, required: true },
                    tone:   { type: String, default: function () { return cfg.defaults.tone; } },
                    width:  { type: Number, default: function () { return cfg.defaults.width; } },
                    height: { type: Number, default: function () { return cfg.defaults.height; } },
                    fill:   { type: Boolean, default: function () { return cfg.defaults.fill; } }
                },
                computed: {
                    layout: function () {
                        var pts = (this.points || []).filter(function (n) { return typeof n === 'number' && !isNaN(n); });
                        if (pts.length < 2) {
                            return { line: '', area: '', dot: { cx: 0, cy: 0 } };
                        }
                        var min = Math.min.apply(null, pts);
                        var max = Math.max.apply(null, pts);
                        var range = max - min || 1;
                        var stepX = this.width / (pts.length - 1);
                        var coords = pts.map(function (v, i) {
                            var x = i * stepX;
                            var y = this.height - ((v - min) / range) * (this.height - 4) - 2;
                            return [x.toFixed(2), y.toFixed(2)];
                        }.bind(this));
                        var line = 'M' + coords.map(function (c) { return c.join(' '); }).join(' L ');
                        var area = line + ' L ' + this.width + ' ' + this.height + ' L 0 ' + this.height + ' Z';
                        var last = coords[coords.length - 1];
                        return { line: line, area: area, dot: { cx: last[0], cy: last[1] } };
                    }
                }
            };
        }
    });
})();
