(function () {
const compDef = {
    name: 'yryReportHealth',
    template: `
    <section id="health">
        <h2>{{ title }}</h2>
        <div class="tabs" role="tablist">
            <button type="button" role="tab"
                    :class="{ active: tab === 'cycles' }"
                    :aria-selected="tab === 'cycles' ? 'true' : 'false'"
                    @click="tab = 'cycles'">{{ tabCycles || 'Cycles' }}</button>
            <button type="button" role="tab"
                    :class="{ active: tab === 'freshness' }"
                    :aria-selected="tab === 'freshness' ? 'true' : 'false'"
                    @click="tab = 'freshness'">{{ tabFreshness || 'Freshness' }}</button>
        </div>
        <div v-if="tab === 'cycles'">
            <ul class="cycles-list" v-if="cycles.length">
                <li v-for="(c, i) in cycles" :key="i">
                    <yry-badge :text="c.severity"
                        :modifier="c.severity === 'critical' ? 'fail' : c.severity === 'warn' ? 'warn' : 'info'"
                        size="sm" />
                    <code>{{ c.path }}</code>
                    (length {{ c.length }})
                    · {{ suggestedFixLabel }}: <code>{{ c.suggestedFix }}</code>
                </li>
            </ul>
            <p class="empty" v-else>{{ emptyCycles || 'No circular dependencies detected.' }}</p>
        </div>
        <div v-else>
            <div class="depth-stats">
                <div class="card"><div class="card-label">{{ freshnessAsOfLabel }}</div><div class="value">{{ freshnessStats.asOfHuman }}</div></div>
                <div class="card"><div class="card-label">{{ freshnessMaxAgeLabel }}</div><div class="value">{{ freshnessStats.maxAge }}d</div></div>
                <div class="card"><div class="card-label">{{ freshnessMedianLabel }}</div><div class="value">{{ freshnessStats.median }}d</div></div>
                <div class="card"><div class="card-label">{{ freshnessP90Label }}</div><div class="value">{{ freshnessStats.p90 }}d</div></div>
                <div class="card"><div class="card-label">{{ freshnessStaleLabel }}</div><div class="value">{{ freshnessStats.staleCount }}</div></div>
            </div>
            <div class="histogram" v-if="freshnessBuckets.length">
                <div v-for="b in freshnessBuckets" :key="b.bucket" class="hbar" :style="{ '--h': b.pctFiles }">
                    <span class="hb-label">{{ b.bucket }}</span>
                    <span class="hb-count">{{ b.count }}</span>
                </div>
            </div>
            <table data-sortable v-if="freshnessSorted.length">
                <thead>
                    <tr>
                        <th @click="setSort('path')" :class="sortClass('path')" :aria-sort="sortAria('path')">{{ colPath || 'Path' }}</th>
                        <th @click="setSort('ageDays')" :class="sortClass('ageDays')" :aria-sort="sortAria('ageDays')">{{ colAge || 'Age (days)' }}</th>
                        <th @click="setSort('lastModified')" :class="sortClass('lastModified')" :aria-sort="sortAria('lastModified')">{{ colLastModified || 'Last Modified' }}</th>
                        <th @click="setSort('type')" :class="sortClass('type')" :aria-sort="sortAria('type')">{{ colType || 'Type' }}</th>
                        <th @click="setSort('lines')" :class="sortClass('lines')" :aria-sort="sortAria('lines')">{{ colLines || 'Lines' }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in freshnessSorted" :key="row.path">
                        <td><code>{{ row.path }}</code></td>
                        <td>{{ row.ageDays }}</td>
                        <td>{{ row.lastModifiedHuman }}</td>
                        <td>{{ row.type }}</td>
                        <td>{{ row.lines }}</td>
                    </tr>
                </tbody>
            </table>
            <p class="empty" v-else>{{ emptyFreshness || 'No files with age > 0.' }}</p>
        </div>
    </section>
`,
    css: '../../../YiPet/cdn/components/report/files/yry-report-health/index.css',
    mixins: [window.YrYSortable.setSortMixin({ sortKey: 'ageDays', sortDir: -1 })],
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
if (typeof window !== 'undefined' && window.registerGlobalComponent) { window.registerGlobalComponent(compDef); }

})();
