import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'ruiStatsGrid',
    html: '/cdn/components/rui-stats-grid/template.html',
    css: '/cdn/components/rui-stats-grid/index.css',
    props: {
        items:  { type: Array,  required: true },
        layout: { type: String, default: 'grid' }
    }
};
registerGlobalComponent(compDef);
export default compDef;
