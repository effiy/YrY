import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'yryReportLargest',
    html: '/cdn/components/business/reports/files/yry-report-largest/index.html',
    css: '/cdn/components/business/reports/files/yry-report-largest/index.css',
    mixins: [window.YrYSortable.setSortMixin({sortKey: 'bytes', sortDir: -1})],
    props: {
        largest: {type: Array, default: function () {
            return [];
        }},
        labels: {type: Object, default: function () {
            return {};
        }},
    },
    data: function () {
        return {filterText: '', filterTextDebounced: ''};
    },
    computed: {
        title: function () {
            return (this.labels || {}).sectionLargest || 'Largest Files';
        },
        filterPlaceholder: function () {
            return (this.labels || {}).filterPlaceholder;
        },
        colPath: function () {
            return (this.labels || {}).colPath;
        },
        colBytes: function () {
            return (this.labels || {}).colBytes;
        },
        colLines: function () {
            return (this.labels || {}).colLines;
        },
        colType: function () {
            return (this.labels || {}).colType;
        },
        colDepth: function () {
            return (this.labels || {}).colDepth;
        },
        colFanIn: function () {
            return (this.labels || {}).colFanIn;
        },
        colFanOut: function () {
            return (this.labels || {}).colFanOut;
        },
        emptyLargest: function () {
            return (this.labels || {}).emptyLargest;
        },
        sorted: function () {
            return this.sortBy(this.largest || []);
        },
        filtered: function () {
            if (!this.filterTextDebounced) {
                return this.sorted;
            }
            const t = this.filterTextDebounced.toLowerCase();
            return this.sorted.filter(function (r) {
                return (r.path || '').toLowerCase().indexOf(t) !== -1;
            });
        },
    },
    watch: {
        filterText: {
            handler: function (val) {
                const debounceMs = (window.REPORT_CONFIG && window.REPORT_CONFIG.constants && window.REPORT_CONFIG.constants.filterDebounceMs) || 200;
                if (!this._debounce) {
                    this._debounce = window.YrYBytes.debounce(function (v) {
                        this.filterTextDebounced = v || '';
                    }.bind(this), debounceMs);
                }
                this._debounce(val);
            },
            immediate: false,
        },
    },
    mounted: function () {
        this.filterTextDebounced = this.filterText || '';
    },
};
registerGlobalComponent(compDef);
export default compDef;
