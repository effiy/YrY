/**
 * 优化后的yiTag组件
 * author: liangliang
 */
import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'yryTag',
    html: '/cdn/components/common/tags/YrYTag/index.html',
    css: '/cdn/components/common/tags/YrYTag/index.css',
    props: {
        as: {
            type: String,
            default: 'span',
            validator: (value) => ['span', 'button'].includes(value)
        },
        unstyled: {
            type: Boolean,
            default: false
        },
        clickable: {
            type: Boolean,
            default: false
        },
        closable: {
            type: Boolean,
            default: false
        },
        active: {
            type: Boolean,
            default: false
        },
        size: {
            type: String,
            default: '',
            validator: (value) => !value || ['sm', 'lg'].includes(value)
        },
        variant: {
            type: String,
            default: '',
            validator: (value) => !value || ['primary', 'success', 'warning', 'danger', 'info', 'accent'].includes(value)
        },
        disabled: {
            type: Boolean,
            default: false
        },
        className: {
            type: [String, Array, Object],
            default: ''
        },
        title: {
            type: String,
            default: ''
        },
        ariaLabel: {
            type: String,
            default: ''
        }
    },
    emits: ['click', 'close'],
    computed: {
        computedClass() {
            const classes = this.unstyled ? [] : ['yry-tag'];

            if (!this.unstyled && (this.clickable || this.as === 'button')) {
                classes.push('yry-tag-clickable');
            }

            if (!this.unstyled && this.active) {
                classes.push('yry-tag-active');
            }

            if (!this.unstyled && this.disabled) {
                classes.push('yry-tag-disabled');
            }

            if (!this.unstyled && this.size) {
                classes.push(`yry-tag-${this.size}`);
            }

            if (!this.unstyled && this.variant) {
                classes.push(`yry-tag-${this.variant}`);
            }

            if (this.className) {
                classes.push(this.className);
            }

            return classes;
        }
    },
    methods: {
        onClick(event) {
            if (this.disabled) {
                if (event && typeof event.preventDefault === 'function') {
                    event.preventDefault();
                }
                if (event && typeof event.stopPropagation === 'function') {
                    event.stopPropagation();
                }
                return;
            }

            this.$emit('click', event);
        },
        onClose(event) {
            if (this.disabled) {
                if (event && typeof event.preventDefault === 'function') {
                    event.preventDefault();
                }
                if (event && typeof event.stopPropagation === 'function') {
                    event.stopPropagation();
                }
                return;
            }

            if (event && typeof event.stopPropagation === 'function') {
                event.stopPropagation();
            }

            this.$emit('close', event);
        }
    }
};
registerGlobalComponent(compDef);
export default compDef;