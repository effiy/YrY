/**
 * Service Worker — handles chrome.commands keyboard shortcuts.
 * In MV3, chrome.commands.onCommand fires here, not in content scripts.
 */

import type { PopupToContent } from '@/shared/ipc/messages';
import { getTabState, setTabState } from '@/shared/storage/state';
import { swStateMachine } from './sw-state-machine';
import { featureFlags } from '@/shared/feature-flags';

const MSG_TIMEOUT_MS = 5000;

function sendMessageWithTimeout(tabId: number, msg: PopupToContent): Promise<any> {
  return Promise.race([
    chrome.tabs.sendMessage(tabId, msg),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Message timeout')), MSG_TIMEOUT_MS),
    ),
  ]);
}

// ── Update Notification ──────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'update') {
    const prev = details.previousVersion || 'unknown';
    const curr = chrome.runtime.getManifest().version;
    console.log(`[YiPet SW] Extension updated: ${prev} → ${curr}`);

    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (!tab.id) continue;
      sendMessageWithTimeout(tab.id, {
        action: 'extensionUpdated',
        previousVersion: prev,
        currentVersion: curr,
      } as PopupToContent).catch(() => {
        // Tab may not have content script injected — skip silently
      });
    }
  }
});

// ── Command Handler ─────────────────────────────────────────────────────

chrome.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case 'toggle-pet': {
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];
        if (!tab?.id) return;

        const msg: PopupToContent = { action: 'toggleVisibility' };
        const response = await sendMessageWithTimeout(tab.id, msg);

        // Persist the toggled visibility state per-tab
        if (response?.success !== undefined) {
          const current = await getTabState(tab.id);
          const nextVisible = response.visible !== undefined ? response.visible : !current.visible;
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
        await sendMessageWithTimeout(tab.id, msg);
      } catch {
        // Content script may not be ready on this tab
      }
      break;
    }
    default:
      break;
  }
});

console.log('[YiPet] Service worker initializing...');
swStateMachine.init().then(() => {
  console.log(`[YiPet] Service worker ready — state: ${swStateMachine.state}`);
});
featureFlags.init().then(() => {
  console.log(`[YiPet] Feature flags loaded: virtual-scroll=${featureFlags.isEnabled('virtual-scroll')}, bridge-token=${featureFlags.isEnabled('bridge-token')}`);
});
