import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

registerGlobalComponent({
    name: 'AicrCodeArea',
    html: '/YiPet/cdn/components/business/views/aicr/aicrCodeArea/index.html',
    setup() {
        return Vue.inject('viewContext') || {};
    }
});
