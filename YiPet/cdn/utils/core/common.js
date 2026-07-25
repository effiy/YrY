/**
 * 通用工具函数 — 规范实现
 * 合并自 index.js + core/common.js，消除与其他 core 模块的重复
 */

// ═══════════════════════════════════════════════════════════════
// 防抖 & 节流（带 cancel 支持）
// ═══════════════════════════════════════════════════════════════

export function debounce(fn, delay = 300) {
    let timer = null;
    const debounced = function (...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
    debounced.cancel = () => {
        if (timer) clearTimeout(timer);
        timer = null;
    };
    return debounced;
}

export function throttle(fn, delay = 300) {
    let last = 0, timer = null;
    const throttled = function (...args) {
        const now = Date.now();
        if (now - last >= delay) {
            last = now;
            fn.apply(this, args);
        } else if (!timer) {
            timer = setTimeout(() => {
                last = Date.now();
                timer = null;
                fn.apply(this, args);
            }, delay - (now - last));
        }
    };
    throttled.cancel = () => {
        if (timer) clearTimeout(timer);
        timer = null;
    };
    return throttled;
}

// ═══════════════════════════════════════════════════════════════
// 数字
// ═══════════════════════════════════════════════════════════════

/** 限制数值范围 */
export function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

/** 格式化数字（千位分隔 + 小数） */
export function formatNumber(num, options = {}) {
    const { decimals = 0, thousands = ',', decimal = '.', prefix = '', suffix = '' } = options;
    const n = Number(num ?? 0);
    const fixed = n.toFixed(decimals);
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
    return `${prefix}${parts.join(decimal)}${suffix}`;
}

/** 格式化文件大小 */
export function formatFileSize(bytes, decimals = 2) {
    const n = Number(bytes);
    if (!Number.isFinite(n) || n < 0) return '0 B';
    if (n === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    let idx = 0, val = n;
    while (val >= k && idx < units.length - 1) { val /= k; idx++; }
    const dm = idx === 0 ? 0 : (decimals < 0 ? 0 : decimals);
    return dm === 0 ? `${Math.floor(val)} ${units[idx]}` : `${val.toFixed(dm)} ${units[idx]}`;
}

/** 序数词 (1st, 2nd, 3rd...) */
export function ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** 判断是否为整数 */
export function isInteger(n) { return Number.isInteger(Number(n)); }

/** 安全数字解析 */
export function toNumber(val, defaultValue = 0) {
    const n = Number(val);
    return isNaN(n) ? defaultValue : n;
}

/** 百分比 */
export function percent(current, total, decimals = 1) {
    if (!total) return '0%';
    return ((current / total) * 100).toFixed(decimals) + '%';
}

// ═══════════════════════════════════════════════════════════════
// 日期 & 时间
// ═══════════════════════════════════════════════════════════════

export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return format
        .replace('YYYY', d.getFullYear())
        .replace('MM', pad(d.getMonth() + 1))
        .replace('DD', pad(d.getDate()))
        .replace('HH', pad(d.getHours()))
        .replace('mm', pad(d.getMinutes()))
        .replace('ss', pad(d.getSeconds()));
}

export function timeAgo(date) {
    const d = date instanceof Date ? date : new Date(date);
    const diff = Math.floor((Date.now() - d) / 1000);
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} 天前`;
    return formatDate(d, 'YYYY-MM-DD');
}

export function isToday(date) {
    const d = date instanceof Date ? date : new Date(date);
    const t = new Date();
    return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

export function isSameDay(a, b) {
    const d1 = a instanceof Date ? a : new Date(a);
    const d2 = b instanceof Date ? b : new Date(b);
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

export function startOfDay(date) {
    const d = date instanceof Date ? new Date(date) : new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function endOfDay(date) {
    const d = date instanceof Date ? new Date(date) : new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

// 保留旧 API（兼容 core/common.js 原有使用者）
export function formatTime(dateInput, format = 'ago') {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) return '未知时间';
    if (format === 'ago') return timeAgo(date);
    if (format === 'date') return formatDate(date, 'YYYY-MM-DD');
    if (format === 'datetime') return formatDate(date, 'YYYY-MM-DD HH:mm:ss');
    return date.toString();
}

// ═══════════════════════════════════════════════════════════════
// 异步 & Promise
// ═══════════════════════════════════════════════════════════════

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function withTimeout(promise, timeout, timeoutError = new Error('Timeout')) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(timeoutError), timeout))
    ]);
}

export async function retry(fn, times = 3, delay = 100) {
    let lastError;
    for (let i = 0; i < times; i++) {
        try { return await fn(); }
        catch (err) { lastError = err; if (i < times - 1) await sleep(delay); }
    }
    throw lastError;
}

// ═══════════════════════════════════════════════════════════════
// 函数式
// ═══════════════════════════════════════════════════════════════

export function pipe(...fns) { return x => fns.reduce((v, f) => f(v), x); }
export function compose(...fns) { return x => fns.reduceRight((v, f) => f(v), x); }

export function curry(fn) {
    return function curried(...args) {
        if (args.length >= fn.length) return fn.apply(this, args);
        return (...more) => curried.apply(this, [...args, ...more]);
    };
}

export function memoize(fn) {
    const cache = new Map();
    return function (...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

// ═══════════════════════════════════════════════════════════════
// 类型判断
// ═══════════════════════════════════════════════════════════════

export function isType(val, type) {
    return Object.prototype.toString.call(val) === `[object ${type}]`;
}

export const isString = val => typeof val === 'string';
export const isNumber = val => typeof val === 'number' && !isNaN(val);
export const isBoolean = val => typeof val === 'boolean';
export const isArray = val => Array.isArray(val);
export const isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);
export const isFunction = val => typeof val === 'function';

export const isEmpty = val => {
    if (val == null) return true;
    if (isString(val) || isArray(val)) return val.length === 0;
    if (isObject(val)) return Object.keys(val).length === 0;
    return false;
};

export function isEmail(str) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(str)); }
export function isPhone(str) { return /^1[3-9]\d{9}$/.test(String(str)); }
export function isUrl(str) { try { new URL(str); return true; } catch { return false; } }
export function isHexColor(str) { return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(String(str)); }

// ═══════════════════════════════════════════════════════════════
// 颜色
// ═══════════════════════════════════════════════════════════════

export function hexToRgb(hex) {
    const match = String(hex ?? '').replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!match) return null;
    return { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) };
}

export function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = Math.round(clamp(x, 0, 255)).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

export function getContrastColor(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return '#000000';
    return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255 > 0.5 ? '#000000' : '#ffffff';
}

export function colorAlpha(hex, alpha) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clamp(alpha, 0, 1)})`;
}

export function lighten(hex, pct) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    const a = Math.round(255 * pct / 100);
    return rgbToHex(Math.min(255, rgb.r + a), Math.min(255, rgb.g + a), Math.min(255, rgb.b + a));
}

export function darken(hex, pct) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    const a = Math.round(255 * pct / 100);
    return rgbToHex(Math.max(0, rgb.r - a), Math.max(0, rgb.g - a), Math.max(0, rgb.b - a));
}

// ═══════════════════════════════════════════════════════════════
// 随机
// ═══════════════════════════════════════════════════════════════

export function random(min = 0, max = 1) { return Math.random() * (max - min) + min; }
export function randomInt(min = 0, max = 100) { return Math.floor(random(min, max + 1)); }

export function sample(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return undefined;
    return arr[randomInt(0, arr.length - 1)];
}

export function randomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

// ═══════════════════════════════════════════════════════════════
// 存储 helper（兼容旧版 API，实际委托给 core/storage.js）
// ═══════════════════════════════════════════════════════════════

export function safeGetItem(key, defaultValue = null, parse = true) {
    try {
        const item = localStorage.getItem(key);
        if (item === null) return defaultValue;
        return parse ? JSON.parse(item) : item;
    } catch { return defaultValue; }
}

export function safeSetItem(key, value, stringify = true) {
    try {
        localStorage.setItem(key, stringify ? JSON.stringify(value) : value);
        return true;
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            ['searchHistory', 'tempData'].forEach(k => {
                if (k !== key && localStorage.getItem(k)) localStorage.removeItem(k);
            });
            try {
                localStorage.setItem(key, stringify ? JSON.stringify(value) : value);
                return true;
            } catch { return false; }
        }
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════
// 杂项（保留原有独特函数）
// ═══════════════════════════════════════════════════════════════

/** 创建 CSS 变量字符串 */
export function createCSSVars(vars) {
    if (!vars || typeof vars !== 'object') return '';
    return Object.entries(vars).map(([k, v]) => `--${k}: ${v}`).join(';');
}

/** 不区分大小写搜索匹配 */
export function isSearchMatch(text, query, caseSensitive = false) {
    if (!query) return true;
    if (text === null || text === undefined) return false;
    const t = caseSensitive ? String(text) : String(text).toLowerCase();
    const q = caseSensitive ? String(query) : String(query).toLowerCase();
    return t.includes(q);
}

/** 提取文本摘要（去 HTML → 截断） */
export function extractExcerpt(text, maxLength = 100, suffix = '...') {
    if (text === null || text === undefined) return '';
    const plain = String(text).replace(/<[^>]*>/g, '').trim();
    return plain.length <= maxLength ? plain : plain.substring(0, maxLength) + suffix;
}

/** 更新 URL 查询参数 */
export function updateUrlParams(params, replace = false) {
    const url = new URL(window.location);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) url.searchParams.set(key, value);
        else url.searchParams.delete(key);
    });
    if (replace) window.history.replaceState({}, '', url);
    else window.history.pushState({}, '', url);
}

/** 获取 URL 查询参数 */
export function getUrlParam(key) {
    return new URLSearchParams(window.location.search).get(key);
}

/** 检测设备类型 */
export function detectDevice() {
    const ua = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|Opera Mini|IEMobile|WPDesktop/i.test(ua);
    const isTablet = /iPad|Android/i.test(ua) && !/Mobile/i.test(ua);
    return { isMobile, isTablet, isDesktop: !isMobile && !isTablet, userAgent: ua };
}

// ═══════════════════════════════════════════════════════════════
// 默认导出
// ═══════════════════════════════════════════════════════════════

export default {
    // 防抖 & 节流
    debounce, throttle,
    // 数字
    clamp, formatNumber, formatFileSize, ordinal, isInteger, toNumber, percent,
    // 日期
    formatDate, timeAgo, isToday, isSameDay, startOfDay, endOfDay, formatTime,
    // 异步
    sleep, withTimeout, retry,
    // 函数式
    pipe, compose, curry, memoize,
    // 类型
    isType, isString, isNumber, isBoolean, isArray, isObject, isFunction, isEmpty,
    isEmail, isPhone, isUrl, isHexColor,
    // 颜色
    hexToRgb, rgbToHex, getContrastColor, colorAlpha, lighten, darken,
    // 随机
    random, randomInt, sample, randomColor,
    // 存储 helper
    safeGetItem, safeSetItem,
    // 杂项
    createCSSVars, isSearchMatch, extractExcerpt,
    updateUrlParams, getUrlParam, detectDevice
};
