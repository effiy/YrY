/**
 * YiPet API Service Layer — 统一入口
 * ----------------------------------------------------------------------
 * 整合 FaqService 和 SessionService，通过 ServiceRegistry 管理生命周期。
 *
 * 使用方式：
 *
 *   <!-- 1. 按顺序引入运行时依赖 -->
 *   <script src="/cdn/utils/http/request.js"></script>
 *   <script src="/cdn/utils/http/logger.js"></script>
 *   <script src="/cdn/utils/http/token.js"></script>
 *   <script src="/cdn/utils/http/error.js"></script>
 *   <script src="/cdn/utils/http/index.js"></script>
 *
 *   <!-- 2. 引入配置和服务 -->
 *   <script src="/cdn/utils/core/configLoader.js"></script>
 *   <script src="/cdn/utils/core/serviceRegistry.js"></script>
 *   <script src="/cdn/utils/core/apiManager.js"></script>
 *   <script src="/src/api/index.js"></script>
 *
 *   <!-- 3. 使用 -->
 *   <script>
 *     window.__YiPet_API__.ready().then(function(api) {
 *       api.faq.getFaqs().then(console.log)
 *       api.session.getSessionsList().then(console.log)
 *     })
 *   </script>
 *
 * 或者直接使用 ServiceRegistry 按需获取：
 *
 *   window.__YiPet_Services__.get('faq').then(function(faq) { ... })
 *   window.__YiPet_Services__.get('session').then(function(session) { ... })
 * ---------------------------------------------------------------------- */
;(function (root) {
  'use strict';

  var registry = root.__YiPet_Services__

  /* ═══════════════════════ 工厂函数 ═══════════════════════ */

  /**
   * FaqService 工厂
   */
  function createFaqService(config, deps) {
    var baseUrl = (config.api && config.api.yiaiBaseUrl)
      || (config.api && config.api.baseUrl)
      || 'http://localhost:10086'

    // 确保 ApiManager 已加载
    if (typeof root.ApiManager === 'undefined') {
      throw new Error('ApiManager 未加载，请确认 cdn/utils/core/apiManager.js 已引入')
    }

    // 确保 buildDatabaseUrl 可用
    if (typeof root.buildDatabaseUrl === 'undefined') {
      if (root.PET_CONFIG && typeof root.PET_CONFIG.buildDatabaseUrl === 'function') {
        root.buildDatabaseUrl = root.PET_CONFIG.buildDatabaseUrl
      } else {
        // 降级实现
        root.buildDatabaseUrl = function (base, method, params) {
          var q = 'module_name=services.database.data_service&method_name='
            + encodeURIComponent(method)
            + '&parameters=' + encodeURIComponent(JSON.stringify(params || {}))
          return base + '/?' + q
        }
      }
    }

    if (typeof root.FaqService === 'undefined') {
      throw new Error('FaqService 未加载，请确认 src/api/faq.service.js 已引入')
    }

    return new root.FaqService(baseUrl, {
      logger: { prefix: '[FaqService]', level: config.env && config.env.flags && config.env.flags.debug ? 0 : 1 }
    })
  }

  /**
   * SessionService 工厂
   */
  function createSessionService(config, deps) {
    var baseUrl = (config.api && config.api.yiaiBaseUrl)
      || (config.api && config.api.baseUrl)
      || 'http://localhost:10086'

    if (typeof root.ApiManager === 'undefined') {
      throw new Error('ApiManager 未加载')
    }

    if (typeof root.buildDatabaseUrl === 'undefined') {
      if (root.PET_CONFIG && typeof root.PET_CONFIG.buildDatabaseUrl === 'function') {
        root.buildDatabaseUrl = root.PET_CONFIG.buildDatabaseUrl
      } else {
        root.buildDatabaseUrl = function (base, method, params) {
          var q = 'module_name=services.database.data_service&method_name='
            + encodeURIComponent(method)
            + '&parameters=' + encodeURIComponent(JSON.stringify(params || {}))
          return base + '/?' + q
        }
      }
    }

    if (typeof root.SessionService === 'undefined') {
      throw new Error('SessionService 未加载，请确认 src/api/session.service.js 已引入')
    }

    return new root.SessionService(baseUrl, {
      logger: { prefix: '[SessionService]', level: config.env && config.env.flags && config.env.flags.debug ? 0 : 1 },
      saveBatchSize: config.api && config.api.saveBatchSize || 5,
      saveInterval:  config.api && config.api.saveInterval  || 2000
    })
  }

  /* ═══════════════════════ 注册到 Registry ═══════════════════════ */

  if (registry) {
    registry.register('faq',     createFaqService)
    registry.register('session', createSessionService)
  }

  /* ═══════════════════════ 统一 API 门面 ═══════════════════════ */

  function YiPetAPI(options) {
    var opts = options || {}
    this._registry = opts.registry || registry
    this._ready = false
    this._initPromise = null

    // 懒加载 service 引用
    this.faq     = null
    this.session = null
  }

  /**
   * 初始化所有 Service
   * @returns {Promise<YiPetAPI>}
   */
  YiPetAPI.prototype.init = function () {
    var self = this
    if (this._initPromise) return this._initPromise

    this._initPromise = Promise.all([
      this._registry.get('faq'),
      this._registry.get('session')
    ]).then(function (services) {
      self.faq     = services[0]
      self.session = services[1]
      self._ready  = true
      return self
    }).catch(function (err) {
      console.error('[YiPetAPI] 初始化失败:', err)
      // 部分成功也可用
      self._ready = true
      return self
    })

    return this._initPromise
  }

  /**
   * 等待就绪
   */
  YiPetAPI.prototype.ready = function () {
    if (this._ready) return Promise.resolve(this)
    return this.init()
  }

  /**
   * 检查 Service 状态
   */
  YiPetAPI.prototype.status = function () {
    return this._registry ? this._registry.list() : []
  }

  /**
   * 销毁
   */
  YiPetAPI.prototype.destroy = function () {
    if (this._registry) this._registry.destroyAll()
    this.faq     = null
    this.session = null
    this._ready  = false
  }

  /* ═══════════════════════ 挂载到全局 ═══════════════════════ */

  root.YiPetAPI = YiPetAPI

  // 创建默认实例
  var defaultAPI = new YiPetAPI()
  root.__YiPet_API__ = defaultAPI

  console.log('[YiPet:API] 服务层已就绪 (FaqService + SessionService)')
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : window)
