/**
 * rui-risk-distribution — P0 / P1 / P2 alert proportion bar.
 * ----------------------------------------------------------------------
 * Replaces the inline `.risk-dist` block in files/index.html. Takes
 * a flat `counts` object (`{p0, p1, p2}`) and computes the percent
 * widths itself — callers no longer have to also pre-compute
 * `distPct` on the host page.
 *
 * Renders nothing when there are no alerts (`visible` becomes
 * false), preserving the previous `v-if="p0+p1+p2 > 0"` behaviour.
 */
(function () {
    'use strict';

    window.ruiRiskDistribution = {
        name: 'ruiRiskDistribution',
        template: '#rui-risk-distribution-tpl',
        props: {
            counts: { type: Object, default: function () { return { p0: 0, p1: 0, p2: 0 }; } },
            label:  { type: String, default: 'Risk distribution' }
        },
        computed: {
            total: function () {
                return (this.counts.p0 || 0) + (this.counts.p1 || 0) + (this.counts.p2 || 0);
            },
            visible: function () {
                return this.total > 0;
            },
            pct: function () {
                var t = this.total || 1;
                return {
                    p0: (this.counts.p0 || 0) / t * 100,
                    p1: (this.counts.p1 || 0) / t * 100,
                    p2: (this.counts.p2 || 0) / t * 100
                };
            }
        }
    };
})();
