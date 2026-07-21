import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'ruiTagChip',
    html: '/cdn/components/common/tags/YiTagChip/template.html',
    css: '/cdn/components/common/tags/YiTagChip/index.css',
    props: {
        text:     { type: String, required: true },
        modifier: { type: String, default: 'info' },
        href:     { type: String, default: '' }
    }
};
registerGlobalComponent(compDef);
export default compDef;
