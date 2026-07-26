/**
 * YiPet Popup — SwitchRow Component
 *
 * Labelled toggle switch with description text.
 * Pure presentational component — state managed by parent.
 *
 * Exports: window.YiPetPopup.components.SwitchRow
 *
 * @module popup/components/SwitchRow
 */
;(function (root) {
  'use strict'

  var NS = root.YiPetPopup = root.YiPetPopup || {}
  var CMP = NS.components = NS.components || {}

  var e = React.createElement

  /**
   * SwitchRow — labelled toggle switch.
   * @param {{ label: string, desc: string, checked: boolean, disabled: boolean, onChange: Function }} props
   */
  function SwitchRow(props) {
    return e('div', { className: 'setting-row', key: 'visible' },
      e('div', { className: 'setting-meta' },
        e('span', { className: 'setting-label-inline' }, props.label),
        e('span', { className: 'setting-desc' }, props.desc)
      ),
      e('label', { className: 'switch' },
        e('input', {
          type: 'checkbox',
          className: 'switch-input',
          checked: props.checked,
          disabled: props.disabled,
          onChange: props.onChange
        }),
        e('span', { className: 'switch-track' })
      )
    )
  }

  CMP.SwitchRow = SwitchRow

})(typeof globalThis !== 'undefined' ? globalThis : window)
