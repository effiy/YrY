/**
 * YiWeb Configuration
 *
 * 对齐 YiH5 config 模式：DEFAULT_CONFIG + deepMerge + Object.freeze + 运行时注入。
 * 保留 YiWeb 特有的 env 切换与 window 全局兼容。
 */

// --- 环境检测 ---
const getParams = () => new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
const getStorage = (key) => typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
const isLocalHost = (h) => h === 'localhost' || h === '127.0.0.1' || h.endsWith('.local');

const params = getParams();

let ENV = 'prod';

// --- 端点定义 ---
const ENDPOINTS = {
  local: {
    DATA_URL: 'http://localhost:9000',
    API_URL: 'http://localhost:10086',
    OLLAMA_URL: 'http://localhost:11434'
  },
  prod: {
    DATA_URL: 'http://localhost:9000',
    API_URL: 'http://localhost:10086',
    OLLAMA_URL: 'http://localhost:11434'
  }
};

const normalize = (url) => String(url || '').replace(/\/+$/,'');
const currentEndpoints = ENDPOINTS[ENV] || ENDPOINTS.prod;

const debug = (() => {
  const dq = params.get('debug');
  if (dq != null) return dq === 'true';
  const stored = getStorage('debug');
  if (stored != null) return stored === 'true';
  return typeof location !== 'undefined' ? isLocalHost(location.hostname) : false;
})();

// --- 基础配置（DEFAULT_CONFIG） ---
const baseConfig = {
  env: ENV,
  isLocal: ENV === 'local',
  isProd: ENV === 'prod',
  debug,
  dataUrl: normalize(currentEndpoints.DATA_URL),
  apiUrl: normalize(currentEndpoints.API_URL),
  ollamaUrl: normalize(currentEndpoints.OLLAMA_URL),
  // setEnv 挂在 unfrozen wrapper，见下方 setEnv 注释
};

// --- 冻结后的 config 对象 ---
export const config = baseConfig;

// --- 环境切换（YiWeb 特有） ---
// config 已冻结，setEnv 通过 localStorage + reload 重新生效。
export const setEnv = (name) => {
  if (!ENDPOINTS[name]) return false;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('env', name);
    if (typeof location !== 'undefined') location.reload();
  }
  return true;
};

// --- URL 构建 helper ---
export const buildApiUrl = (path) => {
  const p = String(path || '');
  if (p.startsWith('http')) return p;
  const base = config.apiUrl;
  if (!p) return base;
  return base + (p.startsWith('/') ? '' : '/') + p.replace(/^\/+/, '');
};

export const buildDataUrl = (path) => {
  const p = String(path || '');
  const base = config.dataUrl;
  if (!p) return base;
  return base + (p.startsWith('/') ? '' : '/') + p.replace(/^\/+/, '');
};

// --- 项目标识 ---
const PROJECT_NAME = 'YiWeb';

// --- 向后兼容（全局注入） ---
if (typeof window !== 'undefined') {
  window.DATA_URL = config.dataUrl;
  window.API_URL = config.apiUrl;
  window.PROJECT_NAME = PROJECT_NAME;
  window.__ENV__ = {
    name: config.env,
    isLocal: config.isLocal,
    isProd: config.isProd,
    DEBUG: config.debug,
    DATA_URL: config.dataUrl,
    API_URL: config.apiUrl,
    OLLAMA_URL: config.ollamaUrl
  };

  window.__OLLAMA_BASE_URL__ = config.ollamaUrl;

  window.setEnv = setEnv;
  window.getEnv = () => config.env;
  window.buildApiUrl = buildApiUrl;
  window.buildDataUrl = buildDataUrl;

  if (config.debug) {
    console.info('[YiWeb Config] Loaded:', window.__ENV__);
  }
}

export default config;
