(function () {
const compDef = {
    name: 'yryReportLargest',
    template: `
    <section id="largest">
        <h2>{{ title }}</h2>
        <input type="search"
               class="filter"
               :placeholder="filterPlaceholder || 'filter by path...'"
               v-model="filterText"
               aria-label="Filter largest files by path"
               aria-describedby="filter-desc" />
        <p id="filter-desc" class="sr-only" aria-live="polite">{{ filtered.length }} results</p>
        <table data-sortable v-if="filtered.length">
            <thead>
                <tr>
                    <th @click="setSort('path')" :class="sortClass('path')" :aria-sort="sortAria('path')">{{ colPath || 'Path' }}</th>
                    <th @click="setSort('bytes')" :class="sortClass('bytes')" :aria-sort="sortAria('bytes')">{{ colBytes || 'Bytes' }}</th>
                    <th @click="setSort('lines')" :class="sortClass('lines')" :aria-sort="sortAria('lines')">{{ colLines || 'Lines' }}</th>
                    <th @click="setSort('type')" :class="sortClass('type')" :aria-sort="sortAria('type')">{{ colType || 'Type' }}</th>
                    <th @click="setSort('depth')" :class="sortClass('depth')" :aria-sort="sortAria('depth')">{{ colDepth || 'Depth' }}</th>
                    <th @click="setSort('fanIn')" :class="sortClass('fanIn')" :aria-sort="sortAria('fanIn')">{{ colFanIn || 'Fan-in' }}</th>
                    <th @click="setSort('fanOut')" :class="sortClass('fanOut')" :aria-sort="sortAria('fanOut')">{{ colFanOut || 'Fan-out' }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in filtered" :key="row.path">
                    <td><code>{{ row.path }}</code></td>
                    <td>{{ row.bytesHuman }}</td>
                    <td>{{ row.lines }}</td>
                    <td>{{ row.type }}</td>
                    <td>{{ row.depth }}</td>
                    <td>{{ row.fanIn }}</td>
                    <td>{{ row.fanOut }}</td>
                </tr>
            </tbody>
        </table>
        <p class="empty" v-else>{{ emptyLargest || 'No files in scope.' }}</p>
    </section>
`,
    css: '../../../YiPet/cdn/components/report/files/yry-report-largest/index.css',
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
if (typeof window !== 'undefined' && window.registerGlobalComponent) { window.registerGlobalComponent(compDef); }

})();
