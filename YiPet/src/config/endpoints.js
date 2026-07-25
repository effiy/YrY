/**
 * API Endpoints — Compatibility Layer
 *
 * Reads endpoint definitions from PET_CONFIG synchronously and exposes
 * them as flat globals for legacy consumers.
 *
 * All config is managed in PET_CONFIG.ENDPOINTS (pet.config.js).
 *
 * @deprecated Prefer direct access to PET_CONFIG.ENDPOINTS and
 *             PET_CONFIG.buildUrl / PET_CONFIG.buildQueryParams.
 */
;(function (root) {
  'use strict'

  var C = root.PET_CONFIG

  if (!C || !C.ENDPOINTS) {
    console.warn('[endpoints] PET_CONFIG.ENDPOINTS not available — ' +
      'endpoints may not be loaded. Ensure pet.config.js loads first.')
    return
  }

  var ep = C.ENDPOINTS

  // Flat exports for legacy consumers
  root.BASE_ENDPOINTS     = ep.BASE_ENDPOINTS
  root.AUTH_ENDPOINTS     = ep.AUTH_ENDPOINTS
  root.SESSION_ENDPOINTS  = ep.SESSION_ENDPOINTS
  root.FAQ_ENDPOINTS      = ep.FAQ_ENDPOINTS
  root.CONFIG_ENDPOINTS   = ep.CONFIG_ENDPOINTS
  root.DATABASE_ENDPOINTS = ep.DATABASE_ENDPOINTS

  // URL builders
  root.buildUrl         = C.buildUrl
  root.buildQueryParams = C.buildQueryParams
  root.buildDatabaseUrl = C.buildDatabaseUrl

})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : window)
