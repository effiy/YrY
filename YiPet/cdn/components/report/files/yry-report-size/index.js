(function () {
const compDef = {
    name: 'yryReportSize',
    template: `
    <section id="size">
        <h2>{{ title }}</h2>
        <div class="tabs" role="tablist">
            <button type="button" role="tab"
                    :class="{ active: tab === 'treemap' }"
                    :aria-selected="tab === 'treemap' ? 'true' : 'false'"
                    @click="tab = 'treemap'">{{ tabTreemap }}</button>
            <button type="button" role="tab"
                    :class="{ active: tab === 'types' }"
                    :aria-selected="tab === 'types' ? 'true' : 'false'"
                    @click="tab = 'types'">{{ tabTypes }}</button>
            <button type="button" role="tab"
                    :class="{ active: tab === 'histogram' }"
                    :aria-selected="tab === 'histogram' ? 'true' : 'false'"
                    @click="tab = 'histogram'">{{ tabHistogram }}</button>
        </div>
        <div v-if="tab === 'treemap'">
            <div class="treemap" v-if="treemap.length">
                <div v-for="t in treemap" :key="t.name" class="tile" :style="{ '--area': t.bytes }">
                    <span class="tile-name">{{ t.name }}</span>
                    <span class="tile-size">{{ t.humanBytes }}</span>
                </div>
            </div>
            <p class="empty" v-else>{{ emptyTreemap || 'No directories under scope.' }}</p>
        </div>
        <div v-else-if="tab === 'types'">
            <table class="type-table" v-if="types.length">
                <thead>
                    <tr>
                        <th>{{ colType || 'Type' }}</th>
                        <th>{{ colFiles || 'Files' }}</th>
                        <th>{{ colPctFiles || '% Files' }}</th>
                        <th>{{ colBytes || 'Bytes' }}</th>
                        <th>{{ colPctBytes || '% Bytes' }}</th>
                        <th>{{ colLines || 'Lines' }}</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in types" :key="row.type">
                        <td><code>{{ row.type }}</code></td>
                        <td>{{ row.fileCount }}</td>
                        <td>{{ row.pctFiles }}%</td>
                        <td>{{ row.totalBytesHuman }}</td>
                        <td>{{ row.pctBytes }}%</td>
                        <td>{{ row.totalLines }}</td>
                        <td><div class="bar" :style="{ '--w': row.pctBytes }"></div></td>
                    </tr>
                </tbody>
            </table>
            <p class="empty" v-else>{{ emptyTypes || 'No file types collected.' }}</p>
        </div>
        <div v-else>
            <div class="histogram" v-if="histogram.length">
                <div v-for="b in histogram" :key="b.bucket" class="hbar" :style="{ '--h': b.pctFiles }">
                    <span class="hb-label">{{ b.bucket }}</span>
                    <span class="hb-count">{{ b.count }}</span>
                </div>
            </div>
            <p class="empty" v-else>{{ emptyHistogram || 'No size buckets collected.' }}</p>
        </div>
    </section>
`,
    css: '../../../YiPet/cdn/components/report/files/yry-report-size/index.css',
    props: {
        treemap: { type: Array, default: function() { return []; } },
        types: { type: Array, default: function() { return []; } },
        histogram: { type: Array, default: function() { return []; } },
        labels: { type: Object, default: function() { return {}; } }
    },
    data: function() {
        return { tab: 'treemap' };
    },
    computed: {
        title: function() { return (this.labels || {}).sectionSize || 'Size'; },
        tabTreemap: function() { return (this.labels || {}).tabTreemap || 'Treemap'; },
        tabTypes: function() { return (this.labels || {}).tabTypes || 'Types'; },
        tabHistogram: function() { return (this.labels || {}).tabHistogram || 'Histogram'; },
        colType: function() { return (this.labels || {}).colType; },
        colFiles: function() { return (this.labels || {}).colFiles; },
        colPctFiles: function() { return (this.labels || {}).colPctFiles; },
        colBytes: function() { return (this.labels || {}).colBytes; },
        colPctBytes: function() { return (this.labels || {}).colPctBytes; },
        colLines: function() { return (this.labels || {}).colLines; },
        emptyTreemap: function() { return (this.labels || {}).emptyTreemap; },
        emptyTypes: function() { return (this.labels || {}).emptyTypes; },
        emptyHistogram: function() { return (this.labels || {}).emptyHistogram; }
    }
};
if (typeof window !== 'undefined' && window.registerGlobalComponent) { window.registerGlobalComponent(compDef); }

})();
