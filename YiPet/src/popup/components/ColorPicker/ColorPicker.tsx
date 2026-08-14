/**
 * YiPet Popup — ColorPicker
 * Gradient swatch grid replacing the plain color `<Select>`. Each swatch shows
 * the theme's primary gradient; the selected one is ring-highlighted + checked.
 */

import { CheckOutlined } from '@ant-design/icons';
import { COLOR_OPTIONS } from '@/popup/data';
import './ColorPicker.css';

export interface ColorPickerProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function ColorPicker(props: ColorPickerProps) {
  return (
    <div className="color-picker" role="radiogroup" aria-label="Color theme">
      {COLOR_OPTIONS.map((opt) => {
        const selected = opt.value === props.value;
        return (
          <button
            key={opt.value}
            type="button"
            className={`color-swatch${selected ? ' is-selected' : ''}`}
            style={{ background: opt.gradient }}
            onClick={() => props.onChange(opt.value)}
            disabled={props.disabled}
            title={opt.label}
            aria-pressed={selected}
            aria-label={opt.label}
          >
            {selected && <CheckOutlined />}
          </button>
        );
      })}
    </div>
  );
}
