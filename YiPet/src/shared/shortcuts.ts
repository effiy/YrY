/**
 * Keyboard Shortcuts System — YP-09-29, YP-09-97, YP-09-104.
 *
 * Centralized keyboard shortcut registry with capture-phase interception,
 * IME composition guard, 4-tier scope routing, conflict detection against
 * known browser/page shortcuts, and user-customizable bindings persisted
 * via chrome.storage.sync (with local fallback).
 *
 * Architecture:
 *   KeyboardRegistry (singleton) — owns all bindings + lifecycle
 *   ShortcutStore              — persistence layer (sync → local fallback)
 *   ConflictDetector           — known browser/page shortcut conflict check
 *   CustomEvent dispatch       — decoupled handler registration via
 *                                `window.addEventListener('yipet:shortcut:<action>', ...)`
 *
 * Scope priority (inner wins):
 *   input > chat > page > global
 */
import { ref, type Ref } from 'vue';

// ── Types ───────────────────────────────────────────────────────────────────

export type ShortcutScope = 'global' | 'chat';

export interface ShortcutBinding {
  id: string;
  keys: string;           // normalized, e.g. "Ctrl+Shift+X"
  description: string;
  category: 'pet' | 'chat' | 'navigation' | 'utility';
  scope: ShortcutScope;
  customizable: boolean;
}

export interface ConflictRecord {
  shortcutId: string;
  conflictingId: string;
  keys: string;
}

export type ConflictSeverity = 'high' | 'low';

interface KnownConflictRecord {
  shortcutId: string;
  keys: string;
  description: string;
  severity: ConflictSeverity;
  scope: ShortcutScope;
}

interface ParsedKeys {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  key: string;
}

// ── Known Browser/System Shortcuts ──────────────────────────────────────────

/** Shortcuts known to conflict with Chrome or common web apps. */
const KNOWN_CONFLICTS: { keys: string; description: string }[] = [
  { keys: 'Ctrl+T', description: '打开新标签页 (Chrome)' },
  { keys: 'Ctrl+W', description: '关闭标签页 (Chrome)' },
  { keys: 'Ctrl+Shift+T', description: '恢复关闭的标签页 (Chrome)' },
  { keys: 'Ctrl+N', description: '打开新窗口 (Chrome)' },
  { keys: 'Ctrl+D', description: '添加书签 (Chrome)' },
  { keys: 'Ctrl+H', description: '打开历史记录 (Chrome)' },
  { keys: 'Ctrl+J', description: '打开下载页 (Chrome)' },
  { keys: 'Ctrl+F', description: '页面内查找 (Chrome)' },
  { keys: 'Ctrl+P', description: '打印页面 (Chrome)' },
  { keys: 'Ctrl+S', description: '保存页面 (Chrome)' },
  { keys: 'Ctrl+Shift+N', description: '打开隐身窗口 (Chrome)' },
  { keys: 'Ctrl+Shift+P', description: '命令面板 (VS Code)' },
  { keys: 'Ctrl+Shift+K', description: '删除行 (VS Code)' },
  { keys: 'Ctrl+Shift+S', description: '另存为 (VS Code)' },
  { keys: 'Ctrl+Shift+M', description: 'Markdown 预览 (VS Code)' },
  { keys: 'Ctrl+K', description: '搜索/插入链接 (Notion/GitHub)' },
  { keys: 'Escape', description: '取消/关闭 (通用)' },
  { keys: '?', description: '快捷键帮助 (GitHub/Twitter/Jira)' },
];

// ── Default Shortcut Bindings ───────────────────────────────────────────────

const DEFAULT_BINDINGS: ShortcutBinding[] = [
  // Global (chrome.commands in manifest.json)
  { id: 'toggle-pet',      keys: 'Ctrl+Shift+P', description: '显示/隐藏宠物',       category: 'pet',        scope: 'global', customizable: true },
  { id: 'open-chat',       keys: 'Ctrl+Shift+X', description: '打开/关闭聊天窗口',    category: 'chat',       scope: 'global', customizable: true },
  { id: 'screenshot',      keys: 'Ctrl+Shift+S', description: '截取当前页面',         category: 'utility',    scope: 'global', customizable: true },
  { id: 'toggle-mute',     keys: 'Ctrl+Shift+M', description: '切换静音',             category: 'pet',        scope: 'global', customizable: true },

  // Chat window
  { id: 'focus-input',     keys: 'Ctrl+I',       description: '聚焦聊天输入框',       category: 'chat',       scope: 'chat',   customizable: true },
  { id: 'new-session',     keys: 'Ctrl+N',       description: '新建会话',             category: 'chat',       scope: 'chat',   customizable: true },
  { id: 'toggle-sidebar',  keys: 'Ctrl+B',       description: '切换侧边栏',           category: 'navigation', scope: 'chat',   customizable: true },
  { id: 'export-session',  keys: 'Ctrl+E',       description: '导出会话为 Markdown',  category: 'utility',    scope: 'chat',   customizable: true },
  { id: 'search-messages', keys: 'Ctrl+F',       description: '搜索消息',             category: 'navigation', scope: 'chat',   customizable: true },
  { id: 'zoom-in',         keys: 'Ctrl+=',       description: '放大字体',             category: 'utility',    scope: 'chat',   customizable: true },
  { id: 'zoom-out',        keys: 'Ctrl+-',       description: '缩小字体',             category: 'utility',    scope: 'chat',   customizable: true },
  { id: 'clear-conversation', keys: 'Ctrl+K',    description: '清空会话',             category: 'chat',       scope: 'chat',   customizable: true },
  { id: 'clear-input',        keys: 'Ctrl+L',    description: '清空输入',             category: 'chat',       scope: 'chat',   customizable: true },
  { id: 'cheatsheet',         keys: '?',         description: '快捷键速查面板',       category: 'utility',    scope: 'global', customizable: true },
];

// ── Key Serialization ───────────────────────────────────────────────────────

const MODIFIER_ORDER = ['Ctrl', 'Alt', 'Shift', 'Meta'];

function normalizeKeys(keys: string): string {
  const parts = keys.split('+').map(p => p.trim());
  const modifiers: string[] = [];
  let mainKey = '';

  for (const part of parts) {
    const n = part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    if (MODIFIER_ORDER.includes(n)) {
      modifiers.push(n);
    } else {
      mainKey = n;
    }
  }

  modifiers.sort((a, b) => MODIFIER_ORDER.indexOf(a) - MODIFIER_ORDER.indexOf(b));
  return [...modifiers, mainKey].join('+');
}

function eventToKeyString(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');

  const key = e.key === ' ' ? 'Space' : e.key.length === 1 ? e.key.toUpperCase() : e.key;
  if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
    parts.push(key);
  }

  return parts.join('+');
}

function parseKeys(keys: string): ParsedKeys {
  const parts = keys.split('+').map(p => p.trim());
  return {
    ctrl:  parts.some(p => p === 'Ctrl'),
    alt:   parts.some(p => p === 'Alt'),
    shift: parts.some(p => p === 'Shift'),
    meta:  parts.some(p => p === 'Meta'),
    key:   parts.find(p => !MODIFIER_ORDER.includes(p)) ?? '',
  };
}

/** Platform-aware display string (Cmd on Mac, Ctrl on Windows/Linux). */
export function displayKeys(keys: string): string {
  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);
  return keys
    .replace(/^Ctrl\+/, isMac ? 'Cmd+' : 'Ctrl+')
    .replace(/\+Ctrl\+/g, isMac ? '+Cmd+' : '+Ctrl+');
}

// ── ShortcutStore (persistence) ─────────────────────────────────────────────

const STORAGE_KEY = 'yipet:shortcuts';

class ShortcutStore {
  async load(): Promise<Record<string, string>> {
    try {
      const result = await chrome.storage.sync.get(STORAGE_KEY);
      if (result[STORAGE_KEY]) return result[STORAGE_KEY] as Record<string, string>;
    } catch {
      // sync unavailable — fall through to local
    }
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      if (result[STORAGE_KEY]) return result[STORAGE_KEY] as Record<string, string>;
    } catch {
      // chrome.storage may not be available (e.g. in tests)
    }
    return {};
  }

  async save(data: Record<string, string>): Promise<void> {
    try {
      await chrome.storage.sync.set({ [STORAGE_KEY]: data });
    } catch {
      try {
        await chrome.storage.local.set({ [STORAGE_KEY]: data });
      } catch {
        // best effort
      }
    }
  }

  async clear(): Promise<void> {
    try { await chrome.storage.sync.remove(STORAGE_KEY); } catch { /* ignore */ }
    try { await chrome.storage.local.remove(STORAGE_KEY); } catch { /* ignore */ }
  }
}

// ── KeyboardRegistry ────────────────────────────────────────────────────────

class KeyboardRegistry {
  private _bindings: Map<string, ShortcutBinding> = new Map();
  private _byKeys: Map<string, string> = new Map(); // keys → id
  private _store = new ShortcutStore();
  private _listening = false;
  private _chatActive = false;
  private _inputFocused = false;
  private _boundHandler: ((e: KeyboardEvent) => void) | null = null;
  private _logsMutedSession = false;
  private _logsMutedPermanent = false;

  /** Known browser/page conflicts detected at init — with severity + scope. */
  knownConflicts = ref<KnownConflictRecord[]>([]);
  /** Internal conflicts (duplicate bindings). */
  conflicts = ref<ConflictRecord[]>([]);

  // ── Registration ──────────────────────────────────────────────────────

  register(binding: ShortcutBinding): void {
    binding.keys = normalizeKeys(binding.keys);
    this._bindings.set(binding.id, binding);
    this._rebuildIndex();
  }

  unregister(id: string): void {
    this._bindings.delete(id);
    this._rebuildIndex();
  }

  /** Register all default bindings, then overlay persisted user customizations. */
  async initialize(): Promise<void> {
    // Load defaults
    for (const b of DEFAULT_BINDINGS) {
      this.register({ ...b });
    }

    // Overlay persisted customizations
    const saved = await this._store.load();
    for (const [id, keys] of Object.entries(saved)) {
      const binding = this._bindings.get(id);
      if (binding && binding.customizable) {
        binding.keys = normalizeKeys(keys);
      }
    }

    this._rebuildIndex();
    this._detectKnownConflicts();
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  /** Start capture-phase keydown listening. */
  startListening(): void {
    if (this._listening) return;
    this._boundHandler = this._handleKeyDown.bind(this);
    document.addEventListener('keydown', this._boundHandler, { capture: true });
    this._listening = true;
  }

  stopListening(): void {
    if (!this._listening || !this._boundHandler) return;
    document.removeEventListener('keydown', this._boundHandler, { capture: true });
    this._boundHandler = null;
    this._listening = false;
  }

  /** Notify registry that the chat window is open/active. */
  setChatActive(active: boolean): void {
    this._chatActive = active;
  }

  /** Notify registry that a text input is focused (page or chat). */
  setInputFocused(focused: boolean): void {
    this._inputFocused = focused;
  }

  /** True when the registry is intercepting keydown events. */
  get isListening(): boolean {
    return this._listening;
  }

  // ── Query ──────────────────────────────────────────────────────────────

  getAll(): ShortcutBinding[] {
    return Array.from(this._bindings.values());
  }

  getByCategory(cat: ShortcutBinding['category']): ShortcutBinding[] {
    return this.getAll().filter(s => s.category === cat);
  }

  getByScope(scope: ShortcutScope): ShortcutBinding[] {
    return this.getAll().filter(s => s.scope === scope);
  }

  // ── Customization ──────────────────────────────────────────────────────

  async updateBinding(id: string, newKeys: string): Promise<{ success: boolean; conflict?: string }> {
    const binding = this._bindings.get(id);
    if (!binding || !binding.customizable) return { success: false };

    const normalized = normalizeKeys(newKeys);

    // Check internal conflict
    const existing = this._byKeys.get(normalized);
    if (existing && existing !== id) {
      return { success: false, conflict: existing };
    }

    binding.keys = normalized;
    this._rebuildIndex();

    // Persist only customized (non-default) bindings
    const data: Record<string, string> = {};
    for (const b of this._bindings.values()) {
      const def = DEFAULT_BINDINGS.find(d => d.id === b.id);
      if (def && b.keys !== def.keys && b.customizable) {
        data[b.id] = b.keys;
      }
    }
    await this._store.save(data);

    return { success: true };
  }

  async restoreDefaults(): Promise<void> {
    this._bindings.clear();
    for (const b of DEFAULT_BINDINGS) {
      this.register({ ...b });
    }
    this._rebuildIndex();
    await this._store.clear();
  }

  // ── Event Handling ─────────────────────────────────────────────────────

  private _handleKeyDown = (e: KeyboardEvent): void => {
    // Skip IME composition (中文/日文输入法)
    if (e.isComposing) return;

    const pressed = eventToKeyString(e);
    const matchedId = this._byKeys.get(pressed);
    if (!matchedId) return; // passthrough to host page

    const binding = this._bindings.get(matchedId);
    if (!binding) return;

    // Scope gate
    if (!this._scopeAllows(binding.scope)) return;

    // Special case: '?' key must not fire when typing in any input
    if (binding.id === 'cheatsheet' && this._inputFocused) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    // Dispatch as CustomEvent so handlers are fully decoupled from the registry.
    window.dispatchEvent(new CustomEvent(`yipet:shortcut:${binding.id}`));
  };

  private _scopeAllows(bindingScope: ShortcutScope): boolean {
    if (bindingScope === 'global') return true;
    if (bindingScope === 'chat') return this._chatActive;
    return false;
  }

  // ── Conflict Detection ─────────────────────────────────────────────────

  private _rebuildIndex(): void {
    this._byKeys.clear();
    const conflicts: ConflictRecord[] = [];
    for (const [id, binding] of this._bindings) {
      const existing = this._byKeys.get(binding.keys);
      if (existing) {
        conflicts.push({ shortcutId: id, conflictingId: existing, keys: binding.keys });
      } else {
        this._byKeys.set(binding.keys, id);
      }
    }
    this.conflicts.value = conflicts;
  }

  /* ── Mute Controls ────────────────────────────────────────────────────── */

  private static readonly CONFLICT_LOG_FLAG_SESSION = 'yipet:conflicts-logged';
  private static readonly CONFLICT_LOG_FLAG_PERMANENT = 'yipet:conflicts-muted';

  /** True when a log emission is suppressed (session- or permanently-muted, or already logged this session). */
  private _shouldSkipEmission(): boolean {
    if (this._logsMutedPermanent) return true;
    if (this._logsMutedSession) return true;
    try {
      if (localStorage.getItem(KeyboardRegistry.CONFLICT_LOG_FLAG_PERMANENT) === '1') {
        this._logsMutedPermanent = true;
        return true;
      }
      if (sessionStorage.getItem(KeyboardRegistry.CONFLICT_LOG_FLAG_SESSION) === '1') {
        return true;
      }
    } catch {
      // storage blocked — best effort, still emit.
    }
    return false;
  }

  private _markEmittedSession(): void {
    try {
      sessionStorage.setItem(KeyboardRegistry.CONFLICT_LOG_FLAG_SESSION, '1');
    } catch { /* ignore */ }
  }

  /**
   * Suppress future conflict logs.
   * @param permanent If true, persist across sessions via localStorage.
   */
  muteConflictLogs(permanent = false): void {
    if (permanent) {
      this._logsMutedPermanent = true;
      try {
        localStorage.setItem(KeyboardRegistry.CONFLICT_LOG_FLAG_PERMANENT, '1');
      } catch { /* ignore */ }
    } else {
      this._logsMutedSession = true;
    }
  }

  /** Re-enable conflict logs (clears both session and permanent mute). */
  unmuteConflictLogs(): void {
    this._logsMutedSession = false;
    this._logsMutedPermanent = false;
    try {
      localStorage.removeItem(KeyboardRegistry.CONFLICT_LOG_FLAG_PERMANENT);
      sessionStorage.removeItem(KeyboardRegistry.CONFLICT_LOG_FLAG_SESSION);
    } catch { /* ignore */ }
  }

  /**
   * Manually print the current conflict report to the console, regardless of mute state.
   * Useful in devtools after the user asks "show me conflicts again".
   */
  printConflictReport(): void {
    this._emitConflictLogs(/* force */ true);
  }

  /* ── Conflict Detection + Log Emission ────────────────────────────────── */

  private _detectKnownConflicts(): void {
    const known: KnownConflictRecord[] = [];
    for (const kc of KNOWN_CONFLICTS) {
      const normalized = normalizeKeys(kc.keys);
      const shortcutId = this._byKeys.get(normalized);
      if (!shortcutId) continue;
      const binding = this._bindings.get(shortcutId);
      if (!binding) continue;
      known.push({
        shortcutId,
        keys: normalized,
        description: kc.description,
        severity: binding.scope === 'global' ? 'high' : 'low',
        scope: binding.scope,
      });
    }
    this.knownConflicts.value = known;
    if (known.length > 0) {
      this._emitConflictLogs(/* force */ false);
    }
  }

  private _emitConflictLogs(force: boolean): void {
    const known = this.knownConflicts.value;
    if (known.length === 0) return;
    if (!force && this._shouldSkipEmission()) return;

    const highs = known.filter(k => k.severity === 'high');
    const lows = known.filter(k => k.severity === 'low');
    const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);
    const fmt = (keys: string) =>
      keys
        .replace(/^Ctrl\+/, isMac ? 'Cmd+' : 'Ctrl+')
        .replace(/\+Ctrl\+/g, isMac ? '+Cmd+' : '+Ctrl+');

    const buildRows = (items: KnownConflictRecord[]) =>
      items.map(k => ({
        Shortcut: fmt(k.keys),
        Action: this._bindings.get(k.shortcutId)?.description ?? k.shortcutId,
        'Scope': k.scope,
        'Conflicts with': k.description,
      }));

    if (highs.length > 0) {
      const summary = `[YiPet:KeyboardRegistry] ${highs.length} global-scope shortcut${highs.length > 1 ? 's' : ''} may conflict with browser or other websites — expand for details.`;
      try {
        console.groupCollapsed('%c' + summary, 'color:#d97706;font-weight:600');
        console.warn(
          'These shortcuts are intercepted globally (even when the chat window is closed).\n' +
          'Consider reassigning them via the Shortcut Binding Editor if they break your daily workflow.\n' +
          'To hide this notice, call:  keyboardRegistry.muteConflictLogs()',
        );
        if (typeof console.table === 'function') {
          console.table(buildRows(highs));
        } else {
          for (const h of highs) console.warn(`  ${fmt(h.keys)}  →  ${h.description}  (${this._bindings.get(h.shortcutId)?.description ?? h.shortcutId})`);
        }
        console.groupEnd();
      } catch {
        // groupCollapsed not supported — fall back to single-line warn
        console.warn(
          `[YiPet:KeyboardRegistry] Conflicts (global): ` +
          highs.map(h => `${fmt(h.keys)} → ${h.description}`).join('; '),
        );
      }
    }

    if (lows.length > 0) {
      const summary = `[YiPet:KeyboardRegistry] ${lows.length} chat-scope shortcut${lows.length > 1 ? 's' : ''} only override the page when the YiPet chat window is focused.`;
      try {
        console.groupCollapsed('%c' + summary, 'color:#0891b2;font-weight:500');
        console.info(
          'These are usually safe: preventDefault only fires while the YiPet chat window is open,\n' +
          'so the host page retains its native shortcuts in normal browsing.',
        );
        if (typeof console.table === 'function') {
          console.table(buildRows(lows));
        } else {
          for (const l of lows) console.info(`  ${fmt(l.keys)}  →  ${l.description}  (${this._bindings.get(l.shortcutId)?.description ?? l.shortcutId})`);
        }
        console.groupEnd();
      } catch {
        console.info(
          `[YiPet:KeyboardRegistry] Chat-scope overrides: ` +
          lows.map(l => `${fmt(l.keys)} → ${l.description}`).join('; '),
        );
      }
    }

    if (!force) this._markEmittedSession();
  }
}

// ── Singleton ───────────────────────────────────────────────────────────────

export const keyboardRegistry = new KeyboardRegistry();