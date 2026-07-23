/**
 * YiH5 Configuration
 * 
 * Best Practices:
 * - Structured Configuration (Categorized by domain)
 * - Environment Awareness (Runtime overrides)
 * - Immutability (Frozen config object)
 * - Type Safety (JSDoc)
 */

/**
 * @typedef {Object} EndpointsConfig
 * @property {string} mongodb
 * @property {string} faq
 * @property {string} prompt
 * @property {string} session
 * @property {string} sessionSave
 */

/**
 * @typedef {Object} Config
 * @property {string} appName
 * @property {string} apiBase
 * @property {EndpointsConfig} endpoints
 * @property {Object} news
 * @property {Object} ui
 */

const DEFAULT_CONFIG = {
  appName: "YiH5",
  apiBase: "https://api.effiy.cn",
  endpoints: {
    mongodb: "/mongodb/",
    faq: "/", // 新 API 使用根路径，参数在 faq.js 中构建
    prompt: "/prompt/",
    session: "/session/",
    sessionSave: "/session/save",
  },
  news: {
    pageSize: 500,
    maxPages: 10,
    listFields: [
      "key",
      "title",
      "link",
      "description",
      "tags",
      "source_name",
      "source_url",
      "published",
      "published_parsed",
      "createdTime",
      "updatedTime",
    ],
  },
  ui: {
    vlistMinItems: 60,
    newsVlistMinItems: 60,
  },
};

/**
 * Deep merge two objects.
 * @param {Object} target
 * @param {Object} source
 * @returns {Object}
 */
const deepMerge = (target, source) => {
  if (!source || typeof source !== 'object') return target;
  
  const output = { ...target };
  
  Object.keys(source).forEach(key => {
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      if (target[key] !== undefined) {
        output[key] = deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    } else {
      output[key] = source[key];
    }
  });
  
  return output;
};

// Runtime config injection (e.g. from window.YI_CONFIG)
const runtimeConfig = (typeof window !== "undefined" && window.YI_CONFIG) || {};

/** @type {Config} */
export const config = Object.freeze(deepMerge(DEFAULT_CONFIG, runtimeConfig));

/**
 * Helper to build full API URLs
 * @param {string} path - Relative path
 * @returns {string} Full URL
 */
export const buildUrl = (path) => {
  const base = config.apiBase.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${base}/${cleanPath}`;
};

export default config;
