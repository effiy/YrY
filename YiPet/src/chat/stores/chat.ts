/**
 * YiPet Chat — Pinia store.
 * Ported from the ChatController class (useSyncExternalStore → Pinia reactive state).
 */
import { defineStore } from 'pinia';
import { reactive, watch } from 'vue';
import type {
  BugService, ChatService, KnowledgeService,
  RagService, SessionService, WeWorkService,
} from '@/api/services';
import { detectPageTypeFromUrl, detectProjectFromUrl, makeBugKey } from '@/api/services/bug';
import type {
  BugFrequency, BugPriority, BugSeverity, BugStatus, BugType,
  ChatMessage, KnowledgeFileEntry, KnowledgeTreeNode, RagChatMessage, RagSource, TodoItem, WeWorkBot,
} from '@/api/types';
import { DEFAULT_MODEL } from '../constants';
import type { ChatState, Message, SessionItem } from '../types';
import { createApiServices } from '@/api';
import { redactUrlCredentials } from '@/utils/url';
import { useChatWindow } from './useChatWindow';

export type { ChatState, Message, SessionItem };

const DEFAULT_WIDTH = 760;
const MIN_WIDTH = 480;
const MIN_HEIGHT = 400;
const DEFAULT_SIDEBAR_WIDTH = 320;
const MIN_SIDEBAR_WIDTH = 240;
const MAX_SIDEBAR_WIDTH = 600;
const MAX_DRAFT_IMAGES = 4;

type NotifyType = 'info' | 'success' | 'error' | 'warning';

let _notifyHandler: ((message: string, type: NotifyType) => void) | null = null;

function notify(message: string, type: NotifyType = 'info') {
  if (_notifyHandler) _notifyHandler(message, type);
}

function readPageInfo() {
  return {
    title: document.title || '',
    // Single capture point — every persisted URL (session record, from: tag,
    // knowledge frontmatter) flows from here, so credentials are stripped once.
    url: redactUrlCredentials(window.location.href || ''),
    iconUrl: (document.querySelector('link[rel*="icon"]') as HTMLLinkElement)?.href || '',
  };
}

/** Generate a safe filename from a URL: hostname + path, special chars replaced. */
function slugifyUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '').replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '').replace(/[^a-zA-Z0-9/._-]/g, '_');
    const slug = path ? `${host}${path}` : host;
    return slug.slice(0, 80) || 'unknown';
  } catch {
    return url.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 80);
  }
}

/** Format page content as a markdown file with YAML frontmatter. */
function formatPageMarkdown(title: string, url: string, content: string): string {
  const now = new Date().toISOString();
  return [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    `url: "${url}"`,
    `captured_at: ${now}`,
    `source: YiPet`,
    '---',
    '',
    `# ${title}`,
    '',
    content,
  ].join('\n');
}

const CTX_PREFIX = 'ctx:';

function mapMessages(raw: ChatMessage[]): Message[] {
  return raw.map((m) => ({
    type: (m.type === 'user' ? 'user' : 'pet') as 'user' | 'pet',
    content: m.content || m.message || '',
    timestamp: m.timestamp || Date.now(),
    imageDataUrl: m.imageDataUrl,
    imageDataUrls: Array.isArray(m.imageDataUrls) ? m.imageDataUrls : undefined,
  }));
}

/** Build a nested knowledge tree from the flat /knowledge-scan categories. */
function buildKnowledgeTree(
  categories: { category: string; files: KnowledgeFileEntry[] }[],
): KnowledgeTreeNode[] {
  const roots: KnowledgeTreeNode[] = [];
  const folderMap = new Map<string, KnowledgeTreeNode>();
  const files = categories
    .flatMap((c) => c.files)
    .sort((a, b) => a.path.localeCompare(b.path));
  for (const f of files) {
    const parts = f.path.split('/').filter(Boolean);
    if (!parts.length) continue;
    const name = parts.pop() || f.path;
    let siblings = roots;
    let prefix = '';
    for (const seg of parts) {
      prefix = prefix ? `${prefix}/${seg}` : seg;
      const key = `folder:${prefix}`;
      let folder = folderMap.get(key);
      if (!folder) {
        folder = { path: prefix, name: seg, type: 'folder', children: [] };
        folderMap.set(key, folder);
        siblings.push(folder);
      }
      siblings = folder.children!;
    }
    siblings.push({ path: f.path, name: f.name || name, type: 'file', size: f.size });
  }
  return roots;
}

// ── Store ─────────────────────────────────────────────────────────────────

export const useChatStore = defineStore('chat', () => {
  // We'll set these after createApiServices is called
  let _chat: ChatService;
  let _sessions: SessionService;
  let _wework: WeWorkService;
  let _knowledge: KnowledgeService;
  let _rag: RagService;
  let _bug: BugService;
  let _abortController: AbortController | null = null;
  let _searchTimer: ReturnType<typeof setTimeout> | null = null;
  let _scrollTimer: ReturnType<typeof setTimeout> | null = null;
  let _loadSessionsPromise: Promise<void> | null = null;
  let _treeSessionMap: Map<string, SessionItem> = new Map();
  let _confirmationTimer: ReturnType<typeof setTimeout> | null = null;
  let _compactionTimer: ReturnType<typeof setTimeout> | null = null;

  // Drag/resize state (non-reactive)
  const _dragStart = { x: 0, y: 0, wx: 0, wy: 0 };
  const _resizeStart = { x: 0, y: 0, wx: 0, wy: 0, w: 0, h: 0, dir: '' };
  const _sidebarResizeStart = { x: 0, startWidth: 0 };

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900;

  const state = reactive<ChatState>({
    visible: false,
    title: 'Chat with me',
    viewState: 'empty',
    pageInfo: { title: '', url: '', iconUrl: '' },
    messages: [],
    isProcessing: false,
    sessions: [],
    currentSessionId: null,
    searchInputValue: '',
    searchQuery: '',
    sessionProjectFilter: '',
    sessionLoading: false,
    sidebarCollapsed: true,
    sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
    batchMode: false,
    selectedSessionIds: [],
    contextEditingId: null,
    draftImages: [],
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
    knowledgeSyncing: false,
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
    saveToKnowledgeDraftMetadata: { title: '', category: '', tags: '', type: '' },
    saveToKnowledgeLoading: false,
    saveToKnowledgeTimestamp: null,
    ragPreviewSources: [],
    ragPreviewLoading: false,
    ragPreviewVisible: false,
    ragPreviewQuestion: '',
    ragCategories: null,
    ragCategoriesLoading: false,
    knowledgeCategoryFilter: '',
    ragHybrid: true,
    ragRerank: false,
    ragCitations: true,
    ragChatMode: 'condense_plus_context',
    ragNumQueries: 1,
    ragTags: [],
    webSearchEnabled: false,
    selectedModel: DEFAULT_MODEL,
    availableModels: [],
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
      title: '', project: '', module: '', severity: 'minor' as BugSeverity,
      priority: 'p2' as BugPriority, status: 'open' as BugStatus,
      type: 'functional' as BugType, frequency: 'always' as BugFrequency,
      assignee: '', reporter: '', environment: '', affectedVersion: '',
      fixedVersion: '', tags: '', description: '', stepsToReproduce: '',
      expectedResult: '', actualResult: '',
    },
    weChatRobots: [],
    weChatRobotsDraft: [],
    weChatSettingsVisible: false,
    colorIndex: 0,
    systemPrompt: '',
    roleName: 'Teacher',
    roleImageUrl: '',
    streamingTargetTimestamp: null,
    streamingType: '',
    streamingPhase: '',
    webSearchResults: [],
    scrollTick: 0,
    copyFeedback: {},
    feedback: {},
    faqVisible: false,
    faqSearch: '',
    faqApplyMode: 'append',
    sessionEditVisible: false,
    tagManagerVisible: false,
    inputTemplate: '',
    promptHistory: [],
    promptHistoryVisible: false,
    ws: {
      x: Math.max(0, vw - DEFAULT_WIDTH),
      y: 0,
      width: DEFAULT_WIDTH,
      height: vh,
      isFullscreen: false,
    },
    isDragging: false,
    isResizing: false,
  });

  // ── Service injection ─────────────────────────────────────────────────

  function injectServices(services: {
    chat: ChatService; sessions: SessionService;
    wework: WeWorkService; knowledge: KnowledgeService; rag: RagService; bug: BugService;
  }) {
    _chat = services.chat;
    _sessions = services.sessions;
    _wework = services.wework;
    _knowledge = services.knowledge;
    _rag = services.rag;
    _bug = services.bug;
  }

  function setNotifyHandler(handler: (message: string, type: NotifyType) => void) {
    _notifyHandler = handler;
  }

  // ── Persistence helpers ───────────────────────────────────────────────

  function _persistSetting(key: string, value: unknown) {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [key]: value }).catch(() => {});
    }
  }

  function _persistWindowState() {
    _persistSetting('chatWindowState', { ...state.ws });
  }

  async function _loadPersistedState() {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) return;
    try {
      const result = (await chrome.storage.local.get([
        'sidebarWidth', 'sidebarCollapsed', 'knowledgeGrounded',
        'ragScope', 'ragScopeIsFile', 'weChatRobots', 'promptHistory',
        'windowState', 'chatColorIndex',
      ])) as Record<string, unknown>;
      if (typeof result.sidebarWidth === 'number') state.sidebarWidth = result.sidebarWidth;
      if (typeof result.sidebarCollapsed === 'boolean') state.sidebarCollapsed = result.sidebarCollapsed;
      if (typeof result.knowledgeGrounded === 'boolean') state.knowledgeGrounded = result.knowledgeGrounded;
      if (typeof result.ragScope === 'string') state.ragScope = result.ragScope;
      if (typeof result.ragScopeIsFile === 'boolean') state.ragScopeIsFile = result.ragScopeIsFile;
      if (Array.isArray(result.weChatRobots)) state.weChatRobots = result.weChatRobots as WeWorkBot[];
      if (Array.isArray(result.promptHistory)) {
        state.promptHistory = (result.promptHistory as string[]).filter((s): s is string => typeof s === 'string').slice(-100);
      }
      if (result.windowState && typeof result.windowState === 'object') {
        const ws = result.windowState as Record<string, unknown>;
        if (typeof ws.x === 'number') state.ws.x = ws.x;
        if (typeof ws.y === 'number') state.ws.y = ws.y;
        if (typeof ws.width === 'number') state.ws.width = ws.width;
        if (typeof ws.height === 'number') state.ws.height = ws.height;
        if (typeof ws.isFullscreen === 'boolean') state.ws.isFullscreen = ws.isFullscreen;
      }
    } catch { /* storage unavailable */ }
  }

  // ── Session management ───────────────────────────────────────────────

  async function _loadSessions() {
    if (_loadSessionsPromise) return _loadSessionsPromise;
    _loadSessionsPromise = (async () => {
      state.sessionLoading = true;
      try {
        const res = await _sessions.list({ pageSize: 200 });
        if (res.ok && res.data) {
          const list = res.data;
          state.sessions = list.map((d) => ({
            id: d.key || d.id || '',
            title: d.title || d.data?.title || 'Untitled',
            url: d.url || d.data?.url || '',
            createdAt: d.createdAt || d.data?.createdAt || Date.now(),
            updatedAt: d.updatedAt || d.data?.updatedAt || Date.now(),
            messageCount: d.messageCount || d.data?.messageCount || 0,
            messages: d.data?.messages || undefined,
            isFavorite: d.data?.isFavorite || false,
            tags: d.tags || d.data?.tags || [],
            pageContent: d.pageContent || d.data?.pageContent || '',
          }));
          _resortSessions();
        }
      } catch { /* ignore */ }
      finally { state.sessionLoading = false; _loadSessionsPromise = null; }
    })();
    return _loadSessionsPromise;
  }

  function _resortSessions() {
    state.sessions.sort((a, b) => {
      if (!!a.isFavorite !== !!b.isFavorite) return a.isFavorite ? -1 : 1;
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
  }

  async function _findOrCreateSession() {
    const url = state.pageInfo.url;
    const existing = state.sessions.find((s) => s.url === url);
    if (existing) {
      state.currentSessionId = existing.id;
      state.title = existing.title;
      await _loadSessionMessages(existing.id);
      state.viewState = state.messages.length > 0 ? 'messages' : 'empty';
      // Auto-save context file even for existing sessions that don't have it yet
      await _ensurePageContext(existing);
      return;
    }
    await createSession();
  }

  /** Ensure the page content is saved as a context file for the given session.
   *  Idempotent — skips the write if the session already has the ctx: tag, but
   *  always surfaces the page md as the first "Active context" scope. */
  async function _ensurePageContext(session: SessionItem) {
    const filename = slugifyUrl(session.url);
    const ctxPath = `websites/${filename}.md`;
    // Always make this page the active context scope so the Context pill shows
    // the page md as its first item, independent of the knowledge write result.
    setRagScopeFromNode(ctxPath, true);

    const hasCtx = (session.tags || []).some((t) => t === `${CTX_PREFIX}${ctxPath}`);
    if (hasCtx) return;

    const rawContent = document.body?.innerText?.slice(0, 8000) || '';
    const tags = [...(session.tags || []).filter((t) => !t.startsWith(CTX_PREFIX)), `${CTX_PREFIX}${ctxPath}`];
    if (!tags.includes('source:YiPet')) tags.push('source:YiPet');
    if (!tags.some((t) => t.startsWith('from:'))) tags.push(`from:${session.url}`);
    try {
      if (_knowledge) {
        const existing = await _knowledge.read(ctxPath);
        if (!existing.ok || !existing.data) {
          const md = formatPageMarkdown(session.title, session.url, rawContent);
          await _knowledge.write(ctxPath, md, { title: session.title, url: session.url, source: 'YiPet' });
        }
      }
      const bodyOnly = [`# ${session.title}`, '', rawContent].join('\n');
      await _sessions.update(session.id, {
        pageContent: `## ${ctxPath}\n\n${bodyOnly}`,
        tags,
      } as unknown as Record<string, unknown>);
      session.pageContent = `## ${ctxPath}\n\n${bodyOnly}`;
      session.tags = tags;
      state.contextEditingId = session.id;
      if (state.knowledgeTree.length === 0) loadKnowledgeTree();
    } catch (e) { /* ignore */ }
  }

  async function _loadSessionMessages(id: string) {
    try {
      const record = await _sessions.get(id);
      const rdata = record.data;
      const inner = rdata?.data;
      if (inner?.messages) {
        state.messages = mapMessages(inner.messages);
      } else if (rdata?.messages) {
        state.messages = mapMessages(rdata.messages);
      }
      if (inner && 'pageContent' in inner) {
        const session = state.sessions.find((s) => s.id === id);
        if (session) session.pageContent = inner.pageContent || '';
      }
    } catch (_e) { /* ignore */ }
  }

  async function selectSession(id: string) {
    state.isProcessing && stopSending();
    const session = state.sessions.find((s) => s.id === id);
    if (session) {
      state.currentSessionId = id;
      state.title = session.title;
      state.messages = [];
      state.viewState = 'messages';
      await _loadSessionMessages(id);
    }
  }

  async function startContextEditing(id: string) {
    await selectSession(id);
    state.contextEditingId = id;
    if (state.knowledgeTree.length === 0) loadKnowledgeTree();
  }

  function stopContextEditing() {
    state.contextEditingId = null;
  }

  async function createSession() {
    state.isProcessing && stopSending();
    const url = state.pageInfo.url;
    const title = state.pageInfo.title || 'New Chat';
    const existing = state.sessions.find((s) => s.url === url);
    if (existing) {
      state.currentSessionId = existing.id;
      state.title = existing.title;
      await _loadSessionMessages(existing.id);
      state.viewState = state.messages.length > 0 ? 'messages' : 'empty';
      return;
    }
    try {
      const rawContent = document.body?.innerText?.slice(0, 8000) || '';
      const res = await _sessions.create({
        title,
        url,
        tags: [`source:YiPet`, `from:${url}`],
        pageContent: rawContent,
      });
      if (res.ok && res.data?.key) {
        const id = res.data.key as string;
        state.currentSessionId = id;
        state.title = title;
        state.messages = [];
        state.viewState = 'empty';
        // Auto-save page content as markdown to YiKnowledge/websites/ and add as context file
        const saved = await _autoSavePageContext(id, url, title, rawContent);
        await _loadSessions();
        if (saved) {
          state.contextEditingId = id;
          if (state.knowledgeTree.length === 0) loadKnowledgeTree();
        }
      }
    } catch { /* ignore */ }
  }

  /** Save page content as markdown to YiKnowledge/websites/ and wire it as a session context file.
   *  Returns true if the context file was successfully saved and wired. */
  async function _autoSavePageContext(
    sessionId: string,
    url: string,
    title: string,
    rawContent: string,
  ): Promise<boolean> {
    const filename = slugifyUrl(url);
    const ctxPath = `websites/${filename}.md`;
    // Surface the page md as the active context scope even if the body is empty
    // or the knowledge write later fails — keeps the Context pill visible.
    setRagScopeFromNode(ctxPath, true);
    if (!rawContent.trim()) return false;
    if (!_knowledge) return false;
    try {
      const existing = await _knowledge.read(ctxPath);
      if (existing.ok && existing.data) {
        const bodyOnly = [`# ${title}`, '', rawContent].join('\n');
        await _sessions.update(sessionId, {
          pageContent: `## ${ctxPath}\n\n${bodyOnly}`,
          tags: [`source:YiPet`, `from:${url}`, `${CTX_PREFIX}${ctxPath}`],
        } as unknown as Record<string, unknown>);
        return true;
      }
    } catch (e) { /* proceed to create */ }

    const md = formatPageMarkdown(title, url, rawContent);
    try {
      await _knowledge.write(ctxPath, md, { title, url, source: 'YiPet' });
      const bodyOnly = [`# ${title}`, '', rawContent].join('\n');
      await _sessions.update(sessionId, {
        pageContent: `## ${ctxPath}\n\n${bodyOnly}`,
        tags: [`source:YiPet`, `from:${url}`, `${CTX_PREFIX}${ctxPath}`],
      } as unknown as Record<string, unknown>);
      return true;
    } catch (e) { return false; }
  }

  async function deleteSession(id: string) {
    const res = await _sessions.delete(id);
    if (res?.ok) {
      const idx = state.sessions.findIndex((s) => s.id === id);
      if (idx >= 0) state.sessions.splice(idx, 1);
      if (state.currentSessionId === id) {
        state.currentSessionId = null;
        state.messages = [];
        state.viewState = 'empty';
      }
    }
  }

  async function toggleFavorite(id: string) {
    const session = state.sessions.find((s) => s.id === id);
    if (!session) return;
    session.isFavorite = !session.isFavorite;
    await _sessions.update(id, { isFavorite: session.isFavorite } as unknown as Record<string, unknown>);
    _resortSessions();
  }

  async function renameSession(id: string, title: string) {
    const session = state.sessions.find((s) => s.id === id);
    if (!session) return;
    const trimmed = title.trim();
    if (!trimmed || trimmed === session.title) return;
    const prev = session.title;
    session.title = trimmed;
    if (state.currentSessionId === id) state.title = trimmed;
    try {
      await _sessions.update(id, { title: trimmed } as unknown as Record<string, unknown>);
    } catch {
      session.title = prev;
      if (state.currentSessionId === id) state.title = prev;
    }
  }


  // ── Window management (extracted to useChatWindow composable) ──
  const _windowActions = useChatWindow(
    state as any, vw, vh,
    _dragStart, _resizeStart, _sidebarResizeStart,
    () => { _loadSessions().then(() => _findOrCreateSession()); },
    _persistWindowState,
    _persistSetting,
  );
  const {
    open, close, toggle,
    startDrag, onDragMove, endDrag,
    startResize, onResizeMove, endResize,
    toggleFullscreen,
    startSidebarResize, onSidebarResizeMove, endSidebarResize,
  } = _windowActions;


  function stopSending() {
    _abortController?.abort();
    _abortController = null;
    state.isProcessing = false;
    state.streamingType = '';
    state.streamingPhase = '';
    state.streamingTargetTimestamp = null;
  }

  async function sendMessage(text: string, images?: string[]) {
    const imageList = images || state.draftImages || [];
    if (!text.trim() && imageList.length === 0) return;
    const content = text.trim();
    if (content) pushPromptHistory(text);

    // ── Slash commands (mirrors YiVad aiChat) ──

    if (content.startsWith('/clear')) {
      state.messages = [];
      state.viewState = 'empty';
      state.draftImages = [];
      _persistMessages();
      notify('Conversation cleared');
      return;
    }

    if (content.startsWith('/stop')) {
      stopSending();
      return;
    }

    if (content.startsWith('/retry')) {
      await retryLastMessage();
      return;
    }

    if (content.startsWith('/export')) {
      exportCurrentSessionMarkdown();
      return;
    }

    if (content.startsWith('/compact')) {
      notify('Compact is not available');
      return;
    }

    if (state.isProcessing) return;
    if (!state.currentSessionId) {
      await _loadSessions();
      await _findOrCreateSession();
      if (!state.currentSessionId) return;
    }

    const now = Date.now();
    const userMsg: Message = { type: 'user', content: text, timestamp: now };
    if (imageList.length > 0) {
      userMsg.imageDataUrl = imageList[0];
      userMsg.imageDataUrls = imageList;
    }
    const petMsg: Message = { type: 'pet', content: '', timestamp: now + 1, streaming: true };
    state.messages.push(userMsg, petMsg);
    state.viewState = 'messages';
    state.isProcessing = true;
    state.draftImages = [];
    const userIdx = state.messages.length - 2;

    await _runStream(userIdx, petMsg.timestamp, 'send');
  }

  async function _runStream(userIdx: number, petTimestamp: number, type: 'send' | 'regenerate' | 'resend') {
    const slice = state.messages.slice(0, userIdx + 1);
    const lastUserMsg = slice[slice.length - 1];
    const images = lastUserMsg?.imageDataUrls ?? (lastUserMsg?.imageDataUrl ? [lastUserMsg.imageDataUrl] : []);
    const userContent = lastUserMsg?.content || '';

    state.streamingTargetTimestamp = petTimestamp;
    state.streamingType = type;
    state.isProcessing = true;
    state.streamingPhase = state.knowledgeGrounded ? 'retrieving' : 'thinking';
    state.ragSources = [];
    _abortController = new AbortController();
    let streamed = '';
    let lastScrollAt = 0;
    let phaseFlipped = false;
    const streamStart = Date.now();
    let firstTokenAt = 0;
    const SCROLL_THROTTLE_MS = 120;

    const findPetIdx = () => state.messages.findIndex((m) => m.timestamp === petTimestamp);

    const onToken = (token: string) => {
      streamed += token;
      if (!phaseFlipped) { phaseFlipped = true; state.streamingPhase = 'streaming'; firstTokenAt = Date.now(); }
      const idx = findPetIdx();
      if (idx >= 0) {
        state.messages[idx].content = streamed;
        state.messages[idx].error = false;
        state.messages[idx].aborted = false;
      }
      const now2 = Date.now();
      if (now2 - lastScrollAt > SCROLL_THROTTLE_MS) {
        lastScrollAt = now2;
        state.scrollTick++;
      }
    };


    try {
      if (state.knowledgeGrounded) {
        // Auto-derive RAG scope from session context files when no explicit scope
        if (!state.ragScope) {
          const ctxFiles = getSessionContextFiles();
          const derived = deriveScopeFromContextFiles(ctxFiles);
          if (derived) {
            state.ragScope = derived.scope;
            state.ragScopeIsFile = derived.isFile;
          }
        }
        const useFileChat = state.ragScopeIsFile && !!state.ragScope;
        state.streamingPhase = 'retrieving';
        if (useFileChat) {
          const groundedQuestion = state.systemPrompt
            ? `${state.systemPrompt}\n\n${userContent}`
            : userContent;
          await _rag.streamFileChatWithCallback(
            { target_file: state.ragScope, question: groundedQuestion },
            onToken,
            _abortController.signal,
          );
        } else {
          const messages: RagChatMessage[] = [];
          if (state.systemPrompt) {
            messages.push({ role: 'system', content: state.systemPrompt });
          }
          // Build conversation history from prior messages (last 10 exchanges)
          const historyStart = Math.max(0, slice.length - 20);
          for (let i = historyStart; i < slice.length; i++) {
            const m = slice[i];
            if (m.type === 'user') {
              messages.push({ role: 'user', content: m.content || '' });
            } else if (m.type === 'pet' && m.content && !m.error && !m.aborted) {
              messages.push({ role: 'assistant', content: m.content });
            }
          }
          await _rag.streamChatWithCallback(
            {
              messages,
              scope: state.ragScope || undefined,
              category: state.knowledgeCategoryFilter || undefined,
              chat_mode: state.ragChatMode,
              hybrid: state.ragHybrid,
              rerank: state.ragRerank,
              citations: state.ragCitations,
              num_queries: state.ragNumQueries,
              tags: state.ragTags.length ? state.ragTags : undefined,
            },
            onToken,
            (sources) => { state.ragSources = sources; },
            _abortController.signal,
          );
        }
      } else {
        await _chat.streamWithCallback(
          {
            system: state.systemPrompt || undefined,
            user: userContent,
            model: state.selectedModel || DEFAULT_MODEL,
            images: images.length > 0 ? images : undefined,
          },
          onToken,
          _abortController.signal,
        );
      }
    } catch (e) {
      const idx = findPetIdx();
      if (idx >= 0) {
        const isAbort = (e as Error)?.name === 'AbortError';
        state.messages[idx].error = !isAbort;
        state.messages[idx].aborted = isAbort;
      }
    } finally {
      state.isProcessing = false;
      state.streamingType = '';
      state.streamingPhase = '';
      state.streamingTargetTimestamp = null;
      _abortController = null;
      const idx = findPetIdx();
      if (idx >= 0) {
        state.messages[idx].streaming = false;
        if (state.knowledgeGrounded) {
          state.messages[idx].sources = state.ragSources;
          state.messages[idx].ragMeta = {
            chatMode: state.ragChatMode,
            hybrid: state.ragHybrid,
            rerank: state.ragRerank,
            citations: state.ragCitations,
            numQueries: state.ragNumQueries,
            category: state.knowledgeCategoryFilter || undefined,
            tags: state.ragTags.length ? state.ragTags : undefined,
            scope: state.ragScope || undefined,
          };
        }
        if (firstTokenAt > 0) {
          state.messages[idx].firstTokenLatencyMs = firstTokenAt - streamStart;
        }
        const target = state.sessions.find((s) => s.id === state.currentSessionId);
        if (target) target.messageCount = state.messages.length;
      }
      _persistMessages();
      setTimeout(() => scrollToBottom(true), 50);
    }
  }


  function _persistMessages() {
    if (!state.currentSessionId) return;
    const msgs: Record<string, unknown>[] = state.messages.map((m) => ({
      type: m.type === 'user' ? 'user' : 'pet',
      content: m.content,
      timestamp: m.timestamp,
      ...(m.imageDataUrl ? { imageDataUrl: m.imageDataUrl } : {}),
      ...(m.imageDataUrls?.length ? { imageDataUrls: m.imageDataUrls } : {}),
    }));
    _sessions.update(state.currentSessionId, { messages: msgs } as unknown as Record<string, unknown>);
  }

  function scrollToBottom(force?: boolean) {
    state.scrollTick++;
  }

  // ── Prompt history ───────────────────────────────────────────────────

  function pushPromptHistory(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const hist = state.promptHistory;
    if (hist[hist.length - 1] === trimmed) return;
    hist.push(trimmed);
    if (hist.length > 100) hist.splice(0, hist.length - 100);
    _persistSetting('promptHistory', hist);
  }

  // ── Color/Role ──────────────────────────────────────────────────────

  function setColorIndex(idx: number) {
    if (!Number.isFinite(idx) || idx === state.colorIndex) return;
    state.colorIndex = idx;
    _persistSetting('chatColorIndex', idx);
  }

  function setRole(name: string, imageUrl: string) {
    state.roleName = name;
    state.roleImageUrl = imageUrl;
  }

  function setSystemPrompt(prompt: string) {
    state.systemPrompt = prompt;
  }

  // ── Knowledge / RAG ─────────────────────────────────────────────────

  /** Extract context file paths from the current session's ctx: tags. */
  function getSessionContextFiles(): string[] {
    const cur = state.sessions.find((s) => s.id === state.currentSessionId);
    if (!cur?.tags) return [];
    return cur.tags
      .filter((t) => typeof t === 'string' && t.startsWith(CTX_PREFIX))
      .map((t) => t.slice(CTX_PREFIX.length));
  }

  /** Derive a RAG scope from session context files. Returns the common directory
   *  prefix when multiple files share a parent, or the single file path. */
  function deriveScopeFromContextFiles(files: string[]): { scope: string; isFile: boolean } | null {
    if (!files.length) return null;
    if (files.length === 1) return { scope: files[0], isFile: true };
    // Find common directory prefix
    const parts = files.map((f) => f.split('/'));
    const minLen = Math.min(...parts.map((p) => p.length));
    let commonLen = 0;
    for (let i = 0; i < minLen - 1; i++) {
      const seg = parts[0][i];
      if (parts.every((p) => p[i] === seg)) commonLen = i + 1;
      else break;
    }
    if (commonLen > 0) {
      return { scope: parts[0].slice(0, commonLen).join('/'), isFile: false };
    }
    // No common prefix — use the first file
    return { scope: files[0], isFile: true };
  }

  function toggleKnowledgeGrounded() {
    state.knowledgeGrounded = !state.knowledgeGrounded;
    _persistSetting('knowledgeGrounded', state.knowledgeGrounded);
    // When enabling RAG, auto-scope to session context files if no explicit scope
    if (state.knowledgeGrounded && !state.ragScope) {
      const ctxFiles = getSessionContextFiles();
      const derived = deriveScopeFromContextFiles(ctxFiles);
      if (derived) {
        state.ragScope = derived.scope;
        state.ragScopeIsFile = derived.isFile;
      }
    }
  }

  function setRagScopeFromNode(path: string, isFile: boolean) {
    state.ragScope = path;
    state.ragScopeIsFile = isFile;
    _persistSetting('ragScope', path);
    _persistSetting('ragScopeIsFile', isFile);
  }

  function clearRagScope() {
    state.ragScope = '';
    state.ragScopeIsFile = false;
    _persistSetting('ragScope', '');
    _persistSetting('ragScopeIsFile', false);
  }

  async function loadKnowledgeTree(category?: string) {
    if (state.knowledgeLoading) return;
    state.knowledgeLoading = true;
    state.knowledgeError = '';
    try {
      const res = await _knowledge.scan(category || state.knowledgeCategoryFilter || undefined);
      if (res.ok && res.data) state.knowledgeTree = buildKnowledgeTree(res.data.categories || []);
      else if (res.error) state.knowledgeError = res.error;
    } catch (e) {
      state.knowledgeError = e instanceof Error ? e.message : 'Failed to load knowledge tree';
    }
    finally { state.knowledgeLoading = false; }
  }

  async function syncKnowledge() {
    if (state.knowledgeSyncing) return;
    state.knowledgeSyncing = true;
    try {
      const res = await _knowledge.sync();
      if (res.ok && res.data) {
        const parts: string[] = [];
        if (res.data.synced > 0) parts.push(`${res.data.synced} synced`);
        if (res.data.deleted > 0) parts.push(`${res.data.deleted} removed`);
        if (res.data.rag?.status) parts.push(`RAG: ${res.data.rag.status}`);
        else if (res.data.rag?.error) parts.push(`RAG: ${res.data.rag.error}`);
        notify(
          parts.length ? `Sync complete — ${parts.join(', ')}` : 'Sync complete — everything up to date',
          'success',
        );
      } else {
        notify(res.error || 'Sync failed', 'error');
      }
    } catch {
      notify('Sync failed — check server connection', 'error');
    } finally {
      state.knowledgeSyncing = false;
      await loadKnowledgeTree();
    }
  }

  async function loadRagStatus() {
    if (state.ragStatusLoading) return;
    state.ragStatusLoading = true;
    try {
      const res = await _rag.status();
      if (res.ok) state.ragStatus = res.data;
    } catch { /* ignore */ }
    finally { state.ragStatusLoading = false; }
  }

  async function loadRagCategories() {
    if (state.ragCategoriesLoading) return;
    state.ragCategoriesLoading = true;
    try {
      const res = await _rag.categories();
      if (res.ok) state.ragCategories = res.data;
    } catch { /* ignore */ }
    finally { state.ragCategoriesLoading = false; }
  }

  function setKnowledgeCategoryFilter(category: string) {
    if (category === state.knowledgeCategoryFilter) return;
    state.knowledgeCategoryFilter = category;
    loadKnowledgeTree(category);
  }

  function setSidebarView(view: 'sessions' | 'knowledge' | 'stories' | 'bugs') {
    if (state.sidebarView === view) return;
    state.sidebarView = view;
    if (view === 'knowledge') {
      if (state.knowledgeTree.length === 0) loadKnowledgeTree();
      if (!state.ragCategories) loadRagCategories();
    }
  }

  async function openKnowledgePreview(path: string) {
    state.knowledgePreviewPath = path;
    state.knowledgePreviewVisible = true;
    state.knowledgePreviewLoading = true;
    state.knowledgePreviewData = null;
    try {
      const res = await _knowledge.read(path);
      if (res.ok && res.data) state.knowledgePreviewData = res.data;
    } catch { /* ignore */ }
    finally { state.knowledgePreviewLoading = false; }
  }

  function closeKnowledgePreview() {
    state.knowledgePreviewVisible = false;
    state.knowledgePreviewData = null;
  }

  // ── Modal toggles ───────────────────────────────────────────────────

  function openBugReport() { state.bugReportVisible = true; }
  function closeBugReport() { state.bugReportVisible = false; }
  function toggleFaq() { state.faqVisible = !state.faqVisible; }
  function toggleSidebar() { state.sidebarCollapsed = !state.sidebarCollapsed; _persistSetting('sidebarCollapsed', state.sidebarCollapsed); }
  function setSearchInput(v: string) { state.searchInputValue = v; }
  function setSearchQuery(q: string) { state.searchQuery = q; }
  function toggleBatchMode() { state.batchMode = !state.batchMode; if (!state.batchMode) state.selectedSessionIds = []; }

  // ── Mount ───────────────────────────────────────────────────────────

  const STALE_THRESHOLD_MS = 60_000;
  const CHROME_THROTTLE_THRESHOLD = 4.5 * 60 * 1000;
  let _lastVisibleTime = Date.now();
  let _hiddenTimer: ReturnType<typeof setTimeout> | null = null;
  let _visibilityHandler: (() => void) | null = null;

  function _onTabHidden(): void {
    _lastVisibleTime = Date.now();
    _hiddenTimer = setTimeout(() => {
      if (state.isProcessing && document.hidden) {
        _abortController?.abort();
        _abortController = null;
      }
    }, CHROME_THROTTLE_THRESHOLD);
  }

  async function _onTabVisible(): Promise<void> {
    if (_hiddenTimer) { clearTimeout(_hiddenTimer); _hiddenTimer = null; }
    const hiddenDuration = Date.now() - _lastVisibleTime;
    if (hiddenDuration < STALE_THRESHOLD_MS) return;
    await _recoverFromBackground(hiddenDuration);
  }

  async function _recoverFromBackground(hiddenDuration: number): Promise<void> {
    if (state.isProcessing) {
      const lastMsg = state.messages[state.messages.length - 1];
      if (lastMsg?.type === 'pet' && lastMsg.streaming) {
        lastMsg.streaming = false;
        lastMsg.error = true;
        lastMsg.aborted = true;
        if (!lastMsg.content.includes('Response interrupted')) {
          lastMsg.content += '\n\n> ⚠️ Response interrupted — tab was hidden for ' +
            Math.round(hiddenDuration / 1000) + 's.';
        }
      }
      state.isProcessing = false;
      state.streamingType = '';
      state.streamingPhase = '';
      state.streamingTargetTimestamp = null;
      _abortController = null;
    }
    // Reload settings that may have changed in other tabs
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      try {
        const result = await chrome.storage.local.get([
          'knowledgeGrounded', 'ragScope', 'ragScopeIsFile',
          'chatColorIndex',
        ]);
        if (typeof result.knowledgeGrounded === 'boolean') state.knowledgeGrounded = result.knowledgeGrounded;
        if (typeof result.ragScope === 'string') state.ragScope = result.ragScope;
        if (typeof result.ragScopeIsFile === 'boolean') state.ragScopeIsFile = result.ragScopeIsFile;
        if (typeof result.chatColorIndex === 'number') state.colorIndex = result.chatColorIndex;
      } catch { /* storage unavailable */ }
    }
    await _loadSessions();
    state.scrollTick++;
  }

  function _onVisibilityChange(): void {
    if (document.hidden) {
      _onTabHidden();
    } else {
      _onTabVisible();
    }
  }

  async function mount() {
    state.pageInfo = readPageInfo();
    await _loadPersistedState();
    await _loadSessions();
    if (state.sessions.length > 0 && !state.currentSessionId) {
      await _findOrCreateSession();
    }
    _visibilityHandler = _onVisibilityChange;
    document.addEventListener('visibilitychange', _visibilityHandler);
  }

  // ── Stub methods (ported incrementally) ────────────────────────────────

  function knowledgeFileMatches(query: string, limit = 8) {
    const q = query.toLowerCase();
    const results: { path: string; name: string }[] = [];
    const walk = (nodes: KnowledgeTreeNode[]) => {
      for (const node of nodes) {
        if (results.length >= limit) return;
        if (node.type === 'file') {
          if (node.path.toLowerCase().includes(q) || (node.name || '').toLowerCase().includes(q)) {
            results.push({ path: node.path, name: node.name || node.path });
          }
        } else if (node.children) {
          walk(node.children);
        }
      }
    };
    walk(state.knowledgeTree);
    return results.slice(0, limit);
  }

  function recallPromptHistory(delta: number, currentIdx: number) {
    const hist = state.promptHistory;
    if (hist.length === 0) return null;
    const next = currentIdx + delta;
    if (next < 0) return { idx: 0, text: hist[0] };
    if (next >= hist.length) return { idx: -1, text: '' };
    return { idx: next, text: hist[next] };
  }

  function removePromptHistoryAt(idx: number) {
    if (idx >= 0 && idx < state.promptHistory.length) {
      state.promptHistory.splice(idx, 1);
      _persistSetting('promptHistory', state.promptHistory);
    }
  }

  function invokePromptHistory(idx: number) {
    if (idx >= 0 && idx < state.promptHistory.length) {
      state.inputTemplate = state.promptHistory[idx];
    }
  }

  function clearPromptHistory() {
    state.promptHistory = [];
    _persistSetting('promptHistory', []);
  }

  function addDraftImages(sources: string[]) {
    const remaining = 4 - state.draftImages.length;
    state.draftImages.push(...sources.slice(0, remaining));
  }

  function clearDraftImages() { state.draftImages = []; }
  function removeDraftImage(idx: number) { state.draftImages.splice(idx, 1); }
  function editMessage(idx: number, text: string) {
    if (idx < 0 || idx >= state.messages.length) return;
    state.messages[idx] = { ...state.messages[idx], content: text };
    _persistMessages();
    notify('Message updated');
  }
  function deleteMessage(idx: number) {
    if (idx < 0 || idx >= state.messages.length) return;
    state.messages.splice(idx, 1);
    const target = state.sessions.find((s) => s.id === state.currentSessionId);
    if (target) target.messageCount = state.messages.length;
    _persistMessages();
    notify('Message deleted');
  }
  function copyMessage(text: string, ts: number) {
    const key = String(ts);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        state.copyFeedback[key] = 'copied';
        setTimeout(() => { delete state.copyFeedback[key]; }, 1500);
      })
      .catch(() => {});
  }

  async function regenerateMessage(idx: number) {
    if (state.isProcessing) return;
    const msgs = state.messages;
    const i = Number(idx);
    if (!Number.isFinite(i) || i < 0 || i >= msgs.length) return;
    const pet = msgs[i];
    if (!pet || pet.type !== 'pet') return;

    let userIdx = -1;
    for (let j = i - 1; j >= 0; j--) {
      if (msgs[j] && msgs[j].type !== 'pet') {
        userIdx = j;
        break;
      }
    }
    if (userIdx < 0) return;
    const userMsg = msgs[userIdx];
    const text = String(userMsg.content ?? '').trim();
    const images = Array.isArray(userMsg.imageDataUrls) ? userMsg.imageDataUrls.filter(Boolean) : [];
    if (!text && images.length === 0) return;

    msgs[i] = { ...pet, content: '', error: false, aborted: false, streaming: true };
    state.viewState = 'messages';
    state.isProcessing = true;
    state.scrollTick++;

    await _runStream(userIdx, pet.timestamp, 'regenerate');
  }

  async function resendMessage(idx: number) {
    if (state.isProcessing) return;
    const msgs = state.messages;
    const i = Number(idx);
    if (!Number.isFinite(i) || i < 0 || i >= msgs.length) return;
    const userMsg = msgs[i];
    if (!userMsg || userMsg.type === 'pet') return;
    const text = String(userMsg.content ?? '').trim();
    const images = Array.isArray(userMsg.imageDataUrls) ? userMsg.imageDataUrls.filter(Boolean) : [];
    if (!text && images.length === 0) return;

    const now = Date.now();
    const petMsg: Message = { type: 'pet', content: '', timestamp: now + 1, streaming: true };
    msgs.push(petMsg);
    state.viewState = 'messages';
    state.isProcessing = true;
    state.scrollTick++;
    const newPetIdx = msgs.length - 1;

    await _runStream(i, petMsg.timestamp, 'resend');
  }

  async function retryLastMessage() {
    if (state.isProcessing) return;
    const msgs = state.messages;
    if (msgs.length === 0) return;
    let petIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i] && msgs[i].type === 'pet') {
        petIdx = i;
        break;
      }
    }
    if (petIdx < 0) return;
    const pet = msgs[petIdx];
    if (!pet || (!pet.error && !pet.aborted)) return;
    await regenerateMessage(petIdx);
  }

  function exportCurrentSessionMarkdown() {
    const msgs = state.messages;
    if (!msgs.length) { notify('Nothing to export'); return; }
    const ses = state.sessions.find((x) => x.id === state.currentSessionId);
    const title = ses?.title || 'Untitled';
    const now = new Date().toISOString();
    const lines: string[] = [
      `# ${title}`,
      `> Exported: ${now}`,
      `> Source: ${state.pageInfo?.url || 'unknown'}`,
      '',
      '---',
      '',
    ];
    for (const m of msgs) {
      const role = m.type === 'user' ? '🧑 User' : '🐾 Pet';
      const ts = new Date(m.timestamp).toISOString();
      lines.push(`## ${role} · ${ts}`);
      lines.push('');
      lines.push(m.content || '');
      if (m.error) lines.push('> ⚠️ _Generation failed_');
      if (m.aborted) lines.push('> ⚠️ _Stopped_');
      lines.push('');
      lines.push('---');
      lines.push('');
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_').slice(0, 50)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    notify(`Exported ${msgs.length} messages as markdown`);
  }

  function submitFeedback(ts: number, rating: 'like' | 'dislike') {
    if (state.feedback[ts] === rating) {
      delete state.feedback[ts];
    } else {
      state.feedback[ts] = rating;
    }
  }
  function openSaveToKnowledge(_ts: number) { state.saveToKnowledgeTimestamp = _ts; state.saveToKnowledgeVisible = true; }
  async function openMessageInYiVad(ts: number) {
    const idx = state.messages.findIndex((m) => m.timestamp === ts);
    if (idx < 0) return;
    const msg = state.messages[idx];
    const content = (msg.content || '').trim();
    if (!content) return;
    const title = `YiPet → ${content.slice(0, 60)}`;
    // Build seed messages: for pet responses, include the preceding user question
    const seedMessages: { type: string; content: string }[] = [];
    if (msg.type === 'pet') {
      // Find preceding user message
      for (let j = idx - 1; j >= 0; j--) {
        if (state.messages[j].type === 'user') {
          seedMessages.push({ type: 'user', content: state.messages[j].content || '' });
          break;
        }
      }
      seedMessages.push({ type: 'user', content: `Continue from this assistant response:\n\n${content}` });
    } else {
      seedMessages.push({ type: 'user', content });
    }
    try {
      const res = await _sessions.create({
        title,
        url: `yipet://bridge/${Date.now()}`,
        tags: ['source:YiPet', 'via:per-message-bridge'],
        pageContent: seedMessages.map((m) => `## ${m.type === 'user' ? 'User' : 'Pet'}\n\n${m.content}`).join('\n\n---\n\n'),
      });
      if (res.ok && res.data?.key) {
        // Also set the messages on the session
        await _sessions.update(res.data.key as string, { messages: seedMessages } as unknown as Record<string, unknown>);
        window.open(`http://localhost:8848/#/aiChat?session=${res.data.key}`, '_blank', 'noopener,noreferrer');
        notify('Opened in YiVad aiChat');
      }
    } catch { /* ignore */ }
  }
  function openFaqManager() { state.faqVisible = true; }
  function editSessionInfo() { state.sessionEditVisible = true; }
  function openTagManager() { state.tagManagerVisible = true; }
  /** Patch editable session meta (title / pageContent / tags) in one write. */
  async function updateSessionMeta(
    id: string,
    meta: { title?: string; pageContent?: string; tags?: string[] },
  ) {
    const cur = state.sessions.find((x) => x.id === id);
    if (!cur) return;
    try {
      await _sessions.update(id, meta as unknown as Record<string, unknown>);
      if (meta.title !== undefined) {
        cur.title = meta.title;
        if (state.currentSessionId === id) state.title = meta.title;
      }
      if (meta.pageContent !== undefined) cur.pageContent = meta.pageContent;
      if (meta.tags !== undefined) cur.tags = meta.tags;
    } catch { /* ignore */ }
  }

  async function readKnowledgeFile(path: string) {
    try {
      const res = await _knowledge.read(path);
      return res.ok && res.data ? res.data : null;
    } catch { return null; }
  }

  async function saveContextToKnowledge(path: string, content: string, metadata?: Record<string, unknown>) {
    try {
      const res = await _knowledge.write(path, content, metadata);
      return res.ok ? res.data : null;
    } catch { return null; }
  }

  function openWeChatSettings() { state.weChatSettingsVisible = true; }
  async function bulkDeleteSessions() {
    const ids = state.selectedSessionIds;
    if (!ids.length) return;
    for (const id of ids) {
      try { await _sessions.delete(id); } catch { /* continue */ }
    }
    if (ids.includes(state.currentSessionId || '')) {
      state.currentSessionId = null;
      state.messages = [];
      state.viewState = 'empty';
    }
    await _loadSessions();
    state.selectedSessionIds = [];
    state.batchMode = false;
    notify(`Deleted ${ids.length} session(s)`);
  }
  function openKnowledgeStory(story: { name: string; project: string }) {
    state.knowledgePreviewPath = `${story.project}/${story.name}`;
    state.knowledgePreviewLoading = true;
    _knowledge.readStory(story.project, story.name).then((res) => {
      state.knowledgePreviewData = res.ok && res.data ? res.data : null;
      state.knowledgePreviewLoading = false;
      if (res.ok) state.knowledgePreviewVisible = true;
    }).catch(() => { state.knowledgePreviewLoading = false; });
  }
  function openBugInYiVad(key: string) {
    window.open(`http://localhost:8848/#/code-review/bugs/detail/${encodeURIComponent(key)}?mode=view`, '_blank', 'noopener,noreferrer');
  }
  async function previewRagSources(question: string) {
    const q = question.trim();
    if (!q) return;
    state.ragPreviewLoading = true;
    state.ragPreviewQuestion = q;
    state.ragPreviewSources = [];
    try {
      if (state.ragScopeIsFile && state.ragScope) {
        const res = await _rag.fileQuery({ target_file: state.ragScope, question: q });
        if (res.ok && res.data) {
          state.ragPreviewSources = res.data.sources || [];
        }
      } else {
        const res = await _rag.query({
          question: q,
          scope: state.ragScope || undefined,
          category: state.knowledgeCategoryFilter || undefined,
        });
        if (res.ok && res.data) {
          state.ragPreviewSources = res.data.sources || [];
        }
      }
      state.ragPreviewVisible = true;
    } catch { /* ignore */ }
    finally { state.ragPreviewLoading = false; }
  }
  async function decomposeRagQuestion(question: string) {
    const q = question.trim();
    if (!q) return;
    state.ragDecomposeLoading = true;
    state.ragDecomposeQuestion = q;
    state.ragDecomposeData = null;
    try {
      const res = await _rag.decompose({
        question: q,
        scope: state.ragScope || undefined,
        category: state.knowledgeCategoryFilter || undefined,
      });
      if (res.ok && res.data) {
        state.ragDecomposeData = res.data;
        state.ragDecomposeVisible = true;
      }
    } catch { /* ignore */ }
    finally { state.ragDecomposeLoading = false; }
  }

  async function createSessionFromKnowledgeFile(path: string) {
    try {
      const fileData = await _knowledge.read(path);
      if (!fileData.ok || !fileData.data) return;
      const content = fileData.data.content || '';
      const syntheticUrl = `yipet://knowledge/${path}`;
      const existing = state.sessions.find((s) => s.url === syntheticUrl);
      if (existing) {
        existing.pageContent = content;
        await selectSession(existing.id);
        return;
      }
      const name = path.split('/').pop() || path;
      const res = await _sessions.create({
        title: name,
        url: syntheticUrl,
        tags: ['source:YiKnowledge', `from:${path}`],
        pageContent: content,
      });
      if (res.ok && res.data?.key) {
        await _loadSessions();
        const id = res.data.key as string;
        state.currentSessionId = id;
        state.title = name;
        state.messages = [];
        state.viewState = 'empty';
        setRagScopeFromNode(path, true);
        if (!state.knowledgeGrounded) toggleKnowledgeGrounded();
      }
    } catch { /* ignore */ }
  }
    function applyPageContextChip() {
    const chip = pageContextChipValue();
    if (!chip) return;
    state.inputTemplate = chip.prompt;
    if (chip.bugKey) {
      state.ragScope = `lessons/failures/bugs/${chip.bugKey}.md`;
      state.ragScopeIsFile = true;
      if (!state.knowledgeGrounded) state.knowledgeGrounded = true;
    }
  }
  function pageContextChipValue(): { label: string; prompt: string; bugKey?: string } | null {
    const info = state.pageInfo;
    if (!info?.url) return null;
    const pt = detectPageTypeFromUrl(info.url);
    switch (pt.kind) {
      case 'yivad-bug-detail': {
        const key = pt.key || 'unknown';
        return {
          label: `Discuss bug ${key.slice(0, 20)}${key.length > 20 ? '...' : ''}`,
          prompt: `Help me understand this bug: what is the root cause, what is the impact, and what is the recommended fix plan?`,
          bugKey: key,
        };
      }
      case 'yivad-story-detail': {
        const key = pt.key || 'unknown';
        return {
          label: `Walk me through ${key.slice(0, 20)}${key.length > 20 ? '...' : ''}`,
          prompt: `Walk me through this story: what is the goal, what are the key deliverables, and what is the timeline?`,
        };
      }
      default:
        return null;
    }
  }

  // ── Auto-sync RAG scope when session context files change ──
  watch(
    () => {
      const cur = state.sessions.find((s) => s.id === state.currentSessionId);
      return cur?.tags?.filter((t) => typeof t === 'string' && t.startsWith(CTX_PREFIX)).sort().join('|') || '';
    },
    () => {
      if (!state.knowledgeGrounded) return;
      const ctxFiles = getSessionContextFiles();
      const derived = deriveScopeFromContextFiles(ctxFiles);
      if (derived) {
        state.ragScope = derived.scope;
        state.ragScopeIsFile = derived.isFile;
      } else if (!ctxFiles.length && state.ragScope) {
        // Context files were all removed — keep existing scope (user may have set it manually)
      }
    },
  );

  return {
    state,
    // Service injection
    injectServices, setNotifyHandler,
    // Window
    open, close, toggle, startDrag, onDragMove, endDrag,
    startResize, onResizeMove, endResize, toggleFullscreen,
    startSidebarResize, onSidebarResizeMove, endSidebarResize,
    // Sessions
    _loadSessions, selectSession, createSession, deleteSession,
    toggleFavorite, renameSession, startContextEditing, stopContextEditing,
    // Messages
    sendMessage, stopSending, scrollToBottom,
    pushPromptHistory,
    // Color/Role
    setColorIndex, setRole, setSystemPrompt,
    // Knowledge/RAG
    toggleKnowledgeGrounded, setRagScopeFromNode, clearRagScope,
    loadKnowledgeTree, syncKnowledge, loadRagStatus, loadRagCategories,
    setKnowledgeCategoryFilter, setSidebarView,
    openKnowledgePreview, closeKnowledgePreview,
    // Modals
    openBugReport, closeBugReport, toggleFaq, toggleSidebar,
    setSearchInput, setSearchQuery, toggleBatchMode,
    // Mount
    mount,
    // Stubs (ported incrementally)
    knowledgeFileMatches, recallPromptHistory, removePromptHistoryAt, invokePromptHistory, clearPromptHistory,
    addDraftImages, clearDraftImages, removeDraftImage,
    editMessage, deleteMessage, copyMessage,
    regenerateMessage, resendMessage, retryLastMessage, submitFeedback, exportCurrentSessionMarkdown,
    openSaveToKnowledge, openMessageInYiVad,
    openFaqManager, editSessionInfo, openTagManager, openWeChatSettings,
    updateSessionMeta, readKnowledgeFile, saveContextToKnowledge,
    bulkDeleteSessions,
    openKnowledgeStory, openBugInYiVad,
    previewRagSources, decomposeRagQuestion,
    applyPageContextChip, createSessionFromKnowledgeFile, pageContextChip: pageContextChipValue,
  };
});
