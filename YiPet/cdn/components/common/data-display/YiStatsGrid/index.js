import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'ruiStatsGrid',
    html: '/cdn/components/common/data-display/YiStatsGrid/template.html',
    css: '/cdn/components/common/data-display/YiStatsGrid/index.css',
    props: {
        items:  { type: Array,  required: true },
        layout: { type: String, default: 'grid' }
    }
};
registerGlobalComponent(compDef);
export default compDef;
