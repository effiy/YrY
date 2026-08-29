/**
 * Content script message relay — handles chrome.runtime.onMessage
 * from popup and background. Directly updates the pet DOM (ISOLATED world
 * shares DOM with MAIN world). Dispatches CustomEvents only for visibility
 * (so the MAIN world overlay can pause/resume animations) and chat toggle.
 */
import { PET_DEFAULTS } from '@/config/defaults';
import type { PopupToContent } from '@/shared/ipc/messages';
import { applyThemeColors } from '@/shared/theme';
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

// ── DOM Helpers ──────────────────────────────────────────────────────────

function getContainer(): HTMLElement | null {
  return document.getElementById('yipet-overlay');
}

function getImg(): HTMLImageElement | null {
  return document.getElementById('yipet-pet-img') as HTMLImageElement | null;
}

function applyVisibility(visible: boolean): void {
  const c = getContainer();
  if (c) {
    c.style.opacity = visible ? '1' : '0';
    c.style.pointerEvents = visible ? 'auto' : 'none';
  }
  window.dispatchEvent(new CustomEvent('yipet:visibilityChanged', { detail: { visible } }));
}

function applySize(size: number): void {
  const img = getImg();
  if (img) img.style.width = String(size) + 'px';
}

function applyRole(role: string): void {
  const img = getImg();
  if (!img || !role) return;
  const slug = role.toLowerCase().replace(/\s+/g, '-');
  img.src = chrome.runtime.getURL(`assets/images/${slug}/icon.png`);
  img.title = role;
}

function applyColor(color: number): void {
  applyThemeColors(document.documentElement, color);
  const c = getContainer();
  if (c) c.dataset.colorIndex = String(color);
}

function persist(): void {
  persistPetState({ visible: _petVisible, size: _petSize, role: _petRole, color: _petColor });
}

// ── Self-Injection ───────────────────────────────────────────────────────

export function injectIntoMainWorld(
  bootstrapUrl: string,
  extBase: string,
  initialRole: string,
  initialColor: number,
  initialVisible: boolean,
): void {
  const el = document.createElement('script');
  el.src = bootstrapUrl;
  el.dataset.base = extBase;
  el.dataset.role = initialRole;
  el.dataset.color = String(initialColor);
  el.dataset.visible = String(initialVisible);
  el.id = 'yipet-bootstrap';

  el.onload = () => {
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
        applyVisibility(_petVisible);
        persist();
        sendResponse({ success: true, visible: _petVisible });
        break;
      }
      case 'setVisibility': {
        _petVisible = !!msg.visible;
        applyVisibility(_petVisible);
        persist();
        sendResponse({ success: true, visible: _petVisible });
        break;
      }
      case 'changeSize': {
        _petSize = (msg.size as number) ?? _petSize;
        applySize(_petSize);
        persist();
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
        applyRole(_petRole);
        chrome.storage.local.set({ petRole: _petRole }).catch((err: Error) => {
          console.warn('[YiPet] Failed to persist role preference:', err.message);
        });
        persist();
        sendResponse({ success: true, role: _petRole });
        break;
      }
      case 'setColor': {
        _petColor = (msg.color as number) ?? _petColor;
        applyColor(_petColor);
        persist();
        chrome.storage.local.set({ petColorTheme: _petColor }).catch(() => {});
        sendResponse({ success: true });
        break;
      }
      case 'toggleChat': {
        window.dispatchEvent(new CustomEvent('yipet:chatToggled', { detail: {} }));
        sendResponse({ success: true });
        break;
      }
      default: {
        sendResponse({ success: false });
      }
    }
    return true;
  });
}

// ── Init ─────────────────────────────────────────────────────────────────

export async function initRelay(): Promise<void> {
  const savedColor = await loadColorTheme();
  if (savedColor !== _petColor) _petColor = savedColor;

  const savedRole = await loadSavedRole(_petRole);
  if (savedRole && validateRole(savedRole)) {
    _petRole = savedRole;
  }

  const extBase = chrome.runtime.getURL('cdn/');
  const selfUrl = chrome.runtime.getURL('assets/bootstrap.js');
  injectIntoMainWorld(selfUrl, extBase, _petRole, _petColor, _petVisible);

  setupMessageRelay();

  restorePetState(
    { visible: _petVisible, size: _petSize, role: _petRole, color: _petColor },
    (type, detail) => {
      switch (type) {
        case 'visibilityChanged':
          _petVisible = detail.visible as boolean;
          applyVisibility(_petVisible);
          break;
        case 'sizeChanged':
          _petSize = detail.size as number;
          applySize(_petSize);
          break;
        case 'colorChanged':
          _petColor = detail.color as number;
          applyColor(_petColor);
          break;
      }
    },
    (role, _systemPrompt) => {
      _petRole = role;
      applyRole(_petRole);
    },
  );

  window.addEventListener('beforeunload', () => persist());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') persist();
  });
}