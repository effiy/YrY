/**
 * YiPet Popup — Connection Manager
 *
 * Handles content-script connection with exponential backoff retry.
 * Once connected, restores persisted state and enables controls.
 *
 * Exports: window.YiPetPopup.services.connectionManager
 *
 * @module popup/services/connect
 */
;(function (root) {
  'use strict'

  var NS = root.YiPetPopup = root.YiPetPopup || {}
  var svc = NS.services = NS.services || {}

  var D = root.YIPET_POPUP || {}
  var TIMING = D.TIMING || { CONNECT_RETRY_MAX: 3, CONNECT_RETRY_BASE_MS: 500 }
  var MSG    = D.MSG    || {}

  /**
   * Attempt to connect to the content script with retry.
   *
   * @param {Object} deps
   * @param {Function} deps.sendMessage — cs.sendMessage(msg) → Promise<response|null>
   * @param {Function} deps.loadState   — cs.loadState()     → Promise<stored|null>
   * @param {Function} deps.onConnected — called when ping succeeds (receives stored state)
   * @param {Function} deps.onFailed    — called when all retries exhausted
   */
  function connect(deps) {
    var sendMessage = deps.sendMessage
    var loadState   = deps.loadState
    var onConnected = deps.onConnected
    var onFailed    = deps.onFailed
    var retries     = 0

    function tryConnect() {
      sendMessage({ action: 'ping' }).then(function (response) {
        if (response) {
          // Connected — restore persisted state
          loadState().then(function (stored) {
            onConnected(stored)
          })
        } else if (retries < TIMING.CONNECT_RETRY_MAX) {
          retries++
          setTimeout(tryConnect, TIMING.CONNECT_RETRY_BASE_MS * retries)
        } else {
          onFailed()
        }
      })
    }

    tryConnect()
  }

  svc.connectionManager = { connect: connect }

})(typeof globalThis !== 'undefined' ? globalThis : window)
