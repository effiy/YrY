import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';
import { getIconClass } from '/cdn/components/common/icons/iconMap.js';

const compDef = {
    name: 'yryButton',
    html: '/cdn/components/common/buttons/YrYButton/index.html',
    css: '/cdn/components/common/buttons/YrYButton/index.css',
    props: {
        as: {
            type: String,
            default: 'button',
            validator: (value) => ['button', 'a'].includes(value)
        },
        type: {
            type: String,
            default: 'button',
            validator: (value) => ['button', 'submit', 'reset'].includes(value)
        },
        href:        { type: String, default: '' },
        target:      { type: String, default: '' },
        rel:         { type: String, default: '' },
        loading:     { type: Boolean, default: false },
        disabled:    { type: Boolean, default: false },
        block:       { type: Boolean, default: false },
        icon:        { type: String, default: '' },
        iconPosition:{ type: String, default: 'left', validator: (v) => ['left', 'right'].includes(v) },
        className:   { type: [String, Array, Object], default: '' },
        title:       { type: String, default: '' },
        ariaLabel:   { type: String, default: '' }
    },
    emits: ['click'],
    computed: {
        computedClass() {
            const classes = ['yry-btn'];

            if (this.variant) classes.push(`yry-btn-${this.variant}`);
            if (this.size) classes.push(`yry-btn-${this.size}`);
            if (this.loading) classes.push('yry-btn-loading');
            if (this.block) classes.push('yry-btn-block');
            if (this.icon && !this.$slots.default) classes.push('yry-btn-icon');
            if (this.className) classes.push(this.className);

            return classes;
        },
        isDisabled() {
            return this.disabled || this.loading;
        },
        resolvedIconClass() {
            if (!this.icon) return '';
            if (this.icon.includes(' ')) return getIconClass(this.icon.split(' ').pop());
            return getIconClass(this.icon);
        }
    },
    methods: {
        onClick(event) {
            if (this.isDisabled) {
                if (event && typeof event.preventDefault === 'function') event.preventDefault();
                if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
                return;
            }
            this.$emit('click', event);
        }
    }
};
registerGlobalComponent(compDef);
export default compDef;
