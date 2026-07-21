import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'yryInput',
    html: '/cdn/components/common/forms/YrYInput/template.html',
    css: '/cdn/components/common/forms/YrYInput/index.css',
    props: {
        type: {
            type: String,
            default: 'text'
        },
        size: {
            type: String,
            default: '',
            validator: (value) => !value || ['sm', 'lg'].includes(value)
        },
        variant: {
            type: String,
            default: '',
            validator: (value) => !value || ['error'].includes(value)
        },
        placeholder: {
            type: String,
            default: ''
        },
        disabled: {
            type: Boolean,
            default: false
        },
        readonly: {
            type: Boolean,
            default: false
        },
        required: {
            type: Boolean,
            default: false
        },
        modelValue: {
            type: [String, Number],
            default: ''
        },
        name: {
            type: String,
            default: ''
        },
        id: {
            type: String,
            default: ''
        },
        ariaLabel: {
            type: String,
            default: ''
        },
        autocomplete: {
            type: String,
            default: ''
        },
        className: {
            type: String,
            default: ''
        }
    },
    emits: ['update:modelValue', 'focus', 'blur'],
    computed: {
        computedClass() {
            const classes = ['yry-input'];
            if (this.size) {
                classes.push(`yry-input-${this.size}`);
            }
            if (this.variant) {
                classes.push(`yry-input-${this.variant}`);
            }
            if (this.className) {
                classes.push(this.className);
            }
            return classes;
        }
    },
    methods: {
        onInput(event) {
            this.$emit('update:modelValue', event.target.value);
        },
        onFocus(event) {
            this.$emit('focus', event);
        },
        onBlur(event) {
            this.$emit('blur', event);
        }
    }
};
registerGlobalComponent(compDef);
export default compDef;
