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
  model: string;
  displaySize: number;
  controlsEnabled: boolean;
  hintText: string;
  notification: { visible: boolean; message: string; type: string };
  locale: SupportedLocale;
  /** Page theme intensity (0-100, 0 = off). */
  pageTheme: number;
  /** Custom color hex (empty = using preset). */
  customColor: string;
}
