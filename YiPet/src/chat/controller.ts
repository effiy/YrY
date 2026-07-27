/**
 * ChatController — manages all chat state and logic.
 * Pattern-matches PopupComponent: plain class with manual _render() + ReactDOM.render().
 */

import type { ChatApi, ChatMessage } from './api/chat';
import type { Message, SessionItem, ChatState } from './types';
import { ChatWindowRender } from './window/ChatWindow';

// Re-export types needed by components
export type { Message, SessionItem, ChatState };

// ── Defaults ─────────────────────────────────────────────────────────────

const DEFAULT_WIDTH = 850;
const DEFAULT_HEIGHT = 720;
const MIN_WIDTH = 400;
const MIN_HEIGHT = 450;

// ── Controller ───────────────────────────────────────────────────────────

export class ChatController {
  state: ChatState;
  private _api: ChatApi;
  private _abortController: AbortController | null = null;
  private _rootEl: HTMLElement | null = null;

  // Drag state (non-reactive)
  private _dragStart = { x: 0, y: 0, wx: 0, wy: 0 };
  private _resizeDir = '';
  private _resizeStart = { x: 0, y: 0, w: 0, h: 0 };

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
      searchQuery: '',
      sessionLoading: false,
      sidebarCollapsed: false,
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
  }

  // ── Public API ─────────────────────────────────────────────────────

  toggle = () => {
    this.setState({ visible: !this.state.visible });
  };

  open = () => this.setState({ visible: true });
  close = () => this.setState({ visible: false });

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
    } catch { /* ignore */ }
    this.state.sessionLoading = false;
  }

  private async _findOrCreateSession() {
    const url = window.location.href;
    const existing = this.state.sessions.find((s) => s.url === url);
    if (existing) {
      this.state.currentSessionId = existing.id;
      const msgs = existing.messages || [];
      this.state.messages = this._mapMessages(msgs);
      this.state.viewState = msgs.length > 0 ? 'messages' : 'empty';
      return;
    }

    // Create new session
    const title = (document.title?.trim()
      ? (document.title.endsWith('.md') ? document.title : `${document.title}.md`)
      : '新会话.md');
    const now = Date.now();
    try {
      const record = await this._api.createSession({
        url,
        title,
        pageDescription: (document.querySelector('meta[name="description"]') as HTMLMetaElement)?.content || '',
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
    } catch { /* ignore */ }
    this.state.viewState = 'empty';
  }

  async selectSession(id: string) {
    this.state.currentSessionId = id;
    const session = this.state.sessions.find((s) => s.id === id);
    if (session) {
      this.state.title = session.title || '未命名会话';
      this.state.messages = this._mapMessages(session.messages || []);
      this.state.viewState = this.state.messages.length > 0 ? 'messages' : 'empty';
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
      }
    } catch { /* ignore */ }
    this._render();
  }

  async deleteSession(id: string) {
    const ok = await this._api.deleteSession(id);
    if (ok) {
      const idx = this.state.sessions.findIndex((s) => s.id === id);
      if (idx >= 0) this.state.sessions.splice(idx, 1);
      if (this.state.currentSessionId === id) {
        this.state.currentSessionId = this.state.sessions.length > 0 ? this.state.sessions[0].id : null;
        if (this.state.currentSessionId) await this.selectSession(this.state.currentSessionId);
        else {
          this.state.messages = [];
          this.state.viewState = 'empty';
        }
      }
    }
    this._render();
  }

  onSearchInput = (e: { target: { value: string } }) => {
    this.setState({ searchQuery: e.target.value });
  };

  clearSearch = () => {
    this.setState({ searchQuery: '' });
  };

  get filteredSessions(): SessionItem[] {
    const q = this.state.searchQuery.toLowerCase().trim();
    if (!q) return this.state.sessions;
    return this.state.sessions.filter(
      (s) => s.title.toLowerCase().includes(q) || s.url.toLowerCase().includes(q),
    );
  }

  // ── Messages ──────────────────────────────────────────────────────

  private _mapMessages(raw: ChatMessage[]): Message[] {
    return raw
      .filter((m) => !!(m.content || '').trim())
      .map((m) => ({
        type: m.type,
        content: m.content,
        timestamp: m.timestamp || Date.now(),
        error: !!m.error,
      }));
  }

  sendMessage = async (text: string) => {
    if (!text.trim() || this.state.isProcessing) return;
    if (!this.state.currentSessionId) {
      await this._findOrCreateSession();
      if (!this.state.currentSessionId) return;
    }

    const userMsg: Message = { type: 'user', content: text, timestamp: Date.now() };
    const petMsg: Message = { type: 'pet', content: '⏳ 正在思考...', timestamp: Date.now(), streaming: true };
    this.state.messages.push(userMsg, petMsg);
    this.state.viewState = 'messages';
    this.state.isProcessing = true;
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

      // Persist to backend
      this._api.updateSession(this.state.currentSessionId, {
        messages: [
          { type: 'user', content: text, timestamp: userMsg.timestamp },
          { type: 'pet', content: final, timestamp: petMsg.timestamp },
        ],
      }).catch(() => {});
    } catch (err: unknown) {
      const isAbort = (err as Error)?.name === 'AbortError';
      this.state.messages[petIdx].streaming = false;
      if (!isAbort) {
        this.state.messages[petIdx].content = `❌ ${(err as Error).message || '发送失败'}`;
        this.state.messages[petIdx].error = true;
      } else if (!responseText) {
        this.state.messages[petIdx].content = '请求已取消。';
      }
    } finally {
      this.state.isProcessing = false;
      this._abortController = null;
    }
    this._render();
  };

  abortRequest = () => {
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }
  };

  copyMessage = async (text: string) => {
    if (!text.trim()) return;
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
  };

  // ── Window Controls ──────────────────────────────────────────────

  toggleSidebar = () => {
    this.setState({ sidebarCollapsed: !this.state.sidebarCollapsed });
  };

  toggleFullscreen = () => {
    const ws = this.state.ws;
    ws.isFullscreen = !ws.isFullscreen;
    this._render();
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
    ws.x = Math.max(0, Math.min(window.innerWidth - ws.width, this._dragStart.wx + (e.clientX - this._dragStart.x)));
    ws.y = Math.max(0, Math.min(window.innerHeight - ws.height, this._dragStart.wy + (e.clientY - this._dragStart.y)));
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
    this._resizeStart = { x: e.clientX, y: e.clientY, w: this.state.ws.width, h: this.state.ws.height };
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
    (ReactDOM as unknown as { render: (e: unknown, c: HTMLElement) => void }).render(el, this._rootEl);
  }
}
