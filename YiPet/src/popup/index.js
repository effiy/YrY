/**
 * YiPet Popup — React Component
 *
 * Chrome extension popup for controlling the YiPet companion.
 * Communicates with the active tab's content script via
 * chrome.tabs.sendMessage and persists state to chrome.storage.local.
 *
 * Architecture:
 *   Services  (services/*.js)  — Chrome API, connection, notifications
 *   Config    (data.js)        — adapted from PET_CONFIG
 *   Component (this file)      — UI rendering, state orchestration
 *
 * Dependencies (loaded before this file):
 *   /cdn/vendor/react@15.6.1/react.min.js      → window.React
 *   /cdn/vendor/react@15.6.1/react-dom.min.js   → window.ReactDOM
 *   ../config/pet.config.js                     → window.PET_CONFIG
 *   ./data.js                                   → window.YIPET_POPUP
 *   ./services/notification.js                  → window.YiPetPopup.services.notification
 *   ./services/chromeService.js                 → window.YiPetPopup.services.chromeService
 *   ./services/connectionManager.js             → window.YiPetPopup.services.connectionManager
 */
;(function () {
  'use strict'

  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') return

  /* ═══════════════════════════════════════════════════════════════════════════
     Shorthands & Constants
     ═══════════════════════════════════════════════════════════════════════════ */

  var e = React.createElement

  var D     = window.YIPET_POPUP || {}
  var SVCS  = (window.YiPetPopup && window.YiPetPopup.services) || {}

  var ROLES      = D.ROLES      || ['教师', '医生', '甜品师', '警察']
  var COLORS     = D.COLORS     || []
  var SIZE       = D.SIZE       || { MIN: 80, MAX: 400, STEP: 10 }
  var TIMING     = D.TIMING     || { NOTIFICATION_DURATION: 3000, CONNECT_RETRY_MAX: 3, CONNECT_RETRY_BASE_MS: 500 }
  var STATUS_DOT = D.STATUS_DOT || { ACTIVE: '#22c55e', INACTIVE: '#f59e0b' }
  var MSG        = D.MSG        || {}
  var DEFAULTS   = D.DEFAULTS   || { VISIBLE: false, SIZE: 260, ROLE: '教师', COLOR: 0, MODEL: null, VERSION: '1.1.2' }
  var STORAGE_KEY = D.STORAGE_KEY || 'pet_global_state'

  /* ═══════════════════════════════════════════════════════════════════════════
     Sub-Components  (pure functions — props in, elements out)
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * AppHeader — logo, brand, model name, and status indicator.
   * @param {{ model: string|null, visible: boolean, statusText: string }} props
   */
  function AppHeader(props) {
    var dotColor = props.visible ? STATUS_DOT.ACTIVE : STATUS_DOT.INACTIVE

    return e('header', { className: 'header' },
      e('div', { className: 'logo', 'data-icon': '💕' },
        e('div', { className: 'brand' },
          e('h1', null, '温柔陪伴'),
          e('span', { className: 'brand-sub' }, '模型：' + (props.model || '-'))
        )
      ),
      e('div', {
        className: 'status-indicator',
        role: 'status',
        'aria-live': 'polite',
        style: { '--status-dot-color': dotColor }
      },
        e('span', { className: 'status-text' }, props.statusText)
      )
    )
  }

  /**
   * SettingsCard — wrapper with a coloured left-accent title.
   * @param {{ children: * }} props
   */
  function SettingsCard(props) {
    return e('section', { className: 'card' },
      e('h2', { className: 'card-title' }, '宠物设置'),
      e('div', { className: 'setting-list' }, props.children)
    )
  }

  /**
   * SwitchRow — labelled toggle switch.
   * @param {{ label: string, desc: string, checked: boolean, disabled: boolean, onChange: Function }} props
   */
  function SwitchRow(props) {
    return e('div', { className: 'setting-row', key: 'visible' },
      e('div', { className: 'setting-meta' },
        e('span', { className: 'setting-label-inline' }, props.label),
        e('span', { className: 'setting-desc' }, props.desc)
      ),
      e('label', { className: 'switch' },
        e('input', {
          type: 'checkbox',
          className: 'switch-input',
          checked: props.checked,
          disabled: props.disabled,
          onChange: props.onChange
        }),
        e('span', { className: 'switch-track' })
      )
    )
  }

  /**
   * SliderRow — range slider with live value display.
   * @param {{ label: string, id: string, value: number, min: number, max: number, step: number, disabled: boolean, onInput: Function, onChange: Function }} props
   */
  function SliderRow(props) {
    return e('div', { className: 'setting-row', key: 'size' },
      e('label', { className: 'setting-label-inline', htmlFor: props.id }, props.label),
      e('div', { className: 'slider-row' },
        e('input', {
          id: props.id,
          className: 'slider',
          type: 'range',
          min: props.min,
          max: props.max,
          step: props.step,
          value: props.value,
          disabled: props.disabled,
          onInput: props.onInput,
          onChange: props.onChange
        }),
        e('output', { className: 'value-pill', htmlFor: props.id }, props.value + 'px')
      )
    )
  }

  /**
   * SelectRow — labelled dropdown.
   * @param {{ label: string, id: string, value: string|number, disabled: boolean, onChange: Function, options: Array<{value: string|number, label: string}>, children?: * }} props
   */
  function SelectRow(props) {
    return e('div', { className: 'setting-row', key: props.id },
      e('label', { className: 'setting-label-inline', htmlFor: props.id }, props.label),
      e('div', { className: 'role-control' },
        e('select', {
          id: props.id,
          className: 'select',
          value: props.value,
          disabled: props.disabled,
          onChange: props.onChange
        }, (props.options || []).map(function (opt) {
          return e('option', { key: opt.value, value: opt.value }, opt.label)
        }))
      )
    )
  }

  /**
   * Notification — toast banner (conditional).
   * @param {{ visible: boolean, message: string, type: string }} props
   */
  function Notification(props) {
    if (!props.visible) return null
    var cls = 'notification ' + (props.type || 'info')
    return e('div', { className: 'notification-area' },
      e('div', { className: cls }, props.message)
    )
  }

  /**
   * AppFooter — hint text and version badge.
   * @param {{ hintText: string, version: string }} props
   */
  function AppFooter(props) {
    return e('footer', { className: 'footer' },
      e('p', { className: 'hint-text' }, props.hintText),
      e('span', { className: 'version-badge' }, props.version)
    )
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     Popup Component
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * Root popup component — state owner and action orchestrator.
   *
   * @constructor
   * @param {Object} props
   */
  function Popup(props) {
    React.Component.call(this, props)

    this.state = {
      visible:         DEFAULTS.VISIBLE,
      size:            DEFAULTS.SIZE,
      role:            DEFAULTS.ROLE,
      color:           DEFAULTS.COLOR,
      model:           DEFAULTS.MODEL,
      displaySize:     DEFAULTS.SIZE,
      controlsEnabled: false,
      hintText:        MSG.CONNECTING || '连接中…',
      notification:    { visible: false, message: '', type: 'info' }
    }

    // Mutable refs (not state — changes don't trigger re-render)
    this._tabRef    = { current: null }
    this._timerRef  = { current: null }

    // Service instances (bound to this popup)
    this._chrome  = SVCS.chromeService  ? SVCS.chromeService.createService(this._tabRef)  : null
    this._notify  = SVCS.notification   ? SVCS.notification.createController(this, this._timerRef) : null

    // Bind handlers
    this._toggleVisibility = this._toggleVisibility.bind(this)
    this._previewSize      = this._previewSize.bind(this)
    this._updateSize       = this._updateSize.bind(this)
    this._updateRole       = this._updateRole.bind(this)
    this._updateColor      = this._updateColor.bind(this)
  }

  Popup.prototype = Object.create(React.Component.prototype)
  Popup.prototype.constructor = Popup
  Popup.displayName = 'Popup'

  /* ── Internal helpers ─────────────────────────────────────────────── */

  /**
   * Clamp a value within SIZE.MIN … SIZE.MAX.
   * @param {*} raw
   * @returns {number}
   */
  Popup.prototype._clamp = function (raw) {
    var v = Number(raw)
    if (isNaN(v)) return SIZE.MIN
    return v < SIZE.MIN ? SIZE.MIN : v > SIZE.MAX ? SIZE.MAX : v
  }

  /* ── Actions ──────────────────────────────────────────────────────── */

  /** Toggle pet visibility on the active tab. */
  Popup.prototype._toggleVisibility = function () {
    var self = this
    var chrome = this._chrome
    var notify = this._notify
    if (!chrome) return

    chrome.sendMessage({ action: 'toggleVisibility' }).then(function (response) {
      if (!response || response.success === false) {
        if (notify) notify.show(MSG.OP_FAILED || '操作失败', 'error')
        return
      }
      var next = response.visible !== undefined ? response.visible : !self.state.visible
      self.setState({ visible: next }, function () {
        if (chrome) chrome.saveState(self.state)
        if (notify) notify.show(
          next ? (MSG.SHOWN || '已显示') : (MSG.HIDDEN || '已隐藏'),
          'success'
        )
      })
    })
  }

  /**
   * Preview size from range slider drag (no persistence).
   * @param {Event} event
   */
  Popup.prototype._previewSize = function (event) {
    var v = parseInt(event.target.value, 10)
    if (!isNaN(v)) this.setState({ displaySize: v })
  }

  /**
   * Commit size change to content script.
   * @param {Event} event
   */
  Popup.prototype._updateSize = function (event) {
    var self = this
    var chrome = this._chrome
    var notify = this._notify
    var v = this._clamp(parseInt(event.target.value, 10))
    if (!chrome) return

    this.setState({ displaySize: v })
    chrome.sendMessage({ action: 'changeSize', size: v }).then(function (response) {
      if (!response || response.success === false) {
        if (notify) notify.show(MSG.OP_FAILED || '操作失败', 'error')
        return
      }
      self.setState({ size: response.size !== undefined ? response.size : v }, function () {
        chrome.saveState(self.state)
        if (notify) notify.show(MSG.SIZE_UPDATED || '大小已更新', 'success')
      })
    })
  }

  /**
   * Change pet role and notify content script.
   * @param {Event} event
   */
  Popup.prototype._updateRole = function (event) {
    var self = this
    var chrome = this._chrome
    var notify = this._notify
    var role = String(event.target.value || DEFAULTS.ROLE).trim()
    if (!chrome) return

    this.setState({ role: role })
    chrome.sendMessage({ action: 'setRole', role: role }).then(function (response) {
      if (!response || response.success === false) {
        if (notify) notify.show(MSG.OP_FAILED || '操作失败', 'error')
        return
      }
      self.setState({ role: response.role || role }, function () {
        chrome.saveState(self.state)
        if (notify) notify.show(MSG.ROLE_CHANGED || '角色已切换', 'success')
      })
    })
  }

  /**
   * Change pet colour theme and notify content script.
   * @param {Event} event
   */
  Popup.prototype._updateColor = function (event) {
    var self = this
    var chrome = this._chrome
    var notify = this._notify
    var idx = parseInt(event.target.value, 10)
    if (isNaN(idx) || !chrome) return

    this.setState({ color: idx })
    chrome.sendMessage({ action: 'setColor', color: idx }).then(function (response) {
      if (response && response.success) {
        chrome.saveState(self.state)
        if (notify) notify.show(MSG.COLOR_SET || '颜色主题已设置', 'success')
      } else {
        if (notify) notify.show(MSG.OP_FAILED || '操作失败', 'error')
      }
    })
  }

  /* ── Lifecycle ────────────────────────────────────────────────────── */

  Popup.prototype.componentDidMount = function () {
    var self = this
    var chrome = this._chrome
    var notify = this._notify

    if (!chrome) {
      this.setState({
        controlsEnabled: true,
        hintText: (MSG.READY_OFFLINE || '准备就绪（离线）')
      })
      return
    }

    chrome.getActiveTab().then(function (tab) {
      if (!tab) {
        if (notify) notify.show(MSG.TAB_NOT_FOUND || '无法获取当前标签页', 'error')
        return
      }

      // Attempt connection with retry
      if (SVCS.connectionManager) {
        SVCS.connectionManager.connect({
          sendMessage: function (msg) { return chrome.sendMessage(msg) },
          loadState:   function ()    { return chrome.loadState() },
          onConnected: function (stored) {
            // Merge persisted state into component state
            if (stored) {
              var patch = {}
              if (stored.visible !== undefined) patch.visible = stored.visible
              if (stored.size !== undefined)    { patch.size = stored.size; patch.displaySize = stored.size }
              if (stored.role !== undefined)    patch.role  = stored.role
              if (stored.color !== undefined)   patch.color = stored.color
              if (stored.model !== undefined)   patch.model = stored.model

              if (Object.keys(patch).length) self.setState(patch)
            }
            self.setState({
              controlsEnabled: true,
              hintText: MSG.READY || '准备就绪'
            })
          },
          onFailed: function () {
            if (notify) notify.show(MSG.CS_NOT_READY || 'Content Script 未就绪', 'error')
            self.setState({
              controlsEnabled: true,
              hintText: MSG.READY_OFFLINE || '准备就绪（离线）'
            })
          }
        })
      }
    }).catch(function (err) {
      console.error('[YiPet Popup] chrome.tabs.query failed:', err.message)
      if (notify) notify.show(MSG.INIT_FAILED || '初始化失败', 'error')
    })
  }

  Popup.prototype.componentWillUnmount = function () {
    // Only clear the timer — skip setState since the component is unmounting
    if (this._timerRef.current) {
      clearTimeout(this._timerRef.current)
      this._timerRef.current = null
    }
  }

  /* ── Render ───────────────────────────────────────────────────────── */

  Popup.prototype.render = function () {
    var state = this.state
    var s = state.notification
    var disabled = !state.controlsEnabled

    var statusText = state.visible
      ? (MSG.ACTIVE || '已激活')
      : (MSG.HIDDEN || '已隐藏')

    var mainClass = 'main-content' + (disabled ? ' popup-controls-disabled' : '')

    return e('div', { className: 'popup-container' },

      e(AppHeader, {
        model:      state.model,
        visible:    state.visible,
        statusText: statusText
      }),

      e('main', { className: mainClass },
        e(SettingsCard, null,

          e(SwitchRow, {
            label:    '显示宠物',
            desc:     '在当前标签页显示/隐藏',
            checked:  state.visible,
            disabled: disabled,
            onChange: this._toggleVisibility
          }),

          e(SliderRow, {
            label:    '大小',
            id:       'sizeSlider',
            value:    state.displaySize,
            min:      SIZE.MIN,
            max:      SIZE.MAX,
            step:     SIZE.STEP,
            disabled: disabled,
            onInput:  this._previewSize,
            onChange: this._updateSize
          }),

          e(SelectRow, {
            label:    '角色',
            id:       'roleSelect',
            value:    state.role,
            disabled: disabled,
            onChange: this._updateRole,
            options:  ROLES.map(function (r) { return { value: r, label: r } })
          }),

          e(SelectRow, {
            label:    '颜色主题',
            id:       'colorSelect',
            value:    state.color,
            disabled: disabled,
            onChange: this._updateColor,
            options:  COLORS
          })
        )
      ),

      e(AppFooter, {
        hintText: state.hintText,
        version:  DEFAULTS.VERSION || 'v1.1.2'
      }),

      e(Notification, {
        visible: s.visible,
        message: s.message,
        type:    s.type
      })
    )
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     Bootstrap
     ═══════════════════════════════════════════════════════════════════════════ */

  ReactDOM.render(
    React.createElement(Popup),
    document.getElementById('app')
  )

})()
