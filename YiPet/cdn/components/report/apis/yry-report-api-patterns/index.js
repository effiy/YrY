import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = Object.assign({
    name: 'yryReportApiPatterns',
    html: '/cdn/components/business/reports/apis/yry-report-api-patterns/index.html',
    css: '/cdn/components/business/reports/apis/yry-report-api-patterns/index.css',
    props: {
        patterns: { type: Array, default: function() { return []; } },
        labels: { type: Object, default: function() { return {}; } },
    },
}, window.YrYSortable.setSortMixin({ sortKey: 'restScore', sortDir: 1 }));
registerGlobalComponent(compDef);
export default compDef;
