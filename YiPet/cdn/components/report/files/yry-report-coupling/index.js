(function () {
const compDef = {
    name: 'yryReportCoupling',
    template: `
    <section id="coupling">
        <h2>{{ title }}</h2>
        <div class="tabs" role="tablist">
            <button type="button" role="tab"
                    :class="{ active: tab === 'fanin' }"
                    :aria-selected="tab === 'fanin' ? 'true' : 'false'"
                    @click="setTab('fanin')">{{ tabFanin || 'Fan-in' }}</button>
            <button type="button" role="tab"
                    :class="{ active: tab === 'fanout' }"
                    :aria-selected="tab === 'fanout' ? 'true' : 'false'"
                    @click="setTab('fanout')">{{ tabFanout || 'Fan-out' }}</button>
        </div>
        <table data-sortable v-if="sorted.length">
            <thead>
                <tr>
                    <th @click="setSort('path')" :class="sortClass('path')" :aria-sort="sortAria('path')">{{ colPath || 'Path' }}</th>
                    <th @click="setSort('fanIn')" :class="sortClass('fanIn')" :aria-sort="sortAria('fanIn')">{{ colFanIn || 'Fan-in' }}</th>
                    <th @click="setSort('fanOut')" :class="sortClass('fanOut')" :aria-sort="sortAria('fanOut')">{{ colFanOut || 'Fan-out' }}</th>
                    <th @click="setSort('extDeps')" :class="sortClass('extDeps')" :aria-sort="sortAria('extDeps')">{{ colExt || 'Ext' }}</th>
                    <th @click="setSort('lines')" :class="sortClass('lines')" :aria-sort="sortAria('lines')">{{ colLines || 'Lines' }}</th>
                    <th @click="setSort('type')" :class="sortClass('type')" :aria-sort="sortAria('type')">{{ colType || 'Type' }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in sorted" :key="row.path">
                    <td><code>{{ row.path }}</code></td>
                    <td>{{ row.fanIn }}</td>
                    <td>{{ row.fanOut }}</td>
                    <td>{{ row.extDeps != null ? row.extDeps : '' }}</td>
                    <td>{{ row.lines }}</td>
                    <td>{{ row.type }}</td>
                </tr>
            </tbody>
        </table>
        <p class="empty" v-else>{{ emptyCoupling || 'No coupling data.' }}</p>
    </section>
`,
    css: '../../../YiPet/cdn/components/report/files/yry-report-coupling/index.css',
    mixins: [window.YrYSortable.setSortMixin({ sortKey: 'fanIn', sortDir: -1 })],
    props: {
        fanin: { type: Array, default: function() { return []; } },
        fanout: { type: Array, default: function() { return []; } },
        labels: { type: Object, default: function() { return {}; } }
    },
    data: function() {
        return { tab: 'fanin' };
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
            return this.sortBy(this.rows);
        }
    },
    methods: {
        setTab: function(tab) {
            this.tab = tab;
            this.sortKey = tab === 'fanout' ? 'fanOut' : 'fanIn';
            this.sortDir = -1;
        }
    }
};
if (typeof window !== 'undefined' && window.registerGlobalComponent) { window.registerGlobalComponent(compDef); }

})();
