/**
 * YiPet Popup — Type definitions.
 *
 * Co-located types follow the Ant Design Pro data.d.ts pattern.
 */

import type { SupportedLocale } from '@/shared/i18n/locale';

// ── Popup State ──────────────────────────────────────────────────────────

export interface PopupState {
  visible: boolean;
  size: number;
  role: string;
  color: number;
  model: string | null;
  displaySize: number;
  controlsEnabled: boolean;
  hintText: string;
  notification: { visible: boolean; message: string; type: string };
  locale: SupportedLocale;
}
