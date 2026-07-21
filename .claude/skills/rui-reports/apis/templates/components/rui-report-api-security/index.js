(function () {
    'use strict';
    window.ruiReportApiSecurity = {
        name: 'ruiReportApiSecurity',
        template: '#rui-report-api-security-tpl',
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
})();
