/**
 * 字符串工具函数 — 规范实现
 * 合并自 index.js + core/string.js
 */

// ── 大小写转换 ──────────────────────────────────────────────

/** 首字母大写 */
export function capitalize(str) {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** 首字母小写 */
export function uncapitalize(str) {
    const s = String(str ?? '');
    return s.charAt(0).toLowerCase() + s.slice(1);
}

/** 单词首字母大写 */
export function titleize(str) {
    return String(str ?? '').replace(/\b\w/g, c => c.toUpperCase());
}

// ── 命名风格转换 ────────────────────────────────────────────

/** 驼峰 → kebab-case */
export function camelToKebab(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/** kebab-case → 驼峰 */
export function kebabToCamel(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/** 下划线 → 驼峰 */
export function snakeToCamel(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

/** 驼峰 → 下划线 */
export function camelToSnake(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

/**
 * 截断字符串
 * @param {string} str - 字符串
 * @param {number} length - 长度
 * @param {string} suffix - 后缀
 * @returns {string} 处理后的字符串
 */
export function truncate(str, length = 50, suffix = '...') {
    if (!str || typeof str !== 'string') return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + suffix;
}

/**
 * 移除HTML标签
 * @param {string} html - HTML字符串
 * @returns {string} 纯文本
 */
export function stripHtml(html) {
    if (!html || typeof html !== 'string') return '';
    return html.replace(/<[^>]*>/g, '');
}

/**
 * 转义HTML
 * @param {string} str - 字符串
 * @returns {string} 转义后的字符串
 */
export function escapeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return str.replace(/[&<>"']/g, char => map[char]);
}

/**
 * 反转义HTML
 * @param {string} str - 字符串
 * @returns {string} 反转义后的字符串
 */
export function unescapeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    const map = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'"
    };
    return str.replace(/&(amp|lt|gt|quot|#39);/g, entity => map[entity]);
}

/**
 * 生成随机字符串
 * @param {number} length - 长度
 * @param {string} chars - 字符集
 * @returns {string} 随机字符串
 */
export function randomString(length = 8, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * 生成UUID
 * @returns {string} UUID
 */
export function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * 字符串模板替换 (支持 {key} 和 {{key}} 两种语法)
 */
export function template(tpl, data) {
    if (!tpl || typeof tpl !== 'string') return '';
    return tpl.replace(/\{(\w+)\}/g, (_, key) =>
        data[key] !== undefined ? data[key] : `{${key}}`
    );
}

// ── HTML / JS 转义 ──────────────────────────────────────────

/** HTML 属性转义（额外转义双引号） */
export function escapeHtmlAttr(str) {
    return escapeHtml(str).replace(/"/g, '&quot;');
}

/** JavaScript 字符串转义 */
export function escapeJs(str) {
    return String(str ?? '')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
}

// ── 自定义 trim ─────────────────────────────────────────────

/** 从开头移除指定字符 */
export function trimStart(str, chars = ' \t\n\r') {
    let s = String(str ?? ''), i = 0;
    while (i < s.length && chars.includes(s[i])) i++;
    return s.slice(i);
}

/** 从末尾移除指定字符 */
export function trimEnd(str, chars = ' \t\n\r') {
    let s = String(str ?? ''), i = s.length - 1;
    while (i >= 0 && chars.includes(s[i])) i--;
    return s.slice(0, i + 1);
}

// ── ID 生成 ─────────────────────────────────────────────────

/** 生成带前缀的唯一 ID */
export function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// ── 宽度计算 ────────────────────────────────────────────────

/** CJK 感知的字符串宽度（中文 ≈ 2 字符宽度） */
export function strWidth(str) {
    return String(str ?? '').split('').reduce((len, c) =>
        len + (c.charCodeAt(0) > 127 ? 2 : 1), 0);
}

/** URL 安全检查 */
export function sanitizeUrl(href) {
    const raw = String(href ?? '').trim();
    if (!raw) return '';
    if (raw.startsWith('import-')) return '';
    if (raw.startsWith('#') || raw.startsWith('/') || raw.startsWith('./') || raw.startsWith('../')) return raw;
    try {
        const u = new URL(raw, window.location.origin);
        const p = String(u.protocol ?? '').toLowerCase();
        if (p === 'http:' || p === 'https:' || p === 'mailto:') return u.href;
        return '';
    } catch { return ''; }
}

/**
 * 高亮关键词
 * @param {string} text - 文本
 * @param {string} keyword - 关键词
 * @param {string} className - 高亮类名
 * @returns {string} 高亮后的HTML
 */
export function highlight(text, keyword, className = 'highlight') {
    if (!text || !keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, `<span class="${className}">$1</span>`);
}

/**
 * 计算字符串字节长度（中文算2个字节）
 * @param {string} str - 字符串
 * @returns {number} 字节长度
 */
export function byteLength(str) {
    if (!str || typeof str !== 'string') return 0;
    let length = 0;
    for (let i = 0; i < str.length; i++) {
        length += str.charCodeAt(i) > 255 ? 2 : 1;
    }
    return length;
}

/**
 * 按字节截断字符串
 * @param {string} str - 字符串
 * @param {number} maxBytes - 最大字节数
 * @param {string} suffix - 后缀
 * @returns {string} 截断后的字符串
 */
export function truncateByBytes(str, maxBytes, suffix = '...') {
    if (!str || typeof str !== 'string') return '';

    let length = 0;
    let result = '';

    for (let i = 0; i < str.length; i++) {
        const charLength = str.charCodeAt(i) > 255 ? 2 : 1;

        if (length + charLength > maxBytes) {
            return result + suffix;
        }

        length += charLength;
        result += str[i];
    }

    return result;
}

/**
 * 格式化数字（添加千分位）
 * @param {number} num - 数字
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的字符串
 */
export function formatNumber(num, decimals = 0) {
    const n = Number(num);
    if (!Number.isFinite(n)) return '0';

    const fixed = n.toFixed(decimals);
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return parts.join('.');
}

/**
 * 解析查询字符串
 * @param {string} query - 查询字符串
 * @returns {Object} 解析后的对象
 */
export function parseQuery(query) {
    if (!query || typeof query !== 'string') return {};

    const params = new URLSearchParams(query);
    const result = {};

    for (const [key, value] of params.entries()) {
        result[key] = value;
    }

    return result;
}

/**
 * 构建查询字符串
 * @param {Object} params - 参数对象
 * @returns {string} 查询字符串
 */
export function buildQuery(params) {
    if (!params || typeof params !== 'object') return '';

    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== undefined) {
            searchParams.append(key, String(value));
        }
    }

    return searchParams.toString();
}

export default {
    // 大小写
    capitalize, uncapitalize, titleize,
    // 命名风格
    camelToKebab, kebabToCamel, snakeToCamel, camelToSnake,
    // 截断
    truncate, truncateByBytes,
    // HTML
    stripHtml, escapeHtml, unescapeHtml, escapeHtmlAttr, escapeJs,
    // URL 安全
    sanitizeUrl,
    // 模板 & 高亮
    template, highlight,
    // 随机 & ID
    randomString, uuid, generateId,
    // 字节 / 宽度
    byteLength, strWidth,
    // trim
    trimStart, trimEnd,
    // 数字格式化
    formatNumber,
    // URL 查询
    parseQuery, buildQuery
};
