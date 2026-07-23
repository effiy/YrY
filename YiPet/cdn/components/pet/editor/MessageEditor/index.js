;(function () {
  'use strict'

  if (!window.PetManager) return
  if (!window.PetManager.Components) window.PetManager.Components = {}

  const TEMPLATE_PATH = 'cdn/components/pet/editor/MessageEditor/index.html'
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
      '#yi-pet-message-editor-template',
      'Failed to load MessageEditor template'
    )
    return templateCache
  }

  function createComponent(params) {
    const manager = params?.manager
    const Vue = window.Vue || {}
    const { defineComponent, ref, nextTick, h, computed, onMounted } = Vue
    if (typeof defineComponent !== 'function') return null

    const useTemplate = canUseVueTemplate(Vue)
    const resolvedTemplate = useTemplate ? String(templateCache || '').trim() : ''
    if (useTemplate && !resolvedTemplate) return null
    if (!useTemplate && typeof h !== 'function') return null

    const componentOptions = {
      name: 'YiPetMessageEditor',
      setup() {
        const modalEl = ref(null)
        const textareaEl = ref(null)
        const previewEl = ref(null)
        const content = ref('')
        const previewHtml = ref('')

        // 状态标志
        const saving = ref(false)
        const saveStatus = ref('')
        const saveLabel = computed(() => {
          if (saving.value) return '⏳'
          if (saveStatus.value === 'success') return '✓'
          if (saveStatus.value === 'error') return '⚠️'
          return '💾'
        })

        const copyStatus = ref('')
        const copyLabel = computed(() => copyStatus.value === 'success' ? '✓' : '📋')

        // 更新预览
        let _previewTimer = null
        function updatePreview() {
          if (_previewTimer) clearTimeout(_previewTimer)
          _previewTimer = setTimeout(() => {
            previewHtml.value = manager.renderMarkdown(content.value || '')
            setTimeout(async () => {
              if (previewEl.value) {
                await manager.processMermaidBlocks(previewEl.value)
                if (typeof manager.processTabs === 'function') manager.processTabs(previewEl.value)
              }
            }, 80)
          }, 150)
        }

        function onInput() { updatePreview() }

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

        function close() { manager.closeMessageEditor() }

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
          } catch (_) { console.error('复制失败:', _) }
          document.body.removeChild(ta)
        }

        async function optimize() {
          if (typeof manager.optimizeMessageEditorContent === 'function') await manager.optimizeMessageEditorContent()
        }

        async function save() {
          if (saving.value) return
          saving.value = true
          saveStatus.value = ''
          try {
            const ok = await manager.saveMessageEditor()
            saveStatus.value = ok ? 'success' : 'error'
          } catch (_) {
            saveStatus.value = 'error'
          }
          setTimeout(() => { saveStatus.value = ''; saving.value = false }, 2000)
        }

        function syncContent(text) {
          content.value = text || ''
          updatePreview()
        }

        // 监听组件挂载：聚焦并选中文本
        onMounted(() => {
          nextTick(() => {
            try {
              textareaEl.value?.focus?.()
              textareaEl.value?.select?.()
            } catch (_) {}
          })
        })

        // 暴露方法
        manager._messageEditorComponent = {
          syncContent,
          focusSelect: () => { nextTick(() => { try { textareaEl.value?.focus?.(); textareaEl.value?.select?.() } catch (_) {} }) },
          getContent: () => content.value
        }

        return {
          modalEl, textareaEl, previewEl,
          content, previewHtml,
          saving, saveStatus, saveLabel,
          copyStatus, copyLabel,
          onInput, syncScroll,
          close, copyContent, optimize, save
        }
      }
    }

    if (useTemplate) {
      componentOptions.template = resolvedTemplate
    } else {
      componentOptions.render = createRenderFunction(manager)
    }

    return defineComponent(componentOptions)
  }

  function createRenderFunction() {
    var h = window.Vue?.h
    if (typeof h !== 'function') return undefined

    return function() {
      var self = this
      return h('div', { ref: 'modalEl', class: 'context-editor-modal', role: 'document', tabindex: 0,
        onKeydown: function(e) { if (e.key === 'Escape') self.close() }
      }, [
        h('div', { class: 'context-editor-header' }, [
          h('div', { class: 'context-editor-title' }, '✏️ 编辑消息（Markdown）'),
          h('div', { class: 'editor-header-btns' }, [
            h('button', { class: 'chat-toolbar-btn', title: '复制内容', 'aria-label': '复制内容', onClick: self.copyContent }, self.copyLabel),
            h('div', { class: 'optimize-btn-group' }, [
              h('button', { type: 'button', class: 'chat-toolbar-btn context-optimize-btn', title: '智能优化消息内容', 'aria-label': '智能优化消息内容', onClick: self.optimize }, '✨')
            ]),
            h('button', { class: 'chat-toolbar-btn', title: '保存修改 (Ctrl+S)', 'aria-label': '保存修改', disabled: self.saving, onClick: self.save }, self.saveLabel),
            h('div', { id: 'pet-message-close-btn', role: 'button', 'aria-label': '关闭编辑器 (Esc)', title: '关闭 (Esc)', onClick: self.close }, '✕')
          ])
        ]),
        h('div', { class: 'context-editor-content' }, [
          h('div', { class: 'context-editor-body' }, [
            h('textarea', { ref: 'textareaEl', id: 'pet-message-editor-textarea', value: self.content, onInput: self.onInput, onScroll: self.syncScroll }),
            h('div', { ref: 'previewEl', id: 'pet-message-preview', class: 'context-editor-preview markdown-content', innerHTML: self.previewHtml })
          ])
        ])
      ])
    }
  }

  window.PetManager.Components.MessageEditor = {
    loadTemplate,
    createComponent
  }

  console.log('[MessageEditor] 组件已注册')
})()
