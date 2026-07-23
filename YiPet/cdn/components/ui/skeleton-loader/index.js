import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'yrySkeletonLoader',
    html: '/cdn/components/business/SkeletonLoader/template.html',
    css: '/cdn/components/business/SkeletonLoader/index.css',
    props: {},
    emits: []
};
registerGlobalComponent(compDef);
export default compDef;
