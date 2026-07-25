/**
 * YiPet 通用工具函数 — 统一入口
 *
 * 此文件仅作为 barrel，所有实现分散在子模块中：
 *   core/string.js   — 字符串 / HTML 转义 / ID 生成
 *   core/array.js    — 数组 / 树形操作
 *   core/object.js   — 对象 / 深拷贝 / 路径访问
 *   core/common.js   — 防抖节流 / 数字 / 日期 / 异步 / 函数式 / 类型 / 颜色 / 随机
 *   core/storage.js  — localStorage / sessionStorage / cookie / IndexedDB
 *   core/eventBus.js — 事件总线
 *   core/animation.js — 缓动 & 动画
 *   core/validation.js — 表单验证
 *   core/performance.js — 性能工具
 *   core/api.js      — HTTP 客户端
 *   core/i18n.js     — 国际化
 *   core/form.js     — 表单管理
 *   browser/dom.js   — DOM / 浏览器工具
 *   browser/events.js — 事件管理
 *   time/            — 日期选择器 & 参数
 *   view/            — Vue 组件加载 & 基类
 *   data/domain.js   — 域名解析
 *   io/exportUtils.js — 数据导出
 *   ui/              — UI 组件 (loading / message / template)
 */

// ═══════════════════════════════════════════════════════════
// 核心工具（扁平 re-export）
// ═══════════════════════════════════════════════════════════

// 字符串
export {
    capitalize, uncapitalize, titleize,
    camelToKebab, kebabToCamel, snakeToCamel, camelToSnake,
    truncate, truncateByBytes,
    stripHtml, escapeHtml, unescapeHtml, escapeHtmlAttr, escapeJs,
    sanitizeUrl,
    template, highlight,
    randomString, uuid, generateId,
    byteLength, strWidth,
    trimStart, trimEnd,
    parseQuery, buildQuery
} from '/cdn/utils/core/string.js';

// 数组 & 树
export {
    unique, groupBy, sortBy, chunk, flatten,
    difference, intersection, union, shuffle, sample,
    sum, average, max, min, paginate,
    arrayToTree, treeToArray, flattenTree,
    findTreeNode, filterTree, traverseTree,
    findAll, move, insert, remove
} from '/cdn/utils/core/array.js';

// 对象
export {
    deepMerge, merge, isObject, isEmpty,
    get, set, unset, has, invert,
    pick, omit, mapValues, mapKeys, filterObject,
    flattenObject, unflattenObject,
    deepFreeze, deepEqual, diff, deepClone,
    toPairs, fromPairs
} from '/cdn/utils/core/object.js';

// 通用（防抖节流 / 数字 / 日期 / 异步 / 函数式 / 类型 / 颜色 / 随机）
export {
    debounce, throttle,
    clamp, formatNumber, formatFileSize, ordinal, isInteger, toNumber, percent,
    formatDate, timeAgo, isToday, isSameDay, startOfDay, endOfDay, formatTime,
    sleep, withTimeout, retry,
    pipe, compose, curry, memoize,
    isType, isString, isNumber, isBoolean, isArray, isFunction,
    isEmail, isPhone, isUrl, isHexColor,
    hexToRgb, rgbToHex, getContrastColor, colorAlpha, lighten, darken,
    random, randomInt, sample, randomColor,
    safeGetItem, safeSetItem,
    createCSSVars, isSearchMatch, extractExcerpt,
    updateUrlParams, getUrlParam, detectDevice
} from '/cdn/utils/core/common.js';

// 存储
export {
    storage, sessionStorage, cookie, IndexedDBStorage,
    getCookie, setCookie, deleteCookie
} from '/cdn/utils/core/storage.js';

// 事件总线
export { eventBus, EventBus } from '/cdn/utils/core/eventBus.js';

// 动画
export {
    easings, animate, animateNumber, animateScroll,
    fadeIn, fadeOut, slideIn, slideOut,
    scale, rotate, shake, bounce, pulse, ripple
} from '/cdn/utils/core/animation.js';

// 验证
export {
    isValidEmail, isValidPhone, isValidUrl, isValidIdCard,
    validatePassword, isRequired, minLength, maxLength, inRange, matchPattern,
    validateForm
} from '/cdn/utils/core/validation.js';

// 性能
export {
    rafThrottle, idle, batch,
    monitorPageLoadPerformance, monitorErrors, initPerformanceMonitoring
} from '/cdn/utils/core/performance.js';

// HTTP（ApiClient 为规范实现）
export {
    ApiError, ApiClient, createApiClient, getDefaultClient,
    request, get, post, put, patch, del, all
} from '/cdn/utils/core/api.js';

// 国际化
export {
    I18n, createI18n, setGlobalI18n, getGlobalI18n,
    defaultMessages, defaultDateTimeFormats, defaultNumberFormats,
    t, tc, d, n
} from '/cdn/utils/core/i18n.js';

// 表单
export {
    validators, FormValidator, FormManager,
    createForm, useFormField, serializeForm, deserializeForm
} from '/cdn/utils/core/form.js';

// DOM / 浏览器
export {
    $, $$, addClass, removeClass, toggleClass, hasClass,
    setStyle, getStyle, show, hide, toggle,
    attr, data, on, off, trigger, offset, size,
    createElement, setAttributes, getFormData, setFormData,
    copyToClipboard, downloadFile, safeJsonParse,
    scrollToTop, scrollToElement, getSelectedText,
    toggleFullscreen, isInViewport, printElement,
    autoResizeTextarea, safeRemoveElement, createAnimationElement,
    addEventDelegate, smoothScrollTo, getElementPosition,
    isElementInViewport, createIntersectionObserver,
    getScrollDistanceToBottom, shouldAutoScrollToBottom,
    scrollElementToBottom, scrollIntoViewOrFallback,
    applyChatScrollRequest, safeObserve, safeObserveAll,
    getElementStyles
} from '/cdn/utils/browser/dom.js';

// 浏览器事件
export { EventManager, KeyboardHandler, SearchHandler } from '/cdn/utils/browser/events.js';

// ═══════════════════════════════════════════════════════════
// 子 barrel 透传
// ═══════════════════════════════════════════════════════════
export * from '/cdn/utils/time/index.js';
export * from '/cdn/utils/view/index.js';
export * from '/cdn/utils/render/index.js';

// ═══════════════════════════════════════════════════════════
// 按文件透传（无 barrel 的独立模块）
// ═══════════════════════════════════════════════════════════
export * from '/cdn/utils/data/domain.js';
export * from '/cdn/utils/io/exportUtils.js';

// ═══════════════════════════════════════════════════════════
// UI 模块
// ═══════════════════════════════════════════════════════════
export * from '/cdn/utils/ui/loading.js';
export * from '/cdn/utils/ui/message.js';
export * from '/cdn/utils/ui/template.js';

// ═══════════════════════════════════════════════════════════
// 默认导出（所有具名导出的合集）
// ═══════════════════════════════════════════════════════════
import * as _stringExports    from '/cdn/utils/core/string.js';
import * as _arrayExports     from '/cdn/utils/core/array.js';
import * as _objectExports    from '/cdn/utils/core/object.js';
import * as _commonExports    from '/cdn/utils/core/common.js';
import * as _storageExports   from '/cdn/utils/core/storage.js';
import * as _eventBusExports  from '/cdn/utils/core/eventBus.js';
import * as _animationExports from '/cdn/utils/core/animation.js';
import * as _validationExports from '/cdn/utils/core/validation.js';
import * as _performanceExports from '/cdn/utils/core/performance.js';
import * as _apiExports       from '/cdn/utils/core/api.js';
import * as _i18nExports      from '/cdn/utils/core/i18n.js';
import * as _formExports      from '/cdn/utils/core/form.js';
import * as _browserDom       from '/cdn/utils/browser/dom.js';
import * as _browserEvents    from '/cdn/utils/browser/events.js';
import * as _timeDate         from '/cdn/utils/time/date.js';
import * as _timeParams       from '/cdn/utils/time/timeParams.js';
import * as _timeSelectors    from '/cdn/utils/time/timeSelectors.js';
import * as _baseView         from '/cdn/utils/view/baseView.js';
import * as _domainUtils      from '/cdn/utils/data/domain.js';
import * as _exportUtils      from '/cdn/utils/io/exportUtils.js';
import * as _uiLoading        from '/cdn/utils/ui/loading.js';
import * as _uiMessage        from '/cdn/utils/ui/message.js';
import * as _uiTemplate       from '/cdn/utils/ui/template.js';

const _defaultExport = {
    ..._stringExports,
    ..._arrayExports,
    ..._objectExports,
    ..._commonExports,
    ..._storageExports,
    ..._eventBusExports,
    ..._animationExports,
    ..._validationExports,
    ..._performanceExports,
    ..._apiExports,
    ..._i18nExports,
    ..._formExports,
    ..._browserDom,
    ..._browserEvents,
    ..._timeDate,
    ..._timeParams,
    ..._timeSelectors,
    ..._baseView,
    ..._domainUtils,
    ..._exportUtils,
    ..._uiLoading,
    ..._uiMessage,
    ..._uiTemplate,
};

export default _defaultExport;

// ═══════════════════════════════════════════════════════════
// window.YiPet.Utils 注册
// ═══════════════════════════════════════════════════════════
(function _registerOnWindow() {
    if (window.YiPet && typeof window.YiPet.register === 'function') {
        window.YiPet.register('Utils', _defaultExport);
    } else {
        window.YiPet = window.YiPet || {};
        window.YiPet.Utils = _defaultExport;
    }

    // 将工具函数暴露到 window（跳过已存在的 key）
    Object.keys(_defaultExport).forEach(function (key) {
        if (!(key in window)) {
            window[key] = _defaultExport[key];
        }
    });
})();
