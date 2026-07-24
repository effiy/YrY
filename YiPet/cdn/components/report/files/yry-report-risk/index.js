(function () {
const compDef = {
    name: 'yryReportRisk',
    template: `
    <section id="risk">
        <h2>{{ title }}</h2>
        <div class="tabs" role="tablist">
            <button type="button" role="tab"
                    :class="{ active: tab === 'hotspots' }"
                    :aria-selected="tab === 'hotspots' ? 'true' : 'false'"
                    @click="setTab('hotspots')">{{ tabHotspots || 'Hotspots' }}</button>
            <button type="button" role="tab"
                    :class="{ active: tab === 'orphans' }"
                    :aria-selected="tab === 'orphans' ? 'true' : 'false'"
                    @click="setTab('orphans')">{{ tabOrphans || 'Orphans' }}</button>
            <button type="button" role="tab"
                    :class="{ active: tab === 'depth' }"
                    :aria-selected="tab === 'depth' ? 'true' : 'false'"
                    @click="setTab('depth')">{{ tabDepth || 'Depth' }}</button>
        </div>
        <p class="stat-line" v-if="tab === 'depth' && depthStats">
            {{ depthMaxLabel }} {{ depthStats.max }}
            · {{ depthMeanLabel }} {{ depthStats.mean }}
            · {{ depthMedianLabel }} {{ depthStats.median }}
            · {{ depthP90Label }} {{ depthStats.p90 }}
            · {{ depthFilesAtMaxLabel }} {{ depthStats.filesAtMax }}
        </p>
        <table data-sortable v-if="sorted.length">
            <thead>
                <tr>
                    <th @click="setSort('path')" :class="sortClass('path')" :aria-sort="sortAria('path')">{{ colPath || 'Path' }}</th>
                    <th @click="setSort('bytes')" :class="sortClass('bytes')" :aria-sort="sortAria('bytes')">{{ colBytes || 'Bytes' }}</th>
                    <th @click="setSort('lines')" :class="sortClass('lines')" :aria-sort="sortAria('lines')">{{ colLines || 'Lines' }}</th>
                    <th @click="setSort('type')" :class="sortClass('type')" :aria-sort="sortAria('type')">{{ colType || 'Type' }}</th>
                    <th @click="setSort('fanIn')" :class="sortClass('fanIn')" :aria-sort="sortAria('fanIn')">{{ colFanIn || 'Fan-in' }}</th>
                    <th @click="setSort('fanOut')" :class="sortClass('fanOut')" :aria-sort="sortAria('fanOut')">{{ colFanOut || 'Fan-out' }}</th>
                    <th @click="setSort('maxDepth')" :class="sortClass('maxDepth')" :aria-sort="sortAria('maxDepth')">{{ colDepth || 'Depth' }}</th>
                    <th @click="setSort('score')" :class="sortClass('score')" :aria-sort="sortAria('score')">{{ colScore || 'Score' }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in sorted" :key="row.path">
                    <td><code>{{ row.path }}</code></td>
                    <td>{{ row.bytesHuman }}</td>
                    <td>{{ row.lines }}</td>
                    <td>{{ row.type }}</td>
                    <td>{{ row.fanIn }}</td>
                    <td>{{ row.fanOut }}</td>
                    <td>{{ row.maxDepth }}</td>
                    <td>{{ row.score }}</td>
                </tr>
            </tbody>
        </table>
        <p class="empty" v-else>{{ emptyRisk || 'No risk files met the threshold.' }}</p>
    </section>
`,
    css: '../../../YiPet/cdn/components/report/files/yry-report-risk/index.css',
    mixins: [window.YrYSortable.setSortMixin({ sortKey: 'score', sortDir: -1 })],
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
if (typeof window !== 'undefined' && window.registerGlobalComponent) { window.registerGlobalComponent(compDef); }

})();
