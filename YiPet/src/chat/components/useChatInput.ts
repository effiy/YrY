/**
 * YiPet Chat — useChatInput composable
 * Extracted from ChatInput.vue — input state, mention detection, slash commands,
 * history recall, keyboard handling, paste/drag-drop, image picker, template syncing.
 */
import { computed, onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { useChatStore } from '../stores/chat';
import { keyboardRegistry } from '@/shared/shortcuts';
import { estimateTokens } from '../utils';

const MAX_DRAFT_IMAGES = 4;
const URL_RE = /^https?:\/\/[^\s"'<>]+$/i;

const SLASH_COMMANDS: Array<{ name: string; short: string; hint: string; icon: string; kind: 'action' | 'session' | 'debug' }> = [
  { name: '/new',      short: 'New chat',        hint: 'Create a fresh session',   icon: '+', kind: 'session' },
  { name: '/clear',    short: 'Clear chat',      hint: 'Empty current session',   icon: '🗑', kind: 'action'  },
  { name: '/retry',    short: 'Retry last',      hint: 'Re-run last assistant turn', icon: '↺', kind: 'action' },
  { name: '/compact',  short: 'Compact context', hint: 'Summarize long conversation', icon: '✂', kind: 'action'  },
  { name: '/stop',     short: 'Stop stream',     hint: 'Abort current generation', icon: '⏹', kind: 'action'  },
  { name: '/export',   short: 'Export MD',       hint: 'Save session as Markdown', icon: '↓', kind: 'session' },
  { name: '/name',     short: 'Rename session',  hint: '/name <new title>', icon: '✏', kind: 'session' },
  { name: '/copy',     short: 'Copy last reply', hint: 'Copy last AI message to clipboard', icon: '📋', kind: 'action'  },
  { name: '/session',  short: 'Session info',    hint: 'Show current session stats', icon: 'ℹ', kind: 'debug' },
  { name: '/help',     short: 'Commands list',   hint: 'Show all / commands and shortcuts', icon: '?', kind: 'debug' },
];

export function useChatInput() {
  const store = useChatStore();
  const s = store.state;

  function _safeCompute<T>(fn: () => T, fallback: T) {
    return computed(() => { try { return fn(); } catch { return fallback; } });
  }

  // ═══════════════════════════════════════════
  // Input state refs
  // ═══════════════════════════════════════════
  // Writable computed linked to store.state.inputText.
  // When TemplatePicker sets store.state.inputText = text, get() picks it up.
  // When the user types, set() writes back to the store.
  // This mirrors YiVad's direct store.input binding.
  const inputValue = computed<string>({
    get: () => s.inputText,
    set: (val) => { s.inputText = val; },
  });
  const isComposing = ref(false);
  const compositionEndTime = ref(0);
  const lastTemplateRef = ref('');
  const historyIdxRef = ref(-1);
  const preHistoryInputRef = ref('');
  const preHistoryCaretRef = ref(-1);
  const preserveComposerOnNextOpen = ref(false);
  const textareaEl = ref<HTMLTextAreaElement | null>(null);
  const pasteLastWasMixed = ref(false);

  const draftImages = computed(() => s.draftImages || []);

  // ═══════════════════════════════════════════
  // Caret helpers
  // ═══════════════════════════════════════════
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
  function focusTa() {
    const ta = document.querySelector('#yipet-chat-window .el-textarea__inner') as HTMLTextAreaElement | null;
    ta?.focus();
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

  // ═══════════════════════════════════════════
  // Computed state
  // ═══════════════════════════════════════════
  const disabled = _safeCompute(() => !!s.isProcessing, false);
  const canSend = _safeCompute(() => {
    if (s.isProcessing) return false;
    return (inputValue.value || '').trim().length > 0 || (draftImages.value?.length ?? 0) > 0;
  }, false);
  const charCount = _safeCompute(() => (inputValue.value || '').length, 0);
  const tokenEstimate = _safeCompute(() => estimateTokens(inputValue.value), 0);
  const composerTone = _safeCompute(() => {
    if (s.isProcessing) return 'is-processing';
    if (charCount.value > 0 || draftImages.value.length > 0) return 'is-engaged';
    return 'is-idle';
  }, 'is-idle');

  // ═══════════════════════════════════════════
  // Placeholder
  // ═══════════════════════════════════════════
  const placeholder = _safeCompute(() => {
    try {
      if ((inputValue.value || '').startsWith('/')) return '/compact /clear /retry /stop /new /export /name /copy /session — type a command';
      if (s.streamingPhase === 'fetching') return 'Fetching context...';
      if (s.streamingPhase === 'preparing') return 'Preparing request...';
      if (s.streamingPhase === 'retrieving') return 'Retrieving context...';
      if (s.streamingPhase === 'thinking') return 'AI is analyzing...';
      if (s.streamingPhase === 'streaming') return 'AI is generating response...';
      if (s.webSearchEnabled && s.ragEnabled) return 'RAG + Web · Ask anything...';
      if (s.ragEnabled) return 'RAG · Ask anything...';
      if (s.webSearchEnabled) return 'Web search enabled — Ask anything...';
      if (s.webSearchEnabled && s.isProcessing) return 'Searching the web...';
      return 'Ask anything... (Enter to send, Shift+Enter for newline)';
    } catch { return 'Ask anything... (Enter to send, Shift+Enter for newline)'; }
  }, 'Ask anything... (Enter to send, Shift+Enter for newline)');

  // ═══════════════════════════════════════════
  // @-mention detection
  // ═══════════════════════════════════════════
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

  // ═══════════════════════════════════════════
  // Slash commands
  // ═══════════════════════════════════════════
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
      if (['/clear','/new','/retry','/compact','/export','/stop','/copy','/session','/help','/hotkeys'].includes(name)) send();
      else {
        const ta = document.querySelector('#yipet-chat-window .el-textarea__inner') as HTMLTextAreaElement | null;
        ta?.focus();
      }
    });
  }

  // ═══════════════════════════════════════════
  // Send / Clear
  // ═══════════════════════════════════════════
  function clearComposer() {
    inputValue.value = '';
    lastTemplateRef.value = '';
    historyIdxRef.value = -1;
    preHistoryInputRef.value = '';
    store.clearDraftImages?.();
  }

  function send() {
    const text = inputValue.value.trim();
    const imgs = draftImages.value.length > 0 ? draftImages.value : undefined;
    if (!text && !imgs) return;
    if (s.isProcessing) return;
    if (text) store.pushPromptHistory?.(text);
    historyIdxRef.value = -1;
    store.sendMessage(text, imgs);
    clearComposer();
    nextTick(() => {
      const ta = document.querySelector('#yipet-chat-window .el-textarea__inner') as HTMLTextAreaElement | null;
      ta?.focus();
    });
  }

  // ═══════════════════════════════════════════
  // Mention select / close
  // ═══════════════════════════════════════════
  async function onMentionSelect(path: string) {
    if (mentionAtIdx.value < 0) return;
    const before = inputValue.value.slice(0, mentionAtIdx.value);
    const after = inputValue.value.slice(mentionAtIdx.value + 1 + mentionQuery.value.length);
    inputValue.value = (before + after).trim();
    mentionVisible.value = false;
    mentionQuery.value = '';
    mentionAtIdx.value = -1;
    try {
      await store.addContextFile?.(path);
    } catch { /* ignore */ }
  }

  function onMentionClose() {
    if (mentionAtIdx.value >= 0) {
      const before = inputValue.value.slice(0, mentionAtIdx.value);
      const after = inputValue.value.slice(mentionAtIdx.value + 1 + mentionQuery.value.length);
      inputValue.value = (before + after).trim();
    }
    mentionVisible.value = false;
    mentionQuery.value = '';
    mentionAtIdx.value = -1;
  }

  // ═══════════════════════════════════════════
  // Keyboard handler
  // ═══════════════════════════════════════════
  function onKeyDown(e: KeyboardEvent) {
    if (mentionVisible.value) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onMentionClose();
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        mentionVisible.value = false;
        mentionQuery.value = '';
        mentionAtIdx.value = -1;
        return;
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
      store.toggleRag?.();
      ElMessage({
        message: s.ragEnabled ? 'RAG on' : 'RAG off',
        type: s.ragEnabled ? 'success' : 'info',
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

    // Prompt history navigation (caret-aware)
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
        if (!navigating) return;
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

  // ═══════════════════════════════════════════
  // Composition events
  // ═══════════════════════════════════════════
  function onCompositionStart() {
    isComposing.value = true;
    compositionEndTime.value = 0;
  }
  function onCompositionUpdate() {
    isComposing.value = true;
    compositionEndTime.value = 0;
  }
  function onCompositionEnd() {
    isComposing.value = false;
    compositionEndTime.value = Date.now();
  }

  // ═══════════════════════════════════════════
  // Paste handler
  // ═══════════════════════════════════════════
  function onPaste(e: ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageItems: DataTransferItem[] = [];
    const htmlText = e.clipboardData?.getData('text/html') || '';
    const plainText = e.clipboardData?.getData('text/plain');
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) imageItems.push(items[i]);
    }
    // Pure URL -> attach as context file, insert trailing space so user can type after
    if (plainText && URL_RE.test(plainText.trim()) && !htmlText && imageItems.length === 0) {
      const url = plainText.trim();
      e.preventDefault();
      store.addContextFile?.(url)
        .then(() => {
          insertAtCaret(' ');
          ElMessage({ message: `URL attached: ${url.length > 40 ? url.slice(0,40)+'...' : url}`, type: 'success', duration: 1600, showClose: false });
        })
        .catch(() => { insertAtCaret(plainText); });
      return;
    }
    // Mixed rich text + URL or just text
    if (plainText && URL_RE.test(plainText.trim()) && imageItems.length === 0) {
      const url = plainText.trim();
      e.preventDefault();
      store.addContextFile?.(url)
        .then(() => {
          insertAtCaret(' ');
          pasteLastWasMixed.value = true;
          ElMessage({ message: `URL attached: ${url.length > 40 ? url.slice(0,40)+'...' : url}`, type: 'success', duration: 1600, showClose: false });
        })
        .catch(() => { insertAtCaret(plainText); });
      return;
    }
    // Mixed text + images -> attach images, insert text at caret
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
  }

  // ═══════════════════════════════════════════
  // Drag-and-drop images
  // ═══════════════════════════════════════════
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

  // ═══════════════════════════════════════════
  // Image picker
  // ═══════════════════════════════════════════
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

  // ═══════════════════════════════════════════
  // Prefetch web search timer
  // ═══════════════════════════════════════════
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
          } catch { /* best-effort */ }
        } catch { /* ignore */ }
      }, 600);
    }
  );

  // ═══════════════════════════════════════════
  // Template syncing from QuickButtons / TemplatePicker
  // ═══════════════════════════════════════════
  watch(() => s.inputTemplate, (val) => {
    if (val && val !== lastTemplateRef.value) {
      preserveComposerOnNextOpen.value = true;
      lastTemplateRef.value = val;
      inputValue.value = val;
      s.inputTemplate = '';
    }
  });

  // ═══════════════════════════════════════════
  // Programmatic input (yipet:set-input)
  // ═══════════════════════════════════════════
  function handleProgrammaticInput(detail?: { text?: string; mode?: 'replace' | 'append' }) {
    const text = detail?.text || '';
    if (!text) return;
    preserveComposerOnNextOpen.value = true;
    if (detail?.mode === 'append') inputValue.value += text;
    else inputValue.value = text;
    lastTemplateRef.value = inputValue.value;
    nextTick(() => focusTa());
  }

  function onExternalSetInput(e: Event) {
    handleProgrammaticInput((e as CustomEvent<{ text?: string; mode?: 'replace' | 'append' }>).detail);
  }

  // ═══════════════════════════════════════════
  // Global slash key handler
  // ═══════════════════════════════════════════
  function slashKeyHandler(e: KeyboardEvent) {
    if (e.key !== '/') return;
    const target = e.target as HTMLElement | null;
    const tag = target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable === true) return;
    e.preventDefault();
    const textarea = document.querySelector('#yipet-chat-window .el-textarea__inner') as HTMLTextAreaElement | null;
    textarea?.focus();
  }

  // ═══════════════════════════════════════════
  // Textarea focus/blur for keyboard registry
  // ═══════════════════════════════════════════
  function onTextareaFocus() {
    keyboardRegistry.setInputFocused(true);
  }
  function onTextareaBlur() {
    keyboardRegistry.setInputFocused(false);
  }

  // ═══════════════════════════════════════════
  // Lifecycle
  // ═══════════════════════════════════════════
  onMounted(() => {
    window.addEventListener('keydown', slashKeyHandler);
    window.addEventListener('yipet:set-input', onExternalSetInput as EventListener);
    nextTick(() => focusTa());
  });

  onBeforeUnmount(() => {
    clearTimeout(preFetchTimer);
    window.removeEventListener('keydown', slashKeyHandler);
    window.removeEventListener('yipet:set-input', onExternalSetInput as EventListener);
  });

  // Auto-focus when chat becomes visible or session changes
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

  // ═══════════════════════════════════════════
  // Return public interface
  // ═══════════════════════════════════════════
  return {
    // State refs
    inputValue,
    isComposing,
    compositionEndTime,
    lastTemplateRef,
    historyIdxRef,
    preHistoryInputRef,
    preHistoryCaretRef,
    pasteLastWasMixed,
    textareaEl,

    // Mention
    mentionQuery,
    mentionVisible,
    mentionAtIdx,

    // Slash
    slashVisible,
    slashQuery,
    slashMatches,
    slashActive,
    applySlash,

    // Drag and drop
    isDragOver,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,

    // Computed
    disabled,
    canSend,
    charCount,
    tokenEstimate,
    composerTone,
    placeholder,
    draftImages,

    // Methods
    send,
    clearComposer,
    onMentionSelect,
    onMentionClose,
    onKeyDown,
    onPaste,
    onImageChange,
    focusTa,
    handleProgrammaticInput,
    insertAtCaret,

    // Textarea event callbacks
    onCompositionStart,
    onCompositionUpdate,
    onCompositionEnd,
    onTextareaFocus,
    onTextareaBlur,
  };
}