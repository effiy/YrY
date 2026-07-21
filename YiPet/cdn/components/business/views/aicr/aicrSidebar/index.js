import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';

registerGlobalComponent({
    name: 'AicrSidebar',
    html: '/YiPet/cdn/components/business/views/aicr/aicrSidebar/index.html',
    setup() {
        return Vue.inject('viewContext') || {};
    }
});
