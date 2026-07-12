(function() {
    'use strict';

    function debounce(fn, ms) {
        var timer = null;
        return function() {
            if (timer) clearTimeout(timer);
            var ctx = this, args = arguments;
            timer = setTimeout(function() { fn.apply(ctx, args); }, ms);
        };
    }

    window.ruiReportLargest = {
        name: 'ruiReportLargest',
        template: '#rui-report-largest-tpl',
        props: {
            largest: { type: Array, default: function() { return []; } },
            labels: { type: Object, default: function() { return {}; } }
        },
        data: function() {
            return {
                filterText: '',
                filterTextDebounced: '',
                sortKey: 'bytes',
                sortDir: -1
            };
        },
        computed: {
            title: function() { return (this.labels || {}).sectionLargest || 'Largest Files'; },
            filterPlaceholder: function() { return (this.labels || {}).filterPlaceholder; },
            colPath: function() { return (this.labels || {}).colPath; },
            colBytes: function() { return (this.labels || {}).colBytes; },
            colLines: function() { return (this.labels || {}).colLines; },
            colType: function() { return (this.labels || {}).colType; },
            colDepth: function() { return (this.labels || {}).colDepth; },
            colFanIn: function() { return (this.labels || {}).colFanIn; },
            colFanOut: function() { return (this.labels || {}).colFanOut; },
            emptyLargest: function() { return (this.labels || {}).emptyLargest; },
            sorted: function() {
                var rows = (this.largest || []).slice();
                var key = this.sortKey;
                var dir = this.sortDir;
                var self = this;
                rows.sort(function(a, b) {
                    var av = a[key], bv = b[key];
                    if (typeof av === 'string' || typeof bv === 'string') {
                        return String(av).localeCompare(String(bv)) * dir;
                    }
                    return ((av || 0) - (bv || 0)) * dir;
                });
                return rows;
            },
            filtered: function() {
                if (!this.filterTextDebounced) return this.sorted;
                var t = this.filterTextDebounced.toLowerCase();
                return this.sorted.filter(function(r) {
                    return (r.path || '').toLowerCase().indexOf(t) !== -1;
                });
            }
        },
        watch: {
            filterText: {
                handler: function(val) {
                    var self = this;
                    if (!this._debounce) {
                        this._debounce = debounce(function(v) { self.filterTextDebounced = v || ''; }, 200);
                    }
                    this._debounce(val);
                },
                immediate: false
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
        },
        mounted: function() {
            this.filterTextDebounced = this.filterText || '';
        }
    };
})();
