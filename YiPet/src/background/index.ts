/**
 * Service Worker — handles chrome.commands keyboard shortcuts.
 * In MV3, chrome.commands.onCommand fires here, not in content scripts.
 */

import type { PopupToContent } from '../shared/messages';
import { getTabState, setTabState } from '../shared/state';

// ── Command Handler ─────────────────────────────────────────────────────

chrome.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case 'toggle-pet': {
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];
        if (!tab?.id) return;

        const msg: PopupToContent = { action: 'toggleVisibility' };
        const response = await chrome.tabs.sendMessage(tab.id, msg);

        // Persist the toggled visibility state per-tab
        if (response?.success !== undefined) {
          const current = await getTabState(tab.id);
          const nextVisible = response.visible !== undefined
            ? response.visible
            : !current.visible;
          await setTabState(tab.id, { visible: nextVisible });
        }
      } catch {
        // Content script may not be ready on this tab — ignore silently
      }
      break;
    }
    case 'open-chat': {
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];
        if (!tab?.id) return;
        const msg: PopupToContent = { action: 'toggleChat' };
        await chrome.tabs.sendMessage(tab.id, msg);
      } catch {
        // Content script may not be ready on this tab
      }
      break;
    }
    default:
      break;
  }
});

console.log('[YiPet] Service worker initialized');
