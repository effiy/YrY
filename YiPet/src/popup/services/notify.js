/**
 * YiPet Popup — Notification Service
 *
 * Manages the auto-dismissing toast notification state.
 * Exposes a createController(notifyTimer) interface so the popup component
 * can pass in its mutable timer reference.
 *
 * Exports: window.YiPetPopup.services.notification
 *
 * @module popup/services/notify
 */
;(function (root) {
  'use strict'

  var NS = root.YiPetPopup = root.YiPetPopup || {}
  var svc = NS.services = NS.services || {}

  var D = root.YIPET_POPUP || {}
  var TIMING = D.TIMING || { NOTIFICATION_DURATION: 3000 }

  /**
   * Factory: creates a notification controller bound to a popup instance.
   *
   * @param {Object} popup — the Popup component instance (needs setState)
   * @param {{ current: number|null }} timerRef — mutable ref for the timer ID
   * @returns {{ show: Function, dismiss: Function }}
   */
  function createController(popup, timerRef) {
    return {

      /**
       * Show a notification toast that auto-dismisses.
       * @param {string} message
       * @param {'success'|'error'|'info'} [type='info']
       */
      show: function (message, type) {
        clearTimeout(timerRef.current)
        popup.setState({
          notification: { visible: true, message: message, type: type || 'info' }
        })
        timerRef.current = setTimeout(function () {
          popup.setState({
            notification: { visible: false, message: '', type: 'info' }
          })
        }, TIMING.NOTIFICATION_DURATION)
      },

      /** Immediately hide the notification. */
      dismiss: function () {
        clearTimeout(timerRef.current)
        timerRef.current = null
        popup.setState({
          notification: { visible: false, message: '', type: 'info' }
        })
      }
    }
  }

  svc.notification = { createController: createController }

})(typeof globalThis !== 'undefined' ? globalThis : window)
