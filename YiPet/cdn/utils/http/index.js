/**
 * HTTP 运行时依赖加载器
 * ----------------------------------------------------------------------
 * 确保 RequestClient → Logger → TokenManager → ApiErrorHandler
 * 按正确顺序注入全局命名空间，供 apiManager.js 和业务 Service 使用。
 *
 * 加载顺序：
 *   1. request.js  → RequestClient
 *   2. logger.js   → Logger
 *   3. token.js    → TokenManager
 *   4. error.js    → ApiErrorHandler / APIError / NetworkError ...
 *
 * 每个模块都自包含（IIFE），此文件仅负责依赖声明和顺序保证。
 * ---------------------------------------------------------------------- */
;(function (root) {
  'use strict';

  /* ---- 1. RequestClient ---- */
  if (typeof root.RequestClient === 'undefined') {
    console.error('[YiPet:http] RequestClient 未加载，请确认 cdn/utils/http/request.js 已引入')
  }

  /* ---- 2. Logger ---- */
  if (typeof root.Logger === 'undefined') {
    console.warn('[YiPet:http] Logger 未加载，ApiManager 将使用 console 降级')
  }

  /* ---- 3. TokenManager ---- */
  if (typeof root.TokenManager === 'undefined') {
    console.warn('[YiPet:http] TokenManager 未加载，ApiManager 将跳过 Token 注入')
  }

  /* ---- 4. ApiErrorHandler ---- */
  if (typeof root.ApiErrorHandler === 'undefined') {
    console.warn('[YiPet:http] ApiErrorHandler 未加载，ApiManager 将使用基础错误处理')
  }

  /* ---- 依赖可用性检测 ---- */
  root.__YiPet_HTTP_Deps__ = {
    requestClient: typeof root.RequestClient !== 'undefined',
    logger:        typeof root.Logger !== 'undefined',
    tokenManager:  typeof root.TokenManager !== 'undefined',
    errorHandler:  typeof root.ApiErrorHandler !== 'undefined',
    allReady: function () {
      return this.requestClient && this.logger && this.tokenManager && this.errorHandler
    }
  }

  /* ---- 轻量级降级 Logger（当 Logger 类不可用时） ---- */
  if (!root.__YiPet_HTTP_Deps__.logger) {
    root.Logger = (function () {
      var levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, NONE: 4 }
      function FallbackLogger(opts) {
        var o = opts || {}
        this.level  = o.level !== undefined ? o.level : levels.INFO
        this.prefix = o.prefix || '[API]'
        this.enabled = o.enabled !== false
      }
      FallbackLogger.prototype._log = function (lv, name, args) {
        if (!this.enabled || lv < this.level) return
        var prefix = '[' + new Date().toISOString() + ']' + this.prefix + '[' + name + ']'
        var fn = name === 'ERROR' ? console.error : name === 'WARN' ? console.warn : console.log
        fn.apply(console, [prefix].concat(Array.prototype.slice.call(args)))
      }
      FallbackLogger.prototype.debug = function () { this._log(0, 'DEBUG', arguments) }
      FallbackLogger.prototype.info  = function () { this._log(1, 'INFO',  arguments) }
      FallbackLogger.prototype.warn  = function () { this._log(2, 'WARN',  arguments) }
      FallbackLogger.prototype.error = function () { this._log(3, 'ERROR', arguments) }
      FallbackLogger.prototype.logRequest  = function () {}
      FallbackLogger.prototype.logResponse = function () {}
      FallbackLogger.prototype.logError    = function () {}
      FallbackLogger.prototype.setLevel    = function (lv) { this.level = lv }
      FallbackLogger.prototype.getLevel    = function () { return this.level }
      FallbackLogger.prototype.enable      = function () { this.enabled = true }
      FallbackLogger.prototype.disable     = function () { this.enabled = false }
      root.Logger = FallbackLogger
      return FallbackLogger
    })()
  }

  /* ---- 轻量级降级 TokenManager ---- */
  if (!root.__YiPet_HTTP_Deps__.tokenManager) {
    root.TokenManager = (function () {
      function FallbackTokenManager() {
        this._token = ''
      }
      FallbackTokenManager.prototype.getToken     = function () { return Promise.resolve(this._token) }
      FallbackTokenManager.prototype.getTokenSync = function () { return this._token }
      FallbackTokenManager.prototype.hasToken     = function () { return Promise.resolve(!!this._token) }
      FallbackTokenManager.prototype.hasTokenSync = function () { return !!this._token }
      FallbackTokenManager.prototype.saveToken    = function (t) { this._token = String(t || ''); return Promise.resolve(true) }
      FallbackTokenManager.prototype.clearToken   = function () { this._token = ''; return Promise.resolve(true) }
      root.TokenManager = FallbackTokenManager
      return FallbackTokenManager
    })()
  }

  /* ---- 轻量级降级 ApiErrorHandler ---- */
  if (!root.__YiPet_HTTP_Deps__.errorHandler) {
    root.ApiErrorHandler = (function () {
      function FallbackErrorHandler() {}
      FallbackErrorHandler.prototype.handle   = function (e) { return Promise.resolve(e) }
      FallbackErrorHandler.prototype.categorize = function (e) { return e }
      root.ApiErrorHandler = FallbackErrorHandler
      return FallbackErrorHandler
    })()
  }

  /* ---- 降级 RequestClient ---- */
  if (!root.__YiPet_HTTP_Deps__.requestClient) {
    root.RequestClient = (function () {
      function FallbackRequestClient(opts) {
        var o = opts || {}
        this.timeout = o.timeout || 30000
        this.baseUrl = o.baseUrl || ''
      }
      FallbackRequestClient.prototype.request = function (opts) {
        var self = this
        var url = (opts && opts.url) || ''
        var method = (opts && opts.method) || 'GET'
        var data = (opts && opts.data) || null
        var controller = new AbortController()
        var timer = setTimeout(function () { controller.abort() }, self.timeout)
        var init = { method: method, signal: controller.signal, headers: { 'Content-Type': 'application/json' } }
        if (data && method !== 'GET') init.body = JSON.stringify(data)
        return fetch(url, init).then(function (r) {
          clearTimeout(timer)
          if (!r.ok) throw new Error('HTTP ' + r.status)
          var ct = r.headers.get('content-type')
          return ct && ct.indexOf('application/json') !== -1 ? r.json() : r.text()
        }).catch(function (e) {
          clearTimeout(timer)
          throw e
        })
      }
      FallbackRequestClient.prototype.get    = function (url, params, opts) { return this.request(Object.assign({ url: url, method: 'GET',  params: params }, opts)) }
      FallbackRequestClient.prototype.post   = function (url, data,   opts) { return this.request(Object.assign({ url: url, method: 'POST', data: data   }, opts)) }
      FallbackRequestClient.prototype.put    = function (url, data,   opts) { return this.request(Object.assign({ url: url, method: 'PUT',  data: data   }, opts)) }
      FallbackRequestClient.prototype.delete = function (url, opts)         { return this.request(Object.assign({ url: url, method: 'DELETE' }, opts)) }
      FallbackRequestClient.prototype.abort  = function () {}
      FallbackRequestClient.prototype.destroy = function () {}
      root.RequestClient = FallbackRequestClient
      return FallbackRequestClient
    })()
  }

  console.log('[YiPet:http] 运行时依赖就绪 ' +
    '(RequestClient=' + root.__YiPet_HTTP_Deps__.requestClient +
    ', Logger=' + root.__YiPet_HTTP_Deps__.logger +
    ', TokenManager=' + root.__YiPet_HTTP_Deps__.tokenManager +
    ', ErrorHandler=' + root.__YiPet_HTTP_Deps__.errorHandler + ')'
  )
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : window)
