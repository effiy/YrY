(function() {
    'use strict';

    window.ruiReportHealth = {
        name: 'ruiReportHealth',
        template: '#rui-report-health-tpl',
        props: {
            cycles: { type: Array, default: function() { return []; } },
            freshness: { type: Array, default: function() { return []; } },
            freshnessBuckets: { type: Array, default: function() { return []; } },
            freshnessStats: { type: Object, default: function() { return {}; } },
            labels: { type: Object, default: function() { return {}; } }
        },
        data: function() {
            return {
                tab: 'cycles',
                sortKey: 'ageDays',
                sortDir: -1
            };
        },
        computed: {
            title: function() { return (this.labels || {}).sectionHealth || 'Health'; },
            tabCycles: function() { return (this.labels || {}).tabCycles; },
            tabFreshness: function() { return (this.labels || {}).tabFreshness; },
            suggestedFixLabel: function() { return (this.labels || {}).suggestedFix || 'suggested fix'; },
            emptyCycles: function() { return (this.labels || {}).emptyCycles; },
            emptyFreshness: function() { return (this.labels || {}).emptyFreshness; },
            freshnessAsOfLabel: function() { return (this.labels || {}).freshnessAsOf || 'Anchor (newest mtime)'; },
            freshnessMaxAgeLabel: function() { return (this.labels || {}).freshnessMaxAge || 'Max Age'; },
            freshnessMedianLabel: function() { return (this.labels || {}).freshnessMedian || 'Median Age'; },
            freshnessP90Label: function() { return (this.labels || {}).freshnessP90 || 'P90 Age'; },
            freshnessStaleLabel: function() { return (this.labels || {}).freshnessStale || 'Stale (>=180d)'; },
            colPath: function() { return (this.labels || {}).colPath; },
            colAge: function() { return (this.labels || {}).colAge; },
            colLastModified: function() { return (this.labels || {}).colLastModified; },
            colType: function() { return (this.labels || {}).colType; },
            colLines: function() { return (this.labels || {}).colLines; },
            freshnessSorted: function() {
                var rows = (this.freshness || []).slice();
                var key = this.sortKey;
                var dir = this.sortDir;
                rows.sort(function(a, b) {
                    var av = a[key], bv = b[key];
                    if (typeof av === 'string' || typeof bv === 'string') {
                        return String(av).localeCompare(String(bv)) * dir;
                    }
                    return ((av || 0) - (bv || 0)) * dir;
                });
                return rows;
            }
        },
        methods: {
            setSort: function(key) {
                if (this.sortKey === key) {
                    this.sortDir = -this.sortDir;
                } else {
                    this.sortKey = key;
                    this.sortDir = -1;
                }
            },
            sortClass: function(key) {
                if (this.sortKey !== key) return '';
                return this.sortDir === 1 ? 'sort-asc' : 'sort-desc';
            },
            sortAria: function(key) {
                if (this.sortKey !== key) return 'none';
                return this.sortDir === 1 ? 'ascending' : 'descending';
            }
        }
    };
})();
