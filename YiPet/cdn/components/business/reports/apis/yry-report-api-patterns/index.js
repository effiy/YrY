(function () {
    'use strict';
    window.ruiReportApiPatterns = Object.assign({
        name: 'ruiReportApiPatterns',
        template: '#yry-report-api-patterns-tpl',
        props: {
            patterns: { type: Array, default: function() { return []; } },
            labels: { type: Object, default: function() { return {}; } },
        },
    }, window.RuiSortable.setSortMixin({ sortKey: 'restScore', sortDir: 1 }));
})();
