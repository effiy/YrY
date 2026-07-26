/**
 * YiPet Popup — SelectRow Component
 *
 * Labelled dropdown select with options array.
 * Pure presentational — parent controls value and onChange.
 *
 * Exports: window.YiPetPopup.components.SelectRow
 *
 * @module popup/components/SelectRow
 */
;(function (root) {
  'use strict'

  var NS = root.YiPetPopup = root.YiPetPopup || {}
  var CMP = NS.components = NS.components || {}

  var e = React.createElement

  /**
   * SelectRow — labelled dropdown.
   * @param {{ label: string, id: string, value: string|number, disabled: boolean, onChange: Function, options: Array<{value: string|number, label: string}> }} props
   */
  function SelectRow(props) {
    return e('div', { className: 'setting-row', key: props.id },
      e('label', { className: 'setting-label-inline', htmlFor: props.id }, props.label),
      e('div', { className: 'role-control' },
        e('select', {
          id: props.id,
          className: 'select',
          value: props.value,
          disabled: props.disabled,
          onChange: props.onChange
        }, (props.options || []).map(function (opt) {
          return e('option', { key: opt.value, value: opt.value }, opt.label)
        }))
      )
    )
  }

  CMP.SelectRow = SelectRow

})(typeof globalThis !== 'undefined' ? globalThis : window)
