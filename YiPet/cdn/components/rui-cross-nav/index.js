import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'ruiCrossNav',
    html: '/cdn/components/rui-cross-nav/template.html',
    css: '/cdn/components/rui-cross-nav/index.css',
    props: {
        pages:           { type: Array,  required: true },
        basePath:        { type: String, default: './' },
        active:          { type: String, default: '' },
        separator:       { type: String, default: '\u00B7' },
        ariaLabel:       { type: String, default: 'Cross navigation' },
        activeAriaLabel: { type: String, default: 'Current page' }
    }
};
registerGlobalComponent(compDef);
export default compDef;
