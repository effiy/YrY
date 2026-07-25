/**
 * LoggerUtils — 静默日志工具
 *
 * 提供基于 devMode 开关的条件日志输出。当 devMode 开启时正常输出日志，
 * 关闭时静默所有日志（生产模式），避免在用户浏览器控制台产生噪音。
 *
 * 全局导出: window.LoggerUtils
 *
 * 使用示例:
 *   LoggerUtils.initMuteLogger('petDevMode', false)
 *   LoggerUtils.log('这条日志仅在 devMode 下输出')
 *   LoggerUtils.warn('警告信息')
 *   LoggerUtils.error('错误信息', err)
 *
 * @module core/logger
 * @since 1.0.0
 */

;(function (root) {
  'use strict'

  /* ═══════════════════════════════════════════════════════════════════════════
     Private State
     ═══════════════════════════════════════════════════════════════════════════ */

  /** @type {boolean} 是否处于开发模式 */
  let _devMode = false

  /** @type {string|null} Chrome Storage 中存储 devMode 的键名 */
  let _storageKey = null

  /** @type {boolean} 是否已初始化 */
  let _initialized = false

  /** @type {Array<{method: string, args: Array}>} 初始化前的日志缓存队列 */
  let _pendingQueue = []

  /** @type {boolean} 是否启用日志缓存（初始化前缓存，初始化后批量输出） */
  let _bufferEnabled = true

  /* ═══════════════════════════════════════════════════════════════════════════
     Internal Helpers
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * 判断当前是否应该输出日志
   * @returns {boolean}
   */
  function _shouldLog() {
    return _devMode === true
  }

  /**
   * 安全地格式化日志参数
   * @param {Array} args
   * @returns {Array}
   */
  function _safeArgs(args) {
    try {
      return Array.prototype.slice.call(args)
    } catch (_) {
      return ['[LoggerUtils] 无法序列化的参数']
    }
  }

  /**
   * 排空初始化前缓存的日志队列
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
   * 执行实际的日志写入
   * @param {string} method - console 方法名
   * @param {Array} args - 日志参数
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
   * 通用日志输出方法
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
   * 从 Chrome Storage 异步读取 devMode 状态
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
   * 监听 Chrome Storage 中 devMode 的实时变化
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
   * LoggerUtils 主对象
   * @namespace LoggerUtils
   */
  var LoggerUtils = {
    /* ── 初始化 ─────────────────────────────────────────────────────────────── */

    /**
     * 初始化静默日志器
     *
     * @param {string} [storageKey='petDevMode'] - Chrome Storage 中存储 devMode 的键名
     * @param {boolean} [fallbackDevMode=false] - 当无法读取 storage 时的默认值
     * @param {Object} [options] - 可选配置
     * @param {boolean} [options.buffer=true] - 是否缓存初始化前的日志
     * @returns {Promise<LoggerUtils>} 返回自身以支持链式调用
     *
     * @example
     *   // 基础用法
     *   LoggerUtils.initMuteLogger('petDevMode', false)
     *
     *   // 带选项
     *   LoggerUtils.initMuteLogger('petDevMode', false, { buffer: true })
     *
     *   // Promise 链式调用
     *   LoggerUtils.initMuteLogger('petDevMode', false).then(function (logger) {
     *     logger.log('初始化完成')
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

    /* ── 模式控制 ───────────────────────────────────────────────────────────── */

    /**
     * 手动设置 devMode 状态（覆盖自动检测）
     * @param {boolean} enabled
     */
    setDevMode: function (enabled) {
      _devMode = !!enabled
      if (!_initialized) _initialized = true
      if (_devMode) _flushQueue()
    },

    /**
     * 获取当前 devMode 状态
     * @returns {boolean}
     */
    isDevMode: function () {
      return _devMode
    },

    /**
     * 获取初始化状态
     * @returns {boolean}
     */
    isInitialized: function () {
      return _initialized
    },

    /* ── 日志方法 ───────────────────────────────────────────────────────────── */

    /**
     * 普通日志（仅 devMode）
     * @param {...*} args - 任意日志参数
     */
    log: function () {
      _log('log', arguments)
    },

    /**
     * 信息日志（仅 devMode）
     * @param {...*} args
     */
    info: function () {
      _log('info', arguments)
    },

    /**
     * 警告日志（仅 devMode）
     * @param {...*} args
     */
    warn: function () {
      _log('warn', arguments)
    },

    /**
     * 错误日志（仅 devMode）
     * @param {...*} args
     */
    error: function () {
      _log('error', arguments)
    },

    /**
     * 调试日志（仅 devMode）
     * @param {...*} args
     */
    debug: function () {
      _log('debug', arguments)
    },

    /**
     * 分组日志（仅 devMode）
     * @param {...*} args
     */
    group: function () {
      _log('group', arguments)
    },

    /**
     * 结束分组（仅 devMode）
     */
    groupEnd: function () {
      _log('groupEnd', [])
    },

    /**
     * 表格日志（仅 devMode）
     * @param {*} data - 表格数据
     * @param {Array<string>} [columns] - 显示的列
     */
    table: function (data, columns) {
      _log('table', [data, columns])
    },

    /**
     * 堆栈追踪（仅 devMode）
     * @param {...*} args
     */
    trace: function () {
      _log('trace', arguments)
    },

    /**
     * 计时开始（仅 devMode）
     * @param {string} label
     */
    time: function (label) {
      _log('time', [label])
    },

    /**
     * 计时结束（仅 devMode）
     * @param {string} label
     */
    timeEnd: function (label) {
      _log('timeEnd', [label])
    },

    /* ── 条件日志 ───────────────────────────────────────────────────────────── */

    /**
     * 条件日志：仅当 condition 为 true 时输出
     * @param {boolean} condition
     * @param {...*} args
     */
    logIf: function (condition) {
      if (!condition) return
      _log('log', Array.prototype.slice.call(arguments, 1))
    },

    /**
     * 断言日志：condition 为 false 时输出错误
     * @param {boolean} condition
     * @param {string} message
     * @param {...*} args
     */
    assert: function (condition, message) {
      if (condition) return
      var extra = Array.prototype.slice.call(arguments, 2)
      _log('error', ['[ASSERT] ' + (message || '断言失败')].concat(extra))
    },

    /* ── 工具方法 ───────────────────────────────────────────────────────────── */

    /**
     * 创建一个带命名空间的子 logger
     * @param {string} namespace - 子命名空间
     * @returns {Object} 具有 log/info/warn/error/debug 方法的子 logger
     *
     * @example
     *   var apiLogger = LoggerUtils.createNamespace('API')
     *   apiLogger.log('请求发送') // [YiPet][API] 请求发送
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
     * 获取缓存队列的长度（用于调试）
     * @returns {number}
     */
    getPendingCount: function () {
      return _pendingQueue.length
    },

    /**
     * 清空缓存队列（丢弃未输出的日志）
     */
    clearPending: function () {
      _pendingQueue = []
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     Internal Helpers — exposed for console debugging
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
