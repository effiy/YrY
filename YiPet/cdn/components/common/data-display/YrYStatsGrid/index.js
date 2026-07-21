import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'yryStatsGrid',
    html: '/cdn/components/common/data-display/YrYStatsGrid/template.html',
    css: '/cdn/components/common/data-display/YrYStatsGrid/index.css',
    props: {
        items:  { type: Array,  required: true },
        layout: { type: String, default: 'grid' }
    }
};
registerGlobalComponent(compDef);
export default compDef;
