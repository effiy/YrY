/**
 * UrlBuilder — URL construction utilities
 *
 * Standalone URL helpers extracted from pet.config.js so they can be
 * loaded independently and reused across the codebase.
 *
 * Global exports:
 *   window.UrlBuilder.buildUrl(baseUrl, endpoint, params)
 *   window.UrlBuilder.buildQueryParams(params)
 *   window.UrlBuilder.buildDatabaseUrl(baseUrl, methodName, parameters)
 *
 * @module cdn/utils/url
 * @since 1.2.0
 */
;(function (root) {
  'use strict'

  /**
   * Replace :param placeholders in an endpoint template and join with baseUrl.
   *
   * @param {string} baseUrl  — e.g. 'http://localhost:10086'
   * @param {string} endpoint — e.g. '/sessions/:id'
   * @param {Object} [params] — e.g. { id: 123 }
   * @returns {string}        — e.g. 'http://localhost:10086/sessions/123'
   *
   * @example
   *   UrlBuilder.buildUrl('http://localhost:10086', '/sessions/:id', { id: 123 })
   *   // → 'http://localhost:10086/sessions/123'
   */
  function buildUrl(baseUrl, endpoint, params) {
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

  /**
   * Build a URL query string from a params object.
   *
   * @param {Object} [params] — key/value pairs
   * @returns {string}        — e.g. '?page=1&sort=name'
   *
   * @example
   *   UrlBuilder.buildQueryParams({ page: 1, sort: 'name' })
   *   // → 'page=1&sort=name'
   */
  function buildQueryParams(params) {
    if (!params) return ''

    var searchParams = new URLSearchParams()

    Object.keys(params).forEach(function (key) {
      var value = params[key]
      if (value === undefined || value === null) return
      if (typeof value === 'object') {
        searchParams.append(key, JSON.stringify(value))
      } else {
        searchParams.append(key, String(value))
      }
    })

    return searchParams.toString()
  }

  /**
   * Build a database API URL with module/method query params.
   *
   * @param {string} baseUrl      — API base URL
   * @param {string} methodName   — Python method name (e.g. 'services.database.data_service')
   * @param {Object} [parameters] — method parameters
   * @returns {string}
   *
   * @example
   *   UrlBuilder.buildDatabaseUrl('http://localhost:10086', 'get_user', { id: 1 })
   *   // → 'http://localhost:10086/?module_name=...&method_name=get_user&parameters={"id":1}'
   */
  function buildDatabaseUrl(baseUrl, methodName, parameters) {
    var queryParams = new URLSearchParams({
      module_name: 'services.database.data_service',
      method_name: methodName,
      parameters: JSON.stringify(parameters || {})
    })

    return baseUrl + '/?' + queryParams.toString()
  }

  /* ── Export ──────────────────────────────────────────────────────────── */

  root.UrlBuilder = {
    buildUrl: buildUrl,
    buildQueryParams: buildQueryParams,
    buildDatabaseUrl: buildDatabaseUrl
  }

})(typeof globalThis !== 'undefined' ? globalThis : window)
