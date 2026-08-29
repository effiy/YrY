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
  createPetOverlay(window, BASE, _injectedColor, _injectedRole, _injectedVisible);
}
