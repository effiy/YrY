/**
 * IPC message type definitions — the single source of truth for all
 * cross-component communication.
 *
 * Every message that crosses the popup ↔ content script boundary
 * must be typed here. No ad-hoc { action: "something" } objects
 * anywhere else.
 */

// ── Popup → Content Script ──────────────────────────────────────────────

export type PopupToContent =
  | { action: 'ping' }
  | { action: 'toggleVisibility' }
  | { action: 'changeSize'; size: number }
  | { action: 'setRole'; role: string }
  | { action: 'setColor'; color: number };

// ── Content Script → Popup ──────────────────────────────────────────────

export type ContentToPopup =
  | { success: true; visible?: boolean; size?: number; role?: string }
  | { success: false };

// ── Shared state shape ──────────────────────────────────────────────────

export interface PetGlobalState {
  visible?: boolean;
  size?: number;
  role?: string;
  color?: number;
  model?: string | null;
}

export interface UserPrefs {
  theme?: string;
  fontSize?: number;
  features?: Record<string, boolean>;
}
