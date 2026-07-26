/**
 * YiPet Popup — AppHeader Component
 *
 * Logo, brand, model name, and status indicator.
 * Pure presentational component — no internal state.
 *
 * Exports: window.YiPetPopup.components.AppHeader
 *
 * @module popup/components/AppHeader
 */
;(function (root) {
  'use strict'

  var NS = root.YiPetPopup = root.YiPetPopup || {}
  var CMP = NS.components = NS.components || {}

  var e = React.createElement

  var D = root.YIPET_POPUP || {}
  var STATUS_DOT = D.STATUS_DOT || { ACTIVE: '#22c55e', INACTIVE: '#f59e0b' }

  /**
   * AppHeader — logo, brand, model name, and status indicator.
   * @param {{ model: string|null, visible: boolean, statusText: string }} props
   */
  function AppHeader(props) {
    var dotColor = props.visible ? STATUS_DOT.ACTIVE : STATUS_DOT.INACTIVE

    return e('header', { className: 'header' },
      e('div', { className: 'logo', 'data-icon': '💕' },
        e('div', { className: 'brand' },
          e('h1', null, 'Gentle Companion'),
          e('span', { className: 'brand-sub' }, 'Model: ' + (props.model || '-'))
        )
      ),
      e('div', {
        className: 'status-indicator',
        role: 'status',
        'aria-live': 'polite',
        style: { '--status-dot-color': dotColor }
      },
        e('span', { className: 'status-text' }, props.statusText)
      )
    )
  }

  CMP.AppHeader = AppHeader

})(typeof globalThis !== 'undefined' ? globalThis : window)
