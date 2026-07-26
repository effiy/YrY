/**
 * YiPet Popup — Notification Component
 *
 * Auto-dismissing toast notification banner.
 * Pure presentational — visibility controlled by parent.
 *
 * Exports: window.YiPetPopup.components.Notification
 *
 * @module popup/components/Notification
 */
;(function (root) {
  'use strict'

  var NS = root.YiPetPopup = root.YiPetPopup || {}
  var CMP = NS.components = NS.components || {}

  var e = React.createElement

  /**
   * Notification — toast banner (conditional).
   * @param {{ visible: boolean, message: string, type: string }} props
   */
  function Notification(props) {
    if (!props.visible) return null
    var cls = 'notification ' + (props.type || 'info')
    return e('div', { className: 'notification-area' },
      e('div', { className: cls }, props.message)
    )
  }

  CMP.Notification = Notification

})(typeof globalThis !== 'undefined' ? globalThis : window)
