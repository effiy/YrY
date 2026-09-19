<script setup lang="ts">
/**
 * YiPet Chat — ChatInput (Vue 3 SFC)
 * Mirrors YiVad aiChat's ChatInput: send/stop buttons, rounded container,
 * keyboard shortcuts, phase-aware placeholder.
 */
import { computed, onMounted, onBeforeUnmount, onUnmounted, ref, watch, nextTick } from 'vue';
import { CircleClose, Promotion } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { t } from '@/shared/i18n';
import { useChatStore } from '../stores/chat';
import { keyboardRegistry, displayKeys } from '@/shared/shortcuts';
import ChatToolbar from './ChatToolbar/ChatToolbar.vue';
import DraftImageList from './DraftImageList.vue';
import FileMentionDropdown from './FileMentionDropdown.vue';

const MAX_DRAFT_IMAGES = 4;
const URL_RE = /^https?:\/\/[^\s"'<>]+$/i;

const store = useChatStore();
const s = store.state;

function _safeCompute<T>(fn: () => T, fallback: T) {
  return computed(() => { try { return fn(); } catch { return fallback; } });
}

const disabled = _safeCompute(() => !!s.isProcessing, false);
const draftImages = computed(() => s.draftImages || []);

// ── Streaming status bar (mirrors YiVad aiChat) ──
const streamStartTime = ref(0);
const elapsedMs = ref(0);
let elapsedTimer: ReturnType<typeof setInterval> | null = null;

watch(
  () => s.isProcessing,
  v => {
    if (v) {
      streamStartTime.value = Date.now();
      elapsedMs.value = 0;
      elapsedTimer = setInterval(() => {
        elapsedMs.value = Date.now() - streamStartTime.value;
      }, 100);
    } else {
      if (elapsedTimer) { clearInterval(elapsedTimer); elapsedTimer = null; }
    }
  }
);
onUnmounted(() => { if (elapsedTimer) clearInterval(elapsedTimer); });

const streamingElapsed = _safeCompute(() => {
  if (!s.isProcessing) return '';
  const ms = elapsedMs.value;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}, '');

const streamingChars = _safeCompute(() => {
  if (!s.isProcessing) return '';
  const len = s.messages[s.messages.length - 1]?.content?.length ?? 0;
  if (!len) return '';
  if (len < 1000) return `${len}c`;
  return `${(len / 1000).toFixed(1)}kc`;
}, '');

const streamingSpeed = _safeCompute(() => {
  if (!s.isProcessing) return '';
  const ms = elapsedMs.value;
  if (ms < 500) return '';
  const len = s.messages[s.messages.length - 1]?.content?.length ?? 0;
  if (!len) return '';
  const cps = Math.round(len / (ms / 1000));
  if (cps < 1000) return `${cps} c/s`;
  return `${(cps / 1000).toFixed(1)}k c/s`;
}, '');

const streamingPhaseLabel = _safeCompute(() => {
  if (!s.isProcessing) return '';
  if (s.streamingPhase === 'preparing') return 'Preparing';
  if (s.streamingPhase === 'retrieving') return 'Retrieving';
  if (s.streamingPhase === 'thinking') return 'Thinking';
  if (s.streamingPhase === 'streaming') return 'Generating';
  return 'Processing';
}, '');

const searchPrefetchStatus = computed(() => {
  if (!s.webSearchEnabled) return null;
  const timing = s.searchTimingMs;
  const results = s.webSearchResults?.length ?? 0;
  const images = s.webSearchImages?.length ?? 0;
  const lastQuery = s.lastSearchQuery || '';
  if (s.isProcessing && s.streamingPhase === 'retrieving' && results === 0) {
    return { tone: 'pending', text: 'Searching web…' };
  }
  if (!lastQuery) return null;
  const timingText = timing && timing > 0 ? (timing < 1000 ? `${timing}ms` : `${(timing/1000).toFixed(1)}s`) : '';
  if (results || images) {
    const parts: string[] = [];
    if (results) parts.push(`${results} results`);
    if (images) parts.push(`${images} images`);
    return { tone: 'ok', text: `Prefetch · ${parts.join(', ')}${timingText ? ' · ' + timingText : ''}` };
  }
  if (timing) return { tone: 'idle', text: `Prefetch · ${timingText} · no hits` };
  return { tone: 'idle', text: 'Prefetch · waiting' };
});

const ragIndexHealth = computed(() => {
  if (!s.knowledgeGrounded) return null;
  if (s.ragStatusLoading) return { tone: 'pending', text: 'RAG index loading…' };
  const docs = s.ragStatus?.num_docs ?? 0;
  if (s.ragStatus?.built === true) {
    return { tone: 'ok', text: `RAG index · ${docs} docs` };
  }
  return { tone: 'warn', text: 'RAG index not built — click status dot to reload' };
});

// ── Phase-aware placeholder (mirrors YiVad aiChat) ──
const placeholder = _safeCompute(() => {
  try {
    if ((inputValue.value || '').startsWith('/')) return '/compact /clear /retry /stop /new /export — type a command';
    if (s.streamingPhase === 'fetching') return 'Fetching context...';
    if (s.streamingPhase === 'preparing') return 'Preparing...';
    if (s.streamingPhase === 'retrieving') return s.knowledgeGrounded ? 'RAG · Searching knowledge base...' : 'Retrieving knowledge...';
    if (s.streamingPhase === 'thinking') return s.knowledgeGrounded && s.ragScope ? 'RAG · Thinking...' : 'AI is thinking...';
    if (s.streamingPhase === 'streaming') return s.knowledgeGrounded && s.ragScope ? 'RAG · Generating response...' : 'AI is responding...';
    if (s.webSearchEnabled && s.isProcessing) return 'Searching the web...';
    const tags = (s.sessions as any)?.find?.((x:any) => x && x.id === s.currentSessionId)?.tags ?? [];
    const ctxCount = Array.isArray(tags) ? tags.filter((t:any) => typeof t === 'string' && t.startsWith('ctx:')).length : 0;
    if (s.knowledgeGrounded && s.webSearchEnabled) {
      return ctxCount ? `RAG + Web · ${ctxCount} file(s) — Ask anything...` : 'RAG + Web · Ask anything...';
    }
    if (s.webSearchEnabled) return 'Web search on — Ask anything...';
    if (s.knowledgeGrounded && s.ragScope) {
      return `RAG mode · ${ctxCount} file(s) in context — Ask anything...`;
    }
    return 'Ask anything... (Enter to send, Shift+Enter for newline)';
  } catch { return 'Ask anything... (Enter to send, Shift+Enter for newline)'; }
}, 'Ask anything... (Enter to send, Shift+Enter for newline)');

const inputValue = ref('');
const isComposing = ref(false);
const compositionEndTime = ref(0);
const lastTemplateRef = ref('');
const historyIdxRef = ref(-1);
const preHistoryInputRef = ref('');
const preHistoryCaretRef = ref(-1);
const preserveComposerOnNextOpen = ref(false);
const textareaEl = ref<HTMLTextAreaElement | null>(null);
const pasteLastWasMixed = ref(false);

function getTa(): HTMLTextAreaElement | null {
  if (textareaEl.value) return textareaEl.value;
  return document.querySelector<HTMLTextAreaElement>('#yipet-chat-window .el-textarea__inner');
}
function getCaret(): { start: number; end: number } {
  const ta = getTa();
  if (!ta) return { start: 0, end: 0 };
  try { return { start: ta.selectionStart ?? 0, end: ta.selectionEnd ?? 0 }; } catch { return { start: 0, end: 0 }; }
}
function setCaret(pos: number) {
  nextTick(() => {
    const ta = getTa();
    if (!ta) return;
    try { ta.focus(); ta.setSelectionRange(pos, pos); } catch { /* ignore */ }
  });
}
function setInputValueRestoreCaret(text: string, caretHint: 'start' | 'end' | number = 'end') {
  inputValue.value = text;
  nextTick(() => {
    const ta = getTa();
    if (!ta) return;
    try {
      const len = ta.value.length;
      let target: number;
      if (caretHint === 'start') target = 0;
      else if (caretHint === 'end') target = len;
      else target = Math.max(0, Math.min(len, caretHint as number));
      ta.setSelectionRange(target, target);
    } catch { /* ignore */ }
  });
}

// ── Can send: user has text, images, and is not currently sending ──
const canSend = _safeCompute(() => {
  if (s.isProcessing) return false;
  return (inputValue.value || '').trim().length > 0 || (draftImages.value?.length ?? 0) > 0;
}, false);

const charCount = _safeCompute(() => (inputValue.value || '').length, 0);
const tokenEstimate = _safeCompute(() => Math.ceil(charCount.value / 4), 0);
const composerTone = _safeCompute(() => {
  if (s.isProcessing) return 'is-processing';
  if (charCount.value > 0 || draftImages.value.length > 0) return 'is-engaged';
  return 'is-idle';
}, 'is-idle');

// @-mention detection
const mentionQuery = ref('');
const mentionVisible = ref(false);
const mentionAtIdx = ref(-1);

function updateMention() {
  const text = inputValue.value;
  const lastAt = text.lastIndexOf('@');
  if (lastAt < 0) {
    mentionVisible.value = false;
    mentionQuery.value = '';
    mentionAtIdx.value = -1;
    return;
  }
  if (lastAt > 0 && !/\s/.test(text[lastAt - 1])) {
    mentionVisible.value = false;
    mentionQuery.value = '';
    mentionAtIdx.value = -1;
    return;
  }
  const after = text.slice(lastAt + 1);
  if (after.includes(' ')) {
    mentionVisible.value = false;
    mentionQuery.value = '';
    mentionAtIdx.value = -1;
    return;
  }
  mentionVisible.value = true;
  mentionQuery.value = after;
  mentionAtIdx.value = lastAt;
}

watch(inputValue, updateMention);

const SLASH_COMMANDS: Array<{ name: string; short: string; hint: string; icon: string; kind: 'action' | 'session' | 'debug' }> = [
  { name: '/new',      short: 'New chat',        hint: 'Create a fresh session',   icon: '＋', kind: 'session' },
  { name: '/clear',    short: 'Clear chat',      hint: 'Empty current session',   icon: '🗑', kind: 'action'  },
  { name: '/retry',    short: 'Retry last',      hint: 'Re-run last assistant turn', icon: '↺', kind: 'action' },
  { name: '/compact',  short: 'Compact context', hint: 'Summarize long conversation', icon: '✂', kind: 'action'  },
  { name: '/stop',     short: 'Stop stream',     hint: 'Abort current generation', icon: '⏹', kind: 'action'  },
  { name: '/export',   short: 'Export MD',       hint: 'Save session as Markdown', icon: '↓', kind: 'session' },
  { name: '/help',     short: 'Commands list',   hint: 'Show all / commands',      icon: '?', kind: 'debug'   },
];
const slashVisible = ref(false);
const slashQuery = ref('');
const slashAtIdx = ref(-1);
const slashActive = ref(0);

watch(inputValue, v => {
  const firstLineStart = v.match(/^\s*/)?.[0].length ?? 0;
  if (v.startsWith('/', firstLineStart) && !v.slice(firstLineStart).includes(' ')) {
    slashAtIdx.value = firstLineStart;
    slashQuery.value = v.slice(firstLineStart);
    slashActive.value = 0;
    mentionVisible.value = false;
    slashVisible.value = slashMatches.value.length > 0;
  } else {
    slashVisible.value = false;
    slashQuery.value = '';
    slashAtIdx.value = -1;
  }
});

const slashMatches = _safeCompute(() => {
  try {
    const q = (slashQuery.value || '').toLowerCase().replace(/^\//, '');
    if (!q) return SLASH_COMMANDS.slice();
    return SLASH_COMMANDS.filter(c => {
      const n = c.name.slice(1).toLowerCase();
      const sh = c.short.toLowerCase();
      return n.startsWith(q) || sh.includes(q) || c.hint.toLowerCase().includes(q);
    });
  } catch { return SLASH_COMMANDS.slice(); }
}, SLASH_COMMANDS.slice());

function applySlash(name: string) {
  const prefix = inputValue.value.slice(0, slashAtIdx.value);
  const remain = inputValue.value.slice(slashAtIdx.value + slashQuery.value.length);
  inputValue.value = (prefix + name + remain);
  slashVisible.value = false;
  slashQuery.value = '';
  slashAtIdx.value = -1;
  nextTick(() => {
    if (['/clear','/new','/retry','/compact','/export','/stop'].includes(name)) send();
    else {
      const ta = document.querySelector('#yipet-chat-window .el-textarea__inner') as HTMLTextAreaElement | null;
      ta?.focus();
    }
  });
}

let preFetchTimer: ReturnType<typeof setTimeout> | undefined;
watch(
  inputValue,
  (val) => {
    clearTimeout(preFetchTimer);
    if (!s.webSearchEnabled || s.isProcessing) {
      if (!s.webSearchEnabled) s.webSearchResults = [];
      return;
    }
    const q = val.trim();
    if (!q || q.length < 4) return;
    preFetchTimer = setTimeout(async () => {
      try {
        try {
          const tool = store.getTool?.('web_search');
          if (tool && tool.enabled !== false) {
            const result = await store.executeTool?.('web_search', { query: q, maxResults: 8 });
            const details: any = result?.details;
            if (details) {
              if (Array.isArray(details.items)) s.webSearchResults = details.items;
              if (Array.isArray(details.images)) s.webSearchImages = details.images;
              if (typeof details.query === 'string') s.lastSearchQuery = details.query;
              if (typeof details.timingMs === 'number') s.searchTimingMs = details.timingMs;
            }
          }
        } catch { /* best-effort — no web search service */ }
      } catch { /* ignore best-effort */ }
    }, 600);
  }
);
onBeforeUnmount(() => { clearTimeout(preFetchTimer); });

// Sync template from QuickButtons
watch(() => s.inputTemplate, (val) => {
  if (val && val !== lastTemplateRef.value) {
    preserveComposerOnNextOpen.value = true;
    lastTemplateRef.value = val;
    inputValue.value = val;
    s.inputTemplate = '';
  }
});

function clearComposer() {
  inputValue.value = '';
  lastTemplateRef.value = '';
  historyIdxRef.value = -1;
  preHistoryInputRef.value = '';
  store.clearDraftImages?.();
}

function handleProgrammaticInput(detail?: { text?: string; mode?: 'replace' | 'append' }) {
  const text = detail?.text || '';
  if (!text) return;
  preserveComposerOnNextOpen.value = true;
  if (detail?.mode === 'append') inputValue.value += text;
  else inputValue.value = text;
  lastTemplateRef.value = inputValue.value;
  nextTick(() => focusTa());
}

function slashKeyHandler(e: KeyboardEvent) {
  if (e.key !== '/') return;
  const target = e.target as HTMLElement | null;
  const tag = target?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable === true) return;
  e.preventDefault();
  const textarea = document.querySelector('#yipet-chat-window .el-textarea__inner') as HTMLTextAreaElement | null;
  textarea?.focus();
}

function onExternalSetInput(e: Event) {
  handleProgrammaticInput((e as CustomEvent<{ text?: string; mode?: 'replace' | 'append' }>).detail);
}

onMounted(() => {
  window.addEventListener('keydown', slashKeyHandler);
  window.addEventListener('yipet:set-input', onExternalSetInput as EventListener);
  nextTick(() => focusTa());
});

// ── Auto-focus input when chat becomes visible or session changes (mirrors YiVad aiChat) ──
watch(
  () => s.visible,
  v => {
    if (!v) return;
    if (preserveComposerOnNextOpen.value) {
      preserveComposerOnNextOpen.value = false;
    } else {
      clearComposer();
    }
    nextTick(() => focusTa());
  }
);

watch(
  () => s.currentSessionId,
  () => {
    if (preserveComposerOnNextOpen.value) {
      preserveComposerOnNextOpen.value = false;
    } else {
      clearComposer();
    }
    nextTick(() => focusTa());
  },
);
function focusTa() {
  const ta = document.querySelector('#yipet-chat-window .el-textarea__inner') as HTMLTextAreaElement | null;
  ta?.focus();
}

onBeforeUnmount(() => {
  window.removeEventListener('keydown', slashKeyHandler);
  window.removeEventListener('yipet:set-input', onExternalSetInput as EventListener);
});

function send() {
  const text = inputValue.value.trim();
  const imgs = draftImages.value.length > 0 ? draftImages.value : undefined;
  if (!text && !imgs) return;
  if (s.isProcessing) return;
  if (text) store.pushPromptHistory?.(text);
  historyIdxRef.value = -1;
  store.sendMessage(text, imgs);
  clearComposer();
  // Auto-focus after send
  nextTick(() => {
    const ta = document.querySelector('#yipet-chat-window .el-textarea__inner') as HTMLTextAreaElement | null;
    ta?.focus();
  });
}

async function onMentionSelect(path: string) {
  if (mentionAtIdx.value < 0) return;
  const before = inputValue.value.slice(0, mentionAtIdx.value);
  const after = inputValue.value.slice(mentionAtIdx.value + 1 + mentionQuery.value.length);
  inputValue.value = (before + after).trim();
  mentionVisible.value = false;
  mentionQuery.value = '';
  mentionAtIdx.value = -1;
  try {
    const fileData = await store.readKnowledgeFile?.(path);
    const content = typeof fileData === 'string'
      ? fileData
      : (fileData as any)?.content || '';
    if (content) {
      await store.applyContextChange?.(path, content);
    } else {
      await store.addContextFile?.(path);
    }
  } catch {
    await store.addContextFile?.(path);
  }
  store.setRagScopeFromNode?.(path, true);
  if (!s.knowledgeGrounded) store.toggleKnowledgeGrounded?.();
}

function onMentionClose() {
  if (mentionAtIdx.value >= 0) {
    const before = inputValue.value.slice(0, mentionAtIdx.value);
    const after = inputValue.value.slice(mentionAtIdx.value + 1 + mentionQuery.value.length);
    inputValue.value = (before + after).trim();
  }
}

function onKeyDown(e: KeyboardEvent) {
  // Mention dropdown handling
  if (mentionVisible.value) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onMentionClose();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      const matches = store.knowledgeFileMatches?.(mentionQuery.value, 1);
      if (matches && matches.length > 0) {
        e.preventDefault();
        onMentionSelect(matches[0].path);
        return;
      }
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      return;
    }
  }

  if (slashVisible.value && slashMatches.value.length) {
    const n = slashMatches.value.length;
    if (e.key === 'Escape') { e.preventDefault(); slashVisible.value = false; return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); slashActive.value = (slashActive.value + 1) % n; return; }
    if (e.key === 'ArrowUp')   { e.preventDefault(); slashActive.value = (slashActive.value - 1 + n) % n; return; }
    if (e.key === 'Enter' && !e.shiftKey && !((e as KeyboardEvent).isComposing || isComposing.value)) {
      e.preventDefault(); applySlash(slashMatches.value[slashActive.value].name); return;
    }
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault(); applySlash(slashMatches.value[slashActive.value].name); return;
    }
  }

  // ── Keyboard shortcuts (mirrors YiVad aiChat) ──
  const mod = e.metaKey || e.ctrlKey;

  // Ctrl+K / Cmd+K: clear conversation
  if (mod && e.key === 'k' && !s.isProcessing) {
    e.preventDefault();
    store.sendMessage('/clear');
    inputValue.value = '';
    return;
  }

  // Ctrl+Shift+S / Cmd+Shift+S: toggle web search
  if (mod && e.shiftKey && e.key === 'S' && !s.isProcessing) {
    e.preventDefault();
    s.webSearchEnabled = !s.webSearchEnabled;
    ElMessage({
      message: s.webSearchEnabled ? 'Web search on' : 'Web search off',
      type: s.webSearchEnabled ? 'success' : 'info',
      duration: 1500,
      showClose: false,
    });
    return;
  }

  // Ctrl+Shift+R / Cmd+Shift+R: toggle RAG
  if (mod && e.shiftKey && e.key === 'R' && !s.isProcessing) {
    e.preventDefault();
    s.knowledgeGrounded = !s.knowledgeGrounded;
    ElMessage({
      message: s.knowledgeGrounded ? 'RAG on' : 'RAG off',
      type: s.knowledgeGrounded ? 'success' : 'info',
      duration: 1500,
      showClose: false,
    });
    return;
  }

  // Ctrl+L / Cmd+L: clear input
  if (mod && e.key === 'l' && !s.isProcessing) {
    e.preventDefault();
    inputValue.value = '';
    lastTemplateRef.value = '';
    store.clearDraftImages?.();
    return;
  }

  // Escape
  if (e.key === 'Escape') {
    e.preventDefault();
    if (s.isProcessing) { store.stopSending(); return; }
    if (inputValue.value.trim()) {
      inputValue.value = '';
      historyIdxRef.value = -1;
      return;
    }
    return;
  }

  // Enter: send
  if (e.key === 'Enter') {
    if ((e as KeyboardEvent).isComposing || isComposing.value) return;
    if (compositionEndTime.value > 0 && Date.now() - compositionEndTime.value < 100) return;
    if (e.shiftKey) return;
    e.preventDefault();
    if (s.isProcessing) return;
    send();
    return;
  }

  // Prompt history navigation (caret-aware — mirrors YiVad aiChat behavior)
  if (!e.metaKey && !e.ctrlKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
    const caret = getCaret();
    const len = (inputValue.value || '').length;
    const empty = len === 0;
    const navigating = historyIdxRef.value !== -1;
    if (e.key === 'ArrowUp' && (empty || caret.start === 0)) {
      if (!navigating) {
        preHistoryInputRef.value = inputValue.value;
        preHistoryCaretRef.value = caret.end;
      }
      const rec = store.recallPromptHistory?.(-1, historyIdxRef.value);
      if (rec) {
        e.preventDefault();
        historyIdxRef.value = rec.idx;
        setInputValueRestoreCaret(rec.text, 'end');
      }
      return;
    }
    if (e.key === 'ArrowDown' && (navigating || caret.end === len)) {
      if (!navigating) return; // ArrowDown without active navigation: let it move caret normally
      const rec = store.recallPromptHistory?.(1, historyIdxRef.value);
      e.preventDefault();
      if (rec && rec.idx === -1) {
        const prev = preHistoryInputRef.value;
        const restoreCaret = preHistoryCaretRef.value;
        historyIdxRef.value = -1;
        preHistoryInputRef.value = '';
        preHistoryCaretRef.value = -1;
        setInputValueRestoreCaret(prev, restoreCaret === -1 ? 'end' : restoreCaret);
      } else if (rec) {
        historyIdxRef.value = rec.idx;
        setInputValueRestoreCaret(rec.text, 'end');
      }
      return;
    }
  }
}

function insertAtCaret(insert: string) {
  const ta = getTa();
  if (!ta) { inputValue.value += insert; return; }
  const start = ta.selectionStart ?? inputValue.value.length;
  const end = ta.selectionEnd ?? start;
  const before = inputValue.value.slice(0, start);
  const after = inputValue.value.slice(end);
  const next = before + insert + after;
  inputValue.value = next;
  setCaret(start + insert.length);
}
function onPaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items;
  if (!items) return;
  const imageItems: DataTransferItem[] = [];
  const htmlText = e.clipboardData?.getData('text/html') || '';
  const plainText = e.clipboardData?.getData('text/plain');
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.startsWith('image/')) imageItems.push(items[i]);
  }
  // Pure URL → attach as context file, insert trailing space so user can type after
  if (plainText && URL_RE.test(plainText.trim()) && !htmlText && imageItems.length === 0) {
    const url = plainText.trim();
    e.preventDefault();
    store.addContextFile?.(url)
      .then(() => {
        insertAtCaret(' ');
        ElMessage({ message: `URL attached: ${url.length > 40 ? url.slice(0,40)+'…' : url}`, type: 'success', duration: 1600, showClose: false });
      })
      .catch(() => { insertAtCaret(plainText); });
    return;
  }
  // Mixed rich text + URL or just text — let the browser insert normally, but bridge URLs out
  if (plainText && URL_RE.test(plainText.trim()) && imageItems.length === 0) {
    // Single URL with html wrapper (e.g. a link copied from page)
    const url = plainText.trim();
    e.preventDefault();
    store.addContextFile?.(url)
      .then(() => {
        insertAtCaret(' ');
        pasteLastWasMixed.value = true;
        ElMessage({ message: `URL attached: ${url.length > 40 ? url.slice(0,40)+'…' : url}`, type: 'success', duration: 1600, showClose: false });
      })
      .catch(() => { insertAtCaret(plainText); });
    return;
  }
  // Mixed text + images → attach images, insert text at caret (bridge paste composition)
  if (imageItems.length > 0) {
    e.preventDefault();
    if (plainText) {
      insertAtCaret(plainText);
      pasteLastWasMixed.value = true;
    }
    const remaining = MAX_DRAFT_IMAGES - draftImages.value.length;
    const toRead = imageItems.slice(0, remaining);
    if (!toRead.length) return;
    let loaded = 0;
    const sources: string[] = new Array(toRead.length);
    toRead.forEach((item, i) => {
      const file = item.getAsFile();
      if (!file) {
        loaded++;
        if (loaded === toRead.length) store.addDraftImages?.(sources.filter(Boolean));
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        if (src) sources[i] = src;
        loaded++;
        if (loaded === toRead.length) store.addDraftImages?.(sources.filter(Boolean));
      };
      reader.onerror = () => {
        loaded++;
        if (loaded === toRead.length) store.addDraftImages?.(sources.filter(Boolean));
      };
      reader.readAsDataURL(file);
    });
    return;
  }
  // Plain text paste — nothing to do, let browser handle it
}

// ── Drag-and-drop images ──
const isDragOver = ref(false);
let dragCounter = 0;

function onDragEnter(e: DragEvent) {
  e.preventDefault();
  dragCounter++;
  if (e.dataTransfer?.types.includes('Files')) isDragOver.value = true;
}

function onDragLeave(e: DragEvent) {
  e.preventDefault();
  dragCounter--;
  if (dragCounter <= 0) { dragCounter = 0; isDragOver.value = false; }
}

function onDragOver(e: DragEvent) {
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  dragCounter = 0;
  isDragOver.value = false;
  const files = e.dataTransfer?.files;
  if (!files?.length) return;
  const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
  if (!imageFiles.length) return;
  const remaining = MAX_DRAFT_IMAGES - draftImages.value.length;
  const toRead = imageFiles.slice(0, remaining);
  let loaded = 0;
  const sources: string[] = new Array(toRead.length);
  toRead.forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = (ev) => { sources[i] = ev.target?.result as string; loaded++; if (loaded === toRead.length) store.addDraftImages?.(sources.filter(Boolean)); };
    reader.onerror = () => { loaded++; if (loaded === toRead.length) store.addDraftImages?.(sources.filter(Boolean)); };
    reader.readAsDataURL(file);
  });
}

// ── Image picker (mirrors YiVad aiChat) ──
function onImageChange(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input) return;
  const files = Array.from(input.files || []);
  const imageFiles = files.filter((f) => f.type.startsWith('image/'));
  input.value = '';
  if (!imageFiles.length) return;
  const remaining = MAX_DRAFT_IMAGES - draftImages.value.length;
  const toRead = imageFiles.slice(0, remaining);
  let loaded = 0;
  const sources: string[] = new Array(toRead.length);
  toRead.forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      sources[i] = ev.target?.result as string;
      loaded++;
      if (loaded === toRead.length) store.addDraftImages?.(sources.filter(Boolean));
    };
    reader.onerror = () => {
      loaded++;
      if (loaded === toRead.length) store.addDraftImages?.(sources.filter(Boolean));
    };
    reader.readAsDataURL(file);
  });
}

if (typeof window !== 'undefined') {
  try {
    (window as any).__yipet_ci_ok = true;
  } catch {
    // Best-effort runtime marker for manual debugging.
  }
}
</script>

<template>
  <div
    class="ci-input"
    :class="composerTone"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <!-- Drop overlay -->
    <div v-if="isDragOver" class="ci-drop-overlay">
      <span>Drop images here</span>
    </div>
    <ChatToolbar
      :has-content="!!inputValue.trim() || draftImages.length > 0"
      @clear-input="inputValue = ''; lastTemplateRef = ''; store.clearDraftImages?.()"
    />

    <!-- Streaming / prefetch status bar (mirrors YiVad aiChat) -->
    <transition name="ci-status-fade">
      <div
        v-if="s.isProcessing || searchPrefetchStatus || ragIndexHealth"
        class="ci-status"
      >
        <span v-if="s.isProcessing" class="ci-status-dot" />
        <template v-if="s.isProcessing">
          <span class="ci-status-phase">{{ streamingPhaseLabel }}</span>
          <span class="ci-status-time">{{ streamingElapsed }}</span>
          <span v-if="streamingChars" class="ci-status-chars">{{ streamingChars }}</span>
          <span v-if="streamingSpeed" class="ci-status-speed">{{ streamingSpeed }}</span>
        </template>
        <template v-else>
          <span class="ci-status-dot ci-status-dot--muted" />
          <span class="ci-status-phase">Idle</span>
        </template>
        <span v-if="searchPrefetchStatus" class="ci-status-hint" :class="`tone-${searchPrefetchStatus.tone}`">{{ searchPrefetchStatus.text }}</span>
        <span v-if="ragIndexHealth" class="ci-status-hint" :class="`tone-${ragIndexHealth.tone}`">{{ ragIndexHealth.text }}</span>
        <button v-if="s.isProcessing" class="ci-status-stop" @click="store.stopSending()">Stop</button>
      </div>
    </transition>

    <!-- Hidden image picker (parity with YiVad aiChat) -->
    <input
      type="file"
      accept="image/*"
      multiple
      class="ci-file-input"
      @change="onImageChange"
    />

    <DraftImageList
      v-if="draftImages.length > 0"
      :images="draftImages"
      @remove="(idx: number) => store.removeDraftImage?.(idx)"
      @clear="store.clearDraftImages?.()"
    />

    <div class="ci-row">
      <div class="ci-textarea-wrap">
        <FileMentionDropdown
          :query="mentionQuery"
          :visible="mentionVisible"
          @close="onMentionClose"
          @select="onMentionSelect"
        />
        <div v-if="slashVisible && slashMatches.length" class="ci-slash-dropdown">
          <div class="ci-slash-title">Slash commands · {{ slashMatches.length }}</div>
          <div
            v-for="(c, i) in slashMatches"
            :key="c.name"
            class="ci-slash-item"
            :class="{ 'is-active': i === slashActive }"
            @click="applySlash(c.name)"
          >
            <span class="ci-slash-icon" :class="`kind-${c.kind}`">{{ c.icon }}</span>
            <span class="ci-slash-main">
              <span class="ci-slash-name"><code>{{ c.name }}</code></span>
              <span class="ci-slash-short">{{ c.short }}</span>
            </span>
            <span class="ci-slash-hint">{{ c.hint }}</span>
          </div>
        </div>
        <el-input
          v-model="inputValue"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 12 }"
          :placeholder="placeholder"
          :disabled="disabled"
          resize="none"
          :aria-label="t('chatInputAriaLabel')"
          class="ci-textarea"
          @keydown="e => onKeyDown(e as KeyboardEvent)"
          @paste="onPaste"
          @focus="keyboardRegistry.setInputFocused(true)"
          @blur="keyboardRegistry.setInputFocused(false)"
          @compositionstart="isComposing = true; compositionEndTime = 0"
          @compositionupdate="isComposing = true; compositionEndTime = 0"
          @compositionend="isComposing = false; compositionEndTime = Date.now()"
        />
      </div>

      <!-- Stop button (when streaming) -->
      <el-tooltip v-if="s.isProcessing" content="Stop generating" placement="top">
        <el-button circle size="default" type="danger" class="ci-send-btn" @click="store.stopSending()">
          <span class="ci-stop-icon" />
        </el-button>
      </el-tooltip>

      <!-- Send button -->
      <el-tooltip v-else-if="canSend" content="Send message (Enter)" placement="top">
        <el-button circle size="default" type="primary" class="ci-send-btn" :icon="Promotion" @click="send" />
      </el-tooltip>

      <!-- Clear (when only images, no text) -->
      <el-tooltip v-else-if="draftImages.length > 0" content="Clear images" placement="top">
        <el-button circle size="default" class="ci-send-btn" :icon="CircleClose" @click="store.clearDraftImages?.()" />
      </el-tooltip>
    </div>

    <!-- Character count -->
    <div class="ci-footer">
      <div class="ci-footer-left">
        <div v-if="charCount > 0" class="ci-char-count">
          <span>{{ charCount }} chars</span>
          <span class="ci-char-count-sep">·</span>
          <span>~{{ tokenEstimate }} tok</span>
        </div>
      </div>
      <div class="ci-footer-right">
        <div class="yipet-shortcut-hints">
          <span class="yipet-shortcut-hint"><kbd>?</kbd> shortcuts</span>
          <span class="yipet-shortcut-hint"><kbd>{{ displayKeys('Ctrl+B') }}</kbd> sidebar</span>
          <span class="yipet-shortcut-hint"><kbd>{{ displayKeys('Ctrl+N') }}</kbd> new</span>
          <span class="yipet-shortcut-hint"><kbd>{{ displayKeys('Ctrl+Shift+S') }}</kbd> web</span>
          <span class="yipet-shortcut-hint"><kbd>{{ displayKeys('Ctrl+Shift+R') }}</kbd> rag</span>
          <span class="yipet-shortcut-hint"><kbd>{{ displayKeys('Ctrl+K') }}</kbd> clear</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ci-input {
  display: flex;
  flex: 0 0 auto;
  flex-shrink: 0;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px 12px;
  background:
    linear-gradient(180deg, rgba(20, 18, 40, 0.96) 0%, rgba(17, 16, 34, 0.98) 100%);
  border-top: 1px solid rgba(129, 140, 248, 0.18);
  position: relative;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-height: 144px;
  z-index: 3;
  visibility: visible;
  opacity: 1;
  overflow: visible;
  box-shadow: 0 -12px 32px rgba(7, 10, 30, 0.16);

  @supports (backdrop-filter: blur(1px)) {
    background: color-mix(in srgb, #141228 90%, transparent);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }
}

.ci-input.is-idle {
  border-top-color: rgba(129, 140, 248, 0.14);
}

.ci-input.is-engaged {
  border-top-color: rgba(129, 140, 248, 0.28);
}

.ci-input.is-processing {
  border-top-color: rgba(96, 165, 250, 0.28);
}

// ── Streaming status bar ──
.ci-status {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 4px 16px 2px;
  font-size: 12px;
  color: #d4d0e8;
}
.ci-status-dot {
  width: 7px;
  height: 7px;
  background: #818cf8;
  border-radius: 50%;
  animation: ci-status-pulse 1.2s ease-in-out infinite;
  flex-shrink: 0;
}
.ci-status-dot--muted {
  background: #64748b;
  animation: none;
  opacity: 0.4;
}
@keyframes ci-status-pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
.ci-status-phase {
  font-weight: 600;
  color: #f5f3ff;
}
.ci-status-hint {
  padding: 0 6px;
  height: 18px;
  line-height: 18px;
  border-radius: 9px;
  font-size: 10px;
  font-weight: 500;
  font-family: 'SF Mono', monospace;
  white-space: nowrap;
  &.tone-ok { color: #22c55e; background: rgba(34,197,94,.1); }
  &.tone-warn { color: #eab308; background: rgba(234,179,8,.1); }
  &.tone-pending { color: #38bdf8; background: rgba(56,189,248,.1); }
  &.tone-idle { color: #a5b4fc; background: rgba(129,140,248,.08); }
}
.ci-status-time {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: #d4d0e8;
  opacity: 0.7;
}
.ci-status-chars {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: #d4d0e8;
  opacity: 0.7;
}
.ci-status-speed {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: #c7d2fe;
  opacity: 0.75;
  font-weight: 600;
}
.ci-status-stop {
  margin-left: auto;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 500;
  color: #ff4d4f;
  cursor: pointer;
  background: none;
  border: 1px solid rgba(255, 77, 79, 0.3);
  border-radius: 4px;
  transition: all 0.15s;
  &:hover {
    color: #fff;
    background: #ff4d4f;
    border-color: #ff4d4f;
  }
}
.ci-status-fade-enter-active,
.ci-status-fade-leave-active {
  transition: all 0.2s;
}
.ci-status-fade-enter-from,
.ci-status-fade-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.ci-status-fade-enter-to,
.ci-status-fade-leave-from {
  opacity: 1;
  max-height: 30px;
}

// ── Drop overlay ──
.ci-drop-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.12);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 2px dashed rgba(99, 102, 241, 0.5);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #818cf8;
  pointer-events: none;
  animation: ci-drop-in 0.15s ease-out;
}

@keyframes ci-drop-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.ci-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  padding: 8px 14px;
  margin: 0 2px;
  background:
    linear-gradient(180deg, rgba(37, 33, 74, 0.72) 0%, rgba(30, 27, 62, 0.88) 100%);
  border: 1px solid rgba(129, 140, 248, 0.22);
  border-radius: 14px;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  min-height: 56px;
  box-sizing: border-box;
  flex-shrink: 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  &:focus-within {
    border-color: rgba(129, 140, 248, 0.5);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.14), 0 10px 30px rgba(17, 24, 39, 0.24);
    transform: translateY(-1px);
  }
}

.ci-row .ci-textarea-wrap { position: relative; flex: 1; min-width: 0; }

.ci-row :deep(.el-textarea__inner) {
  min-height: 40px !important;
  padding: 8px 0 6px;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  background: transparent;
  border: none;
  box-shadow: none;
  color: #f5f3ff;
  transition: height .12s ease, padding .12s ease;
  &::placeholder { color: #d4d0e8; transition: opacity .15s; }
  &:focus { box-shadow: none; }
  &:focus::placeholder { opacity: .6; }
}

.ci-file-input { display: none; }

.ci-slash-dropdown {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0; right: 0;
  max-height: 280px;
  overflow-y: auto;
  z-index: 120;
  background: #1a1738;
  border: 1px solid rgba(99,102,241,.35);
  border-radius: 10px;
  padding: 6px;
  box-shadow: 0 12px 32px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.02) inset;
  animation: ci-slash-in .14s ease-out;
}
@keyframes ci-slash-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.ci-slash-title {
  padding: 4px 8px 6px; font-size: 10px; font-weight: 600;
  color: var(--primary-light,#818cf8); text-transform: uppercase; letter-spacing: .08em;
  border-bottom: 1px dashed rgba(99,102,241,.15);
  margin-bottom: 4px;
}
.ci-slash-item {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 8px; border-radius: 6px; cursor: pointer;
  transition: all .1s;
  &:hover, &.is-active {
    background: rgba(99,102,241,.15);
  }
  &.is-active { outline: 1px solid rgba(99,102,241,.35); }
}
.ci-slash-icon {
  width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center;
  background: rgba(99,102,241,.12); border-radius: 6px; font-size: 14px;
  &.kind-action  { background: rgba(59,130,246,.12); color: #60a5fa; }
  &.kind-session { background: rgba(168,85,247,.14); color: #c084fc; }
  &.kind-debug   { background: rgba(234,179,8,.14);  color: #facc15; }
}
.ci-slash-main { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.25; }
.ci-slash-name code {
  font-family: 'SF Mono', Menlo, monospace;
  font-size: 12px; font-weight: 700; color: var(--primary-light,#818cf8);
  background: rgba(99,102,241,.12); padding: 1px 6px; border-radius: 3px;
}
.ci-slash-short { font-size: 11px; color: #f5f3ff; margin-top: 2px; }
.ci-slash-hint { font-size: 11px; color: #d4d0e8; opacity: .75; max-width: 40%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.ci-send-btn {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  margin-bottom: 2px;
  transition: transform 0.15s, box-shadow 0.15s;
  &:hover { transform: scale(1.08); }
  &:active { transform: scale(0.95); }
  &:where(.el-button--primary) {
    background: linear-gradient(135deg, #818cf8, #60a5fa);
    border: none;
    box-shadow: 0 6px 18px rgba(96, 165, 250, 0.26);
    &:hover { box-shadow: 0 10px 22px rgba(96, 165, 250, 0.34); }
  }
}

.ci-stop-icon {
  display: block;
  width: 12px;
  height: 12px;
  background: #ffffff;
  border-radius: 2px;
  animation: ci-stop-pulse 2s ease-in-out infinite;
}
.ci-send-btn:where(.el-button--danger) { animation: ci-stop-glow 2s ease-in-out infinite; }

@keyframes ci-stop-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.yipet-chat-input-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ci-footer {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  min-height: 18px;
  padding: 0 4px;
}

.ci-footer-left {
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
}

.ci-footer-right {
  display: flex;
  flex-shrink: 0;
  align-items: center;
}

.yipet-shortcut-hints {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

// ── Character count ──
.ci-char-count {
  display: flex;
  gap: 4px;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: #d4d0e8;
  opacity: 0.72;
  white-space: nowrap;
}

.ci-char-count-sep {
  opacity: 0.4;
}

.yipet-shortcut-hint {
  font-size: 10px;
  color: #d4d0e8;
  opacity: 0.5;
  display: flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;

  kbd {
    display: inline-block;
    min-width: 14px;
    padding: 0 3px;
    font-family: 'SF Mono', 'Menlo', monospace;
    font-size: 9px;
    color: inherit;
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.15);
    border-radius: 2px;
    text-align: center;
    line-height: 1.5;
  }
}

// ── Responsive ──
@media (max-width: 480px) {
  .ci-input {
    padding: 6px 8px 10px;
  }
  .ci-row {
    padding: 6px 10px;
    margin: 0;
    border-radius: 10px;
  }
  .ci-row :deep(.el-textarea__inner) {
    padding: 6px 0;
    font-size: 13px;
  }
  .ci-send-btn {
    width: 32px;
    height: 32px;
    margin-bottom: 2px;
  }
  .ci-footer {
    flex-direction: column;
    align-items: flex-start;
  }
  .ci-footer-right {
    width: 100%;
  }
}
</style>
