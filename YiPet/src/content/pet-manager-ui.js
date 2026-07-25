;(function () {
  if (typeof window === 'undefined' || typeof window.PetManager === 'undefined') {
    return
  }
  const proto = window.PetManager.prototype

  proto.applyViewMode = function () {
    if (!this.sessionSidebar) return
    const btnSession = this.sessionSidebar.querySelector('#view-toggle-session')
    if (!btnSession) return
    this.sessionSidebar.dataset.petColorIndex = String(this.colorIndex ?? 0)
    btnSession.classList.add('pet-view-toggle-btn', 'pet-view-toggle-active')
  }
  proto.updateSessionSidebar = async function (_forceRefresh = false, _skipBackendRefresh = false) {
    if (!this.sessionSidebar) {
      return
    }
    const apiRequestList = this.sessionSidebar.querySelector('.api-request-list')
    if (apiRequestList) {
      apiRequestList.classList.add('js-hidden')
    }
    const apiRequestTagFilterContainer = this.sessionSidebar.querySelector('.api-request-tag-filter-container')
    if (apiRequestTagFilterContainer) {
      apiRequestTagFilterContainer.classList.add('js-hidden')
    }
    const tagFilterContainer = this.sessionSidebar.querySelector('.tag-filter-container')
    const batchToolbar = this.sessionSidebar.querySelector('#batch-toolbar')
    const scrollableContent = this.sessionSidebar.querySelector('.session-sidebar-scrollable-content')
    if (tagFilterContainer) {
      tagFilterContainer.classList.add('js-visible')
    }
    if (batchToolbar) {
      if (this.batchMode) {
        batchToolbar.classList.add('visible', 'js-visible')
        if (this.sessionSidebar) this.sessionSidebar.classList.add('batch-mode-active')
      } else {
        batchToolbar.classList.remove('visible', 'js-visible')
        if (this.sessionSidebar) this.sessionSidebar.classList.remove('batch-mode-active')
      }
    }
    if (scrollableContent) {
      scrollableContent.classList.add('js-visible')
    }
    const searchInput = this.sessionSidebar.querySelector('#session-search-input')
    if (searchInput) {
      searchInput.placeholder = '搜索会话...'
    }
    if (this.tagFilterNoTags === undefined) {
      this.tagFilterNoTags = false
    }
    if (tagFilterContainer && typeof tagFilterContainer._render === 'function') {
      tagFilterContainer._render()
    }
    if (typeof this.applyViewMode === 'function') {
      this.applyViewMode()
    }
    const sessionList = this.sessionSidebar.querySelector('.session-list')
    if (!sessionList) {
      console.log('会话列表容器未找到，跳过更新')
      return
    }
    sessionList.classList.add('js-visible')
    const prevScrollTop = sessionList.scrollTop
    const allSessions = this._getFilteredSessions()
    console.log('当前会话数量:', allSessions.length)
    const sortedSessions = allSessions.sort((a, b) => {
      const aTags = Array.isArray(a.tags) ? a.tags.map((t) => String(t).trim()) : []
      const bTags = Array.isArray(b.tags) ? b.tags.map((t) => String(t).trim()) : []
      const aHasNoTags = aTags.length === 0 || !aTags.some((t) => t)
      const bHasNoTags = bTags.length === 0 || !bTags.some((t) => t)
      const aFavorite = a.isFavorite || false
      const bFavorite = b.isFavorite || false
      if (aFavorite !== bFavorite) {
        return bFavorite ? 1 : -1
      }
      if (aHasNoTags !== bHasNoTags) {
        return aHasNoTags ? -1 : 1
      }
      const aTime = a.lastAccessTime || a.lastActiveAt || a.updatedAt || a.createdAt || 0
      const bTime = b.lastAccessTime || b.lastActiveAt || b.updatedAt || b.createdAt || 0
      if (aTime !== bTime) {
        return bTime - aTime
      }
      const aTitle = String(a.title || a.id || '').trim()
      const bTitle = String(b.title || b.id || '').trim()
      return aTitle.localeCompare(bTitle)
    })

    const Vue = window.Vue
    const canRenderWithVue =
      Vue &&
      typeof Vue.createApp === 'function' &&
      typeof Vue.defineComponent === 'function' &&
      typeof Vue.h === 'function' &&
      typeof Vue.ref === 'function' &&
      typeof Vue.nextTick === 'function'

    const evalAllowed = (() => {
      try {
        Function('return 1')()
        return true
      } catch (_) {
        return false
      }
    })()
    const canUseTemplate = typeof Vue?.compile === 'function' && evalAllowed

    const SessionItemCtor =
      window.PetManager && window.PetManager.Components ? window.PetManager.Components.SessionItem : null
    const SessionItemFactory =
      SessionItemCtor && typeof SessionItemCtor.createComponent === 'function' ? SessionItemCtor.createComponent : null
    const SessionListCtor =
      window.PetManager && window.PetManager.Components ? window.PetManager.Components.SessionList : null
    const SessionListFactory =
      SessionListCtor && typeof SessionListCtor.createComponent === 'function' ? SessionListCtor.createComponent : null

    if (canRenderWithVue && canUseTemplate && SessionItemFactory && SessionListFactory) {
      if (!this._sessionListVueState || this._sessionListVueMount !== sessionList) {
        if (this._sessionListVueApp) {
          try {
            this._sessionListVueApp.unmount()
          } catch (_) {}
        }
        this._sessionListVueApp = null
        this._sessionListVueMount = sessionList

        const { createApp, defineComponent, h, ref } = Vue
        const sessionsRef = ref([])
        const uiTick =
          this._sidebarUiTickRef &&
          typeof this._sidebarUiTickRef === 'object' &&
          this._sidebarUiTickRef &&
          'value' in this._sidebarUiTickRef
            ? this._sidebarUiTickRef
            : ref(0)
        this._sidebarUiTickRef = uiTick
        const bumpUiTick = () => {
          uiTick.value += 1
        }
        this._bumpSidebarUiTick = bumpUiTick
        let sessionItemTemplate = ''
        try {
          if (SessionItemCtor && typeof SessionItemCtor.loadTemplate === 'function') {
            sessionItemTemplate = await SessionItemCtor.loadTemplate()
          }
        } catch (_) {
          sessionItemTemplate = ''
        }
        const SessionItem = SessionItemFactory({ manager: this, bumpUiTick, template: sessionItemTemplate })

        let sessionListTemplate = ''
        try {
          if (SessionListCtor && typeof SessionListCtor.loadTemplate === 'function') {
            sessionListTemplate = await SessionListCtor.loadTemplate()
          }
        } catch (_) {
          sessionListTemplate = ''
        }
        const SessionList = SessionListFactory({ SessionItem, template: sessionListTemplate })

        const SessionListRoot = defineComponent({
          name: 'YiPetSessionListRoot',
          setup() {
            return { sessionsRef, uiTick }
          },
          render() {
            const sessions = Array.isArray(sessionsRef.value) ? sessionsRef.value : []
            return h(SessionList, { sessions, uiTick: uiTick.value })
          },
        })

        sessionList.innerHTML = ''
        this._sessionListVueState = { sessionsRef, uiTick, bumpUiTick }
        this._sessionListVueApp = createApp(SessionListRoot)
        this._sessionListVueApp.mount(sessionList)
      }

      this._sessionListVueState.sessionsRef.value = sortedSessions
      this._sessionListVueState.uiTick.value += 1
      Vue.nextTick(() => {
        sessionList.scrollTop = prevScrollTop
      })
      console.log('会话侧边栏已更新，显示', sortedSessions.length, '个会话')
      return
    }

    sessionList.innerHTML = ''
    const listItems = document.createElement('div')
    listItems.className = 'session-list-items'
    let sessionItemTemplate = ''
    try {
      if (SessionItemCtor && typeof SessionItemCtor.loadTemplate === 'function') {
        sessionItemTemplate = await SessionItemCtor.loadTemplate()
      }
    } catch (_) {
      sessionItemTemplate = ''
    }
    for (const session of sortedSessions) {
      if (window.PetManager && window.PetManager.Components && window.PetManager.Components.SessionItem) {
        const sessionItem = new window.PetManager.Components.SessionItem(this, session, {
          template: sessionItemTemplate,
        })
        listItems.appendChild(sessionItem.element || sessionItem.create())
      }
    }
    sessionList.appendChild(listItems)
    sessionList.scrollTop = prevScrollTop
    console.log('会话侧边栏已更新，显示', sortedSessions.length, '个会话')
  }

  proto.updateSessionUI = async function (options = {}) {
    // eslint-disable-next-line no-unused-vars -- keepApiRequestListView reserved for future use
    const { updateSidebar = false, updateTitle = false, loadMessages = false, keepApiRequestListView = false } = options

    if (updateSidebar && typeof this.updateSessionSidebar === 'function') {
      await this.updateSessionSidebar(false, false)
    }

    if (updateTitle && typeof this.updateChatHeaderTitle === 'function') {
      this.updateChatHeaderTitle()
    }

    if (loadMessages && typeof this.loadSessionMessages === 'function') {
      await this.loadSessionMessages()
    }
  }

  proto.loadSidebarWidth = function () {
    try {
      if (typeof chrome === 'undefined' || !chrome?.storage?.local || typeof chrome.storage.local.get !== 'function') {
        return
      }
      chrome.storage.local.get(['sessionSidebarWidth'], (result) => {
        if (result.sessionSidebarWidth && typeof result.sessionSidebarWidth === 'number') {
          const width = Math.max(320, Math.min(800, result.sessionSidebarWidth))
          this.sidebarWidth = width
          if (this.sessionSidebar) {
            this.sessionSidebar.style.setProperty('width', `${width}px`, 'important')
          }
        }
      })
    } catch (error) {}
  }
  proto.saveSidebarWidth = function () {
    try {
      if (typeof chrome === 'undefined' || !chrome?.storage?.local || typeof chrome.storage.local.set !== 'function') {
        return
      }
      chrome.storage.local.set({ sessionSidebarWidth: this.sidebarWidth }, () => {})
    } catch (error) {}
  }
  proto.loadSidebarCollapsed = function () {
    try {
      if (typeof chrome === 'undefined' || !chrome?.storage?.local || typeof chrome.storage.local.get !== 'function') {
        this.sidebarCollapsed = false
        if (this.chatWindowComponent) {
          this.applySidebarCollapsedState()
        }
        return
      }
      chrome.storage.local.get(['sessionSidebarCollapsed'], (result) => {
        if (result.sessionSidebarCollapsed !== undefined) {
          this.sidebarCollapsed = result.sessionSidebarCollapsed
        } else {
          // 如果存储中没有状态，默认显示侧边栏
          this.sidebarCollapsed = false
        }
        // 应用状态
        if (this.chatWindowComponent) {
          this.applySidebarCollapsedState()
        }
      })
    } catch (error) {
      // 出错时默认显示侧边栏
      this.sidebarCollapsed = false
      if (this.chatWindowComponent) {
        this.applySidebarCollapsedState()
      }
    }
  }
  proto.saveSidebarCollapsed = function () {
    try {
      if (typeof chrome === 'undefined' || !chrome?.storage?.local || typeof chrome.storage.local.set !== 'function') {
        return
      }
      chrome.storage.local.set({ sessionSidebarCollapsed: this.sidebarCollapsed }, () => {})
    } catch (error) {}
  }
  proto.applySidebarCollapsedState = function () {
    if (this.chatWindowComponent && typeof this.chatWindowComponent.setSidebarCollapsed === 'function') {
      this.chatWindowComponent.setSidebarCollapsed(this.sidebarCollapsed)
    }
  }

  // 强制显示侧边栏（用于恢复显示）
  proto.showSidebar = function () {
    this.sidebarCollapsed = false
    this.applySidebarCollapsedState()
    this.saveSidebarCollapsed()
  }
  proto.toggleSidebar = function () {
    if (this.chatWindowComponent && typeof this.chatWindowComponent.toggleSidebar === 'function') {
      this.chatWindowComponent.toggleSidebar()
    }
  }
  proto.loadInputContainerCollapsed = function () {
    try {
      if (typeof chrome === 'undefined' || !chrome?.storage?.local || typeof chrome.storage.local.get !== 'function') {
        return
      }
      chrome.storage.local.get(['chatInputContainerCollapsed'], (result) => {
        if (result.chatInputContainerCollapsed !== undefined) {
          this.inputContainerCollapsed = result.chatInputContainerCollapsed
          if (this.chatWindowComponent) {
            this.applyInputContainerCollapsedState()
          }
        }
      })
    } catch (error) {}
  }
  proto.saveInputContainerCollapsed = function () {
    try {
      if (typeof chrome === 'undefined' || !chrome?.storage?.local || typeof chrome.storage.local.set !== 'function') {
        return
      }
      chrome.storage.local.set({ chatInputContainerCollapsed: this.inputContainerCollapsed }, () => {})
    } catch (error) {}
  }
  proto.applyInputContainerCollapsedState = function () {
    if (this.chatWindowComponent && typeof this.chatWindowComponent.setInputContainerCollapsed === 'function') {
      this.chatWindowComponent.setInputContainerCollapsed(this.inputContainerCollapsed)
    }
  }
  proto.toggleInputContainer = function () {
    if (this.chatWindowComponent && typeof this.chatWindowComponent.toggleInputContainer === 'function') {
      this.chatWindowComponent.toggleInputContainer()
    }
  }
})()
