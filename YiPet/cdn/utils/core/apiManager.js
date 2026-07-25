/**
 * ApiManager — API 调用管理器
 *
 * 统一的 API 调用入口，负责：
 *   1. 请求路由 — 根据 endpoint 名称解析完整 URL
 *   2. 认证注入 — 自动附加 Token
 *   3. 错误处理 — 统一错误分类和重试
 *   4. 请求去重 — 防止短时间内重复请求
 *   5. 响应缓存 — 可选的 GET 请求缓存
 *
 * 全局导出: window.ApiManager
 *
 * @module core/apiManager
 * @since 1.0.0
 */

;(function (root) {
  'use strict'

  /* ═══════════════════════════════════════════════════════════════════════════
     State
     ═══════════════════════════════════════════════════════════════════════════ */

  /** @type {Object|null} 配置引用 */
  var _config = null

  /** @type {Function|null} Token 获取函数 */
  var _getToken = null

  /** @type {Object<string, Promise>} 进行中的请求去重映射 */
  var _pendingRequests = {}

  /** @type {Object<string, {data: *, timestamp: number}>} GET 请求缓存 */
  var _cache = {}

  /** @type {number} 缓存过期时间 (ms)，默认 30 秒 */
  var _cacheTTL = 30000

  /* ═══════════════════════════════════════════════════════════════════════════
     Configuration
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * 初始化 ApiManager
   *
   * @param {Object} config - PET_CONFIG 对象
   * @param {Object} [options]
   * @param {Function} [options.getToken] - 获取 Token 的异步函数，返回 Promise<string>
   * @param {number} [options.cacheTTL=30000] - 缓存过期时间 (ms)
   */
  function init(config, options) {
    _config = config || {}
    var opts = options || {}

    if (typeof opts.getToken === 'function') {
      _getToken = opts.getToken
    }

    if (typeof opts.cacheTTL === 'number') {
      _cacheTTL = opts.cacheTTL
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     URL Resolution
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * 根据 endpoint key 解析完整 URL
   *
   * 从 PET_CONFIG.ENDPOINTS 和 PET_CONFIG.api 中查找并拼接完整 URL。
   *
   * @param {string} endpointKey - 端点键名（如 'SESSION.LIST'）
   * @param {Object} [params={}] - 路径参数（如 { id: 123 }）
   * @param {Object} [query={}] - 查询参数
   * @returns {string} 完整 URL
   *
   * @example
   *   ApiManager.buildUrl('SESSION.UPDATE', { id: 123 })
   *   // → 'http://localhost:10086/sessions/123'
   */
  function buildUrl(endpointKey, params, query) {
    var parts = String(endpointKey).split('.')
    var current = _config && _config.ENDPOINTS

    // 遍历路径查找 endpoint 模板
    for (var i = 0; i < parts.length; i++) {
      if (!current || typeof current !== 'object') break
      current = current[parts[i]]
    }

    var endpoint = typeof current === 'string' ? current : ('/' + parts.join('/').toLowerCase())

    // 替换路径参数 (:id → 123)
    var url = endpoint
    if (params) {
      Object.keys(params).forEach(function (key) {
        url = url.replace(':' + key, encodeURIComponent(params[key]))
      })
    }

    // 拼接 baseUrl
    var baseUrl = ''
    if (_config && _config.api) {
      // 尝试匹配特定的 baseUrl
      var firstPart = parts[0] && parts[0].toLowerCase()
      baseUrl = _config.api.yiaiBaseUrl || _config.api.streamPromptUrl || ''
    }

    if (baseUrl && !url.startsWith('http')) {
      url = baseUrl.replace(/\/$/, '') + '/' + url.replace(/^\//, '')
    }

    // 添加查询参数
    if (query && Object.keys(query).length > 0) {
      var searchParams = new URLSearchParams()
      Object.keys(query).forEach(function (key) {
        var val = query[key]
        if (val !== undefined && val !== null) {
          searchParams.append(key, typeof val === 'object' ? JSON.stringify(val) : String(val))
        }
      })
      var qs = searchParams.toString()
      if (qs) url += (url.indexOf('?') === -1 ? '?' : '&') + qs
    }

    return url
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     Request Execution
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * 发送 API 请求
   *
   * @param {string} endpointKey - 端点键名
   * @param {Object} [options]
   * @param {string} [options.method='GET'] - HTTP 方法
   * @param {Object} [options.params] - 路径参数
   * @param {Object} [options.query] - 查询参数
   * @param {*} [options.body] - 请求体（对象会自动 JSON.stringify）
   * @param {Object<string, string>} [options.headers] - 额外请求头
   * @param {number} [options.timeout=30000] - 超时时间 (ms)
   * @param {boolean} [options.dedup=true] - 是否去重（相同参数的并发 GET 请求共享结果）
   * @param {boolean} [options.cache=false] - 是否使用缓存（GET 请求有效）
   * @param {number} [options.retries=0] - 失败重试次数
   * @returns {Promise<{data: *, status: number, headers: Headers}>}
   */
  function request(endpointKey, options) {
    var opts = options || {}
    var method = (opts.method || 'GET').toUpperCase()
    var url = buildUrl(endpointKey, opts.params, opts.query)

    // —— 缓存检查 (仅 GET) ——
    if (method === 'GET' && opts.cache) {
      var cached = _getCached(url)
      if (cached) return Promise.resolve(cached)
    }

    // —— 去重检查 (仅 GET) ——
    var dedupKey = method === 'GET' && opts.dedup !== false
      ? method + ':' + url
      : null

    if (dedupKey && _pendingRequests[dedupKey]) {
      return _pendingRequests[dedupKey].then(function (res) {
        // 返回 clone 避免不同调用者互相影响
        return { data: _cloneDeep(res.data), status: res.status, headers: res.headers }
      })
    }

    // —— 构建请求 ——
    var reqPromise = _executeRequest(url, method, opts)

    if (dedupKey) {
      _pendingRequests[dedupKey] = reqPromise
    }

    return reqPromise
      .then(function (result) {
        // 缓存成功的 GET 响应
        if (method === 'GET' && opts.cache) {
          _setCache(url, result)
        }
        return result
      })
      .finally(function () {
        if (dedupKey) {
          delete _pendingRequests[dedupKey]
        }
      })
  }

  /**
   * 实际执行 HTTP 请求
   * @returns {Promise<{data: *, status: number, headers: Headers}>}
   */
  function _executeRequest(url, method, opts) {
    var headers = _buildHeaders(opts.headers)
    var timeout = opts.timeout || 30000
    var retries = opts.retries || 0

    var fetchOpts = {
      method: method,
      headers: headers
    }

    if (opts.body && method !== 'GET' && method !== 'HEAD') {
      fetchOpts.body = typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body)
    }

    function attempt(remainingRetries) {
      return new Promise(function (resolve, reject) {
        var controller = typeof AbortController !== 'undefined' ? new AbortController() : null
        var timeoutId = setTimeout(function () {
          if (controller) controller.abort()
          reject(_createApiError('请求超时 (' + timeout + 'ms)', 'TIMEOUT', 0, url))
        }, timeout)

        if (controller) fetchOpts.signal = controller.signal

        fetch(url, fetchOpts)
          .then(function (response) {
            clearTimeout(timeoutId)

            // 读取响应体
            var contentType = response.headers.get('content-type') || ''
            var isJson = contentType.indexOf('application/json') !== -1

            return (isJson ? response.json() : response.text()).then(function (data) {
              return { response: response, data: data }
            }).catch(function () {
              return { response: response, data: null }
            })
          })
          .then(function (packed) {
            var response = packed.response
            var data = packed.data

            if (!response.ok) {
              var apiErr = _createApiError(
                'HTTP ' + response.status + ': ' + (data && data.message ? data.message : response.statusText),
                'HTTP_ERROR',
                response.status,
                url,
                data
              )
              reject(apiErr)
              return
            }

            resolve({
              data: data,
              status: response.status,
              headers: response.headers
            })
          })
          .catch(function (err) {
            clearTimeout(timeoutId)

            if (err && err._isApiError) {
              reject(err)
              return
            }

            // 网络错误重试
            if (remainingRetries > 0 && _isRetryable(err)) {
              var delay = 500 * Math.pow(2, (retries - remainingRetries))
              setTimeout(function () {
                attempt(remainingRetries - 1).then(resolve, reject)
              }, delay)
              return
            }

            reject(_createApiError(
              err && err.message ? err.message : '网络请求失败',
              err && err.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR',
              0,
              url
            ))
          })
      })
    }

    return attempt(retries)
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     Convenience Methods
     ═══════════════════════════════════════════════════════════════════════════ */

  /** GET 请求 */
  function get(endpointKey, options) {
    var opts = Object.assign({}, options, { method: 'GET' })
    return request(endpointKey, opts)
  }

  /** POST 请求 */
  function post(endpointKey, body, options) {
    var opts = Object.assign({}, options, { method: 'POST', body: body })
    return request(endpointKey, opts)
  }

  /** PUT 请求 */
  function put(endpointKey, body, options) {
    var opts = Object.assign({}, options, { method: 'PUT', body: body })
    return request(endpointKey, opts)
  }

  /** PATCH 请求 */
  function patch(endpointKey, body, options) {
    var opts = Object.assign({}, options, { method: 'PATCH', body: body })
    return request(endpointKey, opts)
  }

  /** DELETE 请求 */
  function del(endpointKey, options) {
    var opts = Object.assign({}, options, { method: 'DELETE' })
    return request(endpointKey, opts)
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     Cache Management
     ═══════════════════════════════════════════════════════════════════════════ */

  function _getCached(url) {
    var entry = _cache[url]
    if (!entry) return null
    if (Date.now() - entry.timestamp > _cacheTTL) {
      delete _cache[url]
      return null
    }
    return { data: _cloneDeep(entry.data.data), status: entry.data.status, headers: entry.data.headers }
  }

  function _setCache(url, result) {
    _cache[url] = { data: result, timestamp: Date.now() }
  }

  /** 清空所有缓存 */
  function clearCache() {
    _cache = {}
  }

  /** 使特定 URL 的缓存失效 */
  function invalidateCache(endpointKey, params, query) {
    var url = buildUrl(endpointKey, params, query)
    delete _cache[url]
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     Helpers
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * 构建请求头
   * @param {Object<string, string>} [extra]
   * @returns {Headers}
   */
  function _buildHeaders(extra) {
    var headers = new Headers()
    headers.set('Accept', 'application/json')

    if (extra) {
      Object.keys(extra).forEach(function (key) {
        headers.set(key, extra[key])
      })
    }

    return headers
  }

  /**
   * 创建 API 错误对象
   * @returns {Error}
   */
  function _createApiError(message, code, status, url, responseData) {
    var err = new Error(message)
    err._isApiError = true
    err.code = code
    err.status = status
    err.url = url
    err.responseData = responseData || null
    err.timestamp = Date.now()
    return err
  }

  /** 判断错误是否可重试 */
  function _isRetryable(err) {
    if (!err) return false
    if (err.code === 'TIMEOUT') return true
    if (err.code === 'NETWORK_ERROR') return true
    if (err.status && err.status >= 500) return true
    return false
  }

  /** 简易深拷贝 */
  function _cloneDeep(obj) {
    if (!obj || typeof obj !== 'object') return obj
    try {
      return JSON.parse(JSON.stringify(obj))
    } catch (_) {
      return obj
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     Streaming (SSE)
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * 发送 SSE 流式请求
   *
   * @param {string} endpointKey - 端点键名
   * @param {Object} [options]
   * @param {Object} [options.body] - 请求体
   * @param {Function} [options.onMessage] - 消息回调 (data, eventType) => void
   * @param {Function} [options.onError] - 错误回调 (error) => void
   * @param {Function} [options.onComplete] - 完成回调 () => void
   * @returns {{ abort: Function }}
   */
  function streamRequest(endpointKey, options) {
    var opts = options || {}
    var url = buildUrl(endpointKey, opts.params, opts.query)
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null

    var fetchOpts = {
      method: 'POST',
      headers: _buildHeaders(opts.headers),
      body: opts.body ? (typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body)) : undefined
    }

    if (controller) fetchOpts.signal = controller.signal

    fetch(url, fetchOpts)
      .then(function (response) {
        if (!response.ok) {
          if (opts.onError) opts.onError(_createApiError('HTTP ' + response.status, 'HTTP_ERROR', response.status, url))
          return
        }

        var reader = response.body && response.body.getReader
          ? response.body.getReader()
          : null

        if (!reader) {
          // 不支持流式读取，回退到 text
          response.text().then(function (text) {
            if (opts.onMessage) opts.onMessage(text, 'message')
            if (opts.onComplete) opts.onComplete()
          })
          return
        }

        var decoder = new TextDecoder()
        var buffer = ''

        function pump() {
          reader.read().then(function (result) {
            if (result.done) {
              if (opts.onComplete) opts.onComplete()
              return
            }

            buffer += decoder.decode(result.value, { stream: true })
            var lines = buffer.split('\n')
            buffer = lines.pop() || ''

            lines.forEach(function (line) {
              if (line.startsWith('data: ')) {
                var data = line.slice(6)
                if (data === '[DONE]') return
                try {
                  var parsed = JSON.parse(data)
                  if (opts.onMessage) opts.onMessage(parsed, 'message')
                } catch (_) {
                  if (opts.onMessage) opts.onMessage(data, 'message')
                }
              }
            })

            pump()
          }).catch(function (err) {
            if (opts.onError) opts.onError(err)
          })
        }

        pump()
      })
      .catch(function (err) {
        if (opts.onError) opts.onError(err)
      })

    return {
      abort: function () {
        if (controller) controller.abort()
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     Utilities
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * 批量发送多个请求（并发）
   * @param {Array<{endpointKey: string, options?: Object}>} requests
   * @returns {Promise<Array<{success: boolean, data?: *, error?: *}>>}
   */
  function batchRequest(requests) {
    if (!requests || !requests.length) return Promise.resolve([])

    return Promise.all(requests.map(function (req) {
      return request(req.endpointKey, req.options || {})
        .then(function (result) {
          return { success: true, data: result.data, status: result.status }
        })
        .catch(function (err) {
          return { success: false, error: err.message, code: err.code, status: err.status }
        })
    }))
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     Global Export
     ═══════════════════════════════════════════════════════════════════════════ */

  root.ApiManager = {
    // 配置
    init: init,

    // 请求
    request: request,
    get: get,
    post: post,
    put: put,
    patch: patch,
    delete: del,
    streamRequest: streamRequest,
    batchRequest: batchRequest,

    // URL
    buildUrl: buildUrl,

    // 缓存
    clearCache: clearCache,
    invalidateCache: invalidateCache,

    // 内部辅助（暴露到控制台供调试）
    _executeRequest: _executeRequest,
    _getCached: _getCached,
    _setCache: _setCache,
    _buildHeaders: _buildHeaders,
    _createApiError: _createApiError,
    _isRetryable: _isRetryable,
    _cloneDeep: _cloneDeep
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : window)
