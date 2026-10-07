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

export interface KnownConflictRecord {
  shortcutId: string;
  keys: string;
  description: string;
  severity: ConflictSeverity;
  scope: ShortcutScope;
}

export interface ParsedKeys {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  key: string;
}

// ── Known Browser/System Shortcuts ──────────────────────────────────────────

/** Shortcuts known to conflict with Chrome or common web apps. */
export const KNOWN_CONFLICTS: { keys: string; description: string }[] = [
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

export const DEFAULT_BINDINGS: ShortcutBinding[] = [
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
  { id: 'translate-selection', keys: 'Ctrl+Shift+Y', description: '翻译选中文本',   category: 'chat',       scope: 'global', customizable: true },
  { id: 'cheatsheet',         keys: '?',         description: '快捷键速查面板',       category: 'utility',    scope: 'global', customizable: true },
];

// ── Key Serialization ───────────────────────────────────────────────────────

const MODIFIER_ORDER = ['Ctrl', 'Alt', 'Shift', 'Meta'];

export function normalizeKeys(keys: string): string {
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

export function eventToKeyString(e: KeyboardEvent): string {
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

export function parseKeys(keys: string): ParsedKeys {
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

