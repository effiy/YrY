import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'yryLoading',
    html: '/cdn/components/common/loaders/YrYLoading/index.html',
    css: '/cdn/components/common/loaders/YrYLoading/index.css',
    props: {
        text: {
            type: String,
            default: '正在加载...'
        },
        subtext: {
            type: String,
            default: ''
        },
        size: {
            type: String,
            default: '',
            validator: (value) => !value || ['small', 'large'].includes(value)
        },
        type: {
            type: String,
            default: 'spinner',
            validator: (value) => ['spinner', 'dots', 'pulse', 'wave'].includes(value)
        },
        fullscreen: {
            type: Boolean,
            default: false
        },
        overlay: {
            type: Boolean,
            default: false
        },
        containerClass: {
            type: String,
            default: 'yry-loading-container'
        },
        spinnerClass: {
            type: String,
            default: 'yry-loading-spinner'
        },
        textClass: {
            type: String,
            default: 'yry-loading-text'
        },
        subtextClass: {
            type: String,
            default: 'yry-loading-subtext'
        }
    },
    computed: {
        computedContainerClass() {
            const classes = [this.containerClass];

            if (this.fullscreen) {
                classes.push('yry-loading-fullscreen');
            }

            if (this.overlay) {
                classes.push('yry-loading-overlay');
            }

            return classes.join(' ');
        },
        computedSpinnerClass() {
            const classes = [this.spinnerClass];

            if (this.size) {
                classes.push(`yry-loading-${this.size}`);
            }

            if (this.type !== 'spinner') {
                classes.push(`yry-loading-${this.type}`);
            }

            return classes.join(' ');
        }
    }
};
registerGlobalComponent(compDef);
export default compDef;