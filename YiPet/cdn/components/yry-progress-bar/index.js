import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'ruiProgressBar',
    html: '/cdn/components/yry-progress-bar/template.html',
    css: '/cdn/components/yry-progress-bar/index.css',
    props: {
        value:     { type: Number,  required: true },
        label:     { type: String,  default: '' },
        showValue: { type: Boolean, default: true },
        modifier:  { type: String,  default: 'accent' }
    }
};
registerGlobalComponent(compDef);
export default compDef;
