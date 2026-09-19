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
  | { action: 'setVisibility'; visible: boolean }
  | { action: 'changeSize'; size: number }
  | { action: 'setRole'; role: string }
  | { action: 'setColor'; color: number; customColor?: string }
  | { action: 'setPageTheme'; intensity: number }
  | { action: 'toggleChat' }
  | { action: 'screenshot' }
  | { action: 'toggleMute' }
  | { action: 'extensionUpdated'; previousVersion: string; currentVersion: string }
  | { action: 'extensionUpdatePending' };

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
  customColor?: string;
  model?: string | null;
  pageTheme?: number;
}

/** Per-tab state map keyed by tab ID. */
export interface TabStates {
  [tabId: number]: PetGlobalState;
}

export interface UserPrefs {
  theme?: string;
  fontSize?: number;
  features?: Record<string, boolean>;
}
