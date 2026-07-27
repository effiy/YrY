import './SwitchRow.css';

export interface SwitchRowProps {
  label: string;
  desc: string;
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
}

export function SwitchRow(props: SwitchRowProps) {
  return (
    <div className="setting-row">
      <div className="setting-meta">
        <span className="setting-label-inline">{props.label}</span>
        <span className="setting-desc">{props.desc}</span>
      </div>
      <label className="switch">
        <input
          type="checkbox"
          className="switch-input"
          checked={props.checked}
          disabled={props.disabled}
          onChange={props.onChange}
        />
        <span className="switch-track" />
      </label>
    </div>
  );
}
