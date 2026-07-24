import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'yryAicrCodeArea',
    html: '/YiPet/cdn/components/business/views/aicr/aicrCodeArea/index.html',
    setup() {
        return Vue.inject('viewContext') || {};
    }
};

registerGlobalComponent(compDef);
export default compDef;
