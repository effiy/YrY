import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'ruiProgressBar',
    html: '/cdn/components/common/indicators/YiProgressBar/template.html',
    css: '/cdn/components/common/indicators/YiProgressBar/index.css',
    props: {
        value:     { type: Number,  required: true },
        label:     { type: String,  default: '' },
        showValue: { type: Boolean, default: true },
        modifier:  { type: String,  default: 'accent' }
    }
};
registerGlobalComponent(compDef);
export default compDef;
