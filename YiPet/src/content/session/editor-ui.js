;(function (global) {
  'use strict'

  if (typeof window === 'undefined' || typeof window.PetManager === 'undefined') {
    return
  }

  const proto = global.PetManager.prototype

  /* ═══════════════════ Context Editor (Vue Component) ═══════════════════ */

  proto._ensureContextEditorOverlay = function () {
    if (!this.chatWindow) return null
    const existing = document.getElementById('pet-context-editor')
    if (existing) return existing

    const overlay = document.createElement('div')
    overlay.id = 'pet-context-editor'

    const mountEl = document.createElement('div')
    overlay.appendChild(mountEl)

    const currentPosition = window.getComputedStyle(this.chatWindow).position
    if (currentPosition === 'static') {
      this.chatWindow.style.position = 'relative'
    }
    this.chatWindow.appendChild(overlay)

    return overlay
  }

  proto.ensureContextEditorUi = function () {
    if (!this.chatWindow) return
    const existing = document.getElementById('pet-context-editor')
    if (existing) return

    const overlay = this._ensureContextEditorOverlay()
    if (!overlay) return

    // 使用 ContextEditor Vue 组件（优先模板渲染，降级为 h()）
    const Vue = window.Vue || {}
    const { createApp, defineComponent } = Vue
    if (typeof createApp !== 'function' || typeof defineComponent !== 'function') return

    const Ctor = window.PetManager?.Components?.ContextEditor
    const canCreate = Ctor && typeof Ctor.createComponent === 'function'
    if (!canCreate) return

    ;(async () => {
      const useTemplate = (() => {
        const _u = window.PetManager?.Components?.ChatWindowUtils
        if (_u && typeof _u.canUseVueTemplate === 'function') return _u.canUseVueTemplate(Vue)
        if (typeof Vue?.compile !== 'function') return false
        try { Function('return 1')() } catch (_) { return false }
        return true
      })()

      if (useTemplate) {
        try { await Ctor.loadTemplate() } catch (_) {}
      }

      const component = Ctor.createComponent({ manager: this })
      if (!component) return

      overlay._vueApp = createApp(component)
      overlay._vueInstance = overlay._vueApp.mount(overlay.firstChild)
    })()
  }

  proto.openContextEditor = async function () {
    this.ensureContextEditorUi()
    const overlay = this.chatWindow ? this.chatWindow.querySelector('#pet-context-editor') : null
    if (!overlay) return

    overlay.classList.add('js-visible')
    this.updateContextEditorPosition()
    await this.loadContextIntoEditor()

    const textarea = this.chatWindow ? this.chatWindow.querySelector('#pet-context-editor-textarea') : null
    if (textarea) {
      textarea.removeAttribute('data-original-text')
      textarea.removeAttribute('data-undo-notification')
    }

    this._contextPreviewMode = this._contextPreviewMode || 'split'
    this.applyContextPreviewMode()
    this.chatWindow.classList.add('context-editor-open')

    this._contextKeydownHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeContextEditor()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        const saveBtn = this.chatWindow ? this.chatWindow.querySelector('#pet-context-save-btn') : null
        if (saveBtn && !saveBtn.hasAttribute('data-saving')) {
          saveBtn.click()
        }
      }
    }
    document.addEventListener('keydown', this._contextKeydownHandler, { capture: true })

    this._contextResizeHandler = () => this.updateContextEditorPosition()
    window.addEventListener('resize', this._contextResizeHandler, { passive: true })
  }

  proto.closeContextEditor = function () {
    const overlay = this.chatWindow ? this.chatWindow.querySelector('#pet-context-editor') : null
    if (overlay) overlay.classList.remove('js-visible')

    if (this.chatWindow) this.chatWindow.classList.remove('context-editor-open')

    if (this._contextKeydownHandler) {
      document.removeEventListener('keydown', this._contextKeydownHandler, { capture: true })
      this._contextKeydownHandler = null
    }
    if (this._contextResizeHandler) {
      window.removeEventListener('resize', this._contextResizeHandler)
      this._contextResizeHandler = null
    }
  }

  proto.setContextMode = function (mode) {
    this._contextPreviewMode = mode
    this.applyContextPreviewMode()
  }

  proto.applyContextPreviewMode = function () {
    if (!this.chatWindow) return
    const textarea = this.chatWindow.querySelector('#pet-context-editor-textarea')
    const preview = this.chatWindow.querySelector('#pet-context-preview')
    const btnSplit = this.chatWindow.querySelector('#pet-context-mode-split')
    const btnEdit = this.chatWindow.querySelector('#pet-context-mode-edit')
    const btnPreview = this.chatWindow.querySelector('#pet-context-mode-preview')
    const overlay = this.chatWindow.querySelector('#pet-context-editor')
    if (!textarea || !preview) return

    const mode = this._contextPreviewMode
    if (overlay) {
      overlay.setAttribute('data-mode', mode || 'split')
      const currentMainColor = this.getMainColorFromGradient(this.colors[this.colorIndex])
      overlay.style.setProperty('--pet-context-active-color', currentMainColor)
    }
    if (btnSplit) btnSplit.classList.toggle('is-active', mode === 'split')
    if (btnEdit) btnEdit.classList.toggle('is-active', mode === 'edit')
    if (btnPreview) btnPreview.classList.toggle('is-active', mode === 'preview')
  }

  proto.updateContextEditorPosition = function () {
    if (!this.chatWindow) return
    const overlay = this.chatWindow.querySelector('#pet-context-editor')
    if (!overlay) return
    const chatHeaderEl = this.chatWindow.querySelector('.chat-header')
    const headerH = chatHeaderEl ? chatHeaderEl.offsetHeight : 60
    overlay.style.setProperty('--pet-context-editor-top', `${headerH}px`)
  }

  proto._showSaveStatus = function (button, success, originalText) {
    if (success) {
      button.textContent = '✓'
      button.setAttribute('data-status', 'success')
    } else {
      button.textContent = '⚠️'
      button.setAttribute('data-status', 'error')
    }
    setTimeout(() => {
      button.textContent = originalText
      button.removeAttribute('data-status')
    }, 2000)
  }

  proto.showSessionContext = async function (sessionIdOrEvent, session) {
    let sessionId = null
    if (typeof sessionIdOrEvent === 'string') {
      sessionId = sessionIdOrEvent
    } else if (sessionIdOrEvent && session) {
      sessionId = session.key
    } else {
      console.warn('无效的参数，无法显示上下文')
      this.showNotification('无法显示上下文：参数无效', 'error')
      return
    }
    if (!sessionId) {
      console.warn('会话ID为空，无法显示上下文')
      this.showNotification('无法显示上下文：会话ID为空', 'error')
      return
    }
    if (!this.sessions || !this.sessions[sessionId]) {
      console.warn('会话不存在，无法显示上下文:', sessionId)
      this.showNotification('无法显示上下文：会话不存在', 'error')
      return
    }

    try {
      const waitFor = async (predicate, timeoutMs) => {
        const timeout = Math.max(0, Number(timeoutMs) || 0)
        const start = Date.now()
        while (true) {
          try { if (predicate()) return true } catch (_) {}
          if (timeout && Date.now() - start > timeout) return false
          await new Promise((r) => setTimeout(r, 30))
        }
      }

      if (this.currentSessionId !== sessionId) {
        if (typeof this.switchSession === 'function') {
          await this.switchSession(sessionId)
        } else if (typeof this.activateSession === 'function') {
          await this.activateSession(sessionId, { saveCurrent: false, updateConsistency: true, updateUI: true, syncToBackend: false })
        } else {
          this.currentSessionId = sessionId
        }
        const switched = await waitFor(() => this.currentSessionId === sessionId, 1500)
        if (!switched) throw new Error('会话切换超时')
        if (typeof this.fetchSessionPageContent === 'function') await this.fetchSessionPageContent(sessionId)
      } else {
        if (typeof this.fetchSessionPageContent === 'function') await this.fetchSessionPageContent(sessionId)
      }
      await this.openContextEditor()
    } catch (error) {
      console.error('显示会话上下文失败:', error)
      this.showNotification(`显示上下文失败：${error.message || '未知错误'}`, 'error')
    }
  }

  proto.downloadContextMarkdown = function () {
    const textarea = this.chatWindow ? this.chatWindow.querySelector('#pet-context-editor-textarea') : null
    if (!textarea) return
    const content = textarea.value || ''
    const title = (document.title || 'page').replace(/\s+/g, '_').replace(/[^\w\-_.]/g, '')
    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`
    const filename = `${title}_${stamp}.md`
    try {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      setTimeout(() => { URL.revokeObjectURL(url); if (a.parentNode) a.parentNode.removeChild(a) }, 0)
    } catch (_) {}
  }

  proto.copyContextEditor = function () {
    const textarea = this.chatWindow ? this.chatWindow.querySelector('#pet-context-editor-textarea') : null
    if (!textarea) return
    const content = textarea.value || ''
    if (!content.trim()) return
    const textArea = document.createElement('textarea')
    textArea.value = content
    textArea.className = 'pet-clipboard-temp'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      const copyBtn = this.chatWindow ? this.chatWindow.querySelector('#pet-context-copy-btn') : null
      if (copyBtn) {
        const originalText = copyBtn.textContent
        copyBtn.textContent = '✓'
        copyBtn.setAttribute('data-status', 'success')
        setTimeout(() => { copyBtn.textContent = originalText; copyBtn.removeAttribute('data-status') }, 1500)
      }
    } catch (_) { console.error('复制失败:', _) }
    document.body.removeChild(textArea)
  }

  /* ═══════════════════ Message Editor (Vue Component) ═══════════════════ */

  proto.ensureMessageEditorUi = function () {
    if (!this.chatWindow) return
    const existing = document.getElementById('pet-message-editor')
    if (existing) return

    const overlay = document.createElement('div')
    overlay.id = 'pet-message-editor'
    overlay.setAttribute('role', 'dialog')
    overlay.setAttribute('aria-modal', 'true')
    overlay.setAttribute('aria-label', '编辑消息')

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeMessageEditor()
    })

    const mountEl = document.createElement('div')
    overlay.appendChild(mountEl)

    const currentPosition = window.getComputedStyle(this.chatWindow).position
    if (currentPosition === 'static') {
      this.chatWindow.style.position = 'relative'
    }
    this.chatWindow.appendChild(overlay)

    // 使用 MessageEditor Vue 组件
    const Vue = window.Vue || {}
    const { createApp, defineComponent } = Vue
    if (typeof createApp !== 'function' || typeof defineComponent !== 'function') return

    const Ctor = window.PetManager?.Components?.MessageEditor
    const canCreate = Ctor && typeof Ctor.createComponent === 'function'
    if (!canCreate) return

    ;(async () => {
      const useTemplate = (() => {
        const _u = window.PetManager?.Components?.ChatWindowUtils
        if (_u && typeof _u.canUseVueTemplate === 'function') return _u.canUseVueTemplate(Vue)
        if (typeof Vue?.compile !== 'function') return false
        try { Function('return 1')() } catch (_) { return false }
        return true
      })()

      if (useTemplate) {
        try { await Ctor.loadTemplate() } catch (_) {}
      }

      const component = Ctor.createComponent({ manager: this })
      if (!component) return

      overlay._vueApp = createApp(component)
      overlay._vueInstance = overlay._vueApp.mount(overlay.firstChild)
    })()
  }

  proto.updateMessageEditorPosition = function () {
    if (!this.chatWindow) return
    const overlay = this.chatWindow.querySelector('#pet-message-editor')
    if (!overlay) return
    const chatHeaderEl = this.chatWindow.querySelector('.chat-header')
    const headerH = chatHeaderEl ? chatHeaderEl.offsetHeight : 60
    overlay.style.setProperty('--pet-message-editor-top', `${headerH}px`)
  }

  proto.openMessageEditor = function (messageDiv) {
    if (!messageDiv) return
    this.ensureMessageEditorUi()
    const overlay = this.chatWindow ? this.chatWindow.querySelector('#pet-message-editor') : null
    const textarea = this.chatWindow ? this.chatWindow.querySelector('#pet-message-editor-textarea') : null
    if (!overlay || !textarea) return

    const found = typeof this.findMessageObjectByDiv === 'function' ? this.findMessageObjectByDiv(messageDiv) : null
    if (!found || !found.message) {
      if (typeof this.showNotification === 'function') this.showNotification('未找到要编辑的消息', 'error')
      return
    }

    const originalText = String(found.message.content ?? found.message.message ?? '')
    textarea.value = originalText
    textarea.setAttribute('data-original-text', originalText)

    overlay.dataset.messageIndex = String(found.index)
    overlay.dataset.messageType = String(found.message.type || '')

    overlay.classList.add('js-visible')
    this.updateMessageEditorPosition()
    this.updateMessagePreview()

    this._messageEditorTargetDiv = messageDiv

    setTimeout(() => {
      try { textarea.focus(); textarea.select() } catch (_) {}
    }, 0)

    this._messageKeydownHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeMessageEditor()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        const saveBtn = this.chatWindow ? this.chatWindow.querySelector('#pet-message-save-btn') : null
        if (saveBtn && !saveBtn.hasAttribute('data-saving')) saveBtn.click()
      }
    }
    document.addEventListener('keydown', this._messageKeydownHandler, { capture: true })

    this._messageResizeHandler = () => this.updateMessageEditorPosition()
    window.addEventListener('resize', this._messageResizeHandler, { passive: true })
  }

  proto.closeMessageEditor = function () {
    const overlay = this.chatWindow ? this.chatWindow.querySelector('#pet-message-editor') : null
    if (overlay) overlay.classList.remove('js-visible')

    if (this._messageKeydownHandler) {
      document.removeEventListener('keydown', this._messageKeydownHandler, { capture: true })
      this._messageKeydownHandler = null
    }
    if (this._messageResizeHandler) {
      window.removeEventListener('resize', this._messageResizeHandler)
      this._messageResizeHandler = null
    }
    this._messageEditorTargetDiv = null
  }

  proto.updateMessagePreview = function () {
    this._updatePreview('#pet-message-editor-textarea', '#pet-message-preview')
  }

  proto.copyMessageEditor = function () {
    const textarea = this.chatWindow ? this.chatWindow.querySelector('#pet-message-editor-textarea') : null
    if (!textarea) return
    const content = textarea.value || ''
    if (!content.trim()) return
    const textArea = document.createElement('textarea')
    textArea.value = content
    textArea.className = 'pet-clipboard-temp'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      const copyBtn = this.chatWindow ? this.chatWindow.querySelector('#pet-message-copy-btn') : null
      if (copyBtn) {
        const originalText = copyBtn.textContent
        copyBtn.textContent = '✓'
        copyBtn.setAttribute('data-status', 'success')
        setTimeout(() => { copyBtn.textContent = originalText; copyBtn.removeAttribute('data-status') }, 1500)
      }
    } catch (_) { console.error('复制失败:', _) }
    document.body.removeChild(textArea)
  }

  console.log('[PetManager] petManager.editor.ui.js 已加载 (组件化重构)')
})(
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
        ? window
        : this
)
