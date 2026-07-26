var YiPetUtils = function(exports) {
  "use strict";
  function buildUrl(baseUrl, endpoint, params) {
    let url = endpoint;
    if (params) {
      for (const key of Object.keys(params)) {
        url = url.replace(":" + key, encodeURIComponent(String(params[key])));
      }
    }
    if (!/^https?:\/\//.test(url) && baseUrl) {
      url = baseUrl.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
    }
    return url;
  }
  function buildQueryParams(params) {
    if (!params) return "";
    const searchParams = new URLSearchParams();
    for (const key of Object.keys(params)) {
      const value = params[key];
      if (value === void 0 || value === null) continue;
      if (typeof value === "object") {
        searchParams.append(key, JSON.stringify(value));
      } else {
        searchParams.append(key, String(value));
      }
    }
    return searchParams.toString();
  }
  function buildDatabaseUrl(baseUrl, methodName, parameters) {
    const queryParams = new URLSearchParams({
      module_name: "services.database.data_service",
      method_name: methodName,
      parameters: JSON.stringify(parameters || {})
    });
    return baseUrl + "/?" + queryParams.toString();
  }
  const api = { buildUrl, buildQueryParams, buildDatabaseUrl };
  if (typeof window !== "undefined") {
    window.UrlBuilder = api;
  }
  let _devMode = false;
  let _storageKey = null;
  let _initialized = false;
  let _pendingQueue = [];
  let _bufferEnabled = true;
  function _shouldLog() {
    return _devMode === true;
  }
  function _safeArgs(args) {
    try {
      return Array.prototype.slice.call(args);
    } catch {
      return ["[LoggerUtils] Argument cannot be serialized"];
    }
  }
  function _flushQueue() {
    if (!_pendingQueue.length) return;
    const queue = _pendingQueue;
    _pendingQueue = [];
    for (const entry of queue) {
      _writeLog(entry.method, entry.args);
    }
  }
  function _writeLog(method, args) {
    if (!_shouldLog()) return;
    const safe = _safeArgs(args);
    const prefix = "[YiPet]";
    switch (method) {
      case "error":
        console.error(prefix, ...safe);
        break;
      case "warn":
        console.warn(prefix, ...safe);
        break;
      case "info":
        console.info(prefix, ...safe);
        break;
      case "debug":
        console.debug(prefix, ...safe);
        break;
      case "group":
        console.group(prefix, ...safe);
        break;
      case "groupEnd":
        console.groupEnd();
        break;
      case "table":
        console.table(safe[0], safe[1]);
        break;
      case "trace":
        console.trace(prefix, ...safe);
        break;
      case "time":
        console.time(String(safe[0]));
        break;
      case "timeEnd":
        console.timeEnd(String(safe[0]));
        break;
      default:
        console.log(prefix, ...safe);
        break;
    }
  }
  function _log(method, args) {
    if (!_initialized && _bufferEnabled) {
      _pendingQueue.push({ method, args: _safeArgs(Array.prototype.slice.call(args)) });
      return;
    }
    _writeLog(method, Array.prototype.slice.call(args));
  }
  async function _readDevModeFromStorage(key) {
    var _a;
    try {
      if (typeof chrome === "undefined" || !((_a = chrome.storage) == null ? void 0 : _a.local)) return false;
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError) {
            resolve(false);
            return;
          }
          const val = result[key];
          resolve(val === true || val === "true" || val === 1 || val === "1");
        });
      });
    } catch {
      return false;
    }
  }
  function _watchStorageChanges(key) {
    var _a;
    try {
      if (typeof chrome === "undefined" || !((_a = chrome.storage) == null ? void 0 : _a.onChanged)) return;
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== "local") return;
        if (!changes[key]) return;
        const newVal = changes[key].newValue;
        _devMode = newVal === true || newVal === "true" || newVal === 1 || newVal === "1";
      });
    } catch {
    }
  }
  const LoggerUtils = {
    /* ── Init ─────────────────────────────────────────────────────── */
    async initMuteLogger(storageKey, fallbackDevMode, options) {
      if (_initialized) return LoggerUtils;
      _storageKey = storageKey || "petDevMode";
      _devMode = !!fallbackDevMode;
      if (options && typeof options.buffer === "boolean") {
        _bufferEnabled = options.buffer;
      }
      try {
        const storedValue = await _readDevModeFromStorage(_storageKey);
        _devMode = storedValue;
      } catch {
      }
      _initialized = true;
      _watchStorageChanges(_storageKey);
      _flushQueue();
      return LoggerUtils;
    },
    /* ── Mode Control ─────────────────────────────────────────────── */
    setDevMode(enabled) {
      _devMode = !!enabled;
      if (!_initialized) _initialized = true;
      if (_devMode) _flushQueue();
    },
    isDevMode() {
      return _devMode;
    },
    isInitialized() {
      return _initialized;
    },
    /* ── Log Methods ──────────────────────────────────────────────── */
    log(...args) {
      _log("log", arguments);
    },
    info(...args) {
      _log("info", arguments);
    },
    warn(...args) {
      _log("warn", arguments);
    },
    error(...args) {
      _log("error", arguments);
    },
    debug(...args) {
      _log("debug", arguments);
    },
    group(...args) {
      _log("group", arguments);
    },
    groupEnd() {
      _log("groupEnd", []);
    },
    table(data, columns) {
      _log("table", [data, columns]);
    },
    trace(...args) {
      _log("trace", arguments);
    },
    time(label) {
      _log("time", [label]);
    },
    timeEnd(label) {
      _log("timeEnd", [label]);
    },
    /* ── Conditional ──────────────────────────────────────────────── */
    logIf(condition, ...args) {
      if (!condition) return;
      _log("log", args);
    },
    assert(condition, message, ...args) {
      if (condition) return;
      _log("error", ["[ASSERT] " + (message || "Assertion failed"), ...args]);
    },
    /* ── Namespace ────────────────────────────────────────────────── */
    createNamespace(namespace) {
      const ns = "[" + String(namespace || "") + "]";
      const self = this;
      return {
        log(...args) {
          self.log(ns, ...args);
        },
        info(...args) {
          self.info(ns, ...args);
        },
        warn(...args) {
          self.warn(ns, ...args);
        },
        error(...args) {
          self.error(ns, ...args);
        },
        debug(...args) {
          self.debug(ns, ...args);
        }
      };
    },
    /* ── Queue ────────────────────────────────────────────────────── */
    getPendingCount() {
      return _pendingQueue.length;
    },
    clearPending() {
      _pendingQueue = [];
    },
    /* ── Internal (debug) ─────────────────────────────────────────── */
    _shouldLog,
    _safeArgs,
    _flushQueue,
    _writeLog,
    _log
  };
  if (typeof window !== "undefined") {
    window.LoggerUtils = LoggerUtils;
  }
  function createApiClient(config) {
    const { baseUrl, timeout = 3e4, headers = {}, retry, logger } = config;
    const defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers
    };
    function resolveUrl(path) {
      const base = baseUrl.replace(/\/+$/, "");
      const p = path.startsWith("/") ? path : "/" + path;
      return base + p;
    }
    async function request(method, path, body, signal, attempt = 0) {
      var _a, _b;
      const url = resolveUrl(path);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      if (signal) signal.addEventListener("abort", () => controller.abort());
      try {
        const init = { method, headers: defaultHeaders, signal: controller.signal };
        if (body !== void 0 && method !== "GET") {
          init.body = JSON.stringify(body);
        }
        const response = await fetch(url, init);
        clearTimeout(timeoutId);
        let data;
        const ct = response.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          data = await response.json();
        } else {
          data = await response.text();
        }
        const result = {
          ok: response.ok,
          status: response.status,
          data
        };
        if (!response.ok) {
          result.error = typeof data === "object" && data !== null ? data.detail || `HTTP ${response.status}` : `HTTP ${response.status}`;
          (_a = logger == null ? void 0 : logger.warn) == null ? void 0 : _a.call(logger, `API ${method} ${path} → ${response.status}`, result.error);
        }
        return result;
      } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === "AbortError") {
          return { ok: false, status: 0, data: null, error: "Request timed out or was aborted" };
        }
        if (retry && attempt < retry.maxRetries) {
          (_b = logger == null ? void 0 : logger.debug) == null ? void 0 : _b.call(logger, `API retry ${attempt + 1}/${retry.maxRetries} for ${method} ${path}`);
          await new Promise((r) => setTimeout(r, retry.baseMs * (attempt + 1)));
          return request(method, path, body, signal, attempt + 1);
        }
        return {
          ok: false,
          status: 0,
          data: null,
          error: err.message || "Network error"
        };
      }
    }
    return {
      get: (path, signal) => request("GET", path, void 0, signal),
      post: (path, body, signal) => request("POST", path, body, signal),
      put: (path, body, signal) => request("PUT", path, body, signal),
      delete: (path, signal) => request("DELETE", path, void 0, signal),
      url: resolveUrl
    };
  }
  if (typeof window !== "undefined") {
    const w = window;
    w.UrlBuilder = api;
    w.LoggerUtils = LoggerUtils;
    w.YiPetApi = { createClient: createApiClient };
  }
  exports.LoggerUtils = LoggerUtils;
  exports.UrlBuilder = api;
  exports.buildDatabaseUrl = buildDatabaseUrl;
  exports.buildQueryParams = buildQueryParams;
  exports.buildUrl = buildUrl;
  exports.createApiClient = createApiClient;
  Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
  return exports;
}({});
