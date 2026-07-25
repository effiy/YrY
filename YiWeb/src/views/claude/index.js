/**
 * Claude 管理面板 - 主入口
 */
import { createStore } from '/src/views/claude/composables/store.js';
import { useComputed } from '/src/views/claude/composables/useComputed.js';
import { useMethods } from '/src/views/claude/composables/useMethods.js';

(async function initClaudePanelApp() {
    try {
        const store = createStore();

        const app = await createBaseView({
            createStore: () => store,
            useComputed,
            useMethods,
            components: [
                'ClaudePanelPage',
                'ClaudeProjectCard',
                'ClaudeDetailCard',
                'YiIcon',
                'YiButton',
                'YiTag',
                'YiLoading',
                'YiEmptyState',
                'YiErrorState',
                'HeaderActions',
            ],
            componentModules: [
                '/cdn/components/business/views/claude/claudePanelPage/index.js',
                '/cdn/components/business/views/claude/claudeProjectCard/index.js',
                '/cdn/components/business/views/claude/claudeDetailCard/index.js',
                '/cdn/icons/YiIcon/index.js',
                '/cdn/components/common/buttons/YiButton/index.js',
                '/cdn/components/common/tags/YiTag/index.js',
                '/cdn/components/common/loaders/YiLoading/index.js',
                '/cdn/components/common/feedback/YiEmptyState/index.js',
                '/cdn/components/common/feedback/YiErrorState/index.js',
                '/cdn/components/business/HeaderActions/index.js',
            ],
            data: {
                loading: store.loading,
                error: store.error,
                selectedProject: store.selectedProject,
            },
            onMounted: () => {
                logInfo('[Claude面板] 应用已挂载');
                store.fetchProjects();
            },
            methods: {
                viewProject: (name) => store.selectProject(name),
                goBack: () => store.clearSelection(),
            }
        });

        window.claudeApp = app;
        window.claudeStore = store;

        setupBrowserExtensionErrorFilter('claude', true);
    } catch (error) {
        logError('[Claude面板] 应用初始化失败:', error);
    }
})();
