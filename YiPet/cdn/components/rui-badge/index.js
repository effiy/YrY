import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'ruiBadge',
    html: '/cdn/components/rui-badge/template.html',
    css: '/cdn/components/rui-badge/index.css',
    props: {
        text:     { type: String, required: true },
        modifier: { type: String, default: 'info' },
        size:     { type: String, default: 'md' }
    },
    computed: {
        sizeClass() {
            const validSizes = ['sm', 'md'];
            if (validSizes.indexOf(this.size) === -1) {
                console.warn('[ruiBadge] unknown size "' + this.size + '", falling back to "md"');
                return 'rui-badge--md';
            }
            return 'rui-badge--' + this.size;
        }
    }
};
registerGlobalComponent(compDef);
export default compDef;
