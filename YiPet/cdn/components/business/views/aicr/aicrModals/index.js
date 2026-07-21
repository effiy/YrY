import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

const compDef = {
    name: 'yryAicrModals',
    html: '/YiPet/cdn/components/business/views/aicr/aicrModals/index.html',
    setup() {
        return Vue.inject('viewContext') || {};
    }
};

registerGlobalComponent(compDef);
export default compDef;
