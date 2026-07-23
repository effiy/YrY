import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';
import { getIconClass } from '/cdn/components/common/icons/iconMap.js';

const compDef = {
    name: 'yryErrorState',
    html: '/cdn/components/common/feedback/YrYErrorState/index.html',
    css: '/cdn/components/common/feedback/YrYErrorState/index.css',
    props: {
        message: {
            type: [String, Number],
            default: ''
        },
        containerClass: {
            type: String,
            default: 'yry-error-state'
        },
        iconClass: {
            type: String,
            default: ''
        },
        iconWrapperClass: {
            type: String,
            default: 'yry-error-state-icon'
        },
        messageClass: {
            type: String,
            default: 'yry-error-state-message'
        },
        showRetry: {
            type: Boolean,
            default: false
        },
        retryText: {
            type: String,
            default: '重试'
        },
        retryButtonClass: {
            type: String,
            default: 'yry-error-state-retry-button'
        },
        retryDisabled: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        resolvedIconClass() {
            if (!this.iconClass) return '';
            if (this.iconClass.includes(' ')) return getIconClass(this.iconClass.split(' ').pop());
            return getIconClass(this.iconClass);
        }
    },
    emits: ['retry']
};
registerGlobalComponent(compDef);
export default compDef;
