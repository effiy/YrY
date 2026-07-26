/**
 * YiPet Configuration — Orchestrator
 *
 * Reads PET_DEFAULTS + PET_ENDPOINTS from pet.defaults.js,
 * applies environment overrides, attaches URL builders, and
 * exports the final PET_CONFIG object.
 *
 * Required before this file: src/config/pet.defaults.js
 *
 * Exports: window.PET_CONFIG, window.PET_ENV
 *
 * @module config/pet.config
 * @since 1.0.0
 */

;(function (root) {
  'use strict'

  var DEFAULTS  = root.PET_DEFAULTS  || {}
  var ENDPOINTS = root.PET_ENDPOINTS || {}

  /* ── Environment Detection ──────────────────────────────────────────── */

  var envMode = 'production'

  if (typeof window !== 'undefined' && window.__PET_ENV_MODE__) {
    envMode = String(window.__PET_ENV_MODE__).toLowerCase()
  } else if (typeof process !== 'undefined' && process.env && process.env.PET_ENV_MODE) {
    envMode = String(process.env.PET_ENV_MODE).toLowerCase()
  } else if (DEFAULTS.env && DEFAULTS.env.mode) {
    envMode = String(DEFAULTS.env.mode).toLowerCase()
  }

  var envFlags    = (DEFAULTS.env && DEFAULTS.env.flags) || {}
  var envApi      = (DEFAULTS.env && DEFAULTS.env.endpoints && DEFAULTS.env.endpoints[envMode]) || null

  /* ── URL Builders (delegate to UrlBuilder when available) ───────────── */

  function buildUrl(baseUrl, endpoint, params) {
    if (typeof UrlBuilder !== 'undefined' && UrlBuilder.buildUrl) {
      return UrlBuilder.buildUrl(baseUrl, endpoint, params)
    }
    var url = endpoint
    if (params) {
      Object.keys(params).forEach(function (key) {
        url = url.replace(':' + key, encodeURIComponent(params[key]))
      })
    }
    if (!/^https?:\/\//.test(url) && baseUrl) {
      url = baseUrl.replace(/\/$/, '') + '/' + url.replace(/^\//, '')
    }
    return url
  }

  function buildQueryParams(params) {
    if (typeof UrlBuilder !== 'undefined' && UrlBuilder.buildQueryParams) {
      return UrlBuilder.buildQueryParams(params)
    }
    var sp = new URLSearchParams()
    Object.keys(params || {}).forEach(function (key) {
      var val = params[key]
      if (val !== undefined && val !== null) {
        sp.append(key, typeof val === 'object' ? JSON.stringify(val) : String(val))
      }
    })
    return sp.toString()
  }

  function buildDatabaseUrl(baseUrl, methodName, parameters) {
    if (typeof UrlBuilder !== 'undefined' && UrlBuilder.buildDatabaseUrl) {
      return UrlBuilder.buildDatabaseUrl(baseUrl, methodName, parameters)
    }
    var qp = new URLSearchParams({
      module_name: 'services.database.data_service',
      method_name: methodName,
      parameters: JSON.stringify(parameters || {})
    })
    return baseUrl + '/?' + qp.toString()
  }

  /* ── Assemble & Export ──────────────────────────────────────────────── */

  // Shallow-clone defaults, then apply env overrides
  var config = {}
  Object.keys(DEFAULTS).forEach(function (k) { config[k] = DEFAULTS[k] })

  if (envApi) {
    config.api = {}
    Object.keys(DEFAULTS.api || {}).forEach(function (k) { config.api[k] = DEFAULTS.api[k] })
    Object.keys(envApi).forEach(function (k) { config.api[k] = envApi[k] })
  }

  config.envInfo   = { mode: envMode, flags: envFlags }
  config.ENDPOINTS = ENDPOINTS
  config.buildUrl  = buildUrl
  config.buildQueryParams   = buildQueryParams
  config.buildDatabaseUrl   = buildDatabaseUrl

  root.PET_CONFIG = config
  root.PET_ENV    = config.envInfo

  // Legacy flat globals (formerly endpoints.js)
  root.BASE_ENDPOINTS     = ENDPOINTS.BASE_ENDPOINTS
  root.AUTH_ENDPOINTS     = ENDPOINTS.AUTH_ENDPOINTS
  root.SESSION_ENDPOINTS  = ENDPOINTS.SESSION_ENDPOINTS
  root.FAQ_ENDPOINTS      = ENDPOINTS.FAQ_ENDPOINTS
  root.CONFIG_ENDPOINTS   = ENDPOINTS.CONFIG_ENDPOINTS
  root.DATABASE_ENDPOINTS = ENDPOINTS.DATABASE_ENDPOINTS
  root.buildUrl           = buildUrl
  root.buildQueryParams   = buildQueryParams
  root.buildDatabaseUrl   = buildDatabaseUrl

  // CJS compatibility
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { config: config, PET_CONFIG: config }
  }

})(typeof globalThis !== 'undefined' ? globalThis : window)
