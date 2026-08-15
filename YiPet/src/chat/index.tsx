/**
 * YiPet Chat — Entry point.
 * Self-initializes when loaded via <script> tag in the MAIN world.
 * React/ReactDOM are now bundled (no CDN wait).
 * Exposes window.YiPetChat for external control (toggle, open, close).
 */
import { createRoot } from 'react-dom/client';
import { createApiServices } from '@/api';
import { getSystemPrompt } from '@/shared/roles';
import { ChatWindow } from './components';
import { ChatController } from './controller';

const currentScript = document.currentScript as HTMLScriptElement | null;
const dataset = currentScript?.dataset || {};
const API_BASE = dataset.apiBase || 'http://localhost:10086';
const COLOR_INDEX = parseInt(dataset.colorIndex || '0', 10);
const INITIAL_ROLE = dataset.role || 'Teacher';
const INITIAL_SYSTEM_PROMPT = getSystemPrompt(INITIAL_ROLE);

// Extension root (chrome-extension://<id>/) resolved from the chat bundle src.
const EXT_ROOT = (currentScript?.src || '').replace(/assets\/chat\.js.*$/, '');

/** Resolve a role's avatar icon URL (mirrors popup `roleImageUrl`). */
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

  const api = createApiServices({ baseUrl: API_BASE });
  const controller = new ChatController(
    api.chat,
    api.agent,
    api.sessions,
    api.wework,
    api.knowledge,
    api.rag,
    api.bug,
    COLOR_INDEX,
    INITIAL_SYSTEM_PROMPT,
  );
  controller.mount();
  controller.setRole(INITIAL_ROLE, roleImageUrl(INITIAL_ROLE));
  const root = createRoot(container);
  root.render(<ChatWindow controller={controller} />);

  (window as unknown as Record<string, unknown>).YiPetChat = {
    toggle: () => controller.toggle(),
    open: () => controller.open(),
    close: () => controller.close(),
    isOpen: () => controller.state.visible,
  };

  if ((window as unknown as Record<string, unknown>).__yipetPendingToggle) {
    delete (window as unknown as Record<string, unknown>).__yipetPendingToggle;
    controller.toggle();
  }

  if ((window as unknown as Record<string, unknown>).__yipetPendingChatToggle) {
    delete (window as unknown as Record<string, unknown>).__yipetPendingChatToggle;
    controller.toggle();
  }

  window.addEventListener('yipet:colorChanged', ((e: CustomEvent) => {
    const idx = Number(e?.detail?.color);
    if (Number.isFinite(idx)) controller.setColorIndex(idx);
  }) as EventListener);

  window.addEventListener('yipet:roleChanged', ((e: CustomEvent) => {
    const role = e?.detail?.role;
    const prompt = e?.detail?.systemPrompt;
    if (typeof role === 'string') controller.setRole(role, roleImageUrl(role));
    if (typeof prompt === 'string') controller.setSystemPrompt(prompt);
  }) as EventListener);

  window.addEventListener('yipet:chatToggled', (() => {
    controller.toggle();
  }) as EventListener);

  if (EXT_ROOT) {
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = EXT_ROOT + 'cdn/styles/chat.css';
    document.head.appendChild(cssLink);
  }

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
