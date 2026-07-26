/**
 * LoggerUtils — CDN utility (built as IIFE, attaches window.LoggerUtils).
 *
 * Provides dev-mode-gated console logging with storage-backed toggle,
 * buffered queue before init, and namespace sub-loggers.
 *
 * Importable as ES module:  import { LoggerUtils } from './log';
 * CDN global:              window.LoggerUtils.log(...)
 */

/* ═══════════════════════════════════════════════════════════════════════
   State
   ═══════════════════════════════════════════════════════════════════════ */

let _devMode = false;
let _storageKey: string | null = null;
let _initialized = false;
let _pendingQueue: { method: string; args: unknown[] }[] = [];
let _bufferEnabled = true;

/* ═══════════════════════════════════════════════════════════════════════
   Internal
   ═══════════════════════════════════════════════════════════════════════ */

function _shouldLog(): boolean {
  return _devMode === true;
}

function _safeArgs(args: unknown[]): unknown[] {
  try { return Array.prototype.slice.call(args); }
  catch { return ['[LoggerUtils] Argument cannot be serialized']; }
}

function _flushQueue(): void {
  if (!_pendingQueue.length) return;
  const queue = _pendingQueue;
  _pendingQueue = [];
  for (const entry of queue) {
    _writeLog(entry.method, entry.args);
  }
}

function _writeLog(method: string, args: unknown[]): void {
  if (!_shouldLog()) return;
  const safe = _safeArgs(args) as unknown[];
  const prefix = '[YiPet]';

  switch (method) {
    case 'error':   console.error(prefix, ...safe); break;
    case 'warn':    console.warn(prefix, ...safe); break;
    case 'info':    console.info(prefix, ...safe); break;
    case 'debug':   console.debug(prefix, ...safe); break;
    case 'group':   console.group(prefix, ...safe); break;
    case 'groupEnd':console.groupEnd(); break;
    case 'table':   console.table(safe[0], safe[1] as string[] | undefined); break;
    case 'trace':   console.trace(prefix, ...safe); break;
    case 'time':    console.time(String(safe[0])); break;
    case 'timeEnd': console.timeEnd(String(safe[0])); break;
    default:        console.log(prefix, ...safe); break;
  }
}

function _log(method: string, args: IArguments | unknown[]): void {
  if (!_initialized && _bufferEnabled) {
    _pendingQueue.push({ method, args: _safeArgs(Array.prototype.slice.call(args)) });
    return;
  }
  _writeLog(method, Array.prototype.slice.call(args));
}

async function _readDevModeFromStorage(key: string): Promise<boolean> {
  try {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) return false;
    return new Promise<boolean>((resolve) => {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) { resolve(false); return; }
        const val = result[key];
        resolve(val === true || val === 'true' || val === 1 || val === '1');
      });
    });
  } catch { return false; }
}

function _watchStorageChanges(key: string): void {
  try {
    if (typeof chrome === 'undefined' || !chrome.storage?.onChanged) return;
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local') return;
      if (!changes[key]) return;
      const newVal = changes[key].newValue;
      _devMode = (newVal === true || newVal === 'true' || newVal === 1 || newVal === '1');
    });
  } catch { /* not in extension context */ }
}

/* ═══════════════════════════════════════════════════════════════════════
   Public API
   ═══════════════════════════════════════════════════════════════════════ */

interface LoggerUtilsType {
  initMuteLogger(storageKey?: string, fallbackDevMode?: boolean, options?: { buffer?: boolean }): Promise<LoggerUtilsType>;
  setDevMode(enabled: boolean): void;
  isDevMode(): boolean;
  isInitialized(): boolean;
  log(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  group(...args: unknown[]): void;
  groupEnd(): void;
  table(data: unknown, columns?: string[]): void;
  trace(...args: unknown[]): void;
  time(label: string): void;
  timeEnd(label: string): void;
  logIf(condition: boolean, ...args: unknown[]): void;
  assert(condition: boolean, message?: string, ...args: unknown[]): void;
  createNamespace(namespace: string): {
    log(...args: unknown[]): void;
    info(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    error(...args: unknown[]): void;
    debug(...args: unknown[]): void;
  };
  getPendingCount(): number;
  clearPending(): void;
  _shouldLog(): boolean;
  _safeArgs(args: unknown[]): unknown[];
  _flushQueue(): void;
  _writeLog(method: string, args: unknown[]): void;
  _log(method: string, args: IArguments | unknown[]): void;
}

export const LoggerUtils: LoggerUtilsType = {
  /* ── Init ─────────────────────────────────────────────────────── */

  async initMuteLogger(
    storageKey?: string,
    fallbackDevMode?: boolean,
    options?: { buffer?: boolean },
  ): Promise<typeof LoggerUtils> {
    if (_initialized) return LoggerUtils;

    _storageKey = storageKey || 'petDevMode';
    _devMode = !!fallbackDevMode;

    if (options && typeof options.buffer === 'boolean') {
      _bufferEnabled = options.buffer;
    }

    try {
      const storedValue = await _readDevModeFromStorage(_storageKey);
      _devMode = storedValue;
    } catch { /* use fallback */ }

    _initialized = true;
    _watchStorageChanges(_storageKey);
    _flushQueue();
    return LoggerUtils;
  },

  /* ── Mode Control ─────────────────────────────────────────────── */

  setDevMode(enabled: boolean): void {
    _devMode = !!enabled;
    if (!_initialized) _initialized = true;
    if (_devMode) _flushQueue();
  },

  isDevMode(): boolean { return _devMode; },
  isInitialized(): boolean { return _initialized; },

  /* ── Log Methods ──────────────────────────────────────────────── */

  log(...args: unknown[]): void    { _log('log', arguments); },
  info(...args: unknown[]): void   { _log('info', arguments); },
  warn(...args: unknown[]): void   { _log('warn', arguments); },
  error(...args: unknown[]): void  { _log('error', arguments); },
  debug(...args: unknown[]): void  { _log('debug', arguments); },
  group(...args: unknown[]): void  { _log('group', arguments); },
  groupEnd(): void                 { _log('groupEnd', []); },
  table(data: unknown, columns?: string[]): void { _log('table', [data, columns]); },
  trace(...args: unknown[]): void  { _log('trace', arguments); },
  time(label: string): void        { _log('time', [label]); },
  timeEnd(label: string): void     { _log('timeEnd', [label]); },

  /* ── Conditional ──────────────────────────────────────────────── */

  logIf(condition: boolean, ...args: unknown[]): void {
    if (!condition) return;
    _log('log', args);
  },

  assert(condition: boolean, message?: string, ...args: unknown[]): void {
    if (condition) return;
    _log('error', ['[ASSERT] ' + (message || 'Assertion failed'), ...args]);
  },

  /* ── Namespace ────────────────────────────────────────────────── */

  createNamespace(namespace: string) {
    const ns = '[' + String(namespace || '') + ']';
    const self: LoggerUtilsType = this;
    return {
      log(...args: unknown[]): void    { self.log(ns, ...args); },
      info(...args: unknown[]): void   { self.info(ns, ...args); },
      warn(...args: unknown[]): void   { self.warn(ns, ...args); },
      error(...args: unknown[]): void  { self.error(ns, ...args); },
      debug(...args: unknown[]): void  { self.debug(ns, ...args); },
    };
  },

  /* ── Queue ────────────────────────────────────────────────────── */

  getPendingCount(): number { return _pendingQueue.length; },
  clearPending(): void      { _pendingQueue = []; },

  /* ── Internal (debug) ─────────────────────────────────────────── */

  _shouldLog,
  _safeArgs,
  _flushQueue,
  _writeLog,
  _log,
};

export default LoggerUtils;

// Attach to window when loaded as a plain <script> (CDN context)
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).LoggerUtils = LoggerUtils;
}
