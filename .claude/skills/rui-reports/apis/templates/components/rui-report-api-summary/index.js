(function () {
    'use strict';
    window.ruiReportApiSummary = {
        name: 'ruiReportApiSummary',
        template: '#rui-report-api-summary-tpl',
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
})();
