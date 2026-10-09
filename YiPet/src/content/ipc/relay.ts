/**
 * Content script message relay — handles chrome.runtime.onMessage
 * from popup and background. Directly updates the pet DOM (ISOLATED world
 * shares DOM with MAIN world). Dispatches CustomEvents only for visibility
 * (so the MAIN world overlay can pause/resume animations) and chat toggle.
 */
import { PET_DEFAULTS } from '@/config/defaults';
import type { PopupToContent } from '@/shared/ipc/messages';
import { applyThemeColors, applyThemeHex } from '@/shared/theme';
import {
  readSessionKV,
  writeSessionKV,
  writeKV,
} from '@/shared/storage/kv';
import { applyPageTheme, removePageTheme } from '../rendering/page-theme';
import { validateRole } from '../config/role-config';
import {
  loadColorTheme,
  loadSavedRole,
  loadSavedPetStateForPage,
  persistPetState,
  restorePetState,
} from '../state/persistence';

// ── Pet State ────────────────────────────────────────────────────────────

let _petVisible = false;
let _petSize = PET_DEFAULTS.pet.defaultSize;
let _petRole = 'Teacher';
let _petColor = 0;
let _petCustomColor = '';

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
  dispatchSecureEvent('yipet:visibilityChanged', { visible });
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

function applyColor(color: number, customColor = ''): void {
  // Apply to overlay container (ISOLATED world shares DOM with MAIN)
  const overlay = getContainer();
  if (overlay) {
    if (!customColor || !applyThemeHex(overlay, customColor)) {
      applyThemeColors(overlay, color);
    }
    overlay.dataset.colorIndex = String(color);
    overlay.dataset.customColor = customColor;
  }
  // Apply to chat root if present
  const chatRoot = document.getElementById('yipet-chat-root');
  if (chatRoot) {
    if (!customColor || !applyThemeHex(chatRoot, customColor)) {
      applyThemeColors(chatRoot, color);
    }
    chatRoot.dataset.customColor = customColor;
  }
  // Notify MAIN world chat to update its own state
  dispatchSecureEvent('yipet:colorChanged', { color, customColor });
}

function persist(): void {
  persistPetState({
    visible: _petVisible,
    size: _petSize,
    role: _petRole,
    color: _petColor,
    customColor: _petCustomColor,
  });
}

// ── IPC Security ────────────────────────────────────────────────────────

/** Shared secret for cross-world IPC event validation. Regenerated on each extension start. */
const IPC_SECRET = crypto.randomUUID();

function dispatchSecureEvent<T>(name: string, detail: T): void {
  window.dispatchEvent(new CustomEvent(name, {
    detail: {
      __yipet: true,
      __signature: IPC_SECRET,
      __timestamp: Date.now(),
      data: detail,
    },
  }));
}

// ── Chat lazy-load state ────────────────────────────────────────────────

  let _chatLoaded = false;
  let _chatLoading = false;
  let _pendingChatToggle = false;

  /** Store bootstrap params for later chat injection. */
  const _bootstrapParams = {
    initialRole: '',
    initialColor: 0,
    initialCustomColor: '',
    ipcSecret: '',
  };

  export function injectChatScript(): void {
    if (_chatLoaded || _chatLoading) return;
    _chatLoading = true;

    try {
      const chatUrl = chrome.runtime.getURL('assets/chat.js');
      const chatEl = document.createElement('script');
      chatEl.src = chatUrl;
      chatEl.dataset.apiBase = 'http://localhost:10086';
      chatEl.dataset.colorIndex = String(_bootstrapParams.initialColor);
      chatEl.dataset.customColor = _bootstrapParams.initialCustomColor;
      chatEl.dataset.role = _bootstrapParams.initialRole;
      chatEl.dataset.ipcSecret = _bootstrapParams.ipcSecret;
      chatEl.id = 'yipet-chat';

      chatEl.onload = () => {
        _chatLoaded = true;
        _chatLoading = false;
        if (_pendingChatToggle) {
          _pendingChatToggle = false;
          dispatchSecureEvent('yipet:chatToggled', {});
        }
      };
      chatEl.onerror = () => {
        _chatLoading = false;
      };

      // Read auth token from chrome.storage.session (secure) — pass to MAIN world via dataset.
      // Falls back to localStorage for migration from YiVad.
      readSessionKV<string>('apiToken').then(async (storedToken) => {
        let token = String(storedToken || '').trim();
        if (!token) {
          try {
            token = (localStorage.getItem('YiWeb.apiToken.v1') || '').trim();
            if (token) {
              await writeSessionKV<string>('apiToken', token);
            }
          } catch { /* localStorage unavailable */ }
        }
        if (token) chatEl.dataset.apiToken = token;
      }).catch(() => {});

      (document.head || document.documentElement).appendChild(chatEl);
    } catch {
      _chatLoading = false;
    }
  }

  // ── Self-Injection ───────────────────────────────────────────────────────

  export function injectIntoMainWorld(
    bootstrapUrl: string,
    extBase: string,
    initialRole: string,
    initialColor: number,
    initialCustomColor: string,
    initialVisible: boolean,
  ): void {
    // Store params for later chat lazy-load
    _bootstrapParams.initialRole = initialRole;
    _bootstrapParams.initialColor = initialColor;
    _bootstrapParams.initialCustomColor = initialCustomColor;
    _bootstrapParams.ipcSecret = IPC_SECRET;

    const el = document.createElement('script');
    el.src = bootstrapUrl;
    el.dataset.base = extBase;
    el.dataset.role = initialRole;
    el.dataset.color = String(initialColor);
    el.dataset.visible = String(initialVisible);
    el.dataset.ipcSecret = IPC_SECRET;
    el.id = 'yipet-bootstrap';

    (document.head || document.documentElement).appendChild(el);
  }

// ── Message Listener ─────────────────────────────────────────────────────

export function setupMessageRelay(): void {
  chrome.runtime.onMessage.addListener((msg: PopupToContent, _sender, sendResponse) => {
    // Inject MAIN world on first interaction that needs DOM
    if (msg.action !== 'ping') _ensureMainWorldInjected();

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
        if (_petVisible) _ensureMainWorldInjected();
        applyVisibility(_petVisible);
        persist();
        sendResponse({ success: true, visible: _petVisible });
        break;
      }
      case 'setVisibility': {
        _petVisible = !!msg.visible;
        if (_petVisible) _ensureMainWorldInjected();
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
        // writeKV swallows context errors and returns false on failure
        writeKV<string>('petRole', _petRole).then((ok) => {
          if (!ok) console.warn('[YiPet] Failed to persist role preference');
        });
        persist();
        sendResponse({ success: true, role: _petRole });
        break;
      }
      case 'setColor': {
        _petColor = (msg.color as number) ?? _petColor;
        _petCustomColor = typeof (msg as Record<string, unknown>).customColor === 'string'
          ? String((msg as Record<string, unknown>).customColor || '')
          : '';
        applyColor(_petColor, _petCustomColor);
        persist();
        // Two independent writes — failures are tolerated (each swallows internally)
        void writeKV<number>('petColorTheme', _petColor);
        void writeKV<string>('petCustomColor', _petCustomColor);
        sendResponse({ success: true });
        break;
      }
      case 'setPageTheme': {
        const intensity = (msg as Record<string, unknown>).intensity as number;
        if (intensity > 0) {
          applyPageTheme(_petColor, intensity);
        } else {
          removePageTheme();
        }
        void writeKV<number>('pageThemeIntensity', intensity);
        sendResponse({ success: true });
        break;
      }
      case 'toggleChat': {
        if (!_chatLoaded) {
          _pendingChatToggle = true;
          injectChatScript();
        } else {
          dispatchSecureEvent('yipet:chatToggled', {});
        }
        sendResponse({ success: true });
        break;
      }
      case 'extensionUpdated': {
        console.warn(
          `[YiPet] Extension updated: ${msg.previousVersion || 'unknown'} → ${msg.currentVersion || 'unknown'}. Re-injecting...`,
        );

        // Reset all lazy-load state
        _mainWorldInjected = false;
        _mainWorldInjecting = false;
        _chatLoaded = false;
        _chatLoading = false;
        _pendingChatToggle = false;
        const w = window as unknown as Record<string, unknown>;
        delete w.__yipetChatInit;

        // Remove old DOM
        document.getElementById('yipet-overlay')?.remove();
        document.getElementById('yipet-chat-root')?.remove();
        document.getElementById('yipet-bootstrap')?.remove();
        document.getElementById('yipet-chat')?.remove();
        document.getElementById('yipet-animations')?.remove();

        // Re-inject (message relay already active, no need to re-init)
        _ensureMainWorldInjected();

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

  /** Whether bootstrap.js has been injected into MAIN world. */
  let _mainWorldInjected = false;
  let _mainWorldInjecting = false;

  /** Bootstrap params cached before injection. */
  let _cachedExtBase = '';
  let _cachedSelfUrl = '';

  function _ensureMainWorldInjected(): void {
    if (_mainWorldInjected || _mainWorldInjecting) return;
    _mainWorldInjecting = true;

    injectIntoMainWorld(
      _cachedSelfUrl, _cachedExtBase,
      _petRole, _petColor, _petCustomColor, _petVisible,
    );
    _mainWorldInjected = true;
    _mainWorldInjecting = false;

    // Re-apply current state once MAIN world DOM exists (next frame)
    requestAnimationFrame(() => {
      applyVisibility(_petVisible);
      applySize(_petSize);
      applyRole(_petRole);
      applyColor(_petColor, _petCustomColor);
    });
  }

  export async function initRelay(): Promise<void> {
    const savedState = await loadSavedPetStateForPage();
    const savedColor = await loadColorTheme();
    if (typeof savedState.color === 'number') _petColor = savedState.color;
    else if (savedColor !== _petColor) _petColor = savedColor;
    if (typeof savedState.customColor === 'string') _petCustomColor = savedState.customColor;
    if (typeof savedState.visible === 'boolean') _petVisible = savedState.visible;
    if (typeof savedState.size === 'number') _petSize = savedState.size;
    if (typeof savedState.role === 'string' && validateRole(savedState.role)) _petRole = savedState.role;

    const savedRole = await loadSavedRole(_petRole);
    if (savedRole && validateRole(savedRole)) {
      _petRole = savedRole;
    }

    _cachedExtBase = chrome.runtime.getURL('cdn/');
    _cachedSelfUrl = chrome.runtime.getURL('assets/bootstrap.js');

    setupMessageRelay();

    // No MAIN world injection here — deferred to first user interaction.
    // Pages where the user never interacts with YiPet stay completely untouched.

    restorePetState(
    { visible: _petVisible, size: _petSize, role: _petRole, color: _petColor, customColor: _petCustomColor },
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
          applyColor(_petColor, _petCustomColor);
          break;
        case 'customColorChanged':
          _petCustomColor = String(detail.customColor || '');
          applyColor(_petColor, _petCustomColor);
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
