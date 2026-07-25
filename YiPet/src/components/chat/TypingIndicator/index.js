;(function () {
  'use strict'

  if (!window.PetManager) return
  if (!window.PetManager.Components) window.PetManager.Components = {}

  const TEMPLATE_PATH = 'cdn/components/pet/chat/TypingIndicator/index.html'
  const TEMPLATE_ID = '#yi-pet-typing-indicator-template'
  let templateCache = ''

  /**
   * 预加载模板
   */
  async function loadTemplate () {
    if (templateCache) return templateCache
    try {
      var dh = window.DomHelper || window.TemplateHelper
      if (dh && typeof dh.loadHtmlTemplate === 'function') {
        templateCache = await dh.loadHtmlTemplate(TEMPLATE_PATH, TEMPLATE_ID, 'Failed to load TypingIndicator template')
      }
    } catch (_) {}
    return templateCache
  }

  /**
   * 从模板创建 DOM 片段
   */
  function cloneFromTemplate (templateHtml) {
    var tpl = document.createElement('template')
    tpl.innerHTML = templateHtml
    return tpl.content.cloneNode(true)
  }

  /**
   * 打字指示器 DOM 模板
   */
  var TYPING_INDICATOR_DOM_TPL = [
    '<div class="chat-message" data-typing-indicator="true">',
    '  <div class="chat-message-typing-avatar" data-message-type="pet-avatar"></div>',
    '  <div class="chat-message-content">',
    '    <div class="chat-message-typing-bubble" data-message-type="pet-bubble">💭 正在思考中...</div>',
    '    <div class="chat-message-typing-time"></div>',
    '  </div>',
    '</div>'
  ].join('')

  /**
   * 创建打字指示器 DOM 元素（降级方案 - 使用模板）
   */
  function createLegacy ({ color, icon }) {
    var currentColor = color || ((PET_CONFIG && PET_CONFIG.pet && PET_CONFIG.pet.colors && PET_CONFIG.pet.colors[0]) || '#4C97FF')

    var fragment = cloneFromTemplate(TYPING_INDICATOR_DOM_TPL)
    var messageDiv = fragment.firstElementChild

    var avatar = messageDiv.querySelector('[data-message-type="pet-avatar"]')
    if (avatar) {
      avatar.style.setProperty('background', currentColor, 'important')
      avatar.textContent = icon || '🐾'
    }

    var bubble = messageDiv.querySelector('[data-message-type="pet-bubble"]')
    if (bubble) {
      bubble.style.setProperty('background', currentColor, 'important')
    }

    return messageDiv
  }

  /**
   * 从模板创建打字指示器
   * @param {string} templateHtml - 模板内容
   * @param {Object} options
   */
  function createFromTemplate (templateHtml, { color, icon }) {
    var fragment = cloneFromTemplate(templateHtml)
    var messageDiv = fragment.firstElementChild
    if (!messageDiv) return createLegacy({ color: color, icon: icon })

    var currentColor = color || ((PET_CONFIG && PET_CONFIG.pet && PET_CONFIG.pet.colors && PET_CONFIG.pet.colors[0]) || '#4C97FF')
    var currentIcon = icon || '🐾'

    var avatar = messageDiv.querySelector('[data-message-type="pet-avatar"]')
    if (avatar) {
      avatar.style.setProperty('background', currentColor, 'important')
      avatar.textContent = currentIcon
    }

    var bubble = messageDiv.querySelector('[data-message-type="pet-bubble"]')
    if (bubble) {
      bubble.style.setProperty('background', currentColor, 'important')
    }

    return messageDiv
  }

  // 预加载模板
  loadTemplate()

  /**
   * 创建打字指示器 DOM 元素
   * @param {Object} options
   * @param {string} [options.color] - 背景颜色
   * @param {string} [options.icon='🐾'] - 头像图标
   * @returns {HTMLElement} 创建的 DOM 元素
   */
  function create (options) {
    options = options || {}
    if (templateCache) {
      try { return createFromTemplate(templateCache, options) } catch (_) {}
    }
    return createLegacy(options)
  }

  window.PetManager.Components.TypingIndicator = {
    loadTemplate: loadTemplate,
    create: create
  }
})()
