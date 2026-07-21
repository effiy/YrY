import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'ruiTagChip',
    html: '/cdn/components/yry-tag-chip/template.html',
    css: '/cdn/components/yry-tag-chip/index.css',
    props: {
        text:     { type: String, required: true },
        modifier: { type: String, default: 'info' },
        href:     { type: String, default: '' }
    }
};
registerGlobalComponent(compDef);
export default compDef;
