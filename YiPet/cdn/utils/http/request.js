/**
 * RequestClient — HTTP 请求客户端
 *
 * 基于 fetch API 的 HTTP 客户端，提供：
 *   1. 请求/响应拦截器链
 *   2. 自动 Token 注入
 *   3. 请求超时控制
 *   4. 自动重试（含退避策略）
 *   5. 并发请求去重
 *   6. 请求取消（AbortController）
 *   7. 流式请求（SSE / Stream）
 *   8. 文件上传（含进度回调）
 *
 * 全局导出:
 *   window.RequestClient — 请求客户端类
 *   window.requestClient — 全局单例
 *
 * @module http/request
 * @since 1.0.0
 */

;(function (root) {
  'use strict'

  /* ═══════════════════════════════════════════════════════════════════════════
     Helpers
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * 判断是否为纯对象
   * @param {*} val
   * @returns {boolean}
   */
  function _isPlainObject(val) {
    return val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date) && !(val instanceof RegExp)
  }

  /**
   * 深度合并
   */
  function _deepMerge(target, source) {
    if (!_isPlainObject(source)) return source === undefined ? target : source
    if (!_isPlainObject(target)) target = {}
    var result = {}
    Object.keys(target).forEach(function (k) { result[k] = target[k] })
    Object.keys(source).forEach(function (k) {
      result[k] = _isPlainObject(source[k]) && _isPlainObject(target[k])
        ? _deepMerge(target[k], source[k])
        : source[k]
    })
    return result
  }

  /**
   * 构建 URL 查询字符串
   * @param {Object} params
   * @returns {string}
   */
  function _buildQuery(params) {
    if (!params || !Object.keys(params).length) return ''
    var parts = []
    Object.keys(params).forEach(function (key) {
      var val = params[key]
      if (val === undefined || val === null) return
      if (Array.isArray(val)) {
        val.forEach(function (v) {
          parts.push(encodeURIComponent(key) + '[]=' + encodeURIComponent(v))
        })
      } else if (typeof val === 'object') {
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(JSON.stringify(val)))
      } else {
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(val)))
      }
    })
    return parts.length ? '?' + parts.join('&') : ''
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     RequestClient Class
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * HTTP 请求客户端
   *
   * @constructor
   * @param {Object} [config]
   * @param {string} [config.baseURL=''] - 基础 URL
   * @param {number} [config.timeout=30000] - 默认超时 (ms)
   * @param {Object<string, string>} [config.headers] - 默认请求头
   * @param {number} [config.retries=0] - 默认重试次数
   * @param {number} [config.retryDelay=500] - 重试基础延迟 (ms)
   * @param {Function} [config.getToken] - 获取 Token 的异步函数
   *
   * @example
   *   var client = new RequestClient({ baseURL: 'http://localhost:10086' })
   *   client.get('/api/sessions').then(data => console.log(data))
   */
  function RequestClient(config) {
    var cfg = config || {}

    /** @type {string} */
    this.baseURL = cfg.baseURL || ''
    /** @type {number} */
    this.timeout = cfg.timeout || 30000
    /** @type {Object<string, string>} */
    this.defaultHeaders = Object.assign({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }, cfg.headers || {})
    /** @type {number} */
    this.retries = cfg.retries || 0
    /** @type {number} */
    this.retryDelay = cfg.retryDelay || 500
    /** @type {Function|null} */
    this._getToken = cfg.getToken || null

    /** @type {Array<Function>} 请求拦截器 */
    this.requestInterceptors = []
    /** @type {Array<Function>} 响应拦截器 */
    this.responseInterceptors = []
    /** @type {Array<Function>} 错误拦截器 */
    this.errorInterceptors = []

    /** @type {Object<string, Promise>} 去重映射 */
    this._pendingDedup = {}
  }

  /* ── Interceptors ─────────────────────────────────────────────────────────── */

  /**
   * 添加请求拦截器
   * @param {Function} fn - (config) => config | Promise<config>
   * @returns {Function} 移除拦截器的函数
   */
  RequestClient.prototype.onRequest = function (fn) {
    this.requestInterceptors.push(fn)
    var self = this
    return function () {
      var idx = self.requestInterceptors.indexOf(fn)
      if (idx !== -1) self.requestInterceptors.splice(idx, 1)
    }
  }

  /**
   * 添加响应拦截器
   * @param {Function} fn - (response) => response | Promise<response>
   * @returns {Function}
   */
  RequestClient.prototype.onResponse = function (fn) {
    this.responseInterceptors.push(fn)
    var self = this
    return function () {
      var idx = self.responseInterceptors.indexOf(fn)
      if (idx !== -1) self.responseInterceptors.splice(idx, 1)
    }
  }

  /**
   * 添加错误拦截器
   * @param {Function} fn - (error) => error | Promise<error>
   * @returns {Function}
   */
  RequestClient.prototype.onError = function (fn) {
    this.errorInterceptors.push(fn)
    var self = this
    return function () {
      var idx = self.errorInterceptors.indexOf(fn)
      if (idx !== -1) self.errorInterceptors.splice(idx, 1)
    }
  }

  /* ── Convenience Methods ──────────────────────────────────────────────────── */

  /** GET 请求 */
  RequestClient.prototype.get = function (url, config) {
    return this.request(url, Object.assign({}, config, { method: 'GET' }))
  }

  /** POST 请求 */
  RequestClient.prototype.post = function (url, data, config) {
    return this.request(url, Object.assign({}, config, { method: 'POST', body: data }))
  }

  /** PUT 请求 */
  RequestClient.prototype.put = function (url, data, config) {
    return this.request(url, Object.assign({}, config, { method: 'PUT', body: data }))
  }

  /** PATCH 请求 */
  RequestClient.prototype.patch = function (url, data, config) {
    return this.request(url, Object.assign({}, config, { method: 'PATCH', body: data }))
  }

  /** DELETE 请求 */
  RequestClient.prototype.delete = function (url, config) {
    return this.request(url, Object.assign({}, config, { method: 'DELETE' }))
  }

  /* ── Core Request ─────────────────────────────────────────────────────────── */

  /**
   * 发送 HTTP 请求
   *
   * @param {string} url - 请求路径（相对于 baseURL）或完整 URL
   * @param {Object} [config]
   * @param {string} [config.method='GET'] - HTTP 方法
   * @param {Object<string, string>} [config.headers] - 额外请求头
   * @param {*} [config.body] - 请求体
   * @param {Object} [config.params] - URL 查询参数
   * @param {number} [config.timeout] - 超时 (ms)，覆盖默认值
   * @param {number} [config.retries] - 重试次数，覆盖默认值
   * @param {number} [config.retryDelay] - 重试基础延迟
   * @param {Function} [config.onProgress] - 上传进度回调 (percent: number) => void
   * @param {AbortSignal} [config.signal] - 外部 AbortSignal
   * @param {boolean} [config.dedup=false] - 是否去重相同 GET 请求
   * @returns {Promise<*>} 响应数据（已自动解析 JSON）
   */
  RequestClient.prototype.request = function (url, config) {
    var self = this
    var cfg = _buildConfig(self, url, config || {})

    // —— 去重 ——
    if (cfg.dedup && cfg.method === 'GET') {
      var dedupKey = 'GET:' + cfg.url
      if (self._pendingDedup[dedupKey]) {
        return self._pendingDedup[dedupKey]
      }
      var dedupPromise = self._doRequest(cfg)
      self._pendingDedup[dedupKey] = dedupPromise
      return dedupPromise.finally(function () {
        delete self._pendingDedup[dedupKey]
      })
    }

    return self._doRequest(cfg)
  }

  /**
   * 流式请求（SSE）
   *
   * @param {string} url
   * @param {Object} [config]
   * @param {Object} [config.body] - 请求体
   * @param {Function} [config.onMessage] - 消息回调 (data, eventType) => void
   * @param {Function} [config.onComplete] - 完成回调
   * @param {Function} [config.onError] - 错误回调 (error) => void
   * @returns {{ abort: Function }}
   */
  RequestClient.prototype.stream = function (url, config) {
    var self = this
    var cfg = _buildConfig(self, url, config || {})
    cfg.method = 'POST'

    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null

    var fetchOpts = {
      method: cfg.method,
      headers: cfg.headers
    }

    if (cfg.body) {
      fetchOpts.body = typeof cfg.body === 'string' ? cfg.body : JSON.stringify(cfg.body)
    }

    if (controller) {
      fetchOpts.signal = controller.signal
      if (cfg.signal) {
        cfg.signal.addEventListener('abort', function () { controller.abort() })
      }
    }

    this._runRequestInterceptors(fetchOpts).then(function (finalOpts) {
      fetch(cfg.url, finalOpts).then(function (response) {
        if (!response.ok) {
          if (cfg.onError) {
            var err = new Error('HTTP ' + response.status)
            err.status = response.status
            cfg.onError(err)
          }
          return
        }

        var reader = response.body && response.body.getReader
          ? response.body.getReader()
          : null

        if (!reader) {
          response.text().then(function (text) {
            if (cfg.onMessage) cfg.onMessage(text, 'message')
            if (cfg.onComplete) cfg.onComplete()
          })
          return
        }

        var decoder = new TextDecoder()
        var buffer = ''

        function pump() {
          reader.read().then(function (result) {
            if (result.done) {
              if (cfg.onComplete) cfg.onComplete()
              return
            }

            buffer += decoder.decode(result.value, { stream: true })
            var lines = buffer.split('\n')
            buffer = lines.pop() || ''

            lines.forEach(function (line) {
              if (line.startsWith('data: ')) {
                var raw = line.slice(6)
                if (raw === '[DONE]') return
                try {
                  var parsed = JSON.parse(raw)
                  if (cfg.onMessage) cfg.onMessage(parsed, 'message')
                } catch (_) {
                  if (cfg.onMessage) cfg.onMessage(raw, 'message')
                }
              } else if (line.startsWith('event: ') && cfg.onMessage) {
                cfg.onMessage(null, line.slice(7))
              }
            })

            pump()
          }).catch(function (err) {
            if (cfg.onError) cfg.onError(err)
          })
        }

        pump()
      }).catch(function (err) {
        if (cfg.onError) cfg.onError(err)
      })
    })

    return {
      abort: function () {
        if (controller) controller.abort()
      }
    }
  }

  /**
   * 文件上传
   *
   * @param {string} url
   * @param {File|Blob|FormData} file - 文件对象或 FormData
   * @param {Object} [config]
   * @param {Object} [config.extraFields] - 额外表单字段
   * @param {Function} [config.onProgress] - 上传进度 (percent: number) => void
   * @returns {Promise<*>}
   */
  RequestClient.prototype.upload = function (url, file, config) {
    var cfg = config || {}
    var formData

    if (file instanceof FormData) {
      formData = file
    } else {
      formData = new FormData()
      formData.append('file', file)
      if (cfg.extraFields) {
        Object.keys(cfg.extraFields).forEach(function (key) {
          formData.append(key, cfg.extraFields[key])
        })
      }
    }

    // FormData 不需要 Content-Type，浏览器自动设置（含 boundary）
    var headers = Object.assign({}, cfg.headers || {})
    delete headers['Content-Type']
    delete headers['content-type']

    // 使用 XMLHttpRequest 以获得进度回调
    if (cfg.onProgress && typeof XMLHttpRequest !== 'undefined') {
      return this._uploadWithProgress(url, formData, cfg.onProgress, headers)
    }

    return this.post(url, formData, Object.assign({}, cfg, { headers: headers }))
  }

  /** 使用 XHR 实现带进度的上传 */
  RequestClient.prototype._uploadWithProgress = function (url, formData, onProgress, extraHeaders) {
    var self = this
    var fullUrl = /^https?:\/\//.test(url) ? url : (self.baseURL + url)

    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest()
      xhr.open('POST', fullUrl, true)

      // 设置请求头
      Object.keys(extraHeaders || {}).forEach(function (key) {
        xhr.setRequestHeader(key, extraHeaders[key])
      })

      // 上传进度
      if (xhr.upload && onProgress) {
        xhr.upload.addEventListener('progress', function (e) {
          if (e.lengthComputable && onProgress) {
            var percent = Math.round((e.loaded / e.total) * 100)
            onProgress(percent)
          }
        })
      }

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          var data
          try { data = JSON.parse(xhr.responseText) } catch (_) { data = xhr.responseText }
          resolve(data)
        } else {
          var err = new Error('上传失败 HTTP ' + xhr.status)
          err.status = xhr.status
          reject(err)
        }
      }

      xhr.onerror = function () {
        reject(new Error('上传失败：网络错误'))
      }

      xhr.ontimeout = function () {
        reject(new Error('上传超时'))
      }

      xhr.timeout = self.timeout
      xhr.send(formData)
    })
  }

  /* ── Internal ─────────────────────────────────────────────────────────────── */

  /**
   * 执行实际的 HTTP 请求
   * @param {Object} cfg - 合并后的请求配置
   * @returns {Promise<*>}
   */
  RequestClient.prototype._doRequest = function (cfg) {
    var self = this
    var retriesLeft = cfg.retries

    function attempt() {
      return self._executeOnce(cfg).catch(function (err) {
        if (retriesLeft > 0 && _isRetryableError(err)) {
          retriesLeft--
          var delay = cfg.retryDelay * Math.pow(2, (cfg.retries - retriesLeft - 1))
          return new Promise(function (resolve) {
            setTimeout(function () { resolve(attempt()) }, delay)
          })
        }
        throw err
      })
    }

    return attempt()
  }

  /**
   * 单次请求执行
   * @param {Object} cfg
   * @returns {Promise<*>}
   */
  RequestClient.prototype._executeOnce = function (cfg) {
    var self = this

    var fetchOpts = {
      method: cfg.method,
      headers: new Headers(cfg.headers)
    }

    if (cfg.body && cfg.method !== 'GET' && cfg.method !== 'HEAD') {
      fetchOpts.body = typeof cfg.body === 'string' || cfg.body instanceof FormData
        ? cfg.body
        : JSON.stringify(cfg.body)
    }

    return this._runRequestInterceptors(fetchOpts).then(function (finalOpts) {
      return new Promise(function (resolve, reject) {
        var controller = typeof AbortController !== 'undefined' ? new AbortController() : null
        var timeoutId = setTimeout(function () {
          if (controller) controller.abort()
          var err = new Error('请求超时 (' + cfg.timeout + 'ms)')
          err.code = 'TIMEOUT'
          err.status = 0
          reject(err)
        }, cfg.timeout)

        if (controller) {
          finalOpts.signal = controller.signal
          if (cfg.signal) {
            cfg.signal.addEventListener('abort', function () {
              controller.abort()
              clearTimeout(timeoutId)
            })
          }
        }

        fetch(cfg.url, finalOpts).then(function (response) {
          clearTimeout(timeoutId)

          var contentType = response.headers.get('content-type') || ''
          var isJson = contentType.indexOf('application/json') !== -1

          return (isJson ? response.json().catch(function () { return null }) : response.text()).then(function (data) {
            return self._runResponseInterceptors({
              data: data,
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
              ok: response.ok,
              url: cfg.url,
              method: cfg.method
            })
          })
        }).then(function (result) {
          if (result.ok) {
            resolve(result.data)
          } else {
            var apiErr = new Error(result.data && result.data.message
              ? result.data.message
              : 'HTTP ' + result.status + ': ' + result.statusText)
            apiErr.code = 'HTTP_ERROR'
            apiErr.status = result.status
            apiErr.data = result.data
            apiErr.url = cfg.url
            reject(apiErr)
          }
        }).catch(function (err) {
          clearTimeout(timeoutId)
          self._runErrorInterceptors(err).then(function () { reject(err) })
        })
      })
    })
  }

  /** 运行请求拦截器链 */
  RequestClient.prototype._runRequestInterceptors = function (opts) {
    var interceptors = this.requestInterceptors.slice()
    var chain = Promise.resolve(opts)

    interceptors.forEach(function (fn) {
      chain = chain.then(function (o) { return fn(o) || o })
    })

    return chain
  }

  /** 运行响应拦截器链 */
  RequestClient.prototype._runResponseInterceptors = function (response) {
    var interceptors = this.responseInterceptors.slice()
    var chain = Promise.resolve(response)

    interceptors.forEach(function (fn) {
      chain = chain.then(function (r) { return fn(r) || r })
    })

    return chain
  }

  /** 运行错误拦截器链 */
  RequestClient.prototype._runErrorInterceptors = function (error) {
    var interceptors = this.errorInterceptors.slice()
    var chain = Promise.resolve(error)

    interceptors.forEach(function (fn) {
      chain = chain.then(function (e) { return fn(e) || e }).catch(function () { return error })
    })

    return chain
  }

  /* ── Static Factory ───────────────────────────────────────────────────────── */

  /**
   * 创建一个新的 RequestClient 实例
   * @param {Object} config
   * @returns {RequestClient}
   */
  RequestClient.create = function (config) {
    return new RequestClient(config)
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     Internal Helpers
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * 构建完整的请求配置
   * @param {RequestClient} client
   * @param {string} url
   * @param {Object} userConfig
   * @returns {Object}
   */
  function _buildConfig(client, url, userConfig) {
    var fullUrl = /^https?:\/\//.test(url) ? url : (client.baseURL + url)

    // 分离查询参数
    var queryString = ''
    if (userConfig.params && Object.keys(userConfig.params).length > 0) {
      queryString = _buildQuery(userConfig.params)
    }

    // 合并请求头
    var headers = Object.assign({}, client.defaultHeaders)
    if (userConfig.headers) {
      Object.keys(userConfig.headers).forEach(function (key) {
        headers[key] = userConfig.headers[key]
      })
    }

    // 自动注入 Token
    if (client._getToken) {
      var token = client._getToken()
      if (token) {
        headers['Authorization'] = 'Bearer ' + token
      }
    }

    return {
      url: fullUrl + queryString,
      method: (userConfig.method || 'GET').toUpperCase(),
      headers: headers,
      body: userConfig.body,
      timeout: userConfig.timeout || client.timeout,
      retries: typeof userConfig.retries === 'number' ? userConfig.retries : client.retries,
      retryDelay: userConfig.retryDelay || client.retryDelay,
      signal: userConfig.signal || null,
      dedup: userConfig.dedup === true,
      onProgress: userConfig.onProgress || null,
      onMessage: userConfig.onMessage || null,
      onComplete: userConfig.onComplete || null,
      onError: userConfig.onError || null
    }
  }

  /**
   * 判断错误是否可重试
   * @param {Error} err
   * @returns {boolean}
   */
  function _isRetryableError(err) {
    if (!err) return false
    if (err.code === 'TIMEOUT') return true
    if (err.code === 'NETWORK_ERROR') return true
    if (err.status && err.status >= 500) return true
    return false
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     Global Export
     ═══════════════════════════════════════════════════════════════════════════ */

  /** @type {RequestClient} 全局单例 */
  var requestClient = new RequestClient()

  root.RequestClient = RequestClient
  root.requestClient = requestClient
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : window)
