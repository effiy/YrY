/**
 * Content script message relay — handles chrome.runtime.onMessage
 * from popup and background, dispatches to MAIN world via CustomEvent.
 *
 * Extracted from bootstrap.ts Phase 1 (ISOLATED world).
 */

import { PET_DEFAULTS } from '@/config/defaults';
import type { PopupToContent } from '@/shared/ipc/messages';
import { getSystemPrompt, validateRole } from '../config/role-config';
import type { RestoredState } from '../state/persistence';
import {
  loadColorTheme,
  loadSavedRole,
  persistPetState,
  restorePetState,
} from '../state/persistence';

// ── Pet State ────────────────────────────────────────────────────────────

let _petVisible = false;
let _petSize = PET_DEFAULTS.pet.defaultSize;
let _petRole = 'Teacher';
let _petColor = 0;

export function getPetState(): RestoredState {
  return { visible: _petVisible, size: _petSize, role: _petRole, color: _petColor };
}

export function updatePetState(patch: Partial<RestoredState>): void {
  if (typeof patch.visible === 'boolean') _petVisible = patch.visible;
  if (typeof patch.size === 'number') _petSize = patch.size;
  if (typeof patch.role === 'string') _petRole = patch.role;
  if (typeof patch.color === 'number') _petColor = patch.color;
}

// ── MAIN World Dispatch ──────────────────────────────────────────────────

export function notifyMainWorld(type: string, detail: Record<string, unknown>): void {
  window.dispatchEvent(new CustomEvent(`yipet:${type}`, { detail }));
}

// ── Self-Injection ───────────────────────────────────────────────────────

export function injectIntoMainWorld(
  bootstrapUrl: string,
  extBase: string,
  initialRole: string,
  initialColor: number,
): void {
  const el = document.createElement('script');
  el.src = bootstrapUrl;
  el.dataset.base = extBase;
  el.dataset.role = initialRole;
  el.dataset.color = String(initialColor);
  el.id = 'yipet-bootstrap';

  el.onload = () => {
    // Inject chat script into MAIN world after bootstrap loads
    try {
      const chatUrl = chrome.runtime.getURL('assets/chat.js');
      const chatEl = document.createElement('script');
      chatEl.src = chatUrl;
      chatEl.dataset.apiBase = 'http://localhost:10086';
      chatEl.dataset.colorIndex = String(initialColor);
      chatEl.dataset.role = initialRole;
      chatEl.id = 'yipet-chat';
      (document.head || document.documentElement).appendChild(chatEl);
    } catch {
      /* chat unavailable */
    }
  };

  (document.head || document.documentElement).appendChild(el);
}

// ── Message Listener ─────────────────────────────────────────────────────

export function setupMessageRelay(): void {
  chrome.runtime.onMessage.addListener((msg: PopupToContent, _sender, sendResponse) => {
    switch (msg.action) {
      case 'ping': {
        sendResponse({
          success: true,
          visible: _petVisible,
          size: _petSize,
          role: _petRole,
          color: _petColor,
        });
        break;
      }
      case 'toggleVisibility': {
        _petVisible = !_petVisible;
        notifyMainWorld('visibilityChanged', { visible: _petVisible });
        persistPetState(getPetState());
        sendResponse({ success: true, visible: _petVisible });
        break;
      }
      case 'setVisibility': {
        _petVisible = !!msg.visible;
        notifyMainWorld('visibilityChanged', { visible: _petVisible });
        persistPetState(getPetState());
        sendResponse({ success: true, visible: _petVisible });
        break;
      }
      case 'changeSize': {
        _petSize = (msg.size as number) ?? _petSize;
        notifyMainWorld('sizeChanged', { size: _petSize });
        persistPetState(getPetState());
        sendResponse({ success: true, size: _petSize });
        break;
      }
      case 'setRole': {
        const canonical = validateRole((msg.role as string) ?? '');
        if (!canonical) {
          console.warn('[YiPet] Invalid role rejected:', msg.role);
          sendResponse({ success: false });
          break;
        }
        _petRole = canonical;
        const systemPrompt = getSystemPrompt(canonical);
        notifyMainWorld('roleChanged', { role: _petRole, systemPrompt });
        chrome.storage.local.set({ petRole: _petRole }).catch((err: Error) => {
          console.warn('[YiPet] Failed to persist role preference:', err.message);
        });
        persistPetState(getPetState());
        sendResponse({ success: true, role: _petRole });
        break;
      }
      case 'setColor': {
        _petColor = (msg.color as number) ?? _petColor;
        notifyMainWorld('colorChanged', { color: _petColor });
        persistPetState(getPetState());
        chrome.storage.local.set({ petColorTheme: _petColor }).catch(() => {});
        sendResponse({ success: true });
        break;
      }
      case 'toggleChat': {
        notifyMainWorld('chatToggled', {});
        sendResponse({ success: true });
        break;
      }
      default: {
        sendResponse({ success: false });
      }
    }
    return true; // keep channel open for async response
  });
}

// ── Init ─────────────────────────────────────────────────────────────────

export async function initRelay(): Promise<void> {
  // Load saved color theme and role BEFORE injection
  const savedColor = await loadColorTheme();
  if (savedColor !== _petColor) _petColor = savedColor;

  const savedRole = await loadSavedRole(_petRole);
  if (savedRole && validateRole(savedRole)) {
    _petRole = savedRole;
  }

  // Self-inject into MAIN world
  const extBase = chrome.runtime.getURL('cdn/');
  const selfUrl = chrome.runtime.getURL('assets/bootstrap.js');
  injectIntoMainWorld(selfUrl, extBase, _petRole, _petColor);

  // Setup message relay
  setupMessageRelay();

  // Restore saved state
  restorePetState(
    getPetState(),
    (type, detail) => {
      notifyMainWorld(type, detail);
      updatePetState(detail as Partial<RestoredState>);
    },
    (role, _systemPrompt) => {
      notifyMainWorld('roleChanged', { role, systemPrompt: getSystemPrompt(role) });
    },
  );

  // Persist on unload
  window.addEventListener('beforeunload', () => {
    persistPetState(getPetState());
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      persistPetState(getPetState());
    }
  });
}
