import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '../../store/index.js'
import { showToast, showDialog } from 'vant'
import { useChat } from '../../composables/useChat.js'
import { defineView } from '../../utils/defineView.js'
import ChatMessage from '../../components/ChatMessage/index.js'
import FaqPopup from '../../components/FaqPopup/index.js'

export default defineView({
  name: 'ChatView',
  html: new URL('./index.html', import.meta.url).href,
  css: new URL('./index.css', import.meta.url).href,
  components: { ChatMessage, FaqPopup },
  setup() {
    const store = useAppStore()
    const route = useRoute()
    const router = useRouter()

    const showFaq = ref(false)
    const msgContainer = ref(null)
    const keyRef = ref('')
    const isSessionRef = ref(true)

    const { messages, inputText, sending, loadMessages, sendMessage, scrollToBottom } = useChat({
      keyRef,
      isSessionRef,
      store,
      scrollContainer: msgContainer
    })

    const isSession = computed(() => isSessionRef.value)

    const chatTitle = computed(() => {
      if (isSessionRef.value) {
        const s = store.findSession(keyRef.value)
        return s?.pageTitle || s?.title || '聊天'
      }
      const n = store.findNewsByKey(keyRef.value)
      return n?.title || '新闻对话'
    })

    const initChat = async () => {
      const key = route.query.key || ''
      const type = route.query.type || 'session'
      keyRef.value = key
      isSessionRef.value = type === 'session'

      if (isSessionRef.value && !store.findSession(key)) {
        await store.loadSessionDetail(key)
      }

      loadMessages()
      nextTick(() => scrollToBottom())
    }

    const insertFaq = (text) => {
      inputText.value = text
      showFaq.value = false
    }

    const goBack = () => router.back()

    const onDeleteSession = async () => {
      try {
        await showDialog({ title: '删除会话', message: '确定删除吗？删除后无法恢复。' })
        await store.deleteSessionData(keyRef.value)
        showToast('删除成功')
        router.back()
      } catch {}
    }

    onMounted(() => {
      store.loadAuthToken()
      store.loadSessions()
      store.loadFaqs()
      initChat()
    })

    return {
      store, messages, inputText, sending, showFaq,
      chatTitle, isSession, msgContainer,
      sendMessage, insertFaq, goBack, onDeleteSession
    }
  }
})
