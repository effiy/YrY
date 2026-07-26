import { t } from '../../../shared/i18n';

export interface SliderRowProps {
  label: string;
  id: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  onInput: (event: { target: { value: string } }) => void;
  onChange: (event: { target: { value: string } }) => void;
}

export function SliderRow(props: SliderRowProps) {
  return (
    <div className="setting-row">
      <label className="setting-label-inline" htmlFor={props.id}>{props.label}</label>
      <div className="slider-row">
        <input
          id={props.id}
          className="slider"
          type="range"
          min={props.min}
          max={props.max}
          step={props.step}
          value={props.value}
          disabled={props.disabled}
          onInput={props.onInput}
          onChange={props.onChange}
        />
        <output className="value-pill" htmlFor={props.id}>
          {props.value}{t('popupSizeUnit')}
        </output>
      </div>
    </div>
  );
}
