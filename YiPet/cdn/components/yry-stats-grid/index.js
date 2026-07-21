import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'ruiStatsGrid',
    html: '/cdn/components/yry-stats-grid/template.html',
    css: '/cdn/components/yry-stats-grid/index.css',
    props: {
        items:  { type: Array,  required: true },
        layout: { type: String, default: 'grid' }
    }
};
registerGlobalComponent(compDef);
export default compDef;
