(function () {
    'use strict';
    window.ruiReportApiSemantics = Object.assign({
        name: 'ruiReportApiSemantics',
        template: '#rui-report-api-semantics-tpl',
        props: {
            semantics: { type: Object, default: function() { return {}; } },
            methods: { type: Array, default: function() { return []; } },
            labels: { type: Object, default: function() { return {}; } },
        },
        computed: {
            score: function () { return (this.semantics && this.semantics.score) || 0; },
            safeCount: function () { return (this.semantics && this.semantics.safeCount) || 0; },
            unsafeCount: function () { return (this.semantics && this.semantics.unsafeCount) || 0; },
            idempotentCount: function () { return (this.semantics && this.semantics.idempotentCount) || 0; },
            methodMisuse: function () { return (this.semantics && this.semantics.methodMisuse) || []; },
            misuseCount: function () { return this.methodMisuse.length; },
            scoreTone: function () {
                var s = this.score;
                if (s >= 80) return 'tone-ok';
                if (s >= 50) return 'tone-warn';
                return 'tone-critical';
            },
            unsafeTone: function () {
                var u = this.unsafeCount;
                var t = this.safeCount + this.unsafeCount || 1;
                var ratio = u / t;
                if (ratio > 0.7) return 'tone-warn';
                return 'tone-ok';
            },
            misuseTone: function () {
                var m = this.misuseCount;
                if (m === 0) return 'tone-ok';
                if (m <= 2) return 'tone-warn';
                return 'tone-critical';
            },
        },
    }, window.RuiSortable.setSortMixin({ sortKey: 'method', sortDir: -1 }));
})();
