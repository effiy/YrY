/**
 * Content Script Entry — message relay and DOM observation.
 * Handles standard content script responsibilities in the ISOLATED world.
 * The bootstrap module handles dual-world injection separately.
 */

import type { PopupToContent } from '../shared/messages';

// ── Message Listener ────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener(
  (msg: PopupToContent, _sender, sendResponse) => {
    switch (msg.action) {
      case 'ping': {
        sendResponse({ success: true });
        break;
      }
      case 'setVisibility': {
        _petVisible = msg.visible;
        notifyMainWorld('visibilityChanged', { visible: _petVisible });
        sendResponse({ success: true, visible: _petVisible });
        break;
      }
      case 'toggleVisibility': {
        // Toggle pet visibility — dispatched to MAIN world via
        // custom DOM event or direct window reference
        const visible = togglePetVisibility();
        sendResponse({ success: true, visible });
        break;
      }
      case 'changeSize': {
        setPetSize(msg.size);
        sendResponse({ success: true, size: msg.size });
        break;
      }
      case 'setRole': {
        setPetRole(msg.role);
        sendResponse({ success: true, role: msg.role });
        break;
      }
      case 'setColor': {
        setPetColor(msg.color);
        sendResponse({ success: true });
        break;
      }
      default: {
        sendResponse({ success: false });
      }
    }
    return true; // keep channel open for async response
  },
);

// ── Pet State Helpers ──────────────────────────────────────────────────

let _petVisible = false;
let _petSize = 260;
let _petRole = 'Teacher';
let _petColor = 0;

function togglePetVisibility(): boolean {
  _petVisible = !_petVisible;
  notifyMainWorld('visibilityChanged', { visible: _petVisible });
  return _petVisible;
}

function setPetSize(size: number): void {
  _petSize = size;
  notifyMainWorld('sizeChanged', { size });
}

function setPetRole(role: string): void {
  _petRole = role;
  notifyMainWorld('roleChanged', { role });
}

function setPetColor(color: number): void {
  _petColor = color;
  notifyMainWorld('colorChanged', { color });
}

function notifyMainWorld(type: string, detail: Record<string, unknown>): void {
  window.dispatchEvent(new CustomEvent(`yipet:${type}`, { detail }));
}

// Signal that content script is ready
console.log('[YiPet] Content script initialized');
