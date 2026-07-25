/**
 * HTTP Error — API 错误类型与错误处理器
 *
 * 提供结构化的 API 错误类型、错误创建工厂函数和统一错误处理器。
 * 与 core/error.js 的通用错误检测不同，本模块专注于 HTTP/API 层错误。
 *
 * 全局导出:
 *   window.APIError — API 错误类
 *   window.ApiErrorHandler — 错误处理器
 *   window.createError — 创建 APIError 的工厂函数
 *   window.isAPIError — 判断是否为 APIError
 *
 * @module http/error
 * @since 1.0.0
 */

;(function (root) {
  'use strict'

  /* ═══════════════════════════════════════════════════════════════════════════
     APIError Class
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * API 错误类
   *
   * @constructor
   * @param {string} message - 错误消息
   * @param {Object} [options]
   * @param {string} [options.code='UNKNOWN'] - 错误码
   * @param {number} [options.status=0] - HTTP 状态码
   * @param {string} [options.url] - 请求 URL
   * @param {string} [options.method] - HTTP 方法
   * @param {*} [options.responseData] - 响应数据
   * @param {Object} [options.requestBody] - 请求体
   * @param {number} [options.timestamp=Date.now()] - 错误发生时间
   * @param {Error} [options.cause] - 原始错误
   *
   * @example
   *   throw new APIError('未授权', { status: 401, code: 'UNAUTHORIZED' })
   */
  function APIError(message, options) {
    // 支持不带 new 调用
    if (!(this instanceof APIError)) {
      return new APIError(message, options)
    }

    var opts = options || {}

    this.name = 'APIError'
    this.message = String(message || 'Unknown API error')
    this.code = opts.code || 'UNKNOWN'
    this.status = opts.status || 0
    this.url = opts.url || ''
    this.method = (opts.method || 'GET').toUpperCase()
    this.responseData = opts.responseData !== undefined ? opts.responseData : null
    this.requestBody = opts.requestBody !== undefined ? opts.requestBody : null
    this.timestamp = opts.timestamp || Date.now()
    this.cause = opts.cause || null

    // 保留原始堆栈
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError)
    } else {
      this.stack = new Error().stack
    }
  }

  APIError.prototype = Object.create(Error.prototype)
  APIError.prototype.constructor = APIError

  /**
   * 判断是否为客户端错误 (4xx)
   * @returns {boolean}
   */
  APIError.prototype.isClientError = function () {
    return this.status >= 400 && this.status < 500
  }

  /**
   * 判断是否为服务端错误 (5xx)
   * @returns {boolean}
   */
  APIError.prototype.isServerError = function () {
    return this.status >= 500 && this.status < 600
  }

  /**
   * 判断是否为网络错误（无响应）
   * @returns {boolean}
   */
  APIError.prototype.isNetworkError = function () {
    return this.status === 0
  }

  /**
   * 判断是否为超时错误
   * @returns {boolean}
   */
  APIError.prototype.isTimeout = function () {
    return this.code === 'TIMEOUT'
  }

  /**
   * 判断是否为认证错误
   * @returns {boolean}
   */
  APIError.prototype.isAuthError = function () {
    return this.status === 401 || this.status === 403 || this.code === 'UNAUTHORIZED' || this.code === 'FORBIDDEN'
  }

  /**
   * 判断错误是否可重试
   * @returns {boolean}
   */
  APIError.prototype.isRetryable = function () {
    return this.isNetworkError() || this.isTimeout() || this.isServerError()
  }

  /**
   * 序列化为纯 JSON 对象（用于 postMessage 传输）
   * @returns {Object}
   */
  APIError.prototype.toJSON = function () {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      url: this.url,
      method: this.method,
      timestamp: this.timestamp,
      isClientError: this.isClientError(),
      isServerError: this.isServerError(),
      isNetworkError: this.isNetworkError(),
      isTimeout: this.isTimeout(),
      isAuthError: this.isAuthError(),
      isRetryable: this.isRetryable()
    }
  }

  /**
   * 格式化错误为人类可读的字符串
   * @returns {string}
   */
  APIError.prototype.toString = function () {
    var parts = ['[' + this.code + ']']
    if (this.status) parts.push(' HTTP ' + this.status)
    parts.push(' ' + this.message)
    if (this.url) parts.push(' (' + this.method + ' ' + this.url + ')')
    return parts.join('')
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     Error Factory Functions
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * 创建一个 APIError 实例
   * @param {string} message
   * @param {Object} [options]
   * @returns {APIError}
   */
  function createError(message, options) {
    return new APIError(message, options)
  }

  /**
   * 判断一个值是否为 APIError 实例
   * @param {*} value
   * @returns {boolean}
   */
  function isAPIError(value) {
    return value instanceof APIError || (value && value.name === 'APIError')
  }

  /**
   * 从 fetch Response 创建 APIError
   * @param {Response} response
   * @param {string} url
   * @param {string} method
   * @param {*} [responseData]
   * @returns {APIError}
   */
  function fromResponse(response, url, method, responseData) {
    var msg = 'HTTP ' + response.status + ': ' + response.statusText
    if (responseData && responseData.message) {
      msg = responseData.message
    }

    return new APIError(msg, {
      status: response.status,
      code: _statusToCode(response.status),
      url: url,
      method: method,
      responseData: responseData
    })
  }

  /**
   * 从 fetch 异常创建 APIError
   * @param {Error} error
   * @param {string} url
   * @param {string} method
   * @returns {APIError}
   */
  function fromFetchError(error, url, method) {
    var msg = error.message || '网络请求失败'
    var code = 'NETWORK_ERROR'

    if (error.name === 'AbortError') {
      msg = '请求超时或已取消'
      code = 'TIMEOUT'
    } else if (msg.indexOf('Failed to fetch') !== -1) {
      msg = '网络连接失败，请检查网络'
      code = 'NETWORK_ERROR'
    }

    return new APIError(msg, {
      code: code,
      url: url,
      method: method,
      cause: error
    })
  }

  /** HTTP 状态码 → 错误码映射 */
  function _statusToCode(status) {
    var map = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      405: 'METHOD_NOT_ALLOWED',
      408: 'TIMEOUT',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMITED',
      500: 'INTERNAL_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
      504: 'GATEWAY_TIMEOUT'
    }
    return map[status] || 'HTTP_' + status
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     ApiErrorHandler
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * API 错误处理器
   * @namespace ApiErrorHandler
   */
  var ApiErrorHandler = {
    /** @type {Array<Function>} 全局错误回调 */
    _handlers: [],

    /**
     * 注册全局错误处理器
     * @param {Function} handler - (error: APIError) => void
     * @returns {Function} 取消注册的函数
     */
    onError: function (handler) {
      if (typeof handler !== 'function') return function () {}
      this._handlers.push(handler)
      var self = this
      return function () {
        var idx = self._handlers.indexOf(handler)
        if (idx !== -1) self._handlers.splice(idx, 1)
      }
    },

    /**
     * 处理错误（触发所有已注册的处理器）
     * @param {APIError|Error|*} error
     */
    handle: function (error) {
      var apiError = isAPIError(error) ? error : new APIError(
        error && error.message ? error.message : 'Unknown error',
        { cause: error }
      )

      this._handlers.forEach(function (handler) {
        try { handler(apiError) } catch (_) {}
      })

      // 默认控制台输出
      if (apiError.isAuthError()) {
        console.warn('[ApiErrorHandler] 认证错误:', apiError.toString())
      } else if (apiError.isServerError()) {
        console.error('[ApiErrorHandler] 服务端错误:', apiError.toString())
      } else if (apiError.isNetworkError()) {
        console.warn('[ApiErrorHandler] 网络错误:', apiError.toString())
      } else if (apiError.isTimeout()) {
        console.warn('[ApiErrorHandler] 超时:', apiError.toString())
      } else {
        console.error('[ApiErrorHandler]', apiError.toString())
      }
    },

    /**
     * 创建带默认行为的错误处理函数（用于 Promise.catch）
     *
     * @param {Object} [options]
     * @param {*} [options.fallbackValue] - 错误时返回的回退值
     * @param {boolean} [options.rethrow=false] - 是否重新抛出
     * @param {Function} [options.onError] - 额外回调
     * @returns {Function} (error) => fallbackValue | throw error
     *
     * @example
     *   fetch('/api/data')
     *     .then(r => r.json())
     *     .catch(ApiErrorHandler.catchAll({ fallbackValue: [] }))
     */
    catchAll: function (options) {
      var opts = options || {}
      var self = this

      return function (error) {
        self.handle(error)
        if (typeof opts.onError === 'function') {
          try { opts.onError(error) } catch (_) {}
        }
        if (opts.rethrow) throw error
        return opts.fallbackValue
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     Error Codes (参考)
     ═══════════════════════════════════════════════════════════════════════════ */

  /** @enum {string} */
  var ERROR_CODES = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',
    BAD_REQUEST: 'BAD_REQUEST',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
    CONFLICT: 'CONFLICT',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    RATE_LIMITED: 'RATE_LIMITED',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    BAD_GATEWAY: 'BAD_GATEWAY',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    GATEWAY_TIMEOUT: 'GATEWAY_TIMEOUT',
    UNKNOWN: 'UNKNOWN'
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     Global Export
     ═══════════════════════════════════════════════════════════════════════════ */

  root.APIError = APIError
  root.ApiErrorHandler = ApiErrorHandler
  root.createError = createError
  root.isAPIError = isAPIError
  root.fromResponse = fromResponse
  root.fromFetchError = fromFetchError
  root.ERROR_CODES = ERROR_CODES
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : window)
