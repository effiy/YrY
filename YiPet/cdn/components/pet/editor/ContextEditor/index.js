;(function () {
  'use strict'

  if (!window.PetManager) return
  if (!window.PetManager.Components) window.PetManager.Components = {}

  const TEMPLATE_PATH = 'cdn/components/pet/editor/ContextEditor/index.html'
  let templateCache = ''

  function canUseVueTemplate(Vue) {
    const _u = window.PetManager?.Components?.ChatWindowUtils
    if (_u && typeof _u.canUseVueTemplate === 'function') return _u.canUseVueTemplate(Vue)
    if (typeof Vue?.compile !== 'function') return false
    try { Function('return 1')() } catch (_) { return false }
    return true
  }

  async function loadTemplate() {
    if (templateCache) return templateCache
    const DomHelper = window.DomHelper
    if (!DomHelper || typeof DomHelper.loadHtmlTemplate !== 'function') return ''
    templateCache = await DomHelper.loadHtmlTemplate(
      TEMPLATE_PATH,
      '#yi-pet-context-editor-template',
      'Failed to load ContextEditor template'
    )
    return templateCache
  }

  /**
   * 创建 Vue 组件定义
   * @param {Object} params
   * @param {Object} params.manager - PetManager 实例
   */
  function createComponent(params) {
    const manager = params?.manager
    const Vue = window.Vue || {}
    const { defineComponent, ref, nextTick, h, computed } = Vue
    if (typeof defineComponent !== 'function') return null

    const useTemplate = canUseVueTemplate(Vue)
    const resolvedTemplate = useTemplate ? String(templateCache || '').trim() : ''
    if (useTemplate && !resolvedTemplate) return null
    if (!useTemplate && typeof h !== 'function') return null

    const componentOptions = {
      name: 'YiPetContextEditor',
      setup() {
        const modalEl = ref(null)
        const textareaEl = ref(null)
        const previewEl = ref(null)
        const content = ref('')
        const previewHtml = ref('')
        const mode = ref(manager._contextPreviewMode || 'split')

        // 状态标志
        const saving = ref(false)
        const saveStatus = ref('')
        const saveLabel = computed(() => {
          if (saving.value) return '⏳'
          if (saveStatus.value === 'success') return '✓'
          if (saveStatus.value === 'error') return '⚠️'
          return '💾'
        })

        const refreshing = ref(false)
        const refreshStatus = ref('')
        const refreshLabel = computed(() => {
          if (refreshing.value) return '⏳'
          if (refreshStatus.value === 'success') return '✓'
          if (refreshStatus.value === 'error') return '✕'
          if (refreshStatus.value === 'warn') return '⚠️'
          return '🔄'
        })

        const copyStatus = ref('')
        const copyLabel = computed(() => {
          if (copyStatus.value === 'success') return '✓'
          return '📋'
        })

        // 更新预览
        let _previewTimer = null
        function updatePreview() {
          if (_previewTimer) clearTimeout(_previewTimer)
          _previewTimer = setTimeout(() => {
            previewHtml.value = manager.renderMarkdown(content.value || '')
            // 延迟渲染 mermaid
            setTimeout(async () => {
              if (previewEl.value) {
                await manager.processMermaidBlocks(previewEl.value)
                if (typeof manager.processTabs === 'function') manager.processTabs(previewEl.value)
              }
            }, 80)
          }, 150)
        }

        function onInput() {
          try { textareaEl.value?.setAttribute?.('data-user-edited', '1') } catch (_) {}
          updatePreview()
        }

        function syncScroll() {
          const ta = textareaEl.value
          const pv = previewEl.value
          if (!ta || !pv) return
          const tMax = ta.scrollHeight - ta.clientHeight
          const pMax = pv.scrollHeight - pv.clientHeight
          if (tMax > 0 && pMax >= 0) {
            pv.scrollTop = (ta.scrollTop / tMax) * pMax
          }
        }

        function onPreviewClick(e) {
          const target = e?.target
          const img = target && typeof target.closest === 'function' ? target.closest('img') : null
          const src = img ? img.getAttribute('src') || img.src : ''
          if (!src) return
          if (typeof manager.showImagePreview === 'function') {
            e.preventDefault?.()
            e.stopPropagation?.()
            manager.showImagePreview(src, img.getAttribute('alt') || '')
          }
        }

        function onPaste(e) {
          const items = e?.clipboardData?.items ? Array.from(e.clipboardData.items) : []
          const imageItems = items.filter(item => item && typeof item.type === 'string' && item.type.includes('image'))
          if (imageItems.length === 0) return
          e.preventDefault()

          const fileList = imageItems.map(item => { try { return item.getAsFile() } catch (_) { return null } }).filter(Boolean)
          if (fileList.length === 0) return

          const insertTextAtCursor = (el, text) => {
            const v = String(el.value || '')
            const start = Number.isFinite(el.selectionStart) ? el.selectionStart : v.length
            const end = Number.isFinite(el.selectionEnd) ? el.selectionEnd : start
            el.value = v.slice(0, start) + text + v.slice(end)
            const nextPos = start + text.length
            try { el.selectionStart = nextPos; el.selectionEnd = nextPos } catch (_) {}
            try { el.dispatchEvent(new Event('input', { bubbles: true })) } catch (_) { updatePreview() }
          }

          const replaceTokenInTextarea = (token, replacement) => {
            const v = String(textareaEl.value?.value || '')
            if (!v.includes(token)) return
            textareaEl.value.value = v.split(token).join(replacement)
            try { textareaEl.value.dispatchEvent(new Event('input', { bubbles: true })) } catch (_) { updatePreview() }
          }

          const fileToDataUrl = (file) => {
            if (!file) return Promise.resolve('')
            return new Promise(resolve => {
              const reader = new FileReader()
              reader.onload = (event) => resolve(String(event?.target?.result || ''))
              reader.onerror = () => resolve('')
              reader.readAsDataURL(file)
            })
          }

          const uploadDataUrlToStaticUrl = async (dataUrl) => {
            var parseImageDataUrl = function (d) {
              const raw = String(d || '')
              const m = raw.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/i)
              if (!m) return null
              const mime = String(m[1] || '').toLowerCase()
              const base64 = String(m[2] || '').trim()
              if (!base64) return null
              const extMap = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'image/bmp': 'bmp', 'image/svg+xml': 'svg' }
              return { mime, base64, ext: extMap[mime] || 'png' }
            }
            const parsed = parseImageDataUrl(dataUrl)
            if (!parsed) throw new Error('无效的图片数据')

            const apiBase = window.API_URL && /^https?:\/\//i.test(window.API_URL)
              ? String(window.API_URL).replace(/\/+$/, '')
              : window.PET_CONFIG?.api?.yiaiBaseUrl || ''
            if (!apiBase) throw new Error('API_URL 未配置')

            const sessionSeg = String(manager.currentSessionId || 'page').replace(/[^a-zA-Z0-9_-]+/g, '_')
            const name = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${parsed.ext}`
            const targetFile = `uploads/${sessionSeg}/${name}`

            const res = await fetch(`${apiBase}/write-file`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ target_file: targetFile, content: parsed.base64, is_base64: true })
            })
            if (!res.ok) { const text = await res.text().catch(() => ''); throw new Error(`HTTP ${res.status}${text ? ': ' + text : ''}`) }
            const json = await res.json().catch(() => null)
            if (!json || typeof json !== 'object' || json.code !== 0) throw new Error(json?.message || '上传失败')
            return `${apiBase}/static/${targetFile}`
          }

          ;(async () => {
            for (const file of fileList) {
              const token = `__PET_CONTEXT_IMG_${Date.now()}_${Math.random().toString(36).slice(2, 8)}__`
              insertTextAtCursor(textareaEl.value, `![](${token})\n`)
              const dataUrl = await fileToDataUrl(file)
              if (!dataUrl) { replaceTokenInTextarea(token, ''); continue }
              try {
                const url = await uploadDataUrlToStaticUrl(dataUrl)
                replaceTokenInTextarea(token, url)
              } catch (_) {
                replaceTokenInTextarea(token, dataUrl)
                if (typeof manager.showNotification === 'function') manager.showNotification('图片上传失败，已使用本地图片', 'warning')
              }
            }
          })()
        }

        // 模式
        function setMode(m) {
          mode.value = m
          manager._contextPreviewMode = m
        }

        // 关闭
        function close() {
          manager.closeContextEditor()
        }

        // 刷新
        async function refresh() {
          if (refreshing.value) return
          refreshing.value = true
          refreshStatus.value = ''

          const ta = textareaEl.value
          const isDirty = ta && ta.getAttribute('data-user-edited') === '1' && String(ta.value || '').trim().length > 0
          if (isDirty && refreshStatus.value !== 'warn') {
            refreshStatus.value = 'warn'
            if (typeof manager.showNotification === 'function') manager.showNotification('再次点击将覆盖当前编辑内容', 'warning')
            setTimeout(() => { if (refreshStatus.value === 'warn') { refreshStatus.value = ''; refreshing.value = false } }, 2500)
            return
          }

          try {
            await manager.refreshContextFromPage()
            content.value = ta?.value || ''
            updatePreview()
            refreshStatus.value = 'success'
            // Flash effect
            try {
              const root = modalEl.value?.closest?.('#pet-context-editor')
              if (root) { root.setAttribute('data-flash', 'true'); setTimeout(() => root.removeAttribute('data-flash'), 420) }
            } catch (_) {}
          } catch (_) {
            refreshStatus.value = 'error'
          }
          setTimeout(() => { refreshStatus.value = ''; refreshing.value = false }, 2000)
        }

        // 优化
        async function optimize() {
          if (typeof manager.optimizeContext === 'function') await manager.optimizeContext()
        }

        // 翻译
        async function translate(lang) {
          if (typeof manager.translateContext === 'function') await manager.translateContext(lang)
        }

        // 复制
        function copyContent() {
          const text = content.value || ''
          if (!text.trim()) return
          const ta = document.createElement('textarea')
          ta.value = text
          ta.className = 'pet-clipboard-temp'
          document.body.appendChild(ta)
          ta.select()
          try {
            document.execCommand('copy')
            copyStatus.value = 'success'
            setTimeout(() => { copyStatus.value = '' }, 1500)
          } catch (_) {}
          document.body.removeChild(ta)
        }

        // 保存
        async function save() {
          if (saving.value) return
          saving.value = true
          saveStatus.value = ''
          try {
            const ok = await manager.saveContextEditor()
            saveStatus.value = ok ? 'success' : 'error'
          } catch (_) {
            saveStatus.value = 'error'
          }
          setTimeout(() => { saveStatus.value = ''; saving.value = false }, 2000)
        }

        // 下载
        function download() {
          manager.downloadContextMarkdown()
        }

        // 监听键盘快捷键
        function onKeydown(e) {
          if (!e) return
          if (e.key === 'Escape') { close(); return }
          if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault()
            save()
          }
        }

        // 同步内容
        function syncContent(text) {
          content.value = text || ''
          updatePreview()
        }

        // 暴露方法
        manager._contextEditorComponent = {
          syncContent,
          focus: () => { nextTick(() => { try { textareaEl.value?.focus?.(); textareaEl.value?.select?.() } catch (_) {} }) },
          getContent: () => content.value,
          setMode
        }

        return {
          modalEl, textareaEl, previewEl,
          content, previewHtml, mode,
          saving, saveStatus, saveLabel,
          refreshing, refreshStatus, refreshLabel,
          copyStatus, copyLabel,
          onInput, syncScroll, onPreviewClick, onPaste,
          setMode, close, refresh, optimize, translate,
          copyContent, save, download, onKeydown, syncContent
        }
      }
    }

    if (useTemplate) {
      componentOptions.template = resolvedTemplate
    } else {
      // Fallback: use render function
      componentOptions.render = createRenderFunction(manager)
    }

    return defineComponent(componentOptions)
  }

  /**
   * Vue template 不可用时的 h() 渲染降级
   */
  function createRenderFunction() {
    var h = window.Vue?.h
    if (typeof h !== 'function') return undefined

    return function() {
      var self = this
      return h('div', { ref: 'modalEl',
        class: 'context-editor-modal',
        'data-mode': self.mode,
        role: 'document', tabindex: 0,
        onKeydown: function(e) { if (e.key === 'Escape') self.close() }
      }, [
        // Header
        h('div', { class: 'context-editor-header' }, [
          h('div', { class: 'context-editor-title' }, '📝 页面上下文（Markdown）'),
          h('div', { class: 'editor-header-btns' }, [
            // Mode buttons
            h('div', { class: 'editor-mode-group' }, [
              h('button', { id: 'pet-context-mode-split', class: { 'editor-mode-btn': true, 'is-active': self.mode === 'split' }, title: '并排模式', 'aria-label': '并排模式', onClick: function() { self.setMode('split') } }, '▦'),
              h('button', { id: 'pet-context-mode-edit', class: { 'editor-mode-btn': true, 'is-active': self.mode === 'edit' }, title: '仅编辑模式', 'aria-label': '仅编辑模式', onClick: function() { self.setMode('edit') } }, '✏️'),
              h('button', { id: 'pet-context-mode-preview', class: { 'editor-mode-btn': true, 'is-active': self.mode === 'preview' }, title: '仅预览模式', 'aria-label': '仅预览模式', onClick: function() { self.setMode('preview') } }, '👁️')
            ]),
            h('button', { class: 'chat-toolbar-btn', title: '拉取当前网页上下文', 'aria-label': '拉取当前网页上下文', disabled: self.refreshing, onClick: self.refresh }, self.refreshLabel),
            h('div', { class: 'optimize-btn-group' }, [
              h('button', { type: 'button', class: 'chat-toolbar-btn context-optimize-btn', title: '智能优化上下文内容', 'aria-label': '智能优化上下文内容', onClick: self.optimize }, '✨')
            ]),
            h('div', { class: 'translate-btn-group' }, [
              h('button', { class: 'chat-toolbar-btn', title: '翻译成中文', 'aria-label': '翻译成中文', onClick: function() { self.translate('zh') } }, '🇨🇳'),
              h('button', { class: 'chat-toolbar-btn', title: '翻译成英文', 'aria-label': '翻译成英文', onClick: function() { self.translate('en') } }, '🇺🇸')
            ]),
            h('button', { class: 'chat-toolbar-btn', title: '复制内容', 'aria-label': '复制内容', onClick: self.copyContent }, self.copyLabel),
            h('button', { class: 'chat-toolbar-btn', title: '保存修改 (Ctrl+S)', 'aria-label': '保存修改', disabled: self.saving, onClick: self.save }, self.saveLabel),
            h('button', { class: 'chat-toolbar-btn', title: '下载为 Markdown', 'aria-label': '下载为 Markdown', onClick: self.download }, '⬇️'),
            h('div', { id: 'pet-context-close-btn', role: 'button', 'aria-label': '关闭上下文面板 (Esc)', title: '关闭 (Esc)', onClick: self.close }, '✕')
          ])
        ]),
        // Content
        h('div', { class: 'context-editor-content' }, [
          h('div', { class: 'context-editor-body' }, [
            h('textarea', { ref: 'textareaEl', id: 'pet-context-editor-textarea', value: self.content, onInput: self.onInput, onScroll: self.syncScroll, onPaste: self.onPaste }),
            h('div', { ref: 'previewEl', id: 'pet-context-preview', class: 'context-editor-preview markdown-content', innerHTML: self.previewHtml, onClick: self.onPreviewClick })
          ])
        ])
      ])
    }
  }

  window.PetManager.Components.ContextEditor = {
    loadTemplate,
    createComponent
  }

  console.log('[ContextEditor] 组件已注册')
})()
