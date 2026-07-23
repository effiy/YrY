/**
 * YiPet 统一配置加载器
 * ----------------------------------------------------------------------
 * 为 CDN 侧提供统一的配置访问入口，支持：
 *   1. 从 window/self PET_CONFIG 读取（已加载时同步返回）
 *   2. 从远程 config.json 异步加载（兜底方案）
 *   3. 环境自动检测（production / staging / development）
 *   4. 多来源合并：默认值 → 远程配置 → 环境变量 → URL 参数
 *
 * 导出到 window.__YiPet_Config__ 供全局访问
 * ---------------------------------------------------------------------- */
;(function (root) {
  'use strict';

  var DEFAULT_ENV = 'production'
  var REMOTE_CONFIG_URL = '/cdn/config.json'
  var LOAD_TIMEOUT_MS = 5000

  /* ═══════════════════════ 环境检测 ═══════════════════════ */

  function detectEnv() {
    // 1. URL 参数 ?env=xxx
    try {
      var params = new URLSearchParams(window.location.search)
      if (params.has('env')) { return params.get('env').toLowerCase() }
    } catch (_) {}

    // 2. window.__PET_ENV_MODE__
    if (root.__PET_ENV_MODE__) { return String(root.__PET_ENV_MODE__).toLowerCase() }

    // 3. localStorage
    try {
      var stored = localStorage.getItem('pet_env_mode')
      if (stored) { return stored.toLowerCase() }
    } catch (_) {}

    // 4. 根据 hostname 自动判断
    try {
      var host = window.location.hostname
      if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) return 'development'
      if (host.includes('staging') || host.includes('test')) return 'staging'
    } catch (_) {}

    return DEFAULT_ENV
  }

  /* ═══════════════════════ 默认配置 ═══════════════════════ */

  var DEFAULT_CONFIG = {
    env: {
      mode: DEFAULT_ENV,
      flags: { debug: false, mockApi: false, telemetry: false }
    },
    api: {
      baseUrl: 'http://localhost:10086',
      timeout: 30000,
      retryCount: 3,
      retryDelay: 1000
    },
    pet: {
      defaultSize: 260,
      defaultVisible: false,
      defaultColorIndex: 0
    },
    chatWindow: {
      defaultWidth: 700,
      defaultHeight: 720
    },
    storage: {
      prefix: 'yipet_',
      syncInterval: 3000
    }
  }

  /* ═══════════════════════ 远程加载 ═══════════════════════ */

  function fetchRemoteConfig(url, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest()
      var called = false
      xhr.open('GET', url, true)
      xhr.timeout = timeoutMs
      xhr.onload = function () {
        if (called) return; called = true
        if (xhr.status >= 200 && xhr.status < 400) {
          try { resolve(JSON.parse(xhr.responseText)) }
          catch (e) { reject(new Error('配置 JSON 解析失败: ' + e.message)) }
        } else { reject(new Error('配置加载失败 HTTP ' + xhr.status)) }
      }
      xhr.onerror = function ()   { if (!called) { called = true; reject(new Error('配置网络请求失败')) } }
      xhr.ontimeout = function ()  { if (!called) { called = true; reject(new Error('配置加载超时')) } }
      xhr.send()
    })
  }

  /* ═══════════════════════ URL 参数覆盖 ═══════════════════════ */

  function applyUrlOverrides(config) {
    try {
      var params = new URLSearchParams(window.location.search)

      // api 相关
      if (params.has('api_base'))  config.api.baseUrl  = params.get('api_base')
      if (params.has('api_token')) config.api.token    = params.get('api_token')
      if (params.has('api_debug')) config.env.flags.debug = params.get('api_debug') === 'true'

      // pet 相关
      if (params.has('pet_debug')) {
        config.env.flags.debug = params.get('pet_debug') === 'true'
      }
    } catch (_) {}
    return config
  }

  /* ═══════════════════════ 深度合并 ═══════════════════════ */

  function deepMerge(target, source) {
    if (source === null || source === undefined) return target
    var result = {}
    var key, tv, sv
    for (key in target) { if (target.hasOwnProperty(key)) result[key] = target[key] }
    for (key in source) {
      if (!source.hasOwnProperty(key)) continue
      sv = source[key]; tv = target[key]
      if (sv !== null && typeof sv === 'object' && !Array.isArray(sv) &&
          tv !== null && typeof tv === 'object' && !Array.isArray(tv)) {
        result[key] = deepMerge(tv, sv)
      } else {
        result[key] = sv
      }
    }
    return result
  }

  /* ═══════════════════════ ConfigLoader 类 ═══════════════════════ */

  function ConfigLoader(options) {
    var opts = options || {}
    this._env       = opts.env || detectEnv()
    this._remoteUrl = opts.remoteUrl || REMOTE_CONFIG_URL
    this._timeout   = opts.timeout || LOAD_TIMEOUT_MS
    this._config    = deepMerge(DEFAULT_CONFIG, opts.defaults || {})
    this._ready     = false
    this._error     = null
    this._listeners = []

    // 如果 PET_CONFIG 已存在，立即同步合并
    if (root.PET_CONFIG) {
      this._config = deepMerge(this._config, root.PET_CONFIG)
      this._ready = true
    }
  }

  ConfigLoader.prototype.getEnv = function () { return this._env }

  ConfigLoader.prototype.isReady = function () { return this._ready }

  ConfigLoader.prototype.getError = function () { return this._error }

  /**
   * 获取配置值（支持路径访问）
   * @example get('api.baseUrl') → 'http://...'
   * @example get('pet.defaultSize') → 260
   */
  ConfigLoader.prototype.get = function (path, defaultValue) {
    var keys = String(path || '').split('.')
    var val  = this._config
    for (var i = 0; i < keys.length; i++) {
      if (val === null || val === undefined) return defaultValue
      val = val[keys[i]]
    }
    return val !== undefined ? val : defaultValue
  }

  /**
   * 获取完整配置的快照（不可变）
   */
  ConfigLoader.prototype.getAll = function () {
    return JSON.parse(JSON.stringify(this._config))
  }

  /**
   * 设置配置值
   */
  ConfigLoader.prototype.set = function (path, value) {
    var keys = String(path || '').split('.')
    var obj  = this._config
    for (var i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]] || typeof obj[keys[i]] !== 'object') obj[keys[i]] = {}
      obj = obj[keys[i]]
    }
    obj[keys[keys.length - 1]] = value
    this._notify()
  }

  /**
   * 合并配置
   */
  ConfigLoader.prototype.merge = function (partial) {
    if (partial && typeof partial === 'object') {
      this._config = deepMerge(this._config, partial)
      this._notify()
    }
  }

  /**
   * 异步初始化（加载远程配置）
   */
  ConfigLoader.prototype.init = function () {
    var self = this
    // 如果已有 PET_CONFIG 且不需要远程，直接返回
    if (this._ready && root.PET_CONFIG) {
      this._notify()
      return Promise.resolve(this._config)
    }

    return fetchRemoteConfig(self._remoteUrl, self._timeout)
      .then(function (remoteCfg) {
        // 按环境选择端点
        var envCfg = remoteCfg.env && remoteCfg.env.endpoints && remoteCfg.env.endpoints[self._env]
          ? remoteCfg.env.endpoints[self._env]
          : (remoteCfg.api || {})
        self._config = deepMerge(self._config, remoteCfg)
        if (envCfg) self._config.api = deepMerge(self._config.api || {}, envCfg)
        self._config = applyUrlOverrides(self._config)
        self._ready = true
        self._notify()
        return self._config
      })
      .catch(function (err) {
        console.warn('[ConfigLoader] 远程配置加载失败，使用默认配置:', err.message)
        self._error = err
        self._config = applyUrlOverrides(self._config)
        self._ready = true
        self._notify()
        return self._config
      })
  }

  /**
   * 等待配置就绪
   */
  ConfigLoader.prototype.ready = function () {
    var self = this
    if (self._ready) return Promise.resolve(self._config)
    return new Promise(function (resolve) {
      self._listeners.push(function () { resolve(self._config) })
    })
  }

  /**
   * 监听配置变更
   */
  ConfigLoader.prototype.onChange = function (fn) {
    this._listeners.push(fn)
    return function () {
      var idx = this._listeners.indexOf(fn)
      if (idx > -1) this._listeners.splice(idx, 1)
    }.bind(this)
  }

  ConfigLoader.prototype._notify = function () {
    var cfg = this._config
    this._listeners.forEach(function (fn) {
      try { fn(cfg) } catch (e) { console.error('[ConfigLoader] onChange listener error:', e) }
    })
  }

  /* ═══════════════════════ 挂载到全局 ═══════════════════════ */

  var instance = new ConfigLoader()

  root.__YiPet_Config__ = instance
  root.ConfigLoader = ConfigLoader

  // 如果 PET_CONFIG 未加载，异步尝试远程加载
  if (!root.PET_CONFIG) {
    instance.init().then(function () {
      console.log('[YiPet:Config] 配置已就绪 (env=' + instance.getEnv() + ')')
    })
  } else {
    console.log('[YiPet:Config] 配置已从 PET_CONFIG 同步加载 (env=' + instance.getEnv() + ')')
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : window)
