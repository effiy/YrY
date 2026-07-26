/**
 * YiPet Popup — AppFooter Component
 *
 * Hint text and version badge.
 * Pure presentational — no internal state.
 *
 * Exports: window.YiPetPopup.components.AppFooter
 *
 * @module popup/components/AppFooter
 */
;(function (root) {
  'use strict'

  var NS = root.YiPetPopup = root.YiPetPopup || {}
  var CMP = NS.components = NS.components || {}

  var e = React.createElement

  /**
   * AppFooter — hint text and version badge.
   * @param {{ hintText: string, version: string }} props
   */
  function AppFooter(props) {
    return e('footer', { className: 'footer' },
      e('p', { className: 'hint-text' }, props.hintText),
      e('span', { className: 'version-badge' }, props.version)
    )
  }

  CMP.AppFooter = AppFooter

})(typeof globalThis !== 'undefined' ? globalThis : window)
