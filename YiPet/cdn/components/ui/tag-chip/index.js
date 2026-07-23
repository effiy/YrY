import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'yryTagChip',
    html: '/cdn/components/common/tags/YrYTagChip/index.html',
    css: '/cdn/components/common/tags/YrYTagChip/index.css',
    props: {
        text:     { type: String, required: true },
        modifier: { type: String, default: 'info' },
        href:     { type: String, default: '' }
    }
};
registerGlobalComponent(compDef);
export default compDef;
