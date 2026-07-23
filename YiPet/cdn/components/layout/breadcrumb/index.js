import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'yryBreadcrumb',
    html: '/cdn/components/common/navigation/YrYBreadcrumb/template.html',
    css: '/cdn/components/common/navigation/YrYBreadcrumb/index.css',
    props: {
        items:     { type: Array,  required: true },
        ariaLabel: { type: String, default: 'Breadcrumb navigation' },
        separator: { type: String, default: '/' }
    }
};
registerGlobalComponent(compDef);
export default compDef;
