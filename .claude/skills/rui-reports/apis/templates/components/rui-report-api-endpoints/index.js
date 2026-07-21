(function () {
    'use strict';
    window.ruiReportApiEndpoints = Object.assign({
        name: 'ruiReportApiEndpoints',
        template: '#rui-report-api-endpoints-tpl',
        props: {
            endpoints: { type: Array, default: function() { return []; } },
            labels: { type: Object, default: function() { return {}; } },
        },
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
    }, window.RuiSortable.setSortMixin({ sortKey: 'path', sortDir: 1 }));
})();
