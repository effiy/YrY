/**
 * ChatController — manages all chat state and logic.
 * Pattern-matches PopupComponent: plain class with manual _render() + ReactDOM.render().
 */

import type { ChatApi, ChatMessage } from './api/chat';
import { ChatWindowRender } from './components';
import type { ChatState, Message, SessionItem } from './types';

// Re-export types needed by components
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

// ── Controller ───────────────────────────────────────────────────────────

export class ChatController {
  state: ChatState;
  private _api: ChatApi;
  private _abortController: AbortController | null = null;
  private _rootEl: HTMLElement | null = null;
  private _searchTimer: ReturnType<typeof setTimeout> | null = null;

  // Drag state (non-reactive)
  private _dragStart = { x: 0, y: 0, wx: 0, wy: 0 };
  private _resizeDir = '';
  private _resizeStart = { x: 0, y: 0, w: 0, h: 0 };

  // Sidebar resize state
  private _sidebarResizeStart = { x: 0, startWidth: 0 };

  constructor(api: ChatApi, _colorIndex: number) {
    this._api = api;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    this.state = {
      visible: false,
      title: '与我聊天',
      viewState: 'empty',
      viewPayload: null,
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
      notification: null,
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

    // Restore persisted state
    this._loadPersistedState();
  }

  /** Bind the controller to a DOM element. */
  mount(rootEl: HTMLElement) {
    this._rootEl = rootEl;
    this._render();
    this._init();
  }

  /** Clean up. */
  unmount() {
    document.removeEventListener('mousemove', this._onDragMove);
    document.removeEventListener('mouseup', this._onDragEnd);
    document.removeEventListener('mousemove', this._onResizeMove);
    document.removeEventListener('mouseup', this._onResizeEnd);
    document.removeEventListener('mousemove', this._onSidebarResizeMove);
    document.removeEventListener('mouseup', this._onSidebarResizeEnd);
  }

  // ── Public API ─────────────────────────────────────────────────────

  toggle = () => {
    if (!this.state.visible) {
      this.open();
    } else {
      this.close();
    }
  };

  open = () => {
    this.state.visible = true;
    this.state.pageInfo = this._readPageInfo();
    this._render();
    // Re-init sessions when opening (page may have changed)
    this._loadSessions().then(() => this._findOrCreateSession());
  };

  close = () => this.setState({ visible: false });

  // ── Notification ───────────────────────────────────────────────────

  private _notify(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
    this.state.notification = { message, type };
    this._render();
    setTimeout(() => {
      if (this.state.notification?.message === message) {
        this.state.notification = null;
        this._render();
      }
    }, 3000);
  }

  // ── Init ──────────────────────────────────────────────────────────

  private async _init() {
    await this._loadSessions();
    await this._findOrCreateSession();
    this._render();
  }

  // ── State ──────────────────────────────────────────────────────────

  private setState(patch: Partial<ChatState>) {
    Object.assign(this.state, patch);
    this._render();
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
          ['sidebarWidth', 'sidebarCollapsed', 'contextEnabled'],
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
      title: document.title || '当前页面',
      url: window.location.href,
      iconUrl: (document.querySelector('link[rel~="icon"]') as HTMLLinkElement)?.href || '',
    };
  }

  // ── Sessions ───────────────────────────────────────────────────────

  private async _loadSessions() {
    this.state.sessionLoading = true;
    this._render();
    try {
      const records = await this._api.listSessions();
      this.state.sessions = records.map((r) => ({
        id: r.key,
        title: r.title || '未命名会话',
        url: r.url || '',
        createdAt: r.createdAt || 0,
        updatedAt: r.updatedAt || 0,
        messageCount: Array.isArray(r.messages) ? r.messages.length : 0,
        messages: r.messages,
      }));
    } catch {
      /* ignore */
    }
    this.state.sessionLoading = false;
  }

  private async _findOrCreateSession() {
    const url = window.location.href;
    const existing = this.state.sessions.find((s) => s.url === url);
    if (existing) {
      this.state.currentSessionId = existing.id;
      this.state.title = existing.title || '未命名会话';
      const msgs = existing.messages || [];
      this.state.messages = this._mapMessages(msgs);
      this.state.viewState = msgs.length > 0 ? 'messages' : 'empty';

      // Load full messages from backend
      try {
        const record = await this._api.getSession(existing.id);
        if (record?.messages) {
          this.state.messages = this._mapMessages(record.messages);
          this.state.viewState = record.messages.length > 0 ? 'messages' : 'empty';
        }
      } catch {
        /* use cached messages */
      }
      return;
    }

    // Create new session
    const title = document.title?.trim()
      ? document.title.endsWith('.md')
        ? document.title
        : `${document.title}.md`
      : '新会话.md';
    const now = Date.now();
    try {
      const record = await this._api.createSession({
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
      if (record?.key) {
        this.state.sessions.unshift({
          id: record.key,
          title: record.title || title,
          url: record.url || url,
          createdAt: record.createdAt || now,
          updatedAt: record.updatedAt || now,
          messageCount: 0,
        });
        this.state.currentSessionId = record.key;
      }
    } catch {
      /* ignore */
    }
    this.state.viewState = 'empty';
  }

  async selectSession(id: string) {
    this.state.currentSessionId = id;
    const session = this.state.sessions.find((s) => s.id === id);
    if (session) {
      this.state.title = session.title || '未命名会话';
      this.state.messages = this._mapMessages(session.messages || []);
      this.state.viewState = this.state.messages.length > 0 ? 'messages' : 'empty';

      // Load full messages from backend
      try {
        const record = await this._api.getSession(id);
        if (record?.messages) {
          this.state.messages = this._mapMessages(record.messages);
          this.state.viewState = record.messages.length > 0 ? 'messages' : 'empty';
        }
      } catch {
        /* use cached messages */
      }
    }
    this._render();
  }

  async createSession() {
    const url = window.location.href;
    const title = (document.title?.trim() || '新会话') + '.md';
    const now = Date.now();
    try {
      const record = await this._api.createSession({
        url,
        title,
        createdAt: now,
        updatedAt: now,
        lastAccessTime: now,
        messages: [],
        tags: [],
      });
      if (record?.key) {
        this.state.sessions.unshift({
          id: record.key,
          title: record.title || title,
          url: record.url || url,
          createdAt: record.createdAt || now,
          updatedAt: record.updatedAt || now,
          messageCount: 0,
        });
        this.state.currentSessionId = record.key;
        this.state.messages = [];
        this.state.viewState = 'empty';
        this.state.title = record.title || title;
      }
    } catch {
      /* ignore */
    }
    this._render();
  }

  async deleteSession(id: string) {
    const ok = await this._api.deleteSession(id);
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
          this.state.title = '与我聊天';
        }
      }
    }
    this._render();
  }

  // ── Search (debounced) ─────────────────────────────────────────────

  onSearchInput = (e: { target: { value: string } }) => {
    const value = e.target.value;
    // Update input value immediately for responsive UI
    this.state.searchInputValue = value;
    this._render();

    // Debounce the actual filter query
    if (this._searchTimer) clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      this.state.searchQuery = value.toLowerCase().trim();
      this.state.searchInputValue = value;
      this._render();
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
    if (!confirm(`确定要删除选中的 ${ids.length} 个会话吗？`)) return;

    for (const id of ids) {
      try {
        await this._api.deleteSession(id);
      } catch {
        /* continue */
      }
    }

    this.state.sessions = this.state.sessions.filter((s) => !ids.includes(s.id));
    // If current session was deleted, switch to first remaining
    if (this.state.currentSessionId && ids.includes(this.state.currentSessionId)) {
      this.state.currentSessionId =
        this.state.sessions.length > 0 ? this.state.sessions[0].id : null;
      if (this.state.currentSessionId) await this.selectSession(this.state.currentSessionId);
      else {
        this.state.messages = [];
        this.state.viewState = 'empty';
        this.state.title = '与我聊天';
      }
    }
    this.setState({ batchMode: false, selectedSessionIds: [] });
  }

  // ── Messages ──────────────────────────────────────────────────────

  private _mapMessages(raw: ChatMessage[]): Message[] {
    return raw
      .filter((m) => !!(m.content || m.imageDataUrl || '').trim() || m.type === 'pet')
      .map((m) => ({
        type: m.type,
        content: m.content,
        timestamp: m.timestamp || Date.now(),
        error: !!m.error,
        imageDataUrl: m.imageDataUrl,
      }));
  }

  sendMessage = async (text: string, images?: string[]) => {
    const imageList = images || this.state.draftImages || [];
    if (!text.trim() && imageList.length === 0) return;
    if (this.state.isProcessing) return;
    if (!this.state.currentSessionId) {
      await this._findOrCreateSession();
      if (!this.state.currentSessionId) return;
    }

    const userMsg: Message = {
      type: 'user',
      content: text,
      timestamp: Date.now(),
      imageDataUrl: imageList.length > 0 ? imageList[0] : undefined,
    };
    const petMsg: Message = {
      type: 'pet',
      content: '⏳ 正在思考...',
      timestamp: Date.now(),
      streaming: true,
    };
    this.state.messages.push(userMsg, petMsg);
    this.state.viewState = 'messages';
    this.state.isProcessing = true;
    this.state.draftImages = [];
    const petIdx = this.state.messages.length - 1;
    this._render();

    this._abortController = new AbortController();
    let responseText = '';

    try {
      responseText = await this._api.streamPrompt(
        text,
        this.state.currentSessionId,
        (token) => {
          responseText += token;
          this.state.messages[petIdx].content = responseText;
          this._render();
        },
        this._abortController.signal,
      );

      const final = responseText.trim() || '请继续。';
      this.state.messages[petIdx].streaming = false;
      this.state.messages[petIdx].content = final;

      // Update session message count
      const session = this.state.sessions.find((s) => s.id === this.state.currentSessionId);
      if (session) session.messageCount = this.state.messages.length;

      // Persist to backend
      this._api
        .updateSession(this.state.currentSessionId, {
          messages: [
            {
              type: 'user',
              content: text,
              timestamp: userMsg.timestamp,
              imageDataUrl: userMsg.imageDataUrl,
            },
            { type: 'pet', content: final, timestamp: petMsg.timestamp },
          ],
        })
        .catch(() => {});
    } catch (err: unknown) {
      const isAbort = (err as Error)?.name === 'AbortError';
      this.state.messages[petIdx].streaming = false;
      if (!isAbort) {
        this.state.messages[petIdx].content = `❌ ${(err as Error).message || '发送失败'}`;
        this.state.messages[petIdx].error = true;
      } else {
        this.state.messages[petIdx].content = responseText || '请求已取消。';
      }
    } finally {
      this.state.isProcessing = false;
      this._abortController = null;
      // Scroll to bottom after response
      setTimeout(() => this.scrollToBottom(true), 50);
    }
    this._render();
  };

  abortRequest = () => {
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }
  };

  // ── Message Actions ───────────────────────────────────────────────

  copyMessage = async (text: string) => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  };

  editMessage = (idx: number) => {
    const msg = this.state.messages[idx];
    if (!msg || msg.type !== 'user') return;
    const newContent = prompt('编辑消息内容：', msg.content);
    if (newContent === null || newContent === msg.content) return;
    msg.content = newContent;
    // Persist edit
    this._persistMessages();
    this._render();
  };

  resendMessage = (idx: number) => {
    const msg = this.state.messages[idx];
    if (!msg || msg.type !== 'user') return;
    const text = msg.content?.trim();
    if (!text) return;
    // Remove messages from this index onward
    this.state.messages = this.state.messages.slice(0, idx);
    this._render();
    // Re-send
    this.sendMessage(text);
  };

  deleteMessage = (idx: number) => {
    if (idx < 0 || idx >= this.state.messages.length) return;
    // Delete the message and the paired reply (user+pet or pet alone)
    const msg = this.state.messages[idx];
    let deleteCount = 1;
    if (msg.type === 'user' && idx + 1 < this.state.messages.length) {
      // Also delete the following pet message
      const next = this.state.messages[idx + 1];
      if (next.type === 'pet') deleteCount = 2;
    } else if (msg.type === 'pet' && idx - 1 >= 0) {
      // Also delete the preceding user message
      const prev = this.state.messages[idx - 1];
      if (prev.type === 'user') {
        this.state.messages.splice(idx - 1, 2);
      } else {
        this.state.messages.splice(idx, 1);
      }
      this.state.viewState = this.state.messages.length > 0 ? 'messages' : 'empty';
      this._persistMessages();
      this._render();
      return;
    }
    this.state.messages.splice(idx, deleteCount);
    this.state.viewState = this.state.messages.length > 0 ? 'messages' : 'empty';
    this._persistMessages();
    this._render();
  };

  moveMessageUp = (idx: number) => {
    if (idx <= 1) return;
    // Swap the user+pet pair at idx with the pair above
    const msg = this.state.messages[idx];
    const isPet = msg.type === 'pet';
    const pairStart = isPet ? idx - 1 : idx;
    if (pairStart < 2) return;
    // Find previous pair end
    const prevPairEnd = pairStart - 1;
    const prevMsg = this.state.messages[prevPairEnd];
    const prevIsPet = prevMsg.type === 'pet';
    const prevPairStart = prevIsPet ? prevPairEnd - 1 : prevPairEnd;
    if (prevPairStart < 0) return;

    const currentPair = this.state.messages.splice(pairStart, isPet ? 2 : 1);
    const insertAt = prevPairStart;
    this.state.messages.splice(insertAt, 0, ...currentPair);
    this._persistMessages();
    this._render();
  };

  moveMessageDown = (idx: number) => {
    const msg = this.state.messages[idx];
    const isUser = msg.type === 'user';
    const pairEnd = isUser ? idx + 1 : idx;
    if (pairEnd >= this.state.messages.length - 1) return;
    // Find next pair start
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
    this._render();
  };

  regenerateMessage = (idx: number) => {
    const msg = this.state.messages[idx];
    if (!msg || msg.type !== 'pet') return;
    if (this.state.isProcessing) return;
    // Find the preceding user message
    let userIdx = idx - 1;
    while (userIdx >= 0 && this.state.messages[userIdx].type !== 'user') userIdx--;
    if (userIdx < 0) return;
    const userText = this.state.messages[userIdx].content?.trim();
    if (!userText) return;
    // Remove from userIdx onward
    this.state.messages = this.state.messages.slice(0, userIdx);
    this._render();
    this.sendMessage(userText);
  };

  private _persistMessages() {
    if (!this.state.currentSessionId) return;
    const msgs: ChatMessage[] = this.state.messages.map((m) => ({
      type: m.type,
      content: m.content,
      timestamp: m.timestamp,
      error: m.error,
      imageDataUrl: m.imageDataUrl,
    }));
    this._api.updateSession(this.state.currentSessionId, { messages: msgs }).catch(() => {});
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
    this._render();
  };

  // ── Toolbar Actions (stubs for future implementation) ──────────────

  openContextEditor = () => {
    this._notify('页面上下文编辑器即将推出', 'info');
  };

  editSessionInfo = () => {
    if (!this.state.currentSessionId) {
      this._notify('请先选择一个会话', 'warning');
      return;
    }
    const session = this.state.sessions.find((s) => s.id === this.state.currentSessionId);
    const newTitle = prompt('编辑会话标题：', session?.title || '');
    if (newTitle === null || !newTitle.trim()) return;
    if (session) {
      session.title = newTitle.trim();
      this.state.title = newTitle.trim();
      this._api
        .updateSession(this.state.currentSessionId, { title: newTitle.trim() })
        .catch(() => {});
      this._notify('会话标题已更新', 'success');
    }
    this._render();
  };

  openTagManager = () => {
    this._notify('标签管理功能即将推出', 'info');
  };

  openFaqManager = () => {
    this._notify('常见问题功能即将推出', 'info');
  };

  openWeChatSettings = () => {
    this._notify('机器人设置功能即将推出', 'info');
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
    this._render();
  };

  toggleFullscreen = () => {
    const ws = this.state.ws;
    ws.isFullscreen = !ws.isFullscreen;
    this._render();
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
    this._render();
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
    this._render();
  };

  private _onDragEnd = () => {
    this.state.isDragging = false;
    document.removeEventListener('mousemove', this._onDragMove);
    document.removeEventListener('mouseup', this._onDragEnd);
    this._render();
  };

  // ── Resize ───────────────────────────────────────────────────────

  onResizeMouseDown = (dir: string, e: MouseEvent) => {
    if (this.state.ws.isFullscreen) return;
    this.state.isResizing = true;
    this._resizeDir = dir;
    this._resizeStart = {
      x: e.clientX,
      y: e.clientY,
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
    this._render();
  };

  private _onResizeEnd = () => {
    this.state.isResizing = false;
    document.removeEventListener('mousemove', this._onResizeMove);
    document.removeEventListener('mouseup', this._onResizeEnd);
    this._render();
  };

  // ── Render ───────────────────────────────────────────────────────

  private _render() {
    if (!this._rootEl) return;
    const c = React.createElement as (...args: unknown[]) => unknown;
    const el = c(ChatWindowRender, { controller: this });
    (ReactDOM as unknown as { render: (e: unknown, c: HTMLElement) => void }).render(
      el,
      this._rootEl,
    );
  }
}
