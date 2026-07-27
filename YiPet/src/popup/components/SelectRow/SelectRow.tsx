import './SelectRow.css';

export interface SelectRowProps {
  label: string;
  id: string;
  value: string | number;
  disabled: boolean;
  onChange: (event: { target: { value: string } }) => void;
  options: { value: string | number; label: string }[];
}

export function SelectRow(props: SelectRowProps) {
  return (
    <div className="setting-row">
      <label className="setting-label-inline" htmlFor={props.id}>
        {props.label}
      </label>
      <div className="role-control">
        <select
          id={props.id}
          className="select"
          value={props.value}
          disabled={props.disabled}
          onChange={props.onChange}
        >
          {(props.options || []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
