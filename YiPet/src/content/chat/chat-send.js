/**
 * PetManager - 聊天窗口相关逻辑（从 `content/petManager.core.js` 拆分）
 * 说明：不使用 ESModule，通过给 `window.PetManager.prototype` 挂方法实现拆分。
 */
(function () {
  'use strict'
  if (typeof window === 'undefined' || typeof window.PetManager === 'undefined') {
    return
  }

  const proto = window.PetManager.prototype

  function computeDockedChatWindowRect (widthRatio) {
    const sizeLimits = PET_CONFIG?.chatWindow?.sizeLimits || {}
    const rect = window.ViewportUtils.computeChatWindowRect(widthRatio, sizeLimits)
    const pos = getChatWindowDefaultPosition(rect.width, rect.height)
    return { x: pos.x, y: pos.y, width: rect.width, height: rect.height }
  }

  // 切换聊天窗口
  proto.toggleChatWindow = function () {
    if (this.isChatOpen) {
      this.closeChatWindow()
    } else {
      this.openChatWindow()
    }
  }

  // 仅切换聊天窗口的显示/隐藏状态（用于快捷键，不影响其他功能）
  proto.toggleChatWindowVisibility = function () {
    // 原生 JS 版本的处理逻辑
    if (!this.chatWindow) {
      // 如果窗口还未创建，需要先创建
      this.openChatWindow()
      return
    }

    if (this.isChatOpen) {
      // 仅隐藏窗口，不保存会话，不影响其他功能
      if (this.chatWindowComponent && typeof this.chatWindowComponent.setVisible === 'function') {
        this.chatWindowComponent.setVisible(false, { focus: false })
      } else {
        this.chatWindow.classList.add('js-hidden')
        this.isChatOpen = false
      }
    } else {
      // 仅显示窗口，不重新初始化，不影响其他功能
      if (this.chatWindowComponent && typeof this.chatWindowComponent.setVisible === 'function') {
        this.chatWindowComponent.setVisible(true, { focus: true })
      } else {
        this.chatWindow.classList.remove('js-hidden')
        this.isChatOpen = true
      }

      try {
        if (this.chatWindowState && !this.chatWindowState.isFullscreen) {
          const rect = computeDockedChatWindowRect(0.5)
          this.chatWindowState.x = rect.x
          this.chatWindowState.y = rect.y
          this.chatWindowState.width = rect.width
          this.chatWindowState.height = rect.height
        }
      } catch (_) {}
      if (typeof this.updateChatWindowStyle === 'function') {
        this.updateChatWindowStyle()
      }

      // 窗口显示后，检查并处理未渲染的 Mermaid 图表
      setTimeout(async () => {
        try {
          const messagesContainer = this.chatWindow?.querySelector('#yi-pet-chat-messages')
          if (messagesContainer) {
            await this.loadMermaid()
            const unrenderedMermaid = messagesContainer.querySelectorAll('div.mermaid:not([data-mermaid-rendered="true"]), code.language-mermaid:not(.mermaid-processed)')
            if (unrenderedMermaid.length > 0) {
              console.log(`窗口显示后，发现 ${unrenderedMermaid.length} 个未渲染的 Mermaid 图表，开始处理...`)
              await this.processMermaidBlocks(messagesContainer)
            }
          }
        } catch (error) {
          console.error('窗口显示后处理 Mermaid 图表时出错:', error)
        }
      }, 300)
    }
  }

  // 打开聊天窗口
  proto.openChatWindow = async function () {
    this.isChatOpen = true

    // 如果是第一次打开聊天窗口，加载会话列表
    if (this.isChatWindowFirstOpen) {
      this.isChatWindowFirstOpen = false
      console.log('第一次打开聊天窗口，加载会话列表...')

      // 加载会话列表（强制刷新）
      if (this.sessionApi && this.sessionApi.isEnabled()) {
        try {
          await this.loadSessionsFromBackend(true)
          this.hasLoadedSessionsForChat = true
        } catch (error) {
          console.warn('第一次打开聊天窗口时加载会话列表失败:', error)
        }
      }
    }

    if (this.chatWindow) {
      // 移除之前设置的隐藏样式
      if (this.chatWindowComponent && typeof this.chatWindowComponent.setVisible === 'function') {
        this.chatWindowComponent.setVisible(true, { focus: true })
      } else {
        this.chatWindow.classList.remove('js-hidden')
        this.chatWindow.removeAttribute('hidden')
        this.isChatOpen = true
      }

      // 更新聊天窗口样式（确保高度等样式正确）
      try {
        if (this.chatWindowState && !this.chatWindowState.isFullscreen) {
          const rect = computeDockedChatWindowRect(0.5)
          this.chatWindowState.x = rect.x
          this.chatWindowState.y = rect.y
          this.chatWindowState.width = rect.width
          this.chatWindowState.height = rect.height
        }
      } catch (_) {}
      if (typeof this.updateChatWindowStyle === 'function') {
        this.updateChatWindowStyle()
      }

      // 先处理 URL 匹配和会话创建/选中（确保会话列表已加载）
      // 这个方法会检查当前 URL 是否在会话列表中，如果不在则创建新会话
      const matchedSessionId = await this.handleUrlBasedSession()
      if (!this.currentSessionId) {
        console.warn('未能选中会话，跳过打开聊天窗口')
        return
      }

      // 重新初始化滚动功能
      this.initializeChatScroll()

      // 更新模型选择器显示

      // 更新聊天窗口颜色
      this.updateChatWindowColor()

      // 更新聊天窗口标题（显示当前会话名称）
      this.updateChatHeaderTitle()

      // 确保会话侧边栏已更新（如果侧边栏已创建）
      if (this.sessionSidebar) {
        await this.updateSessionSidebar()

        // 在侧边栏更新完成后，滚动到 URL 匹配的会话项位置
        // 使用 matchedSessionId 或 currentSessionId
        const sessionIdToScroll = matchedSessionId || this.currentSessionId
        if (sessionIdToScroll && typeof this.scrollToSessionItem === 'function') {
          // 等待侧边栏完全渲染后再滚动
          await new Promise(resolve => setTimeout(resolve, 100))
          await this.scrollToSessionItem(sessionIdToScroll)
        }
      }

      // 确保加载当前会话的消息（修复对话记录没有显示的问题）
      if (this.currentSessionId && typeof this.loadSessionMessages === 'function') {
        await this.loadSessionMessages()
      }

      // 强制重新计算消息容器高度（修复第二次打开时的高度问题）
      setTimeout(() => {
        const messagesContainer = this.chatWindow?.querySelector('#yi-pet-chat-messages')
        const mainContent = this.chatWindow?.querySelector('.yi-pet-chat-main-content')

        if (messagesContainer && mainContent) {
          // 移除可能冲突的内联样式，让 CSS 的 flex 布局生效
          mainContent.style.removeProperty('height')
          messagesContainer.style.removeProperty('height')

          // 触发重排以确保 flex 布局正确计算
          void mainContent.offsetHeight
          void messagesContainer.offsetHeight
        }
      }, 10)

      return
    }

    // 初始化聊天窗口状态（先设置默认值）
    const rect = computeDockedChatWindowRect(0.5)

    this.chatWindowState = {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      isDragging: false,
      isResizing: false,
      resizeType: 'bottom-right', // 默认缩放类型
      dragStart: { x: 0, y: 0 },
      resizeStart: { x: 0, y: 0, width: 0, height: 0 },
      isFullscreen: false,
      originalState: null // 保存全屏前的原始状态
    }

    // 尝试加载保存的聊天窗口状态（会覆盖默认值）
    // 加载完成后创建窗口
    this._forceDockedChatWindowOnOpen = true
    this.loadChatWindowState(async (success) => {
      if (success) {
        console.log('聊天窗口状态已加载，创建窗口')
      } else {
        console.log('使用默认聊天窗口状态，创建窗口')
      }

      // 先处理 URL 匹配和会话创建/选中（确保会话列表已加载）
      // 这个方法会检查当前 URL 是否在会话列表中，如果不在则创建新会话
      const matchedSessionId = await this.handleUrlBasedSession()
      if (!this.currentSessionId) {
        console.warn('未能选中会话，跳过创建聊天窗口')
        return
      }

      await this.createChatWindow()
      if (!this.chatWindow) {
        console.warn('聊天窗口创建失败，跳过后续初始化')
        return
      }
      this.isChatOpen = true
      this.hasLoadedSessionsForChat = true

      // 更新聊天窗口标题（显示当前会话名称）
      this.updateChatHeaderTitle()

      // 在侧边栏创建完成后，滚动到 URL 匹配的会话项位置
      if (this.sessionSidebar) {
        const sessionIdToScroll = matchedSessionId || this.currentSessionId
        if (sessionIdToScroll && typeof this.scrollToSessionItem === 'function') {
          // 等待侧边栏完全渲染后再滚动
          await new Promise(resolve => setTimeout(resolve, 300))
          await this.scrollToSessionItem(sessionIdToScroll)
        }
      }
    })
  }

  // 关闭聊天窗口
  proto.closeChatWindow = function () {
    try {
      console.log('[PetManager] closeChatWindow 被调用')
      const chatWindowElement = this.chatWindow || document.getElementById('pet-chat-window')

      if (chatWindowElement) {
        console.log('[PetManager] 正在隐藏聊天窗口')

        // 使用 CSS 类控制隐藏状态
        if (this.chatWindowComponent && typeof this.chatWindowComponent.setVisible === 'function') {
          this.chatWindowComponent.setVisible(false, { focus: false })
        } else {
          chatWindowElement.classList.add('js-hidden')
          chatWindowElement.setAttribute('hidden', '') // 添加 hidden 属性
          this.isChatOpen = false
        }

        // 注意：不要重置 hasLoadedSessionsForChat，以便下次打开时能快速加载
        // this.hasLoadedSessionsForChat = false;

        // 确保 this.chatWindow 引用正确
        if (!this.chatWindow) {
          this.chatWindow = chatWindowElement
        }

        console.log('[PetManager] 聊天窗口已关闭')
      } else {
        console.warn('[PetManager] chatWindow 不存在, this.chatWindow:', this.chatWindow)
        // 即使找不到元素，也要确保状态正确
        this.isChatOpen = false
      }
    } catch (error) {
      console.error('[PetManager] closeChatWindow 出错:', error)
      // 即使出错也要确保状态正确
      this.isChatOpen = false
    }
  }

  // 检查是否接近底部（阈值：50px）
  proto.isNearBottom = function (container, threshold = 50) {
    if (!container) return true
    const { scrollTop, scrollHeight, clientHeight } = container
    return scrollHeight - scrollTop - clientHeight <= threshold
  }

  // 滚动到底部（优化版）
  proto.scrollToBottom = function (smooth = false, force = false) {
    const chatWindowComponent = this.chatWindowComponent
    if (chatWindowComponent && typeof chatWindowComponent.scrollToBottom === 'function') {
      chatWindowComponent.scrollToBottom(!!force)
      return
    }

    if (!this.chatWindow) return
    const messagesContainer = this.chatWindow.querySelector('#yi-pet-chat-messages')
    if (!messagesContainer) return

    // 如果不是强制滚动，且用户不在底部附近，则不自动滚动
    if (!force && !this.isNearBottom(messagesContainer, 100)) {
      return
    }

    const scrollToBottom = () => {
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight
      }
    }

    if (smooth) {
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
      })
    } else {
      // 使用 requestAnimationFrame 优化性能
      requestAnimationFrame(() => {
        scrollToBottom()
        // 延迟一次确保异步内容加载后也能滚动到底部
        requestAnimationFrame(() => {
          scrollToBottom()
        })
      })
    }
  }

  // 初始化聊天窗口滚动
  proto.initializeChatScroll = function () {
    const chatWindowComponent = this.chatWindowComponent
    if (chatWindowComponent && typeof chatWindowComponent.initializeChatScroll === 'function') {
      chatWindowComponent.initializeChatScroll()
      return
    }

    if (!this.chatWindow) return

    const messagesContainer = this.chatWindow.querySelector('#yi-pet-chat-messages')
    if (!messagesContainer) return

    messagesContainer.style.overflowY = 'auto'

    requestAnimationFrame(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
      requestAnimationFrame(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight
      })
    })
  }

  // 更新聊天窗口标题
  proto.updateChatHeaderTitle = function () {
    const chatWindowComponent = this.chatWindowComponent
    if (chatWindowComponent && typeof chatWindowComponent.updateChatHeaderTitle === 'function') {
      chatWindowComponent.updateChatHeaderTitle()
      return
    }

    if (!this.chatWindow) return

    const titleTextEl = this.chatWindow.querySelector('#yi-pet-chat-header-title-text')
    if (!titleTextEl) return

    if (this.currentSessionId && this.sessions[this.currentSessionId]) {
      const session = this.sessions[this.currentSessionId]
      const sessionTitle = session.title || '未命名会话'
      titleTextEl.textContent = sessionTitle
      titleTextEl.setAttribute('title', sessionTitle)
    } else {
      titleTextEl.textContent = '与我聊天'
      titleTextEl.setAttribute('title', '与我聊天')
    }

    const editSessionBtn = this.chatWindow.querySelector('#edit-session-btn')
    if (!editSessionBtn) return
    editSessionBtn.disabled = !(this.currentSessionId && this.sessions[this.currentSessionId])
  }

  // 更新聊天窗口颜色（跟随宠物颜色）
  proto.updateChatWindowColor = function () {
    const chatWindowComponent = this.chatWindowComponent
    if (chatWindowComponent && typeof chatWindowComponent.updateTheme === 'function') {
      chatWindowComponent.updateTheme()
      return
    }

    if (!this.chatWindow) return

    var C = window.ColorUtils
    var toRgbFromHex = C.hexToRgb
    var shadeHexColor = C.shadeHexColor

    const colors = Array.isArray(this.colors) ? this.colors : []
    const currentColor =
            colors.length > 0
              ? colors[Number(this.colorIndex) || 0]
              : (PET_CONFIG?.pet?.colors?.[PET_CONFIG?.pet?.defaultColorIndex ?? 0] ||
                  'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)')
    const mainColor = this.getMainColorFromGradient(currentColor)
    const rgb = toRgbFromHex(mainColor) || { r: 102, g: 126, b: 234 }
    const rgbText = `${rgb.r}, ${rgb.g}, ${rgb.b}`
    const hoverColor = shadeHexColor(mainColor, -0.08) || mainColor
    const hoverRgb = toRgbFromHex(hoverColor) || rgb
    const hoverRgbText = `${hoverRgb.r}, ${hoverRgb.g}, ${hoverRgb.b}`
    const primaryAlpha = `rgba(${rgbText}, 0.12)`

    this.chatWindow.style.setProperty('--pet-chat-primary-color', currentColor)
    this.chatWindow.style.setProperty('--pet-chat-main-color', mainColor)
    this.chatWindow.style.setProperty('--primary', mainColor)
    this.chatWindow.style.setProperty('--primary-color', mainColor)
    this.chatWindow.style.setProperty('--primary-rgb', rgbText)
    this.chatWindow.style.setProperty('--primary-hover', hoverColor)
    this.chatWindow.style.setProperty('--primary-color-hover', hoverColor)
    this.chatWindow.style.setProperty('--primary-dark', hoverColor)
    this.chatWindow.style.setProperty('--primary-dark-rgb', hoverRgbText)
    this.chatWindow.style.setProperty('--primary-alpha', primaryAlpha)
    this.chatWindow.style.setProperty('--primary-color-alpha', primaryAlpha)

    // 更新页面上下文开关颜色
    const contextSwitchContainer = this.chatWindow.querySelector('.context-switch-container')
    if (contextSwitchContainer && contextSwitchContainer.updateColor) {
      contextSwitchContainer.updateColor()
    }

    // 不再逐个元素设置颜色，统一通过 CSS 变量生效
  }

  // 保存聊天窗口状态
  proto.saveChatWindowState = function () {
    if (!this.chatWindowState) return

    try {
      const state = {
        x: this.chatWindowState.x,
        y: this.chatWindowState.y,
        width: this.chatWindowState.width,
        height: this.chatWindowState.height,
        timestamp: Date.now()
      }

      // 保存到chrome.storage.local避免写入配额限制
      chrome.storage.local.set({ [PET_CONFIG.storage.keys.chatWindowState]: state }, () => {
        if (chrome.runtime.lastError) {
          console.warn('保存聊天窗口状态失败:', chrome.runtime.lastError.message)
        } else {
          console.log('聊天窗口状态已保存到local存储:', state)
        }
      })
    } catch (error) {
      console.log('保存聊天窗口状态失败:', error)
    }
  }

  // 加载聊天窗口状态
  proto.loadChatWindowState = function (callback) {
    try {
      chrome.storage.local.get([PET_CONFIG.storage.keys.chatWindowState], (result) => {
        if (result[PET_CONFIG.storage.keys.chatWindowState]) {
          const state = result[PET_CONFIG.storage.keys.chatWindowState]
          this.restoreChatWindowState(state)

          // 更新聊天窗口样式（如果已经创建）
          if (this.chatWindow) {
            this.updateChatWindowStyle()
          }

          if (callback) callback(true)
        } else {
          if (callback) callback(false)
        }
      })

      // 监听存储变化，实现跨页面同步
      chrome.storage.onChanged.addListener((changes, namespace) => {
        // 监听 local 存储的变化（新版本使用 local 避免写入配额限制）
        if (namespace === 'local' && changes[PET_CONFIG.storage.keys.chatWindowState]) {
          const newState = changes[PET_CONFIG.storage.keys.chatWindowState].newValue
          if (newState && !this.chatWindowState.isDragging && !this.chatWindowState.isResizing) {
            this.restoreChatWindowState(newState)

            // 更新聊天窗口样式（如果已经创建）
            if (this.chatWindow) {
              this.updateChatWindowStyle()
              console.log('聊天窗口状态已从local存储更新:', newState)
            }
          }
        }
      })

      return true
    } catch (error) {
      console.log('恢复聊天窗口状态失败:', error)
      if (callback) callback(false)
      return false
    }
  }

  // 加载当前会话的消息
  proto.loadSessionMessages = async function () {
    if (!this.chatWindow || !this.currentSessionId) {
      return
    }

    const chatWindowComponent = this.chatWindowComponent
    const useVueMessages = chatWindowComponent && typeof chatWindowComponent._messagesSet === 'function'

    // 获取当前会话
    const session = this.sessions[this.currentSessionId]
    if (!session) {
      console.warn('未找到当前会话:', this.currentSessionId)
      return
    }

    if (useVueMessages) {
      let pageInfo = null
      if (session) {
        const sessionUrl = session.url && session.url.trim() ? session.url : null
        pageInfo = {
          title: session.title || document.title || '当前页面',
          url: sessionUrl || window.location.href,
          description: session.pageDescription || ''
        }
        if (!sessionUrl) pageInfo.url = ''
      } else {
        const currentPageInfo = this.getPageInfo()
        pageInfo = { title: currentPageInfo.title, url: currentPageInfo.url, description: currentPageInfo.description || '' }
      }
      pageInfo.iconUrl = this.getPageIconUrl()
      const pageInfoHtml = this.buildWelcomeCardHtml(pageInfo, session)
      const pageInfoModel = this.buildWelcomeCardModel(pageInfo, session)
      const welcomeItem = {
        type: 'pet',
        isWelcome: true,
        welcomeHtml: pageInfoHtml,
        welcomeModel: pageInfoModel,
        timestamp: Date.now()
      }

      const list = [welcomeItem]
      if (session.messages && Array.isArray(session.messages)) {
        for (let idx = 0; idx < session.messages.length; idx++) {
          const msg = session.messages[idx]
          const messageType = msg.type === 'pet' ? 'pet' : 'user'
          const messageContent = msg.content || msg.message || ''
          const messageTimestamp = msg.timestamp || Date.now()
          const messageImage = msg.imageDataUrl || (Array.isArray(msg.imageDataUrls) && msg.imageDataUrls.length > 0 ? msg.imageDataUrls[0] : null)
          if (!messageContent.trim() && !messageImage) continue
          list.push({
            type: messageType,
            content: messageContent,
            timestamp: messageTimestamp,
            imageDataUrl: messageImage || null,
            error: !!msg.error,
            aborted: !!msg.aborted,
            streaming: false
          })
        }
      }
      chatWindowComponent._messagesSet(list)
      chatWindowComponent._setMessagesViewState('messages', null)
      setTimeout(() => {
        if (chatWindowComponent.scrollToBottom) chatWindowComponent.scrollToBottom()
      }, 100)
      if (pageInfo && pageInfo.url) {
        await this.autoHandleSessionForUrl(pageInfo.url)
      }
      return
    }

    const messagesContainer = this.chatWindow.querySelector('#yi-pet-chat-messages')
    if (!messagesContainer) {
      return
    }

    // 清空消息容器
    messagesContainer.innerHTML = ''

    // 先创建欢迎消息（放在最前面）
    try {
      await this.createWelcomeMessage(messagesContainer, null, true)
      console.log('欢迎消息已创建')
    } catch (error) {
      console.warn('创建欢迎消息失败:', error)
    }

    // 加载并渲染历史消息
    if (session.messages && Array.isArray(session.messages) && session.messages.length > 0) {
      // 保持接口返回的消息顺序，不进行排序
      // 接口返回的消息顺序应该是正确的（在 sessionSyncService.js 中已按时间戳排序）
      // 如果接口返回的顺序不正确，应该在接口层面修复
      const messages = [...session.messages]

      console.log(`开始加载 ${messages.length} 条历史消息`)

      // 遍历消息并渲染
      for (let idx = 0; idx < messages.length; idx++) {
        const msg = messages[idx]

        // 规范化消息类型
        const messageType = msg.type === 'pet' ? 'pet' : 'user'
        const messageContent = msg.content || msg.message || ''
        const messageTimestamp = msg.timestamp || Date.now()
        const messageImage = msg.imageDataUrl || (Array.isArray(msg.imageDataUrls) && msg.imageDataUrls.length > 0 ? msg.imageDataUrls : null)
        const messageOptions = {
          error: !!msg.error,
          aborted: !!msg.aborted,
          // 如果需要支持流式状态，可以在这里添加判断逻辑
          streaming: false
        }

        // 跳过空消息
        if (!messageContent.trim() && !messageImage) {
          continue
        }

        try {
          // 创建消息元素
          const messageElement = this.createMessageElement(
            messageContent,
            messageType,
            messageImage,
            messageTimestamp,
            messageOptions
          )

          // 设置消息索引
          messageElement.setAttribute('data-chat-idx', idx.toString())

          // 添加到消息容器
          messagesContainer.appendChild(messageElement)

          // 添加操作按钮（延迟执行，确保 DOM 已渲染）
          setTimeout(() => {
            if (typeof this.addActionButtonsToMessage === 'function') {
              this.addActionButtonsToMessage(messageElement)
            }
          }, 0)
        } catch (error) {
          console.error(`渲染消息 ${idx} 时出错:`, error, msg)
        }
      }

      console.log(`已加载 ${messages.length} 条历史消息`)
    }

    // 滚动到底部
    setTimeout(() => {
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight
      }
    }, 100)

    // 统一处理所有消息中的 Mermaid 图表（确保在消息加载完成后处理）
    // 使用更长的延迟确保所有消息的 DOM 都已准备好，包括异步渲染的内容
    setTimeout(async () => {
      try {
        await this.loadMermaid()
        // 查找所有消息容器中的 mermaid 元素（包括未渲染的 div.mermaid）
        const allMermaidElements = messagesContainer.querySelectorAll('code.language-mermaid, code.language-mmd, pre code.language-mermaid, pre code.language-mmd, code[class*="mermaid"], div.mermaid:not([data-mermaid-rendered="true"])')
        if (allMermaidElements.length > 0) {
          console.log(`发现 ${allMermaidElements.length} 个 Mermaid 图表，开始批量渲染...`)
          await this.processMermaidBlocks(messagesContainer)
          console.log('Mermaid 图表批量渲染完成')
        }
      } catch (error) {
        console.error('批量处理 Mermaid 图表时出错:', error)
      }
    }, 500) // 延迟 500ms 确保所有消息的 DOM 和异步内容都已准备好
  }

  // 构建欢迎卡片 HTML（只显示有值的字段，参考 YiWeb 的条件渲染）
  proto.buildWelcomeCardHtml = function (pageInfo, session) {
    var WC = window.PetManager && window.PetManager.Components && window.PetManager.Components.WelcomeCard
    if (!WC) return '<div class="welcome-card"><div class="welcome-card-header"><div class="welcome-card-title">' + (pageInfo && pageInfo.title ? this.escapeHtml(pageInfo.title) : '\u5F53\u524D\u9875\u9762') + '</div></div></div>'

    if (!session && this.currentSessionId) session = this.sessions[this.currentSessionId]
    return WC.buildHtml({
      pageInfo: pageInfo,
      session: session,
      renderMarkdown: this.renderMarkdown.bind(this),
      formatDate: this.formatDate.bind(this)
    })
  }

  proto.buildWelcomeCardModel = function (pageInfo, session) {
    var WC = window.PetManager && window.PetManager.Components && window.PetManager.Components.WelcomeCard
    if (!WC) return { titleText: (pageInfo && pageInfo.title) || '\u5F53\u524D\u9875\u9762', iconUrl: '', url: '', descriptionText: '', descriptionHtml: '', tags: [], metaParts: [] }

    if (!session && this.currentSessionId) session = this.sessions[this.currentSessionId]
    return WC.buildModel({
      pageInfo: pageInfo,
      session: session,
      renderMarkdown: this.renderMarkdown.bind(this),
      formatDate: this.formatDate.bind(this)
    })
  }

  proto.escapeHtml = function (text) {
    if (!text) return ''
    var div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  proto.getCurrentTime = function () {
    const now = new Date()
    return this.formatTimestamp(now.getTime())
  }

  proto.formatTimestamp = function (timestamp) {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}年${month}月${day}日 ${hour}:${minute}`
  }

  proto.formatDate = function (date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return ''
    }
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}/${month}/${day}`
  }

  // 播放聊天动画
  proto.playChatAnimation = function () {
    if (!this.pet) return

    // 先清理之前的动画
    if (this.chatBubbleController) {
      this.chatBubbleController.stop()
      this.chatBubbleController = null
    }

    // 添加思考动画（更丰富的动画效果）
    this.pet.style.animation = 'none'
    setTimeout(() => {
      // 随机选择不同的动画效果
      const animations = (PET_CONFIG?.constants?.ANIMATION?.THINKING_ANIMATIONS) || [
        'petThinking 0.8s ease-in-out infinite',
        'petThinkingBounce 1.2s ease-in-out infinite',
        'petThinkingPulse 1s ease-in-out infinite'
      ]
      const selectedAnimation = animations[Math.floor(Math.random() * animations.length)]
      this.pet.style.animation = selectedAnimation
    }, 10)

    // 添加聊天气泡效果
    this.showChatBubble()
  }

  // 显示聊天气泡
  proto.showChatBubble = function () {
    if (!this.pet) return

    var ThinkingBubble = window.PetManager.Components.ThinkingBubble
    if (!ThinkingBubble) return

    this.chatBubbleController = ThinkingBubble.show({
      petElement: this.pet
    })
  }
})()
