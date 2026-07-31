var YiPetUtils;
(() => {
"use strict";
// The require scope
var __webpack_require__ = {};

// webpack/runtime/define_property_getters
(() => {
__webpack_require__.d = (exports, definition) => {
	for(var key in definition) {
        if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
    }
};
})();
// webpack/runtime/has_own_property
(() => {
__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
})();
// webpack/runtime/make_namespace_object
(() => {
// define __esModule on exports
__webpack_require__.r = (exports) => {
	if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
	}
	Object.defineProperty(exports, '__esModule', { value: true });
};
})();
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  buildUrl: () => (/* reexport */ buildUrl),
  createApiClient: () => (/* reexport */ createApiClient),
  UrlBuilder: () => (/* reexport */ utils_url),
  LoggerUtils: () => (/* reexport */ LoggerUtils),
  buildDatabaseUrl: () => (/* reexport */ buildDatabaseUrl),
  buildQueryParams: () => (/* reexport */ buildQueryParams)
});

;// CONCATENATED MODULE: ./public/cdn/utils/url.ts
/**
 * UrlBuilder — CDN utility (built as IIFE, attaches window.UrlBuilder).
 *
 * Also importable as an ES module within the extension:
 *   import { buildUrl, buildQueryParams } from '../cdn/url';
 */ /** Replace :param placeholders and join with baseUrl. */ function buildUrl(baseUrl, endpoint, params) {
    let url = endpoint;
    if (params) {
        for (const key of Object.keys(params)){
            url = url.replace(':' + key, encodeURIComponent(String(params[key])));
        }
    }
    if (!/^https?:\/\//.test(url) && baseUrl) {
        url = baseUrl.replace(/\/$/, '') + '/' + url.replace(/^\//, '');
    }
    return url;
}
/** Build URL query string from a params object. */ function buildQueryParams(params) {
    if (!params) return '';
    const searchParams = new URLSearchParams();
    for (const key of Object.keys(params)){
        const value = params[key];
        if (value === undefined || value === null) continue;
        if (typeof value === 'object') {
            searchParams.append(key, JSON.stringify(value));
        } else {
            searchParams.append(key, String(value));
        }
    }
    return searchParams.toString();
}
/** Build a database API URL with module/method query params. */ function buildDatabaseUrl(baseUrl, methodName, parameters) {
    const queryParams = new URLSearchParams({
        module_name: 'services.database.data_service',
        method_name: methodName,
        parameters: JSON.stringify(parameters || {})
    });
    return baseUrl + '/?' + queryParams.toString();
}
/* ── Global attachment (for CDN/IIFE build) ────────────────────────── */ const api = {
    buildUrl,
    buildQueryParams,
    buildDatabaseUrl
};
/* export default */ const utils_url = (api);
// Attach to window when loaded as a plain <script> (CDN context)
if (typeof window !== 'undefined') {
    window.UrlBuilder = api;
}

;// CONCATENATED MODULE: ./public/cdn/utils/log.ts
/**
 * LoggerUtils — CDN utility (built as IIFE, attaches window.LoggerUtils).
 *
 * Provides dev-mode-gated console logging with storage-backed toggle,
 * buffered queue before init, and namespace sub-loggers.
 *
 * Importable as ES module:  import { LoggerUtils } from './log';
 * CDN global:              window.LoggerUtils.log(...)
 */ /* ═══════════════════════════════════════════════════════════════════════
   State
   ═══════════════════════════════════════════════════════════════════════ */ let _devMode = false;
let _storageKey = null;
let _initialized = false;
let _pendingQueue = [];
let _bufferEnabled = true;
/* ═══════════════════════════════════════════════════════════════════════
   Internal
   ═══════════════════════════════════════════════════════════════════════ */ function _shouldLog() {
    return _devMode === true;
}
function _safeArgs(args) {
    try {
        return Array.prototype.slice.call(args);
    } catch  {
        return [
            '[LoggerUtils] Argument cannot be serialized'
        ];
    }
}
function _flushQueue() {
    if (!_pendingQueue.length) return;
    const queue = _pendingQueue;
    _pendingQueue = [];
    for (const entry of queue){
        _writeLog(entry.method, entry.args);
    }
}
function _writeLog(method, args) {
    if (!_shouldLog()) return;
    const safe = _safeArgs(args);
    const prefix = '[YiPet]';
    switch(method){
        case 'error':
            console.error(prefix, ...safe);
            break;
        case 'warn':
            console.warn(prefix, ...safe);
            break;
        case 'info':
            console.info(prefix, ...safe);
            break;
        case 'debug':
            console.debug(prefix, ...safe);
            break;
        case 'group':
            console.group(prefix, ...safe);
            break;
        case 'groupEnd':
            console.groupEnd();
            break;
        case 'table':
            console.table(safe[0], safe[1]);
            break;
        case 'trace':
            console.trace(prefix, ...safe);
            break;
        case 'time':
            console.time(String(safe[0]));
            break;
        case 'timeEnd':
            console.timeEnd(String(safe[0]));
            break;
        default:
            console.log(prefix, ...safe);
            break;
    }
}
function _log(method, args) {
    if (!_initialized && _bufferEnabled) {
        _pendingQueue.push({
            method,
            args: _safeArgs(Array.prototype.slice.call(args))
        });
        return;
    }
    _writeLog(method, Array.prototype.slice.call(args));
}
async function _readDevModeFromStorage(key) {
    try {
        var _chrome_storage;
        if (typeof chrome === 'undefined' || !((_chrome_storage = chrome.storage) === null || _chrome_storage === void 0 ? void 0 : _chrome_storage.local)) return false;
        return new Promise((resolve)=>{
            chrome.storage.local.get([
                key
            ], (result)=>{
                if (chrome.runtime.lastError) {
                    resolve(false);
                    return;
                }
                const val = result[key];
                resolve(val === true || val === 'true' || val === 1 || val === '1');
            });
        });
    } catch  {
        return false;
    }
}
function _watchStorageChanges(key) {
    try {
        var _chrome_storage;
        if (typeof chrome === 'undefined' || !((_chrome_storage = chrome.storage) === null || _chrome_storage === void 0 ? void 0 : _chrome_storage.onChanged)) return;
        chrome.storage.onChanged.addListener((changes, areaName)=>{
            if (areaName !== 'local') return;
            if (!changes[key]) return;
            const newVal = changes[key].newValue;
            _devMode = newVal === true || newVal === 'true' || newVal === 1 || newVal === '1';
        });
    } catch  {}
}
const LoggerUtils = {
    /* ── Init ─────────────────────────────────────────────────────── */ async initMuteLogger (storageKey, fallbackDevMode, options) {
        if (_initialized) return LoggerUtils;
        _storageKey = storageKey || 'petDevMode';
        _devMode = !!fallbackDevMode;
        if (options && typeof options.buffer === 'boolean') {
            _bufferEnabled = options.buffer;
        }
        try {
            const storedValue = await _readDevModeFromStorage(_storageKey);
            _devMode = storedValue;
        } catch  {}
        _initialized = true;
        _watchStorageChanges(_storageKey);
        _flushQueue();
        return LoggerUtils;
    },
    /* ── Mode Control ─────────────────────────────────────────────── */ setDevMode (enabled) {
        _devMode = !!enabled;
        if (!_initialized) _initialized = true;
        if (_devMode) _flushQueue();
    },
    isDevMode () {
        return _devMode;
    },
    isInitialized () {
        return _initialized;
    },
    /* ── Log Methods ──────────────────────────────────────────────── */ log () {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        _log('log', arguments);
    },
    info () {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        _log('info', arguments);
    },
    warn () {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        _log('warn', arguments);
    },
    error () {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        _log('error', arguments);
    },
    debug () {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        _log('debug', arguments);
    },
    group () {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        _log('group', arguments);
    },
    groupEnd () {
        _log('groupEnd', []);
    },
    table (data, columns) {
        _log('table', [
            data,
            columns
        ]);
    },
    trace () {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        _log('trace', arguments);
    },
    time (label) {
        _log('time', [
            label
        ]);
    },
    timeEnd (label) {
        _log('timeEnd', [
            label
        ]);
    },
    /* ── Conditional ──────────────────────────────────────────────── */ logIf (condition) {
        for(var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++){
            args[_key - 1] = arguments[_key];
        }
        if (!condition) return;
        _log('log', args);
    },
    assert (condition, message) {
        for(var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++){
            args[_key - 2] = arguments[_key];
        }
        if (condition) return;
        _log('error', [
            '[ASSERT] ' + (message || 'Assertion failed'),
            ...args
        ]);
    },
    /* ── Namespace ────────────────────────────────────────────────── */ createNamespace (namespace) {
        const ns = '[' + String(namespace || '') + ']';
        const self = this;
        return {
            log () {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                self.log(ns, ...args);
            },
            info () {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                self.info(ns, ...args);
            },
            warn () {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                self.warn(ns, ...args);
            },
            error () {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                self.error(ns, ...args);
            },
            debug () {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                self.debug(ns, ...args);
            }
        };
    },
    /* ── Queue ────────────────────────────────────────────────────── */ getPendingCount () {
        return _pendingQueue.length;
    },
    clearPending () {
        _pendingQueue = [];
    },
    /* ── Internal (debug) ─────────────────────────────────────────── */ _shouldLog,
    _safeArgs,
    _flushQueue,
    _writeLog,
    _log
};
/* export default */ const log = ((/* unused pure expression or super */ null && (LoggerUtils)));
// Attach to window when loaded as a plain <script> (CDN context)
if (typeof window !== 'undefined') {
    window.LoggerUtils = LoggerUtils;
}

;// CONCATENATED MODULE: ./public/cdn/utils/api-client.ts
/**
 * YiPetApi — CDN HTTP client (built as IIFE, attaches window.YiPetApi).
 *
 * Provides the same fetch-based API client used internally by the extension,
 * available as a global for MAIN-world scripts and DevTools console usage.
 *
 * Importable as ES module:  import { createApiClient } from '../cdn/api-client';
 * CDN global:              const client = YiPetApi.createClient({ baseUrl: '...' });
 */ // ── Types ──────────────────────────────────────────────────────────────
// ── Factory ────────────────────────────────────────────────────────────
function createApiClient(config) {
    const { baseUrl, timeout = 30000, headers = {}, retry, logger } = config;
    const defaultHeaders = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers
    };
    function resolveUrl(path) {
        const base = baseUrl.replace(/\/+$/, '');
        const p = path.startsWith('/') ? path : '/' + path;
        return base + p;
    }
    async function request(method, path, body, signal) {
        let attempt = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 0;
        const url = resolveUrl(path);
        const controller = new AbortController();
        const timeoutId = setTimeout(()=>controller.abort(), timeout);
        const onAbort = ()=>controller.abort();
        if (signal) signal.addEventListener('abort', onAbort);
        try {
            const init = {
                method,
                headers: defaultHeaders,
                signal: controller.signal
            };
            if (body !== undefined && method !== 'GET') {
                init.body = JSON.stringify(body);
            }
            const response = await fetch(url, init);
            clearTimeout(timeoutId);
            let data;
            const ct = response.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
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
                var _logger_warn;
                result.error = typeof data === 'object' && data !== null ? data.detail || `HTTP ${response.status}` : `HTTP ${response.status}`;
                logger === null || logger === void 0 ? void 0 : (_logger_warn = logger.warn) === null || _logger_warn === void 0 ? void 0 : _logger_warn.call(logger, `API ${method} ${path} → ${response.status}`, result.error);
            }
            return result;
        } catch (err) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                return {
                    ok: false,
                    status: 0,
                    data: null,
                    error: 'Request timed out or was aborted'
                };
            }
            // Retry on network errors
            if (retry && attempt < retry.maxRetries) {
                var _logger_debug;
                logger === null || logger === void 0 ? void 0 : (_logger_debug = logger.debug) === null || _logger_debug === void 0 ? void 0 : _logger_debug.call(logger, `API retry ${attempt + 1}/${retry.maxRetries} for ${method} ${path}`);
                await new Promise((r)=>setTimeout(r, retry.baseMs * (attempt + 1)));
                return request(method, path, body, signal, attempt + 1);
            }
            return {
                ok: false,
                status: 0,
                data: null,
                error: err.message || 'Network error'
            };
        } finally{
            if (signal) signal.removeEventListener('abort', onAbort);
        }
    }
    return {
        get: (path, signal)=>request('GET', path, undefined, signal),
        post: (path, body, signal)=>request('POST', path, body, signal),
        put: (path, body, signal)=>request('PUT', path, body, signal),
        delete: (path, signal)=>request('DELETE', path, undefined, signal),
        url: resolveUrl
    };
}
/* ── Global attachment (for CDN/IIFE build) ────────────────────────── */ const YiPetApi = (/* unused pure expression or super */ null && ({
    createClient: createApiClient
}));
/* export default */ const api_client = ((/* unused pure expression or super */ null && (YiPetApi)));

;// CONCATENATED MODULE: ./public/cdn/utils/index.ts
/**
 * CDN Utilities — single entry point, built as IIFE.
 * Attaches UrlBuilder, LoggerUtils, and YiPetApi to window.
 *
 * All three are bundled into one file at public/cdn/utils/index.js.
 * The CDN catalog references each tool's global name.
 */ 


// Re-export for ES module consumers




// Attach to window for IIFE/CDN <script> tag usage
if (typeof window !== 'undefined') {
    const w = window;
    w.UrlBuilder = utils_url;
    w.LoggerUtils = LoggerUtils;
    w.YiPetApi = {
        createClient: createApiClient
    };
}

YiPetUtils = __webpack_exports__;
})()
;