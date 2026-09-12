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