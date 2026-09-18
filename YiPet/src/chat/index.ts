/**
 * YiPet Chat — Entry point.
 * Self-initializes when loaded via <script> tag in the MAIN world.
 * Vue 3 + Pinia, bundled into a single IIFE.
 * Exposes window.YiPetChat for external control (toggle, open, close).
 */
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createApiServices } from '@/api';
import { getSystemPrompt } from '@/shared/roles';
import { useChatStore } from './stores/chat';
import ChatWindow from './components/ChatWindow.vue';
import { errorReporter } from '@/shared/error-boundary';
import { keyboardRegistry } from '@/shared/shortcuts';

const currentScript = document.currentScript as HTMLScriptElement | null;
const dataset = currentScript?.dataset || {};
const API_BASE = dataset.apiBase || 'http://localhost:10086';
const COLOR_INDEX = parseInt(dataset.colorIndex || '0', 10);
const INITIAL_ROLE = dataset.role || 'Teacher';
const INITIAL_SYSTEM_PROMPT = getSystemPrompt(INITIAL_ROLE);
const IPC_SECRET = dataset.ipcSecret || '';
const API_TOKEN = dataset.apiToken || '';

// Extension root (chrome-extension://<id>/) resolved from the chat bundle src.
const EXT_ROOT = (currentScript?.src || '').replace(/assets\/chat\.js.*$/, '');

function isValidIpcEvent(e: CustomEvent): boolean {
  const detail = e.detail;
  if (!detail || typeof detail !== 'object') return false;
  if (!detail.__yipet) return false;
  if (!IPC_SECRET || detail.__signature !== IPC_SECRET) return false;
  if (Date.now() - detail.__timestamp > 5000) return false;
  return true;
}

function roleImageUrl(role: string): string {
  const slug = role.toLowerCase().replace(/\s+/g, '-');
  return EXT_ROOT + 'assets/images/' + slug + '/icon.png';
}

function initChatApp() {
  if ((window as unknown as Record<string, unknown>).__yipetChatInit) return;
  (window as unknown as Record<string, unknown>).__yipetChatInit = true;

  const container = document.createElement('div');
  container.id = 'yipet-chat-root';
  document.body.appendChild(container);

  const api = createApiServices({
    baseUrl: API_BASE,
    token: API_TOKEN,
  });
  const app = createApp(ChatWindow);
  const pinia = createPinia();
  app.use(pinia);

  app.config.errorHandler = (err, instance, info) => {
    errorReporter.report(
      err instanceof Error ? err : new Error(String(err)),
      `chat:${instance?.$options?.name || 'unknown'}:${info}`,
      'medium',
    );
  };

  const store = useChatStore();
  store.injectServices({
    chat: api.chat,
    sessions: api.sessions,
    wework: api.wework,
    knowledge: api.knowledge,
    rag: api.rag,
    bug: api.bug,
  });
  store.setColorIndex(COLOR_INDEX);
  store.setSystemPrompt(INITIAL_SYSTEM_PROMPT);
  store.setRole(INITIAL_ROLE, roleImageUrl(INITIAL_ROLE));
  store.mount();

  // ── Keyboard Shortcuts ────────────────────────────────────────────────
  keyboardRegistry.initialize().then(() => {
    keyboardRegistry.startListening();
    console.log(
      '%c⌨ YiPet Shortcuts%c ready — %c?%c for cheatsheet, %cCtrl+B%c toggle sidebar',
      'color:#6366f1;font-weight:bold', 'color:inherit',
      'color:#22c55e', 'color:#888',
      'color:#22c55e', 'color:#888',
    );
  });

  // Register shortcut handlers — each listens for the CustomEvent dispatched by KeyboardRegistry
  const _textarea = () => document.querySelector('#yipet-chat-window .el-textarea__inner') as HTMLTextAreaElement | null;
  const _msgArea = () => document.getElementById('yipet-chat-messages');

  window.addEventListener('yipet:shortcut:focus-input', () => _textarea()?.focus());
  window.addEventListener('yipet:shortcut:toggle-sidebar', () => store.toggleSidebar());
  window.addEventListener('yipet:shortcut:new-session', () => store.createSession());
  window.addEventListener('yipet:shortcut:export-session', () => store.exportCurrentSessionMarkdown());
  window.addEventListener('yipet:shortcut:search-messages', () => { store.open(); _textarea()?.focus(); });
  window.addEventListener('yipet:shortcut:zoom-in', () => {
    const el = _msgArea(); if (el) { const s = parseFloat(getComputedStyle(el).fontSize); el.style.fontSize = (s + 1) + 'px'; }
  });
  window.addEventListener('yipet:shortcut:zoom-out', () => {
    const el = _msgArea(); if (el) { const s = parseFloat(getComputedStyle(el).fontSize); el.style.fontSize = Math.max(10, s - 1) + 'px'; }
  });
  window.addEventListener('yipet:shortcut:open-chat', () => store.toggle());
  window.addEventListener('yipet:shortcut:toggle-pet', () => store.toggle());
  window.addEventListener('yipet:shortcut:clear-conversation', () => {
    if (!store.state.isProcessing) {
      store.sendMessage('/clear');
      const ta = _textarea(); if (ta) { ta.value = ''; ta.dispatchEvent(new Event('input', { bubbles: true })); }
    }
  });
  window.addEventListener('yipet:shortcut:clear-input', () => {
    if (!store.state.isProcessing) {
      const ta = _textarea(); if (ta) { ta.value = ''; ta.dispatchEvent(new Event('input', { bubbles: true })); ta.focus(); }
    }
  });

  app.mount(container);

  (window as unknown as Record<string, unknown>).YiPetChat = {
    toggle: () => store.toggle(),
    open: () => store.open(),
    close: () => store.close(),
    isOpen: () => store.state.visible,
  };

  if ((window as unknown as Record<string, unknown>).__yipetPendingToggle) {
    delete (window as unknown as Record<string, unknown>).__yipetPendingToggle;
    store.toggle();
  }

  if ((window as unknown as Record<string, unknown>).__yipetPendingChatToggle) {
    delete (window as unknown as Record<string, unknown>).__yipetPendingChatToggle;
    store.toggle();
  }

  window.addEventListener('yipet:colorChanged', ((e: CustomEvent) => {
    if (!isValidIpcEvent(e)) return;
    const idx = Number(e.detail?.data?.color);
    if (Number.isFinite(idx)) store.setColorIndex(idx);
  }) as EventListener);

  window.addEventListener('yipet:roleChanged', ((e: CustomEvent) => {
    if (!isValidIpcEvent(e)) return;
    const role = e.detail?.data?.role;
    if (typeof role === 'string') {
      store.setRole(role, roleImageUrl(role));
      store.setSystemPrompt(getSystemPrompt(role));
    }
  }) as EventListener);

  window.addEventListener('yipet:chatToggled', ((e: CustomEvent) => {
    if (!isValidIpcEvent(e)) return;
    store.toggle();
  }) as EventListener);

  console.log(
    '%c🐾 YiPet Chat%c ready — %cwindow.YiPetChat.toggle()%c to open',
    'color:#6366f1;font-weight:bold',
    'color:inherit',
    'color:#22c55e',
    'color:#888',
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatApp);
} else {
  initChatApp();
}