/**
 * YiPet Chat — Shared type definitions.
 */

import type { ChatMessage } from '@/api/types';

// ── Page Info ─────────────────────────────────────────────────────────────

export interface PageInfo {
  title: string;
  url: string;
  iconUrl: string;
}

// ── Message ─────────────────────────────────────────────────────────────

export interface Message {
  type: 'user' | 'pet';
  content: string;
  timestamp: number;
  streaming?: boolean;
  error?: boolean;
  /** Base64 data URL for image messages */
  imageDataUrl?: string;
}

// ── Session ─────────────────────────────────────────────────────────────

export interface SessionItem {
  id: string;
  title: string;
  url: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  messages?: ChatMessage[];
}

// ── Window State ────────────────────────────────────────────────────────

export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isFullscreen: boolean;
}

// ── Chat State ──────────────────────────────────────────────────────────

export interface ChatState {
  visible: boolean;
  title: string;
  viewState: 'loading' | 'error' | 'empty' | 'messages';
  viewPayload: unknown;
  pageInfo: PageInfo;
  messages: Message[];
  isProcessing: boolean;
  sessions: SessionItem[];
  currentSessionId: string | null;
  /** Immediate input value for responsive UI (before debounce) */
  searchInputValue: string;
  /** Debounced query used for actual filtering */
  searchQuery: string;
  sessionLoading: boolean;
  sidebarCollapsed: boolean;
  /** Sidebar width in pixels (default 320) */
  sidebarWidth: number;
  /** Batch mode for multi-select session operations */
  batchMode: boolean;
  /** Session IDs selected in batch mode */
  selectedSessionIds: string[];
  /** Draft images (base64 data URLs) waiting to be sent */
  draftImages: string[];
  /** Page context toggle — when enabled, page content is sent as AI context */
  contextEnabled: boolean;
  /** Notification toast message */
  notification: { message: string; type: 'info' | 'success' | 'error' | 'warning' } | null;
  ws: WindowState;
  isDragging: boolean;
  isResizing: boolean;
}
