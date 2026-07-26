/**
 * Token Manager — 认证令牌管理器
 *
 * 负责 JWT Token 的存储、获取、刷新和过期检测：
 *   1. Token 存储 — 优先 chrome.storage.local，回退 localStorage
 *   2. 自动刷新 — 过期前自动续期
 *   3. 并发控制 — 多个并发请求共享同一次刷新
 *   4. 事件通知 — Token 变化时通知监听器
 *
 * 全局导出:
 *   window.TokenManager — Token 管理类
 *   window.tokenManager — 全局单例
 *   window.TokenUtils — Token 解析工具
 *
 * @module http/token
 * @since 1.0.0
 */

;(function (root) {
  'use strict'

  /* ═══════════════════════════════════════════════════════════════════════════
     Token Utilities
     ═══════════════════════════════════════════════════════════════════════════ */

  var TokenUtils = {
    /**
     * 解析 JWT Token（不解密，仅解析 payload 的 Base64 部分）
     *
     * @param {string} token - JWT 字符串
     * @returns {Object|null} 解析后的 payload，解析失败返回 null
     *
     * @example
     *   var payload = TokenUtils.parse('eyJhbG...')
     *   console.log(payload.exp, payload.sub)
     */
    parse: function (token) {
      if (!token || typeof token !== 'string') return null

      var parts = token.split('.')
      if (parts.length !== 3) return null

      try {
        var payload = parts[1]
        // 补充 Base64 填充
        while (payload.length % 4 !== 0) payload += '='
        // 替换 URL-safe 字符
        payload = payload.replace(/-/g, '+').replace(/_/g, '/')
        var decoded = atob(payload)
        return JSON.parse(decoded)
      } catch (_) {
        return null
      }
    },

    /**
     * 检查 Token 是否已过期或即将过期
     *
     * @param {string} token - JWT 字符串
     * @param {number} [bufferSeconds=60] - 提前量（秒），在到期前 N 秒即认为过期
     * @returns {boolean}
     */
    isExpired: function (token, bufferSeconds) {
      var payload = this.parse(token)
      if (!payload || !payload.exp) return true

      var buffer = bufferSeconds || 60
      var now = Math.floor(Date.now() / 1000)
      return (payload.exp - buffer) <= now
    },

    /**
     * 获取 Token 的剩余有效时间（秒）
     * @param {string} token
     * @returns {number} 剩余秒数，已过期返回 0，无法解析返回 -1
     */
    getRemainingTime: function (token) {
      var payload = this.parse(token)
      if (!payload || !payload.exp) return -1

      var now = Math.floor(Date.now() / 1000)
      return Math.max(0, payload.exp - now)
    },

    /**
     * 从 Token 中提取用户信息
     * @param {string} token
     * @returns {{ sub: string, name: string, email: string, role: string }|null}
     */
    getUserInfo: function (token) {
      var payload = this.parse(token)
      if (!payload) return null

      return {
        sub: payload.sub || '',
        name: payload.name || payload.preferred_username || '',
        email: payload.email || '',
        role: payload.role || payload.scope || ''
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     TokenManager Class
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * Token 管理器
   *
   * @constructor
   * @param {Object} [options]
   * @param {string} [options.storageKey='pet_auth_token'] - 存储键名
   * @param {string} [options.refreshKey='pet_refresh_token'] - Refresh Token 存储键名
   * @param {Function} [options.refreshFn] - Token 刷新函数 (refreshToken) => Promise<{token, refreshToken}>
   * @param {number} [options.refreshBuffer=300] - 提前刷新缓冲时间（秒），默认 5 分钟
   */
  function TokenManager(options) {
    var opts = options || {}

    /** @type {string} */
    this._storageKey = opts.storageKey || 'pet_auth_token'
    /** @type {string} */
    this._refreshKey = opts.refreshKey || 'pet_refresh_token'
    /** @type {Function|null} */
    this._refreshFn = opts.refreshFn || null
    /** @type {number} */
    this._refreshBuffer = opts.refreshBuffer || 300

    /** @type {string|null} 缓存的 Token */
    this._token = null
    /** @type {string|null} 缓存的 Refresh Token */
    this._refreshToken = null
    /** @type {Promise|null} 正在进行的刷新 Promise（并发控制） */
    this._refreshPromise = null
    /** @type {Array<Function>} Token 变化监听器 */
    this._listeners = []
    /** @type {boolean} 是否已从存储加载 */
    this._loaded = false
  }

  /**
   * 初始化：从存储加载已保存的 Token
   * @returns {Promise<string|null>}
   */
  TokenManager.prototype.init = function () {
    var self = this

    return this._readFromStorage().then(function (data) {
      self._token = data.token || null
      self._refreshToken = data.refreshToken || null
      self._loaded = true
      return self._token
    })
  }

  /**
   * 获取当前的 Access Token
   * 如果 Token 即将过期，自动触发刷新
   *
   * @param {Object} [options]
   * @param {boolean} [options.force=false] - 是否强制刷新
   * @returns {Promise<string|null>}
   */
  TokenManager.prototype.getToken = function (options) {
    var self = this
    var opts = options || {}

    if (!self._loaded) {
      return self.init().then(function () {
        return self.getToken(opts)
      })
    }

    if (opts.force) {
      return self.refreshToken()
    }

    // 检查是否需要刷新
    if (self._token && TokenUtils.isExpired(self._token, self._refreshBuffer)) {
      return self.refreshToken()
    }

    return Promise.resolve(self._token)
  }

  /**
   * 设置 Token
   *
   * @param {string} token - Access Token
   * @param {string} [refreshToken] - Refresh Token
   * @param {Object} [options]
   * @param {boolean} [options.persist=true] - 是否持久化到存储
   * @returns {Promise<void>}
   */
  TokenManager.prototype.setToken = function (token, refreshToken, options) {
    var self = this
    var opts = options || {}

    var oldToken = self._token
    self._token = token || null
    self._refreshToken = refreshToken || null

    if (opts.persist !== false) {
      return this._writeToStorage().then(function () {
        self._notifyListeners(self._token, oldToken)
      })
    }

    self._notifyListeners(self._token, oldToken)
    return Promise.resolve()
  }

  /**
   * 刷新 Token
   * 多个并发调用共享同一次刷新请求
   *
   * @returns {Promise<string|null>}
   */
  TokenManager.prototype.refreshToken = function () {
    var self = this

    // 如果已有正在进行的刷新，复用
    if (self._refreshPromise) {
      return self._refreshPromise
    }

    if (!self._refreshFn) {
      console.warn('[TokenManager] 未配置 refreshFn，无法刷新 Token')
      return Promise.resolve(self._token)
    }

    if (!self._refreshToken) {
      console.warn('[TokenManager] Refresh Token 不存在，无法刷新')
      return Promise.resolve(null)
    }

    self._refreshPromise = Promise.resolve()
      .then(function () {
        return self._refreshFn(self._refreshToken)
      })
      .then(function (result) {
        if (result && result.token) {
          return self.setToken(result.token, result.refreshToken || self._refreshToken)
        }
        throw new Error('刷新 Token 失败：无效的响应')
      })
      .then(function () {
        self._refreshPromise = null
        return self._token
      })
      .catch(function (err) {
        self._refreshPromise = null
        console.error('[TokenManager] Token 刷新失败:', err)
        // 刷新失败不清除旧 Token，允许继续使用直到过期
        return self._token
      })

    return self._refreshPromise
  }

  /**
   * 清除 Token（登出）
   * @returns {Promise<void>}
   */
  TokenManager.prototype.clearToken = function () {
    var self = this
    var oldToken = self._token

    self._token = null
    self._refreshToken = null
    self._refreshPromise = null

    return this._removeFromStorage().then(function () {
      self._notifyListeners(null, oldToken)
    })
  }

  /**
   * 检查是否已认证
   * @returns {boolean}
   */
  TokenManager.prototype.isAuthenticated = function () {
    return !!this._token && !TokenUtils.isExpired(this._token, 0)
  }

  /**
   * 监听 Token 变化
   *
   * @param {Function} listener - (newToken, oldToken) => void
   * @returns {Function} 取消监听的函数
   */
  TokenManager.prototype.onTokenChange = function (listener) {
    if (typeof listener !== 'function') return function () {}
    this._listeners.push(listener)
    var self = this
    return function () {
      var idx = self._listeners.indexOf(listener)
      if (idx !== -1) self._listeners.splice(idx, 1)
    }
  }

  /* ── Private ──────────────────────────────────────────────────────────────── */

  /** @returns {Promise<{token: string|null, refreshToken: string|null}>} */
  TokenManager.prototype._readFromStorage = function () {
    var key = this._storageKey
    var refreshKey = this._refreshKey

    return new Promise(function (resolve) {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get([key, refreshKey], function (result) {
            if (chrome.runtime.lastError) {
              resolve({ token: null, refreshToken: null })
              return
            }
            resolve({
              token: (result && result[key]) || null,
              refreshToken: (result && result[refreshKey]) || null
            })
          })
          return
        }
      } catch (_) {}

      // 回退到 localStorage
      try {
        resolve({
          token: localStorage.getItem(key) || null,
          refreshToken: localStorage.getItem(refreshKey) || null
        })
      } catch (_) {
        resolve({ token: null, refreshToken: null })
      }
    })
  }

  /** @returns {Promise<void>} */
  TokenManager.prototype._writeToStorage = function () {
    var self = this
    var data = {}
    data[this._storageKey] = self._token || ''
    data[this._refreshKey] = self._refreshToken || ''

    return new Promise(function (resolve) {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set(data, function () {
            resolve()
          })
          return
        }
      } catch (_) {}

      try {
        localStorage.setItem(self._storageKey, self._token || '')
        localStorage.setItem(self._refreshKey, self._refreshToken || '')
      } catch (_) {}

      resolve()
    })
  }

  /** @returns {Promise<void>} */
  TokenManager.prototype._removeFromStorage = function () {
    var keys = [this._storageKey, this._refreshKey]

    return new Promise(function (resolve) {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.remove(keys, function () {
            resolve()
          })
          return
        }
      } catch (_) {}

      try {
        keys.forEach(function (k) { localStorage.removeItem(k) })
      } catch (_) {}

      resolve()
    })
  }

  /** @param {string|null} newToken @param {string|null} oldToken */
  TokenManager.prototype._notifyListeners = function (newToken, oldToken) {
    var listeners = this._listeners.slice()
    listeners.forEach(function (fn) {
      try { fn(newToken, oldToken) } catch (_) {}
    })
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     Global Singleton
     ═══════════════════════════════════════════════════════════════════════════ */

  /** @type {TokenManager} 全局单例 */
  var tokenManager = new TokenManager()

  /* ═══════════════════════════════════════════════════════════════════════════
     Global Export
     ═══════════════════════════════════════════════════════════════════════════ */

  root.TokenUtils = TokenUtils
  root.TokenManager = TokenManager
  root.tokenManager = tokenManager
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : window)
