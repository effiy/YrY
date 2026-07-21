import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = Object.assign({
    name: 'yryReportApiMethods',
    html: '/cdn/components/business/reports/apis/yry-report-api-methods/index.html',
    css: '/cdn/components/business/reports/apis/yry-report-api-methods/index.css',
    props: {
        methods: { type: Array, default: function() { return []; } },
        labels: { type: Object, default: function() { return {}; } },
    },
}, window.YrYSortable.setSortMixin({ sortKey: 'count', sortDir: -1 }));
registerGlobalComponent(compDef);
export default compDef;
