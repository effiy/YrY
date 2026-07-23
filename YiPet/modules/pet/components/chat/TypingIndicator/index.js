;(function () {
  'use strict'

  if (!window.PetManager) return
  if (!window.PetManager.Components) window.PetManager.Components = {}

  /**
   * 创建打字指示器 DOM 元素
   * @param {Object} options
   * @param {string} [options.color] - 背景颜色，默认从 PET_CONFIG 获取
   * @param {string} [options.icon='🐾'] - 头像图标
   * @returns {HTMLElement} 创建的 DOM 元素
   */
  function create ({ color, icon = '🐾' } = {}) {
    const currentColor = color || ((PET_CONFIG?.pet?.colors && PET_CONFIG.pet.colors[0]) || '#4C97FF')

    const messageDiv = document.createElement('div')
    messageDiv.setAttribute('data-typing-indicator', 'true')
    messageDiv.className = 'chat-message'

    const avatar = document.createElement('div')
    avatar.className = 'chat-message-typing-avatar'
    avatar.style.setProperty('background', currentColor, 'important')

    avatar.textContent = icon
    avatar.setAttribute('data-message-type', 'pet-avatar')

    const content = document.createElement('div')
    content.className = 'chat-message-content'

    const messageText = document.createElement('div')
    messageText.className = 'chat-message-typing-bubble'
    messageText.style.setProperty('background', currentColor, 'important')

    messageText.setAttribute('data-message-type', 'pet-bubble')
    messageText.textContent = '💭 正在思考中...'

    const messageTime = document.createElement('div')
    messageTime.className = 'chat-message-typing-time'

    content.appendChild(messageText)
    content.appendChild(messageTime)
    messageDiv.appendChild(avatar)
    messageDiv.appendChild(content)

    return messageDiv
  }

  window.PetManager.Components.TypingIndicator = { create }
})()
