import { getData } from '/src/services/index.js';
import { buildServiceUrl } from '/src/services/requestHelper.js';
import {
    normalizeFilePath,
    normalizeFileObject,
    normalizeTreeNode
} from '/src/utils/fileFieldNormalizer.js';

import { buildFileTreeFromSessions } from './fileTreeBuilders.js';
import { getFileDeleteService } from '/src/services/fileDeleteService.js';
import { createAicrStoreState } from './storeState.js';
import { createAicrStoreSessionsOps } from './sessionsOps.js';
import { createAicrStoreFileTreeOps } from './fileTreeOps.js';
import { createAicrStoreFileContentOps } from './fileContentOps.js';
import { createAicrStoreUiOps } from './uiOps.js';

const vueRef = (typeof Vue !== 'undefined' && Vue.ref) || (() => {
    throw new Error('Vue.ref 不可用，请检查 Vue CDN 是否加载成功');
});

export const createStore = () => {
    const { state, internals } = createAicrStoreState(vueRef);

    const sessionsOps = createAicrStoreSessionsOps(
        { safeExecuteAsync, buildServiceUrl, getData },
        state
    );

    const fileContentOps = createAicrStoreFileContentOps(
        { safeExecuteAsync, normalizeFilePath },
        state,
        internals
    );

    const fileTreeOps = createAicrStoreFileTreeOps(
        {
            safeExecute,
            safeExecuteAsync,
            createError,
            ErrorTypes,
            normalizeFilePath,
            normalizeFileObject,
            normalizeTreeNode,
            buildFileTreeFromSessions,
            getFileDeleteService,
            saveFileContent: fileContentOps.saveFileContent
        },
        state,
        internals,
        { loadSessions: sessionsOps.loadSessions }
    );

    const boundLoadFiles = () => fileContentOps.loadFiles(fileTreeOps.loadFileTree);
    const boundLoadFileByKey = (targetKey = null) => fileContentOps.loadFileByKey(fileTreeOps.loadFileTree, targetKey);

    const uiOps = createAicrStoreUiOps(state, {
        loadFileTree: fileTreeOps.loadFileTree,
        loadFiles: boundLoadFiles
    });

    return {
        ...state,
        ...fileTreeOps,
        ...fileContentOps,
        loadFiles: boundLoadFiles,
        loadFileByKey: boundLoadFileByKey,
        ...uiOps,
        ...sessionsOps
    };
};
