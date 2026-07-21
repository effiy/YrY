(function() {
    'use strict';

    window.ruiReportHealth = {
        name: 'ruiReportHealth',
        template: '#yry-report-health-tpl',
        mixins: [window.RuiSortable.setSortMixin({ sortKey: 'ageDays', sortDir: -1 })],
        props: {
            cycles: { type: Array, default: function() { return []; } },
            freshness: { type: Array, default: function() { return []; } },
            freshnessBuckets: { type: Array, default: function() { return []; } },
            freshnessStats: { type: Object, default: function() { return {}; } },
            labels: { type: Object, default: function() { return {}; } }
        },
        data: function() {
            return { tab: 'cycles' };
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
                return this.sortBy(this.freshness || []);
            }
        }
    };
})();
