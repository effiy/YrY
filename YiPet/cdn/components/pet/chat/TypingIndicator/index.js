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
   * 创建打字指示器 DOM 元素（降级方案 - createElement）
   */
  function createLegacy ({ color, icon }) {
    var currentColor = color || ((PET_CONFIG && PET_CONFIG.pet && PET_CONFIG.pet.colors && PET_CONFIG.pet.colors[0]) || '#4C97FF')

    var messageDiv = document.createElement('div')
    messageDiv.setAttribute('data-typing-indicator', 'true')
    messageDiv.className = 'chat-message'

    var avatar = document.createElement('div')
    avatar.className = 'chat-message-typing-avatar'
    avatar.style.setProperty('background', currentColor, 'important')
    avatar.textContent = icon || '🐾'
    avatar.setAttribute('data-message-type', 'pet-avatar')

    var content = document.createElement('div')
    content.className = 'chat-message-content'

    var messageText = document.createElement('div')
    messageText.className = 'chat-message-typing-bubble'
    messageText.style.setProperty('background', currentColor, 'important')
    messageText.setAttribute('data-message-type', 'pet-bubble')
    messageText.textContent = '💭 正在思考中...'

    var messageTime = document.createElement('div')
    messageTime.className = 'chat-message-typing-time'

    content.appendChild(messageText)
    content.appendChild(messageTime)
    messageDiv.appendChild(avatar)
    messageDiv.appendChild(content)

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
