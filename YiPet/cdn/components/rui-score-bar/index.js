import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'ruiScoreBar',
    html: '/cdn/components/rui-score-bar/template.html',
    css: '/cdn/components/rui-score-bar/index.css',
    props: {
        score:      { type: Object,  required: true },
        alerts:     { type: Object,  default: null },
        label:      { type: String,  default: 'Score' },
        showAlerts: { type: Boolean, default: true }
    }
};
registerGlobalComponent(compDef);
export default compDef;
