import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';
import { getIconClass } from '/cdn/components/common/icons/iconMap.js';

const compDef = {
    name: 'yryIcon',
    html: '/cdn/components/common/icons/YrYIcon/index.html',
    css: '/cdn/components/common/icons/YrYIcon/index.css',
    props: {
        name: {
            type: String,
            default: ''
        },
        size: {
            type: String,
            default: '',
            validator: (value) => !value || ['sm', 'lg', 'xl'].includes(value)
        },
        spin: {
            type: Boolean,
            default: false
        },
        className: {
            type: String,
            default: ''
        }
    },
    setup(props) {
        const Vue = window.Vue;
        if (!Vue) {
            console.error('[YrYIcon] Vue not available on window');
            return { iconClass: '' };
        }

        const iconClass = Vue.computed(() => {
            const base = getIconClass(props.name);
            const parts = [base];
            if (props.spin) parts.push('fa-spin');
            if (props.size) parts.push(`fa-${props.size}`);
            if (props.className) parts.push(props.className);
            return parts.join(' ');
        });

        return { iconClass };
    }
};
registerGlobalComponent(compDef);
export default compDef;
