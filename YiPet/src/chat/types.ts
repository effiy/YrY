/**
 * YiPet Chat — Shared type definitions.
 */

import type { ChatMessage, WeWorkBot } from '@/api/types';

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
  /** Set when the user aborted streaming or the request errored. */
  aborted?: boolean;
  /** Base64 data URL for image messages (legacy single-image field) */
  imageDataUrl?: string;
  /** Multi-image support — list of base64 data URLs. */
  imageDataUrls?: string[];
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
  isFavorite?: boolean;
  tags?: string[];
  pageContent?: string;
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
  /** WeCom bot list (persisted to chrome.storage.local). */
  weChatRobots: WeWorkBot[];
  /** Draft copy edited in the settings modal; committed on save. */
  weChatRobotsDraft: WeWorkBot[];
  /** Whether the WeCom bot settings modal is open. */
  weChatSettingsVisible: boolean;
  /** Active color palette index — followss popup color changes via yipet:colorChanged. */
  colorIndex: number;
  /** Role system prompt sent as `system` field in chat requests. Updated via yipet:roleChanged. */
  systemPrompt: string;
  /** Timestamp of the pet message currently being streamed. */
  streamingTargetTimestamp: number | null;
  /** Current streaming action type — controls RequestStatusButton label. */
  streamingType: '' | 'send' | 'regenerate' | 'resend';
  /** Monotonic counter bumped during streaming to trigger auto-scroll. */
  scrollTick: number;
  /** Per-timestamp copy feedback state — '' or 'copied'. */
  copyFeedback: Record<string, string>;
  /** Per-timestamp like/dislike rating. */
  feedback: Record<number, 'like' | 'dislike' | null>;
  /** Whether the FAQ modal is open. */
  faqVisible: boolean;
  /** FAQ search query. */
  faqSearch: string;
  /** FAQ apply mode — append to input vs insert at cursor. */
  faqApplyMode: 'append' | 'insert';
  /** Whether the session-edit modal is open. */
  sessionEditVisible: boolean;
  /** Whether the page-context editor modal is open. */
  contextEditorVisible: boolean;
  /** Draft content for the page-context editor. */
  contextEditorDraft: string;
  /** Whether the tag-manager modal is open. */
  tagManagerVisible: boolean;
  /** Last template content pushed to the input bar (QuickButtons template mode). */
  inputTemplate: string;
  ws: WindowState;
  isDragging: boolean;
  isResizing: boolean;
}
