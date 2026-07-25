/**
 * HTTP Logger — HTTP 请求/响应日志记录器
 *
 * 专用的 HTTP 层日志工具，提供：
 *   1. 分级日志输出 (LOG_LEVELS: DEBUG/INFO/WARN/ERROR/NONE)
 *   2. 请求/响应拦截日志
 *   3. 性能计时
 *   4. 日志格式化
 *
 * 全局导出:
 *   window.Logger — 主日志实例
 *   window.LOG_LEVELS — 日志级别枚举
 *   window.LoggerUtils — 工具方法集合
 *
 * @module http/logger
 * @since 1.0.0
 */

;(function (root) {
  'use strict'

  /* ═══════════════════════════════════════════════════════════════════════════
     Log Levels
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * 日志级别（数值越小越详细）
   * @enum {number}
   */
  var LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4
  }

  /** @type {number} 当前日志级别 */
  var _currentLevel = LOG_LEVELS.INFO

  /** @type {boolean} 是否启用性能计时 */
  var _timingEnabled = true

  /** @type {Object<string, number>} 计时器存储 */
  var _timers = {}

  /* ═══════════════════════════════════════════════════════════════════════════
     Logger Class
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * 创建一个带命名空间的 Logger 实例
   *
   * @param {string} namespace - 命名空间（通常为模块名）
   * @param {Object} [options]
   * @param {number} [options.level] - 初始日志级别
   *
   * @example
   *   var log = new Logger('HTTP')
   *   log.info('请求开始', { url: '/api/data' })
   *   log.error('请求失败', error)
   */
  function Logger(namespace, options) {
    if (!(this instanceof Logger)) {
      return new Logger(namespace, options)
    }

    this._namespace = String(namespace || 'YiPet')
    this._level = (options && typeof options.level === 'number') ? options.level : _currentLevel

    // 为每个实例创建绑定的方法
    var self = this
    this.debug = this.debug.bind(this)
    this.info = this.info.bind(this)
    this.warn = this.warn.bind(this)
    this.error = this.error.bind(this)
  }

  Logger.prototype = {
    /**
     * 设置日志级别
     * @param {number} level
     */
    setLevel: function (level) {
      this._level = level
    },

    /**
     * 获取当前日志级别
     * @returns {number}
     */
    getLevel: function () {
      return this._level
    },

    /**
     * DEBUG 日志
     * @param {string} message
     * @param {*} [data]
     */
    debug: function (message, data) {
      this._log(LOG_LEVELS.DEBUG, 'DEBUG', message, data)
    },

    /**
     * INFO 日志
     * @param {string} message
     * @param {*} [data]
     */
    info: function (message, data) {
      this._log(LOG_LEVELS.INFO, 'INFO', message, data)
    },

    /**
     * WARN 日志
     * @param {string} message
     * @param {*} [data]
     */
    warn: function (message, data) {
      this._log(LOG_LEVELS.WARN, 'WARN', message, data)
    },

    /**
     * ERROR 日志
     * @param {string} message
     * @param {*} [data]
     */
    error: function (message, data) {
      this._log(LOG_LEVELS.ERROR, 'ERROR', message, data)
    },

    /**
     * 记录 HTTP 请求
     * @param {string} method - HTTP 方法
     * @param {string} url - 请求 URL
     * @param {Object} [options] - 请求选项
     */
    request: function (method, url, options) {
      if (this._level > LOG_LEVELS.INFO) return
      var prefix = '→ ' + method.toUpperCase()
      var logArgs = ['%c[' + this._namespace + '] %c' + prefix + ' %c' + url, _style('purple'), _style('blue'), _style('')]
      if (options && options.body && this._level <= LOG_LEVELS.DEBUG) {
        logArgs.push('\nBody:', _truncateBody(options.body))
      }
      console.log.apply(console, logArgs)
    },

    /**
     * 记录 HTTP 响应
     * @param {string} method
     * @param {string} url
     * @param {number} status
     * @param {number} duration - 请求耗时 (ms)
     * @param {*} [data]
     */
    response: function (method, url, status, duration, data) {
      if (this._level > LOG_LEVELS.INFO) return
      var isOk = status >= 200 && status < 400
      var color = isOk ? 'green' : 'red'
      var prefix = '← ' + method.toUpperCase() + ' ' + status
      var logArgs = ['%c[' + this._namespace + '] %c' + prefix + ' %c' + duration + 'ms %c' + url,
        _style('purple'), _style(color), _style('gray'), _style('')]
      if (!isOk && data && this._level <= LOG_LEVELS.DEBUG) {
        logArgs.push('\nResponse:', data)
      }
      console.log.apply(console, logArgs)
    },

    /**
     * 开始计时
     * @param {string} label
     */
    timeStart: function (label) {
      if (!_timingEnabled || this._level > LOG_LEVELS.DEBUG) return
      _timers[label] = performance.now()
    },

    /**
     * 结束计时并输出耗时
     * @param {string} label
     * @returns {number} 耗时 (ms)
     */
    timeEnd: function (label) {
      if (!_timingEnabled || this._level > LOG_LEVELS.DEBUG) return 0
      var start = _timers[label]
      if (!start) return 0
      var elapsed = Math.round((performance.now() - start) * 100) / 100
      delete _timers[label]
      console.log('%c[' + this._namespace + '] %c⏱ ' + label + ': %c' + elapsed + 'ms',
        _style('purple'), _style(''), _style('gray'))
      return elapsed
    },

    /**
     * 创建子 logger（嵌套命名空间）
     * @param {string} subNamespace
     * @returns {Logger}
     */
    child: function (subNamespace) {
      return new Logger(this._namespace + ':' + subNamespace, { level: this._level })
    },

    /**
     * 内部日志输出方法
     * @private
     */
    _log: function (level, levelName, message, data) {
      if (level < this._level) return

      var timestamp = new Date().toISOString().substring(11, 23)
      var prefix = '[' + timestamp + '] [' + this._namespace + '] ' + levelName + ': ' + message

      if (data !== undefined) {
        if (level === LOG_LEVELS.ERROR) {
          console.error(prefix, data)
        } else if (level === LOG_LEVELS.WARN) {
          console.warn(prefix, data)
        } else {
          console.log(prefix, data)
        }
      } else {
        if (level === LOG_LEVELS.ERROR) {
          console.error(prefix)
        } else if (level === LOG_LEVELS.WARN) {
          console.warn(prefix)
        } else {
          console.log(prefix)
        }
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     Helpers
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * CSS 样式辅助
   * @param {string} color
   * @returns {string}
   */
  function _style(color) {
    var styles = {
      purple: 'color: #a855f7; font-weight: bold',
      blue: 'color: #3b82f6; font-weight: bold',
      green: 'color: #22c55e; font-weight: bold',
      red: 'color: #ef4444; font-weight: bold',
      gray: 'color: #6b7280',
      '': ''
    }
    return styles[color] || ''
  }

  /**
   * 截断请求体用于日志展示（避免日志过长）
   * @param {*} body
   * @returns {string}
   */
  function _truncateBody(body) {
    try {
      var str = typeof body === 'string' ? body : JSON.stringify(body)
      if (str.length > 500) return str.substring(0, 500) + '...[truncated ' + (str.length - 500) + ' chars]'
      return str
    } catch (_) {
      return '[无法序列化的请求体]'
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     LoggerUtils (HTTP context)
     ═══════════════════════════════════════════════════════════════════════════ */

  var LoggerUtils = {
    /**
     * 设置全局日志级别
     * @param {number} level
     */
    setGlobalLevel: function (level) {
      _currentLevel = level
    },

    /**
     * 获取全局日志级别
     * @returns {number}
     */
    getGlobalLevel: function () {
      return _currentLevel
    },

    /**
     * 启用/禁用性能计时
     * @param {boolean} enabled
     */
    setTimingEnabled: function (enabled) {
      _timingEnabled = !!enabled
    },

    /**
     * 创建新的 Logger 实例
     * @param {string} namespace
     * @param {Object} [options]
     * @returns {Logger}
     */
    createLogger: function (namespace, options) {
      return new Logger(namespace, options)
    },

    /**
     * 获取日志级别名称
     * @param {number} level
     * @returns {string}
     */
    getLevelName: function (level) {
      var names = { 0: 'DEBUG', 1: 'INFO', 2: 'WARN', 3: 'ERROR', 4: 'NONE' }
      return names[level] || 'UNKNOWN'
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     Global Export
     ═══════════════════════════════════════════════════════════════════════════ */

  root.LOG_LEVELS = LOG_LEVELS
  root.Logger = Logger
  root.LoggerUtils = LoggerUtils
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : window)
