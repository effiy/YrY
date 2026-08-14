/**
 * YiPet Popup — PetPreview
 * Live visual preview of the pet: the selected role's image inside a
 * theme-gradient ring, scaled by the size slider and tinted by the active
 * color theme (via `--primary-gradient`, injected by applyThemeColors).
 */

import { roleImageUrl } from '@/popup/data';
import { t } from '@/shared/i18n';
import './PetPreview.css';

export interface PetPreviewProps {
  role: string;
  /** Live preview size (already clamped by the caller via displaySize). */
  size: number;
  /** Human-readable color theme label, shown in the meta line. */
  colorLabel: string;
  disabled?: boolean;
}

/** Map the 80–400 px pet size range onto a preview that fits the 420 px popup. */
function previewScale(size: number): number {
  return Math.round(Math.min(130, Math.max(40, size * 0.4)));
}

export function PetPreview(props: PetPreviewProps) {
  const imgPx = previewScale(props.size);
  const ringPx = imgPx + 20;

  return (
    <div className={`pet-preview${props.disabled ? ' is-disabled' : ''}`}>
      <div className="pet-preview-stage">
        <div
          className="pet-preview-ring"
          style={{ width: ringPx, height: ringPx }}
          role="img"
          aria-label={props.role}
        >
          <img
            className="pet-preview-img"
            src={roleImageUrl(props.role)}
            alt={props.role}
            width={imgPx}
            height={imgPx}
          />
        </div>
      </div>
      <div className="pet-preview-meta">
        <span className="pet-preview-role">{props.role}</span>
        <span className="pet-preview-sep" aria-hidden="true">
          ·
        </span>
        <span>
          {props.size}
          {t('popupSizeUnit')}
        </span>
        <span className="pet-preview-sep" aria-hidden="true">
          ·
        </span>
        <span className="pet-preview-theme">{props.colorLabel}</span>
      </div>
    </div>
  );
}
