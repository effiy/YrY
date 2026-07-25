/**
 * 代码审查页面主入口
 * author: liangliang
 */
import { createStore } from './state/store.js';
import { useComputed } from './composables/useComputed.js';
import { createTagComputeds } from './composables/tagComputeds.js';
import { useMethods } from './composables/useMethods.js';
import { createMainPageMethods } from './composables/mainPageMethods.js';
const { createBaseView } = window;
const { logInfo, logWarn, logError } = window;
const { setupBrowserExtensionErrorFilter } = window;

import { createSidebarResizers } from '/src/utils/resizer.js';
import { setupAicrEventListeners } from '/src/utils/listenerManager.js';

// 创建代码审查页面应用
(async function initAicrApp() {
    try {
        // 在外部创建 store，以便在 onMounted 中访问
        const store = createStore();

        const tagComputeds = createTagComputeds(store);


        const app = await createBaseView({
            createStore: () => store,
            useComputed,
            useMethods,
            components: [
                'AicrPage',
                'AicrSidebar',
                'AicrCodeArea',
                'AicrModals',
                'YiModal',
                'YiLoading',
                'YiEmptyState',
                'YiErrorState',
                'YiIcon',
                'YiIconButton',
                'YiButton',
                'YiTag',
                'YiSelect',
                'YiInput',
                'YiTextarea',
                'HeaderActions',
                'FileTree',
                'CodeView',
                'MarkdownView',
                'KeyboardShortcutsHelp',
                'SkeletonLoader',
                'AiModelSelector',
            ],

            data: {
                // 暴露store数据给模板
                sidebarCollapsed: store.sidebarCollapsed,
                sidebarWidth: store.sidebarWidth,
                chatPanelCollapsed: store.chatPanelCollapsed,
                chatPanelWidth: store.chatPanelWidth,

                // 搜索相关状态
                searchQuery: store.searchQuery,
                // 批量选择相关状态
                batchMode: store.batchMode,
                selectedKeys: store.selectedKeys,
                // 视图模式
                viewMode: store.viewMode,
                // 会话列表相关状态
                sessions: store.sessions,
                sessionLoading: store.sessionLoading,
                sessionError: store.sessionError,
                selectedSessionTags: store.selectedSessionTags,
                sessionSearchQuery: store.sessionSearchQuery,
                // 会话右侧面板（聊天）状态
                activeSession: store.activeSession,
                activeSessionLoading: store.activeSessionLoading,
                activeSessionError: store.activeSessionError,
                sessionChatInput: store.sessionChatInput,
                sessionChatSending: store.sessionChatSending,
                sessionContextEnabled: store.sessionContextEnabled,
                sessionContextEditorVisible: store.sessionContextEditorVisible,
                sessionContextDraft: store.sessionContextDraft,
                sessionContextMode: store.sessionContextMode,
                sessionContextUndoVisible: store.sessionContextUndoVisible,
                sessionMessageEditorVisible: store.sessionMessageEditorVisible,
                sessionMessageEditorDraft: store.sessionMessageEditorDraft,
                sessionMessageEditorMode: store.sessionMessageEditorMode,
                sessionMessageEditorIndex: store.sessionMessageEditorIndex,
                // 文件树数据
                fileTree: store.fileTree,
                // 标签过滤相关状态
                tagFilterNoTags: store.tagFilterNoTags,
                selectedSkillTags: store.selectedSkillTags,
                selectedTemplateTags: store.selectedTemplateTags,
                selectedRuleTags: store.selectedRuleTags,
                selectedAgentTags: store.selectedAgentTags,
                // 会话批量选择相关状态
                sessionBatchMode: store.sessionBatchMode,
                selectedSessionKeys: store.selectedSessionKeys,
                externalSelectedSessionKey: store.externalSelectedSessionKey,
                sessionEditVisible: store.sessionEditVisible,
                sessionEditKey: store.sessionEditKey,
                sessionEditTitle: store.sessionEditTitle,
                sessionEditUrl: store.sessionEditUrl,
                sessionEditDescription: store.sessionEditDescription,
                sessionEditGenerating: store.sessionEditGenerating,
                // 模型选择相关状态
                availableModels: store.availableModels,
                modelsLoading: store.modelsLoading,
                modelsError: store.modelsError,
            },
            onMounted: (mountedApp) => {
                logInfo('[代码审查页面] 应用已挂载');

                // 加载侧边栏宽度
                if (store && store.loadSidebarWidths) {
                    store.loadSidebarWidths();
                }

                if (store && store.loadChatPanelSettings) {
                    store.loadChatPanelSettings();
                }

                // 监听 activeSession 变化，在其渲染后绑定 welcome-card 事件（替代旧 setInterval 轮询）
                if (store && store.activeSession && mountedApp && typeof mountedApp.bindWelcomeCardEvents === 'function') {
                    const { watch, nextTick } = window.Vue;
                    watch(
                        () => store.activeSession.value,
                        () => {
                            nextTick(() => {
                                const welcomeCard = document.querySelector('[data-welcome-message]');
                                if (welcomeCard && !welcomeCard.hasAttribute('data-events-bound')) {
                                    mountedApp.bindWelcomeCardEvents(welcomeCard);
                                    welcomeCard.setAttribute('data-events-bound', 'true');
                                }
                            });
                        },
                        { immediate: true }
                    );
                }

                // 创建侧边栏拖拽条
                setTimeout(() => {
                    createSidebarResizers(store);
                }, 500);

                if (store) {
                    // 首先加载会话列表，然后构建全局文件树
                    store.loadSessions().then(() => {
                        // 加载文件树和文件数据
                        // 初始加载时使用 forceClear: true，因为初始时没有数据
                        return Promise.all([
                            store.loadFileTree(true),
                            store.loadFiles()
                        ]).then(() => {
                            // 如果URL带了key，尝试预选并按需加载
                            const params2 = new URLSearchParams(window.location.search);

                            // 处理 tag 参数
                            const tagParam = params2.get('tag');
                            if (tagParam) {
                                logInfo('[代码审查] URL触发标签选中', tagParam);
                                if (store.selectedSessionTags) {
                                    store.selectedSessionTags.value = [tagParam];
                                }
                            }

                            const fileParam = params2.get('key');
                            // 读取高亮范围（兼容旧参数）
                            const startLineParam = parseInt(params2.get('startLine'), 10);
                            const endLineParamRaw = params2.get('endLine');
                            const endLineParam = endLineParamRaw !== null ? parseInt(endLineParamRaw, 10) : NaN;
                            let pendingHighlightRange = null;
                            if (Number.isFinite(startLineParam)) {
                                pendingHighlightRange = {
                                    startLine: startLineParam,
                                    endLine: Number.isFinite(endLineParam) ? endLineParam : startLineParam
                                };
                                window.__aicrPendingHighlightRangeInfo = pendingHighlightRange;
                            }
                            if (fileParam) {
                                // URL 带有 key 参数时默认收缩两侧侧边栏
                                store.sidebarCollapsed.value = true;
                                store.chatPanelCollapsed.value = true;

                                const norm = typeof store.normalizeKey === 'function'
                                    ? store.normalizeKey(fileParam)
                                    : String(fileParam || '');
                                store.setSelectedKey(norm);
                                if (typeof store.expandPathToFile === 'function') {
                                    store.expandPathToFile(norm);
                                }
                                if (typeof store.loadFileByKey === 'function') {
                                    store.loadFileByKey(norm).then(() => {
                                        try {
                                            const rangeInfo = window.__aicrPendingHighlightRangeInfo || pendingHighlightRange;
                                            if (rangeInfo) {
                                                setTimeout(() => {
                                                    try {
                                                        window.dispatchEvent(new CustomEvent('highlightCodeLines', {
                                                            detail: {
                                                                fileKey: norm,
                                                                rangeInfo
                                                            }
                                                        }));
                                                        logInfo('[代码審查] URL触发高亮事件', rangeInfo);
                                                    } catch (e) { logWarn('[代码審查] 触发高亮事件失败', e); }
                                                }, 300);
                                            }
                                        } catch (e) { logWarn('[代码審查] URL高亮处理失败', e); }
                                    }).catch(() => { });
                                }
                            }
                            // 初次加载后若存在挂起文件或当前选中文件无内容，尝试一次补载
                            setTimeout(() => {
                                try {
                                    const pending = window.__aicrPendingFileKey;
                                    const currentKey = pending || (store.selectedKey ? store.selectedKey.value : null);
                                    if (currentKey && typeof store.loadFileByKey === 'function') {
                                        const keyNorm = typeof store.normalizeKey === 'function'
                                            ? store.normalizeKey(currentKey)
                                            : String(currentKey || '');
                                        // 无论是否已有内容，就绪后都按需加载一次，避免刷新后首次点击缺内容
                                        store.loadFileByKey(keyNorm).finally(() => { window.__aicrPendingFileKey = null; });
                                    }
                                } catch (e) {
                                    logWarn('[主页面] 初次加载后的懒加载检查异常:', e?.message || e);
                                }
                            }, 300);
                        }).then(() => {
                            setTimeout(() => {
                                window.dispatchEvent(new CustomEvent('projectReady', {
                                    detail: {}
                                }));
                                // 版本就绪后，如存在待加载文件或当前选中文件无内容，执行补载
                                try {
                                    const pendingKey = window.__aicrPendingFileKey;
                                    const currentKey = pendingKey || (store.selectedKey ? store.selectedKey.value : null);
                                    if (currentKey && typeof store.loadFileByKey === 'function') {
                                        const keyNorm = typeof store.normalizeKey === 'function'
                                            ? store.normalizeKey(currentKey)
                                            : String(currentKey || '');

                                        // 无论是否已有内容，确保按需加载一次
                                        logInfo('[主页面] 就绪后按需加载文件:', keyNorm);
                                        store.loadFileByKey(keyNorm).finally(() => {
                                            try {
                                                const rangeInfo = window.__aicrPendingHighlightRangeInfo;
                                                if (rangeInfo) {
                                                    setTimeout(() => {
                                                        try {
                                                            window.dispatchEvent(new CustomEvent('highlightCodeLines', {
                                                                detail: {
                                                                    fileKey: keyNorm,
                                                                    rangeInfo
                                                                }
                                                            }));
                                                            logInfo('[代码審查] 版本就绪后触发高亮事件', rangeInfo);
                                                        } catch (e) { logWarn('[代码審查] 触发高亮事件失败', e); }
                                                    }, 300);
                                                }
                                            } catch (e) { logWarn('[代码審查] 版本就绪高亮处理失败', e); }

                                            window.__aicrPendingFileKey = null;
                                        });
                                    }
                                } catch (e) {
                                    logWarn('[主页面] 版本就绪懒加载检查异常:', e?.message || e);
                                }
                            }, 500);
                        }).then(() => {
                            logInfo('[代码审查页面] 数据加载完成');
                        }).catch(error => {
                            logError('[代码审查页面] 数据加载失败:', error);
                        });
                    });
                }
                // 使用新的监听器管理器设置事件
                setupAicrEventListeners(store);
            },
            // 传递props给子组件
            props: {
                'code-view': {},
                'file-tree': {
                    tree: function () { return store.fileTree; },
                    selectedKey: function () { return store.selectedKey.value; },
                    expandedFolders: function () { return store.expandedFolders; },
                    loading: function () { return store.loading; },
                    error: function () { return store.errorMessage; },
                    collapsed: function () { return store.sidebarCollapsed ? store.sidebarCollapsed.value : false; },
                    batchMode: function () { return store.batchMode ? store.batchMode.value : false; },
                    selectedKeys: function () { return store.selectedKeys ? store.selectedKeys.value : new Set(); },
                    viewMode: function () { return store.viewMode ? store.viewMode.value : 'tree'; },
                    searchQuery: function () { return store.searchQuery ? store.searchQuery.value : ''; },
                    sessionSearchQuery: function () { return store.sessionSearchQuery ? store.sessionSearchQuery.value : ''; },
                    selectedTags: function () { return store.selectedSessionTags ? store.selectedSessionTags.value : []; },
                    tagFilterNoTags: function () { return store.tagFilterNoTags ? store.tagFilterNoTags.value : false; },
                    sessions: function () { return store.sessions ? store.sessions.value : []; },
                    selectedSkillTags: function () { return store.selectedSkillTags ? store.selectedSkillTags.value : []; },
                    selectedTemplateTags: function () { return store.selectedTemplateTags ? store.selectedTemplateTags.value : []; },
                    selectedRuleTags: function () { return store.selectedRuleTags ? store.selectedRuleTags.value : []; },
                    selectedAgentTags: function () { return store.selectedAgentTags ? store.selectedAgentTags.value : []; },
                    claudeFilterAllowedSessionKeys: function () {
                        return tagComputeds.claudeFilterAllowedSessionKeys.value;
                    }
                }
            },
            methods: createMainPageMethods(store),
            // 标签相关计算属性统一由 tagComputeds 提供；
            // isAllSessionsSelected 已在 useComputed.js 中定义，此处不重复声明。
            computed: {
                ...tagComputeds
            }
        });
        window.aicrApp = app;
        window.aicrStore = store;

        // 全局错误处理 - 使用统一的 setupBrowserExtensionErrorFilter
        setupBrowserExtensionErrorFilter('aicr', true);

        if (window.aicrApp && window.aicrApp.reload) {
            const oldReload = window.aicrApp.reload;
            window.aicrApp.reload = function () {
                logInfo('[AICR主页面] reload 被调用');
                oldReload.apply(this, arguments);
            };
        }
    } catch (error) {
        window.logError?.('[代码审查页面] 应用初始化失败:', error);
    }
})();
