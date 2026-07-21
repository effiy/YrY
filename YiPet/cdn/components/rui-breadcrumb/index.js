import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'ruiBreadcrumb',
    html: '/cdn/components/rui-breadcrumb/template.html',
    css: '/cdn/components/rui-breadcrumb/index.css',
    props: {
        items:     { type: Array,  required: true },
        ariaLabel: { type: String, default: 'Breadcrumb navigation' },
        separator: { type: String, default: '/' }
    }
};
registerGlobalComponent(compDef);
export default compDef;
