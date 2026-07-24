(function () {
const compDef = Object.assign({
    name: 'yryReportApiPatterns',
    template: `
    <section id="patterns">
        <table v-if="patterns.length">
            <thead>
                <tr>
                    <th @click="setSort('pattern')" :class="sortClass('pattern')" :aria-sort="sortAria('pattern')">{{ labels.colPath || 'Pattern' }}</th>
                    <th @click="setSort('version')" :class="sortClass('version')" :aria-sort="sortAria('version')">{{ labels.colVersion || 'Version' }}</th>
                    <th @click="setSort('resource')" :class="sortClass('resource')" :aria-sort="sortAria('resource')">{{ labels.colResource || 'Resource' }}</th>
                    <th @click="setSort('restScore')" :class="sortClass('restScore')" :aria-sort="sortAria('restScore')">{{ labels.colRestScore || 'REST Score' }}</th>
                    <th @click="setSort('methodCount')" :class="sortClass('methodCount')" :aria-sort="sortAria('methodCount')">{{ labels.colMethodCount || 'Methods' }}</th>
                    <th>{{ labels.colIssues || 'Issues' }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="p in sortBy(patterns)" :key="p.pattern">
                    <td><code>{{ p.pattern }}</code></td>
                    <td>{{ p.version || '—' }}</td>
                    <td>{{ p.resource }}</td>
                    <td>
                        <span :style="{ color: p.restScore >= 80 ? 'var(--yry-ok, #16a34a)' : p.restScore >= 50 ? 'var(--yry-warn, #d97706)' : 'var(--yry-critical, #dc2626)' }" style="font-weight: 700; font-family: var(--yry-font-mono, ui-monospace, monospace);">{{ p.restScore }}</span>
                    </td>
                    <td>{{ p.methodCount }}</td>
                    <td>
                        <ul v-if="p.issues && p.issues.length" style="margin:0;padding-left:16px;">
                            <li v-for="iss in p.issues" :key="iss" style="font-size:11px;color:var(--yry-fg-muted,#848893);">{{ iss }}</li>
                        </ul>
                        <span v-else style="font-size:11px;color:var(--yry-ok,#16a34a);">&#x2713; Clean</span>
                    </td>
                </tr>
            </tbody>
        </table>
        <p v-else style="color: var(--yry-fg-muted, #848893); font-size: 12px;">{{ labels.emptyPatterns || 'No route patterns identified.' }}</p>
    </section>
`,
    css: '../../../YiPet/cdn/components/report/apis/yry-report-api-patterns/index.css',
    props: {
        patterns: { type: Array, default: function() { return []; } },
        labels: { type: Object, default: function() { return {}; } },
    },
}, window.YrYSortable.setSortMixin({ sortKey: 'restScore', sortDir: 1 }));
if (typeof window !== 'undefined' && window.registerGlobalComponent) { window.registerGlobalComponent(compDef); }

})();
