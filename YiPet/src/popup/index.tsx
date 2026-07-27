/**
 * YiPet Popup — Entry Point.
 * Initializes locale/timezone, then mounts the PopupComponent.
 */

import '@/shared/globals';
import { applyLocale, resolveLocale } from '@/shared/i18n/locale';
import { PopupComponent } from './App';

// ── Mount ──────────────────────────────────────────────────────────────

const rootEl = document.getElementById('app');
if (!rootEl) {
  console.error('[YiPet Popup] #app mount point not found');
} else {
  const popup = new PopupComponent();

  // Initialize locale + timezone, then mount.
  // mount() immediately renders the skeleton — the popup is never blank.
  resolveLocale()
    .then(({ locale }) => {
      popup.state.locale = locale;
      applyLocale(locale)
        .then(() => {
          popup.mount();
        })
        .catch((err: Error) => {
          console.error('[YiPet Popup] applyLocale failed:', err.message);
          popup.mount();
        });
    })
    .catch((err: Error) => {
      console.error('[YiPet Popup] resolveLocale failed:', err.message);
      popup.mount();
    });
}
