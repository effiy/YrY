import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

registerGlobalComponent({
    name: 'AicrModals',
    html: '/YiPet/cdn/components/business/views/aicr/aicrModals/index.html',
    setup() {
        return Vue.inject('viewContext') || {};
    }
});
