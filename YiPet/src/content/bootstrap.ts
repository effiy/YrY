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
  createPetOverlay(window, BASE, _injectedColor, _injectedRole, _injectedVisible, _injectedIpcSecret);

  // ═══════════════════════════════════════════════════════════════════════════
  // Phase 2b: SPA route detection + DOM keep-alive
  // ═══════════════════════════════════════════════════════════════════════════

  const _scheduleIdle = 'requestIdleCallback' in window
    ? (fn: () => void) => requestIdleCallback(fn, { timeout: 2000 })
    : (fn: () => void) => setTimeout(fn, 50);

  function ensurePetOverlay(): void {
    if (!document.getElementById('yipet-overlay')) {
      _scheduleIdle(() => {
        if (!document.getElementById('yipet-overlay')) {
          createPetOverlay(window, BASE, _injectedColor, _injectedRole, _injectedVisible, _injectedIpcSecret);
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

  // Debounced ensure — SPA navigations can fire pushState + popstate +
  // hashchange in the same microtask. Batch them into one check.
  let _ensureTimer: ReturnType<typeof setTimeout> | null = null;
  function _debouncedEnsure() {
    if (_ensureTimer) return;
    _ensureTimer = setTimeout(() => {
      _ensureTimer = null;
      ensurePetOverlay();
    }, 50);
  }

  // Listen for route changes
  window.addEventListener('yipet:routeChange', _debouncedEnsure);
  window.addEventListener('popstate', _debouncedEnsure);
  window.addEventListener('hashchange', _debouncedEnsure);

  // Lightweight keep-alive: only observe direct children of body (no subtree).
  // subtree:true was causing performance issues on dynamic SPA pages by
  // firing on every DOM mutation anywhere in the document.
  let _keepAliveTimer: ReturnType<typeof setTimeout> | null = null;
  const _mo = new MutationObserver(() => {
    if (document.getElementById('yipet-overlay')) return;
    if (_keepAliveTimer) return;
    _keepAliveTimer = setTimeout(() => {
      _keepAliveTimer = null;
      if (document.getElementById('yipet-overlay')) return;
      _scheduleIdle(() => {
        if (!document.getElementById('yipet-overlay')) {
          createPetOverlay(window, BASE, _injectedColor, _injectedRole, _injectedVisible, _injectedIpcSecret);
        }
      });
    }, 200);
  });
  _mo.observe(document.body, { childList: true });

  function _onVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      _mo.disconnect();
    } else {
      ensurePetOverlay();
      _mo.observe(document.body, { childList: true });
    }
  }
  document.addEventListener('visibilitychange', _onVisibilityChange);

  window.addEventListener('pagehide', () => {
    _mo.disconnect();
    if (_keepAliveTimer) { clearTimeout(_keepAliveTimer); _keepAliveTimer = null; }
    document.removeEventListener('visibilitychange', _onVisibilityChange);
  }, { once: true });
  window.addEventListener('beforeunload', () => _mo.disconnect(), { once: true });
}
