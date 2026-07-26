/**
 * YiPet Popup — Mount
 *
 * Mounts the Popup container component into the DOM.
 * All UI logic lives in components/ui/*.js (presentational) +
 * components/Popup.js (stateful container).
 *
 * Dependencies (loaded before this file, in order):
 *   /cdn/vendor/react@15.6.1/react.min.js      → window.React
 *   /cdn/vendor/react@15.6.1/react-dom.min.js   → window.ReactDOM
 *   /src/lib/url.js                             → window.UrlBuilder
 *   ../config/pet.config.js                     → window.PET_CONFIG
 *   ./data.js                                   → window.YIPET_POPUP
 *   ./services/notify.js                        → window.YiPetPopup.services.notification
 *   ./services/chrome.js                        → window.YiPetPopup.services.chromeService
 *   ./services/connect.js                       → window.YiPetPopup.services.connectionManager
 *   ./components/ui/AppHeader.js                → window.YiPetPopup.components.AppHeader
 *   ./components/ui/SettingsCard.js             → window.YiPetPopup.components.SettingsCard
 *   ./components/ui/SwitchRow.js                → window.YiPetPopup.components.SwitchRow
 *   ./components/ui/SliderRow.js                → window.YiPetPopup.components.SliderRow
 *   ./components/ui/SelectRow.js                → window.YiPetPopup.components.SelectRow
 *   ./components/ui/Notification.js             → window.YiPetPopup.components.Notification
 *   ./components/ui/AppFooter.js                → window.YiPetPopup.components.AppFooter
 *   ./components/Popup.js                       → window.YiPetPopup.components.Popup
 *
 * @module popup/index
 */
;(function () {
  'use strict'

  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
    console.error('[YiPet Popup] React not loaded — cannot mount')
    return
  }

  var Popup = window.YiPetPopup && window.YiPetPopup.components && window.YiPetPopup.components.Popup
  if (!Popup) {
    console.error('[YiPet Popup] Popup component not found — check script loading order')
    return
  }

  var rootEl = document.getElementById('app')
  if (!rootEl) {
    console.error('[YiPet Popup] #app mount point not found')
    return
  }

  ReactDOM.render(React.createElement(Popup), rootEl)

})()
