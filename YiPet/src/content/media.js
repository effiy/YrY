/**
 * PetManager - 媒体模块
 * 负责处理图片、文件等媒体消息的发送和预览
 */
;(function () {
  'use strict'

  // 确保 PetManager 类已定义
  if (typeof window === 'undefined' || typeof window.PetManager === 'undefined') {
    return
  }

  const proto = window.PetManager.prototype

  /**
   * 发送图片消息
   * @param {string} imageDataUrl - 图片数据的DataURL
   */
  proto.sendImageMessage = async function (imageDataUrl) {
    const messagesContainer = this.chatWindow.querySelector('#yi-pet-chat-messages')
    if (!messagesContainer) return

    // 确保有当前会话（如果没有，先初始化会话）
    if (!this.currentSessionId) {
      await this.initSession()
      // 更新聊天窗口标题
      this.updateChatHeaderTitle()
    }

    // 添加用户消息（带图片）
    const userMessage = this.createMessageElement('', 'user', imageDataUrl)
    messagesContainer.appendChild(userMessage)
    messagesContainer.scrollTop = messagesContainer.scrollHeight

    // 添加用户消息到会话（注意：已移除自动保存，仅在保存时同步）
    await this.addMessageToSession('user', '', null, false, imageDataUrl)

    // 为用户消息添加操作按钮（包括机器人按钮）
    await this.addActionButtonsToMessage(userMessage)

    // 为用户消息添加删除、编辑和重新发送按钮
    const userBubble = userMessage.querySelector('[data-message-type="user-bubble"]')
    const copyButtonContainer = userMessage.querySelector('[data-copy-button-container]')
    if (copyButtonContainer && userBubble) {
      // 按钮现在由 ChatWindow.addActionButtonsToMessage 统一管理
      // 不再需要单独调用 addDeleteButtonForUserMessage 和 addSortButtons
    }

    // 调用 session/save 保存会话到后端
    try {
      // 保存当前会话（同步DOM中的完整消息状态，确保数据一致性）
      await this.saveCurrentSession(false, false)

      // 调用 session/save 接口保存会话
      // 传入 processImages: true，表示需要处理图片上传
      if (this.currentSessionId && this.sessionApi && PET_CONFIG.api.syncSessionsToBackend) {
        await this.syncSessionToBackend(this.currentSessionId, true, false)
        console.log('图片消息会话已保存到后端:', this.currentSessionId)

        // 保存成功后，通过会话接口刷新该会话内容
        try {
          const refreshedSession = await this.sessionApi.getSession(this.currentSessionId, true)
          if (refreshedSession && this.sessions[this.currentSessionId]) {
            // 更新本地会话数据，保留本地的最新消息（可能包含未同步的数据）
            const localSession = this.sessions[this.currentSessionId]
            const refreshedTitle = refreshedSession.title || ''
            const merged = {
              ...refreshedSession,
              id: this.currentSessionId,
              // 如果本地消息更新，保留本地消息
              messages:
                localSession.messages?.length > refreshedSession.messages?.length
                  ? localSession.messages
                  : refreshedSession.messages,
              // 优先保留本地的 pageContent（如果本地有内容）
              pageContent:
                localSession.pageContent && localSession.pageContent.trim() !== ''
                  ? localSession.pageContent
                  : refreshedSession.pageContent || localSession.pageContent || '',
              title:
                localSession.title && localSession.title.trim() !== ''
                  ? localSession.title
                  : refreshedTitle || localSession.title || '',
            }
            this.sessions[this.currentSessionId] = merged
            console.log('会话内容已从后端刷新:', this.currentSessionId)
          }
        } catch (refreshError) {
          console.warn('刷新会话内容失败:', refreshError)
          // 刷新失败不影响主流程，只记录警告
        }
      } else {
        console.warn('无法保存会话：缺少会话ID、API管理器或同步配置')
      }
    } catch (error) {
      console.error('保存图片消息会话失败:', error)
      // 显示错误提示（可选）
      const errorMessage = this.createMessageElement('保存会话时发生错误，请稍后再试。😔', 'pet')
      messagesContainer.appendChild(errorMessage)
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }

    // 图片消息不再自动回复
  }

  /**
   * 显示图片预览
   * @param {string} imageUrl - 图片URL或DataURL
   * @param {string} fileName - 文件名（可选）
   */
  proto.showImagePreview = function (imageUrl, fileName = '') {
    window.PetManager.Components.ImagePreview.show({ imageUrl, fileName })
  }
})()
