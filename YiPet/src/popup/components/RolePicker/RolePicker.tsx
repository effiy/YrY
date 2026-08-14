/**
 * YiPet Popup — RolePicker
 * Role card grid replacing the plain role `<Select>`. Each card shows the role
 * image + name; the selected card is highlighted with the primary border.
 */

import { ROLE_NAMES, roleImageUrl } from '@/popup/data';
import './RolePicker.css';

export interface RolePickerProps {
  value: string;
  onChange: (role: string) => void;
  disabled?: boolean;
}

export function RolePicker(props: RolePickerProps) {
  return (
    <div className="role-picker" role="radiogroup" aria-label="Role">
      {ROLE_NAMES.map((role) => {
        const selected = role === props.value;
        return (
          <button
            key={role}
            type="button"
            className={`role-card${selected ? ' is-selected' : ''}`}
            onClick={() => props.onChange(role)}
            disabled={props.disabled}
            aria-pressed={selected}
          >
            <img className="role-card-img" src={roleImageUrl(role)} alt={role} />
            <span className="role-card-name">{role}</span>
          </button>
        );
      })}
    </div>
  );
}
