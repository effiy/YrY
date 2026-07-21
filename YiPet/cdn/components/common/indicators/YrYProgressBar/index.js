import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'yryProgressBar',
    html: '/cdn/components/common/indicators/YrYProgressBar/template.html',
    css: '/cdn/components/common/indicators/YrYProgressBar/index.css',
    props: {
        value:     { type: Number,  required: true },
        label:     { type: String,  default: '' },
        showValue: { type: Boolean, default: true },
        modifier:  { type: String,  default: 'accent' }
    }
};
registerGlobalComponent(compDef);
export default compDef;
