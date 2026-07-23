/**
 * ThinkingBubble Component
 * Creates and manages a floating chat bubble animation on the pet element.
 */
;(function () {
  'use strict'

  if (!window.PetManager) window.PetManager = {}
  if (!window.PetManager.Components) window.PetManager.Components = {}

  const TEMPLATE_PATH = 'cdn/components/pet/chat/ThinkingBubble/index.html'
  const TEMPLATE_ID = '#yi-pet-thinking-bubble-template'
  let templateCache = ''

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
   * 预加载模板（模块初始化时自动触发）
   */
  async function loadTemplate () {
    if (templateCache) return templateCache
    try {
      var dh = window.DomHelper || window.TemplateHelper
      if (dh && typeof dh.loadHtmlTemplate === 'function') {
        templateCache = await dh.loadHtmlTemplate(TEMPLATE_PATH, TEMPLATE_ID, 'Failed to load ThinkingBubble template')
      }
    } catch (_) {}
    return templateCache
  }

  /**
   * 从模板创建气泡元素
   */
  function createBubbleFromTemplate (templateHtml) {
    var tpl = document.createElement('template')
    tpl.innerHTML = templateHtml
    return tpl.content.cloneNode(true).firstElementChild
  }

  /**
   * 创建气泡元素（降级方案）
   */
  function createBubbleLegacy () {
    var bubble = document.createElement('div')
    bubble.className = 'pet-chat-bubble'
    return bubble
  }

  /**
   * 根据模板可用性创建气泡
   */
  function createBubble () {
    if (templateCache) {
      try { return createBubbleFromTemplate(templateCache) } catch (_) {}
    }
    return createBubbleLegacy()
  }

  // 预加载模板
  loadTemplate()

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
    var bubble = createBubble()

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
    loadTemplate: loadTemplate,
    show: show
  }
})()
