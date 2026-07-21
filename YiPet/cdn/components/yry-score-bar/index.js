import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'ruiScoreBar',
    html: '/cdn/components/yry-score-bar/template.html',
    css: '/cdn/components/yry-score-bar/index.css',
    props: {
        score:      { type: Object,  required: true },
        alerts:     { type: Object,  default: null },
        label:      { type: String,  default: 'Score' },
        showAlerts: { type: Boolean, default: true }
    }
};
registerGlobalComponent(compDef);
export default compDef;
