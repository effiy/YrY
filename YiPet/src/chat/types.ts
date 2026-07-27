/**
 * YiPet Chat — Shared type definitions.
 */

import type { ChatMessage } from './api/chat';
import type { PageInfo } from './messages/WelcomeCard';

// Re-export for convenience
export type { PageInfo };

// ── Message ─────────────────────────────────────────────────────────────

export interface Message {
  type: 'user' | 'pet';
  content: string;
  timestamp: number;
  streaming?: boolean;
  error?: boolean;
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
  searchQuery: string;
  sessionLoading: boolean;
  sidebarCollapsed: boolean;
  ws: WindowState;
  isDragging: boolean;
  isResizing: boolean;
}
