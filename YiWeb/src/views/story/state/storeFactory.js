/**
 * 故事任务面板 - Store 工厂
 *
 * 组合 state + methods。
 */

import { createStoryStoreState } from './storeState.js';
import { createStoryDataMethods } from '../composables/storyDataMethods.js';
import { createFilterMethods } from '../composables/filterMethods.js';
import { createUiMethods } from '../composables/uiMethods.js';
import { createStoryDepsMethods } from '../composables/storyDepsMethods.js';
import { createStoryEditMethods } from '../composables/storyEditMethods.js';

const vueRef = (typeof Vue !== 'undefined' && Vue.ref) || (() => {
    throw new Error('Vue.ref 不可用，请检查 Vue CDN 是否加载成功');
});

export function createStore() {
    const { state, internals } = createStoryStoreState(vueRef);

    const dataMethods = createStoryDataMethods(state);
    const filterMethods = createFilterMethods(state);
    const uiMethods = createUiMethods(state);
    const depsMethods = createStoryDepsMethods(state);
    const editMethods = createStoryEditMethods(state);

    return {
        ...state,
        ...dataMethods,
        ...filterMethods,
        ...uiMethods,
        ...depsMethods,
        ...editMethods,
    };
}
