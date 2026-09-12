/**
 * YiPet Bootstrap — Dual-World CDN Resource Loader.
 *
 * Architecture (Chrome MV3):
 *   1. Chrome loads this bundle as a content script (ISOLATED world).
 *   2. It resolves chrome.runtime.getURL('cdn/') and injects a <script>
 *      tag loading THIS SAME FILE into the page DOM.
 *   3. The second execution runs in the MAIN world, where window.YiPet
 *      is visible from the DevTools console ("top" context).
 *
 * This entry point delegates to extracted modules:
 *   - ipc/relay.ts       — chrome.runtime message relay + self-injection (Phase 1)
 *   - rendering/overlay.ts — pet DOM + window.YiPet API (Phase 2)
 *   - state/persistence.ts — chrome.storage persistence helpers
 */

import { initRelay } from './ipc/relay';
import { createPetOverlay } from './rendering/overlay';

// ═══════════════════════════════════════════════════════════════════════════
// Context Detection
// ═══════════════════════════════════════════════════════════════════════════

// Only content scripts have chrome.runtime.getURL
let _isContentScript = false;
try {
  _isContentScript = !!(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL);
} catch (_) {
  /* not a content script */
}

// When injected into MAIN world, the <script> tag carries data-base + data-role
const _cs = typeof document !== 'undefined' ? document.currentScript : null;
const _injectedBase: string = (_cs && (_cs as HTMLScriptElement).dataset?.base) || '';
const _injectedRole: string = (_cs && (_cs as HTMLScriptElement).dataset?.role) || 'Teacher';
const _injectedColor: number = parseInt(
  (_cs && (_cs as HTMLScriptElement).dataset?.color) || '0',
  10,
);
const _injectedVisible: boolean = (_cs && (_cs as HTMLScriptElement).dataset?.visible) !== 'false';
const _injectedIpcSecret: string = (_cs && (_cs as HTMLScriptElement).dataset?.ipcSecret) || '';

// ═══════════════════════════════════════════════════════════════════════════
// Phase 1: Content Script (ISOLATED world) — inject self into MAIN world
// ═══════════════════════════════════════════════════════════════════════════

if (_isContentScript && !_injectedBase) {
  initRelay();
}

// ═══════════════════════════════════════════════════════════════════════════
// Phase 2: MAIN world — initialize YiPet API and pet overlay
// ═══════════════════════════════════════════════════════════════════════════

// Only run in MAIN world (no chrome.runtime.getURL) or when injected with data-base.
if (!_isContentScript || _injectedBase) {
  const BASE = _injectedBase || 'cdn/';
  createPetOverlay(window, BASE, _injectedColor, _injectedRole, _injectedVisible, _injectedIpcSecret);;

  // ═══════════════════════════════════════════════════════════════════════════
  // Phase 2b: SPA route detection + DOM keep-alive
  // ═══════════════════════════════════════════════════════════════════════════

  const _scheduleIdle = 'requestIdleCallback' in window
    ? (fn: () => void) => requestIdleCallback(fn)
    : (fn: () => void) => setTimeout(fn, 0);

  function ensurePetOverlay(): void {
    if (!document.getElementById('yipet-overlay')) {
      _scheduleIdle(() => {
        if (!document.getElementById('yipet-overlay')) {
          createPetOverlay(window, BASE, _injectedColor, _injectedRole, _injectedVisible, _injectedIpcSecret);;
        }
      });
    }
  }

  // Intercept history.pushState / replaceState
  const _origPushState = history.pushState.bind(history);
  const _origReplaceState = history.replaceState.bind(history);

  history.pushState = function (...args: Parameters<typeof history.pushState>) {
    _origPushState(...args);
    window.dispatchEvent(new CustomEvent('yipet:routeChange'));
  };
  history.replaceState = function (...args: Parameters<typeof history.replaceState>) {
    _origReplaceState(...args);
    window.dispatchEvent(new CustomEvent('yipet:routeChange'));
  };

  // Listen for route changes
  window.addEventListener('yipet:routeChange', ensurePetOverlay);
  window.addEventListener('popstate', ensurePetOverlay);
  window.addEventListener('hashchange', ensurePetOverlay);

  // MutationObserver keep-alive detection
  const _mo = new MutationObserver(() => {
    if (!document.getElementById('yipet-overlay')) {
      _scheduleIdle(() => {
        if (!document.getElementById('yipet-overlay')) {
          createPetOverlay(window, BASE, _injectedColor, _injectedRole, _injectedVisible, _injectedIpcSecret);;
        }
      });
    }
  });
  _mo.observe(document.body, { childList: true, subtree: true });

  // Cleanup on page unload to prevent memory leaks in SPAs
  window.addEventListener('pagehide', () => _mo.disconnect(), { once: true });
  window.addEventListener('beforeunload', () => _mo.disconnect(), { once: true });
}
