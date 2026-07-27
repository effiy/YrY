/**
 * YiPet Chat — Entry point (React 15, matching popup tech stack).
 * Self-initializes when loaded via &lt;script&gt; tag in the MAIN world.
 *
 * React and ReactDOM are loaded from CDN by bootstrap.ts.
 * This module creates a ChatController and mounts to a container div.
 * Exposes window.YiPetChat for external control (toggle, open, close).
 */

// Styles: shared.css for cross-component markdown/scrollbar rules;
// each component imports its own CSS internally (co-location pattern)
import './styles/shared.css';
import { createChatApi } from './api/chat';
import { ChatController } from './controller';

const currentScript = document.currentScript as HTMLScriptElement | null;
const dataset = currentScript?.dataset || {};
const API_BASE = dataset.apiBase || 'http://localhost:10086';
const COLOR_INDEX = parseInt(dataset.colorIndex || '0', 10);

function initChatApp() {
  // Wait for React (loaded from CDN)
  if (
    typeof (window as unknown as Record<string, unknown>).React === 'undefined' ||
    typeof (window as unknown as Record<string, unknown>).ReactDOM === 'undefined'
  ) {
    setTimeout(initChatApp, 100);
    return;
  }

  // Prevent double init
  if ((window as unknown as Record<string, unknown>).__yipetChatInit) return;
  (window as unknown as Record<string, unknown>).__yipetChatInit = true;

  // Create container
  const container = document.createElement('div');
  container.id = 'yipet-chat-root';
  document.body.appendChild(container);

  // Init services and controller
  const api = createChatApi({ baseUrl: API_BASE });
  const controller = new ChatController(api, COLOR_INDEX);
  controller.mount(container);

  // Expose global API
  (window as unknown as Record<string, unknown>).YiPetChat = {
    toggle: () => controller.toggle(),
    open: () => controller.open(),
    close: () => controller.close(),
    isOpen: () => controller.state.visible,
  };

  // Listen for theme changes
  window.addEventListener('yipet:colorChanged', ((e: CustomEvent) => {
    // Theme handled by CSS custom properties on documentElement
    void e;
  }) as EventListener);

  // Listen for chat toggle from popup/keyboard shortcut
  window.addEventListener('yipet:chatToggled', (() => {
    controller.toggle();
  }) as EventListener);

  // Load CSS from CDN
  const extRoot = (currentScript?.src || '').replace(/assets\/chat\.js.*$/, '');
  if (extRoot) {
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = extRoot + 'cdn/styles/chat.css';
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
