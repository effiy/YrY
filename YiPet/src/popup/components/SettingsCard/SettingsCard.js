/**
 * YiPet Popup — SettingsCard Component
 *
 * Wrapper card with a coloured left-accent title.
 * Pure container component — renders children in a styled card.
 *
 * Exports: window.YiPetPopup.components.SettingsCard
 *
 * @module popup/components/SettingsCard
 */
;(function (root) {
  'use strict'

  var NS = root.YiPetPopup = root.YiPetPopup || {}
  var CMP = NS.components = NS.components || {}

  var e = React.createElement

  /**
   * SettingsCard — wrapper with a coloured left-accent title.
   * @param {{ children: * }} props
   */
  function SettingsCard(props) {
    return e('section', { className: 'card' },
      e('h2', { className: 'card-title' }, 'Pet Settings'),
      e('div', { className: 'setting-list' }, props.children)
    )
  }

  CMP.SettingsCard = SettingsCard

})(typeof globalThis !== 'undefined' ? globalThis : window)
