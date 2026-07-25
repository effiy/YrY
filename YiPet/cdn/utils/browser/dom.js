/**
 * DOM操作工具函数集合
 * 
 * 提供统一的DOM操作方法，减少代码重复
 */

/**
 * 自动调整文本框高度
 * @param {HTMLTextAreaElement} textarea - 文本框元素
 * @param {Object|number} options - 选项对象或最大高度
 */
export function autoResizeTextarea(textarea, options = {}) {
    // 支持传入数字（向后兼容）
    if (typeof options === 'number') {
        options = { maxHeight: options };
    }
    
    const { maxHeight = 200 } = options;
    
    const resize = () => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
    };
    
    textarea.addEventListener('input', resize, { passive: true });
    textarea.addEventListener('focus', resize, { passive: true });
    
    // 初始化
    resize();
}

/**
 * 安全移除元素
 * @param {HTMLElement} element - 要移除的元素
 */
export function safeRemoveElement(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

/**
 * 创建动画元素
 * @param {string} styles - CSS样式字符串
 * @param {HTMLElement} parent - 父元素
 * @returns {HTMLElement} 创建的元素
 */
export function createAnimationElement(styles, parent) {
    const element = document.createElement('div');
    element.style.cssText = styles;
    parent.appendChild(element);
    return element;
}

/**
 * 添加事件监听器（支持事件委托）
 * @param {HTMLElement} parent - 父元素
 * @param {string} event - 事件名称
 * @param {string} selector - 选择器
 * @param {Function} handler - 事件处理函数
 */
export function addEventDelegate(parent, event, selector, handler) {
    // 为触摸和滚动事件添加passive选项
    const options = ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'scroll', 'wheel', 'mousewheel'].includes(event) 
        ? { passive: true } 
        : {};
    
    parent.addEventListener(event, (e) => {
        const target = e.target.closest(selector);
        if (target) {
            handler.call(target, e);
        }
    }, options);
}

/**
 * 平滑滚动到元素
 * @param {HTMLElement|string} element - 元素或选择器
 * @param {Object} options - 滚动选项
 */
export function smoothScrollTo(element, options = {}) {
    const target = typeof element === 'string' ? document.querySelector(element) : element;
    if (!target) return;
    
    const defaultOptions = {
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
    };
    
    target.scrollIntoView({...defaultOptions, ...options});
}

/**
 * 获取元素相对于文档的位置
 * @param {HTMLElement} element - 元素
 * @returns {Object} 位置对象 {top, left, right, bottom}
 */
export function getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    return {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        right: rect.right + scrollLeft,
        bottom: rect.bottom + scrollTop,
        width: rect.width,
        height: rect.height
    };
}

/**
 * 检查元素是否在视窗中
 * @param {HTMLElement} element - 元素
 * @param {number} threshold - 阈值（0-1）
 * @returns {boolean} 是否在视窗中
 */
export function isElementInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    const verticalThreshold = windowHeight * threshold;
    const horizontalThreshold = windowWidth * threshold;
    
    return (
        rect.top >= -verticalThreshold &&
        rect.left >= -horizontalThreshold &&
        rect.bottom <= windowHeight + verticalThreshold &&
        rect.right <= windowWidth + horizontalThreshold
    );
}

/**
 * 创建交集观察器
 * @param {Function} callback - 回调函数
 * @param {Object} options - 观察器选项
 * @returns {IntersectionObserver} 观察器实例
 */
export function createIntersectionObserver(callback, options = {}) {
    const defaultOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };
    
    return new IntersectionObserver(callback, {...defaultOptions, ...options});
}

export function getScrollDistanceToBottom(container) {
    try {
        if (!container) return 0;
        const scrollHeight = Number(container.scrollHeight) || 0;
        const scrollTop = Number(container.scrollTop) || 0;
        const clientHeight = Number(container.clientHeight) || 0;
        return scrollHeight - scrollTop - clientHeight;
    } catch (_) {
        return 0;
    }
}

export function shouldAutoScrollToBottom(container, threshold = 140) {
    try {
        const t = Number(threshold);
        const limit = Number.isFinite(t) ? t : 140;
        return getScrollDistanceToBottom(container) < limit;
    } catch (_) {
        return true;
    }
}

export function scrollElementToBottom(container) {
    try {
        if (!container) return false;
        container.scrollTop = container.scrollHeight;
        return true;
    } catch (_) {
        return false;
    }
}

export function scrollIntoViewOrFallback(selector, fallbackContainer, options = {}) {
    try {
        const el = selector ? document.querySelector(selector) : null;
        if (el && typeof el.scrollIntoView === 'function') {
            const { block = 'nearest', behavior, inline } = options || {};
            const params = {};
            if (block) params.block = block;
            if (behavior) params.behavior = behavior;
            if (inline) params.inline = inline;
            el.scrollIntoView(params);
            return true;
        }
    } catch (_) { }
    return scrollElementToBottom(fallbackContainer);
}

export function applyChatScrollRequest(container, request) {
    try {
        if (!request || typeof request !== 'object') return false;
        const type = String(request.type || '');

        if (type === 'index') {
            return scrollIntoViewOrFallback(`[data-chat-idx="${Number(request.index)}"]`, container, { block: 'nearest' });
        }
        if (type === 'autoIndex') {
            if (!shouldAutoScrollToBottom(container, 140)) return false;
            return scrollIntoViewOrFallback(`[data-chat-idx="${Number(request.index)}"]`, container, { block: 'nearest' });
        }
        if (type === 'bottom') {
            return scrollElementToBottom(container);
        }
        if (type === 'autoBottom') {
            if (!shouldAutoScrollToBottom(container, 140)) return false;
            return scrollElementToBottom(container);
        }
        return false;
    } catch (_) {
        return false;
    }
}

/**
 * 安全地观察 DOM 节点
 * @param {Observer} observer - Observer 实例 (MutationObserver 或 IntersectionObserver)
 * @param {Node|Element} target - 要观察的目标节点
 * @param {Object} options - 观察选项
 * @returns {boolean} 是否成功开始观察
 */
export function safeObserve(observer, target, options = {}) {
    try {
        // 验证 observer
        if (!observer || typeof observer.observe !== 'function') {
            console.error('[safeObserve] Invalid observer:', observer);
            return false;
        }
        
        // 验证 target
        if (!target) {
            console.error('[safeObserve] Target is null or undefined');
            return false;
        }
        
        if (!(target instanceof Node)) {
            console.error('[safeObserve] Target is not a valid Node:', target);
            return false;
        }
        
        // 安全地调用 observe
        observer.observe(target, options);
        return true;
    } catch (error) {
        console.error('[safeObserve] Failed to observe:', error);
        return false;
    }
}

/**
 * 批量安全地观察多个 DOM 节点
 * @param {Observer} observer - Observer 实例
 * @param {NodeList|Array} targets - 要观察的目标节点列表
 * @param {Object} options - 观察选项
 * @returns {number} 成功观察的节点数量
 */
export function safeObserveAll(observer, targets, options = {}) {
    if (!targets || !targets.length) {
        return 0;
    }
    
    let successCount = 0;
    targets.forEach(target => {
        if (safeObserve(observer, target, options)) {
            successCount++;
        }
    });
    
    return successCount;
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>} 是否复制成功
 */
export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-999999px';
            textarea.style.top = '-999999px';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            
            const result = document.execCommand('copy');
            document.body.removeChild(textarea);
            return result;
        }
    } catch (error) {
        console.error('复制失败:', error);
        return false;
    }
}

/**
 * 获取元素的所有样式
 * @param {HTMLElement} element - 元素
 * @returns {CSSStyleDeclaration} 样式对象
 */
export function getElementStyles(element) {
    return window.getComputedStyle(element);
}

/**
 * 检查元素是否有指定类名
 * @param {HTMLElement} element - 元素
 * @param {string} className - 类名
 * @returns {boolean} 是否有该类名
 */
export function hasClass(element, className) {
    return element.classList.contains(className);
}

/**
 * 切换元素类名
 * @param {HTMLElement} element - 元素
 * @param {string} className - 类名
 * @param {boolean} force - 强制添加/移除
 */
export function toggleClass(element, className, force) {
    if (force !== undefined) {
        element.classList.toggle(className, force);
    } else {
        element.classList.toggle(className);
    }
}

/**
 * 批量设置元素属性
 * @param {HTMLElement} element - 元素
 * @param {Object} attributes - 属性对象
 */
export function setAttributes(element, attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
}

/**
 * 创建元素
 * @param {string} tagName - 标签名
 * @param {Object} options - 选项
 * @returns {HTMLElement} 创建的元素
 */
export function createElement(tagName, options = {}) {
    const element = document.createElement(tagName);
    
    const { className, id, textContent, innerHTML, attributes, styles } = options;
    
    if (className) element.className = className;
    if (id) element.id = id;
    if (textContent) element.textContent = textContent;
    if (innerHTML) element.innerHTML = innerHTML;
    if (attributes) setAttributes(element, attributes);
    if (styles) {
        Object.entries(styles).forEach(([key, value]) => {
            element.style[key] = value;
        });
    }
    
    return element;
}

/**
 * 获取表单数据
 * @param {HTMLFormElement} form - 表单元素
 * @returns {Object} 表单数据对象
 */
export function getFormData(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
        if (data[key]) {
            // 处理多选情况
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    }
    
    return data;
}

/**
 * 设置表单数据
 * @param {HTMLFormElement} form - 表单元素
 * @param {Object} data - 数据对象
 */
export function setFormData(form, data) {
    Object.entries(data).forEach(([key, value]) => {
        const element = form.querySelector(`[name="${key}"]`);
        if (element) {
            if (element.type === 'checkbox' || element.type === 'radio') {
                element.checked = Boolean(value);
            } else {
                element.value = value;
            }
        }
    });
}

// ═══════════════════════════════════════════════════════════
// 补充 DOM 快捷操作（来自 index.js）
// ═══════════════════════════════════════════════════════════

export function $(selector, ctx = document) { return ctx.querySelector(selector); }
export function $$(selector, ctx = document) { return Array.from(ctx.querySelectorAll(selector)); }

export function addClass(el, ...classes) {
    const e = typeof el === 'string' ? $(el) : el;
    if (e) e.classList.add(...classes);
    return e;
}

export function removeClass(el, ...classes) {
    const e = typeof el === 'string' ? $(el) : el;
    if (e) e.classList.remove(...classes);
    return e;
}

export function setStyle(el, styles) {
    const e = typeof el === 'string' ? $(el) : el;
    if (e && typeof styles === 'object') Object.assign(e.style, styles);
    return e;
}

export function getStyle(el, prop) {
    const e = typeof el === 'string' ? $(el) : el;
    return e ? window.getComputedStyle(e)[prop] : null;
}

export function show(el, display = 'block') {
    const e = typeof el === 'string' ? $(el) : el;
    if (e) e.style.display = display;
    return e;
}

export function hide(el) {
    const e = typeof el === 'string' ? $(el) : el;
    if (e) e.style.display = 'none';
    return e;
}

export function toggle(el, display = 'block') {
    const e = typeof el === 'string' ? $(el) : el;
    if (!e) return null;
    e.style.display = e.style.display === 'none' ? display : 'none';
    return e;
}

export function attr(el, name, value) {
    const e = typeof el === 'string' ? $(el) : el;
    if (!e) return null;
    if (value === undefined) return e.getAttribute(name);
    if (value === null) e.removeAttribute(name);
    else e.setAttribute(name, value);
    return e;
}

export function data(el, key, value) {
    const e = typeof el === 'string' ? $(el) : el;
    if (!e) return null;
    if (value === undefined) return e.dataset[key];
    e.dataset[key] = value;
    return e;
}

export function on(el, event, handler, opts) {
    const e = typeof el === 'string' ? $(el) : el;
    if (e) e.addEventListener(event, handler, opts);
    return e;
}

export function off(el, event, handler, opts) {
    const e = typeof el === 'string' ? $(el) : el;
    if (e) e.removeEventListener(event, handler, opts);
    return e;
}

export function trigger(el, eventName, detail) {
    const e = typeof el === 'string' ? $(el) : el;
    if (!e) return null;
    e.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true, cancelable: true }));
    return e;
}

export function offset(el) {
    const e = typeof el === 'string' ? $(el) : el;
    if (!e) return { top: 0, left: 0 };
    const r = e.getBoundingClientRect();
    return { top: r.top + window.pageYOffset, left: r.left + window.pageXOffset, width: r.width, height: r.height };
}

export function size(el) {
    const e = typeof el === 'string' ? $(el) : el;
    return e ? { width: e.offsetWidth, height: e.offsetHeight } : { width: 0, height: 0 };
}

// ═══════════════════════════════════════════════════════════
// 浏览器工具（来自 index.js）
// ═══════════════════════════════════════════════════════════

export function downloadFile(data, filename, type = 'application/octet-stream') {
    const blob = data instanceof Blob ? data : new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function safeJsonParse(str, defaultValue = null) {
    try { return JSON.parse(str); } catch { return defaultValue; }
}

export function scrollToTop(smooth = true) {
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
}

export function scrollToElement(el, opts = {}) {
    const e = typeof el === 'string' ? document.querySelector(el) : el;
    if (e) e.scrollIntoView({ behavior: 'smooth', block: 'start', ...opts });
}

export function getSelectedText() {
    return window.getSelection()?.toString() || '';
}

export async function toggleFullscreen(el = document.documentElement) {
    try {
        if (!document.fullscreenElement) { await el.requestFullscreen(); return true; }
        else { await document.exitFullscreen(); return false; }
    } catch { return null; }
}

export function isInViewport(el) {
    const e = typeof el === 'string' ? document.querySelector(el) : el;
    if (!e) return false;
    const r = e.getBoundingClientRect();
    return r.top >= 0 && r.left >= 0 &&
        r.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        r.right <= (window.innerWidth || document.documentElement.clientWidth);
}

export function printElement(el) {
    const e = typeof el === 'string' ? document.querySelector(el) : el;
    if (!e) return;
    const w = window.open('', '', 'width=800,height=600');
    w.document.write(`<!DOCTYPE html><html><body>${e.innerHTML}</body></html>`);
    w.document.close(); w.print(); w.close();
}

// 导出默认工具对象
export default {
    autoResizeTextarea, safeRemoveElement, createAnimationElement,
    addEventDelegate, smoothScrollTo, getElementPosition,
    isElementInViewport, createIntersectionObserver,
    getScrollDistanceToBottom, shouldAutoScrollToBottom,
    scrollElementToBottom, scrollIntoViewOrFallback,
    applyChatScrollRequest, safeObserve, safeObserveAll,
    copyToClipboard, getElementStyles,
    hasClass, toggleClass, setAttributes, createElement,
    getFormData, setFormData,
    // DOM 快捷操作
    $, $$, addClass, removeClass, setStyle, getStyle,
    show, hide, toggle, attr, data, on, off, trigger,
    offset, size,
    // 浏览器工具
    downloadFile, safeJsonParse, scrollToTop, scrollToElement,
    getSelectedText, toggleFullscreen, isInViewport, printElement
}; 
