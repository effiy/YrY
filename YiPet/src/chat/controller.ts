/**
 * ChatController — manages all chat state and logic.
 *
 * Refactored to an external store so React function components can subscribe
 * via `useSyncExternalStore`. The class owns state + actions; React tree
 * reads `controller.state` snapshot and re-renders on emit.
 */

import type { ChatService, SessionService, WeWorkService } from '@/api/services';
import type { ChatMessage, WeWorkBot } from '@/api/types';
import type { TreeDataNode } from 'antd';
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
  private _sessions: SessionService;
  private _wework: WeWorkService;
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
  private _resizeStart = { x: 0, y: 0, wx: 0, w: 0, h: 0 };

  // Sidebar resize state
  private _sidebarResizeStart = { x: 0, startWidth: 0 };

  constructor(
    chat: ChatService,
    sessions: SessionService,
    wework: WeWorkService,
    colorIndex: number,
    systemPrompt: string,
  ) {
    this._chat = chat;
    this._sessions = sessions;
    this._wework = wework;

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
      sessionLoading: false,
      sidebarCollapsed: false,
      sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
      batchMode: false,
      selectedSessionIds: [],
      draftImages: [],
      contextEnabled: true,
      weChatRobots: [],
      weChatRobotsDraft: [],
      weChatSettingsVisible: false,
      colorIndex: colorIndex,
      systemPrompt: systemPrompt || '',
      streamingTargetTimestamp: null,
      streamingType: '',
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
          ['sidebarWidth', 'sidebarCollapsed', 'contextEnabled', 'weChatRobots'],
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
      if (Array.isArray(result.weChatRobots)) {
        this.state.weChatRobots = (result.weChatRobots as WeWorkBot[]).filter(
          (r) => r && typeof r === 'object' && typeof r.webhook === 'string',
        );
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
          tags: []
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

  get filteredSessions(): SessionItem[] {
    const q = this.state.searchQuery;
    if (!q) return this.state.sessions;
    return this.state.sessions.filter(
      (s) => s.title.toLowerCase().includes(q) || s.url.toLowerCase().includes(q),
    );
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

    await this._runStream(userIdx, petMsg.timestamp, 'send');
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
    this._abortController = new AbortController();
    let streamed = '';
    let lastScrollAt = 0;
    const SCROLL_THROTTLE_MS = 120;

    const findPetIdx = () => this.state.messages.findIndex((m) => m.timestamp === petTimestamp);

    try {
      streamed = await this._chat.streamWithCallback(
        {
          system: this.state.systemPrompt,
          user: userContent,
          model: DEFAULT_MODEL,
          images: images.length > 0 ? images : undefined,
        },
        (token) => {
          streamed += token;
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
        },
        this._abortController.signal,
      );

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
      this._abortController = null;
      setTimeout(() => this.scrollToBottom(true), 50);
      this._emit();
    }
  }

  stopSending = () => {
    const targetTs = this.state.streamingTargetTimestamp;
    this._abortController?.abort();
    this._abortController = null;
    this.state.isProcessing = false;
    this.state.streamingTargetTimestamp = null;
    this.state.streamingType = '';
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
            name: isLast ? (c.title || '(Untitled)') : seg,
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

  // ── Resize ───────────────────────────────────────────────────────

  onResizeMouseDown = (dir: string, e: MouseEvent) => {
    if (this.state.ws.isFullscreen) return;
    this.state.isResizing = true;
    this._resizeDir = dir;
    this._resizeStart = {
      x: e.clientX,
      y: e.clientY,
      wx: this.state.ws.x,
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
    this._emit();
  };

  private _onResizeEnd = () => {
    this.state.isResizing = false;
    document.removeEventListener('mousemove', this._onResizeMove);
    document.removeEventListener('mouseup', this._onResizeEnd);
    this._emit();
  };
}
