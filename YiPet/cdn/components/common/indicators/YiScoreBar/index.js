import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'ruiScoreBar',
    html: '/cdn/components/common/indicators/YiScoreBar/template.html',
    css: '/cdn/components/common/indicators/YiScoreBar/index.css',
    props: {
        score:      { type: Object,  required: true },
        alerts:     { type: Object,  default: null },
        label:      { type: String,  default: 'Score' },
        showAlerts: { type: Boolean, default: true }
    }
};
registerGlobalComponent(compDef);
export default compDef;
