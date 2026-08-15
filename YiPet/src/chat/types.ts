/**
 * YiPet Chat — Shared type definitions.
 */

import type {
  AgentSkill,
  AgentToolDescriptor,
  BugDocument,
  BugFrequency,
  BugPriority,
  BugSeverity,
  BugStatus,
  BugType,
  ChatMessage,
  KnowledgeReadResponse,
  KnowledgeStory,
  KnowledgeTreeNode,
  RagCategoriesResponse,
  RagDecomposeResponse,
  RagSource,
  RagStatusResponse,
  TodoItem,
  WeWorkBot,
} from '@/api/types';

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

// ── Agent (Pi-inspired tool-calling loop) ───────────────────────────────

/** A single tool call in the live agent timeline. */
export interface AgentToolCall {
  id: string;
  name: string;
  status: 'running' | 'done' | 'error';
  content?: string;
  error?: string;
}

/** A tool call awaiting user approval (rendered as Approve/Reject banner). */
export interface PendingConfirmation {
  confirmationId: string;
  toolName: string;
  toolArgs: Record<string, unknown>;
}

/** An ask_user question the agent posed mid-run. */
export interface PendingQuestion {
  questionId: string;
  question: string;
  options: string[];
}

/** A structured run note surfaced as a chip (model_switch / agent_end / error). */
export interface AgentNote {
  id: number;
  kind: 'model_switch' | 'agent_end' | 'error';
  text: string;
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
  /** When non-empty, `filteredSessions` only includes sessions whose URL's
   *  site key (hostname + pathname + hash-path, no query) matches. Set by
   *  filterSessionsByCurrentPage() — lets the user surface "conversations
   *  I've had about this exact page before" without typing. */
  sessionSiteFilter: string;
  /** When non-empty, `filteredSessions` only includes sessions whose URL
   *  resolves to this project (via detectProjectFromUrl). Values: 'YiAi' /
   *  'YiVad' / 'YiKnowledge' / 'YiPet' / 'unknown'. Empty string = all. */
  sessionProjectFilter: string;
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
  /** Knowledge-grounded (RAG) toggle — when enabled, sends the user's message
   *  to /rag-chat instead of the plain chat endpoint, so the answer draws on
   *  the shared YiKnowledge markdown tree. */
  knowledgeGrounded: boolean;
  /** Optional scope filter passed to /rag-chat (file_path substring). */
  ragScope: string;
  /** True when ragScope points at a specific file (uses /rag-file-chat
   *  instead of /rag-chat). Set when the user scopes from a leaf node. */
  ragScopeIsFile: boolean;
  /** Sources returned by the most recent grounded turn. Cleared on next send. */
  ragSources: RagSource[];
  /** RAG index status — built / num_docs / last_built_at. Null until fetched. */
  ragStatus: RagStatusResponse | null;
  /** True while ragStatus is being fetched. */
  ragStatusLoading: boolean;
  /** Sidebar view mode: session list vs knowledge-tree browser. */
  sidebarView: 'sessions' | 'knowledge' | 'stories' | 'bugs';
  /** Recent bugs logged from any project via the BugReportDialog. */
  recentBugs: BugDocument[];
  /** True while a recent-bugs fetch is in flight. */
  recentBugsLoading: boolean;
  /** Error message from the last recent-bugs fetch, if any. */
  recentBugsError: string;
  /** Knowledge tree returned by KnowledgeService.scan(). Empty until loaded. */
  knowledgeTree: KnowledgeTreeNode[];
  /** True while a knowledge scan is in flight. */
  knowledgeLoading: boolean;
  /** Error message from the last knowledge scan, if any. */
  knowledgeError: string;
  /** Stories returned by KnowledgeService.listStories(). Empty until loaded. */
  knowledgeStories: KnowledgeStory[];
  /** True while a story list fetch is in flight. */
  knowledgeStoriesLoading: boolean;
  /** Error from the last story list fetch, if any. */
  knowledgeStoriesError: string;
  /** Whether the knowledge-file preview modal is open. */
  knowledgePreviewVisible: boolean;
  /** Path of the file currently loaded into the preview modal. */
  knowledgePreviewPath: string;
  /** Loaded KnowledgeReadResponse for the previewed file. */
  knowledgePreviewData: KnowledgeReadResponse | null;
  /** True while a knowledge read is in flight. */
  knowledgePreviewLoading: boolean;
  /** Whether the "save to YiKnowledge" modal is open. */
  saveToKnowledgeVisible: boolean;
  /** Target relative path (e.g. "notes/2026-08-05/summary.md"). */
  saveToKnowledgeDraftPath: string;
  /** Optional metadata fields surfaced as YAML frontmatter. */
  saveToKnowledgeDraftMetadata: {
    title: string;
    category: string;
    tags: string;
    type: string;
  };
  /** True while the save is in flight. */
  saveToKnowledgeLoading: boolean;
  /** Timestamp of the pet message currently staged for save. */
  saveToKnowledgeTimestamp: number | null;
  /** Sources returned by the last pre-flight rag.query (no LLM call). */
  ragPreviewSources: RagSource[];
  /** True while a pre-flight rag.query is in flight. */
  ragPreviewLoading: boolean;
  /** Whether the pre-flight sources modal is open. */
  ragPreviewVisible: boolean;
  /** The question last used for pre-flight. */
  ragPreviewQuestion: string;
  /** Categories + tag counts from rag.categories(). Null until fetched. */
  ragCategories: RagCategoriesResponse | null;
  /** True while ragCategories is being fetched. */
  ragCategoriesLoading: boolean;
  /** Selected category filter — empty string means "all". */
  knowledgeCategoryFilter: string;
  /** Whether the rag.decompose modal is open. */
  ragDecomposeVisible: boolean;
  /** True while rag.decompose is in flight (synchronous, can take a while). */
  ragDecomposeLoading: boolean;
  /** Decomposition result — original + synthesis + per-sub-question answers. */
  ragDecomposeData: RagDecomposeResponse | null;
  /** The question last decomposed. */
  ragDecomposeQuestion: string;
  /** Session summary modal visibility + content. */
  sessionSummaryVisible: boolean;
  sessionSummaryLoading: boolean;
  sessionSummaryText: string;
  sessionSummaryError: string;
  /** Whether the bug-report modal is open. */
  bugReportVisible: boolean;
  /** True while a bug report is being submitted. */
  bugReportLoading: boolean;
  /** Bug report draft fields. */
  bugReportDraft: {
    title: string;
    project: string;
    module: string;
    severity: BugSeverity;
    priority: BugPriority;
    status: BugStatus;
    type: BugType;
    frequency: BugFrequency;
    assignee: string;
    reporter: string;
    environment: string;
    affectedVersion: string;
    fixedVersion: string;
    tags: string;
    description: string;
    stepsToReproduce: string;
    expectedResult: string;
    actualResult: string;
  };
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
  /** Canonical role name (e.g. "Teacher"), drives the header avatar. Updated via yipet:roleChanged. */
  roleName: string;
  /** Resolved URL of the active role's icon, for the header avatar. Empty = fallback emoji. */
  roleImageUrl: string;
  /** Timestamp of the pet message currently being streamed. */
  streamingTargetTimestamp: number | null;
  /** Current streaming action type — controls RequestStatusButton label. */
  streamingType: '' | 'send' | 'regenerate' | 'resend';
  streamingPhase: '' | 'thinking' | 'retrieving' | 'streaming';
  /** Agent mode — route sends through /agent/chat (tool-calling loop) instead
   *  of the plain chat endpoint. Toggled from the toolbar. */
  agentMode: boolean;
  /** Live todo list surfaced by the agent's `todo_write` capability. */
  agentTodos: TodoItem[];
  /** Live tool-call timeline for the in-flight agent run. */
  agentToolCalls: AgentToolCall[];
  /** Tool call awaiting approval (Approve/Reject banner). */
  pendingConfirmation: PendingConfirmation | null;
  /** ask_user question awaiting an answer. */
  pendingQuestion: PendingQuestion | null;
  /** Structured run notes (model_switch / max_turns / error) — rendered as chips. */
  agentNotes: AgentNote[];
  /** Browsable server-side agent tools (from /agent/tools). Empty until loaded. */
  agentTools: AgentToolDescriptor[];
  /** Browsable skill catalog (from /agent/tools). Empty until loaded. */
  agentSkills: AgentSkill[];
  /** Whether the tool/skill browser drawer is open. */
  agentToolsVisible: boolean;
  /** True while the tool/skill catalog is being fetched. */
  agentToolsLoading: boolean;
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
  /** Persisted prompt history (most recent last). Mirror of YiVad's
   *  `usePromptHistory` — capped at 100, dedupes consecutive duplicates. */
  promptHistory: string[];
  /** Whether the prompt-history popover is open (toolbar button). */
  promptHistoryVisible: boolean;
  ws: WindowState;
  isDragging: boolean;
  isResizing: boolean;
}
