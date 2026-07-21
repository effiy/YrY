import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'yryReportApiEndpoints',
    html: '/cdn/components/business/reports/apis/yry-report-api-endpoints/index.html',
    css: '/cdn/components/business/reports/apis/yry-report-api-endpoints/index.css',
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
registerGlobalComponent(compDef);
export default compDef;
