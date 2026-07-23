/**
 * ThinkingBubble Component
 * Creates and manages a floating chat bubble animation on the pet element.
 */
;(function () {
  'use strict'

  if (!window.PetManager) window.PetManager = {}
  if (!window.PetManager.Components) window.PetManager.Components = {}

  var DEFAULT_TEXTS = [
    '🤔 让我想想...',
    '💭 思考中...',
    '✨ 灵感涌现',
    '🌟 整理思路',
    '🎯 深度分析',
    '🔍 搜索答案',
    '💡 想法来了',
    '🌊 头脑风暴',
    '📝 组织语言',
    '🎨 酝酿回复',
    '⚡ 快想好了',
    '🌈 无限接近',
    '🚀 马上就来'
  ]

  var DEFAULT_INTERVAL_MS = 1500
  var DEFAULT_DURATION_MS = 3000

  /**
   * Show a thinking bubble on the pet element.
   * @param {Object} options
   * @param {HTMLElement} options.petElement - The DOM element to append the bubble to
   * @param {number} [options.intervalMs] - Text rotation interval (default 1500)
   * @param {number} [options.durationMs] - How long the bubble stays (default 3000)
   * @param {string[]} [options.texts] - Array of thinking texts
   * @returns {{ bubbleElement: HTMLElement, stop: Function }}
   */
  function show (options) {
    options = options || {}
    var petElement = options.petElement
    var texts = options.texts || (PET_CONFIG && PET_CONFIG.constants && PET_CONFIG.constants.ANIMATION && PET_CONFIG.constants.ANIMATION.THINKING_BUBBLE_TEXTS) || DEFAULT_TEXTS
    var intervalMs = options.intervalMs || (PET_CONFIG && PET_CONFIG.constants && PET_CONFIG.constants.TIMING && PET_CONFIG.constants.TIMING.CHAT_BUBBLE_UPDATE_INTERVAL) || DEFAULT_INTERVAL_MS
    var durationMs = options.durationMs || DEFAULT_DURATION_MS

    if (!petElement) {
      return { bubbleElement: null, stop: function () {} }
    }

    // 创建聊天气泡
    var bubble = document.createElement('div')
    bubble.className = 'pet-chat-bubble'

    // 随机选择思考文本
    bubble.textContent = texts[Math.floor(Math.random() * texts.length)]

    petElement.appendChild(bubble)

    // 动态更新气泡文本
    var updateInterval = setInterval(function () {
      if (bubble.parentNode) {
        var newText
        do {
          newText = texts[Math.floor(Math.random() * texts.length)]
        } while (newText === bubble.textContent && texts.length > 1)
        bubble.textContent = newText
      } else {
        clearInterval(updateInterval)
      }
    }, intervalMs)

    // 定时移除气泡
    var removalTimeout = setTimeout(function () {
      clearInterval(updateInterval)
      if (bubble.parentNode) {
        bubble.style.animation = 'bubbleAppear 0.3s ease-out reverse'
        setTimeout(function () {
          if (bubble.parentNode) {
            bubble.parentNode.removeChild(bubble)
          }
        }, 300)
      }
    }, durationMs)

    function stop () {
      clearInterval(updateInterval)
      clearTimeout(removalTimeout)
      if (bubble.parentNode) {
        bubble.parentNode.removeChild(bubble)
      }
    }

    return {
      bubbleElement: bubble,
      stop: stop
    }
  }

  window.PetManager.Components.ThinkingBubble = {
    show: show
  }
})()
