/**
 * YiPet Popup — SliderRow Component
 *
 * Range slider with live value display (px pill).
 * Pure presentational — parent controls value and handlers.
 *
 * Exports: window.YiPetPopup.components.SliderRow
 *
 * @module popup/components/SliderRow
 */
;(function (root) {
  'use strict'

  var NS = root.YiPetPopup = root.YiPetPopup || {}
  var CMP = NS.components = NS.components || {}

  var e = React.createElement

  /**
   * SliderRow — range slider with live value display.
   * @param {{ label: string, id: string, value: number, min: number, max: number, step: number, disabled: boolean, onInput: Function, onChange: Function }} props
   */
  function SliderRow(props) {
    return e('div', { className: 'setting-row', key: 'size' },
      e('label', { className: 'setting-label-inline', htmlFor: props.id }, props.label),
      e('div', { className: 'slider-row' },
        e('input', {
          id: props.id,
          className: 'slider',
          type: 'range',
          min: props.min,
          max: props.max,
          step: props.step,
          value: props.value,
          disabled: props.disabled,
          onInput: props.onInput,
          onChange: props.onChange
        }),
        e('output', { className: 'value-pill', htmlFor: props.id }, props.value + 'px')
      )
    )
  }

  CMP.SliderRow = SliderRow

})(typeof globalThis !== 'undefined' ? globalThis : window)
