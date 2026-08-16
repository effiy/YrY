/**
 * ChatController — manages all chat state and logic.
 *
 * Refactored to an external store so React function components can subscribe
 * via `useSyncExternalStore`. The class owns state + actions; React tree
 * reads `controller.state` snapshot and re-renders on emit.
 */

import type { TreeDataNode } from 'antd';
import type {
  AgentService,
  BugService,
  ChatService,
  KnowledgeService,
  RagService,
  SessionService,
  WeWorkService,
} from '@/api/services';
import { detectPageTypeFromUrl, detectProjectFromUrl, makeBugKey } from '@/api/services/bug';
import type {
  AgentChatMessage,
  AgentChatPayload,
  AgentStreamEvent,
  BugFrequency,
  BugPriority,
  BugSeverity,
  BugStatus,
  BugType,
  ChatMessage,
  KnowledgeTreeNode,
  RagChatMessage,
  RagSource,
  TodoItem,
  WeWorkBot,
} from '@/api/types';
import { DEFAULT_MODEL } from './constants';
import type { ChatState, Message, SessionItem } from './types';

export type { ChatState, Message, SessionItem };

// ── Defaults ─────────────────────────────────────────────────────────────

const DEFAULT_WIDTH = 850;
const DEFAULT_HEIGHT = 720;
const MIN_WIDTH = 400;
const MIN_HEIGHT = 450;
const DEFAULT_SIDEBAR_WIDTH = 320;
const MIN_SIDEBAR_WIDTH = 240;
const MAX_SIDEBAR_WIDTH = 600;
const MAX_DRAFT_IMAGES = 4;

type NotifyType = 'info' | 'success' | 'error' | 'warning';
type NotifyHandler = (message: string, type: NotifyType) => void;

// ── Controller ───────────────────────────────────────────────────────────

export class ChatController {
  state: ChatState;
  private _chat: ChatService;
  private _agent: AgentService;
  private _sessions: SessionService;
  private _wework: WeWorkService;
  private _knowledge: KnowledgeService;
  private _rag: RagService;
  private _bug: BugService;
  private _abortController: AbortController | null = null;
  private _searchTimer: ReturnType<typeof setTimeout> | null = null;
  private _scrollTimer: ReturnType<typeof setTimeout> | null = null;
  private _listeners = new Set<() => void>();
  private _notifyHandler: NotifyHandler | null = null;
  private _loadSessionsPromise: Promise<void> | null = null;
  private _treeSessionMap: Map<string, SessionItem> = new Map();

  // Drag state (non-reactive)
  private _dragStart = { x: 0, y: 0, wx: 0, wy: 0 };
  private _resizeDir = '';
  private _resizeStart = { x: 0, y: 0, wx: 0, wy: 0, w: 0, h: 0 };

  // Sidebar resize state
  private _sidebarResizeStart = { x: 0, startWidth: 0 };

  // Agent tool-call timeline sequence (monotonic id source)
  private _agentToolSeq = 0;
  // Agent run-note sequence (monotonic id source)
  private _agentNoteSeq = 0;

  constructor(
    chat: ChatService,
    agent: AgentService,
    sessions: SessionService,
    wework: WeWorkService,
    knowledge: KnowledgeService,
    rag: RagService,
    bug: BugService,
    colorIndex: number,
    systemPrompt: string,
  ) {
    this._chat = chat;
    this._agent = agent;
    this._sessions = sessions;
    this._wework = wework;
    this._knowledge = knowledge;
    this._rag = rag;
    this._bug = bug;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    this.state = {
      visible: false,
      title: 'Chat with me',
      viewState: 'empty',
      pageInfo: this._readPageInfo(),
      messages: [],
      isProcessing: false,
      sessions: [],
      currentSessionId: null,
      searchInputValue: '',
      searchQuery: '',
      sessionSiteFilter: '',
      sessionProjectFilter: '',
      sessionLoading: false,
      sidebarCollapsed: false,
      sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
      batchMode: false,
      selectedSessionIds: [],
      draftImages: [],
      contextEnabled: true,
      knowledgeGrounded: false,
      ragScope: '',
      ragScopeIsFile: false,
      ragSources: [],
      ragStatus: null,
      ragStatusLoading: false,
      sidebarView: 'sessions',
      recentBugs: [],
      recentBugsLoading: false,
      recentBugsError: '',
      knowledgeTree: [],
      knowledgeLoading: false,
      knowledgeError: '',
      knowledgeStories: [],
      knowledgeStoriesLoading: false,
      knowledgeStoriesError: '',
      knowledgePreviewVisible: false,
      knowledgePreviewPath: '',
      knowledgePreviewData: null,
      knowledgePreviewLoading: false,
      saveToKnowledgeVisible: false,
      saveToKnowledgeDraftPath: '',
      saveToKnowledgeDraftMetadata: {
        title: '',
        category: '',
        tags: '',
        type: '',
      },
      saveToKnowledgeLoading: false,
      saveToKnowledgeTimestamp: null,
      ragPreviewSources: [],
      ragPreviewLoading: false,
      ragPreviewVisible: false,
      ragPreviewQuestion: '',
      ragCategories: null,
      ragCategoriesLoading: false,
      knowledgeCategoryFilter: '',
      ragDecomposeVisible: false,
      ragDecomposeLoading: false,
      ragDecomposeData: null,
      ragDecomposeQuestion: '',
      sessionSummaryVisible: false,
      sessionSummaryLoading: false,
      sessionSummaryText: '',
      sessionSummaryError: '',
      bugReportVisible: false,
      bugReportLoading: false,
      bugReportDraft: {
        title: '',
        project: '',
        module: '',
        severity: 'minor',
        priority: 'p2',
        status: 'open',
        type: 'functional',
        frequency: 'always',
        assignee: '',
        reporter: '',
        environment: '',
        affectedVersion: '',
        fixedVersion: '',
        tags: '',
        description: '',
        stepsToReproduce: '',
        expectedResult: '',
        actualResult: '',
      },
      weChatRobots: [],
      weChatRobotsDraft: [],
      weChatSettingsVisible: false,
      colorIndex: colorIndex,
      systemPrompt: systemPrompt || '',
      roleName: 'Teacher',
      roleImageUrl: '',
      streamingTargetTimestamp: null,
      streamingType: '',
      streamingPhase: '',
      agentMode: false,
      agentTodos: [],
      agentToolCalls: [],
      pendingConfirmation: null,
      pendingQuestion: null,
      agentNotes: [],
      agentTools: [],
      agentSkills: [],
      agentToolsVisible: false,
      agentToolsLoading: false,
      scrollTick: 0,
      copyFeedback: {},
      feedback: {},
      faqVisible: false,
      faqSearch: '',
      faqApplyMode: 'append',
      sessionEditVisible: false,
      contextEditorVisible: false,
      contextEditorDraft: '',
      tagManagerVisible: false,
      inputTemplate: '',
      promptHistory: [],
      promptHistoryVisible: false,
      ws: {
        x: Math.max(0, vw - DEFAULT_WIDTH),
        y: 60,
        width: DEFAULT_WIDTH,
        height: Math.min(DEFAULT_HEIGHT, vh - 100),
        isFullscreen: false,
      },
      isDragging: false,
      isResizing: false,
    };

    this._loadPersistedState();
  }

  // ── External store ─────────────────────────────────────────────────

  subscribe = (listener: () => void): (() => void) => {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  };

  getSnapshot = (): ChatState => this.state;

  setColorIndex = (idx: number) => {
    if (!Number.isFinite(idx) || idx === this.state.colorIndex) return;
    this.state.colorIndex = idx;
    this._emit();
  };

  setSystemPrompt = (text: string) => {
    const next = String(text || '');
    if (next === this.state.systemPrompt) return;
    this.state.systemPrompt = next;
    this._emit();
  };

  setRole = (name: string, imageUrl: string) => {
    const nextName = String(name || '');
    const nextUrl = String(imageUrl || '');
    if (nextName === this.state.roleName && nextUrl === this.state.roleImageUrl) return;
    this.state.roleName = nextName;
    this.state.roleImageUrl = nextUrl;
    this._emit();
  };

  setNotifyHandler(handler: NotifyHandler): void {
    this._notifyHandler = handler;
  }

  private _emit(): void {
    this.state = { ...this.state };
    for (const l of this._listeners) l();
  }

  /** Initialize the controller after the React tree mounts. */
  mount() {
    this._init();
  }

  unmount() {
    document.removeEventListener('mousemove', this._onDragMove);
    document.removeEventListener('mouseup', this._onDragEnd);
    document.removeEventListener('mousemove', this._onResizeMove);
    document.removeEventListener('mouseup', this._onResizeEnd);
    document.removeEventListener('mousemove', this._onSidebarResizeMove);
    document.removeEventListener('mouseup', this._onSidebarResizeEnd);
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }
    if (this._searchTimer) {
      clearTimeout(this._searchTimer);
      this._searchTimer = null;
    }
    if (this._scrollTimer) {
      clearTimeout(this._scrollTimer);
      this._scrollTimer = null;
    }
  }

  // ── Public API ─────────────────────────────────────────────────────

  toggle = () => {
    if (!this.state.visible) this.open();
    else this.close();
  };

  open = () => {
    this.state.visible = true;
    this.state.pageInfo = this._readPageInfo();
    this._emit();
    this._loadSessions().then(() => this._findOrCreateSession());
  };

  close = () => this.setState({ visible: false });

  // ── Notification ───────────────────────────────────────────────────

  private _notify(message: string, type: NotifyType = 'info') {
    if (this._notifyHandler) this._notifyHandler(message, type);
  }

  // ── Init ──────────────────────────────────────────────────────────

  private async _init() {
    await this._loadSessions();
    await this._findOrCreateSession();
    this._emit();
  }

  // ── State ──────────────────────────────────────────────────────────

  private setState(patch: Partial<ChatState>) {
    Object.assign(this.state, patch);
    this._emit();
  }

  // ── Persisted State ─────────────────────────────────────────────────

  private async _loadPersistedState() {
    try {
      if (
        typeof chrome === 'undefined' ||
        !chrome?.storage?.local ||
        typeof chrome.storage.local.get !== 'function'
      )
        return;

      const result = await new Promise<Record<string, unknown>>((resolve) => {
        chrome.storage.local.get(
          [
            'sidebarWidth',
            'sidebarCollapsed',
            'contextEnabled',
            'weChatRobots',
            'knowledgeGrounded',
            'ragScope',
            'ragScopeIsFile',
            'promptHistory',
            'agentMode',
          ],
          (items) => resolve(items || {}),
        );
      });

      if (typeof result.sidebarWidth === 'number') {
        this.state.sidebarWidth = Math.min(
          Math.max(MIN_SIDEBAR_WIDTH, result.sidebarWidth),
          MAX_SIDEBAR_WIDTH,
        );
      }
      if (typeof result.sidebarCollapsed === 'boolean') {
        this.state.sidebarCollapsed = result.sidebarCollapsed;
      }
      if (typeof result.contextEnabled === 'boolean') {
        this.state.contextEnabled = result.contextEnabled;
      }
      if (typeof result.knowledgeGrounded === 'boolean') {
        this.state.knowledgeGrounded = result.knowledgeGrounded;
      }
      if (typeof result.ragScope === 'string') {
        this.state.ragScope = result.ragScope;
      }
      if (typeof result.ragScopeIsFile === 'boolean') {
        this.state.ragScopeIsFile = result.ragScopeIsFile;
      }
      if (Array.isArray(result.weChatRobots)) {
        this.state.weChatRobots = (result.weChatRobots as WeWorkBot[]).filter(
          (r) => r && typeof r === 'object' && typeof r.webhook === 'string',
        );
      }
      if (Array.isArray(result.promptHistory)) {
        this.state.promptHistory = (result.promptHistory as unknown[])
          .filter((s): s is string => typeof s === 'string')
          .slice(-100);
      }
      if (typeof result.agentMode === 'boolean') {
        this.state.agentMode = result.agentMode;
      }
    } catch {
      /* ignore */
    }
  }

  private _persistSetting(key: string, value: unknown) {
    try {
      if (
        typeof chrome !== 'undefined' &&
        chrome?.storage?.local &&
        typeof chrome.storage.local.set === 'function'
      ) {
        chrome.storage.local.set({ [key]: value });
      }
    } catch {
      /* ignore */
    }
  }

  // ── Page Info ──────────────────────────────────────────────────────

  private _readPageInfo() {
    return {
      title: document.title || 'Current page',
      url: window.location.href,
      iconUrl: (document.querySelector('link[rel~="icon"]') as HTMLLinkElement)?.href || '',
    };
  }

  /** pageContent for the currently-active session, or '' if none. */
  private _currentPageContent(): string {
    const s = this.state.sessions.find((x) => x.id === this.state.currentSessionId);
    return (s?.pageContent || '').trim();
  }

  // ── Sessions ───────────────────────────────────────────────────────

  private async _loadSessions() {
    // Reuse in-flight promise so concurrent callers (e.g. open() and sendMessage())
    // don't trigger duplicate backend fetches or race past an unloaded sessions list.
    if (this._loadSessionsPromise) return this._loadSessionsPromise;
    const p = (async () => {
      this.state.sessionLoading = true;
      this._emit();
      try {
        const result = await this._sessions.list();
        const records = result.ok ? result.data : [];
        this.state.sessions = records.map((r) => ({
          id: r.key,
          title: r.title || 'Untitled conversation',
          url: r.url || '',
          createdAt: r.createdAt || 0,
          updatedAt: r.updatedAt || 0,
          messageCount: Array.isArray(r.messages) ? r.messages.length : 0,
          messages: r.messages,
          isFavorite: !!(r as any).isFavorite,
          tags: Array.isArray((r as any).tags) ? (r as any).tags! : [],
        }));
        this.state.sessions.sort((a, b) => {
          if (!!a.isFavorite !== !!b.isFavorite) return a.isFavorite ? -1 : 1;
          return (b.updatedAt || 0) - (a.updatedAt || 0);
        });
      } catch {
        /* ignore */
      }
      this.state.sessionLoading = false;
      this._emit();
    })();
    this._loadSessionsPromise = p;
    try {
      await p;
    } finally {
      this._loadSessionsPromise = null;
    }
  }

  private async _findOrCreateSession() {
    const url = window.location.href;
    const existing = this.state.sessions.find((s) => s.url === url);
    if (existing) {
      this.state.currentSessionId = existing.id;
      this.state.title = existing.title || 'Untitled conversation';
      const msgs = existing.messages || [];
      this.state.messages = this._mapMessages(msgs);
      this.state.viewState = msgs.length > 0 ? 'messages' : 'empty';
      this._emit();

      try {
        const getResult = await this._sessions.get(existing.id);
        const record = getResult.ok ? getResult.data : null;
        if (record?.messages) {
          this.state.messages = this._mapMessages(record.messages);
          this.state.viewState = record.messages.length > 0 ? 'messages' : 'empty';
          this._emit();
        }
        if (record && 'pageContent' in record) {
          existing.pageContent = (record as { pageContent?: string }).pageContent || '';
        }
      } catch {
        /* use cached messages */
      }
      return;
    }

    const title = document.title?.trim()
      ? document.title.endsWith('.md')
        ? document.title
        : `${document.title}.md`
      : 'New conversation.md';
    const now = Date.now();
    try {
      const createResult = await this._sessions.create({
        url,
        title,
        pageDescription:
          (document.querySelector('meta[name="description"]') as HTMLMetaElement)?.content || '',
        createdAt: now,
        updatedAt: now,
        lastAccessTime: now,
        messages: [],
        tags: [],
      });
      const record = createResult.ok ? createResult.data : null;
      if (record?.key) {
        this.state.sessions.unshift({
          id: record.key,
          title: record.title || title,
          url: record.url || url,
          createdAt: record.createdAt || now,
          updatedAt: record.updatedAt || now,
          messageCount: 0,
          isFavorite: false,
          tags: [],
        });
        this.state.currentSessionId = record.key;
      }
    } catch {
      /* ignore */
    }
    this.state.viewState = 'empty';
    this._emit();
  }

  async selectSession(id: string) {
    // Abort any in-flight stream before switching — otherwise chunks would
    // be silently dropped (findPetIdx returns -1 in the new session), the
    // old pet message would be abandoned as empty text, and the old stream
    // would keep running / auto-forward to WeCom with no way to stop.
    if (this.state.isProcessing) this.stopSending();
    this.state.currentSessionId = id;
    // Reset the editor draft — openContextEditor will re-populate it from
    // the new session's pageContent. Without this, the draft from the
    // previous session would leak into the editor UI.
    this.state.contextEditorDraft = '';
    const session = this.state.sessions.find((s) => s.id === id);
    if (session) {
      this.state.title = session.title || 'Untitled conversation';
      this.state.messages = this._mapMessages(session.messages || []);
      this.state.viewState = this.state.messages.length > 0 ? 'messages' : 'empty';

      try {
        const getResult = await this._sessions.get(id);
        const record = getResult.ok ? getResult.data : null;
        if (record?.messages) {
          this.state.messages = this._mapMessages(record.messages);
          this.state.viewState = record.messages.length > 0 ? 'messages' : 'empty';
        }
        if (record && 'pageContent' in record) {
          session.pageContent = (record as { pageContent?: string }).pageContent || '';
        }
      } catch {
        /* use cached messages */
      }
    }
    this._emit();
  }

  async createSession() {
    // Abort any in-flight stream before creating a new session — mirrors
    // selectSession. Avoids orphan stream writing into stale messages array.
    if (this.state.isProcessing) this.stopSending();
    const url = window.location.href;
    const title = (document.title?.trim() || 'New conversation') + '.md';
    const now = Date.now();
    try {
      const createResult = await this._sessions.create({
        url,
        title,
        createdAt: now,
        updatedAt: now,
        lastAccessTime: now,
        messages: [],
        tags: [],
      });
      const record = createResult.ok ? createResult.data : null;
      if (record?.key) {
        this.state.sessions.unshift({
          id: record.key,
          title: record.title || title,
          url: record.url || url,
          createdAt: record.createdAt || now,
          updatedAt: record.updatedAt || now,
          messageCount: 0,
          isFavorite: false,
          tags: [],
        });
        this.state.currentSessionId = record.key;
        this.state.messages = [];
        this.state.viewState = 'empty';
        this.state.title = record.title || title;
      }
    } catch {
      /* ignore */
    }
    this._emit();
  }

  async deleteSession(id: string) {
    const result = await this._sessions.delete(id);
    const ok = result.ok && result.data === true;
    if (ok) {
      const idx = this.state.sessions.findIndex((s) => s.id === id);
      if (idx >= 0) this.state.sessions.splice(idx, 1);
      if (this.state.currentSessionId === id) {
        this.state.currentSessionId =
          this.state.sessions.length > 0 ? this.state.sessions[0].id : null;
        if (this.state.currentSessionId) await this.selectSession(this.state.currentSessionId);
        else {
          this.state.messages = [];
          this.state.viewState = 'empty';
          this.state.title = 'Chat with me';
        }
      }
    }
    this._emit();
  }

  async toggleFavorite(id: string) {
    const session = this.state.sessions.find((s) => s.id === id);
    if (!session) return;
    const next = !session.isFavorite;
    (session as SessionItem & { isFavorite: boolean }).isFavorite = next;
    this._resortSessions();
    this._emit();
    try {
      await this._sessions.update(id, { isFavorite: next });
    } catch {
      session.isFavorite = !next;
      this._resortSessions();
      this._emit();
    }
  }

  async renameSession(id: string, title: string) {
    const session = this.state.sessions.find((s) => s.id === id);
    if (!session) return;
    const trimmed = (title || '').trim();
    if (!trimmed || trimmed === session.title) return;
    const prev = session.title;
    session.title = trimmed;
    if (this.state.currentSessionId === id) this.state.title = trimmed;
    this._emit();
    try {
      await this._sessions.update(id, { title: trimmed });
    } catch {
      session.title = prev;
      if (this.state.currentSessionId === id) this.state.title = prev;
      this._emit();
    }
  }

  private _resortSessions() {
    this.state.sessions.sort((a, b) => {
      const aIsFavorite = !!(a as SessionItem & { isFavorite?: boolean }).isFavorite;
      const bIsFavorite = !!(b as SessionItem & { isFavorite?: boolean }).isFavorite;
      if (aIsFavorite !== bIsFavorite) return aIsFavorite ? -1 : 1;

      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
  }

  // ── Search (debounced) ─────────────────────────────────────────────

  onSearchInput = (value: string) => {
    this.state.searchInputValue = value;
    this._emit();
    if (this._searchTimer) clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      this.state.searchQuery = value.toLowerCase().trim();
      this.state.searchInputValue = value;
      this._emit();
    }, 300);
  };

  clearSearch = () => {
    if (this._searchTimer) clearTimeout(this._searchTimer);
    this.setState({ searchInputValue: '', searchQuery: '' });
  };

  /** Normalize a URL to its "site key": hostname + pathname + hash-path
   *  (no query string, no hash query). Two URLs with the same site key refer
   *  to the same logical page — so sessions created from either can be
   *  surfaced together when filtering by current page. */
  static siteKeyFromUrl(url: string): string {
    if (!url) return '';
    try {
      const u = new URL(url, window.location.origin);
      let key = u.hostname + u.pathname;
      if (u.hash) {
        const hashPath = u.hash.split('?')[0];
        if (hashPath) key += hashPath;
      }
      return key.toLowerCase();
    } catch {
      return '';
    }
  }

  /** Filter the session list to only those whose URL matches the current
   *  page's site key. Toggle: if already filtered to this page, clears. */
  filterSessionsByCurrentPage = () => {
    const current = ChatController.siteKeyFromUrl(this.state.pageInfo?.url || window.location.href);
    if (!current) {
      this._notify('Cannot identify current page', 'warning');
      return;
    }
    this.state.sessionSiteFilter = this.state.sessionSiteFilter === current ? '' : current;
    this._emit();
  };

  clearSessionSiteFilter = () => {
    if (!this.state.sessionSiteFilter) return;
    this.state.sessionSiteFilter = '';
    this._emit();
  };

  get filteredSessions(): SessionItem[] {
    const q = this.state.searchQuery;
    const site = this.state.sessionSiteFilter;
    let list = this.state.sessions;
    if (site) {
      list = list.filter((s) => ChatController.siteKeyFromUrl(s.url) === site);
    }
    if (!q) return list;
    return list.filter((s) => s.title.toLowerCase().includes(q) || s.url.toLowerCase().includes(q));
  }

  // ── Batch Mode ─────────────────────────────────────────────────────

  enterBatchMode = () => {
    this.setState({ batchMode: true, selectedSessionIds: [] });
  };

  exitBatchMode = () => {
    this.setState({ batchMode: false, selectedSessionIds: [] });
  };

  toggleBatchMode = () => {
    if (this.state.batchMode) this.exitBatchMode();
    else this.enterBatchMode();
  };

  toggleSessionSelection = (id: string) => {
    const ids = [...this.state.selectedSessionIds];
    const idx = ids.indexOf(id);
    if (idx >= 0) ids.splice(idx, 1);
    else ids.push(id);
    this.setState({ selectedSessionIds: ids });
  };

  async bulkDeleteSessions() {
    const ids = this.state.selectedSessionIds;
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} selected conversation(s)?`)) return;

    for (const id of ids) {
      try {
        await this._sessions.delete(id);
      } catch {
        /* continue */
      }
    }

    this.state.sessions = this.state.sessions.filter((s) => !ids.includes(s.id));
    if (this.state.currentSessionId && ids.includes(this.state.currentSessionId)) {
      this.state.currentSessionId =
        this.state.sessions.length > 0 ? this.state.sessions[0].id : null;
      if (this.state.currentSessionId) await this.selectSession(this.state.currentSessionId);
      else {
        this.state.messages = [];
        this.state.viewState = 'empty';
        this.state.title = 'Chat with me';
      }
    }
    this.setState({ batchMode: false, selectedSessionIds: [] });
  }

  // ── Messages ──────────────────────────────────────────────────────

  private _mapMessages(raw: ChatMessage[]): Message[] {
    return raw
      .filter(
        (m) =>
          !!(m.content || m.message || '').trim() ||
          m.type === 'pet' ||
          !!m.imageDataUrl ||
          (Array.isArray(m.imageDataUrls) && m.imageDataUrls.length > 0),
      )
      .map((m) => ({
        type: m.type,
        content: m.content || m.message || '',
        timestamp: m.timestamp || Date.now(),
        error: !!m.error,
        aborted: !!m.aborted,
        imageDataUrl: m.imageDataUrl,
        imageDataUrls: Array.isArray(m.imageDataUrls) ? m.imageDataUrls : undefined,
      }));
  }

  sendMessage = async (text: string, images?: string[]) => {
    const imageList = images || this.state.draftImages || [];
    if (!text.trim() && imageList.length === 0) return;
    if (this.state.isProcessing) return;
    if (text.trim()) this.pushPromptHistory(text);
    if (!this.state.currentSessionId) {
      await this._loadSessions();
      await this._findOrCreateSession();
      if (!this.state.currentSessionId) return;
    }

    const now = Date.now();
    const userMsg: Message = {
      type: 'user',
      content: text,
      timestamp: now,
      imageDataUrl: imageList.length > 0 ? imageList[0] : undefined,
      imageDataUrls: imageList.length > 0 ? imageList : undefined,
    };
    const petMsg: Message = {
      type: 'pet',
      content: '',
      timestamp: now + 1,
      streaming: true,
    };
    this.state.messages.push(userMsg, petMsg);
    this.state.viewState = 'messages';
    this.state.isProcessing = true;
    this.state.draftImages = [];
    const userIdx = this.state.messages.length - 2;
    this._emit();

    if (this.state.agentMode) {
      await this._runAgentStream(userIdx, petMsg.timestamp);
    } else {
      await this._runStream(userIdx, petMsg.timestamp, 'send');
    }
  };

  /**
   * Shared streaming helper — sends the latest user message to the chat
   * service and writes streamed chunks into the pet message identified by
   * `petTimestamp`. Mirrors YiVad runStream (single-turn payload form).
   */
  private async _runStream(
    userIdx: number,
    petTimestamp: number,
    type: 'send' | 'regenerate' | 'resend',
  ) {
    const slice = this.state.messages.slice(0, userIdx + 1);
    const lastUserMsg = slice[slice.length - 1];
    const images =
      lastUserMsg?.imageDataUrls ?? (lastUserMsg?.imageDataUrl ? [lastUserMsg.imageDataUrl] : []);
    const sessionPageContent = this._currentPageContent();
    const userContent =
      this.state.contextEnabled && sessionPageContent
        ? `${sessionPageContent}\n\n---\n\n${lastUserMsg?.content || ''}`
        : lastUserMsg?.content || '';

    this.state.streamingTargetTimestamp = petTimestamp;
    this.state.streamingType = type;
    this.state.isProcessing = true;
    this.state.streamingPhase = this.state.knowledgeGrounded ? 'retrieving' : 'thinking';
    // Clear sources from previous turn — only show sources for the in-flight one.
    this.state.ragSources = [];
    this._abortController = new AbortController();
    let streamed = '';
    let lastScrollAt = 0;
    let phaseFlipped = false;
    const SCROLL_THROTTLE_MS = 120;

    const findPetIdx = () => this.state.messages.findIndex((m) => m.timestamp === petTimestamp);

    const onToken = (token: string) => {
      streamed += token;
      if (!phaseFlipped) {
        phaseFlipped = true;
        this.state.streamingPhase = 'streaming';
      }
      const idx = findPetIdx();
      if (idx >= 0) {
        this.state.messages[idx].content = streamed;
        this.state.messages[idx].error = false;
        this.state.messages[idx].aborted = false;
      }
      const now2 = Date.now();
      if (now2 - lastScrollAt > SCROLL_THROTTLE_MS) {
        lastScrollAt = now2;
        this.state.scrollTick++;
      }
      this._emit();
    };

    try {
      if (this.state.knowledgeGrounded) {
        const useFileChat = this.state.ragScopeIsFile && !!this.state.ragScope;
        const groundedQuestion = this.state.systemPrompt
          ? `${this.state.systemPrompt}\n\n${userContent}`
          : userContent;
        if (useFileChat) {
          // Per-file endpoint takes {target_file, question} — single-turn.
          streamed = await this._rag.streamFileChat(
            {
              target_file: this.state.ragScope,
              question: groundedQuestion,
            },
            {
              onChunk: onToken,
              onSources: (sources: RagSource[]) => {
                this.state.ragSources = sources;
                this._emit();
              },
            },
            this._abortController.signal,
          );
        } else {
          const messages: RagChatMessage[] = [];
          if (this.state.systemPrompt) {
            messages.push({ role: 'system', content: this.state.systemPrompt });
          }
          messages.push({ role: 'user', content: userContent });
          streamed = await this._rag.streamChat(
            {
              messages,
              scope: this.state.ragScope || undefined,
              category: this.state.knowledgeCategoryFilter || undefined,
            },
            {
              onChunk: onToken,
              onSources: (sources: RagSource[]) => {
                this.state.ragSources = sources;
                this._emit();
              },
            },
            this._abortController.signal,
          );
        }
      } else {
        streamed = await this._chat.streamWithCallback(
          {
            system: this.state.systemPrompt,
            user: userContent,
            model: DEFAULT_MODEL,
            images: images.length > 0 ? images : undefined,
          },
          onToken,
          this._abortController.signal,
        );
      }

      const idx = findPetIdx();
      if (idx >= 0) {
        const final = streamed.trim() || 'Please continue.';
        this.state.messages[idx].streaming = false;
        this.state.messages[idx].content = final;
      }
      const target = this.state.sessions.find((s) => s.id === this.state.currentSessionId);
      if (target) target.messageCount = this.state.messages.length;

      this._persistMessages();
      if (streamed.trim()) this._forwardToWeWorkBots(streamed);
    } catch (err: unknown) {
      const isAbort = (err as Error)?.name === 'AbortError';
      const idx = findPetIdx();
      if (idx >= 0) {
        this.state.messages[idx].streaming = false;
        if (isAbort) {
          this.state.messages[idx].aborted = true;
          this.state.messages[idx].content = streamed.trim() || 'Stopped';
        } else {
          this.state.messages[idx].error = true;
          this.state.messages[idx].content =
            streamed || `❌ ${(err as Error).message || 'Generation failed'}`;
        }
      }
      this._persistMessages();
    } finally {
      this.state.isProcessing = false;
      this.state.streamingTargetTimestamp = null;
      this.state.streamingType = '';
      this.state.streamingPhase = '';
      this._abortController = null;
      setTimeout(() => this.scrollToBottom(true), 50);
      this._emit();
    }
  }

  /**
   * Agent-mode streaming helper — routes the conversation through the agent's
   * tool-calling loop (`/agent/chat`) instead of the plain chat endpoint. The
   * backend emits structured SSE events (thinking deltas, tool lifecycle,
   * confirmation gates, todo updates, ask_user prompts) which we fold into the
   * pet message + live timeline state.
   */
  private async _runAgentStream(userIdx: number, petTimestamp: number) {
    const slice = this.state.messages.slice(0, userIdx + 1);
    const lastUserMsg = slice[slice.length - 1];
    const images =
      lastUserMsg?.imageDataUrls ?? (lastUserMsg?.imageDataUrl ? [lastUserMsg.imageDataUrl] : []);
    const sessionPageContent = this._currentPageContent();
    const userContent =
      this.state.contextEnabled && sessionPageContent
        ? `${sessionPageContent}\n\n---\n\n${lastUserMsg?.content || ''}`
        : lastUserMsg?.content || '';

    this.state.streamingTargetTimestamp = petTimestamp;
    this.state.streamingType = 'send';
    this.state.isProcessing = true;
    this.state.streamingPhase = 'thinking';
    this.state.ragSources = [];
    this.state.agentTodos = [];
    this.state.agentToolCalls = [];
    this.state.pendingConfirmation = null;
    this.state.pendingQuestion = null;
    this.state.agentNotes = [];
    this._abortController = new AbortController();

    let streamed = '';
    let lastScrollAt = 0;
    const SCROLL_THROTTLE_MS = 120;

    const findPetIdx = () => this.state.messages.findIndex((m) => m.timestamp === petTimestamp);

    const onToken = (token: string) => {
      streamed += token;
      this.state.streamingPhase = 'streaming';
      const idx = findPetIdx();
      if (idx >= 0) {
        this.state.messages[idx].content = streamed;
        this.state.messages[idx].error = false;
        this.state.messages[idx].aborted = false;
      }
      const now2 = Date.now();
      if (now2 - lastScrollAt > SCROLL_THROTTLE_MS) {
        lastScrollAt = now2;
        this.state.scrollTick++;
      }
      this._emit();
    };

    // Send the full user-visible history so the agent has context. The agent's
    // own multi-turn loop accumulates further on the backend keyed by session_id.
    const messages: AgentChatMessage[] = [];
    if (this.state.systemPrompt) {
      messages.push({ role: 'system', content: this.state.systemPrompt });
    }
    for (const m of slice) {
      if (m.type === 'user') {
        messages.push({ role: 'user', content: m === lastUserMsg ? userContent : m.content });
      } else if (m.type === 'pet' && (m.content || '').trim()) {
        messages.push({ role: 'assistant', content: m.content });
      }
    }

    try {
      const payload: AgentChatPayload = {
        messages,
        model: DEFAULT_MODEL,
        session_id: this._agentSessionId(),
        images: images.length > 0 ? images : undefined,
      };
      for await (const chunk of this._agent.stream(payload, this._abortController.signal)) {
        if (chunk.error) throw new Error(chunk.error);
        if (chunk.done) break;
        const ev = chunk.data as AgentStreamEvent | undefined;
        if (!ev) continue;
        this._handleAgentEvent(ev, onToken);
      }

      const idx = findPetIdx();
      if (idx >= 0) {
        const final = streamed.trim() || 'Please continue.';
        this.state.messages[idx].streaming = false;
        this.state.messages[idx].content = final;
      }
      const target = this.state.sessions.find((s) => s.id === this.state.currentSessionId);
      if (target) target.messageCount = this.state.messages.length;

      this._persistMessages();
      if (streamed.trim()) this._forwardToWeWorkBots(streamed);
    } catch (err: unknown) {
      const isAbort = (err as Error)?.name === 'AbortError';
      const idx = findPetIdx();
      if (idx >= 0) {
        this.state.messages[idx].streaming = false;
        if (isAbort) {
          this.state.messages[idx].aborted = true;
          this.state.messages[idx].content = streamed.trim() || 'Stopped';
        } else {
          this.state.messages[idx].error = true;
          this.state.messages[idx].content =
            streamed || `❌ ${(err as Error).message || 'Agent run failed'}`;
        }
      }
      this._persistMessages();
    } finally {
      this.state.isProcessing = false;
      this.state.streamingTargetTimestamp = null;
      this.state.streamingType = '';
      this.state.streamingPhase = '';
      this.state.pendingConfirmation = null;
      this.state.pendingQuestion = null;
      this._abortController = null;
      setTimeout(() => this.scrollToBottom(true), 50);
      this._emit();
    }
  }

  /** Fold one agent SSE event into the live pet message + timeline state. */
  private _handleAgentEvent(ev: AgentStreamEvent, onToken: (token: string) => void) {
    switch (ev.type) {
      case 'thinking':
        // Content deltas arrive twice (THINKING event + raw {data:{message}} frame).
        // Accumulate from the structured event only to avoid double-counting.
        if (ev.delta) onToken(ev.delta);
        break;
      case 'tool_execution_start': {
        const name = ev.tool?.name || ev.tool_name || 'tool';
        const existing = this.state.agentToolCalls.find(
          (t) => t.name === name && t.status === 'running',
        );
        if (existing) existing.status = 'running';
        else
          this.state.agentToolCalls.push({
            id: `t${++this._agentToolSeq}`,
            name,
            status: 'running',
          });
        this._emit();
        break;
      }
      case 'tool_execution_end': {
        const name = ev.tool?.name || ev.tool_name || 'tool';
        const status = ev.tool?.error ? 'error' : 'done';
        const running = this.state.agentToolCalls.find(
          (t) => t.name === name && t.status === 'running',
        );
        if (running) {
          running.status = status;
          running.content = ev.tool?.content;
          running.error = ev.tool?.error;
        } else {
          this.state.agentToolCalls.push({
            id: `t${++this._agentToolSeq}`,
            name,
            status,
            content: ev.tool?.content,
            error: ev.tool?.error,
          });
        }
        // A confirmation for this tool is now resolved (executed OR skipped).
        if (this.state.pendingConfirmation?.toolName === name) {
          this.state.pendingConfirmation = null;
        }
        this._emit();
        break;
      }
      case 'confirmation_required': {
        this.state.pendingConfirmation = {
          confirmationId: ev.confirmation_id || '',
          toolName: ev.tool_name || 'tool',
          toolArgs: ev.tool_args || {},
        };
        this._emit();
        break;
      }
      case 'todo_update': {
        const msg = ev.message as { todos?: TodoItem[] } | undefined;
        this.state.agentTodos = Array.isArray(msg?.todos) ? msg.todos : [];
        this._emit();
        break;
      }
      case 'ask_user': {
        this.state.pendingQuestion = {
          questionId: ev.question_id || '',
          question: ev.question || '',
          options: Array.isArray(ev.options) ? ev.options : [],
        };
        this._emit();
        break;
      }
      case 'model_switch': {
        const msg = ev.message as { from?: string; to?: string } | undefined;
        if (msg?.from && msg?.to) {
          this.state.agentNotes.push({
            id: ++this._agentNoteSeq,
            kind: 'model_switch',
            text: `模型自动切换：${msg.from} → ${msg.to}`,
          });
          this._emit();
        }
        break;
      }
      case 'agent_end': {
        if (ev.stop_reason === 'max_turns_reached') {
          this.state.agentNotes.push({
            id: ++this._agentNoteSeq,
            kind: 'agent_end',
            text: '已达到最大轮次，任务可能未完成。回复「继续」可接着完成。',
          });
          this._emit();
        }
        break;
      }
      case 'error': {
        if (ev.error) {
          this.state.agentNotes.push({
            id: ++this._agentNoteSeq,
            kind: 'error',
            text: ev.error,
          });
          this._emit();
        }
        break;
      }
      default:
        // turn_start/end, message_start/end, compaction, tool_execution_update,
        // and raw {message} frames are ignored (content comes from `thinking`).
        break;
    }
  }

  stopSending = () => {
    const targetTs = this.state.streamingTargetTimestamp;
    this._abortController?.abort();
    this._abortController = null;
    this.state.isProcessing = false;
    this.state.streamingTargetTimestamp = null;
    this.state.streamingType = '';
    this.state.streamingPhase = '';
    if (targetTs !== null) {
      const idx = this.state.messages.findIndex((m) => m.timestamp === targetTs);
      if (idx >= 0) {
        const trimmed = (this.state.messages[idx].content || '').trim();
        this.state.messages[idx].streaming = false;
        this.state.messages[idx].aborted = true;
        this.state.messages[idx].content = trimmed || 'Stopped';
      }
    }
    this._persistMessages();
    this._emit();
  };

  // ── Agent Mode ─────────────────────────────────────────────────────

  /** Agent session key — shared with the backend's steering/confirmation stores. */
  private _agentSessionId(): string {
    return this.state.currentSessionId ? `yipet:${this.state.currentSessionId}` : '';
  }

  toggleAgentMode = () => {
    const value = !this.state.agentMode;
    this.state.agentMode = value;
    this._persistSetting('agentMode', value);
    this._emit();
  };

  /** Open the tool/skill browser drawer, lazily fetching the catalog once. */
  openAgentTools = async () => {
    this.state.agentToolsVisible = true;
    this._emit();
    if (this.state.agentTools.length || this.state.agentSkills.length) return;
    if (this.state.agentToolsLoading) return;
    this.state.agentToolsLoading = true;
    this._emit();
    try {
      const data = await this._agent.listTools();
      this.state.agentTools = data.tools ?? [];
      this.state.agentSkills = data.skills ?? [];
    } catch (err) {
      this._notify((err as Error)?.message || 'Failed to load agent tools', 'error');
    } finally {
      this.state.agentToolsLoading = false;
      this._emit();
    }
  };

  closeAgentTools = () => {
    this.state.agentToolsVisible = false;
    this._emit();
  };

  approvePendingConfirmation = () => {
    const c = this.state.pendingConfirmation;
    if (!c) return;
    this.state.pendingConfirmation = null;
    this._emit();
    this._agent.confirm(this._agentSessionId(), c.confirmationId, true).catch(() => {});
    this._notify(`Approved ${c.toolName}`, 'success');
  };

  rejectPendingConfirmation = () => {
    const c = this.state.pendingConfirmation;
    if (!c) return;
    this.state.pendingConfirmation = null;
    this._emit();
    this._agent.confirm(this._agentSessionId(), c.confirmationId, false).catch(() => {});
    this._notify(`Rejected ${c.toolName}`, 'info');
  };

  answerPendingQuestion = (answer: string) => {
    const q = this.state.pendingQuestion;
    if (!q) return;
    this.state.pendingQuestion = null;
    this._emit();
    this._agent.answer(q.questionId, answer).catch(() => {});
    this._notify('Answer sent to agent', 'success');
  };

  /** Steer a running agent mid-turn (redirect without waiting for a fresh turn). */
  steerAgent = (message: string) => {
    const sid = this._agentSessionId();
    if (!sid || !message.trim()) return;
    this._agent.steer(sid, message).catch(() => {});
  };

  /** Queue a follow-up that runs after the agent would otherwise stop. */
  followUpAgent = (message: string) => {
    const sid = this._agentSessionId();
    if (!sid || !message.trim()) return;
    this._agent.followUp(sid, message).catch(() => {});
  };

  submitFeedback = (timestamp: number, rating: 'like' | 'dislike') => {
    const current = this.state.feedback[timestamp];
    const next = current === rating ? null : rating;
    this.state.feedback = { ...this.state.feedback, [timestamp]: next };
    this._emit();
  };

  // ── Message Actions ───────────────────────────────────────────────

  copyMessage = async (text: string, timestamp?: number) => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      if (timestamp !== undefined) {
        this.state.copyFeedback = {
          ...this.state.copyFeedback,
          [String(timestamp)]: 'copied',
        };
        this._emit();
        setTimeout(() => {
          const next = { ...this.state.copyFeedback };
          delete next[String(timestamp)];
          this.state.copyFeedback = next;
          this._emit();
        }, 2000);
      } else {
        this._notify('Copied', 'success');
      }
    } catch {
      /* ignore */
    }
  };

  editMessage = (idx: number, content?: string) => {
    const msg = this.state.messages[idx];
    if (msg?.type !== 'user') return;
    if (content === undefined) return;
    if (content === msg.content) return;
    msg.content = content;
    this._persistMessages();
    this._emit();
  };

  resendMessage = async (idx: number) => {
    const msg = this.state.messages[idx];
    if (msg?.type !== 'user') return;
    if (this.state.isProcessing) return;
    const text = msg.content?.trim();
    const images = msg.imageDataUrls ?? (msg.imageDataUrl ? [msg.imageDataUrl] : []);
    if (!text && images.length === 0) return;

    const now = Date.now();
    const insertedPet: Message = {
      type: 'pet',
      content: '',
      timestamp: now + 1,
      streaming: true,
    };
    this.state.messages.splice(idx + 1, 0, insertedPet);
    this.state.viewState = 'messages';
    this.state.scrollTick++;
    this._emit();

    await this._runStream(idx, insertedPet.timestamp, 'resend');
  };

  deleteMessage = (idx: number) => {
    if (idx < 0 || idx >= this.state.messages.length) return;
    const msg = this.state.messages[idx];
    let deleteCount = 1;
    if (msg.type === 'user' && idx + 1 < this.state.messages.length) {
      const next = this.state.messages[idx + 1];
      if (next.type === 'pet') deleteCount = 2;
    } else if (msg.type === 'pet' && idx - 1 >= 0) {
      const prev = this.state.messages[idx - 1];
      if (prev.type === 'user') {
        this.state.messages.splice(idx - 1, 2);
      } else {
        this.state.messages.splice(idx, 1);
      }
      this.state.viewState = this.state.messages.length > 0 ? 'messages' : 'empty';
      this._persistMessages();
      this._emit();
      return;
    }
    this.state.messages.splice(idx, deleteCount);
    this.state.viewState = this.state.messages.length > 0 ? 'messages' : 'empty';
    this._persistMessages();
    this._emit();
  };

  moveMessageUp = (idx: number) => {
    if (idx <= 1) return;
    const msg = this.state.messages[idx];
    const isPet = msg.type === 'pet';
    const pairStart = isPet ? idx - 1 : idx;
    if (pairStart < 2) return;
    const prevPairEnd = pairStart - 1;
    const prevMsg = this.state.messages[prevPairEnd];
    const prevIsPet = prevMsg.type === 'pet';
    const prevPairStart = prevIsPet ? prevPairEnd - 1 : prevPairEnd;
    if (prevPairStart < 0) return;

    const currentPair = this.state.messages.splice(pairStart, isPet ? 2 : 1);
    const insertAt = prevPairStart;
    this.state.messages.splice(insertAt, 0, ...currentPair);
    this._persistMessages();
    this._emit();
  };

  moveMessageDown = (idx: number) => {
    if (idx < 0 || idx >= this.state.messages.length) return;
    const msg = this.state.messages[idx];
    const isUser = msg.type === 'user';
    if (!isUser && idx - 1 < 0) return;
    const pairEnd = isUser ? idx + 1 : idx;
    if (pairEnd >= this.state.messages.length - 1) return;
    const nextPairStart = pairEnd + 1;
    if (nextPairStart >= this.state.messages.length) return;

    const nextMsg = this.state.messages[nextPairStart];
    const nextIsUser = nextMsg.type === 'user';
    const nextPairLen = nextIsUser && nextPairStart + 1 < this.state.messages.length ? 2 : 1;

    const nextPair = this.state.messages.splice(nextPairStart, nextPairLen);
    const currentPairStart = isUser ? idx : idx - 1;
    const currentPairLen = isUser && idx + 1 < this.state.messages.length ? 2 : 1;
    const currentPair = this.state.messages.splice(currentPairStart, currentPairLen);
    const insertAt = currentPairStart + nextPair.length;
    this.state.messages.splice(insertAt, 0, ...currentPair);
    this._persistMessages();
    this._emit();
  };

  regenerateMessage = async (idx: number) => {
    const msg = this.state.messages[idx];
    if (msg?.type !== 'pet') return;
    if (this.state.isProcessing) return;
    let userIdx = idx - 1;
    while (userIdx >= 0 && this.state.messages[userIdx].type !== 'user') userIdx--;
    if (userIdx < 0) return;
    const userMsg = this.state.messages[userIdx];
    const text = userMsg.content?.trim();
    const images = userMsg.imageDataUrls ?? (userMsg.imageDataUrl ? [userMsg.imageDataUrl] : []);
    if (!text && images.length === 0) return;

    const petTimestamp = msg.timestamp || Date.now();
    this.state.messages[idx] = {
      type: 'pet',
      content: '',
      timestamp: petTimestamp,
      streaming: true,
      error: false,
      aborted: false,
    };
    this.state.scrollTick++;
    this._emit();

    await this._runStream(userIdx, petTimestamp, 'regenerate');
  };

  private _persistMessages() {
    if (!this.state.currentSessionId) return;
    const msgs: ChatMessage[] = this.state.messages.map((m) => ({
      type: m.type,
      content: m.content,
      timestamp: m.timestamp,
      error: m.error,
      aborted: m.aborted,
      imageDataUrl: m.imageDataUrl,
      imageDataUrls: m.imageDataUrls,
    }));
    this._sessions.update(this.state.currentSessionId, { messages: msgs }).catch(() => {});
  }

  // ── Image Management ───────────────────────────────────────────────

  addDraftImages = (sources: string[]) => {
    const current = this.state.draftImages;
    const remaining = MAX_DRAFT_IMAGES - current.length;
    if (remaining <= 0) return;
    const toAdd = sources.slice(0, remaining);
    this.setState({ draftImages: [...current, ...toAdd] });
  };

  removeDraftImage = (index: number) => {
    const images = [...this.state.draftImages];
    if (index < 0 || index >= images.length) return;
    images.splice(index, 1);
    this.setState({ draftImages: images });
  };

  clearDraftImages = () => {
    this.setState({ draftImages: [] });
  };

  // ── Context Switch ─────────────────────────────────────────────────

  toggleContext = () => {
    const value = !this.state.contextEnabled;
    this.state.contextEnabled = value;
    this._persistSetting('contextEnabled', value);
    this._emit();
  };

  // ── Knowledge-grounded (RAG) ───────────────────────────────────────

  toggleKnowledgeGrounded = () => {
    const value = !this.state.knowledgeGrounded;
    this.state.knowledgeGrounded = value;
    this._persistSetting('knowledgeGrounded', value);
    this._emit();
    // Refresh index status when the user turns grounding on so the toolbar
    // can surface "index not built" before they ask and get an empty answer.
    if (value && !this.state.ragStatus) this.loadRagStatus();
  };

  setRagScope = (scope: string) => {
    const next = String(scope || '');
    if (next === this.state.ragScope) return;
    this.state.ragScope = next;
    this._persistSetting('ragScope', next);
    this._emit();
  };

  clearRagSources = () => {
    if (this.state.ragSources.length === 0) return;
    this.state.ragSources = [];
    this._emit();
  };

  // ── Sidebar view switch ────────────────────────────────────────────

  setSidebarView = (view: 'sessions' | 'knowledge' | 'stories' | 'bugs') => {
    if (this.state.sidebarView === view) return;
    this.state.sidebarView = view;
    this._emit();
    if (view === 'knowledge') {
      if (this.state.knowledgeTree.length === 0) this.loadKnowledgeTree();
      if (!this.state.ragCategories) this.loadRagCategories();
    } else if (view === 'stories') {
      if (this.state.knowledgeStories.length === 0) this.loadKnowledgeStories();
    } else if (view === 'bugs') {
      if (this.state.recentBugs.length === 0) this.loadRecentBugs();
    }
  };

  /** Pull the most recent bugs from MongoDB `bugs`. */
  loadRecentBugs = async (params?: { project?: string; search?: string }) => {
    if (this.state.recentBugsLoading) return;
    this.state.recentBugsLoading = true;
    this.state.recentBugsError = '';
    this._emit();
    try {
      const res = await this._bug.listBugs({
        project: params?.project,
        search: params?.search,
        pageSize: 30,
      });
      if (res.ok && res.data) {
        this.state.recentBugs = res.data.list || [];
      } else {
        this.state.recentBugsError = res.error || 'Failed to load bugs';
      }
    } catch (err) {
      this.state.recentBugsError = (err as Error)?.message || 'Failed to load bugs';
    }
    this.state.recentBugsLoading = false;
    this._emit();
  };

  /** Open the bug detail page in YiVad (`/code-review/bugs/detail/<key>`). */
  openBugInYiVad = (key: string) => {
    if (!key) return;
    const url = `http://localhost:8848/#/code-review/bugs/detail/${encodeURIComponent(key)}?mode=view`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  /** Seed the chat input with the bug's title + key so the user can ask
   *  about it. Optionally turn on knowledge grounding over the bug's
   *  content file so the answer draws on the bug's markdown body. */
  discussBugInChat = (bug: { key: string; title: string; contentPath?: string }) => {
    if (!bug) return;
    const prompt = `Bug ${bug.key} — ${bug.title}\n\nHelp me understand this bug: root cause, impact, and a fix plan.`;
    this.state.searchInputValue = prompt;
    this._emit();
    // Best-effort: scope RAG to the bug's content file if known.
    if (bug.contentPath) {
      this.setRagScopeFromNode(bug.contentPath, true);
      if (!this.state.knowledgeGrounded) this.toggleKnowledgeGrounded();
    }
  };

  /** Fetch the list of project story.md entries. */
  loadKnowledgeStories = async (project?: string) => {
    if (this.state.knowledgeStoriesLoading) return;
    this.state.knowledgeStoriesLoading = true;
    this.state.knowledgeStoriesError = '';
    this._emit();
    try {
      const stories = await this._knowledge.listStoriesAsItems(project);
      this.state.knowledgeStories = stories;
    } catch (err) {
      this.state.knowledgeStoriesError = (err as Error)?.message || 'Failed to load stories';
      this.state.knowledgeStories = [];
    }
    this.state.knowledgeStoriesLoading = false;
    this._emit();
  };

  /** Open the preview modal for a project's story.md. */
  openKnowledgeStory = (project: string, storyName: string) => {
    return this._knowledge
      .readStory(project, storyName)
      .then((res) => {
        if (res.ok && res.data) {
          this.state.knowledgePreviewData = res.data;
          this.state.knowledgePreviewPath = res.data.path || `${project}/${storyName}`;
          this.state.knowledgePreviewVisible = true;
          this.state.knowledgePreviewLoading = false;
          this._emit();
        } else {
          this._notify(res.error || 'Failed to load story', 'error');
        }
      })
      .catch((err: unknown) => {
        this._notify((err as Error)?.message || 'Failed to load story', 'error');
      });
  };

  /** Scan YiKnowledge tree. Idempotent if a scan is in flight.
   *  Pass `category` to scope to one top-level category — when the user
   *  picks a category from the dropdown, the visible tree should narrow. */
  loadKnowledgeTree = async (category?: string) => {
    // If the user passed an explicit "" (reset), we still want to scan all.
    const cat = category || this.state.knowledgeCategoryFilter || undefined;
    if (this.state.knowledgeLoading) return;
    this.state.knowledgeLoading = true;
    this.state.knowledgeError = '';
    this._emit();
    try {
      const res = await this._knowledge.scan(cat);
      if (res.ok && res.data) {
        this.state.knowledgeTree = res.data.tree || [];
      } else {
        this.state.knowledgeError = res.error || 'Failed to scan knowledge tree';
        this.state.knowledgeTree = [];
      }
    } catch (err) {
      this.state.knowledgeError = (err as Error)?.message || 'Failed to scan knowledge tree';
      this.state.knowledgeTree = [];
    }
    this.state.knowledgeLoading = false;
    this._emit();
  };

  /** Fetch RAG categories + tag counts — for the filter dropdown. */
  loadRagCategories = async () => {
    if (this.state.ragCategoriesLoading) return;
    this.state.ragCategoriesLoading = true;
    this._emit();
    try {
      const res = await this._rag.categories();
      if (res.ok) {
        this.state.ragCategories = res.data || null;
      } else {
        this._notify(res.error || 'Failed to load categories', 'warning');
      }
    } catch (err) {
      this._notify((err as Error)?.message || 'Failed to load categories', 'warning');
    }
    this.state.ragCategoriesLoading = false;
    this._emit();
  };

  /** Set the active category filter. Reloads the visible tree (scoped) and
   *  is passed as `category` to subsequent rag.query / rag.chat calls. */
  setKnowledgeCategoryFilter = (category: string) => {
    const next = (category || '').trim();
    if (next === this.state.knowledgeCategoryFilter) return;
    this.state.knowledgeCategoryFilter = next;
    this._emit();
    // Reload tree scoped — loadKnowledgeTree reads the filter from state.
    this.loadKnowledgeTree();
  };

  /** Set ragScope from a knowledge-tree node path. Pass isFile=true when
   *  the node is a leaf — routes the next grounded stream to /rag-file-chat
   *  (per-file index) instead of /rag-chat with substring scope. */
  setRagScopeFromNode = (path: string, isFile = false) => {
    const trimmed = (path || '').trim();
    if (!trimmed) return;
    this.state.ragScope = trimmed;
    this.state.ragScopeIsFile = isFile;
    this._persistSetting('ragScope', trimmed);
    this._persistSetting('ragScopeIsFile', isFile);
    this._notify(isFile ? `RAG scoped to file: ${trimmed}` : `RAG scoped to: ${trimmed}`, 'info');
    this._emit();
  };

  /** Clear RAG scope + clear sources display. */
  clearRagScope = () => {
    if (!this.state.ragScope && this.state.ragSources.length === 0) return;
    this.state.ragScope = '';
    this.state.ragScopeIsFile = false;
    this.state.ragSources = [];
    this._persistSetting('ragScope', '');
    this._persistSetting('ragScopeIsFile', false);
    this._emit();
  };

  /** Fetch RAG index status — built / num_docs / last_built_at. */
  loadRagStatus = async () => {
    if (this.state.ragStatusLoading) return;
    this.state.ragStatusLoading = true;
    this._emit();
    try {
      const res = await this._rag.status();
      if (res.ok) {
        this.state.ragStatus = res.data || null;
      } else {
        this._notify(res.error || 'Failed to load RAG status', 'warning');
      }
    } catch (err) {
      this._notify((err as Error)?.message || 'Failed to load RAG status', 'warning');
    }
    this.state.ragStatusLoading = false;
    this._emit();
  };

  /** Trigger a rebuild of the RAG index. */
  rebuildRagIndex = async () => {
    try {
      const res = await this._rag.build();
      if (res.ok && res.data) {
        this._notify('RAG index rebuild started', 'success');
        // Poll status once after a short delay — the build runs in a thread.
        setTimeout(() => this.loadRagStatus(), 2000);
      } else {
        this._notify(res.error || 'Failed to rebuild RAG index', 'error');
      }
    } catch (err) {
      this._notify((err as Error)?.message || 'Failed to rebuild RAG index', 'error');
    }
  };

  /** Convert the flat knowledgeTree to antd TreeDataNode shape. */
  knowledgeTreeData(): TreeDataNode[] {
    const walk = (nodes: KnowledgeTreeNode[]): TreeDataNode[] =>
      (nodes || []).map((n) => ({
        key: n.path,
        title: n.name,
        children: n.children ? walk(n.children) : undefined,
        isLeaf: n.type !== 'folder',
      }));
    return walk(this.state.knowledgeTree);
  }

  /** Find the raw KnowledgeTreeNode by path. Returns undefined if not found. */
  knowledgeNodeByPath(path: string): KnowledgeTreeNode | undefined {
    const target = (path || '').trim();
    if (!target) return undefined;
    const walk = (nodes: KnowledgeTreeNode[]): KnowledgeTreeNode | undefined => {
      for (const n of nodes || []) {
        if (n.path === target) return n;
        if (n.children) {
          const found = walk(n.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return walk(this.state.knowledgeTree);
  }

  /** Flatten `state.knowledgeTree` to file nodes whose path contains `query`
   *  (case-insensitive). Caps at `limit` (default 8) for dropdown rendering.
   *  Used by the @-mention dropdown in ChatInput. */
  knowledgeFileMatches(query: string, limit = 8): KnowledgeTreeNode[] {
    const q = (query || '').toLowerCase().trim();
    const out: KnowledgeTreeNode[] = [];
    const walk = (nodes: KnowledgeTreeNode[]) => {
      for (const n of nodes || []) {
        if (out.length >= limit) return;
        if (n.type === 'file') {
          if (!q || n.path.toLowerCase().includes(q) || (n.name || '').toLowerCase().includes(q)) {
            out.push(n);
          }
        }
        if (n.children) walk(n.children);
      }
    };
    walk(this.state.knowledgeTree);
    return out;
  }

  /** Open the preview modal for a knowledge file. Triggers a read. */
  openKnowledgePreview = async (path: string) => {
    const trimmed = (path || '').trim();
    if (!trimmed) return;
    this.state.knowledgePreviewVisible = true;
    this.state.knowledgePreviewPath = trimmed;
    this.state.knowledgePreviewData = null;
    this.state.knowledgePreviewLoading = true;
    this._emit();
    try {
      const res = await this._knowledge.read(trimmed);
      if (res.ok && res.data) {
        this.state.knowledgePreviewData = res.data;
      } else {
        this._notify(res.error || 'Failed to read knowledge file', 'error');
        this.state.knowledgePreviewVisible = false;
      }
    } catch (err) {
      this._notify((err as Error)?.message || 'Failed to read knowledge file', 'error');
      this.state.knowledgePreviewVisible = false;
    }
    this.state.knowledgePreviewLoading = false;
    this._emit();
  };

  closeKnowledgePreview = () => {
    this.state.knowledgePreviewVisible = false;
    this.state.knowledgePreviewPath = '';
    this.state.knowledgePreviewData = null;
    this.state.knowledgePreviewLoading = false;
    this._emit();
  };

  // ── Drag-and-drop knowledge file → session ───────────────────────
  // Mirrors YiVad AiChatBox.vue:225-259 onDrop pattern. Each knowledge
  // file becomes its own persistent session keyed by a synthetic URL
  // `yipet://knowledge/<path>` so re-dropping reopens the same thread
  // instead of stacking duplicates.

  createSessionFromKnowledgeFile = async (path: string) => {
    const trimmed = (path || '').trim();
    if (!trimmed) return;
    // Abort any in-flight stream — mirrors createSession / selectSession.
    if (this.state.isProcessing) this.stopSending();

    const name = trimmed.split('/').filter(Boolean).pop() || trimmed;
    const title = name.endsWith('.md') ? name : `${name}.md`;
    const syntheticUrl = `yipet://knowledge/${trimmed}`;

    // Read the file body so the session's pageContent carries the full
    // markdown — the LLM can answer "summarize this" without an extra
    // retrieval round-trip.
    let body = '';
    try {
      const res = await this._knowledge.read(trimmed);
      if (res.ok && res.data) body = res.data.content || '';
    } catch {
      /* leave body empty — the file's RAG index still grounds the answer */
    }

    const now = Date.now();
    const existing = this.state.sessions.find((s) => s.url === syntheticUrl);
    let sessionId: string | null = null;
    if (existing) {
      // Re-select the existing thread — refresh its pageContent in case
      // the file changed since the last open.
      sessionId = existing.id;
      existing.pageContent = body;
      existing.updatedAt = now;
      try {
        await this._sessions.update(existing.id, {
          pageContent: body,
          updatedAt: now,
        });
      } catch {
        /* non-fatal — local state is already correct */
      }
    } else {
      try {
        const createResult = await this._sessions.create({
          url: syntheticUrl,
          title,
          pageDescription: '',
          pageContent: body,
          createdAt: now,
          updatedAt: now,
          lastAccessTime: now,
          messages: [],
          tags: ['source:YiKnowledge', `from:${window.location.href}`],
        });
        const record = createResult.ok ? createResult.data : null;
        if (record?.key) {
          sessionId = record.key;
          this.state.sessions.unshift({
            id: record.key,
            title: record.title || title,
            url: record.url || syntheticUrl,
            createdAt: record.createdAt || now,
            updatedAt: record.updatedAt || now,
            messageCount: 0,
            isFavorite: false,
            tags: record.tags || ['source:YiKnowledge', `from:${window.location.href}`],
            pageContent: body,
          });
        }
      } catch {
        /* ignore — sessionId stays null, fall through to notify */
      }
    }

    if (!sessionId) {
      this._notify('Failed to start session from knowledge file', 'error');
      this._emit();
      return;
    }

    // Load the session — mirrors selectSession(id) but inlined to avoid
    // a second lookup.
    this.state.currentSessionId = sessionId;
    this.state.title = title;
    try {
      const getResult = await this._sessions.get(sessionId);
      const record = getResult.ok ? getResult.data : null;
      const msgs = record?.messages || [];
      this.state.messages = this._mapMessages(msgs);
      this.state.viewState = msgs.length > 0 ? 'messages' : 'empty';
      if (record && 'pageContent' in record) {
        const cur = this.state.sessions.find((s) => s.id === sessionId);
        if (cur) cur.pageContent = (record as { pageContent?: string }).pageContent || body;
      }
    } catch {
      this.state.messages = [];
      this.state.viewState = 'empty';
    }

    // Scope RAG to the dropped file + auto-enable grounding so the next
    // send draws on this file's index without an extra click.
    this.setRagScopeFromNode(trimmed, true);
    if (!this.state.knowledgeGrounded) this.toggleKnowledgeGrounded();

    this._emit();
  };

  // ── Save pet message to YiKnowledge ────────────────────────────────

  /** Open the "save to YiKnowledge" modal pre-populated from a pet message. */
  openSaveToKnowledge = (timestamp: number) => {
    const msg = this.state.messages.find((m) => m.timestamp === timestamp);
    if (msg?.type !== 'pet') {
      this._notify('Select a pet message to save', 'warning');
      return;
    }
    if (!msg.content?.trim()) {
      this._notify('Cannot save an empty message', 'warning');
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const slug = (
      msg.content
        .slice(0, 40)
        .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'note'
    ).toLowerCase();
    this.state.saveToKnowledgeTimestamp = timestamp;
    this.state.saveToKnowledgeDraftPath = `notes/${today}/${slug}.md`;
    this.state.saveToKnowledgeDraftMetadata = {
      title: slug,
      category: 'notes',
      tags: '',
      type: 'note',
    };
    this.state.saveToKnowledgeVisible = true;
    this._emit();
  };

  closeSaveToKnowledge = () => {
    this.state.saveToKnowledgeVisible = false;
    this.state.saveToKnowledgeLoading = false;
    this.state.saveToKnowledgeTimestamp = null;
    this._emit();
  };

  setSaveToKnowledgeDraft = (
    patch: Partial<{
      path: string;
      title: string;
      category: string;
      tags: string;
      type: string;
    }>,
  ) => {
    if (patch.path !== undefined) this.state.saveToKnowledgeDraftPath = patch.path;
    if (patch.title !== undefined) {
      this.state.saveToKnowledgeDraftMetadata = {
        ...this.state.saveToKnowledgeDraftMetadata,
        title: patch.title,
      };
    }
    if (patch.category !== undefined) {
      this.state.saveToKnowledgeDraftMetadata = {
        ...this.state.saveToKnowledgeDraftMetadata,
        category: patch.category,
      };
    }
    if (patch.tags !== undefined) {
      this.state.saveToKnowledgeDraftMetadata = {
        ...this.state.saveToKnowledgeDraftMetadata,
        tags: patch.tags,
      };
    }
    if (patch.type !== undefined) {
      this.state.saveToKnowledgeDraftMetadata = {
        ...this.state.saveToKnowledgeDraftMetadata,
        type: patch.type,
      };
    }
    this._emit();
  };

  confirmSaveToKnowledge = async () => {
    const ts = this.state.saveToKnowledgeTimestamp;
    if (ts == null) return;
    const msg = this.state.messages.find((m) => m.timestamp === ts);
    if (!msg) {
      this._notify('Original message not found', 'error');
      this.closeSaveToKnowledge();
      return;
    }
    const targetFile = this.state.saveToKnowledgeDraftPath.trim();
    if (!targetFile) {
      this._notify('Target path is required', 'warning');
      return;
    }
    const tags = this.state.saveToKnowledgeDraftMetadata.tags
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    const metadata: Record<string, unknown> = {};
    const meta = this.state.saveToKnowledgeDraftMetadata;
    if (meta.title.trim()) metadata.title = meta.title.trim();
    if (meta.category.trim()) metadata.category = meta.category.trim();
    if (meta.type.trim()) metadata.type = meta.type.trim();
    if (tags.length > 0) metadata.tags = tags;
    metadata.created = new Date().toISOString();
    if (this.state.ragScope) metadata.source_scope = this.state.ragScope;

    this.state.saveToKnowledgeLoading = true;
    this._emit();
    try {
      const res = await this._knowledge.write(targetFile, msg.content || '', metadata);
      if (res.ok) {
        this._notify(`Saved to YiKnowledge: ${targetFile}`, 'success');
        this.closeSaveToKnowledge();
        // Refresh the tree so the new file appears without manual reload.
        this.loadKnowledgeTree();
      } else {
        this._notify(res.error || 'Failed to save', 'error');
      }
    } catch (err) {
      this._notify((err as Error)?.message || 'Failed to save', 'error');
    }
    this.state.saveToKnowledgeLoading = false;
    this._emit();
  };

  // ── Pre-flight RAG source preview ──────────────────────────────────

  /** Run a one-shot retrieval (no LLM) to preview the sources RAG would use
   *  for the given question. Surfaces results in state.ragPreviewSources. */
  previewRagSources = async (question: string) => {
    const q = (question || '').trim();
    if (!q) {
      this._notify('Enter a question first', 'warning');
      return;
    }
    if (!this.state.knowledgeGrounded) {
      this._notify('Turn on knowledge grounding to preview sources', 'warning');
      return;
    }
    this.state.ragPreviewLoading = true;
    this.state.ragPreviewVisible = true;
    this.state.ragPreviewQuestion = q;
    this.state.ragPreviewSources = [];
    this._emit();
    try {
      const useFile = this.state.ragScopeIsFile && !!this.state.ragScope;
      if (useFile) {
        // Per-file variant — grounded in a single file's index.
        const res = await this._rag.fileQuery({
          target_file: this.state.ragScope,
          question: q,
        });
        if (res.ok && res.data) {
          this.state.ragPreviewSources = res.data.sources || [];
        } else {
          this._notify(res.error || 'Pre-flight query failed', 'error');
        }
      } else {
        const res = await this._rag.query({
          question: q,
          scope: this.state.ragScope || undefined,
          category: this.state.knowledgeCategoryFilter || undefined,
        });
        if (res.ok && res.data) {
          this.state.ragPreviewSources = res.data.sources || [];
        } else {
          this._notify(res.error || 'Pre-flight query failed', 'error');
        }
      }
    } catch (err) {
      this._notify((err as Error)?.message || 'Pre-flight query failed', 'error');
    }
    this.state.ragPreviewLoading = false;
    this._emit();
  };

  closeRagPreview = () => {
    this.state.ragPreviewVisible = false;
    this.state.ragPreviewSources = [];
    this.state.ragPreviewQuestion = '';
    this.state.ragPreviewLoading = false;
    this._emit();
  };

  // ── Sub-question decomposition (rag.decompose) ─────────────────────

  /** Run rag.decompose on the current question. Synchronous on the backend
   *  (multiple LLM calls composed internally) — can take a while. */
  decomposeRagQuestion = async (question: string) => {
    const q = (question || '').trim();
    if (!q) {
      this._notify('Enter a question first', 'warning');
      return;
    }
    if (!this.state.knowledgeGrounded) {
      this._notify('Turn on knowledge grounding to decompose', 'warning');
      return;
    }
    this.state.ragDecomposeLoading = true;
    this.state.ragDecomposeVisible = true;
    this.state.ragDecomposeQuestion = q;
    this.state.ragDecomposeData = null;
    this._emit();
    try {
      const res = await this._rag.decompose({
        question: q,
        scope: this.state.ragScope || undefined,
        category: this.state.knowledgeCategoryFilter || undefined,
      });
      if (res.ok && res.data) {
        this.state.ragDecomposeData = res.data;
        if (res.data.error) {
          this._notify(`Decompose partial error: ${res.data.error}`, 'warning');
        }
      } else {
        this._notify(res.error || 'Decompose failed', 'error');
      }
    } catch (err) {
      this._notify((err as Error)?.message || 'Decompose failed', 'error');
    }
    this.state.ragDecomposeLoading = false;
    this._emit();
  };

  closeRagDecompose = () => {
    this.state.ragDecomposeVisible = false;
    this.state.ragDecomposeData = null;
    this.state.ragDecomposeQuestion = '';
    this.state.ragDecomposeLoading = false;
    this._emit();
  };

  // ── Toolbar Actions ─────────────────────────────────────────────────

  openContextEditor = () => {
    // Load the draft from the current session's saved pageContent so the
    // editor opens with the correct content. Without this, the draft would
    // be empty (initial state) or stale (from a previous session the user
    // saved context on), and saving would silently overwrite the live
    // pageContent with empty/stale text.
    const session = this.state.sessions.find((s) => s.id === this.state.currentSessionId);
    if (session) {
      this.state.contextEditorDraft = session.pageContent || '';
    }
    this.state.contextEditorVisible = true;
    this._emit();
  };

  closeContextEditor = () => {
    this.state.contextEditorVisible = false;
    this._emit();
  };

  setContextEditorDraft = (content: string) => {
    this.state.contextEditorDraft = content;
    this._emit();
  };

  saveContextEditorContent = (content: string) => {
    this.state.contextEditorDraft = content;
    this.state.contextEditorVisible = false;
    if (this.state.currentSessionId) {
      // Keep the local session's pageContent in sync with the backend write
      // so subsequent _runStream calls and re-opened editors see the new
      // content without needing a re-fetch.
      const session = this.state.sessions.find((s) => s.id === this.state.currentSessionId);
      if (session) session.pageContent = content;
      this._sessions.update(this.state.currentSessionId, { pageContent: content }).catch(() => {});
    }
    this._notify('Page context saved', 'success');
    this._emit();
  };

  editSessionInfo = () => {
    if (!this.state.currentSessionId) {
      this._notify('Please select a conversation first', 'warning');
      return;
    }
    this.state.sessionEditVisible = true;
    this._emit();
  };

  closeSessionEdit = () => {
    this.state.sessionEditVisible = false;
    this._emit();
  };

  updateSessionMeta = (patch: { title?: string; pageTitle?: string; pageDescription?: string }) => {
    if (!this.state.currentSessionId) return;
    const session = this.state.sessions.find((s) => s.id === this.state.currentSessionId);
    if (session && patch.title !== undefined) {
      session.title = patch.title;
      this.state.title = patch.title;
    }
    this._sessions
      .update(this.state.currentSessionId, patch as Record<string, unknown>)
      .catch(() => {});
    this.state.sessionEditVisible = false;
    this._notify('Conversation info updated', 'success');
    this._emit();
  };

  openTagManager = () => {
    this.state.tagManagerVisible = true;
    this._emit();
  };

  closeTagManager = () => {
    this.state.tagManagerVisible = false;
    this._emit();
  };

  addTag = (name: string) => {
    const tag = name.trim();
    if (!tag) return;
    const session = this.state.sessions.find((s) => s.id === this.state.currentSessionId);
    if (!session) return;
    const tags = Array.isArray(session.tags) ? session.tags : [];
    if (tags.includes(tag)) return;
    session.tags = [...tags, tag];
    if (this.state.currentSessionId) {
      this._sessions.update(this.state.currentSessionId, { tags: [...tags, tag] }).catch(() => {});
    }
    this._emit();
  };

  removeTag = (name: string) => {
    const session = this.state.sessions.find((s) => s.id === this.state.currentSessionId);
    if (!session) return;
    const tags = Array.isArray(session.tags) ? session.tags : [];
    const next = tags.filter((t) => t !== name);
    session.tags = next;
    if (this.state.currentSessionId) {
      this._sessions.update(this.state.currentSessionId, { tags: next }).catch(() => {});
    }
    this._emit();
  };

  openFaqManager = () => {
    this.state.faqVisible = true;
    this._emit();
  };

  closeFaq = () => {
    this.state.faqVisible = false;
    this._emit();
  };

  setFaqSearch = (value: string) => {
    this.state.faqSearch = value;
    this._emit();
  };

  setFaqApplyMode = (mode: 'append' | 'insert') => {
    this.state.faqApplyMode = mode;
    this._emit();
  };

  setInputTemplate = (content: string) => {
    this.state.inputTemplate = content;
    this._emit();
  };

  /** Push a prompt to history. Dedupes consecutive duplicates (shell
   *  behavior) and caps at 100 entries. Persists to chrome.storage.local. */
  pushPromptHistory = (text: string) => {
    const trimmed = (text || '').trim();
    if (!trimmed) return;
    const hist = this.state.promptHistory;
    if (hist[hist.length - 1] === trimmed) return;
    const next = [...hist, trimmed].slice(-100);
    this.state.promptHistory = next;
    this._persistSetting('promptHistory', next);
    this._emit();
  };

  /** Walk the prompt history. `currentIdx` is -1 when not navigating.
   *  Returns `{ idx, text }` or `null` when there's nothing to recall.
   *  delta -1 = older (ArrowUp), delta +1 = newer (ArrowDown). */
  recallPromptHistory = (
    delta: number,
    currentIdx: number,
  ): { idx: number; text: string } | null => {
    const hist = this.state.promptHistory;
    if (hist.length === 0) return null;
    let nextIdx: number;
    if (currentIdx === -1) {
      if (delta < 0) nextIdx = hist.length - 1;
      else return null;
    } else {
      nextIdx = Math.max(-1, Math.min(hist.length - 1, currentIdx + delta));
      if (nextIdx === -1) return { idx: -1, text: '' };
    }
    return { idx: nextIdx, text: hist[nextIdx] };
  };

  clearPromptHistory = () => {
    if (this.state.promptHistory.length === 0) return;
    this.state.promptHistory = [];
    this._persistSetting('promptHistory', []);
    this._emit();
  };

  openPromptHistory = () => {
    this.state.promptHistoryVisible = true;
    this._emit();
  };

  closePromptHistory = () => {
    if (!this.state.promptHistoryVisible) return;
    this.state.promptHistoryVisible = false;
    this._emit();
  };

  /** Re-invoke a history prompt by index — pushes it into the input template
   *  (does NOT auto-send, so the user can edit before sending). */
  invokePromptHistory = (idx: number) => {
    const item = this.state.promptHistory[idx];
    if (!item) return;
    if (!this.state.visible) this.open();
    this.setInputTemplate(item);
    this.closePromptHistory();
  };

  removePromptHistoryAt = (idx: number) => {
    const hist = this.state.promptHistory;
    if (idx < 0 || idx >= hist.length) return;
    const next = [...hist];
    next.splice(idx, 1);
    this.state.promptHistory = next;
    this._persistSetting('promptHistory', next);
    this._emit();
  };

  /** Read the user's current text selection on the host page and push it
   *  into the chat input as a template. Cross-project: works on any page
   *  in any project (YiAi / YiVad / YiKnowledge / external sites) — the
   *  user selects text, opens YiPet (or clicks the toolbar button), and
   *  the selection lands in the input ready to send. */
  insertSelectionAsInput = () => {
    const sel = typeof window !== 'undefined' ? window.getSelection?.() : null;
    const text = (sel?.toString() || '').trim();
    if (!text) {
      this._notify('Select some text on the page first', 'warning');
      return;
    }
    if (!this.state.visible) this.open();
    this.setInputTemplate(text);
  };

  /** Page-aware context chip: when YiPet detects it's running on a known
   *  YiVad detail page (bug / BRD / story), returns a `{ label, prompt,
   *  bugKey? }` describing a one-click prompt action. Returns `null` when
   *  the current page isn't a known YiVad detail view. */
  get pageContextChip(): { label: string; prompt: string; bugKey?: string } | null {
    const url = this.state.pageInfo?.url || window.location.href;
    const detected = detectPageTypeFromUrl(url);
    if (detected.kind === 'yivad-bug-detail' && detected.key) {
      const k = detected.key;
      return {
        label: `Discuss bug ${k.slice(0, 12)}${k.length > 12 ? '…' : ''}`,
        prompt: `Bug ${k} — help me understand this bug: root cause, impact, and a concrete fix plan.`,
        bugKey: k,
      };
    }
    if (detected.kind === 'yivad-brd-detail' && detected.key) {
      const k = detected.key;
      return {
        label: `Summarize BRD ${k.slice(0, 12)}${k.length > 12 ? '…' : ''}`,
        prompt: `Summarize this BRD entry (${k}): motivation, decision, impact, and rollback plan.`,
      };
    }
    if (detected.kind === 'yivad-story-detail' && detected.key) {
      const k = detected.key;
      return {
        label: `Walk me through ${k.slice(0, 12)}${k.length > 12 ? '…' : ''}`,
        prompt: `Walk me through this onboarding story (${k}): what it covers, who it's for, and how to apply it.`,
      };
    }
    return null;
  }

  /** One-click: push the page-aware context chip's prompt into the input
   *  template. For bug-detail chips, also try to scope RAG to the bug's
   *  content file (`engineer/learn/lessons/bugs/<key>.md`) so the answer draws
   *  on the bug's long-form markdown body. */
  applyPageContextChip = () => {
    const chip = this.pageContextChip;
    if (!chip) return;
    if (!this.state.visible) this.open();
    this.setInputTemplate(chip.prompt);
    if (chip.bugKey) {
      const contentPath = `engineer/learn/lessons/bugs/${chip.bugKey}.md`;
      this.setRagScopeFromNode(contentPath, true);
      if (!this.state.knowledgeGrounded) this.toggleKnowledgeGrounded();
    }
  };

  sendQuickButton = (content: string) => {
    if (this.state.isProcessing) return;
    this.sendMessage(content);
  };

  get currentSessionTags(): string[] {
    const session = this.state.sessions.find((s) => s.id === this.state.currentSessionId);
    if (!session) return [];
    return Array.isArray(session.tags) ? session.tags : [];
  }

  // ── Conversation tree (mirrors aicr FileTree — folders from tags joined by /) ──

  conversationTreeData(): TreeDataNode[] {
    type Acc = Record<string, FileNode>;
    interface FileNode {
      key: string;
      name: string;
      type: 'file' | 'folder';
      children?: Acc;
      session?: SessionItem;
      updatedAt?: number;
    }
    this._treeSessionMap = new Map();
    const root: Acc = {};
    for (const c of this.filteredSessions) {
      const tags = (c.tags ?? []).map((t) => String(t).trim()).filter(Boolean);
      const parts = [...tags, c.id];
      if (parts.length === 0) continue;
      let current = root;
      for (let i = 0; i < parts.length; i++) {
        const seg = parts[i];
        const isLast = i === parts.length - 1;
        const key = parts.slice(0, i + 1).join('/');
        if (!current[seg]) {
          current[seg] = {
            key,
            name: isLast ? c.title || '(Untitled)' : seg,
            type: isLast ? 'file' : 'folder',
            children: isLast ? undefined : {},
            session: isLast ? c : undefined,
            updatedAt: c.updatedAt,
          };
        }
        if (!isLast) {
          const node = current[seg];
          if (!node.children) node.children = {};
          current = node.children;
        }
      }
    }
    const toArray = (nodes: Acc): TreeDataNode[] =>
      Object.values(nodes)
        .map((n) => {
          if (n.session) this._treeSessionMap.set(n.key, n.session);
          return {
            key: n.key,
            title: n.name,
            children: n.children ? toArray(n.children) : undefined,
            isLeaf: n.type === 'file',
          } as TreeDataNode;
        })
        .sort((a, b) => {
          const ta = (a as any).isLeaf;
          const tb = (b as any).isLeaf;
          if (ta !== tb) return ta ? 1 : -1;
          return String(a.title).localeCompare(String(b.title), 'zh-CN');
        });
    return toArray(root);
  }

  treeSessionByKey(key: string): SessionItem | undefined {
    return this._treeSessionMap.get(key);
  }

  expandedFolderKeys(): string[] {
    const keys: string[] = [];
    const walk = (nodes: TreeDataNode[]) => {
      for (const n of nodes) {
        if (!(n as any).isLeaf) keys.push(String(n.key));
        if (n.children) walk(n.children);
      }
    };
    walk(this.conversationTreeData());
    return keys;
  }

  openWeChatSettings = () => {
    this.state.weChatRobotsDraft = this.state.weChatRobots.map((r) => ({ ...r }));
    this.state.weChatSettingsVisible = true;
    this._emit();
  };

  closeWeChatSettings = () => {
    this.state.weChatSettingsVisible = false;
    this._emit();
  };

  restoreWeChatSettingsDefaults = () => {
    this.state.weChatRobotsDraft = [];
    this._emit();
  };

  addWeChatRobotDraft = () => {
    const list = [...this.state.weChatRobotsDraft];
    const idx = list.length + 1;
    list.push({
      id: 'wr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      name: 'Bot ' + idx,
      webhook: '',
      enabled: true,
      autoForward: true,
    });
    this.state.weChatRobotsDraft = list;
    this._emit();
  };

  removeWeChatRobotDraft = (index: number) => {
    const i = Number(index);
    const list = [...this.state.weChatRobotsDraft];
    if (!Number.isFinite(i) || i < 0 || i >= list.length) return;
    list.splice(i, 1);
    this.state.weChatRobotsDraft = list;
    this._emit();
  };

  updateWeChatRobotDraft = (index: number, patch: Partial<WeWorkBot>) => {
    const i = Number(index);
    const list = [...this.state.weChatRobotsDraft];
    if (!Number.isFinite(i) || i < 0 || i >= list.length) return;
    list[i] = { ...list[i], ...patch };
    this.state.weChatRobotsDraft = list;
    this._emit();
  };

  saveWeChatSettings = () => {
    const drafts = this.state.weChatRobotsDraft;
    const normalized: WeWorkBot[] = drafts
      .map((r) => ({
        id: r.id || 'wr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        name: (r.name || '').trim() || 'Bot',
        webhook: (r.webhook || '').trim(),
        enabled: !!r.enabled,
        autoForward: !!r.autoForward,
      }))
      .filter((r) => r.webhook);
    const dropped = drafts.length - normalized.length;
    this.state.weChatRobots = normalized;
    this.state.weChatRobotsDraft = normalized.map((r) => ({ ...r }));
    this._persistSetting('weChatRobots', normalized);
    this.state.weChatSettingsVisible = false;
    if (dropped > 0) {
      this._notify(`Saved; ${dropped} bot(s) with empty webhook ignored`, 'warning');
    } else {
      this._notify('Saved', 'success');
    }
  };

  private _forwardToWeWorkBots(content: string) {
    const text = (content || '').trim();
    if (!text) return;
    const targets = this.state.weChatRobots.filter((r) => r.enabled && r.autoForward && r.webhook);
    if (targets.length === 0) return;
    targets.forEach((bot) => {
      this._wework
        .sendMessage({ webhook_url: bot.webhook, content: text })
        .then((res) => {
          if (!res.ok) {
            this._notify(`Forward to ${bot.name} failed: ${res.error || 'Unknown error'}`, 'error');
          }
        })
        .catch((err: unknown) => {
          this._notify(
            `Forward to ${bot.name} failed: ${(err as Error)?.message || 'Unknown error'}`,
            'error',
          );
        });
    });
  }

  // ── Voice input notifications ─────────────────────────────────────

  notifyVoiceUnsupported = () => {
    this._notify('Voice input not supported in this browser', 'warning');
  };

  notifyVoicePermissionDenied = () => {
    this._notify('Microphone permission denied', 'error');
  };

  notifyVoiceStartFailed = (message: string) => {
    this._notify(`Failed to start voice input: ${message}`, 'error');
  };

  // ── Scroll ────────────────────────────────────────────────────────

  private _shouldAutoScroll(): boolean {
    try {
      const el = document.getElementById('yipet-chat-messages');
      if (!el) return true;
      const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
      return dist < 120;
    } catch {
      return true;
    }
  }

  scrollToBottom(force = false) {
    if (!force && !this._shouldAutoScroll()) return;
    const el = document.getElementById('yipet-chat-messages');
    if (el) el.scrollTop = el.scrollHeight;
  }

  // ── Window Controls ──────────────────────────────────────────────

  toggleSidebar = () => {
    const collapsed = !this.state.sidebarCollapsed;
    this.state.sidebarCollapsed = collapsed;
    this._persistSetting('sidebarCollapsed', collapsed);
    this._emit();
  };

  toggleFullscreen = () => {
    const ws = this.state.ws;
    ws.isFullscreen = !ws.isFullscreen;
    this._emit();
  };

  // ── Sidebar Resize ────────────────────────────────────────────────

  onSidebarResizeMouseDown = (e: MouseEvent) => {
    this._sidebarResizeStart = {
      x: e.clientX,
      startWidth: this.state.sidebarWidth,
    };
    document.addEventListener('mousemove', this._onSidebarResizeMove);
    document.addEventListener('mouseup', this._onSidebarResizeEnd);
    e.preventDefault();
    e.stopPropagation();
  };

  private _onSidebarResizeMove = (e: MouseEvent) => {
    const dx = e.clientX - this._sidebarResizeStart.x;
    const newWidth = Math.min(
      Math.max(MIN_SIDEBAR_WIDTH, this._sidebarResizeStart.startWidth + dx),
      MAX_SIDEBAR_WIDTH,
    );
    this.state.sidebarWidth = newWidth;
    this._emit();
  };

  private _onSidebarResizeEnd = () => {
    document.removeEventListener('mousemove', this._onSidebarResizeMove);
    document.removeEventListener('mouseup', this._onSidebarResizeEnd);
    this._persistSetting('sidebarWidth', this.state.sidebarWidth);
  };

  // ── Drag ─────────────────────────────────────────────────────────

  onHeaderMouseDown = (e: MouseEvent) => {
    if (this.state.ws.isFullscreen) return;
    if ((e.target as HTMLElement).closest('button')) return;
    this.state.isDragging = true;
    this._dragStart = { x: e.clientX, y: e.clientY, wx: this.state.ws.x, wy: this.state.ws.y };
    document.addEventListener('mousemove', this._onDragMove);
    document.addEventListener('mouseup', this._onDragEnd);
    e.preventDefault();
  };

  private _onDragMove = (e: MouseEvent) => {
    if (!this.state.isDragging) return;
    const ws = this.state.ws;
    ws.x = Math.max(
      0,
      Math.min(window.innerWidth - ws.width, this._dragStart.wx + (e.clientX - this._dragStart.x)),
    );
    ws.y = Math.max(
      0,
      Math.min(
        window.innerHeight - ws.height,
        this._dragStart.wy + (e.clientY - this._dragStart.y),
      ),
    );
    this._emit();
  };

  private _onDragEnd = () => {
    this.state.isDragging = false;
    document.removeEventListener('mousemove', this._onDragMove);
    document.removeEventListener('mouseup', this._onDragEnd);
    this._emit();
  };

  // ── Cross-project bridge to YiVad aiChat ──────────────────────────

  /** Capture the current page context and seed a fresh aiChat conversation
   *  in YiVad. Creates a `sessions` doc with the page URL/title/content +
   *  a first user message + `from:<url>` tag, then deep-links to
   *  `http://localhost:8848/#/aiChat?session=<key>`. YiVad's aiChat
   *  onMounted picks up `?session=<key>` and selects the seeded session. */
  discussInYiVadAiChat = async () => {
    const url = this.state.pageInfo?.url || window.location.href;
    const title = this.state.pageInfo?.title || document.title || 'Current page';
    const pageContent =
      (this.state.contextEditorDraft || '').trim() ||
      (document.body?.innerText || '').slice(0, 8000);
    const now = Date.now();
    const sessionTitle = `YiPet → ${title}`.slice(0, 80);
    const seedMessage = `Page: ${title}\nURL: ${url}\n\n${pageContent || '_no page content captured_'}`;
    try {
      const createResult = await this._sessions.create({
        url,
        title: sessionTitle,
        createdAt: now,
        updatedAt: now,
        lastAccessTime: now,
        messages: [{ role: 'user', content: seedMessage, timestamp: now }],
        tags: [`from:${url}`, 'source:YiPet', `project:${detectProjectFromUrl(url)}`],
      });
      if (!createResult.ok || !createResult.data?.key) {
        this._notify(createResult.error || 'Failed to seed YiVad session', 'error');
        return;
      }
      const key = createResult.data.key;
      const target = `http://localhost:8848/#/aiChat?session=${encodeURIComponent(key)}`;
      window.open(target, '_blank', 'noopener,noreferrer');
      this._notify(`Opened in YiVad aiChat: ${sessionTitle}`, 'success');
    } catch (err) {
      this._notify((err as Error)?.message || 'Failed to bridge to YiVad', 'error');
    }
  };

  // ── Cross-project bug reporting ───────────────────────────────────

  /**
   * Branch a new session from a specific message — copies all messages up to
   * and including the one at `timestamp` into a fresh session, then switches
   * to it. Useful when a thread diverged and the user wants to fork from a
   * specific point without losing the original.
   */
  branchFromMessage = async (timestamp: number) => {
    const idx = this.state.messages.findIndex((m) => m.timestamp === timestamp);
    if (idx < 0) {
      this._notify('Message not found', 'error');
      return;
    }
    const branch = this.state.messages.slice(0, idx + 1).map((m) => ({
      ...m,
      streaming: false,
    }));
    const orig = this.state.sessions.find((s) => s.id === this.state.currentSessionId);
    const origTitle = orig?.title || this.state.title || 'conversation';
    const url = orig?.url || this.state.pageInfo?.url || window.location.href;
    const now = Date.now();
    const title = `Branch · ${origTitle}`.slice(0, 80);
    try {
      const createResult = await this._sessions.create({
        url,
        title,
        pageDescription: '',
        pageContent: orig?.pageContent || '',
        createdAt: now,
        updatedAt: now,
        lastAccessTime: now,
        messages: branch.map((m) => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.content || '',
          timestamp: m.timestamp,
        })),
        tags: [
          `branch-of:${orig?.id || 'unknown'}`,
          `from:${url}`,
          'source:YiPet',
          `project:${detectProjectFromUrl(url)}`,
        ],
      });
      if (!createResult.ok || !createResult.data?.key) {
        this._notify(createResult.error || 'Failed to branch session', 'error');
        return;
      }
      const record = createResult.data;
      this.state.sessions.unshift({
        id: record.key,
        title: record.title || title,
        url: record.url || url,
        createdAt: record.createdAt || now,
        updatedAt: record.updatedAt || now,
        messageCount: branch.length,
        isFavorite: false,
        tags: record.tags || [],
        pageContent: orig?.pageContent || '',
      });
      this.state.currentSessionId = record.key;
      this.state.title = title;
      this.state.messages = branch;
      this.state.viewState = branch.length > 0 ? 'messages' : 'empty';
      this._notify(`Branched ${branch.length} messages into new session`, 'success');
      this._emit();
    } catch (err) {
      this._notify((err as Error)?.message || 'Failed to branch session', 'error');
    }
  };

  /**
   * Summarize the current session — one-shot LLM call with all messages
   * concatenated as context. Surfaced in a modal (SessionSummaryDialog).
   * The summary stays in the modal — does NOT pollute the conversation thread.
   */
  summarizeCurrentSession = async () => {
    const msgs = this.state.messages;
    if (msgs.length === 0) {
      this._notify('Nothing to summarize — session is empty', 'info');
      return;
    }
    this.state.sessionSummaryVisible = true;
    this.state.sessionSummaryLoading = true;
    this.state.sessionSummaryText = '';
    this.state.sessionSummaryError = '';
    this._emit();
    // Build a transcript: alternating User/Pet lines, capped to keep payload sane.
    const MAX_PER_MSG = 800;
    const transcript = msgs
      .map((m) => {
        const role = m.type === 'user' ? 'User' : 'Pet';
        const body = (m.content || '').slice(0, MAX_PER_MSG);
        return `${role}: ${body}`;
      })
      .join('\n\n');
    const summaryPrompt = `Summarize the conversation below in 5-8 bullet points. Focus on what was asked, what was decided, and any open questions. Use plain markdown bullets.\n\nConversation:\n\n${transcript}`;
    try {
      const result = await this._chat.streamWithCallback(
        {
          system: 'You are a concise summarizer. Output only markdown bullet points.',
          user: summaryPrompt,
          model: DEFAULT_MODEL,
        },
        (token) => {
          this.state.sessionSummaryText += token;
          this._emit();
        },
      );
      this.state.sessionSummaryText =
        (this.state.sessionSummaryText || result || '').trim() || '(empty summary)';
    } catch (err) {
      this.state.sessionSummaryError = (err as Error)?.message || 'Failed to summarize';
    } finally {
      this.state.sessionSummaryLoading = false;
      this._emit();
    }
  };

  closeSessionSummary = () => {
    this.state.sessionSummaryVisible = false;
    this.state.sessionSummaryText = '';
    this.state.sessionSummaryError = '';
    this._emit();
  };

  /**
   * Auto-generate a short title for the current session — LLM call with
   * the first few user messages, returns a 4-6 word title. Optionally
   * saves the title back to the session (default) or surfaces it via
   * a callback (used by SessionEditDialog to populate the title field).
   */
  autoGenerateSessionTitle = async (
    opts: { apply?: boolean; onResult?: (title: string) => void } = {},
  ): Promise<string | null> => {
    const msgs = this.state.messages;
    const userMsgs = msgs.filter((m) => m.type === 'user').slice(0, 4);
    if (userMsgs.length === 0) {
      this._notify('No user messages to base a title on', 'info');
      return null;
    }
    const transcript = userMsgs
      .map((m, i) => `Q${i + 1}: ${(m.content || '').slice(0, 300)}`)
      .join('\n');
    const prompt = `Generate a concise 4-6 word title summarizing what the user is asking about. Output only the title text, no quotes, no punctuation at the end.\n\n${transcript}`;
    const apply = opts.apply !== false;
    const wasProcessing = this.state.isProcessing;
    if (apply) this.state.isProcessing = true;
    this._emit();
    try {
      const result = await this._chat.streamWithCallback(
        {
          system:
            'You are a title generator. Output only the raw title, no quotes, no markdown, no trailing punctuation.',
          user: prompt,
          model: DEFAULT_MODEL,
        },
        () => {},
      );
      let title = (result || '')
        .trim()
        .replace(/^["'`]+|["'`.!?]+$/g, '')
        .trim();
      if (!title) {
        this._notify('Empty title generated', 'error');
        return null;
      }
      if (title.length > 80) title = `${title.slice(0, 79).trimEnd()}`;
      if (opts.onResult) opts.onResult(title);
      if (apply) {
        const sid = this.state.currentSessionId;
        if (sid) {
          try {
            await this._sessions.update(sid, { title, updatedAt: Date.now() });
            const session = this.state.sessions.find((s) => s.id === sid);
            if (session) {
              session.title = title;
              session.updatedAt = Date.now();
            }
            this.state.title = title;
            this._notify(`Title set: ${title}`, 'success');
          } catch (err) {
            this._notify((err as Error)?.message || 'Failed to save title', 'error');
          }
        }
      }
      return title;
    } catch (err) {
      this._notify((err as Error)?.message || 'Failed to generate title', 'error');
      return null;
    } finally {
      if (apply && !wasProcessing) this.state.isProcessing = false;
      this._emit();
    }
  };

  copySessionSummary = async () => {
    const text = this.state.sessionSummaryText;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      this._notify('Summary copied', 'success');
    } catch {
      this._notify('Failed to copy summary', 'error');
    }
  };

  /**
   * Export the current session's messages as a Markdown file — useful for
   * pasting into YiKnowledge / YiVad docs / external notes. Triggered from
   * the toolbar.
   */
  exportCurrentSessionMarkdown = () => {
    const msgs = this.state.messages;
    if (msgs.length === 0) {
      this._notify('Nothing to export — session is empty', 'info');
      return;
    }
    const session = this.state.sessions.find((s) => s.id === this.state.currentSessionId);
    const title = session?.title || this.state.title || 'YiPet conversation';
    const url = session?.url || this.state.pageInfo?.url || '';
    const created = session?.createdAt || Date.now();
    const lines: string[] = [];
    lines.push(`# ${title}`);
    lines.push('');
    lines.push(`> Exported from YiPet · ${new Date().toISOString()}`);
    if (url) lines.push(`> Source URL: ${url}`);
    if (session?.tags?.length) lines.push(`> Tags: ${session.tags.join(', ')}`);
    lines.push(`> Created: ${new Date(created).toISOString()}`);
    lines.push('');
    lines.push('---');
    lines.push('');
    for (const m of msgs) {
      const role = m.type === 'user' ? '🧑 User' : '🐾 Pet';
      const ts = new Date(m.timestamp).toISOString();
      lines.push(`## ${role} · ${ts}`);
      lines.push('');
      lines.push(String(m.content || ''));
      if (m.error) lines.push('\n_⚠️ Generation failed_');
      if (m.aborted) lines.push('\n_⏹️ Stopped_');
      lines.push('');
    }
    const md = lines.join('\n');
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const slug =
      (session?.title || 'yipet-session')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50) || 'yipet-session';
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${slug}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
    this._notify(`Exported ${msgs.length} messages as markdown`, 'success');
  };

  /**
   * Open a specific message in YiVad aiChat — seed a session with the
   * message (and its preceding user question if it's a pet response) so
   * the user can continue the conversation in YiVad's richer UI.
   */
  openMessageInYiVad = async (timestamp: number) => {
    const idx = this.state.messages.findIndex((m) => m.timestamp === timestamp);
    if (idx < 0) {
      this._notify('Message not found', 'error');
      return;
    }
    const msg = this.state.messages[idx];
    const now = Date.now();
    const url = this.state.pageInfo?.url || window.location.href;
    const title = this.state.pageInfo?.title || document.title || 'YiPet';
    const sessionTitle = `YiPet → ${String(msg.content || '').slice(0, 60) || title}`.slice(0, 80);
    const seedMessages: { role: 'user'; content: string; timestamp: number }[] = [];
    if (msg.type === 'user') {
      seedMessages.push({ role: 'user', content: String(msg.content || ''), timestamp: now });
    } else {
      // Pet response — include the preceding user question for context.
      const prevUser = this.state.messages
        .slice(0, idx)
        .reverse()
        .find((m) => m.type === 'user');
      if (prevUser) {
        seedMessages.push({
          role: 'user',
          content: String(prevUser.content || ''),
          timestamp: now,
        });
      }
      seedMessages.push({
        role: 'user',
        content: `Continue from this assistant response:\n\n${String(msg.content || '')}`,
        timestamp: now + 1,
      });
    }
    try {
      const createResult = await this._sessions.create({
        url,
        title: sessionTitle,
        createdAt: now,
        updatedAt: now,
        lastAccessTime: now,
        messages: seedMessages,
        tags: [
          `from:${url}`,
          'source:YiPet',
          `project:${detectProjectFromUrl(url)}`,
          'via:per-message-bridge',
        ],
      });
      if (!createResult.ok || !createResult.data?.key) {
        this._notify(createResult.error || 'Failed to seed YiVad session', 'error');
        return;
      }
      const key = createResult.data.key;
      const target = `http://localhost:8848/#/aiChat?session=${encodeURIComponent(key)}`;
      window.open(target, '_blank', 'noopener,noreferrer');
      this._notify(`Opened in YiVad aiChat`, 'success');
    } catch (err) {
      this._notify((err as Error)?.message || 'Failed to bridge to YiVad', 'error');
    }
  };

  /** Open the bug-report modal pre-populated from the current page context. */
  openBugReport = () => {
    const url = this.state.pageInfo?.url || '';
    const project = detectProjectFromUrl(url);
    this.state.bugReportDraft = {
      title: '',
      project,
      module: '',
      severity: 'minor',
      priority: 'p2',
      status: 'open',
      type: 'functional',
      frequency: 'always',
      assignee: '',
      reporter: '',
      environment: url,
      affectedVersion: '',
      fixedVersion: '',
      tags: '',
      description: '',
      stepsToReproduce: '',
      expectedResult: '',
      actualResult: '',
    };
    this.state.bugReportVisible = true;
    this._emit();
  };

  closeBugReport = () => {
    this.state.bugReportVisible = false;
    this.state.bugReportLoading = false;
    this._emit();
  };

  setBugReportDraft = (patch: Partial<ChatState['bugReportDraft']>) => {
    this.state.bugReportDraft = { ...this.state.bugReportDraft, ...patch };
    this._emit();
  };

  confirmBugReport = async () => {
    const d = this.state.bugReportDraft;
    if (!d.title.trim()) {
      this._notify('Title is required', 'warning');
      return;
    }
    if (!d.project) {
      this._notify('Project is required', 'warning');
      return;
    }
    const key = makeBugKey(d.title);
    const tags = d.tags
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    const stepsToReproduce = d.stepsToReproduce
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    const content = {
      description: d.description.trim(),
      stepsToReproduce,
      expectedResult: d.expectedResult.trim(),
      actualResult: d.actualResult.trim(),
    };
    const meta = {
      key,
      title: d.title.trim(),
      project: d.project,
      module: d.module.trim(),
      severity: d.severity as BugSeverity,
      priority: d.priority as BugPriority,
      status: d.status as BugStatus,
      type: d.type as BugType,
      frequency: d.frequency as BugFrequency,
      assignee: d.assignee.trim(),
      reporter: d.reporter.trim(),
      environment: d.environment.trim(),
      affectedVersion: d.affectedVersion.trim(),
      fixedVersion: d.fixedVersion.trim(),
      tags,
    };
    this.state.bugReportLoading = true;
    this._emit();
    try {
      const res = await this._bug.createBug(meta, content);
      if (res.envelope.ok) {
        this._notify(`Bug logged: ${key}`, 'success');
        this.closeBugReport();
      } else {
        this._notify(res.envelope.error || 'Failed to log bug', 'error');
      }
    } catch (err) {
      this._notify((err as Error)?.message || 'Failed to log bug', 'error');
    }
    this.state.bugReportLoading = false;
    this._emit();
  };

  // ── Resize ───────────────────────────────────────────────────────

  onResizeMouseDown = (dir: string, e: MouseEvent) => {
    if (this.state.ws.isFullscreen) return;
    this.state.isResizing = true;
    this._resizeDir = dir;
    this._resizeStart = {
      x: e.clientX,
      y: e.clientY,
      wx: this.state.ws.x,
      wy: this.state.ws.y,
      w: this.state.ws.width,
      h: this.state.ws.height,
    };
    document.addEventListener('mousemove', this._onResizeMove);
    document.addEventListener('mouseup', this._onResizeEnd);
    e.preventDefault();
    e.stopPropagation();
  };

  private _onResizeMove = (e: MouseEvent) => {
    if (!this.state.isResizing) return;
    const ws = this.state.ws;
    const dx = e.clientX - this._resizeStart.x;
    const dy = e.clientY - this._resizeStart.y;
    if (this._resizeDir.includes('e')) ws.width = Math.max(MIN_WIDTH, this._resizeStart.w + dx);
    if (this._resizeDir.includes('s')) ws.height = Math.max(MIN_HEIGHT, this._resizeStart.h + dy);
    if (this._resizeDir.includes('w')) {
      const newWidth = this._resizeStart.w - dx;
      if (newWidth >= MIN_WIDTH) {
        ws.width = newWidth;
        ws.x = Math.max(0, this._resizeStart.wx + dx);
      }
    }
    if (this._resizeDir.includes('n')) {
      const newHeight = this._resizeStart.h - dy;
      if (newHeight >= MIN_HEIGHT) {
        ws.height = newHeight;
        ws.y = Math.max(0, this._resizeStart.wy + dy);
      }
    }
    this._emit();
  };

  private _onResizeEnd = () => {
    this.state.isResizing = false;
    document.removeEventListener('mousemove', this._onResizeMove);
    document.removeEventListener('mouseup', this._onResizeEnd);
    this._emit();
  };
}
