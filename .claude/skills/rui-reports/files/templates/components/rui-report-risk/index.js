(function() {
    'use strict';

    window.ruiReportRisk = {
        name: 'ruiReportRisk',
        template: '#rui-report-risk-tpl',
        props: {
            hotspots: { type: Array, default: function() { return []; } },
            orphans: { type: Array, default: function() { return []; } },
            depthRanking: { type: Array, default: function() { return []; } },
            depthStats: { type: Object, default: function() { return {}; } },
            labels: { type: Object, default: function() { return {}; } }
        },
        data: function() {
            return {
                tab: 'hotspots',
                sortKey: 'score',
                sortDir: -1
            };
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
                var rows = (this.rows || []).slice();
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
            setTab: function(tab) {
                this.tab = tab;
                if (tab === 'orphans') { this.sortKey = 'bytes'; }
                else if (tab === 'depth') { this.sortKey = 'maxDepth'; }
                else { this.sortKey = 'score'; }
                this.sortDir = -1;
            },
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
