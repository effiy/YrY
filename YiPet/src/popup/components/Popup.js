/**
 * YiPet Popup — Root Container Component
 *
 * State-owner and action orchestrator for the Chrome extension popup.
 * Delegates rendering to presentational components in ui/*.js.
 *
 * Services are created via createPopupServices() — not directly from
 * the global namespace — enabling future dependency injection.
 *
 * Exports: window.YiPetPopup.components.Popup
 *
 * @module popup/components/Popup
 */
;(function (root) {
  'use strict'

  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') return

  var NS   = root.YiPetPopup = root.YiPetPopup || {}
  var CMP  = NS.components = NS.components || {}
  var SVCS = NS.services || {}

  var e = React.createElement

  var D        = root.YIPET_POPUP || {}
  var ROLES    = D.ROLES    || ['Teacher', 'Doctor', 'Pastry Chef', 'Police Officer']
  var COLORS   = D.COLORS   || []
  var SIZE     = D.SIZE     || { MIN: 80, MAX: 400, STEP: 10 }
  var MSG      = D.MSG      || {}
  var DEFAULTS = D.DEFAULTS || { VISIBLE: false, SIZE: 260, ROLE: 'Teacher', COLOR: 0, MODEL: null, VERSION: '1.1.2' }

  /* ═══════════════════════════════════════════════════════════════════════
     Service Factory
     ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Create service instances for a Popup component.
   * Returns null for each unavailable service (graceful degradation).
   *
   * @param {Object} ctx — { tabRef, timerRef, component }
   * @returns {{ chrome: Object|null, notify: Object|null }}
   */
  function createPopupServices(ctx) {
    return {
      chrome: SVCS.chromeService
        ? SVCS.chromeService.createService(ctx.tabRef)
        : null,
      notify: SVCS.notification
        ? SVCS.notification.createController(ctx.component, ctx.timerRef)
        : null
    }
  }

  /**
   * Restore persisted state keys from a stored object into a patch.
   * @param {Object} stored — raw stored state
   * @returns {Object} patch suitable for setState
   */
  function restoreStoredState(stored) {
    var KEYS = ['visible', 'size', 'role', 'color', 'model']
    var patch = {}
    KEYS.forEach(function (k) {
      if (stored[k] !== undefined) patch[k] = stored[k]
    })
    if ('size' in patch) patch.displaySize = patch.size
    return patch
  }

  /* ═══════════════════════════════════════════════════════════════════════
     Popup Component
     ═══════════════════════════════════════════════════════════════════════ */

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
      hintText:        MSG.CONNECTING || 'Connecting…',
      notification:    { visible: false, message: '', type: 'info' }
    }

    this._tabRef   = { current: null }
    this._timerRef = { current: null }

    var svc = createPopupServices({
      tabRef:    this._tabRef,
      timerRef:  this._timerRef,
      component: this
    })
    this._chrome = svc.chrome
    this._notify = svc.notify

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

  /* ── Helpers ─────────────────────────────────────────────────────────── */

  Popup.prototype._clamp = function (raw) {
    var v = Number(raw)
    if (isNaN(v)) return SIZE.MIN
    return v < SIZE.MIN ? SIZE.MIN : v > SIZE.MAX ? SIZE.MAX : v
  }

  /**
   * Generic message dispatch with optimistic update + notification.
   * @param {Object}   opts
   * @param {Object}   opts.msg          — { action, … } sent to content script
   * @param {string}   opts.okMsg        — success notification text
   * @param {Object}   [opts.optimistic] — state patch before sending
   * @param {Function} [opts.onOk]       — (response, state) → { statePatch, cb? }
   * @param {Function} [opts.onErr]      — (response) => void
   */
  Popup.prototype._send = function (opts) {
    var self = this
    if (!this._chrome) return

    if (opts.optimistic) this.setState(opts.optimistic)

    this._chrome.sendMessage(opts.msg).then(function (response) {
      if (!response || response.success === false) {
        if (self._notify) self._notify.show(MSG.OP_FAILED || 'Operation failed', 'error')
        if (opts.onErr) opts.onErr(response)
        return
      }

      var result = opts.onOk ? opts.onOk(response, self.state) : null
      var patch  = result ? (result.statePatch || result) : {}
      var cb     = result ? result.cb : null

      var saveAndNotify = function () {
        if (self._chrome) self._chrome.saveState(self.state)
        if (self._notify) self._notify.show(opts.okMsg, 'success')
      }

      if (Object.keys(patch).length) {
        self.setState(patch, cb || saveAndNotify)
      } else if (cb) {
        self.setState({}, function () { cb(); saveAndNotify() })
      } else {
        saveAndNotify()
      }
    })
  }

  /* ── Action handlers ─────────────────────────────────────────────────── */

  Popup.prototype._toggleVisibility = function () {
    var self = this
    this._send({
      msg:   { action: 'toggleVisibility' },
      okMsg: MSG.SHOWN || 'Shown',
      onOk: function (response) {
        var next = response.visible !== undefined ? response.visible : !self.state.visible
        return {
          statePatch: { visible: next },
          cb: function () {
            if (self._notify) self._notify.show(
              next ? (MSG.SHOWN || 'Shown') : (MSG.HIDDEN || 'Hidden'), 'success')
          }
        }
      }
    })
  }

  Popup.prototype._previewSize = function (event) {
    var v = parseInt(event.target.value, 10)
    if (!isNaN(v)) this.setState({ displaySize: v })
  }

  Popup.prototype._updateSize = function (event) {
    var v = this._clamp(parseInt(event.target.value, 10))
    this._send({
      msg:        { action: 'changeSize', size: v },
      okMsg:      MSG.SIZE_UPDATED || 'Size updated',
      optimistic: { displaySize: v },
      onOk: function (response) {
        return { statePatch: { size: response.size !== undefined ? response.size : v } }
      }
    })
  }

  Popup.prototype._updateRole = function (event) {
    var role = String(event.target.value || DEFAULTS.ROLE).trim()
    this._send({
      msg:        { action: 'setRole', role: role },
      okMsg:      MSG.ROLE_CHANGED || 'Role changed',
      optimistic: { role: role },
      onOk: function (response) {
        return { statePatch: { role: response.role || role } }
      }
    })
  }

  Popup.prototype._updateColor = function (event) {
    var idx = parseInt(event.target.value, 10)
    if (isNaN(idx)) return
    this._send({
      msg:        { action: 'setColor', color: idx },
      okMsg:      MSG.COLOR_SET || 'Color theme set',
      optimistic: { color: idx },
      onOk: function () { return {} }
    })
  }

  /* ── Lifecycle ───────────────────────────────────────────────────────── */

  Popup.prototype.componentDidMount = function () {
    var self = this

    if (!this._chrome) {
      this.setState({ controlsEnabled: true, hintText: MSG.READY_OFFLINE || 'Ready (Offline)' })
      return
    }

    this._chrome.getActiveTab().then(function (tab) {
      if (!tab) {
        if (self._notify) self._notify.show(MSG.TAB_NOT_FOUND || 'Cannot get current tab', 'error')
        return
      }

      if (SVCS.connectionManager) {
        SVCS.connectionManager.connect({
          sendMessage: function (msg) { return self._chrome.sendMessage(msg) },
          loadState:   function ()    { return self._chrome.loadState() },
          onConnected: function (stored) {
            if (stored) {
              var patch = restoreStoredState(stored)
              if (Object.keys(patch).length) self.setState(patch)
            }
            self.setState({ controlsEnabled: true, hintText: MSG.READY || 'Ready' })
          },
          onFailed: function () {
            if (self._notify) self._notify.show(MSG.CS_NOT_READY || 'Content Script not ready', 'error')
            self.setState({ controlsEnabled: true, hintText: MSG.READY_OFFLINE || 'Ready (Offline)' })
          }
        })
      }
    }).catch(function (err) {
      console.error('[YiPet Popup] chrome.tabs.query failed:', err.message)
      if (self._notify) self._notify.show(MSG.INIT_FAILED || 'Initialization failed', 'error')
    })
  }

  Popup.prototype.componentWillUnmount = function () {
    if (this._timerRef.current) {
      clearTimeout(this._timerRef.current)
      this._timerRef.current = null
    }
  }

  /* ── Render (delegated to private helpers) ───────────────────────────── */

  Popup.prototype._renderHeader = function (state) {
    return e(CMP.AppHeader, {
      model:      state.model,
      visible:    state.visible,
      statusText: state.visible ? (MSG.ACTIVE || 'Active') : (MSG.HIDDEN || 'Hidden')
    })
  }

  Popup.prototype._renderSettings = function (state, disabled) {
    return e('main', { className: 'main-content' + (disabled ? ' popup-controls-disabled' : '') },
      e(CMP.SettingsCard, null,
        e(CMP.SwitchRow, {
          label: 'Show Pet', desc: 'Show/hide on current tab',
          checked: state.visible, disabled: disabled,
          onChange: this._toggleVisibility
        }),
        e(CMP.SliderRow, {
          label: 'Size', id: 'sizeSlider',
          value: state.displaySize, min: SIZE.MIN, max: SIZE.MAX, step: SIZE.STEP,
          disabled: disabled,
          onInput: this._previewSize, onChange: this._updateSize
        }),
        e(CMP.SelectRow, {
          label: 'Role', id: 'roleSelect',
          value: state.role, disabled: disabled,
          onChange: this._updateRole,
          options: ROLES.map(function (r) { return { value: r, label: r } })
        }),
        e(CMP.SelectRow, {
          label: 'Color Theme', id: 'colorSelect',
          value: state.color, disabled: disabled,
          onChange: this._updateColor,
          options: COLORS
        })
      )
    )
  }

  Popup.prototype._renderFooter = function (state) {
    var s = state.notification
    return [
      e(CMP.AppFooter, { key: 'footer',
        hintText: state.hintText,
        version:  DEFAULTS.VERSION || 'v1.1.2'
      }),
      e(CMP.Notification, { key: 'notify',
        visible: s.visible,
        message: s.message,
        type:    s.type
      })
    ]
  }

  Popup.prototype.render = function () {
    var state    = this.state
    var disabled = !state.controlsEnabled

    return e('div', { className: 'popup-container' },
      this._renderHeader(state),
      this._renderSettings(state, disabled),
      this._renderFooter(state)
    )
  }

  CMP.Popup = Popup

})(typeof globalThis !== 'undefined' ? globalThis : window)
