(function() {
    'use strict';

    window.ruiReportCoupling = {
        name: 'ruiReportCoupling',
        template: '#rui-report-coupling-tpl',
        props: {
            fanin: { type: Array, default: function() { return []; } },
            fanout: { type: Array, default: function() { return []; } },
            labels: { type: Object, default: function() { return {}; } }
        },
        data: function() {
            return {
                tab: 'fanin',
                sortKey: 'fanIn',
                sortDir: -1
            };
        },
        computed: {
            title: function() { return (this.labels || {}).sectionCoupling || 'Coupling'; },
            tabFanin: function() { return (this.labels || {}).tabFanin; },
            tabFanout: function() { return (this.labels || {}).tabFanout; },
            colPath: function() { return (this.labels || {}).colPath; },
            colFanIn: function() { return (this.labels || {}).colFanIn; },
            colFanOut: function() { return (this.labels || {}).colFanOut; },
            colExt: function() { return (this.labels || {}).colExt; },
            colLines: function() { return (this.labels || {}).colLines; },
            colType: function() { return (this.labels || {}).colType; },
            emptyCoupling: function() { return (this.labels || {}).emptyCoupling; },
            rows: function() {
                return this.tab === 'fanout' ? (this.fanout || []) : (this.fanin || []);
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
                this.sortKey = tab === 'fanout' ? 'fanOut' : 'fanIn';
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
