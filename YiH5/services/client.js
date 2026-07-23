/**
 * HTTP 客户端模块
 * 封装基础的 fetch 请求和错误处理
 */

import { getAuthHeaders } from "./auth.js";

/**
 * 处理 API 错误消息
 * @param {Error} error 
 * @param {boolean} isFile - 是否为文件协议环境
 * @returns {string} 用户友好的错误消息
 */
export const handleApiError = (error, isFile) => {
  const isFileProtocol = isFile || location.protocol === "file:";
  if (String(error?.message || "").includes("HTTP 401")) {
    return "需要配置 API 鉴权（至少需要 X-Token）。请点右上角🔒设置。";
  }
  return isFileProtocol
    ? "请求失败：当前以 file:// 打开页面，跨域请求可能被浏览器拦截。建议用本地静态服务器打开再试。"
    : "请求失败：请稍后重试。";
};

/**
 * 带认证的 Fetch 请求
 * @param {string} url 
 * @param {RequestInit} [options] 
 * @param {string} [token] 
 * @returns {Promise<Response>}
 */
export const fetchWithAuth = async (url, options = {}, token) => {
  const headers = {
    ...getAuthHeaders(token),
    ...options.headers,
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response;
};

/**
 * 通用数据提取工具
 * @param {Object|Array} result 
 * @param {string} [listKey="list"] 
 * @returns {Array}
 */
export const extractList = (result, listKey = "list") => {
  if (result && result.data && Array.isArray(result.data[listKey])) return result.data[listKey];
  if (Array.isArray(result)) return result;
  if (result && Array.isArray(result.data)) return result.data;
  if (result && Array.isArray(result[listKey])) return result[listKey];
  if (result && Array.isArray(result.items)) return result.items;
  return [];
};

const DEFAULT_CONFIG = {
  timeout: 5 * 60 * 1000,
  mode: "cors",
  credentials: "omit",
};

export class RequestClient {
  constructor(options = {}) {
    this.defaultOptions = { ...DEFAULT_CONFIG, ...(options.defaultOptions || {}) };
    this.abortControllers = new Map();
  }

  abort(abortKey) {
    if (!abortKey) return;
    const controller = this.abortControllers.get(abortKey);
    if (controller) {
      try { controller.abort(); } catch (_) {}
      this.abortControllers.delete(abortKey);
    }
  }

  async requestRaw(url, options = {}, token) {
    const config = { ...this.defaultOptions, ...(options || {}) };
    const { timeout, abortKey, signal: externalSignal, headers: headerOverrides, ...fetchOptions } = config;

    let signal = externalSignal;
    if (abortKey) {
      this.abort(abortKey);
      const controller = new AbortController();
      this.abortControllers.set(abortKey, controller);
      signal = controller.signal;
    }

    const controller = new AbortController();
    if (signal) {
      try {
        if (signal.aborted) {
          controller.abort();
        } else if (typeof signal.addEventListener === "function") {
          signal.addEventListener("abort", () => {
            try { controller.abort(); } catch (_) {}
          }, { once: true });
        }
      } catch (_) {}
    }

    const headers = {
      ...getAuthHeaders(token),
      ...(headerOverrides || {}),
    };

    const doFetch = fetch(url, { ...fetchOptions, headers, signal: controller.signal });
    const timeoutPromise = new Promise((_, reject) => {
      const timer = setTimeout(() => {
        try { controller.abort(); } catch (_) {}
        reject(new Error(`请求超时：${timeout}ms`));
      }, timeout);
      controller.signal._timer = timer;
    });

    try {
      const response = await Promise.race([doFetch, timeoutPromise]);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } finally {
      try { clearTimeout(controller.signal._timer); } catch (_) {}
      if (abortKey) {
        this.abortControllers.delete(abortKey);
      }
    }
  }

  async requestJson(url, options = {}, token) {
    const response = await this.requestRaw(url, options, token);
    return await response.json();
  }

  getJson(url, options = {}, token) {
    return this.requestJson(url, { ...options, method: "GET" }, token);
  }

  postJson(url, data, options = {}, token) {
    return this.requestJson(url, {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      body: JSON.stringify(data),
    }, token);
  }
}

export const createRequestClient = (options = {}) => new RequestClient(options);
export const requestClient = createRequestClient();
