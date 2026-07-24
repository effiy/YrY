/**
 * AICR 标签筛选相关计算属性
 *
 * 从 views/aicr/index.js 抽出，让入口回归"组装"职责。
 * 其中 skillTags / templateTags / ruleTags / agentTags 四个 Claude 目录标签
 * 结构近乎一致，合并为 createClaudeDirTag(store, dirName) helper。
 *
 * @param {Object} store - 由 createStore() 创建的状态对象
 * @returns {Object} 计算属性集合
 */

import { getFirstLevelNames, extractStoryNames } from '/src/utils/filterHelpers.js';

const { computed } = Vue;

/**
 * 检查项目是否同时满足所有 skills/templates/rules/agents 标签筛选
 */
function projectPassesClaudeFilter(store, projectName) {
    const sessions = store.sessions?.value || [];
    const selectedSkills = store.selectedSkillTags?.value || [];
    const selectedTemplates = store.selectedTemplateTags?.value || [];
    const selectedRules = store.selectedRuleTags?.value || [];
    const selectedAgents = store.selectedAgentTags?.value || [];
    if (
        selectedSkills.length === 0 &&
        selectedTemplates.length === 0 &&
        selectedRules.length === 0 &&
        selectedAgents.length === 0
    ) return true;

    const checkClaudeDir = (dirName, selectedNames) => {
        if (selectedNames.length === 0) return true;
        return selectedNames.every(name => {
            const seg = '/' + dirName + '/' + name;
            return sessions.some(s => {
                const fp = s.file_path || s.filePath || '';
                const tags = Array.isArray(s.tags) ? s.tags : [];
                const proj = tags[0] || fp.split('/')[0] || '';
                return proj === projectName && (fp.includes(seg + '/') || fp.endsWith(seg));
            });
        });
    };

    if (!checkClaudeDir('skills', selectedSkills)) return false;
    if (!checkClaudeDir('templates', selectedTemplates)) return false;
    if (!checkClaudeDir('rules', selectedRules)) return false;
    if (!checkClaudeDir('agents', selectedAgents)) return false;

    return true;
}

/**
 * 单个 file_path 是否包含指定目录下所有选中名称
 */
function matchClaudeDir(fp, dirName, names) {
    if (names.length === 0) return true;
    return names.every(n => fp.includes('/' + dirName + '/' + n + '/') || fp.endsWith('/' + dirName + '/' + n));
}

/**
 * 为指定 Claude 目录（skills/templates/rules/agents）创建标签计算属性
 * 4 段近乎复制的代码合并为此 helper。
 */
function createClaudeDirTag(store, dirName) {
    return computed(() => {
        const sessions = store.sessions?.value;
        if (!sessions || !Array.isArray(sessions)) return [];

        const tree = store.fileTree?.value || [];
        const selectedTags = store.selectedSessionTags?.value || [];
        const firstLevelNames = getFirstLevelNames(tree);
        const storyNameSet = new Set(extractStoryNames(tree));
        const projectSel = selectedTags.filter(t => firstLevelNames.has(t));
        const storySel = selectedTags.filter(t => storyNameSet.has(t));
        const hasProject = projectSel.length > 0;
        const hasStory = storySel.length > 0;

        const projectSeen = new Map();
        for (const s of sessions) {
            const fp = s.file_path || s.filePath || '';
            const match = fp.match(new RegExp('/' + dirName + '/([^/]+)'));
            if (!match) continue;
            const tags = Array.isArray(s.tags) ? s.tags : [];
            const proj = tags[0] || fp.split('/')[0] || '';
            const name = match[1];
            if (!proj || !name) continue;

            if (hasProject && !projectSel.includes(proj)) continue;
            if (hasStory) {
                const projHasStory = sessions.some(ss => {
                    const sfp = ss.file_path || ss.filePath || '';
                    const stags = Array.isArray(ss.tags) ? ss.tags : [];
                    const sproj = stags[0] || sfp.split('/')[0] || '';
                    if (sproj !== proj) return false;
                    const parts = sfp.split('/');
                    const panelIdx = parts.indexOf('故事任务面板');
                    return panelIdx !== -1 && panelIdx + 1 < parts.length && storySel.includes(parts[panelIdx + 1]);
                });
                if (!projHasStory) continue;
            }

            const key = proj + '|||' + name;
            if (!projectSeen.has(key)) {
                projectSeen.set(key, { proj, name });
            }
        }

        const counts = {};
        for (const [, v] of projectSeen) {
            counts[v.name] = (counts[v.name] || 0) + 1;
        }

        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    });
}

/**
 * 工厂：创建所有标签相关计算属性
 * @param {Object} store
 * @returns {Object} 计算属性集合
 */
export const createTagComputeds = (store) => {
    return {
        // 项目标签：顶层文件夹名 + 文件数 [{ name, count }]
        projectTags: computed(() => {
            const tree = store.fileTree?.value;
            if (!tree || !Array.isArray(tree)) return [];

            const countInScope = (items) => {
                if (!Array.isArray(items)) return 0;
                let count = 0;
                for (const item of items) {
                    if (item.type === 'file') {
                        count++;
                    } else if (item.type === 'folder' && item.children) {
                        count += countInScope(item.children);
                    }
                }
                return count;
            };

            const result = [];
            for (const item of tree) {
                if (item.type !== 'folder' || !item.children) continue;
                if (!projectPassesClaudeFilter(store, item.name)) continue;
                result.push({ name: item.name, count: countInScope(item.children) });
            }

            // 按 localStorage 拖拽排序
            try {
                const saved = localStorage.getItem('aicr_file_tag_order');
                const savedOrder = saved ? JSON.parse(saved) : null;
                if (savedOrder && Array.isArray(savedOrder) && savedOrder.length > 0) {
                    const nameSet = new Set(result.map(r => r.name));
                    const ordered = savedOrder.filter(n => nameSet.has(n)).map(n => result.find(r => r.name === n));
                    const remaining = result.filter(r => !savedOrder.includes(r.name));
                    return [...ordered, ...remaining];
                }
            } catch (e) { /* ignore */ }

            return result.sort((a, b) => a.name.localeCompare(b.name));
        }),

        // 根级文件数（用于"没有故事"按钮徽标）
        rootFileCount: computed(() => {
            const tree = store.fileTree?.value;
            if (!tree || !Array.isArray(tree)) return 0;
            let count = 0;
            for (const item of tree) {
                if (item.type === 'file') count++;
            }
            return count;
        }),

        // 故事标签：从树中提取的故事名 + 文件数 [{ name, count }]
        storyTags: computed(() => {
            const tree = store.fileTree?.value;
            if (!tree || !Array.isArray(tree)) return [];

            const firstLevelNames = getFirstLevelNames(tree);

            const countInScope = (items) => {
                if (!Array.isArray(items)) return 0;
                let count = 0;
                for (const item of items) {
                    if (item.type === 'file') {
                        count++;
                    } else if (item.type === 'folder' && item.children) {
                        count += countInScope(item.children);
                    }
                }
                return count;
            };

            const resultMap = new Map();
            const walk = (items, parentName = '') => {
                if (!Array.isArray(items)) return;
                for (const item of items) {
                    if (item.type === 'folder') {
                        if (parentName === '故事任务面板') {
                            const count = countInScope(item.children || []);
                            const existing = resultMap.get(item.name);
                            resultMap.set(item.name, existing !== undefined ? existing + count : count);
                        }
                        if (item.children) walk(item.children, item.name);
                    }
                }
            };
            // 项目级联动：确定遍历起始范围
            const selectedTags = store.selectedSessionTags?.value || [];
            const projectSel = selectedTags.filter(t => firstLevelNames.has(t));
            const hasProject = projectSel.length > 0;

            if (hasProject) {
                for (const item of tree) {
                    if (item.type === 'folder' && projectSel.includes(item.name)) {
                        if (!projectPassesClaudeFilter(store, item.name)) continue;
                        walk(item.children || []);
                    }
                }
            } else {
                for (const item of tree) {
                    if (item.type !== 'folder') continue;
                    if (!projectPassesClaudeFilter(store, item.name)) continue;
                    walk(item.children || []);
                }
            }

            const result = [];
            for (const [name, count] of resultMap) {
                if (count > 0) result.push({ name, count });
            }
            return result.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
        }),

        // 4 个 Claude 目录标签 — 共用 helper
        skillTags: createClaudeDirTag(store, 'skills'),
        templateTags: createClaudeDirTag(store, 'templates'),
        ruleTags: createClaudeDirTag(store, 'rules'),
        agentTags: createClaudeDirTag(store, 'agents'),

        // 允许的 session key 集合（供文件树 skills/templates 过滤）
        claudeFilterAllowedSessionKeys: computed(() => {
            const sks = store.selectedSkillTags?.value || [];
            const tms = store.selectedTemplateTags?.value || [];
            const rls = store.selectedRuleTags?.value || [];
            const ags = store.selectedAgentTags?.value || [];
            if (sks.length === 0 && tms.length === 0 && rls.length === 0 && ags.length === 0) return null;
            const sessions = store.sessions?.value || [];

            const result = new Set();
            for (const s of sessions) {
                const fp = s.file_path || s.filePath || '';
                if (!matchClaudeDir(fp, 'skills', sks)) continue;
                if (!matchClaudeDir(fp, 'templates', tms)) continue;
                if (!matchClaudeDir(fp, 'rules', rls)) continue;
                if (!matchClaudeDir(fp, 'agents', ags)) continue;
                if (s.key != null) result.add(String(s.key));
            }
            return result.size > 0 ? result : null;
        }),

        // 筛选后文件总数（项目/故事/类型三级级联 + 会话搜索 + skills/templates）
        filteredFileCount: computed(() => {
            const tree = store.fileTree?.value;
            if (!tree || !Array.isArray(tree)) return 0;

            const selectedTags = store.selectedSessionTags?.value || [];
            const noTags = store.tagFilterNoTags?.value || false;
            const sessionQuery = (store.sessionSearchQuery?.value || '').trim().toLowerCase();
            const firstLevelNames = getFirstLevelNames(tree);
            const storyNameSet = new Set(extractStoryNames(tree));
            const projectSel = selectedTags.filter(t => firstLevelNames.has(t));
            const storySel = selectedTags.filter(t => storyNameSet.has(t));
            const hasProject = projectSel.length > 0;
            const hasStory = storySel.length > 0;
            let workingTree = tree;
            if (sessionQuery) {
                workingTree = workingTree.filter(item => {
                    if (item.type === 'folder') {
                        if ((item.name || '').toLowerCase().includes(sessionQuery)) return true;
                        if (Array.isArray(item.children)) {
                            return item.children.some(c => (c.name || '').toLowerCase().includes(sessionQuery));
                        }
                        return false;
                    }
                    return (item.name || '').toLowerCase().includes(sessionQuery);
                });
            }

            // "没有故事"：仅统计根级文件
            if (noTags && !hasProject && !hasStory) {
                let count = 0;
                for (const item of workingTree) {
                    if (item.type === 'file') count++;
                }
                return count;
            }

            let total = 0;
            const walk = (items, depth, projectOk, storyOk, parentName = '') => {
                if (!Array.isArray(items)) return;
                for (const item of items) {
                    if (item.type === 'file') {
                        if (hasStory && !storyOk) continue;
                        total++;
                    } else if (item.type === 'folder' && item.children) {
                        // 项目级范围
                        let nextProjectOk = depth === 0
                            ? (!hasProject || projectSel.includes(item.name))
                            : projectOk;

                        if (!nextProjectOk) continue;

                        // skills/templates 筛选
                        if (depth === 0 && !projectPassesClaudeFilter(store, item.name)) continue;

                        // 故事级范围：只有直接父目录为「故事任务面板」的才是故事
                        const isStory = (parentName === '故事任务面板');

                        // 跳过未选中的故事文件夹
                        if (isStory && hasStory && !storySel.includes(item.name)) {
                            continue;
                        }

                        const nextStoryOk = isStory
                            ? (!hasStory || storySel.includes(item.name))
                            : storyOk;

                        walk(item.children, depth + 1, nextProjectOk, nextStoryOk, item.name);
                    }
                }
            };

            walk(workingTree, 0, !hasProject, !hasStory);
            return total;
        }),
    };
};
