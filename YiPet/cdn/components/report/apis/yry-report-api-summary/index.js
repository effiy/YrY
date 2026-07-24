(function () {
const compDef = {
    name: 'yryReportApiSummary',
    template: `
    <section id="summary" class="api-summary">
        <div class="score-card">
            <div class="score-gauge" :class="scoreClass">
                <div class="score-value">{{ data.score }}</div>
                <div class="score-label">Health Score / 100</div>
                <div class="score-grade">{{ scoreGrade }}</div>
            </div>
            <div class="score-bar-bg">
                <div class="score-bar-fill" :class="scoreClass" :style="{ width: (data.score || 0) + '%' }"></div>
            </div>
        </div>
        <div class="stat-cards">
            <div class="stat-card" v-for="c in statCards" :key="c.label">
                <div class="stat-card-label">{{ c.label }}</div>
                <div class="stat-card-value" :class="c.tone">{{ c.value }}</div>
                <div class="stat-card-sub" v-if="c.sub">{{ c.sub }}</div>
            </div>
        </div>
        <div class="method-dist" v-if="methods.length">
            <div class="method-dist-label">HTTP Method Distribution</div>
            <div class="method-bars">
                <div class="method-bar" v-for="m in methods" :key="m.method">
                    <span class="method-bar-tag" :class="'method-' + m.method.toLowerCase()">{{ m.method }}</span>
                    <span class="method-bar-track">
                        <span class="method-bar-fill" :class="'method-' + m.method.toLowerCase()" :style="{ width: m.pct + '%' }"></span>
                    </span>
                    <span class="method-bar-val">{{ m.count }} ({{ Math.round(m.pct) }}%)</span>
                </div>
            </div>
        </div>
    </section>
`,
    css: '../../../YiPet/cdn/components/report/apis/yry-report-api-summary/index.css',
    props: {
        data: { type: Object, default: function() { return {}; } },
        labels: { type: Object, default: function() { return {}; } },
    },
    computed: {
        scoreClass: function () {
            const s = this.data && this.data.score;
            if (s == null) return '';
            if (s < 40) return 'critical';
            if (s < 70) return 'warn';
            return 'ok';
        },
        scoreGrade: function () {
            const s = this.data && this.data.score;
            if (s == null) return '';
            if (s >= 90) return 'A';
            if (s >= 75) return 'B';
            if (s >= 60) return 'C';
            if (s >= 40) return 'D';
            return 'F';
        },
        statCards: function () {
            const s = this.data && this.data.summary || {};
            const L = this.labels || {};
            return [
                { label: L.summaryTotalEndpoints || 'Total Requests', value: s.totalRequests || 0, tone: 'info' },
                { label: L.summaryTotalHandlers || 'Total Handlers', value: s.totalHandlers || 0, tone: 'info' },
                {
                    label: L.summaryAuthCoverage || 'Auth Coverage',
                    value: s.authCoverage != null ? Math.round(s.authCoverage * 100) + '%' : 'N/A',
                    tone: s.authCoverage != null && s.authCoverage < 0.5 ? 'critical' : s.authCoverage != null && s.authCoverage < 0.8 ? 'warn' : 'ok',
                },
                {
                    label: L.summaryValidationCoverage || 'Validation',
                    value: s.validationDepthCoverage != null ? Math.round(s.validationDepthCoverage * 100) + '%' : 'N/A',
                    tone: s.validationDepthCoverage != null && s.validationDepthCoverage < 0.5 ? 'critical' : s.validationDepthCoverage != null && s.validationDepthCoverage < 0.8 ? 'warn' : 'ok',
                },
            ];
        },
        methods: function () {
            return (this.data && this.data.methods) || [];
        },
    },
};
if (typeof window !== 'undefined' && window.registerGlobalComponent) { window.registerGlobalComponent(compDef); }

})();
