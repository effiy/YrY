(function () {
const compDef = {
    name: 'yryReportApiEndpoints',
    template: `
    <section id="endpoints">
        <div class="api-endpoints-filter">
            <input type="text" v-model="filter" :placeholder="col.filterPlaceholder || 'filter by path, method, or handler\\u2026'" />
            <span class="api-endpoints-count">{{ filtered.length }} / {{ endpoints.length }}</span>
        </div>
        <div class="api-endpoints-table" v-if="filtered.length">
            <table>
                <thead>
                    <tr>
                        <th @click="setSort('method')" :class="sortClass('method')" :aria-sort="sortAria('method')">{{ col.colMethod || 'Method' }}</th>
                        <th @click="setSort('path')" :class="sortClass('path')" :aria-sort="sortAria('path')">{{ col.colPath || 'Path' }}</th>
                        <th @click="setSort('handler')" :class="sortClass('handler')" :aria-sort="sortAria('handler')">{{ col.colHandler || 'Handler' }}</th>
                        <th @click="setSort('middleware')" :class="sortClass('middleware')" :aria-sort="sortAria('middleware')">{{ col.colMiddleware || 'Middleware' }}</th>
                        <th @click="setSort('auth')" :class="sortClass('auth')" :aria-sort="sortAria('auth')">{{ col.colAuth || 'Auth' }}</th>
                        <th @click="setSort('validation')" :class="sortClass('validation')" :aria-sort="sortAria('validation')">{{ col.colValidation || 'Validation' }}</th>
                        <th @click="setSort('errorHandling')" :class="sortClass('errorHandling')" :aria-sort="sortAria('errorHandling')">{{ col.colErrorHandling || 'Error Handling' }}</th>
                        <th>{{ col.colStatusCodes || 'Status Codes' }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="ep in filtered" :key="ep.path + ':' + ep.method">
                        <td><span class="method-chip" :class="ep.method">{{ ep.method }}</span></td>
                        <td><code>{{ ep.path }}</code></td>
                        <td>
                            <code>{{ ep.handlerFile }}</code>
                            <template v-if="ep.line">:{{ ep.line }}</template>
                        </td>
                        <td>
                            <span class="mw-list" v-if="ep.middleware && ep.middleware.length">
                                <span class="mw-chip" v-for="mw in ep.middleware" :key="mw">{{ mw }}</span>
                            </span>
                            <span v-else style="color: var(--yry-fg-subtle, #4a5062)">—</span>
                        </td>
                        <td><span class="bool-chip" :class="ep.auth">&#x2713;</span><span v-if="!ep.auth" class="bool-chip false">&#x2717;</span></td>
                        <td><span class="bool-chip" :class="ep.validation">&#x2713;</span><span v-if="!ep.validation" class="bool-chip false">&#x2717;</span></td>
                        <td><span class="bool-chip" :class="ep.errorHandling">&#x2713;</span><span v-if="!ep.errorHandling" class="bool-chip false">&#x2717;</span></td>
                        <td>
                            <template v-if="ep.statusCodes && ep.statusCodes.length">
                                <span class="status-code-chip" v-for="sc in ep.statusCodes" :key="sc">{{ sc }}</span>
                            </template>
                            <span v-else style="color: var(--yry-fg-subtle, #4a5062)">—</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <p v-else style="color: var(--yry-fg-muted, #848893); font-size: 12px;">{{ col.emptyEndpoints || 'No API endpoints detected in scope.' }}</p>
    </section>
`,
    css: '../../../YiPet/cdn/components/report/apis/yry-report-api-endpoints/index.css',
    props: {
        endpoints: { type: Array, default: function() { return []; } },
        labels: { type: Object, default: function() { return {}; } },
    },
    mixins: [window.YrYSortable.setSortMixin({ sortKey: 'path', sortDir: 1 })],
    data: function () {
        return { filter: '' };
    },
    computed: {
        filtered: function () {
            var f = (this.filter || '').toLowerCase();
            var list = (this.endpoints || []).slice();
            if (!f) return this.sortBy(list);
            var self = this;
            return this.sortBy(list.filter(function (ep) {
                return (ep.path || '').toLowerCase().indexOf(f) > -1 ||
                       (ep.method || '').toLowerCase().indexOf(f) > -1 ||
                       (ep.handler || '').toLowerCase().indexOf(f) > -1;
            }));
        },
        col: function () { return this.labels || {}; },
    },
};
if (typeof window !== 'undefined' && window.registerGlobalComponent) { window.registerGlobalComponent(compDef); }

})();
