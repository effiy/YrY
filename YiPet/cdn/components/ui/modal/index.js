import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'yryModal',
    html: '/cdn/components/common/modals/YrYModal/template.html',
    css: '/cdn/components/common/modals/YrYModal/index.css',
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: ''
        },
        size: {
            type: String,
            default: 'medium'
        },
        showHeader: {
            type: Boolean,
            default: true
        },
        showFooter: {
            type: Boolean,
            default: false
        },
        showClose: {
            type: Boolean,
            default: true
        },
        maskClosable: {
            type: Boolean,
            default: true
        },
        escClosable: {
            type: Boolean,
            default: true
        },
        wrapperClass: {
            type: String,
            default: 'yry-modal-wrapper'
        },
        maskClass: {
            type: String,
            default: 'yry-modal-mask'
        },
        bodyClass: {
            type: String,
            default: 'yry-modal-body'
        },
        headerClass: {
            type: String,
            default: 'yry-modal-header'
        },
        titleClass: {
            type: String,
            default: 'yry-modal-title'
        },
        closeClass: {
            type: String,
            default: 'yry-modal-close'
        },
        contentClass: {
            type: String,
            default: 'yry-modal-content'
        },
        footerClass: {
            type: String,
            default: 'yry-modal-footer'
        },
        ariaLabel: {
            type: String,
            default: ''
        },
        bodyTabindex: {
            type: [Number, String],
            default: 0
        }
    },
    emits: ['close', 'open'],
    computed: {
        computedBodyClass() {
            const classes = [this.bodyClass];

            if (this.size) {
                classes.push(`yry-modal-${this.size}`);
            }

            return classes.join(' ');
        }
    },
    watch: {
        visible(newVal) {
            if (newVal) {
                this.onOpen();
            }
        }
    },
    methods: {
        onMaskClick() {
            if (!this.maskClosable) return;
            this.$emit('close');
        },
        onEscKeydown() {
            if (!this.escClosable) return;
            this.$emit('close');
        },
        onClose() {
            this.$emit('close');
        },
        onOpen() {
            this.$emit('open');

            // 锁定body滚动
            if (typeof document !== 'undefined') {
                document.body.classList.add('yry-modal-scroll-locked');
            }
        }
    },
    beforeUnmount() {
        // 恢复body滚动
        if (typeof document !== 'undefined') {
            document.body.classList.remove('yry-modal-scroll-locked');
        }
    }
};
registerGlobalComponent(compDef);
export default compDef;
