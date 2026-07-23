/**
 * PetManager - Batch Toolbar (extracted from ui.js)
 */
;(function () {
  'use strict'
  if (typeof window === 'undefined' || typeof window.PetManager === 'undefined') return
  var proto = window.PetManager.prototype

  proto.updateBatchToolbar = function () {
    if (this.sessionSidebar && this.sessionSidebar.querySelector('[data-pet-batch-toolbar="vue"]')) {
      return
    }

    var count = this.selectedSessionIds.size

    // 通过组件 controller 更新已选数量和删除按钮状态
    if (this._batchToolbarController && typeof this._batchToolbarController.update === 'function') {
      this._batchToolbarController.update(count)
    } else {
      // 兜底：直接操作 DOM
      var selectedCountEl = document.getElementById('selected-count')
      var batchDeleteBtnEl = document.getElementById('batch-delete-btn')
      if (selectedCountEl) {
        if (count > 0) {
          selectedCountEl.textContent = '已选 ' + count + ' 项'
          selectedCountEl.classList.remove('js-hidden')
        } else {
          selectedCountEl.textContent = ''
          selectedCountEl.classList.add('js-hidden')
        }
      }
      if (batchDeleteBtnEl) {
        batchDeleteBtnEl.disabled = count === 0
      }
    }

    // 更新全选 checkbox 状态（参考 YiWeb 实现）
    var selectAllCheckbox = this._selectAllCheckbox || document.getElementById('select-all-checkbox')
    if (selectAllCheckbox) {
      var filteredSessions = this._getFilteredSessions()
      var allSelected =
        filteredSessions.length > 0 &&
        filteredSessions.every(function (session) { return session.key && this.selectedSessionIds.has(session.key) }, this)
      selectAllCheckbox.checked = allSelected
    }
  }

  // 切换全选/取消全选（参考 YiWeb 实现）
  proto.toggleSelectAll = function () {
    // 会话列表模式
    var filteredSessions = this._getFilteredSessions()
    var allSelected =
      filteredSessions.length > 0 &&
      filteredSessions.every(function (session) { return session.key && this.selectedSessionIds.has(session.key) }, this)

    if (allSelected) {
      // 取消全选：只取消当前显示的会话
      filteredSessions.forEach(function (session) {
        if (session.key) {
          this.selectedSessionIds.delete(session.key)
        }
      }, this)
    } else {
      // 全选：选中所有当前显示的会话
      filteredSessions.forEach(function (session) {
        if (session.key) {
          this.selectedSessionIds.add(session.key)
        }
      }, this)
    }

    var hasVueSessionList =
      !!this._sessionListVueApp && this._sessionListVueMount === this.sessionSidebar?.querySelector?.('.session-list')
    var hasVueBatchToolbar = !!this.sessionSidebar?.querySelector?.('[data-pet-batch-toolbar="vue"]')
    if (hasVueSessionList || hasVueBatchToolbar) {
      if (typeof this._bumpSidebarUiTick === 'function') {
        this._bumpSidebarUiTick()
      } else if (typeof this.updateSessionSidebar === 'function') {
        this.updateSessionSidebar()
      }
      return
    }

    // 更新所有复选框状态和选中类（使用 batch-selected 类，参考 YiWeb）
    var sessionItems = this.sessionSidebar.querySelectorAll('.session-item')
    sessionItems.forEach(function (item) {
      var sessionId = item.dataset.sessionId
      var checkbox = item.querySelector('.session-batch-checkbox')
      var isSelected = this.selectedSessionIds.has(sessionId)

      if (checkbox) {
        checkbox.checked = isSelected
      }

      // 使用 batch-selected 类标记批量选中的会话项
      if (isSelected) {
        item.classList.add('batch-selected')
      } else {
        item.classList.remove('batch-selected')
      }
    }, this)

    // 通过组件 controller 更新批量工具栏
    if (this._batchToolbarController && typeof this._batchToolbarController.update === 'function') {
      this._batchToolbarController.update(this.selectedSessionIds.size)
    } else {
      this.updateBatchToolbar()
    }
  }

  proto.buildBatchToolbar = function () {
    var self = this
    var BatchToolbar = window.PetManager && window.PetManager.Components && window.PetManager.Components.BatchToolbar
    if (!BatchToolbar || typeof BatchToolbar.create !== 'function') {
      // 兜底：返回 null，由调用方处理
      return null
    }

    this._batchToolbarController = BatchToolbar.create({
      onSelectAll: function () {
        self.toggleSelectAll()
      },
      onDelete: function () {
        self.batchDeleteSessions()
      },
      onCancel: function () {
        self.exitBatchMode()
      }
    })

    // 保存 checkbox 引用以便更新状态
    this._selectAllCheckbox = this._batchToolbarController.element.querySelector('#select-all-checkbox')

    return this._batchToolbarController.element
  }

  // 批量删除（支持会话、文件和请求接口）
  proto.batchDeleteSessions = async function () {
    // 批量删除会话
    if (this.selectedSessionIds.size === 0) {
      this.showNotification('请先选择要删除的会话', 'error')
      return
    }

    var count = this.selectedSessionIds.size
    var confirmMessage = '确定要删除选中的 ' + count + ' 个会话吗？此操作不可撤销。'
    if (!confirm(confirmMessage)) {
      return
    }

    var sessionIds = Array.from(this.selectedSessionIds)

    // 通过组件 controller 设置删除中状态
    if (this._batchToolbarController && typeof this._batchToolbarController.setDeleting === 'function') {
      this._batchToolbarController.setDeleting(true)
    }

    try {
      // 同时收集会话信息用于删除 aicr 项目文件
      var sessionsToDelete = []
      sessionIds.forEach(function (sessionId) {
        var session = this.sessions[sessionId]
        if (session) {
          sessionsToDelete.push({
            sessionId: sessionId,
            unifiedSessionId: session.key || sessionId
          })
        }
      }, this)

      // 从本地删除
      sessionIds.forEach(function (sessionId) {
        if (this.sessions[sessionId]) {
          delete this.sessions[sessionId]
        }
        // 如果删除的是当前会话，清空当前会话ID
        if (sessionId === this.currentSessionId) {
          this.currentSessionId = null
          this.hasAutoCreatedSessionForPage = false
        }
      }, this)

      // 保存本地更改
      if (this.sessionManager) {
        // 使用 SessionManager 批量删除
        for (var i = 0; i < sessionIds.length; i++) {
          await this.sessionManager.deleteSession(sessionIds[i])
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
      this.showNotification('已成功删除 ' + count + ' 个会话', 'success')
    } catch (error) {
      console.error('批量删除会话失败:', error)
      this.showNotification('批量删除会话失败: ' + error.message, 'error')
    } finally {
      // 通过组件 controller 恢复删除按钮状态
      if (this._batchToolbarController && typeof this._batchToolbarController.setDeleting === 'function') {
        this._batchToolbarController.setDeleting(false)
      }
    }
  }

})()
