/**
 *
 * 为什么单独开一个文件：
 *   error.js 既要被 YiPet 的 MV3 background service worker 以 `importScripts()` 加载
 *   （classic script，禁止顶层 `export`），又要被 YiWeb 的 Vite 以 ESM `import` 加载
 *   （必须有顶层 `export`）。一个文件无法同时满足两种语法约束，因此把 ESM 具名导出
 *   拆到本文件，error.js 保持纯 classic。
 *
 * 加载顺序：先 side-effect 引入 error.js（把 `ErrorHandler` 挂到 `self` / `globalThis`），
 *   再从全局取出引用并重新导出。
 */
import './error.js'

const _resolveErrorHandler = () => {
  if (typeof self !== 'undefined' && self.ErrorHandler) return self.ErrorHandler
  if (typeof globalThis !== 'undefined' && globalThis.ErrorHandler) return globalThis.ErrorHandler
  if (typeof window !== 'undefined' && window.ErrorHandler) return window.ErrorHandler
  return null
}

export const ErrorCodes = {
  REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
  AUTH_401: 'AUTH_401',
  NETWORK_FETCH_FAILED: 'NETWORK_FETCH_FAILED',
  CORS_BLOCKED: 'CORS_BLOCKED',
  HTTP_ERROR: 'HTTP_ERROR',
  STREAM_API_ERROR: 'STREAM_API_ERROR',
  UNKNOWN: 'UNKNOWN'
}

export const ErrorTypes = {
  API: 'API',
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  UNKNOWN: 'UNKNOWN'
}

export function createError (message, type = ErrorTypes.UNKNOWN, context = '', code = ErrorCodes.UNKNOWN) {
  const err = new Error(message)
  err.code = code
  err.type = type
  err.context = context
  return err
}

export const safeExecute = (fn, options) => {
  const h = _resolveErrorHandler()
  if (!h) return Promise.reject(new Error('ErrorHandler not loaded'))
  return h.safeExecute(fn, options)
}

export const safeExecuteAsync = (fn, options) => safeExecute(fn, options)

/**
 * 成功提示兜底。YiWeb 多处 composables 通过 `import { showSuccessMessage }` 引用，
 * 但仓内从未定义过真实实现 —— 这里提供一个安全兜底：
 *  1. 若运行环境已挂载同名函数（如 YiPet 注入），委托给它；
 *  2. 否则用 console.info 落盘，避免 bare 调用抛 `is not a function`。
 */
export function showSuccessMessage (message) {
  try {
    if (typeof globalThis !== 'undefined') {
      if (typeof globalThis.showSuccessMessage === 'function') return globalThis.showSuccessMessage(message)
      if (typeof globalThis.showNotification === 'function') return globalThis.showNotification(message, 'success')
    }
  } catch (_) { /* swallow */ }
  try { if (typeof console !== 'undefined' && console.info) console.info(`[success] ${message}`) } catch (_) { /* swallow */ }
}

export function setupBrowserExtensionErrorFilter (contextName = 'app', verbose = false) {
  if (typeof window === 'undefined' || !window.addEventListener) return
  window.addEventListener('error', (event) => {
    const msg = event && event.message ? String(event.message) : ''
    if (/extension|chrome-extension|moz-extension/i.test(msg) || /chrome-extension:|moz-extension:/.test(event && event.filename ? event.filename : '')) {
      if (verbose && console && console.warn) console.warn(`[${contextName}] ignored browser-extension error:`, msg)
      if (typeof event.preventDefault === 'function') event.preventDefault()
    }
  })
  window.addEventListener('unhandledrejection', (event) => {
    const r = event && event.reason ? (event.reason.message || String(event.reason)) : ''
    if (/extension|chrome-extension|moz-extension/i.test(r)) {
      if (verbose && console && console.warn) console.warn(`[${contextName}] ignored browser-extension rejection:`, r)
      if (typeof event.preventDefault === 'function') event.preventDefault()
    }
  })
}

export default _resolveErrorHandler()
