(function () {
    'use strict';
    window.ruiReportApiMethods = Object.assign({
        name: 'ruiReportApiMethods',
        template: '#yry-report-api-methods-tpl',
        props: {
            methods: { type: Array, default: function() { return []; } },
            labels: { type: Object, default: function() { return {}; } },
        },
    }, window.RuiSortable.setSortMixin({ sortKey: 'count', sortDir: -1 }));
})();
