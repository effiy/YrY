(function() {
    'use strict';

    window.ruiReportRisk = {
        name: 'ruiReportRisk',
        template: '#yry-report-risk-tpl',
        mixins: [window.RuiSortable.setSortMixin({ sortKey: 'score', sortDir: -1 })],
        props: {
            hotspots: { type: Array, default: function() { return []; } },
            orphans: { type: Array, default: function() { return []; } },
            depthRanking: { type: Array, default: function() { return []; } },
            depthStats: { type: Object, default: function() { return {}; } },
            labels: { type: Object, default: function() { return {}; } }
        },
        data: function() {
            return { tab: 'hotspots' };
        },
        computed: {
            title: function() { return (this.labels || {}).sectionRisk || 'Risk Files'; },
            tabHotspots: function() { return (this.labels || {}).tabHotspots; },
            tabOrphans: function() { return (this.labels || {}).tabOrphans; },
            tabDepth: function() { return (this.labels || {}).tabDepth; },
            colPath: function() { return (this.labels || {}).colPath; },
            colBytes: function() { return (this.labels || {}).colBytes; },
            colLines: function() { return (this.labels || {}).colLines; },
            colType: function() { return (this.labels || {}).colType; },
            colFanIn: function() { return (this.labels || {}).colFanIn; },
            colFanOut: function() { return (this.labels || {}).colFanOut; },
            colDepth: function() { return (this.labels || {}).colDepth; },
            colScore: function() { return (this.labels || {}).colScore; },
            emptyRisk: function() { return (this.labels || {}).emptyRisk; },
            depthMaxLabel: function() { return (this.labels || {}).depthMax || 'Max'; },
            depthMeanLabel: function() { return (this.labels || {}).depthMean || 'Mean'; },
            depthMedianLabel: function() { return (this.labels || {}).depthMedian || 'Median'; },
            depthP90Label: function() { return (this.labels || {}).depthP90 || 'P90'; },
            depthFilesAtMaxLabel: function() { return (this.labels || {}).depthFilesAtMax || 'Files at Max'; },
            rows: function() {
                if (this.tab === 'orphans') return this.orphans || [];
                if (this.tab === 'depth') return this.depthRanking || [];
                return this.hotspots || [];
            },
            sorted: function() {
                return this.sortBy(this.rows);
            }
        },
        methods: {
            setTab: function(tab) {
                this.tab = tab;
                if (tab === 'orphans') { this.sortKey = 'bytes'; }
                else if (tab === 'depth') { this.sortKey = 'maxDepth'; }
                else { this.sortKey = 'score'; }
                this.sortDir = -1;
            }
        }
    };
})();
