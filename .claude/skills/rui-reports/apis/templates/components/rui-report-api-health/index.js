(function () {
    'use strict';
    window.ruiReportApiHealth = {
        name: 'ruiReportApiHealth',
        template: '#rui-report-api-health-tpl',
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
})();
