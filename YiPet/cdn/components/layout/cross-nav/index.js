import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'yryCrossNav',
    html: '/cdn/components/common/navigation/YrYCrossNav/index.html',
    css: '/cdn/components/common/navigation/YrYCrossNav/index.css',
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
