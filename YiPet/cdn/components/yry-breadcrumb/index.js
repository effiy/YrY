import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'ruiBreadcrumb',
    html: '/cdn/components/yry-breadcrumb/template.html',
    css: '/cdn/components/yry-breadcrumb/index.css',
    props: {
        items:     { type: Array,  required: true },
        ariaLabel: { type: String, default: 'Breadcrumb navigation' },
        separator: { type: String, default: '/' }
    }
};
registerGlobalComponent(compDef);
export default compDef;
