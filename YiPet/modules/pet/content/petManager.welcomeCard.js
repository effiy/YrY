/**
 * PetManager - Welcome Card 共享逻辑
 * 从 petManager.chat.js 的 buildWelcomeCardHtml / buildWelcomeCardModel 提取重复部分
 */
;(function () {
  'use strict'
  if (typeof window === 'undefined' || typeof window.PetManager === 'undefined') return

  var proto = window.PetManager.prototype

  /**
   * 从会话对象中提取欢迎卡所需的公共元数据
   * 消除 buildWelcomeCardHtml 和 buildWelcomeCardModel 中的重复逻辑
   */
  proto._extractWelcomeCardMeta = function (session) {
    var sessionTags = (session && Array.isArray(session.tags) ? session.tags.filter(function (t) { return t && t.trim() }) : [])
    var sessionMessages = (session && Array.isArray(session.messages) ? session.messages : [])
    var sessionCreatedAt = (session && session.createdAt ? session.createdAt : null)
    var sessionUpdatedAt = (session && session.updatedAt ? session.updatedAt : null)
    var hasSessionUrl = !!(session && session.url && session.url.trim())

    // 用户消息和助手消息计数
    var userCount = sessionMessages.filter(function (m) {
      if (!m || typeof m !== 'object') return false
      var role = m.role || (m.type === 'user' ? 'user' : null)
      return role === 'user'
    }).length

    var assistantCount = sessionMessages.filter(function (m) {
      if (!m || typeof m !== 'object') return false
      var role = m.role || (m.type === 'pet' ? 'pet' : (m.type === 'assistant' ? 'assistant' : null))
      return role === 'assistant' || role === 'pet'
    }).length

    // 日期信息
    var createdDate = sessionCreatedAt ? new Date(sessionCreatedAt) : null
    var updatedDate = sessionUpdatedAt ? new Date(sessionUpdatedAt) : null
    var hasValidCreated = createdDate && !isNaN(createdDate.getTime())
    var hasValidUpdated = updatedDate && !isNaN(updatedDate.getTime())
    var isSameTime = hasValidCreated && hasValidUpdated &&
      Math.abs(createdDate.getTime() - updatedDate.getTime()) < 60000

    // 消息详情文本
    var detailParts = []
    if (userCount > 0) detailParts.push('\u7528\u6237 ' + userCount)
    if (assistantCount > 0) detailParts.push('\u52A9\u624B ' + assistantCount)
    var detailText = detailParts.length > 0 ? '\uFF08' + detailParts.join(' / ') + '\uFF09' : ''

    // 元数据项
    var metaParts = []
    if (sessionMessages.length > 0) {
      metaParts.push('\u6D88\u606F ' + sessionMessages.length + detailText)
    }
    if (hasValidCreated) {
      metaParts.push('\u521B\u5EFA ' + this.formatDate(createdDate))
    }
    if (hasValidUpdated && !isSameTime) {
      metaParts.push('\u66F4\u65B0 ' + this.formatDate(updatedDate))
    }

    return {
      tags: sessionTags,
      messages: sessionMessages,
      messagesCount: sessionMessages.length,
      userCount: userCount,
      assistantCount: assistantCount,
      detailText: detailText,
      metaParts: metaParts,
      hasSessionUrl: hasSessionUrl,
      createdDate: createdDate,
      updatedDate: updatedDate,
      hasValidCreated: hasValidCreated,
      hasValidUpdated: hasValidUpdated,
      isSameTime: isSameTime
    }
  }

  /**
   * 构建页脚元数据 HTML
   */
  proto._buildWelcomeCardFooterHtml = function (meta) {
    if (meta.metaParts.length === 0) return ''

    return [
      '<div class="welcome-card-footer">',
      '<div class="welcome-card-meta">',
      meta.metaParts.map(function (part) { return '<span>' + part + '</span>' }).join(''),
      '</div>',
      '</div>'
    ].join('')
  }

  // 绑定欢迎卡片的交互事件
  proto.bindWelcomeCardEvents = function (container) {
    if (!container) return

    // 复制功能
    const copyButtons = container.querySelectorAll('[data-copy-target], [data-copy-text]')
    copyButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault()
        e.stopPropagation()

        let textToCopy = ''

        // 从目标元素复制
        const copyTarget = btn.getAttribute('data-copy-target')
        if (copyTarget) {
          const targetElement = container.querySelector(`#${copyTarget}`)
          if (targetElement) {
            textToCopy = targetElement.textContent || targetElement.innerText || ''
          }
        }

        // 从属性复制
        if (!textToCopy) {
          const copyText = btn.getAttribute('data-copy-text')
          if (copyText) {
            textToCopy = copyText
          }
        }

        if (textToCopy) {
          try {
            await navigator.clipboard.writeText(textToCopy)
            // 显示成功反馈
            const icon = btn.querySelector('i')
            if (icon) {
              const originalClass = icon.className
              icon.className = 'fas fa-check'
              btn.classList.add('js-copy-success')
              setTimeout(() => {
                icon.className = originalClass
                btn.classList.remove('js-copy-success')
              }, 2000)
            }
          } catch (err) {
            console.error('复制失败:', err)
          }
        }
      })
    })

    // 展开/折叠功能
    const toggleButtons = container.querySelectorAll('.welcome-card-toggle-btn')
    toggleButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()

        const targetId = btn.getAttribute('data-toggle-target')
        const previewText = btn.getAttribute('data-preview-text')
        const fullText = btn.getAttribute('data-full-text')

        if (!targetId) return

        const targetElement = container.querySelector(`#${targetId}`)
        const icon = btn.querySelector('i')

        if (!targetElement) return

        const isExpanded = targetElement.classList.contains('expanded')

        if (isExpanded) {
          // 折叠
          targetElement.classList.remove('expanded')
          targetElement.innerHTML = this.renderMarkdown(previewText)
          if (typeof this.processTabs === 'function') this.processTabs(targetElement)
          if (icon) {
            icon.className = 'fas fa-chevron-down'
          }
        } else {
          // 展开
          targetElement.classList.add('expanded')
          targetElement.innerHTML = this.renderMarkdown(fullText)
          if (typeof this.processTabs === 'function') this.processTabs(targetElement)
          if (icon) {
            icon.className = 'fas fa-chevron-up'
          }
        }
      })
    })
  }

  // @param {Object} pageInfo - 页面信息对象（可选，如果不提供则使用当前页面信息）
  //   - title: 页面标题
  //   - url: 页面URL
  //   - description: 页面描述（可选）
  proto.createWelcomeMessage = async function (messagesContainer, pageInfo = null, skipAutoHandle = false) {
    // 获取当前会话信息
    const session = this.currentSessionId ? this.sessions[this.currentSessionId] : null

    // 调试日志（仅在开发环境或会话有消息时输出）
    if (!session || (session.messages && session.messages.length > 0)) {
      console.log('[createWelcomeMessage] 创建欢迎消息:', {
        currentSessionId: this.currentSessionId,
        hasSession: !!session,
        messagesCount: session && session.messages ? session.messages.length : 0
      })
    }

    // 检查是否是接口会话
    const isApiRequestSession = session && session._isApiRequestSession
    const apiRequestInfo = session && session._apiRequestInfo ? session._apiRequestInfo : null

    // 如果是接口会话，使用接口信息
    if (isApiRequestSession && apiRequestInfo) {
      return await this.createApiRequestWelcomeMessage(messagesContainer, apiRequestInfo)
    }

    // 如果没有提供页面信息，使用当前页面信息或会话信息
    if (!pageInfo) {
      // 优先使用当前会话的页面信息，如果没有则使用当前页面信息
      if (session) {
        // 如果会话没有 url 对象或者 url 对象为空，就不设置 url
        const sessionUrl = session.url && session.url.trim() ? session.url : null
        pageInfo = {
          title: session.title || document.title || '当前页面',
          url: sessionUrl || window.location.href,
          description: session.pageDescription || ''
        }
        // 如果会话没有有效的 url，将 url 设置为空字符串，这样 buildWelcomeCardHtml 就不会显示网址
        if (!sessionUrl) {
          pageInfo.url = ''
        }
      } else {
        // 使用 getPageInfo 方法获取当前页面信息
        const currentPageInfo = this.getPageInfo()
        pageInfo = {
          title: currentPageInfo.title,
          url: currentPageInfo.url,
          description: currentPageInfo.description || ''
        }
      }
    }

    // 获取页面图标
    const pageIconUrl = this.getPageIconUrl()
    pageInfo.iconUrl = pageIconUrl

    // 使用统一的构建方法生成欢迎卡片 HTML
    const pageInfoHtml = this.buildWelcomeCardHtml(pageInfo, session)

    // 创建欢迎消息元素
    const welcomeMessage = this.createMessageElement('', 'pet')
    welcomeMessage.setAttribute('data-welcome-message', 'true')
    // 将欢迎消息添加到容器最前面（如果容器已有内容，使用 insertBefore，否则使用 appendChild）
    if (messagesContainer.firstChild) {
      messagesContainer.insertBefore(welcomeMessage, messagesContainer.firstChild)
    } else {
      messagesContainer.appendChild(welcomeMessage)
    }

    const messageText = welcomeMessage.querySelector('[data-message-type="pet-bubble"]')
    if (messageText) {
      messageText.innerHTML = pageInfoHtml
      // 保存原始HTML用于后续保存（虽然欢迎消息不会被保存到消息数组中）
      messageText.setAttribute('data-original-text', pageInfoHtml)

      // 绑定交互事件
      this.bindWelcomeCardEvents(messageText)
    }

    // 自动处理会话保存和选中（仅在未跳过时执行）
    if (!skipAutoHandle) {
      await this.autoHandleSessionForUrl(pageInfo.url)
    }

    return welcomeMessage
  }

  // 刷新第一条欢迎消息（当会话信息更新时调用）
  proto.refreshWelcomeMessage = async function () {
    if (!this.chatWindow || !this.currentSessionId) {
      return
    }

    const chatWindowComponent = this.chatWindowComponent
    if (chatWindowComponent && typeof chatWindowComponent._messagesUpdateWelcome === 'function') {
      const session = this.sessions[this.currentSessionId]
      if (!session) return
      const pageInfo = {
        title: session.title || document.title || '当前页面',
        url: session.url || window.location.href,
        description: session.pageDescription || ''
      }
      pageInfo.iconUrl = this.getPageIconUrl()
      const pageInfoHtml = this.buildWelcomeCardHtml(pageInfo, session)
      chatWindowComponent._messagesUpdateWelcome(pageInfoHtml)
      if (typeof chatWindowComponent._messagesUpdateWelcomeModel === 'function') {
        const pageInfoModel = this.buildWelcomeCardModel(pageInfo, session)
        chatWindowComponent._messagesUpdateWelcomeModel(pageInfoModel)
      }
      await this.autoHandleSessionForUrl(pageInfo.url)
      return
    }

    const messagesContainer = this.chatWindow.querySelector('#yi-pet-chat-messages')
    if (!messagesContainer) {
      return
    }

    // 查找第一条欢迎消息
    const welcomeMessage = messagesContainer.querySelector('[data-welcome-message]')
    if (!welcomeMessage) {
      console.log('未找到欢迎消息，跳过刷新')
      return
    }

    // 获取当前会话的更新后的页面信息
    const session = this.sessions[this.currentSessionId]
    if (!session) {
      return
    }

    const pageInfo = {
      title: session.title || document.title || '当前页面',
      url: session.url || window.location.href,
      description: session.pageDescription || ''
    }

    // 获取页面图标
    const pageIconUrl = this.getPageIconUrl()
    pageInfo.iconUrl = pageIconUrl

    // 使用统一的构建方法生成欢迎卡片 HTML
    const pageInfoHtml = this.buildWelcomeCardHtml(pageInfo, session)

    // 更新欢迎消息的内容
    const messageText = welcomeMessage.querySelector('[data-message-type="pet-bubble"]')
    if (messageText) {
      messageText.innerHTML = pageInfoHtml
      // 更新原始HTML
      messageText.setAttribute('data-original-text', pageInfoHtml)

      // 绑定交互事件
      this.bindWelcomeCardEvents(messageText)
    }

    // 自动处理会话保存和选中
    await this.autoHandleSessionForUrl(pageInfo.url)

    console.log('欢迎消息已刷新')
  }
})()
