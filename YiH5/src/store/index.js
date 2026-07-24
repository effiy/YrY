import { defineStore } from 'pinia'
import { fetchSessions, fetchSessionDetail, saveSession, deleteSession } from '../services/session.js'
import { fetchNews } from '../services/news.js'
import { fetchFaqs } from '../services/faq.js'

export const useAppStore = defineStore('app', {
  state: () => ({
    // Tab
    activeTab: 'sessions', // 'sessions' | 'news'

    // Session
    sessions: [],
    sessionsLoading: false,
    sessionsLoadedAt: 0,
    sessionsError: '',

    // News
    newsItems: [],
    newsLoading: false,
    newsLoadedAt: 0,
    newsError: '',
    newsIsoDate: '',

    // FAQ
    faqItems: [],
    faqLoading: false,
    faqError: '',

    // Filters
    sessionQuery: '',
    newsQuery: '',
    sessionFilter: { selectedTags: [], sortBy: 'time' },
    newsFilter: { selectedTags: [], sortBy: 'time' },
    selectedDate: '',

    // Chat
    activeSessionKey: '',
    activeNewsKey: '',
    chatSource: '', // 'session' | 'news'
    chatMessages: {},

    // Auth
    authToken: ''
  }),

  getters: {
    // Sessions 相关
    allSessionTags(state) {
      const set = new Set()
      state.sessions.forEach(s => {
        const tags = Array.isArray(s.tags) ? s.tags : []
        if (tags[0]) set.add(tags[0])
      })
      return [...set].sort()
    },

    filteredSessions(state) {
      let arr = [...state.sessions]
      const q = state.sessionQuery.trim().toLowerCase()
      const f = state.sessionFilter

      if (q) {
        arr = arr.filter(s => {
          const hay = `${s.title || ''} ${s.pageTitle || ''} ${s.preview || ''} ${s.url || ''} ${(s.tags || []).join(' ')}`.toLowerCase()
          return hay.includes(q)
        })
      }

      if (f.selectedTags.length > 0) {
        arr = arr.filter(s => {
          const tags = (Array.isArray(s.tags) ? s.tags : []).map(t => String(t).trim())
          return f.selectedTags.some(tag => tags.includes(tag))
        })
      }

      if (state.selectedDate && f.selectedTags.length === 0) {
        const d = new Date(state.selectedDate)
        arr = arr.filter(s => {
          const sd = new Date(s.lastActiveAt || s.updatedAt)
          return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth() && sd.getDate() === d.getDate()
        })
      }

      arr.sort((a, b) => {
        if (f.sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '')
        }
        const at = a.updatedAt || a.lastActiveAt || 0
        const bt = b.updatedAt || b.lastActiveAt || 0
        return bt - at
      })

      return arr
    },

    // News 相关
    allNewsTags(state) {
      const set = new Set()
      state.newsItems.forEach(n => {
        const tags = Array.isArray(n.tags) ? n.tags : []
        if (tags[0]) set.add(tags[0])
      })
      return [...set].sort()
    },

    filteredNews(state) {
      let arr = [...state.newsItems]
      const q = state.newsQuery.trim().toLowerCase()
      const f = state.newsFilter

      if (q) {
        arr = arr.filter(n => {
          const hay = `${n.title || ''} ${n.description || ''} ${n.link || ''} ${(n.tags || []).join(' ')}`.toLowerCase()
          return hay.includes(q)
        })
      }

      if (f.selectedTags.length > 0) {
        arr = arr.filter(n => {
          const tags = (Array.isArray(n.tags) ? n.tags : []).map(t => String(t).trim())
          return f.selectedTags.some(tag => tags.includes(tag))
        })
      }

      arr.sort((a, b) => {
        if (f.sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '')
        }
        return new Date(b.createdTime || b.published || 0).getTime() - new Date(a.createdTime || a.published || 0).getTime()
      })

      return arr
    }
  },

  actions: {
    setTab(tab) {
      this.activeTab = tab
    },

    // Sessions
    async loadSessions(force = false) {
      const now = Date.now()
      if (!force && this.sessionsLoadedAt && now - this.sessionsLoadedAt < 60000 && this.sessions.length > 0) return

      this.sessionsLoading = true
      this.sessionsError = ''
      try {
        const data = await fetchSessions(this.authToken)
        this.sessions = data.map(s => ({
          key: s.key || s._id || '',
          title: s.title || s.pageTitle || '未命名',
          preview: s.pageDescription || s.preview || '',
          url: s.url || '',
          pageTitle: s.pageTitle || '',
          pageDescription: s.pageDescription || '',
          pageContent: s.pageContent || '',
          tags: Array.isArray(s.tags) ? s.tags : [],
          messages: Array.isArray(s.messages) ? s.messages : [],
          messageCount: s.messageCount || 0,
          createdAt: s.createdAt || now,
          updatedAt: s.updatedAt || now,
          lastActiveAt: s.lastActiveAt || s.lastAccessTime || now,
          isFavorite: s.isFavorite || false
        }))
        this.sessionsLoadedAt = now
      } catch (e) {
        this.sessionsError = e.message || '获取会话失败'
        this.sessions = []
      } finally {
        this.sessionsLoading = false
      }
    },

    findSession(key) {
      return this.sessions.find(s => String(s.key) === String(key))
    },

    async loadSessionDetail(key) {
      try {
        const data = await fetchSessionDetail(key, this.authToken)
        if (data) {
          const idx = this.sessions.findIndex(s => String(s.key) === String(key))
          if (idx >= 0) {
            this.sessions[idx] = {
              ...this.sessions[idx],
              ...data,
              messages: Array.isArray(data.messages) ? data.messages : this.sessions[idx].messages
            }
          } else {
            this.sessions.push(data)
          }
        }
        return data
      } catch (e) {
        console.error('loadSessionDetail failed:', e)
        return null
      }
    },

    async saveSessionData(session) {
      await saveSession(session, this.authToken)
    },

    async deleteSessionData(key) {
      await deleteSession(key, this.authToken)
      this.sessions = this.sessions.filter(s => String(s.key) !== String(key))
    },

    // News
    async createNewsSession(item) {
      if (item.sessionKey) return item.sessionKey

      if (item.link) {
        const session = this.sessions.find(s => s.url === item.link)
        if (session) {
          item.sessionKey = session.key
          return session.key
        }
      }

      const newKey = `news_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      const newSession = {
        key: newKey,
        url: item.link || '',
        title: item.title || '新闻',
        pageTitle: item.title || '新闻',
        pageDescription: item.description || '',
        pageContent: item.description || '',
        tags: ['news'],
        messages: [],
        messageCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastActiveAt: Date.now()
      }
      this.sessions.push(newSession)
      item.sessionKey = newKey

      try { await saveSession(newSession, this.authToken) } catch {}
      return newKey
    },

    async loadNews(isoDate, force = false) {
      const now = Date.now()
      if (!force && this.newsIsoDate === isoDate && this.newsLoadedAt && now - this.newsLoadedAt < 60000) return

      this.newsLoading = true
      this.newsError = ''
      try {
        const result = await fetchNews(isoDate, this.authToken)
        const list = result?.data?.list || []
        this.newsItems = list.map(n => ({
          key: n.key || n._id || '',
          title: n.title || '未命名',
          link: n.link || '',
          description: n.description || '',
          sourceName: n.source_name || '',
          createdTime: n.createdTime || '',
          published: n.published || '',
          tags: Array.isArray(n.tags) ? n.tags : [],
          sessionKey: n.sessionKey || null,
          isRead: false,
          isFavorite: false
        }))
        this.newsIsoDate = isoDate
        this.newsLoadedAt = now
      } catch (e) {
        this.newsError = e.message || '获取新闻失败'
      } finally {
        this.newsLoading = false
      }
    },

    findNewsByKey(key) {
      return this.newsItems.find(n => String(n.key) === String(key))
    },

    // FAQ
    async loadFaqs(force = false) {
      if (this.faqLoading) return
      this.faqLoading = true
      this.faqError = ''
      try {
        const data = await fetchFaqs(this.authToken)
        const list = Array.isArray(data?.data?.list) ? data.data.list : Array.isArray(data) ? data : []
        this.faqItems = list.map(f => ({
          id: f._id || f.id || '',
          text: f.text || '',
          order: f.order || 0
        })).sort((a, b) => a.order - b.order)
      } catch (e) {
        this.faqError = e.message || '获取FAQ失败'
      } finally {
        this.faqLoading = false
      }
    },

    // Auth
    setAuthToken(token) {
      this.authToken = token || ''
      try {
        localStorage.setItem('YiH5.authToken.v1', this.authToken)
      } catch {}
    },

    loadAuthToken() {
      try {
        this.authToken = localStorage.getItem('YiH5.authToken.v1') || ''
      } catch {
        this.authToken = ''
      }
    },

    // Toggle tag filter
    toggleSessionTag(tag) {
      const idx = this.sessionFilter.selectedTags.indexOf(tag)
      if (idx >= 0) this.sessionFilter.selectedTags.splice(idx, 1)
      else this.sessionFilter.selectedTags.push(tag)
    },

    toggleNewsTag(tag) {
      const idx = this.newsFilter.selectedTags.indexOf(tag)
      if (idx >= 0) this.newsFilter.selectedTags.splice(idx, 1)
      else this.newsFilter.selectedTags.push(tag)
    },

    toggleSessionSort() {
      this.sessionFilter.sortBy = this.sessionFilter.sortBy === 'time' ? 'title' : 'time'
    },

    toggleNewsSort() {
      this.newsFilter.sortBy = this.newsFilter.sortBy === 'time' ? 'title' : 'time'
    }
  }
})
