import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'yryBadge',
    html: '/cdn/components/common/indicators/YrYBadge/index.html',
    css: '/cdn/components/common/indicators/YrYBadge/index.css',
    props: {
        text:     { type: String, required: true },
        modifier: { type: String, default: 'info' },
        size:     { type: String, default: 'md' }
    },
    computed: {
        sizeClass() {
            const validSizes = ['sm', 'md'];
            if (validSizes.indexOf(this.size) === -1) {
                console.warn('[yryBadge] unknown size "' + this.size + '", falling back to "md"');
                return 'yry-badge--md';
            }
            return 'yry-badge--' + this.size;
        }
    }
};
registerGlobalComponent(compDef);
export default compDef;
