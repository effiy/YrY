(function () {
const compDef = {
    name: 'yryReportApiSecurity',
    template: `
    <section id="security">
        <div class="security-grid">
            <div class="security-card" v-for="card in cards" :key="card.label">
                <div class="security-card-label">{{ card.label }}</div>
                <div class="security-card-value" :class="card.tone">{{ card.value }}</div>
                <div class="security-card-sub" v-if="card.sub">{{ card.sub }}</div>
            </div>
        </div>
        <div v-if="endpointsMissingAuth.length" class="security-detail">
            <h3>Endpoints Missing Authentication</h3>
            <table>
                <thead><tr><th>Path</th><th>Method</th><th>Handler File</th><th>Line</th></tr></thead>
                <tbody>
                    <tr v-for="ep in endpointsMissingAuth" :key="ep.path + ':' + ep.method">
                        <td><code>{{ ep.path }}</code></td>
                        <td><span class="method-chip" :class="ep.method">{{ ep.method }}</span></td>
                        <td><code>{{ ep.handlerFile }}</code></td>
                        <td>{{ ep.line }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-if="endpointsMissingValidation.length" class="security-detail">
            <h3>Endpoints Missing Input Validation</h3>
            <table>
                <thead><tr><th>Path</th><th>Method</th><th>Handler File</th><th>Line</th></tr></thead>
                <tbody>
                    <tr v-for="ep in endpointsMissingValidation" :key="ep.path + ':' + ep.method">
                        <td><code>{{ ep.path }}</code></td>
                        <td><span class="method-chip" :class="ep.method">{{ ep.method }}</span></td>
                        <td><code>{{ ep.handlerFile }}</code></td>
                        <td>{{ ep.line }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-if="endpointsMissingRateLimit.length" class="security-detail">
            <h3>Endpoints Missing Rate Limiting</h3>
            <table>
                <thead><tr><th>Path</th><th>Method</th><th>Handler File</th><th>Line</th></tr></thead>
                <tbody>
                    <tr v-for="ep in endpointsMissingRateLimit" :key="ep.path + ':' + ep.method">
                        <td><code>{{ ep.path }}</code></td>
                        <td><span class="method-chip" :class="ep.method">{{ ep.method }}</span></td>
                        <td><code>{{ ep.handlerFile }}</code></td>
                        <td>{{ ep.line }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <p v-if="!endpointsMissingAuth.length && !endpointsMissingValidation.length && !endpointsMissingRateLimit.length"
           style="color: var(--yry-ok, #16a34a); font-size: 12px; font-weight: 600;">
           &#x2713; {{ labels.emptySecurity || 'No security issues detected.' }}
        </p>
    </section>
`,
    css: '../../../YiPet/cdn/components/report/apis/yry-report-api-security/index.css',
    props: {
        security: { type: Object, default: function() { return {}; } },
        labels: { type: Object, default: function() { return {}; } },
    },
    computed: {
        cards: function () {
            var s = this.security || {};
            var L = this.labels || {};
            return [
                {
                    label: L.securityAuthCoverage || 'Auth Coverage',
                    value: s.authCoverage != null ? Math.round(s.authCoverage * 100) + '%' : 'N/A',
                    tone: s.authCoverage != null && s.authCoverage < 0.5 ? 'critical' : s.authCoverage != null && s.authCoverage < 0.8 ? 'warn' : 'ok',
                },
                {
                    label: L.securityValidationCoverage || 'Input Validation',
                    value: s.inputValidationCoverage != null ? Math.round(s.inputValidationCoverage * 100) + '%' : 'N/A',
                    tone: s.inputValidationCoverage != null && s.inputValidationCoverage < 0.5 ? 'critical' : s.inputValidationCoverage != null && s.inputValidationCoverage < 0.8 ? 'warn' : 'ok',
                },
                {
                    label: L.securityRateLimit || 'Rate Limit',
                    value: s.rateLimitCoverage != null ? Math.round(s.rateLimitCoverage * 100) + '%' : 'N/A',
                    tone: s.rateLimitCoverage != null && s.rateLimitCoverage < 0.5 ? 'critical' : s.rateLimitCoverage != null && s.rateLimitCoverage < 0.8 ? 'warn' : 'ok',
                },
                {
                    label: L.securityCorsConfigured || 'CORS',
                    value: s.corsConfigured ? '\u2713' : '\u2717',
                    tone: s.corsConfigured ? 'ok' : 'critical',
                },
            ];
        },
        endpointsMissingAuth: function () { return (this.security && this.security.endpointsMissingAuth) || []; },
        endpointsMissingValidation: function () { return (this.security && this.security.endpointsMissingValidation) || []; },
        endpointsMissingRateLimit: function () { return (this.security && this.security.endpointsMissingRateLimit) || []; },
    },
};
if (typeof window !== 'undefined' && window.registerGlobalComponent) { window.registerGlobalComponent(compDef); }

})();
