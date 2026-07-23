/**
 * YiPet 服务注册中心
 * ----------------------------------------------------------------------
 * 提供统一的 Service 生命周期管理：
 *   1. 按名称注册/获取 Service 实例
 *   2. 懒加载：首次 get() 时才实例化
 *   3. 依赖注入：自动注入 config + runtime deps
 *   4. 生命周期：init → ready → destroy
 *   5. 统计：追踪各 Service 的调用统计
 *
 * 导出到 window.__YiPet_Services__ 供全局访问
 * ---------------------------------------------------------------------- */
;(function (root) {
  'use strict';

  /* ═══════════════════════ ServiceRegistry ═══════════════════════ */

  function ServiceRegistry(options) {
    var opts = options || {}
    this._config = opts.config || (root.__YiPet_Config__ || null)
    this._services = {}       // name → { factory, instance, status }
    this._promises = {}       // name → Promise (防止并发创建)
    this._stats    = {}       // name → { calls, errors, lastCall }
    this._destroyed = false
  }

  /**
   * 注册 Service 工厂
   * @param {string}   name    - Service 名称
   * @param {Function} factory - 工厂函数 (config, deps) → Service 实例
   * @param {Object}   opts    - { lazy, deps }
   */
  ServiceRegistry.prototype.register = function (name, factory, opts) {
    if (this._services[name]) {
      console.warn('[ServiceRegistry] Service "' + name + '" 已注册，将被覆盖')
    }
    this._services[name] = {
      factory:  factory,
      instance: null,
      status:   'registered',  // registered | initializing | ready | error | destroyed
      options:  opts || {}
    }
    this._stats[name] = { calls: 0, errors: 0, lastCall: null }
    return this
  }

  /**
   * 获取 Service 实例（懒加载）
   * @param {string} name - Service 名称
   * @returns {Promise<Object>} Service 实例
   */
  ServiceRegistry.prototype.get = function (name) {
    var self = this

    if (this._destroyed) return Promise.reject(new Error('ServiceRegistry 已销毁'))

    var entry = this._services[name]
    if (!entry) return Promise.reject(new Error('Service "' + name + '" 未注册'))

    // 已就绪 → 直接返回
    if (entry.status === 'ready' && entry.instance) {
      self._stats[name].calls++
      self._stats[name].lastCall = Date.now()
      return Promise.resolve(entry.instance)
    }

    // 正在初始化 → 等待
    if (entry.status === 'initializing' && this._promises[name]) {
      return this._promises[name]
    }

    // 错误状态 → 重试
    if (entry.status === 'error') {
      entry.status = 'registered'
      entry.instance = null
    }

    // 开始初始化
    entry.status = 'initializing'
    this._promises[name] = this._createInstance(name, entry)
      .then(function (instance) {
        entry.instance = instance
        entry.status = 'ready'
        self._stats[name].calls++
        self._stats[name].lastCall = Date.now()
        delete self._promises[name]
        return instance
      })
      .catch(function (err) {
        entry.status = 'error'
        delete self._promises[name]
        self._stats[name].errors++
        throw err
      })

    return this._promises[name]
  }

  /**
   * 同步获取已就绪的 Service（不触发懒加载）
   */
  ServiceRegistry.prototype.getSync = function (name) {
    var entry = this._services[name]
    if (entry && entry.status === 'ready' && entry.instance) {
      this._stats[name].calls++
      this._stats[name].lastCall = Date.now()
      return entry.instance
    }
    return null
  }

  /**
   * 创建 Service 实例
   */
  ServiceRegistry.prototype._createInstance = function (name, entry) {
    var config = this._config
      ? (typeof this._config.getAll === 'function' ? this._config.getAll() : this._config)
      : {}

    // 确保 config 有 api.baseUrl
    if (!config.api) config.api = {}
    if (!config.api.baseUrl) {
      config.api.baseUrl = (root.PET_CONFIG && root.PET_CONFIG.api && root.PET_CONFIG.api.yiaiBaseUrl)
        || 'http://localhost:10086'
    }

    // 构建依赖注入
    var deps = {
      config:         config,
      RequestClient:  root.RequestClient,
      Logger:         root.Logger,
      TokenManager:   root.TokenManager,
      ApiErrorHandler: root.ApiErrorHandler,
      EventBus:        root.eventBus || (root.__YiPet_EventBus__ || null)
    }

    try {
      var instance = entry.factory(config, deps)
      if (!instance) throw new Error('Service 工厂返回了 null/undefined')

      // 如果实例有 init 方法且是 async，调用它
      if (typeof instance.init === 'function') {
        return Promise.resolve(instance.init()).then(function () { return instance })
      }

      return Promise.resolve(instance)
    } catch (err) {
      return Promise.reject(err)
    }
  }

  /**
   * 检查 Service 是否已注册
   */
  ServiceRegistry.prototype.has = function (name) {
    return !!this._services[name]
  }

  /**
   * 检查 Service 是否已就绪
   */
  ServiceRegistry.prototype.isReady = function (name) {
    var entry = this._services[name]
    return !!(entry && entry.status === 'ready' && entry.instance)
  }

  /**
   * 列出所有 Service 状态
   */
  ServiceRegistry.prototype.list = function () {
    var self = this
    return Object.keys(this._services).map(function (name) {
      var entry = self._services[name]
      return {
        name:    name,
        status:  entry.status,
        ready:   entry.status === 'ready',
        stats:   self._stats[name] || { calls: 0, errors: 0 }
      }
    })
  }

  /**
   * 获取统计信息
   */
  ServiceRegistry.prototype.getStats = function () {
    return JSON.parse(JSON.stringify(this._stats))
  }

  /**
   * 等待所有 Service 就绪
   */
  ServiceRegistry.prototype.waitForAll = function () {
    var self = this
    var names = Object.keys(this._services)
    return Promise.all(names.map(function (n) { return self.get(n) }))
  }

  /**
   * 销毁单个 Service
   */
  ServiceRegistry.prototype.destroyService = function (name) {
    var entry = this._services[name]
    if (!entry || !entry.instance) return

    if (typeof entry.instance.destroy === 'function') {
      try { entry.instance.destroy() } catch (e) { console.warn('[ServiceRegistry] destroy ' + name + ' error:', e) }
    }
    entry.instance = null
    entry.status = 'destroyed'
  }

  /**
   * 销毁所有 Service
   */
  ServiceRegistry.prototype.destroyAll = function () {
    var self = this
    Object.keys(this._services).forEach(function (name) {
      self.destroyService(name)
    })
    this._destroyed = true
  }

  /* ═══════════════════════ 挂载到全局 ═══════════════════════ */

  root.ServiceRegistry = ServiceRegistry
  root.__YiPet_Services__ = new ServiceRegistry()
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : window)
