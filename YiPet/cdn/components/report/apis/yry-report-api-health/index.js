(function () {
const compDef = {
    name: 'yryReportApiHealth',
    template: `
    <section id="health">
        <div class="health-grid">
            <div class="health-card" v-for="card in cards" :key="card.label">
                <div class="health-card-label">{{ card.label }}</div>
                <div class="health-card-value" :class="card.tone">{{ card.value }}</div>
            </div>
        </div>
        <div v-if="endpointsWithoutErrorHandling.length" class="health-detail">
            <h3>Endpoints Without Error Handling</h3>
            <table>
                <thead><tr><th>Path</th><th>Method</th><th>Handler File</th><th>Line</th></tr></thead>
                <tbody>
                    <tr v-for="ep in endpointsWithoutErrorHandling" :key="ep.path + ':' + ep.method">
                        <td><code>{{ ep.path }}</code></td>
                        <td><span class="method-chip" :class="ep.method">{{ ep.method }}</span></td>
                        <td><code>{{ ep.handlerFile }}</code></td>
                        <td>{{ ep.line }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-if="handlerComplexity.length" class="health-detail">
            <h3>Handler Complexity</h3>
            <table>
                <thead><tr><th>Path</th><th>Method</th><th>Handler</th><th>LOC</th><th>Complexity</th><th>Handler File</th></tr></thead>
                <tbody>
                    <tr v-for="h in handlerComplexity" :key="h.path + ':' + h.method">
                        <td><code>{{ h.path }}</code></td>
                        <td><span class="method-chip" :class="h.method">{{ h.method }}</span></td>
                        <td>{{ h.handler }}</td>
                        <td style="font-family: var(--yry-font-mono, ui-monospace, monospace); font-weight: 700;">{{ h.lines }}</td>
                        <td><span class="complexity-badge" :class="h.complexity">{{ h.complexity }}</span></td>
                        <td><code>{{ h.handlerFile }}</code><template v-if="h.line">:{{ h.line }}</template></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <p v-if="!endpointsWithoutErrorHandling.length && !handlerComplexity.length"
           style="color: var(--yry-ok, #16a34a); font-size: 12px; font-weight: 600;">
           &#x2713; {{ labels.emptyHealth || 'No health issues detected.' }}
        </p>
    </section>
`,
    css: '../../../YiPet/cdn/components/report/apis/yry-report-api-health/index.css',
    props: {
        health: { type: Object, default: function() { return {}; } },
        labels: { type: Object, default: function() { return {}; } },
    },
    computed: {
        cards: function () {
            var h = this.health || {};
            var L = this.labels || {};
            return [
                {
                    label: L.healthErrorCoverage || 'Error Handling',
                    value: h.errorHandlingCoverage != null ? Math.round(h.errorHandlingCoverage * 100) + '%' : 'N/A',
                    tone: h.errorHandlingCoverage != null && h.errorHandlingCoverage < 0.5 ? 'critical' : h.errorHandlingCoverage != null && h.errorHandlingCoverage < 0.7 ? 'warn' : 'ok',
                },
                {
                    label: L.healthResponseConsistency || 'Response Consistency',
                    value: h.responseConsistencyScore != null ? h.responseConsistencyScore + '/100' : 'N/A',
                    tone: h.responseConsistencyScore != null && h.responseConsistencyScore < 50 ? 'critical' : h.responseConsistencyScore != null && h.responseConsistencyScore < 70 ? 'warn' : 'ok',
                },
                {
                    label: L.healthHighComplexity || 'High Complexity',
                    value: (h.handlerComplexity || []).filter(function (c) { return c.complexity === 'high'; }).length,
                    tone: (h.handlerComplexity || []).filter(function (c) { return c.complexity === 'high'; }).length > 2 ? 'critical' : (h.handlerComplexity || []).filter(function (c) { return c.complexity === 'high'; }).length > 0 ? 'warn' : 'ok',
                },
            ];
        },
        endpointsWithoutErrorHandling: function () { return (this.health && this.health.endpointsWithoutErrorHandling) || []; },
        handlerComplexity: function () { return (this.health && this.health.handlerComplexity) || []; },
    },
};
if (typeof window !== 'undefined' && window.registerGlobalComponent) { window.registerGlobalComponent(compDef); }

})();
