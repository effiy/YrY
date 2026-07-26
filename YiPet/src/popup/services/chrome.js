/**
 * YiPet Popup — Chrome Service
 *
 * Thin wrapper around chrome.tabs.* and chrome.storage.* for the popup.
 * Keeps Chrome extension API details out of React components.
 *
 * Exports: window.YiPetPopup.services.chromeService
 *
 * @module popup/services/chromeService
 */
;(function (root) {
  'use strict'

  var NS = root.YiPetPopup = root.YiPetPopup || {}
  var svc = NS.services = NS.services || {}

  /**
   * Factory: creates a Chrome API service bound to a popup instance.
   *
   * @param {{ current: { id: number }|null }} tabRef — mutable ref for the active tab
   * @returns {{
   *   getActiveTab: Function,
   *   sendMessage: Function,
   *   loadState: Function,
   *   saveState: Function
   * }}
   */
  function createService(tabRef) {
    var D = root.YIPET_POPUP || {}
    var STORAGE_KEY = D.STORAGE_KEY || 'pet_global_state'

    return {

      /**
       * Query the active tab in the current window.
       * @returns {Promise<chrome.tabs.Tab|null>}
       */
      getActiveTab: function () {
        return chrome.tabs.query({ active: true, currentWindow: true })
          .then(function (tabs) {
            if (!tabs || !tabs.length) return null
            tabRef.current = tabs[0]
            return tabs[0]
          })
      },

      /**
       * Send a message to the content script.
       * @param {Object} msg — must include `action`
       * @returns {Promise<Object|null>}
       */
      sendMessage: function (msg) {
        if (!tabRef.current || !tabRef.current.id) return Promise.resolve(null)
        return chrome.tabs.sendMessage(tabRef.current.id, msg)
          .catch(function (err) {
            console.warn('[YiPet Popup] sendMessage failed:', err.message)
            return null
          })
      },

      /**
       * Restore persisted state from chrome.storage.local.
       * @returns {Promise<Object|null>} the stored state object or null
       */
      loadState: function () {
        return chrome.storage.local.get(STORAGE_KEY)
          .then(function (result) {
            return (result && result[STORAGE_KEY]) || null
          })
      },

      /**
       * Persist the popup's current state to chrome.storage.local.
       * @param {{ visible: boolean, size: number, role: string, color: number, model: string|null }} state
       * @returns {Promise<void>}
       */
      saveState: function (state) {
        var payload = {}
        payload[STORAGE_KEY] = {
          visible: state.visible,
          size:    state.size,
          role:    state.role,
          color:   state.color,
          model:   state.model
        }
        return chrome.storage.local.set(payload)
          .catch(function (err) {
            console.warn('[YiPet Popup] saveState failed:', err.message)
          })
      }
    }
  }

  svc.chromeService = { createService: createService }

})(typeof globalThis !== 'undefined' ? globalThis : window)
