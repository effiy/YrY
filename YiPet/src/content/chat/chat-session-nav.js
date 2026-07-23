/**
 * PetManager - Session URL navigation (extracted from chat.js)
 */
;(function () {
  'use strict'
  if (typeof window === 'undefined' || typeof window.PetManager === 'undefined') return
  const proto = window.PetManager.prototype

  /**
   * 自动处理会话：根据URL查找或创建会话，并自动选中和锚定位置
   * 这个方法确保在创建欢迎消息时，会话已正确初始化并选中
   * @param {string} url - 页面URL
   */
  proto.autoHandleSessionForUrl = async function (url) {
    if (!url) {
      console.warn('URL为空，跳过自动处理会话')
      return
    }

    try {
      // 如果当前会话的URL匹配，只需要滚动到位置
      if (this.currentSessionId && this.sessions[this.currentSessionId]) {
        const currentSession = this.sessions[this.currentSessionId]
        if (currentSession.url === url) {
          // 当前会话已匹配，只需滚动到位置
          if (typeof this.scrollToSessionItem === 'function') {
            await this.scrollToSessionItem(this.currentSessionId)
          }
          return
        }
      }

      // 如果当前会话不匹配，调用 initSession 重新初始化
      // initSession 会自动查找或创建匹配的会话，并选中和滚动
      await this.handleUrlBasedSession()
    } catch (error) {
      console.error('自动处理会话失败:', error)
    }
  }

  /**
   * 通过会话对象查找对应的 sessionId（辅助函数）
   * @param {Object} targetSession - 目标会话对象
   * @returns {string|null} 对应的 sessionId，如果未找到则返回 null
   */
  proto._findSessionIdBySession = function (targetSession) {
    if (!targetSession) return null

    // 遍历所有会话，找到匹配的会话对象
    for (const [sessionId, session] of Object.entries(this.sessions)) {
      // 通过对象引用或 key 字段匹配
      if (session === targetSession || (session.key && targetSession.key && session.key === targetSession.key)) {
        return sessionId
      }
    }
    return null
  }

  /**
   * 处理基于 URL 的会话：检查当前页面 URL 是否在会话列表中
   * 如果不在，则立即自动新建会话并保存后刷新会话列表
   * 如果存在，则自动选中该会话并锚定到对应会话的位置
   *
   * 重新设计：直接基于 URL 查找会话，不依赖 sessionId 进行查找
   */
  proto.handleUrlBasedSession = async function () {
    try {
      // 确保会话列表已加载（如果使用后端同步）
      if (this.sessionApi && this.sessionApi.isEnabled()) {
        if (!this.hasLoadedSessionsForChat) {
          console.log('会话列表未加载，先加载会话列表...')
          await this.loadSessionsFromBackend(true)
          this.hasLoadedSessionsForChat = true
        }
      }

      // 获取当前页面 URL
      const pageInfo = this.getPageInfo()
      const currentUrl = pageInfo.url

      if (!currentUrl) {
        console.warn('当前页面 URL 为空，跳过 URL 匹配检查')
        return
      }

      // 确保已加载所有会话
      if (typeof this.loadAllSessions === 'function') {
        await this.loadAllSessions()
      }

      // 确保 sessions 对象已初始化
      if (!this.sessions) {
        this.sessions = {}
      }

      // 首先查找是否存在URL匹配的会话（遍历所有会话）
      let matchedSessionKey = null
      for (const [key, session] of Object.entries(this.sessions)) {
        if (session && session.url === currentUrl) {
          matchedSessionKey = key
          break
        }
      }

      // 如果找到了匹配的会话，直接选中
      if (matchedSessionKey) {
        const existingSession = this.sessions[matchedSessionKey]
        if (existingSession) {
          // 更新会话页面信息
          if (typeof this.updateSessionPageInfo === 'function') {
            this.updateSessionPageInfo(matchedSessionKey, pageInfo)
          }

          // 自动选中匹配的会话
          if (typeof this.activateSession === 'function') {
            await this.activateSession(matchedSessionKey, {
              saveCurrent: false,
              updateConsistency: true,
              updateUI: true
            })
          }

          // 注意：滚动到会话项位置应该在侧边栏更新完成后进行
          // 这里不立即滚动，由 openChatWindow 在 updateSessionSidebar 后统一处理
          // 但如果侧边栏已经存在，也可以立即滚动
          if (this.sessionSidebar && typeof this.scrollToSessionItem === 'function') {
            // 等待侧边栏更新完成
            await new Promise(resolve => setTimeout(resolve, 100))
            await this.scrollToSessionItem(matchedSessionKey)
          }

          console.log('找到URL匹配的会话，已自动选中:', matchedSessionKey)
          return matchedSessionKey
        }
      } else {
        // 创建新会话：参考 YiWeb 的 handleSessionCreate，由后端生成 key
        try {
          // 创建会话数据对象（不包含 key，让后端生成）
          const sessionData = this.createSessionObject(pageInfo)

          // 获取当前时间戳
          const now = Date.now()

          // 构建要发送到后端的会话数据（不包含 key）
          // 优先使用当前页面 URL，如果没有则使用会话数据中的 URL
          const title = this._addMdSuffix(sessionData.title || '新会话')

          const sessionDataToSave = {
            // 不包含 key 字段，让后端生成
            url: currentUrl || sessionData.url || '',
            title,
            pageDescription: sessionData.pageDescription || '',
            pageContent: sessionData.pageContent || '',
            messages: sessionData.messages || [],
            tags: sessionData.tags || [],
            createdAt: sessionData.createdAt || now,
            updatedAt: now,
            lastAccessTime: now
          }

          // 如果启用了后端同步，调用后端 API 创建会话
          if (this.sessionApi && this.sessionApi.isEnabled()) {
            const createResult = await this.sessionApi.createSession(sessionDataToSave)

            if (createResult?.success && createResult?.key) {
              const sessionKey = createResult.key
              sessionDataToSave.key = sessionKey

              const newSession = {
                ...sessionDataToSave,
                key: sessionKey
              }

              const sessionId = sessionKey
              this.sessions[sessionId] = newSession

              // 调用 write-file 接口写入页面上下文
              if (typeof this.writeSessionPageContent === 'function') {
                await this.writeSessionPageContent(sessionId)
              }

              // 保存到本地存储
              if (typeof this.saveSession === 'function') {
                await this.saveSession(sessionId)
              }

              // 自动选中新创建的会话
              if (typeof this.activateSession === 'function') {
                await this.activateSession(sessionId, {
                  saveCurrent: false,
                  updateConsistency: true,
                  updateUI: true
                })
              }

              if (this.sessionSidebar && typeof this.scrollToSessionItem === 'function') {
                await new Promise(resolve => setTimeout(resolve, 100))
                await this.scrollToSessionItem(sessionId)
              }

              console.log('[handleUrlBasedSession] 已通过后端创建新会话，Key:', sessionKey, 'URL:', currentUrl)
              return sessionId
            } else {
              console.error('[handleUrlBasedSession] 创建会话失败，结果:', createResult)
              throw new Error('后端创建会话失败：未返回 key')
            }
          } else {
            // 如果未启用后端同步，使用本地方式创建（生成临时 key）
            console.warn('[handleUrlBasedSession] 后端同步未启用，使用本地方式创建会话')
            const tempKey = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            sessionDataToSave.key = tempKey

            const sessionId = tempKey
            this.sessions[sessionId] = sessionDataToSave

            // 保存到本地存储
            if (typeof this.saveSession === 'function') {
              await this.saveSession(sessionId)
            }

            // 自动选中新创建的会话
            if (typeof this.activateSession === 'function') {
              await this.activateSession(sessionId, {
                saveCurrent: false,
                updateConsistency: true,
                updateUI: true
              })
            }

            // 注意：滚动到会话项位置应该在侧边栏更新完成后进行
            // 这里不立即滚动，由 openChatWindow 在 updateSessionSidebar 后统一处理
            // 但如果侧边栏已经存在，也可以立即滚动
            if (this.sessionSidebar && typeof this.scrollToSessionItem === 'function') {
              // 等待侧边栏更新完成
              await new Promise(resolve => setTimeout(resolve, 100))
              await this.scrollToSessionItem(sessionId)
            }

            console.log('[handleUrlBasedSession] 已通过本地方式创建新会话，临时 Key:', tempKey, 'URL:', currentUrl)
            return sessionId
          }
        } catch (error) {
          console.error('[handleUrlBasedSession] 创建新会话失败:', error)
          // 不抛出错误，避免影响主流程
          return null
        }
      }
    } catch (error) {
      console.error('处理基于 URL 的会话失败:', error)
      return null
    }
  }

  /**
   * 滚动到指定的会话项位置（锚定）
   * @param {string} sessionId - 会话ID
   */
  proto.scrollToSessionItem = async function (sessionId) {
    if (!this.sessionSidebar || !sessionId) {
      return
    }

    // 等待DOM更新
    await new Promise(resolve => setTimeout(resolve, 200))

    // 查找会话项（只使用 key）
    // 首先尝试直接使用 sessionId 查找（如果 sessionId 就是 key）
    let sessionItem = this.sessionSidebar.querySelector(`[data-session-id="${sessionId}"]`)

    // 如果找不到，尝试从 sessions 中获取 key
    if (!sessionItem && this.sessions[sessionId]) {
      const session = this.sessions[sessionId]
      const sessionKey = session.key
      if (sessionKey && sessionKey !== sessionId) {
        sessionItem = this.sessionSidebar.querySelector(`[data-session-id="${sessionKey}"]`)
      }
    }

    if (!sessionItem) {
      console.warn('未找到会话项，尝试更新侧边栏后重试，sessionId:', sessionId)
      // 如果找不到，先更新侧边栏
      if (typeof this.updateSessionSidebar === 'function') {
        await this.updateSessionSidebar()
        // 再次等待DOM更新
        await new Promise(resolve => setTimeout(resolve, 300))

        // 再次尝试查找
        sessionItem = this.sessionSidebar.querySelector(`[data-session-id="${sessionId}"]`)
        if (!sessionItem && this.sessions[sessionId]) {
          const session = this.sessions[sessionId]
          const sessionKey = session.key
          if (sessionKey && sessionKey !== sessionId) {
            sessionItem = this.sessionSidebar.querySelector(`[data-session-id="${sessionKey}"]`)
          }
        }

        if (sessionItem) {
          this._scrollToElement(sessionItem)
        } else {
          console.warn('更新侧边栏后仍未找到会话项，sessionId:', sessionId)
        }
      }
      return
    }

    // 滚动到会话项
    this._scrollToElement(sessionItem)
  }

  /**
   * 滚动到指定元素（内部方法）
   * @param {HTMLElement} element - 要滚动到的元素
   */
  proto._scrollToElement = function (element) {
    if (!element) return

    // 查找可滚动的父容器
    const scrollableContainer = element.closest('.session-sidebar-scrollable-content')
    if (!scrollableContainer) return

    // 计算元素相对于容器的位置
    const containerRect = scrollableContainer.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()

    // 计算需要滚动的距离
    const scrollTop = scrollableContainer.scrollTop
    const elementTop = elementRect.top - containerRect.top + scrollTop
    const elementHeight = elementRect.height
    const containerHeight = containerRect.height

    // 计算目标滚动位置（让元素居中显示）
    const targetScrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2)

    // 平滑滚动
    scrollableContainer.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: 'smooth'
    })

    // 添加高亮效果
    element.classList.add('highlight-session')
    setTimeout(() => {
      element.classList.remove('highlight-session')
    }, 2000)
  }

})()
