/**
 * PetManager - Batch Toolbar (extracted from ui.js)
 */
;(function () {
  'use strict'
  if (typeof window === 'undefined' || typeof window.PetManager === 'undefined') return
  const proto = window.PetManager.prototype

  proto.updateBatchToolbar = function () {
    if (this.sessionSidebar && this.sessionSidebar.querySelector('[data-pet-batch-toolbar="vue"]')) {
      return
    }
    const selectedCount = document.getElementById('selected-count')
    const batchDeleteBtn = document.getElementById('batch-delete-btn')
    const selectAllCheckbox = this._selectAllCheckbox || document.getElementById('select-all-checkbox')

    const count = this.selectedSessionIds.size

    // 更新已选数量显示（参考 YiWeb 格式：已选 X 项）
    if (selectedCount) {
      if (count > 0) {
        selectedCount.textContent = `已选 ${count} 项`
        selectedCount.classList.remove('js-hidden')
      } else {
        selectedCount.textContent = ''
        selectedCount.classList.add('js-hidden')
      }
    }

    // 更新删除按钮状态
    if (batchDeleteBtn) {
      batchDeleteBtn.disabled = count === 0
    }

    // 更新全选 checkbox 状态（参考 YiWeb 实现）
    if (selectAllCheckbox) {
      const filteredSessions = this._getFilteredSessions()
      const allSelected =
        filteredSessions.length > 0 &&
        filteredSessions.every((session) => session.key && this.selectedSessionIds.has(session.key))
      selectAllCheckbox.checked = allSelected
    }
  }

  // 切换全选/取消全选（参考 YiWeb 实现）
  proto.toggleSelectAll = function () {
    // 会话列表模式
    const filteredSessions = this._getFilteredSessions()
    const allSelected =
      filteredSessions.length > 0 &&
      filteredSessions.every((session) => session.key && this.selectedSessionIds.has(session.key))

    if (allSelected) {
      // 取消全选：只取消当前显示的会话
      filteredSessions.forEach((session) => {
        if (session.key) {
          this.selectedSessionIds.delete(session.key)
        }
      })
    } else {
      // 全选：选中所有当前显示的会话
      filteredSessions.forEach((session) => {
        if (session.key) {
          this.selectedSessionIds.add(session.key)
        }
      })
    }

    const hasVueSessionList =
      !!this._sessionListVueApp && this._sessionListVueMount === this.sessionSidebar?.querySelector?.('.session-list')
    const hasVueBatchToolbar = !!this.sessionSidebar?.querySelector?.('[data-pet-batch-toolbar="vue"]')
    if (hasVueSessionList || hasVueBatchToolbar) {
      if (typeof this._bumpSidebarUiTick === 'function') {
        this._bumpSidebarUiTick()
      } else if (typeof this.updateSessionSidebar === 'function') {
        this.updateSessionSidebar()
      }
      return
    }

    // 更新所有复选框状态和选中类（使用 batch-selected 类，参考 YiWeb）
    const sessionItems = this.sessionSidebar.querySelectorAll('.session-item')
    sessionItems.forEach((item) => {
      const sessionId = item.dataset.sessionId
      const checkbox = item.querySelector('.session-batch-checkbox')
      const isSelected = this.selectedSessionIds.has(sessionId)

      if (checkbox) {
        checkbox.checked = isSelected
      }

      // 使用 batch-selected 类标记批量选中的会话项
      if (isSelected) {
        item.classList.add('batch-selected')
      } else {
        item.classList.remove('batch-selected')
      }
    })

    // 更新批量工具栏
    this.updateBatchToolbar()
  }

  proto.buildBatchToolbar = function () {
    // 参考 YiWeb 的 session-batch-toolbar 结构
    const toolbar = document.createElement('div')
    toolbar.id = 'batch-toolbar'
    toolbar.className = 'session-batch-toolbar'

    // Left section: 全选 checkbox + 已选数量
    const leftSection = document.createElement('div')
    leftSection.className = 'batch-toolbar-left'

    // 全选 checkbox (参考 YiWeb 的 batch-select-all)
    const selectAllLabel = document.createElement('label')
    selectAllLabel.className = 'batch-select-all'

    const selectAllCheckbox = document.createElement('input')
    selectAllCheckbox.type = 'checkbox'
    selectAllCheckbox.id = 'select-all-checkbox'
    selectAllCheckbox.addEventListener('change', () => {
      this.toggleSelectAll()
    })

    const selectAllText = document.createElement('span')
    selectAllText.textContent = '全选'

    selectAllLabel.appendChild(selectAllCheckbox)
    selectAllLabel.appendChild(selectAllText)
    leftSection.appendChild(selectAllLabel)

    // 已选数量
    const selectedCount = document.createElement('span')
    selectedCount.id = 'selected-count'
    selectedCount.className = 'batch-selected-count'
    selectedCount.classList.add('js-hidden')
    selectedCount.textContent = ''
    leftSection.appendChild(selectedCount)

    // Right section: 删除按钮 + 取消按钮
    const rightSection = document.createElement('div')
    rightSection.className = 'batch-toolbar-right'

    // 删除按钮
    const batchDeleteBtn = document.createElement('button')
    batchDeleteBtn.type = 'button'
    batchDeleteBtn.id = 'batch-delete-btn'
    batchDeleteBtn.className = 'batch-action-btn batch-delete-btn'
    batchDeleteBtn.disabled = true
    batchDeleteBtn.title = '删除选中会话'

    const deleteIcon = document.createElement('i')
    deleteIcon.className = 'fas fa-trash-alt'
    const deleteText = document.createTextNode(' 删除')
    batchDeleteBtn.appendChild(deleteIcon)
    batchDeleteBtn.appendChild(deleteText)

    batchDeleteBtn.addEventListener('click', async () => {
      if (batchDeleteBtn.disabled) return
      const originalContent = batchDeleteBtn.innerHTML
      batchDeleteBtn.disabled = true
      batchDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 删除中...'
      try {
        await this.batchDeleteSessions()
      } finally {
        batchDeleteBtn.disabled = false
        batchDeleteBtn.innerHTML = originalContent
      }
    })

    // 取消按钮
    const cancelBatchBtn = document.createElement('button')
    cancelBatchBtn.type = 'button'
    cancelBatchBtn.className = 'batch-action-btn batch-cancel-btn'
    cancelBatchBtn.textContent = '取消'
    cancelBatchBtn.title = '退出批量模式'
    cancelBatchBtn.addEventListener('click', () => {
      this.exitBatchMode()
    })

    rightSection.appendChild(batchDeleteBtn)
    rightSection.appendChild(cancelBatchBtn)

    toolbar.appendChild(leftSection)
    toolbar.appendChild(rightSection)

    // 保存 checkbox 引用以便更新状态
    this._selectAllCheckbox = selectAllCheckbox

    return toolbar
  }
  // 批量删除（支持会话、文件和请求接口）
  proto.batchDeleteSessions = async function () {
    // eslint-disable-next-line no-unused-vars -- sessionList queried for validation, used in full method
    const sessionList = this.sessionSidebar.querySelector('.session-list')
    // 批量删除会话
    if (this.selectedSessionIds.size === 0) {
      this.showNotification('请先选择要删除的会话', 'error')
      return
    }

    const count = this.selectedSessionIds.size
    const confirmMessage = `确定要删除选中的 ${count} 个会话吗？此操作不可撤销。`
    if (!confirm(confirmMessage)) {
      return
    }

    const sessionIds = Array.from(this.selectedSessionIds)

    try {
      // 同时收集会话信息用于删除 aicr 项目文件
      const sessionsToDelete = []
      sessionIds.forEach((sessionId) => {
        const session = this.sessions[sessionId]
        if (session) {
          sessionsToDelete.push({
            sessionId,
            unifiedSessionId: session.key || sessionId,
          })
        }
      })

      // 从本地删除
      sessionIds.forEach((sessionId) => {
        if (this.sessions[sessionId]) {
          delete this.sessions[sessionId]
        }
        // 如果删除的是当前会话，清空当前会话ID
        if (sessionId === this.currentSessionId) {
          this.currentSessionId = null
          this.hasAutoCreatedSessionForPage = false
        }
      })

      // 保存本地更改
      if (this.sessionManager) {
        // 使用 SessionManager 批量删除
        for (const sessionId of sessionIds) {
          await this.sessionManager.deleteSession(sessionId)
        }
      } else {
        // 保存到本地存储
        await this.saveAllSessions(true)
      }

      // 从后端删除（如果启用了后端同步）
      if (this.sessionApi && PET_CONFIG.api.syncSessionsToBackend) {
        try {
          await this.sessionApi.deleteSessions(sessionIds)
          console.log('批量删除会话已同步到后端:', sessionIds)
        } catch (error) {
          console.warn('从后端批量删除会话失败:', error)
          // 即使后端删除失败，也继续执行，因为本地已删除
        }
      }

      // 清空选中状态
      this.selectedSessionIds.clear()

      // 退出批量模式
      this.exitBatchMode()

      // 刷新会话列表
      await this.updateSessionSidebar(true)

      // 显示成功通知
      this.showNotification(`已成功删除 ${count} 个会话`, 'success')
    } catch (error) {
      console.error('批量删除会话失败:', error)
      this.showNotification(`批量删除会话失败: ${error.message}`, 'error')
    }
  }

})()
