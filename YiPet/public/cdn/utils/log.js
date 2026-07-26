/**
 * LoggerUtils — Silent Log Utility
 *
 * Provides conditional log output based on devMode toggle. When devMode is on, logs output normally;
 * when off, all logs are silenced (production mode), avoiding noise in the user's browser console.
 *
 * Global export: window.LoggerUtils
 *
 * Usage examples:
 *   LoggerUtils.initMuteLogger('petDevMode', false)
 *   LoggerUtils.log('This log only outputs in devMode')
 *   LoggerUtils.warn('Warning message')
 *   LoggerUtils.error('Error message', err)
 *
 * @module cdn/utils/log
 * @since 1.0.0
 */

;(function (root) {
  'use strict'

  /* ═══════════════════════════════════════════════════════════════════════════
     Private State
     ═══════════════════════════════════════════════════════════════════════════ */

  /** @type {boolean} Whether in dev mode */
  let _devMode = false

  /** @type {string|null} Key name for devMode in Chrome Storage */
  let _storageKey = null

  /** @type {boolean} Whether initialized */
  let _initialized = false

  /** @type {Array<{method: string, args: Array}>} Log buffer queue before initialization */
  let _pendingQueue = []

  /** @type {boolean} Whether log buffering is enabled (buffer before init, flush after init) */
  let _bufferEnabled = true

  /* ═══════════════════════════════════════════════════════════════════════════
     Internal Helpers
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * Determine whether to output logs now
   * @returns {boolean}
   */
  function _shouldLog() {
    return _devMode === true
  }

  /**
   * Safely format log arguments
   * @param {Array} args
   * @returns {Array}
   */
  function _safeArgs(args) {
    try {
      return Array.prototype.slice.call(args)
    } catch (_) {
      return ['[LoggerUtils] Argument cannot be serialized']
    }
  }

  /**
   * Drain buffered log queue from before initialization
   */
  function _flushQueue() {
    if (!_pendingQueue.length) return
    var queue = _pendingQueue
    _pendingQueue = []
    for (var i = 0; i < queue.length; i++) {
      var entry = queue[i]
      _writeLog(entry.method, entry.args)
    }
  }

  /**
   * Perform actual log writing
   * @param {string} method - console method name
   * @param {Array} args - log arguments
   */
  function _writeLog(method, args) {
    if (!_shouldLog()) return
    var safe = _safeArgs(args)
    var prefix = '[YiPet]'
    if (method === 'error') {
      console.error(prefix, safe)
    } else if (method === 'warn') {
      console.warn(prefix, safe)
    } else if (method === 'info') {
      console.info(prefix, safe)
    } else if (method === 'debug') {
      console.debug(prefix, safe)
    } else if (method === 'group') {
      console.group(prefix, safe)
    } else if (method === 'groupEnd') {
      console.groupEnd()
    } else if (method === 'table') {
      console.table(safe[0], safe[1])
    } else if (method === 'trace') {
      console.trace(prefix, safe)
    } else if (method === 'time') {
      console.time(safe[0])
    } else if (method === 'timeEnd') {
      console.timeEnd(safe[0])
    } else {
      console.log(prefix, safe)
    }
  }

  /**
   * Generic log output method
   * @param {string} method
   * @param {Array} args
   */
  function _log(method, args) {
    if (!_initialized && _bufferEnabled) {
      _pendingQueue.push({ method: method, args: _safeArgs(args) })
      return
    }
    _writeLog(method, args)
  }

  /**
   * Asynchronously read devMode state from Chrome Storage
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  function _readDevModeFromStorage(key) {
    return new Promise(function (resolve) {
      try {
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
          resolve(false)
          return
        }
        chrome.storage.local.get([key], function (result) {
          if (chrome.runtime.lastError) {
            resolve(false)
            return
          }
          var val = result[key]
          resolve(val === true || val === 'true' || val === 1 || val === '1')
        })
      } catch (_) {
        resolve(false)
      }
    })
  }

  /**
   * Watch for real-time changes to devMode in Chrome Storage
   * @param {string} key
   */
  function _watchStorageChanges(key) {
    try {
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.onChanged) return
      chrome.storage.onChanged.addListener(function (changes, areaName) {
        if (areaName !== 'local') return
        if (!changes[key]) return
        var newVal = changes[key].newValue
        _devMode = (newVal === true || newVal === 'true' || newVal === 1 || newVal === '1')
      })
    } catch (_) {}
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     Public API
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * LoggerUtils main object
   * @namespace LoggerUtils
   */
  var LoggerUtils = {
    /* ── Initialization ──────────────────────────────────────────────────────── */

    /**
     * Initialize the silent logger
     *
     * @param {string} [storageKey='petDevMode'] - Key name for devMode in Chrome Storage
     * @param {boolean} [fallbackDevMode=false] - Default value when storage is unavailable
     * @param {Object} [options] - Optional config
     * @param {boolean} [options.buffer=true] - Whether to buffer logs before initialization
     * @returns {Promise<LoggerUtils>} Returns self to support chained calls
     *
     * @example
     *   // Basic usage
     *   LoggerUtils.initMuteLogger('petDevMode', false)
     *
     *   // With options
     *   LoggerUtils.initMuteLogger('petDevMode', false, { buffer: true })
     *
     *   // Promise chained call
     *   LoggerUtils.initMuteLogger('petDevMode', false).then(function (logger) {
     *     logger.log('Initialization complete')
     *   })
     */
    initMuteLogger: function (storageKey, fallbackDevMode, options) {
      if (_initialized) return Promise.resolve(LoggerUtils)

      _storageKey = storageKey || 'petDevMode'
      _devMode = !!fallbackDevMode

      if (options && typeof options.buffer === 'boolean') {
        _bufferEnabled = options.buffer
      }

      var self = this

      return _readDevModeFromStorage(_storageKey).then(function (storedValue) {
        _devMode = storedValue
        _initialized = true
        _watchStorageChanges(_storageKey)
        _flushQueue()
        return LoggerUtils
      }).catch(function () {
        _initialized = true
        _flushQueue()
        return LoggerUtils
      })
    },

    /* ── Mode Control ────────────────────────────────────────────────────────── */

    /**
     * Manually set devMode state (overrides auto-detection)
     * @param {boolean} enabled
     */
    setDevMode: function (enabled) {
      _devMode = !!enabled
      if (!_initialized) _initialized = true
      if (_devMode) _flushQueue()
    },

    /**
     * Get current devMode state
     * @returns {boolean}
     */
    isDevMode: function () {
      return _devMode
    },

    /**
     * Get initialization state
     * @returns {boolean}
     */
    isInitialized: function () {
      return _initialized
    },

    /* ── Log Methods ─────────────────────────────────────────────────────────── */

    /**
     * Plain log (devMode only)
     * @param {...*} args - Arbitrary log arguments
     */
    log: function () {
      _log('log', arguments)
    },

    /**
     * Info log (devMode only)
     * @param {...*} args
     */
    info: function () {
      _log('info', arguments)
    },

    /**
     * Warning log (devMode only)
     * @param {...*} args
     */
    warn: function () {
      _log('warn', arguments)
    },

    /**
     * Error log (devMode only)
     * @param {...*} args
     */
    error: function () {
      _log('error', arguments)
    },

    /**
     * Debug log (devMode only)
     * @param {...*} args
     */
    debug: function () {
      _log('debug', arguments)
    },

    /**
     * Group log (devMode only)
     * @param {...*} args
     */
    group: function () {
      _log('group', arguments)
    },

    /**
     * End group (devMode only)
     */
    groupEnd: function () {
      _log('groupEnd', [])
    },

    /**
     * Table log (devMode only)
     * @param {*} data - Table data
     * @param {Array<string>} [columns] - Columns to display
     */
    table: function (data, columns) {
      _log('table', [data, columns])
    },

    /**
     * Stack trace (devMode only)
     * @param {...*} args
     */
    trace: function () {
      _log('trace', arguments)
    },

    /**
     * Timer start (devMode only)
     * @param {string} label
     */
    time: function (label) {
      _log('time', [label])
    },

    /**
     * Timer end (devMode only)
     * @param {string} label
     */
    timeEnd: function (label) {
      _log('timeEnd', [label])
    },

    /* ── Conditional Logs ─────────────────────────────────────────────────────── */

    /**
     * Conditional log: only output when condition is true
     * @param {boolean} condition
     * @param {...*} args
     */
    logIf: function (condition) {
      if (!condition) return
      _log('log', Array.prototype.slice.call(arguments, 1))
    },

    /**
     * Assertion log: output error when condition is false
     * @param {boolean} condition
     * @param {string} message
     * @param {...*} args
     */
    assert: function (condition, message) {
      if (condition) return
      var extra = Array.prototype.slice.call(arguments, 2)
      _log('error', ['[ASSERT] ' + (message || 'Assertion failed')].concat(extra))
    },

    /* ── Utility Methods ──────────────────────────────────────────────────────── */

    /**
     * Create a namespaced sub-logger
     * @param {string} namespace - Sub-namespace
     * @returns {Object} Sub-logger with log/info/warn/error/debug methods
     *
     * @example
     *   var apiLogger = LoggerUtils.createNamespace('API')
     *   apiLogger.log('Request sent') // [YiPet][API] Request sent
     */
    createNamespace: function (namespace) {
      var ns = '[' + String(namespace || '') + ']'
      var self = this
      return {
        log: function () {
          var args = [ns].concat(Array.prototype.slice.call(arguments))
          self.log.apply(self, args)
        },
        info: function () {
          var args = [ns].concat(Array.prototype.slice.call(arguments))
          self.info.apply(self, args)
        },
        warn: function () {
          var args = [ns].concat(Array.prototype.slice.call(arguments))
          self.warn.apply(self, args)
        },
        error: function () {
          var args = [ns].concat(Array.prototype.slice.call(arguments))
          self.error.apply(self, args)
        },
        debug: function () {
          var args = [ns].concat(Array.prototype.slice.call(arguments))
          self.debug.apply(self, args)
        }
      }
    },

    /**
     * Get the length of the buffer queue (for debugging)
     * @returns {number}
     */
    getPendingCount: function () {
      return _pendingQueue.length
    },

    /**
     * Clear the buffer queue (discard unflushed logs)
     */
    clearPending: function () {
      _pendingQueue = []
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     Internal helpers exposed for console debugging
     ═══════════════════════════════════════════════════════════════════════════ */

  LoggerUtils._shouldLog = _shouldLog
  LoggerUtils._safeArgs = _safeArgs
  LoggerUtils._flushQueue = _flushQueue
  LoggerUtils._writeLog = _writeLog
  LoggerUtils._log = _log
  LoggerUtils._readDevModeFromStorage = _readDevModeFromStorage
  LoggerUtils._watchStorageChanges = _watchStorageChanges

  /* ═══════════════════════════════════════════════════════════════════════════
     Global Export
     ═══════════════════════════════════════════════════════════════════════════ */

  root.LoggerUtils = LoggerUtils
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : window)
